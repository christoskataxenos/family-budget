# FastAPI Server Runner Script for Windows 11 with customizable port
param (
    [int]$Port = 8050
)

Write-Host "Starting FastAPI Backend on Windows 11 on port $Port..." -ForegroundColor Green
$env:DATABASE_URL="sqlite+aiosqlite:///./data/budget.db"
if (-not (Test-Path -Path "./data")) {
    New-Item -ItemType Directory -Path "./data" | Out-Null
}

# Default to system python
$PyExec = "python"

# Check .venv
if (Test-Path ".\.venv\Scripts\python.exe") {
    try {
        & ".\.venv\Scripts\python.exe" -c "import uvicorn" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { $PyExec = ".\.venv\Scripts\python.exe" }
    } catch {}
}

# Check venv
if ($PyExec -eq "python" -and (Test-Path ".\venv\Scripts\python.exe")) {
    try {
        & ".\venv\Scripts\python.exe" -c "import uvicorn" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { $PyExec = ".\venv\Scripts\python.exe" }
    } catch {}
}

Write-Host "Using Python executable: $PyExec" -ForegroundColor Cyan
& $PyExec -m uvicorn app.main:app --reload --host 0.0.0.0 --port $Port
