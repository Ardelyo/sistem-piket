export type UserRole = 'Siswa' | 'Admin' | 'Sekretaris';

export interface User {
  id: number;
  namaLengkap: string;
  foto: string;
  role: UserRole;
  username?: string; // For Admin/Sekretaris
}

export interface Student {
  id: number;
  nama: string;
  namaLengkap: string;
  foto: string;
  hariPiket: string;
  password?: string; // Should be handled server-side in a real app
  xp: number;
  level: number;
  rank: number;
  status: 'Aktif' | 'Nonaktif';
}

export interface Admin {
    id: number;
    nama: string;
    username: string;
    password?: string;
    role: 'Admin' | 'Sekretaris';
    foto: string;
}

export interface Schedule {
  [day: string]: string[];
}

export interface Absensi {
  id: number;
  tanggal: string;
  nama: string;
  jamMasuk: string;
  jamKeluar: string | null;
  durasi: number | null; // in minutes
  fotoUrl: string;
  verified: boolean;
}

export interface LaporanRating {
  lantai: number;
  papanTulis: number;
  meja: number;
  sampah: number;
}

export interface Laporan {
  id: number;
  tanggal: string;
  nama: string;
  rating: LaporanRating;
  ratingNotes?: {
      lantai?: string;
      papanTulis?: string;
      meja?: string;
      sampah?: string;
  };
  avgRating: number;
  tasks: { [key: string]: boolean };
  catatan: string;
  fotoBukti: string[]; // Changed to array to support multiple photos
  xp: number;
  verified: boolean;
  verifiedBy?: string;
  waktuMulai: string;
  waktuSelesai: string;
  status: 'draft' | 'submitted';
}

// FIX: Add 'Piket tidak bersih' to the PelanggaranJenis type to align with the options available in the AdminPage UI.
export type PelanggaranJenis = 'Tidak bawa kresek' | 'Terlambat' | 'Kabur piket' | 'Tidak piket' | 'Merusak fasilitas' | 'Piket tidak bersih';

export interface Pelanggaran {
    id: number;
    tanggal: string;
    nama: string;
    jenisPelanggaran: PelanggaranJenis;
    poin: number;
    sanksi: string;
    status: 'Proses' | 'Selesai';
    verifiedBy?: string;
}

export interface XPLog {
    id: number;
    studentId: number;
    tanggal: string;
    jumlah: number;
    alasan: string;
}

export interface AppSettings {
    xpOnTime: number;
    xpComplete: number;
    xpRatingMultiplier: number;
    xpPhoto: number;
    waktuMulai: string;
    waktuSelesai: string;
    minimalDurasi: number;
}


export interface Statistics {
  ratingTrend: { date: string; 'Rating Rata-rata': number }[];
  piketPerHari: { day: string; 'Jumlah Siswa': number }[];
  taskCompletionRate: { name: string; value: number }[];
}

export interface AdvancedStats {
    bestPerformer: { name: string; xp: number; fotoUrl: string; };
    worstPerformer: { name:string; xp: number; fotoUrl: string; };
    mostImproved: { name: string; rankChange: number; fotoUrl: string; };
    allPiketPhotos: { id: number; nama: string; tanggal: string; fotoBukti: string; }[];
}

export interface AdminDashboardStats {
    totalPiketHariIni: number;
    siswaSudahPiket: number;
    siswaBelumPiket: number;
    avgRatingHariIni: number;
}

export interface MonitoringData extends Student {
    statusPiket: 'Sudah Piket' | 'Belum Piket' | 'Terlambat';
    jamMasuk: string | null;
    jamKeluar: string | null;
    avgRating: number;
    taskCompletion: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
}

export interface PiketHistory {
    id: number;
    tanggal: string;
    xp: number;
    avgRating: number;
}

export interface ProfileData {
    student: Student;
    badges: Badge[];
    history: PiketHistory[];
    personalStats: {
        totalPiket: number;
        perfectWeeks: number;
        avgRating: number;
        rankHistory: { month: string; rank: number }[];
    };
}

export interface AppNotification {
  id: number;
  studentId: number;
  message: string;
  link: string;
  isRead: boolean;
  timestamp: string; // ISO string
}
