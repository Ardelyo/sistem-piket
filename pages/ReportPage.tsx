import React, { useState, useEffect, useMemo, Fragment } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { api } from '../services/api';
import type { Laporan, ProfileData } from '../types';
import Skeleton from '../components/ui/Skeleton';
import { 
    StarIcon, CheckIcon, CalendarIcon, TrophyIcon, SparklesIcon,
    DocumentMagnifyingGlassIcon, XMarkIcon, MinusIcon, TrashIcon,
    RectangleGroupIcon, TvIcon, PhotoIcon
} from '@heroicons/react/24/solid';

const ALL_TASKS = [
    'Sapu lantai depan', 'Sapu lantai belakang', 'Pel lantai', 'Buang sampah kelas', 
    'Buang sampah ke TPS', 'Hapus papan tulis', 'Rapikan meja guru', 'Rapikan meja siswa', 
    'Tutup jendela', 'Matikan lampu', 'Kunci pintu'
];

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <Card className="text-center">
        <Icon className="h-8 w-8 text-accent mx-auto mb-2"/>
        <p className="text-sm text-text-light">{title}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
    </Card>
);

const RatingProgressBar: React.FC<{ label: string, rating: number, icon: React.ElementType }> = ({ label, rating, icon: Icon }) => (
    <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-text-light flex-shrink-0"/>
        <div className="flex-grow">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{label}</span>
                <span className="font-semibold text-primary">{rating}/5</span>
            </div>
            <div className="w-full bg-background rounded-full h-2.5">
                <div className="bg-accent h-2.5 rounded-full" style={{ width: `${(rating / 5) * 100}%` }}></div>
            </div>
        </div>
    </div>
);

const ReportCard: React.FC<{ report: Laporan, onImageClick: (url: string) => void }> = ({ report, onImageClick }) => {
    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-success bg-green-100';
        if (rating >= 3.0) return 'text-yellow-600 bg-yellow-100';
        return 'text-danger bg-red-100';
    };

    const generateXpBreakdown = (r: Laporan): string => {
        const completedTasks = Object.values(r.tasks).filter(Boolean).length;
        const baseXp = 20;
        const taskXp = completedTasks * 4;
        const photoXp = r.fotoBukti.length > 0 ? 15 : 0;
        const ratingBonus = Math.max(0, Math.round((r.avgRating - 3.5) * 10));
        return `+${baseXp} Tepat Waktu, +${taskXp} Tugas, +${photoXp} Foto, +${ratingBonus} Rating Bagus`;
    };

    const ratingIcons = {
        lantai: RectangleGroupIcon,
        papanTulis: TvIcon,
        meja: TrophyIcon,
        sampah: TrashIcon
    };

    return (
        <Card className="space-y-4 !p-4 sm:!p-6 !rounded-3xl">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-card">
                <div>
                    <p className="text-sm text-text-light">Laporan Piket</p>
                    <h2 className="text-xl font-bold text-primary">{new Date(report.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                </div>
                <div className={`px-3 py-1 text-sm font-semibold rounded-full ${report.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {report.status === 'submitted' ? 'Terkirim' : 'Draft'}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Ratings & Checklist */}
                <div className="space-y-6">
                    {/* Ratings */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-primary">Penilaian Kebersihan</h3>
                            <div className={`text-2xl font-bold px-4 py-2 rounded-xl flex items-center gap-2 ${getRatingColor(report.avgRating)}`}>
                               {report.avgRating.toFixed(1)} <StarIcon className="h-6 w-6"/>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(report.rating).map(([key, value]) => (
                                <RatingProgressBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace('papanTulis', 'Papan Tulis')} rating={value} icon={ratingIcons[key as keyof typeof ratingIcons]}/>
                            ))}
                        </div>
                    </div>
                    {/* Checklist */}
                    <div>
                        <h3 className="font-semibold text-primary mb-2">Checklist Tugas</h3>
                        <ul className="grid grid-cols-2 gap-2 text-sm">
                            {ALL_TASKS.map(task => (
                                <li key={task} className={`flex items-center ${!report.tasks[task] ? 'text-text-light' : ''}`}>
                                    {report.tasks[task] ? <CheckIcon className="h-4 w-4 text-success mr-2 flex-shrink-0" /> : <MinusIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />}
                                    {task}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: Photos, Feedback, XP */}
                <div className="space-y-6">
                     {/* Photos */}
                    <div>
                        <h3 className="font-semibold text-primary mb-2">Dokumentasi Foto</h3>
                        {report.fotoBukti.length > 0 ? (
                             <div className="grid grid-cols-2 gap-2">
                                {report.fotoBukti.map((foto, index) => (
                                    <button key={index} onClick={() => onImageClick(foto)} className="aspect-video block w-full h-full rounded-lg overflow-hidden transition transform hover:scale-105">
                                        <img src={foto} alt={`bukti ${index+1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center bg-background rounded-lg p-6">
                                <PhotoIcon className="h-10 w-10 text-text-light/50" />
                                <p className="text-sm text-text-light mt-2">Tidak ada foto dilampirkan.</p>
                            </div>
                        )}
                    </div>
                    {/* Feedback */}
                    <div>
                        <h3 className="font-semibold text-primary mb-2">Feedback Admin</h3>
                        <div className="bg-accent/10 p-4 rounded-xl relative">
                             <p className="text-text-light italic text-sm">"{report.catatan || 'Tidak ada catatan khusus dari admin.'}"</p>
                        </div>
                    </div>
                     {/* XP */}
                    <div>
                        <h3 className="font-semibold text-primary mb-2">XP Diperoleh</h3>
                        <div className="bg-green-100 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-green-700">{generateXpBreakdown(report)}</p>
                                <p className="text-xl font-bold text-green-800">+{report.xp} XP</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-right text-xs text-text-light pt-3 border-t border-card">
                Dinilai oleh: <strong>{report.verifiedBy}</strong>
            </div>
        </Card>
    );
};

const Lightbox: React.FC<{ imageUrl: string | null, onClose: () => void }> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh]">
                 <img src={imageUrl} alt="Tampilan Penuh" className="max-w-full max-h-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
                <button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};


