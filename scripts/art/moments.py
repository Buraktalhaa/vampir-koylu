#!/usr/bin/env python3
"""Dramatik an görselleri (moments/), viewBox 0 0 320 240."""
import os, sys, random, math
sys.path.insert(0, os.path.dirname(__file__))
from portraits import f, circ, almond, diamond, star4, slot, S, C, ring, SIL, BRASS, GLOW
from scenes import (poly, path, village_row, crowd, flame, bat, castle, fence, spire, house, tree_svg,
                    portrait_inner, stars, uniq_ids)

MW, MH = 320, 240

def defs_bg(stops, cx=160, cy=90, r=260, gid="sky"):
    st = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for c, o in stops)
    return f'<radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}" gradientUnits="userSpaceOnUse">{st}</radialGradient>'

LAMP = [("#F8CF8C", 0), ("#E08A3C", .42), ("#6A2D10", .8), ("#1A0D07", 1)]
DIM = [("#D08A50", 0), ("#8A4420", .45), ("#3A180A", .8), ("#120B08", 1)]
NIGHTS = [("#4A3A78", 0), ("#2A2050", .5), ("#0E0A1C", 1)]

def frame(name, defs, body, note=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {MW} {MH}">'
            f'<!-- {name} · Vampir Köylü an görseli · #TEAM = takım rengi {note} -->'
            f'<defs>{defs}</defs><rect width="{MW}" height="{MH}" fill="url(#sky)"/>{body}</svg>\n')

def puppet_t(cid, prefix, transform, team="#TEAM", no_arm=False):
    inner = portrait_inner(cid, prefix, team)
    if no_arm:
        import re
        inner = re.sub(r'<g id="' + prefix + r'-arm">.*?</g>', "", inner)
    return f'<g id="{prefix}" transform="{transform}">{inner}</g>'

def ground_strip(y, color=SIL):
    return path(f"M-10 {y}Q80 {y-6} 160 {y}T330 {y-2}V250H-10Z", color)

def m_death():
    body = path(village_row(5, -10, 330, 176, 18, 30, 22, 34, lit=0)[0], "#5A2610", ' opacity=".9"')
    body += ground_strip(196)
    # düşmüş kukla: yatık büst
    body += puppet_t("villager", "figure", "translate(70 206) rotate(-90) scale(.4)", no_arm=True)
    # kopmuş çubuk
    rod = poly([(232, 198), (236, 128), (239, 128), (236, 198)]) + poly([(236, 126), (233, 118), (240, 121), (239, 128)])
    rod += poly([(70, 206), (128, 186), (129, 189), (71, 209)])
    body += f'<g id="rod"><!-- pivot: 236,198 (dik parça hafifçe titrer) -->{path(rod, SIL)}</g>'
    # sönmüş mum + duman
    body += path(poly([(262, 198), (262, 168), (274, 168), (274, 198)]) + poly([(256, 200), (280, 200), (276, 194), (260, 194)]), SIL)
    body += f'<g id="smoke"><!-- pivot: 268,166 (yukarı süzülür, opaklık 1→0, 2400 ms) --><path fill="none" stroke="#F3E2C4" stroke-opacity=".55" stroke-width="2" stroke-linecap="round" d="M268 166C260 156 276 148 268 138C262 130 272 122 268 112"/></g>'
    return frame("death · sabah ölüm duyurusu", defs_bg(DIM), body, "(figure kakması: rol açıklanmazsa team.hidden)")

def rooster(x, y, s=1.0):
    pts = [(0, 0), (-4, -6), (-10, -10), (-20, -6), (-26, -16), (-22, -24), (-16, -18), (-12, -22), (-6, -20), (-2, -24), (2, -34), (6, -38),
           (10, -42), (14, -40), (16, -46), (18, -40), (22, -42), (20, -36), (26, -34), (20, -30), (16, -24), (14, -14), (10, -4), (6, 0)]
    d = poly([(x + px * s, y + py * s) for px, py in pts])
    d += poly([(x - 2 * s, y), (x - 2 * s, y + 10 * s), (x, y + 10 * s), (x, y)]) + poly([(x + 4 * s, y), (x + 4 * s, y + 10 * s), (x + 6 * s, y + 10 * s), (x + 6 * s, y)])
    return d

