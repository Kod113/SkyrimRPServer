@echo off
rem Sceglie il server del launcher solo su questo PC (scrive %APPDATA%\AtronachRP\server.json).
rem Uso: "Imposta server.bat" 100.x.y.z [porta]   oppure   "Imposta server.bat" nessuno
rem Doppio clic = chiede l'indirizzo in una finestra.
powershell -NoProfile -ExecutionPolicy Bypass -STA -File "%~dp0imposta_server.ps1" %1 %2
echo.
pause
