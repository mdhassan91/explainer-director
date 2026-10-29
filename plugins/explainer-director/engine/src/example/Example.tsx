import LINES from "./lines.json";
import BEATS from "./beats.json";
import { makeFilm } from "../lib/film";
import { P } from "../lib/flat";
import { SCENES, DRAMA } from "./scenes";
const F = makeFilm({ beats: BEATS, lines: LINES, scenes: SCENES, drama: DRAMA, fps: 24, speakerColor: { HERO: P.glow }, title: { big: "CHECK THE ANSWER" } });
export const Example = F.Film, ExampleSamples = F.Samples, Example_FRAMES = F.frames, Example_SAMPLES = F.SAMPLE_T.length;
