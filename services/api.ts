import type { Student, Schedule, Laporan, Statistics, AdminDashboardStats, MonitoringData, ProfileData, AdvancedStats, Pelanggaran, User, UserRole, Admin, AppSettings, XPLog, LaporanRating, Absensi, Badge, PiketHistory, AppNotification } from '../types';
import * as db from '../constants/database';

// =====================================
// CONFIGURATION
// =====================================

// Google Sheets API URL - UPDATE THIS WITH YOUR DEPLOYED URL
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyvr3xRpQmRLY6I8FNT5AHi6jK7c8SkngrdkQ_YaxguDZ9v5-aHGjxmczN7BnCllecw/exec';
// Feature flags
const ENABLE_SHEETS_SYNC = true; // Set to false to disable Google Sheets sync
const ENABLE_AUTO_SYNC = false; // Set to true to enable automatic syncing
const SYNC_INTERVAL = 30000; // 30 seconds
const CACHE_DURATION = 60000; // 1 minute

// Cache for sheets data
let sheetsCache = {
    data: [] as Absensi[],
    timestamp: 0,
};

// =====================================
// DATABASE MANAGEMENT
// =====================================

interface Database {
    students: Student[];
    admins: Admin[];
    schedule: Schedule;
    absensi: Absensi[];
    laporan: Laporan[];
    pelanggaran: Pelanggaran[];
    settings: AppSettings;
    xp_logs: XPLog[];
    notifications: AppNotification[];
}

let database: Database;

const PIKET_SECRET_KEY = "RAHASIA_X-E8_2024";

const loadDatabase = () => {
    try {
        const backup = localStorage.getItem('piket_database_backup');
        if (backup) {
            console.log("Loading database from localStorage backup.");
            database = JSON.parse(backup);
            // Ensure notifications array exists for backward compatibility
            if (!database.notifications) {
                database.notifications = [];
            }
        } else {
            console.log("Initializing database from constants.");
            database = {
                students: db.SISWA,
                admins: db.ADMIN,
                schedule: db.JADWAL,
                absensi: db.ABSENSI,
                laporan: db.LAPORAN,
                pelanggaran: db.PELANGGARAN,
                settings: db.SETTINGS,
                xp_logs: db.XP_LOGS,
                notifications: []
            };
        }
    } catch (e) {
        console.error("Failed to load database, resetting to default.", e);
        database = {
            students: db.SISWA,
            admins: db.ADMIN,
            schedule: db.JADWAL,
            absensi: db.ABSENSI,
            laporan: db.LAPORAN,
            pelanggaran: db.PELANGGARAN,
            settings: db.SETTINGS,
            xp_logs: db.XP_LOGS,
            notifications: []
        };
    }
};

const saveDatabase = () => {
    try {
        localStorage.setItem('piket_database_backup', JSON.stringify(database));
    } catch (e) {
        console.error("Failed to save database to localStorage.", e);
    }
};

// Initialize database on load
loadDatabase();

// =====================================
// HELPER FUNCTIONS
// =====================================

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const createResponse = <T,>(success: boolean, message: string, data: T | null = null) => {
    return { success, message, data, timestamp: new Date().toISOString() };
};

// =====================================
// OFFLINE QUEUE MANAGEMENT
// =====================================

interface PendingAbsensi {
    qrData: string;
    nama: string;
    timestamp: string;
}

const getPendingAbsensi = (): PendingAbsensi[] => {
    try {
        return JSON.parse(localStorage.getItem('pending_absensi') || '[]');
    } catch {
        return [];
    }
};

const savePendingAbsensi = (queue: PendingAbsensi[]) => {
    localStorage.setItem('pending_absensi', JSON.stringify(queue));
};

const addToPendingQueue = (item: PendingAbsensi) => {
    const queue = getPendingAbsensi();
    queue.push(item);
    savePendingAbsensi(queue);
};

// =====================================
// GOOGLE SHEETS SYNC FUNCTIONS
// =====================================

