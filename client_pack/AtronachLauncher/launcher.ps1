# Atronach RP - Launcher (PROTOTIPO)
# Si avvia con un doppio clic su "Avvia Atronach RP.bat" (NON come amministratore).
# Controlla il PC del giocatore, sistema da solo quello che puo' e avvia il gioco collegato al server.
# Specifica: specs/platform/launcher.md

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName Microsoft.VisualBasic
[System.Windows.Forms.Application]::EnableVisualStyles()

# ------------------------------------------------------------------ impostazioni

$Here = $PSScriptRoot
$Cfg = Get-Content (Join-Path $Here 'config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$AppDir = Join-Path $env:APPDATA 'AtronachRP'
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
$StatePath = Join-Path $AppDir 'impostazioni.json'
$LogPath = Join-Path $AppDir 'launcher.log'

function Write-Log($msg) { Add-Content -Path $LogPath -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" -Encoding UTF8 }

$State = $null
if (Test-Path $StatePath) { try { $State = Get-Content $StatePath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $State = $null } }
if (-not $State) { $State = New-Object PSObject }
foreach ($p in 'skyrim', 'profileId') {
  if (-not $State.PSObject.Properties[$p]) { $State | Add-Member -NotePropertyName $p -NotePropertyValue $null }
}
function Save-State { $State | ConvertTo-Json | Set-Content -Path $StatePath -Encoding UTF8 }

function Show-Info($text, $title = 'Atronach RP') {
  [void][System.Windows.Forms.MessageBox]::Show($text, $title, 'OK', 'Information')
}
function Ask-YesNo($text) {
  return ([System.Windows.Forms.MessageBox]::Show($text, 'Atronach RP', 'YesNo', 'Question') -eq 'Yes')
}

# ------------------------------------------------------------------ il launcher non deve essere amministratore

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
  [void][System.Windows.Forms.MessageBox]::Show("Hai aperto il launcher come amministratore.`n`nChiudi questa finestra e riaprilo con un normale doppio clic (senza 'Esegui come amministratore').", 'Atronach RP', 'OK', 'Warning')
  exit
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
    Start-Sleep -Seconds 1
    [System.Windows.Forms.Application]::DoEvents()
    if (-not (Get-SteamProcess)) { Start-Sleep -Seconds 2; return $true }
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

# ------------------------------------------------------------------ i controlli
# Ogni controllo: Nome, Test (restituisce Ok + Dettaglio), Pulsante e Fix (cosa fa il pulsante)

$script:Skyrim = Find-Skyrim

function New-Result($ok, $detail) { return [pscustomobject]@{ Ok = $ok; Detail = $detail } }

$Checks = @(
  [pscustomobject]@{
    Name = 'Skyrim Special Edition installato'
    Test = {
      $script:Skyrim = Find-Skyrim
      if ($script:Skyrim) { New-Result $true $script:Skyrim } else { New-Result $false 'Non trovo Skyrim. Se e'' installato, indicami la cartella.' }
    }
    Button = 'Indica la cartella'
    Fix = {
      $d = New-Object System.Windows.Forms.FolderBrowserDialog
      $d.Description = 'Scegli la cartella "Skyrim Special Edition" (quella che contiene SkyrimSE.exe)'
      if ($d.ShowDialog() -eq 'OK') {
        if (Test-Path (Join-Path $d.SelectedPath 'SkyrimSE.exe')) { $State.skyrim = $d.SelectedPath; Save-State }
        else { Show-Info 'In questa cartella non c''e'' SkyrimSE.exe. Riprova.' }
      }
    }
  },
  [pscustomobject]@{
    Name = "Versione del gioco $($Cfg.versione_skyrim)"
    Test = {
      if (-not $script:Skyrim) { return (New-Result $false 'Prima serve Skyrim.') }
      $v = (Get-Item (Join-Path $script:Skyrim 'SkyrimSE.exe')).VersionInfo.FileVersion
      if ($v -like "$($Cfg.versione_skyrim)*") { New-Result $true "Versione $v" } else { New-Result $false "Hai la versione $v, serve la $($Cfg.versione_skyrim)." }
    }
    Button = 'Come si sistema'
    Fix = {
      Show-Info ("Steam ha aggiornato Skyrim a una versione che SkyMP non supporta ancora.`n`n" +
        "Per ora questo passaggio si fa con l'aiuto dello staff: scrivi sul Discord del server e ti guidiamo noi (5 minuti).`n`n" +
        "Ti apro la guida.")
      if ($Cfg.guida_url) { Start-Process $Cfg.guida_url }
    }
  },
  [pscustomobject]@{
    Name = 'SkyMP installato'
    Test = {
      if (-not $script:Skyrim) { return (New-Result $false 'Prima serve Skyrim.') }
      $okSkse = Test-Path (Join-Path $script:Skyrim 'skse64_loader.exe')
      $okMp = Test-Path (Get-SettingsPath)
      if ($okSkse -and $okMp) { New-Result $true 'Client SkyMP e SKSE presenti' }
      elseif (-not $okMp) { New-Result $false 'Manca il client SkyMP.' }
      else { New-Result $false 'Manca SKSE (skse64_loader.exe).' }
    }
    Button = 'Scarica SkyMP'
    Fix = {
      Show-Info ("Ti apro il sito di SkyMP.`n`n1. Scarica e avvia il loro launcher.`n2. Scegli la cartella di Skyrim e lascia che installi tutto.`n3. Quando ha finito, CHIUDI il loro launcher (non usarlo per giocare) e torna qui: premi 'Ricontrolla'.")
      Start-Process $Cfg.sito_skymp
    }
  },
  [pscustomobject]@{
    Name = 'Avvio senza amministratore'
    Test = {
      $flags = Get-AdminFlags
      if (Test-SteamElevated) { New-Result $false 'Steam e'' aperto come amministratore.' }
      elseif ($flags) { New-Result $false ("Spunta 'Esegui come amministratore' su: " + (($flags | ForEach-Object { Split-Path $_.Name -Leaf }) -join ', ')) }
      else { New-Result $true 'Tutto a posto' }
    }
    Button = 'Sistema'
    Fix = {
      if (Test-SteamElevated) {
        if (-not (Ask-YesNo 'Devo chiudere Steam per sistemare. Lo chiudo adesso?')) { return }
        if (-not (Close-Steam)) { Show-Info 'Non riesco a chiudere Steam. Chiudilo tu (anche dall''icona vicino all''orologio) e premi di nuovo "Sistema".'; return }
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
        Show-Info ("Alcune impostazioni sono di sistema e serve il permesso di Windows: tra poco ti chiede 'Vuoi consentire...?'. Rispondi Si'.")
        $cmd = ($left | ForEach-Object { "Remove-ItemProperty -Path '$($_.Key)' -Name '$($_.Name)'" }) -join '; '
        try { Start-Process powershell -Verb RunAs -Wait -ArgumentList @('-NoProfile', '-Command', $cmd) } catch { Show-Info 'Permesso non concesso: chiedi aiuto allo staff.' }
      }
    }
  },
  [pscustomobject]@{
    Name = 'Steam non aggiorna Skyrim da solo'
    Test = {
      if (-not $script:Skyrim) { return (New-Result $false 'Prima serve Skyrim.') }
      $acf = Get-AcfPath $script:Skyrim
      if (-not (Test-Path $acf)) { return (New-Result $false 'Non trovo le impostazioni di Steam per Skyrim.') }
      $m = Select-String -Path $acf -Pattern '"AutoUpdateBehavior"\s+"(\d)"'
      if ($m -and $m.Matches[0].Groups[1].Value -eq '1') { New-Result $true 'Aggiorna solo quando lo avvii da Steam' }
      else { New-Result $false 'Steam puo'' aggiornare Skyrim da solo e rompere il gioco.' }
    }
    Button = 'Sistema'
    Fix = {
      $acf = Get-AcfPath $script:Skyrim
      if (-not (Test-Path $acf)) { Show-Info 'Non trovo il file di Steam: chiedi aiuto allo staff.'; return }
      if (Get-SteamProcess) {
        if (-not (Ask-YesNo 'Devo chiudere Steam per cambiare questa impostazione. Lo chiudo adesso?')) { return }
        if (-not (Close-Steam)) { Show-Info 'Non riesco a chiudere Steam. Chiudilo tu e premi di nuovo "Sistema".'; return }
      }
      $txt = Get-Content $acf -Raw
      if ($txt -match '"AutoUpdateBehavior"\s+"\d"') {
        $txt = $txt -replace '("AutoUpdateBehavior"\s+)"\d"', '$1"1"'
        [System.IO.File]::WriteAllText($acf, $txt)
        Write-Log 'AutoUpdateBehavior impostato a 1'
      } else { Show-Info 'Impostazione non trovata: fallo a mano (Steam > Skyrim > Proprieta'' > Aggiornamenti > "solo quando lo avvio").' }
    }
  },
  [pscustomobject]@{
    Name = "Collegato al server $($Cfg.nome)"
    Test = {
      if (-not $script:Skyrim -or -not (Test-Path (Get-SettingsPath))) { return (New-Result $false 'Prima serve SkyMP.') }
      $s = Get-Content (Get-SettingsPath) -Raw -Encoding UTF8 | ConvertFrom-Json
      $okIp = ($s.'server-ip' -eq $Cfg.server_ip) -and ([int]$s.'server-port' -eq [int]$Cfg.server_port)
      $okId = (-not $Cfg.usa_profile_id) -or ($s.gameData -and $s.gameData.profileId)
      if ($okIp -and $okId) { New-Result $true "$($Cfg.server_ip):$($Cfg.server_port)" } else { New-Result $false 'Il gioco non e'' ancora impostato sul nostro server.' }
    }
    Button = 'Imposta'
    Fix = {
      $path = Get-SettingsPath
      $backup = Join-Path $AppDir 'skymp5-client-settings.originale.txt'
      if (-not (Test-Path $backup)) { Copy-Item $path $backup }
      $s = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
      if ($Cfg.usa_profile_id -and -not $State.profileId) {
        $n = [Microsoft.VisualBasic.Interaction]::InputBox('Scrivi il numero di giocatore che ti ha dato lo staff:', 'Atronach RP', '')
        if (-not ($n -match '^\d+$')) { Show-Info 'Serve un numero. Se non ce l''hai, chiedilo allo staff.'; return }
        $State.profileId = [int]$n; Save-State
      }
      $s | Add-Member -Force -NotePropertyName 'server-ip' -NotePropertyValue $Cfg.server_ip
      $s | Add-Member -Force -NotePropertyName 'server-port' -NotePropertyValue ([int]$Cfg.server_port)
      if ($Cfg.usa_profile_id) {
        if (-not $s.gameData) { $s | Add-Member -Force -NotePropertyName 'gameData' -NotePropertyValue (New-Object PSObject) }
        $s.gameData | Add-Member -Force -NotePropertyName 'profileId' -NotePropertyValue ([int]$State.profileId)
      }
      [System.IO.File]::WriteAllText($path, ($s | ConvertTo-Json -Depth 5))
      Write-Log "Client impostato su $($Cfg.server_ip):$($Cfg.server_port)"
    }
  }
)

# ------------------------------------------------------------------ avvio del gioco e report

# Steam e' pronto solo se: steam.exe e' aperto, il PID che Steam ha scritto nel registro e' proprio il suo
# (altrimenti il valore e' rimasto da una sessione vecchia), c'e' un utente collegato e l'interfaccia
# (steamwebhelper) e' partita. Mentre Steam si aggiorna da solo queste condizioni non sono vere.
function Test-SteamReady {
  $s = Get-SteamProcess
  if (-not $s) { return $false }
  $ap = Get-ItemProperty 'HKCU:\Software\Valve\Steam\ActiveProcess' -ErrorAction SilentlyContinue
  if (-not $ap) { return $false }
  if (($ap.pid -as [int]) -ne $s.Id) { return $false }
  if (($ap.ActiveUser -as [int]) -eq 0) { return $false }
  return [bool](Get-Process -Name steamwebhelper -ErrorAction SilentlyContinue)
}

function Wait-Seconds($sec) {
  for ($i = 0; $i -lt ($sec * 2); $i++) { Start-Sleep -Milliseconds 500; [System.Windows.Forms.Application]::DoEvents() }
}

# SkyMP e' caricato se nel processo di Skyrim c'e' la DLL di SKSE (skse64_1_6_1170.dll)
function Test-SkseLoaded {
  $p = Get-Process -Name SkyrimSE -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $p) { return $null }
  try { return [bool]($p.Modules | Where-Object { $_.ModuleName -like 'skse64_*.dll' }) } catch { return $null }
}

function Start-Game {
  $loader = Join-Path $script:Skyrim 'skse64_loader.exe'
  $play.Enabled = $false
  try {
    if (Get-Process -Name SkyrimSE -ErrorAction SilentlyContinue) { Show-Info 'Skyrim e'' gia'' aperto. Chiudilo e premi di nuovo GIOCA.'; return }
    if (-not (Get-SteamProcess)) { Set-Status 'Apro Steam...'; Start-Process 'steam://open/main' }

    # Se Skyrim parte prima che Steam sia pronto, Steam lo riavvia senza SKSE (quindi senza SkyMP).
    # Steam deve risultare pronto per 5 secondi di fila (durante un suo aggiornamento si riavvia).
    $t = 0; $ok = 0
    while ($ok -lt 5 -and $t -lt 300) {
      if (Test-SteamReady) { $ok++ } else { $ok = 0 }
      if ($ok -eq 0) { Set-Status "Aspetto che Steam sia pronto (aggiornamento o accesso)... $t s" }
      Wait-Seconds 1; $t++
    }
    if ($ok -lt 5) { Write-Log 'Steam non pronto entro 5 minuti'; Show-Info 'Steam non e'' pronto. Apri Steam, entra con il tuo account (e aspetta che finisca di aggiornarsi), poi riprova.'; return }
    Write-Log "Steam pronto dopo $t s"

    Set-Status 'Avvio il gioco...'
    Write-Log 'Avvio skse64_loader'
    Start-Process -FilePath $loader -WorkingDirectory $script:Skyrim

    # Controllo che il gioco sia partito con SKSE: aspetto Skyrim, poi 20 secondi (se Steam lo riavvia, succede qui)
    $t = 0
    while (-not (Get-Process -Name SkyrimSE -ErrorAction SilentlyContinue) -and $t -lt 90) { Set-Status "Aspetto che il gioco si apra... $t s"; Wait-Seconds 1; $t++ }
    if ($t -ge 90) { Write-Log 'SkyrimSE non partito'; Show-Info "Il gioco non si e' aperto. Premi 'Report per lo staff' e mandalo sul Discord."; return }
    Set-Status 'Controllo che SkyMP sia attivo...'
    Wait-Seconds 20
    $skse = Test-SkseLoaded
    if ($skse -eq $false) {
      Write-Log 'SkyrimSE aperto SENZA SKSE'
      Show-Info "Steam ha riavviato il gioco senza SkyMP.`n`nChiudi Skyrim e premi di nuovo GIOCA. Se succede ancora, premi 'Report per lo staff'."
      return
    }
    Write-Log $(if ($skse) { 'SKSE caricato: avvio riuscito' } else { 'Controllo SKSE non riuscito (gioco chiuso o accesso negato)' })
    Set-Status 'SkyMP attivo. Buon divertimento!'
    Wait-Seconds 2
    $Form.Close()
  } finally { $play.Enabled = $true }
}

function New-Report {
  $stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm'
  $dir = Join-Path $env:TEMP "AtronachRP_report_$stamp"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $lines = @("Atronach RP - report del $stamp", "Windows: $([Environment]::OSVersion.VersionString)", "Skyrim: $script:Skyrim", '')
  foreach ($c in $Checks) { $r = & $c.Test; $lines += "[$(if ($r.Ok) {'OK'} else {'NO'})] $($c.Name): $($r.Detail)" }
  $lines | Set-Content (Join-Path $dir 'controlli.txt') -Encoding UTF8
  if (Test-Path $LogPath) { Copy-Item $LogPath $dir }
  if ($script:Skyrim -and (Test-Path (Get-SettingsPath))) { Copy-Item (Get-SettingsPath) $dir }
  $games = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'My Games\Skyrim Special Edition'
  Get-ChildItem $games -Filter *.log -Recurse -Depth 2 -ErrorAction SilentlyContinue | Select-Object -First 30 | ForEach-Object { Copy-Item $_.FullName $dir }
  $zip = Join-Path ([Environment]::GetFolderPath('Desktop')) "AtronachRP_report_$stamp.zip"
  Compress-Archive -Path (Join-Path $dir '*') -DestinationPath $zip -Force
  Remove-Item $dir -Recurse -Force
  Show-Info "Ho creato il file $(Split-Path $zip -Leaf) sul Desktop.`n`nMandalo allo staff sul Discord."
  Start-Process explorer.exe "/select,`"$zip`""
}

# ------------------------------------------------------------------ finestra

$Dark = [System.Drawing.Color]::FromArgb(24, 26, 32)
$Card = [System.Drawing.Color]::FromArgb(36, 39, 48)
$Text = [System.Drawing.Color]::FromArgb(230, 230, 235)
$Muted = [System.Drawing.Color]::FromArgb(150, 155, 165)
$Green = [System.Drawing.Color]::FromArgb(80, 200, 120)
$Red = [System.Drawing.Color]::FromArgb(235, 90, 80)
$Gold = [System.Drawing.Color]::FromArgb(200, 160, 70)

$Form = New-Object System.Windows.Forms.Form
$Form.Text = $Cfg.nome
$Form.Size = New-Object System.Drawing.Size(560, 740)
$Form.StartPosition = 'CenterScreen'
$Form.FormBorderStyle = 'FixedSingle'
$Form.MaximizeBox = $false
$Form.BackColor = $Dark
$Form.ForeColor = $Text
$Form.Font = New-Object System.Drawing.Font('Segoe UI', 10)

$title = New-Object System.Windows.Forms.Label
$title.Text = $Cfg.nome.ToUpper()
$title.Font = New-Object System.Drawing.Font('Segoe UI', 22, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = $Gold
$title.AutoSize = $true
$title.Location = New-Object System.Drawing.Point(24, 16)
$Form.Controls.Add($title)

$sub = New-Object System.Windows.Forms.Label
$sub.Text = 'Controllo il tuo PC. Quando e'' tutto verde, premi GIOCA.'
$sub.ForeColor = $Muted
$sub.AutoSize = $true
$sub.Location = New-Object System.Drawing.Point(26, 62)
$Form.Controls.Add($sub)

$Rows = @()
$y = 96
foreach ($c in $Checks) {
  $p = New-Object System.Windows.Forms.Panel
  $p.BackColor = $Card
  $p.Location = New-Object System.Drawing.Point(24, $y)
  $p.Size = New-Object System.Drawing.Size(496, 62)

  $dot = New-Object System.Windows.Forms.Label
  $dot.Text = [string][char]0x25CF
  $dot.Font = New-Object System.Drawing.Font('Segoe UI', 16)
  $dot.AutoSize = $true
  $dot.Location = New-Object System.Drawing.Point(10, 14)
  $p.Controls.Add($dot)

  $name = New-Object System.Windows.Forms.Label
  $name.Text = $c.Name
  $name.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
  $name.AutoSize = $true
  $name.Location = New-Object System.Drawing.Point(42, 9)
  $p.Controls.Add($name)

  $det = New-Object System.Windows.Forms.Label
  $det.ForeColor = $Muted
  $det.Font = New-Object System.Drawing.Font('Segoe UI', 8.5)
  $det.Size = New-Object System.Drawing.Size(300, 30)
  $det.Location = New-Object System.Drawing.Point(42, 30)
  $p.Controls.Add($det)

  $btn = New-Object System.Windows.Forms.Button
  $btn.Text = $c.Button
  $btn.Size = New-Object System.Drawing.Size(130, 32)
  $btn.Location = New-Object System.Drawing.Point(352, 15)
  $btn.FlatStyle = 'Flat'
  $btn.BackColor = $Gold
  $btn.ForeColor = $Dark
  $btn.Tag = $c
  $btn.Add_Click({
    try { & $this.Tag.Fix } catch { Write-Log "Errore in '$($this.Tag.Name)': $_"; Show-Info "Qualcosa non ha funzionato. Premi 'Report per lo staff' e mandalo sul Discord." }
    Update-Checks
  })
  $p.Controls.Add($btn)

  $Form.Controls.Add($p)
  $Rows += [pscustomobject]@{ Check = $c; Dot = $dot; Detail = $det; Button = $btn }
  $y += 70
}

$status = New-Object System.Windows.Forms.Label
$status.ForeColor = $Muted
$status.AutoSize = $true
$status.Location = New-Object System.Drawing.Point(26, ($y + 4))
$Form.Controls.Add($status)
function Set-Status($t) { $status.Text = $t; [System.Windows.Forms.Application]::DoEvents() }

$play = New-Object System.Windows.Forms.Button
$play.Text = 'GIOCA'
$play.Font = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Bold)
$play.Size = New-Object System.Drawing.Size(496, 56)
$play.Location = New-Object System.Drawing.Point(24, ($y + 30))
$play.FlatStyle = 'Flat'
$play.Add_Click({ try { Start-Game } catch { Write-Log "Errore avvio: $_"; Show-Info "Il gioco non e' partito. Premi 'Report per lo staff' e mandalo sul Discord." } })
$Form.Controls.Add($play)

$recheck = New-Object System.Windows.Forms.Button
$recheck.Text = 'Ricontrolla'
$recheck.Size = New-Object System.Drawing.Size(160, 32)
$recheck.Location = New-Object System.Drawing.Point(24, ($y + 96))
$recheck.FlatStyle = 'Flat'
$recheck.Add_Click({ Update-Checks })
$Form.Controls.Add($recheck)

$report = New-Object System.Windows.Forms.Button
$report.Text = 'Report per lo staff'
$report.Size = New-Object System.Drawing.Size(160, 32)
$report.Location = New-Object System.Drawing.Point(192, ($y + 96))
$report.FlatStyle = 'Flat'
$report.Add_Click({ try { New-Report } catch { Write-Log "Errore report: $_"; Show-Info 'Non sono riuscito a creare il report.' } })
$Form.Controls.Add($report)

$help = New-Object System.Windows.Forms.Button
$help.Text = 'Aiuto'
$help.Size = New-Object System.Drawing.Size(160, 32)
$help.Location = New-Object System.Drawing.Point(360, ($y + 96))
$help.FlatStyle = 'Flat'
$help.Add_Click({ if ($Cfg.discord_url) { Start-Process $Cfg.discord_url } elseif ($Cfg.guida_url) { Start-Process $Cfg.guida_url } })
$Form.Controls.Add($help)

function Update-Checks {
  Set-Status 'Controllo in corso...'
  $all = $true
  foreach ($r in $Rows) {
    $res = $null
    try { $res = & $r.Check.Test } catch { $res = New-Result $false "Errore nel controllo: $_" }
    $r.Dot.ForeColor = if ($res.Ok) { $Green } else { $Red }
    $r.Detail.Text = $res.Detail
    $r.Button.Visible = -not $res.Ok
    if (-not $res.Ok) { $all = $false }
  }
  $play.Enabled = $all
  $play.BackColor = if ($all) { $Green } else { $Card }
  $play.ForeColor = if ($all) { $Dark } else { $Muted }
  Set-Status $(if ($all) { 'Tutto pronto.' } else { 'Sistema i punti in rosso con il pulsante accanto, uno alla volta.' })
}

$Form.Add_Shown({ Update-Checks })
Write-Log 'Launcher aperto'
[void]$Form.ShowDialog()
