import { SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface EQControlsProps {
  parameters: {
    low: number;
    lowMid: number;
    highMid: number;
    high: number;
  };
  bypassed: boolean;
  onParameterChange: (param: string, value: number) => void;
}

const EQControls: React.FC<EQControlsProps> = ({ parameters, bypassed, onParameterChange }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {Object.entries(parameters).map(([band, value]) => (
        <div key={band} className="space-y-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <label className="parameter-label">
              {band.replace(/([A-Z])/g, ' $1').trim()}
            </label>
          </div>
          <Slider
            value={[value]}
            min={-12}
            max={12}
            step={0.1}
            className={`parameter-change ${bypassed ? 'opacity-50' : ''}`}
            disabled={bypassed}
            onValueChange={([v]) => onParameterChange(band, v)}
          />
          <span className="parameter-value">{value.toFixed(1)} dB</span>
        </div>
      ))}
    </div>
  );
};

export default EQControls;