const { test, expect } = require('@playwright/test');

test.describe('Console & Network Error Detection', () => {
    const pagesToTest = [
        { name: 'Login', url: 'http://localhost/bimbel/login.html', public: true },
        { name: 'Register', url: 'http://localhost/bimbel/register.html', public: true },
        { name: 'Dashboard', url: 'http://localhost/bimbel/participant/dashboard.html', public: false },
        { name: 'Materi', url: 'http://localhost/bimbel/participant/materi.html', public: false },
        { name: 'Ujian', url: 'http://localhost/bimbel/participant/ujian.html', public: false },
        { name: 'Leaderboard', url: 'http://localhost/bimbel/participant/leaderboard.html', public: false },
        { name: 'Profile', url: 'http://localhost/bimbel/participant/profile.html', public: false },
        { name: 'Certificate', url: 'http://localhost/bimbel/participant/certificate.html', public: false },
        { name: 'Resume Ujian', url: 'http://localhost/bimbel/participant/resume-ujian.html', public: false },
    ];

    for (const pageInfo of pagesToTest) {
        test(`Detect console & network errors on ${pageInfo.name}`, async ({ page }) => {
            const consoleErrors = [];
            const consoleWarnings = [];
            const networkErrors = [];
            const network404 = [];
            const network401 = [];
            const network500 = [];

            // Listen to console messages
            page.on('console', msg => {
                const text = msg.text();
                if (msg.type() === 'error') {
                    consoleErrors.push(text);
                    console.log(`❌ CONSOLE ERROR [${pageInfo.name}]: ${text.substring(0, 200)}`);
                } else if (msg.type() === 'warning') {
                    consoleWarnings.push(text);
                    console.log(`⚠️ CONSOLE WARN [${pageInfo.name}]: ${text.substring(0, 200)}`);
                }
            });

            // Listen to page errors (JS exceptions)
            page.on('pageerror', error => {
                consoleErrors.push(error.message);
                console.log(`❌ PAGE ERROR [${pageInfo.name}]: ${error.message.substring(0, 200)}`);
            });

            // Listen to network responses
            page.on('response', response => {
                const status = response.status();
                const url = response.url();
                
                if (status >= 400) {
                    networkErrors.push({ status, url: url.substring(0, 150) });
                    
                    if (status === 404) {
                        network404.push(url.substring(0, 150));
                        console.log(`🔍 404 [${pageInfo.name}]: ${url.substring(0, 150)}`);
                    } else if (status === 401) {
                        network401.push(url.substring(0, 150));
                        console.log(`🔒 401 [${pageInfo.name}]: ${url.substring(0, 150)}`);
                    } else if (status >= 500) {
                        network500.push(url.substring(0, 150));
                        console.log(`💥 5xx [${pageInfo.name}]: ${url.substring(0, 150)}`);
                    }
                }
            });

            // Navigate to page
            if (!pageInfo.public) {
                // Login first for protected pages
                await page.goto('http://localhost/bimbel/login.html');
                await page.fill('#username', 'testuser');
                await page.fill('#password', 'test123');
                await page.click('#loginForm button[type="submit"]');
                await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
                await page.waitForTimeout(3000); // Wait for dashboard fetch to complete
            }

            // Now navigate to target page
            await page.goto(pageInfo.url);
            await page.waitForTimeout(3000); // Wait for all async operations

            // Interact with page to trigger more JS
            if (pageInfo.name === 'Materi') {
                await page.selectOption('#filterKategori', 'TWK');
                await page.waitForTimeout(2000);
            } else if (pageInfo.name === 'Ujian') {
                await page.waitForTimeout(3000); // Wait for exam types to load
            }

            // Wait a bit more for any delayed requests
            await page.waitForTimeout(2000);

            // Report findings
            console.log(`\n=== ${pageInfo.name} Summary ===`);
            console.log(`Console Errors: ${consoleErrors.length}`);
            console.log(`Console Warnings: ${consoleWarnings.length}`);
            console.log(`Network 401s: ${network401.length}`);
            console.log(`Network 404s: ${network404.length}`);
            console.log(`Network 5xx: ${network500.length}`);

            // Assertions - we want to know about issues but not fail the test for 401s on public pages
            if (consoleErrors.length > 0) {
                console.log(`\n⚠️ ${pageInfo.name}: ${consoleErrors.length} console errors detected`);
            }
            if (network500.length > 0) {
                console.log(`\n❌ ${pageInfo.name}: ${network500.length} server errors (500+)`);
            }

            // Soft assertions - report but don't fail for warnings
            expect(network500.length).toBe(0); // Server errors should never happen
            
            // Store for reporting
            test.info().annotations.push({ 
                type: 'console_errors', 
                description: `${consoleErrors.length} errors on ${pageInfo.name}` 
            });
            test.info().annotations.push({ 
                type: 'network_401', 
                description: `${network401.length} 401s on ${pageInfo.name}` 
            });
            test.info().annotations.push({ 
                type: 'network_404', 
                description: `${network404.length} 404s on ${pageInfo.name}` 
            });
        });
    }
});
