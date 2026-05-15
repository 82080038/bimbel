---
description: Development workflow for the exam application (Version 2.0 - Kantor Branch)
---

# Development Workflow

## Setup Development Environment

1. **Start XAMPP Services**
   ```bash
   sudo /opt/lampp/lampp start
   ```

2. **Verify Database Connection**
   - Check config.php for database credentials
   - Ensure MySQL is running on port 3306
   - Test connection: `mysql -u root -p8208 ujian_sekolah_kedinasan`

3. **Import Database (if needed)**
   ```bash
   mysql -u root -p8208 ujian_sekolah_kedinasan < database/ujian_sekolah_kedinasan.sql
   ```

4. **Run Migrations (if needed)**
   ```bash
   php migrate_content_management.php
   php migrate_course_management.php
   php migrate_gamification.php
   php migrate_notifications.php
   php migrate_analytics.php
   ```

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

1. Edit SQL files in `/database` folder (7 schema files)
2. Test changes on development database first
3. Backup before production changes:
   ```bash
   mysqldump -u root -p8208 ujian_sekolah_kedinasan > backup.sql
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

## Troubleshooting

### Database Connection Issues
- Check XAMPP MySQL status
- Verify credentials in config.php
- Check firewall settings
- Ensure database has 57 tables

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
