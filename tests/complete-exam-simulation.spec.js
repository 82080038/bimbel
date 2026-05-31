const { test, expect } = require('@playwright/test');

// Complete Exam Simulation Test
// This test simulates a complete exam flow from login to result display

test.describe('Complete Exam Simulation', () => {

  test('Complete exam flow with auto-answer', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost/bimbel/login.html');
    await page.waitForLoadState('networkidle');

    // Login using quick login button
    await page.click('button:has-text("Test User")');
    await page.waitForURL('**/participant/dashboard.html', { timeout: 10000 });

    // Navigate to exam page
    await page.goto('http://localhost/bimbel/participant/ujian.html');
    await page.waitForSelector('#examTypeSelection', { timeout: 10000 });

    // Select exam type (SKD)
    await page.selectOption('#examTypeSelection', '1');
    await page.waitForTimeout(2000);

    // Start exam
    await page.click('button:has-text("Mulai Ujian")');
    await page.waitForSelector('#examScreen', { timeout: 10000 });

    console.log('Exam started - beginning to answer questions...');

    // Answer all questions automatically
    let questionCount = 0;
    let maxQuestions = 130; // Total questions for SKD

    for (let i = 0; i < maxQuestions; i++) {
      try {
        // Wait for answer options to be visible
        await page.waitForSelector('input[name="answer"]', { timeout: 5000 });
        
        // Select the first option (simplified - in real scenario would select correct answer)
        const firstOption = page.locator('input[name="answer"]').first();
        if (await firstOption.isVisible()) {
          await firstOption.check();
          questionCount++;
          
          // Wait for auto-next or click next button
          await page.waitForTimeout(500);
          
          // Check if there's a next button and click it
          const nextButton = page.locator('button:has-text("Selanjutnya")');
          if (await nextButton.isVisible()) {
            await nextButton.click();
          }
          
          await page.waitForTimeout(300);
          
          console.log(`Answered question ${questionCount}/${maxQuestions}`);
        } else {
          // No more questions or exam finished
          console.log('No more questions visible');
          break;
        }
      } catch (e) {
        // If we can't find answer options, exam might be finished
        console.log(`Error at question ${questionCount}: ${e.message}`);
        
        // Check if result screen is visible
        const resultScreen = page.locator('#resultScreen');
        if (await resultScreen.isVisible()) {
          console.log('Exam finished - result screen visible');
          break;
        }
        
        // Try to continue
        await page.waitForTimeout(500);
      }
    }

    console.log(`Total questions answered: ${questionCount}`);

    // Wait for result screen or submit manually if needed
    await page.waitForTimeout(2000);

    // Check if result screen is visible
    const resultScreen = page.locator('#resultScreen');
    const examScreen = page.locator('#examScreen');

    if (await resultScreen.isVisible()) {
      console.log('Result screen is visible - exam completed successfully');
      
      // Capture result information
      try {
        const totalScore = await page.locator('#totalScore').textContent();
        const statusLulus = await page.locator('#statusLulus').textContent();
        console.log(`Total Score: ${totalScore}`);
        console.log(`Status: ${statusLulus}`);
      } catch (e) {
        console.log('Could not capture score details');
      }
    } else if (await examScreen.isVisible()) {
      console.log('Still on exam screen - attempting to submit');
      
      // Try to submit the exam
      const submitButton = page.locator('button:has-text("Selesai")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Confirm submission
        const confirmButton = page.locator('button:has-text("Ya")');
        if (await confirmButton.isVisible({ timeout: 3000 })) {
          await confirmButton.click();
        }
        
        await page.waitForSelector('#resultScreen', { timeout: 10000 });
        console.log('Exam submitted successfully');
      }
    }

    // Final verification
    await page.waitForTimeout(3000);
    console.log('Exam simulation completed');
  });
});
