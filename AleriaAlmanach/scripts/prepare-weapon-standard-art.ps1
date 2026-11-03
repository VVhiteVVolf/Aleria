param([switch]$Check)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$artRoot = Join-Path $projectRoot 'docs\art\weapon-standards'
$assetRoot = Join-Path $projectRoot 'public\assets\weapon-standards'
$manifestPath = Join-Path $artRoot 'manifest.json'
$receiptPath = Join-Path $artRoot 'preparation.json'
$manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
$manifestIds = @($manifest.sources | ForEach-Object { $_.id })
if ($manifestIds.Count -ne 35 -or @($manifestIds | Select-Object -Unique).Count -ne 35) { throw 'The weapon art manifest must contain exactly 35 unique standards.' }
function Digest-Bytes([byte[]]$Bytes) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash($Bytes)).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
function Digest-TextFile([string]$Path) {
    $text = [IO.File]::ReadAllText($Path).Replace("`r`n", "`n")
    return Digest-Bytes ([Text.Encoding]::UTF8.GetBytes($text))
}
foreach ($entry in $manifest.sources) {
    if ($entry.id -notmatch '^[a-z0-9-]+$') { throw 'Invalid weapon identifier.' }
    $sourcePath = [IO.Path]::GetFullPath((Join-Path $artRoot $entry.source))
    $assetPath = [IO.Path]::GetFullPath((Join-Path $artRoot $entry.asset))
    if ($sourcePath -ne (Join-Path $artRoot ('sources\' + $entry.id + '.png')) -or $assetPath -ne (Join-Path $assetRoot ($entry.id + '.png'))) { throw "Unexpected weapon art path: $($entry.id)" }
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing generated weapon source: $sourcePath" }
}
$prepared = @()
foreach ($entry in $manifest.sources) {
    $sourcePath = Join-Path $artRoot ('sources\' + $entry.id + '.png')
    $sourceImage = [Drawing.Image]::FromFile($sourcePath)
    $bitmap = New-Object Drawing.Bitmap(512, 512, ([Drawing.Imaging.PixelFormat]::Format32bppArgb))
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $memory = New-Object IO.MemoryStream
    try {
        if (-not [Drawing.Image]::IsAlphaPixelFormat($sourceImage.PixelFormat)) { throw "Generated weapon source has no alpha channel: $($entry.id)" }
        $graphics.Clear([Drawing.Color]::Transparent)
        $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        # Reserve a clear eight-pixel exterior without cropping any source pixel.
        $scale = [Math]::Min(496 / $sourceImage.Width, 496 / $sourceImage.Height)
        $width = [int][Math]::Round($sourceImage.Width * $scale)
        $height = [int][Math]::Round($sourceImage.Height * $scale)
        $rectangle = New-Object Drawing.Rectangle(([int]((512 - $width) / 2)), ([int]((512 - $height) / 2)), $width, $height)
        $graphics.DrawImage($sourceImage, $rectangle)
        foreach ($point in @(@(0, 0), @(511, 0), @(0, 511), @(511, 511))) {
            if ($bitmap.GetPixel($point[0], $point[1]).A -ne 0) { throw "Weapon exterior is not transparent: $($entry.id)" }
        }
        $pixels = $bitmap.LockBits((New-Object Drawing.Rectangle(0, 0, 512, 512)), [Drawing.Imaging.ImageLockMode]::ReadOnly, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $pixelBytes = New-Object byte[] ([Math]::Abs($pixels.Stride) * $pixels.Height)
            [Runtime.InteropServices.Marshal]::Copy($pixels.Scan0, $pixelBytes, 0, $pixelBytes.Length)
            $visible = $false
            for ($offset = 3; $offset -lt $pixelBytes.Length; $offset += 4) { if ($pixelBytes[$offset] -gt 0) { $visible = $true; break } }
            if (-not $visible) { throw "Generated weapon is entirely transparent: $($entry.id)" }
        } finally { $bitmap.UnlockBits($pixels) }
        $bitmap.Save($memory, [Drawing.Imaging.ImageFormat]::Png)
        $bytes = $memory.ToArray()
        if ($bytes[25] -ne 6) { throw "Weapon output is not RGBA PNG: $($entry.id)" }
        $prepared += [PSCustomObject]@{ id = $entry.id; bytes = $bytes; sourceSha256 = (Digest-Bytes ([IO.File]::ReadAllBytes($sourcePath))); assetSha256 = (Digest-Bytes $bytes) }
    } finally { $memory.Dispose(); $graphics.Dispose(); $bitmap.Dispose(); $sourceImage.Dispose() }
}
$receipt = [ordered]@{ schemaVersion = 1; tool = 'prepare-weapon-standard-art.ps1'; size = 512;
    scriptSha256 = (Digest-TextFile $PSCommandPath);
    manifestSha256 = (Digest-TextFile $manifestPath);
    images = @($prepared | ForEach-Object { [ordered]@{ id = $_.id; sourceSha256 = $_.sourceSha256; assetSha256 = $_.assetSha256 } }) }
$receiptJson = ($receipt | ConvertTo-Json -Depth 6) + [Environment]::NewLine
if ($Check) {
    foreach ($entry in $prepared) {
        $path = Join-Path $assetRoot ($entry.id + '.png')
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing prepared weapon: $path" }
        if ((Digest-Bytes ([IO.File]::ReadAllBytes($path))) -ne $entry.assetSha256) { throw "Stale prepared weapon: $($entry.id)" }
    }
    if (-not (Test-Path -LiteralPath $receiptPath) -or [IO.File]::ReadAllText($receiptPath).Replace("`r`n", "`n") -ne $receiptJson.Replace("`r`n", "`n")) { throw 'The weapon preparation receipt is stale.' }
} else {
    [IO.Directory]::CreateDirectory($assetRoot) | Out-Null
    foreach ($entry in $prepared) { [IO.File]::WriteAllBytes((Join-Path $assetRoot ($entry.id + '.png')), $entry.bytes) }
    [IO.File]::WriteAllText($receiptPath, $receiptJson, (New-Object Text.UTF8Encoding($false)))
}
Write-Output ("35 weapon standards {0}: 512px RGBA, preserved aspect, transparent padding, original sources retained." -f $(if ($Check) { 'reproduced and verified' } else { 'prepared' }))
