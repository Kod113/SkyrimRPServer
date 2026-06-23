@echo off
setlocal enabledelayedexpansion
title SkyrimRP - Launcher
color 0A

:: ============================================================
::  SKYRIM RP SERVER - AUTO LAUNCHER v1.0
::
::  Cosa fa:
::    1. Legge la configurazione da config.ini
::    2. Valida che MO2 e Skyrim siano installati
::    3. Pre-configura il server STR (IP + porta)
::    4. Avvia Skyrim via MO2 con il profilo del server
::
::  Per aggiornare IP o percorsi: modifica config.ini
::  NON modificare questo file direttamente.
:: ============================================================

echo.
echo  ================================================
echo   SKYRIM RP - Avvio automatico
echo  ================================================
echo.

:: --- 1. Carica config.ini ---
set "CONFIG_FILE=%~dp0config.ini"

if not exist "!CONFIG_FILE!" (
    echo  [ERRORE] config.ini non trovato in: %~dp0
    echo  Assicurati che config.ini sia nella stessa cartella del launcher.
    goto :error
)

for /f "usebackq eol=; tokens=1,* delims==" %%a in ("!CONFIG_FILE!") do (
    :: Ignora righe vuote o solo spazi
    if not "%%a"=="" (
        set "%%a=%%b"
    )
)

echo  Server:  !SERVER_IP!:!SERVER_PORT!
echo  Profilo: !MO2_PROFILE!
echo.

:: --- 2. Validazione ---
echo  [1/3] Controllo prerequisiti...

if not exist "!MO2_EXE!" (
    echo  [ERRORE] ModOrganizer.exe non trovato:
    echo          !MO2_EXE!
    echo  Aggiorna MO2_EXE in config.ini
    goto :error
)

if not exist "!SKYRIM_PATH!\SkyrimSE.exe" (
    echo  [ERRORE] SkyrimSE.exe non trovato in:
    echo          !SKYRIM_PATH!
    echo  Aggiorna SKYRIM_PATH in config.ini
    goto :error
)

echo  [OK] MO2 trovato
echo  [OK] Skyrim trovato

:: --- 3. Pre-configura server STR ---
echo.
echo  [2/3] Configurazione server STR...
call :WriteSTRConfig
if errorlevel 1 goto :error
echo  [OK] Server pre-configurato: !SERVER_IP!:!SERVER_PORT!

:: --- 4. Avvio Skyrim ---
echo.
echo  [3/3] Avvio Skyrim tramite MO2...
echo.

:: Lancia SKSE attraverso il profilo MO2 configurato.
:: "moshortcut://PROFILO/NOME_ESEGUIBILE" usa la lista eseguibili di MO2.
:: Il nome dopo lo slash deve corrispondere esattamente a quello in MO2.
start "" "!MO2_EXE!" "moshortcut://!MO2_PROFILE!/!MO2_SKSE_NAME!"

echo  ================================================
echo   Skyrim avviato!
echo   Una volta in gioco, apri STR e clicca Connect.
echo   Il server e' gia' pre-compilato.
echo  ================================================
echo.
timeout /t 8 /nobreak > nul
exit /b 0

:: ============================================================
:: FUNZIONE: Scrive la configurazione server nel file STR
:: ============================================================
:WriteSTRConfig
    :: Percorso config STR (Together Reborn salva in AppData\Local)
    :: TODO: verificare il percorso esatto dopo primo avvio di STR
    set "STR_CFG_DIR=%LOCALAPPDATA%\SkyrimTogetherReborn"
    set "STR_CFG_FILE=!STR_CFG_DIR!\STRSettings.toml"

    if not exist "!STR_CFG_DIR!" (
        mkdir "!STR_CFG_DIR!" 2>nul
        if errorlevel 1 (
            echo  [WARN] Impossibile creare cartella STR config. Salto pre-config.
            exit /b 0
        )
    )

    :: Scrive il config con IP e porta del server
    :: NOTA: formato .toml verificato da aggiornare se STR usa JSON o altro
    (
        echo ; Auto-generato da SkyrimRP Launcher - non modificare manualmente
        echo [server]
        echo ip = "!SERVER_IP!"
        echo port = !SERVER_PORT!
    ) > "!STR_CFG_FILE!"

    exit /b 0

:: ============================================================
:: ERRORE - pausa per leggere il messaggio
:: ============================================================
:error
    echo.
    echo  Premi un tasto per chiudere...
    pause > nul
    exit /b 1
