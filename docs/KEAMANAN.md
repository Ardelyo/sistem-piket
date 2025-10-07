# 🛡️ Dokumentasi Keamanan

<a href="./README.md">Dokumentasi</a> / Keamanan

Dokumen ini menguraikan berbagai aspek keamanan yang telah dipertimbangkan dan diimplementasikan dalam aplikasi Piket Digital X-E8. Mengingat ini adalah aplikasi internal untuk lingkungan kelas, tingkat keamanannya disesuaikan dengan risiko yang ada.

## 📜 Daftar Isi
- [Model Ancaman Sederhana](#-model-ancaman-sederhana)
- [Implementasi Autentikasi](#-implementasi-autentikasi)
- [Kontrol Akses Berbasis Peran (RBAC)](#-kontrol-akses-berbasis-peran-rbac)
- [Validasi dan Sanitasi Input](#-validasi-dan-sanitasi-input)
- [Generasi QR Code yang Aman](#-generasi-qr-code-yang-aman)
- [Pencegahan Serangan Umum](#-pencegahan-serangan-umum)
  - [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
  - [Cross-Site Request Forgery (CSRF)](#cross-site-request-forgery-csrf)
- [Rate Limiting](#-rate-limiting)
- [Kepatuhan Privasi Data Siswa](#-kepatuhan-privasi-data-siswa)
- [Keterbatasan Keamanan](#-keterbatasan-keamanan)

---

## 🎯 Model Ancaman Sederhana
Ancaman utama yang dimitigasi oleh sistem ini adalah:
1.  Siswa yang tidak sah (misalnya, dari kelas lain) mencoba mengakses data.
2.  Siswa mencoba memanipulasi sistem untuk mendapatkan keuntungan (misalnya, absen tanpa piket, mendapatkan XP secara tidak adil).
3.  Siswa biasa mencoba mengakses fitur admin.

## 🔑 Implementasi Autentikasi
- **Mekanisme**: Autentikasi dilakukan sepenuhnya di **sisi klien**.
- **Proses**: Fungsi `api.login` di `services/api.ts` membandingkan input pengguna dengan data yang ada di `constants/database.ts` atau `localStorage`.
- **Penyimpanan Kredensial**: Password disimpan sebagai teks biasa (`plaintext`) di dalam kode sumber dan `localStorage`. Ini adalah **kelemahan signifikan** dalam aplikasi skala besar, tetapi dapat diterima untuk proyek internal di mana kode sumber tidak dipublikasikan secara luas.

## 🚦 Kontrol Akses Berbasis Peran (RBAC)
Ini adalah pilar keamanan terkuat dalam aplikasi ini.
- **Peran**: Ada dua peran utama: `Siswa` dan `Admin` (termasuk `Sekretaris`).
- **Implementasi**:
    1.  Setelah login, peran pengguna disimpan di `AuthContext`.
    2.  Komponen `ProtectedRoute` di `App.tsx` memastikan hanya pengguna yang sudah login yang dapat mengakses halaman mana pun selain login.
    3.  Komponen `StudentLayoutRoute` dan `AdminLayoutRoute` bertindak sebagai gerbang kedua. Mereka memeriksa peran pengguna:
        - Jika seorang `Siswa` mencoba mengakses URL admin (misalnya, `/admin`), mereka akan secara otomatis dialihkan ke dasbor siswa (`/`).
        - Sebaliknya, jika `Admin` masuk, mereka akan diarahkan ke dasbor admin (`/admin`).
- **Hasil**: Pemisahan ini secara efektif mencegah pengguna biasa mengakses fitur-fitur sensitif seperti pembuatan laporan, generasi QR, atau manajemen pelanggaran.

## 📝 Validasi dan Sanitasi Input
- **Validasi Sisi Klien**: Validasi dasar dilakukan di formulir (misalnya, memastikan field tidak kosong).
- **Sanitasi Implisit**: Dengan menggunakan React, risiko serangan *Cross-Site Scripting* (XSS) dari input pengguna sangat berkurang. React secara otomatis melakukan *escaping* pada nilai yang di-render di dalam JSX, sehingga teks yang dimasukkan pengguna (misalnya, di kolom catatan) akan ditampilkan sebagai teks biasa, bukan sebagai HTML yang dapat dieksekusi.

## 🔳 Generasi QR Code yang Aman
- **Mekanisme**: QR code tidak statis. *Payload*-nya (`PIKET-XE8-YYYYMMDD`) bergantung pada tanggal saat ini.
- **Keamanan**: Fungsi `api.scanPiketQR` di sisi klien akan selalu memvalidasi hasil pindaian terhadap *payload* yang diharapkan untuk hari itu. Ini mencegah penggunaan ulang QR code lama.

## ⚔️ Pencegahan Serangan Umum

### Cross-Site Scripting (XSS)
- **Risiko**: Rendah.
- **Pencegahan**: Seperti yang disebutkan di atas, React JSX *auto-escaping* adalah pertahanan utama. Data yang dimasukkan pengguna di-render sebagai teks, bukan sebagai elemen DOM yang bisa dieksekusi.

### Cross-Site Request Forgery (CSRF)
- **Risiko**: Sangat Rendah.
- **Pencegahan**: Aplikasi ini tidak menggunakan cookie untuk manajemen sesi, yang merupakan vektor serangan utama untuk CSRF. Karena autentikasi dikelola melalui `localStorage` dan tidak ada pengiriman otomatis kredensial oleh browser, serangan CSRF menjadi tidak praktis.

## ⏱️ Rate Limiting
- **Aplikasi**: Tidak ada *rate limiting* yang diimplementasikan di level aplikasi.
- **Infrastruktur**: Aplikasi ini bergantung pada *rate limiting* dan kuota yang diberlakukan oleh **Google Services**. Jika terlalu banyak permintaan dibuat dalam waktu singkat, Google Apps Script akan sementara berhenti merespons.

## 🔒 Kepatuhan Privasi Data Siswa
- **Data yang Disimpan**: Aplikasi menyimpan nama lengkap, jadwal piket, dan data kinerja (absensi, laporan, pelanggaran).
- **Akses**: Data ini hanya dapat diakses oleh pengguna yang diautentikasi (siswa dan admin kelas X-E8).
- **Rekomendasi**: Karena data siswa terlibat, penting untuk memastikan bahwa akses ke repositori kode dan database Google Sheets dibatasi hanya untuk individu yang berwenang (misalnya, wali kelas dan pengurus kelas).

## ⚠️ Keterbatasan Keamanan
Penting untuk bersikap transparan tentang kelemahan model keamanan saat ini:
1.  **Autentikasi Sisi Klien**: Siapa pun yang memiliki pengetahuan teknis dapat membuka *DevTools* di browser, membaca `localStorage`, dan memanipulasi *state* aplikasi untuk meniru pengguna lain atau bahkan menjadi admin.
2.  **Password dalam Plaintext**: Menyimpan password sebagai teks biasa adalah praktik yang sangat tidak aman untuk aplikasi produksi.
3.  **Backend yang Terlalu Percaya**: Google Apps Script tidak melakukan validasi peran. Jika seseorang menemukan cara untuk mengirim permintaan `POST` yang valid ke URL Web App, skrip akan memprosesnya.
4.  **Kunci/Secret di Klien**: Variabel seperti `PIKET_SECRET_KEY` yang ada di `services/api.ts` dapat dengan mudah ditemukan oleh siapa saja yang memeriksa kode sumber frontend.

> **Kesimpulan**: Model keamanan saat ini **cukup** untuk tujuan aplikasi sebagai alat internal kelas. Namun, jika aplikasi ini akan digunakan secara lebih luas, perbaikan signifikan seperti memindahkan logika autentikasi dan validasi ke sisi server mutlak diperlukan.

---
*Terakhir diperbarui: 7 Oktober 2025*