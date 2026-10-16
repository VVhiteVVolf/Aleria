$ErrorActionPreference = 'Stop'
$auditDir = $PSScriptRoot
$plan = Get-Content -LiteralPath (Join-Path $auditDir 'cleanup-execution-plan.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$receipt = Get-Content -LiteralPath (Join-Path $auditDir 'cleanup-archive-verification.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $receipt.complete) { throw 'Backup archive verification is incomplete.' }
$running = @(Get-Process | Where-Object { $_.ProcessName -match '^(SkyrimSE|Skyrim|ModOrganizer|BodySlide.*|OutfitStudio.*)$' })
if ($running.Count) { throw ('Close applications before cleanup: ' + ($running.ProcessName -join ', ')) }
$modsRoot = [IO.Path]::GetFullPath('E:\Nolvus\Instances\Nolvus Awakening\MODS\mods').TrimEnd('\')
if ((Get-Item -LiteralPath $modsRoot).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Mods root is a reparse point.' }
$profileRoot = Join-Path $plan.instance 'MODS\profiles'
$configFiles = @((Join-Path $plan.instance 'MO2\ModOrganizer.ini'))
$enabled = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($dir in Get-ChildItem -LiteralPath $profileRoot -Directory) {
    $modlist = Join-Path $dir.FullName 'modlist.txt'
    if (Test-Path -LiteralPath $modlist) {
        foreach ($line in Get-Content -LiteralPath $modlist -Encoding UTF8) {
            if ($line.StartsWith('+')) { [void]$enabled.Add($line.Substring(1)) }
        }
    }
    foreach ($name in @('modlist.txt','plugins.txt','loadorder.txt','settings.ini')) {
        $path = Join-Path $dir.FullName $name
        if (Test-Path -LiteralPath $path) { $configFiles += $path }
    }
}
$configBefore = @($configFiles | ForEach-Object { @{path=$_;sha256=(Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash} })
$configBefore | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $auditDir 'config-state-before-cleanup.json') -Encoding UTF8
$candidates = @($plan.mods | Where-Object decision -eq 'DELETE')
$checked = @()
foreach ($mod in $candidates) {
    if ($enabled.Contains($mod.mod)) { throw ('Mod is enabled in a saved profile: ' + $mod.mod) }
    if ([IO.Path]::GetFileName($mod.mod) -ne $mod.mod -or $mod.mod -in @('.', '..', '')) { throw 'Invalid mod name.' }
    $target = [IO.Path]::GetFullPath((Join-Path $modsRoot $mod.mod))
    if (-not $target.StartsWith($modsRoot + '\', [StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetDirectoryName($target) -ne $modsRoot) { throw 'Target escapes the named mods directory.' }
    $resolved = (Resolve-Path -LiteralPath $target).Path
    if ($resolved -ne $target) { throw 'Resolved target differs from verified target.' }
    $entries = @((Get-Item -LiteralPath $target)) + @(Get-ChildItem -LiteralPath $target -Recurse -Force)
    if (@($entries | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw ('Filesystem link in target: ' + $target) }
    $files = @($entries | Where-Object { -not $_.PSIsContainer })
    if ($files.Count -ne $mod.verified_files.Count) { throw ('File count changed: ' + $target) }
    foreach ($file in $mod.verified_files) {
        $fileTarget = [IO.Path]::GetFullPath((Join-Path $target $file.relative))
        if (-not $fileTarget.StartsWith($target + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'File escapes checked mod directory.' }
        $item = Get-Item -LiteralPath $fileTarget
        if ($item.Length -ne $file.bytes -or (Get-FileHash -LiteralPath $fileTarget -Algorithm SHA256).Hash -ne $file.sha256) { throw ('File changed since verified backup: ' + $fileTarget) }
    }
    foreach ($group in $mod.backup_groups) {
        $backupPath = $plan.archives.$group.archive
        $verifiedArchive = @($receipt.archives | Where-Object path -eq $backupPath)
        if ($verifiedArchive.Count -ne 1) { throw ('Archive not verified: ' + $backupPath) }
        $archive = Get-Item -LiteralPath $backupPath
        $timestampNs = ($archive.LastWriteTimeUtc.Ticks - 621355968000000000) * 100
        if ($archive.Length -ne $verifiedArchive[0].size -or $timestampNs -ne $verifiedArchive[0].mtime_ns) { throw ('Verified archive changed: ' + $backupPath) }
    }
    $checked += @{mod=$mod.mod;path=$target;bytes=$mod.bytes;backup_groups=$mod.backup_groups}
}
$result = @{completed=$false;removed=@();free_before=(Get-PSDrive E).Free;authorization='User requested deletion of unchecked mods except potentially needed mods.'}
$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $auditDir 'cleanup-result.json') -Encoding UTF8
foreach ($item in $checked) {
    # Absolute targets, reparse points, current profiles and complete backup hashes were checked above.
    Remove-Item -LiteralPath $item.path -Recurse -Force
    $result.removed += $item
    $result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $auditDir 'cleanup-result.json') -Encoding UTF8
    Write-Output ('Removed backed-up inactive mod: ' + $item.mod)
}
foreach ($entry in $configBefore) {
    if ((Get-FileHash -LiteralPath $entry.path -Algorithm SHA256).Hash -ne $entry.sha256) { throw ('Profile/config changed: ' + $entry.path) }
}
$result.completed = $true
$result.free_after = (Get-PSDrive E).Free
$result.removed_bytes = 0L
foreach ($item in $checked) { $result.removed_bytes += [long]$item.bytes }
$result.profile_and_mo2_config_unchanged = $true
$result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $auditDir 'cleanup-result.json') -Encoding UTF8
Write-Output ('Cleanup complete: ' + $checked.Count + ' mods; ' + [Math]::Round($result.removed_bytes / 1GB, 3) + ' GiB removed. Profile and MO2 configuration hashes unchanged.')
