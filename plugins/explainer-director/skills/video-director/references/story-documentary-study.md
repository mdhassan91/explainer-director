# Study: a long-form business-history documentary (21:14)

Measured from one popular 21-minute "true story" documentary on YouTube: every frame scanned for cuts and brightness,
contact sheets every 3 s, the hook at 2 fps, transitions frame by frame, audio loudness and pauses, and the narration's
structure. Only numbers and patterns are kept here, in our own words. Use it as the model for long story-driven
explainers ("the true story of X").

## 1. Measured numbers
| what | value |
|---|---|
| length | 21:14 · 1280×720 · 25 fps |
| narration | 4 141 words · ~200–215 wpm (fast, no dead air) |
| cuts | 367 hard changes; median 0.8 s because of flash transitions; a real new picture every ~3 s |
| long "shots" | up to 60 s — one continuous animated graphic world (e.g. the clock + train sequence) |
| cut density | cold open 48/min · story chapters 5–11/min · montages 25–40/min |
| flashes | 75 light-leak / film-burn flashes, ~0.17 s each — the default transition |
| fades to black | only 2 (after the title, one chapter break) |
| loudness | −14 LUFS, range 3.3 LU: voice over a constant music bed, never silent |
| breathing room | only at chapter cards: 13–20 s of music + an animated title, no voice |
| chapters | cold open 1:15 → title → 5 chapters at 1:21, 3:36, 10:15, 13:06, 16:07 (2–6 min each) |
| sponsor | 12:04–13:06 (57 % mark), right after a cliffhanger, inside the channel's own "Next chapter" frame |

## 2. Story structure (rise arc of a 2-part serial)
1. **Cold open (~75 s)**, the formula step by step (write your own lines for each):
   1. Superlative end state: where the hero ends up, at their most powerful.
   2. Two outrageous escalations they will reach later.
   3. Flip to the humble start, in a rule of three ("no money, no contacts, no plan").
   4. Promise + famous names the story will touch.
   5. Ironic tiny beginning: the small, ordinary object it all starts with.
   6. Warning of a dark turn, plus a villain with a nickname.
   7. Narrator credibility: why this story stands out among the ones the channel has told.
   8. Payoff promise: the viewer may not know the name now, but will be glad they learned it.
   9. Title line ("This is the true story of …") → title card, music only.
2. **Chapters** each = one goal → obstacle → clever move → concrete result, then a forward hook.
   Patterns for a chapter's last line (never end a chapter flat):
   - Nobody could have predicted what this one decision would set in motion.
   - Nobody around them had any idea what they would become.
   - If the story stopped here, it would be a simple success story. It doesn't stop here.
   - A decision to leave everything familiar behind.
   - Either build an empire, or lose everything.
3. **Open loops**: the cold open promises the biggest events; part 1 leaves them unpaid, and the end card sells
   part 2 with them. Promise big in the open, pay off late (or next episode).
4. **Mechanism segments**: whenever the story turns on an idea, the narration slows into a plain explanation and the
   screen becomes a clean infographic. The viewer *understands* the hero's insight before seeing it pay off.

## 3. Narration devices (write scripts with these)
- **Stakes in numbers, then made personal**: the exact amount at risk, then "imagine watching your savings disappear".
- **Then-vs-now money**: convert old amounts into today's money every time.
- **Ticking clock**: how many days until it is too late.
- **Year anchors** in every chapter.
- **Signposts**: "Here's the thing.", "But the stakes were higher than that.", "However,", "And sure enough, it worked."
- **Rhythm**: rule of three; repetition beats ("and then he did it again. And again.").
- **Fair-minded voice**: give the hero credit before criticising; moral complexity makes the dark turn believable.
- **Humanising quirks before a big turn**: one odd habit makes a person real.
- **Nickname the hero's stages**: their name → a nickname → a title.
- **Direct address**: "you", "Honestly,", "I have to warn you".

## 4. Visual system (house style of the channel)
- **Palette**: one brand colour (one saturated colour) + black + white. Photos and footage are B&W or tinted.
  Signal colours only: neon green = money/profit, red = danger/loss/villain.
- **Grounds**: black grunge with drifting dust specks, or yellow paper texture with a vignette.
- **Picture sources** mixed freely: black silhouettes, B&W archive photos in paper/polaroid frames, newspapers,
  maps (yellow state shapes, B&W satellite maps with glowing outlines, dashed yellow routes), glowing product
  renders, flat yellow icons, logos, stock footage tinted, AI illustrations.
- **Recurring hero without a face problem**: the young hero is an illustration seen **from behind** (blue jacket), dropped
  into each location. Identity stays consistent because the face is never shown.
- **Type**: condensed bold caps (Bebas/Anton style) for words spoken on screen, appearing *on the word*
  (three short caps words, one per spoken word). Giant words filled with a texture (fire, money) with a silhouette
  standing in front. Yellow tape labels with black text for facts. Chapter cards: wide-tracked sans, icon above,
  underline, glow, on black.
- **Infographics**: person icon → $ → bracket flows; process triangles (source → transport → market → $);
  three framed crates with progress bars (shelf life); pie charts (90 % / 10 %); counters (20,000 → 500,000);
  a clock over a train silhouette as the race-against-time device.
- **Motion**: everything moves slowly (push-in, parallax layers, 2.5D); dust and particles everywhere; objects
  (the product, bills) fly through frame as transitions; graphics build piece by piece with the words.
- **Transitions**: light-leak/film-burn flash (~4 frames), burning torn-paper edges, torn paper strips, whip/zoom blur.
  No plain crossfades.

## 5. Sound
Constant music bed, voice on top, overall −14 LUFS. Music changes per chapter mood (mystery for the warning,
pulse for the race). Silence never happens inside a chapter; chapter cards are the only breaths (music swells,
whoosh + hit on the card).

## 6. What this means for our pipeline
- This look is **2D/2.5D compositing**, not 3D: stills, cut-outs, type, icons, maps, light leaks. It renders far
  faster than our three.js scenes — a 15-minute video is realistic in HyperFrames/Remotion 2D.
- Our 3D painted-documentary characters can still play the "hero" shots; the rest is collage + infographic.
- Kit pieces to build once and reuse: light-leak flash, burn/torn-paper wipe, texture-filled giant word,
  tape label, chapter card, flow/triangle/pie/counter infographics, map with route, clock timer, dust layer,
  flying-object transition, photo-in-paper-frame with push-in.

## 7. In this plugin
The flat 2D engine (`engine/src/lib`) already covers kinetic caps on the word, tape labels, stamps, counters, chapter cards,
maps with routes, process lines, split screens and quote cards. Planned for the next version: light-leak flash,
burn/torn-paper wipe, texture-filled giant word, dust layer and photo-in-paper-frame (the 2.5D documentary kit).
Measured on the earlier prototype: 35.5 s at 1080p30 in 2 min 20 s (~7.6 fps; SVG turbulence filters are the cost) →
bake paper/grunge textures to images once instead of per-frame SVG noise.