const ReportPage: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [reports, setReports] = useState<Laporan[]>([]);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>('all');

    useEffect(() => {
        if (!user) return;
        const fetchReports = async () => {
            try {
                setIsLoading(true);
                const [data, profile] = await Promise.all([
                    api.getLaporanForStudent(user.namaLengkap),
                    api.getProfileData(user.namaLengkap)
                ]);
                setReports(data);
                setProfileData(profile);
            } catch (error) {
                addNotification("Gagal memuat data laporan", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, [user, addNotification]);

    const monthOptions = useMemo(() => {
        const months = new Set<string>();
        reports.forEach(r => {
            const monthYear = new Date(r.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
            months.add(monthYear);
        });
        return Array.from(months);
    }, [reports]);

    const filteredReports = useMemo(() => {
        if (selectedMonth === 'all') return reports;
        return reports.filter(r => {
            const reportMonth = new Date(r.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
            return reportMonth === selectedMonth;
        });
    }, [reports, selectedMonth]);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-16 w-3/4 mx-auto rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-24 w-full rounded-3xl" />
                    <Skeleton className="h-24 w-full rounded-3xl" />
                    <Skeleton className="h-24 w-full rounded-3xl" />
                </div>
                <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-block p-4 bg-accent/10 rounded-full">
                    <DocumentMagnifyingGlassIcon className="h-12 w-12 text-accent"/>
                </div>
                <h1 className="text-4xl font-bold text-primary">Laporan Piketmu</h1>
                <p className="text-text-light max-w-xl mx-auto">Disini kamu bisa melihat semua hasil penilaian piket yang telah diverifikasi oleh admin.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Laporan" value={profileData?.personalStats.totalPiket || 0} icon={CalendarIcon} />
                <StatCard title="Rating Rata-rata" value={profileData?.personalStats.avgRating.toFixed(1) || 'N/A'} icon={StarIcon} />
                <StatCard title="Total XP Laporan" value={profileData?.student.xp || 0} icon={SparklesIcon} />
            </div>
            
            <Card className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">Riwayat Laporan</h2>
                 <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 bg-background rounded-lg border border-card text-sm">
                    <option value="all">Semua Bulan</option>
                    {monthOptions.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
            </Card>

            {filteredReports.length > 0 ? (
                <div className="space-y-6">
                    {filteredReports.map(report => <ReportCard key={report.id} report={report} onImageClick={setLightboxImageUrl} />)}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <h3 className="text-2xl font-semibold text-primary">Belum Ada Laporan</h3>
                    <p className="text-text-light mt-2">Admin belum membuat laporan penilaian untukmu di bulan ini. <br/>Terus semangat piketnya!</p>
                </Card>
            )}

            <Lightbox imageUrl={lightboxImageUrl} onClose={() => setLightboxImageUrl(null)} />
        </div>
    );
};

export default ReportPage;