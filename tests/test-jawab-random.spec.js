/**
 * JAWAB RANDOM BUTTON TEST - Playwright
 * Testing the development feature for auto-answering exam questions
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const USER = { username: 'fresh_user_11778919457', password: 'simulasi123' };

test.describe('Jawab Random Button Test', () => {
  test('Test Jawab Random button functionality', async ({ page }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  JAWAB RANDOM BUTTON TEST');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    // 1. Login
    console.log('📝 Step 1: Login to participant dashboard');
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = await page.locator(`button[onclick*="${USER.username}"]`).first();
    await quickLoginButton.click();
    
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });
    console.log('✅ Login successful');
    await page.screenshot({ path: 'test-screenshots/jawab-random/01-dashboard.png' });

    // 2. Navigate to exam page
    console.log('\n📝 Step 2: Navigate to exam page');
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Exam page loaded');
    await page.screenshot({ path: 'test-screenshots/jawab-random/02-ujian-page.png' });

    // 3. Fill exam form
    console.log('\n📝 Step 3: Fill exam form');
    await page.fill('#namaPeserta', 'Test User - Jawab Random');
    console.log('✅ Participant name filled');
    
    await page.screenshot({ path: 'test-screenshots/jawab-random/03-form-filled.png' });

    // 4. Start exam
    console.log('\n📝 Step 4: Start exam');
    await page.click('button[onclick*="mulaiUjian"]', { timeout: 5000 });
    console.log('✅ Start button clicked');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-screenshots/jawab-random/04-exam-started.png' });

    // 5. Check if Jawab Random button is visible
    console.log('\n📝 Step 5: Check Jawab Random button');
    const jawabRandomBtn = await page.locator('#jawabRandomBtn').count();
    if (jawabRandomBtn > 0) {
        console.log('✅ Jawab Random button found and visible');
        
        const isVisible = await page.locator('#jawabRandomBtn').isVisible();
        if (isVisible) {
            console.log('✅ Jawab Random button is visible');
            await page.screenshot({ path: 'test-screenshots/jawab-random/05-jawab-random-button.png' });
        } else {
            console.log('⚠️ Jawab Random button exists but not visible');
        }
    } else {
        console.log('❌ Jawab Random button not found');
    }

    // 6. Click Jawab Random button
    console.log('\n📝 Step 6: Click Jawab Random button');
    if (jawabRandomBtn > 0) {
        const isVisible = await page.locator('#jawabRandomBtn').isVisible();
        if (isVisible) {
            // Handle all dialogs automatically
            page.on('dialog', async dialog => {
                console.log(`✅ Dialog appeared: ${dialog.message()}`);
                await dialog.accept();
            });
            
            await page.click('#jawabRandomBtn', { timeout: 5000 });
            console.log('✅ Jawab Random button clicked');
            await page.waitForTimeout(5000);
            
            await page.screenshot({ path: 'test-screenshots/jawab-random/06-after-random.png' });
        }
    }

    // 7. Check if redirected to result page
    console.log('\n📝 Step 7: Check result page');
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('resume-ujian') || currentUrl.includes('result')) {
        console.log('✅ Redirected to result page');
        await page.screenshot({ path: 'test-screenshots/jawab-random/07-result-page.png' });
    } else {
        console.log('⚠️ Not redirected to result page, current URL:', currentUrl);
        await page.screenshot({ path: 'test-screenshots/jawab-random/07-current-state.png' });
    }

    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  JAWAB RANDOM BUTTON TEST COMPLETED');
    console.log('══════════════════════════════════════════════════════════════════════\n');
  });
});
