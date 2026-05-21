const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost/ujian';
const SCREENSHOT_DIR = path.join(__dirname, 'playwright-screenshots');
const REPORT_FILE = path.join(__dirname, 'playwright-test-results.md');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results
const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0
    }
};

// Helper function to take screenshot
async function takeScreenshot(page, name) {
    const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
}

// Helper function to log test result
function logTest(testName, passed, details = '', screenshot = '') {
    const result = {
        name: testName,
        passed,
        details,
        screenshot,
        timestamp: new Date().toISOString()
    };
    testResults.tests.push(result);
    testResults.summary.total++;
    if (passed) {
        testResults.summary.passed++;
        console.log(`  ✅ PASS: ${testName}`);
    } else {
        testResults.summary.failed++;
        console.log(`  ❌ FAIL: ${testName} - ${details}`);
    }
}

// Main test function
async function runTests() {
    console.log('=== PLAYWRIGHT HEADED TEST ===\n');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Screenshot Directory: ${SCREENSHOT_DIR}\n`);

    const browser = await chromium.launch({
        headless: false, // Headed mode
        slowMo: 1000 // Slow down actions for visibility
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    try {
        // Test 1: Load index.php
        console.log('Test 1: Load index.php');
        try {
            await page.goto(`${BASE_URL}/index.php`, { waitUntil: 'networkidle' });
            const url = page.url();
            if (url.includes('login.html')) {
                await takeScreenshot(page, '1-index-redirect-to-login');
                logTest('index.php redirects to login.html for unauthenticated user', true);
            } else {
                logTest('index.php redirects to login.html', false, `URL: ${url}`);
            }
        } catch (error) {
            logTest('index.php loads', false, error.message);
        }

        // Test 2: Load login page
        console.log('\nTest 2: Load login page');
        try {
            await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'networkidle' });
            const title = await page.title();
            await takeScreenshot(page, '2-login-page');
            logTest('login.html loads correctly', true, `Title: ${title}`);
        } catch (error) {
            logTest('login.html loads', false, error.message);
        }

        // Test 3: Quick login as admin
        console.log('\nTest 3: Quick login as admin');
        try {
            await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'networkidle' });
            
            // Click quick login admin button
            await page.click('button[onclick*="admin"]');
            await page.waitForTimeout(2000);
            
            const url = page.url();
            if (url.includes('admin.html')) {
                await takeScreenshot(page, '3-admin-login-success');
                logTest('Admin login via quick login button', true);
            } else {
                logTest('Admin login via quick login button', false, `URL: ${url}`);
            }
        } catch (error) {
            logTest('Admin login via quick login button', false, error.message);
        }

        // Test 4: Load admin panel
        console.log('\nTest 4: Load admin panel');
        try {
            await page.goto(`${BASE_URL}/admin/admin.html`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            const title = await page.title();
            await takeScreenshot(page, '4-admin-panel');
            logTest('admin/admin.html loads correctly', true, `Title: ${title}`);
        } catch (error) {
            logTest('admin/admin.html loads', false, error.message);
        }

        // Test 5: Check admin dashboard section
        console.log('\nTest 5: Check admin dashboard section');
        try {
            await page.goto(`${BASE_URL}/admin/admin.html`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // Try to click dashboard menu
            const dashboardLink = await page.$('a[href="#dashboard"]');
            if (dashboardLink) {
                await dashboardLink.click();
                await page.waitForTimeout(1000);
            }
            
            const dashboardSection = await page.$('#dashboardSection');
            if (dashboardSection) {
                await takeScreenshot(page, '5-admin-dashboard-section');
                logTest('Admin dashboard section loads', true);
            } else {
                logTest('Admin dashboard section loads', false, 'Dashboard section not found');
            }
        } catch (error) {
            logTest('Admin dashboard section loads', false, error.message);
        }

        // Test 6: Logout
        console.log('\nTest 6: Logout from admin');
        try {
            await page.goto(`${BASE_URL}/admin/admin.html`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // Try to find and click logout button
            const logoutButton = await page.$('button[onclick*="logout"], a[onclick*="logout"]');
            if (logoutButton) {
                await logoutButton.click();
                await page.waitForTimeout(2000);
                
                const url = page.url();
                if (url.includes('login.html')) {
                    await takeScreenshot(page, '6-logout-success');
                    logTest('Logout from admin', true);
                } else {
                    logTest('Logout from admin', false, `URL: ${url}`);
                }
            } else {
                logTest('Logout from admin', false, 'Logout button not found');
            }
        } catch (error) {
            logTest('Logout from admin', false, error.message);
        }

        // Test 7: Login as user
        console.log('\nTest 7: Login as regular user');
        try {
            await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'networkidle' });
            
            // Click quick login user button (User 1)
            await page.click('button[onclick*="fresh_user_11778919457"]');
            await page.waitForTimeout(2000);
            
            const url = page.url();
            if (url.includes('dashboard.html')) {
                await takeScreenshot(page, '7-user-login-success');
                logTest('User login via quick login button', true);
            } else {
                logTest('User login via quick login button', false, `URL: ${url}`);
            }
        } catch (error) {
            logTest('User login via quick login button', false, error.message);
        }

        // Test 8: Load participant dashboard
        console.log('\nTest 8: Load participant dashboard');
        try {
            await page.goto(`${BASE_URL}/participant/dashboard.html`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000); // Wait for dynamic content to load
            const title = await page.title();
            await takeScreenshot(page, '8-participant-dashboard');
            logTest('participant/dashboard.html loads correctly', true, `Title: ${title}`);
        } catch (error) {
            logTest('participant/dashboard.html loads', false, error.message);
        }

        // Test 9: Load exam page
        console.log('\nTest 9: Load exam page');
        try {
            await page.goto(`${BASE_URL}/participant/ujian.html`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000); // Wait for dynamic content to load
            const title = await page.title();
            await takeScreenshot(page, '9-exam-page');
            logTest('participant/ujian.html loads correctly', true, `Title: ${title}`);
        } catch (error) {
            logTest('participant/ujian.html loads', false, error.message);
        }

        // Test 10: Check for JavaScript errors
        console.log('\nTest 10: Check for JavaScript errors');
        let jsErrors = [];
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });
        
        await page.goto(`${BASE_URL}/participant/dashboard.html`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        if (jsErrors.length === 0) {
            logTest('No JavaScript errors on dashboard', true);
        } else {
            logTest('No JavaScript errors on dashboard', false, `Errors: ${jsErrors.join(', ')}`);
        }

    } catch (error) {
        console.error('Fatal error during tests:', error);
    } finally {
        await browser.close();
    }

    // Generate report
    console.log('\n=== TEST RESULTS ===');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Pass Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);

    // Write markdown report
    const reportContent = `# Playwright Headed Test Results
Generated: ${testResults.timestamp}

## Summary
- **Total Tests:** ${testResults.summary.total}
- **Passed:** ${testResults.summary.passed}
- **Failed:** ${testResults.summary.failed}
- **Pass Rate:** ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%

## Test Details

${testResults.tests.map(test => `
### ${test.name}
- **Status:** ${test.passed ? '✅ PASS' : '❌ FAIL'}
- **Details:** ${test.details}
- **Timestamp:** ${test.timestamp}
${test.screenshot ? `- **Screenshot:** ${test.screenshot}` : ''}
`).join('\n')}

## Screenshots
All screenshots saved to: ${SCREENSHOT_DIR}
`;

    fs.writeFileSync(REPORT_FILE, reportContent);
    console.log(`\nReport saved to: ${REPORT_FILE}`);
}

// Run tests
runTests().catch(console.error);
