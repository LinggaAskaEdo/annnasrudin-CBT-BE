# API Documentation untuk AI Model & Frontend Developer

Dokumen ini berisi daftar komprehensif seluruh endpoint API, format request
(termasuk HTTP Method, Body, Param, Query), serta contoh response (sukses dan
error) secara spesifik untuk Sistem CBT SD.

## Aturan Umum (General Rules)

- **Base URL:** `http://localhost:3000/api` (Dapat diubah mengikuti environment)
- **Format Data:** Mayoritas menggunakan `application/json`, kecuali upload file
  (Modul) menggunakan `multipart/form-data`.
- **Autentikasi:** Endpoint yang terproteksi wajib menyertakan header:
  `Authorization: Bearer <token_jwt_anda>`
- **Response Format Umum:**
  Setiap response memiliki struktur dasar:
  `{ "status": "success" | "error", "data": { ... } | "message": "..." }`

---

## 1. AUTHENTICATION (Otorisasi)

### 1.1 Login

- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Akses:** Public
- **Request Body (JSON):**

  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "uuid",
        "username": "admin",
        "name": "Super Admin",
        "role": "ADMIN" // atau GURU, SISWA
      },
      "token": "eyJhbG...",
      "sessionId": "uuid"
    }
  }
  ```

- **Response Error (400 Bad Request - Validasi):**

  ```json
  {
    "status": "error",
    "message": "\"username\" is required"
  }
  ```

- **Response Error (401 Unauthorized - Kredensial Salah):**

  ```json
  {
    "status": "error",
    "message": "Invalid username or password"
  }
  ```

### 1.2 Logout

- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Akses:** All Authenticated Users
- **Headers:** `Authorization: Bearer <token>`
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "message": "Logged out successfully"
  }
  ```

- **Response Error (401 Unauthorized):**

  ```json
  {
    "status": "error",
    "message": "Not authenticated"
  }
  ```

---

## 2. ADMINISTRATOR (Role: ADMIN)

### 2.1 Buat User Baru (Admin/Guru/Siswa)

- **Method:** `POST`
- **Endpoint:** `/admin/users`
- **Akses:** ADMIN
- **Request Body (JSON):**

  ```json
  {
    "username": "siswa_akbar",
    "name": "Akbar Ramadhan",
    "role": "SISWA", // atau GURU, ADMIN
    "jabatan": "Siswa Kelas 6A", // Opsional
    "rombelId": "uuid-rombel" // Wajib untuk role SISWA
  }
  ```

- **Response Sukses (201 Created):**

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "uuid",
        "username": "siswa_akbar",
        "name": "Akbar Ramadhan",
        "role": "SISWA"
      },
      "defaultPassword": "X7Y8Z" // Password di-generate otomatis
    }
  }
  ```

- **Response Error (400 Bad Request):**

  ```json
  {
    "status": "error",
    "message": "Username already exists"
  }
  ```

### 2.2 Lihat Daftar User

- **Method:** `GET`
- **Endpoint:** `/admin/users`
- **Akses:** ADMIN
- **Query Params (Opsional):** `?role=GURU&search=Budi`
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "username": "budi_guru",
        "name": "Budi Santoso",
        "role": "GURU",
        "rombel": null
      }
    ]
  }
  ```

### 2.3 Update Profil Admin

- **Method:** `PATCH`
- **Endpoint:** `/admin/profile`
- **Akses:** ADMIN
- **Request Body (JSON):**

  ```json
  {
    "name": "Admin Utama",
    "password": "PasswordBaru123" // Opsional
  }
  ```

- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "name": "Admin Utama",
      "username": "admin"
    }
  }
  ```

---

## 3. GURU (Role: GURU)

### 3.1 Profil Guru

- **Method:** `PATCH`
- **Endpoint:** `/guru/profile`
- **Akses:** GURU
- **Request Body (JSON):**

  ```json
  {
    "name": "Guru Budi Update",
    "password": "PasswordBaru123" // Opsional
  }
  ```

- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": { "id": "uuid", "name": "Guru Budi Update" } }
  ```

### 3.2 Daftar Siswa

- **Method:** `GET`
- **Endpoint:** `/guru/siswa`
- **Akses:** GURU
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": [
      { "id": "uuid", "name": "Andi", "rombel": { "name": "Kelas 6A" } }
    ]
  }
  ```

### 3.3 Dashboard Hasil Ujian (Rekap)

- **Method:** `GET`
- **Endpoint:** `/guru/hasil-ujian`
- **Akses:** GURU
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": [
      {
        "scheduleId": "uuid",
        "judulUjian": "UTS IPA",
        "rombel": "Kelas 6A",
        "completedCount": 25,
        "needsGradingCount": 5
      }
    ]
  }
  ```

