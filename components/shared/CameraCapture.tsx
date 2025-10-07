import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { CameraIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      stopCamera(); // Ensure any previous stream is stopped before starting a new one.
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = 'Gagal mengakses kamera. Mohon izinkan akses di browser Anda.';
      if(err instanceof Error && err.name === 'NotFoundError') {
        message = 'Kamera tidak ditemukan. Pastikan perangkat memiliki kamera depan.';
      }
      setError(message);
      addNotification(message, 'error');
    }
  }, [addNotification, stopCamera]);
  
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for selfie view
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset transform for overlay
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        // Add overlay
        const timestamp = new Date().toLocaleString('id-ID');
        context.font = 'bold 32px Inter, sans-serif';
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.textAlign = 'left';
        context.fillText('PIKET KELAS X-E8', 30, 50);
        context.font = '24px Inter, sans-serif';
        context.fillText(timestamp, 30, 90);

        // Simulate face detection by analyzing image properties to ensure a face is likely present.
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightnessSum = 0;
        let rSum = 0, gSum = 0, bSum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          brightnessSum += (r + g + b) / 3;
          rSum += r;
          gSum += g;
          bSum += b;
        }

        const pixelCount = data.length / 4;
        const avgBrightness = brightnessSum / pixelCount;

        // Check 1: Image is not too dark or too bright.
        if (avgBrightness < 30 || avgBrightness > 225) {
          addNotification('Pencahayaan buruk. Pastikan wajah terlihat jelas.', 'error');
          return;
        }
        
        // Check 2: Image has enough color variance and is not a monochrome picture (like a wall).
        const avgR = rSum / pixelCount;
        const avgG = gSum / pixelCount;
        const avgB = bSum / pixelCount;
        let varianceSum = 0;
        for (let i = 0; i < data.length; i += 4) {
            varianceSum += Math.pow(data[i] - avgR, 2);
            varianceSum += Math.pow(data[i+1] - avgG, 2);
            varianceSum += Math.pow(data[i+2] - avgB, 2);
        }
        const stdDev = Math.sqrt(varianceSum / (pixelCount * 3));
        
        if (stdDev < 18) { 
            addNotification('Wajah tidak terdeteksi. Hindari latar belakang yang terlalu monoton.', 'error');
            return;
        }

        const compressedImage = canvas.toDataURL('image/jpeg', 0.7); // Compress to 70% quality
        onCapture(compressedImage);
        stopCamera();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-white text-center p-4">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
            <div className="absolute top-4 left-4 text-white font-bold text-shadow">
              <p className="text-lg">PIKET KELAS X-E8</p>
              <p className="text-sm">{new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <div className="absolute inset-0 border-4 border-white/50 rounded-lg pointer-events-none" />
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-4 flex items-center space-x-4">
        <Button variant="secondary" onClick={onClose}><XMarkIcon className="h-6 w-6 mr-2"/>Tutup</Button>
        {error ? (
          <Button onClick={startCamera}><ArrowPathIcon className="h-6 w-6 mr-2"/>Coba Lagi</Button>
        ) : (
          <Button onClick={handleCapture}><CameraIcon className="h-6 w-6 mr-2"/>Ambil Foto</Button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
