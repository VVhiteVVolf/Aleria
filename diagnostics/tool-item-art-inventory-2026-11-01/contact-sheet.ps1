Add-Type -AssemblyName System.Drawing
$taskRoot = 'E:\Aleria'
$auditRows = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'contact-inputs.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$cellWidth = 184
$cellHeight = 208
$columns = 6
$rows = [Math]::Ceiling($auditRows.Count / $columns)
$sheet = New-Object System.Drawing.Bitmap ($columns * $cellWidth), ($rows * $cellHeight)
$graphics = [System.Drawing.Graphics]::FromImage($sheet)
$graphics.Clear([System.Drawing.Color]::FromArgb(245, 240, 222))
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$font = New-Object System.Drawing.Font 'Segoe UI', 8
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(35, 42, 40))
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
try {
  foreach ($row in $auditRows) {
    $index = $row.index - 1
    $x = ($index % $columns) * $cellWidth
    $y = [Math]::Floor($index / $columns) * $cellHeight
    $source = [System.Drawing.Image]::FromFile((Join-Path $taskRoot $row.path))
    try { $graphics.DrawImage($source, [int]($x + 8), [int]($y + 5), 168, 168) } finally { $source.Dispose() }
    $labelBox = New-Object System.Drawing.RectangleF $x, ($y + 175), $cellWidth, 32
    $graphics.DrawString("$($row.index). $($row.title)", $font, $brush, $labelBox, $format)
  }
  $sheet.Save((Join-Path $PSScriptRoot 'tool-items-contact-sheet.png'), [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $format.Dispose(); $brush.Dispose(); $font.Dispose(); $graphics.Dispose(); $sheet.Dispose()
}
