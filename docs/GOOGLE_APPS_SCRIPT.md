# 📜 Panduan Backend (Google Apps Script)

<a href="./README.md">Dokumentasi</a> / Google Apps Script

Dokumen ini adalah panduan lengkap untuk backend aplikasi Piket Digital X-E8, yang ditenagai oleh **Google Apps Script (GAS)**. Skrip ini bertindak sebagai jembatan antara frontend React dan database Google Sheets.

## 📜 Daftar Isi
- [File Utama: `Code.gs`](#file-utama-codegs)
- [Handler Utama: `doGet(e)`](#handler-utama-dogete)
  - [Logika Routing](#logika-routing)
  - [Implementasi JSONP](#implementasi-jsonp)
- [Handler Utama: `doPost(e)`](#handler-utama-doposte)
  - [Membaca Data POST](#membaca-data-post)
- [Fungsi Manipulasi Google Sheets](#-fungsi-manipulasi-google-sheets)
- [Logika Autentikasi & Keamanan](#-logika-autentikasi--keamanan)
- [Pattern Error Handling](#-pattern-error-handling)
- [Deployment sebagai Web App](#-deployment-sebagai-web-app)
- [Testing Endpoint](#-testing-endpoint)
- [Quota & Optimasi](#-quota--optimasi)

---

## File Utama: `Code.gs`
Seluruh logika backend berada dalam satu file bernama `Code.gs`. Skrip ini terikat (bound) pada spreadsheet Google Sheets yang berfungsi sebagai database, yang memberinya izin langsung untuk membaca dan menulis data dari/ke *sheet* tersebut.

## Handler Utama: `doGet(e)`
Fungsi ini adalah titik masuk untuk semua permintaan `HTTP GET` yang dikirim ke URL Web App. Fungsi ini bertanggung jawab untuk **mengambil data** dari spreadsheet.

### Logika Routing
`doGet(e)` menggunakan parameter `action` dari *query string* untuk menentukan data apa yang harus diambil.

```javascript
// Contoh kerangka fungsi doGet(e) di Code.gs

function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback; // Untuk JSONP

  try {
    let responseData;

    switch (action) {
      case 'getAbsensiToday':
        responseData = getAbsensiTodayData();
        break;

      // Tambahkan case lain jika ada endpoint GET lainnya
      // case 'getAllStudents':
      //   responseData = getAllStudentsData();
      //   break;

      default:
        throw new Error('Aksi tidak valid');
    }

    // Bungkus respons dalam format JSONP
    return createJsonResponse(callback, { success: true, data: responseData });

  } catch (error) {
    return createJsonResponse(callback, { success: false, message: error.message });
  }
}
```

### Implementasi JSONP
Untuk mengatasi masalah CORS, `doGet(e)` tidak mengembalikan JSON murni. Sebaliknya, ia membungkus output JSON dalam pemanggilan fungsi JavaScript, yang namanya disediakan oleh parameter `callback`.

```javascript
// Fungsi helper untuk membuat output JSONP

function createJsonResponse(callback, payload) {
  const jsonString = JSON.stringify(payload);
  const response = ContentService.createTextOutput(callback + '(' + jsonString + ')');
  response.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return response;
}
```
Hasilnya adalah output teks seperti ini, yang dapat dieksekusi oleh tag `<script>` di browser:
`namaFungsiCallback({"success":true,"data":[...]});`

## Handler Utama: `doPost(e)`
Fungsi ini adalah titik masuk untuk semua permintaan `HTTP POST`. Fungsi ini bertanggung jawab untuk **menulis atau memodifikasi data** di spreadsheet. Frontend mengirim permintaan ini dengan `mode: 'no-cors'`, jadi skrip ini tidak perlu mengembalikan data yang kompleks.

### Membaca Data POST
Data yang dikirim dari frontend diakses melalui objek `e.postData`.

```javascript
// Contoh kerangka fungsi doPost(e) di Code.gs

function doPost(e) {
  try {
    // Parsing data yang dikirim sebagai URL-encoded form
    const params = e.parameter;
    const action = params.action;

    switch (action) {
      case 'absensi':
        // Ambil data dari parameter
        const qrData = params.qrData;
        const nama = params.nama;
        const timestamp = params.timestamp;

        // Panggil fungsi untuk menulis ke sheet
        handleAbsensi(qrData, nama, timestamp);
        break;

      // Tambahkan case lain untuk aksi POST lainnya
      // case 'createLaporan':
      //   const laporanData = JSON.parse(params.laporanData);
      //   handleCreateLaporan(laporanData);
      //   break;
    }

    // Karena 'no-cors', respons ini tidak akan dibaca klien,
    // tapi baik untuk debugging.
    return ContentService.createTextOutput(JSON.stringify({ success: true }));

  } catch (error) {
    // Log error untuk debugging di sisi server
    console.error('POST Error:', error);
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }));
  }
}
```

## ⚙️ Fungsi Manipulasi Google Sheets
Ini adalah fungsi-fungsi inti yang berinteraksi dengan database.

- **Membaca Data**:
  ```javascript
  function getSheetData(sheetName) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Ambil header

    // Konversi array 2D menjadi array of objects
    return data.map(row => {
      let obj = {};
      headers.forEach((header, index) => obj[header] = row[index]);
      return obj;
    });
  }
  ```

- **Menulis Baris Baru**:
  ```javascript
  function appendRowToSheet(sheetName, rowData) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    // rowData harus berupa array, misal: [1, "2025-10-07", "Nama Siswa", ...]
    sheet.appendRow(rowData);
  }
  ```
- **Memperbarui Sel**:
  ```javascript
  function updateCell(sheetName, rowIndex, colIndex, value) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    sheet.getRange(rowIndex, colIndex).setValue(value);
  }
  ```

## 🔐 Logika Autentikasi & Keamanan
- **Autentikasi**: Aplikasi ini **tidak memiliki lapisan autentikasi di sisi server**. Skrip ini secara implisit memercayai semua permintaan yang masuk. Model keamanan ini dapat diterima untuk aplikasi internal skala kecil, tetapi tidak disarankan untuk aplikasi publik.
- **Keamanan**: Akses ke Web App dibatasi oleh URL *deployment* yang panjang dan sulit ditebak. Siapa pun yang memiliki URL ini secara teknis dapat mengirim permintaan.

## ❗️ Pattern Error Handling
Error ditangani menggunakan blok `try...catch` di dalam `doGet` dan `doPost`.
- Jika terjadi *error*, fungsi akan mengembalikan respons `{ success: false, message: '...' }`.
- Untuk `doPost`, *error* juga dapat di-log ke **Stackdriver Logging** (sekarang bagian dari Google Cloud's operations suite) menggunakan `console.error()`, yang dapat dilihat oleh developer di dasbor Apps Script.

## 🚀 Deployment sebagai Web App
Skrip harus di-deploy sebagai Web App agar dapat diakses melalui HTTP.
- **Tipe Deployment**: Web app.
- **Akses**: Harus diatur ke **`Anyone`** agar Vercel dapat mengaksesnya.
- **Versi**: Setiap kali Anda membuat perubahan pada `Code.gs`, Anda harus membuat **deployment baru** agar perubahan tersebut aktif di URL produksi. Mengedit dan menyimpan skrip saja tidak cukup.
- Lihat [Panduan Deployment](./DEPLOYMENT.md) untuk detail lengkap.

## 🧪 Testing Endpoint
- **GET**: Anda dapat menguji *endpoint* GET langsung di browser Anda dengan menempelkan URL *deployment* dan menambahkan parameter *action*.
  `https://script.google.com/.../exec?action=getAbsensiToday`
  (Ini akan gagal jika tidak ada parameter `callback`, tetapi akan menunjukkan *error* yang bermanfaat).
- **POST**: Gunakan alat seperti [Postman](https://www.postman.com/) atau `curl` untuk mengirim permintaan POST ke URL *deployment* Anda.

## 📊 Quota & Optimasi
Google Apps Script memiliki [kuota penggunaan harian](https://developers.google.com/apps-script/guides/services/quotas).
- **Minimalkan Panggilan**: Kurangi jumlah panggilan ke `SpreadsheetApp` (misalnya, `getValues()`, `setValue()`). Baca seluruh data yang relevan sekaligus ke dalam variabel, proses di dalam skrip, lalu tulis kembali jika perlu.
- **Hindari Panggilan dalam Loop**: Jangan pernah memanggil `getValue()` atau `setValue()` di dalam perulangan. Ini adalah cara paling umum untuk melampaui kuota waktu eksekusi.
- **Gunakan CacheService**: Untuk data yang jarang berubah, gunakan `CacheService` bawaan Google Apps Script untuk menyimpan hasil dan mengurangi pembacaan dari spreadsheet.

---
*Terakhir diperbarui: 7 Oktober 2025*