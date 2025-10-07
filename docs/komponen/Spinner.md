# Komponen: Spinner

<a href="../README.md">Dokumentasi</a> / <a href="./">Komponen</a> / Spinner

Komponen `Spinner` digunakan untuk menunjukkan status memuat (loading) di seluruh aplikasi, memberikan umpan balik visual kepada pengguna bahwa suatu proses sedang berlangsung.

## Properti (Props)

| Nama Prop | Tipe | Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Mengatur ukuran spinner. |
| `color` | `string` | `'border-primary'` | Mengatur warna border spinner menggunakan class Tailwind CSS. |
| `className` | `string` | `''` | Class CSS tambahan untuk kustomisasi lebih lanjut. |

## Contoh Penggunaan

### Spinner Ukuran Default (Medium)
```jsx
import Spinner from './components/ui/Spinner';

const MyComponent = () => {
  return <Spinner />;
};
```

### Spinner Besar dengan Warna Sekunder
```jsx
import Spinner from './components/ui/Spinner';

const MyPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" color="border-secondary" />
    </div>
  );
};
```

## Demonstrasi Gaya (Storybook-like)

- **Ukuran Kecil (`sm`)**:
  - `[Spinner visual kecil di sini]`

- **Ukuran Sedang (`md`)**:
  - `[Spinner visual sedang di sini]`

- **Ukuran Besar (`lg`)**:
  - `[Spinner visual besar di sini]`

---
*Dokumen ini adalah placeholder dan akan diperluas di masa mendatang dengan visualisasi dan detail implementasi yang lebih baik.*