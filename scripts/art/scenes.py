#!/usr/bin/env python3
"""Vampir Köylü — Gölge Kukla sahne üreteci (backdrops/ ve moments/).
Kurallar: yalnız path/circle/ellipse/rect/polygon/g/linearGradient/radialGradient.
"""
import os, sys, random, math, re
sys.path.insert(0, os.path.dirname(__file__))
from portraits import f, circ, almond, diamond, star4, slot, S, C, ring, CH, large_svg, SIL, BRASS, GLOW

W, H = 390, 844
X0, X1 = -48, 438          # paralaks için taşma payı

NIGHT = dict(sky=[("#4A3A78", 0), ("#2A2050", .45), ("#0E0A1C", 1)], far="#2A2150", mid="#171030",
             near=SIL, win="#F6C27A", mist="#8C7FC0")
DAY = dict(sky=[("#F8CF8C", 0), ("#E08A3C", .42), ("#6A2D10", .78), ("#1A0D07", 1)], far="#B5602A", mid="#5A2610",
           near=SIL, win="#F8CF8C", mist="#FFE0B0")

# ---------- geometri ----------
def area(pts):
    return sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts))) / 2

def poly(pts):
    """Saat yönünde (ekran koordinatı) kapalı yol; aynı path'te birleşimler delik açmaz."""
    if area(pts) < 0:
        pts = pts[::-1]
    return "M" + "L".join(f"{f(x)} {f(y)}" for x, y in pts) + "Z"

def path(d, fill, extra=""):
    return f'<path fill="{fill}" d="{d}"{extra}/>'

def ground(y_left, y_right, base=H + 10, bumps=(), x0=X0, x1=X1):
    # üst kenar soldan sağa eğri, sonra aşağı ve geri
    d = f"M{x0} {y_left}"
    pts = list(bumps)
    if pts:
        for (cx, cy, x, y) in pts:
            d += f"Q{cx} {cy} {x} {y}"
    d += f"L{x1} {y_right}L{x1} {base}L{x0} {base}Z"
    return d

def house(x, base, w, h, roof=0.55, chimney=None):
    rh = w * roof
    pts = [(x, base), (x, base - h), (x + w / 2, base - h - rh), (x + w, base - h), (x + w, base)]
    d = poly(pts)
    if chimney:
        cx = x + w * chimney
        top = base - h - rh * 0.55 - 14
        d += poly([(cx, base - h - rh * 0.2), (cx, top), (cx + 8, top), (cx + 8, base - h - rh * 0.35)])
    return d

def windows(x, base, w, h, n=1, seed=0, lit=0.6):
    r = random.Random(seed)
    out = []
    for i in range(n):
        if r.random() > lit:
            continue
        wx = x + w * (i + 1) / (n + 1) - 3.5
        wy = base - h * 0.62
        out.append((wx, wy, 7, 9))
    return out

