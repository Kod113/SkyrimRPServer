# client_profilo.ps1 - Sceglie a quale server si collega il client SkyMP. Lanciare tramite client_profilo.bat.
#   locale    -> server locale (configs\skymp\skymp5-client-settings.locale.txt)
#   ufficiale -> server ufficiale (copia salvata al primo passaggio a "locale")
#   (niente)  -> mostra il profilo attuale
# Con "locale" si possono aggiungere indirizzo del server e profileId, per collegarsi al server di un altro:
#   client_profilo.bat locale 100.x.y.z 1   -> server su 100.x.y.z, profileId 1
# Cosi' non si modifica a mano nessun file (e niente finisce su git).

param([string]$Profilo, [string]$Ip, [int]$ProfileId)

# Cartella di Skyrim: cambiarla qui se e' installata altrove (stessa di avvia_skymp.ps1)
$Skyrim = 'C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition'

$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Target = Join-Path $Skyrim 'Data\Platform\Plugins\skymp5-client-settings.txt'
$Locale = Join-Path $Repo 'configs\skymp\skymp5-client-settings.locale.txt'
$Backup = Join-Path $Repo '_locale\skymp5-client-settings.ufficiale.txt'

function Stop-WithError($msg) { Write-Host ""; Write-Host "ERRORE: $msg" -ForegroundColor Red; exit 1 }
function Show-Current {
  $c = Get-Content $Target -Raw | ConvertFrom-Json
  $kind = if ($c.gameData.profileId -ne $null) { "LOCALE (offline, profileId $($c.gameData.profileId))" } else { "UFFICIALE (login Discord)" }
  Write-Host "Profilo attuale: $kind -> $($c.'server-ip'):$($c.'server-port')"
}

if (-not (Test-Path $Target)) { Stop-WithError "non trovo $Target. Il client SkyMP e' installato?" }

switch ($Profilo.ToLower()) {
  'locale' {
    $cur = Get-Content $Target -Raw | ConvertFrom-Json
    if ($cur.gameData.profileId -eq $null) {
      New-Item -ItemType Directory -Force -Path (Split-Path $Backup) | Out-Null
      Copy-Item $Target $Backup -Force
      Write-Host "Salvata copia del profilo ufficiale in $Backup"
    }
    try { Copy-Item $Locale $Target -Force -ErrorAction Stop } catch { Stop-WithError "non posso scrivere in $Target ($($_.Exception.Message))" }
    if ($Ip -or $ProfileId) {
      $c = Get-Content $Target -Raw | ConvertFrom-Json
      if ($Ip) { $c.'server-ip' = $Ip }
      if ($ProfileId) { $c.gameData.profileId = $ProfileId }
      # Scrittura senza BOM, come il file originale
      [IO.File]::WriteAllText($Target, ($c | ConvertTo-Json -Depth 5), (New-Object Text.UTF8Encoding($false)))
    }
  }
  'ufficiale' {
    if (-not (Test-Path $Backup)) { Stop-WithError "manca la copia del profilo ufficiale ($Backup). Reinstalla/aggiorna con il launcher SkyMP." }
    try { Copy-Item $Backup $Target -Force -ErrorAction Stop } catch { Stop-WithError "non posso scrivere in $Target ($($_.Exception.Message))" }
  }
  '' { }
  default { Stop-WithError "profilo sconosciuto '$Profilo'. Usa: locale | ufficiale" }
}
Show-Current
