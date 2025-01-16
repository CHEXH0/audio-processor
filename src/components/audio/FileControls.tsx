import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

interface FileControlsProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: (format: 'wav' | 'mp3') => void;
  hasAudioFile: boolean;
}

const FileControls: React.FC<FileControlsProps> = ({
  onFileChange,
  onExport,
  hasAudioFile,
}) => {
  // List of supported audio formats
  const supportedFormats = [
    'audio/mpeg',        // .mp3
    'audio/wav',         // .wav
    'audio/x-wav',       // alternative MIME type for .wav
    'audio/ogg',         // .ogg
    'audio/aac',         // .aac
    'audio/m4a',         // .m4a
    'audio/x-m4a',       // alternative MIME type for .m4a
    'audio/mp4',         // .mp4 audio
    'audio/webm',        // .webm audio
    'audio/flac'         // .flac
  ].join(',');

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept={supportedFormats}
        onChange={onFileChange}
        className="max-w-xs"
      />
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onExport('wav')}
          disabled={!hasAudioFile}
        >
          <Download className="h-4 w-4 mr-2" />
          Export WAV
        </Button>
        <Button
          variant="outline"
          onClick={() => onExport('mp3')}
          disabled={!hasAudioFile}
        >
          <Download className="h-4 w-4 mr-2" />
          Export MP3
        </Button>
      </div>
    </div>
  );
};

export default FileControls;