def village_row(seed, x0, x1, base, hmin, hmax, wmin, wmax, lit=0.5, chimneys=True):
    r = random.Random(seed)
    d, wins, x = "", [], x0
    while x < x1:
        w = r.uniform(wmin, wmax); h = r.uniform(hmin, hmax)
        roof = r.choice([0.45, 0.55, 0.7, 0.9])
        d += house(x, base + r.uniform(-4, 4), w, h, roof, r.choice([None, 0.25, 0.7]) if chimneys else None)
        wins += windows(x, base, w, h, n=max(1, int(w // 22)), seed=seed * 31 + int(x), lit=lit)
        x += w + r.uniform(-6, 4)
    return d, wins

def spire(x, base, w, h, sh):
    # kilise kulesi + sivri çatı + haç
    d = poly([(x, base), (x, base - h), (x + w / 2, base - h - sh), (x + w, base - h), (x + w, base)])
    cx, top = x + w / 2, base - h - sh
    d += poly([(cx - 1.5, top + 2), (cx - 1.5, top - 14), (cx + 1.5, top - 14), (cx + 1.5, top + 2)])
    d += poly([(cx - 6, top - 9), (cx - 6, top - 6), (cx + 6, top - 6), (cx + 6, top - 9)])
    return d

def crenel(x, top, w, n):
    pts, step = [], w / (2 * n - 1)
    pts.append((x, top))
    for i in range(2 * n - 1):
        xx = x + i * step
        if i % 2 == 0:
            pts += [(xx, top - 7), (xx + step, top - 7)]
        else:
            pts += [(xx, top), (xx + step, top)]
    pts.append((x + w, top))
    return pts

def tower(x, base, w, h, cone=True):
    if cone:
        return poly([(x, base), (x, base - h), (x - 3, base - h), (x + w / 2, base - h - w * 1.3), (x + w + 3, base - h), (x + w, base - h), (x + w, base)])
    pts = [(x, base)] + crenel(x, base - h, w, 3) + [(x + w, base)]
    return poly(pts)

def castle(cx, base, s=1.0):
    d = ""
    def T(v): return v * s
    d += poly([(cx - T(60), base), (cx - T(60), base - T(70))] + crenel(cx - T(60), base - T(70), T(120), 6)[1:-1] + [(cx + T(60), base - T(70)), (cx + T(60), base)])
    d += tower(cx - T(84), base, T(26), T(110))
    d += tower(cx + T(58), base, T(26), T(124))
    d += tower(cx - T(18), base - T(60), T(36), T(80))
    d += tower(cx + T(26), base - T(60), T(16), T(56))
    d += tower(cx - T(44), base - T(60), T(14), T(40), cone=False)
    wins = [(cx - T(74), base - T(80), T(5), T(9)), (cx + T(67), base - T(96), T(5), T(9)), (cx - T(4), base - T(118), T(6), T(10)),
            (cx + T(30), base - T(100), T(4), T(8)), (cx - T(30), base - T(40), T(6), T(9))]
    return d, wins

def pine(x, base, w, h):
    d = ""
    tiers = 4
    for i in range(tiers):
        tw = w * (1 - i * 0.2); ty = base - h * i / tiers * 0.85
        d += poly([(x - tw / 2, ty), (x, ty - h * 0.42), (x + tw / 2, ty)])
    d += poly([(x - 2.5, base + 4), (x - 2.5, base - 6), (x + 2.5, base - 6), (x + 2.5, base + 4)])
    return d

def pine_row(seed, x0, x1, base, hmin, hmax):
    r = random.Random(seed); d = ""; x = x0
    while x < x1:
        h = r.uniform(hmin, hmax); d += pine(x, base + r.uniform(-3, 3), h * 0.5, h); x += h * r.uniform(0.22, 0.4)
    return d

def bare_tree(x, base, h, seed=1, lean=0.0, w0=None):
    """Çıplak ağaç: kalın gövde path'i + dal çizgileri (stroke)."""
    r = random.Random(seed)
    w0 = w0 or h * 0.09
    trunk = poly([(x - w0, base + 6), (x - w0 * 0.55 + lean * h * 0.3, base - h * 0.55), (x + w0 * 0.45 + lean * h * 0.3, base - h * 0.55), (x + w0, base + 6)])
    strokes = []
    def branch(px, py, ang, ln, wd, depth):
        if depth == 0 or ln < 6:
            return
        nx, ny = px + math.cos(ang) * ln, py - math.sin(ang) * ln
        mx, my = (px + nx) / 2 + r.uniform(-ln, ln) * 0.15, (py + ny) / 2 + r.uniform(-ln, ln) * 0.15
        strokes.append((f"M{f(px)} {f(py)}Q{f(mx)} {f(my)} {f(nx)} {f(ny)}", wd))
        for k in range(r.choice([2, 2, 3])):
            branch(nx, ny, ang + r.uniform(-0.7, 0.7), ln * r.uniform(0.55, 0.75), max(1.2, wd * 0.6), depth - 1)
    sx, sy = x + lean * h * 0.3, base - h * 0.55
    branch(sx, sy, math.pi / 2 + lean, h * 0.3, w0 * 0.9, 4)
    branch(sx, sy + 10, math.pi / 2 + 0.7 + lean, h * 0.26, w0 * 0.7, 4)
    branch(sx, sy + 16, math.pi / 2 - 0.75 + lean, h * 0.26, w0 * 0.7, 4)
    return trunk, strokes

def tree_svg(x, base, h, seed, color, lean=0.0, w0=None):
    trunk, strokes = bare_tree(x, base, h, seed, lean, w0)
    out = path(trunk, color)
    by_w = {}
    for d, w in strokes:
        by_w.setdefault(round(w, 1), []).append(d)
    for w, ds in sorted(by_w.items(), reverse=True):
        out += f'<path fill="none" stroke="{color}" stroke-width="{f(w)}" stroke-linecap="round" d="{"".join(ds)}"/>'
    return out

def grave(x, base, kind, s=1.0):
    if kind == "round":
        return f"M{f(x)} {f(base)}V{f(base-22*s)}A{f(9*s)} {f(9*s)} 0 0 1 {f(x+18*s)} {f(base-22*s)}V{f(base)}Z"
    if kind == "cross":
        return poly([(x + 6 * s, base), (x + 6 * s, base - 18 * s), (x, base - 18 * s), (x, base - 24 * s), (x + 6 * s, base - 24 * s),
                     (x + 6 * s, base - 34 * s), (x + 12 * s, base - 34 * s), (x + 12 * s, base - 24 * s), (x + 18 * s, base - 24 * s),
                     (x + 18 * s, base - 18 * s), (x + 12 * s, base - 18 * s), (x + 12 * s, base)])
    return poly([(x, base), (x + 2 * s, base - 26 * s), (x + 9 * s, base - 31 * s), (x + 16 * s, base - 26 * s), (x + 18 * s, base)])

def fence(x0, x1, base, h=26, step=12, spikes=True):
    d = poly([(x0, base - h * 0.75), (x1, base - h * 0.75), (x1, base - h * 0.75 + 3), (x0, base - h * 0.75 + 3)])
    d += poly([(x0, base - h * 0.3), (x1, base - h * 0.3), (x1, base - h * 0.3 + 3), (x0, base - h * 0.3 + 3)])
    x = x0
    while x <= x1:
        top = base - h - (6 if spikes else 0)
        d += poly([(x, base + 4), (x, base - h), (x + 1.5, top), (x + 3, base - h), (x + 3, base + 4)])
        x += step
    return d

def bat(x, y, s=1.0):
    pts = [(-12, 0), (-8, -4), (-5, -2), (-3, -6), (-1, -3), (0, -5), (1, -3), (3, -6), (5, -2), (8, -4), (12, 0), (7, 1), (4, 3), (2, 2), (0, 5), (-2, 2), (-4, 3), (-7, 1)]
    return poly([(x + px * s, y + py * s) for px, py in pts])

def crowd(seed, x0, x1, base, hmin=40, hmax=58, props=True):
    """Kalabalık: baş + omuz kümeleri, bazılarında dirgen/meşale."""
    r = random.Random(seed); d = ""; strokes = []; flames = []
    x = x0
    while x < x1:
        h = r.uniform(hmin, hmax); hr = h * 0.17
        d += poly([(x - h * 0.32, base + 10), (x - h * 0.3, base - h * 0.45), (x - h * 0.1, base - h * 0.62), (x + h * 0.12, base - h * 0.62), (x + h * 0.3, base - h * 0.45), (x + h * 0.32, base + 10)])
        hx, hy = x + r.uniform(-2, 2), base - h * 0.62 - hr * 0.9
        d += f"M{f(hx-hr)} {f(hy)}a{f(hr)} {f(hr)} 0 1 1 {f(2*hr)} 0a{f(hr)} {f(hr)} 0 1 1 {f(-2*hr)} 0Z"
        if r.random() < 0.28:
            d += poly([(hx - hr * 1.3, hy - hr * 0.5), (hx + hr * 1.3, hy - hr * 0.5), (hx + hr * 0.8, hy - hr * 1.4), (hx - hr * 0.8, hy - hr * 1.4)])
        if props and r.random() < 0.35:
            px = x + h * 0.3
            kind = r.choice(["fork", "torch"])
            strokes.append(f"M{f(px)} {f(base - h * 0.3)}L{f(px + 4)} {f(base - h * 1.35)}")
            if kind == "fork":
                tx, ty = px + 4, base - h * 1.35
                strokes.append(f"M{f(tx-6)} {f(ty)}H{f(tx+6)}M{f(tx-6)} {f(ty)}V{f(ty-10)}M{f(tx)} {f(ty)}V{f(ty-12)}M{f(tx+6)} {f(ty)}V{f(ty-10)}")
            else:
                flames.append((px + 4, base - h * 1.35))
        x += h * r.uniform(0.42, 0.6)
    return d, strokes, flames

def flame(x, y, s=1.0, color="#F8CF8C"):
    return path(f"M{f(x)} {f(y-14*s)}C{f(x+6*s)} {f(y-6*s)} {f(x+6*s)} {f(y)} {f(x)} {f(y+2*s)}C{f(x-6*s)} {f(y)} {f(x-6*s)} {f(y-6*s)} {f(x)} {f(y-14*s)}Z", color)

def moon(x, y, r, color="#F3D9A0", halo=True, sky="#2A2050"):
    out = ""
    if halo:
        out += C(x, y, r * 2.4, color, ' opacity=".06"') + C(x, y, r * 1.6, color, ' opacity=".1"')
    out += C(x, y, r, color)
    return out

def stars(seed, n, y1=360):
    r = random.Random(seed); out = []
    for _ in range(n):
        out.append(C(r.uniform(10, W - 10), r.uniform(20, y1), r.uniform(0.6, 1.6), "#F3E2C4", f' opacity="{r.uniform(.35,.85):.2f}"'))
    return "".join(out)

def wins_svg(wins, color, extra=""):
    if not wins: return ""
    d = "".join(poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)]) for x, y, w, h in wins)
    return path(d, color, extra)

