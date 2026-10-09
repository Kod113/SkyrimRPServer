# skymp_net_check.ps1 - Perche' SkyMP resta su "Connecting to <ip>:<porta>"?
# Controlla: server nel master, risposta UDP del server (ping RakNet), firewall di Windows, VPN/adattatori, socket di Skyrim.
# Uso: doppio clic su skymp_net_check.bat (NON serve amministratore).
#      skymp_net_check.bat 100.64.1.2:7777   -> prova un server diverso (es. quello di Davide via Tailscale)
#      Meglio lanciarlo MENTRE Skyrim e' fermo su "Connecting": cosi' controlla anche il socket del gioco.
# Il resoconto viene scritto in skymp_net_report.txt nella stessa cartella.

param([string]$Server, [switch]$Fix)

$ErrorActionPreference = 'SilentlyContinue'
$report = Join-Path $PSScriptRoot 'skymp_net_report.txt'
$out = New-Object System.Collections.Generic.List[string]
function W($s) { $out.Add([string]$s); Write-Host $s }

# Cartella di Skyrim: cambiarla qui se e' installata altrove (stessa di client_pack\SkyMP\avvia_skymp.ps1)
$Skyrim = 'C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition'
$SkyrimExe = Join-Path $Skyrim 'SkyrimSE.exe'

# Modalita' correzione (lanciata da "skymp_net_check.bat fix", gira come amministratore):
# spegne (non cancella) le regole BLOCCA per SkyrimSE.exe e aggiunge una regola CONSENTI in ingresso UDP.
if ($Fix) {
  $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  if (-not $isAdmin) { Write-Host "La correzione del firewall richiede i permessi di amministratore."; exit 1 }
  $n = 0
  foreach ($f in Get-NetFirewallApplicationFilter | Where-Object { $_.Program -match 'SkyrimSE\.exe' }) {
    $r = $f | Get-NetFirewallRule
    if ($r -and $r.Action -eq 'Block' -and $r.Enabled -eq 'True') {
      $r | Set-NetFirewallRule -Enabled False
      Write-Host "Spenta regola BLOCCA: $($r.DisplayName) [$($r.Direction)] $($f.Program)"; $n++
    }
  }
  if ($n -eq 0) { Write-Host "Nessuna regola BLOCCA attiva per SkyrimSE.exe." }
  $name = 'SkyMP - SkyrimSE (UDP in)'
  if (-not (Get-NetFirewallRule -DisplayName $name)) {
    New-NetFirewallRule -DisplayName $name -Direction Inbound -Program $SkyrimExe -Protocol UDP -Action Allow -Profile Any | Out-Null
    Write-Host "Aggiunta regola CONSENTI: $name ($SkyrimExe)"
  } else { Write-Host "Regola '$name' gia' presente." }
  exit 0
}

W "=== SkyMP network check - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
W ""

# 1. Impostazioni del client
$settingsPath = Join-Path $Skyrim 'Data\Platform\Plugins\skymp5-client-settings.txt'
$cfg = $null
if (Test-Path $settingsPath) { $cfg = Get-Content $settingsPath -Raw | ConvertFrom-Json }
W "[1] skymp5-client-settings.txt"
if ($cfg) {
  W "    server-ip=$($cfg.'server-ip')  server-port=$($cfg.'server-port')  master=$($cfg.master)  server-master-key=$($cfg.'server-master-key')"
  if ($cfg.gameData) { W "    gameData.profileId=$($cfg.gameData.profileId)  (offline mode)" }
  W "    ultima modifica: $((Get-Item $settingsPath).LastWriteTime)"
} else {
  W "    NON TROVATO o non leggibile: $settingsPath"
}

if ($Server) {
  $parts = $Server.Split(':'); $ip = $parts[0]; $port = [int]$parts[1]
} elseif ($cfg) {
  $ip = $cfg.'server-ip'; $port = [int]$cfg.'server-port'
}
if (-not $ip -or -not $port) { W "    Nessun server da provare."; $out | Set-Content $report -Encoding UTF8; exit 1 }
W "    Server da provare: ${ip}:${port}"
W ""

