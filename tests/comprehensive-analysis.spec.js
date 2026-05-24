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
    await page.fill('#username', creds.username);
    await page.fill('#password', creds.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
}

// ============================================================
// 1. LOGIN PAGE
// ============================================================
test('1. Halaman Login', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');

    // Check elements
    const title = await page.title();
    log(title ? 'pass' : 'fail', 'Login', `Title: ${title}`);

    const usernameInput = await page.locator('#username').isVisible();
    log(usernameInput ? 'pass' : 'fail', 'Login', 'Input username terlihat');

    const passwordInput = await page.locator('#password').isVisible();
    log(passwordInput ? 'pass' : 'fail', 'Login', 'Input password terlihat');

    const submitBtn = await page.locator('button[type="submit"]').isVisible();
    log(submitBtn ? 'pass' : 'fail', 'Login', 'Tombol masuk terlihat');

    // Try login
    await page.fill('#username', CREDENTIALS.username);
    await page.fill('#password', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const loginSuccess = currentUrl.includes('dashboard');
    log(loginSuccess ? 'pass' : 'fail', 'Login', `Login peserta: redirect ke ${currentUrl}`);

    if (errors.length > 0) log('fail', 'Login', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Login', 'Tidak ada JS error');
});

// ============================================================
// 2. DASHBOARD PESERTA
// ============================================================
test('2. Dashboard Peserta', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/dashboard.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

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

    if (errors.length > 0) log('fail', 'Dashboard', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Dashboard', 'Tidak ada JS error');
});

// ============================================================
// 3. HALAMAN UJIAN
// ============================================================
test('3. Halaman Ujian', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

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

    if (errors.length > 0) log('fail', 'Ujian', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Ujian', 'Tidak ada JS error');
});

// ============================================================
// 4. HALAMAN PROFIL
// ============================================================
test('4. Halaman Profil', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/profile.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

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

    if (errors.length > 0) log('fail', 'Profil', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Profil', 'Tidak ada JS error');
});

// ============================================================
// 5. HALAMAN MATERI
// ============================================================
test('5. Halaman Materi', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/materi.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const heading = await page.locator('h1:has-text("Bahan Ajar")').isVisible().catch(() => false);
    log(heading ? 'pass' : 'fail', 'Materi', 'Judul Bahan Ajar');

    const filterKategori = await page.locator('#filterKategori').isVisible().catch(() => false);
    log(filterKategori ? 'pass' : 'fail', 'Materi', 'Filter Kategori');

    const materiGrid = await page.locator('#materialsGrid').isVisible().catch(() => false);
    log(materiGrid ? 'pass' : 'fail', 'Materi', 'Grid Materi');

    if (errors.length > 0) log('fail', 'Materi', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Materi', 'Tidak ada JS error');
});

// ============================================================
// 6. HALAMAN LEADERBOARD
// ============================================================
test('6. Halaman Leaderboard', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/leaderboard.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const heading = await page.locator('h1:has-text("Papan Peringkat")').isVisible().catch(() => false);
    log(heading ? 'pass' : 'fail', 'Leaderboard', 'Judul Papan Peringkat');

    const table = await page.locator('#leaderboardTableBody').isVisible().catch(() => false);
    log(table ? 'pass' : 'fail', 'Leaderboard', 'Tabel leaderboard');

    const myPosition = await page.locator('#myPositionContent').isVisible().catch(() => false);
    log(myPosition ? 'pass' : 'fail', 'Leaderboard', 'Posisi saya');

    if (errors.length > 0) log('fail', 'Leaderboard', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Leaderboard', 'Tidak ada JS error');
});

// ============================================================
// 7. HALAMAN PENCAPAIAN
// ============================================================
test('7. Halaman Pencapaian', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await loginAs(page, CREDENTIALS);
    await page.goto(`${BASE_URL}/participant/achievements.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const heading = await page.locator('h1:has-text("Pencapaian")').isVisible().catch(() => false);
    log(heading ? 'pass' : 'fail', 'Pencapaian', 'Judul Pencapaian');

    const statsIds = ['totalBadges', 'completedAchievements', 'lockedAchievements', 'completionPercentage'];
    for (const id of statsIds) {
        const el = await page.locator(`#${id}`).isVisible().catch(() => false);
        log(el ? 'pass' : 'warn', 'Pencapaian', `#${id} terlihat`);
    }

    if (errors.length > 0) log('fail', 'Pencapaian', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Pencapaian', 'Tidak ada JS error');
});

// ============================================================
// 8. ADMIN PANEL
// ============================================================
test('8. Admin Panel', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await loginAs(page, ADMIN_CREDENTIALS);
    await page.goto(`${BASE_URL}/admin/admin.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const isAdmin = currentUrl.includes('admin');
    log(isAdmin ? 'pass' : 'fail', 'Admin', `Redirect ke admin: ${currentUrl}`);

    const sidebar = await page.locator('.sidebar, #sidebar, nav').first().isVisible().catch(() => false);
    log(sidebar ? 'pass' : 'fail', 'Admin', 'Sidebar terlihat');

    // Check admin menu items
    const adminMenus = ['Dashboard', 'Soal', 'Pengguna', 'Peserta', 'Kategori'];
    for (const menu of adminMenus) {
        const visible = await page.locator(`text=${menu}`).first().isVisible().catch(() => false);
        log(visible ? 'pass' : 'warn', 'Admin', `Menu "${menu}": ${visible ? 'ada' : 'tidak ada'}`);
    }

    if (errors.length > 0) log('fail', 'Admin', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Admin', 'Tidak ada JS error');
});

// ============================================================
// 9. API ENDPOINTS
// ============================================================
test('9. API Endpoints', async ({ page }) => {
    // Test key API endpoints
    const apis = [
        { url: `${BASE_URL}/api/auth.php?action=check_auth`, name: 'auth check' },
        { url: `${BASE_URL}/api/soal.php?action=get_exam_types`, name: 'exam types' },
        { url: `${BASE_URL}/api/gamification.php?action=get_leaderboard`, name: 'leaderboard' },
    ];

    // First login to get token
    await page.goto(`${BASE_URL}/login.html`);
    await page.fill('#username', CREDENTIALS.username);
    await page.fill('#password', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    for (const api of apis) {
        const res = await page.request.get(api.url).catch(() => null);
        if (res) {
            const ok = res.ok();
            const body = await res.text().catch(() => '');
            const isJson = body.startsWith('{') || body.startsWith('[');
            log(ok && isJson ? 'pass' : 'warn', 'API', `${api.name}: HTTP ${res.status()} | JSON: ${isJson}`);
        } else {
            log('fail', 'API', `${api.name}: request gagal`);
        }
    }
});

// ============================================================
// 10. HALAMAN REGISTRASI
// ============================================================
test('10. Halaman Registrasi', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(`${BASE_URL}/participant/register.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const form = await page.locator('form, #registerForm').first().isVisible().catch(() => false);
    log(form ? 'pass' : 'fail', 'Register', 'Form registrasi terlihat');

    if (errors.length > 0) log('fail', 'Register', `JS Errors: ${errors.join('; ')}`);
    else log('pass', 'Register', 'Tidak ada JS error');
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
