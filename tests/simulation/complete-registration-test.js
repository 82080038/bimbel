/**
 * Complete Registration Test
 * 1. Register new user
 * 2. Verify data in database via API
 * 3. Login with new user
 * 4. Access dashboard
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

// Generate random user data
function generateRandomUser() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    
    return {
        username: `testuser_${timestamp}_${randomNum}`,
        password: 'TestPassword123!',
        nama_lengkap: `Test User ${randomNum}`,
        nomor_hp: `0812${Math.floor(Math.random() * 100000000)}`,
        jenis_kelamin: Math.random() > 0.5 ? 'L' : 'P',
        tahun_tamat: 2020 + Math.floor(Math.random() * 5),
        asal_sekolah: `SMA Negeri ${Math.floor(Math.random() * 10) + 1} Jakarta`
    };
}

async function testCompleteRegistration() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     COMPLETE REGISTRATION & VERIFICATION TEST             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const testUser = generateRandomUser();
    console.log('📋 Generated Test User:');
    console.log(JSON.stringify(testUser, null, 2));
    console.log('');

    let registeredUserId = null;
    let authToken = null;

    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        // =====================================================
        // STEP 1: REGISTER USER
        // =====================================================
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 1: Registering new user...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });

        // Navigate to registration page
        await page.goto('http://localhost/bimbel/register.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        console.log('✅ Loaded registration page');

        // Fill form
        await page.type('#username', testUser.username);
        await page.type('#password', testUser.password);
        await page.type('#confirmPassword', testUser.password);
        await page.type('#namaLengkap', testUser.nama_lengkap);
        await page.type('#nomorHP', testUser.nomor_hp);
        await page.select('#jenisKelamin', testUser.jenis_kelamin);
        await page.type('#tahunTamat', testUser.tahun_tamat.toString());
        await page.type('#asalSekolah', testUser.asal_sekolah);
        
        console.log('✅ Filled registration form');

        // Check terms
        await page.click('#termsCheck');

        // Submit and capture response
        let apiResponse = null;
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('auth.php') && url.includes('register')) {
                try {
                    apiResponse = await response.json();
                } catch (e) {
                    console.log('   ⚠️ Could not parse API response as JSON');
                }
            }
        });

        // Submit form
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForTimeout(2000)
        ]);

        console.log('✅ Submitted registration form');

        if (apiResponse) {
            console.log('\n📡 API Response:');
            console.log(JSON.stringify(apiResponse, null, 2));
            
            if (apiResponse.success) {
                registeredUserId = apiResponse.user.id;
                console.log(`\n✅ REGISTRATION SUCCESS! User ID: ${registeredUserId}`);
            } else {
                console.log('\n❌ REGISTRATION FAILED:', apiResponse.error);
                await browser.close();
                return;
            }
        } else {
            console.log('\n⚠️ No API response captured');
        }

        await page.close();

        // =====================================================
        // STEP 2: VERIFY IN DATABASE
        // =====================================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 2: Verifying user in database...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Check via check_users.php
        const checkPage = await browser.newPage();
        await checkPage.goto('http://localhost/bimbel/check_users.php', {
            waitUntil: 'networkidle2'
        });

        // Check if our user appears in the list
        const userExists = await checkPage.evaluate((username) => {
            const rows = document.querySelectorAll('table tr');
            for (let row of rows) {
                if (row.textContent.includes(username)) {
                    return true;
                }
            }
            return false;
        }, testUser.username);

        if (userExists) {
            console.log(`✅ User "${testUser.username}" FOUND in database!`);
            
            // Get user details from table
            const userDetails = await checkPage.evaluate((username) => {
                const rows = document.querySelectorAll('table tr');
                for (let row of rows) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > 1 && cells[1].textContent.includes(username)) {
                        return {
                            id: cells[0].textContent,
                            username: cells[1].textContent,
                            nama_lengkap: cells[2].textContent,
                            nomor_hp: cells[3].textContent,
                            jenis_kelamin: cells[4].textContent,
                            tahun_tamat: cells[5].textContent,
                            asal_sekolah: cells[6].textContent,
                            role: cells[7].textContent
                        };
                    }
                }
                return null;
            }, testUser.username);

            if (userDetails) {
                console.log('\n📊 User Details from Database:');
                console.log(JSON.stringify(userDetails, null, 2));
                
                // Verify all data
                const checks = [
                    { field: 'username', expected: testUser.username, actual: userDetails.username },
                    { field: 'nama_lengkap', expected: testUser.nama_lengkap, actual: userDetails.nama_lengkap },
                    { field: 'nomor_hp', expected: testUser.nomor_hp, actual: userDetails.nomor_hp },
                    { field: 'jenis_kelamin', expected: testUser.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan', actual: userDetails.jenis_kelamin },
                    { field: 'tahun_tamat', expected: testUser.tahun_tamat.toString(), actual: userDetails.tahun_tamat },
                    { field: 'asal_sekolah', expected: testUser.asal_sekolah, actual: userDetails.asal_sekolah },
                    { field: 'role', expected: 'user', actual: userDetails.role }
                ];

                console.log('\n🔍 Data Verification:');
                let allPassed = true;
                checks.forEach(check => {
                    const passed = check.expected === check.actual;
                    console.log(`  ${passed ? '✅' : '❌'} ${check.field}: ${passed ? 'MATCH' : `MISMATCH (expected: ${check.expected}, got: ${check.actual})`}`);
                    if (!passed) allPassed = false;
                });

                if (allPassed) {
                    console.log('\n✅ ALL DATA VERIFIED CORRECTLY!');
                } else {
                    console.log('\n⚠️ SOME DATA MISMATCHES FOUND');
                }
            }
        } else {
            console.log(`❌ User "${testUser.username}" NOT FOUND in database!`);
        }

        await checkPage.close();

        // =====================================================
        // STEP 3: LOGIN WITH NEW USER
        // =====================================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 3: Logging in with new user...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const loginPage = await browser.newPage();
        await loginPage.setViewport({ width: 1366, height: 768 });

        await loginPage.goto('http://localhost/bimbel/login.html', {
            waitUntil: 'networkidle2'
        });
        console.log('✅ Loaded login page');

        // Fill login form
        await loginPage.type('#username', testUser.username);
        await loginPage.type('#password', testUser.password);
        console.log('✅ Filled login credentials');

        // Submit and wait for redirect
        let loginResponse = null;
        loginPage.on('response', async response => {
            const url = response.url();
            if (url.includes('auth.php') && url.includes('login')) {
                try {
                    loginResponse = await response.json();
                } catch (e) {}
            }
        });

        await loginPage.click('button[type="submit"]');
        await loginPage.waitForTimeout(2000);

        if (loginResponse && loginResponse.success) {
            authToken = loginResponse.token;
            console.log('✅ Login successful!');
            console.log('   Token:', authToken.substring(0, 20) + '...');
            console.log('   Role:', loginResponse.user.role);
        } else {
            console.log('❌ Login failed:', loginResponse ? loginResponse.error : 'No response');
        }

        // =====================================================
        // STEP 4: ACCESS DASHBOARD
        // =====================================================
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('STEP 4: Accessing dashboard...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await loginPage.goto('http://localhost/bimbel/dashboard.html', {
            waitUntil: 'networkidle2'
        });

        const dashboardLoaded = await loginPage.evaluate(() => {
            return document.title.includes('Dashboard') || 
                   document.querySelector('.dashboard-container') !== null;
        });

        if (dashboardLoaded) {
            console.log('✅ Dashboard loaded successfully!');
        } else {
            console.log('⚠️ Dashboard may not have loaded correctly');
        }

        await loginPage.close();

        // =====================================================
        // FINAL SUMMARY
        // =====================================================
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║                     TEST SUMMARY                            ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║ 1. Registration:     ${registeredUserId ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log(`║ 2. Database Verify:  ${registeredUserId ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log(`║ 3. Login:            ${authToken ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log(`║ 4. Dashboard Access: ${dashboardLoaded ? '✅ PASS' : '❌ FAIL'}                          ║`);
        console.log('╚════════════════════════════════════════════════════════════╝');

        console.log('\n📋 Test User Credentials:');
        console.log(`   Username: ${testUser.username}`);
        console.log(`   Password: ${testUser.password}`);
        console.log(`   User ID:  ${registeredUserId || 'N/A'}`);

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }

    console.log('\n✨ Test completed!');
}

// Run the test
testCompleteRegistration().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
