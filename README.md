# Aplikasi Ujian Sekolah Kedinasan

Sistem ujian online modern dengan RBAC (Role-Based Access Control), dashboard komprehensif, dan analisa AI. Dirancang untuk sekolah kedinasan, CPNS, UTBK/SNBT, dan ujian seleksi lainnya.

**Versi:** 2.1  
**Status:** Production Ready ✅  
**Last Updated:** 26 Mei 2026

## 📚 Table of Contents
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Setup Development Environment](#-setup-development-environment)
- [Database Setup](#-database-setup)
- [Running Migrations](#-running-migrations)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development Workflow](#-development-workflow)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

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

## � Quick Start

### Prerequisites
- PHP 8.0 or higher
- MySQL 5.7+ / MariaDB 10.3+
- XAMPP (recommended) or WAMP for Windows
- Git
- Modern web browser

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/82080038/bimbel.git
   cd bimbel
   ```

2. **Configure database**
   - Open `config.php`
   - Update database credentials:
     ```php
     define('DB_HOST', 'localhost');
     define('DB_USER', 'root');
     define('DB_PASS', ''); // Your MySQL password
     define('DB_NAME', 'ujian_sekolah_kedinasan');
     ```

3. **Create database**
   ```sql
   CREATE DATABASE ujian_sekolah_kedinasan;
   ```

4. **Run migrations**
   ```bash
   # Run all migration scripts
   php migrate_course_management.php
   php migrate_gamification.php
   php migrate_notifications.php
   php migrate_analytics.php
   php migrate_content_management.php
   ```

5. **Start the application**
   - Open XAMPP Control Panel
   - Start Apache and MySQL
   - Open browser: `http://localhost/bimbel/login.html`

---

## 💻 Setup Development Environment

### Windows with XAMPP

1. **Install XAMPP**
   - Download from https://www.apachefriends.org/
   - Install to `C:\xampp`
   - Start Apache and MySQL from XAMPP Control Panel

2. **Configure PHP**
   - PHP is already included in XAMPP at `C:\xampp\php`
   - Add PHP to PATH: `C:\xampp\php`
   - Enable required extensions in `php.ini`:
     ```ini
     extension=mysqli
     extension=pdo_mysql
     extension=gd
     extension=mbstring
     extension=curl
     extension=json
     extension=fileinfo
     ```

3. **Configure MySQL**
   - Default credentials: root / (empty password)
   - Access phpMyAdmin: `http://localhost/phpmyadmin`
   - Create database: `ujian_sekolah_kedinasan`

### Linux/Mac with MAMP

1. **Install MAMP**
   - Download from https://www.mamp.info/
   - Install and start MAMP
   - Configure Apache to point to project directory

2. **Configure PHP and MySQL**
   - Similar to XAMPP setup
   - Update `config.php` with your credentials

---

## 🗄️ Database Setup

### Initial Database Setup

1. **Create database**
   ```sql
   CREATE DATABASE ujian_sekolah_kedinasan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Import database**
   ```bash
   # Import from latest export file
   mysql -u root -p ujian_sekolah_kedinasan < database/export_*.sql
   ```

### Database Structure

The application uses 68 database tables organized into the following main categories:
- `users` - User accounts and authentication
- `soal` - Exam questions (with topic-based categorization)
- `riwayat_ujian` - Exam history
- `kategori` - Question categories
- `paket_tryout` - Exam packages
- `user_xp` - Gamification XP system
- `user_streak` - Learning streaks
- `badges` - Achievement badges
- `achievements` - User achievements
- `daily_challenges` - Daily learning challenges
- `notifications` - Notification system
- `notification_preferences` - User notification settings
- `question_analytics` - Question performance analytics
- `user_analytics` - User performance analytics
- `courses` - Course management
- `course_modules` - Course modules
- `course_materials` - Course materials
- `learning_paths` - Learning paths
- `expert_knowledge` - Expert system knowledge base
- `content_versions` - Content version control
- `translations` - Multi-language support

**Latest Database Export:** `database/export_2026-05-25_21-42-34.sql` (11MB, 68 tables)

### Exporting Database

To export database with all data:
```bash
php export_database.php
```

This will generate `database/export_YYYY-MM-DD_HH-MM-SS.sql` with complete data.

---

## 🔄 Running Migrations

The application uses migration scripts to apply database schema changes.

### Available Migration Scripts

| Migration Script | Purpose |
|-----------------|---------|
| `migrate_course_management.php` | Course management and learning paths |
| `migrate_gamification.php` | Gamification system (XP, badges, achievements) |
| `migrate_notifications.php` | Notification system |
| `migrate_analytics.php` | Advanced analytics |
| `migrate_content_management.php` | Content version control and translations |

### Running Migrations

```bash
# Run a single migration
php migrate_course_management.php

# Run all migrations
php migrate_course_management.php
php migrate_gamification.php
php migrate_notifications.php
php migrate_analytics.php
php migrate_content_management.php
```

### Exporting Database

```bash
# Export database with timestamp
php export_database.php
```

---

## 📁 Project Structure

```
/project-root
├── /admin              # Panel admin untuk manajemen
│   └── admin.html      # Admin dashboard
├── /api                # API endpoints (JSON) - 18 files
│   ├── auth.php        # Authentication API
│   ├── soal.php        # Exam questions API
│   ├── gamification.php # Gamification API
│   ├── notifications.php # Notification API
│   ├── analytics.php   # Analytics API
│   ├── courses.php     # Course management API
│   ├── expert.php      # Expert system & AI API
│   ├── pembahasan.php  # Discussion/explanation API
│   ├── batch_generate.php # Batch question generation API
│   ├── csrf.php        # CSRF token management
│   ├── middleware.php  # Authentication middleware
│   ├── rate_limiter.php # API rate limiting
│   ├── validator.php  # Input validation
│   ├── export_database_web.php # Database export via web
│   ├── add_internet_materials_v2.php # Add questions from internet research
│   ├── add_internet_materials_questions.php # Add questions from materials
│   └── upload_image.php # Image upload handler
├── /assets             # Statis files
│   ├── /images         # Gambar soal & jawaban
│   ├── /audio          # File audio soal
│   ├── /pdf            # File PDF soal
│   └── /uploads        # Upload user
├── /config             # Konfigurasi database & env
│   └── config.php      # Main configuration file
├── /database           # SQL scripts & backup
│   ├── course_management.sql
│   ├── gamification.sql
│   ├── notifications.sql
│   ├── analytics.sql
│   ├── content_management.sql
│   └── export_*.sql    # Database exports
├── /js                 # JavaScript files
│   ├── config.js       # Frontend configuration
│   └── rbac.js         # Role-based access control
├── /participant        # Participant dashboard
│   ├── dashboard.html   # Main dashboard
│   ├── ujian.html      # Exam interface
│   └── materi.html     # Learning materials
├── /scripts            # Utility scripts
│   ├── check_reminders.php
│   └── minify_assets.php
├── /tests              # Test files
├── /vendor             # Dependencies (Composer)
├── config.php          # Database configuration
├── export_database.php # Database export script
├── migrate_*.php       # Migration scripts
├── README.md           # This file
├── SYSTEM_OVERVIEW.md  # System documentation
├── IMPROVEMENT_ROADMAP.md # Feature roadmap
└── index.php           # Entry point
```

---

## 🔌 API Documentation

### Authentication

All API endpoints require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer {api_key}
```

### Main API Endpoints

#### Authentication (`/api/auth.php`)
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=register` - User registration
- `GET /api/auth.php?action=get_users` - Get all users (admin only)

#### Exam Questions (`/api/soal.php`)
- `GET /api/soal.php?action=get_soal` - Get exam questions
- `POST /api/soal.php?action=save_jawaban` - Save answers (auto-save)
- `POST /api/soal.php?action=complete_tryout` - Submit exam
- `GET /api/soal.php?action=get_history` - Get exam history

#### Gamification (`/api/gamification.php`)
- `GET /api/gamification.php?action=get_user_gamification` - Get user gamification data
- `POST /api/gamification.php?action=add_xp` - Add XP to user
- `POST /api/gamification.php?action=check_achievements` - Check for new achievements
- `POST /api/gamification.php?action=claim_daily_challenge` - Claim daily challenge reward

#### Notifications (`/api/notifications.php`)
- `GET /api/notifications.php?action=get_notifications` - Get user notifications
- `POST /api/notifications.php?action=mark_read` - Mark notification as read
- `GET /api/notifications.php?action=get_preferences` - Get notification preferences
- `POST /api/notifications.php?action=update_preferences` - Update preferences
- `GET /api/notifications.php?action=get_history` - Get notification history

#### Analytics (`/api/analytics.php`)
- `GET /api/analytics.php?action=get_question_analytics` - Get question performance
- `GET /api/analytics.php?action=get_user_analytics` - Get user analytics
- `GET /api/analytics.php?action=get_exam_analytics` - Get exam analytics (admin)
- `GET /api/analytics.php?action=get_answer_heatmap` - Get answer patterns (admin)
- `GET /api/analytics.php?action=export_analytics` - Export analytics data (admin)

#### Course Management (`/api/courses.php`)
- `GET /api/courses.php?action=get_courses` - Get all courses
- `POST /api/courses.php?action=create_course` - Create new course
- `GET /api/courses.php?action=get_progress` - Get user progress

### Response Format

All API responses follow this format:
```json
{
    "success": true|false,
    "data": { ... },
    "error": "Error message (if failed)"
}
```

---

## 🔨 Development Workflow

### Adding a New Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Update code files
   - Add/update database schema in `database/` folder
   - Create migration script if needed
   - Update documentation

3. **Test your changes**
   - Run migration scripts
   - Test API endpoints
   - Test UI changes

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: description of your feature"
   ```

5. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Database Changes

When making database changes:
1. Create SQL schema file in `database/` folder
2. Create migration script in root directory
3. Run migration to test
4. Document the change in README.md
5. Export database after migration

### Code Style Guidelines

- Use PHP 8.0+ features
- Follow PSR-12 coding standards
- Use prepared statements for all SQL queries
- Add comments for complex logic
- Use descriptive variable names

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Exam creation and taking
- [ ] Score calculation
- [ ] Gamification XP awarding
- [ ] Notification sending
- [ ] Admin dashboard functionality
- [ ] Mobile responsiveness
- [ ] Accessibility features

### API Testing

Use curl or Postman to test API endpoints:
```bash
# Example: Login
curl -X POST http://localhost/bimbel/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] Update `config.php` with production database credentials
- [ ] Change debug mode to false
- [ ] Update API keys if any
- [ ] Run all migrations
- [ ] Test all functionality
- [ ] Export database backup
- [ ] Clear any cache/temporary files

### Deployment Steps

1. **Upload files to server**
   - Use FTP, SFTP, or Git
   - Ensure all files are uploaded
   - Set proper file permissions (755 for directories, 644 for files)

2. **Configure production environment**
   ```php
   // config.php
   define('DB_HOST', 'your-production-host');
   define('DB_USER', 'your-production-user');
   define('DB_PASS', 'your-secure-password');
   define('DB_NAME', 'your-production-database');
   define('DEBUG_MODE', false);
   ```

3. **Create production database**
   ```sql
   CREATE DATABASE ujian_sekolah_kedinasan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Import database schema**
   ```bash
   # Import base schema
   mysql -u username -p ujian_sekolah_kedinasan < database.sql
   
   # Run migrations
   php migrate_course_management.php
   php migrate_gamification.php
   php migrate_notifications.php
   php migrate_analytics.php
   php migrate_content_management.php
   ```

5. **Configure web server**
   - Apache: Ensure mod_rewrite is enabled
   - Nginx: Configure PHP-FPM
   - Set document root to project directory

6. **Test production deployment**
   - Test login functionality
   - Test exam functionality
   - Test admin panel
   - Test API endpoints

### Server Requirements

**Minimum:**
- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.3+
- Apache 2.4+ / Nginx 1.18+
- 2 GB RAM
- 20 GB storage

**Recommended:**
- PHP 8.1+
- MySQL 8.0+ / MariaDB 10.6+
- Apache 2.4+ / Nginx 1.21+
- 4 GB RAM
- 50 GB storage

---

## � Troubleshooting

### Common Issues

#### Database Connection Failed
**Error:** "Could not connect to database"
**Solution:**
- Check MySQL service is running
- Verify credentials in `config.php`
- Ensure database exists
- Check firewall settings

#### Migration Failed
**Error:** "Migration failed"
**Solution:**
- Check SQL syntax in schema file
- Ensure user has CREATE TABLE permissions
- Check for existing tables with same name
- Review error messages for specific issues

#### API Returns 401 Unauthorized
**Error:** "Invalid API key"
**Solution:**
- Ensure Authorization header is set
- Check API key in database
- Verify user role has permission
- Check middleware.php for auth logic

#### Session Not Persisting
**Error:** User logged out automatically
**Solution:**
- Check session.save_path in php.ini
- Ensure session directory is writable
- Check cookie settings
- Verify session timeout configuration

### Getting Help

1. Check `SYSTEM_OVERVIEW.md` for detailed system documentation
2. Check `IMPROVEMENT_ROADMAP.md` for feature status
3. Review error logs in XAMPP/logs/
4. Check browser console for JavaScript errors
5. Open GitHub Issue for bugs or questions

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- GitHub Issues: https://github.com/82080038/bimbel/issues
- Email: (if available)
- Documentation: Check `SYSTEM_OVERVIEW.md` and `IMPROVEMENT_ROADMAP.md`

---

## 📜 Lisensi

[MIT License](LICENSE) - Bebas digunakan untuk komersial maupun non-komersial

---

## 👨‍💻 Pengembang

Made with ❤️ by [82080038](https://github.com/82080038)

---

## 📚 Additional Documentation

- `SYSTEM_OVERVIEW.md` - Detailed system architecture and documentation
- `IMPROVEMENT_ROADMAP.md` - Feature roadmap and implementation status
- `DEVELOPER_GUIDE.md` - Detailed guide for developers (coming soon)
- `API_DOCUMENTATION.md` - Complete API reference (coming soon)

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

# 22. CHANGELOG

## [21 Mei 2026] - Schema Refactor & TPA/PSIKOLOGIS Display

### Database Changes
- **Dropped `nama_peserta` column** from `sesi_ujian` table (redundant with user_id)
- **Dropped `nama_peserta` column** from `hasil_ujian` table (use users.nama_lengkap instead)
- **Added `nilai_tpa` and `nilai_psikologis` columns** to `hasil_ujian` table (already existed but not used in frontend)
- Created migration file: `database/migrate_drop_nama_peserta_add_tpa_psikologis.sql`
- Created updated schema file: `database/schema_updated_sesi_hasil.sql`

### API Changes
- **Fixed `api/soal.php`:**
  - `getParticipants()`: Removed `nama_peserta` from SELECT, search filter now uses `u.nama_lengkap`
  - `generate_sertifikat`: Changed verification_code generation from `$hasil['nama_peserta']` to `$hasil['user_id']`
  - `simpanSesi()`: Removed `nama_peserta` validation and INSERT
  - `selesaiUjian()`: Removed `nama_peserta` input validation

### Frontend Changes - Participant
- **Fixed `participant/js/dashboard.js`:**
  - Added TPA and PSIKOLOGIS to exam-details widget (conditional display if nilai > 0)
  - Replaced placeholder alerts with real redirects/fetch for Learning Path, Badges, Challenges, Notifications
- **Fixed `participant/js/ujian.js`:**
  - Added `tpaScore` and `psikologisScore` population in `showResultScreen()`
  - Added TPA and PSIKOLOGIS to export TXT format
- **Fixed `participant/js/resume-ujian.js`:**
  - Added TPA and PSIKOLOGIS to result display cards
  - Reorganized layout to accommodate 5 score categories

### Frontend Changes - Admin
- **Fixed `admin/js/admin.js`:**
  - `loadResults()`: Added TPA/PSIKOLOGIS columns to results table (conditional display)
  - `exportExcel()`: Added TPA/PSIKOLOGIS to Excel export columns
  - `viewSessionDetails()`: Added TPA/PSIKOLOGIS to toast notification
  - `viewParticipantDetails()`: Added TPA/PSIKOLOGIS to toast notification
  - `displayParticipants()`: Added TPA/PSIKOLOGIS to participants table values
- **Fixed `admin/admin.html`:**
  - Added "Nilai TPA" and "Nilai PSI" columns to results table header

### Backend Scripts
- **Fixed `scripts/learning_recommendation_system.php`:**
  - Added `nilai_tpa` and `nilai_psikologis` to `getUserCategoryPerformance()` SQL query
  - Added TPA and PSIKOLOGIS to performance array for learning recommendations

### Testing
- **Playwright Comprehensive Test:** 44/44 PASS (headed mode)
  - All 5 exam categories (TWK, TIU, TKP, TPA, PSIKOLOGIS) verified
  - All API endpoints tested and passing
  - Security (auth, RBAC) verified
  - Admin and participant flows verified

### Notes
- Database migration already applied successfully
- All frontend displays now show 5 categories instead of 3
- Conditional display for TPA/PSIKOLOGIS (only shown if nilai > 0) maintains backward compatibility
- Export data formats updated to include all 5 categories

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
