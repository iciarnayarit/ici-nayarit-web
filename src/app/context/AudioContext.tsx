
"use client";

import { createContext, useContext, useRef, useState, ReactNode, useEffect } from 'react';

type AudioContextType = {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  togglePlayPause: () => void;
  analyser: AnalyserNode | null;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      setAnalyser(analyserNode);

      audioRef.current.onplay = () => {
        audioContext.resume();
        setIsPlaying(true);
      };

      audioRef.current.onpause = () => {
        setIsPlaying(false);
      };
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <AudioContext.Provider value={{ audioRef, isPlaying, togglePlayPause, analyser }}>
      {children}
      <audio ref={audioRef} src="https://icipdrgdl.com/radio" crossOrigin="anonymous" />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
