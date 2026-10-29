---
name: video-director
description: Run a whole explainer video from the user's script to an upload-ready MP4 — beat map, story arc, pacing check, style check, scene build, draft render, final render, mix and delivery — with approval gates so nothing expensive is rendered before the user has agreed. Uses the bundled engine (script.txt → voice → music → render) and flat-explainer-style. Use when the user hands over a script or topic for a video, says "make a video from this script", or wants a long (5–20 min) explainer, a short promo or a trailer; read it before the style skills.
argument-hint: "[script file or topic] [length]"
---

# Video director: script → beat map → gates → film

This skill decides the order of work. Everything it needs ships with this plugin:

| Need | Where |
|---|---|
| The render engine (Remotion project, templates, voice, music, cached renderer) | `engine/` inside this plugin (`../../engine` relative to this SKILL.md) |
| Palette, typography, chapter cards, "#N" lesson format, sepia case studies | **flat-explainer-style** |
| Long-form story structure | `references/story-documentary-study.md` |

## First run: set up a project (once per video project folder)
1. Copy the engine into the user's working folder: `cp -r <plugin>/engine ./<project-name>` (never edit the plugin copy).
2. `cd <project-name> && bash setup.sh` — installs npm + Python packages, downloads the Kokoro voice model
   (~330 MB, to `~/.cache/explainer-director/kokoro`, override with `KOKORO_DIR`) and the sound effects.
   Requirements: Node 18+, Python 3.10+, ffmpeg on PATH. Ask before running it (it downloads).
3. Prove the setup with the bundled example: `python3 tools/beats.py example && python3 tools/check.py example &&
   python3 tools/voice.py example && python3 tools/mix.py example && node tools/render-film.mjs example Example --draft`
   → `out/example-draft.mp4` (≈ 70 s film).
   Quicker check without rendering a film: `bash tests/selftest.sh`.

## Templates first
Most beats need no code. Before writing a scene, check the templates in `engine/src/lib/templates.tsx`
(render `LibCatalog` for a contact sheet): **kinetic, bigNumber, bars, priceCompare, icons, map, split, process, quote,
hero, city, dialogue**, plus five for promos and trailers: **terminal** (types a command), **montage** (one template per
cut, on the music), **glitch** (a frozen frame breaks up: the fake-out before a reveal), **scriptReveal** (the film's own
script.txt, the spoken line lit word by word) and **black** (hard-cut ending). Hand-write a scene in `src/<id>/scenes.tsx` only when no template fits; a hand-written scene
used twice becomes a template (add it to `src/lib/templates.tsx`).

## The film pipeline (one folder per video: `src/<id>/`)
```bash
bash tools/new-episode.sh <id> <Comp> "<TITLE>"   # scaffold + register in Root.tsx
# write src/<id>/script.txt (format below), cast.json (speaker → Kokoro voice), sound.json (music moods + hits)
python3 tools/beats.py <id>       # script.txt → beats.json + beats.md (word count, length estimate)
python3 tools/check.py <id>       # every cue word is spoken, every beat has a template or scene
python3 tools/voice.py <id>       # Kokoro multi-voice → public/<id>/voice.wav + lines.json (word timings)
python3 tools/mix.py <id>         # synthesized royalty-free score + SFX on cue words + voice → public/<id>/mix.wav
bash tools/samples.sh <id> <Comp>Samples           # 3 stills per beat → out/<id>-samples/sheet-NN.jpg
node tools/render-film.mjs <id> <Comp> --draft     # half-res review copy, cached per chapter
node tools/render-film.mjs <id> <Comp>             # final: out/<id>-upload.mp4 (grain, −14 LUFS, BT.709)
```

`script.txt` format:
```
# ch1 | CHAPTER TITLE | 2026 | now          chapter: id | title | year | grade (sepia | cool2000 | jade | now)
= b04 | MAP | what's on screen             beat: id | kind | visual note
& map {"view":"world","pins":[...]}        optional: build this beat from a template
N: narrator text                           lines; speakers + voices in cast.json (N = narrator)
LEAD: dialogue text
~ 1.5                                      silence: before the lines = lead-in, after = hold (a beat may have no lines)
```
Add `| card 0` to a chapter line to drop its chapter card; `meta.json` `"titleCard": false, "tail": 0.3` for a hard ending.
Template cue words (`"on": "word"`) must be words actually spoken in that beat — `check.py` enforces it.

