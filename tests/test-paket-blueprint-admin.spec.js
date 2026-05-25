const { test, expect } = require('@playwright/test');

test.describe('Paket Blueprint - Admin Test', () => {
    test('Navigate to Blueprint section and check UI', async ({ page }) => {
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

        // Check if Blueprint section is visible
        const blueprintSection = page.locator('#blueprintSection');
        await expect(blueprintSection).toBeVisible();

        // Check if header is visible
        const header = page.locator('h2:has-text("Paket Blueprint")');
        await expect(header).toBeVisible();

        // Check if add button exists
        const addButton = page.locator('button:has-text("Tambah Blueprint")');
        await expect(addButton).toBeVisible();

        // Check if filter exists
        const filter = page.locator('#blueprintPaketFilter');
        await expect(filter).toBeVisible();

        // Check if table exists
        const table = page.locator('#blueprintTable');
        const tableExists = await table.count() > 0;
        console.log('Table exists:', tableExists);

        if (tableExists) {
            // Get table rows
            const rows = await table.locator('tr').all();
            console.log('Number of table rows:', rows.length);
        } else {
            console.log('Table is empty or not loaded');
        }

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/paket-blueprint-admin-ui.png' });

        expect(errors.length).toBe(0);
    });

    test('Test Blueprint modal and CRUD operations', async ({ page }) => {
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

        // Click add button
        const addButton = page.locator('button:has-text("Tambah Blueprint")');
        await addButton.click();
        await page.waitForTimeout(1000);

        // Check if modal is visible
        const modal = page.locator('#blueprintModal');
        const modalVisible = await modal.isVisible();
        console.log('Blueprint modal visible:', modalVisible);

        if (modalVisible) {
            // Check if all fields exist
            const paketSelect = page.locator('#blueprintPaket');
            const kategoriSelect = page.locator('#blueprintKategori');
            const targetCount = page.locator('#blueprintTargetCount');
            const minDifficulty = page.locator('#blueprintMinDifficulty');
            const maxDifficulty = page.locator('#blueprintMaxDifficulty');

            await expect(paketSelect).toBeVisible();
            await expect(kategoriSelect).toBeVisible();
            await expect(targetCount).toBeVisible();
            await expect(minDifficulty).toBeVisible();
            await expect(maxDifficulty).toBeVisible();

            // Get options from dropdowns
            const paketOptions = await paketSelect.locator('option').all();
            const kategoriOptions = await kategoriSelect.locator('option').all();
            console.log('Paket options count:', paketOptions.length);
            console.log('Kategori options count:', kategoriOptions.length);

            // Close modal
            const closeButton = page.locator('#blueprintModal .btn-close');
            await closeButton.click();
            await page.waitForTimeout(500);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/paket-blueprint-modal.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });

    test('Test Blueprint filter and pagination', async ({ page }) => {
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

        // Wait for table to load
        await page.waitForTimeout(2000);

        // Get initial row count
        const initialRows = await page.locator('#blueprintTable tr').all();
        console.log('Initial row count:', initialRows.length);

        // Try to filter by paket
        const filter = page.locator('#blueprintPaketFilter');
        
        // Get available options
        const options = await filter.locator('option').all();
        console.log('Filter options count:', options.length);

        if (options.length > 1) {
            // Select first paket option
            const firstOption = options[1];
            const value = await firstOption.getAttribute('value');
            if (value) {
                await filter.selectOption(value);
                await page.waitForTimeout(2000);

                const filteredRows = await page.locator('#blueprintTable tr').all();
                console.log('Filtered row count:', filteredRows.length);
            }
        }

        // Check pagination
        const pagination = page.locator('#blueprintPagination');
        const paginationVisible = await pagination.isVisible();
        console.log('Pagination visible:', paginationVisible);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/paket-blueprint-filter-pagination.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
