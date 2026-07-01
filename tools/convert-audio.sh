#!/usr/bin/env bash
# Convert recorded WAV takes -> mono AAC .m4a (96 kbps) in place, keeping names.
# Usage:  tools/convert-audio.sh /path/to/AudioFolder [bitrate_kbps]
# Recurses over de/ no/ fr/. Requires ffmpeg on PATH.
set -euo pipefail
ROOT="${1:-.}"
BR="${2:-96}"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found on PATH"; exit 1; }

count=0; done=0
while IFS= read -r -d '' w; do
  count=$((count+1))
  out="${w%.wav}.m4a"
  if ffmpeg -y -loglevel error -i "$w" -ac 1 -c:a aac -b:a "${BR}k" "$out"; then
    done=$((done+1))
  else
    echo "Failed: $w" >&2
  fi
done < <(find "$ROOT" -type f -name '*.wav' -print0)

echo "Converted $done / $count files to .m4a"
