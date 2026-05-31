const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

async function loginAdmin(page) {
    await page.goto('http://localhost/bimbel/login.html');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('#loginForm button[type="submit"]');
    await page.waitForURL(/dashboard|admin/, { timeout: 10000 });
}

test.describe('Admin Smoke Test', () => {
    test('admin index loads', async ({ page }) => {
        await loginAdmin(page);
        await page.goto('http://localhost/bimbel/admin/index.html');
        await page.waitForTimeout(3000);
        const content = await page.locator('body').textContent();
        expect(content.length).toBeGreaterThan(0);
        await page.screenshot({ path: 'playwright-screenshots/smoke-admin-index.png' });
    });

    test('admin sections load', async ({ page }) => {
        await loginAdmin(page);
        await page.goto('http://localhost/bimbel/admin/index.html');
        await page.waitForTimeout(3000);
        
        // Check if sidebar navigation exists
        const sidebar = await page.locator('.sidebar');
        expect(await sidebar.count()).toBeGreaterThan(0);
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/smoke-admin-sections.png' });
    });
});
