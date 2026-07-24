# Windows 11 Frontend Development Launcher
Write-Host "Checking frontend npm dependencies..." -ForegroundColor Green
if (-not (Test-Path -Path "./node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Green
    npm install
}

Write-Host "Starting Vite React Frontend server on http://0.0.0.0:3000..." -ForegroundColor Green
npm run dev -- --host
