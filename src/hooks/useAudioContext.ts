import { useRef, useEffect } from 'react';

export const useAudioContext = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const analyzerNode = useRef<AnalyserNode | null>(null);

  const initializeContext = async () => {
    console.log('Initializing audio context...');
    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext({
          sampleRate: 48000,
          latencyHint: 'interactive'
        });
      }

      // Ensure context is running
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      if (!analyzerNode.current && audioContext.current) {
        analyzerNode.current = audioContext.current.createAnalyser();
        analyzerNode.current.fftSize = 2048;
        analyzerNode.current.smoothingTimeConstant = 0.8;
      }

      console.log('Audio context initialized successfully');
      return {
        context: audioContext.current,
        analyzer: analyzerNode.current
      };
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Failed to initialize audio context');
    }
  };

  useEffect(() => {
    // Initialize context on mount
    initializeContext().catch(console.error);

    return () => {
      if (audioContext.current && audioContext.current.state !== 'closed') {
        console.log('Closing audio context...');
        audioContext.current.close().catch(console.error);
      }
    };
  }, []);

  return {
    initializeContext,
    getContext: () => audioContext.current,
    getAnalyzer: () => analyzerNode.current
  };
};