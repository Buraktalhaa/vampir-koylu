#!/usr/bin/env python3
"""Vampir Köylü — Gölge Kukla portre üreteci.
Büyük: viewBox 0 0 240 320 · Küçük: viewBox 0 0 64 64 (çerçevesiz).
Yalnızca path/circle/ellipse/rect/polygon/g (+ gradient) kullanılır.
Takım rengi: fill="#TEAM" (kod gerçek renkle değiştirir).
"""
import os, sys

SIL = "#0B0705"      # siluet (deri)
BRASS = "#C9A26B"    # perçin / metal
IRON = "#8C7A64"     # zincir / demir
GLOW = "#FFF1C8"     # alev / parıltı
TEAM = "#TEAM"

# ---------- yardımcılar ----------
def f(n):
    s = f"{n:.2f}".rstrip("0").rstrip(".")
    return s if s != "-0" else "0"

def circ(cx, cy, r):
    return f"M{f(cx-r)} {f(cy)}a{f(r)} {f(r)} 0 1 0 {f(2*r)} 0a{f(r)} {f(r)} 0 1 0 {f(-2*r)} 0Z"

def almond(x, y, w, h):
    return f"M{f(x-w)} {f(y)}Q{f(x)} {f(y-h)} {f(x+w)} {f(y)}Q{f(x)} {f(y+h)} {f(x-w)} {f(y)}Z"

def diamond(x, y, rx, ry=None):
    ry = ry or rx * 1.5
    return f"M{f(x)} {f(y-ry)}L{f(x+rx)} {f(y)}L{f(x)} {f(y+ry)}L{f(x-rx)} {f(y)}Z"

def crescent(cx, cy, r):
    # dışa bakan hilal
    return (f"M{f(cx)} {f(cy-r)}A{f(r)} {f(r)} 0 1 0 {f(cx)} {f(cy+r)}"
            f"A{f(r*0.72)} {f(r*0.86)} 0 1 1 {f(cx)} {f(cy-r)}Z")

def star4(x, y, r):
    k = r * 0.3
    return (f"M{f(x)} {f(y-r)}L{f(x+k)} {f(y-k)}L{f(x+r)} {f(y)}L{f(x+k)} {f(y+k)}"
            f"L{f(x)} {f(y+r)}L{f(x-k)} {f(y+k)}L{f(x-r)} {f(y)}L{f(x-k)} {f(y-k)}Z")

def slot(x1, y1, x2, y2, w):
    # ince dikdörtgen delik (iki nokta arası)
    import math
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L * w / 2, dx / L * w / 2
    return (f"M{f(x1+nx)} {f(y1+ny)}L{f(x2+nx)} {f(y2+ny)}"
            f"L{f(x2-nx)} {f(y2-ny)}L{f(x1-nx)} {f(y1-ny)}Z")

def P(d, fill=SIL, holes=(), extra=""):
    if isinstance(holes, str):
        holes, extra = (), holes
    if holes:
        d = d + "".join(holes)
        return f'<path fill="{fill}" fill-rule="evenodd" d="{d}"{extra}/>'
    return f'<path fill="{fill}" d="{d}"{extra}/>'

def S(d, w, color=SIL, extra=""):
    return f'<path fill="none" stroke="{color}" stroke-width="{f(w)}" stroke-linecap="round" stroke-linejoin="round" d="{d}"{extra}/>'

def C(cx, cy, r, fill=SIL, extra=""):
    return f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="{fill}"{extra}/>'

def ring(cx, cy, r, w, color=SIL, fill="none", extra=""):
    return f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="{fill}" stroke="{color}" stroke-width="{f(w)}"{extra}/>'

# ---------- ortak gövde parçaları ----------
HEAD = ("M96 70C104 46 140 40 158 58C164 66 166 78 164 88L178 104L166 110L169 120L163 125L166 136"
        "C160 148 150 152 142 152L144 190H100L102 146C88 132 86 92 96 70Z")
HEAD_NO_NECK = ("M96 70C104 46 140 40 158 58C164 66 166 78 164 88L178 104L166 110L169 120L163 125L166 136"
                "C160 148 150 152 142 152L102 146C88 132 86 92 96 70Z")
