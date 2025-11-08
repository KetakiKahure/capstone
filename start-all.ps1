# FocusWave - Start All Services Script
# This script starts all three services for development

Write-Host "🚀 Starting FocusWave Services..." -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot

# 1. Start Backend
Write-Host "1. Starting Backend Service..." -ForegroundColor Yellow
$backendPath = Join-Path $baseDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔵 Backend Server (Port 5000)' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# 2. Start ML Service
Write-Host "2. Starting ML Service..." -ForegroundColor Yellow
$mlPath = Join-Path $baseDir "ml_service"
$pythonPath = Join-Path $mlPath "venv\Scripts\python.exe"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$mlPath'; Write-Host '🤖 ML Service (Port 8001)' -ForegroundColor Cyan; .\venv\Scripts\python.exe start.py" -WindowStyle Normal

Start-Sleep -Seconds 3

# 3. Start Frontend
Write-Host "3. Starting Frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $baseDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🟢 Frontend Server (Port 3000)' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ All services are starting!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "  ML Service: http://localhost:8001" -ForegroundColor White
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Please wait for services to start..." -ForegroundColor Yellow
Write-Host "🌐 Frontend will open automatically in your browser" -ForegroundColor Cyan
Write-Host ""

