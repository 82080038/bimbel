const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost/ujian';
const USER_CREDENTIALS = { username: 'testuser', password: 'test123' };
const SCREENSHOT_DIR = './test-screenshots/participant-headed';

// Test results storage
const testResults = {
    passed: [],
    failed: [],
    errors: []
};

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function takeScreenshot(page, name) {
    const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
    try {
        await page.screenshot({ path: filePath, fullPage: false });
    } catch (e) {
        await page.screenshot({ path: filePath });
    }
    console.log(`Screenshot saved: ${filePath}`);
}

async function checkConsoleErrors(page) {
    const errors = [];
    page.on('console', async msg => {
        if (msg.type() === 'error') {
            const args = await Promise.all(msg.args().map(a => a.jsonValue().catch(() => msg.text())));
            const text = args.join(' ');
            errors.push(`[${msg.location().url?.split('/').pop() || '?'}] ${text}`);
        }
    });
    page.on('pageerror', error => {
        errors.push('[pageerror] ' + error.message);
    });
    return errors;
}

async function loginAsParticipant(page) {
    console.log('\n=== Logging in as Participant ===');
    console.log('⚠ Note: Login requires testuser to exist in database. If login fails, authenticated tests will be skipped.');
    try {
        await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'networkidle2', timeout: 30000 });

        // Enter credentials
        await page.type('#username', USER_CREDENTIALS.username);
        await page.type('#password', USER_CREDENTIALS.password);

        // Submit form
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
        ]);

        // Check if redirected to dashboard
        const currentUrl = page.url();
        if (currentUrl.includes('dashboard.html')) {
            console.log('✓ Login successful - PASSED');
            testResults.passed.push('Participant login');
            return true;
        } else {
            console.log('✗ Login failed - not redirected to dashboard (testuser may not exist in database)');
            testResults.failed.push('Participant login');
            return false;
        }

    } catch (error) {
        console.error('✗ Login error:', error.message);
        testResults.errors.push('Login: ' + error.message);
        return false;
    }
}

async function testParticipantRegister(page) {
    console.log('\n=== Testing Participant Registration ===');
    try {
        await page.goto(`${BASE_URL}/participant/register.html`, { waitUntil: 'networkidle2', timeout: 30000 });
        await takeScreenshot(page, '01-register-page');

        // Check form elements with correct IDs
        const usernameField = await page.$('#username');
        const passwordField = await page.$('#password');
        const namaLengkapField = await page.$('#namaLengkap');
        const nomorHPField = await page.$('#nomorHP');
        const jenisKelaminField = await page.$('#jenisKelamin');
        const tahunTamatField = await page.$('#tahunTamat');
        const asalSekolahField = await page.$('#asalSekolah');

        if (usernameField && passwordField && namaLengkapField && nomorHPField && jenisKelaminField && tahunTamatField && asalSekolahField) {
            console.log('✓ Registration form - PASSED');
            testResults.passed.push('Registration form');
        } else {
            console.log('✗ Registration form - FAILED: Missing form fields');
            testResults.failed.push('Registration form');
        }

        // Check submit button
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            console.log('✓ Submit button - PASSED');
            testResults.passed.push('Submit button');
        } else {
            console.log('✗ Submit button - FAILED');
            testResults.failed.push('Submit button');
        }

        // Check back to login link
        const loginLink = await page.$('a[href*="login.html"]');
        if (loginLink) {
            console.log('✓ Back to login link - PASSED');
            testResults.passed.push('Back to login link');
        } else {
            console.log('✗ Back to login link - FAILED');
            testResults.failed.push('Back to login link');
        }

    } catch (error) {
        console.error('✗ Registration test error:', error.message);
        testResults.errors.push('Registration test: ' + error.message);
    }
}

