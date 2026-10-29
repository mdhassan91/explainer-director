#!/bin/bash
# One-time setup for the Explainer Director engine (run inside your copy of engine/).
# Needs: Node 18+, Python 3.10+, ffmpeg on PATH. SKIP_KOKORO=1 skips the local voice model (ElevenLabs-only use). Downloads: npm packages, Kokoro TTS model (~330 MB, Apache-2.0),
# the 8 sound effects (Pixabay Content License) from the HyperFrames npm package (Apache-2.0).
set -e; cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "ffmpeg not found on PATH — install it first"; exit 1; }
command -v node >/dev/null || { echo "Node 18+ not found"; exit 1; }
PY=${PYTHON:-python3}
echo "▶ npm packages"; npm install --no-fund --no-audit
echo "▶ Python packages"; $PY -m pip install -q -r requirements.txt
K=${KOKORO_DIR:-$HOME/.cache/explainer-director/kokoro}; mkdir -p "$K"
U=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
if [ "${SKIP_KOKORO:-0}" = "1" ]; then echo "▶ Kokoro skipped (SKIP_KOKORO=1): only ElevenLabs voices will work"
else for f in kokoro-v1.0.onnx voices-v1.0.bin; do [ -s "$K/$f" ] || { echo "▶ Kokoro $f"; curl -fL -o "$K/$f" "$U/$f"; }; done; fi
if [ ! -s public/lib/sfx/pop.mp3 ]; then
  echo "▶ sound effects"; T=$(mktemp -d); (cd "$T" && npm pack -s hyperframes@0.8.196 >/dev/null && tar xzf hyperframes-*.tgz)
  S="$T/package/dist/skills/media-use/audio/assets/sfx"; mkdir -p public/lib/sfx
  for s in pop whoosh-short chime impact-bass-1 impact-bass-2 riser typing click; do cp "$S/$s.mp3" public/lib/sfx/; done
  cp "$S/CREDITS.md" public/lib/sfx/CREDITS.md; rm -rf "$T"
fi
echo "✔ ready. Try the example:  bash tools/new-episode.sh … or render examples/ (see README)"