EYE_L = almond(151, 90, 7, 5)
EYE_S = almond(150, 90, 10, 7)   # küçük sürümde büyütülmüş göz
TORSO = "M24 320L36 238Q48 198 98 186H146Q190 194 204 236L216 320Z"
CAPE = "M12 320L28 234Q44 194 98 186H146Q196 194 210 234L228 320Z"
SHOULDERS_S = "M34 202L40 195Q58 186 98 184H146Q178 188 192 196L196 202Z"
HOOD = ("M78 196C66 140 64 90 82 62C74 56 64 52 54 52C76 38 96 36 114 42C136 32 166 36 178 62C184 76 180 92 172 100L164 96L160 80"
        "C156 62 140 52 122 54C102 58 94 80 94 108C96 130 100 146 104 160L110 196Z")

# Kol: omuz pivotu 174,208 · dirsek ~198,282 · el 216,224
ARM = ("M162 208C170 200 182 200 186 208L202 250L208 226C212 218 222 220 224 228"
       "L208 282C204 290 192 290 188 282Z")
HAND = (216, 224)

def band_holes(y=300, x0=46, x1=200, step=19, kind="mix"):
    out, i = [], 0
    x = x0
    while x <= x1:
        if kind == "mix":
            out.append(diamond(x, y, 3.2) if i % 2 == 0 else circ(x, y, 2.6))
        elif kind == "dot":
            out.append(circ(x, y, 2.8))
        elif kind == "dia":
            out.append(diamond(x, y, 3.2))
        elif kind == "star":
            out.append(star4(x, y, 4.2) if i % 2 == 0 else circ(x, y, 2.2))
        elif kind == "slot":
            out.append(slot(x, y - 7, x, y + 7, 3))
        x += step; i += 1
    return out

def arm_group(prop, pivot=(174, 208), rod=True, base=True, gid="arm", rivets=True):
    parts = [f"<!-- pivot: {pivot[0]},{pivot[1]} (omuz) -->"]
    if rod:
        parts.append(S("M216 226L232 320", 2.4))
    if base:
        parts.append(P(ARM))
    parts.append(prop)
    if rivets:
        parts.append(C(174, 208, 3.6, BRASS))
        parts.append(C(198, 282, 3.2, BRASS))
    return f'<g id="{gid}">' + "".join(parts) + "</g>"

def group(gid, content, pivot=None, note=""):
    if gid == "head" and pivot is None:
        pivot, note = (122, 188), "(boyun: baş eğme / sallanma)"
    c = f"<!-- pivot: {pivot[0]},{pivot[1]}{(' ' + note) if note else ''} -->" if pivot else ""
    return f'<g id="{gid}">{c}{content}</g>'

# ---------- karakterler ----------
CH = []

def add(**k):
    CH.append(k)

# 1 Köylü — kasket, bıyık, dirgen
cap = "M86 80C84 52 112 36 142 40C160 42 170 54 170 66L194 72C196 78 188 82 174 80L90 88Z"
add(id="villager", tr="Köylü", en="Villager", team="village",
    large=lambda: "".join([
        P(TORSO, holes=band_holes(kind="mix") + [circ(66, 262, 3), circ(80, 248, 3), circ(70, 278, 2.4)]),
        P("M108 196L142 192L152 250L128 288L102 256Z", TEAM),
        S("M126 198L128 284", 3), C(118, 220, 2.6), C(120, 246, 2.6),
        group("head", P(HEAD, holes=[EYE_L]) + P("M160 110C172 108 182 114 184 124C176 122 168 122 160 120Z")),
        group("hat", P(cap) + P("M90 82L172 74L173 80L92 88Z", TEAM), (128, 60), "(kasket sallanması)"),
        arm_group(P("M213 116H219V320H213Z") + S("M202 120V92M216 120V84M230 120V92", 5) + S("M200 122H232", 6)),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S),
        P(HEAD, holes=[EYE_S]) + P("M160 110C172 108 184 114 186 126C176 123 168 123 160 121Z"),
        P(cap) + P("M90 82L172 74L173 81L92 89Z", TEAM),
        S("M214 76V202", 9) + S("M200 78V52M214 78V44M228 78V52", 8) + S("M198 80H230", 9),
    ]))

