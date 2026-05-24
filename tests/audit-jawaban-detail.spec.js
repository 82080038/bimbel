// Audit Detail Visual Pilihan Jawaban
const { test } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const CREDS = { username: 'fresh_user_11778919457', password: 'simulasi123' };

async function loginAs(page) {
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    await page.fill('#username', CREDS.username);
    await page.fill('#password', CREDS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard.html', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
}

test('Audit Visual Detail Tampilan Ujian', async ({ page }) => {
    await loginAs(page);
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForTimeout(3000);

    // Pilih SKD dan paket
    await page.selectOption('#examTypeSelection', { index: 1 });
    await page.waitForTimeout(2000);
    await page.selectOption('#paketSelection', { index: 1 });
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Mulai Ujian")');
    await page.waitForTimeout(5000);

    // Screenshot full page - tampilan keseluruhan
    await page.screenshot({ path: 'test-results/ujian-fullpage.png', fullPage: true });

    // Scroll ke atas
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/ujian-top.png' });

    // Cek label A/B/C/D/E tampil atau tidak
    console.log('\n===== CEK LABEL A/B/C/D/E =====');
    const labels = await page.locator('.option-label').all();
    for (const lbl of labels) {
        const html = await lbl.innerHTML();
        const text = await lbl.textContent();
        console.log(`HTML: ${html.substring(0, 120)}`);
        console.log(`TEXT: "${text.trim()}"\n`);
    }

    // Cek apakah huruf A/B/C/D/E ditampilkan sebagai prefix
    console.log('\n===== CEK PREFIX HURUF OPSI =====');
    const optionTexts = await page.locator('.option-label').allTextContents();
    let hasLetterPrefix = false;
    for (let i = 0; i < optionTexts.length; i++) {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const txt = optionTexts[i].trim();
        if (txt.startsWith(letters[i] + '.') || txt.startsWith(letters[i] + ')') || txt.startsWith(letters[i] + ' ')) {
            hasLetterPrefix = true;
            console.log(`✅ Opsi ${letters[i]}: ada prefix huruf → "${txt.substring(0,60)}"`);
        } else {
            console.log(`⚠️  Opsi ${letters[i]}: TIDAK ada prefix huruf → "${txt.substring(0,60)}"`);
        }
    }

    // Klik opsi B dan verifikasi visual
    console.log('\n===== CEK INTERAKSI KLIK =====');
    const optionB = page.locator('input[type="radio"][value="B"]');
    const optionBExists = await optionB.count() > 0;
    if (optionBExists) {
        // Klik via label bukan input langsung
        const labelB = page.locator('.option-label').nth(1);
        await labelB.click();
        await page.waitForTimeout(500);
        const bChecked = await optionB.isChecked();
        console.log(`Klik label opsi B → radio checked: ${bChecked ? '✅ YA' : '❌ TIDAK'}`);
        
        // Cek visual highlight/selected
        const labelBClass = await labelB.getAttribute('class');
        console.log(`Class label B setelah dipilih: "${labelBClass}"`);
        await page.screenshot({ path: 'test-results/ujian-opsi-dipilih.png' });
    }

    // Klik Selanjutnya dan cek soal ke-2
    console.log('\n===== NAVIGASI ANTAR SOAL =====');
    const nextBtn = page.locator('button:has-text("Selanjutnya")');
    const nextExists = await nextBtn.isVisible().catch(() => false);
    console.log(`Tombol Selanjutnya: ${nextExists ? '✅ ADA' : '❌ TIDAK ADA'}`);

    if (nextExists) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
        
        // Cek soal ke-2
        const q2Text = await page.locator('.question-text').first().textContent().catch(() => '');
        console.log(`Soal ke-2: "${q2Text.trim().substring(0, 80)}"`);
        
        const q2Options = await page.locator('.option-label').allTextContents();
        console.log('Opsi soal ke-2:');
        q2Options.forEach((t, i) => console.log(`  ${['A','B','C','D','E'][i]}: "${t.trim().substring(0,60)}"`));
        await page.screenshot({ path: 'test-results/ujian-soal2.png' });
    }

    // Cek timer
    console.log('\n===== CEK TIMER =====');
    const timerEl = await page.locator('#timer, #timerDisplay, .timer-display, [id*="Timer"], [class*="timer"]').first();
    const timerVisible = await timerEl.isVisible().catch(() => false);
    const timerText = await timerEl.textContent().catch(() => 'N/A');
    console.log(`Timer: ${timerVisible ? '✅ ' + timerText.trim() : '❌ TIDAK TAMPIL'}`);

    // Cek header soal (nomor & kategori)
    console.log('\n===== CEK HEADER SOAL =====');
    const questionHeader = await page.locator('.question-header, .soal-header, [class*="question-num"]').first().textContent().catch(() => '');
    console.log(`Header: "${questionHeader.trim().substring(0, 80)}"`);

    // Cek nomor grid soal di bawah
    const gridNums = await page.locator('.question-grid button, .soal-grid button, [class*="grid"] button').count();
    console.log(`\nGrid nomor soal: ${gridNums} tombol`);

    // Keamanan: jawaban_benar di source
    const src = await page.content();
    const jbLeak = (src.match(/"jawaban_benar"\s*:/g) || []).length;
    console.log(`\n🔒 "jawaban_benar" muncul di HTML source: ${jbLeak}x ${jbLeak > 0 ? '⚠️  PERLU DIPERIKSA' : '✅ AMAN'}`);
    
    console.log('\n===== SELESAI =====');
});
