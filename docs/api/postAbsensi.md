# POST /

<a href="../README.md">Dokumentasi</a> / <a href="../API.md">Referensi API</a> / absensi

Mengirimkan data absensi baru ke server. Ini biasanya dipicu oleh pemindaian QR code.

## Permintaan

- **Metode**: `POST`
- **Mode**: `no-cors` (Penting: Klien tidak dapat membaca respons)
- **Body**: `application/x-www-form-urlencoded`

- **Parameter Body**:
    - `action`: "absensi" (wajib)
    - `qrData`: Payload dari QR code, misal: "PIKET-XE8-20251007" (wajib)
    - `nama`: Nama lengkap siswa, misal: "Ardellio Satria Anindito" (wajib)
    - `timestamp`: Timestamp ISO dari waktu absensi, misal: "2025-10-07T14:35:00.000Z" (wajib)

## Respons Sukses

- **Kode**: Tidak dapat dibaca oleh klien.
- **Konten**: Server secara internal mengembalikan `{ "success": true }`, tetapi ini tidak dapat diakses oleh frontend. Aplikasi akan secara optimis menganggap permintaan berhasil dan melanjutkan. Jika gagal, item tersebut akan dimasukkan ke dalam antrian offline.

---
*Dokumen ini adalah placeholder dan akan diperluas di masa mendatang.*