# 2 Vampir — dik yaka, sivri kulak, pelerin, pençe
hair_v = "M92 104C78 72 98 40 132 38C152 36 168 48 166 64L152 62L144 74L134 60Z"
add(id="vampire", tr="Vampir", en="Vampire", team="vampire",
    large=lambda: "".join([
        P("M102 196L60 90L122 178Z"), P("M104 184L74 112L116 172Z", TEAM),
        P(CAPE, holes=band_holes(kind="dot", x0=36, x1=206, step=17) +
          [crescent(64, 258, 9), crescent(48, 290, 6), circ(84, 276, 3), circ(92, 252, 2.4)]),
        P("M116 198H150L156 248L134 270L112 248Z", TEAM), P(diamond(134, 232, 6, 12)),
        group("head", P(hair_v) + P(HEAD, holes=[EYE_L, "M114 104L108 80L125 98L121 106Z"]) +
              P("M161 125L164 135L167 124Z") + P("M144 196L176 132L158 196Z")),
        arm_group(S("M210 220L202 196M216 218L216 192M222 220L232 198", 4)),
    ]),
    small=lambda: "".join([
        P("M102 202L58 88L122 178Z"), P("M104 190L72 110L116 172Z", TEAM),
        P(SHOULDERS_S),
        P(hair_v) + P(HEAD, holes=[EYE_S, "M114 106L106 76L127 98L122 108Z"]),
        P("M160 125L165 138L169 124Z") + P("M144 202L178 130L160 202Z"),
    ]))

# 3 Kâhin — kapüşon, üçüncü göz, küre
seer_eye_L = "M144 91Q151 97 158 91L158 94Q151 100 144 94Z"
seer_eye_S = "M141 90Q151 99 161 90L161 95Q151 104 141 95Z"
add(id="seer", tr="Kâhin", en="Seer", team="village",
    large=lambda: "".join([
        P(TORSO, holes=band_holes(kind="star") + [crescent(66, 258, 10), star4(88, 276, 5), circ(56, 284, 2.4)]),
        P(HOOD, holes=[circ(150, 40, 2.4), circ(166, 50, 2.4), circ(176, 70, 2.4), circ(84, 150, 2.4), circ(80, 126, 2.4)]),
        group("head", P(HEAD, holes=[seer_eye_L, star4(146, 70, 6)])),
        arm_group(C(214, 196, 22, TEAM, ' stroke="#0B0705" stroke-width="5"') +
                  C(206, 188, 4, GLOW, ' opacity=".75"') + P(star4(220, 202, 5), GLOW, extra=' opacity=".6"')),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S), P(HOOD),
        P(HEAD, holes=[seer_eye_S, star4(144, 68, 9)]),
        C(190, 170, 20, TEAM, ' stroke="#0B0705" stroke-width="6"'),
    ]))

# 4 Şifacı — başörtüsü, şişe
scarf = ("M80 196C70 150 74 80 104 52C126 34 158 34 170 54L166 66C150 54 122 54 108 70"
         "C98 88 98 122 104 146L112 196Z")
scarf_tail = "M86 116C70 128 60 152 64 184L78 176C76 154 80 138 92 128Z"
add(id="healer", tr="Şifacı", en="Healer", team="village",
    large=lambda: "".join([
        P(scarf_tail),
        P(TORSO, holes=band_holes(kind="dia") + [almond(64, 260, 9, 4), almond(80, 276, 8, 4), almond(56, 282, 7, 3)]),
        P(scarf, holes=[circ(140, 42, 2.4), circ(158, 48, 2.4), circ(84, 160, 2.4), circ(82, 136, 2.4)]),
        P("M100 64C118 46 150 44 168 56L166 64C148 54 122 56 104 70Z", TEAM),
        group("head", P(HEAD, holes=[EYE_L])),
        arm_group(P("M210 184H222V204H210Z") + P("M207 176H225V186H207Z") +
                  C(216, 222, 18, TEAM, ' stroke="#0B0705" stroke-width="4"') +
                  S("M200 220H232", 2.5) + C(210, 230, 2.6, GLOW, ' opacity=".8"') + C(220, 236, 2, GLOW, ' opacity=".8"')),
    ]),
    small=lambda: "".join([
        P(scarf_tail), P(SHOULDERS_S), P(scarf),
        P("M100 64C118 46 150 44 168 56L166 66C148 56 122 58 104 72Z", TEAM),
        P(HEAD, holes=[EYE_S]),
        P("M192 138H206V154H192Z") + P("M188 130H210V140H188Z") + C(196, 172, 19, TEAM, ' stroke="#0B0705" stroke-width="6"'),
    ]))

