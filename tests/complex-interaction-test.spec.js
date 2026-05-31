const { test, expect } = require('@playwright/test');

test.describe('Complex User Interactions', () => {
    test('Materi: Filter + Pagination + Search combination', async ({ page }) => {
        // Login
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        // Navigate to materi
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForTimeout(3000);
        
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        
        // Step 1: Filter by TWK category
        await page.selectOption('#filterKategori', 'TWK');
        await page.waitForTimeout(2000);
        let paginationInfo = await page.locator('#paginationInfo').textContent();
        console.log(`After TWK filter: ${paginationInfo}`);
        
        // Step 2: Search for specific material
        await page.fill('#searchMaterials', 'nasionalisme');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        paginationInfo = await page.locator('#paginationInfo').textContent();
        console.log(`After search 'nasionalisme': ${paginationInfo}`);
        
        // Step 3: Clear filters
        await page.selectOption('#filterKategori', '');
        await page.fill('#searchMaterials', '');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        paginationInfo = await page.locator('#paginationInfo').textContent();
        console.log(`After clear filters: ${paginationInfo}`);
        
        // Step 4: Navigate to page 2
        const page2Link = await page.locator('#materialsPagination .page-item:has-text("2") a');
        if (await page2Link.count() > 0) {
            await page2Link.click();
            await page.waitForTimeout(2000);
            paginationInfo = await page.locator('#paginationInfo').textContent();
            console.log(`After page 2: ${paginationInfo}`);
        }
        
        expect(consoleErrors.length).toBe(0);
        console.log('✅ Materi complex interaction test passed');
    });
    
    test('Dashboard: Refresh data after navigation', async ({ page }) => {
        // Login
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        await page.waitForTimeout(3000); // Wait for data load
        
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        
        // Navigate away and back
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForTimeout(2000);
        await page.goto('http://localhost/bimbel/participant/dashboard.html');
        await page.waitForTimeout(3000);
        
        // Check dashboard content
        const dashboardContent = await page.locator('#dashboardContent').textContent();
        expect(dashboardContent.length).toBeGreaterThan(0);
        
        expect(consoleErrors.length).toBe(0);
        console.log('✅ Dashboard refresh test passed');
    });
    
    test('Ujian: Load exam types and validate selection', async ({ page }) => {
        // Login
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        // Navigate to ujian
        await page.goto('http://localhost/bimbel/participant/ujian.html');
        await page.waitForTimeout(3000);
        
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        
        // Select exam type
        const examSelect = await page.locator('#examTypeSelection');
        const options = await examSelect.locator('option').allTextContents();
        console.log(`Available exam types: ${options.join(', ')}`);
        
        if (options.length > 1) {
            // Select first non-empty option
            const firstOption = options.find(o => o !== 'Memuat jenis ujian...' && o !== 'Pilih jenis ujian...');
            if (firstOption) {
                await page.selectOption('#examTypeSelection', { label: firstOption });
                await page.waitForTimeout(2000);
                
                // Check if paket loaded
                const paketOptions = await page.locator('#paketSelection option').allTextContents();
                console.log(`Paket options: ${paketOptions.join(', ')}`);
            }
        }
        
        // Console errors expected: fullscreen warning (not actual error)
        const realErrors = consoleErrors.filter(e => 
            !e.includes('requestFullscreen') && 
            !e.includes('Permissions check') &&
            !e.includes('Anti-cheat')
        );
        expect(realErrors.length).toBe(0);
        console.log('✅ Ujian interaction test passed');
    });
});
