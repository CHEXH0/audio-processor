import { useRef, useEffect, useState } from 'react';

interface AudioNodes {
  lowFilter: BiquadFilterNode | null;
  lowMidFilter: BiquadFilterNode | null;
  highMidFilter: BiquadFilterNode | null;
  highFilter: BiquadFilterNode | null;
  compressor: DynamicsCompressorNode | null;
}

export const useAudioContext = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const [nodes, setNodes] = useState<AudioNodes>({
    lowFilter: null,
    lowMidFilter: null,
    highMidFilter: null,
    highFilter: null,
    compressor: null,
  });

  useEffect(() => {
    audioContext.current = new AudioContext();
    
    // Create filters
    const lowFilter = audioContext.current.createBiquadFilter();
    lowFilter.type = 'lowshelf';
    lowFilter.frequency.value = 320;

    const lowMidFilter = audioContext.current.createBiquadFilter();
    lowMidFilter.type = 'peaking';
    lowMidFilter.frequency.value = 1000;
    lowMidFilter.Q.value = 1;

    const highMidFilter = audioContext.current.createBiquadFilter();
    highMidFilter.type = 'peaking';
    highMidFilter.frequency.value = 3200;
    highMidFilter.Q.value = 1;

    const highFilter = audioContext.current.createBiquadFilter();
    highFilter.type = 'highshelf';
    highFilter.frequency.value = 10000;

    // Create compressor
    const compressor = audioContext.current.createDynamicsCompressor();

    // Connect nodes
    lowFilter
      .connect(lowMidFilter)
      .connect(highMidFilter)
      .connect(highFilter)
      .connect(compressor)
      .connect(audioContext.current.destination);

    setNodes({
      lowFilter,
      lowMidFilter,
      highMidFilter,
      highFilter,
      compressor,
    });

    return () => {
      audioContext.current?.close();
    };
  }, []);

  return {
    audioContext,
    audioSource,
    audioBuffer,
    nodes,
  };
};