# 5 İntikamcı — yırtık kapüşon, yüz örtüsü, hançer
hood_t = HOOD.replace("L110 196Z", "L110 196L102 188L96 198L88 186L82 198Z")
avenger_eye = "M143 88L159 84L157 91Q150 94 143 91Z"
avenger_eye_s = "M139 87L162 80L160 92Q150 97 139 92Z"
mask_face = "M162 112L178 116L174 140L148 154L146 118Z"
add(id="avenger", tr="İntikamcı", en="Avenger", team="village",
    large=lambda: "".join([
        P(TORSO, holes=band_holes(kind="slot", step=16) + [slot(58, 250, 72, 280, 3), slot(74, 246, 88, 276, 3)]),
        P("M90 196L112 190L168 320H142Z", TEAM),
        P(hood_t, holes=[circ(150, 40, 2.4), circ(166, 50, 2.4), circ(176, 70, 2.4)]),
        group("head", P(HEAD, holes=[avenger_eye]) + P(mask_face)),
        arm_group(P("M209 210L216 120L223 210Z", TEAM) + S("M216 132V202", 2) +
                  S("M200 212H232", 6) + C(216, 236, 4.5)),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S), P(hood_t),
        P(HEAD, holes=[avenger_eye_s]) + P(mask_face),
        P("M196 176L206 60L216 176Z", TEAM, extra=' stroke="#0B0705" stroke-width="4" stroke-linejoin="round"') + S("M188 180H224", 9),
    ]))

# 6 Büyücü — eğri sivri şapka, kanca burun, iki şişe
witch_head = ("M96 70C104 50 140 44 158 60C164 68 166 78 164 88L188 114L172 113L170 120L164 125L176 142"
              "C162 150 150 152 142 152L144 190H100L102 146C88 132 86 92 96 70Z")
witch_hair = "M92 76C68 92 62 132 70 170C74 186 68 196 58 204L98 200C90 180 94 150 100 120Z"
witch_brim = "M68 72C92 60 168 58 198 70C172 80 94 80 68 72Z"
witch_cone = "M98 66C104 42 118 26 150 16L158 24C140 30 142 46 152 66Z"
add(id="witch", tr="Büyücü", en="Witch", team="village",
    large=lambda: "".join([
        P(witch_hair),
        P(TORSO, holes=band_holes(kind="star") + [star4(62, 262, 7), star4(84, 282, 5), circ(52, 280, 2.4)]),
        group("head", P(witch_head, holes=[EYE_L])),
        group("hat", P(witch_brim) + P(witch_cone, holes=[star4(126, 46, 5)]) +
              P("M101 58L152 56L153 63L100 65Z", TEAM), (128, 64), "(şapka ucu sallanır)"),
        arm_group(P("M202 186H210V196H202Z") + C(206, 208, 12, TEAM, ' stroke="#0B0705" stroke-width="3.5"') +
                  P("M220 172H228V182H220Z") + P(circ(224, 194, 11), holes=[circ(221, 190, 2.4), circ(227, 197, 1.8)])),
    ]),
    small=lambda: "".join([
        P(witch_hair.replace("L58 204L98 200", "L60 202L98 202")), P(SHOULDERS_S),
        P(witch_head, holes=[EYE_S]),
        P(witch_brim) + P(witch_cone) + P("M101 57L152 55L153 64L100 66Z", TEAM),
    ]))

# 7 Belediye Başkanı — silindir şapka, monokl, bıyık, nişan zinciri
mayor_crown = "M100 60L104 18H162L164 60Z"
mayor_brim = "M86 58H178C180 64 176 68 170 68H94C88 68 84 64 86 58Z"
mayor_mous = "M160 110C174 106 188 114 190 128C178 124 168 124 160 122Z"
mono = [circ(151, 90, 10.5), circ(151, 90, 7.5)]
add(id="mayor", tr="Belediye Başkanı", en="Mayor", team="village",
    large=lambda: "".join([
        P(TORSO, holes=band_holes(kind="mix") +
          [circ(x, y, 2.4) for x, y in [(102, 200), (108, 210), (116, 218), (140, 218), (148, 210), (154, 200)]] +
          [diamond(60, 262, 4), diamond(76, 280, 4)]),
        C(128, 232, 14, TEAM, ' stroke="#0B0705" stroke-width="3"') + P(star4(128, 232, 7)),
        group("head", P(HEAD, holes=[EYE_L] + mono) + P(mayor_mous) +
              P("M106 112C100 132 108 152 130 160L140 154C124 146 118 130 118 112Z") +
              S("M161 96C168 118 162 138 152 150", 1.5, BRASS) +
              P("M142 180L154 172L154 190Z") + P("M154 181L166 172V190Z")),
        group("hat", P(mayor_crown) + P(mayor_brim) + P("M101 48H163L163.4 56H100.6Z", TEAM), (130, 62), "(şapka selamı: -8°)"),
        arm_group(S("M216 226L222 320", 5) + C(216, 222, 6, BRASS), rod=False),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S),
        P(HEAD, holes=[EYE_S, circ(150, 90, 14), circ(150, 90, 11)]) + P(mayor_mous),
        P("M142 186L154 178L154 196Z") + P("M154 187L166 178V196Z"),
        P(mayor_crown) + P(mayor_brim) + P("M101 46H163L163.4 56H100.6Z", TEAM),
    ]))

