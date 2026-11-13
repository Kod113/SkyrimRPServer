@echo off
rem Avvia il server e lo riavvia da solo se si chiude o si blocca. Scrive i motivi in crash-log.txt
cd /d "%~dp0"
taskkill /F /IM node.exe >nul 2>&1
start "GUARDIANO SERVER" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0guardiano.ps1"
