# Panduan Pengembang Aplikasi Bimbel Ujian Sekolah Kedinasan

## Informasi Project

**Nama Project:** Bimbel Ujian Sekolah Kedinasan  
**Tech Stack:** PHP, MySQL, JavaScript, HTML, Bootstrap  
**Framework:** Vanilla PHP  
**Database:** MySQL (ujian_sekolah_kedinasan) - 68 tables  
**Branch Utama:** kantor (untuk development kantor)  
**Repository:** https://github.com/82080038/bimbel  
**Versi:** 2.1  
**Terakhir Update:** 26 Mei 2026

## Struktur Project

```
bimbel/
├── admin/                    # Dashboard admin
│   └── admin.html           # Halaman admin utama
├── participant/              # Halaman peserta
│   ├── dashboard.html      # Dashboard peserta (dengan gamifikasi & notifikasi)
│   └── ujian.html          # Halaman ujian (dengan swipe gestures & keyboard nav)
├── api/                     # API endpoints (18 files)
│   ├── auth.php           # Authentication
│   ├── soal.php           # Soal & Tips & Triks
│   ├── gamification.php   # Gamification API (XP, badges, achievements)
│   ├── notifications.php  # Notification API (email, in-app, push)
│   ├── analytics.php      # Analytics API (heatmap, funnel, performance)
│   ├── courses.php        # Course management API
│   ├── expert.php         # Expert system & AI API
│   ├── pembahasan.php     # Discussion/explanation API
│   ├── batch_generate.php # Batch question generation API
│   ├── csrf.php           # CSRF token management
│   ├── middleware.php     # Authentication middleware
│   ├── rate_limiter.php   # API rate limiting
│   ├── validator.php      # Input validation
│   ├── export_database_web.php # Database export via web
│   ├── add_internet_materials_v2.php # Add questions from internet research
│   ├── add_internet_materials_questions.php # Add questions from materials
│   └── upload_image.php   # Image upload handler
├── scripts/                 # Background scripts
│   ├── check_reminders.php # Check & send pending exam reminders
│   ├── minify_assets.php   # CSS/JS minification
│   ├── learning_recommendation_system.php # Learning recommendations
│   ├── educational_content_generator.php # Educational content generation
│   ├── external_content_fetcher.php # External content fetching
│   ├── backup.php # Database backup
│   ├── cleanup-unused-files.php # Cleanup unused files
│   └── analyze_soal_topics.php # Analyze soal topics
├── database/                # Database schema & migrations
│   ├── course_management.sql # Course management schema
│   ├── gamification.sql    # Gamification schema
│   ├── notifications.sql   # Notification system schema
│   ├── analytics.sql       # Advanced analytics schema
│   ├── content_management.sql # Content version control & translations
│   └── export_2026-05-25_21-42-34.sql # Latest database export (68 tables, 11MB)
├── js/                      # JavaScript modules
│   ├── config.js          # Frontend configuration
│   └── rbac.js            # Role-based access control
├── tests/                   # Automated tests (Puppeteer)
│   ├── comprehensive-crud-test.js
│   ├── gamification-test.js
│   └── course-management-test.js
├── .windsurf/              # Windsurf configuration
│   ├── rules.json         # Project rules & cross-impact analysis
│   └── workflows/         # Development workflows
├── config.php              # Database configuration
├── export_database.php     # Database export script
├── migrate_*.php           # Migration scripts (course_management, gamification, notifications, analytics, content_management)
├── README.md               # Main documentation
├── SYSTEM_OVERVIEW.md      # System architecture documentation
├── IMPROVEMENT_ROADMAP.md  # Feature roadmap & implementation status
└── DEVELOPER_GUIDE.md      # This file
```

## Setup Development Environment

### Prerequisites
- PHP 7.4+
- MySQL 5.7+ atau MariaDB
- XAMPP (recommended untuk Windows)
- Node.js (untuk automated tests)
- Git

