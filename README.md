# API Documentation - Sistem CBT SD

Dokumentasi ini berisi daftar seluruh endpoint API yang tersedia pada Sistem CBT SD.

---

## 1. Authentication (`/api/auth`)

| Endpoint    | Method   | Description   | Request Body                                 |
|-------------|----------|---------------|----------------------------------------------|
| `/login`    | POST     | Login user    | `{ "username": "...", "password": "..." }`   |
| `/logout`   | POST     | Logout user   | -                                            |

---

## 2. Admin Management (`/api/admin`)

### Role: ADMIN (Admin Management)

| Endpoint                | Method   | Description           | Request Body                                                         |
|-------------------------|----------|-----------------------|----------------------------------------------------------------------|
| `/profile`              | PATCH    | Update profil admin   | `{ "name": "...", "password": "..." }`                               |
| `/users`                | POST     | Buat user baru        | `{ "username": "...", "name": "...", "role": "GURU/SISWA", ... }`    |
| `/users`                | GET      | Daftar semua user     | -                                                                    |
| `/users/:id`            | DELETE   | Hapus user            | -                                                                    |
| `/users/:id/password`   | PATCH    | Reset password user   | `{ "newPassword": "..." }`                                           |
| `/rombel`               | POST     | Buat Rombel baru      | `{ "name": "..." }`                                                  |
| `/rombel`               | GET      | Daftar semua rombel   | -                                                                    |

---

## 3. Guru Features (`/api/guru`)

### Role: GURU (Guru Features)

| Endpoint                   | Method   | Description            | Request Body                                                |
|----------------------------|----------|------------------------|-------------------------------------------------------------|
| `/profile`                 | PATCH    | Update profil guru     | `{ "name": "...", "password": "..." }`                      |
| `/siswa`                   | GET      | Daftar siswa           | -                                                           |
| `/siswa`                   | POST     | Buat akun siswa        | `{ "username": "...", "name": "...", "rombelId": "..." }`   |
| `/siswa/:id`               | DELETE   | Hapus akun siswa       | -                                                           |
| `/rombel`                  | POST     | Buat Rombel baru       | `{ "name": "..." }`                                         |
| `/rombel`                  | GET      | Daftar semua rombel    | -                                                           |
| `/exam-results`            | GET      | Lihat hasil ujian      | -                                                           |
| `/submissions/:id`         | GET      | Detail jawaban siswa   | -                                                           |
| `/submissions/:id/grade`   | PATCH    | Penilaian uraian       | `{ "uraianGrades": [...] }`                                 |

---

## 4. Siswa Features (`/api/siswa`)

### Role: SISWA (Siswa Features)

| Endpoint             | Method   | Description          | Request Body              |
|----------------------|----------|----------------------|---------------------------|
| `/profile`           | PATCH    | Ganti password       | `{ "password": "..." }`   |
| `/modules`           | GET      | Materi belajar       | -                         |
| `/exams`             | GET      | Daftar ujian aktif   | -                         |
| `/exams/:id/start`   | POST     | Mulai ujian          | -                         |
| `/exams/:id/submit`  | POST     | Kumpulkan jawaban    | `{ "answers": [...] }`    |
| `/results`           | GET      | Riwayat nilai        | -                         |
| `/results/:id`       | GET      | Detail nilai         | -                         |

---

## 5. Exam Management (`/api/exams`)

### Role: GURU (Exam Management)

| Endpoint           | Method   | Description         | Request Body                                                                       |
|--------------------|----------|---------------------|------------------------------------------------------------------------------------|
| `/packages`        | POST     | Buat paket soal     | `{ "title": "...", "mapelId": "..." }`                                             |
| `/my-packages`     | GET      | Paket soal saya     | -                                                                                  |
| `/packages/:id`    | PUT      | Edit paket soal     | `{ "title": "..." }`                                                               |
| `/packages/:id`    | DELETE   | Hapus paket soal    | -                                                                                  |
| `/questions`       | POST     | Tambah soal         | `{ "paketUjianId": "...", "type": "PILGAN/URAIAN", ... }`                          |
| `/bank-soal`       | GET      | Lihat bank soal     | -                                                                                  |
| `/questions/:id`   | PUT      | Edit soal           | -                                                                                  |
| `/questions/:id`   | DELETE   | Hapus soal          | -                                                                                  |
| `/schedule`        | POST     | Buat jadwal ujian   | `{ "paketUjianId": "...", "rombelId": "...", "startAt": "...", "endAt": "..." }`   |
| `/my-schedules`    | GET      | Jadwal saya         | -                                                                                  |
| `/schedule/:id`    | PUT      | Edit jadwal         | -                                                                                  |
| `/schedule/:id`    | DELETE   | Hapus jadwal        | -                                                                                  |

---

## 6. Learning Materials (`/api/modules`)

### Role: GURU (Learning Materials)

| Endpoint   | Method   | Description          | Request Body                                   |
|------------|----------|----------------------|------------------------------------------------|
| `/`        | POST     | Upload Modul (PDF)   | *Multipart/Form-Data* (title, pdf, rombelId)   |
| `/:id`     | PUT      | Update Modul         | *Multipart/Form-Data*                          |
| `/:id`     | DELETE   | Hapus Modul          | -                                              |
| `/my`      | GET      | Modul saya           | -                                              |

---

## 7. Reports (`/api/reports`)

### Role: GURU (Reports)

| Endpoint              | Method   | Description         | Request Body   |
|-----------------------|----------|---------------------|----------------|
| `/exams/:scheduleId`  | GET      | Hasil Rekap Kelas   | -              |
