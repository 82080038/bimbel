/**
 * Comprehensive RBAC Test
 * Tests: Register Participant, Login Participant, Login Admin, Dashboard Participant, Dashboard Admin
 */

const puppeteer = require('puppeteer');

async function runComprehensiveTest() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         COMPREHENSIVE RBAC TEST (NEW STRUCTURE)           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = {
        registerParticipant: false,
        loginParticipant: false,
        loginAdmin: false,
        dashboardParticipant: false,
        dashboardAdmin: false,
        rbacRedirects: false
    };

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // Track console messages
        const consoleMessages = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push({ type: msg.type(), text: text });
            if (msg.type() === 'error') {
                console.error(`   ❌ Console Error: ${text}`);
            }
        });

        page.on('dialog', async dialog => {
            console.log(`   🔔 Alert: ${dialog.message()}`);
            await dialog.accept();
        });

        // ========================================================================
        // TEST 1: Register Participant
        // ========================================================================
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  TEST 1: REGISTER PARTICIPANT                                ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('1. Loading registration page...');
        await page.goto('http://localhost/bimbel/participant/register.html', {
            waitUntil: 'networkidle2'
        });
        console.log('   ✅ Registration page loaded\n');

        console.log('2. Filling registration form...');
        const testUser = {
            username: 'user_' + Date.now(),
            password: 'TestPass123',
            nama_lengkap: 'Test User ' + Date.now(),
            nomor_hp: '08' + Math.floor(Math.random() * 9000000000 + 1000000000),
            jenis_kelamin: 'L',
            tahun_tamat: '2024',
            asal_sekolah: 'SMA Test'
        };

        await page.type('#username', testUser.username);
        await page.type('#password', testUser.password);
        await page.type('#confirmPassword', testUser.password);
        await page.type('#namaLengkap', testUser.nama_lengkap);
        await page.type('#nomorHP', testUser.nomor_hp);
        await page.select('#jenisKelamin', testUser.jenis_kelamin);
        await page.type('#tahunTamat', testUser.tahun_tamat);
        await page.type('#asalSekolah', testUser.asal_sekolah);
        await page.click('#termsCheck');
        console.log('   ✅ Form filled\n');

        console.log('3. Submitting registration...');
        let regResponse = null;
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('auth.php') && url.includes('register')) {
                try {
                    regResponse = await response.json();
                } catch (e) {}
            }
        });

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        if (regResponse && regResponse.success) {
            console.log('   ✅ REGISTRATION SUCCESS');
            console.log(`   User ID: ${regResponse.user.id}`);
            console.log(`   Username: ${regResponse.user.username}`);
            results.registerParticipant = true;
        } else {
            console.log('   ❌ REGISTRATION FAILED');
            console.log(`   Error: ${regResponse?.error || 'Unknown error'}`);
        }
        console.log('');

        // ========================================================================
        // TEST 2: Login Participant
        // ========================================================================
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  TEST 2: LOGIN PARTICIPANT                                    ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('1. Loading login page...');
        await page.goto('http://localhost/bimbel/login.html', {
            waitUntil: 'networkidle2'
        });
        console.log('   ✅ Login page loaded\n');

        console.log('2. Logging in as participant...');
        await page.type('#username', testUser.username);
        await page.type('#password', testUser.password);

        let loginResponse = null;
        page.removeAllListeners('response');
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
            console.log('   ✅ LOGIN SUCCESS');
            console.log(`   Role: ${loginResponse.user.role}`);
            results.loginParticipant = true;
        } else {
            console.log('   ❌ LOGIN FAILED');
            console.log(`   Error: ${loginResponse?.error || 'Unknown error'}`);
        }
        console.log('');

        console.log('3. Checking RBAC redirect...');
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);

        if (currentUrl.includes('participant/dashboard.html')) {
            console.log('   ✅ RBAC REDIRECT CORRECT: Participant → Dashboard');
            results.rbacRedirects = true;
        } else if (currentUrl.includes('admin/admin.html')) {
            console.log('   ❌ RBAC REDIRECT WRONG: Participant → Admin Panel');
        } else {
            console.log(`   ⚠️  RBAC REDIRECT UNEXPECTED: ${currentUrl}`);
        }
        console.log('');

        // ========================================================================
        // TEST 3: Dashboard Participant
        // ========================================================================
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  TEST 3: DASHBOARD PARTICIPANT                                ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('1. Checking dashboard elements...');
        const dashboardElements = await page.evaluate(() => {
            return {
                dashboardContainer: !!document.querySelector('.dashboard-container'),
                statCards: document.querySelectorAll('.stat-card').length,
                welcomeMessage: !!document.querySelector('h1') ? document.querySelector('h1').textContent : null
            };
        });

        console.log('   Dashboard elements:', JSON.stringify(dashboardElements, null, 2));

        if (dashboardElements.dashboardContainer) {
            console.log('   ✅ Dashboard container loaded');
            results.dashboardParticipant = true;
        } else {
            console.log('   ❌ Dashboard container not found');
        }
        console.log('');

        // ========================================================================
        // TEST 4: Login Admin
        // ========================================================================
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  TEST 4: LOGIN ADMIN                                          ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('1. Logging out from participant session...');
        await page.evaluate(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
        });
        await page.waitForTimeout(500);
        console.log('   ✅ Logged out\n');

        console.log('2. Loading login page...');
        await page.goto('http://localhost/bimbel/login.html', {
            waitUntil: 'networkidle2',
            timeout: 10000
        });
        await page.waitForTimeout(1000);
        console.log('   ✅ Login page loaded\n');

        console.log('3. Logging in as admin...');
        await page.waitForSelector('#username', { timeout: 5000 });
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');

        let adminLoginResponse = null;
        page.removeAllListeners('response');
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('auth.php') && url.includes('login')) {
                try {
                    adminLoginResponse = await response.json();
                } catch (e) {}
            }
        });

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        if (adminLoginResponse && adminLoginResponse.success) {
            console.log('   ✅ LOGIN SUCCESS');
            console.log(`   Role: ${adminLoginResponse.user.role}`);
            results.loginAdmin = true;
        } else {
            console.log('   ❌ LOGIN FAILED');
            console.log(`   Error: ${adminLoginResponse?.error || 'Unknown error'}`);
        }
        console.log('');

        console.log('3. Checking RBAC redirect...');
        await page.waitForTimeout(2000);
        const adminUrl = page.url();
        console.log(`   Current URL: ${adminUrl}`);

        if (adminUrl.includes('admin/admin.html')) {
            console.log('   ✅ RBAC REDIRECT CORRECT: Admin → Admin Panel');
            results.rbacRedirects = true;
        } else if (adminUrl.includes('participant/dashboard.html')) {
            console.log('   ❌ RBAC REDIRECT WRONG: Admin → Participant Dashboard');
        } else {
            console.log(`   ⚠️  RBAC REDIRECT UNEXPECTED: ${adminUrl}`);
        }
        console.log('');

        // ========================================================================
        // TEST 5: Dashboard Admin
        // ========================================================================
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  TEST 5: DASHBOARD ADMIN                                      ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('1. Checking admin dashboard elements...');
        const adminElements = await page.evaluate(() => {
            return {
                sidebar: !!document.querySelector('.sidebar'),
                navLinks: document.querySelectorAll('.nav-link').length,
                userRoleDisplay: !!document.getElementById('userRoleDisplay')
            };
        });

        console.log('   Admin elements:', JSON.stringify(adminElements, null, 2));

        if (adminElements.sidebar && adminElements.navLinks > 0) {
            console.log('   ✅ Admin sidebar loaded');
            results.dashboardAdmin = true;
        } else {
            console.log('   ❌ Admin sidebar not found');
        }

        if (adminElements.userRoleDisplay) {
            const roleText = await page.evaluate(() => {
                return document.getElementById('userRoleDisplay').textContent;
            });
            console.log(`   User Role Display: ${roleText}`);
        }
        console.log('');

        // ========================================================================
        // SUMMARY
        // ========================================================================
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║                    TEST SUMMARY                              ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║ Register Participant:  ${results.registerParticipant ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ Login Participant:     ${results.loginParticipant ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ Login Admin:           ${results.loginAdmin ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ Dashboard Participant: ${results.dashboardParticipant ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ Dashboard Admin:       ${results.dashboardAdmin ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log(`║ RBAC Redirects:        ${results.rbacRedirects ? '✅ PASS' : '❌ FAIL'}                        ║`);
        console.log('╚════════════════════════════════════════════════════════════╝');

        console.log(`\n📊 Console Messages: ${consoleMessages.length}`);
        consoleMessages.slice(-5).forEach(msg => {
            console.log(`   [${msg.type}] ${msg.text.substring(0, 100)}`);
        });

        // Screenshot
        await page.screenshot({ path: 'comprehensive-rbac-test-result.png' });
        console.log('\n   📸 Screenshot saved: comprehensive-rbac-test-result.png');

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }

    console.log('\n✨ Test completed!');
}

runComprehensiveTest().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
