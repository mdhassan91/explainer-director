#!/usr/bin/env python3
"""LIBRARY · multi-voice voice-over, beat by beat (--workers N exists, but Kokoro already uses every core, so 1 is fastest — measured).
Voices (cast.json, per speaker): a Kokoro voice ("am_michael", free, local — the default) or
"elevenlabs:<voice_id>" (needs ELEVENLABS_API_KEY in the environment; optional "elevenlabs:<voice_id>@1.1" sets the speed,
0.7–1.2; model from ELEVENLABS_MODEL, default eleven_multilingual_v2). ElevenLabs takes are cached in public/<id>/.tts-cache/,
so re-running only pays for lines that changed.
usage: python tools/voice.py <id> [--workers 3] [--narrator-speed 1.15] [--speed 1.1]
in:  src/<id>/beats.json, optional src/<id>/say.json ({"Nguyen": "Win"} pronunciation fixes)
out: public/<id>/voice.wav + src/<id>/lines.json {duration, cards:[{id,title,year,start,end}], beats:[{id,chapter,start,end,lines:[{who,start,end,words}]}]}
Word times inside a phrase ∝ phoneme count, snapped to energy dips (no ASR model needed). Title card goes after the cold open's last beat."""
import hashlib, json, os, re, sys, urllib.error, urllib.request
from multiprocessing import Pool
import numpy as np, soundfile as sf
ROOT = os.environ.get("ED_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SR = 24000
KDIR = os.environ.get("KOKORO_DIR", os.path.expanduser("~/.cache/explainer-director/kokoro"))
MODEL = os.path.join(KDIR, "kokoro-v1.0.onnx"); VOICES = os.path.join(KDIR, "voices-v1.0.bin")
args = sys.argv[1:]; pid = args[0]
opt = lambda k, d: type(d)(args[args.index(k) + 1]) if k in args else d
WORKERS, NSPEED, SPEED = opt("--workers", 1), opt("--narrator-speed", 1.15), opt("--speed", 1.1)
SAYF = f"{ROOT}/src/{pid}/say.json"; SAY = json.load(open(SAYF)) if os.path.exists(SAYF) else {}
PAUSE = {",": 0.13, ";": 0.2, ":": 0.26, ".": 0.28, "?": 0.32, "!": 0.28, "…": 0.4}
GAP_LINE, GAP_BEAT, CARD, TITLE, TAIL = 0.32, 0.5, 5.5, 5.5, 5.0
K = None
def init():
    global K
    if os.path.exists(MODEL) and os.path.exists(VOICES):
        import kokoro_onnx; K = kokoro_onnx.Kokoro(MODEL, VOICES)
strip = lambda w: w.strip(",.?!:;…\"'")
def phonemes(word):
    w = re.sub(r"[^A-Za-z']", "", SAY.get(strip(word), word))
    if not w: return 2
    if K is None: return max(1, round(len(w) * 0.8))   # no Kokoro model: letters ≈ phonemes
    return max(1, len(re.sub(r"[ˈˌː\s]", "", K.tokenizer.phonemize(w.lower(), "en-us"))))
EL_BASE = os.environ.get("ELEVENLABS_API_BASE", "https://api.elevenlabs.io").rstrip("/")
EL_MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
def elevenlabs(say, voice_id, speed):
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key: raise RuntimeError("ELEVENLABS_API_KEY is not set (cast.json asks for an ElevenLabs voice)")
    body = {"text": say, "model_id": EL_MODEL}
    if speed is not None: body["voice_settings"] = {"speed": min(1.2, max(0.7, speed))}
    cdir = f"{ROOT}/public/{pid}/.tts-cache"; os.makedirs(cdir, exist_ok=True)
    cf = f"{cdir}/el-{hashlib.sha1(json.dumps([voice_id, body], sort_keys=True).encode()).hexdigest()[:16]}.pcm"
    if not os.path.exists(cf):
        req = urllib.request.Request(f"{EL_BASE}/v1/text-to-speech/{voice_id}?output_format=pcm_24000", data=json.dumps(body).encode(),
                                     headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/pcm"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r: pcm = r.read()
        except urllib.error.HTTPError as e: raise RuntimeError(f"ElevenLabs error {e.code} for voice {voice_id}: {e.read()[:300].decode(errors='replace')}") from None
        except urllib.error.URLError as e: raise RuntimeError(f"cannot reach ElevenLabs at {EL_BASE}: {e.reason}") from None
        with open(cf + ".tmp", "wb") as f: f.write(pcm)
        os.replace(cf + ".tmp", cf)
    return np.frombuffer(open(cf, "rb").read(), dtype="<i2").astype(np.float32) / 32768.0   # 24 kHz mono = SR
def synth(text, voice, speed):
    say = " ".join(SAY.get(strip(w), strip(w)) + re.sub(r"^.*?(?=[,.?!:;…]*$)", "", w) for w in text.split())
    if voice.startswith("elevenlabs:"):
        vid, _, sp = voice[len("elevenlabs:"):].partition("@")
        a = elevenlabs(say, vid, float(sp) if sp else None)
    else:
        if K is None: raise RuntimeError(f"Kokoro model not found in {KDIR} (run setup.sh, or set KOKORO_DIR) — needed for voice {voice}")
        a, _ = K.create(say, voice=voice, speed=speed, lang="en-us", trim=True)
    idx = np.flatnonzero(np.abs(a) > 10 ** (-45 / 20))
    return (a[max(0, idx[0] - 240): idx[-1] + 480] if len(idx) else a).astype(np.float32)
def word_times(audio, words):
    dur = len(audio) / SR; wts = np.array([phonemes(w) + 0.8 for w in words], float)
    cuts = np.concatenate([[0], np.cumsum(wts) / wts.sum() * dur]); hop = int(0.01 * SR)
    env = np.sqrt(np.convolve(audio ** 2, np.ones(hop) / hop, "same"))
    for i in range(1, len(cuts) - 1):
        c = int(cuts[i] * SR); lo = max(int(cuts[i-1]*SR) + hop, c - int(.09*SR)); hi = min(int(cuts[i+1]*SR) - hop, c + int(.09*SR))
        if hi > lo: cuts[i] = (lo + np.argmin(env[lo:hi])) / SR
    return [(cuts[i], cuts[i+1]) for i in range(len(words))]
def beat_audio(b):
    """one beat → (audio, [line dicts with times relative to the beat start])"""
    parts, t, lines = [], 0.0, []
    def sil(s):
        nonlocal t; parts.append(np.zeros(int(s * SR), np.float32)); t += s
    for li, L in enumerate(b["lines"]):
        if li: sil(GAP_LINE)
        ls, words = t, []
        phrases = [p.strip() for p in re.findall(r"[^,.?!:;…]+[,.?!:;…]*", L["text"]) if p.strip()]
        for pi, ph in enumerate(phrases):
            a = synth(ph, L["voice"], NSPEED if L["who"] == "N" else SPEED); ws = ph.split()
            for w, (s, e) in zip(ws, word_times(a, ws)): words.append({"t": w, "s": t + s, "e": t + e})
            parts.append(a); t += len(a) / SR
            if pi < len(phrases) - 1: sil(PAUSE.get(ph[-1], 0.08))
        lines.append({"who": L["who"], "start": ls, "end": t, "words": words})
    return np.concatenate(parts), lines
if __name__ == "__main__":
    B = json.load(open(f"{ROOT}/src/{pid}/beats.json"))
    flat = [(ch, b) for ch in B["chapters"] for b in ch["beats"]]
    voices = {L["voice"] for _, b in flat for L in b["lines"]}
    if any(v.startswith("elevenlabs:") for v in voices) and not os.environ.get("ELEVENLABS_API_KEY"):
        sys.exit("ELEVENLABS_API_KEY is not set, but cast.json uses an ElevenLabs voice")
    if any(not v.startswith("elevenlabs:") for v in voices) and not (os.path.exists(MODEL) and os.path.exists(VOICES)):
        sys.exit(f"Kokoro model not found in {KDIR} (run setup.sh, or set KOKORO_DIR)")
    try:
        with Pool(WORKERS, initializer=init) as pool: res = pool.map(beat_audio, [b for _, b in flat], chunksize=1)
    except RuntimeError as e: sys.exit(f"voice failed: {e}")
    out, t, beats, cards = [np.zeros(int(0.6 * SR), np.float32)], 0.6, [], []
    sh = lambda L, o: {**L, "start": round(L["start"] + o, 3), "end": round(L["end"] + o, 3), "words": [{"t": w["t"], "s": round(w["s"] + o, 3), "e": round(w["e"] + o, 3)} for w in L["words"]]}
    seen = set(); first_ch = B["chapters"][0]["id"]; last_open = B["chapters"][0]["beats"][-1]["id"]
    for (ch, b), (a, lines) in zip(flat, res):
        if ch["id"] not in seen:
            seen.add(ch["id"])
            if ch["id"] != first_ch: cards.append({"id": ch["id"], "title": ch["title"], "year": ch["year"], "start": round(t, 3), "end": round(t + CARD, 3)}); out.append(np.zeros(int(CARD * SR), np.float32)); t += CARD
        beats.append({"id": b["id"], "chapter": ch["id"], "start": round(t, 3), "end": round(t + len(a) / SR, 3), "lines": [sh(L, t) for L in lines]})
        out.append(a); t += len(a) / SR
        g = GAP_BEAT
        if b["id"] == last_open and first_ch == "ch0" and len(B["chapters"]) > 1:
            cards.append({"id": "title", "title": B.get("title", ""), "year": "", "start": round(t + 0.5, 3), "end": round(t + 0.5 + TITLE, 3)}); g = TITLE + 0.5
        out.append(np.zeros(int(g * SR), np.float32)); t += g
    out.append(np.zeros(int(TAIL * SR), np.float32)); t += TAIL
    audio = np.concatenate(out); audio = audio / max(1e-6, np.abs(audio).max()) * 0.89
    os.makedirs(f"{ROOT}/public/{pid}", exist_ok=True)
    sf.write(f"{ROOT}/public/{pid}/voice.wav", audio, SR, subtype="PCM_16")
    json.dump({"duration": round(t, 3), "cards": cards, "beats": beats}, open(f"{ROOT}/src/{pid}/lines.json", "w"))
    print(f"voice {t:.1f} s · {len(beats)} beats · {WORKERS} workers")