# ---------- çerçeve ----------
def sky_defs(pal, gid="sky", cx=195, cy=300, r=640):
    stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for c, o in pal["sky"])
    return (f'<radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}" gradientUnits="userSpaceOnUse">{stops}</radialGradient>'
            f'<linearGradient id="shade" x1="0" y1="0" x2="0" y2="{H}" gradientUnits="userSpaceOnUse">'
            f'<stop offset="0" stop-color="#0B0705" stop-opacity="0"/><stop offset=".5" stop-color="#0B0705" stop-opacity="0"/>'
            f'<stop offset=".6" stop-color="#0B0705" stop-opacity=".9"/><stop offset="1" stop-color="#0B0705"/></linearGradient>'
            f'<radialGradient id="vignette" cx="195" cy="330" r="560" gradientUnits="userSpaceOnUse">'
            f'<stop offset=".55" stop-color="#0B0705" stop-opacity="0"/><stop offset="1" stop-color="#0B0705" stop-opacity=".75"/></radialGradient>')

def mist_defs(color):
    return (f'<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{color}" stop-opacity="0"/>'
            f'<stop offset=".5" stop-color="{color}" stop-opacity=".16"/><stop offset="1" stop-color="{color}" stop-opacity="0"/></linearGradient>')

def scene(name, pal, sky_extra, far, mid, near, extra_defs="", note="", after_near=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">'
            f'<!-- {name} · Vampir Köylü gölge kukla sahnesi · paralaks: far 0.2, mid 0.5, near 1.0 (katmanlar x {X0}…{X1} taşar) {note} -->'
            f'<defs>{sky_defs(pal)}{extra_defs}</defs>'
            f'<rect id="sky" width="{W}" height="{H}" fill="url(#sky)"/>'
            f'{sky_extra}'
            f'<g id="far">{far}</g><g id="mid">{mid}</g><g id="near">{near}</g>{after_near}'
            f'<rect id="vignette" width="{W}" height="{H}" fill="url(#vignette)"/>'
            f'<rect id="shade" width="{W}" height="{H}" fill="url(#shade)"/></svg>\n')

