import React from 'react';

interface FrequencyBandsProps {
  width: number;
  height: number;
}

const FrequencyBands: React.FC<FrequencyBandsProps> = ({ width, height }) => {
  const bands = [
    { freq: '20Hz', label: 'Low' },
    { freq: '200Hz', label: 'Low Mid' },
    { freq: '2kHz', label: 'High Mid' },
    { freq: '20kHz', label: 'High' }
  ];

  return (
    <>
      {bands.map(({ freq, label }, index) => {
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
    </>
  );
};

export default FrequencyBands;