# 📜 Changelog

<a href="./README.md">Dokumentasi</a> / Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

Format entri mengikuti standar [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), dan proyek ini mematuhi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-10-07

### ✨ Ditambahkan (Added)

- **Rilis Awal Aplikasi Piket Digital X-E8!**
- **Sistem Autentikasi**: Login terpisah untuk peran `Siswa` dan `Admin`.
- **Dasbor Siswa**: Menampilkan informasi relevan untuk siswa, termasuk jadwal piket dan akses cepat ke fitur utama.
- **Dasbor Admin**: Menampilkan ringkasan statistik piket harian, monitoring real-time, dan grafik performa.
- **Absensi Berbasis QR Code**:
    - Generasi QR code harian yang unik oleh Admin.
    - Fitur pemindaian QR untuk absensi masuk dan keluar bagi Siswa.
    - Validasi QR code di sisi klien untuk mencegah penyalahgunaan.
- **Sistem Gamifikasi**:
    - Perhitungan **Poin Pengalaman (XP)** berdasarkan kinerja piket.
    - **Leaderboard** untuk menampilkan peringkat siswa berdasarkan XP.
    - Sistem **Level** dan **Badge** untuk pencapaian.
- **Manajemen Laporan**:
    - Admin dapat membuat laporan piket untuk siswa, memberikan rating, catatan, dan XP.
    - Siswa dapat melihat riwayat laporan mereka.
- **Manajemen Pelanggaran**: Admin dapat mencatat pelanggaran dan sanksi terkait piket.
- **Dukungan Offline-First**:
    - Penggunaan `localStorage` untuk menyimpan data aplikasi secara lokal.
    - **Antrian offline** untuk absensi, memastikan tidak ada data yang hilang saat koneksi internet terputus.
    - Mekanisme sinkronisasi periodik dengan backend Google Sheets.
- **Backend dengan Google Apps Script**:
    - Skrip `Code.gs` menangani permintaan `GET` (dengan JSONP) dan `POST` (`no-cors`).
    - Integrasi dengan Google Sheets sebagai database.
- **Dokumentasi Proyek**: Pembuatan 15 dokumen komprehensif di dalam direktori `/docs` untuk mencakup semua aspek proyek.

### 👥 Ucapan Terima Kasih
- **Developer Utama**:
    - **Ardellio Satria Anindito** (Admin)
    - **Novita Ayu** (Sekretaris)
- Seluruh siswa kelas **X-E8** atas dukungan dan masukannya.