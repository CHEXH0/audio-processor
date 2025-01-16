import React from 'react';
import { SlidersHorizontal, Power } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import EQGrid from './eq/EQGrid';
import FrequencyBands from './eq/FrequencyBands';
import EQCurve from './eq/EQCurve';
import EQControlPoints from './eq/EQControlPoints';

interface EQVisualizerProps {
  parameters: {
    low: number;
    lowMid: number;
    highMid: number;
    high: number;
  };
  bypassed: boolean;
  onParameterChange?: (parameter: string, value: number) => void;
  onBypassChange?: (bypassed: boolean) => void;
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ 
  parameters, 
  bypassed,
  onParameterChange,
  onBypassChange 
}) => {
  const width = 600;
  const height = 300;

  const handleSliderChange = (parameter: string) => (value: number[]) => {
    onParameterChange?.(parameter, value[0]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-medium">Equalizer</h3>
        </div>
        <Button
          variant={bypassed ? "outline" : "default"}
          size="icon"
          onClick={() => onBypassChange?.(!bypassed)}
          className={bypassed ? "opacity-50" : ""}
        >
          <Power className="h-4 w-4" />
        </Button>
      </div>
      
      <div className={`relative w-full aspect-[2/1] min-h-[300px] glass-panel overflow-hidden rounded-lg border border-border/50 transition-opacity ${bypassed ? "opacity-50" : ""}`}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="xMidYMid meet"
          className="p-4"
        >
          <EQGrid width={width} height={height} />
          <FrequencyBands width={width} height={height} />
          <EQCurve width={width} height={height} parameters={bypassed ? { low: 0, lowMid: 0, highMid: 0, high: 0 } : parameters} />
          <EQControlPoints width={width} height={height} parameters={bypassed ? { low: 0, lowMid: 0, highMid: 0, high: 0 } : parameters} />
        </svg>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Low (20Hz)</label>
          <Slider
            value={[parameters.low]}
            min={-12}
            max={12}
            step={0.1}
            onValueChange={handleSliderChange('low')}
            disabled={bypassed}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Low Mid (200Hz)</label>
          <Slider
            value={[parameters.lowMid]}
            min={-12}
            max={12}
            step={0.1}
            onValueChange={handleSliderChange('lowMid')}
            disabled={bypassed}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">High Mid (2kHz)</label>
          <Slider
            value={[parameters.highMid]}
            min={-12}
            max={12}
            step={0.1}
            onValueChange={handleSliderChange('highMid')}
            disabled={bypassed}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">High (20kHz)</label>
          <Slider
            value={[parameters.high]}
            min={-12}
            max={12}
            step={0.1}
            onValueChange={handleSliderChange('high')}
            disabled={bypassed}
          />
        </div>
      </div>
    </div>
  );
};

export default EQVisualizer;