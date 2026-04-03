# Sistem CBT SD (Computer Based Test)

Sistem CBT SD adalah backend application berbasis Node.js yang ditujukan untuk mengelola ujian berbasis komputer (CBT) interaktif bagi siswa Sekolah Dasar. Sistem ini memiliki 3 pengguna (Role) utama, yaitu **Admin**, **Guru**, dan **Siswa**, dengan akses dan fungsi yang tersegregasi.

## 🚀 Fitur Utama

- **Role-Based Access Control (RBAC):** Autentikasi aman menggunakan JWT dengan batasan akses penuh per-role.
- **Sistem Keamanan Sesi Ganda:** Mencegah satu user (terutama Siswa) untuk login di banyak perangkat secara serentak (Single-device session).
- **Manajemen Materi & Ujian (Guru):** Guru dapat mengunggah file Modul (PDF), membuat Bank Soal, dan menyusun Paket Ujian pilihan ganda & Uraian.
- **CBT Engine Berwaktu (Siswa):** Halaman ujian interaktif yang membaca waktu mulai dan kadaluwarsa pengerjaan, lengkap dengan fitur auto-grading untuk soal pilihan ganda.
- **Penilaian Manual & Feedback:** Guru dapat membaca jawaban Uraian berbentuk teks dari murid, serta memberikan nilai langsung dan umpan balik yang dapat dibaca oleh Siswa.
- **Laporan Otomatis:** Output JSON format untuk rekapitulasi poin kelas keseluruhan.
- **Rotasi Log Otomatis:** Sistem logging menyeluruh per aksi user menggunakan standar industri `winston`.
- **API Documentation Terintegrasi:** Spesifikasi lengkap menggunakan Swagger API documentation (OpenAPI 3.0).

---

## 🛠️ Stack Teknologi Terapan
- **Runtime Environment:** Node.js versi LTS (`ES Modules`)
- **Web Framework:** Express.js 5.x
- **Database & ORM:** MySQL & Prisma ORM 
- **Autentikasi:** JSON Web Token (JWT) + Bcrypt
- **Logger:** Winston Dailly Rotate File
- **Dokumentasi API:** Swagger UI Express & YAML

---

## 💻 Persyaratan Infrastruktur (Prerequisites)
Pastikan hal berikut sudah terinstall di perangkat pengembangan / server:
- Node.js LTS (v16, v18, v20, dst).
- Database MySQL Client.

---

## ⚙️ Petunjuk Pemasangan (Setup Guide)

1. **Clone repositori**
   ```bash
   git clone <url-repo-anda>
   cd vibe-engineering
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Inisialisasi Variabel Lingkungan (.env)**
   Sesuaikan URL akses ke Database MySQL, ubah username dan password root sesuai spesifikasi server Anda.
   ```env
   DATABASE_URL="mysql://root:password_anda@localhost:3306/cbt_sd_db"
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=super_secret_session_key
   ```

4. **Sinkronisasi Skema Database**
   Perintah ini akan membaca `schema.prisma` dan menyusun tabel yang dibutuhkan ke Database Anda.
   ```bash
   npx prisma db push
   ```
   *(Penting: Saat inisialisasi awal pada device baru, biasakan juga menjalankan `npx prisma generate`)*

5. **Jalankan Seeder (Akun Bawaan)**
   Akan menumbuhkan sebuah akun **Admin** default dengan kata sandi bawaan, yang tugasnya bertugas mendistribusikan akun guru dan murid.
   ```bash
   npm run seed
   ```

6. **Jalankan Aplikasi**
   Untuk Server Production:
   ```bash
   npm start
   ```
   Untuk Mode Development (Live Reload):
   ```bash
   npm run dev
   ```

---

## 📖 Dokumentasi Endpoint API (Swagger)

Aplikasi ini dilengkapi Dokumentasi Swagger bawaan interaktif. Saat API berjalan Anda bisa melihat cara pakai seluruh endpoint beserta tipe Request JSON lewat:

**Endpoint Akses:** `http://localhost:3000/api-docs`

---

## 👥 Alur Penggunaan (User Workflow) Dasar

1. **Admin Utama** masuk ke sistem (`username: admin`, `password: admin123`), lalu menggunakan Token JWT tersebut untuk Mendaftarkan akun **Guru** dan **Siswa** sembari mendistribusikan _Password Default Auto-Generate_.
2. **Guru** masuk, mengganti password, kemudian membuat **Modul PDF**, **Soal-soal**, dan menjadwalkan **Paket Ujian** ke Suatu Kelas / Rombel.
3. **Siswa** masuk, menekan **Mulai Ujian (CBT)**, dan Mengerjakan Ujian sampai Selesai.
4. Terakhir, **Guru** memeriksa Uraian, lalu mengunduh **Classroom Report**.
