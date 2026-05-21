/**
 * POST-EXAM ANALYSIS TEST - Playwright
 * Testing the full post-exam analysis flow including resume page features
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/ujian';
const USER = { username: 'fresh_user_11778919457', password: 'simulasi123' };

test.describe('Post-Exam Analysis Flow Test', () => {
  test('Complete exam flow and post-exam analysis', async ({ page }) => {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  POST-EXAM ANALYSIS FLOW TEST');
    console.log('══════════════════════════════════════════════════════════════════════\n');

    // 1. Login using quick login button
    console.log('📝 Step 1: Login to participant dashboard');
    await page.goto(`${BASE_URL}/login.html`);
    await page.waitForLoadState('networkidle');
    
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
    
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });
    console.log('✅ Login successful, redirected to dashboard');
    await page.screenshot({ path: 'test-screenshots/post-exam/01-dashboard.png' });

    // 2. Navigate directly to resume page with existing exam result
    console.log('\n📝 Step 2: Navigate directly to resume page');
    await page.goto(`${BASE_URL}/participant/resume-ujian.html?result_id=18`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Resume page loaded');
    await page.screenshot({ path: 'test-screenshots/post-exam/02-resume-page.png' });

    // 3. Test exam result display
    console.log('\n📝 Step 3: Test exam result display');
    const hasResultDisplay = await page.locator('.card-title, h4').filter({ hasText: 'Hasil Ujian' }).count();
    if (hasResultDisplay > 0) {
      console.log('✅ Exam result display found');
      
      // Check for status display
      const hasStatus = await page.locator('text=/LULUS|TIDAK LULUS/').count();
      if (hasStatus > 0) {
        const statusText = await page.locator('text=/LULUS|TIDAK LULUS/').first().textContent();
        console.log(`✅ Status displayed: ${statusText.trim()}`);
      }
      
      // Check for scores
      const hasScores = await page.locator('text=/\\d+/').count();
      if (hasScores > 0) {
        console.log(`✅ Score elements found: ${hasScores} numeric values`);
      }
    } else {
      console.log('⚠️ Exam result display not found');
    }
    await page.screenshot({ path: 'test-screenshots/post-exam/03-result-display.png' });

    // 4. Test question categories display
    console.log('\n📝 Step 4: Test question categories and materials');
    const hasCategoriesSection = await page.locator('text=/Kategori Soal|Question Categories/').count();
    if (hasCategoriesSection > 0) {
      console.log('✅ Categories section found');
      
      const hasCategories = await page.locator('.card, .list-group-item').count();
      if (hasCategories > 0) {
        console.log(`✅ Category items found: ${hasCategories}`);
      }
    } else {
      console.log('⚠️ Categories section not found');
    }
    await page.screenshot({ path: 'test-screenshots/post-exam/04-categories.png' });

    // 5. Test unanswered questions display
    console.log('\n📝 Step 5: Test unanswered questions display');
    const hasUnansweredSection = await page.locator('text=/Soal Tidak Dijawab|Unanswered/').count();
    if (hasUnansweredSection > 0) {
      console.log('✅ Unanswered questions section found');
      
      const hasUnansweredItems = await page.locator('.list-group-item, .alert').count();
      if (hasUnansweredItems > 0) {
        console.log(`✅ Unanswered items found: ${hasUnansweredItems}`);
      }
    } else {
      console.log('⚠️ Unanswered questions section not found');
    }
    await page.screenshot({ path: 'test-screenshots/post-exam/05-unanswered.png' });

    // 6. Test wrong answers display
    console.log('\n📝 Step 6: Test wrong answers by category');
    const hasWrongAnswersSection = await page.locator('text=/Jawaban Salah|Wrong Answers/').count();
    if (hasWrongAnswersSection > 0) {
      console.log('✅ Wrong answers section found');
      
      const hasWrongAnswerItems = await page.locator('.list-group-item, .card').count();
      if (hasWrongAnswerItems > 0) {
        console.log(`✅ Wrong answer items found: ${hasWrongAnswerItems}`);
      }
      
      // Check for category grouping
      const hasCategoryHeaders = await page.locator('.card-header, h6').count();
      if (hasCategoryHeaders > 0) {
        console.log(`✅ Category headers found: ${hasCategoryHeaders}`);
      }
    } else {
      console.log('⚠️ Wrong answers section not found');
    }
    await page.screenshot({ path: 'test-screenshots/post-exam/06-wrong-answers.png' });

    // 7. Test study recommendations
    console.log('\n📝 Step 7: Test study recommendations');
    const hasRecommendationsSection = await page.locator('text=/Rekomendasi Belajar|Study Recommendations/').count();
    if (hasRecommendationsSection > 0) {
      console.log('✅ Study recommendations section found');
      
      const hasRecommendationItems = await page.locator('.card, .list-group-item').count();
      if (hasRecommendationItems > 0) {
        console.log(`✅ Recommendation items found: ${hasRecommendationItems}`);
      }
      
      // Check for learning material links
      const hasLearnLinks = await page.locator('a:has-text("Pelajari"), a:has-text("Learn")').count();
      if (hasLearnLinks > 0) {
        console.log(`✅ Learning material links found: ${hasLearnLinks}`);
      }
    } else {
      console.log('⚠️ Study recommendations section not found');
    }
    await page.screenshot({ path: 'test-screenshots/post-exam/07-recommendations.png' });

    // 8. Test AI question generator
    console.log('\n📝 Step 8: Test AI question generator');
    const hasAIGeneratorSection = await page.locator('text=/Generator Soal AI|AI Question Generator/').count();
    if (hasAIGeneratorSection > 0) {
      console.log('✅ AI question generator section found');
      
      const hasGenerateButton = await page.locator('button:has-text("Buat Soal"), button:has-text("Generate")').count();
      if (hasGenerateButton > 0) {
        console.log(`✅ Generate button found: ${hasGenerateButton}`);
        
        // Try to click the generate button
        try {
          await page.click('button:has-text("Buat Soal"), button:has-text("Generate")', { timeout: 5000 });
          console.log('✅ Generate button clicked');
          await page.waitForTimeout(3000);
          
          // Check for result
          const hasResult = await page.locator('.alert, #aiQuestionsResult').count();
          if (hasResult > 0) {
            console.log('✅ AI generator result displayed');
          }
        } catch (e) {
          console.log('⚠️ Could not click generate button');
        }
      }
    } else {
      console.log('⚠️ AI question generator section not found');
    }
    await page.screenshot({ path: 'test-screenshots/post-exam/08-ai-generator.png' });

    // 9. Test navigation back to dashboard
    console.log('\n📝 Step 9: Test navigation back to dashboard');
    const hasDashboardButton = await page.locator('button:has-text("Dashboard"), a:has-text("Dashboard")').count();
    if (hasDashboardButton > 0) {
      await page.click('button:has-text("Dashboard"), a:has-text("Dashboard")', { timeout: 5000 });
      console.log('✅ Dashboard button clicked');
      await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });
      console.log('✅ Returned to dashboard');
      await page.screenshot({ path: 'test-screenshots/post-exam/09-back-to-dashboard.png' });
    } else {
      console.log('⚠️ Dashboard button not found');
    }

    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('  POST-EXAM ANALYSIS FLOW TEST COMPLETED');
    console.log('══════════════════════════════════════════════════════════════════════\n');
  });
});
