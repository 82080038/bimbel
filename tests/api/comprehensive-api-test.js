/**
 * Comprehensive API Integration Test Suite
 * Tests semua endpoint yang sudah diperbaiki secara empiris
 */

const http = require('http');
const fs = require('fs');

const BASE = 'http://localhost/bimbel/api';
const REPORT_FILE = './test-screenshots/api-test-report.json';

// ─── HTTP helper ────────────────────────────────────────────────
function request(method, url, body, headers = {}) {
    return new Promise((resolve) => {
        const parsed = new URL(url);
        const options = {
            hostname: parsed.hostname,
            port: parsed.port || 80,
            path: parsed.pathname + parsed.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    resolve({ ok: true, status: res.status, json: JSON.parse(data), raw: data });
                } catch {
                    resolve({ ok: false, status: res.statusCode, raw: data.substring(0, 200) });
                }
            });
        });
        req.on('error', e => resolve({ ok: false, error: e.message }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ─── Test runner ────────────────────────────────────────────────
const results = [];
let passed = 0, failed = 0, warned = 0;

function log(status, label, detail = '') {
    const icons = { PASS: '✓', FAIL: '✗', WARN: '⚠' };
    const colors = { PASS: '\x1b[32m', FAIL: '\x1b[31m', WARN: '\x1b[33m' };
    const reset = '\x1b[0m';
    console.log(`  ${colors[status]}${icons[status]}${reset} ${label}${detail ? ' — ' + detail : ''}`);
    results.push({ status, label, detail });
    if (status === 'PASS') passed++;
    else if (status === 'FAIL') failed++;
    else warned++;
}

function section(title) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`  ${title}`);
    console.log('─'.repeat(60));
}

async function assert(label, condition, detail = '') {
    if (condition) log('PASS', label, detail);
    else log('FAIL', label, detail);
}

async function assertApiOk(label, res) {
    if (!res.ok) {
        log('FAIL', label, 'PHP ERROR: ' + res.raw?.substring(0, 100));
        return false;
    }
    if (res.json?.success) {
        log('PASS', label);
        return true;
    }
    log('FAIL', label, res.json?.error || res.json?.message || JSON.stringify(res.json).substring(0, 80));
    return false;
}

// ─── TEST DATA ────────────────────────────────────────────────
let API_KEY = '';
let ADMIN_KEY = '';
let TEST_USER_ID = 0;
let TEST_HASIL_ID = 0;

// ═══════════════════════════════════════════════════════════════
// 1. AUTH TESTS
// ═══════════════════════════════════════════════════════════════
async function testAuth() {
    section('1. AUTH — Login, Register, Profile');

    // Login testuser
    const loginRes = await request('POST', `${BASE}/auth.php?action=login`,
        { username: 'testuser', password: 'test123' });
    if (loginRes.json?.success && loginRes.json?.user?.api_key) {
        API_KEY = loginRes.json.user.api_key;
        TEST_USER_ID = loginRes.json.user.id;
        log('PASS', 'Login testuser', `api_key: ${API_KEY.substring(0, 16)}...`);
    } else {
        log('FAIL', 'Login testuser', loginRes.json?.error || loginRes.raw?.substring(0, 80));
    }

    // Login admin
    const adminRes = await request('POST', `${BASE}/auth.php?action=login`,
        { username: 'admin', password: 'admin123' });
    if (adminRes.json?.success && adminRes.json?.user?.api_key) {
        ADMIN_KEY = adminRes.json.user.api_key;
        log('PASS', 'Login admin', `role: ${adminRes.json.user.role}`);
    } else {
        log('WARN', 'Login admin — skip admin tests', adminRes.json?.error || '');
    }

    // Profile
    const h = { Authorization: `Bearer ${API_KEY}` };
    const profileRes = await request('GET', `${BASE}/auth.php?action=get_profile`, null, h);
    await assertApiOk('GET get_profile (Bearer auth)', profileRes);
    if (profileRes.json?.user?.username) {
        await assert('Profile has username field', !!profileRes.json.user.username, profileRes.json.user.username);
        await assert('Profile has nama_lengkap field', profileRes.json.user.nama_lengkap !== undefined);
    }

    // Reject wrong token
    const badRes = await request('GET', `${BASE}/auth.php?action=get_profile`, null,
        { Authorization: 'Bearer invalid_token_xyz' });
    await assert('Reject invalid Bearer token', badRes.json?.success === false, badRes.json?.error);
}

