import React from 'react';
// FIX: Reverted from namespace import to named imports for react-router-dom to resolve module errors.
import { NavLink } from 'react-router-dom';
import { HomeIcon, TrophyIcon, DocumentTextIcon, UserCircleIcon, ChartBarIcon, QrCodeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';

const BottomNav: React.FC = () => {
    const { user } = useAuth();

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex flex-col items-center justify-center w-full h-full transition-colors duration-200 relative ${isActive ? 'text-primary' : 'text-text-light hover:text-primary'}`;
    
    const activeIndicator = (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-16 bg-accent/10 rounded-3xl -z-10" />
    );

    const studentLinks = [
        { to: "/", icon: HomeIcon, label: "Home" },
        { to: "/absensi", icon: QrCodeIcon, label: "Absensi" },
        { to: "/laporan", icon: DocumentTextIcon, label: "Laporan" },
        { to: "/leaderboard", icon: ChartBarIcon, label: "Ranking" },
        { to: "/profile", icon: UserCircleIcon, label: "Profil" },
    ];
    
    const links = user?.role === 'Siswa' ? studentLinks : [];
    if (user?.role !== 'Siswa') {
        links.push({ to: "/admin", icon: TrophyIcon, label: "Admin" });
    }

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/85 backdrop-blur-xl z-20 rounded-t-3xl shadow-top pb-safe">
           <div className="grid grid-cols-5 h-full">
             {links.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={navLinkClass}>
                    {({ isActive }) => (
                        <>
                            {isActive && activeIndicator}
                            <Icon className="h-6 w-6" />
                            <span className="text-xs font-medium mt-1">{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
           </div>
        </nav>
    );
};

export default BottomNav;