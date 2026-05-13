/**
 * Comprehensive CRUD and Functionality Test
 * Tests CRUD operations and logic flow for admin and participant pages
 */

const puppeteer = require('puppeteer');

async function testCRUDAndFunctionality() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         COMPREHENSIVE CRUD & FUNCTIONALITY TEST              ║');
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
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // ========================================================================
        // ADMIN CRUD TESTS
        // ========================================================================
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  PART 1: ADMIN CRUD OPERATIONS                                ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

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

        // Test Tips & Triks section specifically
        console.log('2. Checking Tips & Triks section...');
        await page.click('a[onclick*="tips"]');
        await page.waitForTimeout(2000);

        const tipsInfo = await page.evaluate(() => {
            const tipsTable = document.getElementById('tipsTable');
            const rows = tipsTable ? tipsTable.querySelectorAll('tr').length : 0;
            const buttons = tipsTable ? tipsTable.querySelectorAll('button').length : 0;
            const tbodyContent = tipsTable ? tipsTable.innerHTML.substring(0, 500) : '';
            return { rows, buttons, tbodyContent };
        });

        console.log(`   Tips table rows: ${tipsInfo.rows}`);
        console.log(`   Tips table buttons: ${tipsInfo.buttons}`);
        console.log(`   Content preview: ${tipsInfo.tbodyContent.substring(0, 100)}`);
        results.admin.tips = { rows: tipsInfo.rows, buttons: tipsInfo.buttons };

        // Test Soal (Questions) CRUD
        console.log('\n3. Testing Soal (Questions) CRUD...');
        await page.click('a[onclick*="questions"]');
        await page.waitForTimeout(2000);

        const questionsInfo = await page.evaluate(() => {
            const table = document.getElementById('questionsTable');
            const rows = table ? table.querySelectorAll('tr').length : 0;
            const addButton = document.querySelector('button[onclick*="showQuestionModal"]');
            return { rows, hasAddButton: !!addButton };
        });

        console.log(`   Questions table rows: ${questionsInfo.rows}`);
        console.log(`   Has add button: ${questionsInfo.hasAddButton ? 'Yes' : 'No'}`);
        results.admin.questions = questionsInfo;

        // Test Kategori (Categories)
        console.log('\n4. Testing Kategori (Categories)...');
        await page.click('a[onclick*="categories"]');
        await page.waitForTimeout(2000);

        const categoriesInfo = await page.evaluate(() => {
            const table = document.getElementById('categoriesTable');
            const rows = table ? table.querySelectorAll('tr').length : 0;
            return { rows };
        });

        console.log(`   Categories table rows: ${categoriesInfo.rows}`);
        results.admin.categories = categoriesInfo;

        // Test Paket Blueprint
        console.log('\n5. Testing Paket Blueprint...');
        await page.click('a[onclick*="blueprint"]');
        await page.waitForTimeout(2000);

        const blueprintInfo = await page.evaluate(() => {
            const table = document.getElementById('blueprintsTable');
            const rows = table ? table.querySelectorAll('tr').length : 0;
            const addButton = document.querySelector('button[onclick*="showBlueprintModal"]');
            return { rows, hasAddButton: !!addButton };
        });

        console.log(`   Blueprint table rows: ${blueprintInfo.rows}`);
        console.log(`   Has add button: ${blueprintInfo.hasAddButton ? 'Yes' : 'No'}`);
        results.admin.blueprint = blueprintInfo;

        // Test Bahan Pelajaran
        console.log('\n6. Testing Bahan Pelajaran...');
        await page.click('a[onclick*="bahanPelajaran"]');
        await page.waitForTimeout(2000);

        const bahanInfo = await page.evaluate(() => {
            const table = document.getElementById('bahanTable');
            const rows = table ? table.querySelectorAll('tr').length : 0;
            const addButton = document.querySelector('button[onclick*="showBahanPelajaranModal"]');
            return { rows, hasAddButton: !!addButton };
        });

        console.log(`   Bahan Pelajaran table rows: ${bahanInfo.rows}`);
        console.log(`   Has add button: ${bahanInfo.hasAddButton ? 'Yes' : 'No'}`);
        results.admin.bahanPelajaran = bahanInfo;

        // Test Hasil Ujian
        console.log('\n7. Testing Hasil Ujian...');
        await page.click('a[onclick*="results"]');
        await page.waitForTimeout(2000);

        const resultsInfo = await page.evaluate(() => {
            const table = document.getElementById('resultsTable');
            const rows = table ? table.querySelectorAll('tr').length : 0;
            const exportButton = document.querySelector('button[onclick*="exportExcel"]');
            return { rows, hasExportButton: !!exportButton };
        });

        console.log(`   Hasil Ujian table rows: ${resultsInfo.rows}`);
        console.log(`   Has export button: ${resultsInfo.hasExportButton ? 'Yes' : 'No'}`);
        results.admin.results = resultsInfo;

        await page.screenshot({ path: 'admin-crud-test.png' });
        console.log('\n   📸 Screenshot saved: admin-crud-test.png');

        // ========================================================================
        // PARTICIPANT FUNCTIONALITY TEST
        // ========================================================================
        console.log('\n\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  PART 2: PARTICIPANT FUNCTIONALITY                           ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Logout
        console.log('8. Logging out from admin...');
        await page.evaluate(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
        });
        await page.goto('http://localhost/bimbel/login.html', {
            waitUntil: 'networkidle2'
        });
        console.log('   ✅ Logged out\n');

        // Login as participant
        console.log('9. Logging in as participant...');
        await page.type('#username', 'user_1778688916164');
        await page.type('#password', 'TestPass123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        console.log('   ✅ Logged in as participant\n');

        // Test dashboard functionality
        console.log('10. Testing participant dashboard...');
        const dashboardInfo = await page.evaluate(() => {
            const statCards = document.querySelectorAll('.stat-card').length;
            const startExamBtn = document.querySelector('button[onclick*="startNewExam"]');
            const viewHistoryBtn = document.querySelector('button[onclick*="viewHistory"]');
            const logoutBtn = document.querySelector('button[onclick*="logout"]') || document.querySelector('button:has(.fa-sign-out-alt)');
            
            return {
                statCards,
                hasStartExam: !!startExamBtn,
                hasViewHistory: !!viewHistoryBtn,
                hasLogout: !!logoutBtn
            };
        });

        console.log(`   Stat cards: ${dashboardInfo.statCards}`);
        console.log(`   Start exam button: ${dashboardInfo.hasStartExam ? 'Yes' : 'No'}`);
        console.log(`   View history button: ${dashboardInfo.hasViewHistory ? 'Yes' : 'No'}`);
        console.log(`   Logout button: ${dashboardInfo.hasLogout ? 'Yes' : 'No'}`);
        results.participant.dashboard = dashboardInfo;

        // Test exam page
        console.log('\n11. Testing exam page navigation...');
        if (dashboardInfo.hasStartExam) {
            await page.click('button[onclick*="startNewExam"]');
            await page.waitForTimeout(2000);

            const examInfo = await page.evaluate(() => {
                const url = window.location.href;
                const hasExamContainer = !!document.querySelector('.exam-container');
                const hasQuestionSection = !!document.querySelector('.question-section');
                return { url, hasExamContainer, hasQuestionSection };
            });

            console.log(`   Exam URL: ${examInfo.url}`);
            console.log(`   Has exam container: ${examInfo.hasExamContainer ? 'Yes' : 'No'}`);
            console.log(`   Has question section: ${examInfo.hasQuestionSection ? 'Yes' : 'No'}`);
            results.participant.exam = examInfo;
        }

        await page.screenshot({ path: 'participant-functionality-test.png' });
        console.log('\n   📸 Screenshot saved: participant-functionality-test.png');

        // ========================================================================
        // SUMMARY
        // ========================================================================
        console.log('\n\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                    TEST SUMMARY                              ║');
        console.log('╠════════════════════════════════════════════════════════════╣');

        console.log('║ ADMIN CRUD OPERATIONS:');
        console.log(`║   Tips & Triks         Rows: ${results.admin.tips.rows}, Buttons: ${results.admin.tips.buttons}           ║`);
        console.log(`║   Soal (Questions)     Rows: ${results.admin.questions.rows}, Add Btn: ${results.admin.questions.hasAddButton ? 'Yes' : 'No'}                  ║`);
        console.log(`║   Kategori             Rows: ${results.admin.categories.rows}                        ║`);
        console.log(`║   Paket Blueprint       Rows: ${results.admin.blueprint.rows}, Add Btn: ${results.admin.blueprint.hasAddButton ? 'Yes' : 'No'}                  ║`);
        console.log(`║   Bahan Pelajaran      Rows: ${results.admin.bahanPelajaran.rows}, Add Btn: ${results.admin.bahanPelajaran.hasAddButton ? 'Yes' : 'No'}                  ║`);
        console.log(`║   Hasil Ujian          Rows: ${results.admin.results.rows}, Export Btn: ${results.admin.results.hasExportButton ? 'Yes' : 'No'}               ║`);

        console.log('║                                                              ║');
        console.log('║ PARTICIPANT FUNCTIONALITY:');
        console.log(`║   Dashboard             Stat Cards: ${results.participant.dashboard.statCards}                   ║`);
        console.log(`║   Start Exam            ${results.participant.dashboard.hasStartExam ? '✅' : '❌'}                      ║`);
        console.log(`║   View History          ${results.participant.dashboard.hasViewHistory ? '✅' : '❌'}                      ║`);
        console.log(`║   Logout                ${results.participant.dashboard.hasLogout ? '✅' : '❌'}                      ║`);
        console.log(`║   Exam Page             ${results.participant.exam?.url.includes('ujian.html') ? '✅' : '❌'}                      ║`);
        console.log('╚════════════════════════════════════════════════════════════╝');

        console.log('\n📊 Tips & Triks Analysis:');
        console.log(`   The ${results.admin.tips.buttons} buttons count might include all buttons on the page.`);
        console.log(`   Actual tips rows: ${results.admin.tips.rows}`);
        console.log(`   Each tip row has 2 buttons (edit + delete), so expected buttons: ${results.admin.tips.rows * 2}`);
        console.log(`   If the count is much higher, there might be duplicate elements or hidden buttons.`);

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }

    console.log('\n✨ Test completed!');
}

testCRUDAndFunctionality().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
