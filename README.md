# Aplikasi Ujian Sekolah Kedinasan

Sistem ujian online modern dengan RBAC (Role-Based Access Control), dashboard komprehensif, dan analisa AI. Dirancang untuk sekolah kedinasan, CPNS, UTBK/SNBT, dan ujian seleksi lainnya.

**Versi:** 2.0  
**Status:** Production Ready ✅  
**Last Updated:** 14 Mei 2026

## 🎯 Fitur Utama

### Untuk Peserta
- ✅ Simulasi ujian real-time dengan timer otomatis
- ✅ Random soal adaptif berdasarkan kesulitan
- ✅ Sistem CAT dengan status visual soal (belum dijawab, dijawab, ragu-ragu)
- ✅ Auto-save jawaban dan submit otomatis
- ✅ Pembahasan soal langsung setelah selesai
- ✅ Ranking & history tryout
- ✅ Sertifikat digital
- ✅ Anti-cheat system

### Untuk Admin
- ✅ CRUD soal dengan dukungan gambar, audio, dan PDF
- ✅ Import soal dari Excel/CSV
- ✅ Generator soal otomatis dengan template
- ✅ Analisa hasil peserta mendalam
- ✅ Manajemen kategori, paket, dan user
- ✅ Statistik komprehensif
- ✅ Content Generation (Generate Soal, Bahan Pelajaran, Tips, Educational Content)
- ✅ System Maintenance (Backup, Cleanup, Storage Analysis, System Status)

### Teknologi AI (Opsional)
- 🤖 AI Generator Soal otomatis
- 🤖 AI Pembahasan soal
- 🤖 OCR foto soal (Tesseract/Google Vision)
- 🤖 Generator distraktor cerdas
- 🤖 Adaptive difficulty (naik-turun level berdasarkan jawaban)

---

## 🛠️ Tech Stack

### Stack Ringan (Rekomendasi untuk Pemula)
```
Frontend: HTML + Bootstrap + jQuery
Backend: PHP Native / PHP OOP
Database: MySQL / MariaDB
```

### Stack Modern (Rekomendasi untuk Scale-up)
```
Frontend: React / Vue
Backend: Laravel / Node.js
Database: PostgreSQL
Realtime: Socket.IO
```

---

## 📋 Target Paket Ujian

- **UTBK / SNBT** - Ujian masuk perguruan tinggi
- **Sekolah Kedinasan** - STPN, IPDN, dll
- **CPNS / CAT** - Ujian seleksi PNS
- **Sekolah** - SD, SMP, SMA, ujian semester
- **TOEFL Dasar** - Test bahasa Inggris
- **Psikotes** - Tes psikologi
- **Olimpiade** - Ujian olimpiade
- **Tryout Umum** - Paket custom

---

## 📁 Struktur Folder

```
/project-root
├── /admin              # Panel admin untuk manajemen
├── /api                # API endpoints (JSON)
├── /assets             # Statis files
│   ├── /images         # Gambar soal & jawaban
│   ├── /audio          # File audio soal
│   ├── /pdf            # File PDF soal
│   └── /uploads        # Upload user
├── /config             # Konfigurasi database & env
├── /database           # SQL scripts & backup
├── /modules            # Logic bisnis
├── /templates          # HTML templates
├── /tryout             # Halaman ujian
├── /user               # Dashboard user
├── /vendor             # Dependencies (Composer)
└── index.php           # Entry point
```

---

## 💾 Struktur Database Utama

