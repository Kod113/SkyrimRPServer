@echo off
rem Copia il lavoro del server locale (Reborn RP) nella cartella personale del repo GitHub condiviso.
rem Copia solo codice, script e dati; NON copia log, file temporanei, backup e i file di SkyMP (dist_back, world, scam_native.node).
rem Dopo averlo lanciato: GitHub Desktop -> Commit to main -> Push origin.
set "SRC=C:\Users\39320\Desktop\Server\skymp-server"
set "DST=%USERPROFILE%\Documents\GitHub\SkyrimRPServer\team\davide\skymp-server"
robocopy "%SRC%" "%DST%" gamemode.js *.bat *.ps1 *.json raccolta-*.txt /XF package.json server-settings-merged.json server-settings-dump.json evoked-ids.json backup-*.json terra-punti.json terra-punti-v2.json terra-punti-v3.json /NJH /NP
echo.
echo Fatto. Ora apri GitHub Desktop: Commit to main, poi Push origin.
pause
