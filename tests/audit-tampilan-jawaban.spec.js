// Audit Tampilan Pilihan Jawaban - Visual & Functional Check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const CREDS = { username: 'fresh_user_11778919457', password: 'simulasi123' };

async function loginAs(page, creds) {
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    await page.fill('#username', creds.username);
    await page.fill('#password', creds.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard.html', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
}

test('Audit Tampilan Pilihan Jawaban Saat Ujian', async ({ page }) => {
    await loginAs(page, CREDS);
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Pilih jenis ujian pertama yang tersedia
    const examTypes = await page.locator('#examTypeSelection option').count();
    console.log(`\n📋 Jenis ujian tersedia: ${examTypes - 1}`);

    // Pilih jenis ujian index 1 (bukan default kosong)
    await page.selectOption('#examTypeSelection', { index: 1 });
    await page.waitForTimeout(2000);

    // Ambil nama jenis yang dipilih
    const selectedExamType = await page.locator('#examTypeSelection option:checked').textContent();
    console.log(`✅ Jenis ujian dipilih: ${selectedExamType.trim()}`);

    // Pilih paket pertama
    const paketCount = await page.locator('#paketSelection option').count();
    console.log(`📦 Paket tersedia: ${paketCount}`);

    if (paketCount > 1) {
        await page.selectOption('#paketSelection', { index: 1 });
        await page.waitForTimeout(1000);
    }

    // Mulai ujian
    await page.click('button:has-text("Mulai Ujian")');
    await page.waitForTimeout(5000);

    // Cek apakah layar ujian muncul
    const examScreen = await page.locator('#examScreen, #soalScreen, .exam-container, .question-container').first().isVisible().catch(() => false);
    console.log(`\n🖥️  Layar ujian tampil: ${examScreen ? 'YA' : 'TIDAK'}`);

    if (!examScreen) {
        // Coba mode latihan sebagai fallback
        console.log('⚠️  Mencoba Mode Latihan...');
        await page.goto(`${BASE_URL}/participant/ujian.html`);
        await page.waitForTimeout(3000);
        await page.selectOption('#examTypeSelection', { index: 1 });
        await page.waitForTimeout(2000);
        if (paketCount > 1) {
            await page.selectOption('#paketSelection', { index: 1 });
            await page.waitForTimeout(1000);
        }
        await page.click('button:has-text("Mode Latihan")');
        await page.waitForTimeout(5000);
    }

    // Screenshot setelah ujian dimulai
    await page.screenshot({ path: 'test-results/tampilan-ujian.png', fullPage: false });
    console.log('📸 Screenshot disimpan: test-results/tampilan-ujian.png');

    // ===== AUDIT PILIHAN JAWABAN =====
    console.log('\n===== AUDIT PILIHAN JAWABAN =====');

    // 1. Cek apakah soal tampil
    const questionText = await page.locator('.question-text, #questionText, .pertanyaan, [class*="question"]').first().textContent().catch(() => '');
    console.log(`\n📝 Teks soal: "${questionText.trim().substring(0, 80)}..."`);

    // 2. Cek semua opsi radio button
    const radioButtons = await page.locator('input[type="radio"][name="answer"]').all();
    console.log(`\n🔘 Jumlah opsi radio: ${radioButtons.length}`);

    for (let i = 0; i < radioButtons.length; i++) {
        const radio = radioButtons[i];
        const value = await radio.getAttribute('value');
        const label = await radio.locator('..').textContent().catch(() => '');
        const isVisible = await radio.isVisible().catch(() => false);
        const isEnabled = await radio.isEnabled().catch(() => false);
        console.log(`   Opsi ${value}: visible=${isVisible}, enabled=${isEnabled}, label="${label.trim().substring(0, 50)}"`);
    }

    // 3. Cek apakah nilai radio = A/B/C/D/E
    const radioValues = [];
    for (const radio of radioButtons) {
        radioValues.push(await radio.getAttribute('value'));
    }
    const validValues = radioValues.every(v => ['A','B','C','D','E'].includes(v));
    console.log(`\n✅ Nilai radio valid (A-E): ${validValues ? 'YA' : 'TIDAK — ' + JSON.stringify(radioValues)}`);

    // 4. Pilih opsi A dan verifikasi terpilih
    if (radioButtons.length > 0) {
        await radioButtons[0].click();
        await page.waitForTimeout(500);
        const aChecked = await page.locator('input[type="radio"][value="A"]').isChecked().catch(() => false);
        console.log(`\n🖱️  Klik opsi A → terpilih: ${aChecked ? 'YA' : 'TIDAK'}`);
    }

    // 5. Cek label/teks opsi ditampilkan (bukan kosong)
    const optionLabels = await page.locator('.option-label, label:has(input[type="radio"])').all();
    console.log(`\n🏷️  Jumlah label opsi: ${optionLabels.length}`);
    for (let i = 0; i < Math.min(optionLabels.length, 5); i++) {
        const txt = await optionLabels[i].textContent().catch(() => '');
        const isEmpty = txt.trim().length === 0;
        console.log(`   Label ${i+1}: ${isEmpty ? '⚠️  KOSONG' : '"' + txt.trim().substring(0, 60) + '"'}`);
    }

    // 6. Cek navigasi soal (next/prev)
    const nextBtn = await page.locator('button:has-text("Berikutnya"), button:has-text("Next"), #nextBtn, .btn-next').first().isVisible().catch(() => false);
    const prevBtn = await page.locator('button:has-text("Sebelumnya"), button:has-text("Prev"), #prevBtn, .btn-prev').first().isVisible().catch(() => false);
    console.log(`\n⏭️  Tombol Berikutnya: ${nextBtn ? 'ADA' : 'TIDAK ADA'}`);
    console.log(`⏮️  Tombol Sebelumnya: ${prevBtn ? 'ADA' : 'TIDAK ADA'}`);

    // 7. Navigasi ke soal berikutnya, cek opsi soal ke-2
    if (nextBtn) {
        await page.locator('button:has-text("Berikutnya"), button:has-text("Next"), #nextBtn, .btn-next').first().click();
        await page.waitForTimeout(1000);

        const q2Text = await page.locator('.question-text, #questionText, .pertanyaan, [class*="question"]').first().textContent().catch(() => '');
        console.log(`\n📝 Soal ke-2: "${q2Text.trim().substring(0, 80)}..."`);

        const q2Labels = await page.locator('.option-label, label:has(input[type="radio"])').all();
        for (let i = 0; i < Math.min(q2Labels.length, 5); i++) {
            const txt = await q2Labels[i].textContent().catch(() => '');
            const isEmpty = txt.trim().length === 0;
            console.log(`   Opsi ${i+1}: ${isEmpty ? '⚠️  KOSONG' : '"' + txt.trim().substring(0, 60) + '"'}`);
        }
    }

    // 8. Cek timer tampil
    const timer = await page.locator('#timer, #timerDisplay, .timer, [id*="timer"]').first().isVisible().catch(() => false);
    const timerText = await page.locator('#timer, #timerDisplay, .timer, [id*="timer"]').first().textContent().catch(() => '');
    console.log(`\n⏱️  Timer: ${timer ? timerText.trim() : 'TIDAK TAMPIL'}`);

    // 9. Cek nomor soal / progress
    const progress = await page.locator('.question-progress, #questionProgress, [class*="progress"], #soalInfo').first().textContent().catch(() => '');
    console.log(`📊 Progress/nomor soal: "${progress.trim().substring(0, 50)}"`);

    // 10. Screenshot final dengan soal aktif
    await page.screenshot({ path: 'test-results/tampilan-soal-aktif.png', fullPage: false });
    console.log('\n📸 Screenshot soal aktif: test-results/tampilan-soal-aktif.png');

    // 11. Cek apakah jawaban_benar tidak bocor ke frontend
    const pageContent = await page.content();
    const hasLeakedAnswer = pageContent.includes('"jawaban_benar"');
    console.log(`\n🔒 Data jawaban_benar bocor ke HTML: ${hasLeakedAnswer ? '⚠️  YA (RISIKO KEAMANAN)' : 'TIDAK (aman)'}`);

    console.log('\n===== SELESAI =====');
});
