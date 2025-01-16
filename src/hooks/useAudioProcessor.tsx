import { useState, useEffect } from 'react';

interface AudioNodes {
  lowFilter: BiquadFilterNode | null;
  lowMidFilter: BiquadFilterNode | null;
  highMidFilter: BiquadFilterNode | null;
  highFilter: BiquadFilterNode | null;
  compressor: DynamicsCompressorNode | null;
}

export const useAudioProcessor = (nodes: AudioNodes) => {
  const [eqParams, setEqParams] = useState({
    low: 0,
    lowMid: 0,
    highMid: 0,
    high: 0
  });

  const [compParams, setCompParams] = useState({
    threshold: -20,
    ratio: 4,
    attack: 50,
    release: 200
  });

  useEffect(() => {
    if (!nodes.lowFilter) return;

    nodes.lowFilter.gain.value = eqParams.low;
    nodes.lowMidFilter!.gain.value = eqParams.lowMid;
    nodes.highMidFilter!.gain.value = eqParams.highMid;
    nodes.highFilter!.gain.value = eqParams.high;
  }, [eqParams, nodes]);

  useEffect(() => {
    if (!nodes.compressor) return;

    nodes.compressor.threshold.value = compParams.threshold;
    nodes.compressor.ratio.value = compParams.ratio;
    nodes.compressor.attack.value = compParams.attack / 1000;
    nodes.compressor.release.value = compParams.release / 1000;
  }, [compParams, nodes]);

  const handleEQChange = (band: keyof typeof eqParams, value: number) => {
    setEqParams(prev => ({ ...prev, [band]: value }));
  };

  const handleCompChange = (param: keyof typeof compParams, value: number) => {
    setCompParams(prev => ({ ...prev, [param]: value }));
  };

  return {
    eqParams,
    compParams,
    handleEQChange,
    handleCompChange,
  };
};