import React, { useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { ToggleLeft, ToggleRight, Activity } from "lucide-react";

interface CompressorControlsProps {
  parameters: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  onParameterChange: (param: string, value: number) => void;
  isPlaying: boolean;
  bypassed: boolean;
  onBypassChange: (bypassed: boolean) => void;
  analyzerNode: AnalyserNode | null;
}

const CompressorControls: React.FC<CompressorControlsProps> = ({
  parameters,
  onParameterChange,
  isPlaying,
  bypassed,
  onBypassChange,
  analyzerNode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrame = useRef<number>();

  useEffect(() => {
    if (!analyzerNode || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrame.current = requestAnimationFrame(draw);
      analyzerNode.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(20, 20, 20)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = bypassed ? 'rgb(100, 100, 100)' : 'rgb(0, 255, 0)';
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw threshold line
      const thresholdY = (1 - (parameters.threshold + 60) / 60) * canvas.height;
      ctx.beginPath();
      ctx.strokeStyle = 'rgb(255, 0, 0)';
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, thresholdY);
      ctx.lineTo(canvas.width, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    draw();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isPlaying, analyzerNode, parameters.threshold, bypassed]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Compressor</h2>
        <Toggle 
          pressed={!bypassed}
          onPressedChange={(pressed) => onBypassChange(!pressed)}
          className={`transition-opacity ${bypassed ? 'opacity-50' : ''}`}
        >
          {bypassed ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
          {bypassed ? 'Bypassed' : 'Active'}
        </Toggle>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width="400" 
          height="200" 
          className="w-full bg-secondary/30 rounded-lg"
        />
        <Activity className={`absolute top-2 right-2 h-4 w-4 ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="parameter-label">Threshold</label>
          <Slider
            value={[parameters.threshold]}
            min={-60}
            max={0}
            step={0.1}
            className={`parameter-change ${bypassed ? 'opacity-50' : ''}`}
            disabled={bypassed}
            onValueChange={([v]) => onParameterChange('threshold', v)}
          />
          <span className="parameter-value">
            {parameters.threshold.toFixed(1)} dB
          </span>
        </div>

        <div className="space-y-2">
          <label className="parameter-label">Ratio</label>
          <Slider
            value={[parameters.ratio]}
            min={1}
            max={20}
            step={0.1}
            className={`parameter-change ${bypassed ? 'opacity-50' : ''}`}
            disabled={bypassed}
            onValueChange={([v]) => onParameterChange('ratio', v)}
          />
          <span className="parameter-value">
            {parameters.ratio.toFixed(1)}:1
          </span>
        </div>

        <div className="space-y-2">
          <label className="parameter-label">Attack</label>
          <Slider
            value={[parameters.attack]}
            min={0}
            max={200}
            step={1}
            className={`parameter-change ${bypassed ? 'opacity-50' : ''}`}
            disabled={bypassed}
            onValueChange={([v]) => onParameterChange('attack', v)}
          />
          <span className="parameter-value">{parameters.attack} ms</span>
        </div>

        <div className="space-y-2">
          <label className="parameter-label">Release</label>
          <Slider
            value={[parameters.release]}
            min={50}
            max={1000}
            step={1}
            className={`parameter-change ${bypassed ? 'opacity-50' : ''}`}
            disabled={bypassed}
            onValueChange={([v]) => onParameterChange('release', v)}
          />
          <span className="parameter-value">{parameters.release} ms</span>
        </div>
      </div>
    </div>
  );
};

export default CompressorControls;