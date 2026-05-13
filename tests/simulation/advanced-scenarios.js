/**
 * Advanced Test Scenarios for Bimbel Application
 * Includes timeout tests, wrong answers, and various paket ujian
 */

const puppeteer = require('puppeteer');
const CONFIG = require('./config');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshots.dir)) {
  fs.mkdirSync(CONFIG.screenshots.dir, { recursive: true });
}

async function takeScreenshot(page, name) {
  if (CONFIG.screenshots.enabled) {
    const fileName = `${CONFIG.screenshots.prefix}_advanced_${name}_${Date.now()}.png`;
    await page.screenshot({ 
      path: path.join(CONFIG.screenshots.dir, fileName),
      fullPage: true 
    });
    console.log(`📸 Screenshot: ${fileName}`);
  }
}

/**
 * Scenario 1: Test dengan jawaban semua salah
 */
async function testAllWrongAnswers(browser) {
  console.log('\n📝 Scenario 1: Test dengan jawaban salah semua');
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  try {
    await page.goto(CONFIG.indexUrl, { waitUntil: 'networkidle2' });
    
    // Fill form
    await page.type('#namaPeserta', 'Test All Wrong');
    await page.waitForTimeout(1000);
    
    // Select paket
    const paketOptions = await page.evaluate(() => {
      const select = document.getElementById('paketSelection');
      return select ? Array.from(select.options).filter(o => o.value).map(o => o.value) : [];
    });
    
    if (paketOptions.length > 0) {
      await page.select('#paketSelection', paketOptions[0]);
    }
    
    await takeScreenshot(page, 'all_wrong_01_form');
    
    // Start exam
    await page.click('button[onclick*="mulaiUjian"]');
    await page.waitForTimeout(3000);
    
    await takeScreenshot(page, 'all_wrong_02_started');
    
    // Answer first 3 questions with wrong answers (E for all)
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('.option-btn, .answer-btn');
        if (buttons.length >= 5) {
          buttons[4].click(); // Click E (usually wrong)
        }
      });
      await page.waitForTimeout(500);
      
      // Next question
      await page.evaluate(() => {
        const nextBtn = document.querySelector('.next-btn, #nextBtn');
        if (nextBtn) nextBtn.click();
      });
      await page.waitForTimeout(500);
    }
    
    await takeScreenshot(page, 'all_wrong_03_answered');
    
    // Finish exam
    await page.evaluate(() => {
      const finishBtn = document.querySelector('.finish-btn, #finishBtn');
      if (finishBtn) finishBtn.click();
    });
    
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'all_wrong_04_results');
    
    console.log('   ✅ All wrong answers test completed');
    return { status: 'passed', scenario: 'all_wrong' };
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    await takeScreenshot(page, 'all_wrong_error');
    return { status: 'failed', scenario: 'all_wrong', error: error.message };
  } finally {
    await page.close();
  }
}

/**
 * Scenario 2: Test dengan jawaban semua benar (A untuk semua)
 */
async function testAllCorrectAnswers(browser) {
  console.log('\n📝 Scenario 2: Test dengan jawaban A semua');
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  try {
    await page.goto(CONFIG.indexUrl, { waitUntil: 'networkidle2' });
    
    // Fill form
    await page.type('#namaPeserta', 'Test All A');
    await page.waitForTimeout(1000);
    
    // Select paket
    const paketOptions = await page.evaluate(() => {
      const select = document.getElementById('paketSelection');
      return select ? Array.from(select.options).filter(o => o.value).map(o => o.value) : [];
    });
    
    if (paketOptions.length > 0) {
      await page.select('#paketSelection', paketOptions[0]);
    }
    
    await takeScreenshot(page, 'all_a_01_form');
    
    // Start exam
    await page.click('button[onclick*="mulaiUjian"]');
    await page.waitForTimeout(3000);
    
    await takeScreenshot(page, 'all_a_02_started');
    
    // Answer first 3 questions with A
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('.option-btn, .answer-btn');
        if (buttons.length > 0) {
          buttons[0].click(); // Click A
        }
      });
      await page.waitForTimeout(500);
      
      // Next question
      await page.evaluate(() => {
        const nextBtn = document.querySelector('.next-btn, #nextBtn');
        if (nextBtn) nextBtn.click();
      });
      await page.waitForTimeout(500);
    }
    
    await takeScreenshot(page, 'all_a_03_answered');
    
    // Finish exam
    await page.evaluate(() => {
      const finishBtn = document.querySelector('.finish-btn, #finishBtn');
      if (finishBtn) finishBtn.click();
    });
    
    await page.waitForTimeout(3000);
    await takeScreenshot(page, 'all_a_04_results');
    
    console.log('   ✅ All A answers test completed');
    return { status: 'passed', scenario: 'all_a' };
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    await takeScreenshot(page, 'all_a_error');
    return { status: 'failed', scenario: 'all_a', error: error.message };
  } finally {
    await page.close();
  }
}