# 8 Fedai — burun korumalı miğfer, zincir zırh, kalkan
helm = "M88 84C86 50 110 34 132 34C156 34 172 50 172 84Z"
crest = "M96 52C110 30 142 26 162 42L157 48C142 36 114 38 101 57Z"
neck_mail = "M98 146L148 150L152 194H92Z"
mail_holes = [circ(x, y, 2.2) for y in (160, 170, 180) for x in (106, 116, 126, 136)]
add(id="bodyguard", tr="Fedai", en="Bodyguard", team="village",
    large=lambda: "".join([
        P("M18 320L30 232Q44 192 98 184H146Q196 192 212 232L224 320Z",
          holes=band_holes(kind="dia", x0=34, x1=150) + [circ(58, 252, 3), circ(70, 266, 3), circ(84, 252, 3), circ(58, 280, 3), circ(84, 280, 3)]),
        P(neck_mail, holes=mail_holes),
        group("head", P(HEAD_NO_NECK, holes=[EYE_L]) + P(helm) + P(crest, TEAM) +
              P("M163 76H171L174 112H166Z") +
              "".join(C(x, 80, 2.2, BRASS) for x in (98, 112, 126, 140, 154))),
        arm_group(C(198, 246, 38) + ring(198, 246, 32, 2, BRASS) + C(198, 246, 12, TEAM, ' stroke="#0B0705" stroke-width="3"') +
                  "".join(C(198 + 25 * c, 246 + 25 * s, 2.4, BRASS) for c, s in
                          [(1, 0), (0.707, 0.707), (0, 1), (-0.707, 0.707), (-1, 0), (-0.707, -0.707), (0, -1), (0.707, -0.707)]),
                  rod=False),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S), P(neck_mail.replace("194H92", "202H90")),
        P(HEAD_NO_NECK, holes=[EYE_S]) + P(helm) + P(crest.replace("L157 48", "L156 50").replace("L101 57", "L102 60"), TEAM),
        P("M162 74H172L175 114H166Z"),
    ]))

# 9 Gece Misafiri — geniş kenarlı şapka, pelerin yakası, fener (alev animasyonlu)
v_brim = "M66 72C96 62 172 60 204 72C184 80 92 82 66 72Z"
v_crown = "M100 68C98 42 116 30 136 30C156 30 168 44 164 68Z"
def lantern(cx, top, sc=1.0, flame_id=True):
    def X(v): return cx + (v - 216) * sc
    def Y(v): return top + (v - 232) * sc
    out = ring(X(216), Y(232), 6 * sc, 3 * sc)
    out += P(f"M{f(X(204))} {f(Y(238))}H{f(X(228))}L{f(X(224))} {f(Y(246))}H{f(X(208))}Z")
    out += f'<rect x="{f(X(206))}" y="{f(Y(246))}" width="{f(20*sc)}" height="{f(30*sc)}" fill="{TEAM}" stroke="{SIL}" stroke-width="{f(3*sc)}"/>'
    fl = P(f"M{f(X(216))} {f(Y(252))}C{f(X(221))} {f(Y(259))} {f(X(223))} {f(Y(266))} {f(X(216))} {f(Y(272))}"
           f"C{f(X(209))} {f(Y(266))} {f(X(211))} {f(Y(259))} {f(X(216))} {f(Y(252))}Z", GLOW)
    out += group("flame", fl, (round(X(216)), round(Y(272))), "(alev: scaleY + titreme)") if flame_id else fl
    out += S(f"M{f(X(209))} {f(Y(246))}V{f(Y(276))}M{f(X(223))} {f(Y(246))}V{f(Y(276))}", 2 * sc)
    out += P(f"M{f(X(202))} {f(Y(276))}H{f(X(230))}L{f(X(226))} {f(Y(284))}H{f(X(206))}Z")
    return out
