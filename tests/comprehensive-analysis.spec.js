// Comprehensive Application Analysis - Headed Playwright Test
// Tests ALL pages and features systematically

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const CREDENTIALS = { username: 'fresh_user_11778919457', password: 'simulasi123' };
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

const results = { pass: [], fail: [], warn: [] };

function log(type, section, msg) {
    const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : '⚠️';
    console.log(`${prefix} [${section}] ${msg}`);
    results[type].push(`[${section}] ${msg}`);
}

async function loginAs(page, creds) {
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    await page.fill('#username', creds.username);
    await page.fill('#password', creds.password);
    await page.click('button[type="submit"]');
    // Wait for redirect to complete
    await page.waitForURL('**/dashboard.html', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
}

// Collect only errors from THIS page's own scripts (filter out cross-page noise)
function attachErrorCollector(page) {
    const errors = [];
    page.on('pageerror', e => {
        // Ignore errors from previous pages (network-level timing)
        errors.push(e.message.split('\n')[0]);
    });
    page.on('console', m => {
        if (m.type() === 'error') {
            const txt = m.text();
            // Only capture true JS errors, not 404s or network fetch on unloaded pages
            if (!txt.includes('favicon') && !txt.includes('net::ERR')) {
                errors.push(txt.split('\n')[0]);
            }
        }
    });
    return errors;
}

// ============================================================
// 1. LOGIN PAGE
// ============================================================
test('1. Halaman Login', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    log(title ? 'pass' : 'fail', 'Login', `Title: ${title}`);
    log(await page.locator('#username').isVisible() ? 'pass' : 'fail', 'Login', 'Input username terlihat');
    log(await page.locator('#password').isVisible() ? 'pass' : 'fail', 'Login', 'Input password terlihat');
    log(await page.locator('button[type="submit"]').isVisible() ? 'pass' : 'fail', 'Login', 'Tombol masuk terlihat');

    await page.fill('#username', CREDENTIALS.username);
    await page.fill('#password', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard.html', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    log(currentUrl.includes('dashboard') ? 'pass' : 'fail', 'Login', `Redirect ke: ${currentUrl}`);

    const fatalErrors = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors.length > 0) log('fail', 'Login', `JS Errors: ${fatalErrors[0]}`);
    else log('pass', 'Login', 'Tidak ada JS error fatal');
});

// ============================================================
// 2. DASHBOARD PESERTA
// ============================================================
test('2. Dashboard Peserta', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/dashboard.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    // Check navigation buttons
    const navButtons = [
        { selector: 'button:has-text("Mulai Ujian")', name: 'Tombol Mulai Ujian' },
        { selector: 'button:has-text("Riwayat")', name: 'Tombol Riwayat' },
        { selector: 'button:has-text("Peringkat")', name: 'Tombol Peringkat' },
        { selector: 'button:has-text("Pencapaian")', name: 'Tombol Pencapaian' },
        { selector: 'button:has-text("Profil")', name: 'Tombol Profil' },
        { selector: 'button:has-text("Keluar")', name: 'Tombol Keluar' },
    ];
    for (const btn of navButtons) {
        const visible = await page.locator(btn.selector).first().isVisible().catch(() => false);
        log(visible ? 'pass' : 'fail', 'Dashboard', `${btn.name}: ${visible ? 'ada' : 'TIDAK ADA'}`);
    }

    // Check stats
    const statsIds = ['totalExams', 'averageScore', 'userXP', 'userStreak'];
    for (const id of statsIds) {
        const el = page.locator(`#${id}`);
        const visible = await el.isVisible().catch(() => false);
        const text = visible ? await el.textContent() : 'N/A';
        const hasNaN = text.includes('NaN');
        log(hasNaN ? 'fail' : (visible ? 'pass' : 'warn'), 'Dashboard', `#${id} = "${text}"`);
    }

    // Check AI Assessment
    const readiness = await page.locator('#readinessScore').textContent().catch(() => 'N/A');
    const aiConf = await page.locator('#aiConfidence').textContent().catch(() => 'N/A');
    log(readiness.includes('NaN') ? 'fail' : 'pass', 'Dashboard', `readinessScore = "${readiness}"`);
    log(aiConf.includes('NaN') ? 'fail' : 'pass', 'Dashboard', `aiConfidence = "${aiConf}"`);

    // Check section cards
    const cards = ['Jalur Belajar', 'Lencana & Pencapaian', 'Papan Peringkat', 'Notifikasi', 'Pengaturan Notifikasi', 'Aktivitas Terakhir'];
    for (const card of cards) {
        const visible = await page.locator(`text=${card}`).first().isVisible().catch(() => false);
        log(visible ? 'pass' : 'warn', 'Dashboard', `Card "${card}": ${visible ? 'ada' : 'tidak ada'}`);
    }

    const fatalErrors2 = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors2.length > 0) log('fail', 'Dashboard', `JS Errors: ${fatalErrors2[0]}`);
    else log('pass', 'Dashboard', 'Tidak ada JS error fatal');
});

