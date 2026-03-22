'use client';

import { useAudio } from '@/app/context/AudioContext';
import { useEffect, useRef } from 'react';

const AudioVisualizer = () => {
  const { analyser, isPlaying } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // Usar solo el 70% de las frecuencias (las partes altas suelen estar vacías)
      const visibleBars = Math.floor(bufferLength * 0.7);
      const barWidth = canvas.width / visibleBars;
      let x = 0;

      const activeBars = dataArray.filter((d, i) => i < visibleBars && d > 0).length;
      const scaleFactor = isPlaying ? Math.max(0.5, 1 - (activeBars / visibleBars)) : 1;

      for (let i = 0; i < visibleBars; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * scaleFactor;

        canvasCtx.fillStyle = '#B88A44'; // Gold color to match the design
        canvasCtx.fillRect(
          x,
          canvas.height - barHeight,
          Math.max(1, barWidth - 1),
          barHeight
        );

        x += barWidth;
      }
    };

    if (isPlaying) {
      draw();
    } else {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default AudioVisualizer;