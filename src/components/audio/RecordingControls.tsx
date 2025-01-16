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
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  audioContext,
  nodes,
  hasAudioFile,
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [processedData, setProcessedData] = useState<AudioBuffer | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const destination = useRef<MediaStreamAudioDestinationNode | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      if (!audioContext.current || !nodes.compressor) return;
      
      recordedChunks.current = [];
      
      if (!destination.current) {
        destination.current = audioContext.current.createMediaStreamDestination();
      }
      
      // Ensure proper connection chain
      nodes.compressor.disconnect();
      nodes.compressor.connect(destination.current);
      nodes.compressor.connect(audioContext.current.destination);
      
      mediaRecorder.current = new MediaRecorder(destination.current.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.current!.decodeAudioData(arrayBuffer);
        
        setProcessedData(audioBuffer);
        setShowFormatDialog(true);
        
        if (nodes.compressor) {
          nodes.compressor.disconnect();
          nodes.compressor.connect(audioContext.current!.destination);
        }
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
    }
  };

  const createWavFile = (audioBuffer: AudioBuffer): Blob => {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * numOfChan * 2, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const offset = 44;
    const channelData = new Float32Array(audioBuffer.length * numOfChan);
    let channelIdx = 0;

    // Interleave channel data
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        channelData[channelIdx++] = audioBuffer.getChannelData(channel)[i];
      }
    }

    // Convert to 16-bit PCM
    const volume = 0.9;
    const pcmData = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 * volume : s * 0x7FFF * volume;
    }

    // Copy PCM data to WAV buffer
    const pcmBytes = new Uint8Array(pcmData.buffer);
    for (let i = 0; i < pcmBytes.length; i++) {
      view.setUint8(offset + i, pcmBytes[i]);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleExport = async (format: 'wav' | 'mp3') => {
    if (!processedData) return;

    let blob: Blob;
    if (format === 'wav') {
      blob = createWavFile(processedData);
    } else {
      // For MP3, we'll use the WAV format but change the extension
      blob = createWavFile(processedData);
    }
    
    const url = URL.createObjectURL(blob);
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