add(id="visitor", tr="Gece Misafiri", en="Night Visitor", team="village",
    large=lambda: "".join([
        P("M98 196L80 140L116 176Z"),
        P(CAPE, holes=band_holes(kind="dot", x0=36, x1=206, step=17) + [circ(60, 250, 3), circ(54, 268, 3), circ(66, 286, 3), crescent(84, 262, 7)]),
        group("head", P(HEAD, holes=[EYE_L]) + P("M146 196L164 150L160 196Z")),
        group("hat", P(v_brim) + P(v_crown, holes=[slot(110, 46, 154, 46, 3)]), (134, 70)),
        arm_group(lantern(216, 232)),
    ]),
    small=lambda: "".join([
        P("M98 202L78 136L116 176Z"), P(SHOULDERS_S),
        P(HEAD, holes=[EYE_S]),
        P(v_brim) + P(v_crown),
        lantern(204, 116, 1.45, flame_id=False),
    ]))

# 10 Dedektif — kulaklı kasket, pipo, büyüteç
deer = "M88 76C86 50 108 36 132 36C154 36 168 48 168 72L190 78C188 84 178 84 166 82H96L74 80C76 76 82 76 88 76Z"
bow = "M124 38C116 26 128 20 132 32C136 20 148 26 140 38Z"
pipe = S("M162 124C172 128 178 132 182 138", 3.5) + P("M179 126H191V141C191 146 179 146 179 141Z")
add(id="detective", tr="Dedektif", en="Detective", team="village",
    large=lambda: "".join([
        P(TORSO, holes=band_holes(kind="dia") + [slot(56, 250, 56, 290, 3), slot(68, 246, 68, 292, 3), slot(80, 250, 80, 290, 3)]),
        P("M100 196L90 152L120 182Z"),
        group("head", P(HEAD, holes=[EYE_L]) + pipe + P("M144 196L156 158L162 196Z")),
        group("hat", P(deer) + P(bow), (130, 60)),
        arm_group(S("M216 224L215 206", 6) + C(214, 186, 18, TEAM, ' stroke="#0B0705" stroke-width="6" fill-opacity=".9"') +
                  S("M204 180A12 12 0 0 1 214 172", 2.5, GLOW, ' opacity=".8"')),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S),
        P(HEAD, holes=[EYE_S]) + S("M162 124C174 128 180 134 184 142", 6) + P("M180 124H196V144C196 150 180 150 180 144Z"),
        P(deer) + P(bow),
        S("M210 202L206 186", 10) + C(202, 160, 22, TEAM, ' stroke="#0B0705" stroke-width="8"'),
    ]))

# 11 Yalnız Vampir — kel uzun kafa, yarasa kulak, kambur, uzun pençe
lv_head = ("M90 92C86 56 108 30 136 32C158 34 168 54 166 80L176 100L190 113L172 114L170 122L164 126L166 138"
           "C158 150 148 152 140 152L142 190H100L102 148C88 134 88 112 90 92Z")
lv_ear = "M110 112L80 50L128 96Z"
bat = ("M40 150C50 138 58 140 62 148C64 140 70 140 72 148C76 140 86 138 94 150C84 150 76 156 68 162"
       "C64 156 60 154 54 160C50 154 46 152 40 150Z")
hump = "M16 320L22 228Q30 160 82 162Q100 166 104 186H146Q188 194 202 236L214 320Z"
add(id="loneVampire", tr="Yalnız Vampir", en="Lone Vampire", team="neutral",
    large=lambda: "".join([
        P(lv_ear),
        P(hump, holes=band_holes(kind="slot", x0=36, x1=196, step=16) +
          [slot(44, 222, 58, 214, 3), slot(42, 240, 60, 234, 3), slot(42, 258, 62, 254, 3), slot(44, 276, 64, 274, 3)]),
        group("bat", P(bat), (66, 158), "(kanat çırpma: scaleY)"),
        group("head", P(lv_head, holes=[almond(152, 88, 6, 4)]) +
              P("M163 124L165 135L168 124Z") + P("M157 125L158.5 133L161 125Z")),
        C(144, 198, 9, TEAM, ' stroke="#0B0705" stroke-width="3"'),
        arm_group(S("M210 220C202 206 202 196 206 184M216 218C214 204 216 192 222 182M222 222C228 210 232 204 236 196", 3.2)),
    ]),
    small=lambda: "".join([
        P(lv_ear), P("M30 202L32 190Q38 160 82 162Q100 166 104 184H146Q178 188 192 196L196 202Z"),
        P(bat.replace("M40 150", "M36 150")),
        P(lv_head, holes=[almond(150, 88, 9, 6)]) + P("M162 124L165 138L169 124Z"),
        C(140, 194, 10, TEAM, ' stroke="#0B0705" stroke-width="3"'),
    ]))

