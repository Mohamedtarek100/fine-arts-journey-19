<#
.SYNOPSIS
  Strips ALL EXIF, GPS location, camera model, and personal metadata from
  every JPG/PNG image inside assets/photos/ (and assets/art/ if -IncludeArt is passed).
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\strip-exif.ps1
#>
param(
  [switch]$IncludeArt
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$targets = @((Join-Path $root "assets\photos"))
if ($IncludeArt) {
  $targets += (Join-Path $root "assets\art")
}

$processed = 0
foreach ($dir in $targets) {
  if (-not (Test-Path $dir)) { continue }
  $files = Get-ChildItem -Path $dir -File | Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' }
  foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $srcImg = [System.Drawing.Image]::FromStream($ms)

    # Re-render into a fresh Bitmap with zero EXIF / GPS PropertyItems
    $cleanBmp = New-Object System.Drawing.Bitmap($srcImg.Width, $srcImg.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($cleanBmp)
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $srcImg.Width, $srcImg.Height)
    $g.Dispose()
    $srcImg.Dispose()
    $ms.Dispose()

    $tmpPath = "$($file.FullName).clean.tmp"
    if ($file.Extension -match '^\.png$') {
      $cleanBmp.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
      $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
      $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)
      $cleanBmp.Save($tmpPath, $jpegCodec, $encParams)
    }
    $cleanBmp.Dispose()

    Move-Item -Path $tmpPath -Destination $file.FullName -Force
    Write-Output "CLEANED EXIF/GPS: $($file.Name)"
    $processed++
  }
}

Write-Output "Done. Total images scrubbed of metadata: $processed"
