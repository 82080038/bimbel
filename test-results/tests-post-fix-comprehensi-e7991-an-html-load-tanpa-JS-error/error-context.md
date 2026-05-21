# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/post-fix-comprehensive.spec.js >> 3. Ujian Page >> ujian.html load tanpa JS error
- Location: tests/post-fix-comprehensive.spec.js:158:5

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  ["[pageerror] Unexpected token '}'"]
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
  65  | // ═══════════════════════════════════════════════════════════
  66  | test.describe('1. Login Flow', () => {
  67  | 
  68  |     test('Login admin → redirect ke admin panel', async ({ page }) => {
  69  |         const errors = collectErrors(page);
  70  |         await page.goto(`${BASE}/login.html`);
  71  |         await page.fill('#username', ADMIN.username);
  72  |         await page.fill('#password', ADMIN.password);
  73  |         await page.click('button[type=submit]');
  74  |         await page.waitForURL('**/admin/**', { timeout: 8000 });
  75  |         expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  76  |     });
  77  | 
  78  |     test('Login user → redirect ke dashboard (bukan ujian)', async ({ page }) => {
  79  |         const errors = collectErrors(page);
  80  |         await page.goto(`${BASE}/login.html`);
  81  |         await page.fill('#username', USER.username);
  82  |         await page.fill('#password', USER.password);
  83  |         await page.click('button[type=submit]');
  84  |         await page.waitForURL('**/dashboard.html', { timeout: 8000 });
  85  |         expect(page.url()).not.toContain('ujian.html');
  86  |         expect(page.url()).not.toContain('action=');
  87  |         expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  88  |     });
  89  | 
  90  |     test('Login membersihkan sessionStorage (tidak resume exam lama)', async ({ page }) => {
  91  |         // Simulasi ada exam lama di sessionStorage
  92  |         await page.goto(`${BASE}/login.html`);
  93  |         await page.evaluate(() => {
  94  |             sessionStorage.setItem('examAnswers', JSON.stringify({ 1: 'A', 2: 'B' }));
  95  |             sessionStorage.setItem('examStartTime', Date.now().toString());
  96  |         });
  97  |         await page.fill('#username', USER.username);
  98  |         await page.fill('#password', USER.password);
  99  |         await page.click('button[type=submit]');
  100 |         await page.waitForURL('**/dashboard.html', { timeout: 8000 });
  101 |         const examAnswers = await page.evaluate(() => sessionStorage.getItem('examAnswers'));
  102 |         expect(examAnswers).toBeNull();
  103 |     });
  104 | 
  105 |     test('URL login tidak ada ?redirect= yang mengarah ke ujian', async ({ page }) => {
  106 |         await page.goto(`${BASE}/login.html`);
  107 |         await page.fill('#username', USER.username);
  108 |         await page.fill('#password', USER.password);
  109 |         await page.click('button[type=submit]');
  110 |         await page.waitForURL('**/dashboard.html', { timeout: 8000 });
  111 |         expect(page.url()).not.toContain('redirect=');
  112 |         expect(page.url()).not.toContain('action=start_exam');
  113 |     });
  114 | 
  115 | });
  116 | 
  117 | // ═══════════════════════════════════════════════════════════
  118 | // SUITE 2: API Endpoints - Tidak Ada 401 untuk Public Actions
  119 | // ═══════════════════════════════════════════════════════════
  120 | test.describe('2. API Public Endpoints (no 401)', () => {
  121 | 
  122 |     test('get_exam_types tidak 401', async ({ request }) => {
  123 |         const res = await request.get(`${BASE}/api/soal.php?action=get_exam_types`);
  124 |         expect(res.status()).not.toBe(401);
  125 |         // Rate limiting (429) is acceptable as it's a protection mechanism
  126 |         expect(res.status() === 200 || res.status() === 429).toBeTruthy();
  127 |     });
  128 | 
  129 |     test('get_kategori tidak 401', async ({ request }) => {
  130 |         const res = await request.get(`${BASE}/api/soal.php?action=get_kategori`);
  131 |         expect(res.status()).not.toBe(401);
  132 |         // Rate limiting (429) is acceptable as it's a protection mechanism
  133 |         expect(res.status() === 200 || res.status() === 429).toBeTruthy();
  134 |     });
  135 | 
  136 |     test('get_exam_types mengembalikan data valid', async ({ request }) => {
  137 |         const res = await request.get(`${BASE}/api/soal.php?action=get_exam_types`);
  138 |         // Rate limiting (429) is acceptable as it's a protection mechanism
  139 |         if (res.status() === 429) {
  140 |             console.log('⚠️ Rate limiting (429) - skipping data validation');
  141 |             return;
  142 |         }
  143 |         const data = await res.json();
  144 |         expect(data.success).toBeTruthy();
  145 |     });
  146 | 
  147 | });
  148 | 
  149 | // ═══════════════════════════════════════════════════════════
  150 | // SUITE 3: Ujian Page - No JS Errors, Navigasi Benar
  151 | // ═══════════════════════════════════════════════════════════
  152 | test.describe('3. Ujian Page', () => {
  153 | 
  154 |     test.beforeEach(async ({ page }) => {
  155 |         await injectToken(page, USER);
  156 |     });
  157 | 
  158 |     test('ujian.html load tanpa JS error', async ({ page }) => {
  159 |         const errors = collectErrors(page);
  160 |         await page.goto(`${BASE}/participant/ujian.html`);
  161 |         await page.waitForLoadState('load');
  162 |         const realErrors = errors.filter(e =>
  163 |             !e.includes('favicon') && !e.includes('net::ERR')
  164 |         );
> 165 |         expect(realErrors).toHaveLength(0);
      |                            ^ Error: expect(received).toHaveLength(expected)
  166 |     });
  167 | 
  168 |     test('ujian.html?action=history - showHistoryScreen tanpa TypeError', async ({ page }) => {
  169 |         const errors = collectErrors(page);
  170 |         await page.goto(`${BASE}/participant/ujian.html?action=history`);
  171 |         await page.waitForLoadState('load');
  172 |         const typeErrors = errors.filter(e => e.includes('TypeError') || e.includes('classList'));
  173 |         expect(typeErrors).toHaveLength(0);
  174 |     });
  175 | 
  176 |     test('Halaman history menampilkan historyScreen', async ({ page }) => {
  177 |         await page.goto(`${BASE}/participant/ujian.html?action=history`);
  178 |         await page.waitForLoadState('load');
  179 |         await page.waitForTimeout(5000); // Increased timeout for dynamic loading
  180 |         // Wait for historyScreen to be visible
  181 |         await page.waitForSelector('#historyScreen:not(.hidden)', { timeout: 10000 });
  182 |         const historyVisible = await page.locator('#historyScreen').evaluate(
  183 |             el => !el.classList.contains('hidden')
  184 |         );
  185 |         expect(historyVisible).toBe(true);
  186 |     });
  187 | 
  188 |     test('Tombol Kembali di historyScreen mengarah ke dashboard.html', async ({ page }) => {
  189 |         await page.goto(`${BASE}/participant/ujian.html?action=history`);
  190 |         await page.waitForLoadState('load');
  191 |         await page.waitForTimeout(5000); // Increased timeout
  192 |         // Wait for historyScreen and button to be visible
  193 |         await page.waitForSelector('#historyScreen:not(.hidden)', { timeout: 10000 });
  194 |         await page.waitForSelector('#historyScreen .btn-primary-custom', { timeout: 10000, state: 'visible' });
  195 |         await page.locator('#historyScreen .btn-primary-custom').click();
  196 |         await expect(page).toHaveURL(/dashboard\.html/);
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
```