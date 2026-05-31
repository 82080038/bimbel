const { test, expect } = require('@playwright/test');

test.describe('Materi Page Filter and Clickable Items', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to login page
        await page.goto('http://localhost/bimbel/login.html');
        
        // Fill login form
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        
        // Submit login
        await page.click('#loginForm button[type="submit"]');
        
        // Wait for redirect to dashboard
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        // Navigate to materi page
        await page.goto('http://localhost/bimbel/participant/materi.html');
        
        // Wait for materi content to load
        await page.waitForSelector('#materiContent', { timeout: 10000 });
    });

    test('should load materi page with comprehensive materials', async ({ page }) => {
        // Wait for comprehensive materials accordion
        await page.waitForSelector('#comprehensiveMaterialsAccordion', { timeout: 10000 });
        
        // Check if accordion has items
        const accordionItems = await page.locator('#comprehensiveMaterialsAccordion .accordion-item').count();
        console.log(`Accordion items count: ${accordionItems}`);
        expect(accordionItems).toBeGreaterThan(0);
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/materi-page-loaded.png' });
    });

    test('should have category filter with correct values', async ({ page }) => {
        // Wait for filter to load with options
        await page.waitForSelector('#filterKategori', { timeout: 10000 });
        await page.waitForTimeout(1000); // Wait for API to populate options
        
        // Get all options from category filter
        const options = await page.locator('#filterKategori option').allTextContents();
        console.log('Category filter options:', options);
        
        // Check if it has the expected categories
        expect(options).toContain('Semua Kategori');
        
        // Take screenshot of filter section
        await page.screenshot({ path: 'playwright-screenshots/materi-filter-options.png' });
    });

    test('should have clickable comprehensive material items', async ({ page }) => {
        // Wait for comprehensive materials to load
        await page.waitForSelector('#comprehensiveMaterialsAccordion', { timeout: 10000 });
        
        // Check if material items have clickable class and onclick
        const firstMaterialItem = await page.locator('#comprehensiveMaterialsAccordion .list-group-item').first();
        
        // Check if it has the clickable class
        const hasClickableClass = await firstMaterialItem.evaluate(el => el.classList.contains('clickable-materi'));
        console.log(`First material item has clickable class: ${hasClickableClass}`);
        
        // Check if it has cursor pointer style
        const cursorStyle = await firstMaterialItem.evaluate(el => window.getComputedStyle(el).cursor);
        console.log(`First material item cursor style: ${cursorStyle}`);
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/materi-clickable-items.png' });
        
        // Try clicking on first material item
        await firstMaterialItem.click();
        
        // Wait a moment for filter to apply
        await page.waitForTimeout(1000);
        
        // Check if search input was populated
        const searchValue = await page.inputValue('#searchMaterials');
        console.log(`Search input value after click: ${searchValue}`);
        
        // Check if category filter was set
        const categoryValue = await page.inputValue('#filterKategori');
        console.log(`Category filter value after click: ${categoryValue}`);
        
        // Take screenshot after click
        await page.screenshot({ path: 'playwright-screenshots/materi-after-click.png' });
    });

    test('should filter materials when category is selected', async ({ page }) => {
        // Wait for filter to load
        await page.waitForSelector('#filterKategori', { timeout: 10000 });
        
        // Wait for materials grid to load
        await page.waitForSelector('#materialsGrid', { timeout: 10000 });
        
        // Select a category (try TWK)
        await page.selectOption('#filterKategori', 'TWK');
        
        // Wait for filter to apply
        await page.waitForTimeout(1000);
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/materi-filtered-by-category.png' });
        
        // Check if materials grid is updated
        const materialsGrid = await page.locator('#materialsGrid');
        const gridContent = await materialsGrid.textContent();
        console.log('Materials grid content after filtering:', gridContent.substring(0, 200));
    });
});
