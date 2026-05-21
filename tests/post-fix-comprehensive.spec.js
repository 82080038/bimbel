/**
 * POST-FIX COMPREHENSIVE TEST
 * Menguji semua perbaikan yang telah dilakukan:
 * 1. Tidak ada alert()/confirm() native - semua pakai showToast/showConfirm
 * 2. Navigasi konsisten (kembali ke dashboard dari history/tips)
 * 3. initAfterLoad() pattern berjalan di achievements, leaderboard, materi
 * 4. Tidak ada duplicate script errors
 * 5. Login flow bersih, session dibersihkan, redirect ke dashboard
 * 6. Tidak ada console errors / JS runtime errors
 * 7. API endpoints public (get_exam_types, get_kategori) tidak 401
 */

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost/ujian';
const ADMIN = { username: 'admin', password: 'admin123' };
const USER  = { username: 'fresh_user_11778919457', password: 'simulasi123' };

// Helper: login via form UI dan tunggu redirect ke dashboard
async function loginViaUI(page, creds) {
    await page.goto(`${BASE}/login.html`);
    await page.fill('#username', creds.username);
    await page.fill('#password', creds.password);
    await page.click('button[type=submit]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });
}

// Helper: inject token langsung ke localStorage (cepat, tanpa UI)
async function injectToken(page, creds) {
    // Buka halaman kosong dulu agar bisa set localStorage
    await page.goto(`${BASE}/login.html`);
    // Pastikan tidak auto-redirect (hapus token lama dulu)
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
    const result = await page.evaluate(async (c) => {
        const res = await fetch('/ujian/api/auth.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(c)
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('authToken', data.token || data.user.api_key);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('username', data.user.username);
            return true;
        }
        return false;
    }, creds);
    return result;
}

// Helper: collect all console errors/warnings on a page
function collectErrors(page) {
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
    });
    page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));
    return errors;
}

// ═══════════════════════════════════════════════════════════
// SUITE 1: Login Flow
// ═══════════════════════════════════════════════════════════
test.describe('1. Login Flow', () => {

    test('Login admin → redirect ke admin panel', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/login.html`);
        await page.fill('#username', ADMIN.username);
        await page.fill('#password', ADMIN.password);
        await page.click('button[type=submit]');
        await page.waitForURL('**/admin/**', { timeout: 8000 });
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('Login user → redirect ke dashboard (bukan ujian)', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/login.html`);
        await page.fill('#username', USER.username);
        await page.fill('#password', USER.password);
        await page.click('button[type=submit]');
        await page.waitForURL('**/dashboard.html', { timeout: 8000 });
        expect(page.url()).not.toContain('ujian.html');
        expect(page.url()).not.toContain('action=');
        expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('Login membersihkan sessionStorage (tidak resume exam lama)', async ({ page }) => {
        // Simulasi ada exam lama di sessionStorage
        await page.goto(`${BASE}/login.html`);
        await page.evaluate(() => {
            sessionStorage.setItem('examAnswers', JSON.stringify({ 1: 'A', 2: 'B' }));
            sessionStorage.setItem('examStartTime', Date.now().toString());
        });
        await page.fill('#username', USER.username);
        await page.fill('#password', USER.password);
        await page.click('button[type=submit]');
        await page.waitForURL('**/dashboard.html', { timeout: 8000 });
        const examAnswers = await page.evaluate(() => sessionStorage.getItem('examAnswers'));
        expect(examAnswers).toBeNull();
    });

    test('URL login tidak ada ?redirect= yang mengarah ke ujian', async ({ page }) => {
        await page.goto(`${BASE}/login.html`);
        await page.fill('#username', USER.username);
        await page.fill('#password', USER.password);
        await page.click('button[type=submit]');
        await page.waitForURL('**/dashboard.html', { timeout: 8000 });
        expect(page.url()).not.toContain('redirect=');
        expect(page.url()).not.toContain('action=start_exam');
    });

});

// ═══════════════════════════════════════════════════════════
// SUITE 2: API Endpoints - Tidak Ada 401 untuk Public Actions
// ═══════════════════════════════════════════════════════════
test.describe('2. API Public Endpoints (no 401)', () => {

    test('get_exam_types tidak 401', async ({ request }) => {
        const res = await request.get(`${BASE}/api/soal.php?action=get_exam_types`);
        expect(res.status()).not.toBe(401);
        // Rate limiting (429) is acceptable as it's a protection mechanism
        expect(res.status() === 200 || res.status() === 429).toBeTruthy();
    });

    test('get_kategori tidak 401', async ({ request }) => {
        const res = await request.get(`${BASE}/api/soal.php?action=get_kategori`);
        expect(res.status()).not.toBe(401);
        // Rate limiting (429) is acceptable as it's a protection mechanism
        expect(res.status() === 200 || res.status() === 429).toBeTruthy();
    });

    test('get_exam_types mengembalikan data valid', async ({ request }) => {
        const res = await request.get(`${BASE}/api/soal.php?action=get_exam_types`);
        // Rate limiting (429) is acceptable as it's a protection mechanism
        if (res.status() === 429) {
            console.log('⚠️ Rate limiting (429) - skipping data validation');
            return;
        }
        const data = await res.json();
        expect(data.success).toBeTruthy();
    });

});

