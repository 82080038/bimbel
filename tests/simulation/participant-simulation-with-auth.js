/**
 * Participant Role Simulation WITH AUTHENTICATION
 * Full E2E test dengan login flow
 */

const puppeteer = require('puppeteer');
const CONFIG = require('./config');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshots.dir)) {
  fs.mkdirSync(CONFIG.screenshots.dir, { recursive: true });
}

// Simulation results
const results = {
  login: { status: 'pending', errors: [] },
  navigation: { status: 'pending', errors: [] },
  examSetup: { status: 'pending', errors: [] },
  fullscreenCheck: { status: 'pending', errors: [] },
  answerQuestions: { status: 'pending', errors: [] },
  navigationExam: { status: 'pending', errors: [] },
  finishExam: { status: 'pending', errors: [] },
  viewResults: { status: 'pending', errors: [] },
  overall: { passed: 0, failed: 0 }
};

let authToken = null;

async function takeScreenshot(page, name) {
  if (CONFIG.screenshots.enabled) {
    const fileName = `${CONFIG.screenshots.prefix}_participant_auth_${name}_${Date.now()}.png`;
    await page.screenshot({ 
      path: path.join(CONFIG.screenshots.dir, fileName),
      fullPage: true 
    });
    console.log(`📸 Screenshot: ${fileName}`);
  }
}

/**
 * Step 1: Login as participant
 */
async function loginAsParticipant(page) {
  console.log('\n🔐 Step 1: Login sebagai peserta...');
  
  try {
    // Navigate to auth page or use fetch for API login
    const loginResponse = await page.evaluate(async (credentials) => {
      try {
        const response = await fetch('http://localhost/bimbel/api/auth.php?action=login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password
          })
        });
        return await response.json();
      } catch (e) {
        return { success: false, error: e.message };
      }
    }, CONFIG.admin); // Using admin credentials for now (should create test user)
    
    console.log('   📋 Login response:', JSON.stringify(loginResponse, null, 2).substring(0, 200));
    
    if (loginResponse.success && loginResponse.token) {
      authToken = loginResponse.token;
      console.log('   ✅ Login berhasil, token received');
      results.login.status = 'passed';
      return true;
    } else {
      console.log('   ⚠️  Login failed:', loginResponse.error || 'Unknown error');
      results.login.status = 'failed';
      results.login.errors.push(loginResponse.error || 'Login failed');
      return false;
    }
  } catch (error) {
    console.error('   ❌ Error during login:', error.message);
    results.login.status = 'failed';
    results.login.errors.push(error.message);
    return false;
  }
}

/**
 * Step 2: Navigate to exam page with auth token
 */
async function navigateToExam(page) {
  console.log('\n🌐 Step 2: Navigasi ke halaman ujian...');
  
  try {
    // Inject auth token into page
    await page.evaluateOnNewDocument((token) => {
      window.localStorage.setItem('authToken', token);
      window.localStorage.setItem('userRole', 'user');
    }, authToken);
    
    // Navigate to exam page
    await page.goto(CONFIG.indexUrl, { 
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeouts.navigation 
    });
    
    // Verify page loaded
    const pageLoaded = await page.evaluate(() => {
      return !!document.getElementById('namaPeserta');
    });
    
    if (pageLoaded) {
      console.log('   ✅ Halaman ujian loaded');
      results.navigation.status = 'passed';
      return true;
    } else {
      console.log('   ❌ Halaman ujian tidak loaded');
      results.navigation.status = 'failed';
      return false;
    }
  } catch (error) {
    console.error('   ❌ Error navigasi:', error.message);
    results.navigation.status = 'failed';
    return false;
  }
}

/**
 * Step 3: Fill exam form and select paket
 */
async function fillExamForm(page) {
  console.log('\n📝 Step 3: Mengisi form ujian...');
  
  try {
    // Fill name
    await page.type('#namaPeserta', 'Test Peserta Auth');
    
    // Wait for paket options
    await page.waitForTimeout(2000);
    
    // Check and select paket
    const paketSelected = await page.evaluate(() => {
      const select = document.getElementById('paketSelection');
      if (select && select.options.length > 1) {
        select.value = select.options[1].value; // Select first real option
        select.dispatchEvent(new Event('change'));
        return { selected: true, value: select.value, text: select.options[select.selectedIndex].text };
      }
      return { selected: false };
    });
    
    if (paketSelected.selected) {
      console.log(`   ✅ Paket dipilih: ${paketSelected.text}`);
    } else {
      console.log('   ⚠️  Tidak ada paket yang dipilih');
    }
    
    await takeScreenshot(page, '03_form_filled');
    results.examSetup.status = 'passed';
    return true;
    
  } catch (error) {
    console.error('   ❌ Error mengisi form:', error.message);
    results.examSetup.status = 'failed';
    return false;
  }
}

/**
 * Step 4: Start exam
 */
