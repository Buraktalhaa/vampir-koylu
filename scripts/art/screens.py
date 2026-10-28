#!/usr/bin/env python3
"""S4–S12 ekran artboard'ları (.dc.html). Statik işaretleme; tuval ve PNG için aynı kaynak."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cells import cell, AV, NIGHT_BG, DAY_BG

OUT = "/tmp/claude-0/-home-claude/8c2fdc4c-fc16-5f98-aade-fd607b902ce0/scratchpad/vk/project/"
B = lambda i: f"/_blob/{i}"
P = {  # portre blob id'leri (renkli önizleme)
 "villager": ("f7c88d79cfa5062915ac4a4145678c46", "ae2f343680cc5fbdd41419683a48ae67"),
 "vampire": ("2eff9efa7e5bd08c9e00dcf7ecb3dc0d", "7cd1c1c47ad07df7d06ae8be48292280"),
 "seer": ("1184a6d5b9f7cae1ddff1a7d1f42c5da", "43bdf8c34318040cc02c3f5ac38bdccc"),
 "healer": ("b5110093165c1f82a3f6834b8324318d", "12edcce6f92eebe9b0226fc43e78c928"),
 "avenger": ("b33d61ced483fbc399b61569f4c22263", "ae436a1421177f4741f3b9544c560524"),
 "witch": ("ec965410d469d73d7cdf02e82d02f0a7", "1ee5dd7e7463e69e15d6fe75cf099279"),
 "mayor": ("cff11b963450a0bee4ba21d0c270cde7", "6f7110133663d08ebc3c4ef6eb0892bf"),
 "bodyguard": ("a81803a654ed0dbf6a924c4b07ca75d8", "d4fdec66f4eb64dda6eca63b56a64ed1"),
 "visitor": ("a36d0a46610c2f4742f90d66eac83d91", "579e475ce64218fd057f62541907b800"),
 "detective": ("7db1ae4f922cfbbb61ff1cd2f0040449", "cf7363e2911e3ecf4f8dd7f1bcbab033"),
 "loneVampire": ("38bec384156c6602a6f347379de436c5", "cae713ea8cc189e3921eb1297227411d"),
 "cursed": ("ade8c06bd30b69a052fb1de0f0511c1a", "96292fcfa90f304002403f1ed32935d3"),
 "shaman": ("8af985356d104bbf84f42ab59dab275c", "44c16d7973a29212a762f44623f05cd4"),
 "jester": ("34235cbd822a04d8ef526eb0275f2f7a", "d967ac1d4a1cd0d6588a12790af87d42"),
 "thief": ("d5490c809b6f03fe029e76c1148ba926", "41b253d981710ccfb4bb9cd44c747001"),
}
TEAM = {"village": "#e6c34a", "vampire": "#c8392b", "neutral": "#36a57c"}
EMB = {"village": "1645f992532f027ae9aefb0041f62da1", "vampire": "5bf7c23373ded289036c5c1f22f63c8f", "neutral": "eb5075e7b2a7166d25c9bbd207fe2b7b"}

HEAD = """<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&amp;family=Karla:ital,wght@0,400;0,500;0,700;1,400&amp;display=swap" rel="stylesheet">
<style>
body{{margin:0}}
a{{color:#f3e2c4}}a:hover{{color:#f8cf8c}}
</style>
</helmet>
<div style="position: relative; width: 390px; height: 844px; overflow: hidden; background: {bg}; color: #f3e2c4; font-family: 'Karla', sans-serif">
"""
TAIL = """
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
"""
DAY = "radial-gradient(120% 40% at 50% 0%, rgba(224,138,60,.20) 0%, rgba(22,13,9,0) 70%), #160d09"
NIGHT = "radial-gradient(120% 45% at 50% 0%, rgba(74,58,120,.45) 0%, rgba(14,10,28,0) 70%), #0e0a1c"

def write(name, title, bg, body):
    open(OUT + name + ".dc.html", "w").write(HEAD.format(title=title, bg=bg) + body + TAIL)

# ---------- parçalar ----------
GEAR_N = ('<button aria-label="Menü" style="width: 44px; height: 44px; border-radius: 22px; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer">'
          '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"></circle>'
          '<path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg></button>')
def gear(c="#c2a688"): return GEAR_N.format(c=c)
BACK = ('<button aria-label="Geri" style="width: 44px; height: 44px; border-radius: 22px; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer">'
        '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f3e2c4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg></button>')
MOON = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="{c}"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"></path></svg>'
SUN = ('<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="{c}" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4" fill="{c}"></circle>'
       '<path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>')
LABEL = '<div style="font-size: 12px; font-weight: 700; letter-spacing: .16em; color: {c}">{t}</div>'

def btn_primary(t, extra=""):
    return (f'<button style="height: 56px; border-radius: 28px; border: 2px solid #0b0705; background: linear-gradient(180deg, #f8cf8c 0%, #e08a3c 100%); color: #1a0d07; '
            f'font-family: \'Karla\', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: .12em; box-shadow: 0 0 28px rgba(224,138,60,.35); cursor: pointer; {extra}">{t}</button>')
def btn_primary_night(t, extra=""):
    return (f'<button style="height: 56px; border-radius: 28px; border: 2px solid #0b0705; background: #e9e0f5; color: #0e0a1c; font-family: \'Karla\', sans-serif; font-weight: 700; '
            f'font-size: 15px; letter-spacing: .12em; box-shadow: 0 0 24px rgba(74,58,120,.6); cursor: pointer; {extra}">{t}</button>')
def btn_secondary(t, night=False, extra=""):
    bc = "#7d6cb8" if night else "#e08a3c"
    return (f'<button style="height: 52px; border-radius: 26px; border: 1.5px solid {bc}; background: transparent; color: #f3e2c4; font-family: \'Karla\', sans-serif; font-weight: 700; '
            f'font-size: 15px; letter-spacing: .12em; cursor: pointer; {extra}">{t}</button>')
def btn_text(t, c="#c2a688"):
    return f'<button style="height: 44px; border: 0; background: transparent; color: {c}; font-family: \'Karla\', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer">{t}</button>'
def info_band(t, kind="info"):
    sty = {"info": ("rgba(169,163,201,.12)", "rgba(169,163,201,.35)", "#a9a3c9", "#f3e2c4"),
           "warn": ("rgba(224,138,60,.14)", "rgba(224,138,60,.45)", "#f8cf8c", "#f3e2c4"),
           "error": ("rgba(224,100,79,.14)", "rgba(224,100,79,.5)", "#e0644f", "#f3c9c0")}[kind]
    icon = {"info": '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7.5v.5"></path>',
            "warn": '<path d="M12 3l10 18H2z"></path><path d="M12 10v5M12 18v.5"></path>',
            "error": '<circle cx="12" cy="12" r="9"></circle><path d="M9 9l6 6M15 9l-6 6"></path>'}[kind]
    return (f'<div style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 12px; background: {sty[0]}; border: 1px solid {sty[1]}; color: {sty[3]}; font-size: 14px; line-height: 20px">'
            f'<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="{sty[2]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0">{icon}</svg><span>{t}</span></div>')
def portrait_circle(role, team_color, size=44, bg=DAY_BG, small=True):
    inner = size - 4
    return (f'<div style="width: {size}px; height: {size}px; border-radius: {size//2}px; box-sizing: border-box; border: 2px solid {team_color}; background: {bg}; overflow: hidden; flex-shrink: 0">'
            f'<img src="{B(P[role][1] if small else P[role][0])}" alt="" style="width: {inner}px; height: {inner}px; display: block"></div>')
def team_chip(team, t):
    c = TEAM[team]
    return (f'<div style="display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px 0 8px; border-radius: 14px; border: 1.5px solid {c}; color: {c}; font-size: 12px; font-weight: 700; letter-spacing: .16em">'
            f'<img src="{B(EMB[team])}" alt="" style="width: 16px; height: 16px">{t}</div>')
def fill(h): return f'<div style="flex-grow: 1; min-height: {h}px"></div>'

# ---------- S4 gece hedef seçimi ----------
def s4():
    cells = "".join([cell("Ayşe (sen)", "02", "disabled"), cell("Mehmet", "05", "dead"), cell("Zeynep", "06"), cell("Can", "01"), cell("Elif", "10", "selected"),
                     cell("Burak", "07"), cell("Deniz", "03"), cell("Selin", "04"), cell("Emre", "09")])
    body = f"""<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 16px 20px 28px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; gap: 12px; height: 48px">
<div style="width: 48px; height: 48px; border-radius: 24px; box-sizing: border-box; border: 2px solid #5a4a3c; background: {NIGHT_BG}; overflow: hidden"><img src="{B('a2adb7766137198b70ee7dfeb1b56ab5')}" alt="" style="width: 44px; height: 44px; display: block"></div>
<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px">{LABEL.format(c='#a9a3c9', t='GECE 2 · SIRA SENDE')}<div style="font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700">Kâhin</div></div>
{gear('#a9a3c9')}
</div>
<div style="font-size: 16px; line-height: 23px">Bir oyuncu seç. Vampir olup olmadığını öğreneceksin.</div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px">{cells}</div>
{fill(8)}
{info_band('Seçimini kimse görmesin. Onaylayınca ekran kapanır.')}
<div style="display: flex; flex-direction: column; gap: 4px">{btn_primary_night('ELİF\'İ SEÇ VE GİZLE')}{btn_text('Bu gece kimseyi seçme', '#a9a3c9')}</div>
</div>"""
    write("S4-NightTarget", "Gece hedef seçimi", NIGHT, body)

# ---------- S5 sabah raporu ----------
def s5():
    body = f"""<img src="{B('4ebf3286d4b54bc80335dde94e341bbc')}" alt="" style="position: absolute; left: 0; top: 0; width: 390px; height: 844px">
<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 16px 20px 28px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: center; justify-content: space-between; height: 44px">{LABEL.format(c='#1a0d07', t='3. GÜN · SABAH')}{gear('#1a0d07')}</div>
<div style="font-family: 'Cinzel', serif; font-size: 40px; font-weight: 700; line-height: 44px; color: #1a0d07; text-align: center; margin-top: 8px">Sabah oldu</div>
<div style="display: flex; flex-direction: column; gap: 14px; padding: 14px; border-radius: 16px; background: linear-gradient(180deg, rgba(224,138,60,.18) 0%, rgba(26,16,11,0) 60%), #1a100b; border: 2px solid #3a2214; box-shadow: 0 12px 28px rgba(0,0,0,.55); margin-top: 6px">
<img src="{B('35a9820e8761f284480d37e7d1864c21')}" alt="Düşmüş kukla" style="width: 318px; height: 238px; border-radius: 10px; display: block">
<div style="display: flex; align-items: center; gap: 12px">
{portrait_circle('healer', TEAM['village'], 48)}
<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px"><div style="font-family: 'Cinzel', serif; font-size: 26px; font-weight: 700; line-height: 30px">Mehmet</div><div style="font-size: 14px; color: #c2a688">geceyi atlatamadı · rolü <b style="color: #f3e2c4">Şifacı</b></div></div>
</div>
<div>{team_chip('village', 'KÖY TAKIMI')}</div>
</div>
{info_band('Bir oyuncu daha saldırıya uğradı ama kurtarıldı.')}
{fill(4)}
{btn_primary('TARTIŞMAYA GEÇ')}
</div>"""
    write("S5-Morning", "Sabah raporu", "#160d09", body)

# ---------- S6 tartışma ----------
def s6():
    people = [("Ayşe", "02"), ("Zeynep", "06"), ("Can", "01"), ("Elif", "10"), ("Burak", "07"), ("Deniz", "03"), ("Selin", "04"), ("Emre", "09")]
    cells = "".join(cell(n, a, night=False, size=52) for n, a in people)
    C = 659.73; dash = C * 107 / 120
    body = f"""<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 16px 20px 28px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: center; justify-content: space-between; height: 44px"><div style="display: flex; align-items: center; gap: 8px">{SUN.format(c='#f8cf8c')}{LABEL.format(c='#c2a688', t='3. GÜN · TARTIŞMA')}</div>{gear()}</div>
<div style="position: relative; width: 230px; height: 230px; align-self: center; margin-top: 4px">
<svg width="230" height="230" viewBox="0 0 230 230" aria-hidden="true" style="position: absolute; left: 0; top: 0">
<defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8cf8c"></stop><stop offset="1" stop-color="#e08a3c"></stop></linearGradient></defs>
<circle cx="115" cy="115" r="105" fill="rgba(26,16,11,.8)" stroke="#3a2214" stroke-width="10"></circle>
<circle cx="115" cy="115" r="105" fill="none" stroke="url(#ring)" stroke-width="10" stroke-linecap="round" stroke-dasharray="{dash:.1f} {C:.1f}" transform="rotate(-90 115 115)"></circle>
</svg>
<div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px">
<div style="font-family: 'Cinzel', serif; font-size: 56px; font-weight: 900; line-height: 56px">1:47</div>{LABEL.format(c='#c2a688', t='KALAN SÜRE')}</div>
</div>
<div style="font-size: 15px; line-height: 22px; text-align: center; color: #c2a688">Gece olanları konuşun. Süre bitince oylama başlar.</div>
<div style="display: flex; align-items: center; gap: 10px">{LABEL.format(c='#c2a688', t='HAYATTA · 8')}<span style="flex-grow: 1; height: 1px; background: #3a2214"></span></div>
<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px 4px">{cells}</div>
{fill(4)}
<div style="display: grid; grid-template-columns: 1fr 1.4fr; gap: 12px; align-items: center">{btn_secondary('+1 DK')}{btn_primary('ERKEN BİTİR')}</div>
</div>"""
    write("S6-Discussion", "Tartışma", DAY, body)

# ---------- S7 oyun sonu ----------
def s7():
    tl = [("G1", "n", "Can"), ("1", "d", "Burak"), ("G2", "n", "Mehmet"), ("2", "d", "berabere"), ("G3", "n", "—"), ("3", "d", "Zeynep")]
    nodes = ""
    for lab, kind, who in tl:
        if kind == "n":
            circ = f'<div style="width: 36px; height: 36px; border-radius: 18px; background: #2a2050; border: 1.5px solid #4a3a78; display: flex; align-items: center; justify-content: center">{MOON.format(c="#e9e0f5")}</div>'
        else:
            circ = f'<div style="width: 36px; height: 36px; border-radius: 18px; background: #e08a3c; border: 1.5px solid #f8cf8c; display: flex; align-items: center; justify-content: center">{SUN.format(c="#1a0d07")}</div>'
        nodes += f'<div style="display: flex; flex-direction: column; align-items: center; gap: 4px; width: 52px">{circ}<span style="font-size: 11px; color: #c2a688; white-space: nowrap">{who}</span></div>'
    rows = [("Ayşe", "seer", "village", "Kâhin", True), ("Mehmet", "healer", "village", "Şifacı", False), ("Zeynep", "vampire", "vampire", "Vampir", False),
            ("Can", "villager", "village", "Köylü", False), ("Elif", "mayor", "village", "Belediye Başkanı", True), ("Burak", "vampire", "vampire", "Vampir", False),
            ("Deniz", "bodyguard", "village", "Fedai", True), ("Selin", "villager", "village", "Köylü", True), ("Emre", "jester", "neutral", "Deli", True)]
    lst = ""
    for n, r, t, rn, alive in rows:
        op = "1" if alive else ".5"
        lst += (f'<div style="display: flex; align-items: center; gap: 8px; height: 44px; opacity: {op}">{portrait_circle(r, TEAM[t], 34)}'
                f'<div style="display: flex; flex-direction: column; min-width: 0"><span style="font-size: 14px; font-weight: 700{"" if alive else "; text-decoration: line-through"}">{n}</span>'
                f'<span style="font-size: 12px; color: #c2a688; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{rn}</span></div></div>')
    body = f"""<img src="{B('d028b2c070626aa3f55c787f39db2091')}" alt="Köylüler bayrakla sevinçle" style="position: absolute; left: 0; top: 0; width: 390px; height: 292px; display: block">
<div style="position: absolute; left: 0; top: 200px; width: 390px; height: 92px; background: linear-gradient(180deg, rgba(22,13,9,0) 0%, #160d09 100%)"></div>
<div style="position: absolute; left: 0; top: 0; width: 390px; height: 844px; box-sizing: border-box; padding: 250px 20px 28px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
<div style="display: flex; align-items: center; gap: 10px"><img src="{B(EMB['village'])}" alt="" style="width: 32px; height: 32px"><div style="font-family: 'Cinzel', serif; font-size: 40px; font-weight: 700; line-height: 44px; color: #e6c34a">Köy kazandı</div></div>
<div style="font-size: 15px; color: #c2a688">Son vampir 3. gün asıldı · 6 tur</div>
</div>
<div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 6px; border-radius: 14px; background: #1a100b; border: 1.5px solid #3a2214">{nodes}</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 12px">{lst}</div>
{fill(4)}
<div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 12px; align-items: center">{btn_secondary('ANA MENÜ')}{btn_primary('TEKRAR OYNA')}</div>
</div>"""
    write("S7-GameOver", "Oyun sonu", "#160d09", body)

# ---------- S8 ansiklopedi ----------
def tile(role, name):
    return (f'<button style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 0; border: 0; background: transparent; color: #f3e2c4; font-family: \'Karla\', sans-serif; cursor: pointer">'
            f'<div style="width: 104px; height: 138px; border-radius: 52px 52px 10px 10px; background: {DAY_BG}; box-shadow: 0 8px 18px rgba(0,0,0,.45); overflow: hidden">'
            f'<img src="{B(P[role][0])}" alt="" style="width: 104px; height: 138px; display: block"></div>'
            f'<span style="font-family: \'Cinzel\', serif; font-size: 14px; font-weight: 700; line-height: 17px; text-align: center">{name}</span></button>')
def group_head(team, t, n):
    return (f'<div style="display: flex; align-items: center; gap: 8px; height: 24px"><img src="{B(EMB[team])}" alt="" style="width: 20px; height: 20px">'
            f'{LABEL.format(c="#c2a688", t=t)}<span style="flex-grow: 1; height: 1px; background: #3a2214"></span><span style="font-size: 12px; color: #c2a688">{n}</span></div>')
def s8():
    def chip(t, sel=False, dot=None):
        d = f'<span style="width: 10px; height: 10px; border-radius: 5px; background: {dot}"></span>' if dot else ""
        if sel:
            return f'<button style="height: 36px; padding: 0 14px; border-radius: 18px; border: 1.5px solid #f8cf8c; background: rgba(248,207,140,.16); color: #f8cf8c; display: flex; align-items: center; gap: 6px; font-family: \'Karla\', sans-serif; font-weight: 700; font-size: 14px; flex-shrink: 0">{d}{t}</button>'
        return f'<button style="height: 36px; padding: 0 14px; border-radius: 18px; border: 1.5px solid #3a2214; background: transparent; color: #f3e2c4; display: flex; align-items: center; gap: 6px; font-family: \'Karla\', sans-serif; font-weight: 500; font-size: 14px; flex-shrink: 0">{d}{t}</button>'
    body = f"""<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 8px 20px 0; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: center; gap: 8px; height: 48px; margin-left: -12px">{BACK}<div style="flex-grow: 1; font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700">Karakterler</div><span style="font-size: 13px; color: #c2a688">15 rol</span></div>
<label style="display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 16px; border-radius: 24px; border: 1.5px solid #3a2214; background: #0b0705">
<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#c2a688" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>
<input placeholder="Karakter ara" aria-label="Karakter ara" style="flex-grow: 1; border: 0; background: transparent; color: #f3e2c4; font-family: 'Karla', sans-serif; font-size: 16px; outline: none">
</label>
<div style="display: flex; gap: 8px">{chip('Tümü', True)}{chip('Köy', dot='#e6c34a')}{chip('Vampirler', dot='#c8392b')}{chip('Tarafsız', dot='#36a57c')}</div>
{group_head('village', 'KLASİK', '2')}
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 12px">{tile('villager', 'Köylü')}{tile('vampire', 'Vampir')}</div>
{group_head('village', 'KÖY', '9')}
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 12px">{tile('seer', 'Kâhin')}{tile('healer', 'Şifacı')}{tile('avenger', 'İntikamcı')}{tile('witch', 'Büyücü')}{tile('mayor', 'Belediye Başkanı')}{tile('bodyguard', 'Fedai')}</div>
</div>
<div style="position: absolute; left: 0; bottom: 0; width: 390px; height: 90px; background: linear-gradient(180deg, rgba(22,13,9,0) 0%, #160d09 80%)"></div>"""
    write("S8-Encyclopedia", "Karakterler ansiklopedisi", DAY, body)

# ---------- S9 karakter detayı ----------
def s9():
    def tag(t): return f'<span style="display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 13px; border: 1px solid #3a2214; background: #0b0705; font-size: 12px; font-weight: 700; color: #c2a688">{t}</span>'
    body = f"""<div style="position: absolute; left: 0; top: 0; width: 390px; height: 400px; background: radial-gradient(circle at 50% 46%, #f8cf8c 0%, #e08a3c 42%, #6a2d10 80%, #1a0d07 100%)">
<img src="{B(P['seer'][0])}" alt="Kâhin kuklası" style="position: absolute; left: 75px; top: 72px; width: 240px; height: 320px">
<div style="position: absolute; left: 0; top: 330px; width: 390px; height: 70px; background: linear-gradient(180deg, rgba(22,13,9,0) 0%, #160d09 100%)"></div>
<div style="position: absolute; left: 0; top: 0; width: 390px; height: 100px; background: linear-gradient(180deg, rgba(11,7,5,.55) 0%, rgba(11,7,5,0) 100%)"></div>
</div>
<div style="position: absolute; left: 8px; top: 8px; right: 8px; display: flex; align-items: center; justify-content: space-between">
<button aria-label="Kapat" style="width: 44px; height: 44px; border-radius: 22px; border: 0; background: rgba(11,7,5,.5); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f3e2c4" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
<div style="display: flex; gap: 6px"><span style="width: 6px; height: 6px; border-radius: 3px; background: rgba(243,226,196,.5)"></span><span style="width: 6px; height: 6px; border-radius: 3px; background: rgba(243,226,196,.5)"></span><span style="width: 18px; height: 6px; border-radius: 3px; background: #f3e2c4"></span><span style="width: 6px; height: 6px; border-radius: 3px; background: rgba(243,226,196,.5)"></span><span style="width: 6px; height: 6px; border-radius: 3px; background: rgba(243,226,196,.5)"></span></div>
<div style="width: 44px; font-size: 12px; font-weight: 700; color: #f3e2c4; text-align: right">3/15</div>
</div>
<button aria-label="Önceki karakter" style="position: absolute; left: 8px; top: 210px; width: 44px; height: 44px; border-radius: 22px; border: 0; background: rgba(11,7,5,.45); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f3e2c4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg></button>
<button aria-label="Sonraki karakter" style="position: absolute; right: 8px; top: 210px; width: 44px; height: 44px; border-radius: 22px; border: 0; background: rgba(11,7,5,.45); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#f3e2c4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg></button>
<div style="position: absolute; left: 0; top: 372px; width: 390px; box-sizing: border-box; padding: 0 20px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 12px">
<div style="display: flex; flex-direction: column; gap: 2px"><div style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; line-height: 40px">Kâhin</div><div style="font-size: 15px; font-style: italic; color: #c2a688">The Seer</div></div>
{team_chip('village', 'KÖY')}
</div>
<div style="font-size: 16px; line-height: 23px">Geceleri kristal küresine bakar ve bir oyuncunun gerçek yüzünü görür.</div>
<div style="display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: 16px; background: #1a100b; border: 2px solid #3a2214">
{LABEL.format(c='#c2a688', t='YETENEK')}
<div style="display: flex; gap: 12px">
<div style="width: 40px; height: 40px; border-radius: 20px; background: rgba(230,195,74,.16); border: 1.5px solid #e6c34a; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#e6c34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div style="font-weight: 700; font-size: 16px">Gece görüşü</div><div style="font-size: 14px; line-height: 20px; color: #f3e2c4">Her gece bir oyuncu seç; vampir olup olmadığını öğren.</div>
<div style="display: flex; flex-wrap: wrap; gap: 6px">{tag('Her gece')}{tag('1 hedef')}{tag('İlk gece: ayara bağlı')}</div></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 6px">{LABEL.format(c='#c2a688', t='KAZANMA KOŞULU')}<div style="font-size: 15px; line-height: 22px">Bütün vampirler ölünce köyle birlikte kazanır.</div></div>
<div style="display: flex; flex-direction: column; gap: 6px">{LABEL.format(c='#c2a688', t='ÖZEL DURUMLAR')}<div style="font-size: 15px; line-height: 22px">Lanetli'yi köylü olarak görür. Gece Misafiri'nin ziyaret ettiği gece sonuç almaz.</div></div>
</div>
<div style="position: absolute; left: 0; bottom: 0; width: 390px; height: 70px; background: linear-gradient(180deg, rgba(22,13,9,0) 0%, #160d09 85%)"></div>"""
    write("S9-RoleDetail", "Karakter detayı", "#160d09", body)

# ---------- S10 açık oylama ----------
def s10():
    rows = [("Zeynep", "06", 4, True), ("Burak", "07", 2, False), ("Emre", "09", 2, False), ("Can", "01", 0, False), ("Deniz", "03", 0, False), ("Selin", "04", 0, False)]
    out = ""
    for n, a, v, lead in rows:
        bc = "#e08a3c" if lead else "#3a2214"
        bg = "linear-gradient(90deg, rgba(224,138,60,.20) 0%, rgba(26,16,11,0) 70%), #1a100b" if lead else "#1a100b"
        out += (f'<div style="display: flex; align-items: center; gap: 12px; height: 64px; padding: 0 10px 0 10px; border-radius: 16px; background: {bg}; border: 1.5px solid {bc}">'
                f'<div style="width: 44px; height: 44px; border-radius: 22px; box-sizing: border-box; border: 2px solid #3a2214; background: {DAY_BG}; overflow: hidden; flex-shrink: 0"><img src="{B(AV[a])}" alt="" style="width: 40px; height: 40px; display: block"></div>'
                f'<div style="flex-grow: 1; font-size: 16px; font-weight: 700">{n}</div>'
                f'<div style="display: flex; align-items: center; height: 40px; border-radius: 20px; border: 1.5px solid #3a2214; background: #0b0705">'
                f'<button aria-label="{n} oyunu azalt" style="width: 40px; height: 40px; border: 0; background: transparent; color: #f3e2c4; font-size: 20px{"; opacity: .38" if v == 0 else ""}">−</button>'
                f'<div style="width: 30px; text-align: center; font-family: \'Cinzel\', serif; font-size: 20px; font-weight: 700; color: {"#f8cf8c" if lead else "#f3e2c4"}">{v}</div>'
                f'<button aria-label="{n} oyunu artır" style="width: 40px; height: 40px; border: 0; background: transparent; color: #f3e2c4; font-size: 20px">+</button></div></div>')
    body = f"""<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 16px 20px 28px; display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; align-items: center; justify-content: space-between; height: 44px"><div style="display: flex; align-items: center; gap: 8px">{SUN.format(c='#f8cf8c')}{LABEL.format(c='#c2a688', t='3. GÜN · AÇIK OYLAMA')}</div>{gear()}</div>
<div style="display: flex; align-items: baseline; justify-content: space-between"><div style="font-family: 'Cinzel', serif; font-size: 30px; font-weight: 700">Kim asılsın?</div><div style="font-size: 14px; color: #c2a688">Oy <b style="color: #f3e2c4">8 / 9</b></div></div>
<div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; background: rgba(230,195,74,.10); border: 1px solid rgba(230,195,74,.4)">
{portrait_circle('mayor', TEAM['village'], 32)}<div style="font-size: 14px; line-height: 19px">Elif <b>Belediye Başkanı</b>; oyu <b style="color: #f8cf8c">2</b> sayılır.</div></div>
<div style="display: flex; flex-direction: column; gap: 8px">{out}</div>
{fill(4)}
{btn_primary('OYLAMAYI BİTİR')}
</div>"""
    write("S10-Vote", "Açık oylama", DAY, body)

# ---------- S11 karar ----------
def verdict(name, img, title, sub, chip, role=None, team=None, button="GECEYE GEÇ", alt=""):
    rc = ""
    if role:
        rc = (f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; background: #1a100b; border: 1.5px solid #3a2214">'
              f'{portrait_circle(role, TEAM[team], 44)}<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 13px; color: #c2a688">Rolü açıklandı</span>'
              f'<span style="font-family: \'Cinzel\', serif; font-size: 20px; font-weight: 700">Vampir</span></div>{chip}</div>')
    body = f"""<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 16px 20px 28px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; justify-content: space-between; height: 44px">{LABEL.format(c='#c2a688', t='3. GÜN · KARAR')}{gear()}</div>
<img src="{B(img)}" alt="{alt}" style="width: 350px; height: 262px; border-radius: 16px; border: 2px solid #3a2214; display: block; box-shadow: 0 12px 28px rgba(0,0,0,.55)">
<div style="display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center"><div style="font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700; line-height: 40px">{title}</div><div style="font-size: 15px; line-height: 22px; color: #c2a688; max-width: 320px">{sub}</div></div>
{rc}
{fill(4)}
{btn_primary(button)}
</div>"""
    write(name, title, DAY, body)

# ---------- S12 gece bekleme ----------
def s12():
    body = f"""<img src="{B('8b1178b41a752a173ee06493caaa7e32')}" alt="" style="position: absolute; left: 0; top: 0; width: 390px; height: 844px; opacity: .55">
<div style="position: absolute; left: 0; top: 0; width: 390px; height: 300px; background: linear-gradient(180deg, rgba(14,10,28,.85) 0%, rgba(14,10,28,.6) 70%, rgba(14,10,28,0) 100%)"></div>
<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 16px 20px 28px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; gap: 12px; height: 48px">
<div style="width: 48px; height: 48px; border-radius: 24px; box-sizing: border-box; border: 2px solid #5a4a3c; background: {NIGHT_BG}; overflow: hidden"><img src="{B('8ea418a027610da215936b8062e42042')}" alt="" style="width: 44px; height: 44px; display: block"></div>
<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px">{LABEL.format(c='#a9a3c9', t='GECE 2 · SIRA SENDE')}<div style="font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700">Köylü</div></div>
{gear('#a9a3c9')}
</div>
<div style="font-size: 16px; line-height: 23px">Bu gece yapacak bir şeyin yok. Kimse anlamasın diye sen de bir seçim yap.</div>
<div style="display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 16px; background: rgba(22,18,48,.85); border: 2px solid #2e2650">
<div style="position: relative; width: 52px; height: 52px; flex-shrink: 0">
<svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true" style="position: absolute; left: 0; top: 0"><circle cx="26" cy="26" r="22" fill="none" stroke="#2e2650" stroke-width="5"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#e9e0f5" stroke-width="5" stroke-linecap="round" stroke-dasharray="92 138" transform="rotate(-90 26 26)"></circle></svg>
<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700">2</div></div>
<div style="font-size: 14px; line-height: 20px; color: #a9a3c9">Seçenekler birazdan açılacak. Herkes bu ekranda aynı süre kalır.</div>
</div>
{fill(20)}
<div style="display: flex; flex-direction: column; gap: 12px; padding: 18px 16px; border-radius: 16px; background: linear-gradient(180deg, rgba(74,58,120,.25) 0%, rgba(22,18,48,0) 60%), #161230; border: 2px solid #2e2650">
{LABEL.format(c='#a9a3c9', t='GECENİN SORUSU')}
<div style="font-family: 'Cinzel', serif; font-size: 22px; font-weight: 700; line-height: 28px">Vampirden korunmak için hangisini seçerdin?</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; opacity: .5">
<button disabled style="height: 88px; border-radius: 16px; border: 1.5px solid #7d6cb8; background: rgba(14,10,28,.6); color: #f3e2c4; font-family: 'Karla', sans-serif; font-weight: 700; font-size: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px"><span style="font-size: 12px; letter-spacing: .16em; color: #a9a3c9">A</span>Bir ip sarımsak</button>
<button disabled style="height: 88px; border-radius: 16px; border: 1.5px solid #7d6cb8; background: rgba(14,10,28,.6); color: #f3e2c4; font-family: 'Karla', sans-serif; font-weight: 700; font-size: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px"><span style="font-size: 12px; letter-spacing: .16em; color: #a9a3c9">B</span>Gümüş bir kaşık</button>
</div>
</div>
<div style="font-size: 13px; text-align: center; color: #a9a3c9">Seçince ekran kapanır ve telefon sıradakine geçer.</div>
</div>"""
    write("S12-NightWait", "Gece bekleme", NIGHT, body)

if __name__ == "__main__":
    s4(); s5(); s6(); s7(); s8(); s9(); s10()
    verdict("S11-Verdict", "93197ef3447548e667f78c925a59c9e8", "Zeynep asıldı", "Köy kararını verdi: 4 oy. Kuklanın çubuğu kırıldı.",
            team_chip("vampire", "VAMPİR"), role="vampire", team="vampire", alt="Darağacı ve kalabalık")
    verdict("S11b-Tie", "6d4b268ebc21e6eed61ecb40f446b38b", "Beraberlik", "Burak ve Emre 2'şer oy aldı. Bugün kimse asılmadı.",
            "", alt="Dengede bir terazi")
    s12()
    print("ok")
