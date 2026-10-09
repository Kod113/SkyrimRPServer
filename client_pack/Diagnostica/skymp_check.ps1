# skymp_check.ps1 - Controlla perche' SkyMP non parte (privilegi admin, versione Skyrim, aggiornamenti Steam)
# Uso: doppio clic su skymp_check.bat (NON "Esegui come amministratore").
# Uso con correzione: skymp_check.bat fix   -> toglie "Esegui come amministratore" (solo voci dell'utente) dai programmi di Skyrim/SkyMP/Steam
# Il resoconto viene scritto in skymp_check_report.txt nella stessa cartella.

param([switch]$Fix)

$ErrorActionPreference = 'SilentlyContinue'
$report = Join-Path $PSScriptRoot 'skymp_check_report.txt'
$out = New-Object System.Collections.Generic.List[string]
function W($s) { $out.Add([string]$s); Write-Host $s }

W "=== SkyMP check - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
W ""

# 1. Questo script gira come amministratore?
$id = [Security.Principal.WindowsIdentity]::GetCurrent()
$isAdmin = ([Security.Principal.WindowsPrincipal]$id).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
W "[1] Script avviato come amministratore: $isAdmin"
if ($isAdmin) { W "    ATTENZIONE: se hai fatto solo doppio clic e qui c'e' True, Windows avvia TUTTO come amministratore (UAC spento)." }

# 2. UAC
$pol = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System'
W "[2] UAC: EnableLUA=$($pol.EnableLUA)  ConsentPromptBehaviorAdmin=$($pol.ConsentPromptBehaviorAdmin)"
if ($pol.EnableLUA -eq 0) { W "    PROBLEMA: UAC disattivato -> ogni programma parte come amministratore -> il browser di SkyMP (CEF) non parte (codice 38)." }

# 3. Flag di compatibilita' "Esegui come amministratore"
W "[3] Flag di compatibilita' (RUNASADMIN = Esegui come amministratore):"
$pattern = 'skyrim|skse|skymp|steam|mod ?organizer|ModOrganizer'
$found = $false
foreach ($hive in 'HKCU','HKLM') {
  $key = "${hive}:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"
  $item = Get-Item $key
  if (-not $item) { continue }
  foreach ($name in $item.GetValueNames()) {
    if ($name -match $pattern) {
      $val = $item.GetValue($name)
      W "    $hive  $name  =  $val"
      $found = $true
      if ($Fix -and $val -match 'RUNASADMIN') {
        if ($hive -eq 'HKCU' -or $isAdmin) {
          $new = (($val -split ' ') | Where-Object { $_ -ne 'RUNASADMIN' -and $_ -ne '' }) -join ' '
          if ($new -eq '~' -or $new -eq '') { Remove-ItemProperty -Path $key -Name $name; W "      -> FLAG RIMOSSO (voce cancellata)" }
          else { Set-ItemProperty -Path $key -Name $name -Value $new; W "      -> FLAG RIMOSSO (ora: $new)" }
        } else {
          W "      -> voce di sistema (HKLM): serve rilanciare 'skymp_check.bat fix' come amministratore UNA volta, oppure togliere la spunta a mano"
        }
      }
    }
  }
}
if (-not $found) { W "    nessuno" }

