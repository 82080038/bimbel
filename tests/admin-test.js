const puppeteer = require('puppeteer');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost/ujian/admin/admin.html';
const LOGIN_URL = 'http://localhost/ujian/login.html';
const SCREENSHOT_DIR = './test-screenshots';

// Test credentials (update these with actual admin credentials)
const TEST_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // Update with actual password
};

// Create screenshot directory if it doesn't exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results
const testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// Helper function to take screenshot
async function takeScreenshot(page, name) {
    const path = `${SCREENSHOT_DIR}/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`Screenshot saved: ${path}`);
}

// Helper function to log test result
function logTest(section, passed, error = null) {
    if (passed) {
        console.log(`✓ ${section} - PASSED`);
        testResults.passed++;
    } else {
        console.log(`✗ ${section} - FAILED: ${error}`);
        testResults.failed++;
        testResults.errors.push({ section, error });
    }
}

// Helper function to log in
async function login(page) {
    console.log('Logging in...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await takeScreenshot(page, '00-login-page');
    
    // Wait for login form
    await page.waitForSelector('input[type="text"], input[type="email"], #username', { timeout: 10000 });
    
    // Fill in credentials
    const usernameInput = await page.$('input[type="text"], input[type="email"], #username');
    const passwordInput = await page.$('input[type="password"], #password');
    
    if (usernameInput) {
        await usernameInput.type(TEST_CREDENTIALS.username);
    }
    
    if (passwordInput) {
        await passwordInput.type(TEST_CREDENTIALS.password);
    }
    
    await takeScreenshot(page, '01-login-form-filled');
    
    // Click login button
    const loginButton = await page.$('button[type="submit"], .btn-primary, #loginButton');
    if (loginButton) {
        await loginButton.click();
    } else {
        // Try pressing Enter
        await page.keyboard.press('Enter');
    }
    
    // Wait for navigation to admin panel
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await takeScreenshot(page, '02-after-login');
    
    console.log('Login successful');
}

// Main test function
async function runTests() {
    console.log('Starting Admin Panel Tests with Puppeteer...');
    
    // Launch browser
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Listen for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`Console Error: ${msg.text()}`);
        }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        console.log(`Page Error: ${error.message}`);
    });
    
    try {
        // First, log in
        await login(page);
        
        // Navigate to admin panel
        console.log('Navigating to admin panel...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await takeScreenshot(page, '03-admin-panel-after-login');
        
        // Wait for page to load
        await page.waitForTimeout(2000);
        
        // Test each section
        const sections = [
            { name: 'Dashboard', id: 'dashboardSection', onclick: "showSection('dashboard')" },
            { name: 'User Management', id: 'userManagementSection', onclick: "showSection('userManagement')" },
            { name: 'Participants', id: 'participantsSection', onclick: "showSection('participants')" },
            { name: 'Questions', id: 'questionsSection', onclick: "showSection('questions')" },
            { name: 'Categories', id: 'categoriesSection', onclick: "showSection('categories')" },
            { name: 'Statistics', id: 'statisticsSection', onclick: "showSection('statistics')" },
            { name: 'Leaderboard Settings', id: 'leaderboardSettingsSection', onclick: "showSection('leaderboardSettings')" },
            { name: 'Blueprint', id: 'blueprintSection', onclick: "showSection('blueprint')" },
            { name: 'Exam Packages', id: 'examPackagesSection', onclick: "showSection('examPackages')" },
            { name: 'Exam Sessions', id: 'examSessionsSection', onclick: "showSection('examSessions')" },
            { name: 'IRT Analysis', id: 'irtSection', onclick: "showSection('irt')" },
            { name: 'Bahan Pelajaran', id: 'bahanPelajaranSection', onclick: "showSection('bahanPelajaran')" },
            { name: 'Tips & Tricks', id: 'tipsSection', onclick: "showSection('tips')" },
            { name: 'Results', id: 'resultsSection', onclick: "showSection('results')" },
            { name: 'Content Generation', id: 'contentGenerationSection', onclick: "showSection('contentGeneration')" },
            { name: 'System Maintenance', id: 'systemMaintenanceSection', onclick: "showSection('systemMaintenance')" },
            { name: 'Course Management', id: 'courseManagementSection', onclick: "showSection('courseManagement')" },
            { name: 'Gamification Tracking', id: 'gamificationTrackingSection', onclick: "showSection('gamificationTracking')" },
            { name: 'Notifications', id: 'notificationsSection', onclick: "showSection('notifications')" }
        ];
        
        for (const section of sections) {
            try {
                console.log(`\nTesting ${section.name}...`);
                
                // Click on navigation link using onclick attribute
                const navLink = await page.$x(`//a[@onclick="${section.onclick}"]`);
                if (navLink.length === 0) {
                    logTest(section.name, false, 'Navigation link not found');
                    continue;
                }
                
                await navLink[0].click();
                
                // Wait for section to load
                await page.waitForTimeout(2000);
                
                // Check if section is visible
                const sectionElement = await page.$(`#${section.id}`);
                if (!sectionElement) {
                    logTest(section.name, false, 'Section element not found');
                    continue;
                }
                
                const isVisible = await page.evaluate(el => {
                    return el.offsetParent !== null;
                }, sectionElement);
                
                if (!isVisible) {
                    logTest(section.name, false, 'Section not visible');
                    await takeScreenshot(page, `test-${section.name}-not-visible`);
                    continue;
                }
                
                // Take screenshot
                await takeScreenshot(page, `test-${section.name}`);
                
                // Check for console errors in this section
                await page.waitForTimeout(1000);
                
                logTest(section.name, true);
                
            } catch (error) {
                logTest(section.name, false, error.message);
                await takeScreenshot(page, `test-${section.name}-error`);
            }
        }
        
        // Print summary
        console.log('\n' + '='.repeat(50));
        console.log('TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
        console.log(`Passed: ${testResults.passed}`);
        console.log(`Failed: ${testResults.failed}`);
        
        if (testResults.errors.length > 0) {
            console.log('\nFailed Tests:');
            testResults.errors.forEach(err => {
                console.log(`  - ${err.section}: ${err.error}`);
            });
        }
        
        // Save results to file
        const resultsJson = JSON.stringify(testResults, null, 2);
        fs.writeFileSync(`${SCREENSHOT_DIR}/test-results.json`, resultsJson);
        console.log(`\nTest results saved to ${SCREENSHOT_DIR}/test-results.json`);
        
    } catch (error) {
        console.error('Test execution failed:', error);
    } finally {
        await browser.close();
    }
}

// Run tests
runTests().then(() => {
    console.log('\nTests completed');
    process.exit(testResults.failed > 0 ? 1 : 0);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
