# Setup Instructions for New Computer

## Overview
This document provides step-by-step instructions to set up the Aplikasi Ujian Sekolah Kedinasan on a new computer.

## Prerequisites

### Required Software
1. **XAMPP** (or equivalent PHP/MySQL server)
   - Download: https://www.apachefriends.org/
   - Minimum version: XAMPP 7.4+ (PHP 8.0+ recommended)
   
2. **Node.js** (for running automated tests - optional)
   - Download: https://nodejs.org/
   - Minimum version: Node.js 16+

3. **Python 3** (for data import scripts - optional)
   - Download: https://www.python.org/
   - Required packages: pandas, requests, beautifulsoup4

## Installation Steps

### Step 1: Copy Application Files
1. Copy the entire `bimbel_1` folder to the new computer
2. Recommended location: `C:\xampp\htdocs\bimbel` (for XAMPP)
3. Alternative: Any web-accessible directory

### Step 2: Install XAMPP
1. Download and install XAMPP
2. During installation, choose default settings
3. Install to: `C:\xampp` (recommended)
4. Start Apache and MySQL services from XAMPP Control Panel

### Step 3: Configure Database Password
1. Open XAMPP Control Panel
2. Click "Admin" button next to MySQL
3. This will open phpMyAdmin in your browser
4. Go to User accounts tab
5. Check the password for the 'root' user
6. **Important**: Note the MySQL password (default is empty for new XAMPP installations)

### Step 4: Update Database Configuration
1. Open `config.php` in the application directory
2. Update the following settings if needed:
   ```php
   define('DB_HOST', 'localhost');        // Usually stays 'localhost'
   define('DB_USER', 'root');            // Usually stays 'root'
   define('DB_PASS', 'your_password');   // UPDATE THIS with your MySQL password
   define('DB_NAME', 'ujian_sekolah_kedinasan'); // Database name
   ```
3. Save the file

### Step 5: Import Database
You have two options:

#### Option A: Import from SQL File (Recommended)
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create a new database named `ujian_sekolah_kedinasan`
3. Click on the database
4. Go to "Import" tab
5. Choose the SQL file from `database/` directory
6. Click "Go" to import

#### Option B: Use Migration Scripts
1. Open terminal/command prompt
2. Navigate to the application directory
3. Run migration scripts in order:
   ```bash
   php migrate_course_management.php
   php migrate_gamification.php
   php migrate_notifications.php
   php migrate_analytics.php
   php migrate_content_management.php
   ```

### Step 6: Set Directory Permissions
Ensure the following directories are writable:
- `cache/`
- `logs/`
- `uploads/`

Create these directories if they don't exist:
```bash
mkdir cache
mkdir logs
mkdir uploads
```

### Step 7: Access the Application
1. Open your browser
2. Navigate to: `http://localhost/bimbel` (or your installation path)
3. Default login credentials:
   - Admin: Check database or create new admin user
   - User: Register through the registration page

## File Structure (What Was Copied)

### ✅ Included Files/Directories
- `admin/` - Admin panel files
- `api/` - API endpoints (13 files)
- `participant/` - User interface files
- `data/` - Learning materials and data
- `database/` - Database schemas and migration scripts
- `docs/` - Documentation files
- `scripts/` - Utility scripts
- `tests/` - Automated test files
- `config.php` - Main configuration file (updated for portability)
- `index.php` - Entry point
- `login.html` - Login page
- `manifest.json` - PWA manifest
- `service-worker.js` - PWA service worker
- All markdown documentation files
- Python scripts for data import
- PHP migration scripts

### ❌ Excluded Files/Directories (Not Copied)
- `node_modules/` - Node.js dependencies (can be regenerated)
- `cache/` - Temporary cache files
- `logs/` - Log files
- `uploads/` - User uploads
- `test-screenshots/` - Test screenshots
- `screenshots/` - Screenshots
- `playwright-screenshots/` - Playwright test screenshots
- `.vscode/` - VSCode settings
- `.git/` - Git repository
- `*.log` - Log files
- `*.tmp`, `*.temp` - Temporary files
- Database backup files (`*backup*.sql`)

## Optional Setup Steps

### For Automated Testing
If you want to run automated tests:
1. Install Node.js
2. Navigate to the application directory
3. Install dependencies:
   ```bash
   npm install
   npm install -g playwright
   npx playwright install
   ```
4. Run tests:
   ```bash
   node tests/comprehensive-test.js
   ```

### For Data Import Scripts
If you want to use Python data import scripts:
1. Install Python 3
2. Install required packages:
   ```bash
   pip install pandas requests beautifulsoup4
   ```
3. Run import scripts:
   ```bash
   python bulk_import_tpa_psikologis.py
   python bulk_import_umptn_sbmptn.py
   ```

## Troubleshooting

### Database Connection Error
**Problem**: "Database Connection Error"
**Solution**:
1. Check if MySQL is running in XAMPP Control Panel
2. Verify DB_PASS in config.php matches your MySQL password
3. Try changing DB_HOST from 'localhost' to '127.0.0.1'

### 404 Not Found
**Problem**: Cannot access the application
**Solution**:
1. Verify Apache is running in XAMPP Control Panel
2. Check the URL path matches your installation directory
3. Ensure files are in the correct htdocs directory

### Permission Errors
**Problem**: Cannot write to cache/logs/uploads
**Solution**:
1. Create the directories manually
2. Set write permissions on Windows:
   - Right-click folder → Properties → Security
   - Add "Everyone" with Write permissions

### Missing Database Tables
**Problem**: Database exists but tables are missing
**Solution**:
1. Import the SQL file from database/ directory
2. Or run migration scripts in order

## Configuration Notes

### Database Configuration
The database configuration is in `config.php`. The file includes detailed comments for portability. Update these settings on the new computer:
- `DB_HOST`: Database server (usually 'localhost')
- `DB_USER`: Database username (usually 'root')
- `DB_PASS`: Database password (UPDATE THIS!)
- `DB_NAME`: Database name ('ujian_sekolah_kedinasan')

### Exam Settings
Exam settings are also in `config.php`:
- `DURASI_UJIAN_MENIT`: Exam duration in minutes
- `JUMLAH_SOAL_*`: Number of questions per category
- `PASSING_GRADE_*`: Passing grades per category

## Support

For issues or questions:
1. Check the main README.md for detailed documentation
2. Review SYSTEM_OVERVIEW.md for architecture details
3. Check DEVELOPER_GUIDE.md for development setup

## Version Information
- Application Version: 2.0 (Production Ready)
- PHP Version Required: 8.0+
- MySQL Version Required: 5.7+ / MariaDB 10.3+
- Setup Date: 26 Mei 2026
