import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import EQVisualizer from './EQVisualizer';
import TransportControls from './audio/TransportControls';
import FileControls from './audio/FileControls';
import CompressorControls from './audio/CompressorControls';
import { useSession } from '@supabase/auth-helpers-react';
import { useAudioContext } from '@/hooks/useAudioContext';
import { usePlayback } from '@/hooks/usePlayback';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';

const VST = () => {
  const { toast } = useToast();
  const session = useSession();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const { audioContext, audioSource, audioBuffer, nodes } = useAudioContext();
  const { 
    isPlaying, 
    isLooping, 
    currentTime, 
    duration,
    setDuration,
    setIsLooping,
    handlePlayPause,
    handleSeek,
    handleRewind,
  } = usePlayback({ audioContext, audioSource, audioBuffer, nodes });
  
  const {
    eqParams,
    compParams,
    eqBypassed,
    compBypassed,
    handleEQChange,
    handleCompChange,
    setEqBypassed,
    setCompBypassed,
  } = useAudioProcessor(nodes);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.current!.decodeAudioData(arrayBuffer);
      audioBuffer.current = buffer;
      setDuration(buffer.duration);
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

  const handleExport = async (format: 'wav' | 'mp3') => {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "No audio file loaded",
        variant: "destructive",
      });
      return;
    }

    if (!session) {
      toast({
        title: "Error",
        description: "Please sign in to export audio",
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
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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

        <div className="mb-8">
          <FileControls
            onFileChange={handleFileChange}
            onExport={handleExport}
            hasAudioFile={!!audioFile}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <EQVisualizer 
              parameters={eqParams} 
              onParameterChange={handleEQChange}
              bypassed={eqBypassed}
              onBypassChange={setEqBypassed}
            />
          </div>

          <CompressorControls
            parameters={compParams}
            onParameterChange={handleCompChange}
            isPlaying={isPlaying}
            bypassed={compBypassed}
            onBypassChange={setCompBypassed}
          />
        </div>
      </Card>
    </div>
  );
};

export default VST;