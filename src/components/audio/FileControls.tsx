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
  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="audio/*"
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