# 12 Lanetli — diken saç, çatlak yüz, demir tasma, hilal muska
hair_c = ("M88 98C78 80 80 60 92 50L96 60L100 40L110 54L116 34L124 50L132 32L138 48L150 36L150 50L162 44"
          "L158 60C140 50 112 54 100 78Z")
crack = "M140 102L136 112L141 116L137 127L139.5 127L144 116L139 112L143 102Z"
collar_c = "M92 160H150L153 176H90Z"
add(id="cursed", tr="Lanetli", en="Cursed", team="village",
    large=lambda: "".join([
        P(TORSO, holes=band_holes(kind="dot") + ["M104 196L114 214L122 196Z", "M128 200L134 216L140 200Z",
          diamond(60, 260, 4), diamond(74, 276, 3), diamond(56, 286, 3)]),
        S("M128 176L126 196", 2, IRON) + P(crescent(126, 214, 12), TEAM, ' stroke="#0B0705" stroke-width="2"'),
        group("head", P(hair_c) + P(HEAD, holes=[EYE_L, crack]) + P(collar_c, TEAM, ' stroke="#0B0705" stroke-width="3"')),
        arm_group("".join(ring(218, 238 + 12 * i, 5, 2.4, IRON) for i in range(4))),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S),
        P(hair_c) + P(HEAD, holes=[EYE_S, "M140 100L134 112L141 117L135 130L139 130L146 117L139 112L145 100Z"]),
        P("M90 158H152L156 180H86Z", TEAM, ' stroke="#0B0705" stroke-width="4"'),
    ]))

# 13 Şaman — boynuzlu başlık, tüyler, davul
sh_cap = "M90 78C88 52 110 38 132 38C154 38 168 52 166 76Z"
antlers = ("M112 44C104 30 96 22 84 18M100 30L94 16M92 24L78 28"
           "M146 42C154 28 162 20 176 16M158 26L160 14M168 21L184 24")
feathers = "M90 70C76 90 72 112 76 134L86 132C84 112 88 92 98 76ZM96 74C88 96 88 116 94 138L102 134C98 114 98 96 104 80Z"
add(id="shaman", tr="Şaman", en="Shaman", team="vampire",
    large=lambda: "".join([
        P(feathers),
        P(TORSO, holes=band_holes(kind="slot", step=12, x0=44, x1=164) + [circ(60, 254, 3), circ(70, 266, 3), circ(60, 278, 3)]),
        group("drum", ellipse_s(196, 262, 26, 32), (196, 262), "(davul titreşimi: scale 1→1.04)"),
        group("head", P(HEAD, holes=[EYE_L])),
        group("hat", P(sh_cap) + P("M90 70H166V78H90Z", TEAM) + S(antlers, 5), (128, 44), "(boynuz sallanması)"),
        arm_group(S("M216 224L232 194", 4) + C(233, 191, 5.5), rivets=True),
    ]),
    small=lambda: "".join([
        P(feathers), P(SHOULDERS_S),
        P(HEAD, holes=[EYE_S]),
        P(sh_cap) + P("M90 68H166V80H90Z", TEAM) + S(antlers, 8),
    ]))

def ellipse_s(cx, cy, rx, ry):
    return (f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{TEAM}" stroke="{SIL}" stroke-width="5"/>'
            + S(f"M{cx} {cy-26}V{cy+26}M{cx-12} {cy-12}L{cx} {cy}L{cx+12} {cy-12}M{cx-10} {cy+14}H{cx+10}", 2.5)
            + C(cx, cy - 18, 3))

