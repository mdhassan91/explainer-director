// LIBRARY · scene templates. A beat in beats.json can say  "template": "<name>", "args": {...}  instead of having
// hand-written code. Cues ("on") are a spoken word ("bankruptcy"), the n-th one ("six#2"), or seconds after the beat starts (1.5).
// Colours are tokens: ink | accent | hi | danger | gold | glow | bone | grey (resolved per era) or any "#hex".
import React from "react";
import { AbsoluteFill } from "remotion";
import type { Ctx } from "./film";
import { P, FONT, WIDE, LOOK, Ground, rng, Look, Person, PersonProps, Icon, Pop, Tape, Stamp, Counter, DotMap, Pin, Route, PLACES, CHINA, MapView, viewLerp, ease, ramp, outBack, shake } from "./flat";
import { Svg, Abs, cap, glowTxt, at, Floor, Window, Desk, LampGlow, Spot, Skyline, Bars, PriceTag, Duo, OfficeSet, PhoneSplit, Rain } from "./backdrops";

export type On = string | number;
const MONO = "'DejaVu Sans Mono', 'Liberation Mono', ui-monospace, monospace";
export const when = (c: Ctx, on: On | undefined, fallback = 0.3): number => {
  if (on === undefined) return c.s0 + fallback;
  if (typeof on === "number") return c.s0 + on;
  const [w, n] = on.split("#"); return c.W(w, n ? Number(n) : 1);
};
export const col = (L: Look, c?: string) => !c ? L.ink : c.startsWith("#") ? c : ({ ink: L.ink, accent: L.accent, hi: L.hi, danger: L.danger, text: L.text, mid: L.mid, gold: P.gold, glow: P.glow, bone: P.bone, grey: P.grey, red: P.red2, jade: P.jade } as Record<string, string>)[c] ?? L.ink;

/** icon by name, two colours */
export const ICONS: Record<string, (a: string, b: string) => React.ReactNode> = {
  cell: (a, b) => Icon.cell(a, b), blade: (a, b) => Icon.blade(a, b), phone: (a, b) => Icon.phone(a, b), car: (a, b) => Icon.car(a, b), factory: (a, b) => Icon.factory(a, b),
  robot: (a) => Icon.robot(a), coin: (a, b) => Icon.coin(a, b), doc: (a, b) => Icon.doc(a, b), calendar: (a, b) => Icon.calendar(a, b, ""), lamp: (a, b) => Icon.lamp(a, b),
  book: (a, b) => Icon.book(a, b), mask: (a, b) => Icon.mask(a, b), flame: (a, b) => Icon.flame(a, b), pump: (a, b) => Icon.pump(a, b), laptop: (a, b) => Icon.laptop(a, b),
  nail: (a) => Icon.nail(a), plane: (a) => Icon.plane(a), stone: (a, b) => Icon.stone(a, b), check: (a) => Icon.check(a), cross: (a) => Icon.cross(a), brain: (a) => Icon.brain(a),
  bars: (a) => Icon.bars(a), wall: (a, b) => Icon.wall(a, b), globe: (a) => Icon.globe(a), shield: (a, b) => Icon.shield(a, b), handshake: (a) => Icon.handshake(a),
};
export const ICON_NAMES = Object.keys(ICONS);
/** approximate drawn width of each icon at scale 1 — used to fit icons into slots */
export const ICON_W: Record<string, number> = { cell: 80, blade: 620, phone: 100, car: 500, factory: 400, robot: 220, coin: 84, doc: 140, calendar: 160, lamp: 80, book: 180, mask: 260, flame: 160, pump: 200, laptop: 280, nail: 70, plane: 200, stone: 200, check: 90, cross: 70, brain: 180, bars: 140, wall: 300, globe: 160, shield: 140, handshake: 240 };
export const fitIcon = (name: string, slot: number, max = 1.6) => Math.min(max, (slot * 0.75) / (ICON_W[name] ?? 160));

