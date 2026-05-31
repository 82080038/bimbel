const { test, expect } = require('@playwright/test');

test.describe('Performance Test', () => {
    test('Materi page loads within acceptable time', async ({ page }) => {
        // Login first
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        // Measure materi page load time
        const startTime = Date.now();
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForLoadState('networkidle');
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        console.log(`Materi page load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
        
        // Check pagination info
        const paginationInfo = await page.locator('#paginationInfo').textContent();
        console.log(`Pagination info: ${paginationInfo}`);
    });
    
    test('Pagination navigation works', async ({ page }) => {
        // Login first
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForTimeout(3000);
        
        // Navigate to page 2
        const startTime = Date.now();
        const page2Link = await page.locator('#materialsPagination .page-item:has-text("2") a');
        if (await page2Link.count() > 0) {
            await page2Link.click();
            await page.waitForTimeout(2000);
            const endTime = Date.now();
            const navigationTime = endTime - startTime;
            
            console.log(`Page 2 navigation time: ${navigationTime}ms`);
            expect(navigationTime).toBeLessThan(3000);
        }
    });
    
    test('Filter by category performance', async ({ page }) => {
        // Login first
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForTimeout(3000);
        
        // Filter by TWK
        const startTime = Date.now();
        await page.selectOption('#filterKategori', 'TWK');
        await page.waitForTimeout(2000);
        const endTime = Date.now();
        const filterTime = endTime - startTime;
        
        console.log(`TWK filter time: ${filterTime}ms`);
        expect(filterTime).toBeLessThan(3000);
        
        const gridText = await page.locator('#materialsGrid').textContent();
        expect(gridText).not.toContain('Belum ada bahan ajar');
    });
});
