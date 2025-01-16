import React, { useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import EQVisualizer from './EQVisualizer';
import TransportControls from './audio/TransportControls';
import FileControls from './audio/FileControls';
import CompressorControls from './audio/CompressorControls';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';
import { useAudioState } from '@/hooks/useAudioState';

const VST = () => {
  const { toast } = useToast();
  const playbackTimer = useRef<number | null>(null);
  const {
    playbackState: {
      isPlaying,
      setIsPlaying,
      isLooping,
      setIsLooping,
      currentTime,
      setCurrentTime,
      duration,
      setDuration,
      audioFile,
      setAudioFile
    },
    processingState: {
      eqParams,
      setEqParams,
      compParams,
      setCompParams,
      eqBypassed,
      setEqBypassed,
      compBypassed,
      setCompBypassed
    }
  } = useAudioState();

  const {
    loadAudioFile,
    playAudio,
    stopAudio,
    updateProcessingConfig,
    analyzerNode
  } = useAudioProcessor();

  // Update processing parameters when they change
  useEffect(() => {
    updateProcessingConfig({
      eqParams,
      compParams,
      eqBypassed,
      compBypassed
    });
  }, [eqParams, compParams, eqBypassed, compBypassed]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const duration = await loadAudioFile(file);
      setDuration(duration);
      setCurrentTime(0);
      setAudioFile(file);
      toast({
        title: "Audio loaded",
        description: `Loaded: ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audio file",
        variant: "destructive",
      });
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      playAudio(currentTime, isLooping);
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (isPlaying) {
      stopAudio();
      playAudio(time, isLooping);
    }
  };

  const handleRewind = () => {
    if (isPlaying) {
      stopAudio();
    }
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleExport = async (format: 'wav' | 'mp3') => {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "No audio file loaded",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('settings', JSON.stringify({
        eq: eqParams,
        comp: compParams
      }));

      const { data, error } = await supabase.functions.invoke('process-audio', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Audio processed and saved successfully",
      });

      const { data: fileData } = await supabase.storage
        .from('audio_files')
        .download(data.file.path);

      if (fileData) {
        const url = URL.createObjectURL(fileData);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${audioFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to process audio",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8">
      <Card className="glass-panel p-8">
        <h1 className="text-2xl font-semibold mb-8">Audio Processor</h1>
        
        {/* Transport Controls */}
        <div className="mb-8">
          <TransportControls
            isPlaying={isPlaying}
            isLooping={isLooping}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onLoopToggle={() => setIsLooping(!isLooping)}
            onSeek={handleSeek}
            onRewind={handleRewind}
          />
        </div>

        {/* File Controls */}
        <div className="mb-8">
          <FileControls
            onFileChange={handleFileChange}
            onExport={handleExport}
            hasAudioFile={!!audioFile}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EQ Section */}
          <div className="space-y-6">
            <EQVisualizer
              parameters={eqParams}
              disabled={eqBypassed}
              onParameterChange={(param, value) => 
                setEqParams(prev => ({ ...prev, [param]: value }))}
              bypassed={eqBypassed}
              onBypassChange={setEqBypassed}
            />
          </div>

          {/* Compressor Section */}
          <CompressorControls
            parameters={compParams}
            onParameterChange={(param, value) => 
              setCompParams(prev => ({ ...prev, [param]: value }))}
            isPlaying={isPlaying}
            bypassed={compBypassed}
            onBypassChange={setCompBypassed}
            analyzerNode={analyzerNode}
          />
        </div>
      </Card>
    </div>
  );
};

export default VST;