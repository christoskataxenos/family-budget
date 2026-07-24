# Family Budget System - Unified Windows 11 Launcher
# Usage: .\run_all_win11.ps1

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Starting Family Budget & Finance Tracker System   " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

# Define directory paths
$RootDir = $PSScriptRoot
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

# 1. Start FastAPI Backend in a new PowerShell window
Write-Host "[1/2] Launching Backend API (Port 8050) in new window..." -ForegroundColor Yellow
Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "Set-Location '$BackendDir'; .\run_win11.ps1"

# Wait 2 seconds for backend startup
Start-Sleep -Seconds 2

# 2. Start Vite React Frontend in current window
Write-Host "[2/2] Launching Frontend Server (Port 3000)..." -ForegroundColor Yellow
Write-Host "App will be available at: http://localhost:3000 (and on Network via your IP:3000)" -ForegroundColor Green
Set-Location $FrontendDir
.\run_frontend_win11.ps1
