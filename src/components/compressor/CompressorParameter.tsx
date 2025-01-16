import React from 'react';
import { Slider } from "@/components/ui/slider";

interface CompressorParameterProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

const CompressorParameter: React.FC<CompressorParameterProps> = ({
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}) => {
  return (
    <div className="glass-panel p-4 space-y-2 rounded-lg border border-border/50">
      <label className="parameter-label flex justify-between">
        <span>{label}</span>
        <span className="text-xs opacity-50">{description}</span>
      </label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        className="parameter-change"
        onValueChange={([v]) => onChange(v)}
      />
      <div className="flex justify-between items-center">
        <span className="parameter-value">
          {value.toFixed(1)} {unit}
        </span>
      </div>
    </div>
  );
};

export default CompressorParameter;