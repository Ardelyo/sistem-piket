import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/solid';
import Modal from '../components/ui/Modal';

// Declare global variables from CDN scripts
declare const QRious: any;

// Function to format date as YYYYMMDD
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

const GenerateQrPage: React.FC = () => {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [qrImageSrc, setQrImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'download' | 'print' | null>(null);

    useEffect(() => {
        setIsLoading(true);
        if (!date) return;
        
        const formattedDate = formatDate(new Date(date));
        const validationString = `PIKET-XE8-${formattedDate}`;
        setQrValue(validationString);

    }, [date]);

    useEffect(() => {
        if (!qrValue) {
            return;
        }

        const canvas = document.createElement('canvas');
        new QRious({
            element: canvas,
            value: qrValue,
            size: 400,
            padding: 25,
            level: 'H',
            foreground: '#000000', // Pure black
            background: '#FFFFFF', // Pure white
        });
        setQrImageSrc(canvas.toDataURL('image/png'));
        setIsLoading(false);

    }, [qrValue]);
    
    const handleDownload = () => {
        if(qrImageSrc) {
            const link = document.createElement('a');
            link.download = `QR_Piket_${date}.png`;
            link.href = qrImageSrc;
            link.click();
        }
    };
    
    const handlePrint = () => {
         if(qrImageSrc) {
            const dataUrl = qrImageSrc;
            const windowContent = `
                <!DOCTYPE html>
                <html>
                    <head><title>Print QR Code Piket X-E8</title></head>
                    <body style="text-align: center; font-family: sans-serif;">
                        <h2>QR Code Absensi Piket X-E8</h2>
                        <h3>Tanggal: ${new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                        <p>Harap scan QR code ini untuk absen masuk dan keluar piket.</p>
                        <img src="${dataUrl}" style="width: 80%; max-width: 500px; margin-top: 20px;" />
                        <p style="margin-top: 10px; font-family: monospace;">${qrValue}</p>
                    </body>
                </html>
            `;
            const printWin = window.open('', '', 'width=800,height=600');
            printWin?.document.write(windowContent);
            printWin?.document.close();
            printWin?.focus();
            printWin?.print();
            printWin?.close();
         }
    };
    
    const handleDownloadClick = () => {
        setModalAction('download');
        setIsModalOpen(true);
    };

    const handlePrintClick = () => {
        setModalAction('print');
        setIsModalOpen(true);
    };

    const handleConfirmAction = () => {
        if (modalAction === 'download') handleDownload();
        if (modalAction === 'print') handlePrint();
        setIsModalOpen(false);
        setModalAction(null);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
                 <h1 className="text-3xl font-bold text-primary">Generate QR Code Piket</h1>
                 <p className="text-text-light mt-1">Buat QR code harian untuk absensi siswa.</p>
            </div>

            <Card>
                <div className="mb-4">
                    <label htmlFor="qr-date" className="block text-sm font-medium text-text-light mb-1">Pilih Tanggal</label>
                    <input
                        type="date"
                        id="qr-date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 bg-background rounded-xl border border-card focus:ring-accent focus:border-accent"
                    />
                </div>
                 <div className="text-center bg-background p-2 rounded-xl text-sm">
                    QR Code ini hanya akan valid untuk tanggal: <strong className="text-primary">{new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
            </Card>
            
            <Card className="flex flex-col items-center justify-center p-8">
                {isLoading || !qrImageSrc ? (
                    <div className="h-[400px] w-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>
                ) : (
                    <>
                        <img src={qrImageSrc} alt={`QR Code for ${date}`} className="rounded-lg w-full max-w-[400px] h-auto" />
                        <p className="mt-4 text-center font-semibold text-text-light">QR Code Piket Tanggal: {new Date(date + 'T00:00:00').toLocaleDateString('id-ID')}</p>
                    </>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button size="lg" onClick={handleDownloadClick} variant="secondary" disabled={isLoading}>
                    <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
                    Download PNG
                </Button>
                <Button size="lg" onClick={handlePrintClick} disabled={isLoading}>
                    <PrinterIcon className="h-6 w-6 mr-2" />
                    Print
                </Button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Konfirmasi ${modalAction === 'download' ? 'Unduh' : 'Cetak'}`}
            >
                <div className="text-center">
                    <p className="text-text-light mb-6">
                        Pastikan tanggal yang dipilih sudah benar sebelum melanjutkan. 
                        QR Code ini hanya berlaku untuk tanggal tersebut.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                        <Button onClick={handleConfirmAction}>Lanjutkan</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GenerateQrPage;
