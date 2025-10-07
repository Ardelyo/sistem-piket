# 🛠️ Troubleshooting & Solusi

<a href="./README.md">Dokumentasi</a> / Troubleshooting

Halaman ini berisi daftar masalah umum yang mungkin Anda temui saat menggunakan atau mengembangkan aplikasi Piket Digital X-E8, beserta solusi langkah demi langkah untuk mengatasinya.

## 📜 Daftar Isi
- [Masalah Pengguna Umum](#-masalah-pengguna-umum)
  - [1. Gagal Login](#1-gagal-login)
  - [2. QR Code Tidak Bisa Dipindai atau Tidak Valid](#2-qr-code-tidak-bisa-dipindai-atau-tidak-valid)
  - [3. Kamera Tidak Muncul Saat Scan QR](#3-kamera-tidak-muncul-saat-scan-qr)
  - [4. Data Terlihat Usang atau Tidak Sinkron](#4-data-terlihat-usang-atau-tidak-sinkron)
  - [5. Aplikasi Berjalan Lambat](#5-aplikasi-berjalan-lambat)
- [Masalah Teknis (Developer)](#-masalah-teknis-developer)
  - [6. Error CORS di Console Browser](#6-error-cors-di-console-browser)
  - [7. Data dari Google Sheets Tidak Muncul](#7-data-dari-google-sheets-tidak-muncul)
  - [8. Perubahan pada Google Apps Script Tidak Efektif](#8-perubahan-pada-google-apps-script-tidak-efektif)
  - [9. Konflik Sinkronisasi Data Offline](#9-konflik-sinkronisasi-data-offline)

---

## 🤷‍♂️ Masalah Pengguna Umum

### 1. Gagal Login
- **Masalah**: Anda yakin nama dan password sudah benar, tetapi tidak bisa masuk.
- **Penyebab Umum**:
    1.  Salah memilih peran (misalnya, mencoba login sebagai "Admin" padahal Anda "Siswa").
    2.  Kesalahan pengetikan (typo) pada nama lengkap, termasuk spasi ganda.
    3.  Password salah (ingat, defaultnya adalah nama depan huruf kecil).
- **Solusi**:
    1.  Pastikan *toggle* peran sudah diatur dengan benar ("Siswa" atau "Admin").
    2.  Ketik ulang nama lengkap Anda dengan hati-hati. Salin dari daftar siswa jika perlu.
    3.  Hubungi admin (Ardellio/Novita) untuk konfirmasi password atau melakukan reset.

### 2. QR Code Tidak Bisa Dipindai atau Tidak Valid
- **Masalah**: Saat memindai, aplikasi menampilkan error "QR Code tidak valid atau sudah kadaluarsa".
- **Penyebab Umum**:
    1.  Admin belum membuat QR code baru untuk hari ini.
    2.  Anda mencoba memindai *screenshot* QR code dari hari sebelumnya.
- **Solusi**:
    1.  Pastikan QR code yang ditampilkan adalah yang terbaru. Minta admin untuk membuka menu "Generate QR" untuk memastikan.
    2.  Jangan gunakan QR code lama. Pindai langsung dari layar yang disediakan admin.

### 3. Kamera Tidak Muncul Saat Scan QR
- **Masalah**: Halaman pemindai QR hanya menampilkan layar hitam atau pesan error, tanpa tampilan kamera.
- **Penyebab Umum**: Izin akses kamera untuk situs ini telah diblokir oleh browser.
- **Solusi**:
    1.  **Periksa Izin**: Di bilah alamat browser, cari ikon gembok atau kamera. Klik ikon tersebut.
    2.  **Izinkan Kamera**: Akan muncul menu dropdown atau opsi. Pastikan "Kamera" diatur ke **"Allow"** atau **"Izinkan"**.
    3.  **Muat Ulang Halaman**: Setelah izin diberikan, segarkan (refresh) halaman aplikasi dan coba lagi.

### 4. Data Terlihat Usang atau Tidak Sinkron
- **Masalah**: Peringkat leaderboard atau status piket teman Anda sepertinya belum diperbarui.
- **Penyebab Umum**:
    1.  Koneksi internet Anda lambat atau terputus.
    2.  Cache data di browser Anda belum diperbarui.
- **Solusi**:
    1.  Pastikan Anda memiliki koneksi internet yang stabil.
    2.  Lakukan **hard refresh**:
        - Di PC: Tekan `Ctrl + Shift + R` (atau `Cmd + Shift + R` di Mac).
        - Di mobile: Tutup tab browser dan buka kembali, atau cari opsi "Reload" di menu browser.
    3.  Ini akan memaksa aplikasi untuk mengabaikan cache dan mengambil data terbaru dari server.

### 5. Aplikasi Berjalan Lambat
- **Masalah**: Aplikasi terasa lambat saat memuat halaman atau data.
- **Penyebab Umum**: Banyaknya data yang disimpan di `localStorage` setelah penggunaan jangka panjang.
- **Solusi**:
    1.  **Bersihkan Cache Browser**: Masuk ke pengaturan browser Anda dan bersihkan data situs untuk aplikasi ini.
    2.  **Peringatan**: Melakukan ini akan menghapus data login Anda dan data offline. Anda perlu login ulang. Aplikasi akan mengambil data baru dari server setelahnya.

## 👨‍💻 Masalah Teknis (Developer)

### 6. Error CORS di Console Browser
- **Masalah**: Anda melihat error `Cross-Origin Resource Sharing` di console saat `fetch` ke URL Google Apps Script.
- **Penyebab**: Ini adalah perilaku yang **diharapkan**. Google Apps Script tidak mengizinkan permintaan `fetch` lintas domain secara default.
- **Solusi**:
    - **Untuk GET**: Jangan gunakan `fetch`. Aplikasi sudah menggunakan **JSONP**, yang membungkus permintaan dalam tag `<script>`. Ini adalah *workaround* yang disengaja. Lihat `fetchAbsensiFromSheets` di `services/api.ts`.
    - **Untuk POST**: Gunakan `fetch` dengan opsi `mode: 'no-cors'`. Ini adalah strategi "fire-and-forget". Anda tidak akan bisa membaca responsnya, tetapi permintaan akan terkirim.

### 7. Data dari Google Sheets Tidak Muncul
- **Masalah**: Data yang Anda ubah di Google Sheets tidak muncul di aplikasi.
- **Penyebab Umum**:
    1.  Izin akses pada deployment Google Apps Script salah.
    2.  Nama *sheet* atau nama kolom di Google Sheets tidak cocok dengan yang diharapkan oleh skrip.
    3.  Skrip itu sendiri memiliki bug.
- **Solusi**:
    1.  **Periksa Deployment**: Buka **Deploy > Manage deployments**, edit deployment Anda, dan pastikan **"Who has access"** diatur ke **`Anyone`**.
    2.  **Periksa Nama**: Pastikan nama *sheet* (misal: `ABSENSI`) dan headernya (misal: `jamMasuk`) sama persis dengan yang digunakan di kode.
    3.  **Debug Skrip**: Gunakan `Logger.log()` di dalam `Code.gs` dan periksa lognya melalui menu **Executions** di Apps Script.

### 8. Perubahan pada Google Apps Script Tidak Efektif
- **Masalah**: Anda sudah mengubah dan menyimpan `Code.gs`, tetapi aplikasi masih menggunakan logika lama.
- **Penyebab**: Perubahan pada Apps Script **tidak aktif** sampai Anda membuat **deployment baru**.
- **Solusi**:
    1.  Di editor Apps Script, klik **Deploy > New deployment**.
    2.  Ini akan membuat versi baru dari Web App Anda dengan kode terbaru.
    3.  **Penting**: URL *deployment* mungkin tidak berubah, tetapi kode yang dieksekusi di baliknya akan menjadi yang terbaru.

### 9. Konflik Sinkronisasi Data Offline
- **Masalah**: Bagaimana jika pengguna mengedit data saat offline, dan data yang sama diubah di server?
- **Penyebab**: Arsitektur saat ini tidak memiliki mekanisme resolusi konflik yang canggih.
- **Solusi (Strategi Saat Ini)**:
    - **Server Wins**: Logika di `fetchAndSyncAbsensi` memprioritaskan data dari server (Google Sheets). Jika ada absensi dengan nama yang sama pada hari yang sama, data dari *sheet* akan menimpa data lokal jika *sheet* memiliki data yang lebih lengkap (misalnya, sudah ada `jamKeluar`).
    - Ini adalah pendekatan yang sederhana dan dapat diprediksi, meskipun bisa menimpa perubahan lokal.

---
*Terakhir diperbarui: 7 Oktober 2025*