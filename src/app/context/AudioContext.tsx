
"use client";

import { createContext, useContext, useRef, useState, ReactNode } from 'react';

type AudioContextType = {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  togglePlayPause: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <AudioContext.Provider value={{ audioRef, isPlaying, togglePlayPause }}>
      {children}
      <audio ref={audioRef} src="https://icipdrgdl.com/radio" />
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
