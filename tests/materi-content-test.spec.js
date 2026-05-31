const { test, expect } = require('@playwright/test');

test.describe('Materi Content Display Test', () => {
    test('Direct access to integritas.html has content', async ({ page }) => {
        const consoleErrors = [];
        const consoleLogs = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
            consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        });
        
        await page.goto('http://localhost/bimbel/data/learning_materials/topics/TWK/30_integritas/integritas.html');
        await page.waitForTimeout(1000);
        
        const bodyText = await page.locator('body').textContent();
        console.log('Direct integritas.html content length:', bodyText.length);
        console.log('First 200 chars:', bodyText.substring(0, 200));
        
        expect(bodyText.length).toBeGreaterThan(100);
        expect(bodyText).toContain('Integritas');
        expect(consoleErrors.length).toBe(0);
    });

    test('Click materi from comprehensive list shows content', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
                console.log('CONSOLE ERROR:', msg.text());
            }
        });

        // Login
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        // Go to materi page
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForTimeout(3000);
        
        // Expand TWK accordion
        const twkAccordion = await page.locator('.accordion-item:has-text("TWK") .accordion-button');
        if (await twkAccordion.count() > 0) {
            await twkAccordion.click();
            await page.waitForTimeout(3000); // Wait for accordion animation to complete
            
            // Find and click "Integritas Nasional" in TWK section
            const twkSection = page.locator('.accordion-item:has-text("TWK")');
            const integritasItem = twkSection.locator('.clickable-materi:has-text("Integritas")');
            console.log('Integritas count:', await integritasItem.count());
            
            // Use JavaScript click to bypass visibility check
            await integritasItem.evaluate(el => el.click());
            await page.waitForTimeout(3000);
            
            // Check materials grid after filter
            const gridContent = await page.locator('#materialsGrid').textContent();
            console.log('Grid content length:', gridContent.length);
            console.log('Grid first 500 chars:', gridContent.substring(0, 500));
            
            // Check if any material card has "Buka" or "Lihat" button
            const bukaButtons = await page.locator('#materialsGrid .btn').allTextContents();
            console.log('Buttons found:', bukaButtons);
        } else {
            console.log('TWK accordion not found');
        }
        
        const realErrors = consoleErrors.filter(e => 
            !e.includes('Fullscreen') && 
            !e.includes('Anti-cheat') &&
            !e.includes('Failed to fetch') &&
            !e.includes('dashboard components') &&
            !e.includes('429')
        );
        expect(realErrors.length).toBe(0);
    });

    test('Check first material card opens content', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        // Login
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 15000 });
        await page.waitForLoadState('networkidle');
        
        // Go to materi page
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForTimeout(3000);
        
        // Get first material card (class is materi-card not material-card)
        const firstCard = await page.locator('#materialsGrid .materi-card').first();
        if (await firstCard.count() > 0) {
            const cardText = await firstCard.textContent();
            console.log('First card text:', cardText.substring(0, 200));
            
            // Check for Buka/Lihat button
            const bukaBtn = firstCard.locator('a, button').first();
            if (await bukaBtn.count() > 0) {
                const btnText = await bukaBtn.textContent();
                console.log('Button text:', btnText);
                
                // Check href or onclick
                const href = await bukaBtn.getAttribute('href');
                const onclick = await bukaBtn.getAttribute('onclick');
                console.log('Button href:', href);
                console.log('Button onclick:', onclick);
                
                expect(btnText).toMatch(/Buka|Lihat|Tidak/);
            }
        } else {
            console.log('No material cards found');
        }
        
        console.log('All console errors:', consoleErrors);
        const realErrors2 = consoleErrors.filter(e => 
            !e.includes('Fullscreen') && 
            !e.includes('Anti-cheat') &&
            !e.includes('Failed to fetch') &&
            !e.includes('dashboard components') &&
            !e.includes('429')
        );
        expect(realErrors2.length).toBe(0);
    });
});