/** a cast member described in JSON: {who, shirt, hair, tie, glasses, coat, s} */
export type CastArgs = { who: string; shirt?: string; hair?: PersonProps["hair"]; tie?: string; glasses?: boolean; coat?: string; s?: number; color?: string };
const castProps = (c: Ctx, a: CastArgs, x: number, face: 1 | -1): PersonProps => {
  const talking = c.talk(a.who) > 0;
  return { x, y: 905, s: a.s ?? 0.85, face, t: c.t, color: col(c.L, a.color ?? "ink"), shirt: a.shirt ? col(c.L, a.shirt) : c.L.mid, hair: a.hair ?? "short", tie: a.tie ? col(c.L, a.tie) : undefined,
    glasses: a.glasses, coat: a.coat ? col(c.L, a.coat) : undefined, talk: c.talk(a.who), blinkSeed: a.who.length, pose: talking ? (face > 0 ? "present" : "point") : "idle" };
};
export const SETS: Record<string, (c: Ctx) => React.ReactNode> = {
  office: (c) => OfficeSet(c), phone: (c) => PhoneSplit(c), phoneRain: (c) => <>{PhoneSplit(c)}<Rain t={c.t} x={120} w={620} y={160} h={460} /><Rain t={c.t + 3} x={1180} w={620} y={160} h={460} /></>,
  boardroom: (c) => <><Window x={220} y={140} w={1480} h={440} L={c.L} sky /><rect x={360} y={720} width={1200} height={26} fill="#2A2420" /></>,
  studio: (c) => <><circle cx={960} cy={420} r={330} fill="none" stroke={P.glow} strokeWidth={10} opacity={0.25} /><circle cx={960} cy={420} r={260} fill="#11201C" /><Spot x={600} a={0.06} /><Spot x={1320} a={0.06} /></>,
  meeting: (c) => <><rect x={280} y={160} width={1360} height={420} fill="#101A18" stroke="#2A3532" strokeWidth={8} /><rect x={330} y={720} width={1260} height={26} fill="#2A2420" /><LampGlow x={960} y={400} a={0.18} color={P.glow} /></>,
  lab: (c) => <>{[0, 1, 2].map((i) => <g key={i}><rect x={220 + i * 520} y={700} width={420} height={20} fill="#222A28" /><g transform={at(430 + i * 520, 690, 0.7)}>{Icon.laptop("#2A3230", i === 1 ? P.glow : "#1C3A33")}</g></g>)}<LampGlow x={950} y={600} a={0.3} color={P.glow} /></>,
  doorway: (c) => <><rect x={760} y={180} width={400} height={725} fill={P.gold2} opacity={0.55} /><LampGlow x={960} y={560} r={520} a={0.3} /></>,
  study: (c) => <>{[0, 1, 2].map((i) => <g key={i}>{Array.from({ length: 9 }, (_, k) => <rect key={k} x={160 + k * 60} y={220 + i * 130} width={44} height={100} fill={["#3A2A1C", "#2B3A34", "#4A3A22"][(k + i) % 3]} />)}</g>)}<Window x={1180} y={160} w={620} h={460} L={c.L} /><LampGlow x={1450} y={560} a={0.22} /></>,
  plain: (c) => <LampGlow x={960} y={500} a={0.18} color={c.L.accent} />,
};
export const SET_NAMES = Object.keys(SETS);

const PRESET: Record<string, MapView> = { world: { lon: 15, lat: 18, zoom: 1.05 }, asia: { lon: 122, lat: 30, zoom: 3 }, china: { lon: 106, lat: 35, zoom: 4.2 }, europe: { lon: 14, lat: 49, zoom: 4.5 }, usa: { lon: -97, lat: 39, zoom: 3.2 }, americas: { lon: -75, lat: 10, zoom: 1.6 } };
const place = (p: string | [number, number]) => (typeof p === "string" ? PLACES[p] : p);

