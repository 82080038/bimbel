const { test, expect } = require('@playwright/test');

test.describe('Sesi Ujian - Admin Test', () => {
    test('Navigate to Sesi Ujian section and check UI', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Sesi Ujian section
        await page.click('a[onclick*="examSessions"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Check if Sesi Ujian section is visible
        const section = page.locator('#examSessionsSection');
        await expect(section).toBeVisible();

        // Check if header is visible
        const header = page.locator('h2:has-text("Sesi Ujian")');
        await expect(header).toBeVisible();

        // Check if refresh button exists
        const refreshButton = page.locator('#examSessionsSection button:has-text("Refresh")');
        await expect(refreshButton).toBeVisible();

        // Check if user filter exists
        const userFilter = page.locator('#filterSessionUser');
        await expect(userFilter).toBeVisible();

        // Check if status filter exists
        const filter = page.locator('#filterSessionStatus');
        await expect(filter).toBeVisible();

        // Check if table exists
        const table = page.locator('#examSessionsTable');
        await expect(table).toBeVisible();

        // Get table rows
        const rows = await table.locator('tr').all();
        console.log('Number of table rows:', rows.length);

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/sesi-ujian-admin-ui.png' });

        expect(errors.length).toBe(0);
    });

    test('Test Sesi Ujian filter and search', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Sesi Ujian section
        await page.click('a[onclick*="examSessions"]');
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
        const initialRows = await page.locator('#examSessionsTable tr').all();
        console.log('Initial row count:', initialRows.length);

        // Try to filter by status
        const filter = page.locator('#filterSessionStatus');
        
        // Get available options
        const options = await filter.locator('option').all();
        console.log('Filter options count:', options.length);

        if (options.length > 1) {
            // Select first status option
            const firstOption = options[1];
            const value = await firstOption.getAttribute('value');
            if (value) {
                await filter.selectOption(value);
                await page.waitForTimeout(2000);

                const filteredRows = await page.locator('#examSessionsTable tr').all();
                console.log('Filtered row count:', filteredRows.length);
            }
        }

        // Try filter by user
        const userFilter = page.locator('#filterSessionUser');
        const userOptions = await userFilter.locator('option').all();
        console.log('User filter options count:', userOptions.length);

        if (userOptions.length > 1) {
            const firstUserOption = userOptions[1];
            const userValue = await firstUserOption.getAttribute('value');
            if (userValue) {
                await userFilter.selectOption(userValue);
                await page.waitForTimeout(2000);

                const userFilteredRows = await page.locator('#examSessionsTable tr').all();
                console.log('User filtered row count:', userFilteredRows.length);
            }
        }

        // Reset user filter
        await userFilter.selectOption('');
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/sesi-ujian-filter-search.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
