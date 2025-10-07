


import React, { useState, useEffect } from 'react';
// FIX: Reverted from namespace import to named imports for react-router-dom to resolve module errors.
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Student, Schedule, Absensi, Laporan } from '../types';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { CalendarDaysIcon, StarIcon, ArrowUpIcon, ClockIcon, CheckCircleIcon, QrCodeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeData } from '../App';
import Button from '../components/ui/Button';

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => (
  <Card className="flex items-center space-x-4">
    <div className={`p-3 rounded-2xl ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-text-light">{title}</p>
      <p className="text-2xl font-bold text-text">{value}</p>
    </div>
  </Card>
);

const AbsensiStatusCard: React.FC<{ status: Absensi | null | undefined, loading: boolean }> = ({ status, loading }) => {
    if (loading) {
        return <Skeleton className="h-52 rounded-3xl" />;
    }

    let statusText, subText, icon;
    
    if (!status) {
        statusText = "Belum Absen";
        subText = "Scan QR untuk memulai piket.";
        icon = <ClockIcon className="h-10 w-10 text-primary" />;
    } else if (status.jamMasuk && !status.jamKeluar) {
        statusText = "Sedang Piket";
        subText = `Masuk pukul ${status.jamMasuk}`;
        icon = <QrCodeIcon className="h-10 w-10 text-success animate-pulse" />;
    } else {
        statusText = "Piket Selesai";
        subText = `Durasi ${status.durasi} menit`;
        icon = <CheckCircleIcon className="h-10 w-10 text-primary" />;
    }

    return (
        <Card className="flex flex-col justify-between h-full">
            <div>
                <h2 className="text-xl font-bold text-primary mb-2">Absensi Hari Ini</h2>
                <div className="flex items-center space-x-4 my-4">
                    <div className="bg-background p-3 rounded-2xl">{icon}</div>
                    <div>
                        <p className="text-lg font-bold">{statusText}</p>
                        <p className="text-sm text-text-light">{subText}</p>
                    </div>
                </div>
            </div>
            <Link to="/absensi">
                <Button variant="secondary" className="w-full">
                    Buka Halaman Absensi
                </Button>
            </Link>
        </Card>
    );
}

const LaporanTerakhirCard: React.FC<{ report: Laporan | null }> = ({ report }) => {
    return (
        <Card className="flex flex-col justify-between h-full">
            <h2 className="text-xl font-bold text-primary mb-2">Laporan Terakhir</h2>
            {report ? (
                <>
                    <div>
                        <p className="text-sm text-text-light">Dinilai oleh <strong>{report.verifiedBy}</strong> pada {report.tanggal}</p>
                        <div className="flex items-center justify-center my-3 bg-background p-4 rounded-2xl">
                            <span className="text-5xl font-bold text-accent">{report.avgRating.toFixed(1)}</span>
                            <span className="text-yellow-500 ml-2"><StarIcon className="h-10 w-10"/></span>
                        </div>
                    </div>
                    <Link to="/laporan" className="text-center bg-accent/10 text-accent font-semibold rounded-xl py-3 hover:bg-accent/20 transition-colors duration-200 block">
                        Lihat Detail Laporan &rarr;
                    </Link>
                </>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-text-light text-center py-8">Belum ada laporan penilaian untukmu.</p>
                </div>
            )}
        </Card>
    );
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { absensiToday, loading: isRealtimeLoading } = useRealtimeData();
  const [student, setStudent] = useState<Student | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [latestReport, setLatestReport] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);

  const absensiStatus = user ? absensiToday.find(a => a.nama === user.namaLengkap) : null;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentData, scheduleData, reportsData] = await Promise.all([
          api.getMyProfile(user.namaLengkap),
          api.getSchedule(),
          api.getLaporanForStudent(user.namaLengkap)
        ]);
        setStudent(studentData || null);
        setSchedule(scheduleData);
        setLatestReport(reportsData[0] || null);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getTodaySchedule = () => {
    if (!schedule) return [];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dayMap: { [key: string]: string } = {
        'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu', 'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Jumat', 'Sunday': 'Senin'
    };
    const todayIndonesian = dayMap[today];
    return schedule[todayIndonesian] || [];
  };

  const todayPiket = getTodaySchedule();
  const pageLoading = loading || isRealtimeLoading;

  return (
    <div className="space-y-8">
      <div>
        {pageLoading ? <Skeleton className="h-10 w-3/4 rounded-xl" /> : <h1 className="text-3xl font-bold text-primary">Selamat Datang, {student?.nama}!</h1>}
        {pageLoading ? <Skeleton className="h-5 w-1/2 mt-2 rounded-lg" /> : <p className="text-text-light mt-1">Siap untuk membuat kelas berkilau hari ini?</p>}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <AbsensiStatusCard status={absensiStatus} loading={isRealtimeLoading} />
         {loading ? <Skeleton className="h-52 rounded-3xl" /> : <LaporanTerakhirCard report={latestReport} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pageLoading ? (
          <>
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
            <Skeleton className="h-28 rounded-3xl" />
          </>
        ) : student && (
          <>
            <StatCard icon={StarIcon} title="Total XP" value={student.xp} color="bg-yellow-500" />
            <StatCard icon={ArrowUpIcon} title="Peringkat Kelas" value={`#${student.rank}`} color="bg-green-500" />
            <StatCard icon={CalendarDaysIcon} title="Hari Piket" value={student.hariPiket} color="bg-blue-500" />
          </>
        )}
      </div>

      <Card>
          <h2 className="text-xl font-bold text-primary mb-4">Jadwal Piket Hari Ini</h2>
          {pageLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-2xl" />)}
            </div>
          ) : todayPiket.length > 0 ? (
            <ul className="space-y-3">
              {todayPiket.map((name, index) => (
                <li key={index} className={`flex items-center space-x-3 p-3 rounded-2xl ${name === student?.namaLengkap ? 'bg-accent/20' : 'bg-background'}`}>
                  <img src={`https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=C19A6B&color=fff&size=128`} alt={name} className="h-10 w-10 rounded-full object-cover" />
                  <span className="font-semibold">{name}</span>
                  {name === student?.namaLengkap && <span className="ml-auto text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">ANDA</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-light">Tidak ada jadwal piket hari ini.</p>
          )}
        </Card>
        
    </div>
  );
};

export default DashboardPage;