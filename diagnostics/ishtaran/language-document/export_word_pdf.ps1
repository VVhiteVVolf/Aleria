$ErrorActionPreference = 'Stop'
$taskRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$inputPath = Join-Path $taskRoot 'Vorschau/Ishtaran/sources/language-context/Ishtaran_Kultur_Geschichte_Sprachkontext.docx'
$documentHash = (Get-FileHash -LiteralPath $inputPath -Algorithm SHA256).Hash.ToLowerInvariant()
$pdfPath = Join-Path $PSScriptRoot ('render/Ishtaran_' + $documentHash.Substring(0, 12) + '.pdf')
[System.IO.Directory]::CreateDirectory((Split-Path -Parent $pdfPath)) | Out-Null
$exportReport = [pscustomobject]@{ Pdf = $pdfPath; SourceReadOnly = $true; DocumentSha256 = $documentHash }
if (Test-Path -LiteralPath $pdfPath) {
    $exportReport | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'word-export.json') -Encoding UTF8
    $exportReport | ConvertTo-Json
    return
}
$wordApplication = $null
$document = $null
try {
    $wordApplication = New-Object -ComObject Word.Application
    $wordApplication.Visible = $false
    $wordApplication.DisplayAlerts = 0
    $wordApplication.AutomationSecurity = 3
    'Opening task document'
    $document = $wordApplication.Documents.Open($inputPath, $false, $true, $false)
    'Exporting task document'
    $document.ExportAsFixedFormat($pdfPath, 17)
    $exportReport | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'word-export.json') -Encoding UTF8
    $exportReport | ConvertTo-Json
} finally {
    if ($null -ne $document) { $document.Close(0); [System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($document) | Out-Null }
    if ($null -ne $wordApplication) { $wordApplication.Quit(); [System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($wordApplication) | Out-Null }
}