# ---------- portre gömme ----------
TEAMC = {"village": "#E6C34A", "vampire": "#C8392B", "neutral": "#36A57C"}
def portrait_inner(cid, prefix, team_color=None):
    ch = next(c for c in CH if c["id"] == cid)
    s = large_svg(ch)
    s = re.sub(r"^<svg[^>]*>", "", s.strip()); s = s[:-6] if s.endswith("</svg>") else s
    s = re.sub(r"<!--.*?-->", "", s)
    s = re.sub(r'id="([a-zA-Z]+)"', lambda m: f'id="{prefix}-{m.group(1)}"', s)
    if team_color:
        s = s.replace("#TEAM", team_color)
    return s

def puppet(cid, x, y, s, prefix, team_color=None, flip=False, rod=True):
    """Portreyi büst olarak sahneye yerleştirir (240×320 → ölçek s)."""
    inner = portrait_inner(cid, prefix, team_color)
    if flip:
        tr = f"matrix({f(-s)} 0 0 {f(s)} {f(x + 240 * s)} {f(y)})"
    else:
        tr = f"matrix({f(s)} 0 0 {f(s)} {f(x)} {f(y)})"
    return f'<g id="{prefix}" transform="{tr}">{inner}</g>'

# ---------- sahneler ----------
def bd_menu():
    p = DAY
    far = path(ground(392, 386, bumps=[(60, 350, 130, 372), (200, 396, 280, 360), (340, 330, 438, 368)]), p["far"])
    cd, cw = castle(300, 352, 0.62)
    far += path(cd, p["far"])
    vd, vw = village_row(11, X0, X1, 452, 26, 46, 30, 52, lit=0.5)
    mid = path(ground(450, 446, bumps=[(195, 436, 438, 448)]) + vd + spire(170, 452, 24, 70, 54), p["mid"])
    mid += wins_svg(vw, "#E8A050", ' opacity=".8"')
    near = path(ground(492, 488, bumps=[(120, 478, 230, 486), (330, 494, 438, 486)]), p["near"])
    near += puppet("villager", -26, 300, 0.74, "pv", "#E6C34A")
    near += puppet("vampire", 238, 300, 0.74, "pz", "#C8392B", flip=True)
    sky = C(195, 210, 160, "#FFF1C8", ' opacity=".12"') + C(195, 210, 90, "#FFF1C8", ' opacity=".12"')
    return scene("menu", p, sky, far, mid, near, note="· portreler: köylü ve vampir (sabit renkli kakma)")

