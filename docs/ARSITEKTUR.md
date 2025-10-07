# 🏗️ Arsitektur Sistem Piket Digital X-E8

<a href="./README.md">Dokumentasi</a> / Arsitektur

Dokumen ini memberikan gambaran umum tingkat tinggi tentang arsitektur teknis aplikasi Piket Digital X-E8.

## 📜 Daftar Isi
- [Gambaran Umum](#-gambaran-umum)
- [Diagram Arsitektur](#-diagram-arsitektur)
- [Komponen Utama](#-komponen-utama)
  - [Frontend (React + Vite)](#frontend-react--vite)
  - [Backend (Google Apps Script)](#backend-google-apps-script)
  - [Database (Google Sheets)](#database-google-sheets)
- [Alur Data](#-alur-data)
- [Pendekatan State Management](#-pendekatan-state-management)
- [Alur Autentikasi](#-alur-autentikasi)
- [Arsitektur Offline-First](#-arsitektur-offline-first)
- [Strategi Caching](#-strategi-caching)
- [Langkah-langkah Keamanan](#-langkah-langkah-keamanan)

---

## 🖼️ Gambaran Umum

Aplikasi ini mengadopsi arsitektur **hybrid client-server** yang unik. Frontend adalah **Single Page Application (SPA)** modern yang dibuat dengan React, sementara backend adalah **Web App** yang di-deploy menggunakan Google Apps Script, dengan Google Sheets yang berfungsi sebagai database utamanya.

Arsitektur ini dipilih karena beberapa alasan:
1.  **Biaya Rendah**: Memanfaatkan platform Google yang gratis (Sheets, Apps Script).
2.  **Kemudahan Akses**: Guru dan admin dapat dengan mudah melihat dan mengedit data langsung di Google Sheets.
3.  **Pengembangan Cepat**: Memungkinkan pengembangan frontend yang kaya fitur sambil menjaga backend tetap sederhana.
4.  **Dukungan Offline**: Frontend dirancang untuk bekerja secara offline, menyinkronkan data saat koneksi tersedia kembali.

## 📊 Diagram Arsitektur

Diagram berikut mengilustrasikan alur interaksi antara komponen-komponen utama sistem.

```mermaid
graph TD
    subgraph Pengguna
        A[Browser Pengguna]
    end

    subgraph Infrastruktur Frontend (Vercel)
        B[Aplikasi React (Vite + TypeScript)]
    end

    subgraph Infrastruktur Backend (Google Workspace)
        C[Google Apps Script Web App]
        D[Google Sheets Database]
    end

    subgraph Penyimpanan Lokal
        E[localStorage (Cache & Offline Queue)]
    end

    A -- Memuat Aplikasi --> B
    B -- Menggunakan Data Lokal --> E
    B -- Sinkronisasi (JSONP untuk GET, no-cors POST) --> C
    C -- Membaca/Menulis Data --> D

    style B fill:#61DAFB,stroke:#333,stroke-width:2px
    style C fill:#F4B400,stroke:#333,stroke-width:2px
    style D fill:#34A853,stroke:#333,stroke-width:2px
    style E fill:#f2f2f2,stroke:#333,stroke-width:2px
```

## 🧩 Komponen Utama

### Frontend (React + Vite)
- **Framework**: [React](https://reactjs.org/) dengan [TypeScript](https://www.typescriptlang.org/) untuk type safety.
- **Build Tool**: [Vite](https://vitejs.dev/) untuk pengembangan dan build yang sangat cepat.
- **Routing**: `react-router-dom` digunakan untuk navigasi sisi klien dalam SPA.
- **UI Components**: Komponen UI kustom dibangun dengan bantuan [Heroicons](https://heroicons.com/) untuk ikonografi.
- **Fitur**: Pemindaian QR Code diimplementasikan menggunakan `html5-qrcode`.
- **Deployment**: Di-host di platform [Vercel](https://vercel.com).

### Backend (Google Apps Script)
- **Lingkungan**: Berjalan di server Google sebagai [Web App](https://developers.google.com/apps-script/guides/web).
- **Fungsi Utama**:
    - Menerima request `GET` dan `POST` dari frontend.
    - `doGet()`: Menangani pengambilan data (misalnya, `getAbsensiToday`) dan mengembalikannya dalam format JSONP untuk mengatasi batasan CORS.
    - `doPost()`: Menangani pengiriman data (misalnya, absensi baru, laporan).
    - Berinteraksi langsung dengan Google Sheets API untuk operasi CRUD (Create, Read, Update, Delete).
- Lihat [Dokumentasi Google Apps Script](./GOOGLE_APPS_SCRIPT.md) untuk detail lebih lanjut.

### Database (Google Sheets)
- **Struktur**: Setiap *sheet* dalam satu file Google Spreadsheet bertindak sebagai "tabel" data.
- **Tabel Utama**: `SISWA`, `JADWAL`, `ABSENSI`, `LAPORAN`, `PELANGGARAN`, `XP_LOGS`.
- **Akses**: Data dapat diakses dan dimodifikasi langsung melalui antarmuka Google Sheets oleh admin yang berwenang, serta secara terprogram oleh Google Apps Script.
- Lihat [Dokumentasi Database](./DATABASE.md) untuk skema lengkap.

## 🔄 Alur Data

Aplikasi ini menggunakan model data hybrid:

1.  **Inisialisasi**: Saat aplikasi dimuat, ia mencoba memuat data dari `localStorage`. Jika tidak ada, ia menggunakan data statis dari `constants/database.ts`.
2.  **Operasi Lokal**: Semua operasi (misalnya, login, melihat jadwal) pada awalnya berinteraksi dengan data yang ada di memori atau `localStorage`. Ini membuat aplikasi terasa sangat cepat dan responsif.
3.  **Sinkronisasi Latar Belakang**:
    - **Pengambilan Data (GET)**: Secara berkala (`RealtimeDataContext`), aplikasi mengirimkan permintaan JSONP ke Google Apps Script untuk mengambil data terbaru (misalnya, data absensi hari ini). Data ini kemudian digabungkan dengan data lokal.
    - **Pengiriman Data (POST)**: Saat tindakan yang memerlukan sinkronisasi terjadi (misalnya, absen), aplikasi mengirimkan permintaan `POST` ke Google Apps Script.
    - **Mode "Fire and Forget"**: Permintaan `POST` dikirim dengan `mode: 'no-cors'`, yang berarti frontend tidak menunggu respons. Ini dilakukan untuk kecepatan, dengan asumsi data akan berhasil disimpan.

## 📦 Pendekatan State Management

State management aplikasi ditangani melalui kombinasi React Hooks dan Context API, bukan library pihak ketiga yang kompleks seperti Redux.

- **`useAuth()`**: Mengelola status autentikasi pengguna (siapa yang login, rolenya apa).
- **`useRealtimeData()`**: Mengelola data yang sering berubah (seperti absensi hari ini) dan logika polling/sinkronisasi.
- **`useNotification()`**: Mengelola notifikasi yang ditampilkan kepada pengguna.
- **State Lokal (`useState`, `useReducer`)**: Digunakan di dalam komponen untuk state yang bersifat lokal dan tidak perlu dibagikan secara global.

## 🔐 Alur Autentikasi

1.  Pengguna memasukkan kredensial di `LoginPage`.
2.  `api.login()` dipanggil, yang memvalidasi kredensial terhadap data `ADMIN` atau `SISWA` di `localStorage`.
3.  Jika berhasil, data pengguna (termasuk peran: `Admin` atau `Siswa`) disimpan dalam `AuthContext`.
4.  Aplikasi menggunakan komponen `ProtectedRoute` untuk memeriksa `AuthContext`. Jika tidak ada pengguna, pengguna akan dialihkan kembali ke halaman login.
5.  Komponen `AdminLayoutRoute` dan `StudentLayoutRoute` selanjutnya mengarahkan pengguna ke *layout* yang sesuai berdasarkan peran mereka, mencegah siswa mengakses dasbor admin dan sebaliknya.

## 📴 Arsitektur Offline-First

Aplikasi ini dirancang untuk tetap fungsional meskipun koneksi internet terputus.

1.  **Penyimpanan Lokal**: Seluruh database (siswa, jadwal, laporan, dll.) disimpan dalam `localStorage` sebagai cadangan.
2.  **Antrian Offline (`Offline Queue`)**: Jika pengguna melakukan absensi saat offline, data absensi tidak hilang. Sebaliknya, data tersebut disimpan dalam antrian khusus di `localStorage` (`pending_absensi`).
3.  **Mekanisme Sinkronisasi**: Saat koneksi internet pulih dan fungsi `fetchAndSyncAbsensi` dijalankan, aplikasi akan:
    - Pertama, mencoba mengirim semua data dari antrian `pending_absensi` ke Google Sheets.
    - Kedua, mengambil data terbaru dari Google Sheets.
    - Ketiga, menggabungkan data dari server dengan data lokal.

##  caching Strategi Caching

Untuk mengurangi jumlah panggilan ke Google Apps Script dan mempercepat pemuatan data, strategi caching sederhana diimplementasikan di `services/api.ts`:

- Data yang diambil dari Google Sheets (khususnya absensi) disimpan dalam variabel `sheetsCache` di memori.
- Sebuah *timestamp* dicatat saat cache disimpan.
- Sebelum melakukan panggilan jaringan baru, aplikasi memeriksa apakah cache masih valid (misalnya, kurang dari 1 menit). Jika ya, data dari cache akan digunakan.

## 🛡️ Langkah-langkah Keamanan

Meskipun aplikasi ini bersifat internal untuk kelas, beberapa langkah keamanan dasar telah diterapkan:

- **Kontrol Akses Berbasis Peran (RBAC)**: Pemisahan tegas antara rute dan fungsi yang dapat diakses oleh `Siswa` dan `Admin`.
- **Validasi QR Code**: QR code berisi *payload* yang diharapkan (`PIKET-XE8-${tanggal}`), mencegah pemindaian QR code acak.
- **Secret Key Sederhana**: `PIKET_SECRET_KEY` digunakan dalam logika internal, meskipun ini lebih berfungsi sebagai *obfuscation* daripada keamanan yang kuat karena berada di sisi klien.

---
*Terakhir diperbarui: 7 Oktober 2025*