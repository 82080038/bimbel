/**
 * Registration Test using Puppeteer (Headed Mode)
 * Tests the complete registration flow
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Screenshot directory
const screenshotDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function takeScreenshot(page, name) {
    const fileName = `register_test_${name}_${Date.now()}.png`;
    await page.screenshot({ 
        path: path.join(screenshotDir, fileName),
        fullPage: true 
    });
    console.log(`📸 Screenshot: ${fileName}`);
}

async function testRegistration() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     REGISTRATION TEST - PUPPETEER (HEADED)                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const browser = await puppeteer.launch({
        headless: false, // HEADED MODE - bisa dilihat
        slowMo: 100,     // Slow motion untuk melihat proses
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    try {
        // 1. Navigate to registration page
        console.log('1️⃣ Navigating to registration page...');
        await page.goto('http://localhost/bimbel/register.html', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        await takeScreenshot(page, '01_register_page');
        console.log('   ✅ Register page loaded');

        // 2. Check if form elements exist
        console.log('\n2️⃣ Checking form elements...');
        const formElements = await page.evaluate(() => {
            return {
                username: !!document.getElementById('username'),
                password: !!document.getElementById('password'),
                confirmPassword: !!document.getElementById('confirmPassword'),
                namaLengkap: !!document.getElementById('namaLengkap'),
                nomorHP: !!document.getElementById('nomorHP'),
                jenisKelamin: !!document.getElementById('jenisKelamin'),
                tahunTamat: !!document.getElementById('tahunTamat'),
                asalSekolah: !!document.getElementById('asalSekolah'),
                submitBtn: !!document.querySelector('button[type="submit"]')
            };
        });
        
        console.log('   Form elements:', JSON.stringify(formElements, null, 2));
        
        const allPresent = Object.values(formElements).every(v => v === true);
        if (!allPresent) {
            throw new Error('Some form elements are missing!');
        }
        console.log('   ✅ All form elements present');

        // 3. Fill the form
        console.log('\n3️⃣ Filling registration form...');
        
        const testUser = {
            username: 'testuser' + Date.now(),
            password: 'TestPassword123',
            namaLengkap: 'Budi Santoso',
            nomorHP: '08123456789' + Math.floor(Math.random() * 10),
            jenisKelamin: 'L',
            tahunTamat: 2024,
            asalSekolah: 'SMA Negeri 1 Jakarta'
        };

        console.log('   Test data:', JSON.stringify(testUser, null, 2));

        await page.type('#username', testUser.username);
        await page.type('#password', testUser.password);
        await page.type('#confirmPassword', testUser.password);
        await page.type('#namaLengkap', testUser.namaLengkap);
        await page.type('#nomorHP', testUser.nomorHP);
        await page.select('#jenisKelamin', testUser.jenisKelamin);
        await page.type('#tahunTamat', testUser.tahunTamat.toString());
        await page.type('#asalSekolah', testUser.asalSekolah);

        await takeScreenshot(page, '02_form_filled');
        console.log('   ✅ Form filled');

        // 4. Check terms checkbox
        console.log('\n4️⃣ Checking terms checkbox...');
        await page.click('#termsCheck');
        console.log('   ✅ Terms accepted');

        // 5. Submit form
        console.log('\n5️⃣ Submitting form...');
        
        // Capture console messages
        let consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
        });

        // Capture network responses
        let apiResponse = null;
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('auth.php') && url.includes('register')) {
                try {
                    apiResponse = await response.json();
                    console.log('   📡 API Response:', JSON.stringify(apiResponse, null, 2));
                } catch (e) {
                    console.log('   📡 API Response (text):', await response.text());
                }
            }
        });

        await page.click('button[type="submit"]');
        
        // Wait for response
        await page.waitForTimeout(3000);
        await takeScreenshot(page, '03_after_submit');

        // 6. Check result
        console.log('\n6️⃣ Checking result...');
        
        // Check for success message
        const alertBox = await page.evaluate(() => {
            const alert = document.getElementById('alertBox');
            return alert ? {
                display: alert.style.display,
                className: alert.className,
                text: alert.textContent
            } : null;
        });

        console.log('   Alert box:', JSON.stringify(alertBox, null, 2));

        // Check console messages
        console.log('\n   Console messages:');
        consoleMessages.forEach(msg => {
            console.log(`   [${msg.type}] ${msg.text.substring(0, 100)}`);
        });

        // 7. Verify result
        if (apiResponse) {
            if (apiResponse.success) {
                console.log('\n   ✅ REGISTRATION SUCCESS!');
                console.log('   Message:', apiResponse.message);
                console.log('   User:', JSON.stringify(apiResponse.user, null, 2));
                
                // Wait for redirect
                await page.waitForTimeout(2500);
                const currentUrl = page.url();
                console.log('   Redirected to:', currentUrl);
                
                if (currentUrl.includes('login.html')) {
                    console.log('   ✅ Successfully redirected to login page');
                }
                
                await takeScreenshot(page, '04_success');
                
            } else {
                console.log('\n   ❌ REGISTRATION FAILED');
                console.log('   Error:', apiResponse.error);
                await takeScreenshot(page, '04_error');
            }
        } else {
            console.log('\n   ⚠️ No API response captured');
            await takeScreenshot(page, '04_no_response');
        }

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        await takeScreenshot(page, 'error');
    } finally {
        await browser.close();
    }

    console.log('\n' + '='.repeat(60));
    console.log('Registration test completed!');
    console.log('='.repeat(60));
}

// Run the test
testRegistration().then(() => {
    console.log('\n✨ Test finished!');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
