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

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      const activeBars = dataArray.filter(d => d > 0).length;
      const scaleFactor = isPlaying ? Math.max(0.5, 1 - (activeBars / bufferLength)) : 1;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 2) * scaleFactor;

        canvasCtx.fillStyle = '#B88A44'; // Gold color to match the design
        canvasCtx.fillRect(
          x,
          canvas.height - barHeight,
          barWidth,
          barHeight
        );

        x += barWidth + 2;
      }
    };

    if (isPlaying) {
      draw();
    } else {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} width="300" height="80" />;
};

export default AudioVisualizer;