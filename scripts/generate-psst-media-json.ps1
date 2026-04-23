# Generates assets/psst/media.json from every image/video file in the PSST folders.
# Run from the project root (folder that contains assets\), or from anywhere:
#   powershell -ExecutionPolicy Bypass -File "C:\path\to\loreine-portfolio\scripts\generate-psst-media-json.ps1"

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$imgDir = Join-Path $projectRoot "assets\psst\images"
$vidDir = Join-Path $projectRoot "assets\psst\videos"
$outFile = Join-Path $projectRoot "assets\psst\media.json"
$outJsFile = Join-Path $projectRoot "assets\psst\media.js"

$imageExtensions = @(".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp")
$videoExtensions = @(".mp4", ".webm", ".ogg", ".mov", ".m4v")

if (-not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir -Force | Out-Null
    Write-Host "Created: $imgDir"
}
if (-not (Test-Path $vidDir)) {
    New-Item -ItemType Directory -Path $vidDir -Force | Out-Null
    Write-Host "Created: $vidDir"
}

function Get-MediaEntries {
    param([string]$Directory, [string[]]$AllowedExt)
    $list = New-Object System.Collections.Generic.List[object]
    if (-not (Test-Path $Directory)) { return $list }
    Get-ChildItem -Path $Directory -File -ErrorAction SilentlyContinue |
        Sort-Object Name |
        ForEach-Object {
            $ext = $_.Extension.ToLowerInvariant()
            if ($AllowedExt -contains $ext) {
                $list.Add([ordered]@{ file = $_.Name; caption = "" }) | Out-Null
            }
        }
    return $list
}

$images = @(Get-MediaEntries -Directory $imgDir -AllowedExt $imageExtensions)
$videos = @(Get-MediaEntries -Directory $vidDir -AllowedExt $videoExtensions)

$payload = [ordered]@{
    images = @($images)
    videos = @($videos)
}

$json = $payload | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($outFile, $json + "`n", [System.Text.UTF8Encoding]::new($false))

$js = @"
window.PSST_MEDIA = $json;
"@
[System.IO.File]::WriteAllText($outJsFile, $js + "`n", [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "Wrote: $outFile"
Write-Host "Wrote: $outJsFile"
Write-Host "  Images: $($images.Count)"
Write-Host "  Videos: $($videos.Count)"
Write-Host ""
Write-Host "Refresh your browser on the PSST gallery page."
