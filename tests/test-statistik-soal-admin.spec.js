const { test, expect } = require('@playwright/test');

test.describe('Statistik Soal - Admin Test', () => {
    test('Navigate to Statistics section and check UI', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Statistics section
        await page.click('a[onclick*="statistics"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Check if Statistics section is visible
        const statsSection = page.locator('#statisticsSection');
        await expect(statsSection).toBeVisible();

        // Check if header is visible
        const header = page.locator('h2:has-text("Statistik Soal")');
        await expect(header).toBeVisible();

        // Check if summary cards exist
        const summaryCards = page.locator('#statsSummary');
        await expect(summaryCards).toBeVisible();

        // Check if filter controls exist
        const categoryFilter = page.locator('#statsKategori');
        await expect(categoryFilter).toBeVisible();

        // Check if table exists
        const statsTable = page.locator('#soalStatisticsTable');
        await expect(statsTable).toBeVisible();

        // Get table rows
        const rows = await statsTable.locator('tr').all();
        console.log('Number of table rows:', rows.length);

        // Log table content
        const tableContent = await statsTable.innerHTML();
        console.log('Table content:', tableContent);

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/statistik-soal-admin-ui.png' });

        expect(errors.length).toBe(0);
    });

    test('Test Statistics filter and pagination', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Statistics section
        await page.click('a[onclick*="statistics"]');
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
        const initialRows = await page.locator('#soalStatisticsTable tr').all();
        console.log('Initial row count:', initialRows.length);

        // Try to filter by category
        const categoryFilter = page.locator('#statsKategori');
        
        // Get available options
        const options = await categoryFilter.locator('option').all();
        console.log('Category filter options:');
        for (const opt of options) {
            const value = await opt.getAttribute('value');
            const text = await opt.textContent();
            console.log(`  value="${value}", text="${text}"`);
        }

        // Select first category option (numeric ID)
        if (options.length > 1) {
            const firstCatOption = options[1];
            const catValue = await firstCatOption.getAttribute('value');
            console.log('Selecting category:', catValue);
            await categoryFilter.selectOption(catValue);
            await page.waitForTimeout(2000);
        }

        const filteredRows = await page.locator('#soalStatisticsTable tr').all();
        console.log('Filtered row count:', filteredRows.length);

        // Check pagination
        const pagination = page.locator('#statsPagination');
        const paginationVisible = await pagination.isVisible();
        console.log('Pagination visible:', paginationVisible);

        if (paginationVisible) {
            const paginationLinks = await pagination.locator('li').all();
            console.log('Number of pagination links:', paginationLinks.length);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/statistik-soal-filter-pagination.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });

    test('Test Statistics summary cards', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Statistics section
        await page.click('a[onclick*="statistics"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Wait for summary cards to load
        await page.waitForTimeout(2000);

        // Check summary cards
        const summaryCards = page.locator('#statsSummary .stat-card');
        const cardCount = await summaryCards.count();
        console.log('Number of summary cards:', cardCount);

        // Log summary card content
        const summaryContent = await page.locator('#statsSummary').innerHTML();
        console.log('Summary content:', summaryContent);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/statistik-soal-summary.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(cardCount).toBeGreaterThan(0);
        expect(errors.length).toBe(0);
    });
});