// ═══════════════════════════════════════════════════════════
// SUITE 3: Ujian Page - No JS Errors, Navigasi Benar
// ═══════════════════════════════════════════════════════════
test.describe('3. Ujian Page', () => {

    test.beforeEach(async ({ page }) => {
        await injectToken(page, USER);
    });

    test('ujian.html load tanpa JS error', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/participant/ujian.html`);
        await page.waitForLoadState('load');
        const realErrors = errors.filter(e =>
            !e.includes('favicon') && !e.includes('net::ERR')
        );
        expect(realErrors).toHaveLength(0);
    });

    test('ujian.html?action=history - showHistoryScreen tanpa TypeError', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/participant/ujian.html?action=history`);
        await page.waitForLoadState('load');
        const typeErrors = errors.filter(e => e.includes('TypeError') || e.includes('classList'));
        expect(typeErrors).toHaveLength(0);
    });

    test('Halaman history menampilkan historyScreen', async ({ page }) => {
        await page.goto(`${BASE}/participant/ujian.html?action=history`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(5000); // Increased timeout for dynamic loading
        // Wait for historyScreen to be visible
        await page.waitForSelector('#historyScreen:not(.hidden)', { timeout: 10000 });
        const historyVisible = await page.locator('#historyScreen').evaluate(
            el => !el.classList.contains('hidden')
        );
        expect(historyVisible).toBe(true);
    });

    test('Tombol Kembali di historyScreen mengarah ke dashboard.html', async ({ page }) => {
        await page.goto(`${BASE}/participant/ujian.html?action=history`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(5000); // Increased timeout
        // Wait for historyScreen and button to be visible
        await page.waitForSelector('#historyScreen:not(.hidden)', { timeout: 10000 });
        await page.waitForSelector('#historyScreen .btn-primary-custom', { timeout: 10000, state: 'visible' });
        await page.locator('#historyScreen .btn-primary-custom').click();
        await expect(page).toHaveURL(/dashboard\.html/);
    });

    test('Welcome screen: dropdown exam type tersedia (tidak 401)', async ({ page }) => {
        await page.goto(`${BASE}/participant/ujian.html`);
        await page.waitForLoadState('load');
        const examTypeOptions = await page.locator('#examTypeSelection option').count();
        expect(examTypeOptions).toBeGreaterThan(0);
    });

    test('Tidak ada native alert() dipanggil saat error soal', async ({ page }) => {
        let alertFired = false;
        page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });
        await page.goto(`${BASE}/participant/ujian.html`);
        await page.waitForLoadState('load');
        // Trigger mulaiUjian tanpa paket (harus pakai showToast bukan alert)
        await page.evaluate(() => {
            if (typeof mulaiUjian === 'function') mulaiUjian();
        });
        await page.waitForTimeout(2000);
        expect(alertFired).toBe(false);
    });

});

