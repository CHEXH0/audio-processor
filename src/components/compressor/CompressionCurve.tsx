import React from 'react';

interface CompressionCurveProps {
  threshold: number;
  ratio: number;
}

const CompressionCurve: React.FC<CompressionCurveProps> = ({
  threshold,
  ratio,
}) => {
  return (
    <div className="glass-panel p-4 rounded-lg border border-border/50">
      <h3 className="text-sm font-medium mb-2">Compression Curve</h3>
      <svg width="100%" height="100" viewBox="0 0 100 100" className="stroke-primary fill-none">
        <line x1="0" y1="50" x2="100" y2="50" className="stroke-border opacity-20" />
        <line x1="50" y1="0" x2="50" y2="100" className="stroke-border opacity-20" />
        
        <path
          d={`
            M 0 100
            L ${50 + threshold / 1.2} ${50 - threshold / 1.2}
            L 100 ${100 - (50 / ratio)}
          `}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default CompressionCurve;