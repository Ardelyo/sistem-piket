# ✨ Dokumentasi Fitur Utama

<a href="./README.md">Dokumentasi</a> / Fitur

Dokumen ini memberikan penjelasan mendalam tentang fitur-fitur inti yang membuat aplikasi Piket Digital X-E8 menjadi alat yang efektif dan menarik untuk manajemen kebersihan kelas.

## 📜 Daftar Isi
- [1. Sistem QR Code](#1-sistem-qr-code)
  - [Generasi Kode QR](#generasi-kode-qr)
  - [Validasi dan Keamanan](#validasi-dan-keamanan)
  - [Proses Pemindaian](#proses-pemindaian)
- [2. Gamifikasi](#2-gamifikasi)
  - [Sistem Poin Pengalaman (XP)](#sistem-poin-pengalaman-xp)
  - [Level dan Peringkat](#level-dan-peringkat)
  - [Badge (Lencana)](#badge-lencana)
- [3. Dukungan Offline (Offline-First)](#3-dukungan-offline-offline-first)
  - [Sistem Antrian (Queue)](#sistem-antrian-queue)
  - [Mekanisme Sinkronisasi](#mekanisme-sinkronisasi)
- [4. Pembaruan Real-time](#4-pembaruan-real-time)
  - [Strategi Polling](#strategi-polling)
  - [Invalidasi Cache](#invalidasi-cache)
- [5. Operasi Bulk untuk Admin](#5-operasi-bulk-untuk-admin)
  - [Pembuatan Laporan Massal](#pembuatan-laporan-massal)

---

## 1. Sistem QR Code
Fitur ini adalah inti dari proses absensi piket yang cepat dan efisien.

### Generasi Kode QR
Admin dapat menghasilkan QR code unik setiap hari melalui menu "Generate QR".
- **Logika**: QR code yang dihasilkan bukan sekadar gambar statis. *Payload* atau data yang terkandung di dalamnya dibuat secara dinamis.
- **Implementasi**: Diambil dari `services/api.ts`, data QR code dibuat dengan format:
  ```
  PIKET-XE8-YYYYMMDD
  ```
  Contoh: Untuk tanggal 7 Oktober 2025, *payload*-nya adalah `PIKET-XE8-20251007`.

### Validasi dan Keamanan
- **Validasi Sisi Klien**: Saat siswa memindai QR code, fungsi `api.scanPiketQR` di `services/api.ts` akan membuat *payload* yang diharapkan untuk hari itu dan membandingkannya dengan hasil pindaian. Jika tidak cocok, absensi akan ditolak.
- **Keamanan**: Mekanisme ini memastikan bahwa:
    1.  Hanya QR code yang dihasilkan dari aplikasi pada hari yang sama yang valid.
    2.  Siswa tidak bisa menggunakan *screenshot* QR code dari hari sebelumnya.
    3.  Siswa tidak bisa memindai QR code acak.

### Proses Pemindaian
- **Library**: Aplikasi menggunakan `html5-qrcode` untuk mengakses kamera perangkat dan memproses gambar QR code langsung di browser.
- **Alur**:
    1.  Siswa menekan tombol "Scan QR".
    2.  Aplikasi meminta izin akses kamera.
    3.  Setelah diizinkan, pemindai aktif.
    4.  Setelah QR code terdeteksi, data hasil pindaian dikirim ke fungsi validasi.

## 2. Gamifikasi
Untuk membuat piket lebih menarik dan memotivasi, aplikasi ini mengadopsi elemen-elemen gamifikasi.

### Sistem Poin Pengalaman (XP)
Siswa mendapatkan XP untuk setiap tugas piket yang diselesaikan dan dinilai.
- **Kalkulasi XP**: Berdasarkan `constants/SETTINGS`, formula perhitungan XP adalah:
  `Total XP = (XP Dasar) + (Bonus Foto) + (Rata-rata Rating * Pengali Rating)`
  - **Contoh**: `25 (selesai) + 15 (ada foto) + (4.5 * 5) = 62.5`, dibulatkan menjadi 63 XP.
- **Tujuan**: Mendorong siswa untuk tidak hanya menyelesaikan piket, tetapi juga melakukannya dengan kualitas terbaik untuk mendapatkan rating tinggi.

### Level dan Peringkat
- **Level**: Total XP yang terakumulasi akan meningkatkan level siswa, memberikan rasa kemajuan.
- **Leaderboard**: Halaman Leaderboard menampilkan semua siswa yang diurutkan berdasarkan XP tertinggi, menciptakan kompetisi yang sehat. Peringkat dihitung ulang setiap kali data siswa diperbarui.

### Badge (Lencana)
Siswa dapat memperoleh *badge* untuk pencapaian tertentu, yang dapat dilihat di halaman profil mereka.
- **Contoh Badge**:
    - **Pekerja Keras**: Selesaikan 10 piket.
    - **Bintang Kebersihan**: Dapatkan rata-rata rating di atas 4.5.
    - **Rajin Pangkal Pandai**: Piket 5 hari berturut-turut.
- **Implementasi**: Logika untuk memeriksa perolehan *badge* ada di fungsi `api.getProfileData` di `services/api.ts`.

## 3. Dukungan Offline (Offline-First)
Aplikasi ini dirancang untuk tetap berfungsi bahkan dengan koneksi internet yang tidak stabil.

### Sistem Antrian (Queue)
- **Masalah**: Jika siswa melakukan absensi saat perangkatnya offline, permintaan ke Google Apps Script akan gagal.
- **Solusi**: Aplikasi ini memiliki sistem antrian lokal.
    - Jika permintaan `syncAbsensiToSheets` gagal, data absensi (`qrData`, `nama`, `timestamp`) akan disimpan dalam array di `localStorage` dengan kunci **`pending_absensi`**.
    - Notifikasi "queued" akan ditampilkan kepada pengguna, memberitahukan bahwa data mereka aman dan akan disinkronkan nanti.

### Mekanisme Sinkronisasi
- **Pemicu**: Sinkronisasi terjadi setiap kali `api.fetchAndSyncAbsensi` dipanggil (misalnya, saat aplikasi dimuat atau secara berkala).
- **Proses**:
    1.  **Kirim Antrian**: Aplikasi memeriksa apakah ada item di `pending_absensi`. Jika ada, ia akan mencoba mengirim setiap item dalam antrian ke backend.
    2.  **Ambil Data Baru**: Setelah mencoba mengosongkan antrian, aplikasi mengambil data terbaru dari Google Sheets.
    3.  **Gabungkan Data**: Data dari server digabungkan dengan data lokal untuk memastikan tampilan selalu konsisten.

## 4. Pembaruan Real-time
Untuk memastikan data (terutama di dasbor admin) selalu segar, aplikasi ini menggunakan strategi pembaruan semi-real-time.

### Strategi Polling
- **Implementasi**: Komponen `RealtimeDataProvider` di `App.tsx` berisi `setInterval` yang memanggil fungsi `syncData` setiap **10 detik**.
- **Tujuan**: `syncData` akan memanggil `api.fetchAndSyncAbsensi`, yang mengambil data absensi terbaru dari backend. Ini memungkinkan dasbor admin untuk secara otomatis memperbarui status siswa yang sudah atau belum piket tanpa perlu me-refresh halaman.

### Invalidasi Cache
- **Masalah**: Untuk mempercepat pemuatan, aplikasi menyimpan data dari Google Sheets dalam *cache* memori selama 1 menit. Namun, *polling* setiap 10 detik bisa jadi percuma jika *cache* masih aktif.
- **Solusi**: Logika `syncData` di `App.tsx` memiliki pengecualian: *timer* `lastSync` tidak akan menghentikan proses *polling* jika itu adalah pemuatan pertama (`loading` masih `true`), memastikan data selalu diambil saat aplikasi pertama kali dibuka.

## 5. Operasi Bulk untuk Admin
Untuk efisiensi, admin memiliki kemampuan untuk melakukan operasi pada banyak data sekaligus.

### Pembuatan Laporan Massal
- **Fitur**: Halaman "Create Report" (`/admin/laporan/create`) memungkinkan admin untuk membuat laporan bagi beberapa siswa sekaligus dalam satu antarmuka.
- **Alur**: Admin dapat memilih beberapa siswa yang telah menyelesaikan piket pada hari itu dan mengisi detail laporan untuk mereka secara berurutan, mempercepat proses pemberian nilai dan XP.
- **Implementasi**: `CreateReportPage.tsx` mengelola *state* untuk beberapa formulir laporan dan memanggil `api.createLaporan` secara berulang untuk setiap siswa yang dipilih.

---
*Terakhir diperbarui: 7 Oktober 2025*