def bd_night1():
    p = NIGHT
    sky = stars(1, 60) + moon(290, 150, 34)
    far = path(ground(400, 380, bumps=[(80, 350, 170, 378), (260, 404, 438, 360)]) + spire(70, 384, 18, 40, 40), p["far"])
    vd, vw = village_row(21, X0, X1, 462, 30, 58, 34, 60, lit=0.55)
    mid = path(ground(460, 458) + vd, p["mid"]) + wins_svg(vw, p["win"], ' opacity=".85"')
    nd = house(-40, 520, 90, 90, 0.8, 0.3) + house(330, 520, 110, 80, 0.6, 0.7)
    nd += fence(60, 330, 520, 24, 11)
    near = path(ground(516, 516) + nd, p["near"]) + wins_svg([(0, 462, 10, 14), (370, 470, 10, 14)], p["win"])
    near += S("M300 520V404M300 404h-14", 4, SIL) + ring(286, 412, 7, 3, SIL, "#F6C27A")
    return scene("night-1 · köy", p, sky, far, mid, near)

def bd_night2():
    p = NIGHT
    sky = stars(2, 70) + moon(110, 170, 46)
    far = path(ground(380, 400, bumps=[(20, 300, 70, 340), (110, 290, 150, 350), (200, 280, 250, 330), (330, 300, 438, 360)]), p["far"])
    cd, cw = castle(250, 398, 1.15)
    mid = path(ground(470, 450, bumps=[(150, 440, 250, 398), (330, 400, 438, 430)]) + cd, p["mid"]) + wins_svg(cw, p["win"], ' opacity=".9"')
    bats = "".join(path(bat(x, y, s), SIL) for x, y, s in [(90, 230, 1.4), (130, 200, 1.0), (160, 250, 0.9), (320, 160, 1.2), (60, 290, 0.8)])
    t1 = tree_svg(30, 540, 210, 7, SIL, lean=0.15)
    t2 = tree_svg(372, 540, 170, 9, SIL, lean=-0.2)
    near = path(ground(530, 520, bumps=[(200, 506, 438, 528)]), p["near"]) + t1 + t2
    return scene("night-2 · şato", p, sky, far, mid, near, after_near=f'<g id="bats"><!-- pivot: kanat çırpma, her yarasa kendi merkezinde scaleY 1→.5 -->{bats}</g>')

def bd_night3():
    p = NIGHT
    sky = stars(3, 50) + moon(300, 130, 30)
    far = path(ground(410, 400, bumps=[(130, 380, 240, 404)]) + spire(40, 410, 40, 60, 70) + house(70, 410, 60, 40, 0.5), p["far"])
    r = random.Random(4); gd = ""
    for i in range(14):
        x = -30 + i * 34 + r.uniform(-6, 6)
        gd += grave(x, 470 + r.uniform(-4, 6), r.choice(["round", "cross", "tall"]), r.uniform(0.8, 1.1))
    mid = path(ground(468, 470) + gd + fence(X0, X1, 476, 30, 9), p["mid"])
    gn = grave(250, 540, "cross", 2.0) + grave(320, 548, "round", 1.8) + grave(-10, 548, "tall", 1.7)
    near = path(ground(536, 540, bumps=[(200, 528, 438, 540)]) + gn, p["near"]) + tree_svg(70, 545, 260, 13, SIL, lean=0.12)
    mist = f'<rect x="{X0}" y="430" width="{X1-X0}" height="120" fill="url(#mist)"/>'
    return scene("night-3 · mezarlık", p, sky, far, mid, near, mist_defs(p["mist"]), after_near=f'<g id="mist">{mist}</g>')

