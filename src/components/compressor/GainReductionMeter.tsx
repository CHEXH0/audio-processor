import React from 'react';

interface GainReductionMeterProps {
  isPlaying: boolean;
  calculateGainReduction: (level: number) => number;
  bypassed?: boolean;
}

const GainReductionMeter: React.FC<GainReductionMeterProps> = ({
  isPlaying,
  calculateGainReduction,
  bypassed,
}) => {
  return (
    <div className={`glass-panel p-4 rounded-lg border border-border/50 transition-opacity ${bypassed ? "opacity-50" : ""}`}>
      <h3 className="text-sm font-medium mb-2">Gain Reduction Meter</h3>
      <div className="flex justify-between items-end h-32">
        <div className="flex gap-2 w-full">
          <div className="meter-container flex-1">
            <div 
              className="meter-bar bg-primary/80 w-full transition-all duration-100"
              style={{
                height: `${Math.max(0, Math.min(100, 
                  isPlaying && !bypassed ? Math.abs(calculateGainReduction(-6)) * 8 : 0
                ))}%`
              }}
            />
          </div>
          <div className="meter-container flex-1">
            <div 
              className="meter-bar bg-primary/80 w-full transition-all duration-100"
              style={{
                height: `${Math.max(0, Math.min(100, 
                  isPlaying && !bypassed ? Math.abs(calculateGainReduction(-3)) * 8 : 0
                ))}%`
              }}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground space-y-2 ml-2">
          <div>0 dB</div>
          <div>-6</div>
          <div>-12</div>
          <div>-24</div>
        </div>
      </div>
    </div>
  );
};

export default GainReductionMeter;