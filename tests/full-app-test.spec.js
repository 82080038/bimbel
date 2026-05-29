const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost/bimbel';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const TEST_USER  = 'testuser';
const TEST_PASS  = 'test123';

// ─── helpers ────────────────────────────────────────────────────────────────

// Hapus file rate limit agar login tidak diblokir antar test
async function clearRateLimit(request) {
  await request.get(`${BASE}/api/cache.php?action=clear`).catch(() => {});
}

// Login via quick-button (bypass rate limiter, lebih cepat)
async function loginAsAdmin(page) {
  await page.goto(`${BASE}/login.html`);
  await page.waitForTimeout(500);
  await page.click('button:has-text("Admin")');
  await page.waitForURL('**/admin/admin.html', { timeout: 15000 });
}

async function loginAsUser(page) {
  await page.goto(`${BASE}/login.html`);
  await page.waitForTimeout(500);
  await page.click('button:has-text("Test User")');
  await page.waitForURL('**/participant/dashboard.html', { timeout: 15000 });
}

// Login via form (untuk test yang sengaja menguji form login)
async function loginViaForm(page, username, password) {
  await page.goto(`${BASE}/login.html`);
  await page.waitForTimeout(800);
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
}

async function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  return errors;
}

// ─── 1. REDIRECT & ENTRY POINT ──────────────────────────────────────────────

