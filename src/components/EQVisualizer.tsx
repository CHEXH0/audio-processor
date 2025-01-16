import React from 'react';
import EQHeader from './eq/EQHeader';
import EQDisplay from './eq/EQDisplay';
import EQControls from './eq/EQControls';

interface EQVisualizerProps {
  parameters: {
    low: number;
    lowMid: number;
    highMid: number;
    high: number;
  };
  disabled?: boolean;
  onParameterChange: (param: string, value: number) => void;
  bypassed: boolean;
  onBypassChange: (bypassed: boolean) => void;
  analyzerNode?: AnalyserNode | null;
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({
  parameters,
  disabled = false,
  onParameterChange,
  bypassed,
  onBypassChange,
  analyzerNode
}) => {
  return (
    <div className="space-y-6">
      <EQHeader 
        bypassed={bypassed}
        onBypassChange={onBypassChange}
      />
      
      <EQDisplay 
        parameters={parameters}
        disabled={disabled || bypassed}
        analyzerNode={analyzerNode}
      />

      <EQControls 
        parameters={parameters}
        bypassed={bypassed}
        onParameterChange={onParameterChange}
      />
    </div>
  );
};

export default EQVisualizer;