# 4. Cartella di Skyrim e versione
$steam = (Get-ItemProperty 'HKCU:\Software\Valve\Steam').SteamPath
if (-not $steam) { $steam = 'C:/Program Files (x86)/Steam' }
$libs = @($steam)
$vdf = Join-Path $steam 'steamapps\libraryfolders.vdf'
if (Test-Path $vdf) { $libs += (Select-String -Path $vdf -Pattern '"path"\s+"(.+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value -replace '\\\\','\' }) }
$skyrim = $null; $acf = $null
foreach ($l in ($libs | Select-Object -Unique)) {
  $p = Join-Path $l 'steamapps\common\Skyrim Special Edition'
  if (Test-Path (Join-Path $p 'SkyrimSE.exe')) { $skyrim = $p; $acf = Join-Path $l 'steamapps\appmanifest_489830.acf'; break }
}
W "[4] Cartella Skyrim: $skyrim"
if ($skyrim) {
  $ver = (Get-Item (Join-Path $skyrim 'SkyrimSE.exe')).VersionInfo.FileVersion
  W "    SkyrimSE.exe versione: $ver   (serve 1.6.1170.0)"
  if ($ver -notlike '1.6.1170*') { W "    PROBLEMA: versione sbagliata -> lanciare Skyrim_1_7_104_to_1_6_1170_patcher.exe nella cartella di Skyrim" }
  W "    skse64_loader.exe presente: $(Test-Path (Join-Path $skyrim 'skse64_loader.exe'))"
  if ($skyrim -like '*Program Files*') { W "    NOTA: Skyrim e' in Program Files: i programmi che ci scrivono (launcher SkyMP) possono chiedere i permessi di amministratore." }
}

# 5. Aggiornamenti automatici di Steam
if ($acf -and (Test-Path $acf)) {
  $au = (Select-String -Path $acf -Pattern '"AutoUpdateBehavior"\s+"(\d)"').Matches.Groups[1].Value
  $bid = (Select-String -Path $acf -Pattern '"buildid"\s+"(\d+)"').Matches.Groups[1].Value
  W "[5] Steam AutoUpdateBehavior=$au (0=sempre aggiornato, 1=solo all'avvio, 2=priorita' alta)  buildid=$bid"
  if ($au -ne '1') { W "    CONSIGLIO: Steam -> Skyrim SE -> Proprieta' -> Aggiornamenti -> 'Aggiorna questo gioco solo quando lo avvio'" }
}

# 6. Launcher SkyMP
W "[6] Launcher SkyMP:"
$cands = @()
foreach ($u in 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*','HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*','HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*') {
  Get-ItemProperty $u | Where-Object { $_.DisplayName -match 'skymp' } | ForEach-Object {
    W "    installato: $($_.DisplayName)  in  $($_.InstallLocation)"
    if ($_.InstallLocation) { $cands += Get-ChildItem $_.InstallLocation -Filter *.exe -Recurse -Depth 1 }
  }
}
foreach ($d in "$env:USERPROFILE\Downloads","$env:USERPROFILE\Desktop","$env:LOCALAPPDATA\Programs") {
  $cands += Get-ChildItem $d -Filter '*skymp*.exe' -Recurse -Depth 2
}
foreach ($f in ($cands | Sort-Object FullName -Unique)) {
  $bytes = [IO.File]::ReadAllBytes($f.FullName)
  $txt = [Text.Encoding]::ASCII.GetString($bytes)
  $lvl = if ($txt -match 'requireAdministrator') { 'requireAdministrator (chiede SEMPRE admin)' } elseif ($txt -match 'highestAvailable') { 'highestAvailable (admin se l''utente e'' admin)' } else { 'asInvoker / non dichiarato' }
  W "    $($f.FullName)  ->  $lvl"
}
if (-not $cands) { W "    nessun eseguibile SkyMP trovato in Download/Desktop/Programs" }

# 7. Processi in esecuzione (se lo script NON e' admin e non riesce ad aprire un processo, quel processo e' elevato)
W "[7] Processi aperti adesso:"
foreach ($n in 'steam','SkyrimSE','skse64_loader','ModOrganizer') {
  foreach ($p in (Get-Process -Name $n)) {
    $h = $null
    try { $h = $p.Handle } catch {}
    $e = if ($isAdmin) { 'n/d (script avviato come admin)' } elseif ($h) { 'NO' } else { 'SI (amministratore)' }
    W "    $($p.ProcessName) (pid $($p.Id)) -> elevato: $e"
  }
}

W ""
W "=== fine ==="
$out | Set-Content -Path $report -Encoding UTF8
Write-Host ""
Write-Host "Resoconto salvato in: $report"
