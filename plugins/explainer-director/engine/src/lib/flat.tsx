// LIBRARY · flat kit (from the first flat explainer): flat-explainer grammar (mannequin, icons, pop on cue, #N cards) on the Obsidian Jade palette,
// with story-documentary devices (letterbox drama, light leaks, tape, stamps, era grades). Pure SVG/CSS — cheap to render.
import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

// ---------- maths ----------
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const outBack = (x: number) => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const rng = (seed: number) => { let a = seed | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

// ---------- palette ----------
export const P = {
  obsidian: "#0B0D0C", obsidian2: "#141917", jade: "#1E7A64", glow: "#3FD3A8", gold: "#C9A45C", gold2: "#E6C98A",
  bone: "#EDE6D6", red: "#B3261E", red2: "#E0473B", grey: "#5C6461",
  parch: "#D8C39C", parch2: "#C4AA7E", sepiaInk: "#2B2117", sepiaMid: "#8C6F4E",
};
export type Era = "sepia" | "cool2000" | "jade" | "now" | "cream";
export type Look = { ground: string; ground2: string; ink: string; mid: string; accent: string; hi: string; danger: string; text: string; dark: boolean };
export const LOOK: Record<Era, Look> = {
  sepia: { ground: P.parch, ground2: P.parch2, ink: P.sepiaInk, mid: P.sepiaMid, accent: "#7A4A22", hi: "#9C2A1C", danger: "#9C2A1C", text: P.sepiaInk, dark: false },
  cool2000: { ground: "#0E1413", ground2: "#18211F", ink: P.bone, mid: "#4F6B64", accent: P.jade, hi: P.gold, danger: P.red2, text: P.bone, dark: true },
  jade: { ground: P.obsidian, ground2: "#0F1A17", ink: P.bone, mid: "#3E5550", accent: P.glow, hi: P.gold, danger: P.red2, text: P.bone, dark: true },
  now: { ground: P.obsidian, ground2: "#101816", ink: P.bone, mid: "#3E5550", accent: P.glow, hi: P.gold, danger: P.red2, text: P.bone, dark: true },
  // flat-explainer-style: cream ground, deep-teal ink, small warm accents (see that skill, §3)
  cream: { ground: "#FAF0D2", ground2: "#F1E4C0", ink: "#00505A", mid: "#5AA0A0", accent: "#00505A", hi: "#F2C14E", danger: "#E8705A", text: "#00505A", dark: false },
};
export const FONT = "Bebas", WIDE = "Archivo";

// ---------- grounds & finish ----------
export const Ground: React.FC<{ L: Look; t: number }> = ({ L, t }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${L.ground2} 0%, ${L.ground} 62%, ${L.dark ? "#050606" : "#A88D63"} 120%)` }}>
    {!L.dark && <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(90,60,30,.035) 0 2px, rgba(0,0,0,0) 2px 5px)" }} />}
  </AbsoluteFill>
);
/** vignette (+ optional in-browser grain). Grain is normally added in the ffmpeg finishing pass (tools-lib/render-film.mjs) — 27% faster renders. */
export const Finish: React.FC<{ t: number; L: Look; grain?: number }> = ({ t, L, grain = 0 }) => {
  const k = Math.floor(t * 24);
  return (
    <>
      {grain > 0 && <AbsoluteFill style={{ backgroundImage: `url(${staticFile("lib/grain.png")})`, backgroundPosition: "0px 0px", opacity: L.dark ? grain : grain * 1.3, mixBlendMode: L.dark ? "screen" : "multiply" }} />}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 48%, rgba(0,0,0,${L.dark ? 0.62 : 0.4}) 100%)` }} />
    </>
  );
};
export const Dust: React.FC<{ t: number; n?: number; color?: string; seed?: number; opacity?: number }> = ({ t, n = 46, color = P.gold2, seed = 7, opacity = 0.55 }) => {
  const D = useMemo(() => { const r = rng(seed); return Array.from({ length: n }, () => ({ x: r() * 1920, y: r() * 1080, vx: (r() - 0.5) * 14, vy: -5 - r() * 12, s: 0.8 + r() * 2.4, ph: r() * 6.28, f: 0.5 + r() * 1.6 })); }, [n, seed]);
  return <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, opacity }}>{D.map((p, i) => <circle key={i} cx={(p.x + p.vx * t + 7680) % 1920} cy={(p.y + p.vy * t + 4320) % 1080} r={p.s} fill={color} opacity={0.2 + 0.45 * (0.5 + 0.5 * Math.sin(t * p.f + p.ph))} />)}</svg>;
};
/** cinematic 2.39 bars, `k` 0..1 */
export const Letterbox: React.FC<{ k: number }> = ({ k }) => { const h = 138 * ease(k); return h <= 0.5 ? null : (<><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: "#000" }} /><div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h, background: "#000" }} /></>); };
/** light leak flash; peak at each `at` */
export const LightLeak: React.FC<{ t: number; at: number[]; dur?: number; amt?: number }> = ({ t, at, dur = 0.24, amt = 1 }) => {
  let a = 0, k = 0;
  at.forEach((ft, i) => { const x = (t - ft) / dur; if (x > -0.5 && x < 1) { const v = x < 0 ? 1 + x / 0.5 : 1 - x; if (v > a) { a = v; k = i; } } });
  a *= amt; if (a <= 0.01) return null;
  const cx = 25 + ((k * 37) % 50), cy = 30 + ((k * 23) % 40);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}% ${cy}%, rgba(255,250,235,${a}) 0%, rgba(230,201,138,${a * 0.85}) 26%, rgba(63,211,168,${a * 0.35}) 52%, rgba(0,0,0,0) 82%)` }} />
      <AbsoluteFill style={{ background: `rgba(255,248,232,${Math.pow(a, 2.4) * 0.85})` }} />
    </AbsoluteFill>
  );
};
/** anamorphic horizontal streak at (x,y) */
export const Streak: React.FC<{ x: number; y: number; w?: number; color?: string; a?: number }> = ({ x, y, w = 900, color = P.glow, a = 0.8 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 3, width: w, height: 6, borderRadius: 6, opacity: a, background: `linear-gradient(90deg, rgba(0,0,0,0), ${color} 50%, rgba(0,0,0,0))`, filter: "blur(2px)", mixBlendMode: "screen" }} />
);

// ---------- type ----------
export const Pop: React.FC<{ t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; from?: "pop" | "up" | "left"; out?: number }> = ({ t, at, children, style, from = "pop", out }) => {
  const x = ramp(t, at, 0.22); if (x <= 0) return null;
  const o = out !== undefined ? 1 - ease(ramp(t, out, 0.25)) : 1; if (o <= 0) return null;
  const drift = 1 + (t - at) * 0.006;
  const tr = from === "pop" ? `scale(${(0.6 + 0.4 * outBack(x)) * drift})` : from === "up" ? `translateY(${(1 - ease(x)) * 40}px) scale(${drift})` : `translateX(${(1 - ease(x)) * -70}px)`;
  return <div style={{ fontFamily: FONT, lineHeight: 0.92, letterSpacing: 2, opacity: ease(x * 1.6) * o, transform: tr, transformOrigin: "50% 60%", ...style }}>{children}</div>;
};
export const Tape: React.FC<{ t: number; at: number; text: string; x: number; y: number; size?: number; bg?: string; fg?: string; rot?: number; out?: number }> = ({ t, at, text, x, y, size = 44, bg = P.gold, fg = P.obsidian, rot = -1.5, out }) => {
  const p = ease(ramp(t, at, 0.3)); if (p <= 0) return null;
  const o = out !== undefined ? 1 - ease(ramp(t, out, 0.25)) : 1;
  return <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, clipPath: `inset(0 ${100 - p * 100}% 0 0)`, opacity: o, background: bg, color: fg, fontFamily: FONT, fontSize: size, letterSpacing: 2.5, padding: "6px 18px 1px", boxShadow: "0 8px 22px rgba(0,0,0,.4)", whiteSpace: "nowrap" }}>{text}</div>;
};
export const Stamp: React.FC<{ t: number; at: number; text: string; x: number; y: number; size?: number; rot?: number; color?: string }> = ({ t, at, text, x, y, size = 140, rot = -9, color = P.red2 }) => {
  const p = ramp(t, at, 0.12); if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${2.2 - 1.2 * ease(p)})`, opacity: ease(p * 2), color, border: `${size * 0.06}px solid ${color}`, borderRadius: size * 0.08, padding: `${size * 0.04}px ${size * 0.16}px 0`, fontFamily: FONT, fontSize: size, letterSpacing: size * 0.04, whiteSpace: "nowrap" }}>{text}</div>;
};
export const shake = (t: number, at: number[], amp = 12) => { for (const a of at) { const x = (t - a) / 0.25; if (x >= 0 && x < 1) { const k = (1 - x) * amp; return `translate(${Math.sin(t * 97) * k}px, ${Math.cos(t * 83) * k}px)`; } } return ""; };
export const Counter: React.FC<{ t: number; at: number; from?: number; to: number; dur?: number; style?: React.CSSProperties; prefix?: string; suffix?: string; dec?: number }> = ({ t, at, from = 0, to, dur = 1, style, prefix = "", suffix = "", dec = 0 }) => {
  if (t < at) return null; const v = lerp(from, to, ease(ramp(t, at, dur)));
  return <div style={{ fontFamily: FONT, ...style }}>{prefix}{v.toLocaleString("en-US", { maximumFractionDigits: dec, minimumFractionDigits: dec })}{suffix}</div>;
};
/** chapter card in flat-explainer "#N" form, premium finish */
export const ChapterCard: React.FC<{ t: number; at: number; n: string; title: string; year: string; icon?: React.ReactNode; color?: string }> = ({ t, at, n, title, year, icon, color = P.gold }) => {
  const p = ramp(t, at, 0.6), u = ease(ramp(t, at + 0.5, 0.8)), q = ease(ramp(t, at + 0.9, 0.6));
  const glow = `0 0 22px ${color}66, 0 0 60px ${color}33`;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", transform: `scale(${1.05 - 0.05 * ease(p) + (t - at) * 0.006})` }}>
      <div style={{ fontFamily: FONT, fontSize: 110, color: P.bone, opacity: ease(p * 1.4), letterSpacing: 6 }}>{n}</div>
      {icon && <div style={{ margin: "6px 0 18px", opacity: ease(ramp(t, at + 0.4, 0.4)), transform: `scale(${0.7 + 0.3 * outBack(ramp(t, at + 0.4, 0.35))})`, filter: `drop-shadow(0 0 18px ${color}88)` }}>{icon}</div>}
      <div style={{ fontFamily: FONT, fontSize: 168, letterSpacing: 16, color, textShadow: glow, clipPath: `inset(0 ${100 - ease(p) * 100}% 0 0)` }}>{title}</div>
      <div style={{ height: 5, width: 760 * u, background: color, boxShadow: glow, marginTop: 2 }} />
      <div style={{ fontFamily: WIDE, fontSize: 30, letterSpacing: 18, color: P.bone, marginTop: 26, opacity: q }}>{year}</div>
    </AbsoluteFill>
  );
};
/** dialogue subtitle: speaker tag + line, bottom inside the letterbox */
/** size: default 42 (older films); new films use ≥ 56 (legibility floor ≈ 5.2 % of 1080, CINEMATOGRAPHY.md §B) */
export const Sub: React.FC<{ who: string; text: string; a: number; color: string; size?: number }> = ({ who, text, a, color, size = 42 }) => a <= 0 ? null : (
  <div style={{ position: "absolute", left: 120, right: 120, bottom: 44, textAlign: "center", opacity: a }}>
    <span style={{ fontFamily: FONT, fontSize: size * 0.8, letterSpacing: 4, color, marginRight: 18 }}>{who}</span>
    <span style={{ fontFamily: WIDE, fontSize: size, color: "#F1EADB", textShadow: "0 2px 10px #000, 0 0 3px #000" }}>{text}</span>
  </div>
);
/** split a line's words into subtitle chunks (≤ 8 words, break after punctuation) and return the chunk at time t */
export const subChunk = (words: { t: string; s: number; e: number }[], t: number) => {
  const chunks: { s: number; e: number; text: string }[] = []; let cur: typeof words = [];
  const flush = () => { if (cur.length) chunks.push({ s: cur[0].s, e: cur[cur.length - 1].e, text: cur.map((w) => w.t).join(" ") }); cur = []; };
  for (const w of words) { cur.push(w); if (cur.length >= 8 || (/[.?!,;:]$/.test(w.t) && cur.length >= 3)) flush(); }
  flush();
  let c = chunks[0]; for (const k of chunks) if (k.s - 0.05 <= t) c = k; return c?.text ?? "";
};

