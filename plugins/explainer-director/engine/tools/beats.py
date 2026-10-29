#!/usr/bin/env python3
"""LIBRARY · script.txt -> beats.json + beats.md.   usage: python tools/beats.py <id>   (project = src/<id>/)
script.txt format:
  # ch1 | THE ORPHAN | 1966 | sepia            chapter: id | title | year | grade (sepia|cool2000|jade|now|cream)
  = b04 | MAP | what's on screen               beat: id | kind | visual note
  & map {"view":"china","pins":[...]}          optional: build this beat from a library template (src/lib/templates.tsx)
  @ B&W rural fields                           optional: real B-roll wanted
  N: narrator text / LEAD: dialogue text       lines; speakers + voices in src/<id>/cast.json
"""
import json, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
pid = sys.argv[1]; P = ROOT / "src" / pid
CAST = json.loads((P / "cast.json").read_text())   # {"N": "am_michael", "LEAD": "am_echo", ...}
WPS, GAP, CARD = 2.45, 0.35, 5.5                    # Kokoro am_michael at speed 1.15 ≈ 147 wpm
chapters, cur, beat = [], None, None
for raw in (P / "script.txt").read_text().splitlines():
    line = raw.strip()
    if not line: continue
    if line.startswith("# "):
        cid, title, year, grade = [s.strip() for s in line[2:].split("|")]
        cur = {"id": cid, "title": title, "year": year, "grade": grade, "beats": []}; chapters.append(cur)
    elif line.startswith("= "):
        bid, kind, vis = [s.strip() for s in line[2:].split("|", 2)]
        beat = {"id": bid, "kind": kind, "visual": vis, "lines": [], "broll": None}; cur["beats"].append(beat)
    elif line.startswith("& "):
        name, _, args = line[2:].partition(" "); beat["template"] = name.strip(); beat["args"] = json.loads(args) if args.strip() else {}
    elif line.startswith("@ "): beat["broll"] = line[2:].strip()
    else:
        who, text = line.split(":", 1); who = who.strip()
        if who not in CAST: sys.exit(f"speaker {who} missing from cast.json")
        beat["lines"].append({"who": who, "voice": CAST[who], "text": text.strip()})
t, words_total = 0.0, 0
for ch in chapters:
    if ch["id"] != "ch0": ch["card_start"] = round(t, 1); t += CARD
    for b in ch["beats"]:
        w = sum(len(l["text"].split()) for l in b["lines"]); words_total += w
        d = w / WPS + GAP * (len(b["lines"]) - 1) + 0.5
        b.update(est_start=round(t, 1), est_dur=round(d, 1), words=w); t += d
meta = json.loads((P / "meta.json").read_text()) if (P / "meta.json").exists() else {}
(P / "beats.json").write_text(json.dumps({"title": meta.get("title", pid), "fps": meta.get("fps", 24), "cast": CAST, "chapters": chapters}, indent=1))
mm = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"
md = [f"# {meta.get('title', pid)} — beat map\n\n{words_total} words · est. **{mm(t)}**\n"]
for ch in chapters:
    md.append(f"\n## {ch['id'].upper()} · {ch['title']} · {ch['year']}  _(grade: {ch['grade']})_\n")
    md.append("| beat | at | len | type | on screen | voice |\n|---|---|---|---|---|---|")
    for b in ch["beats"]:
        who = ", ".join(dict.fromkeys(l["who"] for l in b["lines"]))
        typ = b["kind"] + (f" · `{b['template']}`" if b.get("template") else "")
        md.append(f"| {b['id']} | {mm(b['est_start'])} | {b['est_dur']:.0f}s | {typ} | {b['visual']}" + (f"<br>**B-roll:** {b['broll']}" if b["broll"] else "") + f" | {who} |")
(P / "beats.md").write_text("\n".join(md) + "\n")
n = sum(len(c["beats"]) for c in chapters); nt = sum(1 for c in chapters for b in c["beats"] if b.get("template"))
print(f"{words_total} words · {mm(t)} · {n} beats ({nt} from templates)")
