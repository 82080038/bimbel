# Setup Instructions for New Computer

## Overview
Panduan setup **Aplikasi Ujian Sekolah Kedinasan (Bimbel)** di komputer baru berbasis **Linux + XAMPP**.

## Environment Referensi

| Komponen | Versi Aktual |
|---|---|
| OS | Linux |
| XAMPP | `/opt/lampp` |
| PHP | 8.2.12 → `/opt/lampp/bin/php` |
| MySQL | 10.4.32-MariaDB → `/opt/lampp/bin/mysql` |
| Node.js | 18.19.1 |
| npm | 9.2.0 |

## Prasyarat

1. **XAMPP for Linux** — https://www.apachefriends.org/ (instal ke `/opt/lampp`)
2. **Node.js 18+** — https://nodejs.org/ (untuk Playwright testing)
3. **Python 3** — opsional, untuk scripts generate soal di `scripts/`
4. **Git**

---

## Langkah Instalasi

### Step 1: Clone Repository
```bash
cd /opt/lampp/htdocs
git clone https://github.com/82080038/bimbel.git bimbel
```

### Step 2: Start XAMPP
```bash
sudo /opt/lampp/lampp start
```
Verifikasi: Apache dan MySQL harus `ok`.

### Step 3: Konfigurasi Database
File `config.php` sudah dikonfigurasi untuk Linux XAMPP:
```php
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', 'root');       // password MySQL di komputer ini
define('DB_NAME', 'bimbel_db');
```
> Jika MySQL di komputer baru tidak menggunakan password `root`, update `DB_PASS`.

### Step 4: Import Database

**PENTING**: Dump SQL mengandung foreign key constraint yang memerlukan `FOREIGN_KEY_CHECKS=0`.

```bash
cd /opt/lampp/htdocs/bimbel

{ printf 'SET FOREIGN_KEY_CHECKS=0; DROP DATABASE IF EXISTS `bimbel_db`; CREATE DATABASE `bimbel_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci; USE `bimbel_db`; SET FOREIGN_KEY_CHECKS=0;\n'; cat database/bimbel_db.sql; printf '\nSET FOREIGN_KEY_CHECKS=1;\n'; } | /opt/lampp/bin/mysql -h127.0.0.1 -uroot -proot
```

Atau via **phpMyAdmin** (http://localhost/phpmyadmin):
1. Buat database `bimbel_db`
2. Import → pilih `database/bimbel_db.sql`
3. Centang **"Enable foreign key checks"** = OFF sebelum import

### Step 5: Pastikan Direktori Writable
```bash
chmod -R 777 /opt/lampp/htdocs/bimbel/cache
chmod -R 777 /opt/lampp/htdocs/bimbel/logs
```

### Step 6: Install Node Dependencies (untuk testing)
```bash
cd /opt/lampp/htdocs/bimbel
npm install
```

### Step 7: Akses Aplikasi

| Halaman | URL |
|---|---|
| Login | http://localhost/bimbel/login.html |
| Admin Panel | http://localhost/bimbel/admin/admin.html |
| Dashboard Peserta | http://localhost/bimbel/participant/dashboard.html |
| phpMyAdmin | http://localhost/phpmyadmin |

**Kredensial default:**
- Admin: `admin` / `admin123`
- Test User: `testuser` / `test123`

---

## Struktur Penting

| File/Folder | Keterangan |
|---|---|
| `config.php` | Konfigurasi DB + koneksi mysqli |
| `config/app.php` | Environment, session, security |
| `js/config.js` | `AppConfig` — semua URL frontend |
| `js/rbac.js` | Role-based access control |
| `api/` | 24 endpoint PHP |
| `admin/admin.html` | Admin panel (SPA) |
| `participant/` | Antarmuka peserta |
| `database/bimbel_db.sql` | Dump DB utama (~3.5MB) |
| `scripts/` | 48 utility scripts PHP & Python |

### Tidak perlu di-copy ke server produksi
- `node_modules/` — generate ulang dengan `npm install`
- `cache/` — runtime, auto-generate
- `logs/` — runtime, auto-generate
- `test-screenshots/` — artefak testing
- `*.log` — file log runtime
- `.git/` — git repository

---

## Troubleshooting

### Database Connection Error
```bash
# Cek XAMPP berjalan
sudo /opt/lampp/lampp status

# Start jika belum berjalan
sudo /opt/lampp/lampp start

# Test koneksi DB via PHP CLI
/opt/lampp/bin/php -r 'require "config.php"; echo isset($conn) && !$conn->connect_error ? "DB OK\n" : "DB FAIL\n";'
```

### Error Import SQL: Foreign Key Constraint
- Penyebab: constraint `expert_assistance_log_ibfk_3`
- Solusi: selalu wrap import dengan `SET FOREIGN_KEY_CHECKS=0` / `SET FOREIGN_KEY_CHECKS=1`

### PHP Command Not Found
```bash
# Gunakan binary XAMPP, bukan php sistem
/opt/lampp/bin/php nama_script.php
```

### Permission Error pada cache/logs
```bash
chmod -R 777 /opt/lampp/htdocs/bimbel/cache
chmod -R 777 /opt/lampp/htdocs/bimbel/logs
```

### Tabel Database Tidak Lengkap
```bash
# Jalankan migration scripts
/opt/lampp/bin/php migrate_course_management.php
/opt/lampp/bin/php migrate_gamification.php
/opt/lampp/bin/php migrate_notifications.php
/opt/lampp/bin/php migrate_analytics.php
/opt/lampp/bin/php migrate_content_management.php
```

---

## Versi
- Versi Aplikasi: 2.1 (Active Development)
- PHP: 8.2.12
- MySQL/MariaDB: 10.4.32
- Last Updated: 29 Mei 2026
