# avvia_skymp.ps1 - Avvia SkyMP senza privilegi di amministratore (lanciare tramite avvia_skymp.bat).
# Il launcher "SkyMP [....].exe" chiede SEMPRE i permessi di amministratore e li passa al gioco:
# cosi' il browser interno di SkyMP (login Discord) non parte (CEF codice 38) e il gioco resta sulla
# schermata di caricamento. Il launcher serve solo per installare/aggiornare: per giocare si usa questo.

# Cartella di Skyrim: cambiarla qui se e' installata altrove
$Skyrim = 'C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition'

function Stop-WithError($msg) { Write-Host ""; Write-Host "ERRORE: $msg" -ForegroundColor Red; Write-Host ""; Read-Host "Premi Invio per chiudere"; exit 1 }

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) { Stop-WithError "questo file e' stato avviato come amministratore. Chiudi e riavvialo con un doppio clic normale." }

$loader = Join-Path $Skyrim 'skse64_loader.exe'
if (-not (Test-Path $loader)) { Stop-WithError "non trovo skse64_loader.exe in '$Skyrim'. Correggi la riga `$Skyrim in avvia_skymp.ps1." }

$ver = (Get-Item (Join-Path $Skyrim 'SkyrimSE.exe')).VersionInfo.FileVersion
if ($ver -notlike '1.6.1170*') { Stop-WithError "Skyrim e' alla versione $ver, serve la 1.6.1170. Steam l'ha aggiornato: lancia Skyrim_1_7_104_to_1_6_1170_patcher.exe nella cartella di Skyrim." }

$steam = Get-Process steam -ErrorAction SilentlyContinue | Select-Object -First 1
if ($steam) {
  $h = $null; try { $h = $steam.Handle } catch {}
  if (-not $h) { Stop-WithError "Steam e' aperto come amministratore. Chiudi Steam, lancia client_pack\Diagnostica\skymp_fix.bat e riapri Steam." }
} else {
  Write-Host "Avvio Steam..."
  Start-Process 'steam://open/main'
}

# Aspetta che Steam abbia fatto l'accesso: se Skyrim parte prima, Steam lo riavvia da solo
# tramite SkyrimSELauncher.exe e SKSE (quindi SkyMP) non viene caricato.
$t = 0
while (((Get-ItemProperty 'HKCU:\Software\Valve\Steam\ActiveProcess' -ErrorAction SilentlyContinue).ActiveUser -as [int]) -eq 0 -and $t -lt 120) {
  if ($t -eq 0) { Write-Host "Aspetto che Steam finisca l'accesso..." }
  Start-Sleep -Seconds 2; $t += 2
}
if ($t -ge 120) { Stop-WithError "Steam non ha completato l'accesso entro 2 minuti. Fai l'accesso a Steam e riprova." }
if ($t -gt 0) { Start-Sleep -Seconds 5 }

Write-Host "Avvio SkyMP (Skyrim $ver + SKSE)..."
Start-Process -FilePath $loader -WorkingDirectory $Skyrim
Start-Sleep -Seconds 2
