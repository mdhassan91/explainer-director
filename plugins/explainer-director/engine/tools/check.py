#!/usr/bin/env python3
"""LIBRARY · pre-render check: every cue word used by scenes.tsx (c.W / c.line / c.talk), by template args ("on") and by sound.json
exists in its beat; every beat has a scene or a template. usage: python3 tools/check.py <id>"""
import json, re, sys, os
ROOT = os.environ.get("ED_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__))); pid = sys.argv[1]; P = f"{ROOT}/src/{pid}"
B = json.load(open(f"{P}/beats.json")); beats = {b["id"]: b for ch in B["chapters"] for b in ch["beats"]}
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
toks = {k: [norm(w) for l in b["lines"] for w in l["text"].split()] for k, b in beats.items()}
bad = []
src = open(f"{P}/scenes.tsx").read() if os.path.exists(f"{P}/scenes.tsx") else ""
parts = re.split(r"\n  (b\d+): \(c\) =>", src); scened = set()
for i in range(1, len(parts), 2):
    bid, body = parts[i], parts[i + 1]; scened.add(bid)
    for w, n in re.findall(r'W\("([^"]+)"(?:,\s*(\d))?\)', body):
        if toks[bid].count(norm(w)) < int(n or 1): bad.append(f"{bid}: scene cue word '{w}' #{n or 1} not spoken")
    for who, n in re.findall(r'c\.line\("(\w+)"(?:,\s*(\d))?\)', body):
        if sum(1 for l in beats[bid]["lines"] if l["who"] == who) < int(n or 1): bad.append(f"{bid}: no line {who} #{n or 1}")
def walk(x):
    if isinstance(x, dict):
        for k, v in x.items():
            if k in ("on", "labelOn") and isinstance(v, str): yield v
            else: yield from walk(v)
    elif isinstance(x, list):
        for v in x: yield from walk(v)
for bid, b in beats.items():
    if bid not in scened and not b.get("template"): bad.append(f"{bid}: no scene and no template")
    for on in walk(b.get("args", {})):
        w, _, n = on.partition("#")
        if toks[bid].count(norm(w)) < int(n or 1): bad.append(f"{bid}: template cue '{on}' not spoken")
if os.path.exists(f"{P}/sound.json"):
    S = json.load(open(f"{P}/sound.json"))
    for s in [x["at"] for x in S.get("sections", [])] + S.get("hits", []) + S.get("chimes", []) + S.get("pops", []) + S.get("risers", []) + [r["at"] for r in S.get("rhythm", [])] + ([S["final"]] if S.get("final") else []):
        base = re.sub(r"[+-]\d+(\.\d+)?$", "", s)
        if ":" in base and not base.startswith("card:"):
            bid, w = base.split(":"); w, _, n = w.partition("#")
            if bid not in beats or toks[bid].count(norm(w)) < int(n or 1): bad.append(f"sound.json: '{s}' not spoken")
print("\n".join(bad) if bad else f"OK · {len(beats)} beats ({len(scened)} scenes, {sum(1 for b in beats.values() if b.get('template'))} templates)")
sys.exit(1 if bad else 0)
