# Windows 11 Environment Setup Script
Write-Host "Creating Python virtual environment (.venv)..." -ForegroundColor Green
py -3 -m venv .venv

Write-Host "Installing requirements from requirements.txt..." -ForegroundColor Green
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

Write-Host "Running automated tests (pytest)..." -ForegroundColor Green
.\.venv\Scripts\python.exe -m pytest app/tests -v

Write-Host "Setup completed successfully!" -ForegroundColor Cyan
