import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import EQVisualizer from './EQVisualizer';
import TransportControls from './audio/TransportControls';
import FileControls from './audio/FileControls';
import CompressorControls from './audio/CompressorControls';

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
        <div className="mb-8">
          <TransportControls
            isPlaying={isPlaying}
            isLooping={isLooping}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onLoopToggle={() => setIsLooping(!isLooping)}
            onSeek={(time) => {
              setCurrentTime(time);
              if (audioSource.current && isPlaying) {
                audioSource.current.stop();
                audioSource.current = audioContext.current!.createBufferSource();
                audioSource.current.buffer = audioBuffer.current;
                audioSource.current.loop = isLooping;
                audioSource.current.connect(audioContext.current!.destination);
                audioSource.current.start(0, time);
              }
            }}
            onRewind={() => {
              setCurrentTime(0);
              if (audioSource.current) {
                audioSource.current.stop();
                setIsPlaying(false);
              }
            }}
          />
        </div>

        {/* File Controls */}
        <div className="mb-8">
          <FileControls
            onFileChange={handleFileChange}
            onExport={handleExport}
            hasAudioFile={!!audioFile}
          />
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
          <CompressorControls
            parameters={compParams}
            onParameterChange={handleCompChange}
            isPlaying={isPlaying}
          />
        </div>
      </Card>
    </div>
  );
};

export default VST;