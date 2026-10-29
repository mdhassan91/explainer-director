# Credits

Everything below is installed or downloaded by `engine/setup.sh` or bundled under its own licence.

| What | Source | Licence | How it is used |
|---|---|---|---|
| Rendering | [Remotion](https://remotion.dev) | Remotion licence: free for individuals and companies up to 3 people; larger companies need a company licence | npm dependency |
| 3D runtime | three.js, @react-three/fiber, postprocessing | MIT | npm dependencies |
| Voice | [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) via [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) | Apache-2.0 | model downloaded by setup.sh |
| Voice (optional) | [ElevenLabs](https://elevenlabs.io) text-to-speech API | your own account and its terms; nothing is bundled | called by `tools/voice.py` only when cast.json asks for it |
| Sound effects (8) | [Pixabay](https://pixabay.com/sound-effects/), as packaged in the [HyperFrames](https://github.com/heygen-com/hyperframes) npm package | Pixabay Content License (package: Apache-2.0) | fetched by setup.sh, credits copied to `public/lib/sfx/CREDITS.md`; not redistributed in this repo |
| Fonts | Bebas Neue, Archivo, Noto Serif Display (Google Fonts) | SIL Open Font License 1.1 | bundled in `engine/public/fonts` |
| Story arcs table | [Anil-matcha/vox-ai-motion-graphics-generator](https://github.com/Anil-matcha/vox-ai-motion-graphics-generator) | MIT | ideas, credited in video-director |

Style guides were written from our own measurements of published videos (cut rates, palettes, pacing);
no footage, frames, code or narration from them is included.