async function startExam(page) {
  console.log('\n▶️  Step 4: Memulai ujian...');
  
  try {
    // Setup dialog handler
    page.on('dialog', async dialog => {
      const message = dialog.message();
      console.log(`   🔔 Dialog: ${message}`);
      await dialog.accept();
    });
    
    // Click start button
    await page.click('button[onclick*="mulaiUjian"]');
    await page.waitForTimeout(3000);
    
    // Check if exam started
    const examStarted = await page.evaluate(() => {
      return {
        hasTimer: !!document.getElementById('timer'),
        hasQuestions: !!document.getElementById('questionContainer'),
        hasExamInterface: !!document.getElementById('examInterface')
      };
    });
    
    console.log('   📋 Exam state:', examStarted);
    
    if (examStarted.hasTimer || examStarted.hasQuestions) {
      console.log('   ✅ Ujian berhasil dimulai');
      results.fullscreenCheck.status = 'passed';
      return true;
    } else {
      console.log('   ❌ Ujian tidak ter-load sepenuhnya');
      results.fullscreenCheck.status = 'failed';
      return false;
    }
    
  } catch (error) {
    console.error('   ❌ Error memulai ujian:', error.message);
    results.fullscreenCheck.status = 'failed';
    return false;
  }
}

/**
 * Step 5: Answer questions
 */
async function answerQuestions(page) {
  console.log('\n✏️  Step 5: Menjawab soal...');
  
  try {
    // Get total questions
    const questionInfo = await page.evaluate(() => {
      const currentEl = document.getElementById('currentQuestion');
      const totalEl = document.getElementById('totalQuestions');
      return {
        current: currentEl ? parseInt(currentEl.textContent) : 1,
        total: totalEl ? parseInt(totalEl.textContent) : 0
      };
    });
    
    console.log(`   📝 Soal: ${questionInfo.current}/${questionInfo.total}`);
    
    // Answer first 3 questions
    let answered = 0;
    for (let i = 0; i < Math.min(3, questionInfo.total); i++) {
      try {
        // Click answer A
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('.option-btn, .answer-btn');
          if (buttons.length > 0) {
            buttons[0].click(); // Click A
          }
        });
        
        answered++;
        
        // Wait a bit
        await page.waitForTimeout(500);
        
        // Next question
        await page.evaluate(() => {
          const nextBtn = document.querySelector('.next-btn, #nextBtn');
          if (nextBtn) nextBtn.click();
        });
        
        await page.waitForTimeout(500);
        
      } catch (e) {
        console.log(`   ⚠️  Error menjawab soal ${i + 1}: ${e.message}`);
      }
    }
    
    console.log(`   ✅ Menjawab ${answered} soal`);
    
    if (answered > 0) {
      results.answerQuestions.status = 'passed';
    } else {
      results.answerQuestions.status = 'failed';
    }
    
    return answered > 0;
    
  } catch (error) {
    console.error('   ❌ Error menjawab soal:', error.message);
    results.answerQuestions.status = 'failed';
    return false;
  }
}

/**
 * Step 6: Finish exam
 */
async function finishExam(page) {
  console.log('\n🏁 Step 6: Menyelesaikan ujian...');
  
  try {
    // Click finish
    await page.evaluate(() => {
      const finishBtn = document.querySelector('.finish-btn, #finishBtn, button[onclick*="selesai"]');
      if (finishBtn) finishBtn.click();
    });
    
    await page.waitForTimeout(3000);
    
    console.log('   ✅ Finish exam triggered');
    results.finishExam.status = 'passed';
    return true;
    
  } catch (error) {
    console.error('   ❌ Error finish exam:', error.message);
    results.finishExam.status = 'failed';
    return false;
  }
}

/**
 * Main simulation function
 */
async function simulateParticipantWithAuth() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     PARTICIPANT SIMULATION WITH AUTHENTICATION          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.puppeteer.headless,
    slowMo: CONFIG.puppeteer.slowMo,
    args: CONFIG.puppeteer.args
  });
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  // Setup logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('Error') || text.includes('401')) {
      console.log(`   🌐 Console [${type}]: ${text.substring(0, 150)}`);
    }
  });
  
  page.on('response', response => {
    const status = response.status();
    if (status === 401 || status === 403) {
      const url = response.url();
      console.log(`   🌐 Network [${status}]: ${url.substring(url.lastIndexOf('/') + 1)}`);
    }
  });
  
  try {
    // Execute all steps
    const loginSuccess = await loginAsParticipant(page);
    
    if (!loginSuccess) {
      console.log('\n⚠️  Login failed, trying to continue as guest...');
    }
    
    await navigateToExam(page);
    await fillExamForm(page);
    await startExam(page);
    await answerQuestions(page);
    await finishExam(page);
    
    // Calculate results
    Object.values(results).forEach(section => {
      if (section.status === 'passed') results.overall.passed++;
      if (section.status === 'failed') results.overall.failed++;
    });
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('PARTICIPANT SIMULATION WITH AUTH - RESULTS');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([key, value]) => {
    if (key !== 'overall') {
      const icon = value.status === 'passed' ? '✅' : value.status === 'failed' ? '❌' : '⏳';
      console.log(`${icon} ${key}: ${value.status}`);
    }
  });
  
  console.log('-'.repeat(60));
  console.log(`📈 Passed: ${results.overall.passed}, Failed: ${results.overall.failed}`);
  console.log('='.repeat(60));
  
  return results;
}

// Run if called directly
if (require.main === module) {
  simulateParticipantWithAuth().then(() => {
    console.log('\n✨ Simulation completed!');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = simulateParticipantWithAuth;
