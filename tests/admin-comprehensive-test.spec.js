const { test, expect } = require('@playwright/test');

test.describe('Admin Comprehensive Test', () => {
    test('Admin login and dashboard navigation', async ({ page }) => {
        // Navigate to login page
        await page.goto('http://localhost/ujian/login.html');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Click admin quick login button
        await page.click('button[onclick*="admin"]');

        // Wait for redirect to admin dashboard
        await page.waitForURL('**/admin/admin.html');

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Wait for admin dashboard to load
        await page.waitForLoadState('networkidle');

        // Check if admin dashboard loaded
        const adminPanel = await page.locator('.sidebar').isVisible();
        expect(adminPanel).toBeTruthy();

        // Test navigation to different admin sections
        const sections = [
            { name: 'Dashboard', selector: 'a[onclick*="dashboard"]' },
            { name: 'User Management', selector: 'a[onclick*="userManagement"]' },
            { name: 'Participants', selector: 'a[onclick*="participants"]' },
            { name: 'Questions', selector: 'a[onclick*="questions"]' },
            { name: 'Categories', selector: 'a[onclick*="categories"]' },
            { name: 'Statistics', selector: 'a[onclick*="statistics"]' },
            { name: 'Leaderboard Settings', selector: 'a[onclick*="leaderboardSettings"]' },
            { name: 'Blueprint', selector: 'a[onclick*="blueprint"]' },
            { name: 'Exam Packages', selector: 'a[onclick*="examPackages"]' },
            { name: 'Exam Sessions', selector: 'a[onclick*="examSessions"]' }
        ];

        for (const section of sections) {
            console.log(`Testing ${section.name} section...`);
            const navLink = page.locator(section.selector);
            if (await navLink.isVisible()) {
                await navLink.click();
                await page.waitForTimeout(1000);
            }
        }

        // Check for console errors
        if (errors.length > 0) {
            console.log('Console errors found:', errors);
        }

        expect(errors.length).toBe(0);
    });
});
