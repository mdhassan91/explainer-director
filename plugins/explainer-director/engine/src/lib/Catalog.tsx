// LIBRARY · visual catalog. Frame 0 = icons, 1 = people (poses + looks), 2 = sets, 3 = palettes/eras.
// Render: npx remotion still src/index.ts LibCatalog out.png --frame=N   (tools-lib/catalog.sh does all four)
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { P, LOOK, Era, FONT, Person, Pose, Ground } from "./flat";
import { ICONS, ICON_W, SETS, SET_NAMES, TEMPLATE_NAMES } from "./templates";
import { useLibFonts, Ctx } from "./film";
import { Floor } from "./backdrops";

const Title: React.FC<{ t: string; sub: string }> = ({ t, sub }) => <div style={{ position: "absolute", left: 60, top: 30, fontFamily: FONT, fontSize: 64, color: P.gold, letterSpacing: 4 }}>{t}<span style={{ fontSize: 30, color: P.bone, marginLeft: 24, fontFamily: "Archivo", letterSpacing: 2 }}>{sub}</span></div>;
const fakeCtx = (era: Era): Ctx => ({ t: 1, id: "cat", s0: 0, s1: 10, lt: 1, L: LOOK[era], era, lines: [], beat: {}, film: { chapters: [] }, W: () => 0, talk: () => 0, line: () => ({ who: "", start: 0, end: 0, words: [], text: "" }), k: () => 1 });

export const LibCatalog: React.FC = () => {
  useLibFonts(); const f = useCurrentFrame(); const L = LOOK.jade;
  if (f === 0) { const names = Object.keys(ICONS); return (<AbsoluteFill style={{ background: P.obsidian }}><Title t="ICONS" sub={`${names.length} · Icon.<name>(colour, colour2) or ICONS["name"] · templates: icons / split / hero`} />
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>{names.map((n, i) => { const x = 140 + (i % 7) * 270, y = 230 + Math.floor(i / 7) * 220; const H: Record<string, number> = { cell: 240, phone: 280, doc: 190, calendar: 170, nail: 290, flame: 200, pump: 230, shield: 180, globe: 170, robot: 210, lamp: 120, brain: 180 }; const s = Math.min(1, 150 / (ICON_W[n] ?? 160), 130 / (H[n] ?? 130)); return <g key={n}><g transform={`translate(${x},${y}) scale(${s})`}>{ICONS[n](P.glow, P.obsidian)}</g><text x={x} y={y + 112} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={P.bone}>{n}</text></g>; })}</svg></AbsoluteFill>); }
  if (f === 1) { const poses: Pose[] = ["idle", "point", "phone", "think", "armsUp", "slump", "present", "cross", "write", "fist", "shrug", "laugh", "hold"];
    const looks = [{ n: "hair short", hair: "short" }, { n: "side + jade (hero)", hair: "side", shirt: P.jade }, { n: "bun", hair: "bun" }, { n: "long", hair: "long" }, { n: "bald + glasses + tie", hair: "bald", glasses: true, tie: P.red2 }, { n: "lab coat", coat: P.bone, shirt: P.jade }, { n: "back view", back: true }] as any[];
    return (<AbsoluteFill style={{ background: P.obsidian }}><Title t="PEOPLE" sub="<Person pose hair shirt tie glasses coat talk walk back face s/>" />
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        {poses.map((p, i) => <g key={p}><Person x={110 + i * 142} y={520} s={0.6} t={1.3} pose={p} color={P.bone} shirt="#3E5550" /><text x={110 + i * 142} y={565} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={P.gold}>{p}</text></g>)}
        {looks.map((l, i) => <g key={i}><Person x={160 + i * 260} y={960} s={0.75} t={1.3} color={P.bone} shirt={l.shirt ?? "#3E5550"} hair={l.hair} glasses={l.glasses} tie={l.tie} coat={l.coat} back={l.back} /><text x={160 + i * 260} y={1010} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={P.gold}>{l.n}</text></g>)}
      </svg></AbsoluteFill>); }
  if (f === 2) { const c = fakeCtx("jade"); return (<AbsoluteFill style={{ background: P.obsidian }}><Title t="SETS" sub={`${SET_NAMES.length} · dialogue template "set": name`} />
    {SET_NAMES.map((n, i) => <div key={n} style={{ position: "absolute", left: 60 + (i % 4) * 460, top: 130 + Math.floor(i / 4) * 300, width: 440, height: 248, overflow: "hidden", border: `2px solid ${P.grey}` }}>
      <div style={{ width: 1920, height: 1080, transform: "scale(0.1833)", transformOrigin: "0 0", position: "relative", background: L.ground }}><svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>{SETS[n](c)}<Floor L={L} y={905} /></svg></div>
      <div style={{ position: "absolute", left: 8, bottom: 4, fontFamily: FONT, fontSize: 34, color: P.gold }}>{n}</div></div>)}
    <div style={{ position: "absolute", left: 60, bottom: 30, fontFamily: "Archivo", fontSize: 26, color: P.bone }}>templates: {TEMPLATE_NAMES.join(" · ")}</div></AbsoluteFill>); }
  const eras: Era[] = ["sepia", "cool2000", "jade", "now", "cream"];
  return (<AbsoluteFill style={{ background: P.obsidian }}><Title t="ERAS & PALETTE" sub="chapter grade in script.txt: # ch1 | TITLE | YEAR | <era>" />
    {eras.map((e, i) => { const Lx = LOOK[e]; return <div key={e} style={{ position: "absolute", left: 40 + i * 372, top: 150, width: 352, height: 336, overflow: "hidden" }}><div style={{ width: 1920, height: 1080, transform: "scale(0.1833)", transformOrigin: "0 0", position: "relative" }}><Ground L={Lx} t={0} /><svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><Person x={960} y={900} s={1.6} t={1} color={Lx.ink} shirt={Lx.accent} hair="side" /></svg></div>
      <div style={{ position: "absolute", left: 0, top: 260, fontFamily: FONT, fontSize: 44, color: P.gold }}>{e}</div>
      <div style={{ position: "absolute", left: 0, top: 320, display: "flex", gap: 8 }}>{[Lx.ground, Lx.ink, Lx.mid, Lx.accent, Lx.hi, Lx.danger].map((cc, k) => <div key={k} style={{ width: 60, height: 60, background: cc, border: "1px solid #444" }} />)}</div></div>; })}
    <div style={{ position: "absolute", left: 60, top: 640, display: "flex", gap: 22 }}>{Object.entries(P).map(([k, v]) => <div key={k} style={{ textAlign: "center" }}><div style={{ width: 96, height: 96, background: v, border: "1px solid #444" }} /><div style={{ fontFamily: "Archivo", fontSize: 18, color: P.bone, marginTop: 6 }}>{k}<br />{v}</div></div>)}</div>
  </AbsoluteFill>);
};
