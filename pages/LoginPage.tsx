import React, { useState, useEffect } from 'react';
// FIX: Reverted from namespace import to named imports for react-router-dom to resolve module errors.
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { api } from '../services/api';
import type { Student, UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIiBmaWxsPSIjOEI1RTNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgZm9udC1weWlnaHQ9ImJvbGQiPlgtRTg8L3RleHQ+PC9zdmc+";

const LoginPage: React.FC = () => {
    const [role, setRole] = useState<UserRole>('Siswa');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user } = useAuth();
    const { addNotification } = useNotification();
    
    // Form state
    const [studentName, setStudentName] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Autocomplete state
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [suggestions, setSuggestions] = useState<Student[]>([]);
    
    useEffect(() => {
        if(user) {
            const from = location.state?.from?.pathname || (user.role === 'Siswa' ? '/' : '/admin');
            navigate(from, { replace: true });
        }
    }, [user, navigate, location.state]);

    useEffect(() => {
        if (role === 'Siswa') {
            api.getStudents(false).then(setAllStudents);
        }
    }, [role]);

    const handleStudentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStudentName(value);
        if (value.length > 2) {
            setSuggestions(allStudents.filter(s => s.namaLengkap.toLowerCase().includes(value.toLowerCase())).slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (student: Student) => {
        setStudentName(student.namaLengkap);
        setSuggestions([]);
        // Auto-fill password for ease of use in this demo app
        const passwordInput = document.getElementById('studentPassword') as HTMLInputElement;
        if(passwordInput) {
           passwordInput.focus();
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const identifier = role === 'Siswa' ? studentName : adminUsername;
        const password = role === 'Siswa' ? studentPassword : adminPassword;

        if (!identifier || !password) {
            addNotification('Semua field harus diisi!', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const success = await login(role, identifier, password);
            if (success) {
                addNotification('Login berhasil!', 'success');
                const from = location.state?.from?.pathname || (role === 'Siswa' ? '/' : '/admin');
                navigate(from, { replace: true });
            } else {
                addNotification('Login gagal. Periksa kembali data Anda.', 'error');
            }
        } catch (error) {
            addNotification('Terjadi kesalahan koneksi.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 bg-gradient-to-br from-background to-card/30">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                     <img src={LOGO_DATA_URI} alt="Logo X-E8" className="h-20 w-20 bg-primary p-2 rounded-3xl mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-primary">Piket Digital X-E8</h1>
                    <p className="text-text-light">Silakan masuk untuk melanjutkan</p>
                </div>
                <Card className="!p-4 sm:!p-8">
                    <div className="mb-6 flex justify-center bg-card/50 p-1 rounded-2xl">
                        <button onClick={() => setRole('Siswa')} className={`w-1/2 py-2.5 rounded-xl font-semibold transition-colors ${role === 'Siswa' ? 'bg-background shadow-md' : 'text-text-light'}`}>Siswa</button>
                        <button onClick={() => setRole('Admin')} className={`w-1/2 py-2.5 rounded-xl font-semibold transition-colors ${role !== 'Siswa' ? 'bg-background shadow-md' : 'text-text-light'}`}>Admin</button>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {role === 'Siswa' ? (
                            <>
                                <div className="relative">
                                    <label htmlFor="studentName" className="font-medium text-sm text-text-light">Nama Lengkap</label>
                                    <input
                                        id="studentName"
                                        type="text"
                                        required
                                        value={studentName}
                                        onChange={handleStudentNameChange}
                                        className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-card focus:ring-2 focus:ring-accent"
                                        placeholder="Ketik nama Anda..."
                                        autoComplete="off"
                                    />
                                    {suggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full mt-1 bg-background border border-card rounded-xl shadow-lg">
                                            {suggestions.map(s => (
                                                <li key={s.id} onClick={() => selectSuggestion(s)} className="px-4 py-2 cursor-pointer hover:bg-card/70">{s.namaLengkap}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="studentPassword" className="font-medium text-sm text-text-light">Password</label>
                                    <input id="studentPassword" type="password" required value={studentPassword} onChange={e => setStudentPassword(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-card focus:ring-2 focus:ring-accent" placeholder="Password (cth: gisella)"/>
                                </div>
                            </>
                        ) : (
                             <>
                                <div>
                                    <label htmlFor="adminUsername" className="font-medium text-sm text-text-light">Username</label>
                                    <input id="adminUsername" type="text" required value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-card focus:ring-2 focus:ring-accent" placeholder="Username Admin"/>
                                </div>
                                <div>
                                    <label htmlFor="adminPassword" className="font-medium text-sm text-text-light">Password</label>
                                    <input id="adminPassword" type="password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-card focus:ring-2 focus:ring-accent" placeholder="Password"/>
                                </div>
                            </>
                        )}
                        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                            Masuk
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;