def bd_night4():
    p = NIGHT
    sky = stars(5, 40, 260) + moon(200, 120, 26)
    far = path(ground(400, 400) + pine_row(31, X0, X1, 400, 70, 120), p["far"])
    mid = path(ground(470, 470) + pine_row(32, X0, X1, 474, 110, 170), p["mid"])
    owl = (poly([(304, 360), (300, 336), (306, 326), (310, 332), (318, 332), (322, 326), (328, 336), (324, 360)]))
    near = path(ground(532, 526), p["near"]) + tree_svg(14, 560, 420, 41, SIL, lean=0.05, w0=26) + tree_svg(380, 560, 380, 43, SIL, lean=-0.08, w0=24)
    near += path(poly([(240, 368), (438, 352), (438, 360), (244, 374)]) + owl, SIL)
    near += path(almond(311, 340, 3, 2) + almond(320, 340, 3, 2), "#F6C27A")
    mist = f'<rect x="{X0}" y="440" width="{X1-X0}" height="110" fill="url(#mist)"/>'
    return scene("night-4 · orman", p, sky, far, mid, near, mist_defs(p["mist"]), after_near=f'<g id="mist">{mist}</g>')

def windmill(cx, base, s=1.0):
    body = poly([(cx - 26 * s, base), (cx - 18 * s, base - 110 * s), (cx + 18 * s, base - 110 * s), (cx + 26 * s, base)])
    body += poly([(cx - 22 * s, base - 108 * s), (cx, base - 136 * s), (cx + 22 * s, base - 108 * s)])
    hub = (cx, base - 112 * s)
    blades = ""
    for k in range(4):
        a = math.radians(20 + 90 * k)
        ux, uy = math.cos(a), math.sin(a); vx, vy = -uy, ux
        L, w = 96 * s, 16 * s
        p0 = (hub[0] + ux * 10 * s, hub[1] + uy * 10 * s)
        blades += poly([(p0[0], p0[1]), (hub[0] + ux * L, hub[1] + uy * L), (hub[0] + ux * L + vx * w, hub[1] + uy * L + vy * w), (hub[0] + ux * 30 * s + vx * w, hub[1] + uy * 30 * s + vy * w)])
        blades += poly([(hub[0] - vx * 2, hub[1] - vy * 2), (hub[0] + ux * L - vx * 2, hub[1] + uy * L - vy * 2), (hub[0] + ux * L + vx * 1, hub[1] + uy * L + vy * 1), (hub[0] + vx * 1, hub[1] + vy * 1)])
    return body, blades, hub

def bd_night5():
    p = NIGHT
    sky = stars(6, 55) + moon(80, 140, 32)
    far = path(ground(420, 410, bumps=[(120, 396, 240, 412), (330, 420, 438, 404)]), p["far"])
    body, blades, hub = windmill(250, 440, 1.25)
    mid = path(ground(476, 470, bumps=[(160, 470, 250, 440), (330, 430, 438, 462)]) + body + fence(X0, 170, 476, 22, 14, spikes=False), p["mid"])
    mid += f'<g id="blades"><!-- pivot: {f(hub[0])},{f(hub[1])} (pervane, 360° / 14000 ms linear) -->{path(blades, p["mid"])}{C(hub[0], hub[1], 7, p["mid"])}</g>'
    mid += wins_svg([(244, 380, 10, 14)], p["win"])
    r = random.Random(8); wheat = ""
    for i in range(46):
        x = X0 + i * 10 + r.uniform(-3, 3); h = r.uniform(30, 60)
        wheat += f"M{f(x)} 540Q{f(x+3)} {f(540-h/2)} {f(x+r.uniform(-6,6))} {f(540-h)}"
    near = path(ground(536, 530) + house(-30, 540, 100, 70, 0.9, 0.65), p["near"])
    near += f'<path fill="none" stroke="{SIL}" stroke-width="2.6" stroke-linecap="round" d="{wheat}"/>'
    near += wins_svg([(10, 494, 10, 13)], p["win"])
    return scene("night-5 · değirmen", p, sky, far, mid, near)