**Speed rules (measured):** grain is added in the ffmpeg finish, not the browser (27 % faster frames); render by chapter
with the cache (a fix re-renders one chapter); NVENC encode when an NVIDIA GPU is there, x264 otherwise; voice with 1
worker (Kokoro already uses all cores); ≤ 3 render workers; review with the stills sampler before any draft video.

## Short promos and trailers (30–60 s)
A different shape from the long explainer: no chapter cards (`card 0`), ~1 new thing on screen every 0.5–1 s, few words,
music carries it. Formula: **trigger** in the first second (a `terminal` command, a button, a question) → **montage** cut on
the music (`sound.json` `rhythm` for a pop per cut, section `"gain": 2` so music-only stretches hit hardest) → short
**proof** lines → **fake-out** (`glitch` + a `"silence"` section) → **reveal** → title, then a **hard cut to black**.
The bundled engine's README demo was made this way (`docs/promo/` in the repository).

## Autopilot mode (user pastes a script and leaves)
Triggered by "autopilot", "don't ask me", "I'll come back when it's done" or similar. Run every step without stopping:
- **No questions.** Defaults: 16:9 1920×1080, the flat template look, Kokoro `am_michael` narrator, synthesized music,
  subtitles on dialogue, 24 fps.
- **Gates become self-reviews**: check the beat map against the pacing rules; replace the draft review with the stills
  sheets + a blank-frame check.
- **No downloads** beyond setup. Where the script needs something missing (a real photo, specific B-roll), use a template
  stand-in and list it in the final report as "add later".
- **Never stop for a fixable error**: fix and continue; say what you changed in the report.
- **Finish with a report**: file paths, length, the beat map, every judgment call, stand-ins to replace, known weak spots.

## The workflow (always in this order)

### 0. Intake — ask once, then work
Ask only what isn't given: script (or topic), target length (v0.1 renders 16:9 only; if the user wants vertical 9:16,
say it isn't supported yet), voice (a Kokoro voice or the user's own
recording), must-show items (logos, charts, photos). Save the answers to `src/<id>/brief.md`.

### 1. Script → beat map
Split the script into beats and pick one story arc (below). One beat = one idea = 4–12 s of voice. Write `script.txt`,
run `beats.py`; `beats.md` is the readable beat map.

**Story arcs** (from Anil-matcha/vox-ai-motion-graphics-generator, MIT):

| arc | shape | use for |
|---|---|---|
| `hook_payoff` | hook → context → build → payoff → wrap | concepts, general explainers |
| `timeline` | beginning → event 1 → event 2 → climax → takeaway | history, biographies |
| `man_in_hole` | baseline → fall → deeper → climb → resolution | comebacks, case studies |
| `pas` | problem → agitate → solve → proof → CTA | products, pitches |
| `bab` | before → after → bridge → CTA | transformations |
| `how_it_works` | hook → overview → steps → benefit → CTA | processes, tech, training |
| `true_story` | cold open → chapters (goal → obstacle → clever move → result → forward hook) → cliffhanger | business history — see `references/story-documentary-study.md` |

**Story rules for long videos** (`references/story-documentary-study.md`):
- Cold open 45–75 s with the 9-step formula there; open loops promised in the open are paid off late (or next part).
- Every chapter ends on a forward hook line, never on a fact.
- Stakes as numbers, then personal ("imagine…"); old money converted to today's; a ticking clock when possible.
- When the story turns on an idea, slow down and explain the mechanism with a clean infographic.
- Narration ~150–200 wpm with no dead air inside chapters; chapter cards are the only breaths.
- A sponsor/CTA goes right after a mid-video cliffhanger, never in the cold open.

