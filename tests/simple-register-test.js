/**
 * Simple Registration Test with Error Handling
 */

const puppeteer = require('puppeteer');

async function runTest() {
    console.log('Starting registration test...\n');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // Capture errors
        page.on('pageerror', err => {
            console.error('❌ Page Error:', err.message);
        });

        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error('❌ Console Error:', msg.text());
            }
        });

        // 1. Load registration page
        console.log('1. Loading registration page...');
        const response = await page.goto('http://localhost/bimbel/register.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        if (!response.ok()) {
            throw new Error(`Failed to load page: ${response.status()}`);
        }
        console.log('   ✅ Page loaded\n');

        // 2. Check form elements
        console.log('2. Checking form elements...');
        const elements = await page.evaluate(() => {
            return {
                username: !!document.querySelector('#username'),
                password: !!document.querySelector('#password'),
                namaLengkap: !!document.querySelector('#namaLengkap'),
                nomorHP: !!document.querySelector('#nomorHP'),
                submit: !!document.querySelector('button[type="submit"]')
            };
        });
        
        console.log('   Found elements:', JSON.stringify(elements));
        
        if (!elements.username || !elements.submit) {
            throw new Error('Required form elements not found!');
        }
        console.log('   ✅ Form elements OK\n');

        // 3. Fill form
        console.log('3. Filling form...');
        const testData = {
            username: 'test_' + Date.now(),
            password: 'TestPass123',
            nama_lengkap: 'Test User',
            nomor_hp: '08123456789',
            jenis_kelamin: 'L',
            tahun_tamat: '2024',
            asal_sekolah: 'SMA Test'
        };

        await page.type('#username', testData.username);
        await page.type('#password', testData.password);
        await page.type('#confirmPassword', testData.password);
        await page.type('#namaLengkap', testData.nama_lengkap);
        await page.type('#nomorHP', testData.nomor_hp);
        await page.select('#jenisKelamin', testData.jenis_kelamin);
        await page.type('#tahunTamat', testData.tahun_tamat);
        await page.type('#asalSekolah', testData.asal_sekolah);
        
        console.log('   ✅ Form filled\n');

        // 4. Submit form
        console.log('4. Submitting form...');
        
        // Listen for API response
        let apiResult = null;
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('auth.php') && url.includes('register')) {
                try {
                    const text = await response.text();
                    console.log('   Raw API response:', text.substring(0, 200));
                    apiResult = JSON.parse(text);
                } catch (e) {
                    console.error('   API Error:', e.message);
                }
            }
        });

        await page.click('#termsCheck');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(3000);
        
        // 5. Check result
        console.log('\n5. Checking result...');
        
        // Check alert message
        const alertText = await page.evaluate(() => {
            const alert = document.getElementById('alertMessage');
            return alert ? alert.textContent : null;
        });
        
        if (alertText) {
            console.log('   Alert message:', alertText);
        }

        if (apiResult) {
            console.log('\n   API Result:', JSON.stringify(apiResult, null, 2));
            
            if (apiResult.success) {
                console.log('\n   ✅ REGISTRATION SUCCESS!');
                console.log('   User ID:', apiResult.user?.id);
                
                // Wait for redirect
                await page.waitForTimeout(2000);
                const currentUrl = page.url();
                console.log('   Current URL:', currentUrl);
                
            } else {
                console.log('\n   ❌ REGISTRATION FAILED');
                console.log('   Error:', apiResult.error);
            }
        } else {
            console.log('\n   ⚠️ No API response captured');
            
            // Try to get error from page
            const pageText = await page.evaluate(() => document.body.innerText);
            if (pageText.includes('error') || pageText.includes('Error')) {
                console.log('   Page contains error text');
            }
        }

        // Take final screenshot
        await page.screenshot({ path: 'test-result.png' });
        console.log('\n   📸 Screenshot saved: test-result.png');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        if (browser) {
            console.log('\nClosing browser...');
            await browser.close();
        }
    }
    
    console.log('\n✨ Test finished');
}

runTest();