def bd_night6():
    p = NIGHT
    sky = stars(7, 50) + moon(320, 110, 28)
    vd, vw = village_row(61, X0, X1, 420, 30, 50, 30, 50, lit=0.4)
    far = path(ground(418, 418) + vd, p["far"]) + wins_svg(vw, p["win"], ' opacity=".55"')
    vd2, vw2 = village_row(62, X0, X1, 478, 50, 80, 50, 80, lit=0.5)
    mid = path(ground(476, 476) + vd2, p["mid"]) + wins_svg(vw2, p["win"], ' opacity=".85"')
    well = poly([(110, 540), (110, 486), (230, 486), (230, 540)])
    well += poly([(100, 488), (100, 478), (240, 478), (240, 488)])
    well += poly([(120, 480), (120, 412), (126, 412), (126, 480)]) + poly([(214, 480), (214, 412), (220, 412), (220, 480)])
    well += poly([(96, 418), (170, 370), (244, 418), (236, 422), (170, 382), (104, 422)])
    well += poly([(120, 436), (220, 436), (220, 440), (120, 440)])
    bucket = poly([(160, 456), (182, 456), (178, 474), (164, 474)])
    cat = poly([(200, 478), (202, 458), (206, 450), (209, 456), (214, 456), (217, 450), (221, 458), (226, 478)])
    near = path(ground(536, 536) + well + bucket + cat, p["near"])
    near += S("M171 440V456", 1.6, SIL) + S("M226 476C236 470 238 460 232 452", 3, SIL)
    near += path("".join(slot(130 + i * 18, 500, 130 + i * 18 + 12, 500, 2.4) for i in range(6)) + "".join(slot(139 + i * 18, 518, 139 + i * 18 + 12, 518, 2.4) for i in range(5)), p["mid"])
    near += path(almond(209, 462, 2, 1.2) + almond(216, 462, 2, 1.2), "#F6C27A")
    return scene("night-6 · kuyu", p, sky, far, mid, near)

def bd_day1():
    p = DAY
    sky = C(195, 220, 120, "#FFF1C8", ' opacity=".14"')
    far = path(ground(400, 396, bumps=[(100, 380, 200, 398), (300, 410, 438, 386)]), p["far"])
    vd, vw = village_row(71, X0, 140, 470, 60, 100, 46, 70, lit=0.5)
    vd2, vw2 = village_row(72, 260, X1, 470, 60, 100, 46, 70, lit=0.5)
    clock = poly([(160, 470), (160, 300), (230, 300), (230, 470)]) + poly([(152, 302), (195, 250), (238, 302)])
    mid = path(ground(470, 470) + vd + vd2 + clock, p["mid"])
    mid += C(195, 340, 20, "#F8CF8C") + S("M195 340V326M195 340L205 346", 3, p["mid"])
    mid += wins_svg(vw + vw2, "#E8A050", ' opacity=".7"')
    fountain = poly([(140, 540), (150, 516), (240, 516), (250, 540)]) + poly([(186, 516), (190, 480), (200, 480), (204, 516)]) + poly([(170, 484), (220, 484), (214, 476), (176, 476)])
    lamp1 = poly([(40, 540), (40, 430), (44, 430), (44, 540)]) + poly([(32, 432), (52, 432), (48, 414), (36, 414)])
    lamp2 = poly([(346, 540), (346, 430), (350, 430), (350, 540)]) + poly([(338, 432), (358, 432), (354, 414), (342, 414)])
    cd, cs, cf = crowd(73, -20, 120, 560, 46, 62, props=False)
    cd2, cs2, cf2 = crowd(74, 280, 420, 560, 46, 62, props=False)
    near = path(ground(536, 536) + fountain + lamp1 + lamp2 + cd + cd2, p["near"])
    near += S("M195 470C186 460 176 468 172 478M195 470C204 460 214 468 218 478", 2.2, "#F8CF8C", ' opacity=".7"')
    return scene("day-1 · meydan", p, sky, far, mid, near)

