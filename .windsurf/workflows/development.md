---
description: Development workflow for the application
---

# Development Workflow

## Environment Aktual (Komputer Ini)

| Komponen | Nilai |
|---|---|
| OS | Linux |
| XAMPP | `/opt/lampp` |
| PHP | 8.2.12 → `/opt/lampp/bin/php` |
| MySQL | 10.4.32-MariaDB → `/opt/lampp/bin/mysql` |
| Node.js | 18.19.1 |
| npm | 9.2.0 |
| Project path | `/opt/lampp/htdocs/bimbel` |
| Web URL | http://localhost/bimbel |
| phpMyAdmin | http://localhost/phpmyadmin |
| Git remote | https://github.com/82080038/bimbel.git |

## 1. Setup Development Environment (Komputer Baru)

### Prasyarat
- XAMPP for Linux (sudah terinstall di `/opt/lampp`)
- Node.js 18+
- Git

### Langkah Instalasi

1. **Clone repository**
   ```bash
   cd /opt/lampp/htdocs
   git clone https://github.com/82080038/bimbel.git bimbel
   ```

2. **Konfigurasi database sudah benar** — `config.php` sudah dikonfigurasi untuk Linux:
   - `DB_HOST`: `127.0.0.1`
   - `DB_USER`: `root`
   - `DB_PASS`: `root`
   - `DB_NAME`: `bimbel_db`

3. **Start XAMPP**
   ```bash
   sudo /opt/lampp/lampp start
   ```

4. **Import database** (gunakan file dump utama)
   ```bash
   # PENTING: Selalu gunakan FOREIGN_KEY_CHECKS=0 karena constraint pada expert_assistance_log
   { printf 'SET FOREIGN_KEY_CHECKS=0; DROP DATABASE IF EXISTS `bimbel_db`; CREATE DATABASE `bimbel_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci; USE `bimbel_db`; SET FOREIGN_KEY_CHECKS=0;\n'; cat database/bimbel_db.sql; printf '\nSET FOREIGN_KEY_CHECKS=1;\n'; } | /opt/lampp/bin/mysql -h127.0.0.1 -uroot -proot
   ```

5. **Install Node dependencies** (untuk Playwright testing)
   ```bash
   npm install
   ```

6. **Akses aplikasi**
   - Halaman utama: http://localhost/bimbel
   - Login: http://localhost/bimbel/login.html
   - Admin panel: http://localhost/bimbel/admin/admin.html
   - Dashboard peserta: http://localhost/bimbel/participant/dashboard.html
   - phpMyAdmin: http://localhost/phpmyadmin

## 2. Development Workflow

### Membuat Fitur Baru

1. **Buat branch**
   ```bash
   git checkout -b feature/nama-fitur
   ```

2. **Edit kode** — ikuti panduan:
   - PHP: selalu `require_once 'config.php'` dan `checkDatabaseConnection()` di awal file API
   - JS: gunakan `AppConfig.apiUrl('nama_endpoint.php')` untuk URL API (bukan hardcode)
   - DB query: selalu gunakan prepared statements (`$stmt = $conn->prepare(...)`)

3. **Test perubahan** — cek endpoint via browser atau curl

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: deskripsi fitur"
   ```

5. **Push ke main**
   ```bash
   git push origin main
   ```

### Perubahan Database

1. Buat file SQL schema di folder `database/`
2. Buat migration script di root (lihat contoh `migrate_course_management.php`)
3. Jalankan migration:
   ```bash
   /opt/lampp/bin/php migrate_nama.php
   ```
4. Update dump utama setelah skema berubah:
   ```bash
   /opt/lampp/bin/php export_database.php
   ```
   Atau via phpMyAdmin → Export → database `bimbel_db` → simpan ke `database/bimbel_db.sql`

### Panduan Kode

- PHP 8.2+, PSR-12
- Prepared statements untuk semua query SQL
- `AppConfig` (dari `js/config.js`) untuk semua URL di JavaScript
- `js/rbac.js` untuk kontrol akses berbasis role
- Timezone: `Asia/Jakarta`

## 3. Testing

### Checklist Manual

