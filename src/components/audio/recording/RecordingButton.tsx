import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface RecordingButtonProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled: boolean;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled
}) => {
  return (
    <Button
      variant={isRecording ? "destructive" : "default"}
      onClick={isRecording ? onStopRecording : onStartRecording}
      disabled={disabled}
    >
      <Mic className="h-4 w-4 mr-2" />
      {isRecording ? "Stop Recording" : "Record Processing"}
    </Button>
  );
};

export default RecordingButton;