// ---------- the mannequin (flat-explainer character) ----------
export type Pose = "idle" | "point" | "phone" | "think" | "armsUp" | "slump" | "present" | "cross" | "write" | "fist" | "shrug" | "laugh" | "hold";
export type PersonProps = {
  x: number; y: number; s?: number; face?: 1 | -1; pose?: Pose; t: number;
  color?: string; shirt?: string; hair?: "short" | "bun" | "bald" | "side" | "long" | "none"; tie?: string; glasses?: boolean; coat?: string;
  talk?: number; walk?: number; blinkSeed?: number; headDown?: number; back?: boolean; opacity?: number; eyeColor?: string;
};
const ARMS: Record<Pose, [number, number, number, number][]> = { // [elbowX, elbowY, handX, handY] for near (front) and far arm, in units (shoulder at 0,0)
  idle: [[8, 70, 6, 140], [-8, 70, -6, 140]],
  point: [[70, 10, 150, -30], [-8, 70, -6, 140]],
  phone: [[55, 50, 22, -60], [-8, 70, -6, 140]],
  think: [[50, 60, 30, -40], [-6, 70, 20, 90]],
  armsUp: [[60, -60, 80, -150], [-60, -60, -80, -150]],
  slump: [[4, 75, 0, 145], [-4, 75, 0, 145]],
  present: [[70, 40, 140, 30], [-70, 40, -140, 30]],
  cross: [[40, 70, -30, 60], [-40, 70, 30, 70]],
  write: [[60, 60, 120, 70], [-8, 70, 60, 80]],
  fist: [[60, 20, 60, -70], [-8, 70, -6, 140]],
  shrug: [[60, 40, 100, -10], [-60, 40, -100, -10]],
  laugh: [[40, 70, 10, 110], [-40, 70, -10, 110]],
  hold: [[50, 60, 110, 40], [-50, 60, 70, 50]],
};
export const Person: React.FC<PersonProps> = (p) => {
  const { x, y, s = 1, face = 1, pose = "idle", t, color = P.bone, shirt, hair = "short", tie, glasses, coat, talk = 0, walk = 0, blinkSeed = 1, headDown = 0, back = false, opacity = 1, eyeColor } = p;
  const sway = Math.sin(t * 1.3 + blinkSeed) * 1.6 + (talk > 0 ? Math.sin(t * 9) * 1.2 * talk : 0) + (pose === "laugh" ? Math.abs(Math.sin(t * 11)) * 5 : 0);
  const blink = ((t * 0.37 + blinkSeed * 0.31) % 1) < 0.035;
  const mouth = talk > 0 ? 2 + Math.abs(Math.sin(t * 17 + blinkSeed)) * 7 * talk : pose === "laugh" ? 8 : 1.5;
  const body = shirt ?? color; const sk = 13;
  const legSw = Math.sin(t * 7) * 22 * walk;
  const arm = (a: [number, number, number, number], near: boolean) => {
    const sw = walk > 0 ? Math.sin(t * 7 + (near ? 0 : Math.PI)) * 20 * walk : 0;
    const sx = near ? 26 : -26;
    return <path d={`M${sx} -268 Q ${sx + a[0] + sw * 0.5} ${-268 + a[1]} ${sx + a[2] + sw} ${-268 + a[3]}`} stroke={coat ?? body} strokeWidth={sk} fill="none" strokeLinecap="round" />;
  };
  const [aN, aF] = ARMS[pose];
  const hd = headDown * 14;
  const ink = eyeColor ?? (color === P.bone || color === "#F1EADB" ? P.obsidian : P.bone);
  return (
    <g transform={`translate(${x},${y + (pose === "slump" ? 10 : 0)}) scale(${s * face},${s})`} opacity={opacity}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000" opacity={0.25} />
      {/* legs */}
      <path d={`M-20 -150 L${-24 + legSw} 0`} stroke={color} strokeWidth={sk + 2} strokeLinecap="round" />
      <path d={`M20 -150 L${24 - legSw} 0`} stroke={color} strokeWidth={sk + 2} strokeLinecap="round" />
      {arm(aF, false)}
      {/* torso: U, no neck */}
      <g transform={`rotate(${pose === "slump" ? 6 : sway * 0.4} 0 -150)`}>
        <path d="M-52 -292 Q -56 -150 -36 -140 L36 -140 Q 56 -150 52 -292 Q 0 -306 -52 -292 Z" fill={coat ?? body} />
        {coat && <path d="M-14 -296 L0 -230 L14 -296" fill={body} />}
        {tie && <path d="M-6 -292 L6 -292 L9 -220 L0 -205 L-9 -220 Z" fill={tie} />}
        {/* head */}
        <g transform={`translate(${sway * 0.6 + hd * 0.6}, ${hd})`}>
          <circle cx={0} cy={-336} r={40} fill={color} />
          {hair === "short" && <path d="M-41 -340 Q -40 -384 2 -380 Q 40 -378 41 -342 Q 30 -362 -10 -362 Q -30 -360 -41 -340 Z" fill={P.obsidian} opacity={color === P.bone ? 0.9 : 0.6} />}
          {hair === "side" && <path d="M-42 -334 Q -44 -382 4 -380 Q 44 -378 41 -340 Q 20 -370 -20 -352 Z" fill="#1a1a1a" opacity={0.85} />}
          {hair === "bun" && <><circle cx={-30} cy={-370} r={16} fill={P.obsidian} /><path d="M-41 -340 Q -40 -384 2 -380 Q 40 -378 41 -342 Q 28 -360 -8 -360 Q -30 -356 -41 -340 Z" fill={P.obsidian} /></>}
          {hair === "long" && <path d="M-44 -300 Q -48 -384 2 -382 Q 48 -382 44 -300 L 32 -300 Q 34 -356 0 -360 Q -32 -356 -32 -300 Z" fill={P.obsidian} />}
          {hair === "bald" && <path d="M-41 -330 Q -42 -350 -36 -352 M41 -330 Q 42 -350 36 -352" stroke="#888" strokeWidth={6} fill="none" />}
          {!back && <>
            {!blink ? <><circle cx={14} cy={-338} r={4.2} fill={ink} /><circle cx={-6} cy={-338} r={4.2} fill={ink} /></> : <><path d="M10 -338 h8 M-10 -338 h8" stroke={ink} strokeWidth={2.5} /></>}
            {glasses && <g stroke={ink} strokeWidth={2.6} fill="none"><circle cx={14} cy={-338} r={10} /><circle cx={-7} cy={-338} r={10} /><path d="M3 -338 h1" /></g>}
            <ellipse cx={6} cy={-316} rx={6} ry={mouth / 2} fill={ink} />
          </>}
        </g>
      </g>
      {arm(aN, true)}
    </g>
  );
};

