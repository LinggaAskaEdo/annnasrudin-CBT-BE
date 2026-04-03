# Sistem CBT SD (Computer Based Test)

Sistem CBT SD adalah backend application berbasis Node.js yang ditujukan untuk mengelola ujian berbasis komputer (CBT) interaktif bagi siswa Sekolah Dasar. Sistem ini memiliki 3 pengguna (Role) utama, yaitu **Admin**, **Guru**, dan **Siswa**, dengan akses dan fungsi yang tersegregasi.

## 🚀 Fitur Utama

- **Role-Based Access Control (RBAC):** Autentikasi aman menggunakan JWT dengan batasan akses penuh per-role.
- **Sistem Keamanan Sesi Ganda:** Mencegah satu user untuk login di banyak perangkat secara serentak. Jika login di perangkat baru, sesi lama akan otomatis keluar dengan pesan: `"Sedang login di perangkat lain"`.
- **Manajemen Materi & Ujian (Guru):** Guru dapat mengelola Modul (PDF), membuat Bank Soal, dan menyusun Paket Ujian pilihan ganda & Uraian (Full CRUD).
- **CBT Engine Berwaktu (Siswa):** Halaman ujian interaktif yang mengikuti jadwal `startTime` dan `deadline`.
- **Penilaian Manual & Skor Agregat:** Guru dapat menilai soal Uraian secara manual. Skor total akhir adalah akumulasi Poin Pilgan + Poin Uraian.
- **Laporan Otomatis:** Output JSON format untuk rekapitulasi nilai kelas keseluruhan.
- **API Documentation Terintegrasi:** Spesifikasi lengkap menggunakan Swagger UI.

---

## 🛠️ Stack Teknologi Terapan
- **Runtime:** Node.js LTS (ES Modules)
- **Framework:** Express.js 5.x
- **ORM:** Prisma v6
- **Database:** MySQL
- **Auth:** JWT + Bcrypt
- **Documentation:** Swagger / OpenAPI 3.0

---

## ⚙️ Petunjuk Pemasangan (Setup Guide)

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   npm install
   ```

2. **Environment (.env)**
   ```env
   DATABASE_URL="mysql://root:pass@localhost:3306/cbt_db"
   PORT=3000
   JWT_SECRET="your_secret"
   ```

3. **Database Sync**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run seed
   ```

4. **Run**
   ```bash
   npm run dev
   ```

---

## 📖 Dokumentasi API

Seluruh request yang membutuhkan autentikasi harus menyertakan Header:
`Authorization: Bearer <token>`

### 🔐 Autentikasi
| Method | Endpoint | Role | Deskripsi |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | Publik | Login & mendapatkan Token |
| POST | `/api/auth/logout` | All | Logout & hapus sesi aktif |

### 👨‍💼 Admin (Manajemen User)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| PATCH | `/api/admin/profile` | Update nama/password Admin sendiri |
| POST | `/api/admin/users` | Buat User baru (**ADMIN**, **GURU**, **SISWA**) |
| GET | `/api/admin/users` | List semua user |

### 👨‍🏫 Guru (Materi & Ujian)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| POST/PUT/DELETE | `/api/modules/` | Kelola Modul PDF (Upload ke `/uploads`) |
| POST/PUT/DELETE | `/api/exams/packages` | Kelola Paket Ujian |
| POST/PUT/DELETE | `/api/exams/questions` | Kelola Bank Soal |
| POST/PUT/DELETE | `/api/exams/schedule` | Kelola Jadwal Ujian Rombel |
| GET | `/api/teacher/students` | Lihat daftar siswa per Rombel |
| PATCH | `/api/teacher/submissions/:id/grade` | Berikan nilai & feedback Uraian |

### 👶 Siswa (Pengerjaan Ujian)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| GET | `/api/student/modules` | Lihat modul yang tersedia untuk Rombelnya |
| GET | `/api/student/exams` | Lihat jadwal ujian aktif/mendatang |
| POST | `/api/student/exams/:id/start` | Mulai sesi ujian (mendapat soal) |
| POST | `/api/student/exams/:id/submit` | Kirim jawaban ujian (Auto-grading Pilgan) |
| GET | `/api/student/results` | Lihat riwayat dan detail nilai |

### 📊 Laporan
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| GET | `/api/reports/classroom/:scheduleId` | Download rekapitulasi nilai satu kelas (JSON) |

---

## 👥 Alur Penggunaan (User Workflow) Dasar

1. **Admin** mendaftarkan Guru & Siswa, serta memberikan _Password Default_.
2. **Guru** login, mengunggah materi belajar, menyusun soal, dan menentukan jadwal ujian.
3. **Siswa** mengerjakan ujian sesuai jadwal. Sistem otomatis mengoreksi Pilihan Ganda.
4. **Guru** masuk ke menu grading untuk mengoreksi Soal Uraian secara manual.
5. **Score Final** (Pilgan + Uraian) tersimpan secara otomatis dan dapat dilihat oleh Siswa maupun Guru/Admin via Laporan.

**Swagger Docs:** `http://localhost:3000/api-docs`
