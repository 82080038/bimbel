---
description: Development workflow for the exam application (Version 2.1 - Kantor Branch)
---

# Development Workflow

## Pre-Development Verification

**CRITICAL: Always run this before making changes or reporting issues**

1. **Verify All Referenced Files Exist**
   ```bash
   # Check all API files referenced in JavaScript
   grep -r "fetch.*\.php" participant/js admin/js --include="*.js" | grep -o "api/[a-z_]*\.php" | sort -u
   
   # Verify each file exists
   ls -la api/
   ```

2. **Verify All HTML/CSS/JS References**
   ```bash
   # Check all HTML file references
   grep -r "href.*\.html" participant admin --include="*.html" --include="*.js"
   
   # Check all CSS references
   grep -r "href.*\.css" participant admin --include="*.html"
   
   # Check all JS references
   grep -r "src.*\.js" participant admin --include="*.html"
   
   # Verify each file exists
   find participant admin -name "*.html" -o -name "*.css" -o -name "*.js"
   ```

3. **Verify All API Actions Are Implemented**
   ```bash
   # Extract all action= parameters from fetch calls
   grep -r "action=" participant/js admin/js --include="*.js" | grep -o "action=[a-z_]*" | sort -u
   
   # Verify each action exists in corresponding PHP file
   grep -r "case '" api/*.php
   ```

4. **Cross-Check Documentation vs Implementation**
   ```bash
   # Check if documented APIs exist
   grep -r "\.php" README.md DEVELOPER_GUIDE.md docs/ | grep -o "api/[a-z_]*\.php" | sort -u
   ```

## Setup Development Environment

1. **Start XAMPP Services**
   ```bash
   sudo /opt/lampp/lampp start
   ```

2. **Verify Database Connection**
   - Check `config.php` — password auto-detect: **Linux = `root`**, Windows = `8208`
   - Ensure MySQL is running on port 3306
   - Test: `mysql -u root -proot -h 127.0.0.1 ujian_sekolah_kedinasan` (Linux)
   - Test: `mysql -u root -p8208 -h 127.0.0.1 ujian_sekolah_kedinasan` (Windows)

3. **Import Database (jika fresh install)**
   ```bash
   # Linux (XAMPP)
   mysql -u root -proot -h 127.0.0.1 < database/export_2026-05-24_14-24-03.sql

   # Windows (XAMPP)
   mysql -u root -p8208 -h 127.0.0.1 < database/export_2026-05-24_14-24-03.sql
   ```
   > File export sudah include `CREATE DATABASE` — tidak perlu buat database manual.

4. **Run Migrations (if needed)**
   ```bash
   php migrate_content_management.php
   php migrate_course_management.php
   php migrate_gamification.php
   php migrate_notifications.php
   php migrate_analytics.php
   ```

## Setup di Komputer Baru

1. **Clone repository (branch kantor)**
   ```bash
   # Linux
   git clone -b kantor https://github.com/82080038/bimbel.git /opt/lampp/htdocs/bimbel

   # Windows
   git clone -b kantor https://github.com/82080038/bimbel.git C:\xampp\htdocs\bimbel
   ```

2. **Start XAMPP**
   ```bash
   sudo /opt/lampp/lampp start   # Linux
   # atau buka XAMPP Control Panel di Windows
   ```

3. **Import database**
   ```bash
   # Linux
   mysql -u root -proot -h 127.0.0.1 < database/export_2026-05-24_14-24-03.sql
   # Windows
   mysql -u root -p8208 -h 127.0.0.1 < database/export_2026-05-24_14-24-03.sql
   ```

4. **Buka browser**
   ```
   http://localhost/bimbel/
   ```
   Login default: admin / admin123 atau lihat `database/create_quick_test_users.sql`

5. **Install Playwright (untuk testing)**
   ```bash
   npm install
   npx playwright install chromium
   ```

---

## Development Tasks

### Adding New Questions

1. Use admin panel at `admin/admin.html`
2. Or use AI content generation in admin panel
3. Or import via Excel/CSV using bulk import scripts
4. Or use scripts in `/scripts` for automated generation

### Managing Courses & Learning Paths

1. Access admin panel at `admin/admin.html`
2. Navigate to Course Management section
3. Create courses, modules, and materials
4. Assign to learning paths
5. Track user progress via analytics

### Testing API Endpoints

1. Check `/api` folder for available endpoints (13 files):
   - auth.php, soal.php, analytics.php, courses.php, expert.php
   - gamification.php, notifications.php, rate_limiter.php, validator.php
   - pembahasan.php, batch_generate.php, csrf.php, middleware.php
2. Use Postman or curl for testing
3. Example:
   ```bash
   curl http://localhost/ujian/api/soal.php?action=get_soal_by_kategori&kategori_id=1
   curl http://localhost/ujian/api/gamification.php?action=get_user_xp&user_id=1
   curl http://localhost/ujian/api/courses.php?action=get_courses
   ```

### Database Modifications

