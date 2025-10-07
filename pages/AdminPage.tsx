




import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { AdminDashboardStats, Laporan, Absensi, Schedule } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useNotification } from '../contexts/NotificationContext';
import { useRealtimeData } from '../App';
import { ClockIcon, CheckCircleIcon, XCircleIcon, StarIcon, Cog6ToothIcon, QrCodeIcon, DocumentTextIcon, ChartPieIcon } from '@heroicons/react/24/solid';
import AdminReportList from './admin/AdminReportList';

// Declare global variables from CDN scripts
declare const XLSX: any;
declare const jspdf: any;
declare const JSZip: any;

const AdminStatCard: React.FC<{ title: string, value: string | number, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <Card className="p-4 flex items-center space-x-4">
        <Icon className="h-8 w-8 text-accent"/>
        <div>
            <p className="text-sm text-text-light">{title}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
        </div>
    </Card>
);

const TABS = [
    { name: 'Dashboard', icon: ChartPieIcon },
    { name: 'Daftar Laporan', icon: DocumentTextIcon },
    { name: 'Riwayat Absen', icon: ClockIcon },
    { name: 'Tools', icon: Cog6ToothIcon },
];

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(TABS[0].name);
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    
    // Data states
    const { absensiToday, loading: realtimeLoading } = useRealtimeData();
    const [absensiLog, setAbsensiLog] = useState<Absensi[]>([]);
    const [laporan, setLaporan] = useState<Laporan[]>([]);
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOtherData = async () => {
          try {
            setLoading(true);
            const [allAbsensi, allLaporan, scheduleData] = await Promise.all([
              api.getAbsensiLog(), // Fetch full log for history tab
              api.getAllLaporan(),
              api.getSchedule(),
            ]);
            setAbsensiLog(allAbsensi);
            setLaporan(allLaporan);
            setSchedule(scheduleData);
          } catch(e) {
            addNotification("Gagal memuat data admin tambahan", "error");
          } finally {
            setLoading(false);
          }
        };
        fetchOtherData();
    }, [addNotification]);

    const stats = useMemo<AdminDashboardStats>(() => {
        if (!schedule) return { totalPiketHariIni: 0, siswaSudahPiket: 0, siswaBelumPiket: 0, avgRatingHariIni: 0 };
        
        const today = new Date();
        const dayMap: { [key: string]: string } = { 'Sunday': 'Minggu', 'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu', 'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu' };
        const todayIndonesian = dayMap[today.toLocaleDateString('en-US', { weekday: 'long' })];

        const studentsOnDuty = schedule[todayIndonesian] || [];
        const totalPiketHariIni = studentsOnDuty.length;
        
        const uniqueSiswaSudahPiket = new Set(absensiToday.map(a => a.nama));
        const siswaSudahPiket = uniqueSiswaSudahPiket.size;
        const siswaBelumPiket = totalPiketHariIni - siswaSudahPiket;

        const todayStr = today.toISOString().split('T')[0];
        const laporanHariIni = laporan.filter(l => l.tanggal === todayStr);
        const avgRatingHariIni = laporanHariIni.length > 0
            ? laporanHariIni.reduce((acc, l) => acc + l.avgRating, 0) / laporanHariIni.length
            : 0;
            
        return { totalPiketHariIni, siswaSudahPiket, siswaBelumPiket, avgRatingHariIni };
    }, [absensiToday, laporan, schedule]);
    
    const renderContent = () => {
        const pageLoading = loading || realtimeLoading;
        if (pageLoading && activeTab !== 'Daftar Laporan') {
            return <div className="space-y-4"><Skeleton className="h-28 w-full rounded-3xl"/><Skeleton className="h-80 w-full rounded-3xl"/><Skeleton className="h-80 w-full rounded-3xl"/></div>
        }
        
        switch (activeTab) {
            case 'Dashboard':
                 return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats && <>
                            <AdminStatCard title="Total Piket Hari Ini" value={stats.totalPiketHariIni} icon={ClockIcon} />
                            <AdminStatCard title="Sudah Piket" value={stats.siswaSudahPiket} icon={CheckCircleIcon} />
                            <AdminStatCard title="Belum Piket" value={stats.siswaBelumPiket} icon={XCircleIcon}/>
                            <AdminStatCard title="Rating Rata-rata" value={stats.avgRatingHariIni.toFixed(1)} icon={StarIcon} />
                        </>}
                        </div>
                        <Card>
                            <h3 className="font-bold text-lg mb-4 text-primary">Live Absensi Hari Ini</h3>
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-background"><tr>{['Nama', 'Jam Masuk', 'Jam Keluar', 'Durasi (m)'].map(h => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
                                    <tbody>
                                    {absensiToday.map(log => (
                                        <tr key={log.id} className="border-b border-card hover:bg-card/50">
                                            <td className="p-3 font-semibold">{log.nama}</td>
                                            <td className="p-3">{log.jamMasuk}</td>
                                            <td className="p-3">{log.jamKeluar || '-'}</td>
                                            <td className="p-3">{log.durasi || '-'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                );
            case 'Daftar Laporan':
                return <AdminReportList />;
            case 'Riwayat Absen':
                return (
                    <Card>
                        <h3 className="font-bold text-lg mb-4 text-primary">Riwayat Absensi Lengkap</h3>
                         <div className="overflow-x-auto max-h-[60vh]">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-background sticky top-0"><tr>{['Tanggal', 'Nama', 'Jam Masuk', 'Jam Keluar', 'Durasi (m)'].map(h => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
                                <tbody>
                                {absensiLog.map(log => (
                                    <tr key={log.id} className="border-b border-card hover:bg-card/50">
                                        <td className="p-3">{log.tanggal}</td>
                                        <td className="p-3 font-semibold">{log.nama}</td>
                                        <td className="p-3">{log.jamMasuk}</td>
                                        <td className="p-3">{log.jamKeluar || '-'}</td>
                                        <td className="p-3">{log.durasi || '-'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                );
            case 'Tools':
                 return (
                    <Card>
                        <h3 className="font-bold text-lg mb-4 text-primary">Admin Tools</h3>
                        <div className="space-y-3">
                            <Button variant="secondary" className="w-full justify-start text-left !px-4" onClick={() => navigate('/admin/generate-qr')}>
                                <QrCodeIcon className="h-5 w-5 mr-3"/>
                                Generate QR Code Piket Harian
                            </Button>
                        </div>
                    </Card>
                );
            default:
                 return <Card><p>Tab <strong>{activeTab}</strong>.</p></Card>;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
            <div className="border-b border-card">
                <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center space-x-2 whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.name ? 'border-primary text-primary' : 'border-transparent text-text-light hover:border-gray-300 hover:text-text'}`}>
                            <tab.icon className="h-5 w-5"/>
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default AdminPage;