@echo off
rem Sceglie il server del client SkyMP. Uso: client_profilo.bat locale ^| ufficiale  (senza argomenti mostra quello attuale)
rem Doppio clic = passa al server LOCALE.
rem Server di un altro PC: client_profilo.bat locale 100.x.y.z 1   (indirizzo del server, profileId)
set P=%~1
if "%P%"=="" set P=locale
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0client_profilo.ps1" %P% %2 %3
echo.
pause
