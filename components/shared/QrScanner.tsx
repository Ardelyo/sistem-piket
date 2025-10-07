
import React, { useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure: (error: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onScanFailure }) => {
  useEffect(() => {
    const qrScanner = new Html5Qrcode('qr-reader');

    const startScanner = async () => {
      try {
        await qrScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          onScanSuccess,
          (errorMessage) => { 
            // This is called frequently, so we don't call onScanFailure here to avoid spamming.
            // onScanFailure should be for actual errors.
          }
        );
      } catch (err) {
        let errorMessage = 'Gagal memulai kamera.';
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorMessage = 'Izin kamera ditolak. Mohon aktifkan di pengaturan browser.';
          } else {
            errorMessage = err.message;
          }
        }
        onScanFailure(errorMessage);
      }
    };
    
    // Check scanner state before starting
    if (qrScanner.getState() === Html5QrcodeScannerState.NOT_STARTED) {
       startScanner();
    }
    
    return () => {
      // Ensure scanner is stopped only if it's running
      if (qrScanner.isScanning) {
        qrScanner.stop().catch(err => {
          console.error("Gagal menghentikan scanner.", err);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="qr-reader" className="w-full h-full"></div>;
};

export default QrScanner;
