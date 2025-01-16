import { useRef, useEffect } from 'react';

export const useAudioContext = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const analyzerNode = useRef<AnalyserNode | null>(null);

  const initializeContext = () => {
    console.log('Initializing audio context...');
    if (!audioContext.current) {
      try {
        audioContext.current = new AudioContext({
          sampleRate: 48000,
          latencyHint: 'interactive'
        });
        
        analyzerNode.current = audioContext.current.createAnalyser();
        analyzerNode.current.fftSize = 2048;
        analyzerNode.current.smoothingTimeConstant = 0.8;
        
        console.log('Audio context initialized successfully');
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        throw error;
      }
    } else if (audioContext.current.state === 'suspended') {
      audioContext.current.resume().catch(error => {
        console.error('Failed to resume audio context:', error);
        throw error;
      });
    }

    if (!analyzerNode.current) {
      console.error('Analyzer node not initialized properly');
      throw new Error('Failed to initialize analyzer node');
    }

    return {
      context: audioContext.current,
      analyzer: analyzerNode.current
    };
  };

  useEffect(() => {
    return () => {
      if (audioContext.current && audioContext.current.state !== 'closed') {
        console.log('Closing audio context...');
        audioContext.current.close().catch(console.error);
      }
    };
  }, []);

  return {
    initializeContext,
    getContext: () => {
      if (!audioContext.current) {
        console.warn('Audio context not initialized');
      }
      return audioContext.current;
    },
    getAnalyzer: () => {
      if (!analyzerNode.current) {
        console.warn('Analyzer node not initialized');
      }
      return analyzerNode.current;
    }
  };
};