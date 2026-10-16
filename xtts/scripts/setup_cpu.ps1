$ErrorActionPreference = 'Stop'
$xttsRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $xttsRoot
foreach ($folder in @('cache\tmp', 'cache\pip', 'logs', 'voices\en', 'output')) {
    New-Item -ItemType Directory -Force -Path (Join-Path $xttsRoot $folder) | Out-Null
}
$env:TEMP = Join-Path $xttsRoot 'cache\tmp'
$env:TMP = $env:TEMP
$env:PIP_CACHE_DIR = Join-Path $xttsRoot 'cache\pip'
if (-not (Test-Path -LiteralPath '.venv\Scripts\python.exe')) {
    & py -3.12 -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw 'Virtual environment creation failed.' }
}
$xttsPython = Join-Path $xttsRoot '.venv\Scripts\python.exe'
$source = Get-Content -LiteralPath 'config\upstream.json' -Raw | ConvertFrom-Json
if (-not (Test-Path -LiteralPath 'upstream')) {
    & git clone $source.repository upstream
    if ($LASTEXITCODE -ne 0) { throw 'Source download failed.' }
    & git -C upstream checkout --detach $source.commit
    if ($LASTEXITCODE -ne 0) { throw 'Source version checkout failed.' }
    & git -C upstream apply (Join-Path $xttsRoot 'config\cpu-local.patch')
    if ($LASTEXITCODE -ne 0) { throw 'CPU configuration patch failed.' }
}
& $xttsPython -m pip install torch==2.8.0+cpu torchaudio==2.8.0+cpu --index-url https://download.pytorch.org/whl/cpu
if ($LASTEXITCODE -ne 0) { throw 'CPU PyTorch installation failed.' }
& $xttsPython -m pip install -r requirements-working.txt --extra-index-url https://download.pytorch.org/whl/cpu
if ($LASTEXITCODE -ne 0) { throw 'Locked dependencies installation failed.' }
& $xttsPython scripts\download_model.py
if ($LASTEXITCODE -ne 0) { throw 'Model download/hash verification failed.' }
if (-not (Test-Path -LiteralPath 'voices\en\demo_femalecommoner.wav')) {
    Copy-Item -LiteralPath 'upstream\speakers\en\femalecommoner.wav' -Destination 'voices\en\demo_femalecommoner.wav'
}
if (-not (Test-Path -LiteralPath 'skyrimnet_config.txt')) {
    Copy-Item -LiteralPath 'upstream\skyrimnet_config.txt' -Destination 'skyrimnet_config.txt'
}
& $xttsPython -m pip check
if ($LASTEXITCODE -ne 0) { throw 'Dependency validation failed.' }
Write-Host 'Ready. Run start_xtts_cpu.bat, then test_xtts.bat --full.'