- [ ] Registrasi dan login user
- [ ] Buat dan ikuti ujian
- [ ] Kalkulasi skor
- [ ] Gamification XP
- [ ] Notifikasi
- [ ] Admin dashboard
- [ ] Responsif mobile

### Playwright Tests

```bash
# Install (sekali saja)
npm install

# Jalankan semua test
npx playwright test

# Mode headed (dengan browser terbuka)
npx playwright test --headed

# File test tertentu
npx playwright test tests/nama.spec.js

# Dengan UI interaktif
npx playwright test --ui
```

### API Testing via curl

```bash
# Login
curl -X POST "http://localhost/bimbel/api/auth.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Cek koneksi DB via PHP CLI
/opt/lampp/bin/php -r 'require "config.php"; echo isset($conn) && !$conn->connect_error ? "DB OK\n" : "DB FAIL\n";'
```

## 4. Deployment ke Produksi

### Checklist Pre-Deployment

- [ ] Update `config.php` dengan credential DB produksi
- [ ] Set `ENVIRONMENT = 'production'` di `config/app.php`
- [ ] Set `DEBUG_MODE = false`
- [ ] Update `BASE_URL` di `config/app.php`
- [ ] Export database backup terbaru
- [ ] Test semua fitur

### Langkah Deploy

1. Upload file via Git / SFTP
2. Set permission: `chmod -R 755 . && chmod -R 644 *.php *.html`
3. Buat DB produksi dan import dump:
   ```bash
   { printf 'SET FOREIGN_KEY_CHECKS=0; DROP DATABASE IF EXISTS `bimbel_db`; CREATE DATABASE `bimbel_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci; USE `bimbel_db`; SET FOREIGN_KEY_CHECKS=0;\n'; cat database/bimbel_db.sql; printf '\nSET FOREIGN_KEY_CHECKS=1;\n'; } | mysql -uUSER -pPASS
   ```
4. Jalankan migration scripts
5. Test login dan fitur utama

## 5. Troubleshooting

### Database Connection Failed
- Cek XAMPP: `sudo /opt/lampp/lampp status`
- Start XAMPP: `sudo /opt/lampp/lampp start`
- Cek credential di `config.php`: `DB_PASS = 'root'`

### Error Import SQL: Foreign Key Constraint
- **Penyebab**: constraint `expert_assistance_log_ibfk_3` pada tabel `expert_assistance_log`
- **Solusi**: Selalu wrap import dengan `SET FOREIGN_KEY_CHECKS=0` dan `SET FOREIGN_KEY_CHECKS=1`

### API Returns 401
- Cek header `Authorization` atau cookie session
- Lihat logika di `api/middleware.php`

### Session Tidak Persist
- Cek `session.save_path` di `/opt/lampp/etc/php.ini`
- Pastikan folder session writable

### PHP CLI tidak ditemukan
```bash
# Gunakan binary XAMPP, bukan php system
/opt/lampp/bin/php namafile.php
```

## 6. Quick Reference

### File Penting
| File | Fungsi |
|---|---|
| `config.php` | Konfigurasi DB + koneksi mysqli |
| `config/app.php` | Konfigurasi app, session, security |
| `js/config.js` | AppConfig — URL frontend |
| `js/rbac.js` | Role-based access control |
| `index.php` | Entry point dengan RBAC |
| `api/auth.php` | Login, register, logout |
| `api/soal.php` | CRUD soal (file terbesar ~130KB) |
| `api/middleware.php` | Auth middleware semua API |

### Kredensial Default
| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Test User | `testuser` | `test123` |

### Database
- **File dump utama**: `database/bimbel_db.sql` (≈3.5MB)
- **Total tabel**: 68 (64 tabel + 4 view)
- **Total soal**: 2.867
- **Total users**: 7

### Perintah Cepat
```bash
# Start XAMPP
sudo /opt/lampp/lampp start

# Cek status XAMPP
sudo /opt/lampp/lampp status

# Masuk MySQL CLI
/opt/lampp/bin/mysql -h127.0.0.1 -uroot -proot -D bimbel_db

# Jalankan PHP script
/opt/lampp/bin/php nama_script.php

# Git sync dari remote
git fetch origin main && git reset --hard origin/main
```
