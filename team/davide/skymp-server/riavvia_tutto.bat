@echo off
taskkill /F /IM SkyrimSE.exe
taskkill /F /IM node.exe
timeout /t 12 /nobreak
taskkill /F /IM node.exe
timeout /t 3 /nobreak
cd /d "%~dp0"
start "SERVER SKYMP" cmd /k node dist_back/skymp5-server.js
timeout /t 45 /nobreak
cd /d "C:\Users\39320\Desktop\Skyrim Special Edition 1.7.104 BACKUP"
start "" skse64_loader.exe
