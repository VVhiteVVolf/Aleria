$ErrorActionPreference = 'Stop'
$diagnosisRoot = 'E:\Aleria\diagnostics\neckseam-20261006'
$plan = Get-Content -LiteralPath (Join-Path $diagnosisRoot 'repair-deployment-plan.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$expectedRoot = [IO.Path]::GetFullPath('E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\Local - New Downloads OBody Output 20261006')
if (-not $plan.verified -or [IO.Path]::GetFullPath($plan.target_root) -ne $expectedRoot) { throw 'Unexpected deployment target' }
if (Get-Process SkyrimSE -ErrorAction SilentlyContinue) { throw 'Skyrim must be closed before replacing meshes' }
foreach ($row in $plan.files) {
    $targetPath = [IO.Path]::GetFullPath($row.target)
    $sourcePath = [IO.Path]::GetFullPath($row.source)
    if (-not $targetPath.StartsWith($expectedRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Target escapes repair mod' }
    if (-not $sourcePath.StartsWith($diagnosisRoot + '\default-repair-build\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Source escapes staging' }
    if ((Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash -ne $row.old_sha256) { throw ('Original file changed: ' + $row.relative) }
    if ((Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash -ne $row.new_sha256) { throw ('Staged file changed: ' + $row.relative) }
}
foreach ($row in $plan.files) {
    $backupPath = [IO.Path]::GetFullPath((Join-Path $plan.backup_root $row.relative))
    if (-not $backupPath.StartsWith([IO.Path]::GetFullPath($plan.backup_root) + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Backup path escapes directory' }
    if (Test-Path -LiteralPath $backupPath) { throw ('Backup already exists: ' + $backupPath) }
    New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($backupPath)) -Force | Out-Null
    Copy-Item -LiteralPath $row.target -Destination $backupPath
    if ((Get-FileHash -LiteralPath $backupPath -Algorithm SHA256).Hash -ne $row.old_sha256) { throw 'Backup verification failed' }
}
if (Get-Process SkyrimSE -ErrorAction SilentlyContinue) { throw 'Skyrim started during backup; repair not applied' }
$appliedRows = @()
try {
    foreach ($row in $plan.files) {
        Copy-Item -LiteralPath $row.source -Destination $row.target -Force
        $appliedRows += $row
        if ((Get-FileHash -LiteralPath $row.target -Algorithm SHA256).Hash -ne $row.new_sha256) { throw ('Deployment verification failed: ' + $row.relative) }
    }
} catch {
    foreach ($row in $appliedRows) {
        Copy-Item -LiteralPath (Join-Path $plan.backup_root $row.relative) -Destination $row.target -Force
    }
    throw
}
@{ completed = $true; files = $appliedRows.Count; backup_root = $plan.backup_root; projects = $plan.projects } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $diagnosisRoot 'repair-deployment-result.json') -Encoding UTF8
Write-Output ('Verified repaired files: ' + $appliedRows.Count)
