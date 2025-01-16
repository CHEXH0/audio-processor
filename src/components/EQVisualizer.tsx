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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium">Equalizer</h3>
      </div>
      
      <div className="relative w-full h-[200px] glass-panel overflow-hidden">
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
                  className="transition-opacity duration-200"
                />
                <text
                  x="8"
                  y={y}
                  fill="currentColor"
                  fontSize="10"
                  alignmentBaseline="middle"
                  className="transition-opacity duration-200 opacity-50"
                >
                  {db > 0 ? `+${db}` : db}
                </text>
              </React.Fragment>
            );
          })}

          {/* Frequency bands */}
          {['20Hz', '200Hz', '2kHz', '20kHz'].map((freq, index) => {
            const x = (width / 3) * index;
            return (
              <text
                key={freq}
                x={x}
                y={height - 8}
                fill="currentColor"
                fontSize="10"
                textAnchor="middle"
                className="transition-opacity duration-200 opacity-50"
              >
                {freq}
              </text>
            );
          })}

          {/* EQ curve with gradient */}
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
            strokeWidth="2"
            className="transition-all duration-200"
          />
          <path
            d={`${generatePath()} V ${height} H 0 Z`}
            fill="url(#curve-gradient)"
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
                className="fill-primary stroke-background stroke-2 transition-all duration-200 cursor-pointer hover:r-6"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default EQVisualizer;