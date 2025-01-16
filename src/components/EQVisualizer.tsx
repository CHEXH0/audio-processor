import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface EQVisualizerProps {
  parameters: {
    low: number;
    lowMid: number;
    highMid: number;
    high: number;
  };
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ parameters }) => {
  // Make the dimensions responsive to viewport
  const width = 600; // Increased base width
  const height = 300; // Increased base height

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

  // Calculate frequency response for visualization
  const getFrequencyResponse = () => {
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    return frequencies.map(freq => {
      let response = 0;
      
      if (freq < 320) {
        response += parameters.low;
      }
      
      if (freq > 250 && freq < 2000) {
        const factor = 1 - Math.abs(Math.log10(freq/1000)) / 2;
        response += parameters.lowMid * factor;
      }
      
      if (freq > 1000 && freq < 8000) {
        const factor = 1 - Math.abs(Math.log10(freq/3200)) / 2;
        response += parameters.highMid * factor;
      }
      
      if (freq > 4000) {
        response += parameters.high;
      }
      
      return response;
    });
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
          {/* Grid lines with improved visibility */}
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
                  strokeOpacity={0.15}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="transition-opacity duration-200"
                />
                <text
                  x="24"
                  y={y}
                  fill="currentColor"
                  fontSize="12"
                  alignmentBaseline="middle"
                  className="transition-opacity duration-200 opacity-70 font-medium"
                >
                  {db > 0 ? `+${db}` : db} dB
                </text>
              </React.Fragment>
            );
          })}

          {/* Frequency bands with improved labels */}
          {[
            { freq: '20Hz', label: 'Low' },
            { freq: '200Hz', label: 'Low Mid' },
            { freq: '2kHz', label: 'High Mid' },
            { freq: '20kHz', label: 'High' }
          ].map(({ freq, label }, index) => {
            const x = (width / 3) * index;
            return (
              <g key={freq}>
                <text
                  x={x}
                  y={height - 16}
                  fill="currentColor"
                  fontSize="12"
                  textAnchor="middle"
                  className="transition-opacity duration-200 opacity-70 font-medium"
                >
                  {freq}
                </text>
                <text
                  x={x}
                  y={height - 32}
                  fill="currentColor"
                  fontSize="10"
                  textAnchor="middle"
                  className="transition-opacity duration-200 opacity-50"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Enhanced frequency response curve */}
          <defs>
            <linearGradient id="curve-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d={generatePath()}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="transition-all duration-200"
          />
          <path
            d={`${generatePath()} V ${height} H 0 Z`}
            fill="url(#curve-gradient)"
            className="transition-all duration-200"
          />

          {/* Enhanced control points */}
          {Object.entries(parameters).map(([band, value], index) => {
            const { x, y } = getPointPosition(index, value);
            return (
              <g key={band} className="group">
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  className="fill-primary stroke-background stroke-2 transition-all duration-200 cursor-pointer hover:r-8"
                />
                <text
                  x={x}
                  y={y - 16}
                  fill="currentColor"
                  fontSize="12"
                  textAnchor="middle"
                  className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 font-medium"
                >
                  {value.toFixed(1)} dB
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default EQVisualizer;