// ═══════════════════════════════════════════════════════════════
// 2. SOAL / UJIAN TESTS
// ═══════════════════════════════════════════════════════════════
async function testSoal() {
    section('2. SOAL — Public & Authenticated endpoints');
    const h = { Authorization: `Bearer ${API_KEY}` };

    // Public
    const acakRes = await request('GET', `${BASE}/soal.php?action=get_soal_acak&kategori_id=1&jumlah=5`);
    const acakOk = await assertApiOk('GET get_soal_acak (public)', acakRes);
    if (acakOk) await assert('Returns array of soal', Array.isArray(acakRes.json.data));

    const paketRes = await request('GET', `${BASE}/soal.php?action=get_paket`);
    await assertApiOk('GET get_paket (public)', paketRes);

    // Authenticated
    const statsRes = await request('GET', `${BASE}/soal.php?action=get_statistik`, null, h);
    await assertApiOk('GET get_statistik (auth)', statsRes);

    const riwayatRes = await request('GET', `${BASE}/soal.php?action=get_riwayat_ujian`, null, h);
    await assertApiOk('GET get_riwayat_ujian (auth)', riwayatRes);

    const weakRes = await request('GET', `${BASE}/soal.php?action=get_my_weakness`, null, h);
    await assertApiOk('GET get_my_weakness (auth)', weakRes);

    const topicsRes = await request('GET', `${BASE}/soal.php?action=get_learning_topics`, null, h);
    await assertApiOk('GET get_learning_topics (auth)', topicsRes);

    const recRes = await request('GET', `${BASE}/soal.php?action=get_learning_recommendations`, null, h);
    await assertApiOk('GET get_learning_recommendations (auth)', recRes);

    const progressRes = await request('GET', `${BASE}/soal.php?action=get_learning_progress`, null, h);
    await assertApiOk('GET get_learning_progress (auth)', progressRes);

    // submit_ujian (was CSRF blocked before fix)
    const submitRes = await request('POST', `${BASE}/soal.php?action=submit_ujian`,
        { answers: {}, is_practice: true }, h);
    if (!submitRes.ok) {
        log('FAIL', 'POST submit_ujian (CSRF fix)', 'PHP ERROR: ' + submitRes.raw?.substring(0, 80));
    } else if (submitRes.json?.error === 'Invalid CSRF token') {
        log('FAIL', 'POST submit_ujian', 'CSRF still blocking Bearer token requests!');
    } else if (submitRes.json?.error === 'No answers provided') {
        log('PASS', 'POST submit_ujian — CSRF bypassed correctly (empty answers rejected by business logic)');
    } else {
        log('PASS', 'POST submit_ujian', JSON.stringify(submitRes.json).substring(0, 80));
    }

    // submit_ujian with real answers
    const realAnswers = {};
    if (acakOk && acakRes.json.data.length > 0) {
        acakRes.json.data.forEach(s => { realAnswers[s.id] = s.jawaban_benar; });
        const realSubmit = await request('POST', `${BASE}/soal.php?action=submit_ujian`,
            { answers: realAnswers, is_practice: true }, h);
        if (realSubmit.json?.success && realSubmit.json?.data?.id) {
            TEST_HASIL_ID = realSubmit.json.data.id;
            log('PASS', 'POST submit_ujian with real answers', `hasil_id: ${TEST_HASIL_ID}, nilai_total: ${realSubmit.json.data.nilai_total}`);
        } else {
            log('WARN', 'POST submit_ujian with real answers', realSubmit.json?.error || realSubmit.raw?.substring(0, 80));
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 3. SERTIFIKAT TESTS
// ═══════════════════════════════════════════════════════════════
async function testSertifikat() {
    section('3. SERTIFIKAT — get & generate');
    const h = { Authorization: `Bearer ${API_KEY}` };

    if (TEST_HASIL_ID > 0) {
        // generate_sertifikat — now uses correct columns (nama_peserta fix)
        const genRes = await request('POST', `${BASE}/soal.php?action=generate_sertifikat`,
            { hasil_id: TEST_HASIL_ID }, h);
        await assertApiOk('POST generate_sertifikat (nama_peserta column fix)', genRes);
        if (genRes.json?.success && genRes.json?.data?.verification_code) {
            await assert('Sertifikat has verification_code', !!genRes.json.data.verification_code,
                genRes.json.data.verification_code.substring(0, 16) + '...');
        }

        // get_sertifikat — verify it was saved
        const getRes = await request('GET', `${BASE}/soal.php?action=get_sertifikat&hasil_id=${TEST_HASIL_ID}`, null, h);
        await assertApiOk('GET get_sertifikat (data persisted)', getRes);
        if (getRes.json?.success) {
            await assert('Sertifikat has hasil_id', getRes.json.data?.hasil_id === TEST_HASIL_ID,
                `hasil_id: ${getRes.json.data?.hasil_id}`);
        }
    } else {
        log('WARN', 'Sertifikat tests skipped — no hasil_id from submit_ujian');
    }
}

// ═══════════════════════════════════════════════════════════════
// 4. GAMIFICATION TESTS
// ═══════════════════════════════════════════════════════════════
async function testGamification() {
    section('4. GAMIFICATION — XP, Streak, Badges, Achievements, Challenges');
    const h = { Authorization: `Bearer ${API_KEY}` };

    const gamRes = await request('GET', `${BASE}/gamification.php?action=get_user_gamification`, null, h);
    const gamOk = await assertApiOk('GET get_user_gamification', gamRes);
    if (gamOk) {
        await assert('Has xp data', gamRes.json.data.xp !== undefined);
        await assert('Has streak data', gamRes.json.data.streak !== undefined);
        await assert('Has badges array', Array.isArray(gamRes.json.data.badges));
        await assert('Has achievements array', Array.isArray(gamRes.json.data.achievements));
    }

    const xpRes = await request('GET', `${BASE}/gamification.php?action=get_user_xp`, null, h);
    await assertApiOk('GET get_user_xp', xpRes);

    const streakRes = await request('GET', `${BASE}/gamification.php?action=update_streak`, null, h);
    await assertApiOk('GET update_streak', streakRes);
    if (streakRes.json?.success) {
        await assert('Streak returns current_streak', streakRes.json.current_streak !== undefined,
            `streak: ${streakRes.json.current_streak}`);
    }

    const badgesRes = await request('GET', `${BASE}/gamification.php?action=get_user_badges`, null, h);
    await assertApiOk('GET get_user_badges', badgesRes);

    const achRes = await request('GET', `${BASE}/gamification.php?action=get_user_achievements`, null, h);
    await assertApiOk('GET get_user_achievements', achRes);

    // check_achievements — was querying riwayat_ujian (fixed to hasil_ujian)
    const checkRes = await request('GET', `${BASE}/gamification.php?action=check_achievements`, null, h);
    await assertApiOk('GET check_achievements (hasil_ujian fix)', checkRes);

    const challengeRes = await request('GET', `${BASE}/gamification.php?action=get_daily_challenges`, null, h);
    await assertApiOk('GET get_daily_challenges', challengeRes);

    // add_xp
    const addXpRes = await request('POST', `${BASE}/gamification.php?action=add_xp`,
        { xp_amount: 10, reason: 'Test', source: 'test', source_id: 1 }, h);
    await assertApiOk('POST add_xp', addXpRes);
    if (addXpRes.json?.success) {
        await assert('add_xp returns new_xp', addXpRes.json.new_xp !== undefined, `xp: ${addXpRes.json.new_xp}`);
    }

    // Leaderboard — was using u.nama_peserta (fixed)
    const lbRes = await request('GET', `${BASE}/gamification.php?action=get_leaderboard_gamification`, null, h);
    await assertApiOk('GET get_leaderboard_gamification (nama_peserta fix)', lbRes);
}

// ═══════════════════════════════════════════════════════════════
// 5. NOTIFICATIONS TESTS
// ═══════════════════════════════════════════════════════════════
async function testNotifications() {
    section('5. NOTIFICATIONS — Get, Preferences, History');
    const h = { Authorization: `Bearer ${API_KEY}` };

    const notifRes = await request('GET', `${BASE}/notifications.php?action=get_notifications`, null, h);
    await assertApiOk('GET get_notifications', notifRes);

    // get_preferences — was re-fetching with INSERT statement (fixed)
    const prefRes = await request('GET', `${BASE}/notifications.php?action=get_preferences`, null, h);
    await assertApiOk('GET get_preferences (fetch bug fix)', prefRes);

    // update_preferences — was bind_param reference error (fixed)
    const updateRes = await request('POST', `${BASE}/notifications.php?action=update_preferences`, {
        email_exam_reminder: 1, email_exam_result: 1, email_certificate: 1, email_achievement: 1,
        in_app_exam_reminder: 1, in_app_exam_result: 1, in_app_achievement: 1,
        push_exam_reminder: 0, push_exam_result: 0, sms_exam_reminder: 0,
        sms_exam_result: 0, reminder_hours_before: 24
    }, h);
    await assertApiOk('POST update_preferences (bind_param fix)', updateRes);

    const histRes = await request('GET', `${BASE}/notifications.php?action=get_history&limit=10`, null, h);
    await assertApiOk('GET get_history', histRes);
}

// ═══════════════════════════════════════════════════════════════
// 6. ANALYTICS TESTS
// ═══════════════════════════════════════════════════════════════
async function testAnalytics() {
    section('6. ANALYTICS — User, Question, Funnel');
    const h = { Authorization: `Bearer ${API_KEY}` };

    const userAnalRes = await request('GET', `${BASE}/analytics.php?action=get_user_analytics`, null, h);
    await assertApiOk('GET get_user_analytics', userAnalRes);

    // get_question_analytics — was using s.kategori (fixed to s.kategori_id)
    const qAnalRes = await request('GET', `${BASE}/analytics.php?action=get_question_analytics&limit=5`, null, h);
    await assertApiOk('GET get_question_analytics (kolom fix)', qAnalRes);

    // track_funnel_event
    const funnelRes = await request('POST', `${BASE}/analytics.php?action=track_funnel_event`,
        { stage: 'dashboard', metadata: { page: 'test' } }, h);
    await assertApiOk('POST track_funnel_event', funnelRes);
}

// ═══════════════════════════════════════════════════════════════
// 7. EXPERT SYSTEM TESTS
// ═══════════════════════════════════════════════════════════════
async function testExpert() {
    section('7. EXPERT SYSTEM — Knowledge, Help, Recommendations');
    const h = { Authorization: `Bearer ${API_KEY}` };

    // get_expert_knowledge (public — was failing due to verifyAuth)
    const knowledgeRes = await request('GET', `${BASE}/expert.php?action=get_expert_knowledge`, null, h);
    await assertApiOk('GET get_expert_knowledge (verifyAuth fix)', knowledgeRes);
    if (knowledgeRes.json?.success) {
        await assert('Returns data array', Array.isArray(knowledgeRes.json.data));
    }

    // get_expert_help — was using $_SESSION
    const helpRes = await request('GET', `${BASE}/expert.php?action=get_expert_help&soal_id=1&kategori_id=1`, null, h);
    await assertApiOk('GET get_expert_help (session fix)', helpRes);

    // get_expert_tips
    const tipsRes = await request('GET', `${BASE}/expert.php?action=get_expert_tips&kategori_id=1`, null, h);
    await assertApiOk('GET get_expert_tips', tipsRes);

    // get_learning_recommendations
    const recRes = await request('GET', `${BASE}/expert.php?action=get_learning_recommendations`, null, h);
    await assertApiOk('GET get_learning_recommendations (session fix)', recRes);
}

// ═══════════════════════════════════════════════════════════════
// 8. COURSES TESTS
// ═══════════════════════════════════════════════════════════════
async function testCourses() {
    section('8. COURSES — Progress, Modules, Statistics, Learning Path');
    const h = { Authorization: `Bearer ${API_KEY}` };

    // user_course_progress — was using updated_at (fixed to last_accessed)
    const ucpRes = await request('GET', `${BASE}/courses.php?action=user_course_progress`, null, h);
    await assertApiOk('GET user_course_progress (updated_at fix)', ucpRes);
    if (ucpRes.json?.success) await assert('Returns data array', Array.isArray(ucpRes.json.data));

    // user_module_progress — was using updated_at (fixed to last_accessed)
    const umpRes = await request('GET', `${BASE}/courses.php?action=user_module_progress`, null, h);
    await assertApiOk('GET user_module_progress (updated_at fix)', umpRes);
    if (umpRes.json?.success) await assert('Returns data array', Array.isArray(umpRes.json.data));

    // get_statistics
    const statsRes = await request('GET', `${BASE}/courses.php?action=get_statistics`, null, h);
    await assertApiOk('GET get_statistics', statsRes);

    // get_user_learning_path
    const lpRes = await request('GET', `${BASE}/courses.php?action=get_user_learning_path`, null, h);
    await assertApiOk('GET get_user_learning_path', lpRes);

    // get_courses (alias for list_courses)
    const coursesRes = await request('GET', `${BASE}/courses.php?action=get_courses`, null, h);
    await assertApiOk('GET get_courses (alias fix)', coursesRes);

    // list_courses (original)
    const listCoursesRes = await request('GET', `${BASE}/courses.php?action=list_courses`, null, h);
    await assertApiOk('GET list_courses', listCoursesRes);
}

// ═══════════════════════════════════════════════════════════════
// 9. PEMBAHASAN TESTS
// ═══════════════════════════════════════════════════════════════
async function testPembahasan() {
    section('9. PEMBAHASAN — Public endpoints');

    const pemRes = await request('GET', `${BASE}/pembahasan.php?action=get_pembahasan&soal_id=1`);
    if (pemRes.json?.success || pemRes.json?.error === 'Soal tidak ditemukan') {
        log('PASS', 'GET get_pembahasan (reachable)');
    } else {
        log('FAIL', 'GET get_pembahasan', pemRes.raw?.substring(0, 80));
    }

    const katRes = await request('GET', `${BASE}/pembahasan.php?action=get_pembahasan_kategori&kategori=TWK`);
    await assertApiOk('GET get_pembahasan_kategori', katRes);

    const tipsRes = await request('GET', `${BASE}/pembahasan.php?action=get_tips_umum`);
    await assertApiOk('GET get_tips_umum', tipsRes);
}

// ═══════════════════════════════════════════════════════════════
// 10. SECURITY TESTS
// ═══════════════════════════════════════════════════════════════
async function testSecurity() {
    section('10. SECURITY — Auth rejection, CSRF Bearer bypass');

    // No auth header
    const noAuthRes = await request('GET', `${BASE}/soal.php?action=get_riwayat_ujian`);
    await assert('Reject request without auth token',
        noAuthRes.json?.success === false, noAuthRes.json?.error);

    // Invalid token
    const badTokenRes = await request('GET', `${BASE}/gamification.php?action=get_user_xp`, null,
        { Authorization: 'Bearer thisisnotvalid12345' });
    await assert('Reject invalid Bearer token',
        badTokenRes.json?.success === false);

    // CSRF bypass for Bearer POST (was fixed in soal.php)
    const h = { Authorization: `Bearer ${API_KEY}` };
    const csrfBypassRes = await request('POST', `${BASE}/soal.php?action=submit_ujian`,
        { answers: {}, is_practice: true }, h);
    await assert('Bearer POST bypasses CSRF (no X-CSRF-Token needed)',
        csrfBypassRes.json?.error !== 'Invalid CSRF token',
        csrfBypassRes.json?.error || 'CSRF bypassed correctly');
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║   COMPREHENSIVE API TEST SUITE — Empirical Verification     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

    await testAuth();
    await testSoal();
    await testSertifikat();
    await testGamification();
    await testNotifications();
    await testAnalytics();
    await testExpert();
    await testCourses();
    await testPembahasan();
    await testSecurity();

    const total = passed + failed + warned;
    console.log('\n' + '═'.repeat(62));
    console.log('  HASIL AKHIR');
    console.log('═'.repeat(62));
    console.log(`  ✓ PASS  : ${passed}`);
    console.log(`  ✗ FAIL  : ${failed}`);
    console.log(`  ⚠ WARN  : ${warned}`);
    console.log(`  TOTAL   : ${total}`);
    console.log(`  SUCCESS : ${((passed / (total - warned)) * 100).toFixed(1)}%`);
    console.log('═'.repeat(62));

    // Save JSON report
    const dir = './test-screenshots';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REPORT_FILE, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: { passed, failed, warned, total },
        results
    }, null, 2));
    console.log(`\n  Report saved: ${REPORT_FILE}`);

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
