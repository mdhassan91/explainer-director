#!/usr/bin/env python3
# LIBRARY · synthesized score (royalty-free) + SFX on word cues + voice -> public/<id>/mix.wav.   usage: python tools/mix.py <id>
# Driven by src/<id>/sound.json:
#   {"bpm": 84,
#    "sections": [{"at": "0" | "card:ch1" | "b04" | "b44:lehman" | "b44:six#2" | "b53:blade-0.4", "mood": "tense", "chords": ["Am","F","C","G"]}],
#    "final": "b74:cornerstone",          sustained major chord (optional)
#    "drama": ["b07"],                     whoosh entering/leaving dialogue (dialogue-template beats are added automatically)
#    "hits": ["b13:hated"], "chimes": ["b02:batteries"], "pops": ["b06:inheritance"], "risers": ["b52:five"]}
# Moods: breath title sparse warm uneasy hopeful drive fight rise tense crash dark reflect lift triumph end
# Memory-safe for 20-min films on 7 GB (float32, mono voice, cumsum envelope). SFX from public/lib/sfx.
import json, os, math, re, subprocess, sys
import numpy as np, soundfile as sf
ROOT = os.environ.get("ED_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SR = 48000; pid = sys.argv[1]
L = json.load(open(f"{ROOT}/src/{pid}/lines.json")); DUR = L["duration"]; N = int(DUR * SR) + SR
SND = json.load(open(f"{ROOT}/src/{pid}/sound.json")); BEATS = json.load(open(f"{ROOT}/src/{pid}/beats.json"))
B = {b["id"]: b for b in L["beats"]}; CARD = {c["id"]: c for c in L["cards"]}
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
def cue(bid, word=None, n=1):
    b = B[bid]
    if word is None: return b["start"]
    ws = [w for l in b["lines"] for w in l["words"] if norm(w["t"]) == norm(word)]
    if len(ws) < n: sys.exit(f"sound.json: word '{word}' #{n} not in {bid}")
    return ws[n - 1]["s"]
def when(spec):
    m = re.match(r"^(.*?)([+-]\d+(?:\.\d+)?)?$", spec); base, off = m.group(1), float(m.group(2) or 0)
    if base == "" or re.fullmatch(r"\d+(\.\d+)?", base): return float(base or 0) + off
    if base.startswith("card:"): return CARD[base[5:]]["start"] + off
    bid, _, w = base.partition(":"); n = 1
    if "#" in w: w, n = w.split("#"); n = int(n)
    return cue(bid, w or None, n) + off
MOODS = {  # pad, arp, density, bass, pulse
 "breath": (0.75, 0.0, 1, 0.3, 0.0), "title": (0.9, 0.0, 1, 0.6, 0.0), "sparse": (0.55, 0.4, 1, 0.2, 0.0), "warm": (0.55, 0.55, 2, 0.3, 0.0),
 "uneasy": (0.45, 0.35, 1, 0.25, 0.0), "hopeful": (0.55, 0.6, 2, 0.4, 0.3), "drive": (0.5, 0.55, 2, 0.5, 0.5), "fight": (0.55, 0.45, 2, 0.5, 0.7),
 "rise": (0.55, 0.6, 2, 0.5, 0.4), "tense": (0.5, 0.45, 2, 0.5, 0.6), "crash": (0.65, 0.2, 1, 0.5, 0.8), "dark": (0.55, 0.3, 1, 0.5, 0.8),
 "reflect": (0.5, 0.35, 1, 0.3, 0.3), "lift": (0.8, 0.5, 2, 0.4, 0.0), "triumph": (0.7, 0.75, 2, 0.6, 0.6), "end": (0.8, 0.5, 2, 0.5, 0.0),
}
SECT = sorted([(when(s["at"]), s["chords"], *MOODS[s["mood"]]) for s in SND["sections"]], key=lambda x: x[0])
NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
def chord(name):
    r = NOTE[name[0]] + {"b": -1, "#": 1}.get(name[1:2], 0); minor = name.endswith("m")
    return [r % 12, (r + (3 if minor else 4)) % 12, (r + 7) % 12]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
BPM = SND.get("bpm", 84); BEAT = 60 / BPM; BAR = 4 * BEAT
L_ = np.zeros(N, np.float32); R_ = np.zeros(N, np.float32); rng = np.random.default_rng(1995)
def add(i0, sig, pan=0.0):
    sig = sig.astype(np.float32); i1 = min(N, i0 + len(sig))
    if i1 <= i0 or i0 < 0: return
    l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    L_[i0:i1] += sig[: i1 - i0] * l; R_[i0:i1] += sig[: i1 - i0] * r
def pad_tone(f, dur):
    n = int((dur + 0.8) * SR); tt = np.arange(n) / SR; v = np.zeros(n)
    for det in (-0.002, 0.002):
        for k in range(1, 7): v += np.sin(2 * np.pi * f * (1 + det) * k * tt + rng.random() * 6.28) / k ** 1.7
    return v * np.minimum(1, tt / 0.7) * np.clip((dur + 0.8 - tt) / 0.8, 0, 1)
def piano(f, dur=2.2):
    n = int(dur * SR); tt = np.arange(n) / SR; v = np.zeros(n)
    for k, a in zip((1, 2, 3, 4, 5), (1, 0.45, 0.22, 0.1, 0.05)): v += a * np.sin(2 * np.pi * f * k * tt * (1 + 0.0004 * k * k)) * np.exp(-tt * (1.6 + 1.3 * k))
    return v * np.minimum(1, tt / 0.004)
def kick():
    n = int(0.35 * SR); tt = np.arange(n) / SR; f = 50 + 70 * np.exp(-tt * 25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
KICK = kick()
events = []
for i, s in enumerate(SECT):
    s0 = s[0]; s1 = SECT[i + 1][0] if i + 1 < len(SECT) else DUR + 1; k = 0; x = s0
    while x < s1: events.append((x, min(x + BAR, s1), chord(s[1][k % len(s[1])]), s)); x += BAR; k += 1
for (x0, x1, tones, s) in events:
    _, _, padA, arpA, dens, bassA, pulse = s; i0 = int(x0 * SR); dur = x1 - x0
    for j, tn in enumerate(tones): add(i0, 0.045 * padA * pad_tone(hz(48 + tn + (12 if j == 0 else 0)), dur), (j - 1) * 0.5)
    if bassA > 0:
        for b in range(4 if pulse > 0.5 else 2):
            bt = x0 + b * (BEAT if pulse > 0.5 else 2 * BEAT)
            if bt >= x1: break
            n = int(min(2 * BEAT, x1 - bt) * SR); tt = np.arange(n) / SR
            sig = np.sin(2 * np.pi * hz(36 + tones[0]) * tt) * np.minimum(1, tt / 0.02) * np.exp(-tt * (2.5 if pulse > 0.5 else 0.9))
            add(int(bt * SR), 0.17 * bassA * sig)
    if pulse > 0:
        for b in range(4):
            bt = x0 + b * BEAT
            if bt < x1: add(int(bt * SR), 0.22 * pulse * KICK * (1.0 if b % 2 == 0 else 0.6))
    if arpA > 0:
        pat = [0, 1, 2, 1, 3, 1, 2, 1]; steps = int(round(dur / (BEAT / dens)))
        for k in range(steps):
            at = x0 + k * BEAT / dens
            if at >= x1 - 0.05: break
            p = pat[k % 8] if dens == 2 else [0, 2, 1, 3][k % 4]
            midi = 60 + (tones[p] if p < 3 else tones[0] + 12)
            add(int(at * SR), 0.08 * arpA * (0.85 + 0.15 * ((k % 4) == 0) - 0.1 * rng.random()) * piano(hz(midi)), 0.35 * math.sin(k * 1.3))
if SND.get("final"):
    fz = when(SND["final"])
    for j, tn in enumerate([0, 4, 7, 12, 16]): add(int(fz * SR), 0.11 * piano(hz(60 + tn), 7.0), (j - 2) * 0.3)
music = np.stack([L_, R_], 1); del L_, R_
for d, g in ((0.031, 0.35), (0.067, 0.28), (0.113, 0.22), (0.171, 0.16), (0.257, 0.11)):
    k = int(d * SR); music[k:, 0] += g * music[:-k, 1]; music[k:, 1] += g * music[:-k, 0]
for a in range(0, N, SR * 30):
    tt = np.arange(a, min(N, a + SR * 30)) / SR; music[a:a + len(tt)] *= (np.clip((DUR - tt) / 3, 0, 1) ** 1.5 * np.minimum(1, tt / 1.5))[:, None].astype(np.float32)

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2)
voice = load(f"{ROOT}/public/{pid}/voice.wav")[:, 0].copy(); vv = np.zeros(N, np.float32); vv[: min(N, len(voice))] = voice[:N]; del voice
cs = np.concatenate([[0.0], np.cumsum(vv.astype(np.float64) ** 2)]); idx = np.clip(np.arange(N) + 1200, 0, N); idx0 = np.clip(np.arange(N) - 1200, 0, N)
act = (np.sqrt((cs[idx] - cs[idx0]) / 2400) > 0.02); del cs, idx, idx0
duck = np.zeros(N, np.float32); a_att, a_rel = 1 - math.exp(-1 / (0.12 * SR)), 1 - math.exp(-1 / (0.6 * SR)); y = 0.0
for i in range(0, N, 48):
    x = act[i]; y += min(1.0, (a_att if x > y else a_rel) * 48) * (x - y); duck[i:i + 48] = y
music *= (1 - 0.6 * np.clip(duck, 0, 1))[:, None]; del duck, act

S = {k: load(f"{ROOT}/public/lib/sfx/{k}.mp3") for k in ("pop", "whoosh-short", "chime", "impact-bass-1", "riser")}
sfx = np.zeros((N, 2), np.float32)
def fx(name, at, vol=0.5, pan=0.0):
    s = S[name]; i0 = int(at * SR)
    if i0 < 0 or i0 >= N: return
    i1 = min(N, i0 + len(s)); l, r = math.cos((pan + 1) * math.pi / 4) * 1.414, math.sin((pan + 1) * math.pi / 4) * 1.414
    sfx[i0:i1, 0] += s[: i1 - i0, 0] * vol * l; sfx[i0:i1, 1] += s[: i1 - i0, 1] * vol * r
for c in L["cards"]: fx("whoosh-short", c["start"] - 0.25, 0.45); fx("impact-bass-1", c["start"] + 0.1, 0.45); fx("chime", c["start"] + 0.6, 0.2)
DRAMA = set(SND.get("drama", [])) | {b["id"] for ch in BEATS["chapters"] for b in ch["beats"] if b.get("template") == "dialogue"}
ids = [b["id"] for b in L["beats"]]
for i in range(1, len(ids)):
    if (ids[i] in DRAMA) != (ids[i - 1] in DRAMA): fx("whoosh-short", cue(ids[i]) - 0.3, 0.25)
for s in SND.get("hits", []): fx("impact-bass-1", when(s) - 0.05, 0.5)
for s in SND.get("chimes", []): fx("chime", when(s) - 0.05, 0.35)
for s in SND.get("risers", []): fx("riser", when(s) - 2.0, 0.3)
for i, s in enumerate(SND.get("pops", [])): fx("pop", when(s) - 0.05, 0.28, ((i % 5) - 2) / 4)
music *= 0.5; music += 0.5 * sfx; del sfx; music += vv[:, None]; del vv
music /= max(1e-6, float(np.abs(music).max())) / 0.95
sf.write(f"{ROOT}/public/{pid}/mix.wav", music, SR, subtype="PCM_16")
print("mix", DUR, "s")