**Pacing rules** (check every beat map against these):
- Hook lands in ≤ 3 s: a big number, a surprising fact or a direct question on screen.
- Something new on screen every 4–6 s (a cut, a camera move, a pop, a character action).
- Long videos: a chapter card every 1.5–3 min; re-hook ("but here's the problem…") at each chapter.

**GATE 1 — show the beat map** (`beats.md` as a table: beat, words, template, what's on screen) and wait for an OK.

### 2. Look check
Render the stills sheet (`samples.sh`) for 2–3 representative beats in the chosen grade(s); for the cream/teal lesson look, follow
flat-explainer-style (chapter grade `cream`). **GATE 2 — the user picks the look.**

### 3. Assets and rights
- Real people: never a photoreal synthetic face or a cloned voice. Use a stylised figure with signature cues and/or a
  real licensed photo; record source + licence in `src/<id>/CREDITS.md`.
- B-roll: Pexels / Pixabay (free licence), archive.org + Wikimedia Commons (public domain / CC). Record every file in
  CREDITS.md. Ask before downloading (name, source, size).
- Music is synthesized by `mix.py` (royalty-free by construction); bundled SFX are Pixabay-licensed (credits in
  `public/lib/sfx/CREDITS.md`).

### 4. Voice + timing
Each speaker's voice is set in `cast.json`:
- a **Kokoro** voice (`"am_michael"`, `"af_heart"`, …) — free, offline, the default;
- or **ElevenLabs**: `"elevenlabs:<voice_id>"`, optionally `"elevenlabs:<voice_id>@1.1"` for speed (0.7–1.2). Needs
  `ELEVENLABS_API_KEY` in the environment (ask the user to set it; never write a key into project files). Model:
  `ELEVENLABS_MODEL` (default `eleven_multilingual_v2`). Takes are cached in `public/<id>/.tts-cache/`, so re-running
  only pays for changed lines. ElevenLabs bills per character — tell the user the script's character count first.
Providers can be mixed per speaker. `voice.py` makes one take per line and computes word times (proportional to phonemes, snapped to energy
dips — no speech-recognition model needed). Fix pronunciation in `say.json` (`{"Nguyen": "Win"}`). For the user's own
recording, put it at `public/<id>/voice.wav` and write `lines.json` from a transcript.

### 5. Build scenes
Templates first; hand-written scenes only where needed. Check with the stills sheet at the cue words of every beat
before any video render.

### 6. Draft render → GATE 3
`render-film.mjs --draft` (half resolution, cached per chapter). Show the draft; collect notes by timestamp.
**GATE 3 — the user approves the draft.** Only changed chapters re-render.

### 7. Final render + delivery
`render-film.mjs <id> <Comp>` → `out/<id>-upload.mp4`. Checks before sending: no blank frames (luma std-dev per 5 s,
scan at 10 fps — a 2 fps scan misses short dropouts), duration = audio, −14 LUFS ±1, captions inside the safe area,
every CREDITS.md entry present.

## When something goes wrong
Fix what you can and say what you changed. If it's a bug in the plugin itself (a tool crashes, a template draws wrong,
setup fails on a clean machine), tell the user they can report it at
https://github.com/mdhassan91/explainer-director/issues/new/choose (the bug form asks for the step, the error text and
their system). Suggestions and feature ideas go there too.

## Render lessons (measured)
- Long renders: render in chapters or 600-frame segments with a fresh browser each — avoids GPU out-of-memory blank
  frames on small GPUs (4 GB VRAM). To fix a bad stretch, re-render only those segments, then re-concat and mux.
- Audio for 15–20-min films: mix in float32, mono voice, cumsum envelopes — stays under 7 GB RAM.
- Building is the real cost, not rendering — that is why the templates and the gates matter.

## B-roll house treatment
Every real clip/photo passes through the same look: crop into a cream paper card with a slight tilt and drop shadow,
duotone (ink + cream) or the chapter's grade, light paper grain, 2–3 px ink border; push in slowly (2–4 %) while on
screen. Aim for ~70 % animated world, ~30 % B-roll in long videos.
