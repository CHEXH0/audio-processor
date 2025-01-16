import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [processedData, setProcessedData] = useState<Float32Array | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const destination = useRef<MediaStreamAudioDestinationNode | null>(null);

  const startRecording = async () => {
    try {
      if (!audioContext.current) return;
      
      // Create a new MediaStreamDestination if it doesn't exist
      if (!destination.current) {
        destination.current = audioContext.current.createMediaStreamDestination();
      }
      
      // Ensure compressor is connected to the destination
      if (nodes.compressor && destination.current) {
        nodes.compressor.disconnect();
        nodes.compressor.connect(destination.current);
        nodes.compressor.connect(audioContext.current.destination);
      }
      
      mediaRecorder.current = new MediaRecorder(destination.current.stream, {
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
        const outputArray = new Float32Array(length * numberOfChannels);
        
        // Interleave channels
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            outputArray[i * numberOfChannels + channel] = channelData[i];
          }
        }
        
        setProcessedData(outputArray);
        setShowFormatDialog(true);
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
    }
  };

  const handleExport = (format: 'wav' | 'mp3') => {
    if (!processedData) return;

    const finalBlob = new Blob([processedData.buffer], { 
      type: format === 'wav' ? 'audio/wav' : 'audio/mpeg' 
    });
    
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed_audio.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowFormatDialog(false);
    setProcessedData(null);

    toast({
      title: "Export complete",
      description: `Your processed audio has been exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <>
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

      <AlertDialog open={showFormatDialog} onOpenChange={setShowFormatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Export Format</AlertDialogTitle>
            <AlertDialogDescription>
              Select the format you want to export your processed audio in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogAction onClick={() => handleExport('wav')}>
              Export as WAV
            </AlertDialogAction>
            <AlertDialogAction onClick={() => handleExport('mp3')}>
              Export as MP3
            </AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecordingControls;