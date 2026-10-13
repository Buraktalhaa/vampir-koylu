"""
Gündüz sesi (assets/audio/day.m4a): gerçek CC0 kalabalık kayıtlarından 40 sn'lik kesintisiz döngü.

Kaynaklar (ikisi de Creative Commons 0 — bkz. assets/audio/LICENSES.md):
  1) kyles — "crowd ext medium loud walla Cuban men shouting arguing…" https://freesound.org/people/kyles/sounds/362088/
  2) craigsmith — "R08-29-Group of People with Man Yelling" https://freesound.org/people/craigsmith/sounds/480726/

Kullanım:
  afconvert -f WAVE -d LEI16@22050 -c 1 <kaynak>.mp3 <kaynak>.wav   (her iki kayıt için)
  python3 scripts/build-day-audio.py kalabalik.wav bagiris.wav scripts/synth-audio.py day.wav
  afconvert -f m4af -d aac -b 64000 -s 0 day.wav assets/audio/day.m4a
"""
import sys, wave, struct, math, random, importlib.util
crowd_path, yell_path, synth_path, out_path = sys.argv[1:5]
SR = 22050
def read(p):
    w = wave.open(p); d = w.readframes(w.getnframes())
    return [x / 32768 for x in struct.unpack('<%dh' % (len(d) // 2), d)]
crowd, yell = read(crowd_path), read(yell_path)

def rms(xs): return math.sqrt(sum(x * x for x in xs) / max(1, len(xs)))
def best_window(xs, sec):
    per = [rms(xs[i:i + SR]) for i in range(0, len(xs) - SR, SR)]
    n = int(sec)
    best = max(range(len(per) - n), key=lambda i: sum(per[i:i + n]))
    return best * SR

LOOP, FADE = 40.0, 3.0
start = best_window(crowd, LOOP + FADE)
base = crowd[start:start + int((LOOP + FADE) * SR)]
# bağırış: en yüksek 5 sn
ys = best_window(yell, 5)
shout = yell[ys:ys + 5 * SR]

# sentez yardımcıları (cam kırılması, drone) proje betiğinden
spec = importlib.util.spec_from_file_location('synth', synth_path)
src = open(synth_path).read().split('random.seed(7)')[0]
ns = {'__name__': 'synth'}; sys.argv = ['x', '/tmp']; exec(src + open(synth_path).read().split('# --- İnsan sesi taklidi')[1].split('# 3) Gündüz')[0].replace('(formant sentezi): gırtlak titreşimi + ağız rezonansları ---', ''), ns)
glass = ns['glass_break'](gain=0.35)

def add(buf, t, xs, g):
    i0 = int(t * SR)
    for i, v in enumerate(xs):
        if i0 + i < len(buf): buf[i0 + i] += v * g

mix = [v * 0.9 for v in base]
add(mix, 9.0, shout, 0.55)
add(mix, 28.0, shout, 0.45)  # ikinci bağırış biraz daha uzakta
add(mix, 19.0, glass, 1.0)
for f, g in ((82.4, 0.03), (87.3, 0.025)):  # gergin alçak uğultu
    w = 2 * math.pi * f / SR
    for i in range(len(mix)): mix[i] += math.sin(w * i) * g

# kesintisiz döngü
L, F = int(LOOP * SR), int(FADE * SR)
out = mix[:L]
for i in range(F):
    k = i / F
    out[i] = mix[i] * k + mix[L + i] * (1 - k)
m = max(abs(v) for v in out)
data = b''.join(struct.pack('<h', int(max(-1, min(1, v / m * 0.85)) * 32767)) for v in out)
with wave.open(out_path, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)
print('kalabalık bölümü:', round(start / SR, 1), 'sn; bağırış:', round(ys / SR, 1), 'sn; çıktı', round(len(out) / SR, 1), 'sn')
