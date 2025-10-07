# 👨‍💻 Panduan Developer

<a href="./README.md">Dokumentasi</a> / Panduan Developer

Dokumen ini berisi panduan teknis untuk developer yang ingin memahami, memodifikasi, atau berkontribusi pada proyek Piket Digital X-E8.

## 📜 Daftar Isi
- [Persyaratan](#-persyaratan)
- [Setup Lingkungan Pengembangan](#-setup-lingkungan-pengembangan)
- [Struktur Proyek](#-struktur-proyek)
- [Standar Koding](#-standar-koding)
- [State Management dengan React Context](#-state-management-dengan-react-context)
- [Pattern Integrasi API](#-pattern-integrasi-api)
- [Pendekatan Testing](#-pendekatan-testing)
- [Tips Debugging](#-tips-debugging)
- [Teknik Optimasi Performa](#-teknik-optimasi-performa)

---

## 📋 Persyaratan
- [Node.js](https://nodejs.org/) (versi 18 atau lebih tinggi)
- [Git](https://git-scm.com/)
- Editor kode (disarankan [VS Code](https://code.visualstudio.com/))

## 🚀 Setup Lingkungan Pengembangan
Ikuti langkah-langkah berikut untuk menjalankan proyek ini di mesin lokal Anda.

1.  **Clone Repository**
    ```bash
    git clone <URL_REPOSITORY_ANDA>
    cd piket-digitalisasi-x-e8
    ```

2.  **Install Dependencies**
    Proyek ini menggunakan `npm` sebagai package manager.
    ```bash
    npm install
    ```

3.  **Jalankan Development Server**
    Perintah ini akan memulai server pengembangan Vite di `http://localhost:5173`.
    ```bash
    npm run dev
    ```
    Aplikasi akan terbuka di browser Anda dengan *Hot Module Replacement* (HMR) yang sudah aktif.

4.  **Konfigurasi Backend (Opsional)**
    Aplikasi ini dirancang untuk bekerja secara lokal tanpa perlu koneksi ke Google Apps Script, karena ia menggunakan data dari `constants/database.ts` dan `localStorage`. Jika Anda ingin menguji integrasi penuh, Anda harus:
    - Membuat salinan Google Sheets dan Google Apps Script Anda sendiri.
    - Mengganti `SHEETS_API_URL` di `services/api.ts` dengan URL deployment skrip Anda.
    - Lihat [Panduan Deployment](./DEPLOYMENT.md) untuk detailnya.

## 📁 Struktur Proyek
Struktur folder proyek diatur berdasarkan fungsi untuk menjaga keterbacaan dan skalabilitas.

```
/
├── public/              # Aset statis
├── src/
│   ├── components/      # Komponen UI React yang dapat digunakan kembali
│   │   ├── layout/      # Komponen layout (Header, Sidebar, dll.)
│   │   └── ui/          # Komponen UI generik (Button, Spinner, Card)
│   ├── config/          # File konfigurasi aplikasi (misalnya, menu navigasi)
│   ├── constants/       # Data statis dan konstanta (misalnya, database.ts)
│   ├── contexts/        # React Context untuk state management global
│   ├── pages/           # Komponen yang merepresentasikan halaman/rute
│   │   └── admin/       # Halaman khusus admin
│   ├── services/        # Logika bisnis dan komunikasi API (api.ts)
│   ├── App.tsx          # Komponen root aplikasi dan definisi rute
│   ├── index.tsx        # Titik masuk aplikasi React
│   ├── types.ts         # Definisi tipe data TypeScript global
│   └── ...
├── .gitignore
├── package.json         # Dependensi dan skrip proyek
└── tsconfig.json        # Konfigurasi TypeScript
```

## 💻 Standar Koding

- **Bahasa**: TypeScript. Manfaatkan tipe data sekuat mungkin untuk mengurangi bug.
- **Komponen**: Gunakan *Functional Components* dengan React Hooks. Hindari *Class Components*.
- **Penamaan File**:
    - Komponen: `PascalCase.tsx` (misal: `DashboardPage.tsx`).
    - File non-komponen: `camelCase.ts` (misal: `api.ts`).
- **Styling**: Proyek ini tidak menggunakan library CSS-in-JS. Styling dilakukan melalui class utility dari framework CSS yang di-link secara eksternal atau CSS vanilla jika diperlukan.
- **Linting & Formatting**: (Disarankan) Gunakan Prettier dan ESLint untuk menjaga konsistensi kode.

## 🧠 State Management dengan React Context
Aplikasi ini menggunakan **React Context API** untuk mengelola state global, bukan library eksternal seperti Zustand atau Redux. Pendekatan ini dipilih karena kebutuhan state global cukup sederhana.

- **`AuthContext`**: Menyimpan data pengguna yang sedang login (`user`), status *loading*, dan fungsi `login`/`logout`. Ini adalah sumber kebenaran untuk autentikasi di seluruh aplikasi.
- **`RealtimeDataContext`**: Mengelola data absensi hari ini (`absensiToday`) dan logika *polling* untuk sinkronisasi dengan backend. Ini menunjukkan bagaimana data dinamis dikelola.
- **`NotificationContext`**: Mengelola antrian notifikasi yang muncul di pojok layar.
- **`NotificationCenterContext`**: Mengelola notifikasi yang muncul di pusat notifikasi (lonceng).

**Kapan menggunakan Context vs State Lokal?**
- Gunakan **Context** jika state perlu diakses oleh banyak komponen di level yang berbeda.
- Gunakan **`useState`** atau **`useReducer`** untuk state yang hanya relevan di dalam satu komponen atau komponen anak terdekatnya.

## 🔗 Pattern Integrasi API
File `src/services/api.ts` adalah "jantung" dari lapisan data aplikasi. Ia berfungsi sebagai **facade** (fasad), yang menyembunyikan kompleksitas dari mana data berasal.

- **Sumber Data Ganda**: Komponen tidak perlu tahu apakah data berasal dari `localStorage`, cache memori, atau panggilan jaringan ke Google Apps Script. Mereka hanya memanggil fungsi seperti `api.getStudents()`.
- **Logika Offline-First**: `api.ts` juga bertanggung jawab atas logika *offline-first*, seperti menyimpan permintaan yang gagal ke dalam antrian (`pending_absensi`) dan menyinkronkannya nanti.
- **Simulasi API**: Fungsi-fungsi di dalam `api.ts` (misalnya, `login`, `createLaporan`) dibuat agar terlihat seperti panggilan API asinkron (`async/await`) dengan `simulateDelay` untuk memberikan umpan balik UX yang realistis, meskipun beberapa operasi mungkin hanya memanipulasi data lokal.

## ✅ Pendekatan Testing
Saat ini, proyek belum memiliki *suite* pengujian otomatis. Pengujian masih dilakukan secara manual.

**Rekomendasi untuk Masa Depan**:
- **Unit Testing**: Gunakan [Vitest](https://vitest.dev/) untuk menguji fungsi utilitas dan logika di `services/api.ts`.
- **Component Testing**: Gunakan [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) untuk menguji komponen UI secara individual dan memastikan komponen tersebut me-render dengan benar dan interaktif.
- **E2E Testing**: Gunakan [Playwright](https://playwright.dev/) atau [Cypress](https://www.cypress.io/) untuk mengotomatiskan alur kerja pengguna yang kompleks, seperti login -> scan QR -> logout.

## 🐛 Tips Debugging
- **React Developer Tools**: Gunakan ekstensi browser [React DevTools](https://react.dev/learn/react-developer-tools) untuk menginspeksi hierarki komponen, *props*, dan *state*.
- **`console.log`**: Manfaatkan `console.log` di dalam `services/api.ts` untuk melacak alur data, status sinkronisasi, dan isi *cache*.
- **Tab Network**: Gunakan tab "Network" di DevTools browser Anda untuk melihat permintaan JSONP yang dibuat (cari file yang di-request oleh tag `<script>`).
- **Tab Application**: Gunakan tab "Application" untuk menginspeksi isi `localStorage` (`piket_database_backup`, `pending_absensi`) dan membersihkannya jika perlu untuk melakukan *reset*.

## ⚡ Teknik Optimasi Performa
- **`React.memo`**: Komponen yang me-render ulang tanpa perlu (misalnya, item dalam daftar panjang) dapat dibungkus dengan `React.memo` untuk mencegah re-render jika *props*-nya tidak berubah.
- **`useCallback` dan `useMemo`**: Gunakan *hooks* ini untuk menghindari pembuatan ulang fungsi atau nilai yang mahal pada setiap *render*, terutama saat meneruskannya ke komponen anak yang di-memoize.
- **Virtualisasi Daftar**: Untuk daftar yang sangat panjang (misalnya, riwayat laporan jika sudah ratusan), pertimbangkan untuk menggunakan library seperti `react-window` atau `react-virtual` untuk hanya me-render item yang terlihat di layar.
- **Code Splitting**: Vite dan React Router sudah mendukung *code splitting* berbasis rute secara *default*. Ini berarti kode untuk setiap halaman hanya dimuat saat halaman tersebut dikunjungi, mengurangi ukuran *bundle* awal.

---
*Terakhir diperbarui: 7 Oktober 2025*