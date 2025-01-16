import React from 'react';
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

interface FormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'wav' | 'mp3') => void;
}

const FormatDialog: React.FC<FormatDialogProps> = ({
  open,
  onOpenChange,
  onExport,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Choose Export Format</AlertDialogTitle>
          <AlertDialogDescription>
            Select the format you want to export your processed audio in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogAction onClick={() => onExport('wav')}>
            Export as WAV
          </AlertDialogAction>
          <AlertDialogAction onClick={() => onExport('mp3')}>
            Export as MP3
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FormatDialog;