@echo off
rem Controllo avvio SkyMP. Doppio clic = solo controllo. "skymp_check.bat fix" = controllo + correzione.
rem NON avviare come amministratore.
if /I "%~1"=="fix" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0skymp_check.ps1" -Fix
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0skymp_check.ps1"
)
echo.
pause
