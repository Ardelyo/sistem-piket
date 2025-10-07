import React, { useState, useEffect } from 'react';
// FIX: Reverted from namespace import to named imports for react-router-dom to resolve module errors.
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Admin } from '../types';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightOnRectangleIcon, Cog6ToothIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const AdminProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role === 'Siswa' || !user.username) {
            navigate('/login');
            return;
        };

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const adminData = await api.getAdminProfile(user.username);
                setAdmin(adminData || null);
            } catch (error) {
                console.error("Gagal memuat profil admin", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading || !admin) {
        return <div className="space-y-6 max-w-2xl mx-auto">
            <Card className="!p-0 overflow-hidden"><Skeleton className="h-40" /><div className="p-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-6 w-32 mt-2" /></div></Card>
            <Skeleton className="h-48 w-full rounded-3xl" />
        </div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Card className="!p-0 overflow-hidden">
                <div className="bg-accent/20 h-28" />
                <div className="p-6 flex flex-col sm:flex-row items-center sm:space-x-6 -mt-20">
                    <img src={admin.foto} alt={admin.nama} className="h-32 w-32 rounded-full border-4 border-background bg-card object-cover shadow-lg" />
                    <div className="text-center sm:text-left mt-4 sm:mt-12">
                        <h1 className="text-3xl font-bold text-primary">{admin.nama}</h1>
                        <p className="text-text-light flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <ShieldCheckIcon className="h-5 w-5 text-accent"/>
                            {admin.role}
                        </p>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-primary mb-4">Informasi Akun</h2>
                <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-background rounded-xl">
                        <span className="font-semibold text-text-light">Nama Lengkap</span>
                        <span className="font-bold">{admin.nama}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-background rounded-xl">
                        <span className="font-semibold text-text-light">Username</span>
                        <span className="font-bold">{admin.username}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-background rounded-xl">
                        <span className="font-semibold text-text-light">Role</span>
                        <span className="font-bold">{admin.role}</span>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-primary mb-4">Aksi</h2>
                <div className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start text-left !px-4" onClick={() => navigate('/admin')}>
                        <Cog6ToothIcon className="h-5 w-5 mr-3"/>
                        Buka Admin Panel
                    </Button>
                    <Button variant="secondary" className="w-full justify-start text-left !px-4 !text-red-600 hover:!bg-red-100" onClick={handleLogout}>
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3"/>
                        Keluar / Logout
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AdminProfilePage;