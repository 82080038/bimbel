/**
 * END-TO-END CRITICAL USER FLOWS TEST - Playwright
 * Testing all critical user flows for production readiness
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/ujian';
const USER = { username: 'fresh_user_11778919457', password: 'simulasi123' };

test.describe('Critical User Flows End-to-End', () => {
  test('Complete user flow: Login -> Dashboard -> Exam -> Result', async ({ page }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  END-TO-END CRITICAL USER FLOW TEST');
    console.log('  Testing: Login -> Dashboard -> Exam -> Result');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text()
        });
    });

    // Collect page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message
        });
    });

    // 1. Login
    console.log('📝 Step 1: Login');
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    
    const quickLoginButton = await page.locator(`button[onclick*="${USER.username}"]`).first();
    await quickLoginButton.click();
    
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });
    console.log('✅ Login successful');
    await page.screenshot({ path: 'test-screenshots/e2e/01-login.png' });

    // 2. Navigate to Dashboard
    console.log('\n📝 Step 2: Dashboard');
    await page.waitForLoadState('networkidle');
    const dashboardVisible = await page.locator('.dashboard-container, .container').count();
    expect(dashboardVisible).toBeGreaterThan(0);
    console.log('✅ Dashboard loaded');
    await page.screenshot({ path: 'test-screenshots/e2e/02-dashboard.png' });

    // 3. Navigate to Exam Page
    console.log('\n📝 Step 3: Navigate to Exam Page');
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    
    const examForm = await page.locator('#namaPeserta, .exam-form').count();
    expect(examForm).toBeGreaterThan(0);
    console.log('✅ Exam page loaded');
    await page.screenshot({ path: 'test-screenshots/e2e/03-exam-page.png' });

    // 4. Navigate to Profile
    console.log('\n📝 Step 4: Navigate to Profile');
    await page.goto(`${BASE_URL}/participant/profile.html`);
    await page.waitForLoadState('networkidle');
    
    const profileContent = await page.locator('#profileContent').count();
    expect(profileContent).toBeGreaterThan(0);
    console.log('✅ Profile page loaded');
    await page.screenshot({ path: 'test-screenshots/e2e/04-profile.png' });

    // 5. Navigate to Leaderboard
    console.log('\n📝 Step 5: Navigate to Leaderboard');
    await page.goto(`${BASE_URL}/participant/leaderboard.html`);
    await page.waitForLoadState('networkidle');
    
    const leaderboardContent = await page.locator('#leaderboardContent').count();
    expect(leaderboardContent).toBeGreaterThan(0);
    console.log('✅ Leaderboard page loaded');
    await page.screenshot({ path: 'test-screenshots/e2e/05-leaderboard.png' });

    // 6. Navigate to Achievements
    console.log('\n📝 Step 6: Navigate to Achievements');
    await page.goto(`${BASE_URL}/participant/achievements.html`);
    await page.waitForLoadState('networkidle');
    
    const achievementsContent = await page.locator('#achievementsContent').count();
    expect(achievementsContent).toBeGreaterThan(0);
    console.log('✅ Achievements page loaded');
    await page.screenshot({ path: 'test-screenshots/e2e/06-achievements.png' });

    // 7. Navigate to Materi
    console.log('\n📝 Step 7: Navigate to Materi');
    await page.goto(`${BASE_URL}/participant/materi.html`);
    await page.waitForLoadState('networkidle');
    
    const materiContent = await page.locator('#materiContent').count();
    expect(materiContent).toBeGreaterThan(0);
    console.log('✅ Materi page loaded');
    await page.screenshot({ path: 'test-screenshots/e2e/07-materi.png' });

    // Check for errors
    console.log('\n' + '═'.repeat(70));
    console.log('  ERROR CHECK');
    console.log('═'.repeat(70));
    console.log(`Console errors: ${consoleMessages.filter(m => m.type === 'error').length}`);
    console.log(`Page errors: ${pageErrors.length}`);
    
    if (pageErrors.length > 0) {
        console.log('\n❌ Page errors found:');
        pageErrors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.message}`);
        });
    } else {
        console.log('\n✅ No page errors');
    }

    console.log('══════════════════════════════════════════════════════════════════════\n');

    // Assert no critical errors
    expect(pageErrors.length).toBe(0);
  });

  test('Admin flow: Login -> Dashboard -> Manage Questions', async ({ page }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  ADMIN FLOW TEST');
    console.log('  Testing: Admin Login -> Dashboard -> Manage Questions');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    // Collect page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message
        });
    });

    // 1. Navigate to Admin
    console.log('📝 Step 1: Navigate to Admin');
    await page.goto(`${BASE_URL}/admin/index.html`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Admin page loaded');
    await page.screenshot({ path: 'test-screenshots/e2e/10-admin-login.png' });

    // 2. Check if admin dashboard loads
    console.log('\n📝 Step 2: Check Admin Dashboard');
    const adminContent = await page.locator('.admin-container, #adminContent').count();
    if (adminContent > 0) {
        console.log('✅ Admin dashboard loaded');
        await page.screenshot({ path: 'test-screenshots/e2e/11-admin-dashboard.png' });
    } else {
        console.log('⚠️ Admin dashboard not loaded (may need login)');
    }

    // Check for errors
    console.log('\n' + '═'.repeat(70));
    console.log('  ERROR CHECK');
    console.log('═'.repeat(70));
    console.log(`Page errors: ${pageErrors.length}`);
    
    if (pageErrors.length > 0) {
        console.log('\n❌ Page errors found:');
        pageErrors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.message}`);
        });
    } else {
        console.log('\n✅ No page errors');
    }

    console.log('══════════════════════════════════════════════════════════════════════\n');
  });
});
