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

  const [eqBypassed, setEqBypassed] = useState(false);
  const [compBypassed, setCompBypassed] = useState(false);

  useEffect(() => {
    if (!nodes.lowFilter) return;

    const gainValue = eqBypassed ? 0 : eqParams.low;
    nodes.lowFilter.gain.value = gainValue;
    nodes.lowMidFilter!.gain.value = eqBypassed ? 0 : eqParams.lowMid;
    nodes.highMidFilter!.gain.value = eqBypassed ? 0 : eqParams.highMid;
    nodes.highFilter!.gain.value = eqBypassed ? 0 : eqParams.high;
  }, [eqParams, nodes, eqBypassed]);

  useEffect(() => {
    if (!nodes.compressor) return;

    if (compBypassed) {
      nodes.compressor.threshold.value = 0;
      nodes.compressor.ratio.value = 1;
      nodes.compressor.attack.value = 0;
      nodes.compressor.release.value = 0;
    } else {
      nodes.compressor.threshold.value = compParams.threshold;
      nodes.compressor.ratio.value = compParams.ratio;
      nodes.compressor.attack.value = compParams.attack / 1000;
      nodes.compressor.release.value = compParams.release / 1000;
    }
  }, [compParams, nodes, compBypassed]);

  const handleEQChange = (band: keyof typeof eqParams, value: number) => {
    setEqParams(prev => ({ ...prev, [band]: value }));
  };

  const handleCompChange = (param: keyof typeof compParams, value: number) => {
    setCompParams(prev => ({ ...prev, [param]: value }));
  };

  return {
    eqParams,
    compParams,
    eqBypassed,
    compBypassed,
    handleEQChange,
    handleCompChange,
    setEqBypassed,
    setCompBypassed,
  };
};