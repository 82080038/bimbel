const { test, expect } = require('@playwright/test');

test.describe('IRT Analysis - Admin Test', () => {
    test('Navigate to IRT Analysis section and check UI', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to IRT Analysis section
        await page.click('a[onclick*="irt"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Check if IRT section is visible
        const section = page.locator('#irtSection');
        await expect(section).toBeVisible();

        // Check if header is visible
        const header = page.locator('h2:has-text("IRT Analysis")');
        await expect(header).toBeVisible();

        // Check if calculate button exists
        const calcButton = page.locator('button:has-text("Hitung IRT Parameters")');
        await expect(calcButton).toBeVisible();

        // Check if category filter exists
        const categoryFilter = page.locator('#irtKategoriFilter');
        await expect(categoryFilter).toBeVisible();

        // Check if quality filter exists
        const qualityFilter = page.locator('#irtQualityFilter');
        await expect(qualityFilter).toBeVisible();

        // Check if table exists
        const table = page.locator('#irtTable');
        await expect(table).toBeVisible();

        // Get table rows
        const rows = await table.locator('tr').all();
        console.log('Number of table rows:', rows.length);

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/irt-analysis-admin-ui.png' });

        expect(errors.length).toBe(0);
    });

    test('Test IRT Analysis filters', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to IRT Analysis section
        await page.click('a[onclick*="irt"]');
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

        // Get initial row count and check categories
        const initialRows = await page.locator('#irtTable tr').all();
        console.log('Initial row count:', initialRows.length);
        
        // Check unique categories in the table
        const categoryBadges = await page.locator('#irtTable .badge.bg-secondary').allTextContents();
        const uniqueCategories = [...new Set(categoryBadges)];
        console.log('Unique categories in table:', uniqueCategories);

        // Try to filter by quality
        const qualityFilter = page.locator('#irtQualityFilter');
        
        // Get available options
        const options = await qualityFilter.locator('option').all();
        console.log('Quality filter options count:', options.length);

        if (options.length > 1) {
            // Select "excellent" quality
            await qualityFilter.selectOption('excellent');
            await page.waitForTimeout(2000);

            const excellentRows = await page.locator('#irtTable tr').all();
            console.log('Excellent quality row count:', excellentRows.length);

            // Select "poor" quality
            await qualityFilter.selectOption('poor');
            await page.waitForTimeout(2000);

            const poorRows = await page.locator('#irtTable tr').all();
            console.log('Poor quality row count:', poorRows.length);

            // Reset filter
            await qualityFilter.selectOption('');
            await page.waitForTimeout(1000);

            const resetRows = await page.locator('#irtTable tr').all();
            console.log('After reset row count:', resetRows.length);
        }

        // Try category filter
        const categoryFilter = page.locator('#irtKategoriFilter');
        const catOptions = await categoryFilter.locator('option').all();
        console.log('Category filter options count:', catOptions.length);

        if (catOptions.length > 1) {
            // Log all category options for debugging
            for (let i = 1; i < catOptions.length; i++) {
                const opt = catOptions[i];
                const val = await opt.getAttribute('value');
                const text = await opt.textContent();
                console.log(`Category option ${i}: value="${val}", text="${text}"`);
            }

            const firstCatOption = catOptions[1];
            const catValue = await firstCatOption.getAttribute('value');
            const catText = await firstCatOption.textContent();
            console.log(`Selecting category: value="${catValue}", text="${catText}"`);
            
            if (catValue) {
                await categoryFilter.selectOption(catValue);
                await page.waitForTimeout(3000);

                const catFilteredRows = await page.locator('#irtTable tr').all();
                console.log('Category filtered row count:', catFilteredRows.length);
                
                // Check categories after filtering
                const filteredBadges = await page.locator('#irtTable .badge.bg-secondary').allTextContents();
                const filteredCategories = [...new Set(filteredBadges)];
                console.log('Categories after filter:', filteredCategories);
            }
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/irt-analysis-filters.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });

    test('Test IRT Calculation (without actual calculation)', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to IRT Analysis section
        await page.click('a[onclick*="irt"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Check if calculate button exists and is clickable
        const calcButton = page.locator('button:has-text("Hitung IRT Parameters")');
        await expect(calcButton).toBeVisible();
        await expect(calcButton).toBeEnabled();

        // Take screenshot before potential calculation
        await page.screenshot({ path: 'playwright-screenshots/irt-analysis-calc-button.png' });

        // Note: We won't actually click the calculate button as it would modify database
        // Just verify the button is present and functional

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
