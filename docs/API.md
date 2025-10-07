# 📡 Referensi REST API

<a href="./README.md">Dokumentasi</a> / Referensi API

Dokumen ini menyediakan referensi lengkap untuk "REST API" yang digunakan oleh aplikasi Piket Digital X-E8. Meskipun tidak ada server REST tradisional, file `services/api.ts` di frontend dan `Code.gs` di backend (Google Apps Script) bekerja sama untuk mensimulasikan perilaku API.

## 📜 Daftar Isi
- [Konfigurasi Dasar](#-konfigurasi-dasar)
  - [Base URL](#base-url)
  - [Header Autentikasi](#header-autentikasi)
- [Penting: Penanganan CORS & JSONP](#-penting-penanganan-cors--jsonp)
- [Endpoint GET](#-endpoint-get)
  - [`getAbsensiToday`](#getabsensitoday)
  - [`getAllJadwal`](#getalljadwal)
  - [`getStudents`](#getstudents)
  - [`getLeaderboard`](#getleaderboard)
  - [`getStatistics`](#getstatistics)
- [Endpoint POST](#-endpoint-post)
  - [`absensi` (Scan QR)](#absensi-scan-qr)
  - [`createLaporan`](#createlaporan)
  - [`updateJadwal`](#updatejadwal-contoh)
  - [`addPelanggaran`](#addpelanggaran)
- [Struktur Respons & Kode Error](#-struktur-respons--kode-error)
- [Rate Limiting & Kuota](#-rate-limiting--kuota)

---

## ⚙️ Konfigurasi Dasar

### Base URL
Semua permintaan API ditujukan ke satu URL, yaitu URL deployment Google Apps Script sebagai Web App.

- **URL**: `https://script.google.com/macros/s/AKfycbyvr3xRpQmRLY6I8FNT5AHi6jK7c8SkngrdkQ_YaxguDZ9v5-aHGjxmczN7BnCllecw/exec`

Setiap "endpoint" dibedakan oleh parameter `action` yang dikirim dalam *query string* (untuk GET) atau *body* (untuk POST).

### Header Autentikasi
Aplikasi ini tidak menggunakan header autentikasi standar seperti `Authorization: Bearer <token>`. Autentikasi dan otorisasi sepenuhnya ditangani di sisi klien. Data pengguna yang telah login disimpan di `AuthContext` dan digunakan untuk menentukan data apa yang boleh diakses atau dimodifikasi.

## ⚠️ Penting: Penanganan CORS & JSONP
Karena frontend (di Vercel) dan backend (di `script.google.com`) berada di domain yang berbeda, browser akan memblokir permintaan HTTP karena kebijakan **CORS** (*Cross-Origin Resource Sharing*). Aplikasi ini menggunakan dua teknik untuk mengatasinya:

1.  **JSONP (JSON with Padding) untuk `GET` Request**:
    - Frontend tidak menggunakan `fetch()` standar untuk GET. Sebaliknya, ia secara dinamis membuat tag `<script>` di dalam HTML.
    - URL skrip ini menunjuk ke Google Apps Script dan menyertakan parameter `?callback=namaFungsiUnik`.
    - Backend Google Apps Script tidak mengembalikan JSON biasa, melainkan string JavaScript yang membungkus data JSON di dalam pemanggilan fungsi tersebut: `namaFungsiUnik({ "data": "..." });`.
    - Ketika skrip ini dimuat, browser akan mengeksekusi fungsi *callback* tersebut, sehingga frontend dapat menerima datanya.
    - Ini adalah *workaround* klasik untuk batasan CORS pada permintaan `GET`.

2.  **`mode: 'no-cors'` untuk `POST` Request**:
    - Untuk mengirim data, frontend menggunakan `fetch()` dengan opsi `mode: 'no-cors'`.
    - Ini memungkinkan permintaan `POST` dikirim, tetapi dengan batasan besar: frontend **tidak bisa membaca respons** dari server (baik *body* maupun status code).
    - Ini adalah strategi "fire-and-forget". Frontend mengirim data dan berharap backend berhasil memprosesnya tanpa menunggu konfirmasi. Penanganan *error* untuk skenario ini menjadi lebih sulit dan bergantung pada sinkronisasi berikutnya.

## ▶️ Endpoint GET
Permintaan `GET` ditangani oleh fungsi `doGet(e)` di Google Apps Script.

### `getAbsensiToday`
Mengambil daftar siswa yang sudah melakukan absensi pada hari ini.

- **Action**: `getAbsensiToday`
- **Contoh Request (JSONP)**:
  ```html
  <script src=".../exec?action=getAbsensiToday&callback=jsonp_callback_123"></script>
  ```
- **Contoh Response (JavaScript/JSONP)**:
  ```javascript
  jsonp_callback_123({
    "success": true,
    "data": [
      {
        "id": 1,
        "tanggal": "2025-10-07",
        "nama": "Ardellio Satria Anindito",
        "jamMasuk": "14:35",
        "jamKeluar": "15:02",
        "durasi": 27,
        "fotoUrl": "https://ui-avatars.com/...",
        "verified": true
      }
    ]
  });
  ```

---
*Catatan: Endpoint GET lainnya seperti `getAllJadwal`, `getStudents`, dll., disimulasikan di `services/api.ts` dan mengambil data dari `localStorage` untuk kecepatan, bukan dari backend secara langsung setiap saat.*

## ⏩ Endpoint POST
Permintaan `POST` ditangani oleh fungsi `doPost(e)` di Google Apps Script.

### `absensi` (Scan QR)
Mengirimkan data absensi baru setelah siswa berhasil memindai QR code.

- **Action**: `absensi`
- **Contoh Request Body (`URLSearchParams`)**:
  ```
  action=absensi
  qrData=PIKET-XE8-20251007
  nama=Ardellio Satria Anindito
  timestamp=2025-10-07T14:35:00.000Z
  ```
- **Contoh Response**: Tidak ada respons yang dapat dibaca oleh klien karena `mode: 'no-cors'`. Aplikasi akan menambahkan data ke `localStorage` secara lokal dan memasukkannya ke antrian sinkronisasi jika perlu.

### `createLaporan`
Mengirimkan data laporan piket baru yang dibuat oleh admin.

- **Action**: `createLaporan` (disimulasikan, di backend bisa jadi satu endpoint `updateSheet`)
- **Contoh Request Body**:
  ```json
  {
    "action": "createLaporan",
    "laporanData": {
      "tanggal": "2025-10-07",
      "nama": "Ardellio Satria Anindito",
      "rating": { "lantai": 5, "papanTulis": 5, "meja": 4, "sampah": 5 },
      "tasks": { "Sapu lantai": true, "Buang sampah": true },
      "catatan": "Bersih",
      "fotoBukti": ["..."],
      "xp": 70,
      "status": "submitted"
    }
  }
  ```
- **Contoh Response**: Tidak ada.

### `updateJadwal` (Contoh)
Memperbarui jadwal piket untuk satu hari.

- **Action**: `updateJadwal`
- **Contoh Request Body**:
  ```json
  {
    "action": "updateJadwal",
    "hari": "Senin",
    "siswa": ["Gisella Anastasya", "Keiza Putri Maharani", "Amar Ma'ruf"]
  }
  ```
- **Contoh Response**: Tidak ada.

### `addPelanggaran`
Menambahkan catatan pelanggaran baru untuk seorang siswa.

- **Action**: `addPelanggaran`
- **Contoh Request Body**:
  ```json
  {
    "action": "addPelanggaran",
    "pelanggaran": {
      "tanggal": "2025-10-06",
      "nama": "Pandu Wijaya",
      "jenisPelanggaran": "Tidak piket",
      "poin": 10,
      "sanksi": "Piket 2x lipat"
    }
  }
  ```
- **Contoh Response**: Tidak ada.

## 📦 Struktur Respons & Kode Error
Karena keterbatasan `no-cors` dan JSONP, penanganan *error* HTTP standar (seperti status 404 atau 500) tidak dapat dilakukan dengan andal.

- **Respons Sukses (Lokal)**: Fungsi di `services/api.ts` mengembalikan objek dengan format:
  ```typescript
  {
    success: boolean,
    message: string,
    data: T | null // T adalah tipe data yang relevan
  }
  ```
- **Error Jaringan**: Jika `fetch()` gagal (misalnya, tidak ada koneksi), *promise* akan di-*reject*, dan blok `catch` akan dieksekusi. Aplikasi kemudian mengandalkan mekanisme antrian *offline*.
- **Error Logika (Contoh: QR Code Salah)**: Fungsi lokal akan mengembalikan `{ success: false, message: 'QR Code tidak valid...' }`.

## 🕒 Rate Limiting & Kuota
Aplikasi ini tidak memiliki logika *rate limiting* sendiri. Namun, ia tunduk pada [kuota dan batasan Google Services](https://developers.google.com/apps-script/guides/services/quotas). Beberapa batasan yang relevan:
- **Waktu eksekusi skrip**: Maksimal 6 menit per eksekusi.
- **Panggilan URL Fetch**: Jumlah panggilan keluar dari Google Apps Script dibatasi per hari.
- **Pengguna serentak**: Jumlah pengguna yang dapat menjalankan skrip secara bersamaan terbatas.

Jika kuota terlampaui, Google Apps Script akan berhenti merespons atau mengembalikan *error*, yang akan dideteksi oleh aplikasi sebagai kegagalan jaringan.

---
*Terakhir diperbarui: 7 Oktober 2025*