### Tabel Users
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    role ENUM('admin','guru','siswa'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel Soal
```sql
CREATE TABLE soal (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT,
    paket_id INT,
    tipe ENUM('pilihan_ganda','essay','gambar','audio'),
    tingkat ENUM('mudah','sedang','sulit'),
    soal LONGTEXT,
    gambar VARCHAR(255),
    audio VARCHAR(255),
    pembahasan LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabel Hasil Ujian
```sql
CREATE TABLE hasil_ujian (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    paket_id INT,
    nilai DECIMAL(5,2),
    benar INT,
    salah INT,
    kosong INT,
    waktu_mulai DATETIME,
    waktu_selesai DATETIME
);
```

---

## 🚀 Alur Ujian

```
Login
  ↓
Pilih Paket Tryout
  ↓
Mulai Ujian (Timer Jalan)
  ↓
Jawab Soal
  ↓
Submit Ujian
  ↓
Hitung Nilai
  ↓
Tampilkan Hasil + Pembahasan
  ↓
Ranking & Sertifikat
```

---

## 📊 Sistem Analisa

Aplikasi memberikan insight mendalam:
- Rata-rata nilai per kategori
- Soal tersulit & waktu pengerjaan
- Analisa kelemahan siswa
- Grafik progress dari waktu ke waktu
- Ranking kompetitif antar peserta

---

## 🔐 Keamanan Sistem

- `password_hash()` untuk enkripsi password
- Prepared statements (SQL injection prevention)
- CSRF token protection
- Session security
- HTTPS support
- Validasi upload file

---

## 🚦 Sistem Anti Cheat

- Disable copy-paste
- Disable klik kanan
- Deteksi tab pindah → auto logout
- Token ujian unik per sesi
- Limit 1 device per user

---

## 🎯 Roadmap Pengembangan

### Tahap 1 (MVP)
- ✅ Login & register
- ✅ Bank soal
- ✅ Ujian dasar

### Tahap 2
- [ ] Random soal per kategori
- [ ] Timer & countdown
- [ ] Ranking sistem

### Tahap 3
- [ ] Soal bergambar & audio
- [ ] Import Excel/CSV
- [ ] Pembahasan otomatis

### Tahap 4
- [ ] AI Generator soal
- [ ] OCR foto soal
- [ ] Adaptive testing

### Tahap 5
- [ ] Mobile app (React Native)
- [ ] Realtime analytics
- [ ] Machine learning prediction

---

## 🖥️ Requirement Server

**Minimal:**
- 4 Core CPU
- 8 GB RAM
- SSD Storage
- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.3+

---

## 📝 Import Format Excel

Format untuk import soal via Excel:

| soal | A | B | C | D | E | jawaban |
|------|---|---|---|---|---|---------|
| Apa ibu kota Indonesia? | Jakarta | Bandung | Surabaya | Medan | Bali | A |

**Supported format:** `.xlsx`, `.csv`

---

## 🔌 API Endpoints

```
POST   /api/login.php           → Autentikasi user
GET    /api/get-soal.php        → Ambil soal ujian
POST   /api/save-jawaban.php    → Simpan jawaban (auto-save)
POST   /api/submit.php          → Submit ujian
GET    /api/hasil.php           → Hasil ujian & pembahasan
```

Response format: **JSON**

---

## 🎓 Cocok Untuk

- 👨‍👩‍👧‍👦 Belajar keluarga
- 🏫 Sekolah & bimbingan belajar (bimbel)
- 👥 Komunitas & forum belajar
- 💼 Pelatihan korporat
- 🎓 Lembaga pendidikan
- 📚 Penggunaan pribadi

---

## 📄 Blueprint Lengkap

Dokumentasi teknis detail tersedia di section Blueprint di atas. Mencakup:
- Tabel database lengkap
- Sistem random & timer
- Implementasi CAT & OCR
- Generator soal otomatis
- Fitur masa depan

---

## 🤝 Kontribusi

Silakan fork, buat branch fitur, dan submit pull request untuk improvement.

```bash
git checkout -b feature/nama-fitur
git commit -am "Add: deskripsi fitur"
git push origin feature/nama-fitur
```

---

## 📞 Support & Feedback

Untuk issue, saran, atau pertanyaan → buka GitHub Issue

---

## 📜 Lisensi

[MIT License](LICENSE) - Bebas digunakan untuk komersial maupun non-komersial

---

## 👨‍💻 Pengembang

Made with ❤️ by [82080038](https://github.com/82080038)

---

## 📌 Blueprint Lengkap (Markdown / MD)

```md
# APLIKASI TRYOUT & SIMULASI UJIAN
## Blueprint Sistem Lengkap

Versi: 1.0
Target:
- UTBK / SNBT
- Sekolah Kedinasan
- CPNS / CAT
- SD / SMP / SMA
- TOEFL Dasar
- Psikotes
- Olimpiade
- Tryout Umum

Teknologi:
- Backend: PHP Native / PHP OOP
- Database: MySQL / MariaDB
- Frontend: HTML, CSS, JavaScript, jQuery
- Optional:
  - React
  - Node.js Microservice
  - OCR
  - AI Generator Soal

---

# 1. TUJUAN SISTEM

Membuat aplikasi:
- simulasi ujian nyata
- tryout online
- bank soal adaptif
- CAT simulator
- pembelajaran berbasis analisa hasil

Sistem harus:
- cepat
- ringan
- aman
- mudah dikembangkan
- support soal bergambar
- support ribuan soal

---

# 2. FITUR UTAMA

## 2.1 Fitur Peserta

- Login
- Register
- Pilih paket tryout
- Mulai ujian
- Timer otomatis
- Random soal
- Navigasi soal
- Tandai ragu-ragu
- Auto save jawaban
- Submit otomatis
- Pembahasan
- Ranking
- History tryout
- Sertifikat

---

## 2.2 Fitur Admin

- CRUD soal
- Upload gambar soal
- Upload gambar jawaban
- Upload audio
- Upload PDF
- Import Excel
- Generate soal otomatis
- Analisa hasil peserta
- Kelola kategori
- Kelola paket tryout
- Kelola user
- Statistik

---

## 2.3 Fitur AI

- AI Generator Soal
- AI Pembahasan
- OCR Foto Soal
- Generator Distraktor
- Adaptive Difficulty
- Analisa kelemahan siswa

---

# 3. STRUKTUR FOLDER

/project-root
│
├── /admin
├── /api
├── /assets
│   ├── /images
│   ├── /audio
│   ├── /pdf
│   └── /uploads
│
├── /config
├── /database
├── /modules
├── /templates
├── /tryout
├── /user
├── /vendor
└── index.php

---

# 4. STRUKTUR DATABASE

## 4.1 users

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    role ENUM('admin','guru','siswa'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

## 4.2 kategori

CREATE TABLE kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100)
);

