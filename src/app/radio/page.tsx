'use client';
import AudioVisualizer from "@/app/components/AudioVisualizer";
import { Button } from "@/app/components/ui/button";
import { useAudio } from "@/app/context/AudioContext";
import {
  BookOpen,
  Calendar,
  ListMusic,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Users,
  Volume2,
  VolumeX,
  UploadCloud,
  CheckCircle2,
  Music,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const InfoCard = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
  <Link href={href} className="block bg-[#FBF5E9] p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white mb-4 shadow-inner">
      {icon}
    </div>
    <h3 className="text-md sm:text-lg font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-xs sm:text-sm text-gray-600">{description}</p>
  </Link>
);

export default function RadioPage() {
  const { isPlaying, togglePlayPause, audioRef } = useAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload-alabanza', true);

    // Usamos headers para evitar el límite restrictivo de FormData en Next.js App Router
    xhr.setRequestHeader('X-Song-Name', encodeURIComponent(formData.get('songName') as string || 'Desconocido'));
    xhr.setRequestHeader('X-Author', encodeURIComponent(formData.get('author') as string || 'Desconocido'));
    xhr.setRequestHeader('X-File-Name', encodeURIComponent(selectedFile.name));
    xhr.setRequestHeader('X-File-Type', selectedFile.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        let data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          data = {};
        }

        if (data.error) {
          alert('Error: ' + data.error);
        } else {
          // Éxito
          setUploadSuccess(true);
          form.reset();
          setSelectedFile(null);
          setUploadProgress(0);

          // Resetear vista del form después de 5 segundos
          setTimeout(() => setUploadSuccess(false), 5000);
        }
      } else {
        alert('Hubo un error al enviar tu alabanza. Verifica tu conexión o intenta más tarde.');
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      alert('Hubo un error de red al enviar tu alabanza.');
    };

    // Enviamos el File crudo (raw blob) en vez de FormData
    xhr.send(selectedFile);
  };

  useEffect(() => {
    if (isPlaying && !hasStarted) {
      setHasStarted(true);
    }
  }, [isPlaying, hasStarted]);

  const pingColor = isPlaying ? "bg-green-400" : hasStarted ? "bg-orange-400" : "bg-red-400";
  const staticColor = isPlaying ? "bg-green-500" : hasStarted ? "bg-orange-500" : "bg-red-500";

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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12">
        <div className="relative h-56 sm:h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-2xl mb-8">
          <Image
            src="https://i.imgur.com/m7jgIpR.jpeg"
            alt="Microphone"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4 sm:p-8">
            <div className="flex items-center space-x-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${staticColor}`}></span>
              </span>
              <span className="text-white font-semibold text-sm tracking-widest uppercase">EN VIVO</span>
            </div>
            <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-bold">PDR Radio</h1>
            <p className="text-white/80 text-md sm:text-lg md:text-xl">Palabra de Restauración</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Escúchanos las 24 horas</h2>
            <p className="text-gray-500 text-sm sm:text-base">Sintonía espiritual para tu vida diaria</p>
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
              {isMuted ? <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" /> : <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="icon" onClick={handleRewind} className="text-gray-500 hover:text-[#B88A44] rounded-full">
                <RotateCcw className="h-6 w-6 sm:h-7 sm:w-7" />
              </Button>
              <Button
                size="icon"
                className="rounded-full w-16 h-16 sm:w-20 sm:h-20 bg-[#B88A44] hover:bg-amber-600 shadow-lg text-white"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="h-8 w-8 sm:h-9 sm:w-9" /> : <Play className="h-8 w-8 sm:h-9 sm:w-9 ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleForward} className="text-gray-500 hover:text-[#B88A44] rounded-full">
                <RotateCw className="h-6 w-6 sm:h-7 sm:w-7" />
              </Button>
            </div>

            <Button variant="ghost" className="text-gray-500 hover:text-[#B88A44] rounded-full px-2 sm:px-4">
              <ListMusic className="h-5 w-5 sm:h-6 sm:w-6 lg:mr-2" />
              <span className="font-semibold hidden lg:inline">PROGRAMACIÓN</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

        {/* --- NUEVA SECCIÓN DE UPLOAD --- *
        <div className="mt-8 sm:mt-12 bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-[#FBF5E9] rounded-full mb-4">
              <Music className="h-8 w-8 text-[#B88A44]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 font-display">Comparte tu Alabanza</h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              ¿Tienes una alabanza en formato MP3 o MP4 que te gustaría escuchar en nuestra estación?
              Envíala y la programaremos.
            </p>
          </div>

          {uploadSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">¡Archivo Recibido!</h3>
              <p className="text-green-600">
                Gracias por compartir. Tu alabanza ha sido enviada exitosamente.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Canción</label>
                  <input required name="songName" type="text" placeholder="Ej. Cuan Grande es Él" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#B88A44] focus:border-transparent outline-none transition-all text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Autor / Ministerio</label>
                  <input required name="author" type="text" placeholder="Ej. En Espíritu y en Verdad" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#B88A44] focus:border-transparent outline-none transition-all text-gray-800" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Archivo (MP3 o MP4)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                  <input required name="file" type="file" onChange={handleFileChange} accept=".mp3,audio/mpeg,.mp4,video/mp4,audio/mp4" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {selectedFile ? (
                    <div className="flex flex-col items-center justify-center">
                      <Music className="h-10 w-10 text-[#B88A44] mb-3" />
                      <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-[#B88A44] mt-2 underline font-medium">
                        Haz clic o arrastra para cambiar
                      </p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-3 group-hover:text-[#B88A44] transition-colors" />
                      <p className="text-sm text-gray-600 font-medium">Haz clic aquí o arrastra tu archivo</p>
                      <p className="text-xs text-gray-400 mt-1">Máximo 20 MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4">
                {isUploading && uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Subiendo archivo...</span>
                      <span className="font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-[#B88A44] h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="w-full bg-[#1A2530] hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2530] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5 mr-2" />
                      Enviar Alabanza
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        */}
      </main>
    </div>
  );
}
