# Génère les icônes PWA (rosace de 12 pétales aux couleurs des archétypes, sur fond « nuit verte ») dans icons/.
# Usage : powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'icons'
New-Item -ItemType Directory -Force $outDir | Out-Null

# Palette sombre des 12 archétypes (même ordre que l'application)
$colors = '#ffafaf', '#e8986a', '#f5c572', '#b9b256', '#addf92', '#65c495', '#64e6de', '#46bfe0', '#9ad1ff', '#a6a3f4', '#eab7ff', '#e58fb8'

function New-Icon([int]$size, [double]$radiusRatio, [string]$file) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0f2a2e'))

  $cx = $size / 2.0; $cy = $size / 2.0
  $R = $size * $radiusRatio
  $n = 12

  for ($i = 0; $i -lt $n; $i++) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $semiL = 0.42 * $R; $semiW = 0.17 * $R; $dist = 0.58 * $R
    $path.AddEllipse([float]($cx - $semiW), [float]($cy - $dist - $semiL), [float](2 * $semiW), [float](2 * $semiL))
    $m = New-Object System.Drawing.Drawing2D.Matrix
    $m.RotateAt([float](360.0 * $i / $n), (New-Object System.Drawing.PointF ([float]$cx), ([float]$cy)))
    $path.Transform($m)
    $c = [System.Drawing.ColorTranslator]::FromHtml($colors[$i])
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(236, $c))
    $g.FillPath($brush, $path)
    $brush.Dispose(); $path.Dispose()
  }

  # Centre : disque sombre et étoile abricot
  $dark = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#0f2a2e'))
  $r0 = 0.17 * $R
  $g.FillEllipse($dark, [float]($cx - $r0), [float]($cy - $r0), [float](2 * $r0), [float](2 * $r0))
  $star = @(); $s = 0.12 * $R; $w = 0.035 * $R
  $star += New-Object System.Drawing.PointF ([float]$cx), ([float]($cy - $s))
  $star += New-Object System.Drawing.PointF ([float]($cx + $w)), ([float]($cy - $w))
  $star += New-Object System.Drawing.PointF ([float]($cx + $s)), ([float]$cy)
  $star += New-Object System.Drawing.PointF ([float]($cx + $w)), ([float]($cy + $w))
  $star += New-Object System.Drawing.PointF ([float]$cx), ([float]($cy + $s))
  $star += New-Object System.Drawing.PointF ([float]($cx - $w)), ([float]($cy + $w))
  $star += New-Object System.Drawing.PointF ([float]($cx - $s)), ([float]$cy)
  $star += New-Object System.Drawing.PointF ([float]($cx - $w)), ([float]($cy - $w))
  $apricot = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#ffb88a'))
  $g.FillPolygon($apricot, $star)

  $g.Dispose()
  $bmp.Save((Join-Path $outDir $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "ok $file ($size px)"
}

New-Icon 192  0.44 'icon-192.png'
New-Icon 512  0.44 'icon-512.png'
New-Icon 512  0.34 'icon-maskable-512.png'   # zone de sécurité : contenu dans les 80 % centraux
New-Icon 180  0.44 'apple-touch-icon.png'