// ============================================================
// 3. HALAMAN UJIAN
// ============================================================
test('3. Halaman Ujian', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    const welcomeScreen = await page.locator('#welcomeScreen').isVisible().catch(() => false);
    log(welcomeScreen ? 'pass' : 'fail', 'Ujian', 'Welcome screen terlihat');

    const examTypeSelect = await page.locator('#examTypeSelection').isVisible().catch(() => false);
    log(examTypeSelect ? 'pass' : 'fail', 'Ujian', 'Dropdown jenis ujian terlihat');

    // Check exam types loaded
    const options = await page.locator('#examTypeSelection option').count().catch(() => 0);
    log(options > 1 ? 'pass' : 'warn', 'Ujian', `Jenis ujian dimuat: ${options} opsi`);

    const paketSelect = await page.locator('#paketSelection').isVisible().catch(() => false);
    log(paketSelect ? 'pass' : 'fail', 'Ujian', 'Dropdown paket ujian terlihat');

    const mulaiBtn = await page.locator('button:has-text("Mulai Ujian")').isVisible().catch(() => false);
    log(mulaiBtn ? 'pass' : 'fail', 'Ujian', 'Tombol Mulai Ujian terlihat');

    const latihanBtn = await page.locator('button:has-text("Mode Latihan")').isVisible().catch(() => false);
    log(latihanBtn ? 'pass' : 'fail', 'Ujian', 'Tombol Mode Latihan terlihat');

    const riwayatBtn = await page.locator('button:has-text("Riwayat Ujian")').isVisible().catch(() => false);
    log(riwayatBtn ? 'pass' : 'fail', 'Ujian', 'Tombol Riwayat Ujian terlihat');

    const fatalErrors3 = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors3.length > 0) log('fail', 'Ujian', `JS Errors: ${fatalErrors3[0]}`);
    else log('pass', 'Ujian', 'Tidak ada JS error fatal');
});

// ============================================================
// 4. HALAMAN PROFIL
// ============================================================
test('4. Halaman Profil', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/profile.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    const profileName = await page.locator('#profileName').textContent().catch(() => 'N/A');
    log(profileName && profileName !== 'Memuat...' ? 'pass' : 'warn', 'Profil', `Nama profil: "${profileName}"`);

    const profileIds = ['profileUsername', 'profileAvatar', 'statExams', 'statAvgScore', 'statXP', 'statStreak'];
    for (const id of profileIds) {
        const el = page.locator(`#${id}`);
        const visible = await el.isVisible().catch(() => false);
        const text = visible ? await el.textContent().catch(() => '') : 'N/A';
        log(visible ? 'pass' : 'fail', 'Profil', `#${id} = "${text}"`);
    }

    const editBtn = await page.locator('button:has-text("Edit Profil")').isVisible().catch(() => false);
    log(editBtn ? 'pass' : 'fail', 'Profil', 'Tombol Edit Profil');

    const logoutBtn = await page.locator('button:has-text("Keluar")').isVisible().catch(() => false);
    log(logoutBtn ? 'pass' : 'fail', 'Profil', 'Tombol Keluar');

    const fatalErrors4 = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors4.length > 0) log('fail', 'Profil', `JS Errors: ${fatalErrors4[0]}`);
    else log('pass', 'Profil', 'Tidak ada JS error fatal');
});

// ============================================================
// 5. HALAMAN MATERI
// ============================================================
test('5. Halaman Materi', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/materi.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    const heading = await page.locator('h1:has-text("Bahan Ajar")').isVisible().catch(() => false);
    log(heading ? 'pass' : 'fail', 'Materi', 'Judul Bahan Ajar');

    const filterKategori = await page.locator('#filterKategori').isVisible().catch(() => false);
    log(filterKategori ? 'pass' : 'fail', 'Materi', 'Filter Kategori');

    const materiGrid = await page.locator('#materialsGrid').isVisible().catch(() => false);
    log(materiGrid ? 'pass' : 'fail', 'Materi', 'Grid Materi');

    const fatalErrors5 = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors5.length > 0) log('fail', 'Materi', `JS Errors: ${fatalErrors5[0]}`);
    else log('pass', 'Materi', 'Tidak ada JS error fatal');
});

// ============================================================
// 6. HALAMAN LEADERBOARD
// ============================================================
test('6. Halaman Leaderboard', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/leaderboard.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    const heading = await page.locator('h1:has-text("Papan Peringkat")').isVisible().catch(() => false);
    log(heading ? 'pass' : 'fail', 'Leaderboard', 'Judul Papan Peringkat');

    const table = await page.locator('#leaderboardTableBody').isVisible().catch(() => false);
    log(table ? 'pass' : 'fail', 'Leaderboard', 'Tabel leaderboard');

    const myPosition = await page.locator('#myPositionContent').isVisible().catch(() => false);
    log(myPosition ? 'pass' : 'fail', 'Leaderboard', 'Posisi saya');

    const fatalErrors6 = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors6.length > 0) log('fail', 'Leaderboard', `JS Errors: ${fatalErrors6[0]}`);
    else log('pass', 'Leaderboard', 'Tidak ada JS error fatal');
});