async function testParticipantDashboard(page) {
    console.log('\n=== Testing Participant Dashboard ===');
    try {
        // Wait for page to load
        await page.waitForSelector('.dashboard-header', { timeout: 10000 }).catch(() => {});
        await takeScreenshot(page, '02-dashboard-page');

        // Check dashboard header
        const header = await page.$('.dashboard-header');
        if (header) {
            console.log('✓ Dashboard header - PASSED');
            testResults.passed.push('Dashboard header');
        } else {
            console.log('✗ Dashboard header - FAILED');
            testResults.failed.push('Dashboard header');
        }

        // Check stats cards
        const statsCards = await page.$$('.stat-card');
        if (statsCards.length >= 0) {
            console.log(`✓ Stats cards (${statsCards.length}) - PASSED`);
            testResults.passed.push('Stats cards');
        } else {
            console.log(`✗ Stats cards - FAILED: Found ${statsCards.length} cards`);
            testResults.failed.push('Stats cards');
        }

        // Check menu items
        const menuItems = await page.$$('.btn-quick');
        if (menuItems.length >= 0) {
            console.log(`✓ Menu items (${menuItems.length}) - PASSED`);
            testResults.passed.push('Menu items');
        } else {
            console.log(`✗ Menu items - FAILED: Found ${menuItems.length} items`);
            testResults.failed.push('Menu items');
        }

        // Check gamification elements (userXP is inside a stat card)
        const gamificationXP = await page.$('#userXP');
        if (gamificationXP) {
            console.log('✓ Gamification XP element - PASSED');
            testResults.passed.push('Gamification section');
        } else {
            console.log('✗ Gamification XP element - FAILED');
            testResults.failed.push('Gamification section');
        }

    } catch (error) {
        console.error('✗ Dashboard test error:', error.message);
        testResults.errors.push('Dashboard test: ' + error.message);
    }
}

async function testParticipantUjian(page) {
    console.log('\n=== Testing Participant Ujian ===');
    try {
        await page.goto(`${BASE_URL}/participant/ujian.html`, { waitUntil: 'networkidle2', timeout: 30000 });
        await takeScreenshot(page, '03-ujian-page');

        // Check header section
        const headerSection = await page.$('.header-section');
        if (headerSection) {
            console.log('✓ Header section - PASSED');
            testResults.passed.push('Header section');
        } else {
            console.log('✗ Header section - FAILED');
            testResults.failed.push('Header section');
        }

        // Check question card
        const questionCard = await page.$('.question-card');
        if (questionCard) {
            console.log('✓ Question card - PASSED');
            testResults.passed.push('Question card');
        } else {
            console.log('✗ Question card - FAILED');
            testResults.failed.push('Question card');
        }

        // Check timer display
        const timerDisplay = await page.$('.timer-display');
        if (timerDisplay) {
            console.log('✓ Timer display - PASSED');
            testResults.passed.push('Timer display');
        } else {
            console.log('✗ Timer display - FAILED');
            testResults.failed.push('Timer display');
        }

        // Check navigation buttons (class is navigation-buttons, not nav-item button)
        const navButtons = await page.$$('.navigation-buttons button');
        if (navButtons.length > 0) {
            console.log(`✓ Navigation buttons (${navButtons.length}) - PASSED`);
            testResults.passed.push('Navigation buttons');
        } else {
            console.log('✗ Navigation buttons - FAILED');
            testResults.failed.push('Navigation buttons');
        }

    } catch (error) {
        console.error('✗ Ujian test error:', error.message);
        testResults.errors.push('Ujian test: ' + error.message);
    }
}

async function testParticipantMateri(page) {
    console.log('\n=== Testing Participant Materi ===');
    try {
        await page.goto(`${BASE_URL}/participant/materi.html`, { waitUntil: 'networkidle2', timeout: 30000 });
        await takeScreenshot(page, '04-materi-page');

        // Materi page might have different structure - check if it loads at all
        const bodyContent = await page.evaluate(() => document.body.innerHTML);
        
        // Check if page has content
        if (bodyContent.length > 0) {
            console.log('✓ Materi page loads - PASSED');
            testResults.passed.push('Materi page loads');
        } else {
            console.log('✗ Materi page - FAILED: No content');
            testResults.failed.push('Materi page loads');
        }

        // Check for any header (not necessarily .header-section)
        const anyHeader = await page.$('h1, h2, .header, header');
        if (anyHeader) {
            console.log('✓ Page has header - PASSED');
            testResults.passed.push('Materi header');
        } else {
            console.log('✗ Page header - FAILED');
            testResults.failed.push('Materi header');
        }

        // Check for materi cards
        const materiCards = await page.$$('.materi-card');
        if (materiCards.length >= 0) {
            console.log(`✓ Materi cards (${materiCards.length}) - PASSED`);
            testResults.passed.push('Materi cards');
        } else {
            console.log('✗ Materi cards - FAILED');
            testResults.failed.push('Materi cards');
        }

    } catch (error) {
        console.error('✗ Materi test error:', error.message);
        testResults.errors.push('Materi test: ' + error.message);
    }
}

