# Komponen: Layout

<a href="../README.md">Dokumentasi</a> / <a href="./">Komponen</a> / Layout

Komponen `Layout` adalah pembungkus utama untuk sebagian besar halaman di aplikasi. Ini menyediakan struktur halaman yang konsisten, termasuk `Header`, `Sidebar`, dan area konten utama.

## Properti (Props)

| Nama Prop | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `children`| `React.ReactNode` | `null` | Konten React (misalnya, komponen halaman) yang akan dirender di dalam area konten utama dari layout. |

## Logika Internal
- **Responsif**: Layout ini dirancang untuk menjadi responsif. `Sidebar` akan disembunyikan di layar kecil dan dapat di-toggle.
- **Konteks Peran**: Layout ini secara implisit bergantung pada `AuthContext` untuk menampilkan item navigasi yang sesuai dengan peran pengguna (`Siswa` atau `Admin`).

## Contoh Penggunaan
Komponen `Layout` biasanya digunakan dalam file routing utama (`App.tsx`) untuk membungkus sekelompok rute.

```jsx
// Di dalam App.tsx

import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ReportPage from './pages/ReportPage';

// ...

const StudentLayoutRoute = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// ...
<Route element={<StudentLayoutRoute />}>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/laporan" element={<ReportPage />} />
</Route>
// ...
```

---
*Dokumen ini adalah placeholder dan akan diperluas di masa mendatang dengan detail tentang bagaimana state sidebar dikelola dan bagaimana item navigasi dirender secara dinamis.*