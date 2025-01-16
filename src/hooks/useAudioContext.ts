import { useRef, useEffect } from 'react';

export const useAudioContext = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const analyzerNode = useRef<AnalyserNode | null>(null);

  const initializeContext = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      
      analyzerNode.current = audioContext.current.createAnalyser();
      analyzerNode.current.fftSize = 2048;
      analyzerNode.current.smoothingTimeConstant = 0.8;
    }
    return {
      context: audioContext.current,
      analyzer: analyzerNode.current
    };
  };

  useEffect(() => {
    return () => {
      audioContext.current?.close();
    };
  }, []);

  return {
    initializeContext,
    getContext: () => audioContext.current,
    getAnalyzer: () => analyzerNode.current
  };
};