import React from 'react';

interface EQVisualizerProps {
  parameters: {
    low: number;
    lowMid: number;
    highMid: number;
    high: number;
  };
  disabled?: boolean;
}

const EQVisualizer: React.FC<EQVisualizerProps> = ({ parameters, disabled = false }) => {
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
  );
};

export default EQVisualizer;