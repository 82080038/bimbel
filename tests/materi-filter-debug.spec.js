const { test, expect } = require('@playwright/test');

test.describe('Materi Filter Debug', () => {
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

    test('debug filter by TWK category', async ({ page }) => {
        // Wait for materials to load
        await page.waitForTimeout(3000);
        
        // Get initial materials count
        const initialGrid = await page.locator('#materialsGrid');
        const initialContent = await initialGrid.textContent();
        console.log('Initial grid content length:', initialContent.length);
        
        // Select TWK category
        await page.selectOption('#filterKategori', 'TWK');
        
        // Wait for filter to apply
        await page.waitForTimeout(2000);
        
        // Get filtered materials count
        const filteredGrid = await page.locator('#materialsGrid');
        const filteredContent = await filteredGrid.textContent();
        console.log('Filtered grid content length:', filteredContent.length);
        console.log('Filtered grid content:', filteredContent.substring(0, 500));
        
        // Check if it's empty state
        const hasEmptyState = await filteredGrid.locator('.text-center').count();
        console.log('Empty state count:', hasEmptyState);
        
        // Check materi cards
        const materiCards = await filteredGrid.locator('.materi-card').count();
        console.log('Materi cards count:', materiCards);
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/materi-filter-twk-debug.png' });
    });

    test('check allMaterials data in browser', async ({ page }) => {
        // Wait for materials to load
        await page.waitForTimeout(3000);
        
        // Execute script to check allMaterials data
        const materialsData = await page.evaluate(() => {
            if (typeof allMaterials !== 'undefined') {
                return {
                    count: allMaterials.length,
                    sample: allMaterials.slice(0, 3).map(m => ({
                        id: m.id,
                        judul: m.judul,
                        kategori_id: m.kategori_id,
                        nama_kategori: m.nama_kategori
                    }))
                };
            }
            return { error: 'allMaterials not defined' };
        });
        
        console.log('allMaterials data:', JSON.stringify(materialsData, null, 2));
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/materi-allmaterials-debug.png' });
    });
});
