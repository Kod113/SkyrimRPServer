@echo off
rem Riavvio PULITO: uccide TUTTI i guardiani e TUTTI i node (anche quelli orfani), poi riparte con un solo guardiano.
cd /d "%~dp0"
taskkill /F /IM SkyrimSE.exe >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'guardiano.ps1' -and $_.ProcessId -ne $PID } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
taskkill /F /IM node.exe >nul 2>&1
timeout /t 4 /nobreak >nul
taskkill /F /IM node.exe >nul 2>&1
del crash-log.txt >nul 2>&1
start "GUARDIANO SERVER" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0guardiano.ps1"
timeout /t 45 /nobreak
cd /d "C:\Users\39320\Desktop\Skyrim Special Edition 1.7.104 BACKUP"
start "" skse64_loader.exe
