# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\test-bahan-pelajaran-admin.spec.js >> Bahan Pelajaran - Admin Test >> Navigate to Bahan Pelajaran section and check UI
- Location: tests\test-bahan-pelajaran-admin.spec.js:23:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost/bimbel/admin/admin.html", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - heading "Admin Panel" [level=4] [ref=e6]
        - paragraph
      - navigation [ref=e7]:
        - link " Dashboard" [ref=e8] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e9]: 
          - text: Dashboard
        - link " User Management" [ref=e10] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e11]: 
          - text: User Management
        - link " Partisipan" [ref=e12] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e13]: 
          - text: Partisipan
        - link " Soal" [ref=e14] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e15]: 
          - text: Soal
        - link " Kategori" [ref=e16] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e17]: 
          - text: Kategori
        - link " Topik Materi" [ref=e18] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e19]: 
          - text: Topik Materi
        - link " Statistik Soal" [ref=e20] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e21]: 
          - text: Statistik Soal
        - link " Pengaturan Leaderboard" [ref=e22] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e23]: 
          - text: Pengaturan Leaderboard
        - link " Paket Blueprint" [ref=e24] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e25]: 
          - text: Paket Blueprint
        - link " Paket Tryout" [ref=e26] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e27]: 
          - text: Paket Tryout
        - link " Sesi Ujian" [ref=e28] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e29]: 
          - text: Sesi Ujian
        - link " IRT Analysis" [ref=e30] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e31]: 
          - text: IRT Analysis
        - link " Bahan Pelajaran" [ref=e32] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e33]: 
          - text: Bahan Pelajaran
        - link " Tips & Triks" [ref=e34] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e35]: 
          - text: Tips & Triks
        - link " Hasil Ujian" [ref=e36] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e37]: 
          - text: Hasil Ujian
        - link " Content Generation" [ref=e38] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e39]: 
          - text: Content Generation
        - link " System Maintenance" [ref=e40] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e41]: 
          - text: System Maintenance
        - link " Course Management" [ref=e42] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e43]: 
          - text: Course Management
        - link " Gamification" [ref=e44] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e45]: 
          - text: Gamification
        - link " Notifications" [ref=e46] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e47]: 
          - text: Notifications
        - link " Logout" [ref=e48] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e49]: 
          - text: Logout
    - generic [ref=e50]:
      - text: 
      - generic [ref=e51]:
        - heading "Dashboard" [level=2] [ref=e52]
        - generic [ref=e53]:
          - generic [ref=e55]:
            - heading "0" [level=3] [ref=e56]
            - paragraph [ref=e57]: Total Soal
          - generic [ref=e59]:
            - heading "0" [level=3] [ref=e60]
            - paragraph [ref=e61]: Total Ujian
          - generic [ref=e63]:
            - heading "0" [level=3] [ref=e64]
            - paragraph [ref=e65]: Rata-rata Nilai
          - generic [ref=e67]:
            - heading "0%" [level=3] [ref=e68]
            - paragraph [ref=e69]: Tingkat Kelulusan
        - generic [ref=e70]:
          - heading "Analytics per Kategori" [level=5] [ref=e72]
          - generic [ref=e74]:
            - heading "Nilai Rata-rata per Kategori" [level=6] [ref=e76]
            - heading "Distribusi Kelulusan per Kategori" [level=6] [ref=e79]
        - heading "Tren Performa (7 Ujian Terakhir)" [level=5] [ref=e83]
        - generic [ref=e86]:
          - heading "Ujian Terbaru" [level=5] [ref=e88]
          - table [ref=e91]:
            - rowgroup [ref=e92]:
              - row "Tanggal Nama Peserta Nilai Total Status" [ref=e93]:
                - columnheader "Tanggal" [ref=e94]
                - columnheader "Nama Peserta" [ref=e95]
                - columnheader "Nilai Total" [ref=e96]
                - columnheader "Status" [ref=e97]
            - rowgroup
      - text:  + +  +    + +  +                      +       +  
  - text:  
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | test.describe('Bahan Pelajaran - Admin Test', () => {
  4   |     let page;
  5   |     const BASE_URL = 'http://localhost/bimbel/admin/admin.html';
  6   |     const AUTH_TOKEN = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
  7   | 
  8   |     test.beforeEach(async ({ browser }) => {
  9   |         page = await browser.newPage();
> 10  |         await page.goto(BASE_URL);
      |                    ^ Error: page.goto: Target page, context or browser has been closed
  11  |         
  12  |         // Login
  13  |         await page.fill('#username', 'admin');
  14  |         await page.fill('#password', 'admin123');
  15  |         await page.click('button[type="submit"]');
  16  |         await page.waitForURL('**/admin.html', { timeout: 10000 });
  17  |     });
  18  | 
  19  |     test.afterEach(async () => {
  20  |         await page.close();
  21  |     });
  22  | 
  23  |     test('Navigate to Bahan Pelajaran section and check UI', async () => {
  24  |         // Navigate to Bahan Pelajaran section
  25  |         await page.click('a[onclick="showSection(\'bahanPelajaran\')"]');
  26  |         await page.waitForTimeout(2000);
  27  | 
  28  |         // Check section is visible
  29  |         const section = page.locator('#bahanPelajaranSection');
  30  |         await expect(section).toBeVisible();
  31  | 
  32  |         // Check heading
  33  |         const heading = page.locator('#bahanPelajaranSection h2');
  34  |         await expect(heading).toContainText('Bahan Pelajaran');
  35  | 
  36  |         // Check add button
  37  |         const addButton = page.locator('#bahanPelajaranSection button.btn-success');
  38  |         await expect(addButton).toBeVisible();
  39  |         await expect(addButton).toContainText('Tambah Bahan');
  40  | 
  41  |         // Check category filter
  42  |         const categoryFilter = page.locator('#bahanKategoriFilter');
  43  |         await expect(categoryFilter).toBeVisible();
  44  | 
  45  |         // Check table
  46  |         const table = page.locator('#bahanPelajaranTable');
  47  |         await expect(table).toBeVisible();
  48  | 
  49  |         console.log('Bahan Pelajaran UI loaded successfully');
  50  |     });
  51  | 
  52  |     test('Test Bahan Pelajaran category filter', async () => {
  53  |         // Navigate to Bahan Pelajaran section
  54  |         await page.click('a[onclick="showSection(\'bahanPelajaran\')"]');
  55  |         await page.waitForTimeout(2000);
  56  | 
  57  |         // Get category filter
  58  |         const categoryFilter = page.locator('#bahanKategoriFilter');
  59  |         
  60  |         // Get available options
  61  |         const options = await categoryFilter.locator('option').all();
  62  |         console.log('Category filter options:');
  63  |         for (const opt of options) {
  64  |             const value = await opt.getAttribute('value');
  65  |             const text = await opt.textContent();
  66  |             console.log(`  value="${value}", text="${text}"`);
  67  |         }
  68  | 
  69  |         // Check that values are numeric IDs
  70  |         if (options.length > 1) {
  71  |             const firstCatOption = options[1];
  72  |             const catValue = await firstCatOption.getAttribute('value');
  73  |             console.log('First category value:', catValue);
  74  |             expect(catValue).toMatch(/^\d+$/); // Should be numeric
  75  |         }
  76  | 
  77  |         // Select first category option (numeric ID)
  78  |         if (options.length > 1) {
  79  |             const firstCatOption = options[1];
  80  |             const catValue = await firstCatOption.getAttribute('value');
  81  |             console.log('Selecting category:', catValue);
  82  |             await categoryFilter.selectOption(catValue);
  83  |             await page.waitForTimeout(2000);
  84  |         }
  85  | 
  86  |         const filteredRows = await page.locator('#bahanPelajaranTable tr').all();
  87  |         console.log('Filtered row count:', filteredRows.length);
  88  | 
  89  |         // Take screenshot
  90  |         await page.screenshot({ path: 'playwright-screenshots/bahan-pelajaran-filter.png' });
  91  |     });
  92  | 
  93  |     test('Test Bahan Pelajaran modal', async () => {
  94  |         // Navigate to Bahan Pelajaran section
  95  |         await page.click('a[onclick="showSection(\'bahanPelajaran\')"]');
  96  |         await page.waitForTimeout(2000);
  97  | 
  98  |         // Click add button
  99  |         await page.click('#bahanPelajaranSection button.btn-success');
  100 |         await page.waitForTimeout(1000);
  101 | 
  102 |         // Check modal is visible
  103 |         const modal = page.locator('#bahanPelajaranModal');
  104 |         await expect(modal).toBeVisible();
  105 | 
  106 |         // Check modal title
  107 |         const modalTitle = page.locator('#bahanPelajaranModalLabel');
  108 |         await expect(modalTitle).toContainText('Kelola Bahan Pelajaran');
  109 | 
  110 |         // Check category dropdown in modal
```