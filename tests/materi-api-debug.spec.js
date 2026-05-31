const { test, expect } = require('@playwright/test');

test.describe('Materi API Debug', () => {
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

    test('should call get_all_bahan_pelajaran API', async ({ page }) => {
        // Listen for network requests
        const apiCallPromise = page.waitForResponse(response => 
            response.url().includes('soal.php?action=get_all_bahan_pelajaran')
        );

        // Wait for API call
        const response = await apiCallPromise;
        
        console.log('API Response status:', response.status());
        console.log('API Response URL:', response.url());
        
        const data = await response.json();
        console.log('API Response data:', JSON.stringify(data, null, 2));
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/materi-api-response.png' });
    });

    test('should display materials in grid', async ({ page }) => {
        // Wait for materials grid to load
        await page.waitForTimeout(3000);
        
        // Check if materials grid has content
        const grid = await page.locator('#materialsGrid');
        const gridContent = await grid.textContent();
        
        console.log('Materials grid content:', gridContent.substring(0, 500));
        
        // Check if it's empty state or has materials
        const hasEmptyState = await grid.locator('.text-center').count();
        console.log('Empty state elements count:', hasEmptyState);
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-screenshots/materi-grid-content.png' });
    });
});
