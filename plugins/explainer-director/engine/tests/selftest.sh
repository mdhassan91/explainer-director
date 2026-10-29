#!/bin/bash
# Quick self-test of the engine (≈ 1 min, no downloads): script → beats → cue check on the example,
# unsafe names are refused, ElevenLabs path against a fake server, and (after npm install) one still frame.
set -e; cd "$(dirname "$0")/.."; PY=${PYTHON:-python3}; T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
echo "▶ beats + check (example)"; $PY tools/beats.py example >/dev/null && $PY tools/check.py example
echo "▶ unsafe names are refused"
! node tools/render-film.mjs 'x;echo' Example >/dev/null 2>&1 || { echo "render-film accepted an unsafe id"; exit 1; }
! bash tools/new-episode.sh 'a b' Comp >/dev/null 2>&1 || { echo "new-episode accepted an unsafe id"; exit 1; }
! bash tools/samples.sh 'x;echo' S >/dev/null 2>&1 || { echo "samples accepted an unsafe id"; exit 1; }
echo "  ok"
echo "▶ ElevenLabs voice (fake server)"; $PY -m unittest discover -s tests -q
if [ -d node_modules ]; then echo "▶ still frame"; npx remotion still src/index.ts LibCatalog "$T/c.png" --frame=0 --scale=0.25 --log=error </dev/null && echo "  ok"; fi
echo "✔ selftest passed"
