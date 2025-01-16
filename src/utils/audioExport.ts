export const createWavFile = (audioBuffer: AudioBuffer): Blob => {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * numOfChan * 2, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write audio data
  const offset = 44;
  const channelData = new Float32Array(audioBuffer.length * numOfChan);
  let channelIdx = 0;

  // Interleave channel data
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      channelData[channelIdx++] = audioBuffer.getChannelData(channel)[i];
    }
  }

  // Convert to 16-bit PCM
  const volume = 0.9;
  const pcmData = new Int16Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    pcmData[i] = s < 0 ? s * 0x8000 * volume : s * 0x7FFF * volume;
  }

  // Copy PCM data to WAV buffer
  const pcmBytes = new Uint8Array(pcmData.buffer);
  for (let i = 0; i < pcmBytes.length; i++) {
    view.setUint8(offset + i, pcmBytes[i]);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};