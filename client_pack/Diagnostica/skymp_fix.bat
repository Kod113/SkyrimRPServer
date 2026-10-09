@echo off
rem Toglie la spunta "Esegui come amministratore" da Steam, Mod Organizer 2 e Skyrim (solo per il tuo utente).
rem Motivo: se Steam o il gioco partono come amministratore, il browser interno di SkyMP non si avvia (CEF codice 38)
rem e il gioco resta fermo sulla schermata di caricamento.
rem Avviare con doppio clic, NON come amministratore. Chiudere Steam prima.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0skymp_check.ps1" -Fix
echo.
echo Fatto. Riapri Steam normalmente e avvia SkyMP con client_pack\SkyMP\avvia_skymp.bat
pause
