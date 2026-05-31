const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

async function login(page) {
    await page.goto('http://localhost/bimbel/login.html');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'test123');
    await page.click('#loginForm button[type="submit"]');
    await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
}

const pagesToCheck = [
    { name: 'Dashboard', url: 'http://localhost/bimbel/participant/dashboard.html' },
    { name: 'Materi', url: 'http://localhost/bimbel/participant/materi.html' },
    { name: 'Leaderboard', url: 'http://localhost/bimbel/participant/leaderboard.html' },
    { name: 'Achievements', url: 'http://localhost/bimbel/participant/achievements.html' },
    { name: 'Profile', url: 'http://localhost/bimbel/participant/profile.html' },
    { name: 'Ujian', url: 'http://localhost/bimbel/participant/ujian.html' },
    { name: 'Certificate', url: 'http://localhost/bimbel/participant/certificate.html' },
    { name: 'Resume Ujian', url: 'http://localhost/bimbel/participant/resume-ujian.html' },
];

test.describe('Console Error Check', () => {
    for (const pageInfo of pagesToCheck) {
        test(`${pageInfo.name} - check console errors`, async ({ page }) => {
            const consoleErrors = [];
            
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            page.on('pageerror', error => {
                consoleErrors.push(error.message);
            });
            
            await login(page);
            await page.goto(pageInfo.url);
            await page.waitForTimeout(3000);
            
            console.log(`Console errors for ${pageInfo.name}:`, consoleErrors);
            
            // Filter out known non-critical errors
            const criticalErrors = consoleErrors.filter(err => 
                !err.includes('Permissions check failed') &&
                !err.includes('Manifest fetch') &&
                !err.includes('manifest.json') &&
                !err.includes('service worker')
            );
            
            if (criticalErrors.length > 0) {
                console.log(`CRITICAL errors for ${pageInfo.name}:`, criticalErrors);
            }
            
            await page.screenshot({ path: `playwright-screenshots/console-${pageInfo.name.toLowerCase().replace(/\s/g, '-')}.png` });
        });
    }
});