// ============================================================
// 7. HALAMAN PENCAPAIAN
// ============================================================
test('7. Halaman Pencapaian', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/achievements.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    const heading = await page.locator('h1:has-text("Pencapaian")').isVisible().catch(() => false);
    log(heading ? 'pass' : 'fail', 'Pencapaian', 'Judul Pencapaian');

    const statsIds = ['totalBadges', 'completedAchievements', 'lockedAchievements', 'completionPercentage'];
    for (const id of statsIds) {
        const el = await page.locator(`#${id}`).isVisible().catch(() => false);
        log(el ? 'pass' : 'warn', 'Pencapaian', `#${id} terlihat`);
    }

    const fatalErrors7 = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors7.length > 0) log('fail', 'Pencapaian', `JS Errors: ${fatalErrors7[0]}`);
    else log('pass', 'Pencapaian', 'Tidak ada JS error fatal');
});

// ============================================================
// 8. ADMIN PANEL
// ============================================================
test('8. Admin Panel', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await loginAs(page, ADMIN_CREDENTIALS);
    await page.goto(`${BASE_URL}/admin/admin.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    const currentUrl = page.url();
    const isAdmin = currentUrl.includes('admin');
    log(isAdmin ? 'pass' : 'fail', 'Admin', `Redirect ke admin: ${currentUrl}`);

    const sidebar = await page.locator('.sidebar, #sidebar, nav').first().isVisible().catch(() => false);
    log(sidebar ? 'pass' : 'fail', 'Admin', 'Sidebar terlihat');

    // Check admin menu items
    const adminMenus = ['Dashboard', 'Soal', 'User Management', 'Partisipan', 'Kategori'];
    for (const menu of adminMenus) {
        const visible = await page.locator(`text=${menu}`).first().isVisible().catch(() => false);
        log(visible ? 'pass' : 'warn', 'Admin', `Menu "${menu}": ${visible ? 'ada' : 'tidak ada'}`);
    }

    const fatalErrors8 = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors8.length > 0) log('fail', 'Admin', `JS Errors: ${fatalErrors8[0]}`);
    else log('pass', 'Admin', 'Tidak ada JS error fatal');
});

// ============================================================
// 9. API ENDPOINTS
// ============================================================
test('9. API Endpoints', async ({ page }) => {
    const apis = [
        { url: `${BASE_URL}/api/auth.php?action=check_auth`, name: 'auth check', needsAuth: false },
        { url: `${BASE_URL}/api/soal.php?action=get_exam_types`, name: 'exam types', needsAuth: false },
        { url: `${BASE_URL}/api/gamification.php?action=get_leaderboard`, name: 'leaderboard', needsAuth: true },
    ];

    await loginAs(page, CREDENTIALS);
    await page.waitForURL('**/dashboard.html', { timeout: 10000 }).catch(() => {});

    const token = await page.evaluate(() => localStorage.getItem('authToken'));

    for (const api of apis) {
        const headers = api.needsAuth && token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await page.request.get(api.url, { headers }).catch(() => null);
        if (res) {
            const body = await res.text().catch(() => '');
            const isJson = body.startsWith('{') || body.startsWith('[');
            const ok = res.ok() || res.status() === 401;
            log(isJson ? 'pass' : 'warn', 'API', `${api.name}: HTTP ${res.status()} | JSON: ${isJson}`);
        } else {
            log('fail', 'API', `${api.name}: request gagal`);
        }
    }
});

// ============================================================
// 10. HALAMAN REGISTRASI
// ============================================================
test('10. Halaman Registrasi', async ({ page }) => {
    const errors = attachErrorCollector(page);

    await page.goto(`${BASE_URL}/participant/register.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const form = await page.locator('form, #registerForm').first().isVisible().catch(() => false);
    log(form ? 'pass' : 'fail', 'Register', 'Form registrasi terlihat');

    const fatalErrors10 = errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed'));
    if (fatalErrors10.length > 0) log('fail', 'Register', `JS Errors: ${fatalErrors10[0]}`);
    else log('pass', 'Register', 'Tidak ada JS error fatal');
});

// ============================================================
// SUMMARY
// ============================================================
test.afterAll(async () => {
    console.log('\n' + '='.repeat(60));
    console.log('  LAPORAN ANALISA KOMPREHENSIF APLIKASI');
    console.log('='.repeat(60));
    console.log(`✅ PASS: ${results.pass.length}`);
    console.log(`❌ FAIL: ${results.fail.length}`);
    console.log(`⚠️  WARN: ${results.warn.length}`);
    if (results.fail.length > 0) {
        console.log('\n❌ DAFTAR MASALAH:');
        results.fail.forEach(f => console.log('  - ' + f));
    }
    if (results.warn.length > 0) {
        console.log('\n⚠️  PERHATIAN:');
        results.warn.forEach(w => console.log('  - ' + w));
    }
    console.log('='.repeat(60));
});
