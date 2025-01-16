import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import EQVisualizer from './EQVisualizer';
import { Card } from "@/components/ui/card";

const VST = () => {
  const [eqParams, setEqParams] = useState({
    low: 0,
    lowMid: 0,
    highMid: 0,
    high: 0
  });

  const [compParams, setCompParams] = useState({
    threshold: -20,
    ratio: 4,
    attack: 50,
    release: 200
  });

  const handleEQChange = (band: keyof typeof eqParams, value: number) => {
    setEqParams(prev => ({ ...prev, [band]: value }));
  };

  const handleCompChange = (param: keyof typeof compParams, value: number) => {
    setCompParams(prev => ({ ...prev, [param]: value }));
  };

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8">
      <Card className="glass-panel p-8">
        <h1 className="text-2xl font-semibold mb-8">Audio Processor</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EQ Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Equalizer</h2>
            <EQVisualizer parameters={eqParams} />
            
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(eqParams).map(([band, value]) => (
                <div key={band} className="space-y-2">
                  <label className="parameter-label">{band.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <Slider
                    value={[value]}
                    min={-12}
                    max={12}
                    step={0.1}
                    className="parameter-change"
                    onValueChange={([v]) => handleEQChange(band as keyof typeof eqParams, v)}
                  />
                  <span className="parameter-value">{value.toFixed(1)} dB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compressor Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Compressor</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="parameter-label">Threshold</label>
                <Slider
                  value={[compParams.threshold]}
                  min={-60}
                  max={0}
                  step={0.1}
                  className="parameter-change"
                  onValueChange={([v]) => handleCompChange('threshold', v)}
                />
                <span className="parameter-value">{compParams.threshold.toFixed(1)} dB</span>
              </div>

              <div className="space-y-2">
                <label className="parameter-label">Ratio</label>
                <Slider
                  value={[compParams.ratio]}
                  min={1}
                  max={20}
                  step={0.1}
                  className="parameter-change"
                  onValueChange={([v]) => handleCompChange('ratio', v)}
                />
                <span className="parameter-value">{compParams.ratio.toFixed(1)}:1</span>
              </div>

              <div className="space-y-2">
                <label className="parameter-label">Attack</label>
                <Slider
                  value={[compParams.attack]}
                  min={0}
                  max={200}
                  step={1}
                  className="parameter-change"
                  onValueChange={([v]) => handleCompChange('attack', v)}
                />
                <span className="parameter-value">{compParams.attack} ms</span>
              </div>

              <div className="space-y-2">
                <label className="parameter-label">Release</label>
                <Slider
                  value={[compParams.release]}
                  min={50}
                  max={1000}
                  step={1}
                  className="parameter-change"
                  onValueChange={([v]) => handleCompChange('release', v)}
                />
                <span className="parameter-value">{compParams.release} ms</span>
              </div>
            </div>

            {/* Meters */}
            <div className="flex justify-between items-end h-40 mt-8">
              <div className="flex gap-2">
                <div className="meter-container">
                  <div className="meter-bar bg-primary/80 h-[60%] w-full transition-all duration-100" />
                </div>
                <div className="meter-container">
                  <div className="meter-bar bg-primary/80 h-[40%] w-full transition-all duration-100" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                <div>0 dB</div>
                <div>-6</div>
                <div>-12</div>
                <div>-24</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VST;