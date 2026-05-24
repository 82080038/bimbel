const { test } = require('@playwright/test');
const BASE = 'http://localhost/bimbel';
const CREDS = { u: 'fresh_user_11778919457', p: 'simulasi123' };

test('klik jawaban & verifikasi simpan', async ({ page }) => {
    await page.goto(`${BASE}/login.html`);
    await page.waitForLoadState('networkidle');
    await page.fill('#username', CREDS.u);
    await page.fill('#password', CREDS.p);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard.html', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    await page.goto(`${BASE}/participant/ujian.html`);
    await page.waitForTimeout(3000);
    await page.selectOption('#examTypeSelection', { index: 1 });
    await page.waitForTimeout(2000);
    await page.selectOption('#paketSelection', { index: 1 });
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Mulai Ujian")');
    await page.waitForTimeout(5000);

    const q1 = await page.locator('.question-number').first().textContent().catch(() => '');
    console.log('Soal awal:', q1.trim());

    // Screenshot SEBELUM klik
    await page.screenshot({ path: 'test-results/before-click.png' });

    // Klik opsi B
    const labelB = page.locator('.option-label').nth(1);
    await labelB.click();

    // Cek segera (sebelum auto-next 500ms)
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'test-results/after-click-200ms.png' });
    const checkedNow = await page.locator('input[name="answer"]:checked').getAttribute('value').catch(() => 'none');
    const labelBClass = await labelB.getAttribute('class').catch(() => '');
    console.log('Nilai checked (200ms setelah klik):', checkedNow);
    console.log('Class label B (200ms):', labelBClass);
    console.log('Label B ada class "selected":', labelBClass.includes('selected') ? 'YA ✅' : 'TIDAK ❌');

    // Tunggu auto-next selesai
    await page.waitForTimeout(800);
    const q2 = await page.locator('.question-number').first().textContent().catch(() => '');
    console.log('Soal setelah auto-next:', q2.trim());
    await page.screenshot({ path: 'test-results/after-autonext.png' });

    // Klik jawaban soal 2
    const labelA2 = page.locator('.option-label').nth(0);
    await labelA2.click();
    await page.waitForTimeout(200);
    const checked2 = await page.locator('input[name="answer"]:checked').getAttribute('value').catch(() => 'none');
    console.log('Jawaban soal 2 dipilih:', checked2);

    // Tunggu auto-next ke soal 3
    await page.waitForTimeout(800);

    // Kembali ke soal 1, cek jawaban tersimpan
    await page.click('button:has-text("Sebelumnya")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Sebelumnya")');
    await page.waitForTimeout(1000);

    const q1back = await page.locator('.question-number').first().textContent().catch(() => '');
    const savedCheck = await page.locator('input[name="answer"]:checked').getAttribute('value').catch(() => 'none');
    const selectedLabels = await page.locator('.option-label.selected').count();
    console.log('\n=== VERIFIKASI SIMPAN JAWABAN ===');
    console.log('Kembali ke:', q1back.trim());
    console.log('Radio checked:', savedCheck);
    console.log('Label selected:', selectedLabels, 'label');
    console.log('Jawaban soal 1 tersimpan sebagai B:', savedCheck === 'B' ? '✅ YA' : '❌ TIDAK (dapat: ' + savedCheck + ')');

    await page.screenshot({ path: 'test-results/soal1-kembali.png' });

    // Cek grid nomor soal (1 dan 2 harus berwarna berbeda - sudah dijawab)
    const answeredBtns = await page.locator('.question-nav-btn.answered, [class*="nav"][class*="answered"]').count();
    console.log('Tombol soal sudah dijawab (di grid):', answeredBtns);
});
