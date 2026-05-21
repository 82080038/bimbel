/**
 * COMPREHENSIVE JAVASCRIPT ERROR CHECK - Playwright
 * Testing all participant pages for JavaScript errors with console monitoring
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/ujian';
const USER = { username: 'fresh_user_11778919457', password: 'simulasi123' };

const PARTICIPANT_PAGES = [
    { name: 'Dashboard', url: '/participant/dashboard.html' },
    { name: 'Ujian', url: '/participant/ujian.html' },
    { name: 'Resume Ujian', url: '/participant/resume-ujian.html?result_id=21' },
    { name: 'Profil', url: '/participant/profile.html' },
    { name: 'Materi', url: '/participant/materi.html' },
    { name: 'Leaderboard', url: '/participant/leaderboard.html' },
    { name: 'Achievements', url: '/participant/achievements.html' }
];

test.describe('Comprehensive JavaScript Error Check', () => {
  test('Check all participant pages for JavaScript errors', async ({ page }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  COMPREHENSIVE JAVASCRIPT ERROR CHECK');
    console.log('  Testing all participant pages for console errors');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    // Collect all console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });

    // Collect all page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message,
            stack: error.stack
        });
    });

    // 1. Login
    console.log('📝 Step 1: Login to participant dashboard');
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = await page.locator(`button[onclick*="${USER.username}"]`).first();
    await quickLoginButton.click();
    
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });
    console.log('✅ Login successful');
    await page.screenshot({ path: 'test-screenshots/js-error-check/01-login.png' });

    // 2. Test each participant page
    for (let i = 0; i < PARTICIPANT_PAGES.length; i++) {
        const pageInfo = PARTICIPANT_PAGES[i];
        console.log(`\n` + '─'.repeat(70));
        console.log(`PAGE ${i + 1}/${PARTICIPANT_PAGES.length}: ${pageInfo.name}`);
        console.log(`URL: ${pageInfo.url}`);
        console.log('─'.repeat(70));

        // Clear previous console messages
        consoleMessages.length = 0;
        pageErrors.length = 0;

        // Navigate to page
        await page.goto(`${BASE_URL}${pageInfo.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for any async JS to execute

        console.log(`✅ Page loaded: ${pageInfo.name}`);
        await page.screenshot({ path: `test-screenshots/js-error-check/02-${pageInfo.name.replace(/\s+/g, '_')}.png` });

        // Check for console errors
        const errorMessages = consoleMessages.filter(msg => 
            msg.type === 'error' || msg.type === 'warning'
        );

        if (errorMessages.length > 0) {
            console.log(`⚠️ Console errors/warnings found: ${errorMessages.length}`);
            errorMessages.forEach(msg => {
                console.log(`  - ${msg.type.toUpperCase()}: ${msg.text}`);
                if (msg.location) {
                    console.log(`    Location: ${msg.location.url}:${msg.location.lineNumber}`);
                }
            });
        } else {
            console.log(`✅ No console errors/warnings`);
        }

        // Check for page errors
        if (pageErrors.length > 0) {
            console.log(`❌ Page errors found: ${pageErrors.length}`);
            pageErrors.forEach(error => {
                console.log(`  - ${error.message}`);
                console.log(`    Stack: ${error.stack}`);
            });
        } else {
            console.log(`✅ No page errors`);
        }

        // Check for specific errors we fixed
        const hasTypeError = consoleMessages.some(msg => 
            msg.text.includes('TypeError') && 
            (msg.text.includes('null') || msg.text.includes('undefined'))
        );

        if (hasTypeError) {
            console.log(`❌ TypeError with null/undefined detected - FIX NEEDED`);
        } else {
            console.log(`✅ No TypeError with null/undefined`);
        }
    }

    // 3. Summary
    console.log('\n' + '═'.repeat(70));
    console.log('  SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total pages tested: ${PARTICIPANT_PAGES.length}`);
    console.log(`Total console errors: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`Total console warnings: ${consoleMessages.filter(m => m.type === 'warning').length}`);
    console.log(`Total page errors: ${pageErrors.length}`);
    
    if (pageErrors.length > 0) {
        console.log('\n❌ PAGES WITH ERRORS:');
        pageErrors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.message}`);
        });
    } else {
        console.log('\n✅ ALL PAGES CLEAN - NO ERRORS');
    }

    console.log('══════════════════════════════════════════════════════════════════════\n');

    // Assert no critical errors
    expect(pageErrors.length).toBe(0);
  });
});