# 2. Master server (lista ufficiale)
W "[2] Master server gateway.skymp.net (lista dei server):"
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $list = Invoke-RestMethod -Uri 'https://gateway.skymp.net/api/servers' -TimeoutSec 10 -ErrorAction Stop
  foreach ($s in $list) { W ("    {0,-25} porta={1,-6} online={2}/{3}" -f $s.name, $s.port, $s.online, $s.maxPlayers) }
} catch {
  W "    ERRORE: master non raggiungibile ($($_.Exception.Message)). Problema di rete/DNS/antivirus su HTTPS?"
}
W ""

# 3. Ping RakNet (UDP) al server: la stessa strada che usa il gioco, ma da PowerShell
W "[3] Ping UDP RakNet a ${ip}:${port} (3 tentativi, 2 s ciascuno):"
$magic = [byte[]](0x00,0xFF,0xFF,0x00,0xFE,0xFE,0xFE,0xFE,0xFD,0xFD,0xFD,0xFD,0x12,0x34,0x56,0x78)
$guid = New-Object byte[] 8; (New-Object Random).NextBytes($guid)
function New-Ping([int]$timeBytes) {
  $p = New-Object System.Collections.Generic.List[byte]
  $p.Add(0x01)                                   # ID_UNCONNECTED_PING
  $p.AddRange([byte[]](New-Object byte[] $timeBytes))
  $p.AddRange($magic)
  $p.AddRange($guid)
  return ,$p.ToArray()
}
$pong = $false
$udp = New-Object System.Net.Sockets.UdpClient
$udp.Client.ReceiveTimeout = 2000
try { $udp.Connect($ip, $port) } catch { W "    ERRORE: indirizzo non valido ($($_.Exception.Message))" }
for ($i = 1; $i -le 3 -and -not $pong; $i++) {
  try {
    $a = New-Ping 8; $b = New-Ping 4
    [void]$udp.Send($a, $a.Length); [void]$udp.Send($b, $b.Length)
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $remote = New-Object System.Net.IPEndPoint([Net.IPAddress]::Any, 0)
    $resp = $udp.Receive([ref]$remote)
    $ms = $sw.ElapsedMilliseconds
    if ($resp -and $resp[0] -eq 0x1C) {
      $pong = $true
      $extra = ''
      if ($resp.Length -gt 33) { $extra = ([Text.Encoding]::UTF8.GetString($resp, 33, $resp.Length - 33)) -replace '[^\x20-\x7E]', '.' }
      W "    tentativo ${i}: RISPOSTA (pong) in $ms ms, $($resp.Length) byte $(if ($extra) { "- dati: $extra" })"
    } else {
      W "    tentativo ${i}: risposta strana (primo byte $('{0:X2}' -f $resp[0]), $($resp.Length) byte)"
    }
  } catch {
    $m = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $_.Exception.Message }
    W "    tentativo ${i}: nessuna risposta ($m)"
  }
}
$udp.Close()
if ($pong) {
  W "    => Il server e' ACCESO e la tua rete lo raggiunge in UDP. Se il gioco resta su Connecting, il blocco e' sul PC"
  W "       (firewall per SkyrimSE.exe, antivirus) o nel client (versione/patch): vedi punti 4-6."
} else {
  W "    => NESSUNA risposta UDP. Cause possibili: server spento o IP cambiato, rete/router/operatore che blocca UDP,"
  W "       VPN attiva, antivirus/firewall di terze parti. Prova da un'altra rete (es. hotspot del telefono)."
}
W ""