const syncAbsensiToSheets = async (qrData: string, nama: string, timestamp: string) => {
    if (!ENABLE_SHEETS_SYNC) {
        console.log('📴 Sheets sync disabled');
        return;
    }

    if (!SHEETS_API_URL || SHEETS_API_URL.includes('YOUR_DEPLOYMENT_ID')) {
        console.warn('⚠️ Google Sheets API URL not configured');
        throw new Error('Sheets API not configured');
    }

    try {
        const body = new URLSearchParams();
        body.append('action', 'absensi');
        body.append('qrData', qrData);
        body.append('nama', nama);
        body.append('timestamp', timestamp);

        // Using no-cors mode for fire-and-forget POST
        await fetch(SHEETS_API_URL, {
            method: 'POST',
            body: body,
            mode: 'no-cors',
        });
        
        console.log('✅ Synced to Sheets (no-cors POST)');
    } catch (error) {
        console.error('❌ Failed to sync to Sheets:', error);
        throw error;
    }
};

const fetchAbsensiFromSheets = async (): Promise<Absensi[]> => {
    if (!ENABLE_SHEETS_SYNC) {
        console.log('📴 Sheets sync disabled, using local data');
        return [];
    }

    if (!SHEETS_API_URL || SHEETS_API_URL.includes('YOUR_DEPLOYMENT_ID')) {
        console.warn('⚠️ Google Sheets API URL not configured');
        return [];
    }

    return new Promise((resolve) => {
        const callbackName = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let script: HTMLScriptElement | null = null;
        let timeoutId: NodeJS.Timeout | null = null;

        const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
            if ((window as any)[callbackName]) {
                delete (window as any)[callbackName];
            }
        };

        // Set timeout
        timeoutId = setTimeout(() => {
            cleanup();
            console.warn('⏱️ JSONP request timed out, using local data');
            resolve([]);
        }, 10000); // 10 second timeout

        // Create callback
        (window as any)[callbackName] = (response: any) => {
            cleanup();
            
            if (response && response.success && response.data) {
                console.log('✅ Received data from Google Sheets');
                resolve(response.data);
            } else {
                console.warn('⚠️ Invalid response from Sheets, using local data');
                resolve([]);
            }
        };

        // Create script element
        script = document.createElement('script');
        script.src = `${SHEETS_API_URL}?action=getAbsensiToday&callback=${callbackName}`;
        
        script.onerror = () => {
            cleanup();
            console.warn('⚠️ Failed to load JSONP script, using local data');
            resolve([]);
        };

        // Append script to trigger request
        document.body.appendChild(script);
    });
};

// =====================================
// MAIN API OBJECT
// =====================================

