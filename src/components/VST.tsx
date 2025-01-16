import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Download } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorder = React.useRef<MediaRecorder | null>(null);
  
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

  const startRecording = async () => {
    try {
      const stream = audioContext.current!.destination.stream;
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, event.data]);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'processed_audio.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setRecordedChunks([]);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Processing audio in real-time...",
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording complete",
        description: "Your processed audio is ready for download",
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
            hasAudioFile={!!audioFile}
          />
        </div>

        <div className="mb-8 flex gap-4">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!audioFile || !isPlaying}
          >
            <Mic className="h-4 w-4 mr-2" />
            {isRecording ? "Stop Recording" : "Record Processing"}
          </Button>
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