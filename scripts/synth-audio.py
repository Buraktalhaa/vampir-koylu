"""Vampir Köylü için telifsiz sesler: tamamen kodla sentezlenir (dış örnek/kayıt yok)."""
import math, random, struct, sys, wave, os

SR = 22050
OUT = sys.argv[1]

def note(n):  # MIDI → Hz
    return 440.0 * 2 ** ((n - 69) / 12)

def silence(sec):
    return [0.0] * int(sec * SR)

def add(buf, start, samples, gain=1.0):
    i0 = int(start * SR)
    for i, v in enumerate(samples):
        j = i0 + i
        if j >= len(buf):
            break
        buf[j] += v * gain

def env_adsr(n, a, d, s, r):
    out = []
    A, D, R = int(a * SR), int(d * SR), int(r * SR)
    S = max(0, n - A - D - R)
    for i in range(n):
        if i < A: e = i / max(1, A)
        elif i < A + D: e = 1 - (1 - s) * (i - A) / max(1, D)
        elif i < A + D + S: e = s
        else: e = s * max(0.0, 1 - (i - A - D - S) / max(1, R))
        out.append(e)
    return out

def pad(freqs, dur, gain=0.18):
    """Yumuşak pad: her nota için hafif kaydırılmış 3 sinüs + 2. harmonik, yavaş giriş/çıkış."""
    n = int(dur * SR)
    env = env_adsr(n, dur * 0.35, dur * 0.2, 0.8, dur * 0.4)
    out = [0.0] * n
    for f in freqs:
        for det in (-0.004, 0.0, 0.004):
            w = 2 * math.pi * f * (1 + det) / SR
            w2 = 2 * w
            ph = random.random() * 6.28
            for i in range(n):
                out[i] += (math.sin(ph + w * i) + 0.25 * math.sin(ph + w2 * i)) * env[i]
    k = gain / (len(freqs) * 3)
    return [v * k for v in out]

def pluck(f, dur=1.2, gain=0.3, bright=6):
    """Klavsen/arp benzeri: harmonikler hızla söner."""
    n = int(dur * SR)
    out = [0.0] * n
    for h in range(1, bright + 1):
        w = 2 * math.pi * f * h / SR
        amp = 1 / h
        decay = 3.0 + h * 1.6
        for i in range(n):
            t = i / SR
            out[i] += amp * math.sin(w * i) * math.exp(-decay * t)
    return [v * gain * 0.5 for v in out]

def bell(f, dur=4.0, gain=0.25):
    """Çan: harmonik olmayan kısmi sesler, uzun sönüm."""
    partials = [(1.0, 1.0, 1.1), (2.0, 0.6, 1.6), (2.76, 0.45, 2.2), (5.4, 0.25, 3.5), (8.93, 0.12, 5.0)]
    n = int(dur * SR)
    out = [0.0] * n
    for ratio, amp, decay in partials:
        w = 2 * math.pi * f * ratio / SR
        for i in range(n):
            out[i] += amp * math.sin(w * i) * math.exp(-decay * i / SR)
    return [v * gain * 0.4 for v in out]

def drum(dur=0.9, gain=0.6, f0=110, f1=45):
    """Düşük davul: aşağı kayan sinüs + kısa gürültü."""
    n = int(dur * SR)
    out = []
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = f1 + (f0 - f1) * math.exp(-t * 18)
        ph += 2 * math.pi * f / SR
        body = math.sin(ph) * math.exp(-t * 5.5)
        noise = (random.random() * 2 - 1) * math.exp(-t * 40) * 0.25
        out.append((body + noise) * gain)
    return out

def wind(dur, gain=0.08, seed=1):
    """Rüzgâr: yavaş dalgalanan, alçak geçirgen gürültü."""
    rnd = random.Random(seed)
    n = int(dur * SR)
    out, y, y2 = [], 0.0, 0.0
    for i in range(n):
        t = i / SR
        # Kesim hiçbir zaman sıfırın altına inmemeli: negatif değerde filtre kararsızlaşıp patlar.
        cutoff = max(0.006, 0.02 + 0.015 * math.sin(2 * math.pi * t / 7.3) + 0.01 * math.sin(2 * math.pi * t / 3.1))
        x = rnd.random() * 2 - 1
        y += cutoff * (x - y)
        y2 += cutoff * (y - y2)
        amp = 0.6 + 0.4 * math.sin(2 * math.pi * t / 9.7)
        out.append(y2 * amp * gain * 8)
    return out

