param([switch]$Check, [string[]]$IconIds = @())
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$artRoot = Join-Path $projectRoot 'docs\art\ability-icons'
$publicRoot = Join-Path $projectRoot 'public\assets\ability-icons'
$manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $artRoot 'manifest.json') | ConvertFrom-Json
foreach ($iconId in $IconIds) { if ($iconId -notin $manifest.jobs.asset) { throw "Unknown ability icon: $iconId" } }
$preparedCount = 0
if (-not $Check) { [IO.Directory]::CreateDirectory($publicRoot) | Out-Null }
foreach ($job in $manifest.jobs) {
    if ($IconIds.Count -gt 0 -and $job.asset -notin $IconIds) { continue }
    if ($job.asset -notmatch '^[a-z0-9-]+$') { throw 'Invalid ability icon identifier' }
    $inputPath = Join-Path $artRoot ('sources\' + $job.asset + '.png')
    $outputPath = Join-Path $publicRoot ($job.asset + '.png')
    $sourceImage = [Drawing.Image]::FromFile($inputPath)
    $bitmap = New-Object Drawing.Bitmap(256, 256, ([Drawing.Imaging.PixelFormat]::Format32bppArgb))
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $memory = New-Object IO.MemoryStream
    try {
        $graphics.Clear([Drawing.Color]::Transparent)
        # Confine stray generated outer pixels to the common rounded icon frame.
        $outerFrame = New-Object Drawing.Drawing2D.GraphicsPath
        try {
            $outerFrame.AddArc(6, 6, 48, 48, 180, 90)
            $outerFrame.AddArc(202, 6, 48, 48, 270, 90)
            $outerFrame.AddArc(202, 202, 48, 48, 0, 90)
            $outerFrame.AddArc(6, 202, 48, 48, 90, 90)
            $outerFrame.CloseFigure()
            $graphics.SetClip($outerFrame)
        } finally { $outerFrame.Dispose() }
        # Generated originals are retained unchanged. Supply the opaque button
        # field beneath accidental transparent holes inside the rounded panel.
        $field = New-Object Drawing.Drawing2D.GraphicsPath
        $brush = New-Object Drawing.SolidBrush([Drawing.ColorTranslator]::FromHtml($job.background))
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
            if (-not (Test-Path -LiteralPath $outputPath)) { throw "Missing ability icon: $outputPath" }
            $sha = [Security.Cryptography.SHA256]::Create()
            try {
                $expected = [Convert]::ToBase64String($sha.ComputeHash($bytes))
                $actual = [Convert]::ToBase64String($sha.ComputeHash([IO.File]::ReadAllBytes($outputPath)))
                if ($actual -ne $expected) { throw "Stale ability icon: $outputPath" }
            } finally { $sha.Dispose() }
        } else { [IO.File]::WriteAllBytes($outputPath, $bytes) }
        $preparedCount++
    } finally {
        $memory.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
        $sourceImage.Dispose()
    }
}
Write-Output ("{0} ability icons {1}." -f $preparedCount, $(if ($Check) { 'verified' } else { 'prepared' }))