def m_nodeath():
    sky = defs_bg(LAMP, cy=170, r=240)
    body = C(160, 176, 70, "#FFF1C8", ' opacity=".22"') + C(160, 176, 40, "#FFF1C8", ' opacity=".5"')
    vd, vw = village_row(7, -10, 330, 182, 22, 40, 26, 44, lit=0)
    body += path(vd + "M-10 180H330V250H-10Z", "#5A2610")
    body += path(fence(-10, 330, 214, 30, 16, spikes=False) + "M-10 212Q160 204 330 214V250H-10Z", SIL)
    body += f'<g id="rooster"><!-- pivot: 228,190 (öter: rotate 0→-12°→0, 700 ms) -->{path(rooster(222, 190, 1.4), SIL)}</g>'
    body += path(poly([(216, 188), (216, 182), (236, 182), (236, 188)]), SIL)
    body += S("M258 136q8 -6 14 0M262 126q10 -8 20 0", 2.4, SIL, ' opacity=".7"')
    return frame("no-death · bu gece kimse ölmedi", sky, body)

def m_lynch():
    body = path(village_row(11, -10, 330, 150, 14, 26, 18, 30, lit=0)[0] + "M-10 148H330V250H-10Z", "#5A2610", ' opacity=".9"')
    gal = poly([(120, 176), (120, 46), (128, 46), (128, 176)]) + poly([(114, 46), (206, 46), (206, 54), (114, 54)])
    gal += poly([(124, 80), (152, 50), (157, 55), (129, 85)]) + poly([(94, 178), (94, 168), (226, 168), (226, 178)])
    body += path(gal, "#2A1208")
    body += f'<g id="rope"><!-- pivot: 194,54 (±5°, 2600 ms gidip gelir) -->{S("M194 54V88", 2.4, "#2A1208")}<ellipse cx="194" cy="98" rx="8" ry="11" fill="none" stroke="#2A1208" stroke-width="3"/></g>'
    cd, cs, cf = crowd(13, -20, 340, 252, 52, 70)
    body += f'<g id="crowd"><!-- kalabalık: translateY 0↔-3, 900 ms, dirgenler sallanır -->{path(cd, SIL)}<path fill="none" stroke="{SIL}" stroke-width="3" stroke-linecap="round" d="{"".join(cs)}"/>{"".join(flame(x, y) for x, y in cf)}</g>'
    return frame("lynch · darağacı", defs_bg(DIM, cy=60), body)

def m_tie():
    body = path(village_row(17, -10, 330, 160, 18, 30, 22, 36, lit=0)[0] + "M-10 158H330V250H-10Z", "#5A2610", ' opacity=".85"')
    post = poly([(157, 200), (157, 56), (163, 56), (163, 200)]) + poly([(140, 204), (180, 204), (172, 196), (148, 196)])
    post += C(160, 54, 6)[0:0]
    body += path(post, SIL) + C(160, 52, 6)
    beam = poly([(96, 62), (224, 62), (224, 67), (96, 67)])
    pans = ""
    for x in (100, 220):
        pans += f"M{x} 66L{x-18} 112M{x} 66L{x+18} 112"
    bowl = "".join(f"M{x-24} 112H{x+24}Q{x+20} 128 {x} 128Q{x-20} 128 {x-24} 112Z" for x in (100, 220))
    body += f'<g id="scale"><!-- pivot: 160,64 (terazi ±6° salınıp 0°da durur, 1800 ms, cubic-bezier(.34,1.56,.64,1)) -->{path(beam + bowl, SIL)}<path fill="none" stroke="{SIL}" stroke-width="1.6" d="{pans}"/></g>'
    cd, cs, cf = crowd(19, -20, 120, 256, 50, 64, props=False)
    cd2, cs2, cf2 = crowd(19, 200, 340, 256, 50, 64, props=False)
    body += path(cd + cd2, SIL)
    return frame("tie · beraberlik, kimse asılmadı", defs_bg(LAMP, cy=70), body)

