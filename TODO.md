# Before publishing

## v0.1 (2D pipeline) — done
- [x] Engine bundled in `plugins/explainer-director/engine`, no paths from the author's machine
- [x] Neutral example film (`src/example`), tested on a fresh copy: setup → beats → check → voice → mix → draft render
- [x] Real people and copied narration removed from the shipped skills; style studies kept as numbers and patterns
- [x] New `cream` chapter look so flat-explainer-style works with the engine

## Still to do for v0.1
- [x] Name kept: Explainer Director · licence: MIT (LICENSE)
- [x] Font licence files (OFL) next to the fonts · plugin icon
- [ ] Install test through Claude Code itself (`/plugin marketplace add` from a local path), on a second machine if possible
- [ ] Record a 3–5 min demo from your own script with the final look
- [ ] Decide: GitHub repo public or private until ready

## v0.2 (next/)
- [ ] 3D kit (stylized-webgl): copy `src/kit` and the cast builder, make Blender/MakeHuman optional, replace the
      real-people reference builds with neutral ones, fresh-copy test
- [ ] Painted 2D kit (painted-ruins-style, character-film-scene)
- [ ] talking-head-recut (needs the HyperFrames CLI)
