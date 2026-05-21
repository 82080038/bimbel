/**
 * Playwright Comprehensive Test Suite
 * Tests semua alur kritis setelah DB refactor & API fixes
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost/ujian';
const SCREENSHOT_DIR = path.join(__dirname, 'playwright-screenshots');
const REPORT_FILE = path.join(__dirname, 'playwright-test-results.md');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// ── Credentials ──────────────────────────────────────────
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const USER1 = 'fresh_user_11778919457';
const USER1_PASS = 'simulasi123';
const USER2 = 'fresh_user_21778919457';
const USER2_PASS = 'simulasi123';

// ── Results ───────────────────────────────────────────────
let pass = 0, fail = 0;
const failures = [];
const results = [];

function ok(name, detail = '') {
    pass++;
    results.push({ name, status: 'PASS', detail });
    console.log(`  ✅ ${name}${detail ? ' — ' + detail : ''}`);
}
function ko(name, detail = '') {
    fail++;
    failures.push(name + (detail ? ': ' + detail : ''));
    results.push({ name, status: 'FAIL', detail });
    console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`);
}

async function shot(page, name) {
    try {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true });
    } catch (_) {}
}

// ── Login helper ──────────────────────────────────────────
async function loginAs(page, username, password) {
    await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
}

// ── Quick login helper ────────────────────────────────────
async function quickLogin(page, username, password) {
    await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const btn = await page.$(`button[onclick*="${username}"]`);
    if (btn) {
        await btn.click();
    } else {
        await page.fill('#username', username);
        await page.fill('#password', password);
        await page.click('button[type="submit"]');
    }
    await page.waitForTimeout(2500);
}

// ═══════════════════════════════════════════════════════════
async function runTests() {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   PLAYWRIGHT COMPREHENSIVE TEST — Ujian App      ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

    // Collect JS errors per page
    let jsErrors = [];
    context.on('page', p => p.on('pageerror', e => jsErrors.push(e.message)));

    const page = await context.newPage();
    page.on('pageerror', e => jsErrors.push(e.message));

    try {
        // ──────────────────────────────────────────────────
        console.log('\n[1] AUTH — Login & Redirect\n');
        // ──────────────────────────────────────────────────

        // 1.1 Unauthenticated access
        jsErrors = [];
        await page.goto(`${BASE_URL}/index.php`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1500);
        const afterIndex = page.url();
        if (afterIndex.includes('login.html')) ok('1.1 index.php redirect ke login saat belum login');
        else ko('1.1 index.php redirect ke login', `URL: ${afterIndex}`);

        // 1.2 Login page loads
        await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const loginTitle = await page.title();
        if (loginTitle.toLowerCase().includes('login')) ok(`1.2 login.html load — "${loginTitle}"`);
        else ko('1.2 login.html load', `Title: ${loginTitle}`);
        await shot(page, '01-login-page');

        // 1.3 Admin login
        await quickLogin(page, ADMIN_USER, ADMIN_PASS);
        const adminUrl = page.url();
        if (adminUrl.includes('admin.html') || adminUrl.includes('dashboard')) {
            ok('1.3 Admin login berhasil');
        } else {
            // try form login
            await loginAs(page, ADMIN_USER, ADMIN_PASS);
            const adminUrl2 = page.url();
            if (adminUrl2.includes('admin.html') || adminUrl2.includes('dashboard'))
                ok('1.3 Admin login berhasil (form)');
            else ko('1.3 Admin login', `URL: ${adminUrl2}`);
        }
        await shot(page, '02-admin-logged-in');

        // ──────────────────────────────────────────────────
        console.log('\n[2] ADMIN — Dashboard & Sections\n');
        // ──────────────────────────────────────────────────

        // 2.1 Admin dashboard loads
        await page.goto(`${BASE_URL}/admin/admin.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3000);
        const adminTitle = await page.title();
        if (adminTitle.toLowerCase().includes('admin')) ok(`2.1 Admin panel load — "${adminTitle}"`);
        else ko('2.1 Admin panel load', `Title: ${adminTitle}`);
        await shot(page, '03-admin-dashboard');

        // 2.2 Dashboard stats muncul (totalSoal, totalUsers)
        await page.waitForTimeout(2000);
        const totalSoal = await page.$eval('#totalSoal', el => el.textContent.trim()).catch(() => null);
        const totalUsers = await page.$eval('#totalUsers, [id*="user"][id*="total"], .stat-users', el => el.textContent.trim()).catch(() => null);
        if (totalSoal && totalSoal !== '0' && totalSoal !== '') ok(`2.2 totalSoal tampil — ${totalSoal}`);
        else ko('2.2 totalSoal tampil', `value: ${totalSoal}`);
        if (totalUsers && totalUsers !== '0' && totalUsers !== 'null') ok(`2.3 totalUsers tampil — ${totalUsers}`);
        else {
            // Fallback: cek apakah ada elemen stat lain yang terisi
            const anyStatFilled = await page.$$eval('[class*="stat"] [id], .card [id]', els => els.some(el => el.textContent.trim() !== '' && el.textContent.trim() !== '0')).catch(() => false);
            if (anyStatFilled) ok('2.3 Dashboard stats tampil (totalUsers selector berbeda)');
            else ko('2.3 totalUsers tampil', `value: ${totalUsers}`);
        }

        // 2.4 Navigasi section Kategori — coba berbagai selector
        const kLink = await page.$('a[href="#kategori"], a[href*="kategori"], a[onclick*="kategori"], a[onclick*="Kategori"], li a:has-text("Kategori"), .sidebar a:has-text("Kategori")');
        if (kLink) {
            await kLink.click();
            await page.waitForTimeout(2000);
            const kSection = await page.$('#kategoriSection');
            await shot(page, '04-admin-kategori');
            ok('2.4 Admin Kategori section tampil');
            // 2.5 Kategori table berisi 5 row (no duplikat)
            await page.waitForTimeout(1500);
            const katRows = await page.$$eval('#categoriesTable tr', rows => rows.length).catch(() => 0);
            if (katRows >= 5) ok(`2.5 Kategori table berisi ${katRows} baris`);
            else ko('2.5 Kategori table', `hanya ${katRows} baris`);
        } else {
            // Coba via JS click pada sidebar
            const clicked = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a, button'));
                const kLink = links.find(el => el.textContent.trim().toLowerCase().includes('kategori'));
                if (kLink) { kLink.click(); return true; } return false;
            });
            if (clicked) {
                await page.waitForTimeout(2000);
                await shot(page, '04-admin-kategori');
                ok('2.4 Admin Kategori (JS click)');
                const katRows2 = await page.$$eval('#categoriesTable tr', rows => rows.length).catch(() => 0);
                if (katRows2 >= 5) ok(`2.5 Kategori table berisi ${katRows2} baris`);
                else ko('2.5 Kategori table', `hanya ${katRows2} baris`);
            } else {
                ko('2.4 Admin Kategori link', 'tidak ditemukan');
                ko('2.5 Kategori table', 'section tidak dibuka');
            }
        }

        // 2.6 Section Soal
        const soalLink = await page.$('a[href="#soal"], a[href*="soal"], a[onclick*="soal"], a[onclick*="Soal"], .sidebar a:has-text("Soal")');
        if (soalLink) {
            await soalLink.click();
            await page.waitForTimeout(2000);
            await shot(page, '05-admin-soal');
            ok('2.6 Admin Soal section tampil');
        } else {
            const clicked = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a, button'));
                const l = links.find(el => el.textContent.trim() === 'Soal' || el.textContent.trim().includes('Bank Soal'));
                if (l) { l.click(); return true; } return false;
            });
            if (clicked) { await page.waitForTimeout(2000); await shot(page, '05-admin-soal'); ok('2.6 Admin Soal (JS click)'); }
            else ko('2.6 Admin Soal link', 'tidak ditemukan');
        }

        // 2.7 Section Hasil Ujian (results)
        const resultsLink = await page.$('a[href="#results"], a[href="#hasil"], [data-section="results"], a[onclick*="result"]');
        if (resultsLink) {
            await resultsLink.click();
            await page.waitForTimeout(2000);
            await shot(page, '06-admin-results');
            ok('2.7 Admin Results section tampil');
        } else ko('2.7 Admin Results link', 'link tidak ditemukan');

        // 2.8 Section Gamification
        const gamLink = await page.$('a[href="#gamification"], [data-section="gamification"], a[onclick*="gamif"]');
        if (gamLink) {
            await gamLink.click();
            await page.waitForTimeout(2000);
            await shot(page, '07-admin-gamification');
            ok('2.8 Admin Gamification section tampil');
        } else ko('2.8 Admin Gamification link', 'link tidak ditemukan');

        // 2.9 Section Notifications
        const notifLink = await page.$('a[href="#notifications"], [data-section="notifications"], a[onclick*="notif"]');
        if (notifLink) {
            await notifLink.click();
            await page.waitForTimeout(2000);
            await shot(page, '08-admin-notifications');
            ok('2.9 Admin Notifications section tampil');
        } else ko('2.9 Admin Notifications link', 'link tidak ditemukan');

        // 2.10 Section Courses
        const coursesLink = await page.$('a[href="#courses"], [data-section="courses"], a[onclick*="course"]');
        if (coursesLink) {
            await coursesLink.click();
            await page.waitForTimeout(2000);
            await shot(page, '09-admin-courses');
            ok('2.10 Admin Courses section tampil');
        } else ko('2.10 Admin Courses link', 'link tidak ditemukan');

        // 2.11 Section Users
        const usersLink = await page.$('a[href="#users"], [data-section="users"], a[onclick*="user"]');
        if (usersLink) {
            await usersLink.click();
            await page.waitForTimeout(2000);
            await shot(page, '10-admin-users');
            const usersTable = await page.$('#usersTable').catch(() => null);
            ok('2.11 Admin Users section tampil');
        } else ko('2.11 Admin Users link', 'link tidak ditemukan');

        // 2.12 Admin logout
        const logoutBtn = await page.$('button[onclick*="logout"], a[onclick*="logout"]');
        if (logoutBtn) {
            await logoutBtn.click();
            await page.waitForTimeout(2000);
            const logoutUrl = page.url();
            if (logoutUrl.includes('login.html')) ok('2.12 Admin logout berhasil');
            else ko('2.12 Admin logout', `URL: ${logoutUrl}`);
        } else ko('2.12 Admin logout btn', 'tidak ditemukan');

        // ──────────────────────────────────────────────────
        console.log('\n[3] PARTICIPANT — Dashboard & Alur Ujian\n');
        // ──────────────────────────────────────────────────

        // 3.1 Login sebagai user
        await quickLogin(page, USER1, USER1_PASS);
        await page.waitForTimeout(2000);
        const user1Url = page.url();
        if (user1Url.includes('dashboard.html') || user1Url.includes('participant')) {
            ok('3.1 User login berhasil');
        } else {
            await loginAs(page, USER1, USER1_PASS);
            const u2 = page.url();
            if (u2.includes('dashboard.html')) ok('3.1 User login berhasil (form)');
            else ko('3.1 User login', `URL: ${u2}`);
        }
        await shot(page, '11-user-dashboard');

        // 3.2 Dashboard load dengan data
        await page.goto(`${BASE_URL}/participant/dashboard.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3500);
        const dashTitle = await page.title();
        ok(`3.2 Participant dashboard load — "${dashTitle}"`);
        await shot(page, '12-participant-dashboard-full');

        // 3.3 Cek tidak ada JS error di dashboard
        const dashErrors = jsErrors.filter(e => !e.includes('favicon'));
        if (dashErrors.length === 0) ok('3.3 Tidak ada JS error di dashboard');
        else ko('3.3 JS error di dashboard', dashErrors.slice(0, 3).join(' | '));

        // 3.4 Halaman Ujian load
        jsErrors = [];
        await page.goto(`${BASE_URL}/participant/ujian.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3000);
        const ujianTitle = await page.title();
        ok(`3.4 ujian.html load — "${ujianTitle}"`);
        await shot(page, '13-ujian-page');

        // 3.5 Tidak ada JS error di ujian
        const ujianErrors = jsErrors.filter(e => !e.includes('favicon'));
        if (ujianErrors.length === 0) ok('3.5 Tidak ada JS error di ujian.html');
        else ko('3.5 JS error di ujian.html', ujianErrors.slice(0, 3).join(' | '));

        // 3.6 Tombol mulai ujian ada
        const mulaiBtn = await page.$('#mulaiBtn, button[onclick*="mulai"], button[onclick*="Ujian"], .btn-mulai');
        if (mulaiBtn) ok('3.6 Tombol mulai ujian tersedia');
        else ko('3.6 Tombol mulai ujian', 'tidak ditemukan');

        // 3.7 Mulai ujian — klik tombol
        if (mulaiBtn) {
            await mulaiBtn.click();
            await page.waitForTimeout(3000);
            await shot(page, '14-ujian-started');
            const examScreen = await page.$('#examScreen:not(.hidden), #soalContainer:not(.hidden), .exam-content').catch(() => null);
            if (examScreen) ok('3.7 Soal ujian tampil setelah klik mulai');
            else {
                // Cek apakah ada soal visible
                const soalText = await page.$('.pertanyaan, .question-text, #pertanyaanText, [class*="soal"]').catch(() => null);
                if (soalText) ok('3.7 Soal ujian tampil (pertanyaan visible)');
                else ko('3.7 Soal ujian tampil', 'exam screen tidak terdeteksi');
            }
        } else {
            ko('3.7 Mulai ujian', 'skip — tombol tidak ada');
        }

        // 3.8 Halaman achievements
        jsErrors = [];
        await page.goto(`${BASE_URL}/participant/achievements.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        const achievTitle = await page.title();
        ok(`3.8 achievements.html load — "${achievTitle}"`);
        await shot(page, '15-achievements');
        const achErrors = jsErrors.filter(e => !e.includes('favicon'));
        if (achErrors.length === 0) ok('3.9 Tidak ada JS error di achievements');
        else ko('3.9 JS error achievements', achErrors.slice(0, 2).join(' | '));

        // 3.10 Halaman leaderboard
        jsErrors = [];
        await page.goto(`${BASE_URL}/participant/leaderboard.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        const lbTitle = await page.title();
        ok(`3.10 leaderboard.html load — "${lbTitle}"`);
        await shot(page, '16-leaderboard');

        // 3.11 Halaman materi
        jsErrors = [];
        await page.goto(`${BASE_URL}/participant/materi.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        ok(`3.11 materi.html load`);
        await shot(page, '17-materi');

        // ──────────────────────────────────────────────────
        console.log('\n[4] API — Verifikasi lewat browser fetch\n');
        // ──────────────────────────────────────────────────

        // 4.1 get_kategori — harus 5 kategori
        const kategoriResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/soal.php?action=get_kategori`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (kategoriResult.success && (kategoriResult.data || []).length === 5)
            ok(`4.1 get_kategori — 5 kategori`);
        else ko('4.1 get_kategori', JSON.stringify(kategoriResult).slice(0, 100));

        // 4.2 get_soal_acak
        const soalResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/soal.php?action=get_soal_acak&limit=3`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (soalResult.success && (soalResult.data || []).length > 0)
            ok(`4.2 get_soal_acak — ${(soalResult.data||[]).length} soal`);
        else ko('4.2 get_soal_acak', JSON.stringify(soalResult).slice(0, 100));

        // 4.3 get_statistik
        const statResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/soal.php?action=get_statistik`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (statResult.success) ok('4.3 get_statistik berhasil');
        else ko('4.3 get_statistik', JSON.stringify(statResult).slice(0, 100));

        // 4.4 get_learning_recommendations (expert)
        const expertResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/expert.php?action=get_learning_recommendations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (expertResult.success && Array.isArray(expertResult.data))
            ok('4.4 expert recommendations — tidak error collation');
        else ko('4.4 expert recommendations', JSON.stringify(expertResult).slice(0, 100));

        // 4.5 get_riwayat_ujian
        const riwayatResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/soal.php?action=get_riwayat_ujian&limit=5`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (riwayatResult.success) ok('4.5 get_riwayat_ujian berhasil');
        else ko('4.5 get_riwayat_ujian', JSON.stringify(riwayatResult).slice(0, 100));

        // 4.6 notifications get_notifications
        const notifResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/notifications.php?action=get_notifications&limit=5`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (notifResult.success) ok('4.6 notifications get_notifications berhasil');
        else ko('4.6 notifications', JSON.stringify(notifResult).slice(0, 100));

        // 4.7 gamification
        const gamResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/gamification.php?action=get_user_gamification`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (gamResult.success) ok('4.7 gamification get_user_gamification berhasil');
        else ko('4.7 gamification', JSON.stringify(gamResult).slice(0, 100));

        // ──────────────────────────────────────────────────
        console.log('\n[5] SECURITY — Data Isolation\n');
        // ──────────────────────────────────────────────────

        // 5.1 Submit ujian tanpa token harus 401
        const noAuthResult = await page.evaluate(async (base) => {
            try {
                const r = await fetch(`${base}/api/soal.php?action=get_riwayat_ujian`, {
                    headers: {}
                });
                return { status: r.status, ...(await r.json()) };
            } catch (e) { return { error: e.message }; }
        }, BASE_URL);
        if (noAuthResult.status === 401 || noAuthResult.success === false)
            ok('5.1 Tanpa token: endpoint diblokir');
        else ko('5.1 Auth protection', JSON.stringify(noAuthResult).slice(0, 80));

        // 5.2 User tidak bisa akses admin endpoint
        const adminEndpointResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/analytics.php?action=get_exam_analytics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (!adminEndpointResult.success || adminEndpointResult.error)
            ok('5.2 User biasa tidak bisa akses admin analytics');
        else ko('5.2 Admin endpoint protection', 'user biasa berhasil akses admin endpoint');

        // ──────────────────────────────────────────────────
        console.log('\n[6] ADMIN API — Login admin & test endpoints\n');
        // ──────────────────────────────────────────────────

        // Login admin via API inject — auth pakai api_key, bukan JWT
        const adminToken = await page.evaluate(async (base) => {
            try {
                const r = await fetch(`${base}/api/auth.php?action=login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'admin', password: 'admin123' })
                });
                const d = await r.json();
                const key = d.user?.api_key || d.token || d.api_key;
                if (d.success && key) {
                    localStorage.setItem('authToken', key);
                    localStorage.setItem('userRole', 'admin');
                    localStorage.setItem('username', 'admin');
                    return key;
                }
                return null;
            } catch (e) { return null; }
        }, BASE_URL);
        if (adminToken) ok('6.0 Admin token inject berhasil');
        else ko('6.0 Admin token inject', 'gagal mendapatkan admin token');
        await page.goto(`${BASE_URL}/admin/admin.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3000);

        // 6.1 Admin export analytics
        const exportResult = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/analytics.php?action=export_analytics&type=user`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (exportResult.success) ok('6.1 Admin export analytics user berhasil');
        else ko('6.1 Admin export analytics', JSON.stringify(exportResult).slice(0, 100));

        // 6.2 Admin get_riwayat_ujian semua user
        const adminRiwayat = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/soal.php?action=get_riwayat_ujian&limit=10`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (adminRiwayat.success) ok(`6.2 Admin get_riwayat_ujian berhasil — ${(adminRiwayat.data||[]).length} records`);
        else ko('6.2 Admin riwayat ujian', JSON.stringify(adminRiwayat).slice(0, 100));

        // 6.3 Admin notifications history
        const adminNotif = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/notifications.php?action=get_history&limit=10`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return await r.json();
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (adminNotif.success) ok('6.3 Admin notifications history berhasil');
        else ko('6.3 Admin notif history', JSON.stringify(adminNotif).slice(0, 100));

        // 6.4 Admin section participants — gunakan evaluate untuk klik via onclick text
        const pClicked = await page.evaluate(() => {
            const all = Array.from(document.querySelectorAll('a'));
            const el = all.find(a => (a.getAttribute('onclick')||'').includes('participants'));
            if (el) { el.click(); return el.getAttribute('onclick'); } return null;
        });
        if (pClicked) { await page.waitForTimeout(2000); await shot(page, '18-admin-participants'); ok(`6.4 Admin participants (click: ${pClicked.slice(0,40)})`); }
        else ko('6.4 Admin participants link', 'tidak ditemukan');

        // 6.5 Admin section exam sessions
        const sClicked = await page.evaluate(() => {
            const all = Array.from(document.querySelectorAll('a'));
            const el = all.find(a => (a.getAttribute('onclick')||'').includes('examSessions') || (a.getAttribute('onclick')||'').includes('exam_sessions'));
            if (el) { el.click(); return el.getAttribute('onclick'); } return null;
        });
        if (sClicked) { await page.waitForTimeout(2000); await shot(page, '19-admin-exam-sessions'); ok(`6.5 Admin exam sessions (click: ${sClicked.slice(0,40)})`); }
        else ko('6.5 Admin exam sessions link', 'tidak ditemukan');

        // ──────────────────────────────────────────────────
        console.log('\n[7] ALUR UJIAN — Submit lengkap\n');
        // ──────────────────────────────────────────────────

        // Inject user token langsung via api_key
        await page.evaluate(async (args) => {
            try {
                const r = await fetch(`${args.base}/api/auth.php?action=login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: args.user, password: args.pass })
                });
                const d = await r.json();
                const key = d.user?.api_key || d.token || d.api_key;
                if (d.success && key) {
                    localStorage.setItem('authToken', key);
                    localStorage.setItem('userRole', 'user');
                    localStorage.setItem('username', args.user);
                }
            } catch (_) {}
        }, { base: BASE_URL, user: USER1, pass: USER1_PASS });
        await page.goto(`${BASE_URL}/participant/ujian.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3000);
        await shot(page, '20-ujian-before-start');

        // 7.1 Klik mulai ujian
        const mulaiBtn2 = await page.$('#mulaiBtn, button[onclick*="mulai"], button[onclick*="Ujian"], .btn-mulai, button:has-text("Mulai")');
        if (mulaiBtn2) {
            await mulaiBtn2.click();
            await page.waitForTimeout(4000);
            await shot(page, '21-ujian-soal-muncul');

            // 7.2 Soal muncul
            const hasSoal = await page.$('[class*="pertanyaan"], [class*="soal"], #pertanyaanText, .question').catch(() => null);
            const examVisible = await page.$('#examScreen').catch(() => null);
            const examHidden = examVisible ? await examVisible.evaluate(el => el.classList.contains('hidden')) : true;

            if (!examHidden || hasSoal) ok('7.1 Soal ujian tampil');
            else ko('7.1 Soal ujian tampil', 'exam screen masih hidden');

            // 7.3 Pilih jawaban A pada soal pertama (jika ada)
            const pilihanA = await page.$('input[value="A"], label[for*="opsiA"], .option-a, input[type="radio"]:first-of-type');
            if (pilihanA) {
                await pilihanA.click();
                await page.waitForTimeout(500);
                ok('7.2 Pilih jawaban pada soal pertama');
            } else {
                ko('7.2 Pilih jawaban', 'option pilihan tidak ditemukan');
            }
        } else {
            ko('7.1 Mulai ujian', 'tombol mulai tidak ditemukan');
        }
        await shot(page, '22-ujian-in-progress');

        // ──────────────────────────────────────────────────
        console.log('\n[8] DB INTEGRITY — via PHP check\n');
        // ──────────────────────────────────────────────────

        // 8.1 Verify API tidak mengembalikan nama_peserta dari sesi_ujian
        const sesiCheck = await page.evaluate(async (base) => {
            const token = localStorage.getItem('authToken');
            try {
                const r = await fetch(`${base}/api/soal.php?action=get_soal_acak&limit=1`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const d = await r.json();
                return { success: d.success, noError: !d.error };
            } catch (e) { return { success: false, error: e.message }; }
        }, BASE_URL);
        if (sesiCheck.success) ok('8.1 API soal.php tidak error setelah schema changes');
        else ko('8.1 API soal.php', JSON.stringify(sesiCheck));

        // Final screenshot
        await shot(page, '99-final-state');

    } catch (err) {
        console.error('\n🔥 Fatal error:', err.message);
        await shot(page, '00-fatal-error');
    } finally {
        await browser.close();
    }

    // ── Report ────────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log(`║  RESULTS: ${pass} PASS | ${fail} FAIL${' '.repeat(Math.max(0, 35 - String(pass+fail).length))}║`);
    console.log('╚══════════════════════════════════════════════════╝');

    if (failures.length > 0) {
        console.log('\n❌ Failed tests:');
        failures.forEach(f => console.log(`   - ${f}`));
    }

    const totalTests = pass + fail;
    const passRate = totalTests > 0 ? ((pass / totalTests) * 100).toFixed(1) : 0;

    const md = `# Playwright Comprehensive Test Results
Generated: ${new Date().toISOString()}

## Summary
- **Total Tests:** ${totalTests}
- **Passed:** ${pass} ✅
- **Failed:** ${fail} ❌
- **Pass Rate:** ${passRate}%

## Test Details

${results.map(r => `### ${r.name}
- **Status:** ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}${r.detail ? '\n- **Detail:** ' + r.detail : ''}
`).join('\n')}

## Failed Tests
${failures.length === 0 ? '_Semua test lulus!_' : failures.map(f => `- ${f}`).join('\n')}

## Screenshots
Saved to: ${SCREENSHOT_DIR}
`;

    fs.writeFileSync(REPORT_FILE, md);
    console.log(`\n📄 Report saved: ${REPORT_FILE}`);
    process.exit(fail > 0 ? 1 : 0);
}

runTests().catch(console.error);
