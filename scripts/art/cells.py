AV={"01":"eab59a6a8c104cd0fef05f768a45cbb4","02":"cc47cc5eaa0170607eb4ffef17103677","03":"429e1e3a8e5cae2b198e2d5bd21b40a3","04":"e9df06ef06a42335316222b7c5e98b14","05":"288b06abb2865509459ebd2832bfeab2","06":"173dba4277e147d4fde2d8561bc3cee9","07":"2ce43fd0c52bc277c05c637976aa4130","08":"bb3aa57f59ab57817b120614774b2c4e","09":"1f45fa30aeb97342b1f9c1b51fed7b80","10":"3efa05c6039b70fcc4d9801e1ccffec0"}
NIGHT_BG="radial-gradient(circle at 50% 40%, #7a68b4 0%, #3a2e6a 55%, #161230 100%)"
DAY_BG="radial-gradient(circle at 50% 40%, #f8cf8c 0%, #e08a3c 50%, #6a2d10 100%)"
def cell(name, av, state="normal", night=True, size=64, extra_badge=""):
    bg = NIGHT_BG if night else DAY_BG
    ring = "#2e2650" if night else "#3a2214"
    sel = "#e9e0f5" if night else "#f8cf8c"
    op_av = "1"; name_style = "color: #f3e2c4; font-weight: 500"; border = f"2px solid {ring}"; cellbg = "transparent"; glow = ""; badge = ""; cell_op = "1"
    if state == "selected":
        border = f"3px solid {sel}"; glow = f"box-shadow: 0 0 16px rgba(233,224,245,.45);" if night else "box-shadow: 0 0 16px rgba(248,207,140,.5);"
        name_style = f"color: {sel}; font-weight: 700"; cellbg = "rgba(233,224,245,.08)" if night else "rgba(248,207,140,.10)"
        badge = (f'<div style="position: absolute; right: -4px; top: -4px; width: 22px; height: 22px; border-radius: 11px; background: {sel}; display: flex; align-items: center; justify-content: center">'
                 f'<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#0e0a1c" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"></path></svg></div>')
    if state == "dead":
        op_av = ".35"; border = "2px dashed rgba(194,166,136,.5)"; name_style = "color: #c2a688; text-decoration: line-through; font-weight: 500"
        badge = ('<div style="position: absolute; right: -2px; bottom: -2px; width: 22px; height: 22px; border-radius: 11px; background: #0b0705; border: 1.5px solid #3a2214; display: flex; align-items: center; justify-content: center">'
                 '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill="#c2a688"><path d="M6 22V9a6 6 0 0 1 12 0v13z"></path></svg></div>')
    if state == "disabled":
        cell_op = ".38"
    initial = "" if state == "dead" else (f'<div style="position: absolute; right: -2px; bottom: -2px; width: 22px; height: 22px; border-radius: 11px; background: #0b0705; border: 1.5px solid {ring}; '
               f'display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #f3e2c4">{name[0]}</div>')
    inner = size - 4
    return (f'<button style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px 8px; border-radius: 16px; border: 0; background: {cellbg}; opacity: {cell_op}; font-family: \'Karla\', sans-serif; cursor: pointer">'
            f'<div style="position: relative; width: {size}px; height: {size}px">'
            f'<div style="width: {size}px; height: {size}px; border-radius: {size//2}px; box-sizing: border-box; border: {border}; background: {bg}; overflow: hidden; {glow}">'
            f'<img src="/_blob/{AV[av]}" alt="" style="width: {inner}px; height: {inner}px; display: block; opacity: {op_av}"></div>{initial}{badge}{extra_badge}</div>'
            f'<span style="font-size: 14px; {name_style}">{name}</span></button>')
