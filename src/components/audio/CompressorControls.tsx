import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Gauge } from 'lucide-react';

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
  // Calculate gain reduction based on threshold and ratio
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
        <div className="glass-panel p-4 space-y-2 rounded-lg border border-border/50">
          <label className="parameter-label flex justify-between">
            <span>Threshold</span>
            <span className="text-xs opacity-50">Determines when compression starts</span>
          </label>
          <Slider
            value={[parameters.threshold]}
            min={-60}
            max={0}
            step={0.1}
            className="parameter-change"
            onValueChange={([v]) => onParameterChange('threshold', v)}
          />
          <div className="flex justify-between items-center">
            <span className="parameter-value">
              {parameters.threshold.toFixed(1)} dB
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 space-y-2 rounded-lg border border-border/50">
          <label className="parameter-label flex justify-between">
            <span>Ratio</span>
            <span className="text-xs opacity-50">Amount of compression applied</span>
          </label>
          <Slider
            value={[parameters.ratio]}
            min={1}
            max={20}
            step={0.1}
            className="parameter-change"
            onValueChange={([v]) => onParameterChange('ratio', v)}
          />
          <div className="flex justify-between items-center">
            <span className="parameter-value">
              {parameters.ratio.toFixed(1)}:1
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 space-y-2 rounded-lg border border-border/50">
          <label className="parameter-label flex justify-between">
            <span>Attack</span>
            <span className="text-xs opacity-50">Speed of compression onset</span>
          </label>
          <Slider
            value={[parameters.attack]}
            min={0}
            max={200}
            step={1}
            className="parameter-change"
            onValueChange={([v]) => onParameterChange('attack', v)}
          />
          <div className="flex justify-between items-center">
            <span className="parameter-value">{parameters.attack} ms</span>
          </div>
        </div>

        <div className="glass-panel p-4 space-y-2 rounded-lg border border-border/50">
          <label className="parameter-label flex justify-between">
            <span>Release</span>
            <span className="text-xs opacity-50">Recovery time after compression</span>
          </label>
          <Slider
            value={[parameters.release]}
            min={50}
            max={1000}
            step={1}
            className="parameter-change"
            onValueChange={([v]) => onParameterChange('release', v)}
          />
          <div className="flex justify-between items-center">
            <span className="parameter-value">{parameters.release} ms</span>
          </div>
        </div>
      </div>

      {/* Compression Visualization */}
      <div className="glass-panel p-4 rounded-lg border border-border/50">
        <h3 className="text-sm font-medium mb-2">Gain Reduction Meter</h3>
        <div className="flex justify-between items-end h-32">
          <div className="flex gap-2 w-full">
            <div className="meter-container flex-1">
              <div 
                className="meter-bar bg-primary/80 w-full transition-all duration-100"
                style={{
                  height: `${Math.max(0, Math.min(100, 
                    isPlaying ? Math.abs(calculateGainReduction(-6)) * 8 : 0
                  ))}%`
                }}
              />
            </div>
            <div className="meter-container flex-1">
              <div 
                className="meter-bar bg-primary/80 w-full transition-all duration-100"
                style={{
                  height: `${Math.max(0, Math.min(100, 
                    isPlaying ? Math.abs(calculateGainReduction(-3)) * 8 : 0
                  ))}%`
                }}
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-2 ml-2">
            <div>0 dB</div>
            <div>-6</div>
            <div>-12</div>
            <div>-24</div>
          </div>
        </div>
      </div>

      {/* Compression Curve Visualization */}
      <div className="glass-panel p-4 rounded-lg border border-border/50">
        <h3 className="text-sm font-medium mb-2">Compression Curve</h3>
        <svg width="100%" height="100" viewBox="0 0 100 100" className="stroke-primary fill-none">
          {/* Grid */}
          <line x1="0" y1="50" x2="100" y2="50" className="stroke-border opacity-20" />
          <line x1="50" y1="0" x2="50" y2="100" className="stroke-border opacity-20" />
          
          {/* Compression curve */}
          <path
            d={`
              M 0 100
              L ${50 + parameters.threshold / 1.2} ${50 - parameters.threshold / 1.2}
              L 100 ${100 - (50 / parameters.ratio)}
            `}
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default CompressorControls;