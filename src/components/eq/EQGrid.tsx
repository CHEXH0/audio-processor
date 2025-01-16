import React from 'react';

interface EQGridProps {
  width: number;
  height: number;
}

const EQGrid: React.FC<EQGridProps> = ({ width, height }) => {
  return (
    <>
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
    </>
  );
};

export default EQGrid;