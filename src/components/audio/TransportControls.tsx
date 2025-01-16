import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, RotateCw } from "lucide-react";

interface TransportControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onLoopToggle: () => void;
  onSeek: (time: number) => void;
  onRewind: () => void;
}

const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  isLooping,
  currentTime,
  duration,
  onPlayPause,
  onLoopToggle,
  onSeek,
  onRewind,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onLoopToggle}
          className={isLooping ? "bg-primary/20" : ""}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onRewind}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">
          {Math.floor(currentTime / 60)}:
          {Math.floor(currentTime % 60).toString().padStart(2, '0')}
        </span>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          className="flex-1"
          onValueChange={([value]) => onSeek(value)}
        />
        <span className="text-sm">
          {Math.floor(duration / 60)}:
          {Math.floor(duration % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default TransportControls;