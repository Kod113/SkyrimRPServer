@echo off
rem Riavvio completo: chiude Skyrim, il vecchio guardiano e il server, riavvia il server col guardiano (si riavvia da solo se crolla), poi apre Skyrim.
cd /d "%~dp0"
taskkill /F /IM SkyrimSE.exe >nul 2>&1
if exist guardiano.pid for /f %%p in (guardiano.pid) do taskkill /F /PID %%p >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
start "GUARDIANO SERVER" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0guardiano.ps1"
timeout /t 45 /nobreak
cd /d "C:\Users\39320\Desktop\Skyrim Special Edition 1.7.104 BACKUP"
start "" skse64_loader.exe