type T = (c: Ctx, a: any) => React.ReactNode;
export const TEMPLATES: Record<string, T> = {
  /** two people talking on a set. args: {set, left: CastArgs, right: CastArgs, title?: {on, text, color}} — letterbox + subtitles are automatic */
  dialogue: (c, a) => (
    <Duo c={c} set={(SETS[a.set ?? "plain"] ?? SETS.plain)(c)} A={castProps(c, a.left, a.left?.x ?? 560, 1)} B={castProps(c, a.right, a.right?.x ?? 1360, -1)}
      over={a.title ? <text x={960} y={140} textAnchor="middle" fontFamily={FONT} fontSize={a.title.size ?? 110} fill={col(c.L, a.title.color ?? "glow")} opacity={ease(ramp(c.t, when(c, a.title.on), 0.3))}>{a.title.text}</text> : null} />
  ),
  /** stacked kinetic words, each on its cue. args: {items: [{on, text, color?, size?, as?: "pop"|"tape"|"stamp"}], align?: "left"|"center", person?: CastArgs & {x}} */
  kinetic: (c, a) => {
    const left = (a.align ?? "left") === "left"; let y = a.top ?? 200;
    return (<>
      {a.person && <Svg><Floor L={c.L} y={905} /><Person {...castProps(c, a.person, a.person.x ?? 1450, -1)} /></Svg>}
      {(a.items ?? []).map((it: any, i: number) => { const size = it.size ?? 120; const yy = y; y += size * 1.05 + 20; const t0 = when(c, it.on);
        if (it.as === "tape") return <Tape key={i} t={c.t} at={t0} text={it.text} x={left ? 150 : 960 - it.text.length * size * 0.22} y={yy} size={size * 0.6} bg={col(c.L, it.color ?? "gold")} fg={P.obsidian} rot={i % 2 ? 1.5 : -1.5} />;
        if (it.as === "stamp") return <div key={i} style={{ position: "absolute", inset: 0, transform: shake(c.t, [t0]) }}><Stamp t={c.t} at={t0} text={it.text} x={960} y={yy + size / 2} size={size} color={col(c.L, it.color ?? "danger")} /></div>;
        return <Abs key={i} x={left ? 150 : 0} y={yy} w={left ? 1500 : 1920}><Pop t={c.t} at={t0} from={left ? "left" : "pop"} style={{ fontSize: size, color: col(c.L, it.color), textAlign: left ? "left" : "center" }}>{it.text}</Pop></Abs>; })}
    </>);
  },
  /** one huge counting number. args: {on, to, from?, prefix?, suffix?, dec?, label?, labelOn?, color?, tape?: {on, text}} */
  bigNumber: (c, a) => (<>
    <Counter t={c.t} at={when(c, a.on)} from={a.from ?? 0} to={a.to} dec={a.dec ?? 0} dur={a.dur ?? 1.4} prefix={a.prefix} suffix={a.suffix} style={{ position: "absolute", left: 0, top: 330, width: 1920, textAlign: "center", fontSize: a.size ?? 230, color: col(c.L, a.color ?? "glow"), textShadow: glowTxt(col(c.L, a.color ?? "glow")) }} />
    {a.label && <Abs x={0} y={600} w={1920}><Pop t={c.t} at={when(c, a.labelOn ?? a.on) + 0.4} style={cap(80, c.L.text, { letterSpacing: 8 })}>{a.label}</Pop></Abs>}
    {a.tape && <Tape t={c.t} at={when(c, a.tape.on)} text={a.tape.text} x={560} y={860} size={56} />}
  </>),
  /** horizontal bar comparison. args: {title?: {on, text}, max, items: [{label, v, on, txt?, color?}]} */
  bars: (c, a) => (<>
    {a.title && <Tape t={c.t} at={when(c, a.title.on)} text={a.title.text} x={160} y={160} size={56} />}
    <Bars t={c.t} L={c.L} x={160} y={320} w={1150} max={a.max} h={110} items={a.items.map((it: any) => ({ label: it.label, v: it.v, color: col(c.L, it.color ?? "glow"), at: when(c, it.on), txt: it.txt ?? "" }))} />
  </>),
  /** two price tags + optional verdict. args: {left: {label, price, on, color?}, right: {...}, verdict?: {on, text, color}} */
  priceCompare: (c, a) => (<>
    <Svg><path d="M960 160 V 960" stroke={c.L.mid} strokeWidth={4} strokeDasharray="16 14" /></Svg>
    <PriceTag x={360} y={360} s={1.5} t={c.t} at={when(c, a.left.on)} label={a.left.label} price={a.left.price} color={col(c.L, a.left.color ?? "danger")} ink={P.bone} />
    <PriceTag x={1240} y={360} s={1.5} t={c.t} at={when(c, a.right.on)} label={a.right.label} price={a.right.price} color={col(c.L, a.right.color ?? "glow")} />
    {a.verdict && <Abs x={0} y={820} w={1920}><Pop t={c.t} at={when(c, a.verdict.on)} style={cap(110, col(c.L, a.verdict.color ?? "gold"))}>{a.verdict.text}</Pop></Abs>}
  </>),
  /** a row of icons popping in with labels. args: {title?: {on, text}, icons: [{name, on, label?, color?, color2?}]} */
  icons: (c, a) => { const n = a.icons.length; return (<>
    {a.title && <Abs x={0} y={150} w={1920}><Pop t={c.t} at={when(c, a.title.on)} style={cap(100, c.L.text)}>{a.title.text}</Pop></Abs>}
    <Svg>{a.icons.map((ic: any, i: number) => { const x = 960 + (i - (n - 1) / 2) * Math.min(420, 1600 / n); const k = ramp(c.t, when(c, ic.on), 0.4); return k <= 0 ? null : <g key={i}><g transform={at(x, 560, fitIcon(ic.name, Math.min(420, 1600 / n)) * outBack(k))}>{ICONS[ic.name]?.(col(c.L, ic.color ?? "accent"), col(c.L, ic.color2 ?? "#0B0D0C"))}</g>{ic.label && <text x={x} y={790} textAnchor="middle" fontFamily={FONT} fontSize={56} fill={c.L.text} opacity={ease(k)}>{ic.label}</text>}</g>; })}</Svg>
  </>); },
  /** map with pins and routes. args: {view: preset|{lon,lat,zoom}, to?: (same, camera moves there over the beat), step?, highlightChina?, pins: [{place, on, label, color?, side?}], routes: [{from, to, on, plane?}], tapes: [{on, text, x, y}]} */
  map: (c, a) => {
    const v0 = typeof a.view === "string" ? PRESET[a.view] : a.view ?? PRESET.world; const v1 = a.to ? (typeof a.to === "string" ? PRESET[a.to] : a.to) : v0;
    const v = viewLerp(v0, v1, ramp(c.t, c.s0, Math.max(1, c.s1 - c.s0)));
    return (<>
      <DotMap v={v} color={c.L.dark ? "#2E403B" : c.L.mid} step={a.step ?? (v.zoom > 3 ? 0.8 : 1.8)} hi={a.highlightChina ? [{ poly: CHINA, color: c.L.ink, a: 1 }] : []}>
        {(a.routes ?? []).map((r: any, i: number) => <Route key={"r" + i} v={v} a={place(r.from)} b={place(r.to)} t={c.t} t0={when(c, r.on)} color={col(c.L, r.color ?? "gold")} plane={r.plane} />)}
        {(a.pins ?? []).map((p: any, i: number) => <Pin key={"p" + i} v={v} at={place(p.place)} t={c.t} t0={when(c, p.on)} label={p.label} color={col(c.L, p.color ?? "danger")} textColor={c.L.dark ? P.bone : c.L.ink} side={p.side ?? 1} />)}
      </DotMap>
      {(a.tapes ?? []).map((tp: any, i: number) => <Tape key={i} t={c.t} at={when(c, tp.on)} text={tp.text} x={tp.x ?? 150} y={tp.y ?? 150 + i * 90} size={tp.size ?? 56} />)}
    </>);
  },
  /** before/after split. args: {left: {title, on, icon?, color?}, right: {...}} */
  split: (c, a) => (<>
    <Svg><path d="M960 120 V 960" stroke={P.gold} strokeWidth={3} strokeDasharray="12 12" />
      {[a.left, a.right].map((s: any, i: number) => { const k = ramp(c.t, when(c, s.on), 0.4); return s.icon && k > 0 ? <g key={i} transform={at(480 + i * 960, 560, fitIcon(s.icon, 800) * outBack(k))}>{ICONS[s.icon]?.(col(c.L, s.color ?? (i ? "glow" : "grey")), "#0B0D0C")}</g> : null; })}</Svg>
    {[a.left, a.right].map((s: any, i: number) => <Abs key={i} x={i * 960} y={170} w={960}><Pop t={c.t} at={when(c, s.on)} style={cap(96, col(c.L, s.color ?? (i ? "glow" : "grey")))}>{s.title}</Pop></Abs>)}
  </>),
  /** a process line; steps get cut on cue. args: {steps: string[], cuts: [{step, on, why?}], title?: {on, text}} */
  process: (c, a) => { const n = a.steps.length, w = Math.min(210, 1600 / n); return (<>
    <Svg><path d={`M120 420 H1800`} stroke={c.L.mid} strokeWidth={8} />
      {a.steps.map((s: string, i: number) => { const cut = (a.cuts ?? []).find((q: any) => q.step === s); const dead = cut && c.t > when(c, cut.on) + 0.4; const x = 960 + (i - (n - 1) / 2) * w;
        return <g key={s} opacity={dead ? 0.15 : 1}><rect x={x - w * 0.4} y={340} width={w * 0.8} height={160} rx={14} fill={dead ? c.L.danger : "#1B2A27"} stroke={P.glow} strokeWidth={dead ? 0 : 3} /><text x={x} y={440} textAnchor="middle" fontFamily={FONT} fontSize={46} fill={P.bone}>{s}</text></g>; })}</Svg>
    {(a.cuts ?? []).filter((q: any) => q.why).map((q: any, i: number) => <Tape key={i} t={c.t} at={when(c, q.on)} text={q.why} x={300 + i * 420} y={600} size={46} bg={c.L.danger} fg={P.bone} />)}
    {a.title && <Abs x={0} y={120} w={1920}><Pop t={c.t} at={when(c, a.title.on)} style={cap(110, P.glow, { textShadow: glowTxt(P.glow) })}>{a.title.text}</Pop></Abs>}
  </>); },
  /** a quote card. args: {text, on, who?, color?} */
  quote: (c, a) => (<>
    <Svg><text x={260} y={420} fontFamily={FONT} fontSize={420} fill={col(c.L, a.color ?? "gold")} opacity={0.25}>“</text></Svg>
    <Abs x={260} y={360} w={1400}><Pop t={c.t} at={when(c, a.on)} from="up" style={{ fontSize: a.size ?? 100, color: c.L.text }}>{a.text}</Pop></Abs>
    {a.who && <Abs x={260} y={760} w={1400}><Pop t={c.t} at={when(c, a.on) + 0.6} from="left" style={{ fontSize: 56, color: col(c.L, a.color ?? "gold"), fontFamily: WIDE, letterSpacing: 6 }}>— {a.who}</Pop></Abs>}
  </>),
  /** hero object in a spotlight. args: {icon, on, label?, color?, scale?} */
  hero: (c, a) => { const k = ramp(c.t, when(c, a.on), 0.6); return (<>
    <Svg><Spot x={960} w={520} color={col(c.L, a.color ?? "glow")} a={0.08} /><g transform={at(960, 600, (a.scale ?? fitIcon(a.icon, 1400, 2.4)) * (0.85 + 0.15 * outBack(k)))} opacity={ease(k)} style={{ filter: `drop-shadow(0 0 30px ${col(c.L, a.color ?? "glow")}88)` }}>{ICONS[a.icon]?.(col(c.L, a.color ?? "glow"), "#0B0D0C")}</g></Svg>
    {a.label && <Abs x={0} y={860} w={1920}><Pop t={c.t} at={when(c, a.on) + 0.3} style={cap(110, c.L.text, { letterSpacing: 12 })}>{a.label}</Pop></Abs>}
  </>); },
  /** skyline / city establishing shot. args: {tape?: {on, text}, title?: {on, text}, grow?: boolean} */
  city: (c, a) => (<>
    <Svg><Skyline L={c.L} grow={a.grow ? 0.3 + 0.8 * ramp(c.t, c.s0, c.s1 - c.s0) : 1} seed={a.seed ?? 4} /><rect x={0} y={900} width={1920} height={180} fill={c.L.dark ? "#070909" : c.L.ink} /></Svg>
    {a.tape && <Tape t={c.t} at={when(c, a.tape.on)} text={a.tape.text} x={150} y={150} size={64} />}
    {a.title && <Abs x={150} y={260} w={1500}><Pop t={c.t} at={when(c, a.title.on)} from="left" style={{ fontSize: 100, color: c.L.text }}>{a.title.text}</Pop></Abs>}
  </>),
  /** a terminal window that types commands. args: {title?, lines: [{text, on, kind?: "cmd"|"out"|"ok"}], cps?: 28, burst?: On}
   *  cmd lines type at cps characters/s from their cue; out/ok lines appear on cue; burst = the window flies at the camera. */
  terminal: (c, a) => {
    const cps = a.cps ?? 28, ls = a.lines ?? [];
    let caret = -1; const rows = ls.map((l: any, i: number) => { const t0 = when(c, l.on); if (c.t < t0) return null; const kind = l.kind ?? "cmd";
      const n = kind === "cmd" ? Math.min(l.text.length, Math.floor((c.t - t0) * cps)) : l.text.length; if (kind === "cmd") caret = i;
      return { ...l, shown: l.text.slice(0, n), done: n >= l.text.length, kind }; });
    const k = a.burst !== undefined ? ease(ramp(c.t, when(c, a.burst), 0.45)) : 0;
    return (<AbsoluteFill style={{ transform: `scale(${1 + 2.2 * k})`, opacity: 1 - k, transformOrigin: "50% 50%" }}>
      <div style={{ position: "absolute", left: 260, top: 210, width: 1400, height: 640, background: "#0D1311", borderRadius: 22, border: "2px solid #2A3532", boxShadow: "0 40px 90px rgba(0,0,0,.55)", overflow: "hidden" }}>
        <div style={{ height: 64, background: "#161E1B", display: "flex", alignItems: "center", gap: 14, paddingLeft: 26 }}>
          {[P.red2, P.gold2, P.glow].map((dot) => <div key={dot} style={{ width: 20, height: 20, borderRadius: 10, background: dot }} />)}
          <div style={{ flex: 1, textAlign: "center", marginRight: 100, fontFamily: MONO, fontSize: 26, color: "#7C8A86" }}>{a.title ?? "terminal"}</div>
        </div>
        <div style={{ padding: "34px 44px", fontFamily: MONO, fontSize: 40, lineHeight: 1.75 }}>
          {rows.map((r: any, i: number) => r && <div key={i} style={{ color: r.kind === "cmd" ? P.bone : r.kind === "ok" ? P.glow : "#8FA09B", whiteSpace: "pre" }}>
            {r.kind === "cmd" && <span style={{ color: P.glow }}>❯ </span>}{r.kind === "ok" && "✔ "}{r.shown}
            {i === caret && (!r.done || Math.floor(c.t * 2.2) % 2 === 0) && <span style={{ background: P.bone, color: P.bone }}>_</span>}</div>)}
        </div>
      </div>
      {k > 0 && <AbsoluteFill style={{ background: "#FFF8E8", opacity: Math.sin(Math.PI * k) * 0.9 }} />}
    </AbsoluteFill>);
  },
  /** rapid montage: one template per cut, cut on the music. args: {items: [{template, args, label?, grade?}], every: seconds, start?: 0.2, count?: true}
   *  Cues inside items should be numbers (seconds after that item's cut). Pair with a sound.json "rhythm" for a sound on every cut. */
  montage: (c, a) => {
    const items = a.items ?? [], n = items.length, every = a.every ?? 1, t0 = c.s0 + (a.start ?? 0.2);
    const i = Math.max(0, Math.min(n - 1, Math.floor((c.t - t0) / every))), cut = t0 + i * every, it = items[i] ?? {};
    const L = it.grade ? LOOK[it.grade as keyof typeof LOOK] : c.L; const sub = { ...c, s0: cut, s1: cut + every, lt: c.t - cut, L, era: it.grade ?? c.era };
    const k = ramp(c.t, cut, 0.28), tpl = TEMPLATES[it.template];
    return (<>
      {it.grade && <Ground L={L} t={c.t} />}
      <AbsoluteFill style={{ transform: `scale(${1.07 - 0.07 * ease(k)})` }}>{tpl ? tpl(sub, it.args ?? {}) : null}</AbsoluteFill>
      {it.label && <Tape t={c.t} at={cut} text={it.label} x={90} y={60} size={64} bg={L.dark ? P.gold : L.ink} fg={L.dark ? P.obsidian : L.ground} />}
      {a.count !== false && <div style={{ position: "absolute", right: 90, top: 70, fontFamily: MONO, fontSize: 34, color: L.dark ? P.bone : L.ink, opacity: 0.75 }}>{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</div>}
      <AbsoluteFill style={{ background: "#FFF8E8", opacity: c.t < t0 ? 0 : (1 - ramp(c.t, cut, 0.12)) * 0.55 }} />
    </>);
  },
  /** the fake-out: a frozen frame breaks up (slices, colour split, blocks) and dies to black. args: {of: {template, args, grade?}, start?: 0.4, dur?: 1.2}
   *  `of` is drawn fully built and frozen (its cues should be small numbers). Pair with a "silence" section in sound.json. */
  glitch: (c, a) => {
    const of = a.of ?? {}, L = of.grade ? LOOK[of.grade as keyof typeof LOOK] : c.L, tpl = TEMPLATES[of.template];
    const st = c.s0 + (a.start ?? 0.4), dur = a.dur ?? 1.2, g = ramp(c.t, st, dur), dead = 1 - ramp(c.t, st + dur - 0.25, 0.25);
    const frozen = { ...c, t: c.s0 + 3, lt: 3, L }; const r = rng(Math.floor(c.t * 24) * 7919 + 13);
    const base = <>{of.grade && <Ground L={L} t={c.t} />}{tpl ? tpl(frozen, of.args ?? {}) : null}</>;
    const bands = Array.from({ length: 9 }, (_, j) => ({ top: j * 11.1, dx: r() < 0.35 + 0.6 * g ? (r() - 0.5) * 260 * g : 0 }));
    return (<AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: dead, filter: g > 0 ? `drop-shadow(${10 * g}px 0 0 rgba(255,40,90,.85)) drop-shadow(${-10 * g}px 0 0 rgba(40,255,220,.85)) contrast(${1 + g * 0.6})` : undefined }}>
        {g <= 0 ? base : bands.map((b, j) => <AbsoluteFill key={j} style={{ clipPath: `inset(${b.top}% 0 ${Math.max(0, 100 - b.top - 11.2)}% 0)`, transform: `translateX(${b.dx}px)` }}>{base}</AbsoluteFill>)}
        {g > 0 && Array.from({ length: Math.round(14 * g) }, (_, j) => <div key={"k" + j} style={{ position: "absolute", left: r() * 1920, top: r() * 1080, width: 40 + r() * 380, height: 6 + r() * 46, background: [P.glow, P.red2, P.bone, "#000"][j % 4], opacity: 0.85 }} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.35) 0 2px, rgba(0,0,0,0) 2px 4px)", opacity: g }} />
    </AbsoluteFill>);
  },
  /** the film's own script.txt, scrolling to this beat; the line being spoken lights up word by word. args: {title?: "script.txt", scroll?: 1.8} */
  scriptReveal: (c, a) => {
    const rows: { text: string; kind: string; me?: boolean }[] = [];
    for (const ch of c.film?.chapters ?? []) {
      if (rows.length) rows.push({ text: "", kind: "gap" });
      rows.push({ text: `# ${ch.id} | ${ch.title} | ${ch.year} | ${ch.grade}` + (ch.card !== undefined ? ` | card ${ch.card}` : ""), kind: "ch" });
      for (const b of ch.beats) {
        rows.push({ text: `= ${b.id} | ${b.kind} | ${b.visual}`, kind: "beat" });
        if (b.template) { const s = `& ${b.template} ${JSON.stringify(b.args ?? {})}`; rows.push({ text: s.length > 70 ? s.slice(0, 69) + "…" : s, kind: "tpl" }); }
        if (b.lead) rows.push({ text: `~ ${b.lead}`, kind: "tpl" });
        b.lines.forEach((l: any, li: number) => rows.push({ text: `${l.who}: ${l.text}`, kind: "line", me: b.id === c.id && li === 0 }));
        if (b.hold) rows.push({ text: `~ ${b.hold}`, kind: "tpl" });
      }
    }
    const me = Math.max(0, rows.findIndex((r) => r.me)), RH = 58, target = Math.max(0, me - 6) * RH;
    const y = target * ease(ramp(c.t, c.s0 + 0.3, a.scroll ?? 1.8)), words = c.lines[0]?.words ?? [];
    return (<AbsoluteFill style={{ background: "#0A0E0D" }}>
      <div style={{ position: "absolute", left: 140, top: 90, width: 1640, height: 900, background: "#0D1311", borderRadius: 22, border: "2px solid #2A3532", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 152 - y, left: 0, right: 0, fontFamily: MONO, fontSize: 30 }}>
          {rows.map((r, i) => { const said = r.me ? r.text.slice(r.text.indexOf(": ") + 2).split(" ") : [];
            return <div key={i} style={{ height: RH, lineHeight: `${RH}px`, whiteSpace: "pre", paddingLeft: 30, background: r.me ? "rgba(63,211,168,.12)" : undefined,
              color: r.kind === "ch" ? P.gold : r.kind === "beat" ? "#9FB3AD" : r.kind === "tpl" ? "#56645F" : r.me ? "#6F7F7A" : P.bone }}>
              <span style={{ color: "#3A4744", display: "inline-block", width: 76 }}>{i + 1}</span>
              {r.me ? <>{r.text.split(": ")[0]}: {said.map((w, wi) => { const lit = words[wi] && c.t >= words[wi].s; return <span key={wi} style={{ color: lit ? P.glow : undefined, textShadow: lit ? glowTxt(P.glow) : undefined }}>{w} </span>; })}</> : r.text}
            </div>; })}
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 62, background: "#161E1B", fontFamily: MONO, fontSize: 26, color: "#7C8A86", display: "flex", alignItems: "center", justifyContent: "center" }}>{a.title ?? "script.txt"}</div>
      </div>
    </AbsoluteFill>);
  },
  /** plain black (an ending on a hard cut, or a beat of nothing). args: {} */
  black: () => <AbsoluteFill style={{ background: "#000" }} />,
};
export const TEMPLATE_NAMES = Object.keys(TEMPLATES);
