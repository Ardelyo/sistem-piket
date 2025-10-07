import React from 'react';
import { Link } from 'react-router-dom';
import { useNotificationCenter } from '../../contexts/NotificationCenterContext';
import { DocumentTextIcon, BellAlertIcon } from '@heroicons/react/24/solid';
import Skeleton from '../ui/Skeleton';

// Function to format time difference
const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
};

const NotificationPanel: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { notifications, loading } = useNotificationCenter();

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background rounded-2xl shadow-lifted z-50 p-2">
            <div className="p-2 border-b border-card">
                <h3 className="font-bold text-lg text-primary">Notifikasi</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {loading && (
                    <div className="p-2 space-y-2">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                )}
                {!loading && notifications.length === 0 && (
                    <div className="text-center p-8 text-text-light">
                        <BellAlertIcon className="h-12 w-12 mx-auto text-text-light/50" />
                        <p className="mt-2 text-sm">Tidak ada notifikasi baru.</p>
                    </div>
                )}
                {!loading && notifications.length > 0 && (
                    <ul className="divide-y divide-card">
                        {notifications.slice(0, 10).map(notif => (
                            <li key={notif.id}>
                                <Link to={notif.link} onClick={onClose} className="flex items-start gap-3 p-3 hover:bg-card/70 rounded-lg transition-colors">
                                    <div className={`mt-1.5 flex-shrink-0 h-2 w-2 rounded-full transition-colors duration-300 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                    <div className="bg-accent/10 p-2 rounded-full flex-shrink-0">
                                        <DocumentTextIcon className="h-5 w-5 text-accent" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-text">{notif.message}</p>
                                        <p className="text-xs text-text-light mt-1">{timeAgo(notif.timestamp)}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
