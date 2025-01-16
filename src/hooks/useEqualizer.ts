import { useRef, useEffect } from 'react';

interface EQConfig {
  low: number;
  lowMid: number;
  highMid: number;
  high: number;
}

export const useEqualizer = (audioContext: AudioContext | null) => {
  const eqInputGain = useRef<GainNode | null>(null);
  const eqOutputGain = useRef<GainNode | null>(null);
  const lowFilter = useRef<BiquadFilterNode | null>(null);
  const lowMidFilter = useRef<BiquadFilterNode | null>(null);
  const highMidFilter = useRef<BiquadFilterNode | null>(null);
  const highFilter = useRef<BiquadFilterNode | null>(null);

  const setupEqualizer = () => {
    if (!audioContext) return null;

    eqInputGain.current = audioContext.createGain();
    eqOutputGain.current = audioContext.createGain();
    
    lowFilter.current = audioContext.createBiquadFilter();
    lowFilter.current.type = 'lowshelf';
    lowFilter.current.frequency.value = 320;
    lowFilter.current.Q.value = 0.71;

    lowMidFilter.current = audioContext.createBiquadFilter();
    lowMidFilter.current.type = 'peaking';
    lowMidFilter.current.frequency.value = 1000;
    lowMidFilter.current.Q.value = 1.4;

    highMidFilter.current = audioContext.createBiquadFilter();
    highMidFilter.current.type = 'peaking';
    highMidFilter.current.frequency.value = 3200;
    highMidFilter.current.Q.value = 1.4;

    highFilter.current = audioContext.createBiquadFilter();
    highFilter.current.type = 'highshelf';
    highFilter.current.frequency.value = 10000;
    highFilter.current.Q.value = 0.71;

    // Connect EQ chain
    eqInputGain.current
      .connect(lowFilter.current)
      .connect(lowMidFilter.current)
      .connect(highMidFilter.current)
      .connect(highFilter.current)
      .connect(eqOutputGain.current);

    return {
      input: eqInputGain.current,
      output: eqOutputGain.current
    };
  };

  const updateEQParams = (params: EQConfig, bypassed: boolean) => {
    if (!audioContext) return;

    const currentTime = audioContext.currentTime;
    const transitionTime = 0.05;

    if (lowFilter.current && lowMidFilter.current && highMidFilter.current && highFilter.current) {
      lowFilter.current.gain.setTargetAtTime(
        bypassed ? 0 : params.low,
        currentTime,
        transitionTime
      );
      
      lowMidFilter.current.gain.setTargetAtTime(
        bypassed ? 0 : params.lowMid,
        currentTime,
        transitionTime
      );
      
      highMidFilter.current.gain.setTargetAtTime(
        bypassed ? 0 : params.highMid,
        currentTime,
        transitionTime
      );
      
      highFilter.current.gain.setTargetAtTime(
        bypassed ? 0 : params.high,
        currentTime,
        transitionTime
      );
    }
  };

  return {
    setupEqualizer,
    updateEQParams
  };
};