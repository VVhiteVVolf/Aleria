$ErrorActionPreference = 'Stop'
$xttsRoot = Split-Path -Parent $PSScriptRoot
$expectedScript = Join-Path $xttsRoot 'scripts\run_server.py'
$listener = Get-NetTCPConnection -LocalPort 7860 -State Listen -ErrorAction SilentlyContinue
if (-not $listener) { Write-Host 'No server listening on port 7860.'; exit 0 }
$serverProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
$isLocalServer = $serverProcess.CommandLine -and $serverProcess.CommandLine.Contains($expectedScript)
if (-not $isLocalServer -and $serverProcess.CommandLine -match '"scripts\\run_server\.py"') {
    $parentProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$($serverProcess.ParentProcessId)"
    $isLocalServer = $parentProcess.ExecutablePath -eq (Join-Path $xttsRoot '.venv\Scripts\python.exe')
}
if (-not $isLocalServer) {
    throw 'Port 7860 belongs to a different process. Nothing was stopped.'
}
Stop-Process -Id $serverProcess.ProcessId
Write-Host 'Stopped this local XTTS server.'
