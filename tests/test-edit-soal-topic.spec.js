const { test, expect } = require('@playwright/test');

test.describe('Edit Soal - Topic Dropdown Test', () => {
    test('Edit Soal modal - Verify Topic dropdown loads correctly', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Questions section
        await page.click('a[onclick*="questions"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Find and click the first Edit button
        const editButton = page.locator('button.btn-info').first();
        await editButton.click();
        await page.waitForTimeout(2000);

        // Check if modal is visible
        const modal = page.locator('#questionModal');
        await expect(modal).toBeVisible();

        // Check if Topic dropdown exists
        const topicDropdown = page.locator('#questionTopic');
        await expect(topicDropdown).toBeVisible();

        // Get the current value of Kategori dropdown
        const kategoriDropdown = page.locator('#questionKategori');
        const kategoriValue = await kategoriDropdown.inputValue();
        console.log('Selected Kategori:', kategoriValue);

        // Get all options in Topic dropdown
        const topicOptions = await topicDropdown.locator('option').all();
        console.log('Number of topic options:', topicOptions.length);

        // Log all topic options
        for (const option of topicOptions) {
            const value = await option.getAttribute('value');
            const text = await option.textContent();
            console.log(`Topic option: value="${value}", text="${text}"`);
        }

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/edit-soal-topic-dropdown.png' });

        // Close modal
        const closeButton = page.locator('#questionModal .btn-close').first();
        if (await closeButton.isVisible()) {
            await closeButton.click();
        } else {
            const cancelBtn = page.locator('#questionModal .btn-secondary').first();
            await cancelBtn.click();
        }

        expect(errors.length).toBe(0);
    });

    test('Edit Soal modal - Change Kategori and verify Topic updates', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Questions section
        await page.click('a[onclick*="questions"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Find and click the first Edit button
        const editButton = page.locator('button.btn-info').first();
        await editButton.click();
        await page.waitForTimeout(2000);

        // Check if modal is visible
        const modal = page.locator('#questionModal');
        await expect(modal).toBeVisible();

        // Get Kategori dropdown
        const kategoriDropdown = page.locator('#questionKategori');
        
        // Try to change to different kategori (e.g., TWK)
        await kategoriDropdown.selectOption('TWK');
        await page.waitForTimeout(1000);

        // Check Topic dropdown after changing kategori
        const topicDropdown = page.locator('#questionTopic');
        const topicOptions = await topicDropdown.locator('option').all();
        console.log('Topic options after changing to TWK:', topicOptions.length);

        // Try another kategori (e.g., TIU)
        await kategoriDropdown.selectOption('TIU');
        await page.waitForTimeout(1000);

        const topicOptions2 = await topicDropdown.locator('option').all();
        console.log('Topic options after changing to TIU:', topicOptions2.length);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/edit-soal-topic-change.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
