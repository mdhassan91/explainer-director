// LIBRARY · layout helpers + flat backdrops (sets) + small infographic pieces. All coordinates 1920x1080.
import React from "react";
import { AbsoluteFill } from "remotion";
import { P, FONT, Look, Person, PersonProps, Icon, Tape, ease, ramp, clamp, outBack, rng } from "./flat";
import type { Ctx } from "./film";
// ---------- helpers ----------
export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>{children}</svg>;
export const Col: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", ...style }}>{children}</AbsoluteFill>;
export const cap = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontSize: size, color, textAlign: "center", ...extra });
export const glowTxt = (c: string) => `0 0 24px ${c}77, 0 0 60px ${c}33`;
export const at = (x: number, y: number, s = 1, r = 0) => `translate(${x},${y}) scale(${s}) rotate(${r})`;
export const Abs: React.FC<{ x: number; y: number; children: React.ReactNode; w?: number }> = ({ x, y, children, w }) => <div style={{ position: "absolute", left: x, top: y, width: w }}>{children}</div>;

// ---------- sets (flat backdrops) ----------
export const Floor: React.FC<{ L: Look; y?: number }> = ({ L, y = 900 }) => <rect x={-200} y={y} width={2320} height={400} fill={L.dark ? "#070909" : L.ground2} opacity={L.dark ? 0.8 : 0.7} />;
export const Window: React.FC<{ x: number; y: number; w: number; h: number; L: Look; night?: boolean; blinds?: boolean; sky?: boolean; t?: number }> = ({ x, y, w, h, L, night = true, blinds, sky }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={night ? (L.dark ? "#16302A" : "#B79C70") : L.ground2} />
    {sky && [0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={x + 20 + i * (w / 7)} y={y + h - 60 - ((i * 53) % 5) * 30} width={w / 9} height={60 + ((i * 53) % 5) * 30} fill={L.dark ? "#0C1513" : L.mid} opacity={0.8} />)}
    {sky && [0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={"w" + i} x={x + 34 + i * (w / 7)} y={y + h - 40 - ((i * 37) % 4) * 20} width={6} height={8} fill={P.gold2} opacity={0.6} />)}
    {blinds && Array.from({ length: Math.floor(h / 22) }, (_, i) => <rect key={i} x={x} y={y + i * 22} width={w} height={8} fill={L.dark ? "#0E1513" : L.ground} opacity={0.65} />)}
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={L.dark ? "#2B3834" : L.mid} strokeWidth={10} />
    <rect x={x + w / 2 - 4} y={y} width={8} height={h} fill={L.dark ? "#2B3834" : L.mid} />
  </g>
);
export const Desk: React.FC<{ x: number; y: number; w: number; L: Look; front?: boolean }> = ({ x, y, w, L, front = true }) => (
  <g><rect x={x} y={y} width={w} height={22} fill={L.dark ? "#2C2620" : L.mid} />{front && <rect x={x + 16} y={y + 22} width={w - 32} height={170} fill={L.dark ? "#1E1A16" : L.accent} opacity={0.9} />}</g>
);
export const LampGlow: React.FC<{ x: number; y: number; r?: number; color?: string; a?: number }> = ({ x, y, r = 380, color = P.gold2, a = 0.35 }) => (
  <g><defs><radialGradient id={`lg${x}${y}`}><stop offset="0" stopColor={color} stopOpacity={a} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#lg${x}${y})`} /></g>
);
export const Spot: React.FC<{ x: number; y?: number; w?: number; color?: string; a?: number }> = ({ x, y = 900, w = 260, color = P.bone, a = 0.12 }) => (
  <g><path d={`M${x - 30} -20 L${x + 30} -20 L${x + w} ${y} L${x - w} ${y} Z`} fill={color} opacity={a} /><ellipse cx={x} cy={y} rx={w} ry={34} fill={color} opacity={a * 1.4} /></g>
);
export const Skyline: React.FC<{ L: Look; y?: number; seed?: number; grow?: number; color?: string; lights?: boolean }> = ({ L, y = 900, seed = 2, grow = 1, color, lights = true }) => {
  const r = rng(seed); const B = Array.from({ length: 16 }, (_, i) => ({ x: i * 125 + r() * 30 - 40, w: 80 + r() * 60, h: 160 + r() * 380 }));
  return <g>{B.map((b, i) => { const h = b.h * clamp(grow * 1.4 - i * 0.03); return <g key={i}><rect x={b.x} y={y - h} width={b.w} height={h} fill={color ?? (L.dark ? "#12201D" : L.ground2)} />{lights && h > 60 && Array.from({ length: Math.floor(h / 46) }, (_, k) => <rect key={k} x={b.x + 14 + (k % 2) * 30} y={y - h + 20 + k * 46} width={14} height={10} fill={P.gold2} opacity={((i * 7 + k * 3) % 5) > 1 ? 0.5 : 0.1} />)}</g>; })}</g>;
};
export const Crane: React.FC<{ x: number; y: number; h: number; L: Look; t: number }> = ({ x, y, h, L, t }) => (
  <g stroke={L.ink} strokeWidth={8} fill="none" opacity={0.75}><path d={`M${x} ${y} V${y - h} M${x - 60} ${y - h} H${x + 260}`} /><path d={`M${x + 200 + Math.sin(t * 0.6) * 20} ${y - h} v ${80}`} strokeWidth={3} /></g>
);
export const Bars: React.FC<{ t: number; items: { label: string; v: number; color: string; at: number; txt?: string }[]; x: number; y: number; w: number; max: number; h?: number; gap?: number; L: Look }> = ({ t, items, x, y, w, max, h = 90, gap = 40, L }) => (
  <>{items.map((it, i) => { const k = ease(ramp(t, it.at, 0.9)); if (t < it.at) return null; return (
    <div key={i} style={{ position: "absolute", left: x, top: y + i * (h + gap), display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ width: 230, fontFamily: FONT, fontSize: 60, color: L.text, textAlign: "right", letterSpacing: 2 }}>{it.label}</div>
      <div style={{ width: (w * it.v / max) * k, height: h, background: it.color, boxShadow: `0 0 30px ${it.color}55` }} />
      <div style={{ fontFamily: FONT, fontSize: 64, color: it.color, opacity: k }}>{it.txt}</div>
    </div>); })}</>
);
export const PriceTag: React.FC<{ x: number; y: number; t: number; at: number; label: string; price: string; color: string; ink?: string; s?: number }> = ({ x, y, t, at: a, label, price, color, ink = P.obsidian, s = 1 }) => {
  const k = ramp(t, a, 0.3); if (k <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s * (0.6 + 0.4 * outBack(k))}) rotate(-4deg)`, opacity: ease(k * 2), background: color, color: ink, fontFamily: FONT, padding: "10px 30px 4px", borderRadius: "10px 40px 40px 10px", boxShadow: "0 10px 26px rgba(0,0,0,.4)", textAlign: "center" }}><div style={{ fontSize: 34, letterSpacing: 3 }}>{label}</div><div style={{ fontSize: 78, lineHeight: 0.9 }}>{price}</div></div>;
};
/** the dialogue staging: set + two people facing each other */
export const Duo: React.FC<{ c: Ctx; set: React.ReactNode; A: PersonProps; B: PersonProps; over?: React.ReactNode; s?: number }> = ({ c, set, A, B, over }) => (
  <Svg>{set}<Floor L={c.L} y={905} /><Person {...A} /><Person {...B} /><g transform="translate(0,120)">{over}</g></Svg>
);
export const OfficeSet = (c: Ctx) => <><Window x={700} y={170} w={520} h={380} L={c.L} blinds /><rect x={1500} y={430} width={170} height={470} fill={c.L.dark ? "#1B1F1D" : c.L.mid} opacity={0.8} /><Desk x={560} y={700} w={800} L={c.L} /><LampGlow x={960} y={300} a={0.18} /></>;
export const PhoneSplit = (c: Ctx, sky = true) => <><Window x={120} y={160} w={620} h={460} L={c.L} sky={sky} /><Window x={1180} y={160} w={620} h={460} L={c.L} sky={sky} /><rect x={955} y={0} width={10} height={1080} fill={c.L.dark ? P.gold : c.L.ink} opacity={0.6} /><LampGlow x={420} y={420} a={0.14} color={P.glow} /><LampGlow x={1500} y={420} a={0.14} /></>;
export const Rain: React.FC<{ t: number; x: number; w: number; y: number; h: number }> = ({ t, x, w, y, h }) => { const r = rng(4); return <g opacity={0.4}>{Array.from({ length: 60 }, (_, i) => { const xx = x + r() * w, sp = 600 + r() * 400, yy = y + ((r() * h + t * sp) % h); return <path key={i} d={`M${xx} ${yy} l -6 22`} stroke={P.bone} strokeWidth={2} />; })}</g>; };

export const hash = (p: [number, number]) => { const x = Math.sin(p[0] * 12.9898 + p[1] * 78.233) * 43758.5453; return x - Math.floor(x); };
export const R31 = (() => { const r = rng(5); return Array.from({ length: 260 }, () => [r() * 330 - 160, r() * 120 - 50] as [number, number]); })();
