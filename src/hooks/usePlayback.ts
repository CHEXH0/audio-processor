import { useRef } from 'react';

export const usePlayback = (audioContext: AudioContext | null) => {
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);

  const loadAudioFile = async (file: File): Promise<number> => {
    if (!audioContext) throw new Error('Audio context not initialized');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBuffer.current = buffer;
      return buffer.duration;
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw new Error('Failed to load audio file');
    }
  };

  const playAudio = async (startTime: number = 0, isLooping: boolean = false, inputNode: AudioNode) => {
    if (!audioBuffer.current || !audioContext) return;
    
    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      if (audioSource.current) {
        audioSource.current.stop();
        audioSource.current.disconnect();
      }
      
      audioSource.current = audioContext.createBufferSource();
      audioSource.current.buffer = audioBuffer.current;
      audioSource.current.loop = isLooping;
      
      audioSource.current.connect(inputNode);
      audioSource.current.start(0, startTime);
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error('Failed to play audio');
    }
  };

  const stopAudio = () => {
    try {
      if (audioSource.current) {
        audioSource.current.stop();
        audioSource.current.disconnect();
        audioSource.current = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  return {
    loadAudioFile,
    playAudio,
    stopAudio
  };
};