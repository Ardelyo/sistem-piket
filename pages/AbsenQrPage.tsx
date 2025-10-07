


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useNotification } from '../contexts/NotificationContext';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { ArrowPathIcon, BoltIcon, CheckCircleIcon, ExclamationTriangleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';

const SCAN_REGION_ID = "qr-reader";

const AbsenQrPage: React.FC = () => {
    const { addNotification } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'scanning' | 'processing' | 'result'>('loading');
    const [result, setResult] = useState<{ type: 'success' | 'error' | 'info'; message: string; subMessage?: string }>({ type: 'success', message: '' });
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [isManualInputOpen, setIsManualInputOpen] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const lastScanTimeRef = useRef(0);

    const processQrCode = useCallback(async (qrCodeValue: string) => {
        const now = Date.now();
        if (now - lastScanTimeRef.current < 5000) { // 5-second debounce
            addNotification('Harap tunggu 5 detik sebelum scan lagi.', 'info');
            return;
        }
        lastScanTimeRef.current = now;

        if (!user) return;
        setStatus('processing');
        
        try {
            const response = await api.scanPiketQR(qrCodeValue, user.namaLengkap);
             setResult({ 
                type: response.success ? (response.message.includes("selesai piket") ? 'info' : 'success') : 'error', 
                message: response.message, 
                subMessage: (response.data as any)?.status === 'checked_out' ? `Durasi: ${(response.data as any).durasi} menit` : undefined 
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui.";
            setResult({ type: 'error', message: "Validasi Gagal", subMessage: message });
        } finally {
            setStatus('result');
        }
    }, [user, addNotification]);

    const startScanner = useCallback(async (cameraId: string) => {
        if (!html5QrCodeRef.current || html5QrCodeRef.current.isScanning) return;
        
        try {
            await html5QrCodeRef.current.start(
                cameraId,
                { fps: 10, qrbox: { width: 250, height: 250 } },
                processQrCode,
                (errorMessage) => { /* Ignore frequent errors */ }
            );
            setActiveCameraId(cameraId);
        } catch (err) {
            console.error(err);
            addNotification('Gagal memulai kamera. Mohon berikan izin.', 'error');
        }
    }, [addNotification, processQrCode]);
    
    // This effect handles the state transition from 'loading' to 'scanning'
    useEffect(() => {
        if (user && status === 'loading') {
            setStatus('scanning');
        }
    }, [user, status]);

    // This effect initializes the scanner once the component is in the 'scanning' state,
    // ensuring the target DOM element exists.
    useEffect(() => {
        if (status !== 'scanning' || !user) {
            return;
        }

        const qrScanner = new Html5Qrcode(SCAN_REGION_ID, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
        });
        html5QrCodeRef.current = qrScanner;

        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                setCameras(devices);
                const preferredCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
                startScanner(preferredCamera.id);
            }
        }).catch(err => {
            console.error("Error getting cameras:", err);
            addNotification("Tidak dapat menemukan kamera.", "error");
        });
        
        return () => {
             if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, [status, user, startScanner, addNotification]);


    const toggleFlashlight = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                const capabilities = html5QrCodeRef.current.getRunningTrackCameraCapabilities();
                // FIX: Cast capabilities to any to check for the non-standard 'torch' property, resolving a type error.
                if ((capabilities as any)?.torch) {
                    // FIX: Cast video constraints to any to apply the non-standard 'torch' setting, resolving a type error.
                    await html5QrCodeRef.current.applyVideoConstraints({
                        advanced: [{ torch: !isFlashOn }],
                    } as any);
                    setIsFlashOn(!isFlashOn);
                } else {
                    addNotification("Flashlight tidak didukung di kamera ini.", "error");
                }
            } catch (e) {
                addNotification("Gagal mengatur flashlight.", "error");
            }
        }
    };

    const switchCamera = async () => {
        if (cameras.length > 1 && activeCameraId && html5QrCodeRef.current) {
            await html5QrCodeRef.current.stop();
            const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
            const nextIndex = (currentIndex + 1) % cameras.length;
            const nextCameraId = cameras[nextIndex].id;
            await startScanner(nextCameraId);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(manualCode) {
            setIsManualInputOpen(false);
            processQrCode(manualCode);
            setManualCode('');
        }
    }

    if (status === 'loading') return <div className="flex justify-center items-center h-64"><Spinner size="lg" color="border-primary" /></div>;
    
    const getResultIcon = () => {
        switch (result.type) {
            case 'success': return <CheckCircleIcon className="h-20 w-20 text-success mx-auto" />;
            case 'error': return <ExclamationTriangleIcon className="h-20 w-20 text-danger mx-auto" />;
            case 'info': return <CheckCircleIcon className="h-20 w-20 text-blue-500 mx-auto" />;
            default: return null;
        }
    };

    const renderScanner = () => (
        <>
            <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden relative bg-black shadow-lg">
                <div id={SCAN_REGION_ID} className="w-full h-full" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[250px] h-[250px] border-4 border-white/50 rounded-3xl shadow-2xl" />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="secondary" onClick={switchCamera} disabled={cameras.length <= 1}>
                    <ArrowPathIcon className="h-6 w-6 mr-2" /> Ganti Kamera
                </Button>
                 <Button variant="secondary" onClick={toggleFlashlight}>
                    <BoltIcon className={`h-6 w-6 mr-2 ${isFlashOn ? 'text-yellow-400' : ''}`} /> Flash
                </Button>
                <Button variant="secondary" onClick={() => setIsManualInputOpen(true)}>
                    <PencilSquareIcon className="h-6 w-6 mr-2" /> Masukkan Manual
                </Button>
            </div>
        </>
    )

    return (
        <div className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-bold text-primary">Absen Piket QR</h1>
            <p className="text-text-light text-center max-w-md">Arahkan kamera ke QR Code Piket untuk mencatat kehadiran.</p>
            
            {status === 'scanning' && renderScanner()}

            <Modal isOpen={status === 'result'} onClose={() => navigate('/absensi')} title={result.type === 'success' ? 'Berhasil!' : result.type === 'info' ? 'Info' : 'Gagal'}>
                <div className="text-center p-4">
                    {getResultIcon()}
                    <p className="text-xl font-semibold mt-4">{result.message}</p>
                    {result.subMessage && <p className="text-text-light mt-1">{result.subMessage}</p>}
                    <Button className="mt-6 w-full" onClick={() => navigate('/absensi')}>Kembali</Button>
                </div>
            </Modal>
             <Modal isOpen={status === 'processing'} onClose={() => {}} title="Memproses...">
                <div className="flex flex-col items-center justify-center p-8">
                    <Spinner size="lg" color="border-primary" />
                    <p className="mt-4 text-text-light">Memvalidasi dan menyimpan data...</p>
                </div>
            </Modal>
            <Modal isOpen={isManualInputOpen} onClose={() => setIsManualInputOpen(false)} title="Masukkan Kode Manual">
                <form onSubmit={handleManualSubmit}>
                    <p className="text-text-light text-sm mb-2">Ketik kode yang tertera pada QR code.</p>
                    <input 
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        className="w-full p-3 bg-background rounded-xl border border-card"
                        placeholder="Contoh: PIKET-XE8-20240115"
                    />
                    <Button type="submit" className="w-full mt-4">Submit</Button>
                </form>
            </Modal>
        </div>
    );
};

export default AbsenQrPage;