'use client';
import AudioVisualizer from "@/app/components/AudioVisualizer";
import { Button } from "@/app/components/ui/button";
import { useAudio } from "@/app/context/AudioContext";
import {
  BookOpen,
  Calendar,
  Heart,
  ListMusic,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share2,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const InfoCard = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
  <Link href={href} className="block bg-[#FBF5E9] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white mb-4 shadow-inner">
        {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </Link>
);

export default function RadioPage() {
  const { isPlaying, togglePlayPause, audioRef } = useAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (audioRef.current && audioRef.current.paused) {
      togglePlayPause();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayPause = () => {
    togglePlayPause();
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const formatTime = (time: number) => {
    if (time === Infinity) return 'En Vivo';
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const onTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    }
  }, [audioRef]);

  const onLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);

      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
    }
  }, [audioRef, onTimeUpdate, onLoadedMetadata]);


  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Heart className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-2xl mb-8">
            <Image 
                src="https://i.imgur.com/m7jgIpR.jpeg" 
                alt="Microphone"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-8">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-white font-semibold text-sm tracking-widest uppercase">EN VIVO</span>
                </div>
                <h1 className="text-white text-4xl md:text-6xl font-bold">PDR Radio</h1>
                <p className="text-white/80 text-lg md:text-xl">Palabra de Restauración</p>
            </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Escúchanos las 24 horas</h2>
            <p className="text-gray-500">Sintonía espiritual para tu vida diaria</p>
          </div>

          <div className="w-full flex justify-center items-center h-12 mb-4">
            <AudioVisualizer />
          </div>

          <div className="relative h-2 bg-gray-200 rounded-full mb-6">
            <div className="absolute h-full bg-[#B88A44] rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
           <div className="flex justify-between text-xs text-gray-500 mb-6 -mt-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-gray-500 hover:text-[#B88A44] rounded-full">
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>

            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={handleRewind} className="text-gray-500 hover:text-[#B88A44] rounded-full">
                    <RotateCcw className="h-7 w-7" />
                </Button>
                <Button
                    size="icon"
                    className="rounded-full w-20 h-20 bg-[#B88A44] hover:bg-amber-600 shadow-lg text-white"
                    onClick={handlePlayPause}
                >
                    {isPlaying ? <Pause className="h-9 w-9" /> : <Play className="h-9 w-9 ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleForward} className="text-gray-500 hover:text-[#B88A44] rounded-full">
                    <RotateCw className="h-7 w-7" />
                </Button>
            </div>
            
            <Button variant="ghost" className="text-gray-500 hover:text-[#B88A44] rounded-full">
                <ListMusic className="h-6 w-6 mr-2" />
                <span className="font-semibold">PROGRAMACIÓN</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard 
            href="/comunidad" 
            icon={<Users className="h-6 w-6 text-[#B88A44]" />} 
            title="Comunidad" 
            description="Únete a nuestra congregación en Nayarit y sé parte del cambio." 
          />
          <InfoCard 
            href="/doctrina" 
            icon={<BookOpen className="h-6 w-6 text-[#B88A44]" />} 
            title="La Palabra" 
            description="Escucha estudios bíblicos y mensajes de esperanza cada hora." 
          />
          <InfoCard 
            href="/eventos" 
            icon={<Calendar className="h-6 w-6 text-[#B88A44]" />} 
            title="Próximos Eventos" 
            description="Mantente informado sobre nuestros retiros y cultos especiales." 
          />
        </div>
      </main>
    </div>
  );
}