### 3.4 Detail Pengerjaan Siswa (Untuk Grading)

- **Method:** `GET`
- **Endpoint:** `/guru/pengumpulan/:hasilUjianId`
- **Akses:** GURU
- **Path Params:** `hasilUjianId` (UUID)
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": {
      "siswaName": "Andi",
      "examTitle": "UTS IPA",
      "answers": [
        {
          "soalId": "uuid",
          "questionText": "Jelaskan...",
          "type": "URAIAN",
          "siswaAnswer": "Karena...",
          "score": null
        }
      ]
    }
  }
  ```

- **Response Error (404 Not Found):**

  ```json
  { "status": "error", "message": "Submission not found" }
  ```

### 3.5 Memberikan Nilai Manual (Grading)

- **Method:** `PATCH`
- **Endpoint:** `/guru/pengumpulan/:hasilUjianId/grade`
- **Akses:** GURU
- **Path Params:** `hasilUjianId` (UUID)
- **Request Body (JSON):**

  ```json
  {
    "uraianGrades": [
      {
        "soalId": "uuid-soal",
        "guruScore": 85,
        "feedback": "Bagus"
      }
    ]
  }
  ```

- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "message": "Grading updated successfully" }
  ```

---

## 4. MODUL PEMBELAJARAN (Module)

### 4.1 Upload Modul

- **Method:** `POST`
- **Endpoint:** `/modules`
- **Akses:** GURU
- **Request Body (`multipart/form-data`):**
  - `title` (text): "Bab 1 IPA"
  - `rombelId` (text): "uuid"
  - `pdf` (file): [File PDF]
- **Response Sukses (201 Created):**

  ```json
  {
    "status": "success",
    "data": { "id": "uuid", "title": "Bab 1 IPA", "pdfPath": "/uploads/xxx.pdf" }
  }
  ```

- **Response Error (400 Bad Request):**

  ```json
  { "status": "error", "message": "PDF file is required" }
  ```

### 4.2 Update Modul

- **Method:** `PUT`
- **Endpoint:** `/modules/:id`
- **Akses:** GURU
- **Path Params:** `id` (UUID Modul)
- **Request Body (`multipart/form-data`):**
  - `title` (text): "Bab 1 IPA (Revisi)"
  - `rombelId` (text): "uuid"
  - `pdf` (file): [File PDF Baru - Opsional]
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": { "id": "uuid", "title": "Bab 1 IPA (Revisi)" } }
  ```

### 4.3 Hapus Modul

- **Method:** `DELETE`
- **Endpoint:** `/modules/:id`
- **Akses:** GURU
- **Path Params:** `id` (UUID Modul)
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "message": "Module deleted successfully" }
  ```

### 4.4 Daftar Modul Guru

- **Method:** `GET`
- **Endpoint:** `/modules/my`
- **Akses:** GURU
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": [ { "id": "uuid", "title": "Bab 1 IPA" } ] }
  ```

---

## 5. MANAJEMEN UJIAN (Ujian)

### 5.1 Buat Ujian

- **Method:** `POST`
- **Endpoint:** `/ujian`
- **Akses:** GURU, ADMIN
- **Request Body (JSON):**

  ```json
  { "title": "UTS IPA", "mapel": "IPA" }
  ```

- **Response Sukses (201 Created):**

  ```json
  { "status": "success", "data": { "id": "uuid", "title": "UTS IPA", "mapel": "IPA", "createdById": "uuid" } }
  ```

### 5.2 Daftar Ujian Saya

- **Method:** `GET`
- **Endpoint:** `/ujian`
- **Akses:** GURU
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": [ { "id": "uuid", "title": "UTS IPA", "mapel": "IPA" } ] }
  ```

### 5.3 Edit Ujian

- **Method:** `PUT`
- **Endpoint:** `/ujian/:id`
- **Akses:** GURU
- **Request Body (JSON):**

  ```json
  { "title": "UTS IPA (Revisi)", "mapel": "IPA" }
  ```

- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": { "id": "uuid", "title": "UTS IPA (Revisi)" } }
  ```

### 5.4 Hapus Ujian

- **Method:** `DELETE`
- **Endpoint:** `/ujian/:id`
- **Akses:** GURU
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "message": "Ujian dan soal-soalnya berhasil dihapus" }
  ```

---

## 6. MANAJEMEN SOAL (Soal)

### 6.1 Tambah Soal

