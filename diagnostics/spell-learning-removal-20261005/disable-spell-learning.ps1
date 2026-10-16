param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$taskInstance = 'E:\Nolvus\Instances\Nolvus Awakening'
$taskProfileName = 'Nolvus Awakening - SkyrimNet Beta25 Test'
$taskProfile = Join-Path $taskInstance ('MODS\profiles\' + $taskProfileName)
$taskWork = 'E:\Aleria\diagnostics\spell-learning-removal-20261005'
$taskModName = 'Immersive Spell Learning - DESTified'
$taskPlugin = 'DEST_ISL.esp'
$taskUtf8 = [System.Text.UTF8Encoding]::new($false, $true)

if (Get-Process ModOrganizer, SkyrimSE -ErrorAction SilentlyContinue) {
    throw 'Skyrim und MO2 müssen vor dem Schreiben der Profildateien geschlossen sein.'
}
$taskIni = Join-Path $taskInstance 'MO2\ModOrganizer.ini'
$taskSelected = [regex]::Match([System.IO.File]::ReadAllText($taskIni), '(?m)^selected_profile=@ByteArray\((.*)\)\r?$').Groups[1].Value
if ($taskSelected -ne $taskProfileName) { throw 'Das ausgewählte MO2-Profil hat sich geändert.' }
$taskAudit = Get-Content -Raw -LiteralPath (Join-Path $taskWork 'audit.json') | ConvertFrom-Json
if ($taskAudit.profile -ne $taskProfileName -or @($taskAudit.dependents).Count -ne 0 -or @($taskAudit.errors).Count -ne 0 -or @($taskAudit.missing_plugins).Count -ne 0) {
    throw 'Die Plugin-Abhängigkeitsprüfung ist nicht vollständig oder enthält Abhängigkeiten.'
}
$taskBackup = Join-Path $taskWork 'before'
$taskStage = Join-Path $taskWork 'staged'
New-Item -ItemType Directory -Force -Path $taskStage | Out-Null
$taskChanges = @()
foreach ($taskFileName in @('modlist.txt', 'plugins.txt', 'loadorder.txt')) {
    $taskPath = Join-Path $taskProfile $taskFileName
    $taskBytes = [System.IO.File]::ReadAllBytes($taskPath)
    $taskText = $taskUtf8.GetString($taskBytes)
    if ($taskFileName -eq 'modlist.txt') {
        $taskPattern = '(?m)^\+' + [regex]::Escape($taskModName) + '(?=\r?$)'
        $taskReplacement = '-' + $taskModName
    } else {
        $taskPattern = '(?m)^\*?' + [regex]::Escape($taskPlugin) + '(?:\r?\n|$)'
        $taskReplacement = ''
    }
    if ([regex]::Matches($taskText, $taskPattern).Count -ne 1) { throw "Genau ein Zieleintrag erwartet: $taskFileName" }
    $taskNewText = [regex]::Replace($taskText, $taskPattern, $taskReplacement)
    $taskStagePath = Join-Path $taskStage $taskFileName
    [System.IO.File]::WriteAllBytes($taskStagePath, $taskUtf8.GetBytes($taskNewText))
    $taskChanges += [PSCustomObject]@{
        File = $taskFileName; Path = $taskPath; Stage = $taskStagePath;
        BeforeHash = (Get-FileHash -LiteralPath $taskPath -Algorithm SHA256).Hash
        AfterHash = (Get-FileHash -LiteralPath $taskStagePath -Algorithm SHA256).Hash
    }
}
if (-not $Apply) {
    $taskChanges | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $taskWork 'prepared-changes.json')
    Write-Output 'Vorbereitet: ein Mod deaktiviert, genau dessen Plugin aus plugins.txt und loadorder.txt entfernt. Noch keine Nolvus-Dateien verändert.'
    exit 0
}
if (Test-Path -LiteralPath $taskBackup) { throw 'Sicherung besteht bereits; vorhandene Sicherung nicht überschreiben.' }
New-Item -ItemType Directory -Path $taskBackup | Out-Null
Copy-Item -LiteralPath $taskIni -Destination (Join-Path $taskBackup 'ModOrganizer.ini')
foreach ($taskChange in $taskChanges) {
    Copy-Item -LiteralPath $taskChange.Path -Destination (Join-Path $taskBackup $taskChange.File)
}
$taskWritten = @()
try {
    foreach ($taskChange in $taskChanges) {
        if ((Get-FileHash -LiteralPath $taskChange.Path -Algorithm SHA256).Hash -ne $taskChange.BeforeHash) { throw 'Profildatei wurde gleichzeitig verändert.' }
        [System.IO.File]::WriteAllBytes($taskChange.Path, [System.IO.File]::ReadAllBytes($taskChange.Stage))
        $taskWritten += $taskChange
        if ((Get-FileHash -LiteralPath $taskChange.Path -Algorithm SHA256).Hash -ne $taskChange.AfterHash) { throw 'Prüfsumme nach dem Schreiben stimmt nicht.' }
    }
} catch {
    foreach ($taskChange in $taskWritten) {
        [System.IO.File]::WriteAllBytes($taskChange.Path, [System.IO.File]::ReadAllBytes((Join-Path $taskBackup $taskChange.File)))
    }
    throw
}
$taskResult = [PSCustomObject]@{
    Profile = $taskProfileName; DisabledMod = $taskModName; RemovedPlugin = $taskPlugin;
    Backup = $taskBackup; ModFilesRetained = $true; Changes = $taskChanges
}
$taskResult | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $taskWork 'result.json')
Write-Output 'Spell Learning im ausgewählten Profil deaktiviert; alle drei geänderten Dateien gesichert und per SHA-256 verifiziert.'
