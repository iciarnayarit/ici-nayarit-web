
"use client";

import { useEffect, useRef, useState } from 'react';

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio?.addEventListener('play', handlePlay);
    audio?.addEventListener('pause', handlePause);

    return () => {
      audio?.removeEventListener('play', handlePlay);
      audio?.removeEventListener('pause', handlePause);
    };
  }, []);

  return <audio ref={audioRef} src="https://icipdrgdl.com/radio" />;
};

export default AudioPlayer;
