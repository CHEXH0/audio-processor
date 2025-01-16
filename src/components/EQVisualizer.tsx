import React from 'react';
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";
import { ToggleLeft, ToggleRight } from "lucide-react";

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
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({
  parameters,
  disabled = false,
  onParameterChange,
  bypassed,
  onBypassChange
}) => {
  const height = 200;
  const width = 400;

  const getPointPosition = (index: number, value: number) => {
    const x = (width / 3) * index;
    const y = height / 2 - (value * height) / 24;
    return { x, y };
  };

  const generatePath = () => {
    const points = Object.values(parameters);
    let path = `M 0 ${height / 2}`;

    points.forEach((value, index) => {
      const { x, y } = getPointPosition(index, value);
      path += ` L ${x} ${y}`;
    });

    path += ` L ${width} ${height / 2}`;
    return path;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Equalizer</h2>
        <Toggle 
          pressed={!bypassed}
          onPressedChange={(pressed) => onBypassChange(!pressed)}
          className={`transition-opacity ${bypassed ? 'opacity-50' : ''}`}
        >
          {bypassed ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
          {bypassed ? 'Bypassed' : 'Active'}
        </Toggle>
      </div>

      <div className={`relative w-full h-[200px] bg-secondary/30 rounded-lg overflow-hidden ${disabled ? 'opacity-50' : ''}`}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[-12, -6, 0, 6, 12].map((db) => {
            const y = height / 2 - (db * height) / 24;
            return (
              <React.Fragment key={db}>
                <line
                  x1="0"
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeWidth="1"
                />
                <text
                  x="8"
                  y={y}
                  fill="currentColor"
                  fontSize="10"
                  alignmentBaseline="middle"
                  opacity={0.5}
                >
                  {db > 0 ? `+${db}` : db}
                </text>
              </React.Fragment>
            );
          })}

          {/* EQ curve */}
          <path
            d={generatePath()}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transition-all duration-200"
          />

          {/* Control points */}
          {Object.entries(parameters).map(([band, value], index) => {
            const { x, y } = getPointPosition(index, value);
            return (
              <circle
                key={band}
                cx={x}
                cy={y}
                r="4"
                className="fill-primary stroke-background stroke-2 transition-all duration-200"
              />
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {Object.entries(parameters).map(([band, value]) => (
          <div key={band} className="space-y-2">
            <label className="parameter-label">
              {band.replace(/([A-Z])/g, ' $1').trim()}
            </label>
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
    </div>
  );
};

export default EQVisualizer;