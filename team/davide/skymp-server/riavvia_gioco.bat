@echo off
taskkill /F /IM SkyrimSE.exe
timeout /t 4 >nul
cd /d "C:\Users\39320\Desktop\Skyrim Special Edition 1.7.104 BACKUP"
start "" skse64_loader.exe
