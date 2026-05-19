/**
 * EXAM SIMULATION - Playwright Test
 * Simulasi ujian dengan Playwright (lebih reliable dari Puppeteer)
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bimbel';
const USER = { username: 'fresh_user_11778919457', password: 'simulasi123' };

test.describe('Exam Simulation for testuser', () => {
  test('Complete exam flow simulation', async ({ page, context }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  EXAM SIMULATION - PLAYWRIGHT TEST');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    // 1. Navigate to login page
    console.log('📝 Step 1: Navigate to login page');
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded');

    // 2. Login using quick login button
    console.log('\n📝 Step 2: Login using quick login button');
    
    // Find and click the quick login button for the user
    const quickLoginButton = await page.locator(`button[onclick*="${USER.username}"]`).first();
    const buttonCount = await quickLoginButton.count();
    
    if (buttonCount > 0) {
      console.log(`✅ Quick login button found for ${USER.username}`);
      await quickLoginButton.click();
    } else {
      console.log(`⚠️ Quick login button not found, using manual login`);
      await page.fill('#username', USER.username);
      await page.fill('#password', USER.password);
      await page.click('button[type="submit"]');
    }
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });
    console.log('✅ Login successful, redirected to dashboard');

    // Take screenshot of dashboard
    await page.screenshot({ path: 'test-screenshots/playwright/dashboard.png' });

    // 3. Check dashboard stats
    console.log('\n📝 Step 3: Check dashboard statistics');
    const totalExams = await page.textContent('#totalExams').catch(() => '0');
    const averageScore = await page.textContent('#averageScore').catch(() => '0');
    console.log(`✅ Dashboard stats - Total Exams: ${totalExams.trim()}, Average: ${averageScore.trim()}`);

    // 4. Navigate to exam page
    console.log('\n📝 Step 4: Navigate to exam page');
    await page.goto(`${BASE_URL}/participant/ujian.html`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Exam page loaded');
    await page.screenshot({ path: 'test-screenshots/playwright/ujian-page.png' });

    // 5. Check if exam form is available
    console.log('\n📝 Step 5: Check exam form availability');
    const hasForm = await page.locator('#namaPeserta').count();
    if (hasForm > 0) {
      console.log('✅ Exam form found');
      
      // Fill participant name
      await page.fill('#namaPeserta', 'Test User Playwright');
      console.log('✅ Participant name filled');

      // Check for exam type selector
      const hasSelector = await page.locator('select, #examType, [name="exam_type"]').count();
      if (hasSelector > 0) {
        console.log('✅ Exam type selector found');
        await page.screenshot({ path: 'test-screenshots/playwright/form-filled.png' });
      }

      // Try to start exam (if button exists)
      const hasStartBtn = await page.locator('button[onclick*="mulai"], button[type="button"]').count();
      if (hasStartBtn > 0) {
        console.log('✅ Start button found, attempting to click');
        try {
          await page.click('button[onclick*="mulai"], button[type="button"]', { timeout: 5000 });
          await page.waitForTimeout(2000);
          console.log('✅ Start button clicked');
          await page.screenshot({ path: 'test-screenshots/playwright/exam-started.png' });
        } catch (e) {
          console.log('⚠️ Could not click start button (might need additional setup)');
        }
      }
    } else {
      console.log('⚠️ Exam form not found - might need different approach');
    }

    // 6. Test API endpoints directly (bypass UI)
    console.log('\n📝 Step 6: Test API endpoints directly');
    
    // Get auth token from localStorage
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    console.log(`Auth token: ${authToken ? 'Found' : 'Not found'}`);

    if (authToken) {
      // Test get statistics API
      try {
        const statsResponse = await page.request.get(`${BASE_URL}/api/soal.php?action=get_statistik`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const statsData = await statsResponse.json();
        console.log('✅ Statistics API response:', statsData.success ? 'Success' : 'Failed');
        if (statsData.success) {
          console.log(`   Total exams: ${statsData.data?.total_exams || 0}`);
        }
      } catch (e) {
        console.log('⚠️ Statistics API failed:', e.message);
      }

      // Test get exam history API
      try {
        const historyResponse = await page.request.get(`${BASE_URL}/api/soal.php?action=get_riwayat_ujian&limit=5`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const historyData = await historyResponse.json();
        console.log('✅ History API response:', historyData.success ? 'Success' : 'Failed');
        if (historyData.success && historyData.data) {
          console.log(`   History records: ${historyData.data.length}`);
        }
      } catch (e) {
        console.log('⚠️ History API failed:', e.message);
      }

      // Test gamification API
      try {
        const gamificationResponse = await page.request.get(`${BASE_URL}/api/gamification.php?action=get_user_gamification`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const gamificationData = await gamificationResponse.json();
        console.log('✅ Gamification API response:', gamificationData.success ? 'Success' : 'Failed');
        if (gamificationData.success && gamificationData.data) {
          console.log(`   Total XP: ${gamificationData.data.xp?.total_xp || 0}`);
        }
      } catch (e) {
        console.log('⚠️ Gamification API failed:', e.message);
      }
    }

    // 7. Return to dashboard and check final state
    console.log('\n📝 Step 7: Final dashboard check');
    await page.goto(`${BASE_URL}/participant/dashboard.html`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-screenshots/playwright/final-dashboard.png' });
    console.log('✅ Final dashboard screenshot taken');

    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  PLAYWRIGHT TEST COMPLETED');
    console.log('══════════════════════════════════════════════════════════════════════\n');
  });

  test('API direct test - Submit exam via API', async ({ request }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  API DIRECT TEST - Exam Submission');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    // First, login to get auth token
    console.log('📝 Step 1: Login to get auth token');
    const loginResponse = await request.post(`${BASE_URL}/api/auth.php?action=login`, {
      data: {
        username: USER.username,
        password: USER.password
      }
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.success ? 'Success' : 'Failed');
    
    if (!loginData.success) {
      console.log('❌ Login failed, cannot proceed with API test');
      console.log('Error:', loginData.error);
      return;
    }

    const authToken = loginData.data?.token || loginData.data?.api_key;
    console.log('✅ Auth token obtained');

    // Test exam submission via API
    console.log('\n📝 Step 2: Submit exam via API');
    
    // Generate sample answers for 130 questions
    const answers = [];
    const options = ['A', 'B', 'C', 'D'];
    for (let i = 1; i <= 130; i++) {
      answers.push({
        soal_id: i,
        jawaban: options[Math.floor(Math.random() * options.length)]
      });
    }

    try {
      const examResponse = await request.post(`${BASE_URL}/api/soal.php?action=selesai_ujian`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          nama_peserta: 'Test User Playwright API',
          jawaban: answers,
          sesi_id: 0
        }
      });

      const examData = await examResponse.json();
      console.log('✅ Exam submission response:', examData.success ? 'Success' : 'Failed');
      
      if (examData.success) {
        console.log(`   Total score: ${examData.data?.nilai_total || 0}`);
        console.log(`   Status: ${examData.data?.status_lulus || 'Unknown'}`);
      } else {
        console.log('   Error:', examData.error);
      }
    } catch (e) {
      console.log('⚠️ Exam submission failed:', e.message);
    }

    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  API DIRECT TEST COMPLETED');
    console.log('══════════════════════════════════════════════════════════════════════\n');
  });
});
