const puppeteer = require('puppeteer');

const BASE = 'http://localhost/bimbel';
const SCREENSHOTS_DIR = './test-screenshots';

// Fresh user yang belum pernah ujian
const ts = Date.now().toString().slice(-6); // 6 digit suffix
const NEW_USER = {
    username: 'fresh' + ts,        // max ~11 chars, valid
    email: `fresh${ts}@test.com`,
    password: 'Fresh123!',
    nama_lengkap: 'Fresh User Test'
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function screenshot(page, name) {
    const fs = require('fs');
    if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    const path = `${SCREENSHOTS_DIR}/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`  📸 Screenshot: ${path}`);
}

async function run() {
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  PUPPETEER HEADED TEST — Dashboard Participant');
    console.log('══════════════════════════════════════════════════════');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 900 },
        args: ['--no-sandbox', '--start-maximized'],
        slowMo: 50
    });

    const page = await browser.newPage();

    // Tangkap console.error dari halaman
    const pageErrors = [];
    const pageConsole = [];
    page.on('console', msg => {
        const text = msg.text();
        pageConsole.push({ type: msg.type(), text });
        if (msg.type() === 'error') {
            console.log(`  [PAGE ERROR] ${text}`);
        }
    });
    page.on('pageerror', err => {
        pageErrors.push(err.message);
        console.log(`  [PAGE CRASH] ${err.message}`);
    });

    // Intercept API responses untuk audit
    const apiCalls = [];
    page.on('response', async res => {
        const url = res.url();
        if (url.includes('/api/')) {
            try {
                const json = await res.json();
                apiCalls.push({ url: url.replace(BASE, ''), status: res.status(), data: json });
            } catch (e) { /* non-json */ }
        }
    });

    try {
        // ─────────────────────────────────────────────────────
        // STEP 1: Register user baru via API langsung (lebih reliable)
        // ─────────────────────────────────────────────────────
        console.log('\n📋 STEP 1: Register fresh user via API (belum pernah ujian)');
        console.log(`  Username: ${NEW_USER.username}`);

        const http = require('http');
        const registerResult = await new Promise((resolve) => {
            const body = JSON.stringify({
                username: NEW_USER.username,
                password: NEW_USER.password,
                nama_lengkap: NEW_USER.nama_lengkap,
                nomor_hp: '0812' + ts,
                jenis_kelamin: 'L',
                tahun_tamat: 2023,
                asal_sekolah: 'SMA Negeri 1 Test',
                role: 'user'
            });
            const req = http.request({
                hostname: 'localhost', port: 80,
                path: '/bimbel/api/auth.php?action=register',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
            }, res => {
                let data = '';
                res.on('data', d => data += d);
                res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({success:false,error:data}); } });
            });
            req.on('error', e => resolve({success:false,error:e.message}));
            req.write(body);
            req.end();
        });

        if (registerResult.success) {
            console.log(`  ✅ Register BERHASIL — user ID: ${registerResult.user?.id}`);
        } else {
            console.log(`  ❌ Register GAGAL: ${registerResult.error}`);
            console.log('  ⚠ Melanjutkan dengan user yang mungkin sudah ada sebelumnya');
        }

        // Tampilkan halaman register untuk screenshot
        await page.goto(`${BASE}/participant/register.html`, { waitUntil: 'networkidle0' });
        await screenshot(page, '01-register-page');

        // ─────────────────────────────────────────────────────
        // STEP 2: Login sebagai fresh user
        // ─────────────────────────────────────────────────────
        console.log('\n🔐 STEP 2: Login sebagai fresh user via login.html');
        // Tunggu redirect dari register atau navigasi manual
        await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle0' });
        await sleep(1000);
        await page.evaluate(() => localStorage.clear());

        await page.waitForSelector('#username', { timeout: 5000 });
        await page.type('#username', NEW_USER.username);
        await page.type('#password', NEW_USER.password);

        await screenshot(page, '04-login-filled');
        await page.click('button[type="submit"]');
        // Tunggu redirect ke dashboard atau error
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
        await sleep(3000);

        const loginUrl = page.url();
        console.log(`  URL setelah login: ${loginUrl}`);

        if (!loginUrl.includes('dashboard')) {
            const alertText = await page.$eval('#alertBox', el => el.textContent.trim()).catch(() => '');
            console.log(`  ⚠ Login mungkin gagal — Alert: "${alertText}"`);
            await screenshot(page, '05-login-failed');
        }

        // Ambil auth token dari localStorage
        const authData = await page.evaluate(() => ({
            token: localStorage.getItem('authToken'),
            role: localStorage.getItem('userRole'),
            username: localStorage.getItem('username'),
            allKeys: Object.keys(localStorage)
        }));
        console.log(`  localStorage keys: ${authData.allKeys.join(', ')}`);
        console.log(`  authToken: ${authData.token ? authData.token.substring(0, 20) + '...' : 'TIDAK ADA'}`);
        console.log(`  userRole: ${authData.role}`);

        // ─────────────────────────────────────────────────────
        // STEP 3: Buka dashboard
        // ─────────────────────────────────────────────────────
        console.log('\n🏠 STEP 3: Buka dashboard participant');
        await page.goto(`${BASE}/participant/dashboard.html`, { waitUntil: 'networkidle0' });
        await sleep(5000); // Tunggu semua API calls selesai

        await screenshot(page, '06-dashboard-freshuser-initial');

        // ─────────────────────────────────────────────────────
        // STEP 4: Audit semua angka yang tampil
        // ─────────────────────────────────────────────────────
        console.log('\n🔍 STEP 4: Audit data yang tampil di dashboard');

        const dashboardData = await page.evaluate(() => {
            const getText = (id) => {
                const el = document.getElementById(id);
                return el ? el.textContent.trim() : '(element tidak ditemukan)';
            };

            return {
                // Stat cards
                totalExams: getText('totalExams'),
                averageScore: getText('averageScore'),
                userXP: getText('userXP'),
                userStreak: getText('userStreak'),
                userLevel: getText('userLevel'),

                // Perubahan/sub-label
                totalExamsChange: getText('totalExamsChange'),
                averageScoreChange: getText('averageScoreChange'),
                userLevelChange: getText('userLevelChange'),
                userStreakChange: getText('userStreakChange'),

                // AI Assessment
                readinessScore: getText('readinessScore'),
                daysRemaining: getText('daysRemaining'),
                aiRecommendation: getText('aiRecommendation'),
                aiConfidence: getText('aiConfidence'),

                // Sections content (untuk cek apakah kosong atau ada data palsu)
                weaknessList: document.getElementById('weaknessList') ?
                    document.getElementById('weaknessList').innerHTML.trim().substring(0, 200) : '(tidak ada)',
                badgesList: document.getElementById('badgesList') ?
                    document.getElementById('badgesList').innerHTML.trim().substring(0, 200) : '(tidak ada)',
                notificationsList: document.getElementById('notificationsList') ?
                    document.getElementById('notificationsList').innerHTML.trim().substring(0, 200) : '(tidak ada)',
                lastExamCard: document.getElementById('lastExamCard') ?
                    document.getElementById('lastExamCard').innerHTML.trim().substring(0, 300) : '(tidak ada)',
                learningPathList: document.getElementById('learningPathList') ?
                    document.getElementById('learningPathList').innerHTML.trim().substring(0, 200) : '(tidak ada)',
                dailyChallengesList: document.getElementById('dailyChallengesList') ?
                    document.getElementById('dailyChallengesList').innerHTML.trim().substring(0, 200) : '(tidak ada)',

                // User info
                userName: getText('userName'),
                userDetail: getText('userDetail'),
            };
        });

        console.log('\n  ┌─── STAT CARDS ──────────────────────────────');
        console.log(`  │ Total Ujian    : "${dashboardData.totalExams}"`);
        console.log(`  │ Rata-rata Skor : "${dashboardData.averageScore}"`);
        console.log(`  │ XP             : "${dashboardData.userXP}"`);
        console.log(`  │ Streak         : "${dashboardData.userStreak}"`);
        console.log(`  │ Level          : "${dashboardData.userLevel}"`);
        console.log(`  └─────────────────────────────────────────────`);

        console.log('\n  ┌─── AI ASSESSMENT ───────────────────────────');
        console.log(`  │ Readiness      : "${dashboardData.readinessScore}"`);
        console.log(`  │ Days Remaining : "${dashboardData.daysRemaining}"`);
        console.log(`  │ AI Rekomendasi : "${dashboardData.aiRecommendation.substring(0, 80)}"`);
        console.log(`  └─────────────────────────────────────────────`);

        console.log('\n  ┌─── SECTIONS (fresh user, seharusnya kosong) ─');
        console.log(`  │ Riwayat Ujian  : ${dashboardData.lastExamCard.substring(0, 100)}`);
        console.log(`  │ Weakness List  : ${dashboardData.weaknessList.substring(0, 100)}`);
        console.log(`  │ Badges List    : ${dashboardData.badgesList.substring(0, 100)}`);
        console.log(`  │ Notifikasi     : ${dashboardData.notificationsList.substring(0, 100)}`);
        console.log(`  │ Daily Challenge: ${dashboardData.dailyChallengesList.substring(0, 100)}`);
        console.log(`  └─────────────────────────────────────────────`);

        // ─────────────────────────────────────────────────────
        // STEP 5: Audit API calls yang dipicu dashboard
        // ─────────────────────────────────────────────────────
        console.log('\n📡 STEP 5: API calls yang dipicu oleh dashboard');
        apiCalls.forEach(call => {
            const endpoint = call.url.split('?')[1] || call.url;
            const success = call.data?.success;
            const hasData = call.data?.data !== null && call.data?.data !== undefined;
            const dataInfo = Array.isArray(call.data?.data)
                ? `array[${call.data.data.length}]`
                : (call.data?.data ? 'object' : (call.data?.error || 'null'));
            console.log(`  ${success ? '✓' : '✗'} ${endpoint} → ${dataInfo}`);
        });

        // ─────────────────────────────────────────────────────
        // STEP 6: Deteksi masalah — angka tidak nol untuk fresh user
        // ─────────────────────────────────────────────────────
        console.log('\n⚠ STEP 6: Deteksi angka yang seharusnya 0 untuk fresh user');
        const issues = [];

        const totalExamsNum = parseInt(dashboardData.totalExams) || 0;
        const avgScoreNum = parseFloat(dashboardData.averageScore) || 0;
        const xpNum = parseInt(dashboardData.userXP) || 0;
        const streakNum = parseInt(dashboardData.userStreak) || 0;
        const levelNum = parseInt(dashboardData.userLevel) || 1;

        if (totalExamsNum > 0) issues.push(`Total ujian = ${totalExamsNum} (seharusnya 0)`);
        if (avgScoreNum > 0) issues.push(`Rata-rata skor = ${avgScoreNum} (seharusnya 0)`);
        if (xpNum > 0) issues.push(`XP = ${xpNum} (seharusnya 0 untuk fresh user)`);
        // Streak = 1 adalah behavior benar: hari pertama login = streak hari ke-1
        if (streakNum > 1) issues.push(`Streak = ${streakNum} (seharusnya ≤1 untuk fresh user)`);
        if (levelNum > 1) issues.push(`Level = ${levelNum} (seharusnya 1)`);

        if (dashboardData.weaknessList.includes('persen_benar') || 
            dashboardData.weaknessList.includes('weakness-item')) {
            issues.push('Weakness list menampilkan data padahal fresh user');
        }

        if (issues.length === 0) {
            console.log('  ✅ Semua angka = 0/default untuk fresh user. Dashboard BENAR!');
        } else {
            console.log('  ❌ Ditemukan masalah:');
            issues.forEach(i => console.log(`     • ${i}`));
        }

        // Screenshot full page
        await screenshot(page, '07-dashboard-freshuser-fullpage');

        // Scroll untuk lihat semua bagian
        await page.evaluate(() => window.scrollTo(0, 500));
        await sleep(1000);
        await screenshot(page, '08-dashboard-middle');

        await page.evaluate(() => window.scrollTo(0, 1500));
        await sleep(1000);
        await screenshot(page, '09-dashboard-bottom');

        // ─────────────────────────────────────────────────────
        // STEP 7: Juga test dengan testuser yang sudah ada ujian
        // ─────────────────────────────────────────────────────
        console.log('\n👤 STEP 7: Bandingkan dengan testuser (sudah ada ujian)');
        // Clear localStorage dulu SEBELUM navigasi supaya tidak auto-redirect
        await page.evaluate(() => localStorage.clear());
        await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle0' });
        await sleep(1500);

        await page.waitForSelector('#username', { timeout: 8000 });
        await page.type('#username', 'testuser');
        await page.type('#password', 'test123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
        await sleep(5000);
        await screenshot(page, '10-dashboard-testuser');

        const testUserData = await page.evaluate(() => ({
            totalExams: document.getElementById('totalExams')?.textContent?.trim(),
            averageScore: document.getElementById('averageScore')?.textContent?.trim(),
            userXP: document.getElementById('userXP')?.textContent?.trim(),
            userStreak: document.getElementById('userStreak')?.textContent?.trim(),
            weaknessCount: document.querySelectorAll('.weakness-item').length,
        }));

        console.log(`  testuser — Ujian: ${testUserData.totalExams}, Avg: ${testUserData.averageScore}, XP: ${testUserData.userXP}, Streak: ${testUserData.userStreak}, Weakness items: ${testUserData.weaknessCount}`);

        console.log('\n══════════════════════════════════════════════════════');
        console.log('  TES SELESAI — Cek screenshots di ./test-screenshots/');
        console.log('══════════════════════════════════════════════════════\n');

    } catch (err) {
        console.error('\n💥 ERROR:', err.message);
        await screenshot(page, 'error-state').catch(() => {});
    } finally {
        await sleep(3000); // Biarkan browser tetap terbuka sebentar
        await browser.close();
    }
}

run();
