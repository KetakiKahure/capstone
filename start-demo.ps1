# FocusWave Demo Startup Script
# This script starts all services for the panel demonstration

Write-Host "🚀 Starting FocusWave for Panel Demonstration..." -ForegroundColor Cyan
Write-Host ""

# Check if services are already running
Write-Host "Checking current service status..." -ForegroundColor Yellow

$backendRunning = $false
$mlRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -ErrorAction Stop
    $backendRunning = $true
    Write-Host "✅ Backend is already running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend is not running" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing -ErrorAction Stop
    $mlRunning = $true
    Write-Host "✅ ML Service is already running on port 8001" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ML Service is not running" -ForegroundColor Yellow
}

Write-Host ""

# Start Backend if not running
if (-not $backendRunning) {
    Write-Host "Starting Backend Service..." -ForegroundColor Yellow
    $backendPath = Join-Path $PSScriptRoot "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"
    Start-Sleep -Seconds 3
    Write-Host "✅ Backend started" -ForegroundColor Green
} else {
    Write-Host "✅ Backend already running" -ForegroundColor Green
}

# Start ML Service if not running
if (-not $mlRunning) {
    Write-Host "Starting ML Service..." -ForegroundColor Yellow
    $mlPath = Join-Path $PSScriptRoot "ml_service"
    $pythonPath = Join-Path $mlPath "venv\Scripts\python.exe"
    Start-Process -FilePath $pythonPath -ArgumentList "start.py" -WorkingDirectory $mlPath -WindowStyle Minimized
    Start-Sleep -Seconds 3
    Write-Host "✅ ML Service started" -ForegroundColor Green
} else {
    Write-Host "✅ ML Service already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 DEMO STATUS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "ML Service: http://localhost:8001" -ForegroundColor White
Write-Host "Frontend:   http://localhost:3000 (Start from VS Code)" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start Frontend from VS Code: npm run dev" -ForegroundColor White
Write-Host "  2. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Register/Login to test the application" -ForegroundColor White
Write-Host ""
Write-Host "✅ Ready for Panel Demonstration!" -ForegroundColor Green
Write-Host ""

