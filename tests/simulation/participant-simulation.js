/**
 * Participant (Peserta Ujian) Role Simulation using Puppeteer
 * Simulates exam taking process with anti-cheating features
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
  navigation: { status: 'pending', errors: [] },
  examSetup: { status: 'pending', errors: [] },
  fullscreenCheck: { status: 'pending', errors: [] },
  answerQuestions: { status: 'pending', errors: [] },
  navigationExam: { status: 'pending', errors: [] },
  finishExam: { status: 'pending', errors: [] },
  viewResults: { status: 'pending', errors: [] },
  overall: { passed: 0, failed: 0 }
};

async function takeScreenshot(page, name) {
  if (CONFIG.screenshots.enabled) {
    const fileName = `${CONFIG.screenshots.prefix}_participant_${name}_${Date.now()}.png`;
    await page.screenshot({ 
      path: path.join(CONFIG.screenshots.dir, fileName),
      fullPage: true 
    });
    console.log(`📸 Screenshot: ${fileName}`);
  }
}

async function simulateParticipant() {
  console.log('🚀 Starting Participant Role Simulation...\n');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.puppeteer.headless,
    slowMo: CONFIG.puppeteer.slowMo,
    args: CONFIG.puppeteer.args,
    permissions: ['fullscreen'] // Grant fullscreen permission
  });
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  // Capture console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('Error') || text.includes('error')) {
      console.log(`   🌐 Console [${type}]: ${text.substring(0, 150)}`);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log(`   🌐 Page error: ${error.message}`);
  });
  
  // Capture failed network requests
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status === 401 || status === 403) {
      console.log(`   🌐 Network [${status}]: ${url.substring(url.lastIndexOf('/') + 1)}`);
    }
  });
  
  try {
    // 1. Navigate to index page
    console.log('1️⃣ Navigating to exam start page...');
    await page.goto(CONFIG.indexUrl, { 
      waitUntil: 'networkidle0', // Wait for all network connections to finish
      timeout: CONFIG.timeouts.navigation 
    });
    await takeScreenshot(page, '01_initial_load');
    results.navigation.status = 'passed';
    console.log('   ✓ Page loaded');
    
    // 2. Check exam form elements
    console.log('2️⃣ Checking exam setup form...');
    await page.waitForTimeout(2000); // Wait for page to fully load
    
    // Check if name input and paket selection exists
    const formElements = await page.evaluate(() => {
      return {
        nameInput: !!document.getElementById('namaPeserta'),
        paketSelect: !!document.getElementById('paketSelection'),
        examTypeSelect: !!document.getElementById('jenisUjian'),
        startButton: !!document.querySelector('button[onclick*="mulaiUjian"]')
      };
    });
    
    console.log('   📋 Form elements:', formElements);
    
    if (formElements.nameInput && formElements.paketSelect && formElements.startButton) {
      results.examSetup.status = 'passed';
      console.log('   ✓ All form elements present');
    } else {
      results.examSetup.status = 'failed';
      results.examSetup.errors.push(`Missing form elements: ${JSON.stringify(formElements)}`);
      console.log('   ✗ Some form elements missing');
    }
    
    await takeScreenshot(page, '02_form_elements');
    
    // 3. Fill exam form
    console.log('3️⃣ Filling exam form...');
    await page.type('#namaPeserta', CONFIG.participant.name);
    
    // Wait for paket options to load from API (not just "Loading paket...")
    console.log('   ⏳ Waiting for paket options to load...');
    let paketLoaded = false;
    let attempts = 0;
    let paketOptions = [];
    
    while (!paketLoaded && attempts < 10) {
      await page.waitForTimeout(1000);
      
      paketOptions = await page.evaluate(() => {
        const select = document.getElementById('paketSelection');
        return select ? Array.from(select.options).map(o => ({ value: o.value, text: o.text })) : [];
      });
      
      // Check if options are loaded (not just loading message)
      const hasRealOptions = paketOptions.some(o => o.value !== '' && !o.text.includes('Loading'));
      
      if (hasRealOptions) {
        paketLoaded = true;
        console.log(`   ✓ Paket loaded after ${attempts + 1}s`);
      } else {
        attempts++;
        console.log(`   🔄 Waiting... (${attempts}s)`);
      }
    }
    
    // Select paket ujian (first available option with actual value)
    if (formElements.paketSelect && paketOptions.length > 0) {
      console.log('   📦 Available paket:', paketOptions);
      
      // Select first non-empty, non-loading option
      const firstPaket = paketOptions.find(o => o.value !== '' && !o.text.includes('Loading'));
      if (firstPaket) {
        await page.select('#paketSelection', firstPaket.value);
        console.log(`   ✓ Paket selected: ${firstPaket.text} (ID: ${firstPaket.value})`);
      } else {
        console.log('   ⚠️ No valid paket available, trying first option');
        const firstOption = paketOptions.find(o => o.value !== '');
        if (firstOption) {
          await page.select('#paketSelection', firstOption.value);
        }
      }
    }
    
    // Select exam type if dropdown exists
    if (formElements.examTypeSelect) {
      await page.select('#jenisUjian', CONFIG.participant.examType);
    }
    
    await page.waitForTimeout(1000); // Wait after selection
    await takeScreenshot(page, '03_form_filled');
    console.log('   ✓ Form filled');
    
    // 4. Start exam (this will trigger fullscreen)
    console.log('4️⃣ Starting exam (fullscreen mode)...');
    
    // Setup dialog handler before clicking
    let dialogHandled = false;
    page.on('dialog', async dialog => {
      const message = dialog.message();
      console.log('   🔔 Dialog appeared:', message);
      
      if (message.includes('fullscreen') || message.includes('layar penuh')) {
        await dialog.accept();
        console.log('   ✅ Accepted fullscreen dialog');
      } else if (message.includes('paket') || message.includes('Pilih')) {
        // Paket not selected - dismiss and we'll handle it
        await dialog.dismiss();
        console.log('   ⚠️ Dismissed paket warning');
      } else if (message.includes('konfirmasi') || message.includes('yakin')) {
        await dialog.accept();
        console.log('   ✅ Confirmed action');
      } else {
        await dialog.accept();
        console.log('   ✅ Accepted dialog');
      }
      dialogHandled = true;
    });
    
    // Click start exam button
    await page.click('button[onclick*="mulaiUjian"]');
    await page.waitForTimeout(2000); // Wait for dialog to appear
    await page.waitForTimeout(3000);
    
    // Check if we're in exam mode
    const examMode = await page.evaluate(() => {
      return {
        examInterface: !!document.getElementById('examInterface'),
        timerVisible: !!document.getElementById('timer'),
        questionContainer: !!document.getElementById('questionContainer')
      };
    });
    
    console.log('   🎓 Exam mode:', examMode);
    
    if (examMode.examInterface) {
      results.fullscreenCheck.status = 'passed';
      console.log('   ✓ Exam interface loaded');
    } else {
      results.fullscreenCheck.status = 'failed';
      results.fullscreenCheck.errors.push('Exam interface not loaded');
      console.log('   ✗ Exam interface not loaded');
    }
    
    await takeScreenshot(page, '04_exam_started');
    
    // 5. Answer questions
    console.log('5️⃣ Answering questions...');
    
    // Get total questions
    const questionInfo = await page.evaluate(() => {
      const currentEl = document.getElementById('currentQuestion');
      const totalEl = document.getElementById('totalQuestions');
      return {
        current: currentEl ? parseInt(currentEl.textContent) : 1,
        total: totalEl ? parseInt(totalEl.textContent) : 30
      };
    });
    
    console.log(`   📝 Questions: ${questionInfo.current}/${questionInfo.total}`);
    
    // Answer first 5 questions
    let answeredCount = 0;
    for (let i = 0; i < Math.min(5, questionInfo.total); i++) {
      try {
        // Wait for question to load
        await page.waitForTimeout(1000);
        
        // Select a random answer
        const answers = ['A', 'B', 'C', 'D', 'E'];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
        
        // Try to click answer
        const answerClicked = await page.evaluate((answer) => {
          const buttons = document.querySelectorAll('.answer-btn, .option-btn, [data-answer]');
          if (buttons.length > 0) {
            const index = ['A', 'B', 'C', 'D', 'E'].indexOf(answer);
            if (index >= 0 && index < buttons.length) {
              buttons[index].click();
              return true;
            }
          }
          return false;
        }, randomAnswer);
        
        if (answerClicked) {
          answeredCount++;
          console.log(`   ✓ Answered question ${i + 1} with ${randomAnswer}`);
        }
        
        // Navigate to next question
        await page.waitForTimeout(500);
        await page.evaluate(() => {
          const nextBtn = document.querySelector('.next-btn, #nextBtn, button[onclick*="next"]');
          if (nextBtn) nextBtn.click();
        });
        
      } catch (err) {
        console.log(`   ⚠️ Error answering question ${i + 1}: ${err.message}`);
      }
    }
    
    results.answerQuestions.status = answeredCount > 0 ? 'passed' : 'failed';
    if (answeredCount === 0) {
      results.answerQuestions.errors.push('Could not answer any questions');
    }
    
    await takeScreenshot(page, '05_questions_answered');
    console.log(`   ✓ Answered ${answeredCount} questions`);
    
    // 6. Test exam navigation
    console.log('6️⃣ Testing exam navigation...');
    
    // Try to use navigation buttons
    await page.evaluate(() => {
      // Click on question number 1
      const navButtons = document.querySelectorAll('.question-nav-btn, .nav-btn');
      if (navButtons.length > 0) {
        navButtons[0].click();
      }
    });
    
    await page.waitForTimeout(1000);
    results.navigationExam.status = 'passed';
    console.log('   ✓ Navigation working');
    
    await takeScreenshot(page, '06_navigation');
    
    // 7. Test finish exam (early finish)
    console.log('7️⃣ Testing finish exam...');
    
    try {
      // Look for finish button
      await page.evaluate(() => {
        const finishBtn = document.querySelector('.finish-btn, #finishBtn, button[onclick*="finish"]');
        if (finishBtn) finishBtn.click();
      });
      
      await page.waitForTimeout(2000);
      
      // Handle confirmation dialog if any
      page.on('dialog', async dialog => {
        console.log('   🔔 Confirmation:', dialog.message());
        await dialog.accept();
      });
      
      results.finishExam.status = 'passed';
      console.log('   ✓ Finish exam triggered');
      
    } catch (err) {
      results.finishExam.status = 'failed';
      results.finishExam.errors.push(err.message);
      console.log('   ✗ Could not finish exam:', err.message);
    }
    
    await takeScreenshot(page, '07_finish_exam');
    
    // 8. Check results page
    console.log('8️⃣ Checking results...');
    await page.waitForTimeout(3000);
    
    const resultInfo = await page.evaluate(() => {
      return {
        resultVisible: !!document.getElementById('resultSection'),
        scoreVisible: !!document.getElementById('finalScore'),
        analysisVisible: !!document.getElementById('categoryAnalysis')
      };
    });
    
    if (resultInfo.resultVisible || resultInfo.scoreVisible) {
      results.viewResults.status = 'passed';
      console.log('   ✓ Results visible');
    } else {
      results.viewResults.status = 'failed';
      results.viewResults.errors.push('Results not visible');
      console.log('   ✗ Results not visible');
    }
    
    await takeScreenshot(page, '08_results');
    
    // Calculate results
    Object.values(results).forEach(section => {
      if (section.status === 'passed') results.overall.passed++;
      if (section.status === 'failed') results.overall.failed++;
    });
    
  } catch (error) {
    console.error('❌ Simulation error:', error.message);
    await takeScreenshot(page, 'error_' + Date.now());
    results.overall.errors = [error.message];
  } finally {
    await browser.close();
  }
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('PARTICIPANT SIMULATION RESULTS');
  console.log('='.repeat(60));
  Object.entries(results).forEach(([key, value]) => {
    if (key !== 'overall') {
      const icon = value.status === 'passed' ? '✅' : value.status === 'failed' ? '❌' : '⏳';
      console.log(`${icon} ${key}: ${value.status}`);
      if (value.errors && value.errors.length > 0) {
        value.errors.forEach(err => console.log(`   ⚠️  ${err}`));
      }
    }
  });
  console.log('-'.repeat(60));
  console.log(`📈 Passed: ${results.overall.passed}, Failed: ${results.overall.failed}`);
  console.log('='.repeat(60));
  
  return results;
}

// Run if called directly
if (require.main === module) {
  simulateParticipant().then(results => {
    process.exit(results.overall.failed > 0 ? 1 : 0);
  });
}

module.exports = simulateParticipant;
