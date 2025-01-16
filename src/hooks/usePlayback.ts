import { useRef } from 'react';

export const usePlayback = (audioContext: AudioContext | null) => {
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);

  const loadAudioFile = async (file: File): Promise<number> => {
    if (!audioContext) {
      console.error('Cannot load audio file: Audio context is null');
      throw new Error('Audio context not initialized');
    }

    try {
      console.log('Reading file as array buffer...');
      const arrayBuffer = await file.arrayBuffer();
      
      console.log('Decoding audio data...');
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBuffer.current = buffer;
      console.log('Audio file loaded successfully');
      return buffer.duration;
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw new Error('Failed to load audio file');
    }
  };

  const playAudio = async (startTime: number = 0, isLooping: boolean = false, inputNode: AudioNode) => {
    if (!audioBuffer.current || !audioContext) {
      console.error('Cannot play audio: Audio buffer or context is null');
      return;
    }
    
    try {
      console.log('Checking audio context state...');
      if (audioContext.state === 'suspended') {
        console.log('Resuming audio context...');
        await audioContext.resume();
      }
      
      console.log('Stopping any existing audio source...');
      if (audioSource.current) {
        audioSource.current.stop();
        audioSource.current.disconnect();
      }
      
      console.log('Creating new audio source...');
      audioSource.current = audioContext.createBufferSource();
      audioSource.current.buffer = audioBuffer.current;
      audioSource.current.loop = isLooping;
      
      // Ensure proper connection to the audio graph
      console.log('Connecting audio source to input node...');
      audioSource.current.connect(inputNode);
      
      // Start playback
      audioSource.current.start(0, startTime);
      console.log('Audio playback started successfully');
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error('Failed to play audio');
    }
  };

  const stopAudio = () => {
    try {
      if (audioSource.current) {
        console.log('Stopping audio playback...');
        audioSource.current.stop();
        audioSource.current.disconnect();
        audioSource.current = null;
        console.log('Audio playback stopped successfully');
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