#!/bin/bash
# LIBRARY · scaffold a new film:  tools/new-episode.sh <id> <ComponentName> "<TITLE>"
# Creates src/<id>/ {script.txt cast.json say.json meta.json sound.json scenes.tsx <Comp>.tsx} and registers <Comp> + <Comp>Samples in Root.tsx.
set -e; cd "$(dirname "$0")/.."
id=$1; C=$2; T=${3:-$1}; d=src/$id
[ -z "$C" ] && { echo "usage: tools/new-episode.sh <id> <ComponentName> \"<TITLE>\""; exit 1; }
[ -e $d ] && { echo "$d already exists"; exit 1; }
mkdir -p $d
cat > $d/script.txt <<EOT
# ch0 | COLD OPEN | today | now
= b01 | KINETIC | the hook
& kinetic {"items":[{"on":"hook","text":"THE HOOK","color":"glow","size":160}]}
N: Write the hook here.

# ch1 | CHAPTER ONE | 1990 | sepia
= b02 | DIALOGUE | two people talk
& dialogue {"set":"office","left":{"who":"HERO","shirt":"jade","hair":"side"},"right":{"who":"RIVAL","tie":"danger"}}
HERO: First line.
RIVAL: Second line.
EOT
echo '{"N": "am_michael", "HERO": "am_echo", "RIVAL": "am_adam"}' > $d/cast.json
echo '{}' > $d/say.json
echo "{\"title\": \"$T\", \"fps\": 24}" > $d/meta.json
cat > $d/sound.json <<EOT
{"bpm": 84, "sections": [{"at": "0", "mood": "tense", "chords": ["Am","F","C","G"]}, {"at": "card:ch1", "mood": "breath", "chords": ["Dm","Bb","F","C"]}, {"at": "b02", "mood": "sparse", "chords": ["Dm","Bb","F","C"]}],
 "hits": [], "chimes": [], "pops": []}
EOT
cat > $d/scenes.tsx <<EOT
// Hand-written scenes for beats that no template covers. Key = beat id. Everything else comes from templates (beats.json "template").
import React from "react";
import type { Ctx } from "../lib/film";
import { P, Pop, Tape, Stamp, Counter, Person, Icon, ease, ramp } from "../lib/flat";
import { Svg, Abs, cap, glowTxt, at, Floor, Duo } from "../lib/backdrops";
export const SCENES: Record<string, (c: Ctx) => React.ReactNode> = {
};
export const DRAMA = new Set<string>([]); // extra letterbox beats (dialogue-template beats are added automatically)
EOT
cat > $d/$C.tsx <<EOT
import LINES from "./lines.json";
import BEATS from "./beats.json";
import { makeFilm } from "../lib/film";
import { P } from "../lib/flat";
import { SCENES, DRAMA } from "./scenes";
const F = makeFilm({ beats: BEATS, lines: LINES, scenes: SCENES, drama: DRAMA, fps: 24, speakerColor: { HERO: P.glow }, title: { big: "$T" } });
export const $C = F.Film, ${C}Samples = F.Samples, ${C}_FRAMES = F.frames, ${C}_SAMPLES = F.SAMPLE_T.length;
EOT
echo '{"duration": 1, "cards": [], "beats": []}' > $d/lines.json
echo '{"chapters": []}' > $d/beats.json
python3 - "$id" "$C" <<'PY'
import sys; id_, C = sys.argv[1:]; p = "src/Root.tsx"; s = open(p).read()
s = s.replace('export const Root = () => (', f'import {{ {C}, {C}Samples, {C}_FRAMES, {C}_SAMPLES }} from "./{id_}/{C}";\nexport const Root = () => (', 1)
s = s.replace('  <>\n', f'  <>\n    <Composition id="{C}" component={{{C}}} durationInFrames={{Math.max(1, {C}_FRAMES)}} fps={{24}} width={{1920}} height={{1080}} />\n    <Composition id="{C}Samples" component={{{C}Samples}} durationInFrames={{Math.max(1, {C}_SAMPLES)}} fps={{24}} width={{1920}} height={{1080}} />\n', 1)
open(p, "w").write(s)
PY
echo "created $d — next: edit script.txt + cast.json, then:  python3 tools/beats.py $id && python3 tools/check.py $id"