def banner(x, y, team="#TEAM"):
    pole = poly([(x, y + 150), (x, y), (x + 4, y), (x + 4, y + 150)])
    flag = f"M{x+4} {y+6}C{x+30} {y} {x+44} {y+14} {x+70} {y+8}L{x+62} {y+30}L{x+72} {y+50}C{x+46} {y+56} {x+30} {y+42} {x+4} {y+48}Z"
    return (path(pole, SIL) + f'<g id="flag"><!-- pivot: {x+4},{y+26} (dalgalanma skewY ±4°, 1600 ms) -->'
            f'<path fill="{team}" stroke="{SIL}" stroke-width="3" stroke-linejoin="round" d="{flag}"/>'
            f'{path(star4(x+34, y+28, 9), SIL)}</g>')

def m_win_village():
    body = C(160, 110, 110, "#FFF1C8", ' opacity=".18"')
    body += path(village_row(23, -10, 330, 170, 20, 34, 26, 40, lit=0)[0] + "M-10 168H330V250H-10Z", "#8A3C16", ' opacity=".9"')
    body += banner(214, 34)
    body += puppet_t("seer", "p1", "translate(10 70) scale(.5)")
    body += puppet_t("mayor", "p3", "translate(310 72) scale(-.5 .5)")
    body += puppet_t("villager", "p2", "translate(98 52) scale(.6)")
    return frame("win-village · köy kazandı", defs_bg(LAMP, cy=110, r=230), body)

def m_win_vampire():
    body = stars(29, 30, 120).replace(f'cx=', 'cx=')
    body = "".join(s for s in [body])
    body += C(230, 70, 38, "#TEAM", ' opacity=".9"') + C(230, 70, 56, "#TEAM", ' opacity=".18"')
    cd, cw = castle(232, 168, 0.72)
    body += path(cd + "M-10 168Q120 150 330 166V250H-10Z", "#171030")
    from scenes import wins_svg
    body += wins_svg(cw, "#F6C27A", ' opacity=".9"')
    bats = "".join(path(bat(x, y, s), SIL) for x, y, s in [(90, 40, 1.2), (130, 26, .9), (190, 50, .8), (280, 34, 1.0)])
    body += f'<g id="bats"><!-- her yarasa scaleY 1→.5, 300 ms; grup sağa süzülür -->{bats}</g>'
    body += puppet_t("shaman", "p2", "translate(330 82) scale(-.5 .5)")
    body += puppet_t("vampire", "p1", "translate(-10 60) scale(.6)")
    return frame("win-vampire · vampirler kazandı", defs_bg(NIGHTS, cx=230, cy=70, r=300), body, "(kanlı ay da #TEAM)")

def m_win_neutral():
    spot = ('<linearGradient id="spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C8" stop-opacity=".5"/>'
            '<stop offset="1" stop-color="#FFF1C8" stop-opacity=".08"/></linearGradient>')
    body = path("M140 -4H180L250 200H70Z", "url(#spot)")
    body += f'<ellipse cx="160" cy="204" rx="92" ry="12" fill="#FFF1C8" opacity=".18"/>'
    body += path("M-10 200H330V250H-10Z", SIL)
    curtain = "M-10 -10H40C34 40 44 120 30 200H-10Z" + "M330 -10H280C286 40 276 120 290 200H330Z"
    body += path(curtain, "#2A1208")
    body += path("M-10 -10H330V14C300 24 270 8 240 18C210 28 180 10 160 20C140 10 110 28 80 18C50 8 20 24 -10 14Z", "#3A1A0C")
    body += puppet_t("jester", "p1", "translate(82 22) scale(.56)")
    return frame("win-neutral · tarafsız kazandı", defs_bg([("#3A2A20", 0), ("#1A100B", .6), ("#0B0705", 1)], cy=40) + spot, body,
                 "(Deli kazandıysa bu; diğer tarafsızlar için portre değiştirilebilir)")

MOMENTS = {"death": m_death, "no-death": m_nodeath, "lynch": m_lynch, "tie": m_tie,
           "win-village": m_win_village, "win-vampire": m_win_vampire, "win-neutral": m_win_neutral}

if __name__ == "__main__":
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k, fn in MOMENTS.items():
        open(os.path.join(out, k + ".svg"), "w").write(uniq_ids(fn(), k))
    print("ok", len(MOMENTS))
