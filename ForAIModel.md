# API Documentation for AI Models & Junior Developers

Dokumen ini berisi daftar endpoint API, format request, serta contoh response (sukses dan error) untuk Sistem CBT SD.

## Informasi Umum
- **Base URL:** `http://localhost:3000/api`
- **Format Response:** JSON
- **Autentikasi:** Menggunakan Bearer Token (JWT). Masukkan token di Header `Authorization: Bearer <token>`.

---

## 1. Autentikasi (Auth)

### Login User
- **Endpoint:** `POST /auth/login`
- **Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "admin",
      "name": "Super Admin",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "sessionId": "432e4567-e89b-12d3-a456-426614174000"
  }
}
```
- **Response Gagal (401 - Kredensial Salah):**
```json
{
  "status": "error",
  "message": "Invalid username or password"
}
```

### Logout User
- **Endpoint:** `POST /auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## 2. Admin (Manajemen User)

### Buat User Baru (Admin/Guru/Siswa)
- **Endpoint:** `POST /admin/users`
- **Request Body:**
```json
{
  "username": "siswa_akbar",
  "name": "Akbar Ramadhan",
  "role": "SISWA",
  "jabatan": "Siswa Kelas 6",
  "rombelId": "uuid-rombel"
}
```
- **Response Sukses (201):**
```json
{
  "status": "success",
  "data": {
    "user": { "id": "uuid", "username": "siswa_akbar", "name": "Akbar Ramadhan", "role": "SISWA" },
    "defaultPassword": "RAMDOMPASS"
  }
}
```

---

## 3. Guru (Teacher) - Manajemen Pembelajaran & Ujian

### Upload Modul (PDF)
- **Endpoint:** `POST /modules`
- **Format:** `multipart/form-data`
- **Request Body:**
  - `title` (text): "Judul Modul"
  - `rombelId` (text): "uuid-rombel"
  - `pdf` (file): File modul dalam format PDF.
- **Response Sukses (201):**
```json
{
  "status": "success",
  "data": { "id": "uuid", "title": "Modul IPA Bab 1" }
}
```

### Daftar Modul Saya (Guru)
- **Endpoint:** `GET /modules/my`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": [ { "id": "uuid", "title": "IPA Bab 1", "pdfPath": "/uploads/..." } ]
}
```

### Update Modul
- **Endpoint:** `PUT /modules/:id`
- **Format:** `multipart/form-data`
- **Request Body:**
  - `title` (text): "Judul Baru jika ingin diubah"
  - `pdf` (file): File baru jika ingin diubah.

### Hapus Modul
- **Endpoint:** `DELETE /modules/:id`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "message": "Module deleted successfully"
}
```

### Buat Paket Ujian
- **Endpoint:** `POST /exams/packages`
- **Request Body:**
```json
{
  "title": "Ujian Tengah Semester IPA",
  "mapelId": "uuid-mapel"
}
```

### Menambah Soal ke Paket
- **Endpoint:** `POST /exams/questions`
- **Request Body:**
```json
{
  "paketUjianId": "uuid-paket",
  "questionType": "PILGAN",
  "questionText": "Apa ibukota Indonesia?",
  "options": ["Jakarta", "Bandung", "Surabaya", "Medan"],
  "correctAnswer": "Jakarta"
}
```

### Daftar Paket Ujian Milik Guru
- **Endpoint:** `GET /exams/my-packages`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": [ { "id": "uuid", "title": "UTS IPA", "mapel": { "name": "IPA" } } ]
}
```

### Update Paket Ujian
- **Endpoint:** `PUT /exams/packages/:id`
- **Request Body:**
```json
{
  "title": "Judul Baru"
}
```

### Hapus Paket Ujian
- **Endpoint:** `DELETE /exams/packages/:id`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "message": "Exam package deleted"
}
```

### Daftar Bank Soal (Global/Shared)
- **Endpoint:** `GET /exams/bank-soal`
```json
{
  "status": "success",
  "data": [ { "id": "uuid", "questionText": "...", "type": "PILGAN" } ]
}
```

