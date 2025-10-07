


import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Absensi, Student } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeData } from '../App';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { ClockIcon, CheckCircleIcon, QrCodeIcon, TrophyIcon, XMarkIcon, CalendarDaysIcon, ChartBarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const AttendanceCalendar: React.FC<{ 
    history: Absensi[];
    piketDay: string;
    onDateClick: (date: string) => void;
}> = ({ history, piketDay, onDateClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const historyMap = useMemo(() => {
        const map = new Map<string, Absensi>();
        history.forEach(item => map.set(item.tanggal, item));
        return map;
    }, [history]);
    
    const piketDayIndex = useMemo(() => {
        return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].indexOf(piketDay);
    }, [piketDay]);
    
    const changeMonth = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const renderCells = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push(<div key={`empty-${i}`} className="h-12 w-12"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const dateStr = cellDate.toISOString().split('T')[0];
            const hasAttended = historyMap.has(dateStr);
            const isPiketDay = cellDate.getDay() === piketDayIndex;
            const isPast = cellDate < today;

            let cellClass = 'bg-background hover:bg-card/70';
            let icon = null;

            if (hasAttended) {
                cellClass = 'bg-success/80 text-white font-bold';
                icon = <CheckCircleIcon className="h-4 w-4" />;
            } else if (isPiketDay && isPast) {
                cellClass = 'bg-danger/70 text-white font-bold';
                icon = <XMarkIcon className="h-4 w-4" />;
            } else if (!isPiketDay) {
                cellClass = 'bg-gray-200 text-gray-400';
            }
            
            if (cellDate.getTime() === today.getTime()) {
                cellClass += ' ring-2 ring-accent';
            }

            cells.push(
                <button
                    key={day}
                    className={`h-12 w-12 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 transform hover:scale-105 ${cellClass}`}
                    onClick={() => onDateClick(dateStr)}
                    disabled={!historyMap.has(dateStr)}
                >
                    <span className="text-lg">{day}</span>
                    {icon && <div className="mt-[-4px]">{icon}</div>}
                </button>
            );
        }
        return cells;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Button size="sm" variant="secondary" onClick={() => changeMonth(-1)}><ChevronLeftIcon className="h-5 w-5" /></Button>
                <h3 className="text-lg font-bold text-primary">{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                <Button size="sm" variant="secondary" onClick={() => changeMonth(1)}><ChevronRightIcon className="h-5 w-5" /></Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-text-light mb-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 place-items-center">
                {renderCells()}
            </div>
        </div>
    );
};

const ScanPage: React.FC = () => {
    const { user } = useAuth();
    const { absensiToday, loading: isRealtimeLoading } = useRealtimeData();
    const [attendanceHistory, setAttendanceHistory] = useState<Absensi[]>([]);
    const [studentProfile, setStudentProfile] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [liveDuration, setLiveDuration] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDateData, setSelectedDateData] = useState<Absensi | null>(null);
    
    const todayAttendance = user ? absensiToday.find(a => a.nama === user.namaLengkap) : null;

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [allAbsensi, profileData] = await Promise.all([
                    api.getAbsensiLog(), // Still use this for full history
                    api.getMyProfile(user.namaLengkap),
                ]);
                setAttendanceHistory(allAbsensi.filter(a => a.nama === user.namaLengkap));
                setStudentProfile(profileData);
            } catch (error) {
                console.error("Failed to fetch attendance data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> to resolve a type error in browser environments where NodeJS types are not available. This ensures the interval ID is correctly typed for both browser and Node environments.
        let intervalId: ReturnType<typeof setInterval> | null = null;
        if (todayAttendance?.jamMasuk && !todayAttendance.jamKeluar) {
            const startTime = new Date(`${todayAttendance.tanggal}T${todayAttendance.jamMasuk}`);
            const updateDuration = () => {
                const diff = new Date().getTime() - startTime.getTime();
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setLiveDuration(`${minutes} menit ${seconds} detik`);
            };
            updateDuration();
            intervalId = setInterval(updateDuration, 1000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [todayAttendance]);

    const monthlyStats = useMemo(() => {
        const now = new Date();
        const thisMonthHistory = attendanceHistory.filter(a => new Date(a.tanggal).getMonth() === now.getMonth() && new Date(a.tanggal).getFullYear() === now.getFullYear());
        const totalPiket = thisMonthHistory.length;
        const totalDuration = thisMonthHistory.reduce((sum, a) => sum + (a.durasi || 0), 0);
        const avgDuration = totalPiket > 0 ? Math.round(totalDuration / totalPiket) : 0;
        
        let scheduledDaysPassed = 0;
        if (studentProfile) {
            const piketDayIndex = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].indexOf(studentProfile.hariPiket);
            const today = now.getDate();
            for (let i = 1; i <= today; i++) {
                const date = new Date(now.getFullYear(), now.getMonth(), i);
                if (date.getDay() === piketDayIndex) {
                    scheduledDaysPassed++;
                }
            }
        }
        const perfectAttendance = scheduledDaysPassed > 0 ? Math.round((totalPiket / scheduledDaysPassed) * 100) : 100;

        return { totalPiket, avgDuration, perfectAttendance };
    }, [attendanceHistory, studentProfile]);
    
    const handleDateClick = (dateStr: string) => {
        const data = attendanceHistory.find(a => a.tanggal === dateStr);
        if (data) {
            setSelectedDateData(data);
            setIsModalOpen(true);
        }
    };

    const renderStatusCard = () => {
        if (isRealtimeLoading) {
            return <Skeleton className="h-64 rounded-3xl" />;
        }

        if (!todayAttendance) {
            return (
                <Card className="rounded-3xl bg-gradient-to-br from-amber-100 to-orange-200 p-6 text-center shadow-lifted">
                    <ClockIcon className="h-20 w-20 text-primary/70 mx-auto" />
                    <h2 className="text-3xl font-bold text-primary mt-4">Belum Absen Masuk</h2>
                    <p className="text-text-light mt-2 mb-6">Scan QR Code di kelas untuk memulai piket hari ini.</p>
                    <Link to="/absen-qr?type=masuk">
                        <Button size="lg" className="w-full max-w-sm mx-auto"><QrCodeIcon className="h-6 w-6 mr-2" />Scan QR Absen Masuk</Button>
                    </Link>
                </Card>
            );
        }

        if (todayAttendance.jamMasuk && !todayAttendance.jamKeluar) {
            return (
                <Card className="rounded-3xl bg-gradient-to-br from-green-100 to-teal-200 p-6 text-center shadow-lifted">
                    <div className="relative inline-block">
                        <CheckCircleIcon className="h-20 w-20 text-success/80 mx-auto" />
                        <div className="absolute top-0 right-0 h-5 w-5 bg-success rounded-full animate-ping"></div>
                    </div>
                    <h2 className="text-3xl font-bold text-green-800 mt-4">Sudah Absen Masuk ({todayAttendance.jamMasuk})</h2>
                    <p className="text-text-light mt-2 mb-2">Kamu piket sejak <strong className="font-semibold text-green-700">{liveDuration}</strong> yang lalu.</p>
                    <p className="text-sm text-text-light mb-6">Jangan lupa scan QR lagi setelah selesai!</p>
                    <Link to="/absen-qr?type=keluar">
                        <Button size="lg" variant="secondary" className="w-full max-w-sm mx-auto"><QrCodeIcon className="h-6 w-6 mr-2" />Scan QR Absen Keluar</Button>
                    </Link>
                </Card>
            );
        }

        return (
            <Card className="rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-200 p-6 text-center shadow-lifted">
                <TrophyIcon className="h-20 w-20 text-indigo-500 mx-auto" />
                <h2 className="text-3xl font-bold text-indigo-800 mt-4">Piket Selesai!</h2>
                <div className="my-4 inline-block bg-background px-6 py-3 rounded-2xl">
                    <p className="text-sm text-text-light">Total Durasi</p>
                    <p className="text-3xl font-bold text-primary">{todayAttendance.durasi} menit</p>
                </div>
                <p className="text-text-light mt-2 mb-6">Kerja bagus! XP akan ditambahkan setelah laporan diverifikasi admin.</p>
                <a href="#calendar-view">
                    <Button size="lg" variant="secondary" className="w-full max-w-sm mx-auto">Lihat History</Button>
                </a>
            </Card>
        );
    };

    const renderEmptyState = () => (
        <div className="text-center py-10">
            <h1 className="text-3xl font-bold text-primary">Selamat Datang di Halaman Absensi!</h1>
            <p className="text-text-light my-4">Sepertinya kamu belum pernah melakukan piket. <br/> Ayo mulai dan buat kelas kita bersih!</p>
            <Link to="/absen-qr?type=masuk">
                <Button size="lg"><QrCodeIcon className="h-6 w-6 mr-2"/>Mulai Piket Pertama</Button>
            </Link>
        </div>
    );
    
    if (loading) {
        return <div className="space-y-6"><Skeleton className="h-64 rounded-3xl" /><Skeleton className="h-20 rounded-3xl" /><Skeleton className="h-96 rounded-3xl" /></div>;
    }

    if (attendanceHistory.length === 0 && !todayAttendance) {
        return renderEmptyState();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {renderStatusCard()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center"><p className="text-sm text-text-light">Total Piket Bulan Ini</p><p className="text-3xl font-bold text-primary">{monthlyStats.totalPiket}</p></Card>
                <Card className="text-center"><p className="text-sm text-text-light">Rata-rata Durasi</p><p className="text-3xl font-bold text-primary">{monthlyStats.avgDuration} <span className="text-lg">mnt</span></p></Card>
                <Card className="text-center"><p className="text-sm text-text-light">Kehadiran Sempurna</p><p className="text-3xl font-bold text-primary">{monthlyStats.perfectAttendance}%</p></Card>
            </div>
            
            <Card id="calendar-view">
                <h2 className="text-xl font-bold text-primary mb-4 text-center">History Absensi Bulan Ini</h2>
                <AttendanceCalendar history={attendanceHistory} piketDay={studentProfile?.hariPiket || ''} onDateClick={handleDateClick} />
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-text-light">
                    <div className="flex items-center"><span className="h-3 w-3 bg-success/80 rounded-full mr-2"></span> Hadir</div>
                    <div className="flex items-center"><span className="h-3 w-3 bg-danger/70 rounded-full mr-2"></span> Tidak Hadir</div>
                    <div className="flex items-center"><span className="h-3 w-3 bg-gray-200 rounded-full mr-2"></span> Bukan Jadwal</div>
                </div>
            </Card>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Detail Absensi: ${selectedDateData?.tanggal}`}>
                {selectedDateData ? (
                    <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-background rounded-xl"><span className="font-semibold text-text-light">Nama</span><span className="font-bold">{selectedDateData.nama}</span></div>
                        <div className="flex justify-between p-3 bg-background rounded-xl"><span className="font-semibold text-text-light">Jam Masuk</span><span className="font-bold">{selectedDateData.jamMasuk}</span></div>
                        <div className="flex justify-between p-3 bg-background rounded-xl"><span className="font-semibold text-text-light">Jam Keluar</span><span className="font-bold">{selectedDateData.jamKeluar || '-'}</span></div>
                        <div className="flex justify-between p-3 bg-background rounded-xl"><span className="font-semibold text-text-light">Durasi</span><span className="font-bold">{selectedDateData.durasi ? `${selectedDateData.durasi} menit` : '-'}</span></div>
                    </div>
                ) : <p>Data tidak ditemukan.</p>}
            </Modal>
        </div>
    );
};

export default ScanPage;