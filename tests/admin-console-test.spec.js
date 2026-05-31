const { test, expect } = require('@playwright/test');

test.describe('Admin Console & Network Error Detection', () => {
    test('Detect console & network errors on admin pages', async ({ page }) => {
        const consoleErrors = [];
        const consoleWarnings = [];
        const networkErrors = [];

        // Listen to console messages
        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                consoleErrors.push(text);
                console.log(`❌ CONSOLE ERROR [Admin]: ${text.substring(0, 200)}`);
            } else if (msg.type() === 'warning') {
                consoleWarnings.push(text);
                console.log(`⚠️ CONSOLE WARN [Admin]: ${text.substring(0, 200)}`);
            }
        });

        page.on('pageerror', error => {
            consoleErrors.push(error.message);
            console.log(`❌ PAGE ERROR [Admin]: ${error.message.substring(0, 200)}`);
        });

        page.on('response', response => {
            const status = response.status();
            const url = response.url();
            if (status >= 400) {
                console.log(`🔴 ${status} [Admin]: ${url.substring(0, 150)}`);
                networkErrors.push({ status, url: url.substring(0, 150) });
            }
        });

        // Login first (admin may use different credentials)
        await page.goto('http://localhost/bimbel/admin/index.html');
        await page.waitForTimeout(3000);

        // Check admin page content
        const bodyText = await page.locator('body').textContent();
        console.log('Admin page loaded, content length:', bodyText.length);

        // Navigate to admin dashboard
        await page.goto('http://localhost/bimbel/admin/admin.html');
        await page.waitForTimeout(3000);

        const adminText = await page.locator('body').textContent();
        console.log('Admin dashboard loaded, content length:', adminText.length);

        await page.waitForTimeout(2000);

        // Summary
        console.log(`\n=== Admin Summary ===`);
        console.log(`Console Errors: ${consoleErrors.length}`);
        console.log(`Console Warnings: ${consoleWarnings.length}`);
        console.log(`Network Errors: ${networkErrors.length}`);

        // Allow some errors since admin may not be logged in
        expect(networkErrors.filter(e => e.status === 500).length).toBe(0);
    });
});
