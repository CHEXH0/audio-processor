import React from 'react';

interface EQControlPointsProps {
  width: number;
  height: number;
  parameters: {
    low: number;
    lowMid: number;
    highMid: number;
    high: number;
  };
}

const EQControlPoints: React.FC<EQControlPointsProps> = ({ width, height, parameters }) => {
  const getPointPosition = (index: number, value: number) => {
    const x = (width / 3) * index;
    const y = height / 2 - (value * height) / 24;
    return { x, y };
  };

  return (
    <>
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
    </>
  );
};

export default EQControlPoints;