# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/post-fix-comprehensive.spec.js >> 5. Navigasi Kembali ke Dashboard >> History screen: tombol Kembali ke Dashboard berfungsi
- Location: tests/post-fix-comprehensive.spec.js:292:5

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('#historyScreen:not(.hidden)') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "" [ref=e4] [cursor=pointer]:
    - generic [ref=e5]: 
  - generic [ref=e8]:
    - generic [ref=e9]:
      - heading " Aplikasi Ujian Sekolah Kedinasan" [level=2] [ref=e10]:
        - generic [ref=e11]: 
        - text: Aplikasi Ujian Sekolah Kedinasan
      - paragraph [ref=e12]: "Sistem Seleksi Kompetensi Dasar (SKD) dengan fitur lengkap: pilihan ganda, timer, pengacakan soal, dan pembahasan"
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: 
        - heading "TWK" [level=5] [ref=e16]
        - paragraph [ref=e17]:
          - text: Tes Wawasan Kebangsaan
          - text: 30 Soal
          - text: "Passing Grade: 65"
      - generic [ref=e18]:
        - generic [ref=e19]: 
        - heading "TIU" [level=5] [ref=e20]
        - paragraph [ref=e21]:
          - text: Tes Intelegensi Umum
          - text: 35 Soal
          - text: "Passing Grade: 80"
      - generic [ref=e22]:
        - generic [ref=e23]: 
        - heading "TKP" [level=5] [ref=e24]
        - paragraph [ref=e25]:
          - text: Tes Karakteristik Pribadi
          - text: 35 Soal
          - text: "Passing Grade: 166"
      - generic [ref=e26]:
        - generic [ref=e27]: 
        - heading "TPA" [level=5] [ref=e28]
        - paragraph [ref=e29]:
          - text: Tes Potensi Akademik
          - text: Bahasa, Numerik, Logika
          - text: "Passing Grade: 70"
      - generic [ref=e30]:
        - generic [ref=e31]: 
        - heading "PSIKOLOGIS" [level=5] [ref=e32]
        - paragraph [ref=e33]:
          - text: Tes Psikologis
          - text: Kepribadian, Motivasi
          - text: "Passing Grade: 166"
    - generic [ref=e34]:
      - heading " Tips Mengerjakan Ujian:" [level=4] [ref=e35]:
        - generic [ref=e36]: 
        - text: "Tips Mengerjakan Ujian:"
      - list [ref=e37]:
        - listitem [ref=e38]:
          - strong [ref=e39]: Jangan terburu-buru
          - text: "- Kelola waktu dengan baik dan tetap tenang"
        - listitem [ref=e40]:
          - strong [ref=e41]: Fokus dan teliti
          - text: "- Perhatikan setiap soal dengan seksama"
        - listitem [ref=e42]:
          - strong [ref=e43]: Kerjakan yang bisa dulu
          - text: "- Lewati soal sulit dan kembali lagi nanti"
        - listitem [ref=e44]:
          - strong [ref=e45]: Strategi pengerjaan
          - text: "- TWK dulu, lalu TKP, terakhir TIU (butuh waktu hitungan)"
    - generic [ref=e47]:
      - generic [ref=e48]: 
      - generic [ref=e49]:
        - generic [ref=e50]: Peserta
        - generic [ref=e51]: Memuat...
    - generic [ref=e52]:
      - generic [ref=e53]: "Jenis Ujian:"
      - combobox [ref=e54]:
        - option "Memuat jenis ujian..." [selected]
      - text: Pilih jenis ujian sesuai kebutuhan Anda
    - generic [ref=e55]:
      - generic [ref=e56]: "Pilih Paket Ujian:"
      - combobox [disabled] [ref=e57]:
        - option "Pilih jenis ujian terlebih dahulu" [selected]
    - generic [ref=e58]:
      - button " Mulai Ujian" [ref=e59] [cursor=pointer]:
        - generic [ref=e60]: 
        - text: Mulai Ujian
      - button " Mode Latihan" [ref=e61] [cursor=pointer]:
        - generic [ref=e62]: 
        - text: Mode Latihan
      - button " Lihat Tips & Trik" [ref=e63] [cursor=pointer]:
        - generic [ref=e64]: 
        - text: Lihat Tips & Trik
      - button " Riwayat Ujian" [ref=e65] [cursor=pointer]:
        - generic [ref=e66]: 
        - text: Riwayat Ujian
