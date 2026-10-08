# server_locale.ps1 - Avvia il server SkyMP locale (offline mode) per provare le mod. Lanciare tramite server_locale.bat.
# La prima volta scarica il server (fork jqntn/skymp) in <repo>\_locale\skymp-server (ignorata da git).
# La configurazione vera e' configs\skymp\server-settings.json: viene copiata nel server a ogni avvio.

$Release = 'https://github.com/jqntn/skymp/releases/download/jqntn-2026-10-05/skymp-server.zip'

$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Base = Join-Path $Repo '_locale'
$ServerDir = Join-Path $Base 'skymp-server'
$Config = Join-Path $Repo 'configs\skymp\server-settings.json'

function Stop-WithError($msg) { Write-Host ""; Write-Host "ERRORE: $msg" -ForegroundColor Red; Write-Host ""; Read-Host "Premi Invio per chiudere"; exit 1 }

# 1. Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Stop-WithError "Node.js non e' installato. Installalo (versione LTS) da https://nodejs.org oppure con: winget install OpenJS.NodeJS.LTS  - poi riapri questo file." }
Write-Host "Node.js $(node -v)"

# 2. Server: scaricalo se manca
if (-not (Test-Path (Join-Path $ServerDir 'dist_back\skymp5-server.js'))) {
  Write-Host "Server non trovato: lo scarico da $Release ..."
  New-Item -ItemType Directory -Force -Path $Base | Out-Null
  $zip = Join-Path $Base 'skymp-server.zip'
  try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $Release -OutFile $zip -UseBasicParsing -ErrorAction Stop
    Expand-Archive -Path $zip -DestinationPath $Base -Force -ErrorAction Stop
    Remove-Item $zip
  } catch { Stop-WithError "download o estrazione fallita: $($_.Exception.Message)" }
}

# 3. Configurazione dal repo
if (-not (Test-Path $Config)) { Stop-WithError "manca $Config" }
$cfg = Get-Content $Config -Raw | ConvertFrom-Json
foreach ($f in $cfg.loadOrder) {
  $p = if ([IO.Path]::IsPathRooted($f)) { $f } else { Join-Path (Join-Path $ServerDir $cfg.dataDir) $f }
  if (-not (Test-Path $p)) { Stop-WithError "file del loadOrder non trovato: $p  (correggi configs\skymp\server-settings.json)" }
}
# Password di rete: il client SkyMP si collega solo se la sua password (Data\Platform\Distribution\password,
# es. '1c3b345' = versione della build) coincide con quella del server. La leggiamo dal client installato,
# cosi' il server locale accetta il client ufficiale anche dopo i suoi aggiornamenti.
$Skyrim = 'C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition'
$pwFile = Join-Path $Skyrim 'Data\Platform\Distribution\password'
if (-not $cfg.password -and (Test-Path $pwFile)) {
  $pw = (Get-Content $pwFile -Raw).Trim()
  $cfg | Add-Member -NotePropertyName password -NotePropertyValue $pw -Force
  Write-Host "Password di rete presa dal client: $pw"
}
# Scrittura senza BOM (Node non legge il JSON con il BOM)
[IO.File]::WriteAllText((Join-Path $ServerDir 'server-settings.json'), ($cfg | ConvertTo-Json -Depth 10), (New-Object Text.UTF8Encoding($false)))

# 4. Avvio
Write-Host ""
Write-Host "Avvio server '$($cfg.name)' sulla porta $($cfg.port) (offline mode = $($cfg.offlineMode))." -ForegroundColor Green
Write-Host "Se Windows chiede il permesso del firewall per Node.js: CONSENTI (non Annulla)."
Write-Host "Per spegnere il server: chiudi questa finestra o premi Ctrl+C."
Write-Host ""
Push-Location $ServerDir
try { & node 'dist_back/skymp5-server.js' } finally { Pop-Location }
Write-Host ""
Read-Host "Server fermato. Premi Invio per chiudere"
