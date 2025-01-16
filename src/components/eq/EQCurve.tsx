import React from 'react';

interface EQCurveProps {
  width: number;
  height: number;
  parameters: {
    low: number;
    lowMid: number;
    highMid: number;
    high: number;
  };
}

const EQCurve: React.FC<EQCurveProps> = ({ width, height, parameters }) => {
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
    <>
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
    </>
  );
};

export default EQCurve;