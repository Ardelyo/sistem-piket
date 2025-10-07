import type { Student, Schedule, Absensi, Laporan, Pelanggaran, Admin, AppSettings, XPLog } from '../types';

// --- DATABASE ---
// This database is now reorganized and expanded for a richer user experience.
// Ranking updated: 1. Ardellio, 2. Revi, 3. Azhar.
// Passwords simplified to lowercase first name (e.g., 'gisella').

export const SISWA: Student[] = [
  // Top Tier
  { id: 23, nama: "Ardellio", namaLengkap: "Ardellio Satria Anindito", foto: "https://ui-avatars.com/api/?name=Ardellio+Satria&background=8B4513&color=fff&size=128", hariPiket: "Kamis", password: "ardellio", xp: 1250, level: 12, rank: 1, status: "Aktif" },
  { id: 11, nama: "Revi", namaLengkap: "Moch Revi", foto: "https://ui-avatars.com/api/?name=Moch+Revi&background=C19A6B&color=fff&size=128", hariPiket: "Selasa", password: "revi", xp: 1180, level: 11, rank: 2, status: "Aktif" },
  { id: 31, nama: "Azhar", namaLengkap: "Muhammad Azhar A.A", foto: "https://ui-avatars.com/api/?name=Muhammad+Azhar&background=C19A6B&color=fff&size=128", hariPiket: "Jumat", password: "azhar", xp: 1150, level: 11, rank: 3, status: "Aktif" },
  { id: 12, nama: "Novita", namaLengkap: "Novita Ayu", foto: "https://ui-avatars.com/api/?name=Novita+Ayu&background=8B4513&color=fff&size=128", hariPiket: "Selasa", password: "novita", xp: 1120, level: 11, rank: 4, status: "Aktif" },
  { id: 1, nama: "Gisella", namaLengkap: "Gisella Anastasya", foto: "https://ui-avatars.com/api/?name=Gisella+Anastasya&background=C19A6B&color=fff&size=128", hariPiket: "Senin", password: "gisella", xp: 1090, level: 10, rank: 5, status: "Aktif" },
  
  // High Tier
  { id: 2, nama: "Keiza", namaLengkap: "Keiza Putri Maharani", foto: "https://ui-avatars.com/api/?name=Keiza+Putri&background=C19A6B&color=fff&size=128", hariPiket: "Senin", password: "keiza", xp: 980, level: 9, rank: 6, status: "Aktif" },
  { id: 4, nama: "Amar", namaLengkap: "Amar Ma'ruf", foto: "https://ui-avatars.com/api/?name=Amar+Maruf&background=C19A6B&color=fff&size=128", hariPiket: "Senin", password: "amar", xp: 955, level: 9, rank: 7, status: "Aktif" },
  { id: 3, nama: "Marsha", namaLengkap: "Marsha Aulia", foto: "https://ui-avatars.com/api/?name=Marsha+Aulia&background=C19A6B&color=fff&size=128", hariPiket: "Senin", password: "marsha", xp: 920, level: 9, rank: 8, status: "Aktif" },
  { id: 9, nama: "Fahrul", namaLengkap: "Fahrul Hakim", foto: "https://ui-avatars.com/api/?name=Fahrul+Hakim&background=C19A6B&color=fff&size=128", hariPiket: "Selasa", password: "fahrul", xp: 880, level: 8, rank: 9, status: "Aktif" },
  { id: 5, nama: "Kansa", namaLengkap: "Kansa Khairunnisa", foto: "https://ui-avatars.com/api/?name=Kansa+Khairunnisa&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "kansa", xp: 850, level: 8, rank: 10, status: "Aktif" },

  // Mid Tier
  { id: 7, nama: "Pandu", namaLengkap: "Pandu Wijaya", foto: "https://ui-avatars.com/api/?name=Pandu+Wijaya&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "pandu", xp: 760, level: 7, rank: 11, status: "Aktif" },
  { id: 10, nama: "Khumaira", namaLengkap: "Khumaira Azzahra", foto: "https://ui-avatars.com/api/?name=Khumaira+Azzahra&background=C19A6B&color=fff&size=128", hariPiket: "Selasa", password: "khumaira", xp: 730, level: 7, rank: 12, status: "Aktif" },
  { id: 13, nama: "Taqia", namaLengkap: "Taqia Alifa", foto: "https://ui-avatars.com/api/?name=Taqia+Alifa&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "taqia", xp: 715, level: 7, rank: 13, status: "Aktif" },
  { id: 6, nama: "Zavira", namaLengkap: "Zavira Dwi", foto: "https://ui-avatars.com/api/?name=Zavira+Dwi&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "zavira", xp: 680, level: 6, rank: 14, status: "Aktif" },
  { id: 16, nama: "Reihan", namaLengkap: "Reihan Saputra", foto: "https://ui-avatars.com/api/?name=Reihan+Saputra&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "reihan", xp: 650, level: 6, rank: 15, status: "Aktif" },
  { id: 8, nama: "Misya", namaLengkap: "Misya Adelia", foto: "https://ui-avatars.com/api/?name=Misya+Adelia&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "misya", xp: 620, level: 6, rank: 16, status: "Aktif" },
  { id: 14, nama: "Zalfa", namaLengkap: "Zalfa Nabila", foto: "https://ui-avatars.com/api/?name=Zalfa+Nabila&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "zalfa", xp: 590, level: 5, rank: 17, status: "Aktif" },
  { id: 15, nama: "Albian", namaLengkap: "Albian Putra", foto: "https://ui-avatars.com/api/?name=Albian+Putra&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "albian", xp: 560, level: 5, rank: 18, status: "Aktif" },
  { id: 30, nama: "Tio", namaLengkap: "Tio Prasetyo", foto: "https://ui-avatars.com/api/?name=Tio+Prasetyo&background=C19A6B&color=fff&size=128", hariPiket: "Jumat", password: "tio", xp: 530, level: 5, rank: 19, status: "Aktif" },
  { id: 17, nama: "Fadlan", namaLengkap: "Fadlan Ardiansyah", foto: "https://ui-avatars.com/api/?name=Fadlan+Ardiansyah&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "fadlan", xp: 510, level: 5, rank: 20, status: "Aktif" },

  // Regular Tier
  { id: 24, nama: "Desriani", namaLengkap: "Desriani Putri", foto: "https://ui-avatars.com/api/?name=Desriani+Putri&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "desriani", xp: 480, level: 4, rank: 21, status: "Aktif" },
  { id: 18, nama: "Kyla", namaLengkap: "Kyla Azzahra", foto: "https://ui-avatars.com/api/?name=Kyla+Azzahra&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "kyla", xp: 450, level: 4, rank: 22, status: "Aktif" },
  { id: 32, nama: "Nada", namaLengkap: "Nada Alawiyah", foto: "https://ui-avatars.com/api/?name=Nada+Alawiyah&background=C19A6B&color=fff&size=128", hariPiket: "Jumat", password: "nada", xp: 420, level: 4, rank: 23, status: "Aktif" },
  { id: 25, nama: "Jingga", namaLengkap: "Jingga Aulia", foto: "https://ui-avatars.com/api/?name=Jingga+Aulia&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "jingga", xp: 390, level: 3, rank: 24, status: "Aktif" },
  { id: 19, nama: "Tsabbit", namaLengkap: "Tsabbit Maula", foto: "https://ui-avatars.com/api/?name=Tsabbit+Maula&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "tsabbit", xp: 360, level: 3, rank: 25, status: "Aktif" },
  { id: 34, nama: "Raindy", namaLengkap: "Raindy Saputra", foto: "https://ui-avatars.com/api/?name=Raindy+Saputra&background=C19A6B&color=fff&size=128", hariPiket: "Jumat", password: "raindy", xp: 330, level: 3, rank: 26, status: "Aktif" },
  { id: 26, nama: "Kaila", namaLengkap: "Kaila Syafira", foto: "https://ui-avatars.com/api/?name=Kaila+Syafira&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "kaila", xp: 300, level: 3, rank: 27, status: "Aktif" },
  { id: 20, nama: "Reykha", namaLengkap: "Reykha Ananda", foto: "https://ui-avatars.com/api/?name=Reykha+Ananda&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "reykha", xp: 280, level: 2, rank: 28, status: "Aktif" },
  { id: 27, nama: "Nabila", namaLengkap: "Nabila Putri", foto: "https://ui-avatars.com/api/?name=Nabila+Putri&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "nabila", xp: 260, level: 2, rank: 29, status: "Aktif" },
  { id: 21, nama: "Sabrynna", namaLengkap: "Sabrynna Aulia", foto: "https://ui-avatars.com/api/?name=Sabrynna+Aulia&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "sabrynna", xp: 240, level: 2, rank: 30, status: "Aktif" },
  { id: 28, nama: "Raditya", namaLengkap: "Raditya Dika", foto: "https://ui-avatars.com/api/?name=Raditya+Dika&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "raditya", xp: 220, level: 2, rank: 31, status: "Aktif" },
  { id: 29, nama: "Fahira", namaLengkap: "Fahira Anjani", foto: "https://ui-avatars.com/api/?name=Fahira+Anjani&background=C19A6B&color=fff&size=128", hariPiket: "Kamis", password: "fahira", xp: 200, level: 2, rank: 32, status: "Aktif" },
  { id: 33, nama: "Gladis", namaLengkap: "Gladis Ananda", foto: "https://ui-avatars.com/api/?name=Gladis+Ananda&background=C19A6B&color=fff&size=128", hariPiket: "Jumat", password: "gladis", xp: 180, level: 1, rank: 33, status: "Aktif" },
  { id: 35, nama: "Pranaja", namaLengkap: "Pranaja Adi", foto: "https://ui-avatars.com/api/?name=Pranaja+Adi&background=C19A6B&color=fff&size=128", hariPiket: "Jumat", password: "pranaja", xp: 160, level: 1, rank: 34, status: "Aktif" },
  { id: 22, nama: "Windhy", namaLengkap: "Windhy Arie", foto: "https://ui-avatars.com/api/?name=Windhy+Arie&background=C19A6B&color=fff&size=128", hariPiket: "Rabu", password: "windhy", xp: 140, level: 1, rank: 35, status: "Aktif" },
  { id: 36, nama: "Yasmin", namaLengkap: "Yasmin Nabila", foto: "https://ui-avatars.com/api/?name=Yasmin+Nabila&background=C19A6B&color=fff&size=128", hariPiket: "Jumat", password: "yasmin", xp: 120, level: 1, rank: 36, status: "Aktif" },
];

export const ADMIN: Admin[] = [
  { id: 1, nama: "Ardellio Satria Anindito", username: "ardellio", password: "admin2024", role: "Admin", foto: "https://ui-avatars.com/api/?name=Ardellio+Satria&background=8B4513&color=fff&size=128" },
  { id: 2, nama: "Novita Ayu", username: "novita", password: "sekretaris2024", role: "Sekretaris", foto: "https://ui-avatars.com/api/?name=Novita+Ayu&background=8B4513&color=fff&size=128" }
];

export const JADWAL: Schedule = {
  Senin: ["Gisella Anastasya", "Keiza Putri Maharani", "Marsha Aulia", "Amar Ma'ruf"],
  Selasa: ["Fahrul Hakim", "Khumaira Azzahra", "Moch Revi", "Novita Ayu"],
  Rabu: ["Pandu Wijaya", "Taqia Alifa", "Zalfa Nabila", "Albian Putra", "Reihan Saputra", "Fadlan Ardiansyah", "Kyla Azzahra", "Tsabbit Maula", "Reykha Ananda", "Sabrynna Aulia", "Windhy Arie"],
  Kamis: ["Kansa Khairunnisa", "Zavira Dwi", "Misya Adelia", "Ardellio Satria Anindito", "Desriani Putri", "Jingga Aulia", "Kaila Syafira", "Nabila Putri", "Raditya Dika", "Fahira Anjani"],
  Jumat: ["Tio Prasetyo", "Muhammad Azhar A.A", "Nada Alawiyah", "Gladis Ananda", "Raindy Saputra", "Pranaja Adi", "Yasmin Nabila"]
};

// --- DYNAMIC DATA GENERATION ---
const today = new Date();
const getDate = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

const generateMockData = () => {
    const absensi: Absensi[] = [];
    const laporan: Laporan[] = [];
    const xpLogs: XPLog[] = [];
    let idCounter = 1;

    for (let i = 0; i < 60; i++) { // Generate data for the last 60 days
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.toLocaleDateString('id-ID', { weekday: 'long' });

        if (dayOfWeek === 'Sabtu' || dayOfWeek === 'Minggu') continue;

        const studentsOnDuty = JADWAL[dayOfWeek] || [];
        studentsOnDuty.forEach(namaLengkap => {
            if (Math.random() > 0.15) { // 85% chance of doing piket
                const student = SISWA.find(s => s.namaLengkap === namaLengkap);
                if (!student) return;
                
                const dateStr = date.toISOString().split('T')[0];
                const startHour = 14 + (Math.random() > 0.5 ? 1 : 0);
                const startMinute = Math.floor(Math.random() * 59);
                const duration = 25 + Math.floor(Math.random() * 45); // Shorter, more realistic duration
                const startTime = new Date(`${dateStr}T${String(startHour).padStart(2,'0')}:${String(startMinute).padStart(2,'0')}`);
                const endTime = new Date(startTime.getTime() + duration * 60000);

                absensi.push({
                    id: idCounter++,
                    tanggal: dateStr,
                    nama: namaLengkap,
                    jamMasuk: startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    jamKeluar: endTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    durasi: duration,
                    fotoUrl: student.foto,
                    verified: true,
                });

                const rating = {
                    lantai: 3 + Math.floor(Math.random() * 3), // 3, 4, 5
                    papanTulis: 3 + Math.floor(Math.random() * 3),
                    meja: 3 + Math.floor(Math.random() * 3),
                    sampah: 3 + Math.floor(Math.random() * 3),
                };
                const avgRating = (rating.lantai + rating.papanTulis + rating.meja + rating.sampah) / 4;
                const xp = Math.round(25 + 15 + (avgRating * 5)); // base + photo + rating multiplier

                laporan.push({
                    id: idCounter++,
                    tanggal: dateStr,
                    nama: namaLengkap,
                    rating,
                    avgRating,
                    tasks: { 'Sapu lantai depan': Math.random() > 0.3, 'Pel lantai': Math.random() > 0.4, 'Buang sampah kelas': Math.random() > 0.2, 'Hapus papan tulis': Math.random() > 0.25 },
                    catatan: Math.random() > 0.85 ? 'Spidol habis.' : 'Semua bersih dan rapi.',
                    fotoBukti: [`https://picsum.photos/seed/${student.id}${i}/400/300`],
                    xp,
                    verified: Math.random() > 0.1, // 90% verified
                    verifiedBy: 'Ardellio Satria Anindito',
                    waktuMulai: startTime.toISOString(),
                    waktuSelesai: endTime.toISOString(),
                    status: 'submitted',
                });

                xpLogs.push({
                    id: idCounter++,
                    studentId: student.id,
                    tanggal: dateStr,
                    jumlah: xp,
                    alasan: 'Laporan Piket',
                });
            }
        });
    }
    return { absensi, laporan, xpLogs };
};

const mockData = generateMockData();

export const ABSENSI: Absensi[] = mockData.absensi.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
export const LAPORAN: Laporan[] = mockData.laporan.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
export const XP_LOGS: XPLog[] = mockData.xpLogs.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

export const PELANGGARAN: Pelanggaran[] = [
    { id: 1, tanggal: getDate(5), nama: 'Pandu Wijaya', jenisPelanggaran: 'Tidak piket', poin: 10, sanksi: 'Piket 2x lipat minggu depan', status: 'Proses', verifiedBy: 'Novita Ayu' },
    { id: 2, tanggal: getDate(8), nama: "Amar Ma'ruf", jenisPelanggaran: 'Terlambat', poin: 2, sanksi: 'Teguran lisan', status: 'Selesai', verifiedBy: 'Ardellio Satria Anindito' },
    { id: 3, tanggal: getDate(12), nama: 'Raditya Dika', jenisPelanggaran: 'Piket tidak bersih', poin: 3, sanksi: 'Piket ulang di hari yang sama', status: 'Selesai', verifiedBy: 'Ardellio Satria Anindito' },
    { id: 4, tanggal: getDate(15), nama: 'Windhy Arie', jenisPelanggaran: 'Kabur piket', poin: 8, sanksi: 'Piket tambahan 1x', status: 'Proses', verifiedBy: 'Novita Ayu' },
    { id: 5, tanggal: getDate(20), nama: 'Pranaja Adi', jenisPelanggaran: 'Tidak bawa kresek', poin: 1, sanksi: 'Beli kresek untuk kelas', status: 'Selesai', verifiedBy: 'Novita Ayu' },
];

export const SETTINGS: AppSettings = {
    xpOnTime: 20,
    xpComplete: 25,
    xpRatingMultiplier: 5,
    xpPhoto: 15,
    waktuMulai: "14:30",
    waktuSelesai: "16:00",
    minimalDurasi: 20
};