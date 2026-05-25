// ============================================================
// FULL FUNCTIONAL TEST - Semua Fungsi & Link per Halaman
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const CREDS = { username: 'fresh_user_11778919457', password: 'simulasi123' };
const ADMIN = { username: 'admin', password: 'admin123' };

const R = { pass: [], fail: [], warn: [] };
function log(t, s, m) {
    const p = t === 'pass' ? '✅' : t === 'fail' ? '❌' : '⚠️';
    console.log(`${p} [${s}] ${m}`);
    R[t].push(`[${s}] ${m}`);
}

async function loginAs(page, creds) {
    try {
        await page.goto(`${BASE_URL}/login.html`, { timeout: 30000, waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
        await page.fill('#username', creds.username);
        await page.fill('#password', creds.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard.html', { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(500);
    } catch (e) {
        console.log('Login error:', e.message);
        throw e;
    }
}

function fatalErrors(page) {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message.split('\n')[0]));
    return { 
        get list() { 
            return errors.filter(e => !e.includes('Failed to fetch') && !e.includes('TypeError: Failed')); 
        } 
    };
}

// ==============================================================
// TEST 1: LOGIN - semua fungsi & validasi
// ==============================================================
test('1. Login: semua fungsi & validasi', async ({ page }) => {
    const err = fatalErrors(page);
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');

    // 1a. Login dengan data kosong
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    const emptyAlert = await page.locator('.alert, .error, [class*="error"], [class*="alert"]').first().isVisible().catch(() => false);
    const requiredVal = await page.locator('#username:invalid, #password:invalid').count().catch(() => 0);
    log(emptyAlert || requiredVal > 0 ? 'pass' : 'warn', 'Login', 'Validasi form kosong');

    // 1b. Login dengan password salah
    await page.fill('#username', CREDS.username);
    await page.fill('#password', 'wrongpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const stillOnLogin = page.url().includes('login');
    log(stillOnLogin ? 'pass' : 'fail', 'Login', 'Tolak password salah (tetap di login)');

    // 1c. Login berhasil
    await page.fill('#username', CREDS.username);
    await page.fill('#password', CREDS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard.html', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    log(page.url().includes('dashboard') ? 'pass' : 'fail', 'Login', 'Login berhasil → redirect dashboard');

    // 1d. Akses login.html saat sudah login → redirect ke dashboard
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForTimeout(2000);
    const redirectedBack = page.url().includes('dashboard');
    log(redirectedBack ? 'pass' : 'warn', 'Login', 'Sudah login → redirect ke dashboard');

    if (err.list.length > 0) log('fail', 'Login', `Fatal JS: ${err.list[0]}`);
    else log('pass', 'Login', 'Tidak ada JS error fatal');
});

// ==============================================================
// TEST 2: DASHBOARD - semua tombol, link, card, navigasi
// ==============================================================
test('2. Dashboard: semua tombol & navigasi', async ({ page }) => {
    const err = fatalErrors(page);
    await loginAs(page, CREDS);
    await page.goto(`${BASE_URL}/participant/dashboard.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    // 2a. Tombol "Mulai Ujian" → ke ujian.html
    await page.click('button:has-text("Mulai Ujian")');
    await page.waitForTimeout(2000);
    log(page.url().includes('ujian') ? 'pass' : 'fail', 'Dashboard', 'Tombol "Mulai Ujian" → ujian.html');
    await page.goBack(); await page.waitForTimeout(2000);

    // 2b. Tombol "Riwayat" → ke ujian.html?action=history
    await page.click('button:has-text("Riwayat")');
    await page.waitForTimeout(2000);
    log(page.url().includes('ujian') ? 'pass' : 'fail', 'Dashboard', 'Tombol "Riwayat" → ujian.html (history)');
    await page.goBack(); await page.waitForTimeout(2000);

    // 2c. Tombol "Peringkat" → leaderboard.html
    await page.click('button:has-text("Peringkat")');
    await page.waitForTimeout(2000);
    log(page.url().includes('leaderboard') ? 'pass' : 'fail', 'Dashboard', 'Tombol "Peringkat" → leaderboard.html');
    await page.goBack(); await page.waitForTimeout(2000);

    // 2d. Tombol "Pencapaian" → achievements.html
    await page.click('button:has-text("Pencapaian")');
    await page.waitForTimeout(2000);
    log(page.url().includes('achievements') ? 'pass' : 'fail', 'Dashboard', 'Tombol "Pencapaian" → achievements.html');
    await page.goBack().catch(() => {});
    await page.waitForTimeout(1000);

    // 2e. Tombol "Profil" → profile.html
    await page.click('button:has-text("Profil")');
    await page.waitForTimeout(500);
    log(page.url().includes('profile') ? 'pass' : 'fail', 'Dashboard', 'Tombol "Profil" → profile.html');
    // Skip goBack to avoid timeout, navigate back to dashboard directly
    await page.goto(`${BASE_URL}/participant/dashboard.html`, { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // 2f. Aksesibilitas menu toggle
    await page.click('button[aria-label="Menu aksesibilitas"]');
    await page.waitForTimeout(500);
    const accMenu = await page.locator('#accessibilityMenu').isVisible().catch(() => false);
    log(accMenu ? 'pass' : 'fail', 'Dashboard', 'Accessibility menu terbuka');
    await page.click('button[aria-label="Menu aksesibilitas"]');

    // 2g. Card "Papan Peringkat" → link "Lihat Semua"
    const leaderLink = await page.locator('a[href="leaderboard.html"]').first().isVisible().catch(() => false);
    log(leaderLink ? 'pass' : 'fail', 'Dashboard', 'Link "Lihat Semua" Papan Peringkat ada');

    // 2h. Card "Lencana & Pencapaian" → link "Lihat Semua"
    const achLink = await page.locator('a[href="achievements.html"]').first().isVisible().catch(() => false);
    log(achLink ? 'pass' : 'fail', 'Dashboard', 'Link "Lihat Semua" Pencapaian ada');

    // 2i. Mobile nav links
    const mobileLinks = [
        { href: 'dashboard.html', label: 'Mobile nav: Beranda' },
        { href: 'ujian.html', label: 'Mobile nav: Ujian' },
        { href: 'materi.html', label: 'Mobile nav: Materi' },
        { href: 'leaderboard.html', label: 'Mobile nav: Peringkat' },
        { href: 'profile.html', label: 'Mobile nav: Profil' },
    ];
    for (const link of mobileLinks) {
        const exists = await page.locator(`.mobile-bottom-nav a[href="${link.href}"]`).count().catch(() => 0);
        log(exists > 0 ? 'pass' : 'fail', 'Dashboard', `${link.label}: ${exists > 0 ? 'ada' : 'TIDAK ADA'}`);
    }

    // 2j. Tombol "Keluar" → logout → kembali ke login
    await page.click('button:has-text("Keluar")');
    await page.waitForTimeout(2000);
    log(page.url().includes('login') ? 'pass' : 'fail', 'Dashboard', 'Tombol Keluar → login.html');
});

// ==============================================================
// TEST 3: UJIAN - fungsi select, start, mode latihan, riwayat
// ==============================================================
test('3. Ujian: fungsi pilih & mulai', async ({ page }) => {
    const err = fatalErrors(page);
    await loginAs(page, CREDS);
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    // 3a. Pilih jenis ujian → paket ter-load
    const examTypes = await page.locator('#examTypeSelection option').count();
    log(examTypes > 1 ? 'pass' : 'fail', 'Ujian', `Jenis ujian tersedia: ${examTypes - 1} jenis`);

    await page.selectOption('#examTypeSelection', { index: 1 });
    await page.waitForTimeout(3000);
    const paketEnabled = await page.locator('#paketSelection:not([disabled])').isVisible().catch(() => false);
    log(paketEnabled ? 'pass' : 'warn', 'Ujian', 'Setelah pilih jenis → dropdown paket aktif');

    const paketOptions = await page.locator('#paketSelection option').count();
    log(paketOptions > 0 ? 'pass' : 'warn', 'Ujian', `Paket ujian tersedia: ${paketOptions} opsi`);

    // 3b. Mulai ujian tanpa memilih paket → peringatan
    await page.selectOption('#examTypeSelection', '');
    await page.click('button:has-text("Mulai Ujian")');
    await page.waitForTimeout(1000);
    const stillWelcome = await page.locator('#welcomeScreen').isVisible().catch(() => false);
    log(stillWelcome ? 'pass' : 'warn', 'Ujian', 'Mulai tanpa pilihan → tetap di welcome screen');

    // 3c. Tombol Riwayat Ujian → buka layar riwayat
    const riwayatBtn = await page.locator('button:has-text("Riwayat Ujian")').isVisible().catch(() => false);
    if (riwayatBtn) {
        await page.click('button:has-text("Riwayat Ujian")');
        await page.waitForTimeout(2000);
        const historyVisible = await page.locator('#historyScreen, [id*="history"]').first().isVisible().catch(() => false);
        log(historyVisible ? 'pass' : 'warn', 'Ujian', 'Tombol Riwayat Ujian → historyScreen tampil');
    } else {
        log('warn', 'Ujian', 'Tombol Riwayat Ujian tidak terlihat (mungkin di state berbeda)');
    }

    // 3d. Dark mode toggle
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const darkBtn = await page.locator('button.dark-mode-toggle').isVisible().catch(() => false);
    log(darkBtn ? 'pass' : 'warn', 'Ujian', 'Tombol dark mode ada');
    if (darkBtn) {
        await page.click('button.dark-mode-toggle');
        await page.waitForTimeout(500);
        const isDark = await page.locator('body.dark-mode, html.dark-mode').count() > 0;
        log(isDark ? 'pass' : 'warn', 'Ujian', 'Dark mode aktif setelah klik');
    }

    // 3e. Mode Latihan
    const latihanBtn = await page.locator('button:has-text("Mode Latihan")').isVisible().catch(() => false);
    log(latihanBtn ? 'pass' : 'warn', 'Ujian', 'Tombol Mode Latihan ada');

    if (err.list.length > 0) log('fail', 'Ujian', `Fatal JS: ${err.list[0]}`);
    else log('pass', 'Ujian', 'Tidak ada JS error fatal');
});

// ==============================================================
// TEST 4: PROFIL - fungsi tampil, edit, back, logout
// ==============================================================
test('4. Profil: fungsi lengkap', async ({ page }) => {
    const err = fatalErrors(page);
    await loginAs(page, CREDS);
    await page.goto(`${BASE_URL}/participant/profile.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    // 4a. Data profil tampil
    const profileName = await page.locator('#profileName').textContent().catch(() => '');
    log(profileName && !profileName.includes('Memuat') ? 'pass' : 'fail', 'Profil', `Nama tampil: "${profileName}"`);

    // 4b. Tombol Edit → form muncul
    await page.click('button:has-text("Edit Profil")');
    await page.waitForTimeout(1000);
    const formVisible = await page.locator('#profileFormCard').isVisible().catch(() => false);
    log(formVisible ? 'pass' : 'fail', 'Profil', 'Form edit profil tampil setelah klik Edit');

    // 4c. Form berisi data yang sudah ada
    const namaVal = await page.locator('#formNamaLengkap').inputValue().catch(() => '');
    log(namaVal.length > 0 ? 'pass' : 'warn', 'Profil', `Form nama terisi: "${namaVal}"`);

    // 4d. Tombol Batal → form tersembunyi
    await page.click('button:has-text("Batal")');
    await page.waitForTimeout(500);
    const formHidden = !(await page.locator('#profileFormCard').isVisible().catch(() => true));
    log(formHidden ? 'pass' : 'fail', 'Profil', 'Tombol Batal → form tersembunyi');

    // 4e. Dark mode toggle di profil
    const darkToggle = await page.locator('#darkModeToggle').isVisible().catch(() => false);
    log(darkToggle ? 'pass' : 'warn', 'Profil', 'Toggle dark mode ada di pengaturan');

    // 4f. Tombol Back → dashboard
    const backBtn = await page.locator('a.back-btn').isVisible().catch(() => false);
    log(backBtn ? 'pass' : 'fail', 'Profil', 'Tombol Kembali ada');
    if (backBtn) {
        await page.click('a.back-btn');
        await page.waitForTimeout(2000);
        log(page.url().includes('dashboard') ? 'pass' : 'fail', 'Profil', 'Tombol Kembali → dashboard.html');
    }

    // 4g. Course progress & module progress sections
    await page.goto(`${BASE_URL}/participant/profile.html`);
    await page.waitForTimeout(3000);
    const courseSection = await page.locator('#courseProgressList').isVisible().catch(() => false);
    log(courseSection ? 'pass' : 'warn', 'Profil', 'Section perkembangan kursus ada');
    const moduleSection = await page.locator('#moduleProgressList').isVisible().catch(() => false);
    log(moduleSection ? 'pass' : 'warn', 'Profil', 'Section perkembangan modul ada');

    if (err.list.length > 0) log('fail', 'Profil', `Fatal JS: ${err.list[0]}`);
    else log('pass', 'Profil', 'Tidak ada JS error fatal');
});

// ==============================================================
// TEST 5: MATERI - filter, search, back
// ==============================================================
test('5. Materi: fungsi filter & navigasi', async ({ page }) => {
    const err = fatalErrors(page);
    await loginAs(page, CREDS);
    await page.goto(`${BASE_URL}/participant/materi.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    // 5a. Filter kategori terisi
    const kategoriOpts = await page.locator('#filterKategori option').count();
    log(kategoriOpts > 1 ? 'pass' : 'warn', 'Materi', `Filter kategori: ${kategoriOpts} opsi`);

    // 5b. Grid materi tampil
    const materiGrid = await page.locator('#materialsGrid').isVisible().catch(() => false);
    log(materiGrid ? 'pass' : 'fail', 'Materi', 'Grid materi tampil');

    // 5c. Pilih filter kategori → materi berubah
    if (kategoriOpts > 1) {
        await page.selectOption('#filterKategori', { index: 1 });
        await page.waitForTimeout(2000);
        const afterFilter = await page.locator('#materialsGrid').isVisible().catch(() => false);
        log(afterFilter ? 'pass' : 'warn', 'Materi', 'Grid materi masih tampil setelah filter');
    }

    // 5d. Search jika ada
    const searchBox = await page.locator('#searchMaterials, input[placeholder*="Cari"], input[type="search"]').first().isVisible().catch(() => false);
    log(searchBox ? 'pass' : 'warn', 'Materi', 'Search box ada di halaman materi');

    // 5e. Back button
    const backBtn = await page.locator('a.back-btn').isVisible().catch(() => false);
    log(backBtn ? 'pass' : 'warn', 'Materi', 'Tombol Kembali ada');

    if (err.list.length > 0) log('fail', 'Materi', `Fatal JS: ${err.list[0]}`);
    else log('pass', 'Materi', 'Tidak ada JS error fatal');
});

// ==============================================================
// TEST 6: LEADERBOARD - tabel, filter, posisi, back
// ==============================================================
test('6. Leaderboard: fungsi lengkap', async ({ page }) => {
    const err = fatalErrors(page);
    await loginAs(page, CREDS);
    await page.goto(`${BASE_URL}/participant/leaderboard.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    // 6a. Tabel data
    const rows = await page.locator('#leaderboardTableBody tr').count();
    log(rows > 0 ? 'pass' : 'warn', 'Leaderboard', `Baris tabel leaderboard: ${rows}`);

    // 6b. Posisi saya
    const myPos = await page.locator('#myPositionContent').textContent().catch(() => '');
    log(myPos.length > 0 ? 'pass' : 'warn', 'Leaderboard', `Posisi saya: "${myPos.trim().substring(0,50)}"`);

    // 6c. Filter kategori (jika ada)
    const filterExamType = await page.locator('#filterExamType, #filterCategory, select').first().isVisible().catch(() => false);
    log(filterExamType ? 'pass' : 'warn', 'Leaderboard', 'Filter leaderboard ada');

    // 6d. Podium (top 3)
    const podium = await page.locator('.podium-card, .podium-section').first().isVisible().catch(() => false);
    log(podium ? 'pass' : 'warn', 'Leaderboard', 'Podium top 3 tampil');

    // 6e. Back button
    const backBtn = await page.locator('a.back-btn').isVisible().catch(() => false);
    log(backBtn ? 'pass' : 'fail', 'Leaderboard', 'Tombol Kembali ada');
    if (backBtn) {
        await page.click('a.back-btn');
        await page.waitForTimeout(2000);
        log(page.url().includes('dashboard') ? 'pass' : 'fail', 'Leaderboard', 'Tombol Kembali → dashboard.html');
    }

    if (err.list.length > 0) log('fail', 'Leaderboard', `Fatal JS: ${err.list[0]}`);
    else log('pass', 'Leaderboard', 'Tidak ada JS error fatal');
});

// ==============================================================
// TEST 7: PENCAPAIAN - badge, achievement list, back
// ==============================================================
test('7. Pencapaian: fungsi lengkap', async ({ page }) => {
    const err = fatalErrors(page);
    await loginAs(page, CREDS);
    await page.goto(`${BASE_URL}/participant/achievements.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    // 7a. Statistik tampil dengan angka
    const totalBadges = await page.locator('#totalBadges').textContent().catch(() => '');
    const completed = await page.locator('#completedAchievements').textContent().catch(() => '');
    const pct = await page.locator('#completionPercentage').textContent().catch(() => '');
    log(!totalBadges.includes('-') ? 'pass' : 'warn', 'Pencapaian', `Total badges: "${totalBadges}"`);
    log(!completed.includes('-') ? 'pass' : 'warn', 'Pencapaian', `Completed: "${completed}"`);
    log(!pct.includes('-') ? 'pass' : 'warn', 'Pencapaian', `Completion %: "${pct}"`);

    // 7b. Daftar badge ada
    const badgeList = await page.locator('#badgesList, #badgesContainer, .badge-item').first().isVisible().catch(() => false);
    log(badgeList ? 'pass' : 'warn', 'Pencapaian', 'Daftar badge tampil');

    // 7c. Daftar achievement ada
    const achList = await page.locator('#achievementsList, #achievementsContainer, .achievement-item').first().isVisible().catch(() => false);
    log(achList ? 'pass' : 'warn', 'Pencapaian', 'Daftar achievement tampil');

    // 7d. Back button
    const backBtn = await page.locator('a.back-btn').isVisible().catch(() => false);
    log(backBtn ? 'pass' : 'fail', 'Pencapaian', 'Tombol Kembali ada');
    if (backBtn) {
        await page.click('a.back-btn');
        await page.waitForTimeout(2000);
        log(page.url().includes('dashboard') ? 'pass' : 'fail', 'Pencapaian', 'Tombol Kembali → dashboard.html');
    }

    if (err.list.length > 0) log('fail', 'Pencapaian', `Fatal JS: ${err.list[0]}`);
    else log('pass', 'Pencapaian', 'Tidak ada JS error fatal');
});

// ==============================================================
// TEST 8: REGISTRASI - form, validasi
// ==============================================================
test('8. Registrasi: form & validasi', async ({ page }) => {
    const err = fatalErrors(page);
    await page.goto(`${BASE_URL}/participant/register.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 8a. Field-field form ada
    const fields = ['#username', '#password', '#namaLengkap'];
    for (const f of fields) {
        const vis = await page.locator(f).isVisible().catch(() => false);
        log(vis ? 'pass' : 'warn', 'Register', `Field ${f}: ${vis ? 'ada' : 'tidak ada'}`);
    }

    // 8b. Submit kosong → validasi
    await page.locator('button[type="submit"], button:has-text("Daftar")').first().click().catch(() => {});
    await page.waitForTimeout(1000);
    const stillRegister = page.url().includes('register');
    log(stillRegister ? 'pass' : 'warn', 'Register', 'Submit kosong → tetap di halaman register');

    // 8c. Link ke login ada
    const loginLink = await page.locator('a[href*="login"]').first().isVisible().catch(() => false);
    log(loginLink ? 'pass' : 'warn', 'Register', 'Link ke halaman login ada');

    if (err.list.length > 0) log('fail', 'Register', `Fatal JS: ${err.list[0]}`);
    else log('pass', 'Register', 'Tidak ada JS error fatal');
});

// ==============================================================
// TEST 9: AUTH PROTECTION - semua halaman protected
// ==============================================================
test('9. Proteksi Auth: halaman tanpa login', async ({ page }) => {
    const protectedPages = [
        { url: `${BASE_URL}/participant/dashboard.html`, name: 'dashboard' },
        { url: `${BASE_URL}/participant/ujian.html`, name: 'ujian' },
        { url: `${BASE_URL}/participant/profile.html`, name: 'profil' },
        { url: `${BASE_URL}/participant/materi.html`, name: 'materi' },
        { url: `${BASE_URL}/participant/leaderboard.html`, name: 'leaderboard' },
        { url: `${BASE_URL}/participant/achievements.html`, name: 'pencapaian' },
        { url: `${BASE_URL}/admin/admin.html`, name: 'admin' },
    ];

    for (const p of protectedPages) {
        // Buka halaman tanpa login (clear storage)
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear()).catch(() => {});
        await page.goto(p.url);
        await page.waitForTimeout(2000);
        const redirected = page.url().includes('login') || page.url().includes('index');
        log(redirected ? 'pass' : 'fail', 'Auth', `${p.name}: ${redirected ? 'redirect ke login ✓' : 'BISA DIAKSES TANPA LOGIN ✗'}`);
    }
});

// ==============================================================
// TEST 10: SEMUA LINK INTERNAL - broken link check
// ==============================================================
test('10. Link Navigasi: semua href valid', async ({ page }) => {
    const err = fatalErrors(page);
    await loginAs(page, CREDS);

    const pagesToCheck = [
        { url: `${BASE_URL}/participant/dashboard.html`, name: 'Dashboard' },
        { url: `${BASE_URL}/participant/leaderboard.html`, name: 'Leaderboard' },
        { url: `${BASE_URL}/participant/achievements.html`, name: 'Pencapaian' },
        { url: `${BASE_URL}/participant/profile.html`, name: 'Profil' },
        { url: `${BASE_URL}/participant/materi.html`, name: 'Materi' },
    ];

    for (const p of pagesToCheck) {
        await page.goto(p.url, { timeout: 15000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(1500);

        // Ambil semua href link
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.getAttribute('href'))
                .filter(h => h && !h.startsWith('#') && !h.startsWith('javascript') && !h.startsWith('mailto') && !h.startsWith('http'));
        });

        for (const href of links) {
            let fullUrl;
            if (href.startsWith('/')) {
                fullUrl = `http://localhost${href}`;
            } else if (href.startsWith('http')) {
                fullUrl = href;
            } else if (href.startsWith('uploads/') || href.startsWith('data/') || href.startsWith('api/')) {
                fullUrl = `${BASE_URL}/${href}`;
            } else {
                fullUrl = `${BASE_URL}/participant/${href}`;
            }
            const res = await page.request.get(fullUrl).catch(() => null);
            const status = res ? res.status() : 0;
            log(status === 200 ? 'pass' : (status === 0 ? 'fail' : 'warn'),
                `Link [${p.name}]`, `${href} → HTTP ${status}`);
        }
    }

    if (err.list.length > 0) log('fail', 'Links', `Fatal JS: ${err.list[0]}`);
    else log('pass', 'Links', 'Tidak ada JS error fatal');
});

// ==============================================================
// SUMMARY
// ==============================================================
test.afterAll(async () => {
    console.log('\n' + '='.repeat(65));
    console.log('  LAPORAN FULL FUNCTIONAL TEST');
    console.log('='.repeat(65));
    console.log(`✅ PASS  : ${R.pass.length}`);
    console.log(`❌ FAIL  : ${R.fail.length}`);
    console.log(`⚠️  WARN  : ${R.warn.length}`);
    const total = R.pass.length + R.fail.length + R.warn.length;
    const pct = total > 0 ? ((R.pass.length / total) * 100).toFixed(1) : 0;
    console.log(`📊 SCORE : ${pct}%`);
    if (R.fail.length > 0) {
        console.log('\n❌ MASALAH DITEMUKAN:');
        R.fail.forEach(f => console.log('  - ' + f));
    }
    if (R.warn.length > 0) {
        console.log('\n⚠️  PERHATIAN:');
        R.warn.forEach(w => console.log('  - ' + w));
    }
    console.log('='.repeat(65));
});
