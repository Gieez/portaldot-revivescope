import asyncio
import base64
import json
import math
import os
import struct
import subprocess
import time
import urllib.request
import wave
import websockets

AUDIO_PATH = "E:/AI-Agent/Workspace/portaldot-revivescope/motion/soundtrack_bang.wav"
OUTPUT_VIDEO = "E:/AI-Agent/Workspace/portaldot-revivescope/ReviveScope_BangMotion_Official.mp4"
HTML_URL = "file:///E:/AI-Agent/Workspace/portaldot-revivescope/motion/index.html?clean=1"
BRAVE_PATH = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"

DURATION_SEC = 24.0
FPS = 24
TOTAL_FRAMES = int(DURATION_SEC * FPS)

def generate_soundtrack():
    print("Generating custom 124 BPM tech soundtrack (24s)...")
    sample_rate = 44100
    total_samples = int(sample_rate * DURATION_SEC)
    beat_sec = 60.0 / 124.0  # ~0.4838s
    
    with wave.open(AUDIO_PATH, 'w') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        
        frames = bytearray()
        for i in range(total_samples):
            t = i / sample_rate
            beat_pos = (t % beat_sec) / beat_sec
            sixteenth_pos = (t % (beat_sec / 4.0)) / (beat_sec / 4.0)
            
            # Kick drum on every beat
            kick = 0.0
            if t < 22.5 and beat_pos < 0.2:
                f_kick = 150.0 * math.exp(-beat_pos * 24.0)
                kick = math.sin(2.0 * math.pi * f_kick * beat_pos) * (1.0 - beat_pos / 0.2)
            
            # Sub-bass
            measure = int(t / (beat_sec * 4))
            roots = [41.2, 49.0, 36.7, 43.65] # E1, G1, D1, F1
            bass = math.sin(2.0 * math.pi * roots[measure % 4] * t) * math.exp(-sixteenth_pos * 3.5) * 0.4
            
            # Hi-hat
            hihat = 0.0
            off_beat = ((t + beat_sec / 2.0) % beat_sec) / beat_sec
            if off_beat < 0.04 and t > 1.0:
                rand_noise = ((i * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - 0.5
                hihat = rand_noise * (1.0 - off_beat / 0.04) * 0.22
            
            # Cyan Synth Lead Arp
            arp_step = int((t / (beat_sec / 4.0)) % 8)
            scale = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77]
            arp = math.sin(2.0 * math.pi * scale[arp_step] * t) * math.exp(-sixteenth_pos * 5.0) * 0.16
            
            # Riser / sweeps at cuts: 4.1s, 9.1s, 14.1s, 19.1s
            transition_sweep = 0.0
            for cut_t in [4.1, 9.1, 14.1, 19.1]:
                if abs(t - cut_t) < 0.35:
                    dt = t - (cut_t - 0.35)
                    transition_sweep += math.sin(2.0 * math.pi * (200.0 + dt * 2800.0) * t) * 0.25
            
            mix = (kick * 0.45 + bass * 0.35 + hihat * 0.2 + arp * 0.22 + transition_sweep * 0.3)
            
            if t < 0.5:
                mix *= (t / 0.5)
            elif t > DURATION_SEC - 1.2:
                mix *= (DURATION_SEC - t) / 1.2
            
            val = int(max(-32767, min(32767, mix * 32767.0 * 0.88)))
            frames.extend(struct.pack('<hh', val, val))
            
        wav.writeframes(frames)
    print("Soundtrack saved:", AUDIO_PATH)

async def capture_and_encode():
    generate_soundtrack()
    
    print("Starting Brave headless browser...")
    brave_proc = subprocess.Popen([
        BRAVE_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        "--disable-gpu",
        "--window-size=1920,1080",
        "--hide-scrollbars",
        "about:blank"
    ])
    
    await asyncio.sleep(1.5)
    
    print("Launching ffmpeg encoder with faststart...")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-r", str(FPS),
        "-i", "-",
        "-i", AUDIO_PATH,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "256k",
        "-movflags", "+faststart",
        "-shortest",
        OUTPUT_VIDEO
    ]
    ffmpeg_proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    try:
        tabs = json.loads(urllib.request.urlopen("http://localhost:9222/json").read().decode())
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        
        async with websockets.connect(ws_url, max_size=50_000_000) as ws:
            req_id = 1
            
            async def send_cmd(method, params=None):
                nonlocal req_id
                this_id = req_id
                req_id += 1
                msg = {"id": this_id, "method": method}
                if params:
                    msg["params"] = params
                await ws.send(json.dumps(msg))
                while True:
                    raw = await ws.recv()
                    data = json.loads(raw)
                    if data.get("id") == this_id:
                        return data

            await send_cmd("Page.enable")
            await send_cmd("Emulation.setDeviceMetricsOverride", {
                "width": 1920, "height": 1080, "deviceScaleFactor": 1, "mobile": False
            })
            
            print(f"Navigating to {HTML_URL}...")
            await send_cmd("Page.navigate", {"url": HTML_URL})
            await asyncio.sleep(2.5)
            
            await send_cmd("Runtime.evaluate", {"expression": "window.OPENER.tl.pause(0);"})
            
            print(f"Rendering {TOTAL_FRAMES} frames ({DURATION_SEC}s @ {FPS}fps)...")
            start_render = time.time()
            
            for frame_idx in range(TOTAL_FRAMES):
                t = frame_idx / FPS
                seek_js = f"window.OPENER.seek({t});"
                await send_cmd("Runtime.evaluate", {"expression": seek_js})
                
                res = await send_cmd("Page.captureScreenshot", {"format": "jpeg", "quality": 80})
                jpg_bytes = base64.b64decode(res["result"]["data"])
                ffmpeg_proc.stdin.write(jpg_bytes)
                
                if frame_idx % 48 == 0 or frame_idx == TOTAL_FRAMES - 1:
                    pct = int(((frame_idx + 1) / TOTAL_FRAMES) * 100)
                    elapsed = time.time() - start_render
                    fps_speed = (frame_idx + 1) / elapsed if elapsed > 0 else 0
                    print(f"Frame {frame_idx + 1}/{TOTAL_FRAMES} ({pct}%) | Video: {t:.2f}s | Speed: {fps_speed:.1f} fps")
            
            print(f"Frames captured in {time.time() - start_render:.1f}s.")
            
    finally:
        if ffmpeg_proc.stdin:
            ffmpeg_proc.stdin.close()
        ffmpeg_proc.wait()
        brave_proc.terminate()
        print(f"Official Film rendered: {OUTPUT_VIDEO}")

if __name__ == "__main__":
    asyncio.run(capture_and_encode())
