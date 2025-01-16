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

  const initializeAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });
      
      analyzerNode.current = audioContext.current.createAnalyser();
      analyzerNode.current.fftSize = 2048;
      analyzerNode.current.smoothingTimeConstant = 0.8;

      eqInputGain.current = audioContext.current.createGain();
      eqOutputGain.current = audioContext.current.createGain();
      compInputGain.current = audioContext.current.createGain();
      compOutputGain.current = audioContext.current.createGain();
      
      lowFilter.current = audioContext.current.createBiquadFilter();
      lowFilter.current.type = 'lowshelf';
      lowFilter.current.frequency.value = 320;
      lowFilter.current.Q.value = 0.71;

      lowMidFilter.current = audioContext.current.createBiquadFilter();
      lowMidFilter.current.type = 'peaking';
      lowMidFilter.current.frequency.value = 1000;
      lowMidFilter.current.Q.value = 1.4;

      highMidFilter.current = audioContext.current.createBiquadFilter();
      highMidFilter.current.type = 'peaking';
      highMidFilter.current.frequency.value = 3200;
      highMidFilter.current.Q.value = 1.4;

      highFilter.current = audioContext.current.createBiquadFilter();
      highFilter.current.type = 'highshelf';
      highFilter.current.frequency.value = 10000;
      highFilter.current.Q.value = 0.71;

      compressor.current = audioContext.current.createDynamicsCompressor();
      compressor.current.knee.value = 12;
      compressor.current.ratio.value = 4;
      compressor.current.attack.value = 0.05;
      compressor.current.release.value = 0.2;

      // Connect nodes with proper gain staging
      eqInputGain.current
        .connect(lowFilter.current!)
        .connect(lowMidFilter.current!)
        .connect(highMidFilter.current!)
        .connect(highFilter.current!)
        .connect(eqOutputGain.current!);

      eqOutputGain.current!
        .connect(compInputGain.current!);

      compInputGain.current!
        .connect(compressor.current!)
        .connect(compOutputGain.current!);

      compOutputGain.current!
        .connect(analyzerNode.current!)
        .connect(audioContext.current.destination);
    }
  };

  useEffect(() => {
    return () => {
      if (audioSource.current) {
        audioSource.current.stop();
        audioSource.current.disconnect();
      }
      audioContext.current?.close();
    };
  }, []);

  const updateProcessingConfig = (config: AudioProcessorConfig) => {
    if (!audioContext.current || !eqInputGain.current || !eqOutputGain.current || !compressor.current) return;
    
    const currentTime = audioContext.current.currentTime;
    const transitionTime = 0.05; // 50ms transition time for smooth parameter changes
    
    // Update EQ parameters with smooth transitions
    if (lowFilter.current && lowMidFilter.current && highMidFilter.current && highFilter.current) {
      // Smoothly transition filter gains using setTargetAtTime
      lowFilter.current.gain.setTargetAtTime(
        config.eqBypassed ? 0 : config.eqParams.low,
        currentTime,
        transitionTime
      );
      
      lowMidFilter.current.gain.setTargetAtTime(
        config.eqBypassed ? 0 : config.eqParams.lowMid,
        currentTime,
        transitionTime
      );
      
      highMidFilter.current.gain.setTargetAtTime(
        config.eqBypassed ? 0 : config.eqParams.highMid,
        currentTime,
        transitionTime
      );
      
      highFilter.current.gain.setTargetAtTime(
        config.eqBypassed ? 0 : config.eqParams.high,
        currentTime,
        transitionTime
      );
    }

    // Update compressor parameters with smooth transitions
    if (compressor.current && !config.compBypassed) {
      compressor.current.threshold.setTargetAtTime(
        config.compParams.threshold,
        currentTime,
        transitionTime
      );
      
      compressor.current.ratio.setTargetAtTime(
        config.compParams.ratio,
        currentTime,
        transitionTime
      );
      
      compressor.current.attack.setTargetAtTime(
        config.compParams.attack / 1000,
        currentTime,
        transitionTime
      );
      
      compressor.current.release.setTargetAtTime(
        config.compParams.release / 1000,
        currentTime,
        transitionTime
      );
    }

    // Smoothly transition bypass states
    eqInputGain.current.gain.setTargetAtTime(
      config.eqBypassed ? 1 : 0,
      currentTime,
      transitionTime
    );
    
    compInputGain.current!.gain.setTargetAtTime(
      config.compBypassed ? 1 : 0,
      currentTime,
      transitionTime
    );
  };

  const loadAudioFile = async (file: File): Promise<number> => {
    try {
      initializeAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.current!.decodeAudioData(arrayBuffer);
      audioBuffer.current = buffer;
      return buffer.duration;
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw new Error('Failed to load audio file');
    }
  };

  const playAudio = async (startTime: number = 0, isLooping: boolean = false) => {
    if (!audioBuffer.current || !audioContext.current) return;
    
    try {
      // Resume audio context if it's suspended
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }
      
      // Clean up previous source if it exists
      if (audioSource.current) {
        audioSource.current.stop();
        audioSource.current.disconnect();
      }
      
      // Create and configure new source
      audioSource.current = audioContext.current.createBufferSource();
      audioSource.current.buffer = audioBuffer.current;
      audioSource.current.loop = isLooping;
      
      // Connect to processing chain with proper gain staging
      audioSource.current.connect(eqInputGain.current!);
      audioSource.current.start(0, startTime);
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error('Failed to play audio');
    }
  };

  const stopAudio = () => {
    try {
      if (audioSource.current) {
        audioSource.current.stop();
        audioSource.current.disconnect();
        audioSource.current = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  return {
    loadAudioFile,
    playAudio,
    stopAudio,
    updateProcessingConfig,
    analyzerNode: analyzerNode.current,
  };
};
