# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\test-bahan-pelajaran-admin.spec.js >> Bahan Pelajaran - Admin Test >> Test Bahan Pelajaran modal
- Location: tests\test-bahan-pelajaran-admin.spec.js:93:5

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
      - button " Menu" [ref=e51]:
        - generic [ref=e52]: 
        - text: Menu
      - generic [ref=e53]:
        - heading "Dashboard" [level=2] [ref=e54]
        - generic [ref=e55]:
          - generic [ref=e57]:
            - heading "0" [level=3] [ref=e58]
            - paragraph [ref=e59]: Total Soal
          - generic [ref=e61]:
            - heading "0" [level=3] [ref=e62]
            - paragraph [ref=e63]: Total Ujian
          - generic [ref=e65]:
            - heading "0" [level=3] [ref=e66]
            - paragraph [ref=e67]: Rata-rata Nilai
          - generic [ref=e69]:
            - heading "0%" [level=3] [ref=e70]
            - paragraph [ref=e71]: Tingkat Kelulusan
        - generic [ref=e72]:
          - heading "Analytics per Kategori" [level=5] [ref=e74]
          - generic [ref=e76]:
            - heading "Nilai Rata-rata per Kategori" [level=6] [ref=e78]
            - heading "Distribusi Kelulusan per Kategori" [level=6] [ref=e81]
        - heading "Tren Performa (7 Ujian Terakhir)" [level=5] [ref=e85]
        - generic [ref=e88]:
          - heading "Ujian Terbaru" [level=5] [ref=e90]
          - table [ref=e93]:
            - rowgroup [ref=e94]:
              - row "Tanggal Nama Peserta Nilai Total Status" [ref=e95]:
                - columnheader "Tanggal" [ref=e96]
                - columnheader "Nama Peserta" [ref=e97]
                - columnheader "Nilai Total" [ref=e98]
                - columnheader "Status" [ref=e99]
            - rowgroup
      - text:  + +  +    + +  +                      +       +  
  - generic [ref=e102]:
    - generic [ref=e103]:
      - heading [level=5] [ref=e104]: Kelola Paket Blueprint
      - button [ref=e105]
    - generic [ref=e107]:
      - generic [ref=e108]:
        - text: Paket
        - combobox [ref=e109]
      - generic [ref=e110]:
        - text: Kategori
        - combobox [ref=e111]
      - generic [ref=e112]:
        - text: Target Count
        - spinbutton [ref=e113]
      - generic [ref=e114]:
        - text: Min Difficulty
        - combobox [ref=e115]
      - generic [ref=e116]:
        - text: Max Difficulty
        - combobox [ref=e117]
    - generic [ref=e118]:
      - button [ref=e119]: Batal
      - button [ref=e120]: Simpan
      - button [ref=e121]: Validasi
  - generic [ref=e124]:
    - generic [ref=e125]:
      - heading [level=5] [ref=e126]: Kelola Bahan Pelajaran
      - button [ref=e127]
    - generic [ref=e129]:
      - generic [ref=e130]:
        - text: Kategori
        - combobox [ref=e131]
      - generic [ref=e132]:
        - text: Topik
        - combobox [ref=e133]
      - generic [ref=e134]:
        - text: Soal ID
        - spinbutton [ref=e135]
      - generic [ref=e136]:
        - text: Judul
        - textbox [ref=e137]
      - generic [ref=e138]:
        - text: Tipe
        - combobox [ref=e139]
      - generic [ref=e140]:
        - text: Konten
        - textbox [ref=e141]
      - generic [ref=e142]:
        - text: URL (untuk tipe link)
        - textbox [ref=e143]
      - generic [ref=e144]:
        - text: Upload File (untuk tipe video/pdf)
        - button [ref=e145]
      - generic [ref=e146]:
        - text: Urutan
        - spinbutton [ref=e147]: "0"
    - generic [ref=e148]:
      - button [ref=e149]: Batal
      - button [ref=e150]: Simpan
  - generic [ref=e153]:
    - generic [ref=e154]:
      - heading [level=5] [ref=e155]: Preview Konten
      - button [ref=e156]
    - generic [ref=e159]:
      - button [ref=e160]: Tutup
      - link [ref=e161] [cursor=pointer]:
        - /url: "#"
        - text: Buka di Tab Baru
  - generic [ref=e164]:
    - generic [ref=e165]:
      - heading [level=5] [ref=e166]: Kelola Tips & Triks
      - button [ref=e167]
    - generic [ref=e169]:
      - generic [ref=e170]:
        - text: Kategori
        - combobox [ref=e171]
      - generic [ref=e172]:
        - text: Tipe Tips
        - combobox [ref=e173]
      - generic [ref=e174]:
        - text: Judul
        - textbox [ref=e175]
      - generic [ref=e176]:
        - text: Konten
        - textbox [ref=e177]
      - generic [ref=e178]:
        - text: Contoh (Opsional)
        - textbox [ref=e179]
      - generic [ref=e180]:
        - text: Prioritas
        - spinbutton [ref=e181]: "0"
    - generic [ref=e182]:
      - button [ref=e183]: Batal
      - button [ref=e184]: Simpan
  - generic "AI Generator Soal" [ref=e185]:
    - generic [ref=e187]:
      - generic [ref=e188]:
        - heading "AI Generator Soal" [level=1] [ref=e189]
        - button "Tutup" [ref=e190]
      - generic [ref=e191]:
        - generic [ref=e192]:
          - text: Tipe Generator
          - combobox [ref=e193]:
            - option "Matematika Sederhana" [selected]
            - option "Logika Pemikiran"
            - option "Pengetahuan Umum"
        - generic [ref=e194]:
          - text: Topik
          - combobox [ref=e195]:
            - option "Pilih Topik (Opsional)" [selected]
        - generic [ref=e196]:
          - text: Kategori
          - combobox [ref=e197]:
            - option "Pilih Kategori" [selected]
        - generic [ref=e198]:
          - text: Jumlah Soal
          - spinbutton [ref=e199]: "5"
        - generic [ref=e200]:
          - generic [ref=e201]: 
          - text: AI Generator akan membuat soal berdasarkan template yang tersedia. Untuk hasil yang lebih baik, gunakan AI API eksternal (OpenAI, dll).
      - generic [ref=e202]:
        - button "Batal" [ref=e203]
        - button " Generate Soal" [ref=e204]:
          - generic [ref=e205]: 
          - text: Generate Soal
  - generic [ref=e208]:
    - generic [ref=e209]:
      - heading [level=5] [ref=e210]: Tambah Soal
      - button [ref=e211]
    - generic [ref=e213]:
      - generic [ref=e214]:
        - text: Kategori
        - combobox [ref=e215]
      - generic [ref=e216]:
        - text: Kelompok Materi (Topik)
        - combobox [ref=e217]
      - generic [ref=e218]:
        - text: Pertanyaan
        - textbox [ref=e219]
        - generic [ref=e220]:
          - text: Gambar Pertanyaan (Opsional)
          - button [ref=e221]
      - generic [ref=e222]:
        - generic [ref=e223]:
          - text: Opsi A
          - textbox [ref=e224]
          - generic [ref=e225]:
            - text: Gambar Opsi A (Opsional)
            - button [ref=e226]
        - generic [ref=e227]:
          - text: Opsi B
          - textbox [ref=e228]
          - generic [ref=e229]:
            - text: Gambar Opsi B (Opsional)
            - button [ref=e230]
        - generic [ref=e231]:
          - text: Opsi C
          - textbox [ref=e232]
          - generic [ref=e233]:
            - text: Gambar Opsi C (Opsional)
            - button [ref=e234]
        - generic [ref=e235]:
          - text: Opsi D
          - textbox [ref=e236]
          - generic [ref=e237]:
            - text: Gambar Opsi D (Opsional)
            - button [ref=e238]
        - generic [ref=e239]:
          - text: Opsi E
          - textbox [ref=e240]
          - generic [ref=e241]:
            - text: Gambar Opsi E (Opsional)
            - button [ref=e242]
        - generic [ref=e243]:
          - text: Jawaban Benar
          - combobox [ref=e244]
      - generic [ref=e245]:
        - text: Pembahasan (Opsional)
        - textbox [ref=e246]
        - generic [ref=e247]:
          - text: Gambar Pembahasan (Opsional)
          - button [ref=e248]
    - generic [ref=e249]:
      - button [ref=e250]: Batal
      - button [ref=e251]: Simpan
  - generic [ref=e254]:
    - generic [ref=e255]:
      - heading [level=5] [ref=e256]: Kelola User
      - button [ref=e257]
    - generic [ref=e259]:
      - generic [ref=e260]:
        - text: Username
        - textbox [ref=e261]
      - generic [ref=e262]:
        - text: Full Name
        - textbox [ref=e263]
      - generic [ref=e264]:
        - text: Role
        - combobox [ref=e265]
      - generic [ref=e266]:
        - text: Phone
        - textbox [ref=e267]
      - generic [ref=e268]:
        - text: School
        - textbox [ref=e269]
    - generic [ref=e270]:
      - button [ref=e271]: Batal
      - button [ref=e272]: Simpan
  - generic [ref=e275]:
    - generic [ref=e276]:
      - heading [level=5] [ref=e277]: Kelola Paket Tryout
      - button [ref=e278]
    - generic [ref=e280]:
      - generic [ref=e281]:
        - text: Package Name
        - textbox [ref=e282]
      - generic [ref=e283]:
        - text: Description
        - textbox [ref=e284]
      - generic [ref=e285]:
        - text: Duration (minutes)
        - spinbutton [ref=e286]: "100"
      - generic [ref=e287]:
        - text: Category
        - combobox [ref=e288]
      - generic [ref=e289]:
        - text: Total Questions
        - spinbutton [ref=e290]: "30"
      - generic [ref=e292]:
        - checkbox [checked] [ref=e293]
        - text: Active
    - generic [ref=e294]:
      - button [ref=e295]: Batal
      - button [ref=e296]: Simpan
  - generic [ref=e299]:
    - generic [ref=e300]:
      - heading [level=5] [ref=e301]: Alert
      - button [ref=e302]
    - button [ref=e304]: OK
  - generic [ref=e307]:
    - generic [ref=e308]:
      - heading [level=5] [ref=e309]: Konfirmasi
      - button [ref=e310]
    - generic [ref=e311]:
      - button [ref=e312]: Batal
      - button [ref=e313]: Ya
  - generic [ref=e316]:
    - status [ref=e317]: Loading...
    - paragraph [ref=e318]: Memuat...
  - generic [ref=e321]:
    - generic [ref=e322]:
      - heading [level=5] [ref=e323]: Kelola Topik
      - button [ref=e324]
    - generic [ref=e326]:
      - generic [ref=e327]:
        - text: Kategori
        - combobox [ref=e328]
      - generic [ref=e329]:
        - text: Nama Topik
        - textbox [ref=e330]
      - generic [ref=e331]:
        - text: Keyword
        - textbox [ref=e332]
      - generic [ref=e333]:
        - text: Deskripsi
        - textbox [ref=e334]
      - generic [ref=e335]:
        - text: Urutan
        - spinbutton [ref=e336]: "0"
    - generic [ref=e337]:
      - button [ref=e338]: Batal
      - button [ref=e339]: Simpan
  - generic [ref=e342]:
    - generic [ref=e343]:
      - heading [level=5] [ref=e344]: Detail Topik
      - button [ref=e345]
    - button [ref=e347]: Tutup
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