### Langkah Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/82080038/bimbel.git
   cd bimbel
   git checkout kantor
   ```

2. **Setup Database**
   ```bash
   # Buat database baru
   CREATE DATABASE ujian_sekolah_kedinasan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   # Import database dari file terbaru
   mysql -u root -p ujian_sekolah_kedinasan < database/export_*.sql
   
   # ATAU jalankan migration scripts untuk fitur baru
   php migrate_course_management.php
   php migrate_gamification.php
   php migrate_notifications.php
   php migrate_analytics.php
   php migrate_content_management.php
   ```

3. **Konfigurasi Database**
   - Edit `config.php` sesuai dengan environment
   - Default: DB_PASS = 'root' untuk XAMPP

4. **Install Dependencies untuk Tests**
   ```bash
   cd tests
   npm install
   ```

5. **Setup XAMPP**
   - Start Apache
   - Start MySQL
   - Pastikan password MySQL sesuai dengan config.php

## Aturan Development (Wajib Dibaca!)

### Cross-Impact Analysis Rule

**WAJIB:** Apabila melakukan perbaikan atau update, periksa bagian lain di aplikasi yang butuh perbaikan, dan pastikan efeknya terhadap file lain juga diperbaiki, kemudian lakukan tes atas perbaikan tersebut.

### Checklist Sebelum Mengubah Kode

Sebelum melakukan perubahan, wajib:
- [ ] Search for all usages of modified functions/variables
- [ ] Update related API endpoints if backend changes
- [ ] Update related frontend components if frontend changes
- [ ] Check for breaking changes in shared utilities
- [ ] Update documentation if needed
- [ ] Run tests for affected modules
- [ ] Verify no regression in existing functionality

### Workflow Development

1. **Pull terbaru dari branch kantor**
   ```bash
   git checkout kantor
   git pull origin kantor
   ```

2. **Buat branch feature untuk task spesifik**
   ```bash
   git checkout -b feature/nama-feature
   ```

3. **Lakukan perubahan**
   - Ikuti checklist cross-impact analysis
   - Test perubahan

4. **Commit dengan message yang jelas**
   ```bash
   git add .
   git commit -m "Deskripsi perubahan yang jelas"
   ```

5. **Push ke branch feature**
   ```bash
   git push origin feature/nama-feature
   ```

6. **Pull Request ke branch kantor**
   - Review code
   - Merge ke kantor setelah approval

## Konfigurasi Windsurf

File `.windsurf/rules.json` berisi konfigurasi project dan aturan development. Selalu update file ini jika ada perubahan struktur.

### Cross-Impact Analysis Configuration

```json
{
  "development": {
    "crossImpactAnalysis": {
      "enabled": true,
      "rule": "apabila melakukan perbaikan atau update, periksa bagian lain di aplikasi, yang butuh perbaikan, dan pastikan efeknya terhadap file lain juga diperbaiki, kemudian lakukan tes atas perbaikan tersebut",
      "checklist": [
        "Search for all usages of modified functions/variables",
        "Update related API endpoints if backend changes",
        "Update related frontend components if frontend changes",
        "Check for breaking changes in shared utilities",
        "Update documentation if needed",
        "Run tests for affected modules",
        "Verify no regression in existing functionality"
      ]
    }
  }
}
```

## Database Migration

### Sistem Migration Baru

Aplikasi menggunakan sistem migration terpisah untuk setiap fitur utama. Setiap fitur memiliki:
1. File SQL schema di folder `database/`
2. File migration script di root directory

### Menjalankan Migration

Jalankan migration untuk fitur yang diperlukan:

```bash
# Course Management & Learning Paths
php migrate_course_management.php

# Gamification System (XP, badges, achievements, streaks, daily challenges)
php migrate_gamification.php

# Notification System (email, in-app, push, SMS)
php migrate_notifications.php

# Advanced Analytics (heatmap, funnel, performance tracking)
php migrate_analytics.php

