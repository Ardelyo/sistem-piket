# 📖 Panduan Pengguna Piket Digital X-E8

<a href="./README.md">Dokumentasi</a> / Panduan Pengguna

Selamat datang di panduan pengguna Piket Digital X-E8! Dokumen ini akan memandu Anda melalui semua fitur aplikasi, baik Anda seorang siswa maupun admin.

## 📜 Daftar Isi
- [Panduan untuk Siswa](#-panduan-untuk-siswa)
  - [1. Cara Login](#1-cara-login)
  - [2. Melakukan Absensi dengan Scan QR](#2-melakukan-absensi-dengan-scan-qr)
  - [3. Mengecek Poin (XP) dan Leaderboard](#3-mengecek-poin-xp-dan-leaderboard)
  - [4. Melihat Riwayat Laporan](#4-melihat-riwayat-laporan)
  - [5. Melihat Profil dan Badge](#5-melihat-profil-dan-badge)
- [Panduan untuk Admin](#-panduan-untuk-admin)
  - [1. Login sebagai Admin](#1-login-sebagai-admin)
  - [2. Menghasilkan (Generate) QR Code Harian](#2-menghasilkan-generate-qr-code-harian)
  - [3. Memonitor Dasbor Piket](#3-memonitor-dasbor-piket)
  - [4. Membuat Laporan untuk Siswa](#4-membuat-laporan-untuk-siswa)
  - [5. Mengelola Pelanggaran](#5-mengelola-pelanggaran)
  - [6. Ekspor Data](#6-ekspor-data)
- [Tanya Jawab (FAQ)](#-tanya-jawab-faq)
- [Troubleshooting Dasar](#-troubleshooting-dasar)

---

## 👨‍🎓 Panduan untuk Siswa

Bagian ini ditujukan untuk semua siswa kelas X-E8.

### 1. Cara Login
Untuk masuk ke aplikasi, Anda memerlukan nama lengkap dan password.

1.  Buka aplikasi. Anda akan melihat halaman login.
2.  Pastikan *toggle* atau pilihan peran diatur ke **"Siswa"**.
3.  Pada kolom "Nama Lengkap", ketik nama lengkap Anda persis seperti yang terdaftar. Contoh: `Ardellio Satria Anindito`.
4.  Pada kolom "Password", masukkan password Anda. Secara *default*, password Anda adalah **nama depan Anda dalam huruf kecil**. Contoh: `ardellio`.
5.  Klik tombol **"Login"**.

> **Penting**: Jika Anda tidak bisa login, pastikan penulisan nama sudah benar dan coba lagi. Jika masih gagal, hubungi admin (Ardellio atau Novita).

### 2. Melakukan Absensi dengan Scan QR
Absensi piket dilakukan dua kali: saat Anda **mulai** piket (absen masuk) dan saat Anda **selesai** piket (absen keluar).

1.  Dari halaman utama (Dashboard), klik tombol **"Scan QR"** atau navigasi ke menu "Absensi".
2.  Aplikasi akan meminta izin untuk menggunakan kamera Anda. Klik **"Izinkan"** atau **"Allow"**.
3.  Arahkan kamera ponsel Anda ke QR code yang telah disediakan oleh admin di kelas.
4.  Posisikan QR code di dalam kotak pemindai.
5.  Setelah berhasil, aplikasi akan menampilkan notifikasi:
    - **"Berhasil absen masuk piket!"**: Jika ini adalah scan pertama Anda hari itu.
    - **"Berhasil absen keluar piket!"**: Jika ini adalah scan kedua Anda.
6.  Anda harus melakukan scan dua kali untuk menyelesaikan siklus piket.

*(Visualisasi: Di sini akan ada screenshot yang menunjukkan kamera dengan kotak pemindai dan QR code di dalamnya.)*

### 3. Mengecek Poin (XP) dan Leaderboard
Ingin tahu peringkatmu di kelas?

1.  Navigasi ke menu **"Leaderboard"**.
2.  Di halaman ini, Anda akan melihat daftar semua siswa yang diurutkan berdasarkan total **XP (Poin Pengalaman)** tertinggi.
3.  Cari nama Anda untuk melihat peringkat, level, dan total XP Anda saat ini.

### 4. Melihat Riwayat Laporan
Setiap piket yang Anda selesaikan akan dinilai oleh admin dan menjadi sebuah laporan.

1.  Navigasi ke menu **"Laporan"**.
2.  Anda akan melihat daftar semua laporan piket Anda sebelumnya, diurutkan dari yang terbaru.
3.  Klik pada salah satu laporan untuk melihat detailnya, termasuk rating, catatan dari admin, dan XP yang Anda peroleh.

### 5. Melihat Profil dan Badge
Lihat pencapaian dan statistik pribadimu.

1.  Navigasi ke menu **"Profile"**.
2.  Di sini Anda dapat melihat ringkasan statistik, riwayat piket, dan *badge* (lencana) yang telah Anda peroleh.

---

## 👑 Panduan untuk Admin

Bagian ini untuk pengurus kelas yang bertugas sebagai Admin (Ardellio) atau Sekretaris (Novita).

### 1. Login sebagai Admin
1.  Di halaman login, pastikan *toggle* peran diatur ke **"Admin"**.
2.  Masukkan **Username** dan **Password** admin Anda.
3.  Klik **"Login"**. Anda akan diarahkan ke dasbor admin.

### 2. Menghasilkan (Generate) QR Code Harian
QR code harus dibuat baru setiap hari agar valid.

1.  Navigasi ke menu **"Generate QR"**.
2.  Aplikasi akan secara otomatis membuat QR code yang valid untuk hari itu.
3.  Tampilkan QR code ini di perangkat (misalnya, tablet atau laptop di depan kelas) agar bisa dipindai oleh siswa.

> **Keamanan**: QR code ini unik untuk setiap hari. QR code dari hari kemarin tidak akan bisa digunakan.

### 3. Memonitor Dasbor Piket
Dasbor admin adalah pusat kendali Anda.

1.  Di halaman utama admin, Anda akan melihat ringkasan status piket hari ini:
    - **Total Piket Hari Ini**: Jumlah siswa yang dijadwalkan piket.
    - **Siswa Sudah Piket**: Jumlah siswa yang sudah absen masuk.
    - **Siswa Belum Piket**: Jumlah siswa yang belum absen.
    - **Rating Rata-rata Hari Ini**: Kualitas kebersihan berdasarkan laporan yang masuk.
2.  Gulir ke bawah untuk melihat tabel **Monitoring Real-time** yang berisi daftar semua siswa, status piket mereka, dan jam masuk/keluar.

### 4. Membuat Laporan untuk Siswa
Setelah siswa selesai piket, admin bertugas membuat laporan untuk memberikan rating dan XP.

1.  Navigasi ke menu **"Laporan"** lalu klik **"Buat Laporan Baru"**.
2.  Pilih **nama siswa** dan **tanggal** piket.
3.  Isi formulir laporan:
    - Berikan **rating** (1-5 bintang) untuk setiap tugas (lantai, papan tulis, dll.).
    - Centang **tugas yang diselesaikan**.
    - Berikan **catatan** jika perlu.
    - Unggah **foto bukti** jika ada.
    - **XP** akan dihitung secara otomatis berdasarkan rating.
4.  Klik **"Simpan Laporan"**.

### 5. Mengelola Pelanggaran
Jika ada siswa yang tidak piket atau melanggar aturan, catat di sini.

1.  Dari dasbor admin, navigasi ke bagian **Pelanggaran**.
2.  Klik **"Tambah Pelanggaran"**.
3.  Isi formulir dengan nama siswa, jenis pelanggaran, dan sanksi yang diberikan.
4.  Data ini akan tersimpan sebagai catatan.

### 6. Ekspor Data
Jika Anda memerlukan data dalam format spreadsheet, Anda bisa mengaksesnya langsung.

1.  Buka file **Google Sheets** yang menjadi database aplikasi ini.
2.  Pilih *sheet* (misalnya, `ABSENSI` atau `LAPORAN`).
3.  Gunakan menu **File > Download** untuk mengunduh data dalam format Excel atau CSV.

---

## ❓ Tanya Jawab (FAQ)

**Q: Saya lupa password, bagaimana cara reset?**
A: Hubungi admin (Ardellio atau Novita). Saat ini tidak ada fitur reset password mandiri.

**Q: Kenapa saya tidak bisa scan QR code?**
A: Pastikan Anda telah memberikan izin kamera untuk aplikasi ini di browser Anda. Coba segarkan halaman dan coba lagi.

**Q: Apa itu XP dan Level?**
A: XP (Experience Points) adalah poin yang Anda dapatkan setiap kali menyelesaikan piket dengan baik. Semakin tinggi rating laporan Anda, semakin banyak XP yang didapat. Level menunjukkan tingkat pengalaman Anda secara keseluruhan.

---

## 🛠️ Troubleshooting Dasar

- **Aplikasi lambat atau tidak merespons**: Coba bersihkan cache browser Anda atau muat ulang halaman (refresh).
- **Data tidak update**: Pastikan Anda memiliki koneksi internet yang stabil. Aplikasi akan mencoba menyinkronkan data secara otomatis. Jika tidak, coba muat ulang halaman.
- **Izin kamera diblokir**: Masuk ke pengaturan browser Anda, cari pengaturan untuk situs ini, dan pastikan izin untuk "Kamera" diaktifkan.

---
*Terakhir diperbarui: 7 Oktober 2025*