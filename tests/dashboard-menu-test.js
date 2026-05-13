/**
 * Dashboard Menu Functionality Test
 * Tests all menu items for admin and participant dashboards
 */

const puppeteer = require('puppeteer');

async function testDashboardMenus() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         DASHBOARD MENU FUNCTIONALITY TEST                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = {
        admin: {},
        participant: {}
    };

    try {
        // ========================================================================
        // ADMIN DASHBOARD MENUS
        // ========================================================================
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  PART 1: ADMIN DASHBOARD MENUS                               ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // Login as admin
        console.log('1. Logging in as admin...');
        await page.goto('http://localhost/bimbel/login.html', {
            waitUntil: 'networkidle2'
        });
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        console.log('   ✅ Logged in as admin\n');

        // Test each admin menu
        const adminMenus = [
            { name: 'Dashboard', selector: 'a[onclick*="dashboard"]', section: 'dashboardSection' },
            { name: 'Soal', selector: 'a[onclick*="questions"]', section: 'questionsSection' },
            { name: 'Kategori', selector: 'a[onclick*="categories"]', section: 'categoriesSection' },
            { name: 'Statistik Soal', selector: 'a[onclick*="statistics"]', section: 'statisticsSection' },
            { name: 'Pengaturan Leaderboard', selector: 'a[onclick*="leaderboardSettings"]', section: 'leaderboardSettingsSection' },
            { name: 'Paket Blueprint', selector: 'a[onclick*="blueprint"]', section: 'blueprintSection' },
            { name: 'IRT Analysis', selector: 'a[onclick*="irt"]', section: 'irtSection' },
            { name: 'Bahan Pelajaran', selector: 'a[onclick*="bahanPelajaran"]', section: 'bahanPelajaranSection' },
            { name: 'Tips & Triks', selector: 'a[onclick*="tips"]', section: 'tipsSection' },
            { name: 'Hasil Ujian', selector: 'a[onclick*="results"]', section: 'resultsSection' }
        ];

        for (const menu of adminMenus) {
            console.log(`\n2. Testing menu: ${menu.name}`);
            try {
                // Click menu
                await page.click(menu.selector);
                await page.waitForTimeout(1000);

                // Check if section is visible
                const isVisible = await page.evaluate((sectionId) => {
                    const el = document.getElementById(sectionId);
                    return el && !el.classList.contains('hidden');
                }, menu.section);

                if (isVisible) {
                    console.log(`   ✅ ${menu.name} section loaded`);
                    results.admin[menu.name] = true;

                    // Get section content info
                    const contentInfo = await page.evaluate((sectionId) => {
                        const el = document.getElementById(sectionId);
                        if (!el) return null;
                        
                        const tables = el.querySelectorAll('table').length;
                        const buttons = el.querySelectorAll('button').length;
                        const inputs = el.querySelectorAll('input').length;
                        const headings = el.querySelectorAll('h2, h3, h4').length;
                        
                        return { tables, buttons, inputs, headings };
                    }, menu.section);

                    console.log(`      - Tables: ${contentInfo.tables}, Buttons: ${contentInfo.buttons}, Inputs: ${contentInfo.inputs}, Headings: ${contentInfo.headings}`);
                } else {
                    console.log(`   ❌ ${menu.name} section not visible`);
                    results.admin[menu.name] = false;
                }
            } catch (error) {
                console.log(`   ❌ Error testing ${menu.name}: ${error.message}`);
                results.admin[menu.name] = false;
            }
        }

        await page.screenshot({ path: 'admin-dashboard-menus-test.png' });
        console.log('\n   📸 Screenshot saved: admin-dashboard-menus-test.png');

        // ========================================================================
        // PARTICIPANT DASHBOARD MENUS
        // ========================================================================
        console.log('\n\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  PART 2: PARTICIPANT DASHBOARD MENUS                          ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Logout from admin
        console.log('3. Logging out from admin...');
        await page.evaluate(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
        });
        await page.goto('http://localhost/bimbel/login.html', {
            waitUntil: 'networkidle2'
        });
        console.log('   ✅ Logged out\n');

        // Login as participant
        console.log('4. Logging in as participant...');
        await page.type('#username', 'user_1778688916164'); // Use the user from previous test
        await page.type('#password', 'TestPass123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        console.log('   ✅ Logged in as participant\n');

        // Test participant dashboard
        console.log('5. Testing participant dashboard...');
        const participantDashboardInfo = await page.evaluate(() => {
            const dashboardContainer = !!document.querySelector('.dashboard-container');
            const statCards = document.querySelectorAll('.stat-card').length;
            const welcomeText = document.querySelector('h1')?.textContent || null;
            const buttons = document.querySelectorAll('button').length;
            
            return { dashboardContainer, statCards, welcomeText, buttons };
        });

        console.log('   Participant dashboard info:', JSON.stringify(participantDashboardInfo, null, 2));

        if (participantDashboardInfo.dashboardContainer) {
            console.log('   ✅ Participant dashboard loaded');
            results.participant.dashboard = true;
        } else {
            console.log('   ❌ Participant dashboard not loaded');
            results.participant.dashboard = false;
        }

        // Test start exam button
        console.log('\n6. Testing start exam button...');
        try {
            const startExamBtn = await page.$('button[onclick*="startNewExam"]');
            if (startExamBtn) {
                await startExamBtn.click();
                await page.waitForTimeout(2000);
                
                const currentUrl = page.url();
                if (currentUrl.includes('ujian.html')) {
                    console.log('   ✅ Start exam button redirects to ujian.html');
                    results.participant.startExam = true;
                } else {
                    console.log(`   ⚠️  Start exam button redirects to: ${currentUrl}`);
                    results.participant.startExam = false;
                }
            } else {
                console.log('   ❌ Start exam button not found');
                results.participant.startExam = false;
            }
        } catch (error) {
            console.log(`   ❌ Error testing start exam: ${error.message}`);
            results.participant.startExam = false;
        }

        await page.screenshot({ path: 'participant-dashboard-test.png' });
        console.log('\n   📸 Screenshot saved: participant-dashboard-test.png');

        // ========================================================================
        // SUMMARY
        // ========================================================================
        console.log('\n\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                    TEST SUMMARY                              ║');
        console.log('╠════════════════════════════════════════════════════════════╣');

        console.log('║ ADMIN DASHBOARD MENUS:');
        for (const [menu, status] of Object.entries(results.admin)) {
            console.log(`║   ${menu.padEnd(25)} ${status ? '✅ PASS' : '❌ FAIL'}                    ║`);
        }

        console.log('║                                                              ║');
        console.log('║ PARTICIPANT DASHBOARD:');
        console.log(`║   Dashboard${' '.repeat(20)} ${results.participant.dashboard ? '✅ PASS' : '❌ FAIL'}                    ║`);
        console.log(`║   Start Exam${' '.repeat(20)} ${results.participant.startExam ? '✅ PASS' : '❌ FAIL'}                    ║`);
        console.log('╚════════════════════════════════════════════════════════════╝');

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }

    console.log('\n✨ Test completed!');
}

testDashboardMenus().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
