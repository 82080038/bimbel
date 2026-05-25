const { test, expect } = require('@playwright/test');

test.describe('Paket Tryout - Admin Test', () => {
    test('Navigate to Paket Tryout section and check UI', async ({ page }) => {
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

        // Check if Paket Tryout section is visible
        const section = page.locator('#examPackagesSection');
        await expect(section).toBeVisible();

        // Check if header is visible
        const header = page.locator('h2:has-text("Paket Tryout")');
        await expect(header).toBeVisible();

        // Check if add button exists
        const addButton = page.locator('button:has-text("Create Package")');
        await expect(addButton).toBeVisible();

        // Check if search input exists
        const searchInput = page.locator('#searchExamPackage');
        await expect(searchInput).toBeVisible();

        // Check if filter exists
        const filter = page.locator('#filterPackageCategory');
        await expect(filter).toBeVisible();

        // Check if table exists
        const table = page.locator('#examPackagesTable');
        await expect(table).toBeVisible();

        // Get table rows
        const rows = await table.locator('tr').all();
        console.log('Number of table rows:', rows.length);

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/paket-tryout-admin-ui.png' });

        expect(errors.length).toBe(0);
    });

    test('Test Paket Tryout modal and CRUD operations', async ({ page }) => {
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

        // Click add button
        const addButton = page.locator('button:has-text("Create Package")');
        await addButton.click();
        await page.waitForTimeout(1000);

        // Check if modal is visible
        const modal = page.locator('#examPackageModal');
        const modalVisible = await modal.isVisible();
        console.log('Exam Package modal visible:', modalVisible);

        if (modalVisible) {
            // Check if all fields exist
            const packageName = page.locator('#examPackageName');
            const packageDesc = page.locator('#examPackageDesc');
            const packageDuration = page.locator('#examPackageDuration');
            const packageCategory = page.locator('#examPackageCategory');
            const packageTotalQuestions = page.locator('#examPackageTotalQuestions');
            const packageActive = page.locator('#examPackageActive');

            await expect(packageName).toBeVisible();
            await expect(packageDesc).toBeVisible();
            await expect(packageDuration).toBeVisible();
            await expect(packageCategory).toBeVisible();
            await expect(packageTotalQuestions).toBeVisible();
            await expect(packageActive).toBeVisible();

            // Get options from category dropdown
            const categoryOptions = await packageCategory.locator('option').all();
            console.log('Category options count:', categoryOptions.length);

            // Close modal
            const closeButton = page.locator('#examPackageModal .btn-close');
            await closeButton.click();
            await page.waitForTimeout(500);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/paket-tryout-modal.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });

    test('Test Paket Tryout filter and search', async ({ page }) => {
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

        // Get initial row count
        const initialRows = await page.locator('#examPackagesTable tr').all();
        console.log('Initial row count:', initialRows.length);

        // Try to filter by category
        const filter = page.locator('#filterPackageCategory');
        
        // Get available options
        const options = await filter.locator('option').all();
        console.log('Filter options count:', options.length);

        if (options.length > 1) {
            // Select first category option
            const firstOption = options[1];
            const value = await firstOption.getAttribute('value');
            if (value) {
                await filter.selectOption(value);
                await page.waitForTimeout(2000);

                const filteredRows = await page.locator('#examPackagesTable tr').all();
                console.log('Filtered row count:', filteredRows.length);
            }
        }

        // Try search
        const searchInput = page.locator('#searchExamPackage');
        await searchInput.fill('TWK');
        await page.waitForTimeout(1000);

        const searchedRows = await page.locator('#examPackagesTable tr').all();
        console.log('Searched row count:', searchedRows.length);

        // Clear search
        await searchInput.fill('');
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/paket-tryout-filter-search.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