```

# Test source

```ts
  197 |     });
  198 | 
  199 |     test('Welcome screen: dropdown exam type tersedia (tidak 401)', async ({ page }) => {
  200 |         await page.goto(`${BASE}/participant/ujian.html`);
  201 |         await page.waitForLoadState('load');
  202 |         const examTypeOptions = await page.locator('#examTypeSelection option').count();
  203 |         expect(examTypeOptions).toBeGreaterThan(0);
  204 |     });
  205 | 
  206 |     test('Tidak ada native alert() dipanggil saat error soal', async ({ page }) => {
  207 |         let alertFired = false;
  208 |         page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });
  209 |         await page.goto(`${BASE}/participant/ujian.html`);
  210 |         await page.waitForLoadState('load');
  211 |         // Trigger mulaiUjian tanpa paket (harus pakai showToast bukan alert)
  212 |         await page.evaluate(() => {
  213 |             if (typeof mulaiUjian === 'function') mulaiUjian();
  214 |         });
  215 |         await page.waitForTimeout(2000);
  216 |         expect(alertFired).toBe(false);
  217 |     });
  218 | 
  219 | });
  220 | 
  221 | // ═══════════════════════════════════════════════════════════
  222 | // SUITE 4: initAfterLoad() Pattern - Achievements, Leaderboard, Materi
  223 | // ═══════════════════════════════════════════════════════════
  224 | test.describe('4. initAfterLoad() pada semua halaman', () => {
  225 | 
  226 |     test.beforeEach(async ({ page }) => {
  227 |         await injectToken(page, USER);
  228 |     });
  229 | 
  230 |     test('achievements.html - load tanpa JS error, konten tersedia', async ({ page }) => {
  231 |         const errors = collectErrors(page);
  232 |         await page.goto(`${BASE}/participant/achievements.html`);
  233 |         await page.waitForLoadState('load');
  234 |         await page.waitForTimeout(2000);
  235 |         const realErrors = errors.filter(e =>
  236 |             e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
  237 |         );
  238 |         expect(realErrors).toHaveLength(0);
  239 |         // Container achievements harus ada (injected)
  240 |         await expect(page.locator('#achievementsContent')).not.toBeEmpty();
  241 |     });
  242 | 
  243 |     test('leaderboard.html - load tanpa JS error, konten tersedia', async ({ page }) => {
  244 |         const errors = collectErrors(page);
  245 |         await page.goto(`${BASE}/participant/leaderboard.html`);
  246 |         await page.waitForLoadState('load');
  247 |         await page.waitForTimeout(2000);
  248 |         const realErrors = errors.filter(e =>
  249 |             e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
  250 |         );
  251 |         expect(realErrors).toHaveLength(0);
  252 |         await expect(page.locator('#leaderboardContent')).not.toBeEmpty();
  253 |     });
  254 | 
  255 |     test('leaderboard.html - filter change handlers terdaftar (tidak error)', async ({ page }) => {
  256 |         const errors = collectErrors(page);
  257 |         await page.goto(`${BASE}/participant/leaderboard.html`);
  258 |         await page.waitForLoadState('load');
  259 |         // Trigger filter change — seharusnya tidak throw error karena handler sudah terdaftar
  260 |         const filterExists = await page.locator('#periodFilter').count();
  261 |         if (filterExists > 0) {
  262 |             await page.selectOption('#periodFilter', { index: 0 });
  263 |             await page.waitForTimeout(500);
  264 |         }
  265 |         const typeErrors = errors.filter(e => e.includes('TypeError') || e.includes('null'));
  266 |         expect(typeErrors).toHaveLength(0);
  267 |     });
  268 | 
  269 |     test('materi.html - load tanpa JS error, konten tersedia', async ({ page }) => {
  270 |         const errors = collectErrors(page);
  271 |         await page.goto(`${BASE}/participant/materi.html`);
  272 |         await page.waitForLoadState('load');
  273 |         await page.waitForTimeout(2000);
  274 |         const realErrors = errors.filter(e =>
  275 |             e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
  276 |         );
  277 |         expect(realErrors).toHaveLength(0);
  278 |         await expect(page.locator('#materiContent')).not.toBeEmpty();
  279 |     });
  280 | 
  281 | });
  282 | 
  283 | // ═══════════════════════════════════════════════════════════
  284 | // SUITE 5: Navigasi Kembali ke Dashboard
  285 | // ═══════════════════════════════════════════════════════════
  286 | test.describe('5. Navigasi Kembali ke Dashboard', () => {
  287 | 
  288 |     test.beforeEach(async ({ page }) => {
  289 |         await injectToken(page, USER);
  290 |     });
  291 | 
  292 |     test('History screen: tombol Kembali ke Dashboard berfungsi', async ({ page }) => {
  293 |         await page.goto(`${BASE}/participant/ujian.html?action=history`);
  294 |         await page.waitForLoadState('load');
  295 |         await page.waitForTimeout(5000); // Increased timeout
  296 |         // Wait for historyScreen and button to be visible
> 297 |         await page.waitForSelector('#historyScreen:not(.hidden)', { timeout: 10000 });
      |                    ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  298 |         await page.waitForSelector('#historyScreen button', { timeout: 10000, state: 'visible' });
  299 |         const btn = page.locator('#historyScreen button', { hasText: 'Kembali ke Dashboard' });
  300 |         await expect(btn).toBeVisible();
  301 |         await btn.click();
  302 |         await expect(page).toHaveURL(/dashboard\.html/);
  303 |     });
  304 | 
  305 |     test('Dashboard: link "Lihat Detail" mengarah ke riwayat ujian', async ({ page }) => {
  306 |         await page.goto(`${BASE}/participant/dashboard.html`);
  307 |         await page.waitForLoadState('load');
  308 |         await page.waitForTimeout(2000);
  309 |         // Link Lihat Detail pakai viewHistory() bukan hardcode href
  310 |         const link = page.locator('a', { hasText: 'Lihat Detail' }).first();
  311 |         await expect(link).toBeVisible();
  312 |         await link.click();
  313 |         await page.waitForLoadState('load');
  314 |         await expect(page).toHaveURL(/ujian\.html/);
  315 |     });
  316 | 
  317 | });
  318 | 
  319 | // ═══════════════════════════════════════════════════════════
  320 | // SUITE 6: Duplicate Script Detection
  321 | // ═══════════════════════════════════════════════════════════
  322 | test.describe('6. Tidak Ada Duplicate Scripts', () => {
  323 | 
  324 |     test.beforeEach(async ({ page }) => {
  325 |         await injectToken(page, USER);
  326 |     });
  327 | 
  328 |     test('materi.html - Bootstrap tidak dimuat 2x', async ({ page }) => {
  329 |         await page.goto(`${BASE}/participant/materi.html`);
  330 |         await page.waitForLoadState('load');
  331 |         const bootstrapCount = await page.evaluate(() => {
  332 |             return Array.from(document.querySelectorAll('script[src]'))
  333 |                 .filter(s => s.src.includes('bootstrap.bundle'))
  334 |                 .length;
  335 |         });
  336 |         expect(bootstrapCount).toBeLessThanOrEqual(1);
  337 |     });
  338 | 
  339 |     test('achievements.html - Bootstrap tidak dimuat 2x', async ({ page }) => {
  340 |         await page.goto(`${BASE}/participant/achievements.html`);
  341 |         await page.waitForLoadState('load');
  342 |         const bootstrapCount = await page.evaluate(() => {
  343 |             return Array.from(document.querySelectorAll('script[src]'))
  344 |                 .filter(s => s.src.includes('bootstrap.bundle'))
  345 |                 .length;
  346 |         });
  347 |         expect(bootstrapCount).toBeLessThanOrEqual(1);
  348 |     });
  349 | 
  350 | });
  351 | 
  352 | // ═══════════════════════════════════════════════════════════
  353 | // SUITE 7: autocomplete attributes
  354 | // ═══════════════════════════════════════════════════════════
  355 | test.describe('7. Form Attributes (autocomplete)', () => {
  356 | 
  357 |     test('login.html - password field punya autocomplete', async ({ page }) => {
  358 |         await page.goto(`${BASE}/login.html`);
  359 |         const autocomplete = await page.locator('#password').getAttribute('autocomplete');
  360 |         expect(autocomplete).toBe('current-password');
  361 |     });
  362 | 
  363 |     test('register - password field punya autocomplete new-password', async ({ page }) => {
  364 |         await page.goto(`${BASE}/participant/register.html`);
  365 |         await page.waitForLoadState('load');
  366 |         const autocomplete = await page.locator('#password').getAttribute('autocomplete');
  367 |         expect(autocomplete).toBe('new-password');
  368 |     });
  369 | 
  370 | });
  371 | 
  372 | // ═══════════════════════════════════════════════════════════
  373 | // SUITE 8: Full Exam Flow (End-to-End)
  374 | // ═══════════════════════════════════════════════════════════
  375 | test.describe('8. Full Exam Flow', () => {
  376 |     test.setTimeout(60000);
  377 | 
  378 |     test('Welcome → Pilih Ujian → Mulai → Jawab → Selesai (no alert())', async ({ page }) => {
  379 |         const alerts = [];
  380 |         page.on('dialog', async dialog => {
  381 |             alerts.push(dialog.message());
  382 |             await dialog.dismiss();
  383 |         });
  384 | 
  385 |         await injectToken(page, USER);
  386 |         await page.goto(`${BASE}/participant/ujian.html`);
  387 |         await page.waitForLoadState('load');
  388 |         await page.waitForTimeout(1500);
  389 | 
  390 |         // Pastikan welcome screen muncul
  391 |         await expect(page.locator('#welcomeScreen')).not.toHaveClass(/hidden/);
  392 | 
  393 |         // Klik Mulai Ujian
  394 |         const mulaiBtn = page.locator('button', { hasText: /Mulai Ujian/i }).first();
  395 |         if (await mulaiBtn.isVisible()) {
  396 |             await mulaiBtn.click();
  397 |             await page.waitForLoadState('load');
```