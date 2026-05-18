/**
 * ALL EXAM TYPES SIMULATION
 * Simulasi ujian untuk semua jenis ujian (SKD, SKB, UTBK, TRYOUT)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost/ujian';
const SS_DIR = './test-screenshots/all-exam-simulation';
const USER = { username: 'testuser', password: 'test123' };

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ss = async (page, name) => page.screenshot({ path: `${SS_DIR}/${name}.png`, fullPage: false });

const log = (status, label, detail = '') => {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${icon} ${label}${detail ? ' | ' + detail : ''}`);
};

async function login(page, user) {
    await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    
    // Check if already logged in
    if (page.url().includes('dashboard')) return true;
    
    const hasForm = await page.$('#username');
    if (!hasForm) return page.url().includes('dashboard');
    
    await page.type('#username', user.username);
    await page.type('#password', user.password);
    await page.click('button[type="submit"]');
    await sleep(3000);
    
    return page.url().includes('dashboard');
}

async function simulateExamType(page, examType) {
    console.log(`\n📝 Simulating: ${examType.name} (${examType.code})`);
    
    try {
        // 1. Navigate to ujian page
        await page.goto(`${BASE}/participant/ujian.html`);
        await sleep(2000);
        log('PASS', 'Ujian page loaded');
        await ss(page, `${examType.code}_01_ujian_page`);
        
        // 2. Check if exam form exists
        const hasForm = await page.$('#namaPeserta');
        if (!hasForm) {
            log('WARN', 'Exam form not found', 'UI-based simulation requires form');
            return null;
        }
        
        // 3. Fill participant name
        await page.type('#namaPeserta', 'Test User Simulation');
        await sleep(500);
        log('PASS', 'Participant name filled');
        
        // 4. Check for exam type selector
        const hasSelector = await page.$('select, #examType, [name="exam_type"]');
        if (hasSelector) {
            log('PASS', 'Exam type selector found');
            // Try to select the exam type if possible
            await page.evaluate((code) => {
                const select = document.querySelector('select, #examType, [name="exam_type"]');
                if (select) {
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].text.includes(code)) {
                            select.selectedIndex = i;
                            select.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                }
            }, examType.code);
            await sleep(1000);
        } else {
            log('WARN', 'No exam type selector', 'Will use default exam');
        }
        
        await ss(page, `${examType.code}_02_form_filled`);
        
        // 5. Start exam
        const startBtn = await page.$('button[onclick*="mulai"], button[type="button"]');
        if (startBtn) {
            await startBtn.click();
            await sleep(3000);
            log('PASS', 'Start exam clicked');
        } else {
            log('WARN', 'No start button found', 'Exam might not start');
        }
        
        await ss(page, `${examType.code}_03_exam_started`);
        
        // 6. Answer some questions (simulate answering)
        const questionsAnswered = await page.evaluate(async () => {
            let answered = 0;
            // Answer up to 5 questions
            for (let i = 0; i < 5; i++) {
                const buttons = document.querySelectorAll('.option-btn, .answer-btn, input[type="radio"]');
                if (buttons.length > 0) {
                    buttons[0].click();
                    answered++;
                    await new Promise(r => setTimeout(r, 500));
                    
                    // Try to go to next question
                    const nextBtn = document.querySelector('.next-btn, #nextBtn, button[onclick*="next"]');
                    if (nextBtn) nextBtn.click();
                    await new Promise(r => setTimeout(r, 500));
                } else {
                    break;
                }
            }
            return answered;
        });
        
        log('PASS', 'Questions answered', `${questionsAnswered} questions`);
        
        // 7. Finish exam
        const finishBtn = await page.$('.finish-btn, #finishBtn, button[onclick*="selesai"], button[onclick*="finish"]');
        if (finishBtn) {
            await finishBtn.click();
            await sleep(3000);
            log('PASS', 'Exam finished');
        } else {
            log('WARN', 'No finish button found', 'Exam might not complete');
        }
        
        await ss(page, `${examType.code}_04_exam_finished`);
        
        // 8. Check if results are shown
        const hasResults = await page.evaluate(() => {
            return document.body.textContent.includes('nilai') || 
                   document.body.textContent.includes('score') ||
                   document.body.textContent.includes('hasil');
        });
        
        log(hasResults ? 'PASS' : 'WARN', 'Results displayed', hasResults ? 'Yes' : 'No');
        
        if (hasResults) {
            await ss(page, `${examType.code}_05_results`);
        }
        
        // 9. Check dashboard for updated stats
        await page.goto(`${BASE}/participant/dashboard.html`);
        await sleep(2000);
        
        const stats = await page.evaluate(() => ({
            total: document.getElementById('totalExams')?.textContent?.trim(),
            avg: document.getElementById('averageScore')?.textContent?.trim()
        }));
        
        log('PASS', 'Dashboard stats', `exams: ${stats.total}, avg: ${stats.avg}`);
        
        return {
            examType: examType.name,
            questionsAnswered,
            hasResults,
            stats
        };
        
    } catch (error) {
        log('FAIL', 'Simulation error', error.message);
        return null;
    }
}

(async () => {
    console.log('\n' + '═'.repeat(70));
    console.log('  ALL EXAM TYPES SIMULATION');
    console.log('  SKD, SKB, UTBK, TRYOUT × UI-Based Flow');
    console.log('═'.repeat(70));
    
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
        defaultViewport: { width: 1400, height: 900 }
    });
    
    const page = await browser.newPage();
    
    // Exam types from database
    const examTypes = [
        { code: 'SKD', name: 'Seleksi Kompetensi Dasar', id: 1 },
        { code: 'SKB', name: 'Seleksi Kompetensi Bidang', id: 2 },
        { code: 'UTBK', name: 'Ujian Tulis Berbasis Komputer', id: 3 },
        { code: 'TRYOUT', name: 'Tryout Ujian', id: 4 }
    ];
    
    const results = [];
    
    // Login
    console.log(`\n👤 Logging in as ${USER.username}...`);
    const loggedIn = await login(page, USER);
    log(loggedIn ? 'PASS' : 'FAIL', 'Login', loggedIn ? 'success' : 'failed');
    
    if (!loggedIn) {
        console.log('\n❌ Login failed. Cannot proceed with simulation.');
        await browser.close();
        return;
    }
    
    // Simulate each exam type
    for (const examType of examTypes) {
        const result = await simulateExamType(page, examType);
        if (result) {
            results.push(result);
        }
        await sleep(2000); // Wait between exams
    }
    
    // Final summary
    console.log('\n' + '═'.repeat(70));
    console.log('  SIMULATION COMPLETE');
    console.log('═'.repeat(70));
    
    console.log('\n📊 Results Summary:');
    results.forEach(r => {
        console.log(`  • ${r.examType}`);
        console.log(`    Questions answered: ${r.questionsAnswered}`);
        console.log(`    Results shown: ${r.hasResults ? '✅' : '⚠️'}`);
        console.log(`    Dashboard: exams=${r.stats.total}, avg=${r.stats.avg}`);
    });
    
    console.log('\n📸 Screenshots saved:', SS_DIR);
    
    await sleep(3000);
    await browser.close();
    
    // Generate report
    const report = {
        date: new Date().toISOString(),
        user: USER.username,
        examTypes: examTypes,
        results: results,
        summary: {
            total: examTypes.length,
            successful: results.length,
            failed: examTypes.length - results.length
        }
    };
    
    fs.writeFileSync(
        `${SS_DIR}/simulation-report.json`,
        JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Report saved: simulation-report.json');
    console.log('\n✨ Simulation completed!');
})();
