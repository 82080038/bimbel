// Test Configuration
const CONFIG = {
  // Application URLs
  baseUrl: 'http://localhost/bimbel',
  adminUrl: 'http://localhost/bimbel/admin.html',
  indexUrl: 'http://localhost/bimbel/index.html',
  
  // Test credentials
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  participant: {
    name: 'Test Participant',
    examType: 'CPNS'
  },
  
  // Puppeteer settings
  puppeteer: {
    headless: false, // Headed mode untuk visualisasi
    slowMo: 100, // Slow motion untuk debugging
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  
  // Timeouts
  timeouts: {
    navigation: 30000,
    element: 10000,
    exam: 600000 // 10 menit untuk simulasi ujian
  },
  
  // Screenshot settings
  screenshots: {
    enabled: true,
    dir: './screenshots',
    prefix: 'simulation'
  },
  
  // Tryout packages to test
  tryoutPackages: [
    { id: 1, name: 'Paket Basic', kategori: 'TWK', soalCount: 10 },
    { id: 2, name: 'Paket Standar', kategori: 'TIU', soalCount: 15 },
    { id: 3, name: 'Paket Premium', kategori: 'TKP', soalCount: 20 }
  ]
};

module.exports = CONFIG;
