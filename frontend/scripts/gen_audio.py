import numpy as np, wave, os, struct

SR = 22050
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")
os.makedirs(OUT, exist_ok=True)

def env(n, a=0.01, d=0.2):
    e = np.ones(n)
    ai = int(a * SR); di = int(d * SR)
    if ai > 0: e[:ai] = np.linspace(0, 1, ai)
    if di > 0: e[-di:] = np.linspace(1, 0, di)
    return e

def tone(freq, dur, vol=0.5, a=0.01, d=None):
    n = int(dur * SR)
    if d is None: d = min(0.15, dur * 0.6)
    t = np.arange(n) / SR
    w = np.sin(2 * np.pi * freq * t)
    # a touch of a soft square-ish harmonic for character
    w += 0.15 * np.sin(2 * np.pi * freq * 2 * t)
    return (w * env(n, a, d) * vol).astype(np.float32)

def slide(f0, f1, dur, vol=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    freq = np.linspace(f0, f1, n)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return (np.sin(ph) * env(n, 0.01, dur * 0.5) * vol).astype(np.float32)

def write(name, sig):
    sig = np.clip(sig, -1, 1)
    pcm = (sig * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", name, len(pcm))

def concat(*parts):
    return np.concatenate(parts).astype(np.float32)

def mix_at(buf, sig, start):
    i = int(start * SR)
    end = min(len(buf), i + len(sig))
    buf[i:end] += sig[: end - i]

# ---- SFX ----
write("flap.wav", concat(tone(320, 0.05, 0.28, d=0.04), tone(440, 0.05, 0.22, d=0.045)))
write("coin.wav", concat(tone(988, 0.06, 0.42, d=0.05), tone(1319, 0.10, 0.42, d=0.09)))
write("power.wav", concat(tone(523, 0.07, 0.4), tone(659, 0.07, 0.4), tone(784, 0.07, 0.4), tone(1047, 0.16, 0.45)))
write("star.wav", concat(tone(1568, 0.06, 0.4), tone(2093, 0.12, 0.4)))
write("die.wav", slide(440, 120, 0.55, 0.55))

# ---- Original 3/4 waltz loop ----
BPM = 150
beat = 60.0 / BPM            # 0.4s
measure = beat * 3           # 1.2s
n_meas = 8
total = int(measure * n_meas * SR) + SR // 4
buf = np.zeros(total, dtype=np.float32)

def note(freq):  # semitone offset from A4=440 not used; freqs given directly
    return freq

# note table (Hz)
N = {"C3":130.81,"D3":146.83,"E3":164.81,"F3":174.61,"G3":196.00,"A3":220.00,
     "C4":261.63,"D4":293.66,"E4":329.63,"F4":349.23,"G4":392.00,"A4":440.00,
     "B3":246.94,"C5":523.25,"D5":587.33,"E5":659.25}

# generic I-V-vi-IV style roots (chord progressions are not copyrightable);
# original melody motif written for this game.
roots = ["C3","G3","A3","F3","C3","G3","F3","G3"]
chord3 = {"C3":("E3","G3"),"G3":("B3","D4"),"A3":("C4","E4"),"F3":("A3","C4")}
melody = [  # (note, beat_in_measure) per measure — an original, gentle line
 [("E4",0),("G4",1),("C5",2)],
 [("D4",0),("G4",1),("B3",2)],
 [("E4",0),("A4",1),("C5",2)],
 [("F4",0),("A4",1),("D5",2)],
 [("E4",0),("G4",1),("E5",2)],
 [("D4",0),("G4",1),("D5",2)],
 [("C4",0),("F4",1),("A4",2)],
 [("D4",0),("G4",1),("B3",2)],
]

for m in range(n_meas):
    base = m * measure
    root = roots[m]
    # beat 1: bass root (oom)
    mix_at(buf, tone(N[root], beat*0.9, 0.32, a=0.005, d=beat*0.5), base)
    # beats 2 & 3: light chord (pah pah)
    a, b = chord3[root]
    for k in (1, 2):
        ch = tone(N[a], beat*0.55, 0.14, a=0.005, d=beat*0.35) + tone(N[b], beat*0.55, 0.14, a=0.005, d=beat*0.35)
        mix_at(buf, ch, base + k*beat)
    # melody
    for nm, bt in melody[m]:
        mix_at(buf, tone(N[nm], beat*0.8, 0.22, a=0.01, d=beat*0.5), base + bt*beat)

# gentle normalize
peak = np.max(np.abs(buf)) or 1.0
buf = buf / peak * 0.85
write("music.wav", buf)
print("done")