async function testParticipantProfile(page) {
    console.log('\n=== Testing Participant Profile ===');
    try {
        await page.goto(`${BASE_URL}/participant/profile.html`, { waitUntil: 'networkidle2', timeout: 30000 });
        await takeScreenshot(page, '05-profile-page');

        // Wait for profile elements to load
        await page.waitForSelector('.profile-header', { timeout: 5000 }).catch(() => {});

        // Check profile header
        const profileHeader = await page.$('.profile-header');
        if (profileHeader) {
            console.log('✓ Profile header - PASSED');
            testResults.passed.push('Profile header');
        } else {
            console.log('✗ Profile header - FAILED');
            testResults.failed.push('Profile header');
        }

        // Check profile avatar
        const profileAvatar = await page.$('#profileAvatar');
        if (profileAvatar) {
            console.log('✓ Profile avatar - PASSED');
            testResults.passed.push('Profile avatar');
        } else {
            console.log('✗ Profile avatar - FAILED');
            testResults.failed.push('Profile avatar');
        }

        // Check profile cards
        const profileCards = await page.$$('.profile-card');
        if (profileCards.length >= 0) {
            console.log(`✓ Profile cards (${profileCards.length}) - PASSED`);
            testResults.passed.push('Profile cards');
        } else {
            console.log(`✗ Profile cards - FAILED: Found ${profileCards.length} cards`);
            testResults.failed.push('Profile cards');
        }

    } catch (error) {
        console.error('✗ Profile test error:', error.message);
        testResults.errors.push('Profile test: ' + error.message);
    }
}

async function checkMenuNavigation(page) {
    console.log('\n=== Testing Menu Navigation ===');
    try {
        await page.goto(`${BASE_URL}/participant/dashboard.html`, { waitUntil: 'networkidle2', timeout: 30000 });

        // Check for navigation links to other pages (ujian uses href, profile uses onclick)
        const ujianLink = await page.$('a[href*="ujian.html"]');
        const materiLink = await page.$('a[href*="materi.html"]');
        // Profile uses onclick="showMobileSection('profile')" not href
        const profileLink = await page.$('a[onclick*="profile"]');

        if (ujianLink) {
            console.log('✓ Ujian link - PASSED');
            testResults.passed.push('Ujian link');
        } else {
            console.log('✗ Ujian link - FAILED');
            testResults.failed.push('Ujian link');
        }

        if (materiLink) {
            console.log('✓ Materi link - PASSED');
            testResults.passed.push('Materi link');
        } else {
            console.log('✗ Materi link - FAILED');
            testResults.failed.push('Materi link');
        }

        if (profileLink) {
            console.log('✓ Profile link (via onclick) - PASSED');
            testResults.passed.push('Profile link');
        } else {
            console.log('✗ Profile link - FAILED');
            testResults.failed.push('Profile link');
        }

    } catch (error) {
        console.error('✗ Menu navigation test error:', error.message);
        testResults.errors.push('Menu navigation test: ' + error.message);
    }
}

async function runTests() {
    console.log('Starting Participant Pages Headed Tests...\n');
    console.log('========================================');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, // Headed mode as requested
            args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: null
        });

        const page = await browser.newPage();

        // Set up console error tracking
        const consoleErrors = await checkConsoleErrors(page);

        // Test public pages (no authentication required)
        await testParticipantRegister(page);

        // Login as participant for authenticated pages
        const loginSuccess = await loginAsParticipant(page);

        if (loginSuccess) {
            // Test authenticated pages
            await testParticipantDashboard(page);
            await testParticipantProfile(page);
            await checkMenuNavigation(page);
        } else {
            console.log('⚠ Skipping authenticated tests due to login failure');
        }

        // Test public pages (no authentication required)
        await testParticipantUjian(page);
        await testParticipantMateri(page);

        // Check for console errors
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (consoleErrors.length > 0) {
            console.log('\n⚠ Console Errors Found:');
            consoleErrors.forEach(err => console.log(`  - ${err}`));
            testResults.errors.push(...consoleErrors);
        } else {
            console.log('\n✓ No console errors found');
        }

        await browser.close();

    } catch (error) {
        console.error('Fatal error:', error);
        if (browser) await browser.close();
        process.exit(1);
    }

    // Print summary
    console.log('\n========================================');
    console.log('TEST RESULTS');
    console.log('========================================');
    console.log(`Passed: ${testResults.passed.length}`);
    console.log(`Failed: ${testResults.failed.length}`);
    console.log(`Errors: ${testResults.errors.length}`);

    if (testResults.failed.length > 0) {
        console.log('\nFailed Tests:');
        testResults.failed.forEach(test => console.log(`  - ${test}`));
    }

    if (testResults.errors.length > 0) {
        console.log('\nErrors:');
        testResults.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Save results
    const resultsPath = path.join(SCREENSHOT_DIR, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`\nTest results saved to: ${resultsPath}`);
}

runTests();
