param([switch]$Check, [string[]]$IconIds = @())
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$artRoot = Join-Path $projectRoot 'docs\art\combat-technique-icons'
$assetRoot = Join-Path $projectRoot 'assets\combat-technique-icons'
$publicRoot = Join-Path $projectRoot 'public\assets\combat-technique-icons'
$manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $artRoot 'manifest.json') | ConvertFrom-Json
foreach ($iconId in $IconIds) { if ($iconId -notin $manifest.sources.id) { throw "Unknown icon: $iconId" } }
$preparedCount = 0
if (-not $Check) {
    [IO.Directory]::CreateDirectory($assetRoot) | Out-Null
    [IO.Directory]::CreateDirectory($publicRoot) | Out-Null
}
foreach ($entry in $manifest.sources) {
    if ($IconIds.Count -gt 0 -and $entry.id -notin $IconIds) { continue }
    if ($entry.id -notmatch '^[a-z0-9-]+$') { throw 'Invalid icon identifier' }
    $inputPath = Join-Path $artRoot ('sources\' + $entry.id + '.png')
    $outputPath = Join-Path $assetRoot ($entry.id + '.png')
    $sourceImage = [Drawing.Image]::FromFile($inputPath)
    $bitmap = New-Object Drawing.Bitmap(256, 256, ([Drawing.Imaging.PixelFormat]::Format32bppArgb))
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $memory = New-Object IO.MemoryStream
    try {
        $graphics.Clear([Drawing.Color]::Transparent)
        # Keep the generated transparent silhouette; close accidental alpha voids
        # within the opaque button field before drawing the original artwork.
        $field = New-Object Drawing.Drawing2D.GraphicsPath
        $brush = New-Object Drawing.SolidBrush([Drawing.ColorTranslator]::FromHtml($entry.backgroundColor))
        try {
            $field.AddArc(14, 14, 40, 40, 180, 90)
            $field.AddArc(202, 14, 40, 40, 270, 90)
            $field.AddArc(202, 202, 40, 40, 0, 90)
            $field.AddArc(14, 202, 40, 40, 90, 90)
            $field.CloseFigure()
            $graphics.FillPath($brush, $field)
        } finally { $brush.Dispose(); $field.Dispose() }
        $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceOver
        $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $scale = [Math]::Min(256 / $sourceImage.Width, 256 / $sourceImage.Height)
        $width = [int][Math]::Round($sourceImage.Width * $scale)
        $height = [int][Math]::Round($sourceImage.Height * $scale)
        $rectangle = New-Object Drawing.Rectangle(([int]((256 - $width) / 2)), ([int]((256 - $height) / 2)), $width, $height)
        $graphics.DrawImage($sourceImage, $rectangle)
        $bitmap.Save($memory, [Drawing.Imaging.ImageFormat]::Png)
        $bytes = $memory.ToArray()
        if ($Check) {
            $sha = [Security.Cryptography.SHA256]::Create()
            try {
                $expected = [Convert]::ToBase64String($sha.ComputeHash($bytes))
                foreach ($targetPath in @($outputPath, (Join-Path $publicRoot ($entry.id + '.png')))) {
                    if (-not (Test-Path -LiteralPath $targetPath)) { throw "Missing icon: $targetPath" }
                    $actual = [Convert]::ToBase64String($sha.ComputeHash([IO.File]::ReadAllBytes($targetPath)))
                    if ($actual -ne $expected) { throw "Stale icon: $targetPath" }
                }
            } finally { $sha.Dispose() }
        } else {
            [IO.File]::WriteAllBytes($outputPath, $bytes)
            [IO.File]::WriteAllBytes((Join-Path $publicRoot ($entry.id + '.png')), $bytes)
        }
        $preparedCount++
    } finally {
        $memory.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
        $sourceImage.Dispose()
    }
}
Write-Output ("{0} comic technique icons {1}." -f $preparedCount, $(if ($Check) { 'verified' } else { 'prepared' }))