/**
 * Scenario 3: Test timeout - keluar dari fullscreen
 */
async function testFullscreenExit(browser) {
  console.log('\n📝 Scenario 3: Test keluar dari fullscreen');
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  try {
    await page.goto(CONFIG.indexUrl, { waitUntil: 'networkidle2' });
    
    // Fill form and start
    await page.type('#namaPeserta', 'Test Fullscreen');
    await page.waitForTimeout(1000);
    
    const paketOptions = await page.evaluate(() => {
      const select = document.getElementById('paketSelection');
      return select ? Array.from(select.options).filter(o => o.value).map(o => o.value) : [];
    });
    
    if (paketOptions.length > 0) {
      await page.select('#paketSelection', paketOptions[0]);
    }
    
    await takeScreenshot(page, 'fullscreen_01_before');
    
    // Start exam
    await page.click('button[onclick*="mulaiUjian"]');
    await page.waitForTimeout(3000);
    
    await takeScreenshot(page, 'fullscreen_02_started');
    
    // Simulate pressing ESC to exit fullscreen
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
    
    await takeScreenshot(page, 'fullscreen_03_after_esc');
    
    // Check if warning dialog appears
    const hasWarning = await page.evaluate(() => {
      return !!document.querySelector('.warning-dialog, .alert, [class*="warning"]');
    });
    
    console.log(`   ${hasWarning ? '⚠️' : '✓'} Warning dialog: ${hasWarning ? 'YES' : 'NO'}`);
    
    console.log('   ✅ Fullscreen exit test completed');
    return { status: 'passed', scenario: 'fullscreen_exit', hasWarning };
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return { status: 'failed', scenario: 'fullscreen_exit', error: error.message };
  } finally {
    await page.close();
  }
}

/**
 * Scenario 4: Test berbagai paket ujian
 */
async function testMultiplePaket(browser) {
  console.log('\n📝 Scenario 4: Test berbagai paket ujian');
  
  const results = [];
  
  for (const paket of CONFIG.tryoutPackages) {
    const page = await browser.newPage();
    await page.setViewport(CONFIG.puppeteer.defaultViewport);
    
    try {
      console.log(`   Testing ${paket.name}...`);
      
      await page.goto(CONFIG.indexUrl, { waitUntil: 'networkidle2' });
      
      // Fill form
      await page.type('#namaPeserta', `Test ${paket.name}`);
      await page.waitForTimeout(1000);
      
      // Try to select specific paket
      const paketOptions = await page.evaluate(() => {
        const select = document.getElementById('paketSelection');
        return select ? Array.from(select.options).filter(o => o.value).map(o => ({ value: o.value, text: o.text })) : [];
      });
      
      // Find matching paket
      const matchingPaket = paketOptions.find(o => 
        o.text.toLowerCase().includes(paket.name.toLowerCase()) ||
        o.text.toLowerCase().includes(paket.kategori.toLowerCase())
      );
      
      if (matchingPaket) {
        await page.select('#paketSelection', matchingPaket.value);
        console.log(`     Selected: ${matchingPaket.text}`);
      } else if (paketOptions.length > 0) {
        await page.select('#paketSelection', paketOptions[0].value);
        console.log(`     Selected first available: ${paketOptions[0].text}`);
      }
      
      // Start exam
      await page.click('button[onclick*="mulaiUjian"]');
      await page.waitForTimeout(3000);
      
      // Check question count
      const questionInfo = await page.evaluate(() => {
        const totalEl = document.getElementById('totalQuestions');
        return {
          total: totalEl ? parseInt(totalEl.textContent) : 0
        };
      });
      
      console.log(`     Questions: ${questionInfo.total}`);
      
      results.push({
        paket: paket.name,
        status: 'passed',
        questions: questionInfo.total
      });
      
      await page.close();
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`   ❌ Error with ${paket.name}:`, error.message);
      results.push({
        paket: paket.name,
        status: 'failed',
        error: error.message
      });
      await page.close();
    }
  }
  
  return { scenario: 'multiple_paket', results };
}

