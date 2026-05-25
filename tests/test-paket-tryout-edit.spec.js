const { test, expect } = require('@playwright/test');

test.describe('Paket Tryout - Edit Modal Test', () => {
    test('Edit existing paket and verify modal data', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Paket Tryout section
        await page.click('a[onclick*="examPackages"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Wait for table to load
        await page.waitForTimeout(2000);

        // Get first edit button
        const editButton = page.locator('#examPackagesTable button.btn-warning').first();
        await editButton.click();
        await page.waitForTimeout(1000);

        // Check if modal is visible
        const modal = page.locator('#examPackageModal');
        await expect(modal).toBeVisible();

        // Check if fields are populated
        const packageName = page.locator('#examPackageName');
        const packageDesc = page.locator('#examPackageDesc');
        const packageDuration = page.locator('#examPackageDuration');
        const packageCategory = page.locator('#examPackageCategory');
        const packageTotalQuestions = page.locator('#examPackageTotalQuestions');
        const packageActive = page.locator('#examPackageActive');

        // Get values
        const nameValue = await packageName.inputValue();
        const descValue = await packageDesc.inputValue();
        const durationValue = await packageDuration.inputValue();
        const categoryValue = await packageCategory.inputValue();
        const totalQuestionsValue = await packageTotalQuestions.inputValue();
        const activeValue = await packageActive.isChecked();

        console.log('Package Name:', nameValue);
        console.log('Description:', descValue);
        console.log('Duration:', durationValue);
        console.log('Category:', categoryValue);
        console.log('Total Questions:', totalQuestionsValue);
        console.log('Active:', activeValue);

        // Verify fields are not empty (should have data from ID=1)
        expect(nameValue).not.toBe('');
        expect(durationValue).not.toBe('');
        expect(totalQuestionsValue).not.toBe('');

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/paket-tryout-edit-modal.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
