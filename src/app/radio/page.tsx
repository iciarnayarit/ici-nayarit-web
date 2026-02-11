"use client";
import AudioVisualizer from "@/app/components/AudioVisualizer";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { useAudio } from "@/app/context/AudioContext";
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";

export default function RadioPage() {
  const { isPlaying, togglePlayPause, audioRef } = useAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (!isPlaying) {
      togglePlayPause();
    }
  }, [isPlaying, togglePlayPause]);

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newVolume = parseFloat(e.target.value);
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
        setVolume(audioRef.current.volume);
        setIsMuted(audioRef.current.muted);
    }
  }, [audioRef]);


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h2 className="text-2xl font-bold">PDR Radio</h2>
              <p className="text-gray-500">Presbiterio Pacífico del Norte</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </span>
              <span className={`${isPlaying ? 'text-green-500' : 'text-gray-500'} font-semibold`}>
                {isPlaying ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="text-center text-gray-500 mb-4">
            <a href="https://icipdrgdl.com/" target="_blank" rel="noopener noreferrer">
              <div className="rounded-lg overflow-hidden mb-4">
                <Image src="https://i.imgur.com/m7jgIpR.jpeg" alt="Radio Logo" width={400} height={250} className="w-full" />
              </div>
            </a>
            Escuchanos las 24 horas
          </div>

          <div className="flex justify-center items-center mb-4">
            <AudioVisualizer />
          </div>

          <div className="flex justify-center items-center space-x-4 mb-4">
            <Button variant="ghost" size="icon">
              <FastForwardIcon className="h-6 w-6 transform scale-x-[-1]" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-blue-500 hover:bg-blue-600"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <PauseIcon className="h-8 w-8" />
              ) : (
                <PlayIcon className="h-8 w-8" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <FastForwardIcon className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeXIcon className="h-5 w-5" />
              ) : (
                <Volume2Icon className="h-5 w-5" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