def reverb(buf, mix=0.3):
    """Basit Schroeder yankısı: 4 tarak + 2 tüm geçiren filtre."""
    def comb(x, d, g):
        y = [0.0] * len(x)
        for i in range(len(x)):
            y[i] = x[i] + (g * y[i - d] if i >= d else 0.0)
        return y
    def allpass(x, d, g):
        y = [0.0] * len(x)
        for i in range(len(x)):
            xd = x[i - d] if i >= d else 0.0
            yd = y[i - d] if i >= d else 0.0
            y[i] = -g * x[i] + xd + g * yd
        return y
    wet = [0.0] * len(buf)
    for d, g in ((1116, 0.78), (1188, 0.77), (1277, 0.76), (1356, 0.75)):
        c = comb(buf, d, g)
        for i in range(len(buf)):
            wet[i] += c[i] * 0.25
    wet = allpass(allpass(wet, 225, 0.5), 556, 0.5)
    return [b * (1 - mix) + w * mix for b, w in zip(buf, wet)]

def loopify(buf, loop_sec, fade_sec):
    """Kesintisiz döngü: kuyruğu başa karıştırır, dosya tam loop_sec uzunluğunda olur."""
    L, F = int(loop_sec * SR), int(fade_sec * SR)
    out = buf[:L]
    for i in range(F):
        k = i / F
        out[i] = buf[i] * k + buf[L + i] * (1 - k)
    return out