# Content Management (version control, translations)
php migrate_content_management.php
```

### Export Database

Untuk export database terbaru dengan timestamp:

```bash
php export_database.php
```

Script ini akan membuat file `database/export_YYYY-MM-DD_HH-MM-SS.sql` dengan semua tabel dan data.

**WAJIB:** Selalu commit database export terbaru setelah perubahan schema.

### Struktur Migration Script

Setiap migration script mengikuti pattern yang sama:
1. Membaca file SQL dari folder `database/`
2. Parse statement SQL (handle CREATE TABLE dengan semicolon di dalam)
3. Eksekusi statement satu per satu
4. Report success/failure untuk setiap statement

### Menambah Migration Baru

Untuk menambah migration baru:
1. Buat file SQL di folder `database/` (contoh: `database/feature_name.sql`)
2. Buat file migration di root (contoh: `migrate_feature_name.php`)
3. Gunakan template yang sama dari migration yang sudah ada
4. Update dokumentasi di README.md dan DEVELOPER_GUIDE.md

## Testing

### Automated Tests

Jalankan comprehensive CRUD test:

```bash
cd tests
node comprehensive-crud-test.js
```

Jalankan dashboard menu test:

```bash
cd tests
node dashboard-menu-test.js
```

### Manual Testing Checklist

- [ ] Login sebagai admin (username: admin, password: admin123)
- [ ] Cek semua menu admin dashboard
- [ ] Test CRUD Soal
- [ ] Test CRUD Tips & Triks
- [ ] Test pagination
- [ ] Login sebagai peserta
- [ ] Test mulai ujian
- [ ] Test submit ujian
- [ ] Test logout

## API Endpoints

### Authentication (`/api/auth.php`)
- `POST /api/auth.php?action=login` - Login
- `POST /api/auth.php?action=register` - Register
- `POST /api/auth.php?action=logout` - Logout
- `GET /api/auth.php?action=get_users` - Get all users (admin only)

### Exam Questions (`/api/soal.php`)
- `GET /api/soal.php?action=list_soal` - List soal dengan pagination
- `GET /api/soal.php?action=get_tips_tricks&page=1&limit=20` - Tips & Triks dengan pagination
- `POST /api/soal.php?action=create_question` - Buat soal baru
- `POST /api/soal.php?action=update_question` - Update soal
- `POST /api/soal.php?action=delete_tips` - Hapus tips
- `POST /api/soal.php?action=save_jawaban` - Save jawaban (auto-save)
- `POST /api/soal.php?action=complete_tryout` - Submit ujian
- `GET /api/soal.php?action=get_history` - Riwayat ujian

### Gamification (`/api/gamification.php`)
- `GET /api/gamification.php?action=get_user_gamification` - Get user gamification data (XP, level, streak, badges, achievements)
- `POST /api/gamification.php?action=add_xp` - Add XP to user
- `POST /api/gamification.php?action=check_achievements` - Check for new achievements
- `POST /api/gamification.php?action=claim_daily_challenge` - Claim daily challenge reward

### Notifications (`/api/notifications.php`)
- `GET /api/notifications.php?action=get_notifications` - Get user notifications
- `POST /api/notifications.php?action=mark_read` - Mark notification as read
- `GET /api/notifications.php?action=get_preferences` - Get notification preferences
- `POST /api/notifications.php?action=update_preferences` - Update notification preferences
- `GET /api/notifications.php?action=get_history` - Get notification history
- `POST /api/notifications.php?action=send_notification` - Send notification (admin)
- `POST /api/notifications.php?action=schedule_exam_reminder` - Schedule exam reminder
- `POST /api/notifications.php?action=check_pending_reminders` - Check & send pending reminders

### Analytics (`/api/analytics.php`)
- `GET /api/analytics.php?action=get_question_analytics` - Get question performance analytics
- `GET /api/analytics.php?action=get_user_analytics` - Get user performance analytics
- `GET /api/analytics.php?action=get_exam_analytics` - Get exam analytics (admin)
- `GET /api/analytics.php?action=get_answer_heatmap` - Get answer patterns (admin)
- `GET /api/analytics.php?action=get_funnel_analytics` - Get funnel analytics (admin)
- `POST /api/analytics.php?action=track_funnel_event` - Track funnel event
- `GET /api/analytics.php?action=export_analytics` - Export analytics data (admin)

### Course Management (`/api/courses.php`)
- `GET /api/courses.php?action=get_courses` - Get all courses
- `POST /api/courses.php?action=create_course` - Create new course
- `GET /api/courses.php?action=get_progress` - Get user course progress

### Lainnya
- `GET /api/soal.php?action=get_blueprints&page=1&limit=20` - Blueprint dengan pagination
- `GET /api/soal.php?action=get_ranking&page=1&limit=50` - Ranking dengan pagination

## Konvensi Kode

### PHP
- Gunakan prepared statements untuk SQL queries (security)
- Return JSON response untuk API
- Handle errors dengan gracefully
- Comment complex logic

### JavaScript
- Gunakan async/await untuk asynchronous operations
- Handle errors dengan try-catch
- Destroy Chart instances sebelum membuat baru (canvas reuse prevention)
- Gunakan RBAC untuk role-based access control

### HTML
- Gunakan Bootstrap classes untuk styling
- Responsive design
- Semantic HTML

## Issue yang Sering Terjadi

### Chart.js Canvas Reuse Error
**Error:** "Canvas is already in use"

**Solusi:** Selalu destroy chart instance sebelum membuat baru:
```javascript
const ctx = document.getElementById('chartId');
if (ctx) {
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
}
new Chart(ctx.getContext('2d'), { ... });
```

### Pagination API Response
**Format Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "per_page": 20,
    "current_page": 1,
    "total_pages": 5
  }
}
```

### Database Connection Error
**Error:** "Access denied for user 'root'@'localhost'"

**Solusi:** Update `config.php` dengan password MySQL yang benar:
```php
define('DB_PASS', 'your_password');
```

## Deployment ke Production

1. **Update Environment Variables**
   - Ubah DB_PASS ke production password
   - Update CORS origin ke production domain
   - Disable error display di production

2. **Apply Performance Indexes**
   ```bash
   mysql -u root -p ujian_sekolah_kedinasan < database/performance_indexes.sql
   ```

3. **Setup Backup Cronjob**
   - Gunakan `scripts/backup.php`
   - Schedule daily backups

4. **SSL Certificate**
   - Install SSL certificate untuk production

## Kontak & Support

- **Repository:** https://github.com/82080038/bimbel
- **Branch Development:** kantor
- **Workflow:** Lihat `.windsurf/workflows/analyze-and-simulate.md`

