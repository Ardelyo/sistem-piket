# GET /?action=getAbsensiToday

<a href="../README.md">Dokumentasi</a> / <a href="../API.md">Referensi API</a> / getAbsensiToday

Mengambil semua data absensi untuk hari ini.

## Permintaan

- **Metode**: `GET` (melalui JSONP)
- **Parameter Kueri**:
    - `action=getAbsensiToday` (wajib)
    - `callback=namaFungsiJs` (wajib, untuk JSONP)

## Respons Sukses

- **Kode**: `200 OK`
- **Konten**: Array objek `Absensi`.
- **Contoh**:
  ```javascript
  namaFungsiJs({
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
  })
  ```

---
*Dokumen ini adalah placeholder dan akan diperluas di masa mendatang.*