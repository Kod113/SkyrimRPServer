@echo off
rem Controllo rete SkyMP ("resta su Connecting"). NON avviare come amministratore.
rem   doppio clic                      -> controlla il server scritto in skymp5-client-settings.txt
rem   skymp_net_check.bat 1.2.3.4:7777 -> controlla un altro server (es. quello di Davide via Tailscale)
rem   skymp_net_check.bat fix          -> sistema il firewall per SkyrimSE.exe (chiede i permessi di amministratore)
if /I "%~1"=="fix" (
  powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-NoExit','-ExecutionPolicy','Bypass','-File','\"%~dp0skymp_net_check.ps1\"','-Fix'"
  goto :eof
)
if "%~1"=="" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0skymp_net_check.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0skymp_net_check.ps1" -Server "%~1"
)
echo.
pause
