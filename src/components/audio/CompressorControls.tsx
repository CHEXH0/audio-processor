import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Compress } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Compress className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-medium">Compressor</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel p-4 space-y-2">
          <label className="parameter-label">Threshold</label>
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

        <div className="glass-panel p-4 space-y-2">
          <label className="parameter-label">Ratio</label>
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

        <div className="glass-panel p-4 space-y-2">
          <label className="parameter-label">Attack</label>
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

        <div className="glass-panel p-4 space-y-2">
          <label className="parameter-label">Release</label>
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

      {/* VU Meters */}
      <div className="glass-panel p-4">
        <div className="flex justify-between items-end h-32">
          <div className="flex gap-2">
            <div className="meter-container">
              <div 
                className="meter-bar bg-primary/80 w-full transition-all duration-100"
                style={{
                  height: `${Math.max(0, Math.min(100, 
                    isPlaying ? 60 - (parameters.threshold * -1) : 0
                  ))}%`
                }}
              />
            </div>
            <div className="meter-container">
              <div 
                className="meter-bar bg-primary/80 w-full transition-all duration-100"
                style={{
                  height: `${Math.max(0, Math.min(100, 
                    isPlaying ? 40 - (parameters.threshold * -1) : 0
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
    </div>
  );
};

export default CompressorControls;