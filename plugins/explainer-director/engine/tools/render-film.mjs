#!/usr/bin/env node
// LIBRARY · chapter-cached film renderer + one-pass finishing.
// usage: node tools/render-film.mjs <id> <Composition> [--draft] [--force] [--only ch2,ch3] [--conc 3]
//  1. bundle once  2. render each chapter's frame range into out/.cache/<id>/<chapter>-<hash>.mp4 — a chapter is re-rendered only
//     when its scenes (its beat ids in scenes.tsx), its beats/lines, the library (src/lib) or the project's shared files change
//  3. concat (stream copy)  4. finishing pass: static film grain + mix.wav + loudnorm −14 LUFS + BT.709 tags, NVENC (≈1 min for 15 min)
//  Output: out/<id>-upload.mp4 (or out/<id>-draft.mp4). Grain is NOT rendered in the browser (27% faster); it is added here.
import fs from "fs"; import path from "path"; import crypto from "crypto"; import { execSync } from "child_process";
import { fileURLToPath } from "url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); process.chdir(ROOT);
const A = process.argv.slice(2); const [id, comp] = A; const flag = (k) => A.includes(k); const opt = (k, d) => (A.includes(k) ? A[A.indexOf(k) + 1] : d);
if (!id || !comp) { console.log("usage: node tools/render-film.mjs <id> <Composition> [--draft] [--force] [--only ch2] [--conc 3]"); process.exit(1); }
const DRAFT = flag("--draft"), FORCE = flag("--force"), ONLY = opt("--only", "").split(",").filter(Boolean), CONC = opt("--conc", "3");
const env = { ...process.env };
const sh = (c) => execSync(c, { stdio: "inherit", env, shell: "/bin/bash" });
const P = `src/${id}`; const read = (f) => fs.readFileSync(f, "utf8");
const lines = JSON.parse(read(`${P}/lines.json`)), beats = JSON.parse(read(`${P}/beats.json`));
const meta = fs.existsSync(`${P}/meta.json`) ? JSON.parse(read(`${P}/meta.json`)) : {}; const fps = meta.fps ?? beats.fps ?? 24;
const total = Math.round(lines.duration * fps);
// chapter time ranges: a chapter starts at its card (or at 0 for the first)
const chs = beats.chapters.map((c, i) => { const card = lines.cards.find((k) => k.id === c.id); const first = lines.beats.find((b) => b.chapter === c.id); return { id: c.id, def: c, t: i === 0 ? 0 : card ? card.start : first.start - 0.2 }; });
chs.forEach((c, i) => { c.a = Math.round(c.t * fps); c.b = i + 1 < chs.length ? Math.round(chs[i + 1].t * fps) - 1 : total - 1; });
// hashing
const H = (...xs) => crypto.createHash("sha1").update(xs.join("\u0000")).digest("hex").slice(0, 10);
const libHash = H(...fs.readdirSync("src/lib").sort().map((f) => read(`src/lib/${f}`)));
const projFiles = fs.readdirSync(P).filter((f) => /\.(tsx?|json)$/.test(f) && !["scenes.tsx", "lines.json", "beats.json", "beats.md"].includes(f)).sort();
const projHash = H(...projFiles.map((f) => read(`${P}/${f}`)), read("src/Root.tsx"));
const scenesSrc = fs.existsSync(`${P}/scenes.tsx`) ? read(`${P}/scenes.tsx`) : "";
const parts = scenesSrc.split(/\n  (b\d+): \(c\) =>/); const sceneOf = {}; for (let i = 1; i < parts.length; i += 2) sceneOf[parts[i]] = parts[i + 1];
const scenesHead = parts[0];
const cache = `out/.cache/${id}${DRAFT ? "-draft" : ""}`; fs.mkdirSync(cache, { recursive: true });
for (const c of chs) {
  const ids = c.def.beats.map((b) => b.id);
  c.hash = H(libHash, projHash, scenesHead, ...ids.map((x) => sceneOf[x] ?? ""), JSON.stringify(c.def), JSON.stringify(lines.beats.filter((b) => b.chapter === c.id)), JSON.stringify(lines.cards.filter((k) => k.id === c.id || (c.id === chs[0].id && k.id === "title"))), String(c.a), String(c.b), DRAFT ? "d" : "f");
  c.file = `${cache}/${c.id}-${c.hash}.mp4`;
  c.todo = FORCE || !fs.existsSync(c.file);
}
const todo = chs.filter((c) => c.todo && (ONLY.length === 0 || ONLY.includes(c.id)));
console.log(chs.map((c) => `${c.id} ${c.a}-${c.b} ${c.todo ? "RENDER" : "cached"}`).join("\n"));
const t0 = Date.now();
if (todo.length) {
  sh(`npx remotion bundle src/index.ts --out-dir=build-${id} --log=error </dev/null`);
  for (const c of todo) {
    console.log(`\n▶ ${c.id} frames ${c.a}-${c.b}`);
    sh(`npx remotion render build-${id} ${comp} ${c.file}.tmp.mp4 --frames=${c.a}-${c.b} --muted --concurrency=${CONC} ${DRAFT ? "--scale=0.5 --crf=23" : "--crf=16"} --log=error </dev/null`);
    fs.renameSync(`${c.file}.tmp.mp4`, c.file);
    for (const f of fs.readdirSync(cache)) if (f.startsWith(c.id + "-") && `${cache}/${f}` !== c.file) fs.unlinkSync(`${cache}/${f}`);
  }
}
const t1 = Date.now();
if (ONLY.length && !A.includes("--finish")) { console.log(`rendered ${todo.length} chapter(s) in ${((t1 - t0) / 1000).toFixed(0)} s (pass --finish to also build the film)`); process.exit(0); }
// concat + finish
fs.writeFileSync(`${cache}/list.txt`, chs.map((c) => `file '${path.resolve(c.file)}'`).join("\n"));
const video = `out/${id}-video${DRAFT ? "-draft" : ""}.mp4`, outF = `out/${id}-${DRAFT ? "draft" : "upload"}.mp4`;
sh(`ffmpeg -v error -y -f concat -safe 0 -i ${cache}/list.txt -c copy ${video}`);
const mix = fs.existsSync(`public/${id}/mix.wav`) ? `public/${id}/mix.wav` : `public/${id}/voice.wav`;
const vf = `${DRAFT ? "" : "noise=c0s=12:c0f=u,"}scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`; // static luma grain (no "t" flag = same pattern every frame → small files)
const audio = `-map 1:a -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k`;
const tags = `-color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -movflags +faststart -shortest`;
try { sh(`ffmpeg -v error -y -i ${video} -i ${mix} -vf "${vf}" -map 0:v -c:v h264_nvenc -preset p6 -rc vbr -cq 19 -b:v 0 -maxrate 20M -bufsize 40M -profile:v high -g 48 ${audio} ${tags} ${outF}`); }
catch { console.log("NVENC unavailable → libx264"); sh(`ffmpeg -v error -y -i ${video} -i ${mix} -vf "${vf}" -map 0:v -c:v libx264 -preset veryfast -crf 18 -maxrate 20M -bufsize 40M -g 48 ${audio} ${tags} ${outF}`); }
console.log(`\n✔ ${outF} · rendered ${todo.length}/${chs.length} chapters in ${((t1 - t0) / 1000).toFixed(0)} s · finish ${((Date.now() - t1) / 1000).toFixed(0)} s`);
