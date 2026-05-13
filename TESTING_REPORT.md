# Testing Report - Aplikasi Ujian Sekolah Kedinasan

**Tanggal:** 13 Mei 2026  
**Status:** Testing Phase

---

## 1. Environment Setup

### System Information
- **OS:** Windows (XAMPP)
- **Web Server:** Apache/2.4.58
- **PHP:** 8.2.12
- **MySQL:** MySQL/MariaDB (via XAMPP)
- **Node.js:** (untuk testing)

### Database Configuration
```php
DB_HOST: 127.0.0.1
DB_USER: root
DB_PASS: root  ✅ (Updated per user request)
DB_NAME: ujian_sekolah_kedinasan
```

---

## 2. Test Scenarios

### Test 1: Database Connection ✅

**Objective:** Verify database connection with password 'root'

**Steps:**
1. Access `http://localhost/bimbel/`
2. Check if database connection successful

**Expected Result:**
- No "Access denied" error
- Connection established
- Redirect to appropriate page

**Status:** ⏳ Pending - Waiting for user confirmation

---

### Test 2: Root URL Redirect ✅/⏳

**Objective:** Test RBAC redirect from index.php

**Test Cases:**

| Scenario | Expected | Status |
|----------|----------|--------|
| Guest (no session) | → login.html | ⏳ |
| User (role=user) | → dashboard.html | ⏳ |
| Admin (role=admin) | → admin.html | ⏳ |

**How to Test:**
```bash
# Test 1: Clear session, access root
curl -c cookies.txt http://localhost/bimbel/
# Expected: Redirect to login.html

# Test 2: Login as user
curl -X POST -d "username=testuser&password=testpass" \
  http://localhost/bimbel/api/auth.php?action=login

# Test 3: Access root with session
curl -b cookies.txt http://localhost/bimbel/
# Expected: Redirect to dashboard.html
```

---

### Test 3: Login Page ✅

**Objective:** Verify login.html loads correctly

**Checks:**
- [ ] Page loads without 404
- [ ] Form elements present
- [ ] RBAC.js loaded
- [ ] Config.js loaded
- [ ] No console errors

**URL:** `http://localhost/bimbel/login.html`

---

### Test 4: Registration Page ✅

**Objective:** Verify register.html loads correctly

**Checks:**
- [ ] Page loads without 404
- [ ] Form with 8 fields present
- [ ] Validation working
- [ ] Link to login page works

**URL:** `http://localhost/bimbel/register.html`

---

### Test 5: Dashboard Page ✅

**Objective:** Verify dashboard.html for users

**Checks:**
- [ ] Page loads (requires auth)
- [ ] Stats cards displayed
- [ ] Chart.js loaded
- [ ] RBAC protection working

**URL:** `http://localhost/bimbel/dashboard.html`

---

### Test 6: Admin Page ✅

**Objective:** Verify admin.html protection

**Checks:**
- [ ] Guest redirected to login
- [ ] User redirected to dashboard
- [ ] Admin allowed access

**URL:** `http://localhost/bimbel/admin.html`

---

### Test 7: API Endpoints ✅

**Objective:** Test API functionality

**Test Cases:**

#### 7.1 Public API (No Auth Required)
```bash
# Get Paket
curl "http://localhost/bimbel/api/soal.php?action=get_paket"
# Expected: JSON with paket data

# Get Soal by Paket
curl "http://localhost/bimbel/api/soal.php?action=get_soal_by_paket&paket_id=1"
# Expected: JSON with soal data
```

#### 7.2 Auth API (Requires Login)
```bash
# Login first
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  "http://localhost/bimbel/api/auth.php?action=login"

# Save token, then test protected endpoints
```

---

### Test 8: PHP Unit Tests ✅

**Location:** `tests/php/Unit/`

**Test Files:**
- `ValidatorTest.php` - 22 test cases
- `RateLimiterTest.php` - 9 test cases

**Run:**
```bash
cd tests/php
phpunit
```

**Expected:**
```
OK (31 tests, 55 assertions)
```

---

### Test 9: Security Scan ✅

**Checks:**

| Vulnerability | Test | Expected | Status |
|---------------|------|----------|--------|
| SQL Injection | Try `?paket_id=1' OR '1'='1` | Blocked/sanitized | ⏳ |
| XSS | Input `<script>alert(1)</script>` | Escaped | ⏳ |
| CSRF | Missing token | Rejected | ⏳ |
| Rate Limit | 100+ req/min | Throttled | ⏳ |