### Melakukan Penjadwalan Ujian (Schedule)
- **Endpoint:** `POST /exams/schedule`
- **Request Body:**
```json
{
  "paketUjianId": "uuid-paket",
  "rombelId": "uuid-rombel",
  "startTime": "2026-04-03T08:00:00.000Z",
  "endTime": "2026-04-03T10:00:00.000Z"
}
```

### Daftar Jadwal Ujian Milik Guru
- **Endpoint:** `GET /exams/my-schedules`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": [ { "id": "uuid", "examPackage": { "title": "..." }, "rombel": { "name": "..." } } ]
}
```

### Daftar Siswa (Guru)
- **Endpoint:** `GET /teacher/students`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": [ { "id": "uuid", "name": "Budi", "rombel": "Kelas 6A" } ]
}
```

### Rekap Hasil Ujian (Dashboard Guru)
- **Endpoint:** `GET /teacher/exam-results`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": [ { "scheduleId": "uuid", "examTitle": "UTS", "completedCount": 30, "rombel": "..." } ]
}
```

### Detail Pengerjaan Siswa (Untuk Grading)
- **Endpoint:** `GET /teacher/submissions/:hasilUjianId`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": { 
     "studentName": "...", 
     "answers": [ { "soalId": "...", "answer": "...", "type": "URAIAN" } ] 
  }
}
```

### Memberikan Nilai Manual (Soal Uraian)
- **Endpoint:** `PATCH /teacher/submissions/:hasilUjianId/grade`
- **Request Body:**
```json
{
  "uraianGrades": [
    {
      "soalId": "uuid-soal",
      "teacherScore": 85,
      "feedback": "Jawaban sangat bagus dan runut"
    }
  ]
}
```

---

## 4. Siswa (Student) - Pengerjaan Ujian

### Mendapatkan Daftar Ujian Tersedia
- **Endpoint:** `GET /student/exams`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-schedule",
      "title": "UTS IPA",
      "startTime": "2026-04-03T08:00:00Z",
      "endTime": "2026-04-03T10:00:00Z"
    }
  ]
}
```

### Memulai Ujian
- **Endpoint:** `POST /student/exams/:scheduleId/start`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": {
    "session": { "id": "uuid", "status": "ONGOING", "startTime": "..." },
    "questions": [
      { "id": "uuid-1", "questionText": "Soal 1", "options": ["A", "B", "C", "D"], "type": "PILGAN" },
      { "id": "uuid-2", "questionText": "Soal 2", "type": "URAIAN" }
    ]
  }
}
```

### Mengumpulkan Jawaban (Submit)
- **Endpoint:** `POST /student/exams/:scheduleId/submit`
- **Request Body:**
```json
{
  "answers": [
    { "soalId": "uuid-1", "answer": "Jakarta" },
    { "soalId": "uuid-2", "answer": "Jawaban panjang siswa untuk uraian..." }
  ]
}
```
- **Response Sukses (200):**
```json
{
  "status": "success",
  "message": "Exam submitted successfully",
  "score": 80
}
```

---

### Lihat Riwayat Hasil Ujian
- **Endpoint:** `GET /student/results`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": [ { "id": "uuid", "examTitle": "IPA", "score": 85, "submittedAt": "..." } ]
}
```

### Detail Hasil Ujian
- **Endpoint:** `GET /student/results/:hasilUjianId`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": { "examTitle": "IPA", "answers": [ { "soal": "...", "score": 10 } ] }
}
```

---

## 5. Laporan (Reports)

### Laporan Nilai Kelas (JSON)
- **Endpoint:** `GET /reports/exams/:scheduleId`
- **Response Sukses (200):**
```json
{
  "status": "success",
  "data": {
    "examTitle": "Ulangan Harian",
    "results": [
      { "studentName": "Budi", "autoScore": 80, "uraianTotalPoints": 15, "status": "COMPLETED" }
    ]
  }
}
```

---

## Format Error Umum

### 400 Bad Request (Validasi Gagal)
```json
{
  "status": "error",
  "message": "\"username\" is required"
}
```

### 403 Forbidden (Tidak Punya Akses)
```json
{
  "status": "error",
  "message": "Forbidden: You do not have access to this resource"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Route not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal Server Error",
  "stack": "..." (hanya muncul di environment development)
}
```
