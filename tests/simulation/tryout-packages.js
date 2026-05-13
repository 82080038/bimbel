/**
 * Tryout Packages Simulation using Puppeteer
 * Tests different tryout package configurations
 */

const puppeteer = require('puppeteer');
const CONFIG = require('./config');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
if (!fs.existsSync(CONFIG.screenshots.dir)) {
  fs.mkdirSync(CONFIG.screenshots.dir, { recursive: true });
}

// Simulation results for each package
const packageResults = {};

async function takeScreenshot(page, name) {
  if (CONFIG.screenshots.enabled) {
    const fileName = `${CONFIG.screenshots.prefix}_tryout_${name}_${Date.now()}.png`;
    await page.screenshot({ 
      path: path.join(CONFIG.screenshots.dir, fileName),
      fullPage: true 
    });
    console.log(`📸 Screenshot: ${fileName}`);
  }
}

async function simulateTryoutPackage(browser, packageConfig) {
  console.log(`\n📦 Testing Package: ${packageConfig.name}`);
  console.log(`   Kategori: ${packageConfig.kategori}, Soal: ${packageConfig.soalCount}`);
  
  const page = await browser.newPage();
  await page.setViewport(CONFIG.puppeteer.defaultViewport);
  
  const results = {
    name: packageConfig.name,
    loadTime: 0,
    questionsLoaded: 0,
    answersSubmitted: 0,
    errors: []
  };
  
  const startTime = Date.now();
  
  try {
    // Navigate to exam page
    await page.goto(CONFIG.indexUrl, { 
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeouts.navigation 
    });
    
    // Fill form with package-specific info
    await page.type('#userName', `Test ${packageConfig.name}`);
    
    if (await page.$('#examType')) {
      await page.select('#examType', 'TRYOUT');
    }
    
    if (await page.$('#tryoutPackage')) {
      await page.select('#tryoutPackage', packageConfig.id.toString());
    }
    
    await takeScreenshot(page, `${packageConfig.name}_form_filled`);
    
    // Start exam
    await page.click('button[onclick="startExam()"]');
    await page.waitForTimeout(3000);
    
    await takeScreenshot(page, `${packageConfig.name}_exam_started`);
    
    // Check questions loaded
    const questionInfo = await page.evaluate(() => {
      const totalEl = document.getElementById('totalQuestions');
      const questionContainer = document.getElementById('questionContainer');
      return {
        total: totalEl ? parseInt(totalEl.textContent) : 0,
        hasQuestions: questionContainer && questionContainer.children.length > 0
      };
    });
    
    results.questionsLoaded = questionInfo.total;
    console.log(`   📝 Total questions: ${questionInfo.total}`);
    
    // Answer some questions
    for (let i = 0; i < Math.min(3, questionInfo.total); i++) {
      try {
        await page.waitForTimeout(1000);
        
        // Select answer
        await page.evaluate(() => {
          const options = document.querySelectorAll('.option-btn, .answer-btn');
          if (options.length > 0) {
            options[Math.floor(Math.random() * options.length)].click();
          }
        });
        
        results.answersSubmitted++;
        
        // Next question
        await page.evaluate(() => {
          const nextBtn = document.querySelector('.next-btn, #nextBtn');
          if (nextBtn) nextBtn.click();
        });
        
      } catch (err) {
        results.errors.push(`Q${i + 1}: ${err.message}`);
      }
    }
    
    await takeScreenshot(page, `${packageConfig.name}_questions_answered`);
    
    // Finish exam
    await page.evaluate(() => {
      const finishBtn = document.querySelector('.finish-btn, #finishBtn, button[onclick*="finish"]');
      if (finishBtn) finishBtn.click();
    });
    
    await page.waitForTimeout(3000);
    await takeScreenshot(page, `${packageConfig.name}_finished`);
    
    // Check results
    const resultInfo = await page.evaluate(() => {
      return {
        score: document.getElementById('finalScore')?.textContent,
        hasAnalysis: !!document.getElementById('categoryAnalysis')
      };
    });
    
    console.log(`   🎯 Score: ${resultInfo.score || 'N/A'}`);
    console.log(`   ✅ Package ${packageConfig.name} completed successfully`);
    
  } catch (error) {
    console.error(`   ❌ Error in package ${packageConfig.name}:`, error.message);
    results.errors.push(error.message);
    await takeScreenshot(page, `${packageConfig.name}_error`);
  } finally {
    results.loadTime = Date.now() - startTime;
    await page.close();
  }
  
  return results;
}

async function simulateTryoutPackages() {
  console.log('🚀 Starting Tryout Packages Simulation...\n');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.puppeteer.headless,
    slowMo: CONFIG.puppeteer.slowMo,
    args: CONFIG.puppeteer.args
  });
  
  const allResults = [];
  
  try {
    // Test each tryout package
    for (const packageConfig of CONFIG.tryoutPackages) {
      const result = await simulateTryoutPackage(browser, packageConfig);
      allResults.push(result);
      packageResults[packageConfig.name] = result;
      
      // Small delay between packages
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await browser.close();
  }
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('TRYOUT PACKAGES SIMULATION RESULTS');
  console.log('='.repeat(70));
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  allResults.forEach(result => {
    const success = result.errors.length === 0 && result.questionsLoaded > 0;
    const icon = success ? '✅' : '❌';
    
    console.log(`${icon} ${result.name}`);
    console.log(`   Questions: ${result.questionsLoaded}, Answered: ${result.answersSubmitted}`);
    console.log(`   Load time: ${result.loadTime}ms`);
    
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
      result.errors.forEach(err => console.log(`     - ${err}`));
      totalFailed++;
    } else {
      totalPassed++;
    }
    console.log('');
  });
  
  console.log('-'.repeat(70));
  console.log(`📊 Summary: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('='.repeat(70));
  
  return {
    packages: packageResults,
    summary: {
      passed: totalPassed,
      failed: totalFailed,
      total: allResults.length
    }
  };
}

// Run if called directly
if (require.main === module) {
  simulateTryoutPackages().then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  });
}

module.exports = simulateTryoutPackages;
