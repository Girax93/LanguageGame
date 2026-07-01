# Convert recorded WAV takes -> mono AAC .m4a (96 kbps) in place, keeping names.
# Windows PowerShell 5.1 friendly (no && chaining). Requires ffmpeg on PATH:
#   winget install Gyan.FFmpeg    (then reopen the terminal)
#
# Usage (from the repo root or anywhere):
#   powershell -ExecutionPolicy Bypass -File tools\convert-audio.ps1 -Root "C:\path\to\AudioFolder"
# Root defaults to the current directory. Runs recursively over de\ no\ fr\.

param(
  [string]$Root = ".",
  [int]$Bitrate = 96
)

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Error "ffmpeg not found on PATH. Install it (winget install Gyan.FFmpeg) and reopen the terminal."
  exit 1
}

$wavs = Get-ChildItem -Path $Root -Recurse -Filter *.wav
if ($wavs.Count -eq 0) { Write-Host "No .wav files under $Root"; exit 0 }

$done = 0
foreach ($w in $wavs) {
  $out = [System.IO.Path]::ChangeExtension($w.FullName, ".m4a")
  ffmpeg -y -loglevel error -i "$($w.FullName)" -ac 1 -c:a aac -b:a "$($Bitrate)k" "$out"
  if ($LASTEXITCODE -eq 0) { $done++ } else { Write-Warning "Failed: $($w.Name)" }
}
Write-Host "Converted $done / $($wavs.Count) files to .m4a"
