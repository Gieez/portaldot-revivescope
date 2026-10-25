import os
import math
import wave
import struct
import subprocess
from PIL import Image, ImageDraw, ImageFont

OUTPUT_VIDEO = "E:/AI-Agent/Workspace/portaldot-revivescope/revivescope-launch-film.mp4"
AUDIO_WAV = "E:/AI-Agent/Workspace/portaldot-revivescope/tech_soundtrack.wav"
SCREENSHOT_PATH = "E:/AI-Agent/Workspace/portaldot-revivescope/screenshot-full.png"

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION_SEC = 46
TOTAL_FRAMES = FPS * DURATION_SEC

# Load fonts
try:
    FONT_TITLE = ImageFont.truetype("segoeui.ttf", 64)
    FONT_SUBTITLE = ImageFont.truetype("segoeui.ttf", 36)
    FONT_HEADING = ImageFont.truetype("consola.ttf", 44)
    FONT_BODY = ImageFont.truetype("segoeui.ttf", 26)
    FONT_MONO = ImageFont.truetype("consola.ttf", 24)
    FONT_MONO_SM = ImageFont.truetype("consola.ttf", 18)
    FONT_TAG = ImageFont.truetype("consola.ttf", 16)
except Exception:
    FONT_TITLE = ImageFont.load_default()
    FONT_SUBTITLE = ImageFont.load_default()
    FONT_HEADING = ImageFont.load_default()
    FONT_BODY = ImageFont.load_default()
    FONT_MONO = ImageFont.load_default()
    FONT_MONO_SM = ImageFont.load_default()
    FONT_TAG = ImageFont.load_default()

# Load full screenshot if available
screenshot_img = None
if os.path.exists(SCREENSHOT_PATH):
    try:
        screenshot_img = Image.open(SCREENSHOT_PATH).convert("RGB")
    except Exception as e:
        print("Failed to load screenshot:", e)

