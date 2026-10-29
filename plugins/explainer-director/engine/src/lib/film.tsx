// LIBRARY · film runtime. One call turns (beats.json + lines.json + scenes) into a Remotion film + a review sampler.
//   const F = makeFilm({ beats, lines, scenes, drama, fps: 24 });  → <Composition component={F.Film} durationInFrames={F.frames} …/>
// A beat is drawn by scenes[id] if present, otherwise by the template named in beats.json (beat.template + beat.args) — see templates.tsx.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P, FONT, LOOK, Era, Look, Ground, Finish, Dust, Letterbox, LightLeak, ChapterCard, Sub, subChunk, Icon, ease, ramp, clamp } from "./flat";
import { TEMPLATES } from "./templates";

export type LineT = { who: string; start: number; end: number; words: { t: string; s: number; e: number }[]; text: string };
export type Ctx = {
  t: number; id: string; s0: number; s1: number; lt: number; L: Look; era: Era; lines: LineT[]; beat: any; film: any;
  W: (word: string, n?: number) => number; talk: (who: string) => number; line: (who: string, n?: number) => LineT; k: (a: number, d?: number) => number;
};
export type SceneFn = (c: Ctx) => React.ReactNode;
export type FilmOpts = {
  beats: any; lines: any; scenes?: Record<string, SceneFn>; drama?: Set<string>; fps?: number;
  speakerColor?: Record<string, string>; speakerName?: Record<string, string>;
  cardIcon?: Record<string, (c: string) => React.ReactNode>; title?: { big: string; sub?: string };
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
type Seg = { kind: "beat" | "card"; id: string; a: number; b: number; era: Era; card?: any; beat?: any; def?: any };

export const useLibFonts = () => {
  const [h] = useState(() => delayRender("lib fonts"));
  useEffect(() => { (async () => { for (const [n, f] of [["Bebas", "fonts/BebasNeue-400.woff2"], ["Archivo", "fonts/Archivo-400.woff2"]]) { const ff = new FontFace(n, `url(${staticFile(f)})`); document.fonts.add(await ff.load()); } continueRender(h); })(); }, [h]);
};

export function makeFilm(o: FilmOpts) {
  const fps = o.fps ?? 24; const seconds = o.lines.duration as number; const scenes = o.scenes ?? {}; const drama = o.drama ?? new Set<string>();
  const CH = o.beats.chapters as any[];
  const defOf: Record<string, any> = {}; CH.forEach((c) => c.beats.forEach((b: any) => (defOf[b.id] = b)));
  // drama = explicit set, or beats whose template is "dialogue"
  CH.forEach((c) => c.beats.forEach((b: any) => { if (b.template === "dialogue") drama.add(b.id); }));
  const SEGS: Seg[] = (() => {
    const out: Seg[] = []; const eraOf: Record<string, Era> = {}; CH.forEach((c) => (eraOf[c.id] = c.grade));
    for (const b of o.lines.beats) { b.lines.forEach((l: any, i: number) => (l.text = defOf[b.id].lines[i].text)); out.push({ kind: "beat", id: b.id, a: b.start - 0.2, b: 0, era: eraOf[b.chapter], beat: b, def: defOf[b.id] }); }
    for (const c of o.lines.cards) out.push({ kind: "card", id: c.id, a: c.start, b: c.end, era: c.id === "title" ? "now" : eraOf[c.id], card: c });
    out.sort((x, y) => x.a - y.a);
    for (let i = 0; i < out.length; i++) if (out[i].kind === "beat") out[i].b = i + 1 < out.length ? out[i + 1].a : seconds + 1;
    return out;
  })();
  const NUM: Record<string, string> = {}; CH.filter((c) => c.id !== "ch0").forEach((c, i) => (NUM[c.id] = `#${i + 1}`));
  const flashes = SEGS.filter((s, j) => s.kind === "card" || (s.kind === "beat" && s.def?.args?.flashIn) || SEGS[j - 1]?.kind === "card" || drama.has(s.id) !== drama.has(SEGS[j - 1]?.id ?? "")).map((s) => s.a);

  const makeCtx = (seg: Seg, t: number): Ctx => {
    const lines: LineT[] = seg.beat.lines; const L = LOOK[seg.era];
    const W = (word: string, n = 1) => { let k = 0; for (const l of lines) for (const w of l.words) if (norm(w.t) === norm(word) && ++k === n) return w.s; throw new Error(`[${seg.id}] word not found: ${word} #${n}`); };
    const talk = (who: string) => { let v = 0; for (const l of lines) if (l.who === who) v = Math.max(v, Math.min(ramp(t, l.start - 0.05, 0.1), 1 - ramp(t, l.end - 0.05, 0.12))); return v; };
    const line = (who: string, n = 1) => { let k = 0; for (const l of lines) if (l.who === who && ++k === n) return l; throw new Error(`[${seg.id}] no line ${who} #${n}`); };
    return { t, id: seg.id, s0: seg.a, s1: seg.b, lt: t - seg.a, L, era: seg.era, lines, beat: seg.def, film: o.beats, W, talk, line, k: (a, d = 0.4) => ease(ramp(t, a, d)) };
  };

  const Film: React.FC<{ at?: number }> = ({ at }) => {
    const frame = useCurrentFrame(); const { fps: f } = useVideoConfig(); const t = at ?? frame / f;
    useLibFonts();
    let i = 0; for (let j = 0; j < SEGS.length; j++) if (SEGS[j].a <= t) i = j;
    const seg = SEGS[i];
    if (!seg) return <AbsoluteFill style={{ background: P.obsidian, color: P.bone, fontFamily: FONT, fontSize: 48, alignItems: "center", justifyContent: "center" }}>No voice yet: run tools/voice.py, then reload.</AbsoluteFill>;
    const L = LOOK[seg.era];
    let body: React.ReactNode = null, sub: React.ReactNode = null;
    if (seg.kind === "card") {
      const c = seg.card;
      body = c.id === "title"
        ? <AbsoluteFill style={{ background: P.obsidian }}><Dust t={t} n={70} /><ChapterCard t={t} at={c.start + 0.2} n="" title={o.title?.big ?? c.title} year={o.title?.sub ?? ""} color={P.gold} /></AbsoluteFill>
        : <AbsoluteFill style={{ background: P.obsidian }}><Dust t={t} n={50} /><ChapterCard t={t} at={c.start + 0.15} n={NUM[c.id] ?? ""} title={c.title} year={c.year} icon={o.cardIcon?.[c.id]?.(P.gold)} /></AbsoluteFill>;
    } else {
      const c = makeCtx(seg, t);
      const tpl = seg.def?.template ? TEMPLATES[seg.def.template] : undefined;
      const S = scenes[seg.id] ?? (tpl ? (cc: Ctx) => tpl(cc, seg.def.args ?? {}) : undefined);
      const u = clamp((t - seg.a) / Math.max(1, seg.b - seg.a)); const dir = i % 3;
      const sc = dir === 1 ? 1.07 - 0.05 * u : 1.0 + 0.05 * u; const dx = dir === 2 ? (u - 0.5) * -40 : 0;
      body = <AbsoluteFill style={{ transform: `translateX(${dx}px) scale(${sc})`, transformOrigin: "50% 48%" }}>{S ? S(c) : <div style={{ color: "red", fontSize: 80, padding: 80 }}>MISSING SCENE {seg.id}</div>}</AbsoluteFill>;
      const cur = c.lines.find((l) => l.who !== "N" && t >= l.start - 0.1 && t <= l.end + 0.25);
      if (cur) sub = <Sub who={o.speakerName?.[cur.who] ?? cur.who} text={subChunk(cur.words, t)} a={Math.min(ramp(t, cur.start - 0.1, 0.12), 1 - ramp(t, cur.end + 0.1, 0.15))} color={o.speakerColor?.[cur.who] ?? P.gold2} />;
    }
    const lb = seg.kind === "beat" && drama.has(seg.id) ? Math.min(ramp(t, seg.a, 0.45), 1 - ramp(t, seg.b - 0.35, 0.35)) : 0;
    return (
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <Ground L={L} t={t} />{body}<Letterbox k={lb} />{sub}<Finish t={t} L={L} /><LightLeak t={t} at={flashes} amt={0.85} />
        <AbsoluteFill style={{ background: "#000", opacity: 1 - ramp(t, 0, 0.6) + ramp(t, seconds - 1.2, 1.0) }} />
      </AbsoluteFill>
    );
  };
  // review sampler: 3 moments per beat + every card
  const SAMPLE_T: number[] = []; for (const s of SEGS) { const b = s.kind === "card" ? s.b : s.b; for (const fr of s.kind === "card" ? [0.7] : [0.3, 0.65, 0.95]) SAMPLE_T.push(s.a + (b - s.a) * fr); }
  const Samples: React.FC = () => { const f = useCurrentFrame(); return <Film at={SAMPLE_T[Math.min(f, SAMPLE_T.length - 1)]} />; };
  // chapter frame ranges (for the cached chapter renderer)
  const chapters = CH.map((c, ci) => { const ids = new Set(c.beats.map((b: any) => b.id)); const segs = SEGS.filter((s) => (s.kind === "beat" && ids.has(s.id)) || (s.kind === "card" && s.id === c.id) || (ci === 0 && s.id === "title")); return { id: c.id, a: Math.min(...segs.map((s) => s.a)) }; });
  return { Film, Samples, fps, seconds, frames: Math.round(seconds * fps), SAMPLE_T, chapters };
}
