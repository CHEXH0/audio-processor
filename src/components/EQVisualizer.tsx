import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
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
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ parameters }) => {
  const width = 600;
  const height = 300;

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
    </div>
  );
};

export default EQVisualizer;