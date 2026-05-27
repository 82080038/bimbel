---
description: Development workflow for the application
---

# Development Workflow

## 1. Setup Development Environment

### Prerequisites
- PHP 8.0+
- MySQL 8.0+ / MariaDB 10.3+
- XAMPP (Linux/Mac/Windows)
- Node.js (for Playwright testing)
- Git

### Installation Steps

1. **Clone repository**
   ```bash
   cd /opt/lampp/htdocs
   git clone <repository-url> bimbel
   cd bimbel
   ```

2. **Configure database**
   - Update `config.php` with your database credentials
   - Current configuration:
     - DB_HOST: 127.0.0.1
     - DB_USER: root
     - DB_PASS: root
     - DB_NAME: bimbel_db

3. **Create database**
   ```sql
   CREATE DATABASE bimbel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Import database**
   ```bash
   mysql -u root -p bimbel_db < database/export_2026-05-27_21-23-48.sql
   ```

5. **Run migrations**
   ```bash
   php migrate_course_management.php
   php migrate_gamification.php
   php migrate_notifications.php
   php migrate_analytics.php
   php migrate_content_management.php
   ```

6. **Install Node dependencies**
   ```bash
   npm install
   ```

7. **Start XAMPP**
   - Start Apache
   - Start MySQL

8. **Access application**
   - Open browser: http://localhost/bimbel
   - Login page: http://localhost/bimbel/login.html
   - Admin panel: http://localhost/bimbel/admin/admin.html
   - Participant dashboard: http://localhost/bimbel/participant/dashboard.html

## 2. Development Workflow

### Making Changes

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
   - Run Playwright tests

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
5. Export database after migration:
   ```bash
   php export_database.php
   ```

### Code Style Guidelines

- Use PHP 8.0+ features
- Follow PSR-12 coding standards
- Use prepared statements for all SQL queries
- Add comments for complex logic
- Use descriptive variable names
- Use AppConfig for all URLs in JavaScript
- Use RBAC for access control

## 3. Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Exam creation and taking
- [ ] Score calculation
- [ ] Gamification XP awarding
- [ ] Notification sending
- [ ] Admin dashboard functionality
- [ ] Mobile responsiveness
- [ ] Accessibility features

### Running Playwright Tests

```bash
# Run all tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test tests/your-test.spec.js

# Run tests with UI
npx playwright test --ui
```

### API Testing

Use curl or Postman to test API endpoints:
```bash
# Example: Login
curl -X POST http://localhost/bimbel/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

## 4. Deployment

### Pre-Deployment Checklist

- [ ] Update `config.php` with production database credentials
- [ ] Change debug mode to false in `config/app.php`
- [ ] Update BASE_URL in `config/app.php` and `js/config.js`
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
   // config/app.php
   define('ENVIRONMENT', 'production');
   define('BASE_URL', 'https://your-production-domain.com');
   define('DEBUG_MODE', false);
   ```

3. **Create production database**
   ```sql
   CREATE DATABASE bimbel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Import database schema**
   ```bash
   mysql -u username -p bimbel_db < database/export_2026-05-27_21-23-48.sql
   ```

5. **Run migrations**
   ```bash
   php migrate_course_management.php
   php migrate_gamification.php
   php migrate_notifications.php
   php migrate_analytics.php
   php migrate_content_management.php
   ```

6. **Configure web server**
   - Apache: Ensure mod_rewrite is enabled
   - Nginx: Configure PHP-FPM
   - Set document root to project directory

7. **Test production deployment**
   - Test login functionality
   - Test exam functionality
   - Test admin panel
   - Test API endpoints

## 5. Troubleshooting

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

## 6. Quick Reference

### Important Files
- `config.php` - Database configuration
- `config/app.php` - Application configuration
- `js/config.js` - Frontend configuration
- `index.php` - Entry point with RBAC
- `playwright.config.js` - Test configuration

### Important Directories
- `api/` - API endpoints
- `admin/` - Admin panel
- `participant/` - Participant dashboard
- `database/` - SQL schemas and exports
- `scripts/` - Utility scripts
- `assets/` - Static assets

### Default Credentials
- Admin: admin / admin123
- Test User: testuser / test123

### Database Export
Latest export: `database/export_2026-05-27_21-23-48.sql`