/**
 * Scenario 5: Test navigasi soal (loncat ke soal tertentu)
 */
async function testQuestionNavigation(browser) {
  console.log('\n📝 Scenario 5: Test navigasi soal');
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  try {
    await page.goto(CONFIG.indexUrl, { waitUntil: 'networkidle2' });
    
    // Fill form
    await page.type('#namaPeserta', 'Test Navigation');
    await page.waitForTimeout(1000);
    
    const paketOptions = await page.evaluate(() => {
      const select = document.getElementById('paketSelection');
      return select ? Array.from(select.options).filter(o => o.value).map(o => o.value) : [];
    });
    
    if (paketOptions.length > 0) {
      await page.select('#paketSelection', paketOptions[0]);
    }
    
    await takeScreenshot(page, 'nav_01_start');
    
    // Start exam
    await page.click('button[onclick*="mulaiUjian"]');
    await page.waitForTimeout(3000);
    
    await takeScreenshot(page, 'nav_02_exam');
    
    // Try to navigate to question 5
    await page.evaluate(() => {
      const navButtons = document.querySelectorAll('.question-nav-btn, .nav-btn, [data-question]');
      if (navButtons.length >= 5) {
        navButtons[4].click(); // Click question 5
      }
    });
    
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'nav_03_question5');
    
    // Check current question
    const currentQ = await page.evaluate(() => {
      const currentEl = document.getElementById('currentQuestion');
      return currentEl ? parseInt(currentEl.textContent) : 0;
    });
    
    console.log(`   Current question: ${currentQ}`);
    
    console.log('   ✅ Navigation test completed');
    return { status: 'passed', scenario: 'navigation', currentQuestion: currentQ };
    
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    await takeScreenshot(page, 'nav_error');
    return { status: 'failed', scenario: 'navigation', error: error.message };
  } finally {
    await page.close();
  }
}

/**
 * Run all advanced scenarios
 */
async function runAdvancedScenarios() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     ADVANCED TEST SCENARIOS                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.puppeteer.headless,
    slowMo: CONFIG.puppeteer.slowMo,
    args: CONFIG.puppeteer.args
  });
  
  const results = [];
  
  try {
    // Run all scenarios
    results.push(await testAllWrongAnswers(browser));
    results.push(await testAllCorrectAnswers(browser));
    results.push(await testFullscreenExit(browser));
    results.push(await testMultiplePaket(browser));
    results.push(await testQuestionNavigation(browser));
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('ADVANCED SCENARIOS SUMMARY');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    if (result.scenario === 'multiple_paket') {
      console.log(`\n📦 Multiple Paket Test:`);
      result.results.forEach(r => {
        const icon = r.status === 'passed' ? '✅' : '❌';
        console.log(`   ${icon} ${r.paket}: ${r.status}`);
        if (r.status === 'passed') passed++;
        else failed++;
      });
    } else {
      const icon = result.status === 'passed' ? '✅' : '❌';
      console.log(`${icon} ${result.scenario}: ${result.status}`);
      if (result.status === 'passed') passed++;
      else failed++;
    }
  });
  
  console.log('-'.repeat(60));
  console.log(`📊 Passed: ${passed}, Failed: ${failed}`);
  console.log('='.repeat(60));
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runAdvancedScenarios().then(() => {
    console.log('\n✨ Advanced scenarios completed!');
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = runAdvancedScenarios;