def write(name, buf, peak=0.8):
    m = max(1e-9, max(abs(v) for v in buf))
    data = b''.join(struct.pack('<h', int(max(-1, min(1, v / m * peak)) * 32767)) for v in buf)
    path = os.path.join(OUT, name + '.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)
    print('yazıldı', path, round(len(buf) / SR, 1), 'sn')

random.seed(7)

def howl(dur, gain=0.3, seed=21, center=420, depth=160, period=9.0, floor=0.05):
    """Uğuldayan rüzgâr: rezonanslı bant geçiren filtreden gürültü; merkez frekansı yavaşça kayar, şiddeti dalgalanır."""
    rnd = random.Random(seed)
    n = int(dur * SR)
    out = []
    y1 = y2 = 0.0
    for i in range(n):
        t = i / SR
        # Merkez frekans 220–620 Hz arasında yavaşça süzülür ("vuuuu" iniş-çıkışları)
        fc = center + depth * math.sin(2 * math.pi * t / period) + 60 * math.sin(2 * math.pi * t / 3.7 + 1.3)
        r = 0.985  # yüksek rezonans: ıslık gibi uğultu
        w = 2 * math.pi * fc / SR
        x = rnd.random() * 2 - 1
        y = x * (1 - r) + 2 * r * math.cos(w) * y1 - r * r * y2
        y2, y1 = y1, y
        gust = 0.45 + 0.35 * math.sin(2 * math.pi * t / 6.5) + 0.2 * math.sin(2 * math.pi * t / 2.3 + 0.7)
        out.append(y * max(floor, gust) * gain * 6)
    return out

def glass(f, dur, gain=0.05):
    """Cam gibi tiz, yavaşça yükselip kaybolan ve hafifçe kayan ürkütücü ton."""
    n = int(dur * SR)
    out = []
    ph = 0.0
    for i in range(n):
        t = i / SR
        env = math.sin(math.pi * t / dur) ** 2
        ph += 2 * math.pi * f * (1 + 0.006 * math.sin(2 * math.pi * t / 1.7)) / SR
        out.append((math.sin(ph) + 0.3 * math.sin(2.01 * ph)) * env * gain)
    return out

def thump(dur=0.5, gain=0.4):
    """Uzaktan gelen boğuk vuruş (kalp atışı gibi): alçak, yumuşak, kısa."""
    n = int(dur * SR)
    out = []
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = 55 + 40 * math.exp(-t * 25)
        ph += 2 * math.pi * f / SR
        out.append((math.sin(ph) + 0.4 * math.sin(2 * ph)) * math.exp(-t * 9) * gain)
    return out

# 1) Giriş müziği: karanlık ve rahatsız edici — şiddetli uğuldayan rüzgâr, derin uyumsuz uğultu (Re–Mi♭–La♭),
#    ara ara uzaktan kasvetli piyano notaları ve çok uzak boğuk kalp atışı. Melodi/akor yok. 32 sn döngü.
LOOP, FADE = 32.0, 4.0
menu = silence(LOOP + FADE + 4)
m_len = len(menu)
for f, g in ((note(38), 0.10), (note(39), 0.08), (note(44), 0.06), (note(50), 0.05), (note(51), 0.04)):
    w = 2 * math.pi * f / SR
    for i in range(m_len):
        t = i / SR
        menu[i] += math.sin(w * i) * g * (0.7 + 0.3 * math.sin(2 * math.pi * t / 15.0 + f))
add(menu, 0, howl(LOOP + FADE + 4, gain=0.55, seed=8, center=360, depth=140, period=11.0, floor=0.35))
add(menu, 0, wind(LOOP + FADE + 4, gain=0.12, seed=9))
# Kasvetli piyano: düşük, uyumsuz aralıklar (küçük ikili, tritone), seyrek
for t, notes in ((3.0, [50, 51]), (11.5, [44, 50]), (19.0, [51, 57]), (26.5, [45, 51])):
    for k, n in enumerate(notes):
        add(menu, t + k * 0.35, pluck(note(n), 3.5, gain=0.11, bright=5))
# Uzak kalp atışı: iki vuruş, uzun ara
for t in (6.0, 6.45, 16.0, 16.45, 26.0, 26.45):
    add(menu, t, thump(gain=0.22))
menu = loopify(reverb(menu, 0.5), LOOP, FADE)
write('menu', menu)

# 2) Gece: karanlık ve rahatsız edici — uğuldayan rüzgâr, uyumsuz drone (La–Si♭–Mi♭, birbirini döver),
#    ara ara cam gibi tiz tonlar ve uzak cenaze çanı. Hoş akor/melodi yok. 30 sn döngü.
LOOP, FADE = 30.0, 4.0
night = silence(LOOP + FADE + 4)
n_len = len(night)
for f, g in ((note(45), 0.10), (note(46), 0.08), (note(51), 0.06), (note(57), 0.05), (note(58), 0.045)):
    w = 2 * math.pi * f / SR
    for i in range(n_len):
        t = i / SR
        night[i] += math.sin(w * i) * g * (0.75 + 0.25 * math.sin(2 * math.pi * t / 13.0 + f))
add(night, 0, howl(LOOP + FADE + 4, gain=0.3, seed=21))
add(night, 0, wind(LOOP + FADE + 4, gain=0.12, seed=3))
for t, f in ((4.0, note(87)), (15.0, note(88)), (24.5, note(86))):
    add(night, t, glass(f, 5.5))
for t in (2.0, 12.0, 22.0):
    add(night, t, bell(note(50), 7.0, gain=0.16))
night = loopify(reverb(night, 0.45), LOOP, FADE)
write('night', night)

# --- İnsan sesi taklidi (formant sentezi): gırtlak titreşimi + ağız rezonansları ---
VOWELS = {  # (F1, F2) Hz
    'a': (800, 1250), 'e': (500, 1800), 'ı': (400, 1500), 'i': (300, 2200), 'o': (500, 900), 'u': (330, 850),
}

def _resonator(x, freqs, bws):
    """Zamanla değişen iki kutuplu bant geçiren filtre (formant)."""
    y1 = y2 = 0.0
    out = []
    for i, v in enumerate(x):
        r = math.exp(-math.pi * bws / SR)
        c = 2 * r * math.cos(2 * math.pi * freqs[i] / SR)
        y = (1 - r) * v + c * y1 - r * r * y2
        y2, y1 = y1, y
        out.append(y)
    return out

def voice(dur, f0, rnd, gain=0.1, rate=5.0, breath=0.15, rise=0.0, wobble=0.0, vowels='aeıiou'):
    """Anlaşılmayan konuşma/bağırış: hece hızında değişen ünlüler, perde konturu, nefes."""
    n = int(dur * SR)
    # hece hedefleri
    syll = max(1, int(dur * rate))
    targets = [VOWELS[rnd.choice(vowels)] for _ in range(syll + 1)]
    src, f1s, f2s, env = [], [], [], []
    ph = 0.0
    for i in range(n):
        t = i / SR
        k = t * rate
        j = int(k)
        frac = k - j
        a_, b_ = targets[min(j, syll)], targets[min(j + 1, syll)]
        sm = frac * frac * (3 - 2 * frac)
        f1s.append(a_[0] + (b_[0] - a_[0]) * sm)
        f2s.append(a_[1] + (b_[1] - a_[1]) * sm)
        f = f0 * (1 + rise * t / dur + 0.04 * math.sin(2 * math.pi * 3 * t) + wobble * math.sin(2 * math.pi * 7 * t))
        ph = (ph + f / SR) % 1.0
        glott = (2 * ph - 1) * 0.6 + (rnd.random() * 2 - 1) * breath
        # hece zarfı: her hecede açılıp kapanır, uç yumuşatılır
        syl_env = math.sin(math.pi * frac) ** 0.6
        edge = min(1.0, t / 0.05, (dur - t) / 0.08)
        src.append(glott)
        env.append(syl_env * max(0.0, edge))
    o1 = _resonator(src, f1s, 90)
    o2 = _resonator(src, f2s, 130)
    return [(p + 0.6 * q) * e * gain * 4 for p, q, e in zip(o1, o2, env)]

def glass_break(gain=0.35, seed=4):
    """Cam kırılması: tiz gürültü patlaması + düşen şıngırtılar."""
    rnd = random.Random(seed)
    n = int(1.6 * SR)
    out = [0.0] * n
    hp_prev = 0.0
    for i in range(int(0.12 * SR)):
        x = rnd.random() * 2 - 1
        h = x - hp_prev  # kaba yüksek geçiren
        hp_prev = x
        out[i] += h * math.exp(-i / SR * 30) * 0.8
    for _ in range(14):
        t0 = rnd.uniform(0.0, 0.9)
        f = rnd.uniform(2500, 7000)
        d = rnd.uniform(4, 12)
        w = 2 * math.pi * f / SR
        i0 = int(t0 * SR)
        for i in range(i0, min(n, i0 + int(0.5 * SR))):
            out[i] += math.sin(w * (i - i0)) * math.exp(-(i - i0) / SR * d) * 0.25
    return [v * gain for v in out]

def sob(rnd, gain=0.08):
    """Uzaktan ağlama: kesik hıçkırıklar (titrek, yüksek perde) + iç çekme nefesi."""
    parts = []
    t = 0.0
    out = [0.0] * int(3.2 * SR)
    for k in range(4):
        d = rnd.uniform(0.25, 0.45)
        seg = voice(d, rnd.uniform(330, 420), rnd, gain=gain, rate=2.5, breath=0.35, rise=-0.25, wobble=0.06, vowels='uıa')
        i0 = int(t * SR)
        for i, v in enumerate(seg):
            if i0 + i < len(out):
                out[i0 + i] += v
        t += d + rnd.uniform(0.12, 0.25)
    # iç çekme (nefes): kısa yükselen gürültü
    i0 = int(min(t, 2.6) * SR)
    for i in range(int(0.4 * SR)):
        if i0 + i < len(out):
            out[i0 + i] += (rnd.random() * 2 - 1) * math.sin(math.pi * i / (0.4 * SR)) * gain * 0.5
    return out

# 3) Gündüz (sabah → tartışma → oylama): köy meydanında gergin tartışma — anlaşılmayan kalabalık uğultusu,
#    ara ara bağırışlar, bir cam kırılması, uzaktan ağlama ve altta gergin alçak uğultu. 30 sn döngü.
LOOP, FADE = 30.0, 3.0
day = silence(LOOP + FADE + 4)
total = LOOP + FADE + 4
rnd_d = random.Random(31)
# gergin taban uğultusu
for f, g in ((note(40), 0.05), (note(41), 0.04)):
    w = 2 * math.pi * f / SR
    for i in range(len(day)):
        day[i] += math.sin(w * i) * g
# kalabalık: 8 ses, her biri cümle cümle konuşur
for v in range(8):
    f0 = rnd_d.choice([95, 110, 120, 135, 160, 185, 210, 230])
    t = rnd_d.uniform(0, 1.5)
    while t < total - 2:
        d = rnd_d.uniform(1.2, 3.2)
        add(day, t, voice(d, f0 * rnd_d.uniform(0.92, 1.08), rnd_d, gain=0.05, rate=rnd_d.uniform(4.5, 6.5), rise=rnd_d.uniform(-0.15, 0.2)))
        t += d + rnd_d.uniform(0.3, 1.8)
# bağırışlar
for t in (4.5, 13.0, 21.5, 27.0):
    add(day, t, voice(0.7, rnd_d.uniform(230, 300), rnd_d, gain=0.16, rate=3.0, breath=0.25, rise=0.25, vowels='aeo'))
# cam kırılması
add(day, 17.0, glass_break(gain=0.3))
# uzaktan ağlama
add(day, 8.0, sob(rnd_d))
add(day, 24.0, sob(rnd_d))
day = loopify(reverb(day, 0.3), LOOP, FADE)
write('day', day)

# 4) Oylama: iki ağır davul + karanlık çan akoru (kısa vurgu, döngü değil).
vote = silence(3.2)
add(vote, 0.0, drum(1.0, 0.7))
add(vote, 0.42, drum(1.0, 0.8, f0=100, f1=40))
for n in (45, 48, 52):
    add(vote, 0.85, bell(note(n + 12), 2.3, gain=0.2))
vote = reverb(vote, 0.25)
write('vote', vote, peak=0.9)
