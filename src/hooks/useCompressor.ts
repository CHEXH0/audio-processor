import { useRef } from 'react';

interface CompConfig {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
}

export const useCompressor = (audioContext: AudioContext | null) => {
  const compInputGain = useRef<GainNode | null>(null);
  const compOutputGain = useRef<GainNode | null>(null);
  const compressor = useRef<DynamicsCompressorNode | null>(null);

  const setupCompressor = () => {
    if (!audioContext) return null;

    compInputGain.current = audioContext.createGain();
    compOutputGain.current = audioContext.createGain();
    
    compressor.current = audioContext.createDynamicsCompressor();
    compressor.current.knee.value = 12;
    compressor.current.ratio.value = 4;
    compressor.current.attack.value = 0.05;
    compressor.current.release.value = 0.2;

    // Connect compressor chain
    compInputGain.current
      .connect(compressor.current)
      .connect(compOutputGain.current);

    return {
      input: compInputGain.current,
      output: compOutputGain.current
    };
  };

  const updateCompParams = (params: CompConfig, bypassed: boolean) => {
    if (!audioContext || !compressor.current) return;

    const currentTime = audioContext.currentTime;
    const transitionTime = 0.05;

    compressor.current.threshold.setTargetAtTime(
      params.threshold,
      currentTime,
      transitionTime
    );
    
    compressor.current.ratio.setTargetAtTime(
      params.ratio,
      currentTime,
      transitionTime
    );
    
    compressor.current.attack.setTargetAtTime(
      params.attack / 1000,
      currentTime,
      transitionTime
    );
    
    compressor.current.release.setTargetAtTime(
      params.release / 1000,
      currentTime,
      transitionTime
    );

    if (compInputGain.current) {
      compInputGain.current.gain.setTargetAtTime(
        bypassed ? 1 : 0,
        currentTime,
        transitionTime
      );
    }
  };

  return {
    setupCompressor,
    updateCompParams
  };
};