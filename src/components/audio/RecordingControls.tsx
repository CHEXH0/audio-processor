import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      if (!audioContext.current) return;
      
      const destination = audioContext.current.createMediaStreamDestination();
      nodes.compressor?.connect(destination);
      
      mediaRecorder.current = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((chunks) => [...chunks, event.data]);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        
        // Create a temporary audio context for processing
        const tempContext = new AudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await tempContext.decodeAudioData(arrayBuffer);
        
        // Convert AudioBuffer to Float32Array
        const numberOfChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;
        const sampleRate = audioBuffer.sampleRate;
        const outputArray = new Float32Array(length * numberOfChannels);
        
        // Interleave channels
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            outputArray[i * numberOfChannels + channel] = channelData[i];
          }
        }
        
        // Create WAV format blob
        const finalBlob = new Blob([outputArray.buffer], { type: 'audio/wav' });
        
        const url = URL.createObjectURL(finalBlob);
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
    </div>
  );
};

export default RecordingControls;