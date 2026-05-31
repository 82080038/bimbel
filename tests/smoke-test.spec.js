const { test, expect } = require('@playwright/test');

// Disable parallel execution to avoid session conflicts
test.describe.configure({ mode: 'serial' });

async function login(page) {
    await page.goto('http://localhost/bimbel/login.html');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'test123');
    await page.click('#loginForm button[type="submit"]');
    await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
}

test.describe('Smoke Test - All Pages', () => {
    test('login page loads', async ({ page }) => {
        await page.goto('http://localhost/bimbel/login.html');
        await expect(page.locator('#loginForm')).toBeVisible();
        await page.screenshot({ path: 'playwright-screenshots/smoke-login.png' });
    });

    test('dashboard loads', async ({ page }) => {
        await login(page);
        await page.waitForTimeout(2000);
        const content = await page.locator('#dashboardContent').textContent();
        expect(content.length).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-screenshots/smoke-dashboard.png' });
    });

    test('materi loads', async ({ page }) => {
        await login(page);
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForTimeout(3000);
        const content = await page.locator('#materiContent').textContent();
        expect(content.length).toBeGreaterThan(0);
        
        const grid = await page.locator('#materialsGrid');
        const gridText = await grid.textContent();
        console.log('Materi grid preview:', gridText.substring(0, 200));
        
        await page.screenshot({ path: 'playwright-screenshots/smoke-materi.png' });
    });

    test('leaderboard loads', async ({ page }) => {
        await login(page);
        await page.goto('http://localhost/bimbel/participant/leaderboard.html');
        await page.waitForTimeout(2000);
        const content = await page.locator('#leaderboardContent').textContent();
        expect(content.length).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-screenshots/smoke-leaderboard.png' });
    });

    test('achievements loads', async ({ page }) => {
        await login(page);
        await page.goto('http://localhost/bimbel/participant/achievements.html');
        await page.waitForTimeout(2000);
        const content = await page.locator('#achievementsContent').textContent();
        expect(content.length).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-screenshots/smoke-achievements.png' });
    });

    test('profile loads', async ({ page }) => {
        await login(page);
        await page.goto('http://localhost/bimbel/participant/profile.html');
        await page.waitForTimeout(2000);
        const content = await page.locator('#profileContent').textContent();
        expect(content.length).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-screenshots/smoke-profile.png' });
    });

    test('ujian loads', async ({ page }) => {
        await login(page);
        await page.goto('http://localhost/bimbel/participant/ujian.html');
        await page.waitForTimeout(2000);
        const content = await page.locator('#examContent').textContent();
        expect(content.length).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-screenshots/smoke-ujian.png' });
    });

    test('certificate loads', async ({ page }) => {
        await login(page);
        await page.goto('http://localhost/bimbel/participant/certificate.html');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'playwright-screenshots/smoke-certificate.png' });
    });

    test('resume-ujian loads', async ({ page }) => {
        await login(page);
        await page.goto('http://localhost/bimbel/participant/resume-ujian.html');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'playwright-screenshots/smoke-resume-ujian.png' });
    });
});
