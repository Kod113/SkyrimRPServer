@echo off
rem Avvia il launcher di Atronach RP. Doppio clic normale, NON "Esegui come amministratore".
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File "%~dp0launcher.ps1"
