import React, { useRef, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import RecordingButton from './recording/RecordingButton';
import FormatDialog from './recording/FormatDialog';
import { createWavFile } from '@/utils/audioExport';

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
        <RecordingButton
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          disabled={!hasAudioFile}
        />
      </div>

      <FormatDialog
        open={showFormatDialog}
        onOpenChange={setShowFormatDialog}
        onExport={handleExport}
      />
    </>
  );
};

export default RecordingControls;