- **Method:** `POST`
- **Endpoint:** `/ujian/soal`
- **Akses:** GURU
- **Request Body (JSON):**

  *Untuk Pilihan Ganda:*

  ```json
  {
    "ujianId": "uuid",
    "questionType": "PILGAN",
    "questionText": "Ibukota Indonesia adalah?",
    "options": ["Jakarta", "Bandung", "Medan", "Surabaya"],
    "correctAnswer": "Jakarta"
  }
  ```

  *Untuk Uraian:*

  ```json
  {
    "ujianId": "uuid",
    "questionType": "URAIAN",
    "questionText": "Jelaskan proses fotosintesis!"
  }
  ```

- **Response Sukses (201 Created):**

  ```json
  { "status": "success", "data": { "id": "uuid", "questionText": "...", "type": "PILGAN" } }
  ```

### 6.2 Lihat Bank Soal (Koleksi Soal)

- **Method:** `GET`
- **Endpoint:** `/ujian/soal/bank`
- **Akses:** GURU
- **Query Params:** `?mapel=IPA&search=fotosintesis`
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": [ { "id": "uuid", "questionText": "...", "ujian": { "mapel": "IPA" } } ] }
  ```

### 6.3 Update Soal

- **Method:** `PUT`
- **Endpoint:** `/ujian/soal/:id`
- **Akses:** GURU
- **Request Body (JSON):** (Sama seperti Tambah Soal)
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": { "id": "uuid", "questionText": "Updated..." } }
  ```

### 6.4 Hapus Soal

- **Method:** `DELETE`
- **Endpoint:** `/ujian/soal/:id`
- **Akses:** GURU
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "message": "Soal berhasil dihapus" }
  ```

---

## 7. PENJADWALAN UJIAN (Scheduling)

### 7.1 Buat Jadwal Ujian

- **Method:** `POST`
- **Endpoint:** `/ujian/schedule`
- **Akses:** GURU
- **Request Body (JSON):**

  ```json
  {
    "ujianId": "uuid-ujian",
    "rombelId": "uuid-rombel",
    "startTime": "2026-04-03T08:00:00.000Z",
    "endTime": "2026-04-03T10:00:00.000Z",
    "deadline": "2026-04-03T10:30:00.000Z"
  }
  ```

- **Response Sukses (201 Created):**

  ```json
  { "status": "success", "data": { "id": "uuid", "startTime": "..." } }
  ```

### 7.2 Lihat Daftar Jadwal Saya

- **Method:** `GET`
- **Endpoint:** `/ujian/schedule`
- **Akses:** GURU
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": [ { "id": "uuid", "ujian": { "title": "UTS" }, "rombel": { "name": "6A" } } ] }
  ```

### 7.3 Update Jadwal

- **Method:** `PUT`
- **Endpoint:** `/ujian/schedule/:id`
- **Akses:** GURU
- **Request Body (JSON):**

  ```json
  {
    "startTime": "2026-04-04T08:00:00.000Z",
    "endTime": "2026-04-04T10:00:00.000Z"
  }
  ```

- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": { "id": "uuid" } }
  ```

### 7.4 Hapus Jadwal

- **Method:** `DELETE`
- **Endpoint:** `/ujian/schedule/:id`
- **Akses:** GURU
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "message": "Schedule deleted" }
  ```

---

## 8. SISWA (Role: SISWA)

### 8.1 Profil Siswa

- **Method:** `PATCH`
- **Endpoint:** `/siswa/profile`
- **Akses:** SISWA
- **Request Body (JSON):**

  ```json
  { "name": "Akbar Ramadhan", "password": "PasswordBaru123" }
  ```

- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": { "id": "uuid", "name": "Akbar Ramadhan" } }
  ```

### 8.2 Ambil Daftar Modul

- **Method:** `GET`
- **Endpoint:** `/siswa/modules`
- **Akses:** SISWA
- **Response Sukses (200 OK):**

  ```json
  { "status": "success", "data": [ { "id": "uuid", "title": "Modul IPA", "pdfPath": "..." } ] }
  ```

### 8.3 Ambil Daftar Ujian (Jadwal Tersedia)

- **Method:** `GET`
- **Endpoint:** `/siswa/ujian`
- **Akses:** SISWA
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid-schedule",
        "title": "UTS IPA",
        "subject": "IPA",
        "startTime": "...",
        "endTime": "...",
        "deadline": "...",
        "status": "AVAILABLE" // atau UPCOMING, EXPIRED, COMPLETED
      }
    ]
  }
  ```

### 8.4 Mulai Ujian

