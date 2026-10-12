$ErrorActionPreference = 'Stop'
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'complete-archive-parts.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$target = Join-Path $PSScriptRoot $manifest.archive

if (Test-Path -LiteralPath $target) {
    if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -eq $manifest.sha256) {
        Write-Output "Bereits vollständig vorhanden: $target"
        exit 0
    }
    throw "Die Zieldatei existiert mit anderem Inhalt. Sie wird nicht überschrieben: $target"
}

foreach ($part in $manifest.parts) {
    $path = Join-Path $PSScriptRoot $part.file
    if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $part.sha256) {
        throw "Prüfsumme stimmt nicht: $path"
    }
}

$output = [System.IO.File]::Open($target, [System.IO.FileMode]::CreateNew)
try {
    foreach ($part in $manifest.parts) {
        $inputStream = [System.IO.File]::OpenRead((Join-Path $PSScriptRoot $part.file))
        try { $inputStream.CopyTo($output) } finally { $inputStream.Dispose() }
    }
} finally { $output.Dispose() }

if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $manifest.sha256) {
    throw "Prüfsumme des zusammengesetzten Archivs stimmt nicht: $target"
}
Write-Output "Vollständiges Archiv erstellt und geprüft: $target"
