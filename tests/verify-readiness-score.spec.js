const { test, expect } = require('@playwright/test');

test.describe('Verify Readiness Score and Page Content', () => {
    test('Dashboard readiness score should not be NaN', async ({ page }) => {
        // Navigate to login page
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Click quick login button for user
        await page.click('button[onclick*="quickLogin"]');
        await page.waitForTimeout(2000);

        // Wait for redirect to dashboard
        await page.waitForURL('**/participant/dashboard.html');
        await page.waitForLoadState('networkidle');

        // Wait for dashboard content to load
        await page.waitForTimeout(3000);

        // Check readiness score element
        const readinessScore = page.locator('#readinessScore');
        await expect(readinessScore).toBeVisible();

        // Get the text content
        const text = await readinessScore.textContent();
        console.log('Readiness score text:', text);

        // Verify it doesn't contain NaN
        expect(text).not.toContain('NaN');
        expect(text).not.toContain('undefined');
        expect(text).not.toContain('null');

        // Verify it matches expected pattern (either "-" or "number%")
        expect(text).toMatch(/^(-|\d+%)$/);

        // Take screenshot for verification
        await page.screenshot({ path: 'test-screenshots/dashboard-readiness-score.png', fullPage: true });
    });

    test('All dashboard elements should display correctly', async ({ page }) => {
        // Navigate to dashboard
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        // Login
        await page.click('button[onclick*="quickLogin"]');
        await page.waitForTimeout(2000);
        await page.waitForURL('**/participant/dashboard.html');

        // Wait for content to load
        await page.waitForTimeout(3000);

        // Check all key elements
        const elements = [
            { id: 'userName', name: 'User Name' },
            { id: 'userDetail', name: 'User Detail' },
            { id: 'totalExams', name: 'Total Exams' },
            { id: 'averageScore', name: 'Average Score' },
            { id: 'userXP', name: 'User XP' },
            { id: 'userStreak', name: 'User Streak' },
            { id: 'aiRecommendation', name: 'AI Recommendation' },
            { id: 'aiConfidence', name: 'AI Confidence' },
            { id: 'readinessScore', name: 'Readiness Score' },
            { id: 'daysRemaining', name: 'Days Remaining' },
        ];

        for (const element of elements) {
            const locator = page.locator(`#${element.id}`);
            await expect(locator).toBeVisible();

            const text = await locator.textContent();
            console.log(`${element.name}: ${text}`);

            // Check for NaN or undefined values
            expect(text).not.toContain('NaN');
            expect(text).not.toContain('undefined');
            expect(text).not.toContain('null');
        }

        await page.screenshot({ path: 'test-screenshots/dashboard-all-elements.png', fullPage: true });
    });

    test('Ujian page should display correctly', async ({ page }) => {
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        await page.click('button[onclick*="quickLogin"]');
        await page.waitForTimeout(2000);

        // Navigate to ujian page
        await page.goto('http://localhost/bimbel/participant/ujian.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check key elements
        await expect(page.locator('#welcomeScreen')).toBeVisible();
        await expect(page.locator('#examTypeSelection')).toBeVisible();
        await expect(page.locator('#paketSelection')).toBeVisible();
        await expect(page.locator('#namaPeserta')).toBeVisible();

        await page.screenshot({ path: 'test-screenshots/ujian-page.png', fullPage: true });
    });

    test('Profile page should display correctly', async ({ page }) => {
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        await page.click('button[onclick*="quickLogin"]');
        await page.waitForTimeout(2000);

        // Navigate to profile page
        await page.goto('http://localhost/bimbel/participant/profile.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Wait longer for profile data to load

        // Take screenshot first to see what's on the page
        await page.screenshot({ path: 'test-screenshots/profile-page.png', fullPage: true });

        // Check if profile loaded or error shown
        const profileContent = page.locator('#profileContent');
        await expect(profileContent).toBeVisible();

        const contentText = await profileContent.textContent();

        // If profile loaded successfully, check elements
        if (!contentText.includes('Data profil tidak tersedia')) {
            // Check key elements exist
            const profileName = page.locator('#profileName');
            const profileUsername = page.locator('#profileUsername');

            if (await profileName.isVisible().catch(() => false)) {
                const text = await profileName.textContent();
                expect(text).not.toContain('NaN');
                expect(text).not.toContain('undefined');
            }

            if (await profileUsername.isVisible().catch(() => false)) {
                const text = await profileUsername.textContent();
                expect(text).not.toContain('NaN');
                expect(text).not.toContain('undefined');
            }

            // Verify no NaN in stats
            const stats = ['#statExams', '#statAvgScore', '#statXP', '#statStreak'];
            for (const stat of stats) {
                const statElement = page.locator(stat);
                if (await statElement.isVisible().catch(() => false)) {
                    const text = await statElement.textContent();
                    expect(text).not.toContain('NaN');
                }
            }
        }
    });

    test('Materi page should display correctly', async ({ page }) => {
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        await page.click('button[onclick*="quickLogin"]');
        await page.waitForTimeout(2000);

        // Navigate to materi page
        await page.goto('http://localhost/bimbel/participant/materi.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check key elements
        await expect(page.locator('#materialsGrid')).toBeVisible();
        await expect(page.locator('#filterKategori')).toBeVisible();

        await page.screenshot({ path: 'test-screenshots/materi-page.png', fullPage: true });
    });

    test('Leaderboard page should display correctly', async ({ page }) => {
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        await page.click('button[onclick*="quickLogin"]');
        await page.waitForTimeout(2000);

        // Navigate to leaderboard page
        await page.goto('http://localhost/bimbel/participant/leaderboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check key elements
        await expect(page.locator('#leaderboardTableBody')).toBeVisible();
        await expect(page.locator('#periodFilter')).toBeVisible();

        await page.screenshot({ path: 'test-screenshots/leaderboard-page.png', fullPage: true });
    });

    test('Achievements page should display correctly', async ({ page }) => {
        await page.goto('http://localhost/bimbel/login.html');
        await page.waitForLoadState('networkidle');

        await page.click('button[onclick*="quickLogin"]');
        await page.waitForTimeout(2000);

        // Navigate to achievements page
        await page.goto('http://localhost/bimbel/participant/achievements.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check key elements
        await expect(page.locator('#achievementsGrid')).toBeVisible();
        await expect(page.locator('#totalBadges')).toBeVisible();

        // Verify no NaN in badges count
        const badgesText = await page.locator('#totalBadges').textContent();
        expect(badgesText).not.toContain('NaN');

        await page.screenshot({ path: 'test-screenshots/achievements-page.png', fullPage: true });
    });
});
