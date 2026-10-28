#!/usr/bin/env python3
"""brand/: logo.svg (yazı tipsiz path), icon-1024.png, adaptive-*.png, splash.png"""
import os, sys, asyncio, re
sys.path.insert(0, os.path.dirname(__file__))
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from portraits import f, diamond, circ, star4, CH, small_svg, large_svg
from scenes import bat, poly

FD = "/home/claude/fonts/fontsource-cinzel-5.0.8/files/"
FONTS = [TTFont(FD + "cinzel-latin-900-normal.woff"), TTFont(FD + "cinzel-latin-ext-900-normal.woff")]

def glyph(ch):
    for t in FONTS:
        cm = t.getBestCmap()
        if ord(ch) in cm:
            gs = t.getGlyphSet(); name = cm[ord(ch)]
            return gs, name, gs[name].width
    raise KeyError(ch)

def text_path(txt, x, base, size, track=0.0):
    s = size / 1000; d = ""; cx = x
    for ch in txt:
        gs, name, adv = glyph(ch)
        pen = SVGPathPen(gs, ntos=lambda v: f(v))
        gs[name].draw(TransformPen(pen, (s, 0, 0, -s, cx, base)))
        d += pen.getCommands()
        cx += adv * s + track * size
    return d, cx - x - track * size

def width(txt, size, track=0.0):
    return text_path(txt, 0, 0, size, track)[1]

def logo_svg():
    W1 = width("VAMPİR", 120, 0.04)
    size2 = 120; tr2 = 0.04
    w2 = width("KÖYLÜ", size2, tr2)
    tr2 = tr2 + (W1 - w2) / size2 / 4  # 5 harf, 4 aralık: genişlikleri eşitle
    pad = 24
    VW = W1 + pad * 2
    d1, _ = text_path("VAMPİR", pad, 190, 120, 0.04)
    d2, _ = text_path("KÖYLÜ", pad, 372, size2, tr2)
    cx = VW / 2
    # ayraç: delikli deri şerit
    div = poly([(pad, 212), (VW - pad, 212), (VW - pad, 217), (pad, 217)])
    dots = "".join(circ(pad + 30 + i * (W1 - 60) / 15, 230, 3) for i in range(16) if i not in (7, 8))
    orn = diamond(cx, 230, 9, 13) + dots
    batd = bat(cx, 46, 4.2)
    H = 400
    defs = ('<linearGradient id="logo-lamp" x1="0" y1="60" x2="0" y2="380" gradientUnits="userSpaceOnUse">'
            '<stop offset="0" stop-color="#F8CF8C"/><stop offset=".55" stop-color="#E9A456"/><stop offset="1" stop-color="#E08A3C"/></linearGradient>')
    shadow = f'<g id="shadow" transform="translate(0 6)" opacity=".85"><path fill="#3A1A0C" d="{d1}{d2}"/></g>'
    body = (f'<g id="bat"><!-- pivot: {f(cx)},46 (kanat: scaleY 1→.6, 300 ms) --><path fill="url(#logo-lamp)" d="{batd}"/></g>'
            f'{shadow}<g id="word"><path fill="url(#logo-lamp)" d="{d1}{d2}"/></g>'
            f'<g id="divider"><path fill="url(#logo-lamp)" d="{div}"/><path fill="#E08A3C" d="{orn}"/></g>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(VW)} {H}">'
            f'<!-- Vampir Köylü logosu · Cinzel Black harfleri path olarak (OFL) · zemin: #0B0705 üzerinde kullanın -->'
            f'<defs>{defs}</defs>{body}</svg>\n'), VW, H

def vampire_bust(team="#C8392B"):
    ch = next(c for c in CH if c["id"] == "vampire")
    s = small_svg(ch).replace("#TEAM", team)
    s = re.sub(r"^<svg[^>]*>", "", s.strip())[:-6]
    return re.sub(r"<!--.*?-->", "", s)

LAMP_BG = ('<radialGradient id="ib" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#F8CF8C"/>'
           '<stop offset=".45" stop-color="#E08A3C"/><stop offset=".8" stop-color="#6A2D10"/><stop offset="1" stop-color="#1A0D07"/></radialGradient>')

def icon_svg(fg=True, bg=True, safe=1.0):
    # 64 birimlik büst; güvenli alan için ölçek
    s = 1024 / 64 * safe; off = (1024 - 64 * s) / 2
    out = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><defs>{LAMP_BG}</defs>'
    if bg:
        out += '<rect width="1024" height="1024" fill="url(#ib)"/>'
    if fg:
        out += f'<g transform="translate({f(off)} {f(off + 30*safe)}) scale({f(s)})">{vampire_bust()}</g>'
    return out + "</svg>"

async def render(svg, w, h, png, bg="transparent"):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": w, "height": h})
        await pg.set_content(f"<html><body style='margin:0;background:{bg}'>{svg}</body></html>")
        await pg.screenshot(path=png, omit_background=(bg == "transparent"), clip={"x": 0, "y": 0, "width": w, "height": h})
        await b.close()

if __name__ == "__main__":
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    logo, LW, LH = logo_svg()
    open(f"{out}/logo.svg", "w").write(logo)
    async def all_():
        await render(icon_svg(), 1024, 1024, f"{out}/icon-1024.png", "#0B0705")
        await render(icon_svg(bg=False, safe=0.62), 1024, 1024, f"{out}/adaptive-foreground.png")
        await render(icon_svg(fg=False), 1024, 1024, f"{out}/adaptive-background.png", "#0B0705")
        lw = 900; lh = lw * LH / LW
        sp = logo.replace("<svg ", f"<svg width='{lw}' height='{f(lh)}' style='position:absolute;left:{f((1284-lw)/2)}px;top:{f((2778-lh)/2)}px' ", 1)
        await render(sp, 1284, 2778, f"{out}/splash.png", "#0B0705")
    asyncio.run(all_())
    print("ok", LW, LH)
