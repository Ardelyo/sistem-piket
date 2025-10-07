# 🚀 Panduan Deployment

<a href="./README.md">Dokumentasi</a> / Deployment

Dokumen ini menjelaskan proses *deployment* langkah demi langkah untuk aplikasi Piket Digital X-E8. Proses ini terbagi menjadi dua bagian utama: *deployment* backend (Google Apps Script) dan *deployment* frontend (React App di Vercel).

## 📜 Daftar Isi
- [Bagian 1: Setup Backend (Google Sheets & Apps Script)](#-bagian-1-setup-backend-google-sheets--apps-script)
  - [Langkah 1: Siapkan Google Sheet](#langkah-1-siapkan-google-sheet)
  - [Langkah 2: Buat dan Konfigurasi Google Apps Script](#langkah-2-buat-dan-konfigurasi-google-apps-script)
  - [Langkah 3: Deploy Script sebagai Web App](#langkah-3-deploy-script-sebagai-web-app)
- [Bagian 2: Setup Frontend (Vercel)](#-bagian-2-setup-frontend-vercel)
  - [Langkah 4: Persiapan Kode Frontend](#langkah-4-persiapan-kode-frontend)
  - [Langkah 5: Deploy ke Vercel](#langkah-5-deploy-ke-vercel)
  - [Langkah 6: Konfigurasi Domain dan SSL](#langkah-6-konfigurasi-domain-dan-ssl)
- [Bagian 3: Pemeliharaan](#-bagian-3-pemeliharaan)
  - [Monitoring](#monitoring)
  - [Prosedur Backup](#prosedur-backup)
  - [Strategi Rollback](#strategi-rollback)

---

## 📦 Bagian 1: Setup Backend (Google Sheets & Apps Script)

Backend aplikasi ini sepenuhnya berjalan di ekosistem Google.

### Langkah 1: Siapkan Google Sheet
Google Sheet akan berfungsi sebagai database Anda.

1.  Buat file Google Sheet baru di [Google Drive](https://sheets.new).
2.  Beri nama file tersebut, misalnya "PiketDigital_Database".
3.  Buat *sheet* (tab) terpisah untuk setiap tabel yang dibutuhkan. Ubah nama *sheet* sesuai dengan nama tabel berikut:
    - `SISWA`
    - `JADWAL`
    - `ABSENSI`
    - `LAPORAN`
    - `PELANGGARAN`
    - `XP_LOGS`
4.  Untuk setiap *sheet*, isi baris pertama dengan nama-nama kolom (header) sesuai dengan yang dijelaskan di [Dokumentasi Database](./DATABASE.md).
    - **Contoh untuk `ABSENSI`**: Baris pertama harus berisi kolom `id`, `tanggal`, `nama`, `jamMasuk`, `jamKeluar`, dan seterusnya.

### Langkah 2: Buat dan Konfigurasi Google Apps Script
1.  Dari dalam file Google Sheet Anda, klik **Extensions > Apps Script**.
2.  Ini akan membuka editor skrip yang terikat dengan *spreadsheet* Anda.
3.  Hapus semua kode *default* di file `Code.gs`.
4.  **Salin dan tempel (copy-paste)** seluruh konten dari file `Code.gs` (jika ada di repo) atau implementasikan logika backend Anda di sini. Fungsi utama yang harus ada adalah `doGet(e)` dan `doPost(e)`.
    - `doGet(e)` harus bisa menangani permintaan data dan mengembalikannya dalam format JSONP.
    - `doPost(e)` harus bisa menerima data dan menulisnya ke *sheet* yang sesuai.
5.  Simpan proyek skrip Anda.

### Langkah 3: Deploy Script sebagai Web App
Ini adalah langkah paling penting untuk membuat backend Anda dapat diakses oleh frontend.

1.  Di editor Google Apps Script, klik tombol **Deploy** di pojok kanan atas, lalu pilih **New deployment**.
2.  Klik ikon roda gigi di sebelah "Select type", lalu pilih **Web app**.
3.  Isi konfigurasi *deployment* sebagai berikut:
    - **Description**: `Piket Digital Backend v1`
    - **Execute as**: `Me (alamat.email.anda@gmail.com)`
    - **Who has access**: **`Anyone`**
      > **PENTING**: Anda **harus** memilih `Anyone`. Jika Anda memilih `Anyone, even anonymous`, itu juga bisa, tetapi `Anyone` adalah standar yang aman. Jika diatur selain itu, Vercel tidak akan bisa mengaksesnya.
4.  Klik **Deploy**.
5.  Google akan meminta Anda untuk **Authorize access**. Ikuti alur otorisasi, pilih akun Google Anda, dan berikan izin yang diperlukan (termasuk akses ke Google Sheets). Anda mungkin melihat peringatan "Google hasn't verified this app", klik "Advanced" lalu "Go to (unsafe)..." untuk melanjutkan. Ini aman karena Anda yang membuat skripnya.
6.  Setelah *deployment* berhasil, Anda akan diberikan **Web app URL**. **Salin URL ini.** Anda akan membutuhkannya untuk konfigurasi frontend.

## 🖥️ Bagian 2: Setup Frontend (Vercel)

Frontend akan di-hosting di Vercel untuk performa tinggi dan kemudahan *deployment*.

### Langkah 4: Persiapan Kode Frontend
1.  Pastikan proyek Anda sudah ada di repositori Git (GitHub, GitLab, atau Bitbucket).
2.  (Sangat Disarankan) Ubah kode di `src/services/api.ts`. Ganti URL yang di-*hardcode* dengan variabel lingkungan.
    - **Sebelum**:
      ```typescript
      const SHEETS_API_URL = 'https://script.google.com/macros/s/URL_LAMA/exec';
      ```
    - **Sesudah**:
      ```typescript
      const SHEETS_API_URL = import.meta.env.VITE_SHEETS_API_URL;
      ```
      *Vite menggunakan prefiks `VITE_` untuk variabel lingkungan.*

### Langkah 5: Deploy ke Vercel
1.  Buat akun di [Vercel](https://vercel.com) dan hubungkan dengan akun Git Anda.
2.  Dari dasbor Vercel, klik **Add New... > Project**.
3.  Pilih repositori Git proyek Anda dan klik **Import**.
4.  Vercel akan secara otomatis mendeteksi bahwa ini adalah proyek Vite dan mengkonfigurasi *build settings* dengan benar. Anda tidak perlu mengubahnya.
5.  Buka bagian **Environment Variables**.
6.  Tambahkan variabel baru:
    - **Name**: `VITE_SHEETS_API_URL`
    - **Value**: Tempelkan **Web app URL** yang Anda salin dari Google Apps Script pada Langkah 3.
7.  Klik **Deploy**. Vercel akan memulai proses *build* dan *deployment*. Setelah selesai, aplikasi Anda akan live!

### Langkah 6: Konfigurasi Domain dan SSL
- **Domain Kustom**: Di dasbor proyek Vercel Anda, buka tab **Settings > Domains**. Anda bisa menambahkan domain kustom yang sudah Anda miliki.
- **Sertifikat SSL**: Vercel secara otomatis menyediakan dan memperbarui sertifikat SSL untuk semua domain yang terhubung, tanpa biaya tambahan.

## 🛠️ Bagian 3: Pemeliharaan

### Monitoring
- **Vercel Analytics**: Vercel menyediakan fitur *Analytics* (berbayar) untuk memonitor lalu lintas dan performa situs Anda.
- **Google Apps Script Dashboard**: Di dasbor Google Cloud Platform yang terkait dengan proyek Apps Script Anda, Anda dapat melihat metrik eksekusi, tingkat *error*, dan penggunaan kuota.

### Prosedur Backup
- **Frontend**: Kode Anda sudah aman di repositori Git, yang berfungsi sebagai *backup*.
- **Backend (Data)**: Google Sheets memiliki fitur **Version History** (File > Version history) yang memungkinkan Anda mengembalikan data ke titik waktu tertentu. Untuk keamanan ekstra, Anda bisa membuat salinan *spreadsheet* secara berkala.

### Strategi Rollback
- **Frontend (Vercel)**: Setiap *deployment* di Vercel bersifat *immutable*. Di dasbor proyek Vercel Anda, buka tab **Deployments**. Anda dapat dengan mudah mengklik *deployment* sebelumnya dan mempromosikannya kembali ke produksi (klik tombol "...") untuk melakukan *rollback* instan.
- **Backend (Google Apps Script)**: Di editor Apps Script, buka **Deploy > Manage deployments**. Pilih *deployment* Anda, klik ikon pensil (Edit), dan pada dropdown **Version**, pilih versi skrip yang lebih lama, lalu klik **Deploy**.

---
*Terakhir diperbarui: 7 Oktober 2025*