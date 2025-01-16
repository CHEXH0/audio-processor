import { useAudioContext } from './useAudioContext';
import { useEqualizer } from './useEqualizer';
import { useCompressor } from './useCompressor';
import { usePlayback } from './usePlayback';

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
  const { initializeContext, getContext, getAnalyzer } = useAudioContext();
  const { setupEqualizer, updateEQParams } = useEqualizer(getContext());
  const { setupCompressor, updateCompParams } = useCompressor(getContext());
  const { loadAudioFile, playAudio, stopAudio } = usePlayback(getContext());

  const updateProcessingConfig = (config: AudioProcessorConfig) => {
    const context = getContext();
    if (!context) return;

    updateEQParams(config.eqParams, config.eqBypassed);
    updateCompParams(config.compParams, config.compBypassed);
  };

  const handleLoadAudioFile = async (file: File): Promise<number> => {
    const { context, analyzer } = initializeContext();
    if (!context || !analyzer) throw new Error('Failed to initialize audio context');

    const eq = setupEqualizer();
    const comp = setupCompressor();
    
    if (!eq || !comp) throw new Error('Failed to setup audio processing');

    // Connect the full processing chain
    eq.output.connect(comp.input);
    comp.output.connect(analyzer);
    analyzer.connect(context.destination);

    return await loadAudioFile(file);
  };

  const handlePlayAudio = async (startTime: number = 0, isLooping: boolean = false) => {
    const eq = setupEqualizer();
    if (!eq) throw new Error('Failed to setup audio processing');
    
    await playAudio(startTime, isLooping, eq.input);
  };

  return {
    loadAudioFile: handleLoadAudioFile,
    playAudio: handlePlayAudio,
    stopAudio,
    updateProcessingConfig,
    analyzerNode: getAnalyzer(),
  };
};