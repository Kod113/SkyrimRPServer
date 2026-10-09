@echo off
rem Avvia SkyMP senza privilegi di amministratore. Doppio clic, NON "Esegui come amministratore".
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0avvia_skymp.ps1"