export const api = {
    // --- Google Sheets Sync Functions ---
    syncAbsensiToSheets,

    fetchAndSyncAbsensi: async () => {
        let successfulSyncs = 0;
        
        // 1. Sync pending offline data first
        if (ENABLE_SHEETS_SYNC) {
            const pending = getPendingAbsensi();
            if (pending.length > 0) {
                console.log(`📤 Syncing ${pending.length} pending items...`);
                const stillPending: PendingAbsensi[] = [];
                
                for (const item of pending) {
                    try {
                        await syncAbsensiToSheets(item.qrData, item.nama, item.timestamp);
                        successfulSyncs++;
                    } catch (error) {
                        console.warn("Failed to sync pending item, will retry later");
                        stillPending.push(item);
                    }
                }
                
                savePendingAbsensi(stillPending);
            }
        }
        
        // 2. Check cache first
        const now = Date.now();
        if (sheetsCache.data.length > 0 && now - sheetsCache.timestamp < CACHE_DURATION) {
            console.log('📦 Using cached Sheets data');
            return { newData: sheetsCache.data, syncedCount: successfulSyncs };
        }

        // 3. Try to fetch from Google Sheets
        let sheetsData: Absensi[] = [];
        
        if (ENABLE_SHEETS_SYNC) {
            try {
                sheetsData = await fetchAbsensiFromSheets();
                
                if (sheetsData.length > 0) {
                    sheetsCache = { data: sheetsData, timestamp: now };
                }
            } catch (error) {
                console.warn('⚠️ Error fetching from Sheets, using local data:', error);
            }
        }

        // 4. Merge with local data
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Keep absensi from other days
        const otherDaysAbsensi = database.absensi.filter(a => a.tanggal !== todayStr);
        
        // Create a map for merging today's data
        const localTodayMap = new Map<string, Absensi>();
        database.absensi
            .filter(a => a.tanggal === todayStr)
            .forEach(a => localTodayMap.set(a.nama, a));

        // Merge sheet data if available
        if (sheetsData.length > 0) {
            sheetsData.forEach(sheetAbsen => {
                const localAbsen = localTodayMap.get(sheetAbsen.nama);
                // Prefer sheet data if it's more complete
                if (!localAbsen || (sheetAbsen.jamKeluar && !localAbsen.jamKeluar)) {
                    localTodayMap.set(sheetAbsen.nama, sheetAbsen);
                }
            });
        }

        const combinedTodayData = Array.from(localTodayMap.values());
        
        // Update database
        database.absensi = [...combinedTodayData, ...otherDaysAbsensi].sort((a, b) => {
            const dateComparison = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
            if (dateComparison !== 0) return dateComparison;
            return (a.jamMasuk || "").localeCompare(b.jamMasuk || "");
        });

        saveDatabase();

        return { newData: combinedTodayData, syncedCount: successfulSyncs };
    },

    // --- Authentication ---
    login: async (role: UserRole, identifier: string, password?: string) => {
        await simulateDelay(700);
        
        if (role === 'Siswa') {
            const student = database.students.find(s => 
                s.namaLengkap.toLowerCase() === identifier.toLowerCase() && 
                s.password === password
            );
            if (student) {
                return createResponse(true, `Selamat datang, ${student.nama}!`, { 
                    ...student, 
                    nama: student.namaLengkap 
                });
            }
            return createResponse(false, 'Nama atau password salah.');
        } else {
            const admin = database.admins.find(a => 
                a.username === identifier && 
                a.password === password
            );
            if (admin) {
                return createResponse(true, `Login berhasil, ${admin.nama}.`, admin);
            }
            return createResponse(false, 'Username atau password salah.');
        }
    },
    
    // --- Schedule Functions ---
    getSchedule: async (): Promise<Schedule> => {
        await simulateDelay(100);
        return database.schedule;
    },
    
    // --- Student Functions ---
    getStudents: async (ranked = true): Promise<Student[]> => {
        await simulateDelay(200);
        const students = database.students;
        if (!ranked) return students;
        return [...students].sort((a, b) => b.xp - a.xp).map((s, i) => ({ ...s, rank: i + 1 }));
    },

    getMyProfile: async (namaLengkap: string): Promise<Student | null> => {
        await simulateDelay(150);
        const rankedStudents = [...database.students]
            .sort((a, b) => b.xp - a.xp)
            .map((s, i) => ({ ...s, rank: i + 1 }));
        const student = rankedStudents.find(s => s.namaLengkap === namaLengkap);
        return student || null;
    },
    
    getAdminProfile: async (username: string): Promise<Admin | null> => {
        await simulateDelay(100);
        return database.admins.find(a => a.username === username) || null;
    },

    // --- Dashboard & Statistics ---
    getAdminDashboardStats: async (): Promise<AdminDashboardStats> => {
        await simulateDelay(150);
        const today = new Date();
        const dayMap: { [key: string]: string } = { 
            'Sunday': 'Minggu', 
            'Monday': 'Senin', 
            'Tuesday': 'Selasa', 
            'Wednesday': 'Rabu', 
            'Thursday': 'Kamis', 
            'Friday': 'Jumat', 
            'Saturday': 'Sabtu' 
        };
        const todayIndonesian = dayMap[today.toLocaleDateString('en-US', { weekday: 'long' })];

        const studentsOnDuty = database.schedule[todayIndonesian] || [];
        const totalPiketHariIni = studentsOnDuty.length;
        
        const todayStr = today.toISOString().split('T')[0];
        
        const absensiHariIni = database.absensi.filter(a => a.tanggal === todayStr);
        const uniqueSiswaSudahPiket = new Set(absensiHariIni.map(a => a.nama));
        const siswaSudahPiket = uniqueSiswaSudahPiket.size;

        const siswaBelumPiket = totalPiketHariIni - siswaSudahPiket;

        const laporanHariIni = database.laporan.filter(l => l.tanggal === todayStr);
        const avgRatingHariIni = laporanHariIni.length > 0
            ? laporanHariIni.reduce((acc, l) => acc + l.avgRating, 0) / laporanHariIni.length
            : 0;
            
        return { totalPiketHariIni, siswaSudahPiket, siswaBelumPiket, avgRatingHariIni };
    },

    getDashboardStatistics: async (): Promise<Statistics> => {
        await simulateDelay(400);

        // Rating Trend (Last 30 days)
        const ratingTrend: { date: string; 'Rating Rata-rata': number }[] = [];
        const ratingDataByDate: { [key: string]: { total: number, count: number } } = {};
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        database.laporan
            .filter(l => new Date(l.tanggal) >= thirtyDaysAgo)
            .forEach(l => {
                const date = l.tanggal;
                if (!ratingDataByDate[date]) {
                    ratingDataByDate[date] = { total: 0, count: 0 };
                }
                ratingDataByDate[date].total += l.avgRating;
                ratingDataByDate[date].count++;
            });

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const simpleDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            
            const data = ratingDataByDate[dateStr];
            const avgRating = data ? parseFloat((data.total / data.count).toFixed(1)) : 0;
            ratingTrend.push({
                date: simpleDate,
                'Rating Rata-rata': avgRating,
            });
        }
        
        const piketPerHari = Object.keys(database.schedule).map(day => ({
            day: day.substring(0, 3),
            'Jumlah Siswa': database.schedule[day].length
        }));

        const taskCompletionRate = [
            {name: 'Sapu', value: 400}, 
            {name: 'Pel', value: 300}, 
            {name: 'Sampah', value: 500}, 
            {name: 'Papan Tulis', value: 200}
        ];

        return { ratingTrend, piketPerHari, taskCompletionRate };
    },
    
    getMonitoringData: async(): Promise<MonitoringData[]> => {
        await simulateDelay(500);
        const todayStr = new Date().toISOString().split('T')[0];
        
        return database.students.map(s => {
            const absensi = database.absensi.find(a => 
                a.nama === s.namaLengkap && a.tanggal === todayStr
            );
            const laporan = database.laporan.find(l => 
                l.nama === s.namaLengkap && l.tanggal === todayStr
            );
            
            return {
                ...s,
                statusPiket: absensi ? 'Sudah Piket' : 'Belum Piket',
                jamMasuk: absensi?.jamMasuk || null,
                jamKeluar: absensi?.jamKeluar || null,
                avgRating: laporan?.avgRating || 0,
                taskCompletion: laporan ? 
                    (Object.values(laporan.tasks).filter(Boolean).length / Object.keys(laporan.tasks).length) * 100 : 0
            };
        });
    },

    // --- Laporan Functions ---
    getAllLaporan: async(): Promise<Laporan[]> => {
        await simulateDelay(300);
        return [...database.laporan].sort((a,b) => 
            new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        );
    },

    getLaporanForStudent: async(namaLengkap: string): Promise<Laporan[]> => {
        await simulateDelay(300);
        return [...database.laporan]
            .filter(l => l.nama === namaLengkap && l.status === 'submitted')
            .sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    },

    deleteLaporan: async (id: number) => {
        await simulateDelay(300);
        const initialLength = database.laporan.length;
        database.laporan = database.laporan.filter(p => p.id !== id);
        
        if (database.laporan.length < initialLength) {
            saveDatabase();
            return createResponse(true, 'Laporan berhasil dihapus.');
        }
        return createResponse(false, 'Gagal menghapus, laporan tidak ditemukan.');
    },
    
    deleteMultipleLaporan: async (ids: number[]) => {
        await simulateDelay(500);
        const initialLength = database.laporan.length;
        database.laporan = database.laporan.filter(l => !ids.includes(l.id));
        
        if (database.laporan.length < initialLength) {
            saveDatabase();
            return createResponse(true, `${ids.length} laporan berhasil dihapus.`);
        }
        return createResponse(false, 'Gagal menghapus, laporan tidak ditemukan.');
    },
    
    updateMultipleLaporanStatus: async (ids: number[], status: 'draft' | 'submitted') => {
        await simulateDelay(500);
        let updatedCount = 0;
        
        database.laporan.forEach(laporan => {
            if (ids.includes(laporan.id)) {
                laporan.status = status;
                updatedCount++;
            }
        });
        
        if (updatedCount > 0) {
            saveDatabase();
            return createResponse(true, `${updatedCount} laporan berhasil diubah statusnya.`);
        }
        return createResponse(false, 'Tidak ada laporan yang diubah.');
    },

    createLaporan: async (laporanData: Omit<Laporan, 'id' | 'verifiedBy' | 'verified' | 'avgRating' | 'waktuMulai' | 'waktuSelesai'>, adminName: string) => {
        await simulateDelay(1200);
        
        const student = database.students.find(s => s.namaLengkap === laporanData.nama);
        if (!student) return createResponse(false, 'Siswa tidak ditemukan');
        
        const absensi = database.absensi.find(a => 
            a.nama === laporanData.nama && a.tanggal === laporanData.tanggal
        );
        if (!absensi) return createResponse(false, 'Data absensi untuk siswa & tanggal ini tidak ditemukan.');

        const newId = Math.max(...database.laporan.map(l => l.id), 0) + 1;
        
        const ratings = Object.values(laporanData.rating);
        const avgRating = ratings.length > 0 ? 
            ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
        const newLaporan: Laporan = {
            ...laporanData,
            id: newId,
            avgRating,
            verified: laporanData.status === 'submitted',
            verifiedBy: adminName,
            waktuMulai: new Date(`${absensi.tanggal}T${absensi.jamMasuk}`).toISOString(),
            waktuSelesai: absensi.jamKeluar ? 
                new Date(`${absensi.tanggal}T${absensi.jamKeluar}`).toISOString() : 
                new Date().toISOString()
        };
        
        database.laporan.unshift(newLaporan);

        if (newLaporan.status === 'submitted') {
            student.xp += newLaporan.xp;
            database.xp_logs.unshift({
                id: Math.max(...database.xp_logs.map(l => l.id), 0) + 1,
                studentId: student.id,
                tanggal: newLaporan.tanggal,
                jumlah: newLaporan.xp,
                alasan: 'Laporan Piket'
            });
        }
        
        saveDatabase();
        return createResponse(true, 'Laporan berhasil dibuat', newLaporan);
    },

    // --- Absensi Functions ---
    getAbsensiLog: async(): Promise<Absensi[]> => {
        await simulateDelay(250);
        return [...database.absensi].sort((a,b) => 
            new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        );
    },

    scanPiketQR: async (qrData: string, nama: string) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const formattedDate = todayStr.replace(/-/g, '');
        const expectedQr = `PIKET-XE8-${formattedDate}`;

        if (qrData !== expectedQr) {
            return createResponse(false, 'QR Code tidak valid atau sudah kadaluarsa.');
        }

        const now = new Date();
        const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        let existingAbsensi = database.absensi.find(a => 
            a.nama === nama && a.tanggal === todayStr
        );
        let syncStatus = "local";

        if (existingAbsensi && !existingAbsensi.jamKeluar) {
            // Check out
            const startTime = new Date(`${todayStr}T${existingAbsensi.jamMasuk}`);
            const duration = Math.round((now.getTime() - startTime.getTime()) / 60000);
            
            existingAbsensi.jamKeluar = currentTime;
            existingAbsensi.durasi = duration;
            saveDatabase();

            // Try to sync to Sheets
            if (ENABLE_SHEETS_SYNC) {
                try { 
                    await syncAbsensiToSheets(qrData, nama, now.toISOString());
                    syncStatus = "synced";
                } catch (e) {
                    console.warn('Failed to sync, queuing for later');
                    addToPendingQueue({ qrData, nama, timestamp: now.toISOString() });
                    syncStatus = "queued";
                }
            }

            return createResponse(true, `Berhasil absen keluar piket! (${syncStatus})`, { 
                status: 'checked_out', 
                durasi: duration 
            });
            
        } else if (!existingAbsensi) {
            // Check in
            const newAbsensi: Absensi = {
                id: Math.max(...database.absensi.map(a => a.id), 0) + 1,
                tanggal: todayStr, 
                nama: nama, 
                jamMasuk: currentTime, 
                jamKeluar: null, 
                durasi: null,
                fotoUrl: database.students.find(s => s.namaLengkap === nama)?.foto || '',
                verified: false,
            };
            database.absensi.unshift(newAbsensi);
            saveDatabase();
            
            // Try to sync to Sheets
            if (ENABLE_SHEETS_SYNC) {
                try { 
                    await syncAbsensiToSheets(qrData, nama, now.toISOString());
                    syncStatus = "synced";
                } catch (e) {
                    console.warn('Failed to sync, queuing for later');
                    addToPendingQueue({ qrData, nama, timestamp: now.toISOString() });
                    syncStatus = "queued";
                }
            }

            return createResponse(true, `Berhasil absen masuk piket! (${syncStatus})`, { 
                status: 'checked_in' 
            });
            
        } else {
            return createResponse(false, 'Anda sudah menyelesaikan piket hari ini.');
        }
    },

    // --- Pelanggaran Functions ---
    getPelanggaran: async(): Promise<Pelanggaran[]> => {
        await simulateDelay(200);
        return database.pelanggaran;
    },

    addPelanggaran: async (pelanggaran: Omit<Pelanggaran, 'id'>) => {
        await simulateDelay(500);
        const newId = Math.max(...database.pelanggaran.map(p => p.id), 0) + 1;
        const newPelanggaran = { ...pelanggaran, id: newId };
        database.pelanggaran.unshift(newPelanggaran);
        saveDatabase();
        return createResponse(true, 'Pelanggaran berhasil ditambahkan', newPelanggaran);
    },

    deletePelanggaran: async (id: number) => {
        await simulateDelay(300);
        const initialLength = database.pelanggaran.length;
        database.pelanggaran = database.pelanggaran.filter(p => p.id !== id);
        
        if (database.pelanggaran.length < initialLength) {
            saveDatabase();
            return createResponse(true, 'Pelanggaran berhasil dihapus.');
        }
        return createResponse(false, 'Gagal menghapus, pelanggaran tidak ditemukan.');
    },

    // --- Advanced Statistics ---
    getAdvancedStats: async(): Promise<AdvancedStats> => {
        await simulateDelay(600);
        const ranked = await api.getStudents();
        
        return {
            bestPerformer: { 
                name: ranked[0].nama, 
                xp: ranked[0].xp, 
                fotoUrl: ranked[0].foto 
            },
            worstPerformer: { 
                name: ranked[ranked.length - 1].nama, 
                xp: ranked[ranked.length - 1].xp, 
                fotoUrl: ranked[ranked.length - 1].foto 
            },
            mostImproved: { 
                name: ranked[5].nama, 
                rankChange: 3, 
                fotoUrl: ranked[5].foto 
            },
            allPiketPhotos: database.laporan.slice(0, 50).map(l => ({ 
                id: l.id, 
                nama: l.nama, 
                tanggal: l.tanggal, 
                fotoBukti: l.fotoBukti[0] 
            }))
        };
    },

    getStudentsCheckedOutToday: async (): Promise<Student[]> => {
        await simulateDelay(100);
        const todayStr = new Date().toISOString().split('T')[0];
        const checkedOutNamas = database.absensi
            .filter(a => a.tanggal === todayStr && a.jamKeluar)
            .map(a => a.nama);
        
        return database.students.filter(s => checkedOutNamas.includes(s.namaLengkap));
    },

    // --- Profile Functions ---
    getProfileData: async (namaLengkap: string): Promise<ProfileData> => {
        await simulateDelay(400);
        const student = await api.getMyProfile(namaLengkap);
        if (!student) throw new Error("Student not found");

        const history: PiketHistory[] = database.laporan
            .filter(l => l.nama === namaLengkap && l.status === 'submitted')
            .slice(0, 5)
            .map(l => ({ 
                id: l.id, 
                tanggal: l.tanggal, 
                xp: l.xp, 
                avgRating: l.avgRating 
            }));

        const totalPiket = database.absensi.filter(a => 
            a.nama === namaLengkap && a.jamKeluar
        ).length;
        
        const reports = database.laporan.filter(l => l.nama === namaLengkap);
        const avgRating = reports.length > 0 ? 
            reports.reduce((sum, r) => sum + r.avgRating, 0) / reports.length : 0;
        
        const badges: Badge[] = [
            { 
                id: '1', 
                name: 'Pekerja Keras', 
                description: 'Selesaikan 10 piket', 
                icon: '💪', 
                earned: totalPiket >= 10 
            },
            { 
                id: '2', 
                name: 'Bintang Kebersihan', 
                description: 'Rata-rata rating di atas 4.5', 
                icon: '🌟', 
                earned: avgRating >= 4.5 
            },
            { 
                id: '3', 
                name: 'Rajin Pangkal Pandai', 
                description: 'Piket 5 hari berturut-turut', 
                icon: '📅', 
                earned: true 
            },
            { 
                id: '4', 
                name: 'Tepat Waktu', 
                description: 'Selalu piket tepat waktu', 
                icon: '⏰', 
                earned: false 
            },
        ];

        return {
            student,
            badges,
            history,
            personalStats: {
                totalPiket,
                perfectWeeks: 2,
                avgRating,
                rankHistory: [
                    {month: 'Mei', rank: 8}, 
                    {month: 'Juni', rank: 5}
                ]
            }
        };
    },

    // --- Notification Functions ---
    getNotificationsForStudent: async(studentId: number): Promise<AppNotification[]> => {
        await simulateDelay(200);
        
        if (database.notifications.filter(n => n.studentId === studentId).length === 0) {
            const student = database.students.find(s => s.id === studentId);
            if (student) {
                const firstReport = database.laporan.find(l => l.nama === student.namaLengkap);
                if (firstReport) {
                    database.notifications.push({
                        id: 1, 
                        studentId: studentId,
                        message: `Laporan piket tgl ${firstReport.tanggal} dinilai. Anda dapat +${firstReport.xp} XP!`,
                        link: '/laporan', 
                        isRead: false, 
                        timestamp: new Date().toISOString()
                    });
                }
                database.notifications.push({
                    id: 2, 
                    studentId: studentId,
                    message: `Selamat datang! Peringkatmu saat ini #${student.rank}.`,
                    link: '/leaderboard', 
                    isRead: true,
                    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
                });
                saveDatabase();
            }
        }
        
        return [...database.notifications.filter(n => n.studentId === studentId)]
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    markAllNotificationsAsRead: async(studentId: number): Promise<{ success: boolean }> => {
        await simulateDelay(300);
        database.notifications.forEach(n => {
            if(n.studentId === studentId && !n.isRead) {
                n.isRead = true;
            }
        });
        saveDatabase();
        return { success: true };
    },
};

