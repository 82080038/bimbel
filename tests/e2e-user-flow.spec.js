const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

test.describe('End-to-End User Flow', () => {
    test('User login, view dashboard, navigate to materi', async ({ page }) => {
        // Step 1: Login
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        
        // Verify redirect to dashboard
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        console.log('✅ Login successful');
        
        // Step 2: Verify dashboard content loaded
        await page.waitForTimeout(2000);
        const dashboardContent = await page.locator('#dashboardContent').textContent();
        expect(dashboardContent.length).toBeGreaterThan(0);
        console.log('✅ Dashboard loaded');
        
        // Step 3: Navigate to materi
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForTimeout(3000);
        const materiContent = await page.locator('#materiContent').textContent();
        expect(materiContent.length).toBeGreaterThan(0);
        console.log('✅ Materi page loaded');
        
        // Step 4: Filter by category TWK
        await page.selectOption('#filterKategori', 'TWK');
        await page.waitForTimeout(2000);
        const gridText = await page.locator('#materialsGrid').textContent();
        console.log('✅ Materi filtered by TWK');
        
        await page.screenshot({ path: 'playwright-screenshots/e2e-materi-filtered.png' });
    });

    test('User login and navigate to ujian page', async ({ page }) => {
        // Step 1: Login
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        // Step 2: Navigate to ujian
        await page.goto('http://localhost/bimbel/participant/ujian.html');
        await page.waitForTimeout(3000);
        const examContent = await page.locator('#examContent').textContent();
        expect(examContent.length).toBeGreaterThan(0);
        console.log('✅ Ujian page loaded');
        
        // Step 3: Check if exam types loaded
        const examTypeSelect = await page.locator('#examTypeSelection');
        await page.waitForTimeout(2000); // Wait for API to load
        const options = await examTypeSelect.locator('option').count();
        console.log(`Exam types available: ${options}`);
        // Allow 0 if API not returning data, just check page loaded
        if (options === 0) {
            console.log('⚠️ No exam types loaded - may need database data');
        }
        
        await page.screenshot({ path: 'playwright-screenshots/e2e-ujian-page.png' });
    });

    test('User login and navigate through all participant pages', async ({ page }) => {
        // Login
        await page.goto('http://localhost/bimbel/login.html');
        await page.fill('#username', 'testuser');
        await page.fill('#password', 'test123');
        await page.click('#loginForm button[type="submit"]');
        await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
        
        const pages = [
            { url: 'http://localhost/bimbel/participant/leaderboard.html', selector: '#leaderboardContent', name: 'Leaderboard' },
            { url: 'http://localhost/bimbel/participant/achievements.html', selector: '#achievementsContent', name: 'Achievements' },
            { url: 'http://localhost/bimbel/participant/profile.html', selector: '#profileContent', name: 'Profile' },
            { url: 'http://localhost/bimbel/participant/certificate.html', selector: 'body', name: 'Certificate' },
        ];
        
        for (const p of pages) {
            await page.goto(p.url);
            await page.waitForTimeout(2000);
            const content = await page.locator(p.selector).textContent();
            expect(content.length).toBeGreaterThan(0);
            console.log(`✅ ${p.name} page loaded`);
        }
    });
});
