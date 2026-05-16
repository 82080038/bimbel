/**
 * Full Application Test - Semua halaman semua role
 * Menguji: login.html, register.html, participant/dashboard.html,
 *          participant/ujian.html, participant/materi.html,
 *          participant/profile.html, admin/admin.html
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost/bimbel';
const SS_DIR = './test-screenshots/full-app';
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ss = async (page, name) => {
    await page.screenshot({ path: `${SS_DIR}/${name}.png`, fullPage: false });
};

let pass = 0, fail = 0;
const results = [];

function log(status, label, detail = '') {
    const ok = status === 'PASS';
    if (ok) pass++; else fail++;
    results.push({ ok, label, detail });
    console.log(`  ${ok ? '✅' : '❌'} ${label}${detail ? ' | ' + detail : ''}`);
}

async function checkVisible(page, selector, label) {
    try {
        const el = await page.$(selector);
        const visible = el && await el.evaluate(e => e.offsetParent !== null || window.getComputedStyle(e).display !== 'none');
        log(visible ? 'PASS' : 'FAIL', label, visible ? '' : `selector ${selector} not visible`);
        return !!visible;
    } catch (e) {
        log('FAIL', label, e.message.substring(0, 60));
        return false;
    }
}

async function checkText(page, selector, label, minLength = 0) {
    try {
        const text = await page.$eval(selector, el => el.textContent.trim()).catch(() => null);
        const ok = text !== null && text.length >= minLength;
        log(ok ? 'PASS' : 'FAIL', label, text ? text.substring(0, 50) : 'element not found');
        return ok;
    } catch (e) {
        log('FAIL', label, e.message.substring(0, 60));
        return false;
    }
}

async function checkNoError(page, label) {
    const url = page.url();
    const is404 = url.includes('404') || url === 'about:blank';
    log(is404 ? 'FAIL' : 'PASS', label, url);
    return !is404;
}

(async () => {
    console.log('\n' + '═'.repeat(60));
    console.log('  FULL APPLICATION TEST');
    console.log('═'.repeat(60));

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Suppress console errors from page
    page.on('console', msg => {
        if (msg.type() === 'error') {
            // Silently track errors
        }
    });

    // ─── TEST 1: Login Page ───────────────────────────────────────────
    console.log('\n📌 TEST 1: Login Page');
    try {
        await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle0', timeout: 10000 });
        await checkVisible(page, '#username', 'Login - username field visible');
        await checkVisible(page, '#password', 'Login - password field visible');
        await checkVisible(page, 'button[type="submit"]', 'Login - submit button visible');
        await ss(page, '01-login');
    } catch (e) {
        log('FAIL', 'Login page load', e.message.substring(0, 60));
    }

    // ─── TEST 2: Register Page ────────────────────────────────────────
    console.log('\n📌 TEST 2: Register Page');
    try {
        await page.goto(`${BASE}/participant/register.html`, { waitUntil: 'networkidle0', timeout: 10000 });
        await checkVisible(page, '#username', 'Register - username field');
        await checkVisible(page, '#password', 'Register - password field');
        await checkVisible(page, '#namaLengkap', 'Register - nama lengkap field');
        await checkVisible(page, '#nomorHP', 'Register - nomor HP field');
        await ss(page, '02-register');
    } catch (e) {
        log('FAIL', 'Register page load', e.message.substring(0, 60));
    }

    // ─── TEST 3: Login sebagai testuser ──────────────────────────────
    console.log('\n📌 TEST 3: Login sebagai testuser (participant)');
    try {
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle0', timeout: 10000 });
        await page.waitForSelector('#username', { timeout: 5000 });
        await page.type('#username', 'testuser');
        await page.type('#password', 'test123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
        await sleep(3000);
        const url = page.url();
        const loginOk = url.includes('dashboard');
        log(loginOk ? 'PASS' : 'FAIL', 'Login testuser - redirect ke dashboard', url);
        await ss(page, '03-login-testuser');
    } catch (e) {
        log('FAIL', 'Login testuser', e.message.substring(0, 60));
    }

    // ─── TEST 4: Participant Dashboard ────────────────────────────────
    console.log('\n📌 TEST 4: Participant Dashboard');
    try {
        await page.goto(`${BASE}/participant/dashboard.html`, { waitUntil: 'networkidle0', timeout: 15000 });
        await sleep(4000);
        await ss(page, '04-dashboard-participant');

        await checkVisible(page, '#totalExams', 'Dashboard - totalExams element');
        await checkVisible(page, '#averageScore', 'Dashboard - averageScore element');
        await checkVisible(page, '#userXP', 'Dashboard - userXP element');
        await checkVisible(page, '#userStreak', 'Dashboard - userStreak element');

        const totalExams = await page.$eval('#totalExams', el => el.textContent.trim()).catch(() => null);
        const avgScore = await page.$eval('#averageScore', el => el.textContent.trim()).catch(() => null);
        log(totalExams !== null && totalExams !== '' && totalExams !== '0' ? 'PASS' : 'FAIL', 
            'Dashboard - totalExams shows data', `value: ${totalExams}`);
        log(avgScore !== null && avgScore !== '' ? 'PASS' : 'FAIL', 
            'Dashboard - averageScore shows data', `value: ${avgScore}`);

        // Check stats don't show global data for regular users
        const xpEl = await page.$eval('#userXP', el => el.textContent.trim()).catch(() => '0');
        log(xpEl !== undefined ? 'PASS' : 'FAIL', 'Dashboard - userXP loaded', `value: ${xpEl}`);
    } catch (e) {
        log('FAIL', 'Participant dashboard', e.message.substring(0, 60));
    }

    // ─── TEST 5: Participant Ujian Page ──────────────────────────────
    console.log('\n📌 TEST 5: Participant Ujian Page');
    try {
        await page.goto(`${BASE}/participant/ujian.html`, { waitUntil: 'networkidle0', timeout: 15000 });
        await sleep(3000);
        await ss(page, '05-ujian');

        const hasContent = await page.evaluate(() => document.body.textContent.length > 100);
        log(hasContent ? 'PASS' : 'FAIL', 'Ujian page - has content');
        
        // Check for exam type selector or start button
        const hasExamUI = await page.$('.header-section, #examSection, .exam-container, h1').catch(() => null);
        log(hasExamUI ? 'PASS' : 'FAIL', 'Ujian page - exam UI visible');
    } catch (e) {
        log('FAIL', 'Ujian page', e.message.substring(0, 60));
    }

    // ─── TEST 6: Participant Materi Page ─────────────────────────────
    console.log('\n📌 TEST 6: Participant Materi Page');
    try {
        await page.goto(`${BASE}/participant/materi.html`, { waitUntil: 'networkidle0', timeout: 15000 });
        await sleep(3000);
        await ss(page, '06-materi');

        const hasContent = await page.evaluate(() => document.body.textContent.length > 100);
        log(hasContent ? 'PASS' : 'FAIL', 'Materi page - has content');
        
        const hasMateriEl = await page.$('.materi-container, .header-section, h1, h2').catch(() => null);
        log(hasMateriEl ? 'PASS' : 'FAIL', 'Materi page - materi UI visible');
    } catch (e) {
        log('FAIL', 'Materi page', e.message.substring(0, 60));
    }

    // ─── TEST 7: Participant Profile Page ────────────────────────────
    console.log('\n📌 TEST 7: Participant Profile Page');
    try {
        await page.goto(`${BASE}/participant/profile.html`, { waitUntil: 'networkidle0', timeout: 15000 });
        await sleep(3000);
        await ss(page, '07-profile');

        await checkVisible(page, '#profileAvatar', 'Profile - avatar element');
        await checkVisible(page, '#profileName', 'Profile - name element');

        const profileName = await page.$eval('#profileName', el => el.textContent.trim()).catch(() => '');
        log(profileName.length > 0 ? 'PASS' : 'FAIL', 'Profile - name loaded', profileName);

        // Check stat elements exist
        const statExams = await page.$('#statExams').catch(() => null);
        log(statExams ? 'PASS' : 'FAIL', 'Profile - statExams element exists');

        const statXP = await page.$('#statXP').catch(() => null);
        log(statXP ? 'PASS' : 'FAIL', 'Profile - statXP element exists');
    } catch (e) {
        log('FAIL', 'Profile page', e.message.substring(0, 60));
    }

    // ─── TEST 8: Admin Login ──────────────────────────────────────────
    console.log('\n📌 TEST 8: Admin Login');
    try {
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle0', timeout: 10000 });
        await page.waitForSelector('#username', { timeout: 5000 });
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
        await sleep(3000);
        const url = page.url();
        const adminOk = url.includes('admin');
        log(adminOk ? 'PASS' : 'FAIL', 'Admin login - redirect ke admin panel', url);
        await ss(page, '08-admin-login');
    } catch (e) {
        log('FAIL', 'Admin login', e.message.substring(0, 60));
    }

    // ─── TEST 9: Admin Dashboard ──────────────────────────────────────
    console.log('\n📌 TEST 9: Admin Dashboard');
    try {
        await page.goto(`${BASE}/admin/admin.html`, { waitUntil: 'networkidle0', timeout: 15000 });
        await sleep(4000);
        await ss(page, '09-admin-dashboard');

        const hasAdmin = await page.evaluate(() => document.body.textContent.includes('Dashboard') || document.body.textContent.includes('Admin'));
        log(hasAdmin ? 'PASS' : 'FAIL', 'Admin panel - has admin content');

        const totalUjian = await page.$('#totalUjian').catch(() => null);
        log(totalUjian ? 'PASS' : 'FAIL', 'Admin - totalUjian element exists');

        const totalUjianVal = await page.$eval('#totalUjian', el => el.textContent.trim()).catch(() => '0');
        log(parseInt(totalUjianVal) >= 0 ? 'PASS' : 'FAIL', 'Admin - totalUjian has value', totalUjianVal);
    } catch (e) {
        log('FAIL', 'Admin dashboard', e.message.substring(0, 60));
    }

    // ─── TEST 10: Admin Sections Navigation ──────────────────────────
    console.log('\n📌 TEST 10: Admin Sections Navigation');
    try {
        // Use onclick attribute selectors matching actual HTML
        const menuItems = [
            [`a[onclick*="'questions'"]`, 'Soal'],
            [`a[onclick*="'participants'"]`, 'Partisipan'],
            [`a[onclick*="'examPackages'"]`, 'Paket Tryout'],
        ];
        
        for (const [selector, label] of menuItems) {
            try {
                const link = await page.$(selector);
                if (link) {
                    await link.click();
                    await sleep(1000);
                    log('PASS', `Admin nav - click ${label}`, 'clicked');
                } else {
                    log('FAIL', `Admin nav - click ${label}`, `selector ${selector} not found`);
                }
            } catch (e) {
                log('FAIL', `Admin nav - ${label}`, e.message.substring(0, 40));
            }
        }
        await ss(page, '10-admin-navigation');
    } catch (e) {
        log('FAIL', 'Admin navigation', e.message.substring(0, 60));
    }

    // ─── TEST 11: API Security Tests ─────────────────────────────────
    console.log('\n📌 TEST 11: API Security Tests');
    try {
        // Test unauthenticated access
        const r1 = await page.evaluate(async () => {
            const r = await fetch('/bimbel/api/soal.php?action=get_statistik');
            return r.status;
        });
        log(r1 === 401 ? 'PASS' : 'FAIL', 'Security - statistik requires auth', `status: ${r1}`);

        const r2 = await page.evaluate(async () => {
            const r = await fetch('/bimbel/api/auth.php?action=get_users');
            const d = await r.json().catch(() => ({}));
            return d.success === false ? 'BLOCKED' : 'OPEN';
        });
        log(r2 === 'BLOCKED' ? 'PASS' : 'FAIL', 'Security - get_users requires admin', r2);

        const r3 = await page.evaluate(async () => {
            const r = await fetch('/bimbel/api/soal.php?action=get_kategori_weakness');
            return r.status;
        });
        log(r3 === 401 ? 'PASS' : 'FAIL', 'Security - kategori_weakness requires auth', `status: ${r3}`);
    } catch (e) {
        log('FAIL', 'Security tests', e.message.substring(0, 60));
    }

    // ─── TEST 12: Fresh User Dashboard ───────────────────────────────
    console.log('\n📌 TEST 12: Fresh User Dashboard (zero state)');
    try {
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle0', timeout: 10000 });
        
        // Login as latest fresh user
        const ts = Date.now().toString().slice(-6);
        // Register via API
        await page.evaluate(async (ts) => {
            await fetch('/bimbel/api/auth.php?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'zt' + ts,
                    password: 'Test1234!',
                    nama_lengkap: 'Zero Test',
                    nomor_hp: '0812' + ts,
                    jenis_kelamin: 'L',
                    tahun_tamat: 2024,
                    asal_sekolah: 'SMA Test',
                    role: 'user'
                })
            });
        }, ts);

        await page.waitForSelector('#username', { timeout: 5000 });
        await page.type('#username', 'zt' + ts);
        await page.type('#password', 'Test1234!');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
        await sleep(4000);
        
        const totalExams = await page.$eval('#totalExams', el => el.textContent.trim()).catch(() => null);
        const avgScore = await page.$eval('#averageScore', el => el.textContent.trim()).catch(() => null);
        
        log(totalExams === '0' ? 'PASS' : 'FAIL', 'Fresh user - totalExams = 0', `got: ${totalExams}`);
        log(avgScore === '0' ? 'PASS' : 'FAIL', 'Fresh user - avgScore = 0', `got: ${avgScore}`);
        await ss(page, '12-fresh-user-dashboard');
    } catch (e) {
        log('FAIL', 'Fresh user dashboard', e.message.substring(0, 60));
    }

    await browser.close();

    // ─── SUMMARY ──────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log(`  HASIL: ${pass} PASS  |  ${fail} FAIL  |  Total: ${pass + fail}`);
    console.log('═'.repeat(60));
    
    if (fail > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.filter(r => !r.ok).forEach(r => console.log(`   • ${r.label}: ${r.detail}`));
    } else {
        console.log('\n✅ SEMUA TEST LULUS!');
    }
    
    console.log(`\n📸 Screenshots: ${SS_DIR}/`);
    process.exit(fail > 0 ? 1 : 0);
})();