// ---------- icons (flat, two-tone) ----------
export const Icon = {
  cell: (c: string, glow?: string) => <g><rect x={-38} y={-110} width={76} height={220} rx={16} fill={c} /><rect x={-16} y={-124} width={32} height={16} rx={4} fill={c} /><rect x={-38} y={-40} width={76} height={18} fill={glow ?? "#000"} opacity={glow ? 1 : 0.25} /></g>,
  blade: (c: string, edge: string) => <g><rect x={-300} y={-28} width={600} height={56} rx={6} fill={c} /><rect x={-300} y={-28} width={600} height={8} rx={4} fill={edge} /><rect x={286} y={-12} width={22} height={24} fill={edge} /></g>,
  phone: (c: string, screen: string) => <g><rect x={-46} y={-120} width={92} height={240} rx={22} fill={c} /><rect x={-32} y={-92} width={64} height={70} rx={6} fill={screen} />{[0, 1, 2, 3].map((r) => [0, 1, 2].map((k) => <rect key={r + "" + k} x={-30 + k * 22} y={0 + r * 24} width={16} height={14} rx={4} fill={screen} opacity={0.7} />))}<rect x={18} y={-150} width={12} height={34} rx={5} fill={c} /></g>,
  car: (c: string, win: string, w = 1) => <g transform={`scale(${w},1)`}><path d="M-240 20 Q -240 -30 -190 -40 L -110 -50 Q -60 -110 20 -110 Q 110 -110 160 -50 L 220 -40 Q 250 -30 250 20 Z" fill={c} /><path d="M-90 -52 Q -50 -96 10 -96 L 10 -52 Z M 26 -96 Q 100 -96 140 -52 L 26 -52 Z" fill={win} /><circle cx={-140} cy={22} r={40} fill="#111" /><circle cx={-140} cy={22} r={18} fill={win} /><circle cx={150} cy={22} r={40} fill="#111" /><circle cx={150} cy={22} r={18} fill={win} /></g>,
  factory: (c: string, win: string) => <g><path d="M-200 80 L-200 -40 L-120 -90 L-120 -40 L-40 -90 L-40 -40 L40 -90 L40 -40 L200 -40 L200 80 Z" fill={c} /><rect x={110} y={-170} width={40} height={130} fill={c} />{[-160, -80, 0, 80, 150].map((x) => <rect key={x} x={x} y={0} width={36} height={30} fill={win} />)}</g>,
  robot: (c: string) => <g stroke={c} strokeWidth={22} strokeLinecap="round" fill="none"><path d="M0 80 L0 40 L-60 -40 L40 -100 L90 -70" /><circle cx={0} cy={40} r={20} fill={c} /><circle cx={-60} cy={-40} r={16} fill={c} /><path d="M90 -70 l20 -20 M90 -70 l24 10" strokeWidth={10} /><rect x={-60} y={80} width={120} height={20} fill={c} stroke="none" /></g>,
  coin: (c: string, ink: string) => <g><circle r={42} fill={c} /><circle r={32} fill="none" stroke={ink} strokeWidth={4} opacity={0.4} /><text y={16} textAnchor="middle" fontFamily={FONT} fontSize={46} fill={ink} opacity={0.6}>¢</text></g>,
  doc: (c: string, ink: string) => <g><path d="M-70 -95 L40 -95 L70 -65 L70 95 L-70 95 Z" fill={c} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-48} y={-58 + i * 28} width={i === 4 ? 50 : 96} height={8} fill={ink} opacity={0.35} />)}</g>,
  calendar: (c: string, ink: string, label: string) => <g><rect x={-80} y={-80} width={160} height={160} rx={12} fill={c} /><rect x={-80} y={-80} width={160} height={40} rx={10} fill={ink} /><text y={50} textAnchor="middle" fontFamily={FONT} fontSize={82} fill={ink}>{label}</text></g>,
  lamp: (c: string, flame: string) => <g><path d="M-40 60 L40 60 L30 20 L-30 20 Z" fill={c} /><path d="M-26 20 Q -30 -40 0 -60 Q 30 -40 26 20 Z" fill={flame} opacity={0.35} /><path d="M0 -10 Q -14 -26 0 -50 Q 14 -26 0 -10 Z" fill={flame} /></g>,
  book: (c: string, ink: string) => <g><rect x={-90} y={-16} width={180} height={32} rx={4} fill={c} /><rect x={-82} y={-10} width={164} height={6} fill={ink} opacity={0.3} /></g>,
  mask: (c: string, ink: string) => <g><path d="M-90 -40 Q 0 -70 90 -40 L 80 40 Q 0 80 -80 40 Z" fill={c} /><path d="M-70 -20 Q 0 -40 70 -20 M -72 5 Q 0 -12 72 5 M -70 28 Q 0 14 70 28" stroke={ink} strokeWidth={4} fill="none" opacity={0.3} /><path d="M-90 -30 Q -130 0 -86 30 M 90 -30 Q 130 0 86 30" stroke={c} strokeWidth={6} fill="none" /></g>,
  flame: (c: string, core: string) => <g><path d="M0 90 Q -80 60 -60 -10 Q -40 -60 -10 -110 Q 0 -60 30 -50 Q 40 -90 50 -100 Q 90 -20 70 40 Q 50 90 0 90 Z" fill={c} /><path d="M0 80 Q -36 60 -26 20 Q -14 -10 0 -30 Q 14 -6 26 10 Q 40 50 0 80 Z" fill={core} /></g>,
  pump: (c: string, ink: string) => <g><rect x={-60} y={-110} width={110} height={220} rx={10} fill={c} /><rect x={-40} y={-86} width={70} height={50} rx={6} fill={ink} opacity={0.5} /><path d="M50 -60 Q 100 -60 100 0 L 100 60" stroke={c} strokeWidth={12} fill="none" /></g>,
  laptop: (c: string, screen: string) => <g><rect x={-110} y={-130} width={220} height={140} rx={8} fill={c} /><rect x={-98} y={-118} width={196} height={116} fill={screen} /><path d="M-140 10 L140 10 L120 30 L-120 30 Z" fill={c} /></g>,
  clock: (c: string, ink: string, tt: number) => <g><circle r={80} fill={c} /><circle r={70} fill="none" stroke={ink} strokeWidth={4} opacity={0.3} /><path d={`M0 0 L${Math.sin(tt) * 48} ${-Math.cos(tt) * 48}`} stroke={ink} strokeWidth={8} strokeLinecap="round" /><path d={`M0 0 L${Math.sin(tt / 12) * 32} ${-Math.cos(tt / 12) * 32}`} stroke={ink} strokeWidth={10} strokeLinecap="round" /></g>,
  nail: (c: string) => <g><rect x={-6} y={-200} width={12} height={240} fill={c} /><path d="M-6 40 L0 70 L6 40 Z" fill={c} /><rect x={-34} y={-214} width={68} height={16} rx={4} fill={c} /></g>,
  plane: (c: string) => <path d="M-90 0 L60 -8 Q 100 -6 100 0 Q 100 6 60 8 L -90 0 Z M 10 -4 L -30 -70 L -10 -70 L 40 -6 Z M 10 4 L -30 70 L -10 70 L 40 6 Z M -70 -2 L -90 -34 L -78 -34 L -56 -3 Z M -70 2 L -90 34 L -78 34 L -56 3 Z" fill={c} />,
  stone: (c: string, ink: string) => <g><path d="M-90 50 L-100 -20 L-60 -60 L40 -70 L100 -30 L90 50 Z" fill={c} /><path d="M-60 -60 L-30 0 L40 -70 M -30 0 L -100 -20 M -30 0 L 90 50" stroke={ink} strokeWidth={3} opacity={0.25} fill="none" /></g>,
  check: (c: string) => <path d="M-40 0 L-10 30 L45 -35" stroke={c} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  cross: (c: string) => <path d="M-35 -35 L35 35 M35 -35 L-35 35" stroke={c} strokeWidth={16} strokeLinecap="round" />,
  brain: (c: string) => <path d="M-60 20 Q -90 0 -70 -30 Q -80 -70 -40 -76 Q -20 -100 10 -86 Q 50 -100 64 -64 Q 96 -50 80 -14 Q 96 20 60 34 Q 40 60 0 48 Q -30 62 -60 20 Z M0 -86 L0 46 M-40 -40 Q -20 -30 -30 0 M 40 -40 Q 20 -30 30 0" fill="none" stroke={c} strokeWidth={8} strokeLinejoin="round" />,
  bars: (c: string) => <g>{[0, 1, 2, 3].map((i) => <rect key={i} x={-70 + i * 38} y={30 - (i + 1) * 26} width={26} height={(i + 1) * 26} fill={c} />)}</g>,
  wall: (c: string, ink: string) => <g>{[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((k) => <rect key={r + "-" + k} x={-120 + k * 60 + (r % 2) * 30} y={-80 + r * 40} width={56} height={36} fill={c} stroke={ink} strokeWidth={2} />))}</g>,
  globe: (c: string) => <g fill="none" stroke={c} strokeWidth={6}><circle r={80} /><ellipse rx={36} ry={80} /><path d="M-80 0 H80 M-70 -40 H70 M-70 40 H70" /></g>,
  shield: (c: string, ink: string) => <g><path d="M0 -90 L70 -60 L66 10 Q 56 64 0 90 Q -56 64 -66 10 L -70 -60 Z" fill={c} /><path d="M-26 0 L-6 22 L30 -22" stroke={ink} strokeWidth={12} fill="none" strokeLinecap="round" /></g>,
  handshake: (c: string) => <g fill="none" stroke={c} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round"><path d="M-110 -10 L-50 -40 L0 -20 L40 -40 L110 -10" /><path d="M-50 -40 L-10 10 Q 0 20 10 10 L40 -20 M -30 -10 L 0 20 M -10 -20 L 20 10" /></g>,
};

