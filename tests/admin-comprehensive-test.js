/**
 * Comprehensive Admin Test
 * Tests admin login, page access, console errors, alerts, and infinite loops
 */

const puppeteer = require('puppeteer');

async function testAdminComprehensive() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         COMPREHENSIVE ADMIN ROLE TEST                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // Track console messages and errors
        const consoleMessages = [];
        const pageErrors = [];
        const alerts = [];

        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push({ type: msg.type(), text: text });
            if (msg.type() === 'error') {
                console.error(`   ❌ Console Error: ${text}`);
            } else if (msg.type() === 'warning') {
                console.warn(`   ⚠️  Console Warning: ${text}`);
            }
        });

        page.on('pageerror', err => {
            pageErrors.push(err.message);
            console.error(`   ❌ Page Error: ${err.message}`);
        });

        // Handle alerts
        page.on('dialog', async dialog => {
            const message = dialog.message();
            alerts.push(message);
            console.log(`   🔔 Alert: ${message}`);
            await dialog.accept();
        });

        // 1. Load login page
        console.log('1. Loading login page...');
        await page.goto('http://localhost/bimbel/login.html', {
            waitUntil: 'networkidle2'
        });
        console.log('   ✅ Login page loaded\n');

        // 2. Login as admin
        console.log('2. Logging in as admin...');
        const username = 'admin';
        const password = 'admin123';
        
        await page.type('#username', username);
        await page.type('#password', password);
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        
        let loginResponse = null;
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('auth.php') && url.includes('login')) {
                try {
                    loginResponse = await response.json();
                } catch (e) {}
            }
        });

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        
        if (loginResponse && loginResponse.success) {
            console.log('   ✅ Login SUCCESS');
            console.log(`   Role: ${loginResponse.user.role}`);
        } else {
            console.log('   ❌ Login FAILED');
            await browser.close();
            return;
        }
        console.log('');

        // 3. Navigate to admin page
        console.log('3. Navigating to admin page...');
        await page.goto('http://localhost/bimbel/admin/index.html', {
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(2000);
        
        const adminUrl = page.url();
        console.log(`   Current URL: ${adminUrl}`);
        
        if (adminUrl.includes('admin/index.html') || adminUrl.includes('admin.html')) {
            console.log('   ✅ Admin page loaded');
        } else if (adminUrl.includes('login.html')) {
            console.log('   ❌ Redirected to login (RBAC failed)');
            await browser.close();
            return;
        } else {
            console.log(`   ⚠️  Unexpected URL: ${adminUrl}`);
        }
        console.log('');

        // 4. Monitor for infinite loop (wait 5 seconds and check for repeated logs)
        console.log('4. Monitoring for infinite loop (5 seconds)...');
        const initialConsoleCount = consoleMessages.length;
        await page.waitForTimeout(5000);
        const finalConsoleCount = consoleMessages.length;
        const newMessages = consoleMessages.slice(initialConsoleCount);
        
        console.log(`   Console messages in 5s: ${finalConsoleCount - initialConsoleCount}`);
        
        // Check for repeated messages (sign of loop)
        const messageCounts = {};
        newMessages.forEach(msg => {
            messageCounts[msg.text] = (messageCounts[msg.text] || 0) + 1;
        });
        
        let hasLoop = false;
        for (const [msg, count] of Object.entries(messageCounts)) {
            if (count > 5) {
                console.log(`   ⚠️  Possible loop detected: "${msg}" appeared ${count} times`);
                hasLoop = true;
            }
        }
        
        if (!hasLoop) {
            console.log('   ✅ No infinite loop detected');
        }
        console.log('');

        // 5. Check page elements
        console.log('5. Checking admin page elements...');
        const pageElements = await page.evaluate(() => {
            return {
                sidebar: !!document.querySelector('.sidebar'),
                adminPanel: !!document.querySelector('.admin-container'),
                dashboardSection: !!document.getElementById('dashboardSection'),
                navLinks: document.querySelectorAll('.nav-link').length,
                userRoleDisplay: !!document.getElementById('userRoleDisplay')
            };
        });
        
        console.log('   Page elements:', JSON.stringify(pageElements, null, 2));
        
        if (pageElements.sidebar && pageElements.navLinks > 0) {
            console.log('   ✅ Admin sidebar loaded');
        }
        
        if (pageElements.userRoleDisplay) {
            const roleText = await page.evaluate(() => {
                return document.getElementById('userRoleDisplay').textContent;
            });
            console.log(`   User Role Display: ${roleText}`);
        }
        console.log('');

        // 6. Test navigation between sections
        console.log('6. Testing navigation between sections...');
        
        // Wait for showSection to be available
        await page.waitForFunction(() => typeof showSection !== 'undefined', { timeout: 5000 });
        
        const sections = ['dashboard', 'questions', 'categories', 'statistics'];
        
        for (const section of sections) {
            try {
                await page.evaluate((sec) => {
                    showSection(sec);
                }, section);
                await page.waitForTimeout(1000);
                
                const sectionVisible = await page.evaluate((sec) => {
                    const el = document.getElementById(sec + 'Section');
                    return el && !el.classList.contains('hidden');
                }, section);
                
                if (sectionVisible) {
                    console.log(`   ✅ Section '${section}' visible`);
                } else {
                    console.log(`   ⚠️  Section '${section}' not visible`);
                }
            } catch (error) {
                console.log(`   ❌ Error navigating to '${section}': ${error.message}`);
            }
        }
        console.log('');

        // 7. Summary
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║                    TEST SUMMARY                              ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║ Login Success:       ${loginResponse?.success ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ Admin Access:        ${adminUrl.includes('admin.html') ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ Infinite Loop:       ${hasLoop ? '❌ FAIL' : '✅ PASS'}                        ║`);
        console.log(`║ Console Errors:      ${pageErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ Page Elements:       ${pageElements.sidebar ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ Alerts:              ${alerts.length} captured                          ║`);
        console.log('╚════════════════════════════════════════════════════════════╝');

        // 8. Detailed logs
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                    DETAILED LOGS                             ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        
        console.log(`\n📊 Console Messages: ${consoleMessages.length}`);
        consoleMessages.slice(-10).forEach(msg => {
            console.log(`   [${msg.type}] ${msg.text.substring(0, 100)}`);
        });
        
        if (pageErrors.length > 0) {
            console.log(`\n❌ Page Errors (${pageErrors.length}):`);
            pageErrors.forEach(err => console.log(`   - ${err}`));
        }
        
        if (alerts.length > 0) {
            console.log(`\n🔔 Alerts (${alerts.length}):`);
            alerts.forEach(alert => console.log(`   - ${alert}`));
        }

        // 9. Take screenshot
        await page.screenshot({ path: 'admin-comprehensive-test-result.png' });
        console.log('\n   📸 Screenshot saved: admin-comprehensive-test-result.png');

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }

    console.log('\n✨ Test completed!');
}

testAdminComprehensive().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
