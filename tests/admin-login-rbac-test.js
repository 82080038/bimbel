/**
 * Admin Login & RBAC Test
 * Tests admin login and verifies RBAC redirect to admin panel
 */

const puppeteer = require('puppeteer');

async function testAdminLoginRBAC() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║            ADMIN LOGIN & RBAC TEST                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // 1. Load login page
        console.log('1. Loading login page...');
        await page.goto('http://localhost/bimbel/login.html', {
            waitUntil: 'networkidle2'
        });
        console.log('   ✅ Login page loaded\n');

        // 2. Fill login form with admin credentials
        console.log('2. Filling admin credentials...');
        const username = 'admin';
        const password = 'admin123';
        
        await page.type('#username', username);
        await page.type('#password', password);
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        console.log('   ✅ Credentials filled\n');

        // 3. Submit login
        console.log('3. Submitting login...');
        
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
        await page.waitForTimeout(2000);
        
        // 4. Check API response
        console.log('4. Checking API response...');
        if (loginResponse) {
            console.log('   API Response:', JSON.stringify(loginResponse, null, 2));
            
            if (loginResponse.success) {
                console.log('   ✅ Login SUCCESS!');
                if (loginResponse.token) {
                    console.log(`   Token: ${loginResponse.token.substring(0, 20)}...`);
                }
                console.log(`   Role: ${loginResponse.user.role}`);
                console.log(`   Username: ${loginResponse.user.username}`);
            } else {
                console.log('   ❌ Login FAILED:', loginResponse.error);
                await browser.close();
                return;
            }
        } else {
            console.log('   ⚠️ No API response captured');
        }
        console.log('');

        // 5. Check RBAC redirect
        console.log('5. Checking RBAC redirect...');
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
        await page.waitForTimeout(2000);
        
        // Re-navigate to ensure context is fresh
        await page.goto(page.url(), { waitUntil: 'networkidle2' });
        await page.waitForTimeout(1000);
        
        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('admin.html')) {
            console.log('   ✅ RBAC WORKS: Admin redirected to admin.html');
        } else if (currentUrl.includes('dashboard.html')) {
            console.log('   ❌ RBAC FAILED: Admin redirected to dashboard (should be admin panel)');
        } else if (currentUrl.includes('login.html')) {
            console.log('   ❌ RBAC FAILED: Still on login page');
        } else {
            console.log(`   ⚠️ Unexpected redirect to: ${currentUrl}`);
        }
        console.log('');

        // 6. Verify admin panel loaded
        console.log('6. Verifying admin panel content...');
        
        const adminElements = await page.evaluate(() => {
            return {
                adminContainer: !!document.querySelector('.admin-container'),
                adminPanel: !!document.querySelector('.admin-panel'),
                menuItems: document.querySelectorAll('.nav-item').length,
                title: !!document.querySelector('h1') ? document.querySelector('h1').textContent : null
            };
        });
        
        console.log('   Admin panel elements:', JSON.stringify(adminElements, null, 2));
        
        if (adminElements.adminContainer || adminElements.adminPanel) {
            console.log('   ✅ Admin panel container loaded');
        }
        
        if (adminElements.title) {
            console.log(`   Page title: ${adminElements.title}`);
        }
        console.log('');

        // 7. Check localStorage for auth data
        console.log('7. Checking localStorage auth data...');
        const authData = await page.evaluate(() => {
            return {
                authToken: localStorage.getItem('authToken'),
                userRole: localStorage.getItem('userRole'),
                apiKey: localStorage.getItem('apiKey'),
                username: localStorage.getItem('username')
            };
        });
        
        console.log('   Auth data:', JSON.stringify(authData, null, 2));
        
        if (authData.authToken && authData.userRole === 'admin') {
            console.log('   ✅ Auth data stored correctly');
            console.log('   ✅ Role: admin (correct for RBAC)');
        } else {
            console.log('   ⚠️ Auth data incomplete or incorrect');
        }
        console.log('');

        // 8. Take screenshot
        await page.screenshot({ path: 'admin-login-rbac-test-result.png' });
        console.log('   📸 Screenshot saved: admin-login-rbac-test-result.png\n');

        // 9. Summary
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║                    TEST SUMMARY                              ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║ Login Success:    ${loginResponse?.success ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log(`║ RBAC Redirect:    ${currentUrl.includes('admin.html') ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log(`║ Admin Panel Load: ${adminElements.adminContainer || adminElements.adminPanel ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log(`║ Auth Storage:     ${authData.authToken ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log(`║ Role Correct:     ${authData.userRole === 'admin' ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log('╚════════════════════════════════════════════════════════════╝');

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }

    console.log('\n✨ Test completed!');
}

testAdminLoginRBAC().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