# 14 Deli — üç uçlu şapka, çıngıraklar, fırfır yaka, kukla değnek
j_cap = "M88 82C86 56 108 42 132 42C152 42 166 52 168 72Z"
j_back = "M92 74C72 58 56 66 52 86C62 76 74 76 94 84Z"
j_top = "M112 48C106 34 114 26 126 22C128 30 132 38 140 46Z"
j_front = "M154 54C168 42 186 44 196 58C184 56 174 60 166 70Z"
ruff = "M86 196L92 180L100 190L106 176L114 188L122 174L130 188L138 174L146 188L154 178L160 196Z"
grin = "M146 121Q155 128 163 121L162 125Q155 133 147 125Z"
add(id="jester", tr="Deli", en="Jester", team="neutral",
    large=lambda: "".join([
        P(TORSO, holes=band_holes(kind="dia") + [diamond(60, 252, 6), diamond(76, 270, 6), diamond(60, 288, 6), diamond(92, 252, 6)]),
        group("head", P(HEAD, holes=[almond(151, 89, 7, 4), grin]) + P(ruff)),
        group("hat", P(j_cap) + P(j_back) + P(j_top) + P(j_front, holes=[diamond(180, 52, 2.5)]) +
              C(52, 88, 6, TEAM, ' stroke="#0B0705" stroke-width="2"') + C(126, 20, 6, TEAM, ' stroke="#0B0705" stroke-width="2"') +
              C(197, 60, 6, TEAM, ' stroke="#0B0705" stroke-width="2"'), (128, 60), "(şapka sallanması, çıngıraklar gecikmeli)"),
        arm_group(S("M216 224L222 172", 4) + C(223, 162, 9) + P("M213 156L223 138L233 156Z") + C(223, 137, 3.5, TEAM)),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S),
        P(HEAD, holes=[almond(150, 89, 10, 6), "M144 120Q155 130 165 120L164 126Q155 136 146 126Z"]) + P(ruff.replace("L160 196", "L162 202").replace("M86 196", "M84 202")),
        P(j_cap) + P(j_back) + P(j_top) + P(j_front),
        C(54, 88, 9, TEAM, ' stroke="#0B0705" stroke-width="3"') + C(126, 22, 9, TEAM, ' stroke="#0B0705" stroke-width="3"') +
        C(196, 62, 9, TEAM, ' stroke="#0B0705" stroke-width="3"'),
    ]))

# 15 Rol Çalan — kapüşon, domino maske, elinde çalınmış maske
thief_head = ("M96 70C104 46 140 40 158 58C163 64 165 72 165 80L173 81L174 98L168 100L178 106L166 110L169 120L163 125"
              "L166 136C160 148 150 152 142 152L144 190H100L102 146C88 132 86 92 96 70Z")
tails = "M98 84C82 80 70 86 60 98L70 101C78 94 86 92 98 94ZM98 92C86 94 76 104 70 116L80 116C84 108 90 102 100 100Z"
stolen = "M198 174C206 168 222 168 230 174C232 192 226 206 214 210C202 206 196 192 198 174Z"
add(id="thief", tr="Rol Çalan", en="Thief", team="neutral",
    large=lambda: "".join([
        P(TORSO, holes=band_holes(kind="mix") + [circ(58, 256, 3), circ(70, 270, 3), circ(58, 284, 3), circ(82, 256, 3)]),
        P(HOOD, holes=[circ(150, 40, 2.4), circ(166, 50, 2.4), circ(84, 150, 2.4)]),
        P(tails),
        group("head", P(thief_head, holes=[almond(156, 89, 6, 4)])),
        arm_group(S("M216 224L214 208", 4) + P(stolen, TEAM, ' stroke="#0B0705" stroke-width="3"') +
                  P(almond(207, 184, 4, 2.5)) + P(almond(221, 184, 4, 2.5)) + S("M206 196Q214 203 222 196", 2.5)),
    ]),
    small=lambda: "".join([
        P(SHOULDERS_S), P(HOOD), P(tails),
        P(thief_head.replace("L173 81L174 98", "L176 79L177 100"), holes=[almond(155, 89, 9, 5.5)]),
        P("M176 150C186 142 206 142 216 150C218 172 210 190 196 196C182 190 174 172 176 150Z", TEAM, ' stroke="#0B0705" stroke-width="4"') +
        P(almond(187, 162, 5, 3)) + P(almond(205, 162, 5, 3)) + S("M186 176Q196 186 206 176", 4),
    ]))

# ---------- yazım ----------
HEADER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">'

def large_svg(ch):
    body = ch["large"]()
    return (HEADER.format(vb="0 0 240 320") +
            f'<!-- {ch["id"]} · {ch["tr"]} / {ch["en"]} · Vampir Köylü gölge kukla v1 · #TEAM = takım rengi -->'
            + body + "</svg>\n")

SMALL_T = "matrix(.3333 0 0 .3333 -11.333 -3.333)"  # kırpma: x 34–226, y 10–202

def small_svg(ch):
    return (HEADER.format(vb="0 0 64 64") +
            f'<!-- {ch["id"]}-small · {ch["tr"]} · 40–56 px için sadeleştirilmiş -->'
            f'<g transform="{SMALL_T}">' + ch["small"]() + "</g></svg>\n")

if __name__ == "__main__":
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for ch in CH:
        open(os.path.join(out, f'{ch["id"]}.svg'), "w").write(large_svg(ch))
        open(os.path.join(out, f'{ch["id"]}-small.svg'), "w").write(small_svg(ch))
    print(len(CH), "karakter yazıldı")
