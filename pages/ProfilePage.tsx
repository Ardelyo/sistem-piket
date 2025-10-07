import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ProfileData } from '../types';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { ClockIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await api.getProfileData(user.namaLengkap);
                setProfile(data);
            } catch (error) {
                console.error("Gagal memuat profil", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    if (loading) {
        return <div className="space-y-6">
            <Card className="!p-0 overflow-hidden"><Skeleton className="h-40" /><div className="p-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-6 w-32 mt-2" /></div></Card>
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
        </div>;
    }

    if (!profile) {
        return <p>Gagal memuat profil.</p>;
    }

    const { student, badges, history, personalStats } = profile;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="!p-0 overflow-hidden">
                <div className="bg-accent/20 h-28" />
                <div className="p-6 flex flex-col sm:flex-row items-center sm:space-x-6 -mt-20">
                    <img src={student.foto} alt={student.namaLengkap} className="h-32 w-32 rounded-full border-4 border-background bg-card object-cover shadow-lg" />
                    <div className="text-center sm:text-left mt-4 sm:mt-12">
                        <h1 className="text-3xl font-bold text-primary">{student.namaLengkap}</h1>
                        <p className="text-text-light">Level {student.level} - Peringkat #{student.rank}</p>
                    </div>
                    <div className="mt-4 sm:ml-auto sm:mt-12 text-center bg-background px-6 py-3 rounded-2xl">
                        <p className="text-sm text-text-light">Total XP</p>
                        <p className="text-3xl font-bold text-accent">{student.xp}</p>
                    </div>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <Card><p className="text-sm text-text-light">Total Piket</p><p className="text-3xl font-bold">{personalStats.totalPiket}</p></Card>
                <Card><p className="text-sm text-text-light">Rating Rata-rata</p><p className="text-3xl font-bold">{personalStats.avgRating.toFixed(1)}</p></Card>
                <Card><p className="text-sm text-text-light">Minggu Sempurna</p><p className="text-3xl font-bold">{personalStats.perfectWeeks}</p></Card>
            </div>

            <Card>
                <h2 className="text-xl font-bold text-primary mb-4">Badge Pencapaian</h2>
                <div className="flex flex-wrap gap-4">
                    {badges.map(badge => (
                        <div key={badge.id} className={`p-4 rounded-2xl flex items-center space-x-3 w-full sm:flex-1 ${badge.earned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500 opacity-70'}`}>
                           <span className="text-3xl">{badge.icon}</span>
                           <div>
                                <p className="font-semibold">{badge.name}</p>
                                <p className="text-xs">{badge.description}</p>
                           </div>
                        </div>
                    ))}
                </div>
            </Card>
            
            <Card>
                <h2 className="text-xl font-bold text-primary mb-4">Riwayat Piket Terakhir</h2>
                <ul className="space-y-3">
                    {history.map(item => (
                        <li key={item.id} className="flex items-center justify-between bg-background p-4 rounded-2xl">
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="h-5 w-5 text-text-light"/>
                                <span className="font-semibold">{item.tanggal}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                               <span className="text-sm font-medium">Rating: {item.avgRating.toFixed(1)} ⭐</span>
                               <span className="font-bold text-accent">+{item.xp} XP</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default ProfilePage;