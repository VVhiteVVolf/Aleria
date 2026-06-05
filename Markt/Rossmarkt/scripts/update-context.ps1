$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'kontext_pferde.md'
$target = Join-Path $root 'data\kontext-pferde.js'
$utf8 = [System.Text.UTF8Encoding]::new($false)

if (-not (Test-Path -LiteralPath $source)) {
  throw "Quelle nicht gefunden: $source"
}

$markdown = [System.IO.File]::ReadAllText($source, [System.Text.Encoding]::UTF8)
$encoded = $markdown | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText($target, "window.ROSSMARKT_PFERDE_KONTEXT_MD = $encoded;`r`n", $utf8)

Write-Host "Kontext aktualisiert: $target"
