# Atronach RP - Launcher
# Si avvia con un doppio clic su "Avvia Atronach RP.bat" (NON come amministratore).
# Controlla il PC del giocatore, sistema da solo quello che può e avvia il gioco collegato al server.
# Da v0.3: installa da solo SKSE e il client SkyMP, riporta Skyrim alla versione giusta (downgrade)
# e dà il numero di giocatore. Il pulsante grande dice SISTEMA TUTTO finché manca qualcosa, poi GIOCA.
# Specifica: specs/platform/launcher.md
#
# Com'è fatto:
#   launcher.ps1   questo file: i controlli, cosa fanno i pulsanti, l'avvio del gioco
#   finestra.xaml  l'aspetto della finestra (WPF)
#   risorse\       sfondo, icona e carattere del titolo
#
# ATTENZIONE: questo file va salvato come "UTF-8 con BOM", altrimenti Windows PowerShell
# legge male le lettere accentate (è, à, ù).

param(
  # Solo per i test: apre la finestra, salva in questa cartella le immagini di alcuni stati e si chiude.
  # Non modifica niente sul PC.
  [string]$Anteprima = ''
)

$Versione = '0.3.0'

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Xaml
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Application]::EnableVisualStyles()

# ------------------------------------------------------------------ impostazioni

$Here = $PSScriptRoot
$Risorse = Join-Path $Here 'risorse'
$Cfg = Get-Content (Join-Path $Here 'config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$AppDir = Join-Path $env:APPDATA 'AtronachRP'
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
$StatePath = Join-Path $AppDir 'impostazioni.json'
$LogPath = Join-Path $AppDir 'launcher.log'

function Write-Log($msg) { Add-Content -Path $LogPath -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" -Encoding UTF8 }
if ('è'.Length -ne 1) { Write-Log 'ATTENZIONE: launcher.ps1 non è salvato come UTF-8 con BOM, le lettere accentate si vedranno male' }

# Server personale (facoltativo): %APPDATA%\AtronachRP\server.json, scritto da "Imposta server.bat".
# Serve a chi si collega al server di un altro PC (es. via Tailscale) senza modificare config.json del repo.
$ServerPath = Join-Path $AppDir 'server.json'
$ServerPersonale = $false
if (Test-Path $ServerPath) {
  try {
    $sp = Get-Content $ServerPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($sp.server_ip) { $Cfg.server_ip = [string]$sp.server_ip; $ServerPersonale = $true }
    if ($sp.server_port) { $Cfg.server_port = [int]$sp.server_port }
    if ($ServerPersonale) { Write-Log "Server personale da server.json: $($Cfg.server_ip):$($Cfg.server_port)" }
  } catch { Write-Log "server.json illeggibile, uso config.json ($($_.Exception.Message))" }
}

$State = $null
if (Test-Path $StatePath) { try { $State = Get-Content $StatePath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $State = $null } }
if (-not $State) { $State = New-Object PSObject }
foreach ($p in 'skyrim', 'profileId', 'clientNuovo') {
  if (-not $State.PSObject.Properties[$p]) { $State | Add-Member -NotePropertyName $p -NotePropertyValue $null }
}
function Save-State { $State | ConvertTo-Json | Set-Content -Path $StatePath -Encoding UTF8 }

# ------------------------------------------------------------------ il launcher non deve essere amministratore

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin -and -not $Anteprima) {
  [void][System.Windows.MessageBox]::Show("Hai aperto il launcher come amministratore.`n`nChiudi questa finestra e riaprilo con un normale doppio clic (senza 'Esegui come amministratore').", $Cfg.nome, 'OK', 'Warning')
  exit
}

# ------------------------------------------------------------------ finestra: caricamento

# Legge finestra.xaml, ripete la riga dei controlli una volta per controllo e crea la finestra.
function New-Finestra($quanteRighe) {
  $xaml = [IO.File]::ReadAllText((Join-Path $Here 'finestra.xaml'), [Text.Encoding]::UTF8)
  $m = [regex]::Match($xaml, '(?s)<!--RIGA-->(.*?)<!--/RIGA-->')
  if (-not $m.Success) { throw 'In finestra.xaml mancano i segni <!--RIGA--> e <!--/RIGA-->.' }
  $righe = ''
  for ($i = 0; $i -lt $quanteRighe; $i++) { $righe += $m.Groups[1].Value.Replace('RigaN_', "Riga${i}_") }
  $xaml = $xaml.Substring(0, $m.Index) + $righe + $xaml.Substring($m.Index + $m.Length)
  return [System.Windows.Markup.XamlReader]::Parse($xaml)
}

# Lascia che la finestra si ridisegni e risponda al mouse mentre il launcher sta aspettando qualcosa.
$AzioneVuota = [System.Action]{ $null }
function Invoke-Pump {
  $Window.Dispatcher.Invoke($AzioneVuota, [System.Windows.Threading.DispatcherPriority]::Background)
}

function Wait-Seconds([double]$sec) {
  $fine = [DateTime]::UtcNow.AddSeconds($sec)
  while ([DateTime]::UtcNow -lt $fine -and -not $script:Chiusura) { Start-Sleep -Milliseconds 25; Invoke-Pump }
}

# ------------------------------------------------------------------ finestra: avvisi e domande
# Compaiono sopra la finestra e la bloccano finché non si risponde.
# Restituisce $true (pulsante pieno), $false (l'altro pulsante o Esc) oppure $null (finestra chiusa).

function Show-Dialogo($titolo, $testo, $si = 'OK', $no = $null, [switch]$Campo) {
  if ($script:Chiusura -or $Anteprima) { return $null }
  $UI.VeloTitolo.Text = $titolo
  $UI.VeloTesto.Text = $testo
  $UI.VeloSi.Content = $si
  if ($no) { $UI.VeloNo.Content = $no; $UI.VeloNo.Visibility = 'Visible' } else { $UI.VeloNo.Visibility = 'Collapsed' }
  if ($Campo) { $UI.VeloCampo.Text = ''; $UI.VeloCampo.Visibility = 'Visible' } else { $UI.VeloCampo.Visibility = 'Collapsed' }
  $script:VeloEsito = $null
  $UI.Velo.Visibility = 'Visible'
  if ($Campo) { [void]$UI.VeloCampo.Focus() } else { [void]$UI.VeloSi.Focus() }
  $script:VeloFrame = New-Object System.Windows.Threading.DispatcherFrame
  [System.Windows.Threading.Dispatcher]::PushFrame($script:VeloFrame)
  $script:VeloFrame = $null
  $UI.Velo.Visibility = 'Collapsed'
  return $script:VeloEsito
}

function Close-Dialogo($esito) {
  if (-not $script:VeloFrame) { return }
  $script:VeloEsito = $esito
  $script:VeloFrame.Continue = $false
}

function Show-Info($text, $title = $Cfg.nome) { [void](Show-Dialogo $title $text 'OK') }

function Ask-YesNo($text, $title = 'Serve una conferma') { return ((Show-Dialogo $title $text 'Sì' 'No') -eq $true) }

# Chiede un testo. Restituisce $null se la persona annulla.
function Ask-Text($title, $text) {
  if ((Show-Dialogo $title $text 'Conferma' 'Annulla' -Campo) -ne $true) { return $null }
  return $UI.VeloCampo.Text.Trim()
}

# ------------------------------------------------------------------ Steam e Skyrim

function Get-SteamPath {
  $p = (Get-ItemProperty 'HKCU:\Software\Valve\Steam' -ErrorAction SilentlyContinue).SteamPath
  if ($p) { return ($p -replace '/', '\') }
  return 'C:\Program Files (x86)\Steam'
}

function Find-Skyrim {
  if ($State.skyrim -and (Test-Path (Join-Path $State.skyrim 'SkyrimSE.exe'))) { return $State.skyrim }
  $steam = Get-SteamPath
  $libs = @($steam)
  $vdf = Join-Path $steam 'steamapps\libraryfolders.vdf'
  if (Test-Path $vdf) {
    $libs += (Select-String -Path $vdf -Pattern '"path"\s+"(.+)"' | ForEach-Object { $_.Matches[0].Groups[1].Value -replace '\\\\', '\' })
  }
  foreach ($l in ($libs | Select-Object -Unique)) {
    $p = Join-Path $l 'steamapps\common\Skyrim Special Edition'
    if (Test-Path (Join-Path $p 'SkyrimSE.exe')) { return $p }
  }
  return $null
}

function Get-AcfPath($skyrim) {
  # ...\steamapps\common\Skyrim Special Edition  ->  ...\steamapps\appmanifest_489830.acf
  return (Join-Path (Split-Path (Split-Path $skyrim -Parent) -Parent) 'appmanifest_489830.acf')
}

function Get-SettingsPath { return (Join-Path $script:Skyrim 'Data\Platform\Plugins\skymp5-client-settings.txt') }

function Get-SteamProcess { return (Get-Process -Name steam -ErrorAction SilentlyContinue | Select-Object -First 1) }

function Test-SteamElevated {
  $s = Get-SteamProcess
  if (-not $s) { return $false }
  $h = $null
  try { $h = $s.Handle } catch {}
  return (-not $h)
}

function Close-Steam {
  if (-not (Get-SteamProcess)) { return $true }
  Start-Process 'steam://exit'
  for ($i = 0; $i -lt 30; $i++) {
    Wait-Seconds 1
    if (-not (Get-SteamProcess)) { Wait-Seconds 2; return $true }
  }
  return $false
}

# Programmi che non devono avere la spunta "Esegui come amministratore"
$AdminPattern = 'skyrim|skse|skymp|steam|mod ?organizer'

function Get-AdminFlags {
  $res = @()
  foreach ($hive in 'HKCU', 'HKLM') {
    $key = "${hive}:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"
    $item = Get-Item $key -ErrorAction SilentlyContinue
    if (-not $item) { continue }
    foreach ($name in $item.GetValueNames()) {
      $val = [string]$item.GetValue($name)
      if ($name -match $AdminPattern -and $val -match 'RUNASADMIN') {
        $res += [pscustomobject]@{ Hive = $hive; Key = $key; Name = $name; Value = $val }
      }
    }
  }
  return $res
}

# ------------------------------------------------------------------ funzioni della v0.3 (installazione automatica)

# File scritto dal launcher dopo aver installato il client: dice quale versione di SkyMP c'è in questa cartella di Skyrim.
function Get-ClientMarkerPath { return (Join-Path $script:Skyrim 'atronach-skymp-client.txt') }
function Get-SkyrimVersion { return (Get-Item (Join-Path $script:Skyrim 'SkyrimSE.exe')).VersionInfo.FileVersion }

# Apre Steam se serve e aspetta che sia pronto per 5 secondi di fila (durante un suo aggiornamento si riavvia).
function Wait-SteamReady {
  if (-not (Get-SteamProcess)) { Set-Status 'Apro Steam…'; Start-Process 'steam://open/main' }
  $t = 0; $ok = 0
  while ($ok -lt 5 -and $t -lt 300 -and -not $script:Chiusura) {
    if (Test-SteamReady) { $ok++ } else { $ok = 0 }
    if ($ok -eq 0) { Set-Status "Aspetto che Steam sia pronto (aggiornamento o accesso)… $t s" }
    Wait-Seconds 1; $t++
  }
  if ($script:Chiusura) { return $false }
  if ($ok -lt 5) {
    Write-Log 'Steam non pronto entro 5 minuti'
    Show-Info 'Steam non è pronto. Apri Steam, entra con il tuo account (e aspetta che finisca di aggiornarsi), poi riprova.' 'Steam non è pronto'
    return $false
  }
  Write-Log "Steam pronto dopo $t s"
  return $true
}

function Test-AutoUpdateOff {
  if (-not $script:Skyrim) { return $false }
  $acf = Get-AcfPath $script:Skyrim
  if (-not (Test-Path $acf)) { return $false }
  $m = Select-String -Path $acf -Pattern '"AutoUpdateBehavior"\s+"(\d)"'
  return [bool]($m -and $m.Matches[0].Groups[1].Value -eq '1')
}

# "Aggiorna solo quando lo avvio": Steam lo legge da appmanifest_489830.acf, che si cambia solo a Steam chiuso.
function Set-AutoUpdateOff {
  $acf = Get-AcfPath $script:Skyrim
  if (-not (Test-Path $acf)) { Show-Info 'Non trovo il file di Steam per Skyrim: chiedi aiuto allo staff.' 'File di Steam non trovato'; return $false }
  if (Get-SteamProcess) {
    if (-not (Ask-YesNo 'Devo chiudere Steam un attimo per bloccare gli aggiornamenti automatici di Skyrim. Lo chiudo adesso?')) { return $false }
    Set-Status 'Chiudo Steam…'
    if (-not (Close-Steam)) { Show-Info 'Non riesco a chiudere Steam. Chiudilo tu (anche dall''icona vicino all''orologio) e riprova.' 'Steam è ancora aperto'; return $false }
  }
  $txt = Get-Content $acf -Raw
  if ($txt -match '"AutoUpdateBehavior"\s+"\d"') {
    $txt = $txt -replace '("AutoUpdateBehavior"\s+)"\d"', '$1"1"'
    [System.IO.File]::WriteAllText($acf, $txt)
    Write-Log 'AutoUpdateBehavior impostato a 1'
    return $true
  }
  Show-Info 'Impostazione non trovata: fallo a mano (Steam > Skyrim > Proprietà > Aggiornamenti > "solo quando lo avvio").' 'Impostazione non trovata'
  return $false
}

function Get-FreeGB($path) {
  try { return [math]::Floor((New-Object System.IO.DriveInfo([System.IO.Path]::GetPathRoot($path))).AvailableFreeSpace / 1GB) } catch { return $null }
}

# Scarica un file mostrando i MB scaricati, senza bloccare la finestra.
function Get-File($url, $dest, $label) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  if (Test-Path $dest) { Remove-Item $dest -Force }
  $wc = New-Object System.Net.WebClient
  $wc.Headers.Add('User-Agent', 'AtronachRP-Launcher')
  Write-Log "Scarico $url"
  $task = $wc.DownloadFileTaskAsync($url, $dest)
  while (-not $task.IsCompleted -and -not $script:Chiusura) {
    $mb = 0
    if (Test-Path $dest) { $mb = [math]::Round((Get-Item $dest).Length / 1MB) }
    Set-Status "Scarico $label… $mb MB"
    Wait-Seconds 1
  }
  if ($script:Chiusura) { $wc.CancelAsync(); throw 'Launcher chiuso durante il download' }
  $wc.Dispose()
  if ($task.IsFaulted -or -not (Test-Path $dest)) {
    $err = if ($task.Exception) { $task.Exception.InnerException.Message } else { 'file non scaricato' }
    throw "Download di $label non riuscito: $err"
  }
  Write-Log "Scaricato $label ($([math]::Round((Get-Item $dest).Length / 1MB)) MB)"
}

# Estrae .zip e .7z con tar.exe di Windows. Se tar non sa leggere il .7z (Windows 10 vecchi),
# scarica 7zr.exe (l'estrattore ufficiale e gratuito di 7-Zip) e usa quello.
function Expand-Any($archive, $dest) {
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  & tar.exe -xf $archive -C $dest 2>$null
  if ($LASTEXITCODE -eq 0) { return }
  if ($archive -notlike '*.7z') { Expand-Archive -Path $archive -DestinationPath $dest -Force; return }
  Write-Log 'tar non legge il .7z: uso 7zr.exe'
  $sz = Join-Path $AppDir '7zr.exe'
  if (-not (Test-Path $sz)) { Get-File $Cfg.estrattore_7z_url $sz 'l''estrattore 7-Zip' }
  & $sz x $archive "-o$dest" -y | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Estrazione di $(Split-Path $archive -Leaf) non riuscita" }
}

# Copia una cartella dentro un'altra sovrascrivendo (robocopy: codici da 0 a 7 = riuscito).
function Copy-Tree($from, $to) {
  & robocopy.exe $from $to /E /R:2 /W:2 /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "Copia da $from non riuscita (robocopy $LASTEXITCODE)" }
}

function Test-SkyrimClosed {
  if (-not (Get-Process -Name SkyrimSE -ErrorAction SilentlyContinue)) { return $true }
  Show-Info 'Skyrim è aperto. Chiudilo e premi di nuovo il pulsante.' 'Skyrim è aperto'
  return $false
}

# ------------------------------------------------------------------ downgrade alla 1.6.1170 (console di Steam)
# I file arrivano dai server di Steam con l'account del giocatore: non ridistribuiamo niente.
# Il giocatore fa solo Ctrl+V e Invio nella console; quando un download finisce, il launcher prepara il successivo.

function Read-NewLog($path, $from) {
  if (-not (Test-Path $path)) { return '' }
  $fs = [System.IO.File]::Open($path, 'Open', 'Read', 'ReadWrite')
  try {
    if ($fs.Length -le $from) { return '' }
    [void]$fs.Seek($from, 'Begin')
    return (New-Object System.IO.StreamReader($fs)).ReadToEnd()
  } finally { $fs.Close() }
}

function Get-FolderMB($dir) {
  if (-not (Test-Path $dir)) { return 0 }
  $sum = (Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  return [math]::Round($sum / 1MB)
}

# Aspetta la fine di un download_depot. Fonte principale: Steam\logs\console_log.txt ("Depot download complete").
# Se il log non c'è, considera finito il download quando la cartella non cresce più per 3 minuti.
function Wait-Depot($depot, $dir, $log, $from, $step, $steps) {
  $t = 0; $lastMB = -1; $still = 0
  while ($t -lt 4 * 3600 -and -not $script:Chiusura) {
    $new = Read-NewLog $log $from
    $m = [regex]::Match($new, "Depot download complete[^`n]*depot_$depot[^`n]*")
    if ($m.Success) {
      $p = [regex]::Match($m.Value, '"([^"]+)"')
      $path = if ($p.Success) { $p.Groups[1].Value } else { $dir }
      return [pscustomobject]@{ Ok = $true; Path = $path; Error = $null }
    }
    $f = [regex]::Match($new, "Depot download failed[^`n]*")
    if ($f.Success) { return [pscustomobject]@{ Ok = $false; Path = $dir; Error = $f.Value } }
    if ($t % 5 -eq 0) {
      $mb = Get-FolderMB $dir
      if ($mb -eq 0 -and $t -ge 60) { Set-Status "Passo $step di ${steps}: non vedo ancora il download. Hai incollato il comando nella console di Steam (Ctrl+V e Invio)?" 'Downgrade di Skyrim' }
      else { Set-Status "Passo $step di ${steps}: Steam sta scaricando… $mb MB" 'Downgrade di Skyrim' }
      if (-not (Test-Path $log)) {
        if ($mb -gt 0 -and $mb -eq $lastMB) { $still += 5 } else { $still = 0 }
        if ($still -ge 180) { return [pscustomobject]@{ Ok = $true; Path = $dir; Error = $null } }
      }
      $lastMB = $mb
    }
    Wait-Seconds 1; $t++
  }
  return [pscustomobject]@{ Ok = $false; Path = $dir; Error = $(if ($script:Chiusura) { 'launcher chiuso' } else { 'tempo scaduto (4 ore)' }) }
}

function Invoke-Downgrade {
  if (-not (Test-SkyrimClosed)) { return }
  $steam = Get-SteamPath
  $app = $Cfg.downgrade.app
  $depots = @($Cfg.downgrade.depot)
  $content = Join-Path $steam "steamapps\content\app_$app"

  # prima di tutto Steam non deve rifare l'aggiornamento
  if (-not (Test-AutoUpdateOff)) { if (-not (Set-AutoUpdateOff)) { return } }

  $free = Get-FreeGB $steam
  if ($free -ne $null -and $free -lt $Cfg.downgrade.spazio_libero_gb) {
    if (-not (Ask-YesNo "Sul disco di Steam ci sono solo $free GB liberi: per il downgrade ne servono circa $($Cfg.downgrade.spazio_libero_gb). Provo lo stesso?" 'Poco spazio sul disco')) { return }
  }

  if (-not (Ask-YesNo ("Steam ha installato una versione di Skyrim troppo nuova per SkyMP. La riporto alla $($Cfg.versione_skyrim).`n`n" +
      "Apro la console di Steam e copio io il comando. Tu fai solo: clic nella barra in basso della console, Ctrl+V, Invio.`n`n" +
      "Lo faremo $($depots.Count) volte, una alla volta: ti avviso io. Il download può durare parecchio. Cominciamo?") 'Downgrade di Skyrim')) { return }

  if (-not (Wait-SteamReady)) { return }
  $log = Join-Path $steam 'logs\console_log.txt'
  $paths = @()
  $i = 0
  foreach ($d in $depots) {
    $i++
    $cmd = "download_depot $app $($d.depot) $($d.manifest)"
    $dir = Join-Path $content "depot_$($d.depot)"
    $key = "depot_$($d.depot)"
    if ($State.PSObject.Properties[$key] -and $State.$key -eq [string]$d.manifest -and (Test-Path $dir)) {
      Write-Log "Depot $($d.depot) già scaricato"; $paths += $dir; continue
    }
    $from = if (Test-Path $log) { (Get-Item $log).Length } else { 0 }
    [System.Windows.Clipboard]::SetText($cmd)
    Start-Process 'steam://open/console'
    Write-Log "Comando copiato: $cmd"
    Show-Info ("Ho copiato il comando. Nella console di Steam:`n  1. clic nella barra in basso`n  2. Ctrl+V`n  3. Invio`n`n" +
      "Poi premi OK qui. Non chiudere Steam: ti avviso io quando ha finito.") "Downgrade: passo $i di $($depots.Count)"
    $r = Wait-Depot $d.depot $dir $log $from $i $depots.Count
    if (-not $r.Ok) {
      Write-Log "Depot $($d.depot) non riuscito: $($r.Error)"
      if (-not $script:Chiusura) { Show-Info "Il download $i di $($depots.Count) non è andato a buon fine ($($r.Error)).`n`nPremi di nuovo SISTEMA TUTTO per riprovare, oppure 'Report per lo staff'." 'Download non riuscito' }
      return
    }
    Write-Log "Depot $($d.depot) scaricato in $($r.Path)"
    $State | Add-Member -Force -NotePropertyName $key -NotePropertyValue ([string]$d.manifest); Save-State
    $paths += $r.Path
  }

  if (-not (Test-SkyrimClosed)) { return }
  Set-Status 'Copio i file nella cartella di Skyrim…' 'Downgrade di Skyrim'
  foreach ($p in $paths) { Copy-Tree $p $script:Skyrim; Write-Log "Copiato $p" }

  # Il catalogo delle Creations scritto dalla 1.7 manda in crash la 1.6: si toglie (copia in AppData).
  $cc = Join-Path $env:LOCALAPPDATA 'Skyrim Special Edition\ContentCatalog.txt'
  if (Test-Path $cc) { Move-Item $cc (Join-Path $AppDir 'ContentCatalog.txt.vecchio') -Force; Write-Log 'Spostato ContentCatalog.txt' }

  $v = Get-SkyrimVersion
  if ($v -like "$($Cfg.versione_skyrim)*") {
    Write-Log "Downgrade riuscito: $v"
    Set-Status 'Libero lo spazio dei file scaricati…' 'Downgrade di Skyrim'
    Remove-Item $content -Recurse -Force -ErrorAction SilentlyContinue
    foreach ($d in $depots) { $State.PSObject.Properties.Remove("depot_$($d.depot)") }
    Save-State
    Show-Info "Fatto: Skyrim è alla versione ${v}." 'Downgrade riuscito'
  } else {
    Write-Log "Dopo il downgrade la versione è ancora $v"
    Show-Info "La copia è finita ma Skyrim risulta ancora alla versione ${v}.`n`nPremi 'Report per lo staff' e mandalo sul Discord." 'Downgrade non riuscito'
  }
}

# ------------------------------------------------------------------ installazione di SKSE e del client SkyMP

function Test-SkseOk { return ((Test-Path (Join-Path $script:Skyrim 'skse64_loader.exe')) -and (Test-Path (Join-Path $script:Skyrim $Cfg.skse.dll))) }

function Test-ClientOk {
  if (-not (Test-Path (Get-SettingsPath))) { return $false }
  if (-not (Test-Path (Join-Path $script:Skyrim 'Data\Platform\Plugins\skymp5-client.js'))) { return $false }
  $mk = Get-ClientMarkerPath
  return ((Test-Path $mk) -and ((Get-Content $mk -Raw).Trim() -eq $Cfg.skymp_client.versione))
}

# Estrae l'archivio di SKSE e copia: i file .exe/.dll nella cartella di Skyrim, la sua cartella Data in Data.
function Install-SkseFrom($archive, $tmp) {
  $x = Join-Path $tmp 'skse'
  Set-Status 'Estraggo SKSE…'
  Expand-Any $archive $x
  $loader = Get-ChildItem $x -Recurse -Filter 'skse64_loader.exe' | Select-Object -First 1
  if (-not $loader) { throw 'Nel pacchetto di SKSE non trovo skse64_loader.exe' }
  $root = $loader.DirectoryName
  Get-ChildItem $root -File | Where-Object { $_.Extension -in '.exe', '.dll' } | ForEach-Object { Copy-Item $_.FullName $script:Skyrim -Force }
  if (Test-Path (Join-Path $root 'Data')) { Copy-Tree (Join-Path $root 'Data') (Join-Path $script:Skyrim 'Data') }
  if (-not (Test-SkseOk)) { throw "Dopo l'installazione manca ancora $($Cfg.skse.dll): il file di SKSE non è la versione $($Cfg.skse.versione)" }
  Write-Log "SKSE $($Cfg.skse.versione) installato da $(Split-Path $archive -Leaf)"
}

# Se SKSE non si scarica in automatico, il giocatore lo mette in Download: lo prendiamo da lì.
# Il nome del file è quello del link in config.json (es. skse64_2_02_06.7z).
function Find-SkseInDownloads {
  $dl = Join-Path $env:USERPROFILE 'Downloads'
  $base = [System.IO.Path]::GetFileNameWithoutExtension((Split-Path $Cfg.skse.url -Leaf))
  return (Get-ChildItem $dl -Filter "$base*.7z" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1)
}

function Install-Skse($tmp) {
  $local = Find-SkseInDownloads
  if ($local) { Install-SkseFrom $local.FullName $tmp; return $true }
  $a = Join-Path $tmp 'skse.7z'
  try { Get-File $Cfg.skse.url $a "SKSE $($Cfg.skse.versione)" }
  catch {
    Write-Log $_
    Show-Info ("Non riesco a scaricare SKSE da solo (il sito a volte blocca i download automatici).`n`n" +
      "Ti apro il sito: scarica la build $($Cfg.skse.versione) (per la versione $($Cfg.versione_skyrim) del gioco), " +
      "lasciala nella cartella Download e premi di nuovo il pulsante: la trovo io.") 'SKSE da scaricare a mano'
    Start-Process $Cfg.skse.sito
    return $false
  }
  Install-SkseFrom $a $tmp
  return $true
}

function Install-Client($tmp) {
  $settings = Get-SettingsPath
  $old = $null
  if (Test-Path $settings) { $old = Get-Content $settings -Raw -Encoding UTF8; Copy-Item $settings (Join-Path $AppDir 'skymp5-client-settings.prima-del-launcher.txt') -Force }
  $z = Join-Path $tmp 'skymp-client.zip'
  Get-File $Cfg.skymp_client.url $z "SkyMP ($($Cfg.skymp_client.versione))"
  Set-Status 'Installo SkyMP nella cartella di Skyrim…'
  Expand-Any $z (Join-Path $script:Skyrim 'Data')
  if ($old) { [System.IO.File]::WriteAllText($settings, $old) }
  else { $State.clientNuovo = $true; Save-State }
  # La password di rete del client ufficiale (skymp.net) non va con il server del nostro client: la togliamo,
  # così tutti i PC con il launcher hanno lo stesso client e si collegano tra loro.
  $pw = Join-Path $script:Skyrim 'Data\Platform\Distribution\password'
  if (Test-Path $pw) { Move-Item $pw (Join-Path $AppDir 'password.client-ufficiale') -Force; Write-Log 'Spostata la password del client ufficiale' }
  Set-Content -Path (Get-ClientMarkerPath) -Value $Cfg.skymp_client.versione -Encoding ASCII
  Write-Log "Client SkyMP $($Cfg.skymp_client.versione) installato"
}

function Install-SkyMP {
  if (-not (Test-SkyrimClosed)) { return }
  $tmp = Join-Path $AppDir 'download'
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  try {
    if (-not (Test-SkseOk)) { if (-not (Install-Skse $tmp)) { return } }
    if (-not (Test-ClientOk)) { Install-Client $tmp }
    Set-Status 'SkyMP installato.'
  } finally { Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}

# ------------------------------------------------------------------ numero di giocatore e server

function Set-ClientServer {
  $path = Get-SettingsPath
  $backup = Join-Path $AppDir 'skymp5-client-settings.originale.txt'
  if (-not (Test-Path $backup)) { Copy-Item $path $backup }
  $s = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($Cfg.usa_profile_id -and -not $State.profileId) {
    # Chi aveva già un numero (dato dallo staff, prima del launcher) lo tiene; gli altri ne ricevono uno nuovo.
    $vecchio = if ($s.gameData) { $s.gameData.profileId -as [int] } else { $null }
    if ($vecchio -and -not $State.clientNuovo) { $State.profileId = $vecchio }
    else { $State.profileId = Get-Random -Minimum 100000 -Maximum 999999 }
    Save-State
    Write-Log "Numero di giocatore: $($State.profileId)"
    Show-Info "Il tuo numero di giocatore è $($State.profileId).`n`nScrivilo allo staff sul Discord: serve a riconoscere il tuo personaggio. Lo trovi sempre anche qui nel launcher." 'Numero di giocatore'
  }
  $s | Add-Member -Force -NotePropertyName 'server-ip' -NotePropertyValue $Cfg.server_ip
  $s | Add-Member -Force -NotePropertyName 'server-port' -NotePropertyValue ([int]$Cfg.server_port)
  if ($Cfg.usa_profile_id) {
    # Modalità senza login (offline mode): niente master server, si entra con il numero di giocatore
    $s | Add-Member -Force -NotePropertyName 'master' -NotePropertyValue ''
    $s | Add-Member -Force -NotePropertyName 'server-master-key' -NotePropertyValue $null
    if (-not $s.gameData) { $s | Add-Member -Force -NotePropertyName 'gameData' -NotePropertyValue (New-Object PSObject) }
    $s.gameData | Add-Member -Force -NotePropertyName 'profileId' -NotePropertyValue ([int]$State.profileId)
  }
  [System.IO.File]::WriteAllText($path, ($s | ConvertTo-Json -Depth 5))
  Write-Log "Client impostato su $($Cfg.server_ip):$($Cfg.server_port)"
}

# ------------------------------------------------------------------ i controlli
# Ogni controllo: Nome, Test (restituisce Ok + Dettaglio), Pulsante e Fix (cosa fa il pulsante).
# Un controllo può anche essere "in attesa": non si può fare finché non è a posto uno precedente.

$script:Skyrim = Find-Skyrim

function New-Result($ok, $detail, $attesa = $false) { return [pscustomobject]@{ Ok = $ok; Detail = $detail; Attesa = $attesa } }

$Checks = @(
  [pscustomobject]@{
    Name = 'Skyrim Special Edition installato'
    Test = {
      $script:Skyrim = Find-Skyrim
      if ($script:Skyrim) { New-Result $true $script:Skyrim } else { New-Result $false 'Non trovo Skyrim. Installalo da Steam; se è già installato, indicami la cartella.' }
    }
    Button = 'Sfoglia'
    Fix = {
      $d = New-Object System.Windows.Forms.FolderBrowserDialog
      $d.Description = 'Scegli la cartella "Skyrim Special Edition" (quella che contiene SkyrimSE.exe)'
      if ($d.ShowDialog() -eq 'OK') {
        if (Test-Path (Join-Path $d.SelectedPath 'SkyrimSE.exe')) { $State.skyrim = $d.SelectedPath; Save-State }
        else { Show-Info 'In questa cartella non c''è SkyrimSE.exe. Riprova.' 'Cartella sbagliata' }
      }
    }
  },
  [pscustomobject]@{
    Name = 'Steam non aggiorna Skyrim da solo'
    Test = {
      if (-not $script:Skyrim) { return (New-Result $false 'Prima serve Skyrim.' $true) }
      if (-not (Test-Path (Get-AcfPath $script:Skyrim))) { return (New-Result $false 'Non trovo le impostazioni di Steam per Skyrim.') }
      if (Test-AutoUpdateOff) { New-Result $true 'Aggiorna solo quando lo avvii da Steam' }
      else { New-Result $false 'Steam può aggiornare Skyrim da solo e rompere il gioco.' }
    }
    Button = 'Sistema'
    Fix = { [void](Set-AutoUpdateOff) }
  },
  [pscustomobject]@{
    Name = "Versione del gioco $($Cfg.versione_skyrim)"
    Test = {
      if (-not $script:Skyrim) { return (New-Result $false 'Prima serve Skyrim.' $true) }
      $v = Get-SkyrimVersion
      if ($v -like "$($Cfg.versione_skyrim)*") { New-Result $true "Versione $v" } else { New-Result $false "Hai la versione ${v}: la riporto io alla $($Cfg.versione_skyrim)." }
    }
    Button = 'Sistema'
    Fix = { Invoke-Downgrade }
  },
  [pscustomobject]@{
    Name = 'Avvio senza amministratore'
    Test = {
      $flags = Get-AdminFlags
      if (Test-SteamElevated) { New-Result $false 'Steam è aperto come amministratore.' }
      elseif ($flags) { New-Result $false ("Spunta 'Esegui come amministratore' su: " + (($flags | ForEach-Object { Split-Path $_.Name -Leaf }) -join ', ')) }
      else { New-Result $true 'Tutto a posto' }
    }
    Button = 'Sistema'
    Fix = {
      if (Test-SteamElevated) {
        if (-not (Ask-YesNo 'Devo chiudere Steam per sistemare. Lo chiudo adesso?')) { return }
        Set-Status 'Chiudo Steam…'
        if (-not (Close-Steam)) { Show-Info 'Non riesco a chiudere Steam. Chiudilo tu (anche dall''icona vicino all''orologio) e premi di nuovo "Sistema".' 'Steam è ancora aperto'; return }
      }
      $left = @()
      foreach ($f in (Get-AdminFlags)) {
        if ($f.Hive -eq 'HKCU') {
          $new = (($f.Value -split ' ') | Where-Object { $_ -ne 'RUNASADMIN' -and $_ -ne '' }) -join ' '
          if ($new -eq '~' -or $new -eq '') { Remove-ItemProperty -Path $f.Key -Name $f.Name }
          else { Set-ItemProperty -Path $f.Key -Name $f.Name -Value $new }
          Write-Log "Tolto RUNASADMIN da $($f.Name)"
        } else { $left += $f }
      }
      if ($left) {
        Show-Info 'Alcune impostazioni sono di sistema e serve il permesso di Windows: tra poco ti chiede "Vuoi consentire...?". Rispondi Sì.' 'Serve il permesso di Windows'
        $cmd = ($left | ForEach-Object { "Remove-ItemProperty -Path '$($_.Key)' -Name '$($_.Name)'" }) -join '; '
        try { Start-Process powershell -Verb RunAs -Wait -ArgumentList @('-NoProfile', '-Command', $cmd) } catch { Show-Info 'Permesso non concesso: chiedi aiuto allo staff.' 'Permesso non concesso' }
      }
    }
  },
  [pscustomobject]@{
    Name = 'SkyMP e SKSE installati'
    Test = {
      if (-not $script:Skyrim) { return (New-Result $false 'Prima serve Skyrim.' $true) }
      $skse = Test-SkseOk
      $client = Test-ClientOk
      if ($skse -and $client) { New-Result $true "SkyMP $($Cfg.skymp_client.versione), SKSE $($Cfg.skse.versione)" }
      elseif (-not $skse -and -not $client) { New-Result $false 'Mancano SkyMP e SKSE: li installo io.' }
      elseif (-not $skse) { New-Result $false "Manca SKSE $($Cfg.skse.versione): lo installo io." }
      else { New-Result $false 'SkyMP manca o non è la versione del nostro server: lo installo io.' }
    }
    Button = 'Installa'
    Fix = { Install-SkyMP }
  },
  [pscustomobject]@{
    Name = "Collegato al server $($Cfg.nome)"
    Test = {
      if (-not $script:Skyrim -or -not (Test-Path (Get-SettingsPath))) { return (New-Result $false 'Prima serve SkyMP.' $true) }
      $s = Get-Content (Get-SettingsPath) -Raw -Encoding UTF8 | ConvertFrom-Json
      $okIp = ($s.'server-ip' -eq $Cfg.server_ip) -and ([int]$s.'server-port' -eq [int]$Cfg.server_port)
      $okId = (-not $Cfg.usa_profile_id) -or ($State.profileId -and $s.gameData -and ([int]$s.gameData.profileId -eq [int]$State.profileId) -and -not $s.master)
      $chi = if ($State.profileId) { " - giocatore n. $($State.profileId)" } else { '' }
      if ($okIp -and $okId) { New-Result $true "$($Cfg.server_ip):$($Cfg.server_port)$chi" } else { New-Result $false 'Il gioco non è ancora impostato sul nostro server.' }
    }
    Button = 'Imposta'
    Fix = { Set-ClientServer }
  }
)

# ------------------------------------------------------------------ avvio del gioco e report

# Steam è pronto solo se: steam.exe è aperto, il PID che Steam ha scritto nel registro è proprio il suo
# (altrimenti il valore è rimasto da una sessione vecchia), c'è un utente collegato e l'interfaccia
# (steamwebhelper) è partita. Mentre Steam si aggiorna da solo queste condizioni non sono vere.
function Test-SteamReady {
  $s = Get-SteamProcess
  if (-not $s) { return $false }
  $ap = Get-ItemProperty 'HKCU:\Software\Valve\Steam\ActiveProcess' -ErrorAction SilentlyContinue
  if (-not $ap) { return $false }
  if (($ap.pid -as [int]) -ne $s.Id) { return $false }
  if (($ap.ActiveUser -as [int]) -eq 0) { return $false }
  return [bool](Get-Process -Name steamwebhelper -ErrorAction SilentlyContinue)
}

# SkyMP è caricato se nel processo di Skyrim c'è la DLL di SKSE (skse64_1_6_1170.dll)
function Test-SkseLoaded {
  $p = Get-Process -Name SkyrimSE -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $p) { return $null }
  try { return [bool]($p.Modules | Where-Object { $_.ModuleName -like 'skse64_*.dll' }) } catch { return $null }
}

function Start-Game {
  $loader = Join-Path $script:Skyrim 'skse64_loader.exe'
  Set-Avvio $true
  try {
    if (Get-Process -Name SkyrimSE -ErrorAction SilentlyContinue) { Show-Info 'Skyrim è già aperto. Chiudilo e premi di nuovo GIOCA.' 'Skyrim è già aperto'; return }
    # Se Skyrim parte prima che Steam sia pronto, Steam lo riavvia senza SKSE (quindi senza SkyMP).
    if (-not (Wait-SteamReady)) { return }

    Set-Status 'Avvio il gioco…'
    Write-Log 'Avvio skse64_loader'
    Start-Process -FilePath $loader -WorkingDirectory $script:Skyrim

    # Controllo che il gioco sia partito con SKSE: aspetto Skyrim, poi 20 secondi (se Steam lo riavvia, succede qui)
    $t = 0
    while (-not (Get-Process -Name SkyrimSE -ErrorAction SilentlyContinue) -and $t -lt 90 -and -not $script:Chiusura) { Set-Status "Aspetto che il gioco si apra… $t s"; Wait-Seconds 1; $t++ }
    if ($script:Chiusura) { return }
    if ($t -ge 90) { Write-Log 'SkyrimSE non partito'; Show-Info "Il gioco non si è aperto. Premi 'Report per lo staff' e mandalo sul Discord." 'Il gioco non si è aperto'; return }
    Set-Status 'Controllo che SkyMP sia attivo…'
    Wait-Seconds 20
    if ($script:Chiusura) { return }
    $skse = Test-SkseLoaded
    if ($skse -eq $false) {
      Write-Log 'SkyrimSE aperto SENZA SKSE'
      Show-Info "Steam ha riavviato il gioco senza SkyMP.`n`nChiudi Skyrim e premi di nuovo GIOCA. Se succede ancora, premi 'Report per lo staff'." 'Il gioco è partito senza SkyMP'
      return
    }
    Write-Log $(if ($skse) { 'SKSE caricato: avvio riuscito' } else { 'Controllo SKSE non riuscito (gioco chiuso o accesso negato)' })
    Set-Status 'Buon divertimento!' 'SkyMP è attivo'
    $UI.Caricamento.Visibility = 'Collapsed'
    Wait-Seconds 2
    $Window.Close()
  } finally { if (-not $script:Chiusura) { Set-Avvio $false } }
}

function New-Report {
  Set-Status 'Preparo il report…'
  $stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm'
  $dir = Join-Path $env:TEMP "AtronachRP_report_$stamp"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $lines = @("Atronach RP - report del $stamp", "Launcher: $Versione", "Windows: $([Environment]::OSVersion.VersionString)", "Skyrim: $script:Skyrim", '')
  foreach ($c in $Checks) { $r = & $c.Test; $lines += "[$(if ($r.Ok) {'OK'} else {'NO'})] $($c.Name): $($r.Detail)" }
  $lines | Set-Content (Join-Path $dir 'controlli.txt') -Encoding UTF8
  if (Test-Path $LogPath) { Copy-Item $LogPath $dir }
  if ($script:Skyrim -and (Test-Path (Get-SettingsPath))) { Copy-Item (Get-SettingsPath) $dir }
  $steamLog = Join-Path (Get-SteamPath) 'logs\console_log.txt'
  if (Test-Path $steamLog) { Get-Content $steamLog -Tail 300 -ErrorAction SilentlyContinue | Set-Content (Join-Path $dir 'steam_console_log_fine.txt') -Encoding UTF8 }
  $games = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'My Games\Skyrim Special Edition'
  Get-ChildItem $games -Filter *.log -Recurse -Depth 2 -ErrorAction SilentlyContinue | Select-Object -First 30 | ForEach-Object { Copy-Item $_.FullName $dir }
  $zip = Join-Path ([Environment]::GetFolderPath('Desktop')) "AtronachRP_report_$stamp.zip"
  Compress-Archive -Path (Join-Path $dir '*') -DestinationPath $zip -Force
  Remove-Item $dir -Recurse -Force
  Show-Info "Ho creato il file $(Split-Path $zip -Leaf) sul Desktop.`n`nMandalo allo staff sul Discord." 'Report pronto'
  Start-Process explorer.exe "/select,`"$zip`""
}

# Mette sul Desktop un'icona che apre il launcher (punta a "Avvia Atronach RP.bat" in questa cartella).
function New-IconaDesktop {
  $nome = ($Cfg.nome -replace '[\\/:*?"<>|]', '').Trim()
  $lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) "$nome.lnk"
  $sh = New-Object -ComObject WScript.Shell
  $s = $sh.CreateShortcut($lnk)
  $s.TargetPath = (Join-Path $Here 'Avvia Atronach RP.bat')
  $s.WorkingDirectory = $Here
  $s.IconLocation = "$(Join-Path $Risorse 'icona.ico'),0"
  $s.WindowStyle = 7
  $s.Description = "Apre il launcher di $($Cfg.nome)"
  $s.Save()
  Write-Log "Icona creata: $lnk"
  Show-Info "Sul Desktop ora c'è l'icona `"$nome`": da adesso puoi aprire il launcher da lì.`n`nSe sposti questa cartella, l'icona va rifatta." 'Icona creata'
}

# ------------------------------------------------------------------ finestra: aggiornamento

function Set-Status($testo, $titolo = $null) {
  if ($titolo) { $UI.StatoTitolo.Text = $titolo }
  $UI.StatoTesto.Text = $testo
  Invoke-Pump
}

# Mentre il gioco si avvia: barra di caricamento accesa, pulsanti spenti.
function Set-Avvio($attivo) {
  $script:Avvio = $attivo
  $UI.Caricamento.Visibility = if ($attivo) { 'Visible' } else { 'Collapsed' }
  $UI.Righe.IsEnabled = -not $attivo
  $UI.BtnRicontrolla.IsEnabled = -not $attivo
  if ($attivo) { $UI.BtnGioca.IsEnabled = $false; $UI.StatoTitolo.Text = 'Avvio in corso' }
  else { Show-Risultati $script:Risultati }
}

# Mentre il launcher sistema qualcosa (download, downgrade): barra di caricamento accesa, pulsanti spenti.
function Set-Lavoro($attivo, $titolo = 'Sto sistemando') {
  $script:Lavoro = $attivo
  $UI.Caricamento.Visibility = if ($attivo) { 'Visible' } else { 'Collapsed' }
  $UI.Righe.IsEnabled = -not $attivo
  $UI.BtnRicontrolla.IsEnabled = -not $attivo
  $UI.BtnGioca.IsEnabled = -not $attivo
  if ($attivo) { $UI.StatoTitolo.Text = $titolo }
  Invoke-Pump
}

# Esegue il pulsante di un controllo; alla fine ricontrolla tutto.
function Invoke-Lavoro($check) {
  Set-Lavoro $true
  Set-Status "Sistemo: $($check.Name)…"
  try { & $check.Fix }
  catch {
    Write-Log "Errore in '$($check.Name)': $_"
    Show-Info "Qualcosa non ha funzionato:`n$($_.Exception.Message)`n`nPremi 'Report per lo staff' e mandalo sul Discord." 'Qualcosa non ha funzionato'
  }
  finally { Set-Lavoro $false; if (-not $script:Chiusura) { Update-Checks } }
}

# SISTEMA TUTTO: sistema i passi dall'alto in basso. Si ferma al primo che resta da fare
# (per esempio perché il giocatore ha risposto No), così si vede dove si è bloccato.
function Repair-All {
  Set-Lavoro $true
  try {
    foreach ($c in $Checks) {
      if ($script:Chiusura) { return }
      $res = $null
      try { $res = & $c.Test } catch { $res = New-Result $false "$_" }
      if ($res.Ok) { continue }
      Set-Status "Sistemo: $($c.Name)…"
      try { & $c.Fix }
      catch {
        Write-Log "Errore in '$($c.Name)': $_"
        Show-Info "Qualcosa non ha funzionato:`n$($_.Exception.Message)`n`nPremi 'Report per lo staff' e mandalo sul Discord." 'Qualcosa non ha funzionato'
        break
      }
      $dopo = $null
      try { $dopo = & $c.Test } catch { $dopo = New-Result $false "$_" }
      if (-not $dopo.Ok) { Write-Log "SISTEMA TUTTO fermo su '$($c.Name)'"; break }
    }
  } finally { Set-Lavoro $false; if (-not $script:Chiusura) { Update-Checks } }
}

# Disegna una riga: stato = 'fatto' | 'dafare' | 'attesa'. $corrente = è il passo da fare adesso.
function Set-Riga($i, $stato, $dettaglio, $corrente) {
  $p = "Riga${i}_"
  $UI[$p + 'Fatto'].Visibility = if ($stato -eq 'fatto') { 'Visible' } else { 'Collapsed' }
  $UI[$p + 'DaFare'].Visibility = if ($stato -eq 'dafare') { 'Visible' } else { 'Collapsed' }
  $UI[$p + 'Attesa'].Visibility = if ($stato -eq 'attesa') { 'Visible' } else { 'Collapsed' }
  $UI[$p + 'Anello'].Visibility = if ($corrente) { 'Visible' } else { 'Collapsed' }
  $UI[$p + 'Sfondo'].Visibility = if ($corrente) { 'Visible' } else { 'Collapsed' }
  $UI[$p + 'Barra'].Visibility = if ($corrente) { 'Visible' } else { 'Collapsed' }
  $UI[$p + 'Testi'].Opacity = if ($stato -eq 'attesa') { 0.55 } else { 1.0 }
  $UI[$p + 'Dettaglio'].Text = [string]$dettaglio
  # Il testo lungo viene tagliato: tenendo il mouse fermo sopra si legge tutto.
  if (([string]$dettaglio).Length -gt 40) {
    $tt = New-Object System.Windows.Controls.TextBlock
    $tt.Text = [string]$dettaglio; $tt.TextWrapping = 'Wrap'; $tt.MaxWidth = 340
    $UI[$p + 'Testi'].ToolTip = $tt
  } else { $UI[$p + 'Testi'].ToolTip = $null }
  $btn = $UI[$p + 'Pulsante']
  $btn.Visibility = if ($stato -eq 'dafare') { 'Visible' } else { 'Collapsed' }
  $btn.Style = $Window.FindResource($(if ($corrente) { 'BtnPrimario' } else { 'BtnSecondario' }))
}

# Mostra l'esito dei controlli: righe, barra "N di 6", frase in basso e pulsante GIOCA.
function Show-Risultati($ris) {
  $script:Risultati = $ris
  $n = $ris.Count; $ok = 0; $corrente = -1
  if ($n -eq 0) { return }
  for ($i = 0; $i -lt $n; $i++) {
    $r = $ris[$i]
    $stato = if ($r.Ok) { 'fatto' } elseif ($r.Attesa) { 'attesa' } else { 'dafare' }
    if ($r.Ok) { $ok++ }
    if ($stato -eq 'dafare' -and $corrente -lt 0) { $corrente = $i }
    Set-Riga $i $stato $r.Detail ($i -eq $corrente)
  }
  $UI.Avanzamento.Width = [Math]::Round($UI.Traccia.Width * $ok / $n)
  $UI.Conteggio.Text = "$ok di $n"
  $tutti = ($ok -eq $n)
  $script:TuttoPronto = $tutti
  $UI.BtnGioca.Content = if ($tutti) { 'GIOCA' } else { 'SISTEMA TUTTO' }
  $UI.BtnGioca.IsEnabled = -not $script:Avvio -and -not $script:Lavoro
  if ($script:Lavoro) { return }
  if ($tutti) {
    $UI.StatoTitolo.Text = 'Tutto pronto'
    $UI.StatoTesto.Text = 'Premi GIOCA per entrare nel server.'
  } else {
    $mancano = $n - $ok
    $UI.StatoTitolo.Text = if ($mancano -eq 1) { 'Manca 1 passo' } else { "Mancano $mancano passi" }
    $UI.StatoTesto.Text = 'Premi SISTEMA TUTTO: faccio io, ti chiedo solo quando serve.'
  }
}

function Update-Checks {
  Set-Status 'Controllo il tuo PC…'
  $ris = @()
  foreach ($c in $Checks) {
    $res = $null
    try { $res = & $c.Test } catch { $res = New-Result $false "Errore nel controllo: $_" }
    $ris += $res
  }
  Show-Risultati $ris
}

# Esegue il lavoro di un pulsante: uno alla volta, e un errore non fa chiudere il launcher.
function Invoke-Azione([scriptblock]$cosa, $seErrore) {
  if ($script:Occupato -or $script:Chiusura) { return }
  $script:Occupato = $true
  try { & $cosa }
  catch {
    Write-Log "Errore: $_"
    if ($seErrore) { Show-Info $seErrore 'Qualcosa non ha funzionato' }
  }
  finally { $script:Occupato = $false }
}

# ------------------------------------------------------------------ finestra: creazione

$script:Occupato = $false
$script:Chiusura = $false
$script:Avvio = $false
$script:Lavoro = $false
$script:TuttoPronto = $false
$script:VeloFrame = $null
$script:VeloEsito = $null
$script:Risultati = @()

try {
  $Window = New-Finestra $Checks.Count

  # Tutti gli elementi di finestra.xaml che hanno un nome (es. $UI.Titolo, $UI.BtnGioca)
  $UI = @{}
  $nomi = 'Radice', 'Contenuto', 'Sfondo', 'Titolo', 'Sottotitolo', 'Righe', 'Traccia', 'Avanzamento', 'Conteggio', 'BtnRicontrolla',
    'StatoTitolo', 'StatoTesto', 'Caricamento', 'BtnGuida', 'BtnDiscord', 'BtnReport', 'BtnIcona', 'BtnGioca', 'InfoServer', 'InfoVersione',
    'Velo', 'VeloTitolo', 'VeloTesto', 'VeloCampo', 'VeloSi', 'VeloNo', 'BtnRiduci', 'BtnChiudi'
  for ($i = 0; $i -lt $Checks.Count; $i++) {
    foreach ($parte in 'Sfondo', 'Barra', 'LineaSu', 'LineaGiu', 'Attesa', 'Fatto', 'DaFare', 'Anello', 'Testi', 'Nome', 'Dettaglio', 'Pulsante') { $nomi += "Riga${i}_$parte" }
  }
  foreach ($nome in $nomi) {
    $UI[$nome] = $Window.FindName($nome)
    if ($null -eq $UI[$nome]) { throw "In finestra.xaml manca l'elemento '$nome'." }
  }
} catch {
  Write-Log "La finestra non si apre: $($_.Exception.ToString())"
  if ($Anteprima) { Write-Host "ERRORE: $($_.Exception.ToString())"; exit 1 }
  [void][System.Windows.MessageBox]::Show("Il launcher non riesce ad aprirsi.`n`n$($_.Exception.Message)`n`nManda allo staff il file:`n$LogPath", $Cfg.nome, 'OK', 'Error')
  exit 1
}

# Testi presi da config.json
$Window.Title = $Cfg.nome
$UI.Titolo.Text = $Cfg.nome.ToUpper()
$UI.Sottotitolo.Text = [string]$Cfg.sottotitolo
$UI.InfoServer.Text = "Server $($Cfg.server_ip):$($Cfg.server_port)" + $(if ($ServerPersonale) { ' (personale)' } else { '' })
$UI.InfoVersione.Text = "Launcher $Versione"
if (-not $Cfg.guida_url) { $UI.BtnGuida.Visibility = 'Collapsed' }
if (-not $Cfg.discord_url) { $UI.BtnDiscord.Visibility = 'Collapsed' }

# Sfondo, icona e carattere del titolo: se un file manca il launcher funziona lo stesso, solo meno bello.
try {
  $bmp = New-Object System.Windows.Media.Imaging.BitmapImage
  $bmp.BeginInit()
  $bmp.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
  $bmp.UriSource = New-Object System.Uri((Join-Path $Risorse 'sfondo.jpg'))
  $bmp.EndInit()
  $bmp.Freeze()
  $UI.Sfondo.Source = $bmp
} catch { Write-Log "Sfondo non caricato: $($_.Exception.Message)" }
try {
  $Window.Icon = [System.Windows.Media.Imaging.BitmapFrame]::Create((New-Object System.Uri((Join-Path $Risorse 'icona.ico'))),
    [System.Windows.Media.Imaging.BitmapCreateOptions]::None, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
} catch { Write-Log "Icona non caricata: $($_.Exception.Message)" }
try {
  $Cinzel = New-Object System.Windows.Media.FontFamily((New-Object System.Uri($Risorse.TrimEnd('\') + '\')), './#Cinzel, Palatino Linotype, Georgia')
  $UI.Titolo.FontFamily = $Cinzel
  $UI.BtnGioca.FontFamily = $Cinzel
} catch { Write-Log "Carattere del titolo non caricato: $($_.Exception.Message)" }

# Righe dei controlli
for ($i = 0; $i -lt $Checks.Count; $i++) {
  $UI["Riga${i}_Nome"].Text = $Checks[$i].Name
  $UI["Riga${i}_Dettaglio"].Text = ''
  $btn = $UI["Riga${i}_Pulsante"]
  $btn.Content = $Checks[$i].Button
  $btn.Tag = $i
  $btn.Add_Click({
    param($chi, $e)
    $script:Scelto = $Checks[[int]$chi.Tag]
    Invoke-Azione { Invoke-Lavoro $script:Scelto } $null
  })
}
$UI.Riga0_LineaSu.Visibility = 'Collapsed'
$UI["Riga$($Checks.Count - 1)_LineaGiu"].Visibility = 'Collapsed'

# Schermi piccoli: la finestra si rimpicciolisce per starci tutta.
$area = [System.Windows.SystemParameters]::WorkArea
$scala = [Math]::Min(1.0, [Math]::Min($area.Width / $UI.Radice.Width, $area.Height / $UI.Radice.Height))
if ($scala -lt 1.0) {
  $UI.Radice.LayoutTransform = New-Object System.Windows.Media.ScaleTransform($scala, $scala)
  $Window.Width = [Math]::Floor($UI.Radice.Width * $scala)
  $Window.Height = [Math]::Floor($UI.Radice.Height * $scala)
}

# Pulsanti
$UI.Contenuto.Add_MouseLeftButtonDown({ try { $Window.DragMove() } catch {} })
$UI.BtnRiduci.Add_Click({ $Window.WindowState = 'Minimized' })
$UI.BtnChiudi.Add_Click({ $Window.Close() })
$UI.VeloSi.Add_Click({ Close-Dialogo $true })
$UI.VeloNo.Add_Click({ Close-Dialogo $false })
$UI.BtnRicontrolla.Add_Click({ Invoke-Azione { Update-Checks } $null })
$UI.BtnGioca.Add_Click({
  if ($script:TuttoPronto) { Invoke-Azione { Start-Game } "Il gioco non è partito. Premi 'Report per lo staff' e mandalo sul Discord." }
  else { Invoke-Azione { Repair-All } "Qualcosa non ha funzionato. Premi 'Report per lo staff' e mandalo sul Discord." }
})
$UI.BtnReport.Add_Click({ Invoke-Azione { New-Report; Update-Checks } 'Non sono riuscito a creare il report.' })
$UI.BtnIcona.Add_Click({ Invoke-Azione { New-IconaDesktop } 'Non sono riuscito a creare l''icona sul Desktop.' })
$UI.BtnGuida.Add_Click({ try { Start-Process $Cfg.guida_url } catch { Write-Log "Guida: $_" } })
$UI.BtnDiscord.Add_Click({ try { Start-Process $Cfg.discord_url } catch { Write-Log "Discord: $_" } })
$Window.Add_Closing({ $script:Chiusura = $true; if ($script:VeloFrame) { $script:VeloFrame.Continue = $false } })

# ------------------------------------------------------------------ anteprima (solo per i test)

function Save-Immagine($percorso) {
  Invoke-Pump
  $w = [int][Math]::Ceiling($Window.ActualWidth * 2); $h = [int][Math]::Ceiling($Window.ActualHeight * 2)
  $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($w, $h, 192, 192, [System.Windows.Media.PixelFormats]::Pbgra32)
  $rtb.Render($Window)
  $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
  $fs = [IO.File]::Create($percorso)
  try { $enc.Save($fs) } finally { $fs.Close() }
  Write-Host "Salvata $percorso"
}

if ($Anteprima) {
  try {
    New-Item -ItemType Directory -Force -Path $Anteprima | Out-Null
    $Window.Show()
    Wait-Seconds 1
    Update-Checks
    Save-Immagine (Join-Path $Anteprima '1_questo_pc.png')
    $cartella = 'C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition'
    $okSkymp = "SkyMP $($Cfg.skymp_client.versione), SKSE $($Cfg.skse.versione)"
    Show-Risultati @(
      (New-Result $true $cartella), (New-Result $true 'Aggiorna solo quando lo avvii da Steam'),
      (New-Result $false "Hai la versione 1.6.1179.0: la riporto io alla $($Cfg.versione_skyrim)."), (New-Result $true 'Tutto a posto'),
      (New-Result $false 'Mancano SkyMP e SKSE: li installo io.'), (New-Result $false 'Prima serve SkyMP.' $true))
    Save-Immagine (Join-Path $Anteprima '2_a_meta.png')
    Show-Risultati @(
      (New-Result $false 'Non trovo Skyrim. Installalo da Steam; se è già installato, indicami la cartella.'), (New-Result $false 'Prima serve Skyrim.' $true),
      (New-Result $false 'Prima serve Skyrim.' $true), (New-Result $true 'Tutto a posto'),
      (New-Result $false 'Prima serve Skyrim.' $true), (New-Result $false 'Prima serve SkyMP.' $true))
    Save-Immagine (Join-Path $Anteprima '3_senza_skyrim.png')
    Show-Risultati @(
      (New-Result $true $cartella), (New-Result $true 'Aggiorna solo quando lo avvii da Steam'), (New-Result $true "Versione $($Cfg.versione_skyrim).0"),
      (New-Result $true 'Tutto a posto'), (New-Result $true $okSkymp), (New-Result $true "$($Cfg.server_ip):$($Cfg.server_port) - giocatore n. 482913"))
    Save-Immagine (Join-Path $Anteprima '4_tutto_pronto.png')
    $UI.Caricamento.Visibility = 'Visible'; $UI.BtnGioca.IsEnabled = $false
    $UI.StatoTitolo.Text = 'Avvio in corso'; $UI.StatoTesto.Text = 'Aspetto che Steam sia pronto (aggiornamento o accesso)… 12 s'
    Wait-Seconds 0.5
    Save-Immagine (Join-Path $Anteprima '5_avvio.png')
    $UI.VeloTitolo.Text = 'Downgrade: passo 1 di 3'; $UI.VeloTesto.Text = "Ho copiato il comando. Nella console di Steam:`n  1. clic nella barra in basso`n  2. Ctrl+V`n  3. Invio`n`nPoi premi OK qui. Non chiudere Steam: ti avviso io quando ha finito."
    $UI.VeloSi.Content = 'OK'; $UI.VeloNo.Visibility = 'Collapsed'; $UI.VeloCampo.Visibility = 'Collapsed'
    $UI.Velo.Visibility = 'Visible'
    Save-Immagine (Join-Path $Anteprima '6_domanda.png')
    $Window.Close()
    exit 0
  } catch {
    Write-Host "ERRORE: $($_.Exception.ToString())"
    exit 1
  }
}

# ------------------------------------------------------------------ avvio

$Window.Add_ContentRendered({ Invoke-Azione { Update-Checks } $null })
Write-Log "Launcher $Versione aperto"
[void]$Window.ShowDialog()
