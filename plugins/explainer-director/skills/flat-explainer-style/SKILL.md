---
name: flat-explainer-style
description: Style guide for flat-vector "numbered-lesson" animated explainers (cream + deep-teal two-tone, simple mannequin character, icons popping in on cue, "#N" chapter cards, sepia case-study scenes), built with the plugin's engine (chapter grade "cream"). Use when the user asks for this look, a book-summary / animated listicle / training explainer, or a calm lesson-by-lesson video.
---

# Flat-vector numbered-lesson explainer (style guide)

Measured from a popular 19-minute book-summary explainer (ffmpeg scene detection, frame sampling, palette extraction,
narration structure). Only numbers and patterns are kept here, in our own words.

## 1. Format at a glance

| Property | Measured value |
|---|---|
| Aspect / length | 16:9, long-form (19 min); the formula works from 60 s shorts to 20 min |
| Structure | Hook → numbered lessons (chapter cards #1–#7) → wrap-up |
| Narration | one calm, conversational first-person narrator, **~128 words/min**, short sentences |
| Music | **none under the voice** — pauses go fully silent; the voice carries everything |
| Hard cuts | only **49 in 19 min**; median shot **≈11 s** — scenes evolve *inside* a shot |
| Visual density | 1 idea on screen at a time; 1–4 icons max; lots of empty cream |

## 2. Script formula (write your own lines in this shape)

**Hook (0–40 s)**
1. Credibility + effort: how much work went into understanding the topic (the book read, the weeks spent).
2. Reframe: the topic looks confusing, most people never learn it, and that costs them.
3. Promise with **three counterintuitive claims** the video will prove.
4. Permission to doubt: "it sounds backwards, but once you see it you can't unsee it" → "so let's start".

**Each lesson ("Number N")** — the same 4 beats every time
1. **Case study as a story**, in present tense with a date, a place and hard numbers → the expectation → the twist.
2. **The principle in one quotable line** (short, absolute, a contrast pair).
3. **Everyday micro-example** (what one small amount of money buys, pick one) or a contrast between two places.
4. **"What this means for you"** — a direct, personal application.

Lesson 1 has no "Number one" announcement: the hook flows straight into the first story.

**Ending formula**: (1) collapse everything into one theme, (2) one personal punchline, (3) a callback to the title,
(4) a wink at the viewer's own choice to watch, (5) a CTA to the playlist on the end screen.

Language rules: second person, rhetorical questions answered immediately ("Can you have all three? No."),
contrast pairs, concrete money figures, never jargon without a picture.

## 3. Visual system

**Palette** (measured share of screen):
| Token | Hex | Use |
|---|---|---|
| cream (ground) | `#FAF0D2` (≈45%) | default background, with faint paper grain/vignette |
| teal (ink) | `#00505A` → `#005A64` (≈20%) | characters, icons, chapter-card background |
| sepia | `#C8B496` / `#BEA08C` | **case-study / "story" scenes** (history, other places) — whole frame goes sepia, characters turn brown |
| light teal | `#5AA0A0` | secondary buildings, shadows, depth |
| accents (small) | money green `#5DBB63`, gold `#F2C14E`, coral `#E8705A` | money, medals, warnings, prices that drop |

**Typography**: one condensed all-caps display face for every number/label (`$4 000 000`, `#3`, `BERLIN`, `$20 000`)
— use **Bebas Neue** or **Oswald** (Google Fonts). Numbers are big, teal (or coral for losses). Almost no body text on screen.

**Character** ("the viewer"): genderless-ish mannequin in solid teal — round head, simple hair cap,
two dot eyes + tiny mouth/brows, U-shaped torso with no neck, **stick arms and legs (single stroke)**, no hands detail.
Two framings: **full body** (small, centered, for situations) and **chest-up close** (big, left of frame, talks to camera,
icons appear on the right). Variants by prop only: top hat + monocle = "the rich", tie = "politician/boss",
blindfold = "people who don't understand". Same character every scene → continuity.

**Icons/props**: flat, two-tone (cream on teal, or teal on cream); occasional full-colour hero prop
(a book, a coffee cup, a vending machine) for recognisability. Maps = country silhouette filled with its flag in sepia.

**Recurring layouts**
- **Chapter card**: full teal frame, `#N` centered top in cream condensed type, one cream icon below (scale, price tag, hands+coin).
- **Talker + icons**: close-up character left 40%, 1–3 icons pop in on the right as each is named.
- **Comparison**: two columns split by a **dashed vertical divider**; items multiply/shrink to show quantities.
- **Price row**: a row of houses/products with prices under each, one price turns coral and drops.
- **Metaphor scene**: seesaw, cliff edge, rope bridge, scales — characters act out the idea.

## 4. Motion grammar

- **Pop on cue**: each icon/number scales 0 → 1.08 → 1 (≈0.3 s, back-out) exactly when the narrator says it; nothing appears early.
- **Build, don't cut**: a shot accumulates elements for 10–30 s; when the idea changes, **slide the camera sideways** to a
  neighbouring layout or **wipe** (diagonal reveal of the sepia/flag layer), rather than hard-cutting.
- **Characters**: tiny idle sway, blink, arm gestures toward the icon being discussed, walk cycles for travel;
  reactions are exaggerated poses (shrug, hand on chin, falling off a cliff).
- **Quantities**: show counts literally — 4 cars become 20 cars, a money bag splits, a crowd thins (8,000 → 6,000).
- **Chapter cards** hold ~3–5 s: number first, icon pops after ~0.5 s.
- Ease: back-out for pops, ease-in-out for camera slides; no flashy transitions, no shake.

## 5. Building it with the engine
- Set the chapter grade to `cream` in `script.txt` (`# ch1 | LESSON ONE | 2026 | cream`); use `sepia` for case-study
  chapters. The palette tokens are in `engine/src/lib/flat.tsx` (`LOOK.cream`).
- Most beats map to templates: chapter cards are automatic; **icons** (1–3 icons popping in as named), **split**
  (comparison with a divider), **bigNumber** (counters), **process**, **quote** (the principle line), **hero**.
- Pops land on the spoken word: give every template item an `"on"` cue word; `check.py` verifies it.
- No music bed for this look: in `sound.json` use quiet moods (`breath`, `sparse`) or remove sections; keep soft pops.
- Voice: Kokoro `am_michael` / `af_heart` (offline) or the user's own recording.
- Checklist before render: one idea per frame · every number spoken = number shown · pops land on the word ·
  ≥ 55 % empty cream · palette limited to cream/teal (+ sepia scenes, tiny accents).
- 1080×1920 Shorts: stack the talker above the icons.

## 6. 3D version
The same palette and grammar can be staged on a small 3D planet with animated CC0 characters (two-tone toon, ink
outlines, one continuous camera per chapter, sepia as a post effect). That needs the 3D kit, which ships in a later
version of this plugin.
