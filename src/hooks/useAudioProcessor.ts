import { useRef, useEffect } from 'react';

interface AudioProcessorConfig {
  eqParams: {
    low: number;
    lowMid: number;
    highMid: number;
    high: number;
  };
  compParams: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  eqBypassed: boolean;
  compBypassed: boolean;
}

export const useAudioProcessor = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const analyzerNode = useRef<AnalyserNode | null>(null);
  
  // Audio processing nodes
  const lowFilter = useRef<BiquadFilterNode | null>(null);
  const lowMidFilter = useRef<BiquadFilterNode | null>(null);
  const highMidFilter = useRef<BiquadFilterNode | null>(null);
  const highFilter = useRef<BiquadFilterNode | null>(null);
  const compressor = useRef<DynamicsCompressorNode | null>(null);
  const eqInputGain = useRef<GainNode | null>(null);
  const eqOutputGain = useRef<GainNode | null>(null);
  const compInputGain = useRef<GainNode | null>(null);
  const compOutputGain = useRef<GainNode | null>(null);

  useEffect(() => {
    audioContext.current = new AudioContext();
    
    // Create analyzer
    analyzerNode.current = audioContext.current.createAnalyser();
    analyzerNode.current.fftSize = 2048;

    // Create gain nodes for bypass
    eqInputGain.current = audioContext.current.createGain();
    eqOutputGain.current = audioContext.current.createGain();
    compInputGain.current = audioContext.current.createGain();
    compOutputGain.current = audioContext.current.createGain();
    
    // Create filters
    lowFilter.current = audioContext.current.createBiquadFilter();
    lowFilter.current.type = 'lowshelf';
    lowFilter.current.frequency.value = 320;

    lowMidFilter.current = audioContext.current.createBiquadFilter();
    lowMidFilter.current.type = 'peaking';
    lowMidFilter.current.frequency.value = 1000;
    lowMidFilter.current.Q.value = 1;

    highMidFilter.current = audioContext.current.createBiquadFilter();
    highMidFilter.current.type = 'peaking';
    highMidFilter.current.frequency.value = 3200;
    highMidFilter.current.Q.value = 1;

    highFilter.current = audioContext.current.createBiquadFilter();
    highFilter.current.type = 'highshelf';
    highFilter.current.frequency.value = 10000;

    // Create compressor
    compressor.current = audioContext.current.createDynamicsCompressor();

    // Connect nodes with bypass options
    eqInputGain.current
      .connect(lowFilter.current!)
      .connect(lowMidFilter.current!)
      .connect(highMidFilter.current!)
      .connect(highFilter.current!)
      .connect(eqOutputGain.current!);

    eqInputGain.current.connect(eqOutputGain.current!);  // Bypass path

    eqOutputGain.current!
      .connect(compInputGain.current!);

    compInputGain.current!
      .connect(compressor.current!)
      .connect(compOutputGain.current!);

    compInputGain.current!.connect(compOutputGain.current!);  // Bypass path

    compOutputGain.current!
      .connect(analyzerNode.current!)
      .connect(audioContext.current.destination);

    return () => {
      audioContext.current?.close();
    };
  }, []);

  const updateProcessingConfig = (config: AudioProcessorConfig) => {
    if (!eqInputGain.current || !eqOutputGain.current || !compressor.current) return;
    
    // Update EQ parameters
    if (lowFilter.current && lowMidFilter.current && highMidFilter.current && highFilter.current) {
      eqInputGain.current.gain.value = config.eqBypassed ? 1 : 0;
      lowFilter.current.gain.value = config.eqBypassed ? 0 : config.eqParams.low;
      lowMidFilter.current.gain.value = config.eqBypassed ? 0 : config.eqParams.lowMid;
      highMidFilter.current.gain.value = config.eqBypassed ? 0 : config.eqParams.highMid;
      highFilter.current.gain.value = config.eqBypassed ? 0 : config.eqParams.high;
    }

    // Update compressor parameters
    compInputGain.current.gain.value = config.compBypassed ? 1 : 0;
    if (!config.compBypassed) {
      compressor.current.threshold.value = config.compParams.threshold;
      compressor.current.ratio.value = config.compParams.ratio;
      compressor.current.attack.value = config.compParams.attack / 1000;
      compressor.current.release.value = config.compParams.release / 1000;
    }
  };

  const loadAudioFile = async (file: File): Promise<number> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = await audioContext.current!.decodeAudioData(arrayBuffer);
    audioBuffer.current = buffer;
    return buffer.duration;
  };

  const playAudio = (startTime: number = 0, isLooping: boolean = false) => {
    if (!audioBuffer.current || !audioContext.current) return;
    
    audioSource.current = audioContext.current.createBufferSource();
    audioSource.current.buffer = audioBuffer.current;
    audioSource.current.loop = isLooping;
    audioSource.current.connect(eqInputGain.current!);
    audioSource.current.start(0, startTime);
  };

  const stopAudio = () => {
    audioSource.current?.stop();
  };

  return {
    loadAudioFile,
    playAudio,
    stopAudio,
    updateProcessingConfig,
    analyzerNode: analyzerNode.current,
  };
};