// ---------- dotted map ----------
type LL = [number, number];
const LAND: LL[][] = [
  [[-168, 66], [-160, 71], [-140, 70], [-125, 72], [-95, 73], [-80, 73], [-62, 66], [-55, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 22], [-92, 19], [-87, 21], [-88, 16], [-83, 10], [-79, 8], [-85, 11], [-92, 15], [-105, 20], [-110, 24], [-115, 31], [-118, 34], [-124, 40], [-124, 48], [-133, 57], [-150, 60], [-165, 60]],
  [[-55, 60], [-43, 60], [-20, 70], [-20, 82], [-60, 82], [-73, 78], [-55, 68]],
  [[-80, 9], [-72, 12], [-62, 10], [-50, 0], [-35, -7], [-39, -15], [-48, -28], [-58, -38], [-65, -42], [-68, -52], [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-76, -12], [-81, -5], [-80, 0], [-77, 8]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [5, 53], [8, 57], [5, 62], [15, 69], [25, 71], [30, 70], [40, 67], [45, 68], [60, 69], [60, 55], [50, 47], [40, 46], [36, 44], [28, 41], [26, 38], [22, 37], [20, 40], [16, 38], [12, 44], [8, 44], [3, 43], [0, 38], [-5, 36]],
  [[-5, 50], [1, 51], [2, 53], [-2, 57], [-5, 58], [-6, 55], [-3, 54], [-5, 52]],
  [[-17, 21], [-10, 30], [-6, 36], [10, 37], [11, 33], [20, 31], [32, 31], [34, 28], [39, 16], [43, 12], [51, 12], [48, 4], [40, -4], [40, -15], [35, -24], [32, -29], [27, -34], [20, -35], [17, -30], [12, -18], [13, -8], [9, -1], [9, 4], [4, 6], [-4, 5], [-8, 4], [-13, 8], [-17, 14]],
  [[26, 40], [36, 36], [35, 32], [39, 22], [43, 13], [52, 16], [58, 22], [56, 26], [50, 30], [57, 25], [62, 25], [67, 24], [72, 20], [73, 15], [77, 8], [80, 15], [87, 21], [92, 22], [94, 17], [98, 10], [100, 4], [103, 1], [104, 8], [106, 11], [109, 12], [108, 17], [106, 20], [108, 21], [111, 21], [117, 23], [121, 28], [122, 31], [120, 36], [122, 39], [118, 39], [122, 41], [126, 38], [126, 35], [129, 35], [130, 42], [135, 44], [141, 52], [137, 55], [143, 59], [155, 59], [160, 61], [163, 60], [170, 60], [180, 66], [180, 70], [160, 71], [140, 73], [113, 74], [105, 78], [95, 76], [80, 73], [70, 73], [65, 69], [60, 69], [60, 55], [50, 47], [52, 42], [48, 38], [42, 41], [36, 41], [29, 41]],
  [[130, 31], [132, 34], [135, 34], [140, 35], [141, 38], [142, 41], [140, 41], [139, 38], [136, 36], [132, 35]],
  [[95, 5], [98, 4], [104, -2], [106, -6], [102, -4], [96, 2]], [[105, -6], [114, -7], [114, -8.5], [106, -7.5]],
  [[109, 1], [111, -3], [116, -4], [119, 1], [117, 7], [113, 3]], [[120, 18], [122, 18], [126, 7], [122, 7]],
  [[131, -1], [141, -3], [150, -10], [141, -9], [136, -4]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [136, -16], [141, -12], [146, -19], [153, -25], [151, -34], [146, -39], [140, -38], [135, -35], [129, -32], [116, -35], [114, -26]],
  [[172, -34], [178, -38], [174, -41], [167, -46], [171, -44], [174, -39]], [[44, -25], [50, -15], [49, -12], [44, -17]], [[120, 22], [122, 25], [121, 25.3]],
];
export const CHINA: LL[] = [[73, 39], [80, 45], [87, 49], [91, 46], [96, 43], [105, 42], [111, 43], [116, 46], [120, 50], [122, 53], [127, 50], [131, 47], [134, 48], [131, 43], [128, 42], [124, 40], [121, 40], [118, 39], [121, 37], [119, 35], [121, 32], [122, 30], [120, 26], [116, 23], [111, 21], [108, 22], [106, 22], [101, 22], [98, 24], [97, 28], [92, 28], [88, 28], [81, 30], [79, 33], [75, 36]];
export const PLACES: Record<string, LL> = {
  berlin: [13.4, 52.5], munich: [11.6, 48.1], london: [-0.1, 51.5], paris: [2.35, 48.85], sanfrancisco: [-122.4, 37.8], bengaluru: [77.6, 12.97], singapore: [103.8, 1.35],
  anhui: [117.3, 31.8], changsha: [113, 28.2], beijing: [116.4, 39.9], shenzhen: [114.1, 22.5], wuhan: [114.3, 30.6], tokyo: [139.7, 35.7], osaka: [135.5, 34.7],
  omaha: [-96, 41.3], detroit: [-83, 42.3], washington: [-77, 38.9], brussels: [4.35, 50.85], ottawa: [-75.7, 45.4], budapest: [19, 47.5], szeged: [20.1, 46.25],
  camacari: [-38.3, -12.7], rayong: [101.3, 12.7], manisa: [27.4, 38.6], subang: [107.7, -6.5], nyc: [-74, 40.7], helsinki: [25, 60.2], lagos: [3.4, 6.5], delhi: [77.2, 28.6], sydney: [151.2, -33.9], mexico: [-99, 19.4], saopaulo: [-46.6, -23.5],
};
const inPoly = (x: number, y: number, poly: LL[]) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const DOTS_CACHE: Record<string, LL[]> = {};
export const landDots = (step: number, polys: LL[][] = LAND, key = "world") => (DOTS_CACHE[key + step] ??= (() => { const o: LL[] = []; for (let lat = -56; lat <= 80; lat += step) for (let lon = -170; lon <= 180; lon += step) if (polys.some((p) => inPoly(lon, lat, p))) o.push([lon, lat]); return o; })());
export type MapView = { lon: number; lat: number; zoom: number }; // zoom 1 = whole world fills 1920 wide
export const proj = (v: MapView, [lon, lat]: LL): [number, number] => { const k = (1920 / 360) * v.zoom; return [960 + (lon - v.lon) * k, 540 - (lat - v.lat) * k * 1.12]; };
export const viewLerp = (a: MapView, b: MapView, k: number): MapView => { const e = ease(k); return { lon: lerp(a.lon, b.lon, e), lat: lerp(a.lat, b.lat, e), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), e)) }; };
const MEMBER = new WeakMap<LL[], Map<number, Uint8Array>>();
const member = (poly: LL[], step: number, dots: LL[]) => { let m = MEMBER.get(poly); if (!m) MEMBER.set(poly, (m = new Map())); let v = m.get(step); if (!v) { v = new Uint8Array(dots.length); dots.forEach((d, i) => (v![i] = inPoly(d[0], d[1], poly) ? 1 : 0)); m.set(step, v); } return v; };
/** dotted land map. Fast: dots are painted on a <canvas> (one fill per colour), region membership is cached per polygon;
 *  pins/routes (children) stay crisp SVG on top. */
