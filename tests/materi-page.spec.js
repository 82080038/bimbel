const { test, expect } = require('@playwright/test');

test('Materi Page Test', async ({ page }) => {
    // Check for errors in console
    const errors = [];
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(`[${msg.type()}] ${text}`);
        if (msg.type() === 'error') {
            errors.push(text);
        }
    });
    
    // First, login to the application
    await page.goto('http://localhost/bimbel/login.html');
    await page.waitForLoadState('networkidle');
    
    // Fill login form (using test credentials)
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Now navigate to materi page
    await page.goto('http://localhost/bimbel/participant/materi.html');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-screenshots/materi-page.png', fullPage: true });
    
    // Wait a bit more for dynamic content
    await page.waitForTimeout(3000);
    
    // Take another screenshot after content loads
    await page.screenshot({ path: 'playwright-screenshots/materi-page-after-load.png', fullPage: true });
    
    // Log all console messages
    console.log('Console Logs:', logs);
    
    // Log any console errors
    if (errors.length > 0) {
        console.log('Console Errors:', errors);
    }
    
    // Check page content
    const bodyContent = await page.content();
    console.log('Page contains materi-container:', bodyContent.includes('materi-container'));
    console.log('Page contains materiContent:', bodyContent.includes('materiContent'));
    
    // Check if main elements are visible
    const materiContainer = page.locator('.materi-container');
    const containerCount = await materiContainer.count();
    console.log('Materi container count:', containerCount);
    
    // Check if comprehensive materials accordion exists
    const accordion = page.locator('#comprehensiveMaterialsAccordion');
    const accordionExists = await accordion.count();
    console.log('Accordion elements found:', accordionExists);
    
    // Check if materials grid exists
    const materialsGrid = page.locator('#materialsGrid');
    const gridExists = await materialsGrid.count();
    console.log('Materials grid elements found:', gridExists);
    
    // Check if we were redirected
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
});
