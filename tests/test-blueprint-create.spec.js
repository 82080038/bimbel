const { test, expect } = require('@playwright/test');

test.describe('Paket Blueprint - Create and Display Test', () => {
    test('Create a blueprint and verify it appears in table', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Blueprint section
        await page.click('a[onclick*="blueprint"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Get initial row count
        const initialRows = await page.locator('#blueprintTable tr').all();
        console.log('Initial row count:', initialRows.length);

        // Click add button
        const addButton = page.locator('button:has-text("Tambah Blueprint")');
        await addButton.click();
        await page.waitForTimeout(1000);

        // Fill the form
        const paketSelect = page.locator('#blueprintPaket');
        const kategoriSelect = page.locator('#blueprintKategori');
        const targetCount = page.locator('#blueprintTargetCount');
        const minDifficulty = page.locator('#blueprintMinDifficulty');
        const maxDifficulty = page.locator('#blueprintMaxDifficulty');

        // Select first paket
        await paketSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Select first kategori
        await kategoriSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Set target count
        await targetCount.fill('10');
        await page.waitForTimeout(500);

        // Set difficulty
        await minDifficulty.selectOption('sedang');
        await maxDifficulty.selectOption('sedang');
        await page.waitForTimeout(500);

        // Take screenshot before save
        await page.screenshot({ path: 'playwright-screenshots/blueprint-form-filled.png' });

        // Click save button
        const saveButton = page.locator('#blueprintModal .btn-primary:has-text("Simpan")');
        await saveButton.click();
        await page.waitForTimeout(2000);

        // Check for toast notification
        const toast = page.locator('.toast.show');
        const toastVisible = await toast.isVisible();
        console.log('Toast notification visible:', toastVisible);

        if (toastVisible) {
            const toastText = await toast.textContent();
            console.log('Toast text:', toastText);
        }

        // Wait for modal to close
        await page.waitForTimeout(1000);

        // Check if new row appears in table
        const newRows = await page.locator('#blueprintTable tr').all();
        console.log('Row count after save:', newRows.length);

        // Take screenshot after save
        await page.screenshot({ path: 'playwright-screenshots/blueprint-after-save.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(newRows.length).toBeGreaterThan(initialRows.length);
        expect(errors.length).toBe(0);
    });
});
