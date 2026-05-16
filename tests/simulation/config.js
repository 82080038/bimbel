// Test Configuration
const CONFIG = {
  // Application URLs
  baseUrl: 'http://localhost/bimbel',
  adminUrl: 'http://localhost/bimbel/admin.html',
  indexUrl: 'http://localhost/bimbel/index.html',
  examUrl: 'http://localhost/bimbel/participant/ujian.html',
  
  // Test credentials
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  participant: {
    name: 'Test Participant',
    examType: 'CPNS',
    username: 'testuser',
    password: 'password123'
  },
  // Test users for simulation (MUST exist in database with valid credentials)
  // Passwords have been set to 'simulasi123' for these users
  testUsers: [
    { username: 'fresh_user_11778919457', password: 'simulasi123', name: 'Fresh User 1 - TWK', examType: 'TWK' },
    { username: 'fresh_user_21778919457', password: 'simulasi123', name: 'Fresh User 2 - TIU', examType: 'TIU' },
    { username: 'fresh_user_11778919457', password: 'simulasi123', name: 'Fresh User 1 - TKP', examType: 'TKP' },
    { username: 'fresh_user_21778919457', password: 'simulasi123', name: 'Fresh User 2 - TPA', examType: 'TPA' },
    { username: 'fresh_user_11778919457', password: 'simulasi123', name: 'Fresh User 1 - PSIKOLOGIS', examType: 'PSIKOLOGIS' },
    { username: 'fresh_user_21778919457', password: 'simulasi123', name: 'Fresh User 2 - SKD', examType: 'SKD' }
  ],
  
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
