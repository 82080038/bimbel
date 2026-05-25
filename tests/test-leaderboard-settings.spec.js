const { test, expect } = require('@playwright/test');

test.describe('Leaderboard Settings - Admin Test', () => {
    test('Navigate to Leaderboard Settings section and check UI', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Leaderboard Settings section
        await page.click('a[onclick*="leaderboardSettings"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Check if Leaderboard Settings section is visible
        const leaderboardSection = page.locator('#leaderboardSettingsSection');
        await expect(leaderboardSection).toBeVisible();

        // Check if header is visible
        const header = page.locator('h2:has-text("Pengaturan Leaderboard")');
        await expect(header).toBeVisible();

        // Check if opt-out checkbox exists
        const optOutCheckbox = page.locator('#optOutLeaderboard');
        await expect(optOutCheckbox).toBeVisible();

        // Check if save button exists
        const saveButton = page.locator('button:has-text("Simpan Pengaturan")');
        await expect(saveButton).toBeVisible();

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/leaderboard-settings-ui.png' });

        expect(errors.length).toBe(0);
    });

    test('Test toggle leaderboard opt-out', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Leaderboard Settings section
        await page.click('a[onclick*="leaderboardSettings"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Get initial checkbox state
        const optOutCheckbox = page.locator('#optOutLeaderboard');
        const initialState = await optOutCheckbox.isChecked();
        console.log('Initial opt-out state:', initialState);

        // Toggle the checkbox
        await optOutCheckbox.click();
        await page.waitForTimeout(500);

        // Click save button
        const saveButton = page.locator('button:has-text("Simpan Pengaturan")');
        await saveButton.click();
        await page.waitForTimeout(1000);

        // Check for toast notification
        const toast = page.locator('.toast.show');
        const toastVisible = await toast.isVisible();
        console.log('Toast notification visible:', toastVisible);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/leaderboard-settings-toggle.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