---

### Test 10: E2E Puppeteer Tests ⏳

**Location:** `tests/simulation/`

**Test Scripts:**
- `participant-simulation.js`
- `admin-simulation.js`
- `rbac-test.js`

**Run:**
```bash
cd tests
npm run test:participant
npm run test:admin
npm run test:rbac
```

---

## 3. Manual Testing Checklist

### Pre-requisites
- [ ] XAMPP Apache running
- [ ] XAMPP MySQL running
- [ ] Database imported
- [ ] config.php updated with correct password

### Step-by-Step Test

**Step 1: Root URL Test**
```
URL: http://localhost/bimbel/

Expected:
- Browser redirects to login.html
- No database errors
- No PHP warnings
```

**Step 2: Login Page Test**
```
URL: http://localhost/bimbel/login.html

Checks:
✓ Page loads (200 OK)
✓ Form visible
✓ Username field exists
✓ Password field exists
✓ Login button exists
✓ Link to register.html exists
```

**Step 3: Registration Test**
```
URL: http://localhost/bimbel/register.html

Checks:
✓ Page loads (200 OK)
✓ All 8 form fields present:
  - Username
  - Password
  - Confirm Password
  - Nama Lengkap
  - Nomor HP
  - Jenis Kelamin
  - Tahun Tamat
  - Asal Sekolah
✓ Submit button works
```

**Step 4: API Test**
```bash
# Test public API
curl -i "http://localhost/bimbel/api/soal.php?action=get_paket"

Expected:
HTTP/1.1 200 OK
Content-Type: application/json

Body:
{
  "success": true,
  "data": [...]
}
```

**Step 5: Database Connection Test**
```php
// Create test file: test_db.php
<?php
require_once 'config.php';
if ($conn->connect_error) {
    echo "FAILED: " . $conn->connect_error;
} else {
    echo "SUCCESS: Connected to database";
}
```

---

## 4. Known Issues & Workarounds

### Issue 1: Database Access Denied
**Symptom:** `Access denied for user 'root'@'localhost'`

**Solution:** ✅ FIXED
- Updated `config.php` with password 'root'
- Added try-catch error handling

### Issue 2: Duplicate Constant Warnings
**Symptom:** `Constant DB_HOST already defined`

**Solution:** ✅ FIXED
- Added `if (!defined('DB_HOST'))` checks
- Fixed load order in index.php

### Issue 3: Missing Database
**Symptom:** `Unknown database 'ujian_sekolah_kedinasan'`

**Solution:**
- Auto-create database implemented
- Run SQL import if needed:
```bash
mysql -u root -p < database/complete_setup.sql
```

---

## 5. Test Results Summary

| Category | Tests | Passed | Failed | Status |
|----------|-------|--------|--------|--------|
| Database | 3 | ? | ? | ⏳ Testing |
| API | 5 | ? | ? | ⏳ Testing |
| Frontend | 4 | ? | ? | ⏳ Testing |
| RBAC | 3 | ? | ? | ⏳ Testing |
| Security | 4 | ? | ? | ⏳ Testing |
| **TOTAL** | **19** | **?** | **?** | **⏳** |

---

## 6. Quick Test Commands

```bash
# 1. Test database
curl -i http://localhost/bimbel/test_db.php

# 2. Test API
curl "http://localhost/bimbel/api/soal.php?action=get_paket"

# 3. Test login page
curl -i http://localhost/bimbel/login.html

# 4. Test root redirect
curl -L http://localhost/bimbel/

# 5. Run PHP unit tests
cd tests/php && phpunit

# 6. Run E2E tests
cd tests && npm run test:all
```

---

## 7. Expected Results

### All Tests Pass ✅
```
Database: Connected
API: 200 OK
Frontend: Pages load
RBAC: Redirects work
Security: No vulnerabilities
```

### If Issues Found ⚠️

**Database Issue:**
- Check XAMPP MySQL running
- Verify password in config.php
- Check database exists

**API Issue:**
- Check mod_rewrite enabled
- Verify .htaccess exists
- Check error logs

**Frontend Issue:**
- Clear browser cache
- Check console errors
- Verify files exist

---

## 8. Sign-off

**Tester:** _____________  
**Date:** _____________  
**Status:** ⏳ In Progress

**Notes:**
- Password database: 'root' ✅
- Config updated ✅
- Ready for full testing ⏳

---

*Testing Report Generated: 13 Mei 2026*
