import React from 'react';
import { Input } from "@/components/ui/input";

interface FileControlsProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasAudioFile: boolean;
}

const FileControls: React.FC<FileControlsProps> = ({
  onFileChange,
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
    </div>
  );
};

export default FileControls;