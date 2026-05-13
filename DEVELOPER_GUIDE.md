# Panduan Pengembang Aplikasi Bimbel Ujian Sekolah Kedinasan

## Informasi Project

**Nama Project:** Bimbel Ujian Sekolah Kedinasan  
**Tech Stack:** PHP, MySQL, JavaScript, HTML, Bootstrap  
**Framework:** Vanilla PHP  
**Database:** MySQL (ujian_sekolah_kedinasan)  
**Branch Utama:** kantor (untuk development kantor)  
**Repository:** https://github.com/82080038/bimbel

## Struktur Project

```
bimbel/
├── admin/                    # Dashboard admin
│   └── admin.html           # Halaman admin utama
├── participant/              # Halaman peserta
│   ├── dashboard.html      # Dashboard peserta
│   └── ujian.html          # Halaman ujian
├── api/                     # API endpoints
│   ├── auth.php           # Authentication
│   ├── soal.php           # Soal & Tips & Triks
│   ├── pembahasan.php     # Pembahasan soal
│   └── validator.php      # Input validation
├── scripts/                 # Background scripts
│   ├── ai_question_generator.php
│   ├── batch_generate.php
│   └── learning_recommendation_system.php
├── js/                      # JavaScript modules
│   └── rbac.js            # Role-based access control
├── database/                # Database schema & migrations
│   ├── complete_setup.sql  # Setup lengkap database
│   ├── high_priority_improvements.sql
│   └── ujian_sekolah_kedinasan.sql # Export database terbaru
├── tests/                   # Automated tests (Puppeteer)
│   ├── comprehensive-crud-test.js
│   └── dashboard-menu-test.js
├── .windsurf/              # Windsurf configuration
│   ├── rules.json         # Project rules & cross-impact analysis
│   └── workflows/         # Development workflows
├── config.php              # Database configuration
└── run_sql.php            # SQL migration runner
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
   # Import database dari file terbaru
   mysql -u root -p < database/ujian_sekolah_kedinasan.sql
   
   # ATAU jalankan semua migration files
   php run_sql.php
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

### Menjalankan SQL Migration

Jika ada file SQL baru di folder `database/`, jalankan:

```bash
php run_sql.php
```

Script ini akan menjalankan semua SQL files dan menangani duplicate errors dengan graceful.

### Export Database

Untuk export database terbaru:

```bash
mysqldump -u root -proot ujian_sekolah_kedinasan > database\ujian_sekolah_kedinasan.sql
```

**WAJIB:** Selalu commit database export terbaru setelah perubahan schema.

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

### Authentication
- `POST /api/auth.php?action=login` - Login
- `POST /api/auth.php?action=register` - Register
- `POST /api/auth.php?action=logout` - Logout

### Soal & Tips
- `GET /api/soal.php?action=list_soal` - List soal dengan pagination
- `GET /api/soal.php?action=get_tips_tricks&page=1&limit=20` - Tips & Triks dengan pagination
- `POST /api/soal.php?action=create_question` - Buat soal baru
- `POST /api/soal.php?action=update_question` - Update soal
- `POST /api/soal.php?action=delete_tips` - Hapus tips

### Lainnya
- `GET /api/soal.php?action=get_riwayat_ujian&page=1&limit=10` - Riwayat ujian dengan pagination
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