// =====================================
// CONNECTION TEST
// =====================================

export const testConnection = async () => {
    console.log('🧪 Testing Google Sheets connection...');
    
    if (!ENABLE_SHEETS_SYNC) {
        console.log('📴 Sheets sync is disabled');
        return { success: false, message: 'Sheets sync disabled' };
    }
    
    if (!SHEETS_API_URL || SHEETS_API_URL.includes('YOUR_DEPLOYMENT_ID')) {
        console.error('❌ Google Sheets API URL not configured');
        return { success: false, message: 'API URL not configured' };
    }
    
    try {
        const data = await fetchAbsensiFromSheets();
        console.log('✅ Connection successful, received', data.length, 'records');
        return { success: true, message: 'Connected to Google Sheets', data };
    } catch (error) {
        console.error('❌ Connection failed:', error);
        return { success: false, message: 'Connection failed', error };
    }
};

// =====================================
// AUTO-SYNC MANAGER (Optional)
// =====================================

let syncInterval: NodeJS.Timeout | null = null;

export const startAutoSync = (interval = SYNC_INTERVAL) => {
    if (!ENABLE_AUTO_SYNC) {
        console.log('📴 Auto-sync is disabled');
        return;
    }
    
    if (syncInterval) {
        console.log('⏰ Auto-sync already running');
        return;
    }
    
    console.log(`⏰ Starting auto-sync every ${interval/1000} seconds`);
    
    syncInterval = setInterval(async () => {
        try {
            console.log('🔄 Auto-syncing...');
            await api.fetchAndSyncAbsensi();
        } catch (error) {
            console.error('❌ Auto-sync error:', error);
        }
    }, interval);
};

export const stopAutoSync = () => {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('⏹️ Auto-sync stopped');
    }
};

// Test connection on load (optional)
if (typeof window !== 'undefined' && ENABLE_SHEETS_SYNC) {
    setTimeout(() => {
        testConnection();
    }, 2000);
}

// Export everything
export default api;