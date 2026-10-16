$ErrorActionPreference = 'Stop'
$taskDir = $PSScriptRoot
$plan = Get-Content -LiteralPath (Join-Path $taskDir 'strict-cleanup-plan.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$verified = Get-Content -LiteralPath (Join-Path $taskDir 'strict-cleanup-verified.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$deployment = Get-Content -LiteralPath (Join-Path $taskDir 'deployment.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $verified.complete) { throw 'Current source and complete archive verification are required.' }
if (@(Get-Process | Where-Object { $_.ProcessName -match '^(SkyrimSE|ModOrganizer|BodySlide.*|OutfitStudio.*)$' }).Count) { throw 'Close Skyrim/MO2/BodySlide before cleanup.' }
$modlist = [IO.Path]::GetFullPath($plan.modlist)
if ((Get-FileHash -LiteralPath $modlist -Algorithm SHA256).Hash -ne $deployment.modlist_after_sha256) { throw 'Current profile changed after repair deployment.' }
$modsRoot = [IO.Path]::GetFullPath((Join-Path $plan.instance 'MODS\mods')).TrimEnd('\')
$ancestor = Get-Item -LiteralPath $modsRoot
while ($ancestor) {
    if ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse point in mods-root ancestry.' }
    $ancestor = $ancestor.Parent
}
$archive = Get-Item -LiteralPath $verified.archive
$archiveNs = ([decimal]$archive.LastWriteTimeUtc.Ticks - 621355968000000000) * 100
if ($archive.Length -ne $verified.archive_bytes -or $archiveNs -ne [decimal]$verified.archive_mtime_ns) { throw 'Verified archive changed.' }
$active = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($line in Get-Content -LiteralPath $modlist -Encoding UTF8) { if ($line.StartsWith('+')) { [void]$active.Add($line.Substring(1)) } }
$checked = @()
foreach ($mod in $verified.mods) {
    if ($active.Contains($mod.mod)) { throw ('Deletion target is active: ' + $mod.mod) }
    if ([IO.Path]::GetFileName($mod.mod) -ne $mod.mod -or $mod.mod -in @('', '.', '..')) { throw 'Invalid mod directory name.' }
    $target = [IO.Path]::GetFullPath((Join-Path $modsRoot $mod.mod))
    if ([IO.Path]::GetDirectoryName($target) -ne $modsRoot -or -not $target.StartsWith($modsRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Target escapes named mods root.' }
    if ((Resolve-Path -LiteralPath $target).Path -ne $target) { throw 'Resolved target differs.' }
    $entries = @((Get-Item -LiteralPath $target)) + @(Get-ChildItem -LiteralPath $target -Recurse -Force)
    if (@($entries | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw ('Linked target: ' + $target) }
    $actualFiles = @($entries | Where-Object { -not $_.PSIsContainer })
    if ($actualFiles.Count -ne $mod.verified_files.Count) { throw ('Source file count changed: ' + $target) }
    foreach ($file in $mod.verified_files) {
        $filePath = [IO.Path]::GetFullPath((Join-Path $target $file.relative))
        if (-not $filePath.StartsWith($target + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Verified file escapes checked target.' }
        $current = Get-Item -LiteralPath $filePath
        $mtimeNs = ([decimal]$current.LastWriteTimeUtc.Ticks - 621355968000000000) * 100
        if ($current.Length -ne $file.bytes -or $mtimeNs -ne [decimal]$file.mtime_ns) { throw ('Source changed after SHA-256 verification: ' + $filePath) }
    }
    $checked += @{mod=$mod.mod;path=$target;bytes=[long]$mod.bytes}
}
$profile = [IO.Path]::GetDirectoryName($modlist)
$pluginHashes = @{}
foreach ($name in @('plugins.txt','loadorder.txt')) {
    $path = Join-Path $profile $name
    if (Test-Path -LiteralPath $path) { $pluginHashes[$path] = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash }
}
Copy-Item -LiteralPath $modlist -Destination (Join-Path $taskDir 'modlist-before-strict-cleanup.txt')
$result = @{completed=$false;removed=@();free_before=(Get-PSDrive E).Free;backup_archive=$verified.archive;backup_sha256=$verified.archive_sha256;current_profile=$plan.profile;policy='Only the current profile is protected, as explicitly requested.'}
$receipt = Join-Path $taskDir 'strict-cleanup-result.json'
$result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $receipt -Encoding UTF8
foreach ($item in $checked) {
    # Every resolved absolute target is a direct child of the named mods directory.
    # All source files matched the completely verified archive immediately before this action.
    Remove-Item -LiteralPath $item.path -Recurse -Force
    $result.removed += $item
    $result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $receipt -Encoding UTF8
    Write-Output ('Removed inactive mod: ' + $item.mod)
}
$removedNames = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($item in $checked) { [void]$removedNames.Add($item.mod) }
$lines = @(Get-Content -LiteralPath $modlist -Encoding UTF8 | Where-Object { -not ($_.StartsWith('-') -and $removedNames.Contains($_.Substring(1))) })
[IO.File]::WriteAllText($modlist,($lines -join "`r`n") + "`r`n",[Text.UTF8Encoding]::new($false))
foreach ($path in $pluginHashes.Keys) { if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $pluginHashes[$path]) { throw ('Plugin order changed: ' + $path) } }
$result.completed = $true
$result.removed_bytes = 0L
foreach ($item in $checked) { $result.removed_bytes += $item.bytes }
$result.free_after = (Get-PSDrive E).Free
$result.modlist_after_sha256 = (Get-FileHash -LiteralPath $modlist -Algorithm SHA256).Hash
$result.plugin_order_unchanged = $true
$result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $receipt -Encoding UTF8
Write-Output ('Cleanup complete: ' + $checked.Count + ' inactive mods, ' + [Math]::Round($result.removed_bytes / 1GB, 2) + ' GiB removed; obsolete entries removed from current profile.')
