import { useState, useRef, useEffect } from 'react';

interface UsePlaybackProps {
  audioContext: React.MutableRefObject<AudioContext | null>;
  audioSource: React.MutableRefObject<AudioBufferSourceNode | null>;
  audioBuffer: React.MutableRefObject<AudioBuffer | null>;
  nodes: {
    lowFilter: BiquadFilterNode | null;
  };
}

export const usePlayback = ({ audioContext, audioSource, audioBuffer, nodes }: UsePlaybackProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playbackTimer = useRef<number | null>(null);

  useEffect(() => {
    const updatePlaybackTime = () => {
      if (isPlaying && audioContext.current) {
        setCurrentTime(prev => {
          const newTime = prev + 0.016;
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

  const handlePlayPause = () => {
    if (!audioBuffer.current || !audioContext.current) return;

    if (isPlaying) {
      audioSource.current?.stop();
      setIsPlaying(false);
    } else {
      audioSource.current = audioContext.current.createBufferSource();
      audioSource.current.buffer = audioBuffer.current;
      audioSource.current.loop = isLooping;
      
      audioSource.current.connect(nodes.lowFilter!);
      
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
      audioSource.current.connect(nodes.lowFilter!);
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

  return {
    isPlaying,
    isLooping,
    currentTime,
    duration,
    setDuration,
    setIsLooping,
    handlePlayPause,
    handleSeek,
    handleRewind,
  };
};