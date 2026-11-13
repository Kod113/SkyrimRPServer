@echo off
taskkill /F /IM SkyrimSE.exe
taskkill /F /IM node.exe
timeout /t 3 /nobreak
cd /d "%~dp0"
start "SERVER SKYMP" /min cmd /c "node dist_back/skymp5-server.js > server-out.txt 2>&1"
timeout /t 45 /nobreak
cd /d "C:\Users\39320\Desktop\Skyrim Special Edition 1.7.104 BACKUP"
start "" skse64_loader.exe
