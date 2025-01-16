import React from 'react';
import { Gauge } from 'lucide-react';
import CompressorParameter from '../compressor/CompressorParameter';
import GainReductionMeter from '../compressor/GainReductionMeter';
import CompressionCurve from '../compressor/CompressionCurve';

interface CompressorControlsProps {
  parameters: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  onParameterChange: (param: string, value: number) => void;
  isPlaying: boolean;
}

const CompressorControls: React.FC<CompressorControlsProps> = ({
  parameters,
  onParameterChange,
  isPlaying,
}) => {
  const calculateGainReduction = (inputLevel: number) => {
    if (inputLevel <= parameters.threshold) return 0;
    const difference = inputLevel - parameters.threshold;
    return -(difference - difference / parameters.ratio);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Gauge className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-medium">Compressor</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <CompressorParameter
          label="Threshold"
          description="Determines when compression starts"
          value={parameters.threshold}
          min={-60}
          max={0}
          step={0.1}
          unit="dB"
          onChange={(v) => onParameterChange('threshold', v)}
        />
        <CompressorParameter
          label="Ratio"
          description="Amount of compression applied"
          value={parameters.ratio}
          min={1}
          max={20}
          step={0.1}
          unit=":1"
          onChange={(v) => onParameterChange('ratio', v)}
        />
        <CompressorParameter
          label="Attack"
          description="Speed of compression onset"
          value={parameters.attack}
          min={0}
          max={200}
          step={1}
          unit="ms"
          onChange={(v) => onParameterChange('attack', v)}
        />
        <CompressorParameter
          label="Release"
          description="Recovery time after compression"
          value={parameters.release}
          min={50}
          max={1000}
          step={1}
          unit="ms"
          onChange={(v) => onParameterChange('release', v)}
        />
      </div>

      <GainReductionMeter
        isPlaying={isPlaying}
        calculateGainReduction={calculateGainReduction}
      />

      <CompressionCurve
        threshold={parameters.threshold}
        ratio={parameters.ratio}
      />
    </div>
  );
};

export default CompressorControls;