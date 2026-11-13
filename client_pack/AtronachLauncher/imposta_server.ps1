# imposta_server.ps1 - Sceglie a quale server si collega il launcher, SOLO su questo PC. Lanciare tramite "Imposta server.bat".
#   Imposta server.bat 100.x.y.z        -> server personale su 100.x.y.z, porta 7777
#   Imposta server.bat 100.x.y.z 7777   -> come sopra, porta indicata
#   Imposta server.bat nessuno          -> torna al server di config.json
#   (niente)                            -> chiede l'indirizzo in una finestra
# Scrive solo %APPDATA%\AtronachRP\server.json: nessun file del repo cambia (e niente finisce su git).

param([string]$Ip, [int]$Porta = 7777)

$AppDir = Join-Path $env:APPDATA 'AtronachRP'
$ServerPath = Join-Path $AppDir 'server.json'
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null

if (-not $Ip) {
  Add-Type -AssemblyName Microsoft.VisualBasic
  $Ip = [Microsoft.VisualBasic.Interaction]::InputBox("Scrivi l'indirizzo del server che ti ha dato lo staff (es. 100.101.102.103).`nScrivi 'nessuno' per tornare al server normale.", 'Atronach RP', '')
  if (-not $Ip) { Write-Host 'Nessuna modifica.'; exit 0 }
}
$Ip = $Ip.Trim()

if ($Ip.ToLower() -eq 'nessuno') {
  if (Test-Path $ServerPath) { Remove-Item $ServerPath -Force }
  Write-Host 'Server personale tolto: il launcher usa di nuovo quello di config.json.'
  exit 0
}

if ($Ip -notmatch '^\d{1,3}(\.\d{1,3}){3}$') { Write-Host "ERRORE: '$Ip' non sembra un indirizzo (forma 100.x.y.z)." -ForegroundColor Red; exit 1 }

$json = [pscustomobject]@{ server_ip = $Ip; server_port = $Porta } | ConvertTo-Json
[IO.File]::WriteAllText($ServerPath, $json, (New-Object Text.UTF8Encoding($false)))
Write-Host "Fatto: il launcher si collega a ${Ip}:$Porta"
Write-Host 'Ora apri "Avvia Atronach RP.bat" e premi Imposta accanto a "Collegato al server" se e'' rosso.'
