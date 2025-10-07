# 🤝 Panduan Kontribusi

<a href="./README.md">Dokumentasi</a> / Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada proyek Piket Digital X-E8! Kontribusi dari komunitas sangat kami hargai. Panduan ini akan membantu Anda memahami proses dan standar yang kami gunakan.

## 📜 Daftar Isi
- [Kode Etik](#-kode-etik)
- [Alur Kerja Pengembangan](#-alur-kerja-pengembangan)
- [Konvensi Penamaan Branch](#-konvensi-penamaan-branch)
- [Format Pesan Commit](#-format-pesan-commit)
- [Template Pull Request](#-template-pull-request)
- [Proses Code Review](#-proses-code-review)
- [Requirement Testing](#-requirement-testing)
- [Pembaruan Dokumentasi](#-pembaruan-dokumentasi)
- [Panduan Pelaporan Isu](#-panduan-pelaporan-isu)

---

## ❤️ Kode Etik
Kami berkomitmen untuk menyediakan lingkungan yang ramah, aman, dan menyambut bagi semua, tanpa memandang tingkat pengalaman, identitas, atau latar belakang. Harap bersikap hormat dan konstruktif dalam semua interaksi.

## 🌊 Alur Kerja Pengembangan
Kami menggunakan alur kerja standar berbasis **Fork & Pull Request**.

1.  **Fork Repository**: Buat *fork* dari repositori utama ke akun GitHub Anda.
2.  **Clone Fork Anda**: Clone *fork* tersebut ke mesin lokal Anda.
    ```bash
    git clone https://github.com/NAMA_ANDA/piket-digitalisasi-x-e8.git
    cd piket-digitalisasi-x-e8
    ```
3.  **Buat Branch Baru**: Buat *branch* baru dari `main` untuk pekerjaan Anda. Gunakan konvensi penamaan yang sesuai (lihat di bawah).
    ```bash
    git checkout -b feature/tambah-fitur-keren
    ```
4.  **Lakukan Perubahan**: Tulis kode, perbaiki bug, atau tingkatkan dokumentasi.
5.  **Commit Perubahan Anda**: Lakukan *commit* pada perubahan Anda dengan pesan yang jelas dan informatif (lihat format di bawah).
    ```bash
    git add .
    git commit -m "feat: Menambahkan fitur keren untuk leaderboard"
    ```
6.  **Push ke Fork Anda**: Unggah *branch* Anda ke *fork* di GitHub.
    ```bash
    git push origin feature/tambah-fitur-keren
    ```
7.  **Buat Pull Request (PR)**: Buka repositori utama di GitHub. Anda akan melihat tombol untuk membuat *Pull Request* dari *branch* Anda. Klik tombol tersebut, isi *template* PR, dan kirimkan.

## 🌿 Konvensi Penamaan Branch
Gunakan prefiks berikut untuk nama *branch* Anda agar tujuannya jelas:
- `feature/`: Untuk menambahkan fitur baru (misal: `feature/sistem-notifikasi`).
- `bugfix/`: Untuk memperbaiki bug (misal: `bugfix/error-login-siswa`).
- `docs/`: Untuk perubahan pada dokumentasi (misal: `docs/update-panduan-developer`).
- `refactor/`: Untuk perbaikan kode tanpa mengubah fungsionalitas (misal: `refactor/optimasi-konteks-auth`).
- `chore/`: Untuk tugas-tugas pemeliharaan (misal: `chore/update-dependencies`).

## ✍️ Format Pesan Commit
Kami mengikuti standar **Conventional Commits**. Ini membuat riwayat Git lebih mudah dibaca dan memungkinkan otomatisasi di masa depan.

Formatnya adalah: `<tipe>: <deskripsi singkat>`

- **`feat`**: Menambahkan fitur baru.
- **`fix`**: Memperbaiki bug.
- **`docs`**: Perubahan pada dokumentasi.
- **`style`**: Perubahan format kode (spasi, titik koma, dll.).
- **`refactor`**: Perbaikan kode yang tidak memperbaiki bug atau menambah fitur.
- **`test`**: Menambah atau memperbaiki tes.
- **`chore`**: Perubahan pada proses build, dependensi, atau alat bantu.

**Contoh Pesan Commit**:
```
feat: Menambahkan tombol logout di header
fix: Mengatasi masalah tampilan leaderboard di perangkat mobile
docs: Memperbarui panduan deployment dengan detail SSL
```

## 📝 Template Pull Request
Saat Anda membuat PR, harap isi deskripsi dengan informasi berikut:
- **Apa yang berubah?**: Jelaskan secara singkat perubahan yang Anda buat.
- **Mengapa perubahan ini dibuat?**: Apa tujuan atau masalah yang ingin diselesaikan?
- **Bagaimana cara mengujinya?**: Berikan langkah-langkah bagi *reviewer* untuk memverifikasi bahwa perubahan Anda berfungsi seperti yang diharapkan.
- **Screenshot/Video (jika relevan)**: Untuk perubahan UI, sertakan visual untuk menunjukkan perubahannya.

## 👀 Proses Code Review
- Setelah PR dibuat, setidaknya satu developer utama (misalnya, Ardellio atau Novita) akan meninjaunya.
- Reviewer akan memberikan umpan balik, saran, atau meminta perubahan.
- Harap tanggapi umpan balik secara konstruktif. Setelah semua diskusi selesai dan perubahan yang diminta telah dilakukan, PR akan di-*merge*.

## ✅ Requirement Testing
- Proyek ini saat ini belum memiliki *suite* pengujian otomatis.
- Oleh karena itu, Anda bertanggung jawab untuk **menguji perubahan Anda secara manual**.
- Pastikan fitur baru Anda berfungsi seperti yang diharapkan dan tidak merusak fungsionalitas yang ada (uji regresi).

## 📚 Pembaruan Dokumentasi
- Jika perubahan Anda memengaruhi cara kerja aplikasi atau menambahkan fitur baru, harap **perbarui juga dokumentasi yang relevan** di dalam folder `/docs`.
- Dokumentasi yang baik sama pentingnya dengan kode yang baik.

## 🐞 Panduan Pelaporan Isu
Jika Anda menemukan bug atau memiliki ide untuk fitur baru, silakan buka **Issue** di repositori GitHub.
- **Untuk Bug**: Jelaskan masalahnya secara detail, termasuk langkah-langkah untuk mereproduksinya, perilaku yang diharapkan, dan perilaku aktual.
- **Untuk Fitur**: Jelaskan fitur yang Anda usulkan dan mengapa fitur tersebut akan bermanfaat bagi aplikasi.

---
*Terakhir diperbarui: 7 Oktober 2025*