1. Edit SQL files in `/database` folder
2. Test changes on development database first
3. Export setelah perubahan:
   ```bash
   # Linux
   mysqldump -u root -proot -h 127.0.0.1 --column-statistics=0 \
     --databases ujian_sekolah_kedinasan --triggers --single-transaction \
     --add-drop-database > database/export_$(date +%Y-%m-%d_%H-%M-%S).sql

   # Windows
   mysqldump -u root -p8208 -h 127.0.0.1 --column-statistics=0 \
     --databases ujian_sekolah_kedinasan --triggers --single-transaction \
     --add-drop-database > database/export_%date:~-4%-%date:~3,2%-%date:~0,2%.sql
   ```

### Frontend Development

1. Edit `index.php` for main entry point
2. Edit `admin/admin.html` for admin panel (150KB+ comprehensive UI)
3. Edit `participant/ujian.html` for exam interface
4. Edit `participant/dashboard.html` for user dashboard
5. Edit `participant/expert_assistant.js` for AI assistant
6. Test in browser at `http://localhost/ujian`

### Running Tests

1. Navigate to `/tests` directory
2. Run specific test suites:
   ```bash
   php tests/unit/test_api.php
   php tests/integration/test_gamification.php
   php tests/integration/test_courses.php
   ```
3. Run all tests:
   ```bash
   php tests/run-all.php
   ```

## Feature Development

### Gamification Features

1. Define achievements in `achievements` table
2. Configure badges and XP rewards
3. Set up daily challenges
4. Implement streak tracking
5. Test via `api/gamification.php`

### Notification System

1. Create notification templates in `notification_templates` table
2. Configure user preferences
3. Set up exam reminders
4. Test via `api/notifications.php`

### Expert System

1. Add knowledge to `expert_knowledge` table
2. Configure AI assistant logic in `scripts/`
3. Test via `api/expert.php` and `participant/expert_assistant.js`

### Analytics Dashboard

1. Configure tracking in `api/analytics.php`
2. Review data in admin analytics section
3. Generate reports via funnel analytics
4. Visualize answer heatmaps

## Deployment Checklist

- [ ] Update config.php with production database credentials
- [ ] Remove debug code and console.log statements
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly for API
- [ ] Test all API endpoints (13 endpoints)
- [ ] Verify database backups (57 tables)
- [ ] Run all test suites (28 test files)
- [ ] Configure Redis for caching (recommended)
- [ ] Set up rate limiting rules
- [ ] Configure notification channels
- [ ] Update README.md with version changes
- [ ] Verify RBAC permissions

## Gap Analisis — Fitur Belum Diimplementasikan (24 Mei 2026)

Lihat detail lengkap di `IMPROVEMENT_ROADMAP.md` seksi "Rencana Selanjutnya".

| Fitur | Status | File Target |
|-------|--------|-------------|
| Anti-cheat (visibilitychange, fullscreen) | ❌ Belum | `participant/js/ujian.js` |
| Mode latihan terpisah dari ujian resmi | ❌ Belum | `participant/js/ujian.js` |
| Rate limiter aktif di login | ❌ Belum | `api/auth.php` |
| Bookmark soal | ❌ Belum | `api/soal.php`, `ujian.js` |
| OTP verifikasi HP saat registrasi | ❌ Belum | `api/auth.php` |
| Sertifikat printable / downloadable | ⚠️ Parsial | `participant/sections/` |
| Import soal Excel/CSV | ❌ Belum | `api/import_soal.php` (baru) |
| Forum diskusi | ❌ Belum | File baru |
| Pembayaran paket premium | ❌ Belum | File baru |
| Countdown jadwal ujian resmi | ❌ Belum | `participant/sections/dashboard-content.html` |

---

## Troubleshooting

### Database Connection Issues
- Check XAMPP MySQL status
- Verify credentials in config.php (Linux: `root`, Windows: `8208`)
- Gunakan `-h 127.0.0.1` bukan `localhost` jika socket error
- Ensure database has 62+ tables

### API Not Responding
- Check PHP error logs in `/opt/lampp/logs/php_error_log`
- Verify CORS headers
- Check CSRF token validation
- Check rate limiting rules
- Verify RBAC permissions

### File Upload Issues
- Check PHP upload_max_filesize in php.ini
- Verify directory permissions for /uploads
- Check file type validation
- Ensure storage analysis is working

### Gamification Not Working
- Verify achievements are active in database
- Check XP transaction logs
- Verify user_badges assignments
- Test daily challenges configuration

### Course Progress Not Tracking
- Verify user_course_progress table
- Check module completion logic
- Verify learning path assignments
- Test progress calculation

### Notifications Not Sending
- Check notification templates
- Verify user preferences
- Test notification channels
- Check exam reminder schedules

## Performance Optimization

1. **Enable Redis Caching**
   - Install Redis server
   - Configure in config.php
   - Cache frequent queries

2. **Database Optimization**
   - Add indexes for slow queries
   - Use EXPLAIN ANALYZE
   - Optimize JOIN operations

3. **Frontend Optimization**
   - Lazy load images
   - Minify CSS/JS
   - Enable PWA caching
   - Implement progressive loading

## Security Best Practices

1. Always use prepared statements
2. Validate all inputs via `api/validator.php`
3. Implement rate limiting via `api/rate_limiter.php`
4. Use CSRF tokens for all POST requests
5. Implement RBAC properly
6. Sanitize file uploads
7. Use HTTPS in production
8. Regular security audits
