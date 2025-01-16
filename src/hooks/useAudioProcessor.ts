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
    if (!context) {
      console.warn('Audio context not initialized, skipping processing update');
      return;
    }

    try {
      updateEQParams(config.eqParams, config.eqBypassed);
      updateCompParams(config.compParams, config.compBypassed);
    } catch (error) {
      console.error('Error updating processing config:', error);
    }
  };

  const handleLoadAudioFile = async (file: File): Promise<number> => {
    console.log('Initializing audio context...');
    const { context, analyzer } = initializeContext();
    
    if (!context) {
      console.error('Failed to initialize audio context');
      throw new Error('Failed to initialize audio context');
    }

    if (!analyzer) {
      console.error('Failed to initialize analyzer');
      throw new Error('Failed to initialize analyzer');
    }

    // Ensure context is in running state
    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
        throw new Error('Failed to resume audio context');
      }
    }

    console.log('Setting up equalizer...');
    const eq = setupEqualizer();
    if (!eq) {
      console.error('Failed to setup equalizer nodes');
      throw new Error('Failed to setup equalizer');
    }

    console.log('Setting up compressor...');
    const comp = setupCompressor();
    if (!comp) {
      console.error('Failed to setup compressor nodes');
      throw new Error('Failed to setup compressor');
    }

    try {
      console.log('Connecting audio processing chain...');
      // Connect the full processing chain
      eq.output.connect(comp.input);
      comp.output.connect(analyzer);
      analyzer.connect(context.destination);
      
      console.log('Loading audio file...');
      const duration = await loadAudioFile(file);
      console.log('Audio file loaded successfully, duration:', duration);
      return duration;
    } catch (error) {
      console.error('Error in audio processing chain:', error);
      throw new Error('Failed to setup audio processing chain');
    }
  };

  const handlePlayAudio = async (startTime: number = 0, isLooping: boolean = false) => {
    const context = getContext();
    if (!context) {
      throw new Error('Audio context not initialized');
    }

    console.log('Setting up audio playback...');
    const eq = setupEqualizer();
    if (!eq) {
      console.error('Failed to setup equalizer for playback');
      throw new Error('Failed to setup audio processing');
    }
    
    try {
      console.log('Starting audio playback...');
      await playAudio(startTime, isLooping, eq.input);
      console.log('Audio playback started successfully');
    } catch (error) {
      console.error('Error starting audio playback:', error);
      throw error;
    }
  };

  return {
    loadAudioFile: handleLoadAudioFile,
    playAudio: handlePlayAudio,
    stopAudio,
    updateProcessingConfig,
    analyzerNode: getAnalyzer(),
  };
};