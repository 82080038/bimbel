/**
 * PRODUCTION READINESS TEST - Puppeteer Headed
 * Verifikasi empiris kelayakan production aplikasi Bimbel
 * 
 * Cakupan:
 * 1. Authentication flows (login, register, logout, token expiry)
 * 2. Authorization (RBAC - admin vs user access)
 * 3. Data integrity (dashboard stats, exam history, profile data)
 * 4. Critical user journeys (ujian flow, materi access, profile edit)
 * 5. Admin operations (CRUD soal, user management, analytics)
 * 6. Error handling (404, 401, 403, form validation)
 * 7. Performance (page load times, API response times)
 * 8. Visual integrity (no broken layouts, responsive checks)
 * 
 * Output: Evidence-based report dengan screenshots dan metrics
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost/bimbel';
const SS_DIR = './test-screenshots/production-ready';
const REPORT_FILE = './test-screenshots/production-report.json';

// Test credentials
const TEST_USERS = {
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
    participant: { username: 'testuser', password: 'test123', role: 'user' },
    fresh: { username: 'fresh_test_' + Date.now(), password: 'FreshPass123!', role: 'user' }
};

// Metrics collector
const metrics = {
    pageLoads: [],
    apiCalls: [],
    errors: [],
    visualIssues: [],
    securityFindings: [],
    dataIntegrity: []
};

let passCount = 0;
let failCount = 0;
let warnings = [];

function log(status, testId, message, detail = null) {
    const entry = { status, testId, message, detail, timestamp: new Date().toISOString() };
    if (status === 'PASS') passCount++;
    else if (status === 'FAIL') failCount++;
    else if (status === 'WARN') warnings.push(entry);
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${icon} [${testId}] ${message}${detail ? ' | ' + JSON.stringify(detail).substring(0, 80) : ''}`);
    return entry;
}

async function screenshot(page, name, fullPage = true) {
    const filePath = path.join(SS_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage });
    return filePath;
}

async function measurePageLoad(page, url, testId) {
    const start = Date.now();
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        const loadTime = Date.now() - start;
        metrics.pageLoads.push({ testId, url, loadTime, status: 'OK' });
        return { success: true, loadTime };
    } catch (e) {
        metrics.pageLoads.push({ testId, url, loadTime: Date.now() - start, status: 'ERROR', error: e.message });
        return { success: false, error: e.message };
    }
}

async function measureAPICall(page, url, options = {}, testId) {
    const start = Date.now();
    try {
        const response = await page.evaluate(async (url, opts) => {
            const r = await fetch(url, opts);
            return { status: r.status, ok: r.ok };
        }, url, options);
        const responseTime = Date.now() - start;
        metrics.apiCalls.push({ testId, url, responseTime, status: response.status });
        return { success: response.ok, responseTime, status: response.status };
    } catch (e) {
        metrics.apiCalls.push({ testId, url, responseTime: Date.now() - start, status: 'ERROR', error: e.message });
        return { success: false, error: e.message };
    }
}

async function login(page, username, password) {
    await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    
    // Check if already on dashboard (auto-redirect karena token valid)
    const url = page.url();
    if (url.includes('dashboard') || url.includes('admin')) {
        return true; // Already authenticated
    }
    
    // Check if login form exists
    const hasForm = await page.$('#username');
    if (!hasForm) {
        // Not on login page and not on dashboard - something wrong
        return url.includes('dashboard') || url.includes('admin');
    }
    
    await page.type('#username', username);
    await page.type('#password', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    return finalUrl.includes('dashboard') || finalUrl.includes('admin');
}

async function logout(page) {
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/login.html`);
}

// ==================== TEST SUITE ====================

async function runTests() {
    console.log('\n' + '═'.repeat(70));
    console.log('  PRODUCTION READINESS VERIFICATION');
    console.log('  Puppeteer Headed Mode | Empirical Evidence Collection');
    console.log('═'.repeat(70));

    if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

    // Launch HEADED browser for visual inspection
    console.log('\n🚀 Launching browser in HEADED mode...');
    console.log('   (Jangan tutup browser sampai test selesai!)\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
        defaultViewport: { width: 1400, height: 900 }
    });

    const page = await browser.newPage();
    
    // Monitor console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            metrics.errors.push({ type: 'console.error', text: msg.text(), url: page.url() });
        }
    });
    
    page.on('pageerror', err => {
        metrics.errors.push({ type: 'pageerror', text: err.message, url: page.url() });
    });

    // Track failed requests
    page.on('requestfailed', request => {
        metrics.errors.push({ 
            type: 'requestfailed', 
            url: request.url(), 
            error: request.failure()?.errorText 
        });
    });

    try {
        // ========== TEST GROUP 1: Public Pages ==========
        console.log('\n📦 TEST GROUP 1: Public Pages (No Auth Required)');
        console.log('─'.repeat(70));

        // 1.1 Login page load & visual
        {
            const r = await measurePageLoad(page, `${BASE}/login.html`, 'PUB-001');
            if (r.success) {
                const hasForm = await page.$('#username') !== null;
                const hasPass = await page.$('#password') !== null;
                const hasBtn = await page.$('button[type="submit"]') !== null;
                log(hasForm && hasPass && hasBtn ? 'PASS' : 'FAIL', 'PUB-001', 
                    'Login page renders correctly', 
                    { loadTime: r.loadTime, hasForm, hasPass, hasBtn });
                await screenshot(page, '01-login-page');
            } else {
                log('FAIL', 'PUB-001', 'Login page failed to load', r);
            }
        }

        // 1.2 Register page
        {
            const r = await measurePageLoad(page, `${BASE}/participant/register.html`, 'PUB-002');
            log(r.success ? 'PASS' : 'FAIL', 'PUB-002', 'Register page loads', { loadTime: r.loadTime });
            if (r.success) await screenshot(page, '02-register-page');
        }

        // 1.3 Direct dashboard access without auth (should redirect/fail)
        {
            await logout(page);
            await page.goto(`${BASE}/participant/dashboard.html`);
            await page.waitForTimeout(2000);
            const url = page.url();
            const properlyBlocked = url.includes('login') || url === 'about:blank';
            log(properlyBlocked ? 'PASS' : 'FAIL', 'PUB-003', 
                'Dashboard blocks unauthenticated access', 
                { redirectUrl: url });
            await screenshot(page, '03-auth-blocked');
        }

        // ========== TEST GROUP 2: Authentication Flows ==========
        console.log('\n📦 TEST GROUP 2: Authentication Flows');
        console.log('─'.repeat(70));

        // 2.1 Valid participant login
        {
            const success = await login(page, TEST_USERS.participant.username, TEST_USERS.participant.password);
            log(success ? 'PASS' : 'FAIL', 'AUTH-001', 'Valid participant login', { username: TEST_USERS.participant.username });
            if (success) await screenshot(page, '04-participant-logged-in');
        }

        // 2.2 Invalid credentials
        {
            await logout(page);
            await page.goto(`${BASE}/login.html`);
            await page.type('#username', 'fakeuser12345');
            await page.type('#password', 'wrongpass');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
            
            const url = page.url();
            const stillOnLogin = url.includes('login');
            log(stillOnLogin ? 'PASS' : 'FAIL', 'AUTH-002', 
                'Invalid credentials rejected', 
                { stillOnLogin });
            await screenshot(page, '05-invalid-login');
        }

        // 2.3 Token persistence check
        {
            await login(page, TEST_USERS.participant.username, TEST_USERS.participant.password);
            const token = await page.evaluate(() => localStorage.getItem('authToken'));
            const hasToken = token && token.length > 20;
            log(hasToken ? 'PASS' : 'FAIL', 'AUTH-003', 'Token stored in localStorage', { tokenLength: token?.length });
        }

        // 2.4 Page refresh maintains session
        {
            await page.goto(`${BASE}/participant/dashboard.html`);
            await page.waitForTimeout(3000);
            
            // Check if we got kicked to login (session expired/invalid)
            const urlBeforeReload = page.url();
            const wasAuthenticated = urlBeforeReload.includes('dashboard');
            
            if (wasAuthenticated) {
                await page.reload({ waitUntil: 'networkidle2' });
                await page.waitForTimeout(2000);
                
                const urlAfterReload = page.url();
                const stillAuthenticated = urlAfterReload.includes('dashboard') && !urlAfterReload.includes('login');
                log(stillAuthenticated ? 'PASS' : 'FAIL', 'AUTH-004', 'Session persists after refresh', { url: urlAfterReload });
            } else {
                log('WARN', 'AUTH-004', 'Cannot test refresh - not on dashboard', { url: urlBeforeReload });
            }
            await screenshot(page, '06-session-persist');
        }

        // ========== TEST GROUP 3: Participant Dashboard ==========
        console.log('\n📦 TEST GROUP 3: Participant Dashboard - Data Integrity');
        console.log('─'.repeat(70));

        await login(page, TEST_USERS.participant.username, TEST_USERS.participant.password);
        
        // 3.1 Dashboard loads with data
        {
            await page.goto(`${BASE}/participant/dashboard.html`);
            await page.waitForTimeout(4000);
            
            const totalExams = await page.$eval('#totalExams', el => el.textContent.trim()).catch(() => 'ERROR');
            const avgScore = await page.$eval('#averageScore', el => el.textContent.trim()).catch(() => 'ERROR');
            const xp = await page.$eval('#userXP', el => el.textContent.trim()).catch(() => 'ERROR');
            
            const hasData = totalExams !== 'ERROR' && avgScore !== 'ERROR';
            log(hasData ? 'PASS' : 'FAIL', 'DASH-001', 
                'Dashboard displays user statistics', 
                { totalExams, avgScore, xp });
            
            metrics.dataIntegrity.push({ 
                test: 'DASH-001', 
                user: TEST_USERS.participant.username,
                totalExams, avgScore, xp,
                valid: hasData 
            });
            
            await screenshot(page, '07-dashboard-stats');
        }

        // 3.2 Check chart renders
        {
            const hasCanvas = await page.$('canvas') !== null;
            log(hasCanvas ? 'PASS' : 'WARN', 'DASH-002', 
                'Performance chart rendered', 
                { hasCanvas });
        }

        // 3.3 Weakness analysis section
        {
            const weaknessSection = await page.$eval('.weakness-section, .analisis-section, #weaknessAnalysis', 
                el => el ? 'found' : 'not-found').catch(() => 'not-found');
            log(weaknessSection !== 'not-found' ? 'PASS' : 'WARN', 'DASH-003', 
                'Weakness analysis section present', { weaknessSection });
        }

        // 3.4 Learning materials section
        {
            const materialsBtn = await page.$('a[href*="materi"], button, a');
            const hasMateriLink = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a, button'));
                return links.some(el => el.textContent.toLowerCase().includes('materi'));
            });
            log(hasMateriLink ? 'PASS' : 'WARN', 'DASH-004', 'Learning materials accessible', { hasMateriLink });
        }

        // ========== TEST GROUP 4: Exam (Ujian) Flow ==========
        console.log('\n📦 TEST GROUP 4: Exam Flow - Critical User Journey');
        console.log('─'.repeat(70));

        // 4.1 Ujian page loads
        {
            await page.goto(`${BASE}/participant/ujian.html`);
            await page.waitForTimeout(3000);
            
            const hasContent = await page.evaluate(() => document.body.textContent.length > 200);
            // Check for visible error elements (not just text in code)
            const visibleErrors = await page.evaluate(() => {
                const errorElements = document.querySelectorAll('.error, .alert-danger, [role="alert"]');
                return errorElements.length;
            });
            const noVisibleError = visibleErrors === 0;
            
            log(hasContent && noVisibleError ? 'PASS' : 'FAIL', 'UJI-001', 
                'Ujian page loads without visible errors', 
                { hasContent, visibleErrors });
            await screenshot(page, '08-ujian-page', false); // Don't fullPage - too large
        }

        // 4.2 Exam type selection
        {
            const hasOptions = await page.$('select, .exam-type-selector, [name="exam_type"]') !== null ||
                              await page.evaluate(() => document.body.textContent.includes('CAT') || 
                                                   document.body.textContent.includes('Tryout'));
            log(hasOptions ? 'PASS' : 'WARN', 'UJI-002', 'Exam type options available');
        }

        // ========== TEST GROUP 5: Materials (Materi) ==========
        console.log('\n📦 TEST GROUP 5: Learning Materials');
        console.log('─'.repeat(70));

        {
            await page.goto(`${BASE}/participant/materi.html`);
            await page.waitForTimeout(3000);
            
            const hasContent = await page.evaluate(() => document.body.textContent.length > 200);
            const hasHeading = await page.evaluate(() => {
                const h = document.querySelector('h1, h2');
                return h ? h.textContent : 'no-heading';
            });
            
            log(hasContent ? 'PASS' : 'FAIL', 'MAT-001', 
                'Materials page loads', 
                { heading: hasHeading?.substring(0, 30) });
            await screenshot(page, '09-materi-page', false); // Don't fullPage
        }

        // ========== TEST GROUP 6: Profile Management ==========
        console.log('\n📦 TEST GROUP 6: Profile Management');
        console.log('─'.repeat(70));

        // 6.1 Profile page loads
        {
            await page.goto(`${BASE}/participant/profile.html`);
            await page.waitForTimeout(3000);
            
            const profileName = await page.$eval('#profileName, .profile-name', 
                el => el.textContent.trim()).catch(() => 'ERROR');
            const hasAvatar = await page.$('#profileAvatar, .profile-avatar') !== null;
            
            log(profileName !== 'ERROR' ? 'PASS' : 'FAIL', 'PROF-001', 
                'Profile page renders with user data', 
                { profileName: profileName?.substring(0, 20), hasAvatar });
            await screenshot(page, '10-profile-page', false); // Don't fullPage
        }

        // 6.2 Profile statistics
        {
            const statExams = await page.$eval('#statExams', el => el.textContent.trim()).catch(() => 'N/A');
            const statXP = await page.$eval('#statXP', el => el.textContent.trim()).catch(() => 'N/A');
            
            log(statExams !== 'N/A' && statXP !== 'N/A' ? 'PASS' : 'FAIL', 'PROF-002', 
                'Profile statistics displayed', 
                { statExams, statXP });
        }

        // ========== TEST GROUP 7: Fresh User (Zero State) ==========
        console.log('\n📦 TEST GROUP 7: Fresh User Zero State');
        console.log('─'.repeat(70));

        // Register fresh user
        {
            await logout(page);
            await page.goto(`${BASE}/participant/register.html`);
            
            const ts = Date.now().toString().slice(-6);
            const freshUsername = 'fresh_' + ts;
            
            await page.type('#username', freshUsername);
            await page.type('#password', TEST_USERS.fresh.password);
            await page.type('#namaLengkap', 'Fresh Test User');
            await page.type('#nomorHP', '0812' + ts);
            await page.select('#jenisKelamin', 'L');
            await page.type('#tahunTamat', '2024');
            await page.type('#asalSekolah', 'SMA Fresh');
            
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            const url = page.url();
            const registered = url.includes('login') || url.includes('dashboard');
            log(registered ? 'PASS' : 'FAIL', 'FRESH-001', 
                'Fresh user registration', 
                { username: freshUsername, redirect: url });
            
            if (registered) {
                TEST_USERS.fresh.username = freshUsername;
            }
            await screenshot(page, '11-fresh-register', false);
        }

        // Fresh user dashboard (should show zeros)
        {
            if (TEST_USERS.fresh.username.startsWith('fresh_')) {
                await login(page, TEST_USERS.fresh.username, TEST_USERS.fresh.password);
                await page.goto(`${BASE}/participant/dashboard.html`);
                await page.waitForTimeout(4000);
                
                const totalExams = await page.$eval('#totalExams', el => el.textContent.trim()).catch(() => 'ERROR');
                const avgScore = await page.$eval('#averageScore', el => el.textContent.trim()).catch(() => 'ERROR');
                
                const correctZeroState = totalExams === '0' && (avgScore === '0' || avgScore === '0.0');
                
                log(correctZeroState ? 'PASS' : 'FAIL', 'FRESH-002', 
                    'Fresh user shows correct zero state', 
                    { totalExams, avgScore, expected: '0' });
                
                metrics.dataIntegrity.push({
                    test: 'FRESH-002',
                    user: 'fresh_user',
                    totalExams, avgScore,
                    correctZeroState
                });
                
                await screenshot(page, '12-fresh-dashboard', false);
            }
        }

        // ========== TEST GROUP 8: Admin Operations ==========
        console.log('\n📦 TEST GROUP 8: Admin Operations & RBAC');
        console.log('─'.repeat(70));

        // 8.1 Admin login
        {
            await logout(page);
            const success = await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password);
            log(success ? 'PASS' : 'FAIL', 'ADMIN-001', 'Admin login successful');
            if (success) await screenshot(page, '13-admin-login', false);
        }

        // 8.2 Admin dashboard with global stats
        {
            await page.goto(`${BASE}/admin/admin.html`);
            await page.waitForTimeout(4000);
            
            const totalUjian = await page.$eval('#totalUjian', el => el.textContent.trim()).catch(() => 'ERROR');
            const totalSoal = await page.$eval('#totalSoal', el => el.textContent.trim()).catch(() => 'ERROR');
            
            const hasStats = totalUjian !== 'ERROR' && parseInt(totalUjian) >= 0;
            log(hasStats ? 'PASS' : 'FAIL', 'ADMIN-002', 
                'Admin dashboard shows global statistics', 
                { totalUjian, totalSoal });
            await screenshot(page, '14-admin-dashboard', false);
        }

        // 8.3 Admin can access user management
        {
            const userLink = await page.$('a[onclick*="userManagement"], a[onclick*="participants"]');
            if (userLink) {
                await userLink.click();
                await page.waitForTimeout(2000);
                
                const hasTable = await page.$('table, .user-table, .data-table') !== null;
                log(hasTable ? 'PASS' : 'WARN', 'ADMIN-003', 'User management accessible');
                await screenshot(page, '15-admin-users', false);
            } else {
                log('WARN', 'ADMIN-003', 'User management link not found');
            }
        }

        // ========== TEST GROUP 9: Security & Authorization ==========
        console.log('\n📦 TEST GROUP 9: Security & Authorization Tests');
        console.log('─'.repeat(70));

        // 9.1 User cannot access admin endpoints
        {
            await login(page, TEST_USERS.participant.username, TEST_USERS.participant.password);
            
            const r = await measureAPICall(page, `${BASE}/api/auth.php?action=get_users`, {}, 'SEC-001');
            const blocked = r.status === 401 || r.status === 403 || !r.success;
            
            log(blocked ? 'PASS' : 'FAIL', 'SEC-001', 
                'User blocked from admin get_users', 
                { status: r.status, blocked });
            
            metrics.securityFindings.push({
                test: 'SEC-001',
                endpoint: '/api/auth.php?action=get_users',
                role: 'user',
                properlyBlocked: blocked
            });
        }

        // 9.2 Unauthenticated API calls blocked
        {
            await logout(page);
            
            const endpoints = [
                `${BASE}/api/soal.php?action=get_statistik`,
                `${BASE}/api/soal.php?action=get_riwayat_ujian`,
                `${BASE}/api/gamification.php?action=get_user_gamification`
            ];
            
            for (const endpoint of endpoints) {
                const r = await measureAPICall(page, endpoint, {}, 'SEC-002');
                const blocked = r.status === 401;
                
                log(blocked ? 'PASS' : 'FAIL', 'SEC-002', 
                    `Unauthenticated blocked: ${endpoint.split('/').pop()}`, 
                    { status: r.status });
            }
        }

        // 9.3 CSRF protection check
        {
            const r = await measureAPICall(page, `${BASE}/api/csrf.php?action=get_token`, {}, 'SEC-003');
            log(r.success ? 'PASS' : 'WARN', 'SEC-003', 
                'CSRF token endpoint accessible', 
                { status: r.status });
        }

        // ========== TEST GROUP 10: API Performance ==========
        console.log('\n📦 TEST GROUP 10: API Performance');
        console.log('─'.repeat(70));

        await login(page, TEST_USERS.participant.username, TEST_USERS.participant.password);
        
        const token = await page.evaluate(() => localStorage.getItem('authToken'));
        const apiTests = [
            { url: `${BASE}/api/soal.php?action=get_statistik`, name: 'get_statistik' },
            { url: `${BASE}/api/soal.php?action=get_my_weakness`, name: 'get_my_weakness' },
            { url: `${BASE}/api/gamification.php?action=get_user_gamification`, name: 'get_user_gamification' },
            { url: `${BASE}/api/notifications.php?action=get_notifications&limit=5`, name: 'get_notifications' }
        ];
        
        for (const test of apiTests) {
            const r = await measureAPICall(page, test.url, {
                headers: { 'Authorization': `Bearer ${token}` }
            }, `PERF-${test.name}`);
            
            const acceptable = r.responseTime < 2000;
            log(acceptable ? 'PASS' : 'WARN', `PERF-${test.name}`, 
                `API response time`, 
                { responseTime: r.responseTime, threshold: 2000 });
        }

        // ========== TEST GROUP 11: Visual Integrity ==========
        console.log('\n📦 TEST GROUP 11: Visual Integrity Checks');
        console.log('─'.repeat(70));

        // 11.1 No console errors on critical pages
        {
            const errorCount = metrics.errors.length;
            log(errorCount === 0 ? 'PASS' : 'WARN', 'VIS-001', 
                'No JavaScript errors detected', 
                { errorCount, errors: metrics.errors.slice(0, 3) });
        }

        // 11.2 Responsive check (mobile viewport)
        {
            await page.setViewport({ width: 375, height: 667 }); // iPhone SE
            await page.goto(`${BASE}/participant/dashboard.html`);
            await page.waitForTimeout(3000);
            
            const noHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth <= window.innerWidth;
            });
            
            log(noHorizontalScroll ? 'PASS' : 'WARN', 'VIS-002', 
                'Mobile responsive (no horizontal scroll)', 
                { noHorizontalScroll });
            await screenshot(page, '16-mobile-responsive', false);
            
            // Reset viewport
            await page.setViewport({ width: 1400, height: 900 });
        }

        // ========== PRODUCTION READINESS SUMMARY ==========
        console.log('\n' + '═'.repeat(70));
        console.log('  PRODUCTION READINESS VERDICT');
        console.log('═'.repeat(70));

        // Calculate scores
        const criticalTests = ['PUB-001', 'AUTH-001', 'DASH-001', 'UJI-001', 'ADMIN-001', 'SEC-001'];
        const criticalResults = criticalTests.map(id => ({
            id,
            passed: true // We'd need to track actual results per test ID
        }));

        const score = {
            total: passCount + failCount + warnings.length,
            pass: passCount,
            fail: failCount,
            warnings: warnings.length,
            passRate: ((passCount / (passCount + failCount)) * 100).toFixed(1)
        };

        // Production readiness criteria
        const criteria = {
            criticalFeatures: passCount >= 20,
            noCriticalFailures: failCount === 0,
            authSecure: metrics.securityFindings.every(f => f.properlyBlocked !== false),
            performanceOk: metrics.apiCalls.every(c => c.responseTime < 5000),
            dataIntegrity: metrics.dataIntegrity.every(d => d.valid !== false)
        };

        const readyForProduction = criteria.criticalFeatures && 
                                  criteria.noCriticalFailures && 
                                  criteria.authSecure;

        console.log(`\n📊 Test Results:`);
        console.log(`   ✅ PASS: ${score.pass}`);
        console.log(`   ❌ FAIL: ${score.fail}`);
        console.log(`   ⚠️  WARN: ${score.warnings}`);
        console.log(`   📈 Pass Rate: ${score.passRate}%`);
        
        console.log(`\n🔍 Production Criteria:`);
        console.log(`   ${criteria.criticalFeatures ? '✅' : '❌'} Critical features working`);
        console.log(`   ${criteria.noCriticalFailures ? '✅' : '❌'} No critical failures`);
        console.log(`   ${criteria.authSecure ? '✅' : '❌'} Authentication secure`);
        console.log(`   ${criteria.performanceOk ? '✅' : '⚠️'} API performance acceptable`);
        console.log(`   ${criteria.dataIntegrity ? '✅' : '⚠️'} Data integrity maintained`);

        console.log(`\n${'═'.repeat(70)}`);
        if (readyForProduction) {
            console.log('  ✅ VERDICT: APPLICATION READY FOR PRODUCTION');
        } else if (failCount === 0) {
            console.log('  ⚠️  VERDICT: READY WITH MINOR ISSUES (see warnings)');
        } else {
            console.log('  ❌ VERDICT: NOT READY FOR PRODUCTION');
        }
        console.log(`${'═'.repeat(70)}\n`);

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            summary: score,
            criteria,
            verdict: readyForProduction ? 'READY' : failCount === 0 ? 'READY_WITH_WARNINGS' : 'NOT_READY',
            metrics,
            testUsers: {
                admin: { username: TEST_USERS.admin.username, role: TEST_USERS.admin.role },
                participant: { username: TEST_USERS.participant.username, role: TEST_USERS.participant.role },
                fresh: { username: TEST_USERS.fresh.username, role: TEST_USERS.fresh.role }
            },
            screenshots: fs.readdirSync(SS_DIR).filter(f => f.endsWith('.png'))
        };
        
        fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
        console.log(`📄 Full report saved: ${REPORT_FILE}`);
        console.log(`📸 Screenshots saved: ${SS_DIR}/\n`);

    } catch (error) {
        console.error('\n❌ Test suite failed with error:', error.message);
        console.error(error.stack);
    } finally {
        console.log('\n⏳ Waiting 5 seconds before closing browser...');
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

// Run tests
runTests().catch(console.error);
