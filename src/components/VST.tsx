import React, { useState, useRef, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  Play, 
  Pause, 
  SkipBack, 
  Download,
  Upload,
  RotateCw
} from "lucide-react";
import EQVisualizer from './EQVisualizer';
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const VST = () => {
  const { toast } = useToast();
  const audioContext = useRef<AudioContext | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);

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

  useEffect(() => {
    audioContext.current = new AudioContext();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.current!.decodeAudioData(arrayBuffer);
      audioBuffer.current = buffer;
      setDuration(buffer.duration);
      setAudioFile(file);
      toast({
        title: "Audio loaded",
        description: `Loaded: ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audio file",
        variant: "destructive",
      });
    }
  };

  const handlePlayPause = () => {
    if (!audioBuffer.current || !audioContext.current) return;

    if (isPlaying) {
      audioSource.current?.stop();
      setIsPlaying(false);
    } else {
      audioSource.current = audioContext.current.createBufferSource();
      audioSource.current.buffer = audioBuffer.current;
      audioSource.current.loop = isLooping;
      audioSource.current.connect(audioContext.current.destination);
      audioSource.current.start(0, currentTime);
      setIsPlaying(true);
    }
  };

  const handleExport = async (format: 'wav' | 'mp3') => {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "No audio file loaded",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('settings', JSON.stringify({
        eq: eqParams,
        comp: compParams
      }));

      const { data, error } = await supabase.functions.invoke('process-audio', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Audio processed and saved successfully",
      });

      // Download the processed file
      const { data: fileData } = await supabase.storage
        .from('audio_files')
        .download(data.file.path);

      if (fileData) {
        const url = URL.createObjectURL(fileData);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${audioFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process audio",
        variant: "destructive",
      });
    }
  };

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
        
        {/* Transport Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="max-w-xs"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsLooping(!isLooping)}
              className={isLooping ? "bg-primary/20" : ""}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setCurrentTime(0);
                if (audioSource.current) {
                  audioSource.current.stop();
                  setIsPlaying(false);
                }
              }}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">
              {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration}
              step={0.1}
              className="flex-1"
              onValueChange={([value]) => {
                setCurrentTime(value);
                if (audioSource.current && isPlaying) {
                  audioSource.current.stop();
                  audioSource.current = audioContext.current!.createBufferSource();
                  audioSource.current.buffer = audioBuffer.current;
                  audioSource.current.loop = isLooping;
                  audioSource.current.connect(audioContext.current!.destination);
                  audioSource.current.start(0, value);
                }
              }}
            />
            <span className="text-sm">
              {Math.floor(duration / 60)}:
              {Math.floor(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('wav')}
              disabled={!audioFile}
            >
              <Download className="h-4 w-4 mr-2" />
              Export WAV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('mp3')}
              disabled={!audioFile}
            >
              <Download className="h-4 w-4 mr-2" />
              Export MP3
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EQ Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Equalizer</h2>
            <EQVisualizer parameters={eqParams} />
            
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(eqParams).map(([band, value]) => (
                <div key={band} className="space-y-2">
                  <label className="parameter-label">
                    {band.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
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
                <span className="parameter-value">
                  {compParams.threshold.toFixed(1)} dB
                </span>
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
                <span className="parameter-value">
                  {compParams.ratio.toFixed(1)}:1
                </span>
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
                  <div 
                    className="meter-bar bg-primary/80 w-full transition-all duration-100"
                    style={{
                      height: `${Math.max(0, Math.min(100, 
                        isPlaying ? 60 - (compParams.threshold * -1) : 0
                      ))}%`
                    }}
                  />
                </div>
                <div className="meter-container">
                  <div 
                    className="meter-bar bg-primary/80 w-full transition-all duration-100"
                    style={{
                      height: `${Math.max(0, Math.min(100, 
                        isPlaying ? 40 - (compParams.threshold * -1) : 0
                      ))}%`
                    }}
                  />
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