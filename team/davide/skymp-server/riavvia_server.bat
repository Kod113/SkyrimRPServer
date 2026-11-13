@echo off
taskkill /F /IM node.exe
timeout /t 2 >nul
cd /d "%~dp0"
node dist_back/skymp5-server.js
pause
