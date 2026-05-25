const { test, expect } = require('@playwright/test');

test.describe('Bahan Pelajaran - Admin Test', () => {
    let page;
    const BASE_URL = 'http://localhost/bimbel/admin/admin.html';
    const AUTH_TOKEN = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto(BASE_URL);
        
        // Login
        await page.fill('#username', 'admin');
        await page.fill('#password', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/admin.html', { timeout: 10000 });
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('Navigate to Bahan Pelajaran section and check UI', async () => {
        // Navigate to Bahan Pelajaran section
        await page.click('a[onclick="showSection(\'bahanPelajaran\')"]');
        await page.waitForTimeout(2000);

        // Check section is visible
        const section = page.locator('#bahanPelajaranSection');
        await expect(section).toBeVisible();

        // Check heading
        const heading = page.locator('#bahanPelajaranSection h2');
        await expect(heading).toContainText('Bahan Pelajaran');

        // Check add button
        const addButton = page.locator('#bahanPelajaranSection button.btn-success');
        await expect(addButton).toBeVisible();
        await expect(addButton).toContainText('Tambah Bahan');

        // Check category filter
        const categoryFilter = page.locator('#bahanKategoriFilter');
        await expect(categoryFilter).toBeVisible();

        // Check table
        const table = page.locator('#bahanPelajaranTable');
        await expect(table).toBeVisible();

        console.log('Bahan Pelajaran UI loaded successfully');
    });

    test('Test Bahan Pelajaran category filter', async () => {
        // Navigate to Bahan Pelajaran section
        await page.click('a[onclick="showSection(\'bahanPelajaran\')"]');
        await page.waitForTimeout(2000);

        // Get category filter
        const categoryFilter = page.locator('#bahanKategoriFilter');
        
        // Get available options
        const options = await categoryFilter.locator('option').all();
        console.log('Category filter options:');
        for (const opt of options) {
            const value = await opt.getAttribute('value');
            const text = await opt.textContent();
            console.log(`  value="${value}", text="${text}"`);
        }

        // Check that values are numeric IDs
        if (options.length > 1) {
            const firstCatOption = options[1];
            const catValue = await firstCatOption.getAttribute('value');
            console.log('First category value:', catValue);
            expect(catValue).toMatch(/^\d+$/); // Should be numeric
        }

        // Select first category option (numeric ID)
        if (options.length > 1) {
            const firstCatOption = options[1];
            const catValue = await firstCatOption.getAttribute('value');
            console.log('Selecting category:', catValue);
            await categoryFilter.selectOption(catValue);
            await page.waitForTimeout(2000);
        }

        const filteredRows = await page.locator('#bahanPelajaranTable tr').all();
        console.log('Filtered row count:', filteredRows.length);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/bahan-pelajaran-filter.png' });
    });

    test('Test Bahan Pelajaran modal', async () => {
        // Navigate to Bahan Pelajaran section
        await page.click('a[onclick="showSection(\'bahanPelajaran\')"]');
        await page.waitForTimeout(2000);

        // Click add button
        await page.click('#bahanPelajaranSection button.btn-success');
        await page.waitForTimeout(1000);

        // Check modal is visible
        const modal = page.locator('#bahanPelajaranModal');
        await expect(modal).toBeVisible();

        // Check modal title
        const modalTitle = page.locator('#bahanPelajaranModalLabel');
        await expect(modalTitle).toContainText('Kelola Bahan Pelajaran');

        // Check category dropdown in modal
        const modalCategory = page.locator('#bahanKategoriId');
        await expect(modalCategory).toBeVisible();

        // Get category options in modal
        const modalOptions = await modalCategory.locator('option').all();
        console.log('Modal category options count:', modalOptions.length);

        // Check that values are numeric IDs
        if (modalOptions.length > 1) {
            const firstOption = modalOptions[1];
            const value = await firstOption.getAttribute('value');
            console.log('First modal category value:', value);
            expect(value).toMatch(/^\d+$/); // Should be numeric
        }

        // Close modal
        await page.click('#bahanPelajaranModal .btn-close');
        await page.waitForTimeout(500);

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/bahan-pelajaran-modal.png' });
    });

    test('Test Generate Bahan Pelajaran dropdown', async () => {
        // Navigate to Content Generation section
        await page.click('a[onclick="showSection(\'contentGeneration\')"]');
        await page.waitForTimeout(2000);

        // Check generate bahan pelajaran section
        const generateSection = page.locator('h4:has-text("Generate Bahan Pelajaran")');
        await expect(generateSection).toBeVisible();

        // Check category dropdown
        const generateCategory = page.locator('#bahanGenerateKategori');
        await expect(generateCategory).toBeVisible();

        // Get category options
        const options = await generateCategory.locator('option').all();
        console.log('Generate Bahan category options count:', options.length);

        // Check that values are numeric IDs
        if (options.length > 1) {
            const firstOption = options[1];
            const value = await firstOption.getAttribute('value');
            console.log('First generate category value:', value);
            expect(value).toMatch(/^\d+$/); // Should be numeric
        }

        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/bahan-pelajaran-generate.png' });
    });
});
