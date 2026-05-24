const { test } = require('@playwright/test');
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

test('Batalkan Ujian - verifikasi via DOM class', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/participant/ujian.html`);
    await page.waitForTimeout(3000);
    await page.selectOption('#examTypeSelection', { index: 1 });
    await page.waitForTimeout(2000);
    await page.selectOption('#paketSelection', { index: 1 });
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Mulai Ujian")');
    await page.waitForTimeout(4000);

    // Jawab 3 soal
    await page.locator('.option-label').nth(2).click();
    await page.waitForTimeout(800);
    await page.locator('.option-label').nth(0).click();
    await page.waitForTimeout(800);
    await page.locator('.option-label').nth(3).click();
    await page.waitForTimeout(800);

    // Klik batalkan
    await page.locator('button:has-text("Batalkan Ujian")').first().click();
    await page.waitForTimeout(1000);
    
    // Klik Ya
    await page.locator('#confirmModalOK').click();
    await page.waitForTimeout(2000);

    // Verifikasi via class DOM (bukan isVisible yang bergantung viewport)
    const welcomeHidden = await page.evaluate(() => {
        const el = document.getElementById('welcomeScreen');
        return el ? el.classList.contains('hidden') : 'not found';
    });
    const examHidden = await page.evaluate(() => {
        const el = document.getElementById('examScreen');
        return el ? el.classList.contains('hidden') : 'not found';
    });
    const historyHidden = await page.evaluate(() => {
        const el = document.getElementById('historyScreen');
        return el ? el.classList.contains('hidden') : 'not found';
    });
    const sessionClean = await page.evaluate(() => sessionStorage.getItem('examAnswers') === null);
    const examActive = await page.evaluate(() => typeof examIsActive !== 'undefined' ? examIsActive : 'undefined');
    const timerRunning = await page.evaluate(() => typeof timerInterval !== 'undefined' ? timerInterval !== null : 'undefined');

    console.log('\n=== VERIFIKASI STATE SETELAH BATALKAN ===');
    console.log('welcomeScreen.hidden:', !welcomeHidden ? '✅ TAMPIL (class hidden dilepas)' : '❌ MASIH HIDDEN');
    console.log('examScreen.hidden:', examHidden ? '✅ TERSEMBUNYI' : '❌ MASIH TAMPIL');
    console.log('historyScreen.hidden:', historyHidden ? '✅ TERSEMBUNYI' : '❌ MASIH TAMPIL');
    console.log('sessionStorage bersih:', sessionClean ? '✅ BERSIH' : '❌ MASIH ADA DATA');
    console.log('examIsActive:', examActive === false ? '✅ false (tidak aktif)' : '❌ ' + examActive);
    console.log('timerInterval null:', timerRunning === false ? '✅ Timer berhenti' : '❌ Timer masih jalan: ' + timerRunning);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/batalkan-final.png' });
    console.log('📸 Screenshot: test-results/batalkan-final.png');
});
