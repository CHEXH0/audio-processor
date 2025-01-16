import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
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
  onParameterChange?: (parameter: string, value: number) => void;
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ parameters, onParameterChange }) => {
  const width = 600;
  const height = 300;

  const handleSliderChange = (parameter: string) => (value: number[]) => {
    onParameterChange?.(parameter, value[0]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-medium">Equalizer</h3>
      </div>
      
      <div className="relative w-full aspect-[2/1] min-h-[300px] glass-panel overflow-hidden rounded-lg border border-border/50">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="xMidYMid meet"
          className="p-4"
        >
          <EQGrid width={width} height={height} />
          <FrequencyBands width={width} height={height} />
          <EQCurve width={width} height={height} parameters={parameters} />
          <EQControlPoints width={width} height={height} parameters={parameters} />
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
          />
        </div>
      </div>
    </div>
  );
};

export default EQVisualizer;