- **Method:** `POST`
- **Endpoint:** `/siswa/ujian/:scheduleId/start`
- **Akses:** SISWA
- **Path Params:** `scheduleId` (UUID)
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": {
      "session": { "id": "uuid", "status": "ONGOING", "startTime": "..." },
      "soal": [
        {
          "id": "uuid-soal-1",
          "questionText": "Ibukota Indonesia adalah?",
          "type": "PILGAN",
          "options": ["Jakarta", "Bandung", "Surabaya", "Medan"]
        },
        {
          "id": "uuid-soal-2",
          "questionText": "Jelaskan...",
          "type": "URAIAN"
        }
      ]
    }
  }
  ```

- **Response Error (400 Bad Request - Belum waktunya / Sudah dikerjakan):**

  ```json
  {
    "status": "error",
    "message": "Ujian belum atau sudah tidak tersedia"
  }
  ```

### 8.5 Kumpulkan Jawaban Ujian

- **Method:** `POST`
- **Endpoint:** `/siswa/ujian/:scheduleId/submit`
- **Akses:** SISWA
- **Path Params:** `scheduleId` (UUID)
- **Request Body (JSON):**

  ```json
  {
    "answers": [
      { "soalId": "uuid-soal-1", "answer": "Jakarta" },
      { "soalId": "uuid-soal-2", "answer": "Ini adalah jawaban panjang uraian..." }
    ]
  }
  ```

- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "message": "Ujian berhasil dikumpulkan",
    "scorePilgan": 80
  }
  ```

### 8.6 Riwayat Ujian Siswa

- **Method:** `GET`
- **Endpoint:** `/siswa/results`
- **Akses:** SISWA
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": [ { "id": "uuid", "judulUjian": "UTS IPA", "score": 85, "submittedAt": "..." } ]
  }
  ```

### 8.7 Detail Jawaban Ujian Siswa

- **Method:** `GET`
- **Endpoint:** `/siswa/results/:hasilUjianId`
- **Akses:** SISWA
- **Path Params:** `hasilUjianId` (UUID)
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": {
      "examTitle": "UTS IPA",
      "score": 85,
      "answers": [
        { "questionText": "...", "siswaAnswer": "...", "isCorrect": true, "score": 10 }
      ]
    }
  }
  ```

---

## 9. REPORTS (Laporan)

### 9.1 Laporan Nilai Kelas

- **Method:** `GET`
- **Endpoint:** `/reports/ujian/:scheduleId`
- **Akses:** ADMIN, GURU
- **Path Params:** `scheduleId` (UUID)
- **Response Sukses (200 OK):**

  ```json
  {
    "status": "success",
    "data": {
      "examTitle": "UTS IPA",
      "subject": "IPA",
      "rombel": "Kelas 6A",
      "results": [
        {
          "siswaName": "Andi",
          "username": "siswa_andi",
          "autoScore": 75,
          "uraianTotalPoints": 15,
          "status": "COMPLETED",
          "submittedAt": "..."
        }
      ]
    }
  }
  ```

- **Response Error (404 Not Found):**

  ```json
  { "status": "error", "message": "Schedule not found" }
  ```

---

## CONTOH PENANGANAN HTTP ERROR UMUM

Berikut adalah standar response error jika terjadi kegagalan sistem atau akses
tidak valid yang berlaku bagi SEMUA ENDPOINT:

### 400 Bad Request (Validasi Input Gagal)

Terjadi jika request body/parameter kosong, salah tipe, atau aturan validasi
dilanggar.

```json
{
  "status": "error",
  "message": "\"username\" is required"
}
```

### 401 Unauthorized (Token Kosong atau Tidak Valid)

Muncul pada endpoint terproteksi jika Header `Authorization: Bearer <token>`
tidak dilengkapi, salah, atau token sudah kadaluwarsa.

```json
{
  "status": "error",
  "message": "Not authenticated. Token is missing or invalid."
}
```

### 403 Forbidden (Peran/Role Tidak Sesuai Akses)

Muncul jika user login berstatus Siswa mencoba memanggil endpoint yang khusus
untuk peran Guru/Admin, dll.

```json
{
  "status": "error",
  "message": "Forbidden: You don't have enough permission"
}
```

### 404 Not Found (Data / Route Tidak Ditemukan)

Muncul jika query database tidak menemukan data (misal: ID tidak valid) atau
endpoint URL yang dipanggil API tidak tersedia.

```json
{
  "status": "error",
  "message": "Route not found" 
}
```

### 500 Internal Server Error (Kegagalan Server Backend)

Muncul saat runtime node.js error atau komunikasi database ke MySQL terputus.
Pada environment development `NODE_ENV=development`, error ini akan
menampilkan `stack trace` yang lengkap. Dalam production, `stack trace` akan
disembunyikan.

```json
{
  "status": "error",
  "message": "Internal Server Error",
  "stack": "Error: Table 'cbt_sd_db.users' doesn't exist at..." 
}
```