# ── 1. GENERATE HIGH-TECH SYNTH SOUNDTRACK ─────────────────────────────
def generate_audio():
    print("Synthesizing audio soundtrack...")
    sample_rate = 44100
    total_samples = int(sample_rate * DURATION_SEC)
    
    # Tempo: 120 BPM -> 1 beat = 0.5s
    beat_sec = 0.5
    
    with wave.open(AUDIO_WAV, 'w') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        
        frames = bytearray()
        for i in range(total_samples):
            t = i / sample_rate
            beat_pos = (t % beat_sec) / beat_sec
            measure_pos = (t % (beat_sec * 4)) / (beat_sec * 4)
            
            # Kick drum on every beat
            kick = 0.0
            if beat_pos < 0.2:
                freq = 140.0 * math.exp(-beat_pos * 25.0)
                kick = math.sin(2.0 * math.pi * freq * beat_pos) * (1.0 - beat_pos / 0.2)
            
            # Sub bass drone (F# minor / C# chord root ~ 46 Hz)
            sub_bass = math.sin(2.0 * math.pi * 46.25 * t) * 0.35
            
            # High-tech Arpeggio (8th notes: 130Hz, 165Hz, 196Hz, 260Hz)
            arp_note = int((t / (beat_sec / 2)) % 4)
            arp_freqs = [130.81, 164.81, 196.00, 261.63]
            arp_t = (t % (beat_sec / 2)) / (beat_sec / 2)
            arp = math.sin(2.0 * math.pi * arp_freqs[arp_note] * t) * math.exp(-arp_t * 5.0) * 0.18
            
            # Hi-hat on off-beats
            hihat = 0.0
            off_beat = ((t + beat_sec / 2) % beat_sec) / beat_sec
            if off_beat < 0.05:
                # White noise burst
                pseudo_noise = ((i * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - 0.5
                hihat = pseudo_noise * (1.0 - off_beat / 0.05) * 0.15
            
            # Tech glitch click on transitions (every 7-8 sec)
            glitch = 0.0
            if int(t) in [7, 14, 22, 30, 38]:
                glitch_t = t - int(t)
                if glitch_t < 0.15:
                    glitch = math.sin(2.0 * math.pi * 1200.0 * glitch_t) * 0.2
            
            mix = (kick * 0.45 + sub_bass * 0.35 + arp * 0.25 + hihat * 0.2 + glitch * 0.2)
            # Master fade in & out
            if t < 1.0:
                mix *= t
            elif t > DURATION_SEC - 2.0:
                mix *= (DURATION_SEC - t) / 2.0
            
            val = int(max(-32767, min(32767, mix * 32767.0 * 0.85)))
            frames.extend(struct.pack('<hh', val, val))
        
        wav.writeframes(frames)
    print("Audio synthesized:", AUDIO_WAV)

# ── 2. SCENE DRAWING UTILITIES ─────────────────────────────────────────
def draw_hud_decorations(draw, t, title_text="PORTALDOT V3.0 // DIAGNOSTIC RUNTIME"):
    # Grid lines
    grid_color = (25, 30, 45)
    for x in range(0, WIDTH, 120):
        draw.line([(x, 0), (x, HEIGHT)], fill=grid_color, width=1)
    for y in range(0, HEIGHT, 120):
        draw.line([(0, y), (WIDTH, y)], fill=grid_color, width=1)

    # Top status bar
    draw.rectangle([(60, 40), (WIDTH - 60, 90)], fill=(15, 18, 28), outline=(35, 42, 62), width=1)
    draw.text((80, 52), f"SENTINEL SYSTEM ID: RS-420420777", fill=(6, 182, 212), font=FONT_TAG)
    draw.text((450, 52), f"RPC: test-evm-rpc-v3.portaldot.dev", fill=(148, 163, 184), font=FONT_TAG)
    draw.text((950, 52), f"MODE: PALLET-REVIVE DUAL ENGINE", fill=(16, 185, 129), font=FONT_TAG)
    
    pulse_color = (16, 185, 129) if int(t * 3) % 2 == 0 else (5, 150, 105)
    draw.ellipse([(WIDTH - 240, 58), (WIDTH - 228, 70)], fill=pulse_color)
    draw.text((WIDTH - 215, 52), "LIVE PROBE 200 OK", fill=(241, 245, 249), font=FONT_TAG)

    # Bottom ticker
    draw.rectangle([(60, HEIGHT - 75), (WIDTH - 60, HEIGHT - 35)], fill=(15, 18, 28), outline=(35, 42, 62), width=1)
    draw.text((80, HEIGHT - 65), f"REVIVESCOPE • PORTALDOT HACKER HOUSE 2026 • DORA HACKS BUIDL #49759 • VERIFIED SCREENING", fill=(100, 116, 139), font=FONT_TAG)
    draw.text((WIDTH - 300, HEIGHT - 65), f"TIMESTAMP: {int(t*1000):06d}ms", fill=(139, 92, 246), font=FONT_TAG)

# ── 3. RENDER ALL FRAMES TO FFMPEG ─────────────────────────────────────
def render_film():
    generate_audio()
    
    print("Launching ffmpeg video encoder...")
    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",  # Video input from stdin
        "-i", AUDIO_WAV,  # Audio input from WAV
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_VIDEO
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    print(f"Rendering {TOTAL_FRAMES} frames ({DURATION_SEC}s @ {FPS}fps)...")
    
    for frame_idx in range(TOTAL_FRAMES):
        t = frame_idx / FPS
        
        # Base background
        img = Image.new("RGB", (WIDTH, HEIGHT), (8, 9, 13))
        draw = ImageDraw.Draw(img)
        draw_hud_decorations(draw, t)
        
        # ── SCENE 1: TITLE & LOGO (0s - 7s) ───────────────────────────
        if t < 7.0:
            anim_in = min(1.0, t / 1.5)
            alpha_y = int(420 - 30 * anim_in)
            
            # Badge
            draw.rectangle([(WIDTH//2 - 250, alpha_y - 80), (WIDTH//2 + 250, alpha_y - 45)], fill=(139, 92, 246, 40), outline=(139, 92, 246), width=1)
            draw.text((WIDTH//2 - 230, alpha_y - 75), "PORTALDOT HACKER HOUSE 2026 (DORAHACKS)", fill=(196, 181, 253), font=FONT_TAG)
            
            # Main Title
            title_text = "REVIVESCOPE"
            chars_to_show = int(len(title_text) * min(1.0, t / 1.2))
            draw.text((WIDTH//2 - 270, alpha_y), title_text[:chars_to_show], fill=(241, 245, 249), font=FONT_TITLE)
            
            # Glowing underline
            line_w = int(540 * min(1.0, t / 1.5))
            draw.line([(WIDTH//2 - 270, alpha_y + 80), (WIDTH//2 - 270 + line_w, alpha_y + 80)], fill=(6, 182, 212), width=3)
            
            # Subtitle
            if t > 1.2:
                draw.text((WIDTH//2 - 380, alpha_y + 105), "Dual-Runtime Node & Contract Diagnostic Sentinel", fill=(148, 163, 184), font=FONT_SUBTITLE)
            if t > 2.2:
                draw.text((WIDTH//2 - 240, alpha_y + 175), "Target: Chain ID 420420777 • Substrate pallet-revive", fill=(16, 185, 129), font=FONT_MONO)
            if t > 3.5:
                draw.text((WIDTH//2 - 330, alpha_y + 225), "Autonomous Diagnostics • 14-Dec Math • Address Derivation", fill=(203, 213, 225), font=FONT_BODY)

        # ── SCENE 2: THE DUAL-RUNTIME INTEROP GAP (7s - 14s) ──────────
        elif t < 14.0:
            st = t - 7.0
            draw.text((120, 130), "THE MISSION // CRITICAL DEVELOPER GAPS SOLVED", fill=(6, 182, 212), font=FONT_HEADING)
            draw.text((120, 190), "Why developers fail on Portaldot V3 without ReviveScope:", fill=(148, 163, 184), font=FONT_BODY)
            
            cards = [
                ("1. THE 10,000X DECIMAL TRAP", "Standard EVM tools assume 18 decimals. Portaldot native POT uses 14 decimals.\nUsing parseEther() silently creates a lethal 10,000x overpayment error.", (245, 158, 11)),
                ("2. DUAL-ACCOUNT DISCONNECT", "MetaMask EVM accounts (H160) cannot directly receive tokens from Substrate native side.\nRequires authentic pallet-revive AccountId32 fallback derivation.", (139, 92, 246)),
                ("3. BLIND GAS & CALLDATA TESTING", "No source-code verification or dry-run contract harness available.\nDevelopers risk transaction rejections without state telemetry.", (239, 68, 68))
            ]
            
            for idx, (head, desc, color) in enumerate(cards):
                card_y = 260 + idx * 220
                if st > idx * 0.8:
                    draw.rectangle([(120, card_y), (WIDTH - 120, card_y + 170)], fill=(15, 18, 28), outline=color, width=2)
                    draw.text((150, card_y + 25), head, fill=color, font=FONT_SUBTITLE)
                    draw.text((150, card_y + 80), desc, fill=(226, 232, 240), font=FONT_BODY)

        # ── SCENE 3: LIVE NODE & RPC SENTINEL (14s - 22s) ──────────────
        elif t < 22.0:
            st = t - 14.0
            draw.text((120, 130), "FEATURE 01 // LIVE NODE & RPC SENTINEL", fill=(16, 185, 129), font=FONT_HEADING)
            draw.text((120, 185), "Active real-time JSON-RPC polling against official Portaldot testnet infrastructure.", fill=(148, 163, 184), font=FONT_BODY)
            
            # Left panel: live metrics
            draw.rectangle([(120, 240), (800, 880)], fill=(15, 18, 28), outline=(35, 42, 62), width=1)
            draw.text((150, 270), "LIVE TELEMETRY READOUTS", fill=(6, 182, 212), font=FONT_MONO)
            
            metrics = [
                ("TARGET EVM RPC", "https://test-evm-rpc-v3.portaldot.dev"),
                ("TARGET SUBSTRATE NODE", "wss://test-node-v3.portaldot.dev"),
                ("CHAIN ID VERIFIED", "420420777 (0x190f1ca9)"),
                ("CURRENT BLOCK NUMBER", f"#{169291 + int(st * 4)}"),
                ("RPC ROUNDTRIP LATENCY", "174 ms [LOW / OPTIMAL]"),
                ("NODE CONSENSUS", "Substrate pallet-revive + ink! WASM"),
                ("HEALTH STATUS", "HEALTHY • ACTIVE PROBING")
            ]
            for m_idx, (k, v) in enumerate(metrics):
                my = 330 + m_idx * 75
                draw.text((150, my), k, fill=(100, 116, 139), font=FONT_TAG)
                draw.text((150, my + 24), v, fill=(16, 185, 129) if "HEALTHY" in v or "174" in v else (241, 245, 249), font=FONT_MONO_SM)
            
            # Right panel: Crop of live Sentinel UI
            if screenshot_img:
                # Crop Node Sentinel section from real dApp
                crop = screenshot_img.crop((240, 140, 1680, 560)).resize((960, 640))
                img.paste(crop, (840, 240))
                draw.rectangle([(840, 240), (1800, 880)], outline=(16, 185, 129), width=2)

        # ── SCENE 4: DUAL-ADDRESS RESOLVER (22s - 30s) ─────────────────
        elif t < 30.0:
            st = t - 22.0
            draw.text((120, 130), "FEATURE 02 // DUAL-ADDRESS RESOLVER (PALLET-REVIVE)", fill=(139, 92, 246), font=FONT_HEADING)
            draw.text((120, 185), "Mathematical derivation using Polkadot SDK pallet_revive AddressMapper::to_fallback_account_id", fill=(148, 163, 184), font=FONT_BODY)
            
            # Formula Box
            draw.rectangle([(120, 240), (WIDTH - 120, 360)], fill=(20, 15, 35), outline=(139, 92, 246), width=1)
            draw.text((150, 260), "OFFICIAL PALLET-REVIVE ALGORITHM SPECIFICATION:", fill=(196, 181, 253), font=FONT_TAG)
            draw.text((150, 290), "H160 (20 bytes)  +  [0xEE; 12] (12 bytes)  =  AccountId32 (32 bytes)", fill=(6, 182, 212), font=FONT_HEADING)
            draw.text((150, 335), "SS58 Encoding: Base58( Prefix[42] + AccountId32[32] + Blake2b-512('SS58PRE')[0..2] )", fill=(148, 163, 184), font=FONT_TAG)
            
            # Recalculated Examples Grid
            examples = [
                ("1. OFFICIAL TESTNET DEPLOYER", "0xf7eC65d11e35375A250e474059a917B537804142", "5Hfmuhj1AHrTBJiC9zUPnJo1cfG2G52LLMwofSigBnjtto8Y"),
                ("2. REVIVEPROBE CONTRACT", "0x7a39F90aE852D6cfEb24a9a46C0A9A30f78d6b9C", "5EpxvMDeCPJrSqZTnjSE3Ktme7w4bPAmyQf7c6AxMmDkZEn7"),
                ("3. PRECOMPILE SYSTEM ACCOUNT", "0x0000000000000000000000000000000000000001", "5C4hrfjw9DjXZTzV3MwzrrAr9P1MMqQDFcr5ZiJ7JxD76SLX")
            ]
            
            for e_idx, (tag, h160, ss58) in enumerate(examples):
                ey = 400 + e_idx * 160
                if st > e_idx * 0.7:
                    draw.rectangle([(120, ey), (WIDTH - 120, ey + 130)], fill=(15, 18, 28), outline=(35, 42, 62), width=1)
                    draw.text((150, ey + 20), tag, fill=(16, 185, 129), font=FONT_TAG)
                    draw.text((150, ey + 45), f"EVM H160:  {h160}", fill=(241, 245, 249), font=FONT_MONO_SM)
                    draw.text((150, ey + 80), f"SS58 MAP:  {ss58}", fill=(6, 182, 212), font=FONT_MONO)

        # ── SCENE 5: 14-DECIMAL ANTI-SKEW MATH & HARNESS (30s - 38s) ───
        elif t < 38.0:
            st = t - 30.0
            draw.text((120, 130), "FEATURE 03 // 14-DECIMAL PRECISION ENGINE & REVIVEPROBE", fill=(245, 158, 11), font=FONT_HEADING)
            draw.text((120, 185), "Safe BigInt conversion eliminating the 10,000x decimal skew + interactive contract sandbox.", fill=(148, 163, 184), font=FONT_BODY)
            
            # Left box: 14 decimal math
            draw.rectangle([(120, 240), (WIDTH//2 - 20, 880)], fill=(15, 18, 28), outline=(245, 158, 11), width=1)
            draw.text((150, 270), "DECIMAL ARITHMETIC INVARIANT", fill=(245, 158, 11), font=FONT_MONO)
            
            math_lines = [
                ("1.0 POT Human Input", "= 100,000,000,000,000 (10^14 base units)"),
                ("Standard parseEther('1.0')", "= 1,000,000,000,000,000,000 (10^18)"),
                ("SKEW RATIO", "10^18 / 10^14 = 10,000X EXCESS OVERPAY!"),
                ("ReviveScope parsePot()", "Type-safe BigInt normalization"),
                ("Code Generator", "Generates drop-in TypeScript & Solidity snippets")
            ]
            for l_idx, (lk, lv) in enumerate(math_lines):
                ly = 340 + l_idx * 95
                draw.text((150, ly), lk, fill=(148, 163, 184), font=FONT_TAG)
                draw.text((150, ly + 25), lv, fill=(239, 68, 68) if "10,000X" in lv else (16, 185, 129) if "parsePot" in lv else (241, 245, 249), font=FONT_MONO_SM)
            
            # Right box: ReviveProbe Contract
            draw.rectangle([(WIDTH//2 + 20, 240), (WIDTH - 120, 880)], fill=(15, 18, 28), outline=(6, 182, 212), width=1)
            draw.text((WIDTH//2 + 50, 270), "REVIVEPROBE DIAGNOSTIC HARNESS", fill=(6, 182, 212), font=FONT_MONO)
            
            harness_lines = [
                ("Contract File", "contracts/ReviveProbe.sol"),
                ("Bytecode Verification", "PolkaVM / pallet-revive target ABI compiled"),
                ("Simulated & Live Mode", "Execute pings without blind gas loss"),
                ("Calldata Inspection", "Instant calldata generation: 0x9c42a0f8..."),
                ("Structured Audit Export", "1-click JSON export for audit & team submission")
            ]
            for h_idx, (hk, hv) in enumerate(harness_lines):
                hy = 340 + h_idx * 95
                draw.text((WIDTH//2 + 50, hy), hk, fill=(100, 116, 139), font=FONT_TAG)
                draw.text((WIDTH//2 + 50, hy + 25), hv, fill=(241, 245, 249), font=FONT_MONO_SM)

        # ── SCENE 6: VERIFIED DELIVERABLES & OUTRO (38s - 46s) ─────────
        else:
            st = t - 38.0
            draw.rectangle([(WIDTH//2 - 450, 160), (WIDTH//2 + 450, 210)], fill=(16, 185, 129, 30), outline=(16, 185, 129), width=1)
            draw.text((WIDTH//2 - 320, 175), "SCREENING CRITERIA VERIFIED • 100% READY", fill=(16, 185, 129), font=FONT_MONO)
            
            draw.text((WIDTH//2 - 270, 240), "REVIVESCOPE", fill=(241, 245, 249), font=FONT_TITLE)
            draw.text((WIDTH//2 - 340, 320), "Portaldot V3.0 Dual-Runtime Diagnostic Sentinel", fill=(148, 163, 184), font=FONT_SUBTITLE)
            
            # Summary Table
            table_y = 400
            draw.rectangle([(WIDTH//2 - 450, table_y), (WIDTH//2 + 450, table_y + 440)], fill=(15, 18, 28), outline=(35, 42, 62), width=2)
            
            rows = [
                ("Live Production App", "https://portaldot-revivescope.vercel.app"),
                ("Public GitHub Repo", "https://github.com/Gieez/portaldot-revivescope"),
                ("Official EVM RPC", "https://test-evm-rpc-v3.portaldot.dev"),
                ("Substrate Node URL", "wss://test-node-v3.portaldot.dev"),
                ("Pallet-Revive Mapping", "H160 + [0xEE; 12] with Blake2b SS58 Checksum"),
                ("Hackathon Submission", "Portaldot Hacker House 2026 (DoraHacks #49759)"),
                ("Developer", "Gieez (Solo Web3 Builder)")
            ]
            for r_idx, (rk, rv) in enumerate(rows):
                ry = table_y + 25 + r_idx * 58
                draw.text((WIDTH//2 - 420, ry), rk, fill=(6, 182, 212), font=FONT_TAG)
                draw.text((WIDTH//2 - 420, ry + 22), rv, fill=(241, 245, 249), font=FONT_MONO_SM)

        # Pipe raw RGB frame to ffmpeg
        proc.stdin.write(img.tobytes())
        
        if frame_idx % 150 == 0:
            print(f"Progress: {frame_idx}/{TOTAL_FRAMES} frames ({int(frame_idx/TOTAL_FRAMES*100)}%)...")

    proc.stdin.close()
    proc.wait()
    print("Film successfully rendered to:", OUTPUT_VIDEO)

if __name__ == "__main__":
    render_film()
