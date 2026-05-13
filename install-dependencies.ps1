# Installation Script for Bimbel Application Dependencies
# Run as Administrator

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     INSTALLING BIMBEL APPLICATION DEPENDENCIES           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Warning "Please run this script as Administrator!"
    Exit 1
}

# Function to check if command exists
function Test-CommandExists {
    param($Command)
    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

# 1. Check and Install Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Node.js not found. Installing..." -ForegroundColor Yellow
    
    # Download and install Node.js LTS
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    
    Write-Host "   📥 Downloading Node.js..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
        Write-Host "   🔧 Installing Node.js..." -ForegroundColor Cyan
        Start-Process msiexec.exe -ArgumentList "/i", $nodeInstaller, "/quiet", "/norestart" -Wait
        Write-Host "   ✅ Node.js installed successfully" -ForegroundColor Green
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    } catch {
        Write-Error "   ❌ Failed to install Node.js: $_"
        Write-Host "   Please install manually from https://nodejs.org/" -ForegroundColor Red
    }
}

# 2. Check npm
Write-Host ""
Write-Host "📦 Checking npm..." -ForegroundColor Yellow
if (Test-CommandExists "npm") {
    $npmVersion = npm --version
    Write-Host "   ✅ npm found: $npmVersion" -ForegroundColor Green
} else {
    Write-Warning "   ⚠️  npm not found. It should be installed with Node.js"
}

# 3. Check Chrome/Chromium (required for Puppeteer)
Write-Host ""
Write-Host "🌐 Checking Chrome/Chromium..." -ForegroundColor Yellow
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
)

$chromeFound = $false
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ Chrome found at: $path" -ForegroundColor Green
        $chromeFound = $true
        break
    }
}

if (-not $chromeFound) {
    Write-Host "   ⚠️  Chrome not found. Puppeteer will download Chromium automatically" -ForegroundColor Yellow
    Write-Host "   📥 Chromium will be downloaded when installing Puppeteer" -ForegroundColor Cyan
}

# 4. Check PHP
Write-Host ""
Write-Host "🐘 Checking PHP..." -ForegroundColor Yellow
if (Test-CommandExists "php") {
    $phpVersion = php -v | Select-Object -First 1
    Write-Host "   ✅ $phpVersion" -ForegroundColor Green
} else {
    Write-Warning "   ⚠️  PHP not found in PATH"
    Write-Host "   Please ensure XAMPP PHP is installed and in PATH" -ForegroundColor Yellow
}

# 5. Check MySQL
Write-Host ""
Write-Host "🐬 Checking MySQL..." -ForegroundColor Yellow
try {
    $mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
    if ($mysqlService) {
        if ($mysqlService.Status -eq "Running") {
            Write-Host "   ✅ MySQL service is running" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  MySQL service is stopped. Starting..." -ForegroundColor Yellow
            Start-Service $mysqlService
            Write-Host "   ✅ MySQL service started" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠️  MySQL service not found. Please ensure MySQL is installed" -ForegroundColor Yellow
    }
} catch {
    Write-Warning "   ⚠️  Could not check MySQL status: $_"
}

# 6. Check Apache
Write-Host ""
Write-Host "🌐 Checking Apache..." -ForegroundColor Yellow
try {
    $apacheService = Get-Service -Name "Apache*" -ErrorAction SilentlyContinue
    if ($apacheService) {
        if ($apacheService.Status -eq "Running") {
            Write-Host "   ✅ Apache service is running" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Apache service is stopped. Starting..." -ForegroundColor Yellow
            Start-Service $apacheService
            Write-Host "   ✅ Apache service started" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠️  Apache service not found" -ForegroundColor Yellow
    }
} catch {
    Write-Warning "   ⚠️  Could not check Apache status: $_"
}

# 7. Install Puppeteer
Write-Host ""
Write-Host "🎭 Installing Puppeteer..." -ForegroundColor Yellow
$testsDir = "c:\xampp\htdocs\bimbel\tests"
if (Test-Path $testsDir) {
    Set-Location $testsDir
    
    if (Test-Path "package.json") {
        Write-Host "   📥 Installing npm dependencies..." -ForegroundColor Cyan
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Puppeteer installed successfully" -ForegroundColor Green
        } else {
            Write-Error "   ❌ Failed to install Puppeteer"
        }
    } else {
        Write-Error "   ❌ package.json not found in tests directory"
    }
} else {
    Write-Error "   ❌ tests directory not found"
}

# 8. Verify Database
Write-Host ""
Write-Host "🗄️ Verifying Database..." -ForegroundColor Yellow
$dbScript = "c:\xampp\htdocs\bimbel\database\complete_setup.sql"
if (Test-Path $dbScript) {
    Write-Host "   ✅ Database setup script found" -ForegroundColor Green
    Write-Host "   📋 Run this to setup database:" -ForegroundColor Cyan
    Write-Host "      mysql -u root -p ujian_sekolah_kedinasan < database\complete_setup.sql" -ForegroundColor White
} else {
    Write-Warning "   ⚠️  Database setup script not found"
}

# 9. Create .env file for tests if not exists
Write-Host ""
Write-Host "⚙️ Creating test configuration..." -ForegroundColor Yellow
$envFile = "c:\xampp\htdocs\bimbel\tests\.env"
if (-not (Test-Path $envFile)) {
    @"
BASE_URL=http://localhost/bimbel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PARTICIPANT_NAME=Test Participant
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "   ✅ Test .env file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     INSTALLATION COMPLETE                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Ensure MySQL database is imported:" -ForegroundColor White
Write-Host "      mysql -u root -p ujian_sekolah_kedinasan < database\complete_setup.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Run simulations:" -ForegroundColor White
Write-Host "      cd tests" -ForegroundColor Gray
Write-Host "      npm run test:admin         # Admin simulation" -ForegroundColor Gray
Write-Host "      npm run test:participant   # Participant simulation" -ForegroundColor Gray
Write-Host "      npm run test:tryout        # Tryout packages" -ForegroundColor Gray
Write-Host "      npm run test:all           # All simulations" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. View results in tests/screenshots/" -ForegroundColor Gray
Write-Host ""
