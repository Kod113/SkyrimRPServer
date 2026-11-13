@echo off
cd /d "%~dp0"
(
echo === ORA %date% %time% ===
echo === processi node ===
tasklist /FI "IMAGENAME eq node.exe"
echo === CPU di node, due misure a 4 secondi ===
powershell -NoProfile -Command "$a=Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,CPU,WS; $a | Format-Table; Start-Sleep 4; Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,CPU,WS | Format-Table"
echo === Errori di applicazione nelle ultime 3 ore ===
powershell -NoProfile -Command "Get-WinEvent -FilterHashtable @{LogName='Application';Level=2;StartTime=(Get-Date).AddHours(-3)} -ErrorAction SilentlyContinue | Where-Object { $_.Message -match 'node|Skyrim|scam' } | Select-Object -First 8 | Format-List TimeCreated,ProviderName,Message"
echo === fine ===
) > diagnosi.txt 2>&1
