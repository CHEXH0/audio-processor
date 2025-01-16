import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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
  const playbackTimer = useRef<number | null>(null);

  // Audio processing nodes
  const lowFilter = useRef<BiquadFilterNode | null>(null);
  const lowMidFilter = useRef<BiquadFilterNode | null>(null);
  const highMidFilter = useRef<BiquadFilterNode | null>(null);
  const highFilter = useRef<BiquadFilterNode | null>(null);
  const compressor = useRef<DynamicsCompressorNode | null>(null);

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

  // Initialize audio context and nodes
  useEffect(() => {
    audioContext.current = new AudioContext();
    
    // Create filters
    lowFilter.current = audioContext.current.createBiquadFilter();
    lowFilter.current.type = 'lowshelf';
    lowFilter.current.frequency.value = 320;

    lowMidFilter.current = audioContext.current.createBiquadFilter();
    lowMidFilter.current.type = 'peaking';
    lowMidFilter.current.frequency.value = 1000;
    lowMidFilter.current.Q.value = 1;

    highMidFilter.current = audioContext.current.createBiquadFilter();
    highMidFilter.current.type = 'peaking';
    highMidFilter.current.frequency.value = 3200;
    highMidFilter.current.Q.value = 1;

    highFilter.current = audioContext.current.createBiquadFilter();
    highFilter.current.type = 'highshelf';
    highFilter.current.frequency.value = 10000;

    // Create compressor
    compressor.current = audioContext.current.createDynamicsCompressor();

    // Connect nodes
    lowFilter.current
      .connect(lowMidFilter.current)
      .connect(highMidFilter.current)
      .connect(highFilter.current)
      .connect(compressor.current)
      .connect(audioContext.current.destination);

    return () => {
      if (playbackTimer.current) {
        cancelAnimationFrame(playbackTimer.current);
      }
      audioContext.current?.close();
    };
  }, []);

  // Update EQ parameters
  useEffect(() => {
    if (!audioContext.current) return;

    lowFilter.current!.gain.value = eqParams.low;
    lowMidFilter.current!.gain.value = eqParams.lowMid;
    highMidFilter.current!.gain.value = eqParams.highMid;
    highFilter.current!.gain.value = eqParams.high;
  }, [eqParams]);

  // Update compressor parameters
  useEffect(() => {
    if (!compressor.current) return;

    compressor.current.threshold.value = compParams.threshold;
    compressor.current.ratio.value = compParams.ratio;
    compressor.current.attack.value = compParams.attack / 1000; // Convert to seconds
    compressor.current.release.value = compParams.release / 1000; // Convert to seconds
  }, [compParams]);

  // Update timer during playback
  useEffect(() => {
    const updatePlaybackTime = () => {
      if (isPlaying && audioContext.current) {
        setCurrentTime(prev => {
          const newTime = prev + 0.016; // Approximately 60fps
          if (newTime >= duration) {
            if (isLooping) {
              handleSeek(0);
              return 0;
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          return newTime;
        });
        playbackTimer.current = requestAnimationFrame(updatePlaybackTime);
      }
    };

    if (isPlaying) {
      playbackTimer.current = requestAnimationFrame(updatePlaybackTime);
    } else if (playbackTimer.current) {
      cancelAnimationFrame(playbackTimer.current);
    }

    return () => {
      if (playbackTimer.current) {
        cancelAnimationFrame(playbackTimer.current);
      }
    };
  }, [isPlaying, duration, isLooping]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.current!.decodeAudioData(arrayBuffer);
      audioBuffer.current = buffer;
      setDuration(buffer.duration);
      setCurrentTime(0);
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
      
      // Connect through the processing chain
      audioSource.current.connect(lowFilter.current!);
      
      audioSource.current.start(0, currentTime);
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (isPlaying) {
      audioSource.current?.stop();
      audioSource.current = audioContext.current!.createBufferSource();
      audioSource.current.buffer = audioBuffer.current;
      audioSource.current.loop = isLooping;
      audioSource.current.connect(lowFilter.current!);
      audioSource.current.start(0, time);
    }
  };

  const handleRewind = () => {
    if (audioSource.current && isPlaying) {
      audioSource.current.stop();
    }
    setCurrentTime(0);
    setIsPlaying(false);
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
      console.error('Export error:', error);
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
            onSeek={handleSeek}
            onRewind={handleRewind}
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