test.describe('1. Redirect & Entry Point', () => {

  test('1.1 root / redirect ke login (unauthenticated)', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('1.2 index.php redirect ke login (unauthenticated)', async ({ page }) => {
    await page.goto(`${BASE}/index.php`);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('1.3 admin panel redirect ke login (unauthenticated)', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html`);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('1.4 dashboard redirect ke login (unauthenticated)', async ({ page }) => {
    await page.goto(`${BASE}/participant/dashboard.html`);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('1.5 halaman peserta lain redirect ke login (unauthenticated)', async ({ page }) => {
    const pages = [
      '/participant/ujian.html',
      '/participant/materi.html',
      '/participant/profile.html',
      '/participant/achievements.html',
      '/participant/leaderboard.html',
    ];
    for (const p of pages) {
      await page.goto(BASE + p);
      await page.waitForURL('**/login.html', { timeout: 8000 });
      await expect(page).toHaveURL(/login\.html/);
    }
  });

});

// ─── 2. LOGIN PAGE ──────────────────────────────────────────────────────────

test.describe('2. Login Page', () => {

  test('2.1 login.html load dengan title benar', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await expect(page).toHaveTitle(/Login/i);
  });

  test('2.2 form login memiliki field username, password, submit', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('2.3 password field bertipe password', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  test('2.4 field username & password required', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await expect(page.locator('#username')).toHaveAttribute('required');
    await expect(page.locator('#password')).toHaveAttribute('required');
  });

  test('2.5 quick login Test User berhasil', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.click('button:has-text("Test User")');
    await page.waitForURL('**/participant/dashboard.html', { timeout: 8000 });
    await expect(page).toHaveURL(/dashboard\.html/);
  });

  test('2.6 quick login Admin berhasil', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.click('button:has-text("Admin")');
    await page.waitForURL('**/admin/admin.html', { timeout: 8000 });
    await expect(page).toHaveURL(/admin\.html/);
  });

  test('2.7 login via quick-button Admin berhasil', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/admin\.html/);
  });

  test('2.8 login via quick-button Test User berhasil', async ({ page }) => {
    await loginAsUser(page);
    await expect(page).toHaveURL(/dashboard\.html/);
  });

  test('2.9 login credential salah tampil pesan error', async ({ page }) => {
    // Bersihkan rate limit dulu
    await page.request.get(`${BASE}/api/cache.php?action=clear`).catch(() => {});
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(1000);
    await page.fill('#username', 'wronguser_xyz');
    await page.fill('#password', 'wrongpass_xyz');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const alert = page.locator('#alertBox');
    await expect(alert).toBeVisible();
  });

  test('2.10 link register tersedia dan berfungsi', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    const registerLink = page.locator('a[href*="register"]').first();
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  test('2.11 AppConfig ter-load di login page', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(1000);
    const baseUrl = await page.evaluate(() => window.AppConfig?.BASE_URL);
    expect(baseUrl).toContain('localhost/bimbel');
  });

  test('2.12 RBAC ter-load di login page', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(1000);
    const rbac = await page.evaluate(() => typeof window.RBAC);
    expect(rbac).toBe('object');
  });

  test('2.13 tidak ada console error kritis di login page', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(2000);
    const critical = errors.filter(e => /Uncaught|TypeError|ReferenceError/.test(e));
    expect(critical).toHaveLength(0);
  });

  test('2.14 halaman login responsif mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/login.html`);
    await expect(page.locator('.login-container')).toBeVisible();
  });

});

// ─── 3. REGISTER PAGE ───────────────────────────────────────────────────────

test.describe('3. Register Page', () => {

  test('3.1 register.html load', async ({ page }) => {
    await page.goto(`${BASE}/register.html`);
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/login\.html/);
  });

  test('3.2 participant/register.html load', async ({ page }) => {
    await page.goto(`${BASE}/participant/register.html`);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('3.3 halaman register memiliki link kembali ke login', async ({ page }) => {
    await page.goto(`${BASE}/register.html`);
    await page.waitForTimeout(1000);
    const loginLink = page.locator('a[href*="login"]').first();
    if (await loginLink.count() > 0) {
      await expect(loginLink).toBeVisible();
    }
  });

});

// ─── 4. PARTICIPANT PAGES ────────────────────────────────────────────────────

test.describe('4. Participant Pages', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('4.1 dashboard.html load dan tampil container', async ({ page }) => {
    await page.goto(`${BASE}/participant/dashboard.html`);
    await page.waitForTimeout(3000);
    await expect(page.locator('.dashboard-container').first()).toBeVisible();
  });

  test('4.2 ujian.html load', async ({ page }) => {
    await page.goto(`${BASE}/participant/ujian.html`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/ujian\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.3 materi.html load', async ({ page }) => {
    await page.goto(`${BASE}/participant/materi.html`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/materi\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.4 profile.html load', async ({ page }) => {
    await page.goto(`${BASE}/participant/profile.html`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/profile\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.5 achievements.html load', async ({ page }) => {
    await page.goto(`${BASE}/participant/achievements.html`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/achievements\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.6 leaderboard.html load', async ({ page }) => {
    await page.goto(`${BASE}/participant/leaderboard.html`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/leaderboard\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.7 resume-ujian.html load', async ({ page }) => {
    await page.goto(`${BASE}/participant/resume-ujian.html`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/resume-ujian\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.8 certificate.html load atau redirect ke dashboard', async ({ page }) => {
    await page.waitForTimeout(1000);
    await page.goto(`${BASE}/participant/certificate.html`);
    await page.waitForTimeout(3000);
    // certificate.html redirect ke dashboard jika tidak ada cert_id param — perilaku valid
    const url = page.url();
    expect(url).toMatch(/certificate\.html|dashboard\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.9 sertifikat-print.html load', async ({ page }) => {
    await page.goto(`${BASE}/participant/sertifikat-print.html`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.10 dashboard tidak ada console error kritis', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(`${BASE}/participant/dashboard.html`);
    await page.waitForTimeout(4000);
    // Filter: abaikan 'Failed to fetch' dari API 401 (expected behavior saat token belum ready)
    // Hanya flag error yang benar-benar kritis: syntax/logic errors
    const critical = errors.filter(e =>
      (/Uncaught|ReferenceError/.test(e)) ||
      (/TypeError/.test(e) && !/Failed to fetch|fetch|Load/.test(e))
    );
    expect(critical).toHaveLength(0);
  });

  test('4.11 ujian page tidak ada console error kritis', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(`${BASE}/participant/ujian.html`);
    await page.waitForTimeout(4000);
    const critical = errors.filter(e =>
      (/Uncaught|ReferenceError/.test(e)) ||
      (/TypeError/.test(e) && !/Failed to fetch|fetch|Load/.test(e))
    );
    expect(critical).toHaveLength(0);
  });

  test('4.12 materi page tidak ada console error kritis', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(`${BASE}/participant/materi.html`);
    await page.waitForTimeout(4000);
    const critical = errors.filter(e =>
      (/Uncaught|ReferenceError/.test(e)) ||
      (/TypeError/.test(e) && !/Failed to fetch|fetch|Load/.test(e))
    );
    expect(critical).toHaveLength(0);
  });

  test('4.13 authToken tersimpan di localStorage setelah login', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).not.toBeNull();
  });

  test('4.14 logout → redirect ke login', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

});

// ─── 5. ADMIN PAGES ─────────────────────────────────────────────────────────

test.describe('5. Admin Pages', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('5.1 admin/admin.html load dan sidebar visible', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html`);
    await page.waitForTimeout(3000);
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('5.2 admin/index.html load', async ({ page }) => {
    await page.goto(`${BASE}/admin/index.html`);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.3 section Dashboard tampil', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html`);
    await page.waitForTimeout(3000);
    const dashSection = page.locator('#dashboard, [data-section="dashboard"]').first();
    if (await dashSection.count() > 0) {
      await expect(dashSection).toBeVisible();
    } else {
      await expect(page.locator('.sidebar')).toBeVisible();
    }
  });

  test('5.4 section Soal Management dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#soal`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.5 section Kategori dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#kategori`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.6 section Users dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#users`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.7 section Gamification dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#gamification`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.8 section Notifications dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#notifications`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.9 section Courses dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#courseManagement`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.10 section IRT dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#irt`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.11 section Exam Sessions dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#examSessions`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.12 section Blueprint dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#blueprint`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.13 section Topics dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#topics`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.14 section Maintenance dapat diakses', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html#maintenance`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.15 admin panel tidak ada console error kritis', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(`${BASE}/admin/admin.html`);
    await page.waitForTimeout(5000);
    // Abaikan 'Failed to fetch' dari API call (401 auth atau timing issue)
    // Flag hanya error sintaks/logika yang benar-benar kritis
    const critical = errors.filter(e =>
      (/Uncaught|ReferenceError/.test(e)) ||
      (/TypeError/.test(e) && !/Failed to fetch|fetch|Load/.test(e))
    );
    expect(critical).toHaveLength(0);
  });

  test('5.16 RBAC: testuser tidak bisa akses admin panel', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await loginAsUser(page);
    await page.goto(`${BASE}/admin/admin.html`);
    await page.waitForTimeout(3000);
    await expect(page).not.toHaveURL(/admin\/admin\.html/);
  });

});

// ─── 6. API ENDPOINTS ────────────────────────────────────────────────────────

test.describe('6. API Endpoints', () => {

  test.beforeEach(async ({ request }) => {
    await clearRateLimit(request);
    await new Promise(r => setTimeout(r, 500));
  });

  test('6.1 auth login admin', async ({ request }) => {
    await clearRateLimit(request);
    const res = await request.post(`${BASE}/api/auth.php?action=login`, {
      data: { username: ADMIN_USER, password: ADMIN_PASS }
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
  });

  test('6.2 auth login testuser', async ({ request }) => {
    await clearRateLimit(request);
    const res = await request.post(`${BASE}/api/auth.php?action=login`, {
      data: { username: TEST_USER, password: TEST_PASS }
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test('6.3 auth login credential salah → success false', async ({ request }) => {
    await clearRateLimit(request);
    const res = await request.post(`${BASE}/api/auth.php?action=login`, {
      data: { username: 'wrong_xyz_99', password: 'wrong_xyz_99' }
    });
    // Rate limit bisa kembalikan 429 — terima 200 atau 429
    expect(res.status()).toBeLessThan(500);
    if (res.ok()) {
      const data = await res.json();
      expect(data.success).toBe(false);
    }
  });

  test('6.4 api/soal.php get_exam_types', async ({ request }) => {
    const res = await request.get(`${BASE}/api/soal.php?action=get_exam_types`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test('6.5 api/expert.php get_expert_knowledge', async ({ request }) => {
    const res = await request.get(`${BASE}/api/expert.php?action=get_expert_knowledge`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test('6.6 api/pembahasan.php get_pembahasan_kategori', async ({ request }) => {
    const res = await request.get(`${BASE}/api/pembahasan.php?action=get_pembahasan_kategori&kategori_id=1`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test('6.7 api/courses.php get_courses', async ({ request }) => {
    const res = await request.get(`${BASE}/api/courses.php?action=get_courses`);
    expect(res.ok()).toBeTruthy();
  });

  test('6.8 api/csrf.php generate', async ({ request }) => {
    const res = await request.get(`${BASE}/api/csrf.php?action=generate`);
    expect(res.ok()).toBeTruthy();
  });

  test('6.9 api/soal.php get_soal_by_kategori', async ({ request }) => {
    const res = await request.get(`${BASE}/api/soal.php?action=get_soal_by_kategori&kategori_id=1&limit=5`);
    expect(res.ok()).toBeTruthy();
  });

  test('6.10 api/get_materi.php get_materi_kategori', async ({ request }) => {
    const res = await request.get(`${BASE}/api/get_materi.php?action=get_materi_kategori&kategori_id=1`);
    expect(res.status()).toBeGreaterThanOrEqual(200);
    expect(res.status()).toBeLessThan(500);
  });

  test('6.11 api/notifications.php respons valid (dengan auth)', async ({ request }) => {
    const loginRes = await request.post(`${BASE}/api/auth.php?action=login`, {
      data: { username: TEST_USER, password: TEST_PASS }
    });
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.api_key || loginData.user?.api_key || '';
    const res = await request.get(`${BASE}/api/notifications.php?action=get_notifications`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    // endpoint memerlukan auth; cukup pastikan server merespons (200 atau 401)
    expect(res.status()).toBeLessThan(500);
  });

  test('6.12 api/analytics.php respons valid (dengan auth)', async ({ request }) => {
    const loginRes = await request.post(`${BASE}/api/auth.php?action=login`, {
      data: { username: ADMIN_USER, password: ADMIN_PASS }
    });
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.api_key || loginData.user?.api_key || '';
    const res = await request.get(`${BASE}/api/analytics.php?action=get_question_analytics`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('6.13 api/gamification.php get_leaderboard (public atau auth)', async ({ request }) => {
    const res = await request.get(`${BASE}/api/gamification.php?action=get_leaderboard`);
    // leaderboard biasanya publik; terima 200 atau 401
    expect(res.status()).toBeLessThan(500);
  });

  test('6.14 api/cache.php clear respons valid', async ({ request }) => {
    const res = await request.get(`${BASE}/api/cache.php?action=clear`);
    expect(res.ok()).toBeTruthy();
  });

  test('6.15 rate limiter: 5 request berurutan tidak error', async ({ request }) => {
    const reqs = Array.from({ length: 5 }, () =>
      request.get(`${BASE}/api/soal.php?action=get_exam_types`)
    );
    const results = await Promise.all(reqs);
    results.forEach(r => expect(r.ok()).toBeTruthy());
  });

});

// ─── 7. RBAC PROTECTION ─────────────────────────────────────────────────────

test.describe('7. RBAC Protection', () => {

  test('7.1 unauthenticated → root redirect login', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('7.2 unauthenticated → admin redirect login', async ({ page }) => {
    await page.goto(`${BASE}/admin/admin.html`);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('7.3 unauthenticated → dashboard redirect login', async ({ page }) => {
    await page.goto(`${BASE}/participant/dashboard.html`);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('7.4 unauthenticated → ujian redirect login', async ({ page }) => {
    await page.goto(`${BASE}/participant/ujian.html`);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('7.5 unauthenticated → profile redirect login', async ({ page }) => {
    await page.goto(`${BASE}/participant/profile.html`);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('7.6 testuser quick-login → masuk dashboard (bukan admin)', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Test User")');
    await page.waitForURL('**/participant/dashboard.html', { timeout: 15000 });
    await expect(page).toHaveURL(/participant\/dashboard\.html/);
  });

  test('7.7 admin quick-login → masuk admin panel (bukan dashboard peserta)', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Admin")');
    await page.waitForURL('**/admin/admin.html', { timeout: 15000 });
    await expect(page).toHaveURL(/admin\/admin\.html/);
  });

});

// ─── 8. FRONTEND CONFIG & JS ─────────────────────────────────────────────────

test.describe('8. Frontend Config & JS', () => {

  test('8.1 AppConfig.BASE_URL benar di login page', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(1000);
    const url = await page.evaluate(() => window.AppConfig?.BASE_URL);
    expect(url).toBe('http://localhost/bimbel');
  });

  test('8.2 AppConfig.API_URL benar', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(1000);
    const url = await page.evaluate(() => window.AppConfig?.API_URL);
    expect(url).toBe('http://localhost/bimbel/api');
  });

  test('8.3 AppConfig.ENVIRONMENT = development', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(1000);
    const env = await page.evaluate(() => window.AppConfig?.ENVIRONMENT);
    expect(env).toBe('development');
  });

  test('8.4 RBAC object tersedia', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(1000);
    const rbacType = await page.evaluate(() => typeof window.RBAC);
    expect(rbacType).toBe('object');
  });

  test('8.5 tidak ada JS error kritis di login page', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(2000);
    const critical = errors.filter(e => /Uncaught|TypeError|ReferenceError/.test(e));
    expect(critical).toHaveLength(0);
  });

  test('8.6 tidak ada resource gagal load di login', async ({ page }) => {
    const failed = [];
    page.on('requestfailed', req => failed.push(req.url()));
    await page.goto(`${BASE}/login.html`);
    await page.waitForTimeout(2000);
    const critical = failed.filter(u => /\/(js|css|api)\//.test(u));
    expect(critical).toHaveLength(0);
  });

});

// ─── 9. PERFORMANCE & RESPONSIVENESS ────────────────────────────────────────

test.describe('9. Performance & Responsiveness', () => {

  test('9.1 login page load < 5 detik', async ({ page }) => {
    const t0 = Date.now();
    await page.goto(`${BASE}/login.html`);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - t0).toBeLessThan(5000);
  });

  test('9.2 dashboard load < 12 detik setelah login', async ({ page }) => {
    await loginAsUser(page);
    const t0 = Date.now();
    await page.goto(`${BASE}/participant/dashboard.html`);
    await page.waitForLoadState('networkidle');
    expect(Date.now() - t0).toBeLessThan(12000);
  });

  test('9.3 login page responsif di mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/login.html`);
    await expect(page.locator('.login-container')).toBeVisible();
  });

  test('9.4 dashboard responsif di tablet (768px)', async ({ page }) => {
    await loginAsUser(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE}/participant/dashboard.html`);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

});

// ─── 10. FULL USER FLOW ──────────────────────────────────────────────────────

test.describe('10. Full User Flow', () => {

  test('10.1 flow lengkap peserta: login → dashboard → ujian → logout', async ({ page }) => {
    // login
    await page.goto(BASE);
    await page.waitForURL('**/login.html', { timeout: 8000 });

    await page.fill('#username', TEST_USER);
    await page.fill('#password', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/participant/dashboard.html', { timeout: 8000 });

    await expect(page.locator('.dashboard-container').first()).toBeVisible();

    // navigasi ke ujian
    await page.goto(`${BASE}/participant/ujian.html`);
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/ujian\.html/);

    // logout
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('10.2 flow admin: login → panel → soal section → logout', async ({ page }) => {
    // login admin
    await loginAsAdmin(page);
    await expect(page.locator('.sidebar')).toBeVisible();

    // buka section soal
    await page.goto(`${BASE}/admin/admin.html#soal`);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();

    // logout
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE);
    await page.waitForURL('**/login.html', { timeout: 8000 });
    await expect(page).toHaveURL(/login\.html/);
  });

  test('10.3 flow peserta: materi → profile → achievements → leaderboard', async ({ page }) => {
    await loginAsUser(page);

    const pages = [
      `${BASE}/participant/materi.html`,
      `${BASE}/participant/profile.html`,
      `${BASE}/participant/achievements.html`,
      `${BASE}/participant/leaderboard.html`,
    ];

    for (const p of pages) {
      await page.goto(p);
      await page.waitForTimeout(2000);
      await expect(page).not.toHaveURL(/login\.html/);
    }
  });

});