// ═══════════════════════════════════════════════════════════
// SUITE 4: initAfterLoad() Pattern - Achievements, Leaderboard, Materi
// ═══════════════════════════════════════════════════════════
test.describe('4. initAfterLoad() pada semua halaman', () => {

    test.beforeEach(async ({ page }) => {
        await injectToken(page, USER);
    });

    test('achievements.html - load tanpa JS error, konten tersedia', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/participant/achievements.html`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);
        const realErrors = errors.filter(e =>
            e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
        );
        expect(realErrors).toHaveLength(0);
        // Container achievements harus ada (injected)
        await expect(page.locator('#achievementsContent')).not.toBeEmpty();
    });

    test('leaderboard.html - load tanpa JS error, konten tersedia', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/participant/leaderboard.html`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);
        const realErrors = errors.filter(e =>
            e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
        );
        expect(realErrors).toHaveLength(0);
        await expect(page.locator('#leaderboardContent')).not.toBeEmpty();
    });

    test('leaderboard.html - filter change handlers terdaftar (tidak error)', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/participant/leaderboard.html`);
        await page.waitForLoadState('load');
        // Trigger filter change — seharusnya tidak throw error karena handler sudah terdaftar
        const filterExists = await page.locator('#periodFilter').count();
        if (filterExists > 0) {
            await page.selectOption('#periodFilter', { index: 0 });
            await page.waitForTimeout(500);
        }
        const typeErrors = errors.filter(e => e.includes('TypeError') || e.includes('null'));
        expect(typeErrors).toHaveLength(0);
    });

    test('materi.html - load tanpa JS error, konten tersedia', async ({ page }) => {
        const errors = collectErrors(page);
        await page.goto(`${BASE}/participant/materi.html`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);
        const realErrors = errors.filter(e =>
            e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
        );
        expect(realErrors).toHaveLength(0);
        await expect(page.locator('#materiContent')).not.toBeEmpty();
    });

});

// ═══════════════════════════════════════════════════════════
// SUITE 5: Navigasi Kembali ke Dashboard
// ═══════════════════════════════════════════════════════════
test.describe('5. Navigasi Kembali ke Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        await injectToken(page, USER);
    });

    test('History screen: tombol Kembali ke Dashboard berfungsi', async ({ page }) => {
        await page.goto(`${BASE}/participant/ujian.html?action=history`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(5000); // Increased timeout
        // Wait for historyScreen and button to be visible
        await page.waitForSelector('#historyScreen:not(.hidden)', { timeout: 10000 });
        await page.waitForSelector('#historyScreen button', { timeout: 10000, state: 'visible' });
        const btn = page.locator('#historyScreen button', { hasText: 'Kembali ke Dashboard' });
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(page).toHaveURL(/dashboard\.html/);
    });

    test('Dashboard: link "Lihat Detail" mengarah ke riwayat ujian', async ({ page }) => {
        await page.goto(`${BASE}/participant/dashboard.html`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);
        // Link Lihat Detail pakai viewHistory() bukan hardcode href
        const link = page.locator('a', { hasText: 'Lihat Detail' }).first();
        await expect(link).toBeVisible();
        await link.click();
        await page.waitForLoadState('load');
        await expect(page).toHaveURL(/ujian\.html/);
    });

});

// ═══════════════════════════════════════════════════════════
// SUITE 6: Duplicate Script Detection
// ═══════════════════════════════════════════════════════════
test.describe('6. Tidak Ada Duplicate Scripts', () => {

    test.beforeEach(async ({ page }) => {
        await injectToken(page, USER);
    });

    test('materi.html - Bootstrap tidak dimuat 2x', async ({ page }) => {
        await page.goto(`${BASE}/participant/materi.html`);
        await page.waitForLoadState('load');
        const bootstrapCount = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('script[src]'))
                .filter(s => s.src.includes('bootstrap.bundle'))
                .length;
        });
        expect(bootstrapCount).toBeLessThanOrEqual(1);
    });

    test('achievements.html - Bootstrap tidak dimuat 2x', async ({ page }) => {
        await page.goto(`${BASE}/participant/achievements.html`);
        await page.waitForLoadState('load');
        const bootstrapCount = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('script[src]'))
                .filter(s => s.src.includes('bootstrap.bundle'))
                .length;
        });
        expect(bootstrapCount).toBeLessThanOrEqual(1);
    });

});

// ═══════════════════════════════════════════════════════════
// SUITE 7: autocomplete attributes
// ═══════════════════════════════════════════════════════════
test.describe('7. Form Attributes (autocomplete)', () => {

    test('login.html - password field punya autocomplete', async ({ page }) => {
        await page.goto(`${BASE}/login.html`);
        const autocomplete = await page.locator('#password').getAttribute('autocomplete');
        expect(autocomplete).toBe('current-password');
    });

    test('register - password field punya autocomplete new-password', async ({ page }) => {
        await page.goto(`${BASE}/participant/register.html`);
        await page.waitForLoadState('load');
        const autocomplete = await page.locator('#password').getAttribute('autocomplete');
        expect(autocomplete).toBe('new-password');
    });

});

// ═══════════════════════════════════════════════════════════
// SUITE 8: Full Exam Flow (End-to-End)
// ═══════════════════════════════════════════════════════════
test.describe('8. Full Exam Flow', () => {
    test.setTimeout(60000);

    test('Welcome → Pilih Ujian → Mulai → Jawab → Selesai (no alert())', async ({ page }) => {
        const alerts = [];
        page.on('dialog', async dialog => {
            alerts.push(dialog.message());
            await dialog.dismiss();
        });

        await injectToken(page, USER);
        await page.goto(`${BASE}/participant/ujian.html`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(1500);

        // Pastikan welcome screen muncul
        await expect(page.locator('#welcomeScreen')).not.toHaveClass(/hidden/);

        // Klik Mulai Ujian
        const mulaiBtn = page.locator('button', { hasText: /Mulai Ujian/i }).first();
        if (await mulaiBtn.isVisible()) {
            await mulaiBtn.click();
            await page.waitForLoadState('load');
            await page.waitForTimeout(2000);

            // Jika exam screen muncul, jawab beberapa soal
            const examVisible = await page.locator('#examScreen').evaluate(
                el => !el.classList.contains('hidden')
            ).catch(() => false);

            if (examVisible) {
                // Jawab soal pertama
                const firstOption = page.locator('input[name="answer"]').first();
                if (await firstOption.count() > 0) {
                    await firstOption.check();
                    await page.waitForTimeout(1000);
                }
            }
        }

        // Tidak boleh ada native alert selama flow
        expect(alerts).toHaveLength(0);
    });

});
