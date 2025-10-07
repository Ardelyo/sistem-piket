import React, { useState, Fragment } from 'react';
// FIX: Reverted from namespace import to named imports for react-router-dom to resolve module errors.
import { useNavigate, NavLink } from 'react-router-dom';
import { User, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, UserCircleIcon, Cog6ToothIcon, BellIcon } from '@heroicons/react/24/solid';
import { useNotificationCenter } from '../../contexts/NotificationCenterContext';
import NotificationPanel from '../shared/NotificationPanel';

const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIiBmaWxsPSIjOEI1RTNDIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaGyPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgZm9udC1weWlnaHQ9ImJvbGQiPlgtRTg8L3RleHQ+PC9zdmc+";

const NotificationBell: React.FC = () => {
    const { unreadCount, markAllAsRead } = useNotificationCenter();
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

    const togglePanel = () => {
        setIsNotificationPanelOpen(prev => {
            if (!prev && unreadCount > 0) { // If opening the panel with unread notifications
                markAllAsRead();
            }
            return !prev;
        });
    };

    return (
        <div className="relative">
            <button onClick={togglePanel} className="p-2 rounded-full hover:bg-card/70 relative transition-colors duration-200">
                <BellIcon className="h-6 w-6 text-text-light" />
                {unreadCount > 0 && (
                     <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </button>
            {isNotificationPanelOpen && <NotificationPanel onClose={() => setIsNotificationPanelOpen(false)} />}
        </div>
    );
};

const Header: React.FC<{ user: User | null }> = ({ user }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `relative px-4 py-2 rounded-xl transition-colors duration-300 ${isActive ? 'text-primary font-semibold' : 'text-text-light hover:bg-card/70'}`;

    const activeLinkIndicator = <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-6 bg-primary rounded-full"></div>;

    const navLinks = user?.role === 'Siswa' ? [
        { to: "/", label: "Dashboard" },
        { to: "/absensi", label: "Absensi" },
        { to: "/laporan", label: "Laporan" },
        { to: "/leaderboard", label: "Leaderboard" },
    ] : [
        { to: "/admin", label: "Admin Panel"}
    ];

    const profileMenu = (
        <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2">
                <img src={user?.foto} alt={user?.namaLengkap} className="h-10 w-10 rounded-full border-2 border-card" />
                <div className="hidden sm:block text-left">
                    <p className="font-semibold text-sm text-primary truncate max-w-24">{user?.namaLengkap}</p>
                    <p className="text-xs text-text-light">{user?.role}</p>
                </div>
            </button>
            {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background rounded-2xl shadow-lifted z-10 p-2">
                    <NavLink to={user?.role === 'Siswa' ? "/profile" : "/admin/profile"} className="flex items-center w-full text-left px-4 py-2 text-sm text-text-light hover:bg-card/70 rounded-lg"><UserCircleIcon className="h-5 w-5 mr-2" />Profil</NavLink>
                    {user?.role !== 'Siswa' && <NavLink to="/admin" className="flex items-center w-full text-left px-4 py-2 text-sm text-text-light hover:bg-card/70 rounded-lg"><Cog6ToothIcon className="h-5 w-5 mr-2" />Admin Panel</NavLink>}
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-100 rounded-lg"><ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />Keluar</button>
                </div>
            )}
        </div>
    );

    return (
        <header className="bg-background/85 backdrop-blur-xl sticky top-0 z-20 w-full shadow-lg rounded-b-3xl pt-safe">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-2">
                        <img src={LOGO_DATA_URI} alt="Logo X-E8" className="h-10 w-10 bg-primary p-1 rounded-xl" />
                        <h1 className="text-2xl font-bold text-primary hidden sm:block">Piket X-E8</h1>
                    </div>
                    
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-4 items-center">
                        {navLinks.map(link => (
                            <NavLink key={link.to} to={link.to} className={navLinkClass}>
                                {({ isActive }) => (
                                    <>
                                        {link.label}
                                        {isActive && activeLinkIndicator}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-2">
                         {user?.role === 'Siswa' && <NotificationBell />}
                        {profileMenu}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;