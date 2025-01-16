import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecordingControlsProps {
  audioContext: React.MutableRefObject<AudioContext | null>;
  nodes: {
    compressor: DynamicsCompressorNode | null;
  };
  hasAudioFile: boolean;
  isPlaying: boolean;
  onPlaybackStart: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  audioContext,
  nodes,
  hasAudioFile,
  isPlaying,
  onPlaybackStart,
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3'>('wav');
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      if (!audioContext.current) return;
      
      const destination = audioContext.current.createMediaStreamDestination();
      nodes.compressor?.connect(destination);
      
      const mimeType = exportFormat === 'wav' ? 'audio/wav' : 'audio/mpeg';
      mediaRecorder.current = new MediaRecorder(destination.stream, {
        mimeType: mimeType
      });
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, event.data]);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_audio.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setRecordedChunks([]);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      if (!isPlaying) {
        onPlaybackStart();
      }
      
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
    <div className="flex gap-4 items-center">
      <Button
        variant={isRecording ? "destructive" : "default"}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!hasAudioFile}
      >
        <Mic className="h-4 w-4 mr-2" />
        {isRecording ? "Stop Recording" : "Record Processing"}
      </Button>

      <Select
        value={exportFormat}
        onValueChange={(value: 'wav' | 'mp3') => setExportFormat(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="wav">WAV Format</SelectItem>
          <SelectItem value="mp3">MP3 Format</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RecordingControls;