## Fitur Baru (Versi 2.0)

### 1. Gamification System
- **XP System**: Pengguna mendapatkan XP untuk menyelesaikan ujian
- **Level System**: Level naik berdasarkan XP terkumpul
- **Streak System**: Streak hari belajar untuk motivasi
- **Badges**: Achievement badges untuk berbagai milestone
- **Achievements**: Sistem pencapaian yang dapat di-unlock
- **Daily Challenges**: Tantangan harian dengan reward

**Tabel Database:**
- `user_xp` - XP dan level pengguna
- `user_streak` - Streak hari belajar
- `badges` - Daftar achievement badges
- `achievements` - Achievement yang sudah di-unlock pengguna
- `daily_challenges` - Tantangan harian
- `level_rewards` - Reward untuk setiap level

### 2. Notification System
- **Email Notifications**: Pengingat ujian, hasil ujian, sertifikat
- **In-App Notifications**: Notifikasi push untuk PWA
- **SMS Notifications**: Opsional untuk pengingat penting
- **Reminder Otomatis**: Pengingat sebelum ujian
- **Notification Preferences**: Pengaturan notifikasi per user
- **Notification History**: Riwayat notifikasi

**Tabel Database:**
- `notifications` - Notifikasi pengguna
- `notification_preferences` - Preferensi notifikasi
- `notification_templates` - Template notifikasi
- `exam_reminders` - Pengingat ujian terjadwal

### 3. Course Management & Learning Paths
- **Courses**: Struktur kursus dengan modul
- **Modules**: Bagian dari kursus
- **Materials**: Materi pembelajaran
- **Prerequisites**: Prasyarat untuk kursus/modul
- **User Progress**: Tracking progress pengguna
- **Learning Paths**: Jalur belajar terstruktur

**Tabel Database:**
- `courses` - Daftar kursus
- `modules` - Modul dalam kursus
- `materials` - Materi pembelajaran
- `prerequisites` - Prasyarat kursus/modul
- `user_progress` - Progress pengguna
- `learning_paths` - Jalur belajar

### 4. Advanced Analytics
- **Question Analytics**: Performa soal (kesulitan, waktu pengerjaan)
- **User Analytics**: Performa pengguna (weakness, strength)
- **Exam Analytics**: Statistik ujian (partisipan, pass rate)
- **Answer Heatmap**: Pola jawaban peserta
- **Funnel Analytics**: Drop-off points dalam user journey
- **Predictive Analytics**: Prediksi performa siswa

**Tabel Database:**
- `question_analytics` - Analisis performa soal
- `user_analytics` - Analisis performa pengguna
- `exam_analytics` - Analisis statistik ujian
- `answer_heatmap` - Pola jawaban
- `funnel_analytics` - Analisis funnel user journey

### 5. Content Management
- **Version Control**: Tracking versi materi
- **Rich Text Editor**: Editor untuk materi (TBD)
- **Media Library**: Manajemen file media (TBD)
- **Content Approval**: Workflow approval konten (TBD)

**Tabel Database:**
- `content_versions` - Versi konten
- `translations` - Terjemahan konten
- `supported_languages` - Bahasa yang didukung

### 6. Mobile Responsiveness
- **Mobile Bottom Navigation**: Navigasi di bawah untuk mobile
- **Touch-Friendly UI**: Button sizes dan gestures
- **Swipe Gestures**: Swipe untuk navigasi soal
- **Keyboard Navigation**: Arrow keys untuk navigasi
- **Responsive Tables**: Tables dengan horizontal scroll

### 7. Accessibility (A11y)
- **WCAG 2.1 AA Compliance**: Standar aksesibilitas
- **Screen Reader Support**: ARIA labels dan roles
- **Keyboard Navigation**: Full keyboard navigation
- **High Contrast Mode**: Mode kontras tinggi
- **Text-to-Speech**: Pembaca soal dengan suara
- **Font Size Adjustment**: Pengaturan ukuran font
- **Focus Indicators**: Indikator focus yang jelas
- **Reduced Motion**: Support untuk preferensi reduced motion

### 8. Performance Optimization
- **Lazy Loading**: Lazy loading untuk gambar
- **Minification**: Script untuk minify CSS/JS
- **Content Visibility**: CSS content-visibility untuk performa

## Catatan Penting

1. **Selalu gunakan branch kantor untuk development kantor**
2. **Ikuti cross-impact analysis rule sebelum setiap perubahan**
3. **Test semua perubahan sebelum commit**
4. **Commit database export setiap kali ada perubahan schema**
5. **Update dokumentasi jika ada perubahan fitur**
6. **Review code sebelum merge ke kantor**

---

**Dibuat:** 13 Mei 2026  
**Terakhir Update:** 14 Mei 2026  
**Versi:** 2.0
