
"use client";

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

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        canvasCtx.fillStyle = '#007bff';
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} width="300" height="100" />;
};

export default AudioVisualizer;
