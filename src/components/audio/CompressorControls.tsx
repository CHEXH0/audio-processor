import React from 'react';
import { Gauge, Power } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
  bypassed: boolean;
  onParameterChange: (param: string, value: number) => void;
  onBypassChange?: (bypassed: boolean) => void;
  isPlaying: boolean;
}

const CompressorControls: React.FC<CompressorControlsProps> = ({
  parameters,
  bypassed,
  onParameterChange,
  onBypassChange,
  isPlaying,
}) => {
  const calculateGainReduction = (inputLevel: number) => {
    if (bypassed || inputLevel <= parameters.threshold) return 0;
    const difference = inputLevel - parameters.threshold;
    return -(difference - difference / parameters.ratio);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium">Compressor</h2>
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
      
      <div className={`grid grid-cols-2 gap-6 transition-opacity ${bypassed ? "opacity-50" : ""}`}>
        <CompressorParameter
          label="Threshold"
          description="Start"
          value={parameters.threshold}
          min={-60}
          max={0}
          step={0.1}
          unit="dB"
          onChange={(v) => onParameterChange('threshold', v)}
          disabled={bypassed}
        />
        <CompressorParameter
          label="Ratio"
          description="Amount"
          value={parameters.ratio}
          min={1}
          max={20}
          step={0.1}
          unit=":1"
          onChange={(v) => onParameterChange('ratio', v)}
          disabled={bypassed}
        />
        <CompressorParameter
          label="Attack"
          description="Speed"
          value={parameters.attack}
          min={0}
          max={200}
          step={1}
          unit="ms"
          onChange={(v) => onParameterChange('attack', v)}
          disabled={bypassed}
        />
        <CompressorParameter
          label="Release"
          description="Recovery"
          value={parameters.release}
          min={50}
          max={1000}
          step={1}
          unit="ms"
          onChange={(v) => onParameterChange('release', v)}
          disabled={bypassed}
        />
      </div>

      <GainReductionMeter
        isPlaying={isPlaying}
        calculateGainReduction={calculateGainReduction}
        bypassed={bypassed}
      />

      <CompressionCurve
        threshold={parameters.threshold}
        ratio={parameters.ratio}
        bypassed={bypassed}
      />
    </div>
  );
};

export default CompressorControls;