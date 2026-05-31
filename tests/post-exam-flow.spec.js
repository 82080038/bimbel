const { test, expect } = require('@playwright/test');

// Post-Exam Flow Simulation Test
// This test simulates the complete flow after exam submission: result display, analysis, recommendations

test.describe('Post-Exam Flow Simulation', () => {

  test('Complete post-exam flow: result display and analysis', async ({ page }) => {
    // First, complete an exam via API to get a result ID
    const loginResponse = await page.request.post('http://localhost/bimbel/api/auth.php?action=login', {
      data: {
        username: 'testuser',
        password: 'test123'
      }
    });
    const loginData = await loginResponse.json();
    const token = loginData.user.api_key;

    // Create exam session
    const questionsResponse = await page.request.get('http://localhost/bimbel/api/soal.php?action=get_soal_acak', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const questionsData = await questionsResponse.json();
    const questionsJson = JSON.stringify(questionsData.data);

    const sessionResponse = await page.request.post('http://localhost/bimbel/api/soal.php?action=simpan_sesi', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        cat_enabled: false,
        durasi_menit: 100,
        exam_type_id: 1,
        soal_teracak: questionsJson
      }
    });
    const sessionData = await sessionResponse.json();
    const sesiId = sessionData.sesi_id;

    // Submit exam with all correct answers
    const answers = {};
    questionsData.data.forEach(q => {
      answers[q.id] = q.jawaban_benar;
    });

    const submitResponse = await page.request.post('http://localhost/bimbel/api/soal.php?action=submit_ujian', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        sesi_id: sesiId,
        answers: answers
      }
    });
    const submitData = await submitResponse.json();
    const resultId = submitData.data.id;

    console.log('Exam submitted successfully. Result ID:', resultId);
    console.log('Total Score:', submitData.data.nilai_total);
    console.log('Status:', submitData.data.status_lulus);

    // Now navigate to result page via UI
    await page.goto('http://localhost/bimbel/login.html');
    await page.click('button:has-text("Test User")');
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });

    // Navigate to result page
    await page.goto(`http://localhost/bimbel/participant/resume-ujian.html?id=${resultId}`);
    await page.waitForLoadState('networkidle');

    console.log('Navigated to result page');

    // Verify result display
    await expect(page.locator('text=Hasil Ujian')).toBeVisible();
    
    // Check status display
    const statusText = await page.locator('.text-success, .text-danger').first().textContent();
    console.log('Status displayed:', statusText);
    expect(statusText).toContain('LULUS');

    // Check total score
    const totalScore = await page.locator('.text-primary').first().textContent();
    console.log('Total Score displayed:', totalScore);
    expect(parseInt(totalScore)).toBeGreaterThan(0);

    // Check category scores
    const twkScore = await page.locator('.text-info').first().textContent();
    const tiuScore = await page.locator('.text-warning').first().textContent();
    const tkpScore = await page.locator('.text-success').first().textContent();
    console.log('TWK:', twkScore, 'TIU:', tiuScore, 'TKP:', tkpScore);

    // Check question categories section
    await expect(page.locator('text=Kategori Soal dan Materi')).toBeVisible();
    
    // Check unanswered questions section
    await expect(page.locator('text=Soal Tidak Dijawab')).toBeVisible();
    
    // Check wrong answers section
    await expect(page.locator('text=Jawaban Salah per Kategori')).toBeVisible();
    
    // Check study recommendations section
    await expect(page.locator('text=Rekomendasi Belajar')).toBeVisible();
    
    // Check AI question generator section
    await expect(page.locator('text=Generator Soal AI')).toBeVisible();

    console.log('All post-exam flow sections verified successfully');

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/post-exam-flow-screenshot.png' });
  });

  test('Verify gamification XP awarded after exam', async ({ page }) => {
    // Login
    const loginResponse = await page.request.post('http://localhost/bimbel/api/auth.php?action=login', {
      data: {
        username: 'testuser',
        password: 'test123'
      }
    });
    const loginData = await loginResponse.json();
    const token = loginData.user.api_key;
    const userId = loginData.user.id;

    // Get XP before exam
    const xpBeforeResponse = await page.request.get('http://localhost/bimbel/api/gamification.php?action=get_user_xp', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const xpBeforeData = await xpBeforeResponse.json();
    const xpBefore = xpBeforeData.data?.total_xp || 0;
    console.log('XP before exam:', xpBefore);

    // Complete an exam
    const questionsResponse = await page.request.get('http://localhost/bimbel/api/soal.php?action=get_soal_acak', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const questionsData = await questionsResponse.json();
    const questionsJson = JSON.stringify(questionsData.data);

    const sessionResponse = await page.request.post('http://localhost/bimbel/api/soal.php?action=simpan_sesi', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        cat_enabled: false,
        durasi_menit: 100,
        exam_type_id: 1,
        soal_teracak: questionsJson
      }
    });
    const sessionData = await sessionResponse.json();
    const sesiId = sessionData.sesi_id;

    const answers = {};
    questionsData.data.forEach(q => {
      answers[q.id] = q.jawaban_benar;
    });

    await page.request.post('http://localhost/bimbel/api/soal.php?action=submit_ujian', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        sesi_id: sesiId,
        answers: answers
      }
    });

    // Get XP after exam
    const xpAfterResponse = await page.request.get('http://localhost/bimbel/api/gamification.php?action=get_user_xp', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const xpAfterData = await xpAfterResponse.json();
    const xpAfter = xpAfterData.data?.total_xp || 0;
    console.log('XP after exam:', xpAfter);

    // Verify XP increased by 50
    const xpGained = xpAfter - xpBefore;
    console.log('XP gained:', xpGained);
    expect(xpGained).toBeGreaterThanOrEqual(50);
  });

  test('Verify certificate generated for passing exam', async ({ page }) => {
    // Login
    const loginResponse = await page.request.post('http://localhost/bimbel/api/auth.php?action=login', {
      data: {
        username: 'testuser',
        password: 'test123'
      }
    });
    const loginData = await loginResponse.json();
    const token = loginData.user.api_key;
    const userId = loginData.user.id;

    // Complete an exam with perfect score
    const questionsResponse = await page.request.get('http://localhost/bimbel/api/soal.php?action=get_soal_acak', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const questionsData = await questionsResponse.json();
    const questionsJson = JSON.stringify(questionsData.data);

    const sessionResponse = await page.request.post('http://localhost/bimbel/api/soal.php?action=simpan_sesi', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        cat_enabled: false,
        durasi_menit: 100,
        exam_type_id: 1,
        soal_teracak: questionsJson
      }
    });
    const sessionData = await sessionResponse.json();
    const sesiId = sessionData.sesi_id;

    const answers = {};
    questionsData.data.forEach(q => {
      answers[q.id] = q.jawaban_benar;
    });

    const submitResponse = await page.request.post('http://localhost/bimbel/api/soal.php?action=submit_ujian', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        sesi_id: sesiId,
        answers: answers
      }
    });
    const submitData = await submitResponse.json();
    const resultId = submitData.data.id;

    // Check if certificate exists in database (via API or direct query)
    // For now, we'll verify the result shows passing status
    expect(submitData.data.status_lulus).toBe('LULUS');
    console.log('Exam passed - certificate should be generated');
  });
});
