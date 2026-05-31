const { test, expect } = require('@playwright/test');

test('test get_kategori API', async ({ page }) => {
    await page.goto('http://localhost/bimbel/login.html');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'test123');
    await page.click('#loginForm button[type="submit"]');
    await page.waitForURL('http://localhost/bimbel/participant/dashboard.html', { timeout: 10000 });
    
    // Test API directly
    const response = await page.evaluate(async () => {
        const res = await fetch('http://localhost/bimbel/api/soal.php?action=get_kategori', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        return await res.json();
    });
    
    console.log('API Response:', JSON.stringify(response, null, 2));
    
    // Test AppConfig.fetchAPI
    const response2 = await page.evaluate(async () => {
        return await AppConfig.fetchAPI('soal.php?action=get_kategori');
    });
    
    console.log('AppConfig.fetchAPI Response:', JSON.stringify(response2, null, 2));
});
