const { test, expect } = require('@playwright/test');

test.describe('Manajemen Topik Materi - Admin Test', () => {
    test('Navigate to Topics section and check UI', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Topics section
        await page.click('a[onclick*="topics"]');
        await page.waitForTimeout(2000);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Check if Topics section is visible
        const topicsSection = page.locator('#topicsSection');
        await expect(topicsSection).toBeVisible();

        // Check if header is visible
        const header = page.locator('h2:has-text("Manajemen Topik Materi")');
        await expect(header).toBeVisible();

        // Check if filter controls exist
        const categoryFilter = page.locator('#topicCategoryFilter');
        await expect(categoryFilter).toBeVisible();

        const searchInput = page.locator('#searchTopic');
        await expect(searchInput).toBeVisible();

        const reextractBtn = page.locator('button:has-text("Re-Extract Topics")');
        await expect(reextractBtn).toBeVisible();

        // Check if table exists
        const topicsTable = page.locator('#topicsTable');
        await expect(topicsTable).toBeVisible();

        // Get table rows
        const rows = await topicsTable.locator('tr').all();
        console.log('Number of table rows:', rows.length);

        // Log table content
        const tableContent = await topicsTable.innerHTML();
        console.log('Table content:', tableContent);

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/topik-materi-admin-ui.png' });

        expect(errors.length).toBe(0);
    });

    test('Test Topic actions (View, Edit, Delete)', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Topics section
        await page.click('a[onclick*="topics"]');
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

        // Try to click View button
        const viewButton = page.locator('button.btn-info').first();
        if (await viewButton.isVisible()) {
            await viewButton.click();
            await page.waitForTimeout(1000);
            
            // Check if modal appeared
            const modalVisible = await page.locator('#topicDetailsModal').isVisible();
            console.log('View modal visible:', modalVisible);
            
            if (modalVisible) {
                // Close the modal
                const closeButton = page.locator('#topicDetailsModal .btn-close').first();
                if (await closeButton.isVisible()) {
                    await closeButton.click();
                } else {
                    const closeBtn = page.locator('#topicDetailsModal .btn-secondary').first();
                    await closeBtn.click();
                }
                await page.waitForTimeout(500);
            }
        }

        // Try to click Edit button
        const editButton = page.locator('button.btn-warning').first();
        if (await editButton.isVisible()) {
            await editButton.click();
            await page.waitForTimeout(1000);
            
            // Check if modal appeared
            const editModalVisible = await page.locator('#topicModal').isVisible();
            console.log('Edit modal visible:', editModalVisible);
            
            if (editModalVisible) {
                // Close the modal
                const closeButton = page.locator('#topicModal .btn-close').first();
                if (await closeButton.isVisible()) {
                    await closeButton.click();
                } else {
                    const closeBtn = page.locator('#topicModal .btn-secondary').first();
                    await closeBtn.click();
                }
                await page.waitForTimeout(500);
            }
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/topik-materi-actions.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });

    test('Test category filter and search', async ({ page }) => {
        // Navigate to admin login
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Quick admin login
        await page.click('button[onclick*="admin"]');
        await page.waitForURL('**/admin/admin.html');
        await page.waitForLoadState('networkidle');

        // Navigate to Topics section
        await page.click('a[onclick*="topics"]');
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
        const initialRows = await page.locator('#topicsTable tr').all();
        console.log('Initial row count:', initialRows.length);

        // Try to filter by category
        const categoryFilter = page.locator('#topicCategoryFilter');
        
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

        const filteredRows = await page.locator('#topicsTable tr').all();
        console.log('Filtered row count:', filteredRows.length);

        // Try search
        const searchInput = page.locator('#searchTopic');
        await searchInput.fill('Pancasila');
        await page.waitForTimeout(2000);

        const searchedRows = await page.locator('#topicsTable tr').all();
        console.log('Searched row count (Pancasila):', searchedRows.length);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/topik-materi-filter-search.png' });

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