Contoh:
- Matematika
- Bahasa Indonesia
- TWK
- TIU
- TKP

---

## 4.3 paket_tryout

CREATE TABLE paket_tryout (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_paket VARCHAR(200),
    deskripsi TEXT,
    durasi INT,
    total_soal INT,
    kategori_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

## 4.4 soal

CREATE TABLE soal (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT,
    paket_id INT,
    tipe ENUM('pilihan_ganda','essay','gambar','audio'),
    tingkat ENUM('mudah','sedang','sulit'),
    soal LONGTEXT,
    gambar VARCHAR(255),
    audio VARCHAR(255),
    pembahasan LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

## 4.5 pilihan_jawaban

CREATE TABLE pilihan_jawaban (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    soal_id BIGINT,
    opsi ENUM('A','B','C','D','E'),
    isi_jawaban TEXT,
    gambar VARCHAR(255),
    benar TINYINT(1)
);

---

## 4.6 hasil_ujian

CREATE TABLE hasil_ujian (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    paket_id INT,
    nilai DECIMAL(5,2),
    benar INT,
    salah INT,
    kosong INT,
    waktu_mulai DATETIME,
    waktu_selesai DATETIME
);

---

## 4.7 jawaban_user

CREATE TABLE jawaban_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hasil_id BIGINT,
    soal_id BIGINT,
    jawaban VARCHAR(10),
    benar TINYINT(1)
);

---

# 5. SISTEM RANDOM SOAL

Metode:
- shuffle soal
- random per kategori
- random per tingkat kesulitan

Contoh:
- 20 mudah
- 30 sedang
- 10 sulit

---

# 6. SISTEM TIMER

Fitur:
- countdown
- auto submit
- warning waktu habis
- save realtime

Teknologi:
- JavaScript Timer
- AJAX Auto Save

---

# 7. SISTEM SIMULASI CAT

Tampilan:
- nomor soal
- warna status
- tombol ragu-ragu
- progress pengerjaan

Warna:
- putih = belum dijawab
- hijau = dijawab
- kuning = ragu-ragu

---

# 8. SOAL BERGAMBAR

## Struktur

/assets/images/soal/
/assets/images/jawaban/

Database:
- gambar pada tabel soal
- gambar pada tabel pilihan_jawaban

---

# 9. OCR FOTO SOAL

Alur:
Foto → OCR → Parsing → Database

Teknologi:
- Tesseract OCR
- Google Vision API
- OpenCV

---

# 10. IMPORT EXCEL

Format:

| soal | A | B | C | D | E | jawaban |

Import:
- PHPSpreadsheet
- CSV
- XLSX

---

# 11. GENERATOR SOAL OTOMATIS

Contoh template:

Jika {a}x + {b} = {c}, maka x = ?

Generator:
- random angka
- random jawaban
- random distraktor

---

# 12. SISTEM ANALISA NILAI

Analisa:
- rata-rata nilai
- tingkat kesulitan
- soal tersulit
- waktu pengerjaan
- ranking

---

# 13. ADAPTIVE TESTING

Jika user:
- benar terus → naik level
- salah terus → turun level

Level:
- mudah
- sedang
- sulit

---

# 14. SISTEM ANTI CHEAT

- disable copy paste
- disable klik kanan
- deteksi tab pindah
- auto logout
- token ujian
- limit device

---

# 15. KEAMANAN SISTEM

- password_hash()
- prepared statement
- CSRF token
- session security
- HTTPS
- validasi upload

---

# 16. API STRUKTUR

/api/login.php
/api/get-soal.php
/api/save-jawaban.php
/api/submit.php
/api/hasil.php

Format:
JSON API

---

# 17. STRUKTUR FRONTEND

Halaman:
- login
- dashboard
- daftar tryout
- halaman ujian
- hasil ujian
- ranking

---

# 18. ALUR UJIAN

Login
↓
Pilih Paket
↓
Mulai Ujian
↓
Timer Jalan
↓
Jawab Soal
↓
Submit
↓
Hitung Nilai
↓
Tampilkan Hasil

---

# 19. ROADMAP PENGEMBANGAN

## Tahap 1
- login
- bank soal
- ujian dasar

## Tahap 2
- random soal
- timer
- ranking

## Tahap 3
- soal bergambar
- import excel
- pembahasan

## Tahap 4
- AI generator
- OCR
- adaptive testing

## Tahap 5
- mobile app
- realtime analytics
- machine learning

---

# 20. REKOMENDASI SERVER

Minimal:
- 4 Core CPU
- 8 GB RAM
- SSD
- PHP 8+
- MariaDB 10+

---

# 21. REKOMENDASI STACK

## Stack Ringan

Frontend:
- HTML
- Bootstrap
- jQuery

Backend:
- PHP Native

Database:
- MySQL

---

## Stack Modern

Frontend:
- React

Backend:
- Node.js / Laravel

Database:
- PostgreSQL

Realtime:
- Socket.IO

---

# 22. FITUR MASA DEPAN

- voice question
- AI tutor
- AI pembahasan suara
- leaderboard nasional
- multiplayer quiz
- live class
- video pembelajaran

---

# 23. KESIMPULAN

Sistem ini dirancang:
- modular
- scalable
- ringan
- cocok untuk ribuan soal
- support gambar
- support AI
- support simulasi CAT

Sangat cocok untuk:
- keluarga
- sekolah
- bimbel
- komunitas belajar
- penggunaan pribadi

```
