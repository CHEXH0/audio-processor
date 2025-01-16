import { useState } from 'react';

export const useAudioState = () => {
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

  const [eqBypassed, setEqBypassed] = useState(false);
  const [compBypassed, setCompBypassed] = useState(false);

  return {
    playbackState: {
      isPlaying,
      setIsPlaying,
      isLooping,
      setIsLooping,
      currentTime,
      setCurrentTime,
      duration,
      setDuration,
      audioFile,
      setAudioFile
    },
    processingState: {
      eqParams,
      setEqParams,
      compParams,
      setCompParams,
      eqBypassed,
      setEqBypassed,
      compBypassed,
      setCompBypassed
    }
  };
};