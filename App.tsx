





import './src/index.css';
import React, { useState, useEffect, useCallback, useContext } from 'react';
// FIX: Reverted from namespace import to named imports for react-router-dom to resolve module errors.
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { NotificationCenterProvider } from './contexts/NotificationCenterContext';
import { useAuth } from './contexts/AuthContext';
import { api } from './services/api';
import type { Absensi } from './types';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import AbsenQrPage from './pages/AbsenQrPage';
import ReportPage from './pages/ReportPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import Spinner from './components/ui/Spinner';
import AdminProfilePage from './pages/AdminProfilePage';
import GenerateQrPage from './pages/GenerateQrPage';
import ScanPage from './pages/ScanPage';
import CreateReportPage from './pages/admin/CreateReportPage';

// --- Real-Time Data Sync Context ---

interface RealtimeDataContextType {
    absensiToday: Absensi[];
    isSynced: boolean;
    loading: boolean;
    lastSync: Date | null;
}

const RealtimeDataContext = React.createContext<RealtimeDataContextType | undefined>(undefined);

const RealtimeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [absensiToday, setAbsensiToday] = useState<Absensi[]>([]);
    const [isSynced, setIsSynced] = useState(true);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const { addNotification } = useNotification();

    const syncData = useCallback(async () => {
        const now = new Date();
        // Return if last sync was less than 1 minute ago, except for the first load
        if (lastSync && now.getTime() - lastSync.getTime() < 60000 && !loading) {
            return;
        }

        try {
            const { newData, syncedCount } = await api.fetchAndSyncAbsensi();
            
            if (loading) { // Don't show notifications on initial load
                setAbsensiToday(newData);
            } else {
                // Check for new check-ins
                if (newData.length > absensiToday.length) {
                    addNotification(`${newData.length - absensiToday.length} absensi baru diterima!`, 'info');
                }
                // Update state if data has changed (e.g., check-outs)
                if (JSON.stringify(newData) !== JSON.stringify(absensiToday)) {
                    setAbsensiToday(newData);
                }
            }

            if (syncedCount > 0) {
                addNotification(`${syncedCount} absensi dari antrian berhasil disinkronkan.`, 'success');
            }

            setIsSynced(true);
            setLastSync(now);
        } catch (e) {
            console.error("Real-time sync failed:", e);
            setIsSynced(false);
        } finally {
            setLoading(false);
        }
    }, [addNotification, absensiToday, lastSync, loading]);

    useEffect(() => {
        syncData(); // Initial sync
        const intervalId = setInterval(syncData, 10000); // Poll every 10 seconds
        return () => clearInterval(intervalId);
    }, [syncData]);

    const value = { absensiToday, isSynced, loading, lastSync };

    return <RealtimeDataContext.Provider value={value}>{children}</RealtimeDataContext.Provider>;
};

export const useRealtimeData = () => {
    const context = useContext(RealtimeDataContext);
    if (context === undefined) {
        throw new Error('useRealtimeData must be used within a RealtimeDataProvider');
    }
    return context;
};

// --- App Structure ---

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" color="border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const AdminLayoutRoute: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'Siswa') {
    return <Navigate to="/" replace />;
  }
  return <Layout><Outlet /></Layout>;
};

const StudentLayoutRoute: React.FC = () => {
  const { user } = useAuth();
  if (user?.role !== 'Siswa') {
    return <Navigate to="/admin" replace />;
  }
  return (
    <NotificationCenterProvider>
      <Layout><Outlet /></Layout>
    </NotificationCenterProvider>
  );
};


export default function App() {
  return (
    <NotificationProvider>
      <HashRouter>
        <RealtimeDataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<StudentLayoutRoute />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/absensi" element={<ScanPage />} />
                <Route path="/absen-qr" element={<AbsenQrPage />} />
                <Route path="/laporan" element={<ReportPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route element={<AdminLayoutRoute />}>
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/laporan/create" element={<CreateReportPage />} />
                  <Route path="/admin/generate-qr" element={<GenerateQrPage />} />
                  <Route path="/admin/profile" element={<AdminProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </RealtimeDataProvider>
      </HashRouter>
    </NotificationProvider>
  );
}