export const DotMap: React.FC<{ v: MapView; color: string; hi?: { poly: LL[]; color: string; a: number }[]; step?: number; r?: number; children?: React.ReactNode; dim?: (ll: LL) => string | null }> = ({ v, color, hi = [], step = 1.8, r, children, dim }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const dots = landDots(step);
  const rr = r ?? Math.max(1.2, Math.min(9, (1920 / 360) * v.zoom * step * 0.36));
  React.useLayoutEffect(() => {
    const cv = ref.current; if (!cv) return; const g = cv.getContext("2d")!; g.clearRect(0, 0, 1920, 1080);
    const mem = hi.filter((h) => h.a > 0).map((h) => ({ c: h.color, m: member(h.poly, step, dots) }));
    const groups = new Map<string, number[]>();
    for (let i = 0; i < dots.length; i++) {
      const [x, y] = proj(v, dots[i]); if (x < -20 || x > 1940 || y < -20 || y > 1100) continue;
      let c = dim?.(dots[i]) ?? color; for (const h of mem) if (h.m[i]) c = h.c;
      let arr = groups.get(c); if (!arr) groups.set(c, (arr = [])); arr.push(x, y);
    }
    for (const [c, arr] of groups) { g.fillStyle = c; g.beginPath(); for (let i = 0; i < arr.length; i += 2) { g.moveTo(arr[i] + rr, arr[i + 1]); g.arc(arr[i], arr[i + 1], rr, 0, 6.2832); } g.fill(); }
  });
  return (
    <>
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>{children}</svg>
    </>
  );
};
export const Pin: React.FC<{ v: MapView; at: LL; t: number; t0: number; label?: string; color: string; textColor?: string; size?: number; side?: 1 | -1 }> = ({ v, at, t, t0, label, color, textColor = P.bone, size = 1, side = 1 }) => {
  const k = ramp(t, t0, 0.35); if (k <= 0) return null; const [x, y] = proj(v, at); const pulse = ((t - t0) * 0.8) % 1;
  return (<g transform={`translate(${x},${y}) scale(${size})`}>
    <circle r={14 + pulse * 40} fill="none" stroke={color} strokeWidth={3} opacity={(1 - pulse) * 0.8} />
    <circle r={12 * outBack(k)} fill={color} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
    {label && <g opacity={ease(k)}><rect x={side > 0 ? 22 : -26 - label.length * 21 - 12} y={-26} width={label.length * 21 + 16} height={50} rx={4} fill={textColor === P.bone ? "#0B0D0C" : "#F1E6CF"} opacity={0.85} /><text x={side * 30} y={14} textAnchor={side > 0 ? "start" : "end"} fontFamily={FONT} fontSize={44} letterSpacing={2} fill={textColor}>{label}</text></g>}
  </g>);
};
export const Route: React.FC<{ v: MapView; a: LL; b: LL; t: number; t0: number; dur?: number; color: string; arc?: number; plane?: boolean }> = ({ v, a, b, t, t0, dur = 1, color, arc = 0.25, plane }) => {
  const k = ease(ramp(t, t0, dur)); if (k <= 0) return null;
  const [x1, y1] = proj(v, a), [x2, y2] = proj(v, b); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * arc;
  const pt = (u: number) => [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2];
  const n = 48, pts: number[][] = []; for (let i = 0; i <= n * k; i++) pts.push(pt(i / n)); pts.push(pt(k));
  const [hx, hy] = pt(k), [px, py] = pt(Math.max(0, k - 0.02)); const ang = Math.atan2(hy - py, hx - px) * 180 / Math.PI;
  return (
    <g>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray="12 12" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      {plane && k < 1 && <g transform={`translate(${hx},${hy}) rotate(${ang}) scale(0.38)`}>{Icon.plane(color)}</g>}
    </g>
  );
};

/** photo in a paper frame (for future real B-roll; kept for parity with kit2d) */
export const PhotoFrame: React.FC<{ t: number; at: number; src: string; x: number; y: number; w: number; h: number; rot?: number }> = ({ t, at, src, x, y, w, h, rot = -2 }) => {
  const p = ease(ramp(t, at, 0.4)); if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `translateY(${(1 - p) * -50}px) rotate(${rot}deg)`, background: P.bone, padding: 14, boxShadow: "0 18px 40px rgba(0,0,0,.55)", opacity: p }}><Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.2)" }} /></div>;
};
