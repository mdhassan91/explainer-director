"""ElevenLabs path of tools/voice.py against a fake local server (no key, no network, no Kokoro model needed).
run: python3 -m unittest discover -s tests"""
import http.server, json, os, pathlib, shutil, subprocess, sys, tempfile, threading, unittest
import numpy as np

ENGINE = pathlib.Path(__file__).resolve().parent.parent
CALLS = []

class Fake(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        CALLS.append({"path": self.path, "key": self.headers.get("xi-api-key"), "body": body})
        if self.headers.get("xi-api-key") != "test-key":
            self.send_response(401); self.end_headers(); self.wfile.write(b'{"detail":"bad key"}'); return
        n = int(24000 * (0.3 + 0.06 * len(body["text"]))); t = np.arange(n) / 24000
        pcm = (0.3 * np.sin(2 * np.pi * 180 * t) * 32767).astype("<i2").tobytes()
        self.send_response(200); self.end_headers(); self.wfile.write(pcm)
    def log_message(self, *a): pass

class ElevenLabsVoice(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.srv = http.server.HTTPServer(("127.0.0.1", 0), Fake)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.srv.server_port}"
    @classmethod
    def tearDownClass(cls): cls.srv.shutdown()

    def setUp(self):
        CALLS.clear()
        self.root = pathlib.Path(tempfile.mkdtemp()); (self.root / "tools").mkdir()
        for f in ("beats.py", "voice.py"): shutil.copy(ENGINE / "tools" / f, self.root / "tools" / f)
        p = self.root / "src" / "t"; p.mkdir(parents=True)
        (p / "script.txt").write_text("# ch1 | ONE | 2026 | now\n= b01 | KINETIC | x\nN: Hello there, world.\nLEAD: A second line.\n")
        (p / "cast.json").write_text(json.dumps({"N": "elevenlabs:VOICE/1?x", "LEAD": "elevenlabs:V2@1.1"}))
        subprocess.run([sys.executable, "tools/beats.py", "t"], cwd=self.root, check=True, capture_output=True)
    def tearDown(self): shutil.rmtree(self.root)

    def voice(self, **env):
        e = {**os.environ, "ED_ROOT": str(self.root), "ELEVENLABS_API_BASE": self.base, "KOKORO_DIR": str(self.root / "none"), **env}
        e.pop("ELEVENLABS_API_KEY", None) if "ELEVENLABS_API_KEY" not in env else None
        return subprocess.run([sys.executable, "tools/voice.py", "t"], cwd=self.root, env=e, capture_output=True, text=True, timeout=120)

    def test_missing_key_stops_before_any_call(self):
        r = self.voice(); self.assertNotEqual(r.returncode, 0); self.assertIn("ELEVENLABS_API_KEY", r.stderr); self.assertEqual(CALLS, [])
    def test_wrong_key_reports_api_error(self):
        r = self.voice(ELEVENLABS_API_KEY="wrong"); self.assertNotEqual(r.returncode, 0); self.assertIn("401", r.stderr)
    def test_success_quoting_speed_and_cache(self):
        r = self.voice(ELEVENLABS_API_KEY="test-key"); self.assertEqual(r.returncode, 0, r.stderr)
        self.assertTrue((self.root / "public/t/voice.wav").exists())
        lines = json.loads((self.root / "src/t/lines.json").read_text())
        self.assertEqual([len(l["words"]) for l in lines["beats"][0]["lines"]], [3, 3])
        self.assertTrue(any(c["path"].startswith("/v1/text-to-speech/VOICE%2F1%3Fx?") for c in CALLS))   # id is escaped
        self.assertTrue(any(c["body"].get("voice_settings") == {"speed": 1.1} for c in CALLS))
        n = len(CALLS); self.assertEqual(self.voice(ELEVENLABS_API_KEY="test-key").returncode, 0)
        self.assertEqual(len(CALLS), n, "second run must come from the cache")
    def test_rejects_non_https_base(self):
        r = self.voice(ELEVENLABS_API_KEY="test-key", ELEVENLABS_API_BASE="file:///etc"); self.assertNotEqual(r.returncode, 0)
        self.assertIn("must be https", r.stderr)

if __name__ == "__main__":
    unittest.main()
