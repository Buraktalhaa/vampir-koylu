#!/usr/bin/env python3
"""emblems/ (takım amblemleri) ve avatars/ (nötr oyuncu başları), 64×64."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from portraits import f, circ, almond, diamond, star4, slot, S, C, HEAD, EYE_L, SIL, BRASS
from scenes import poly, bat

INK = "#F3E2C4"   # amblem gövdesi = text.primary

def svg64(note, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><!-- {note} -->{body}</svg>\n'

def P(d, fill, rule=False, extra=""):
    return f'<path fill="{fill}"{" fill-rule=\"evenodd\"" if rule else ""} d="{d}"{extra}/>'

# ---------- amblemler ----------
def em_village():
    house = poly([(14, 56), (14, 32), (32, 14), (50, 32), (50, 56)])
    roof = poly([(8, 34), (32, 8), (56, 34), (52, 37), (32, 17), (12, 37)])
    chim = poly([(40, 22), (40, 12), (46, 12), (46, 28)])
    door = "M27 56V44A5 5 0 0 1 37 44V56Z"
    holes = door + slot(18, 50, 22, 50, 2) + slot(42, 50, 46, 50, 2)
    body = P(roof + chim, INK) + P(house + holes, INK, True) + C(32, 31, 5.5, "#TEAM", f' stroke="{SIL}" stroke-width="1.5"')
    body += P(poly([(8, 58), (56, 58), (56, 61), (8, 61)]), INK)
    return svg64("village · Köy takımı amblemi · gövde text.primary, kakma #TEAM", body)

def em_vampire():
    wings = bat(32, 26, 2.5)
    eyes = almond(29, 22, 1.8, 1.2) + almond(35, 22, 1.8, 1.2)
    drop = "M32 38C36 45 39 49 39 53A7 7 0 0 1 25 53C25 49 28 45 32 38Z"
    body = P(wings + eyes, INK, True) + P(drop, "#TEAM", extra=f' stroke="{INK}" stroke-width="2"')
    body += P(poly([(30, 30), (31, 35), (32, 30)]) + poly([(32, 30), (33, 35), (34, 30)]), INK)
    return svg64("vampire · Vampir takımı amblemi · gövde text.primary, kakma #TEAM", body)

def em_neutral():
    mask = "M10 16C18 10 46 10 54 16C56 34 48 50 32 56C16 50 8 34 10 16Z"
    holes = almond(23, 28, 6, 3.4) + almond(41, 28, 6, 3.4) + "M22 40Q32 48 42 40Q32 52 22 40Z"
    body = P(mask + holes, INK, True)
    body += P(diamond(32, 20, 3.4, 5), "#TEAM", extra=f' stroke="{SIL}" stroke-width="1"')
    body += S("M10 18C4 22 4 30 6 36M54 18C60 22 60 30 58 36", 2.4, INK)
    return svg64("neutral · Tarafsız amblemi · gövde text.primary, kakma #TEAM", body)

EMBLEMS = {"village": em_village, "vampire": em_vampire, "neutral": em_neutral}

# ---------- avatarlar ----------
AV_T = "matrix(.32 0 0 .32 -14 -8)"
SHOULD = "M30 232C34 204 64 190 100 186H146C162 190 172 198 178 210V232Z"
CAP = "M92 102C80 64 106 40 134 40C154 40 168 52 168 68C152 58 126 58 110 72C100 82 96 92 96 106Z"
MOUS = "M160 110C172 108 182 114 184 124C176 122 168 122 160 120Z"

def av(name, note, extra_back="", extra_front="", head=HEAD, eye=almond(151, 90, 8, 5.5)):
    body = P(SHOULD, SIL) + extra_back + P(head + eye, SIL, True) + extra_front
    return svg64(f"avatar {name} · {note} · nötr (takım bilgisi yok) · sağ alt 22×22 baş harf rozeti için boş",
                 f'<g transform="{AV_T}">{body}</g>')

AVATARS = {
    "a01": ("kıvırcık saç", lambda: av("a01", "kıvırcık saç", extra_front=P("".join(circ(x, y, r) for x, y, r in
             [(98, 74, 18), (116, 56, 18), (138, 48, 17), (156, 56, 13), (90, 96, 16), (92, 118, 14), (108, 84, 14)]), SIL))),
    "a02": ("örgülü saç", lambda: av("a02", "örgülü saç", extra_back=P("".join(f'M{f(x-9)} {f(y)}a9 11 0 1 0 18 0a9 11 0 1 0 -18 0Z' for x, y in
             [(90, 120), (86, 142), (82, 164), (79, 186), (77, 206)]), SIL), extra_front=P(CAP, SIL))),
    "a03": ("kel, sakallı", lambda: av("a03", "kel, sakallı", extra_front=P("M104 118C100 150 122 180 152 176C168 172 174 152 168 134L160 126C150 136 130 134 118 120Z" + MOUS, SIL)
             + P("M90 106C86 92 90 82 98 76L104 92Z", SIL))),
    "a04": ("topuz", lambda: av("a04", "topuz", extra_front=P(CAP, SIL) + C(92, 58, 18, SIL))),
    "a05": ("fes, bıyık", lambda: av("a05", "fes, bıyık", extra_front=P("M102 62L110 32H150L158 62Z", SIL) + P(MOUS, SIL)
             + S("M130 32C118 30 108 38 104 52", 3, SIL) + C(104, 56, 4, SIL))),
    "a06": ("uzun saç", lambda: av("a06", "uzun saç", extra_back=P("M96 66C110 40 150 38 164 62C150 56 128 58 116 70C104 86 104 140 112 196L72 200C66 160 72 100 96 66Z", SIL),
             extra_front=P(CAP, SIL))),
    "a07": ("bere", lambda: av("a07", "bere", extra_front=P("M80 66C90 40 150 32 174 50C166 62 120 68 80 66Z", SIL) + S("M128 38L132 26", 4, SIL)
             + P("M92 70C86 84 88 98 94 108L100 92Z", SIL))),
    "a08": ("at kuyruğu", lambda: av("a08", "at kuyruğu", extra_back=P("M94 70C64 70 52 104 60 140C64 118 74 100 96 92Z", SIL), extra_front=P(CAP, SIL)
             + C(94, 78, 6, BRASS))),
    "a09": ("burma bıyık", lambda: av("a09", "burma bıyık", extra_front=P("M92 96C84 66 106 44 134 44C152 44 164 52 166 62C150 56 124 58 108 70C100 78 96 86 96 98Z", SIL)
             + P("M158 112C168 108 178 112 184 118C190 110 196 104 194 96C202 106 198 122 186 126C176 126 168 124 158 120Z", SIL))),
    "a10": ("çiçekli saç bandı", lambda: av("a10", "çiçekli saç bandı", extra_back=P("M94 72C78 90 76 130 84 160L100 156C94 130 96 100 104 80Z", SIL),
             extra_front=P(CAP, SIL) + P("".join(circ(116 + 11 * __import__('math').cos(a), 44 + 11 * __import__('math').sin(a), 7) for a in [i * 1.2566 for i in range(5)]), SIL)
             + C(116, 44, 4, BRASS))),
}

if __name__ == "__main__":
    out = sys.argv[1]
    os.makedirs(f"{out}/emblems", exist_ok=True); os.makedirs(f"{out}/avatars", exist_ok=True)
    for k, fn in EMBLEMS.items():
        open(f"{out}/emblems/{k}.svg", "w").write(fn())
    for k, (n, fn) in AVATARS.items():
        open(f"{out}/avatars/avatar-{k[1:]}.svg", "w").write(fn())
    print("ok")