# 4. Firewall di Windows
W "[4] Firewall di Windows"
foreach ($p in Get-NetFirewallProfile) { W ("    profilo {0,-8} attivo={1}  in-ingresso predefinito={2}" -f $p.Name, $p.Enabled, $p.DefaultInboundAction) }
foreach ($c in Get-NetConnectionProfile) { W "    rete '$($c.Name)' su $($c.InterfaceAlias): categoria $($c.NetworkCategory)" }
W "    Regole che riguardano Skyrim/SKSE/SkyMP:"
$rules = @()
$filters = Get-NetFirewallApplicationFilter | Where-Object { $_.Program -match 'SkyrimSE\.exe|skse64_loader\.exe|SkyMP|SkyrimPlatformCEF' }
foreach ($f in $filters) {
  $r = $f | Get-NetFirewallRule
  if ($r) { $rules += [pscustomobject]@{ Rule = $r; Program = $f.Program } }
}
if ($rules.Count -eq 0) {
  W "    nessuna regola (normale se Windows non ha mai mostrato l'avviso 'Consenti accesso' per Skyrim)"
} else {
  foreach ($x in $rules) {
    $r = $x.Rule
    $pf = ($r | Get-NetFirewallPortFilter)
    $flag = ''
    if ($r.Action -eq 'Block' -and $r.Enabled -eq 'True') { $flag = '   <-- BLOCCA' }
    W ("    [{0}] {1} {2} profili={3} proto={4}  '{5}'  {6}{7}" -f $r.Direction, $r.Action, $(if ($r.Enabled -eq 'True') {'attiva'} else {'spenta'}), $r.Profile, $pf.Protocol, $r.DisplayName, $x.Program, $flag)
  }
}
$blocking = $rules | Where-Object { $_.Rule.Action -eq 'Block' -and $_.Rule.Enabled -eq 'True' }
if ($blocking) {
  W "    PROBLEMA PROBABILE: c'e' almeno una regola BLOCCA attiva per Skyrim. Nasce quando all'avviso del firewall si preme"
  W "    'Annulla' (o l'avviso resta nascosto dietro al gioco). Le regole Blocca vincono sulle Consenti."
  W "    Correzione: 'skymp_net_check.bat fix' (chiede i permessi di amministratore solo per il firewall)."
}
W "    Firewall/antivirus di terze parti registrati:"
$sec = @()
$sec += Get-CimInstance -Namespace root/SecurityCenter2 -ClassName FirewallProduct
$sec += Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct
if ($sec.Count -eq 0) { W "    nessuno (solo Windows Defender)" } else { foreach ($s in $sec) { W "    $($s.displayName)" } }
W ""

# 5. VPN e adattatori di rete attivi
W "[5] Adattatori attivi (le VPN possono deviare o bloccare l'UDP):"
foreach ($a in Get-NetAdapter | Where-Object Status -eq 'Up') {
  $vpn = if ($a.InterfaceDescription -match 'Tailscale|WireGuard|Wintun|TAP|VPN|Hamachi|ZeroTier|Radmin|NordLynx|OpenVPN') { '   <-- VPN' } else { '' }
  W "    $($a.Name) - $($a.InterfaceDescription)$vpn"
}
$def = Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Sort-Object { $_.RouteMetric + $_.InterfaceMetric } | Select-Object -First 1
if ($def) { W "    Uscita verso Internet (route predefinita): $($def.InterfaceAlias)" }
W ""

# 6. Skyrim e' aperto? Che socket UDP usa?
W "[6] Processo del gioco:"
$sk = Get-Process SkyrimSE -ErrorAction SilentlyContinue | Select-Object -First 1
if ($sk) {
  $h = $null; try { $h = $sk.Handle } catch {}
  W "    SkyrimSE.exe aperto (PID $($sk.Id)), elevato=$(if ($h) {'no'} else {'SI (o non leggibile)'})"
  $eps = Get-NetUDPEndpoint -OwningProcess $sk.Id
  if ($eps) { foreach ($e in $eps) { W "    socket UDP locale $($e.LocalAddress):$($e.LocalPort)" } } else { W "    nessun socket UDP: il client di rete (MpClientPlugin) non ha aperto la connessione" }
} else {
  W "    SkyrimSE.exe non e' aperto (per questo punto lancia lo script mentre il gioco e' su 'Connecting')"
}
W ""
W "=== fine ==="
$out | Set-Content $report -Encoding UTF8
W ""
W "Resoconto salvato in: $report"
