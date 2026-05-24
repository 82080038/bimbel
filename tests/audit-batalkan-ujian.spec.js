const { test, expect } = require('@playwright/test');
const BASE = 'http://localhost/bimbel';
const CREDS = { u: 'fresh_user_11778919457', p: 'simulasi123' };

async function login(page) {
    await page.goto(`${BASE}/login.html`);
    await page.waitForLoadState('networkidle');
    await page.fill('#username', CREDS.u);
    await page.fill('#password', CREDS.p);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard.html', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
}

test('Batalkan Ujian - tombol & konfirmasi', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/participant/ujian.html`);
    await page.waitForTimeout(3000);
    await page.selectOption('#examTypeSelection', { index: 1 });
    await page.waitForTimeout(2000);
    await page.selectOption('#paketSelection', { index: 1 });
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Mulai Ujian")');
    await page.waitForTimeout(4000);

    // Verifikasi ujian aktif
    const examVisible = await page.locator('#examScreen').isVisible();
    console.log('Ujian aktif:', examVisible ? '✅ YA' : '❌ TIDAK');

    // Jawab beberapa soal dulu
    await page.locator('.option-label').nth(0).click();
    await page.waitForTimeout(800);
    await page.locator('.option-label').nth(1).click();
    await page.waitForTimeout(800);

    // Cek tombol Batalkan ada di header
    const btnHeader = page.locator('button:has-text("Batalkan Ujian")').first();
    const btnHeaderExists = await btnHeader.isVisible();
    console.log('Tombol Batalkan (header):', btnHeaderExists ? '✅ ADA' : '❌ TIDAK ADA');

    // Cek tombol Batalkan ada di bawah navigasi
    const btnBottom = page.locator('button:has-text("Batalkan & Keluar")');
    const btnBottomExists = await btnBottom.isVisible();
    console.log('Tombol Batalkan (bawah):', btnBottomExists ? '✅ ADA' : '❌ TIDAK ADA');

    await page.screenshot({ path: 'test-results/ujian-active-before-cancel.png' });

    // Klik Batalkan Ujian
    await btnHeader.click();
    await page.waitForTimeout(1000);

    // Konfirmasi dialog muncul
    const confirmModal = await page.locator('#confirmModal').isVisible();
    console.log('Dialog konfirmasi muncul:', confirmModal ? '✅ YA' : '❌ TIDAK');

    // Cek pesan berisi info soal dijawab
    const modalText = await page.locator('#confirmModal .modal-body, #confirmModalMessage').first().textContent().catch(() => '');
    console.log('Isi dialog:', modalText.trim().substring(0, 120));
    const hasSoalInfo = modalText.includes('soal');
    console.log('Info jumlah soal dijawab:', hasSoalInfo ? '✅ ADA' : '⚠️  TIDAK ADA');

    await page.screenshot({ path: 'test-results/ujian-konfirmasi-batal.png' });

    // Klik OK (batalkan)
    await page.locator('#confirmModalOK, button:has-text("OK"), button:has-text("Ya")').first().click();
    await page.waitForTimeout(1500);

    // Verifikasi kembali ke welcome screen
    const welcomeVisible = await page.locator('#welcomeScreen').isVisible();
    const examHidden = !(await page.locator('#examScreen').isVisible());
    console.log('\n=== HASIL PEMBATALAN ===');
    console.log('Welcome screen tampil:', welcomeVisible ? '✅ YA' : '❌ TIDAK');
    console.log('Exam screen tersembunyi:', examHidden ? '✅ YA' : '❌ TIDAK');

    // Verifikasi sessionStorage bersih
    const examAnswers = await page.evaluate(() => sessionStorage.getItem('examAnswers'));
    console.log('sessionStorage examAnswers:', examAnswers === null ? '✅ BERSIH (null)' : '⚠️  ' + examAnswers);

    await page.screenshot({ path: 'test-results/ujian-after-cancel.png' });

    // Verifikasi bisa mulai ujian baru
    const mulaiBtn = await page.locator('button:has-text("Mulai Ujian")').first().isVisible();
    console.log('Tombol Mulai Ujian tersedia kembali:', mulaiBtn ? '✅ YA' : '❌ TIDAK');
});
