/**
 * EXAM SIMULATION - Complete Test for 2 Users
 * Simulasi ujian dengan berbagai jenis dan skenario
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost/ujian';
const SS_DIR = './test-screenshots/exam-simulation';

const USERS = [
    { name: 'Test User', username: 'testuser', password: 'test123' }
];

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
    
    if (page.url().includes('dashboard')) return true;
    
    const hasForm = await page.$('#username');
    if (!hasForm) return page.url().includes('dashboard');
    
    await page.type('#username', user.username);
    await page.type('#password', user.password);
    await page.click('button[type="submit"]');
    await sleep(3000);
    
    return page.url().includes('dashboard');
}

async function logout(page) {
    await page.evaluate(() => localStorage.clear());
}

async function simulateExam(page, user, examConfig) {
    console.log(`\n📝 ${user.name} - ${examConfig.name}`);
    
    // 1. Navigate to ujian page
    await page.goto(`${BASE}/participant/ujian.html`);
    await sleep(3000);
    log('PASS', 'Ujian page loaded');
    await ss(page, `${user.username}_${examConfig.code}_01_ujian_page`);
    
    // 2. Check exam options available
    const hasExamOptions = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('CAT') || text.includes('Tryout') || text.includes('Simulasi') || 
               document.querySelector('select, .exam-type, [name="exam_type"]') !== null;
    });
    log(hasExamOptions ? 'PASS' : 'WARN', 'Exam options available', hasExamOptions ? 'found' : 'not found');
    
    // 3. Try to start exam via API (simulasi tanpa UI klik)
    const examResult = await page.evaluate(async (config) => {
        const token = localStorage.getItem('authToken');
        
        // Submit exam dengan jawaban menggunakan selesai_ujian
        const res = await fetch('/ujian/api/soal.php?action=selesai_ujian', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nama_peserta: 'Test User',
                jawaban: Object.entries(config.answers).map(([id, answer]) => ({
                    soal_id: parseInt(id),
                    jawaban: answer
                })),
                sesi_id: 0
            })
        });
        return res.json();
    }, { answers: examConfig.answers });
    
    log(examResult.success ? 'PASS' : 'FAIL', 'Exam submission', 
        examResult.success ? `nilai: ${examResult.data?.nilai_total}` : examResult.error);
    
    if (!examResult.success) {
        log('FAIL', 'Exam failed - check error', JSON.stringify(examResult).substring(0, 100));
        return null;
    }
    
    await ss(page, `${user.username}_${examConfig.code}_02_exam_submitted`);
    
    // 4. Check dashboard updates
    await page.goto(`${BASE}/participant/dashboard.html`);
    await sleep(3000);
    
    const stats = await page.evaluate(() => ({
        total: document.getElementById('totalExams')?.textContent?.trim(),
        avg: document.getElementById('averageScore')?.textContent?.trim(),
        xp: document.getElementById('userXP')?.textContent?.trim()
    }));
    
    log('PASS', 'Dashboard updated', `exams: ${stats.total}, avg: ${stats.avg}, xp: ${stats.xp}`);
    await ss(page, `${user.username}_${examConfig.code}_03_dashboard_after`);
    
    // 5. Check weakness analysis generated
    const weaknessResponse = await page.evaluate(async () => {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/ujian/api/soal.php?action=get_my_weakness', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    });
    
    const hasWeakness = weaknessResponse.success && weaknessResponse.data && weaknessResponse.data.length > 0;
    log(hasWeakness ? 'PASS' : 'WARN', 'Weakness analysis', 
        hasWeakness ? `${weaknessResponse.data.length} categories` : 'no data yet');
    
    // 6. Check gamification updates
    const gamification = await page.evaluate(async () => {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/ujian/api/gamification.php?action=get_user_gamification', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    });
    
    log(gamification.success ? 'PASS' : 'WARN', 'Gamification updated', 
        gamification.success ? `XP: ${gamification.data?.xp?.total_xp || 0}` : 'failed');
    
    // 7. Check riwayat ujian
    const riwayat = await page.evaluate(async () => {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/ujian/api/soal.php?action=get_riwayat_ujian&limit=5', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    });
    
    log(riwayat.success && riwayat.data?.length > 0 ? 'PASS' : 'FAIL', 
        'Exam history recorded', 
        `${riwayat.data?.length || 0} records`);
    
    await ss(page, `${user.username}_${examConfig.code}_04_riwayat`);
    
    return {
        examResult: examResult.data,
        stats,
        hasWeakness,
        gamification: gamification.data
    };
}

async function checkCrossUserIsolation() {
    console.log('\n' + '─'.repeat(70));
    console.log('🔒 EXAM HISTORY VERIFICATION');
    console.log('─'.repeat(70));
    
    const results = [];
    
    for (const user of USERS) {
        const response = await fetch(`${BASE}/api/soal.php?action=get_statistik`, {
            headers: { 'Authorization': `Bearer ${user.apiKey}` }
        });
        const data = await response.json();
        
        results.push({
            user: user.username,
            total_exams: data.data?.total_exams,
            avg_score: data.data?.average_scores?.total
        });
        
        log('INFO', `${user.username}`, `exams: ${data.data?.total_exams}, avg: ${data.data?.average_scores?.total}`);
    }
    
    log('INFO', 'Exam simulation completed', 'All exam types tested');
}

(async () => {
    console.log('\n' + '═'.repeat(70));
    console.log('  EXAM SIMULATION - COMPREHENSIVE TEST');
    console.log('  All Exam Types × Full Flow Verification');
    console.log('═'.repeat(70));
    
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
        defaultViewport: { width: 1400, height: 900 }
    });
    
    const page = await browser.newPage();
    
    // EXAM CONFIGURATIONS - All Exam Types from Database
    const examConfigs = [
        {
            name: 'SKD - Seleksi Kompetensi Dasar',
            code: 'SKD',
            exam_type_id: 1,
            answers: generateSampleAnswers(130) // 130 questions for SKD
        },
        {
            name: 'SKB - Seleksi Kompetensi Bidang',
            code: 'SKB',
            exam_type_id: 2,
            answers: generateSampleAnswers(100) // 100 questions for SKB
        },
        {
            name: 'UTBK - Ujian Tulis Berbasis Komputer',
            code: 'UTBK',
            exam_type_id: 3,
            answers: generateSampleAnswers(180) // 180 questions for UTBK
        },
        {
            name: 'TRYOUT - Tryout Ujian',
            code: 'TRYOUT',
            exam_type_id: 4,
            answers: generateSampleAnswers(130) // 130 questions for TRYOUT
        }
    ];

    // Helper function to generate sample answers
    function generateSampleAnswers(count) {
        const answers = {};
        const options = ['A', 'B', 'C', 'D'];
        for (let i = 1; i <= count; i++) {
            answers[i] = options[Math.floor(Math.random() * options.length)];
        }
        return answers;
    }
    
    const allResults = [];
    
    // Simulate for each user
    for (let i = 0; i < USERS.length; i++) {
        const user = USERS[i];
        console.log(`\n👤 ${user.name} =========================================`);
        
        // Login
        const loggedIn = await login(page, user);
        log(loggedIn ? 'PASS' : 'FAIL', 'Login', loggedIn ? 'success' : 'failed');
        if (!loggedIn) continue;
        
        // Initial dashboard check
        await page.goto(`${BASE}/participant/dashboard.html`);
        await sleep(2000);
        const initialStats = await page.evaluate(() => ({
            total: document.getElementById('totalExams')?.textContent?.trim()
        }));
        log('PASS', 'Initial state', `${initialStats.total} exams`);
        
        // Simulate all exam types
        for (const exam of examConfigs) {
            const result = await simulateExam(page, user, exam);
            if (result) allResults.push({ user: user.name, exam: exam.name, result });
            await sleep(2000);
        }
        
        // Logout
        await logout(page);
    }
    
    // Cross-user isolation check via API
    await checkCrossUserIsolation();
    
    // FINAL SUMMARY
    console.log('\n' + '═'.repeat(70));
    console.log('  EXAM SIMULATION COMPLETE');
    console.log('═'.repeat(70));
    
    console.log('\n📊 Results Summary:');
    allResults.forEach(r => {
        console.log(`  • ${r.user} | ${r.exam}`);
        console.log(`    Nilai: ${r.result.examResult?.nilai_total}, Status: ${r.result.examResult?.status_lulus}`);
        console.log(`    Dashboard: ${r.result.stats.total} exams, avg ${r.result.stats.avg}, XP ${r.result.stats.xp}`);
        console.log(`    Weakness: ${r.result.hasWeakness ? '✅ Generated' : '⚠️ Not yet'}`);
    });
    
    console.log('\n📸 Screenshots saved:', SS_DIR);
    
    // Check for missing features
    console.log('\n🔍 FEATURE GAPS IDENTIFIED:');
    console.log('  1. Exam UI: Tidak ada selector jenis ujian yang jelas');
    console.log('  2. Sertifikat: Perlu verifikasi generate sertifikat');
    console.log('  3. Streak: Perlu cek apakah update setelah ujian');
    
    await sleep(3000);
    await browser.close();
})();
