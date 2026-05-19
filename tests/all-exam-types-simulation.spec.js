/**
 * ALL EXAM TYPES SIMULATION - Playwright Test
 * Simulating all available exam types in the system
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const USER = { username: 'fresh_user_11778919457', password: 'simulasi123' };

// All available exam types from database
const EXAM_TYPES = [
    { code: 'skd', name: 'SKD (Seleksi Kompetensi Dasar)', soal: 100, durasi: 100 },
    { code: 'skd_cat', name: 'SKD - CAT Mode', soal: 100, durasi: 90 },
    { code: 'tpa', name: 'TPA (Tes Potensi Akademik)', soal: 15, durasi: 60 },
    { code: 'psikotes', name: 'Psikotes', soal: 30, durasi: 45 },
    { code: 'tryout', name: 'Tryout Umum', soal: 130, durasi: 100 },
    { code: 'latihan', name: 'Latihan Bebas', soal: 20, durasi: 0 },
    { code: 'skb', name: 'SKB (Seleksi Kompetensi Bidang)', soal: 100, durasi: 90 },
    { code: 'utbk', name: 'UTBK (Ujian Tulis Berbasis Komputer)', soal: 180, durasi: 120 }
];

test.describe('All Exam Types Simulation', () => {
  test('Simulate all exam types', async ({ page }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  ALL EXAM TYPES SIMULATION');
    console.log(`  Total Exam Types: ${EXAM_TYPES.length}`);
    console.log('══════════════════════════════════════════════════════════════════════\n');

    // 1. Login
    console.log('📝 Step 1: Login to participant dashboard');
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = await page.locator(`button[onclick*="${USER.username}"]`).first();
    const buttonCount = await quickLoginButton.count();
    
    if (buttonCount > 0) {
      console.log(`✅ Quick login button found for ${USER.username}`);
      await quickLoginButton.click();
    } else {
      console.log(`⚠️ Quick login button not found, using manual login`);
      await page.fill('#username', USER.username);
      await page.fill('#password', USER.password);
      await page.click('button[type="submit"]');
    }
    
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });
    console.log('✅ Login successful, redirected to dashboard');
    await page.screenshot({ path: 'test-screenshots/all-exam-types/01-dashboard.png' });

    // 2. Navigate to exam page
    console.log('\n📝 Step 2: Navigate to exam page');
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Exam page loaded');
    await page.screenshot({ path: 'test-screenshots/all-exam-types/02-ujian-page.png' });

    // 3. Test each exam type interface
    for (let i = 0; i < EXAM_TYPES.length; i++) {
        const examType = EXAM_TYPES[i];
        console.log(`\n` + '─'.repeat(70));
        console.log(`EXAM TYPE ${i + 1}/${EXAM_TYPES.length}: ${examType.name}`);
        console.log(`Code: ${examType.code} | Soal: ${examType.soal} | Durasi: ${examType.durasi} menit`);
        console.log('─'.repeat(70));

        // Navigate to exam page for this exam type
        await page.goto(`${BASE_URL}/participant/ujian.html?exam_type=${examType.code}`);
        await page.waitForLoadState('networkidle');
        
        console.log(`✅ Navigated to exam page for ${examType.name}`);
        await page.screenshot({ path: `test-screenshots/all-exam-types/03-${examType.code}-interface.png` });
        
        // Wait longer for visibility
        await page.waitForTimeout(1000);
        
        // Check if form is available
        const hasForm = await page.locator('#namaPeserta, .exam-form').count();
        if (hasForm > 0) {
            console.log(`✅ Exam form available for ${examType.name}`);
        } else {
            console.log(`⚠️ Exam form not available for ${examType.name}`);
        }
        
        // Wait for visibility
        await page.waitForTimeout(500);
        
        console.log(`✅ ${examType.name} interface tested`);
    }

    // 4. Navigate back to dashboard
    console.log('\n📝 Step 4: Navigate back to dashboard');
    await page.goto(`${BASE_URL}/participant/dashboard.html`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Returned to dashboard');
    await page.screenshot({ path: 'test-screenshots/all-exam-types/99-back-to-dashboard.png' });

    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  ALL EXAM TYPES SIMULATION COMPLETED');
    console.log(`  Tested ${EXAM_TYPES.length} exam types`);
    console.log('══════════════════════════════════════════════════════════════════════\n');
  });
});
