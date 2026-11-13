# Guardiano del server SkyMP: avvia node, lo controlla, lo riavvia e scrive crash-log.txt
Set-Location -Path $PSScriptRoot
$log = Join-Path $PSScriptRoot 'crash-log.txt'
$npc = Join-Path $PSScriptRoot 'npc-log.txt'
Set-Content -Path (Join-Path $PSScriptRoot 'guardiano.pid') -Value $PID
function L($t) { Add-Content -Path $log -Value ("[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $t) }
while ($true) {
  L 'AVVIO server'
  $p = Start-Process -FilePath 'node' -ArgumentList 'dist_back/skymp5-server.js' -RedirectStandardOutput (Join-Path $PSScriptRoot 'server-out.txt') -RedirectStandardError (Join-Path $PSScriptRoot 'server-err.txt') -PassThru -WindowStyle Hidden
  $null = $p.Handle
  $start = Get-Date
  $cpuPrev = 0
  while (-not $p.HasExited) {
    Start-Sleep -Seconds 5
    if (((Get-Date) - $start).TotalSeconds -lt 60) { continue }
    $age = ((Get-Date) - (Get-Item $npc).LastWriteTime).TotalSeconds
    if ($age -gt 40) {
      try { $p.Refresh(); $cpu = $p.CPU } catch { $cpu = -1 }
      L ("BLOCCATO: node e' vivo ma il log e' fermo da {0:N0} s. CPU totale {1}, prima {2} (se cresce = ciclo infinito, se uguale = fermo)" -f $age, $cpu, $cpuPrev)
      Start-Sleep -Seconds 4
      try { $p.Refresh(); L ("CPU dopo 4 s: {0}" -f $p.CPU) } catch {}
      try { $p.Kill() } catch {}
      break
    }
    try { $p.Refresh(); $cpuPrev = $p.CPU } catch {}
  }
  if ($p.HasExited) { $p.WaitForExit(); L ("SERVER CHIUSO. Codice di uscita: {0} / {1} (0xC0000005 = errore nativo; 3 o 0xC0000409 = abort; 1 = errore JS)" -f $p.ExitCode, ('0x{0:X}' -f [int]$p.ExitCode)) }
  $ev = Get-WinEvent -FilterHashtable @{LogName='Application';Level=2;StartTime=(Get-Date).AddMinutes(-2)} -ErrorAction SilentlyContinue | Where-Object { $_.Message -match 'node' } | Select-Object -First 1
  if ($ev) { L ("Evento Windows: " + ($ev.Message -replace "`r?`n", ' | ')) }
  Start-Sleep -Seconds 3
}