def bd_day2():
    p = DAY
    sky = C(195, 240, 130, "#FFF1C8", ' opacity=".12"')
    vd, vw = village_row(81, X0, X1, 420, 20, 36, 24, 40, lit=0.3)
    far = path(ground(420, 420) + vd + spire(300, 420, 16, 34, 30), p["far"])
    gal = poly([(150, 450), (150, 300), (160, 300), (160, 450)]) + poly([(146, 300), (250, 300), (250, 310), (146, 310)])
    gal += poly([(156, 340), (190, 304), (196, 310), (162, 346)])
    gal += poly([(120, 452), (120, 440), (270, 440), (270, 452)])
    mid = path(ground(474, 466, bumps=[(140, 440, 200, 448), (300, 456, 438, 470)]) + gal, p["mid"])
    rope = S("M236 310V350", 2.6, p["mid"]) + f'<ellipse cx="236" cy="362" rx="9" ry="12" fill="none" stroke="{p["mid"]}" stroke-width="3"/>'
    mid += f'<g id="rope"><!-- pivot: 236,310 (ilmek sallanır ±4°, 2600 ms) -->{rope}</g>'
    cd, cs, cf = crowd(83, X0, X1, 560, 52, 72)
    near = path(ground(540, 540) + cd, p["near"])
    near += f'<path fill="none" stroke="{SIL}" stroke-width="3" stroke-linecap="round" d="{"".join(cs)}"/>'
    near += "".join(flame(x, y, 1.0) for x, y in cf)
    return scene("day-2 · darağacı", p, sky, far, mid, near)

def awning(x, base, w, h, top):
    d = poly([(x, base), (x, top + 18), (x + 4, top + 18), (x + 4, base)]) + poly([(x + w - 4, base), (x + w - 4, top + 18), (x + w, top + 18), (x + w, base)])
    pts = [(x - 6, top + 18), (x + w / 2, top), (x + w + 6, top + 18)]
    n = 5; sw = (w + 12) / n
    sc = ""
    for i in range(n):
        sx = x - 6 + i * sw
        sc += f"M{f(sx)} {f(top+18)}Q{f(sx+sw/2)} {f(top+30)} {f(sx+sw)} {f(top+18)}Z"
    d += poly(pts) + sc
    d += poly([(x + 2, base - h * 0.35), (x + w - 2, base - h * 0.35), (x + w - 2, base - h * 0.35 + 6), (x + 2, base - h * 0.35 + 6)])
    return d

def bd_day3():
    p = DAY
    sky = C(195, 220, 110, "#FFF1C8", ' opacity=".12"')
    vd, vw = village_row(91, X0, X1, 430, 40, 70, 40, 64, lit=0.4)
    far = path(ground(430, 430) + vd, p["far"]) + wins_svg(vw, "#E8A050", ' opacity=".5"')
    st = awning(-10, 500, 110, 70, 400) + awning(140, 492, 110, 64, 396) + awning(290, 500, 110, 70, 404)
    mid = path(ground(496, 496) + st, p["mid"])
    mid += S("M40 418V436M195 410V430M340 422V440", 1.6, p["mid"]) + "".join(C(x, y, 6, "#F8CF8C", ' opacity=".9"') for x, y in [(40, 442), (195, 436), (340, 446)])
    crates = poly([(20, 550), (20, 510), (70, 510), (70, 550)]) + poly([(60, 550), (60, 520), (100, 520), (100, 550)])
    barrel = f"M300 550C292 530 292 512 300 498H336C344 512 344 530 336 550Z"
    cd, cs, cf = crowd(93, 110, 290, 570, 46, 60, props=False)
    near = path(ground(540, 540) + crates + barrel + cd, p["near"])
    near += path(slot(24, 522, 66, 522, 2.4) + slot(24, 536, 66, 536, 2.4) + slot(300, 516, 336, 516, 2.4) + slot(298, 532, 338, 532, 2.4), p["mid"])
    return scene("day-3 · pazar yeri", p, sky, far, mid, near)

BACKDROPS = {"menu": bd_menu, "night-1": bd_night1, "night-2": bd_night2, "night-3": bd_night3, "night-4": bd_night4,
             "night-5": bd_night5, "night-6": bd_night6, "day-1": bd_day1, "day-2": bd_day2, "day-3": bd_day3}

def uniq_ids(svg, slug):
    """Gradyan id'lerini dosyaya özgü yapar (aynı ekranda birden çok SVG olursa çakışmasın)."""
    for gid in ("sky", "shade", "vignette", "mist", "spot", "glow", "lampbg"):
        svg = svg.replace(f'<radialGradient id="{gid}"', f'<radialGradient id="{slug}-{gid}-g"')
        svg = svg.replace(f'<linearGradient id="{gid}"', f'<linearGradient id="{slug}-{gid}-g"')
        svg = svg.replace(f'url(#{gid})', f'url(#{slug}-{gid}-g)')
    return svg

if __name__ == "__main__":
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k, fn in BACKDROPS.items():
        open(os.path.join(out, k + ".svg"), "w").write(uniq_ids(fn(), k))
    print("ok", len(BACKDROPS))
