# Script to kill processes running on FocusWave ports
# Usage: .\kill-ports.ps1

Write-Host "🔍 Checking for processes on FocusWave ports..." -ForegroundColor Cyan
Write-Host ""

$ports = @(3000, 5000, 8001)
$killed = @()

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Yellow
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $pid = $conn.OwningProcess
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  Found process: $($process.ProcessName) (PID: $pid) on port $port" -ForegroundColor Red
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "  ✅ Terminated process $pid on port $port" -ForegroundColor Green
                        $killed += "Port $port : Process $pid ($($process.ProcessName))"
                    } catch {
                        Write-Host "  ❌ Could not terminate process $pid : $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
        } else {
            Write-Host "  Port $port is available" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  Error checking port $port : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Checking for Node.js processes ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "  Terminating: PID $($_.Id) - $($_.Path)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        $killed += "Node.js : Process $($_.Id)"
    }
    Write-Host "  ✅ All Node.js processes terminated" -ForegroundColor Green
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Checking for Python processes (excluding pgAdmin) ===" -ForegroundColor Cyan
$pythonProcesses = Get-Process -Name python,pythonw -ErrorAction SilentlyContinue | Where-Object { 
    $_.Path -notlike "*pgAdmin*" -and $_.Path -notlike "*PostgreSQL*" 
}
if ($pythonProcesses) {
    Write-Host "Found $($pythonProcesses.Count) Python process(es)" -ForegroundColor Yellow
    $pythonProcesses | ForEach-Object {
        Write-Host "  Terminating: PID $($_.Id) - $($_.Path)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        $killed += "Python : Process $($_.Id)"
    }
    Write-Host "  ✅ All Python processes terminated" -ForegroundColor Green
} else {
    Write-Host "No relevant Python processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
if ($killed.Count -gt 0) {
    Write-Host "Terminated $($killed.Count) process(es):" -ForegroundColor Yellow
    $killed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
} else {
    Write-Host "✅ No processes were running on the target ports." -ForegroundColor Green
    Write-Host "All ports (3000, 5000, 8001) are available." -ForegroundColor Green
}

Write-Host ""
Write-Host "Done! ✅" -ForegroundColor Green

