# Comprehensive Service Verification Script
# This script verifies all services are running correctly

Write-Host "🔍 Verifying FocusWave Services..." -ForegroundColor Cyan
Write-Host ""

$allServicesRunning = $true

# 1. Check Backend
Write-Host "1. Backend Service (Port 5000):" -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -UseBasicParsing -TimeoutSec 5
    $backendData = $backend.Content | ConvertFrom-Json
    Write-Host "   ✅ Status: $($backendData.status)" -ForegroundColor Green
    Write-Host "   ✅ Database: $($backendData.database)" -ForegroundColor Green
    Write-Host "   ✅ ML Service Connection: $($backendData.ml_service)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ ERROR: Backend is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $allServicesRunning = $false
}

Write-Host ""

# 2. Check ML Service
Write-Host "2. ML Service (Port 8001):" -ForegroundColor Yellow
try {
    $mlService = Invoke-WebRequest -Uri "http://localhost:8001/health" -Method GET -UseBasicParsing -TimeoutSec 5
    $mlData = $mlService.Content | ConvertFrom-Json
    Write-Host "   ✅ Status: $($mlData.status)" -ForegroundColor Green
    Write-Host "   ✅ Service: $($mlData.service)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ ERROR: ML Service is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $allServicesRunning = $false
}

Write-Host ""

# 3. Check Frontend
Write-Host "3. Frontend Service (Port 3000):" -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Status: Running (HTTP $($frontend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Frontend may still be starting..." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    # Check if port is listening
    $port3000 = netstat -ano | findstr ":3000.*LISTENING"
    if ($port3000) {
        Write-Host "   ℹ️  Port 3000 is listening - frontend is starting" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Port 3000 is not listening" -ForegroundColor Red
        $allServicesRunning = $false
    }
}

Write-Host ""

# 4. Test API Connectivity
Write-Host "4. Testing API Endpoints:" -ForegroundColor Yellow
try {
    # Test auth endpoint
    $authTest = @{email='test@test.com';password='test123'} | ConvertTo-Json
    try {
        $authResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $authTest -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   ✅ Auth endpoint: Working (401 = expected)" -ForegroundColor Green
        } else {
            throw
        }
    }
} catch {
    Write-Host "   ❌ Auth endpoint: Error" -ForegroundColor Red
    $allServicesRunning = $false
}

Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
if ($allServicesRunning) {
    Write-Host "✅ ALL SERVICES ARE RUNNING!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access your application:" -ForegroundColor Yellow
    Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:   http://localhost:5000/api" -ForegroundColor White
    Write-Host "   ML Service: http://localhost:8001" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Ready for demonstration!" -ForegroundColor Green
} else {
    Write-Host "❌ Some services are not running correctly" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "   1. Backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host "   2. ML Service: cd ml_service && .\venv\Scripts\python.exe start.py" -ForegroundColor White
    Write-Host "   3. Frontend: npm run dev" -ForegroundColor White
}
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

