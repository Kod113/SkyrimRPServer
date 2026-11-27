"""Disegna le mappe degli spawn degli ingredienti, nello stile di team/davide/mappe-spawn.

Uso (dalla cartella tools/):
    python3 disegna_mappe_ingredienti.py ../../../..

Legge team/david/db/ingredient_spawns.json e la mappa di base team/david/mappe-ingredienti/_mappa_base.jpg
(ricostruita dalle mappe di Davide togliendo i cerchi). Scrive in team/david/mappe-ingredienti/:
  - NN_<ingrediente>.jpg   una mappa per ingrediente (rare e leggendarie con la fascia "SOLO STAFF")
  - 00_tutti_pubblica.jpg  comuni e non comuni (si può mettere sul Discord)
  - 00_tutti_staff.jpg     tutti, rare e leggendarie comprese (solo staff)
Conversione coordinate di gioco -> pixel: ricavata dai cerchi delle mappe di Davide (errore < 1 pixel).
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "../../../..")
OUT = os.path.join(ROOT, "team", "david", "mappe-ingredienti")
DATA = json.load(open(os.path.join(ROOT, "team", "david", "db", "ingredient_spawns.json"), encoding="utf-8"))

AX = (0.0075337978, -405.086725)      # pixel x = AX0 * x + AX1
AY = (-0.0075349935, 974.432132)      # pixel y = AY0 * y + AY1
W, H, HEAD, FOOT = 1200, 2247, 108, 2164
BG = (12, 11, 16)
GOLD = (200, 176, 114)
RING = (225, 204, 151)
TITLE = (238, 222, 172)
TEXT = (236, 236, 236)
RAR = {"comune": ((225, 204, 151), "Comune"), "non_comune": ((110, 200, 190), "Non comune"),
       "rara": ((190, 140, 230), "Rara"), "leggendaria": ((235, 90, 80), "Leggendaria")}
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
if not os.path.exists(FONT):
    FONT = FONT_B


def f(size, bold=True):
    return ImageFont.truetype(FONT_B if bold else FONT, size)


def px(x, y):
    return AX[0] * x + AX[1], AY[0] * y + AY[1]


def base():
    im = Image.open(os.path.join(OUT, "_mappa_base.jpg")).convert("RGB")
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, HEAD - 1], fill=BG)
    d.rectangle([0, FOOT + 2, W, H], fill=BG)
    d.line([0, HEAD + 1, W, HEAD + 1], fill=GOLD, width=3)
    d.line([0, FOOT, W, FOOT], fill=GOLD, width=3)
    return im, d


def marker(d, x, y, col, r=13):
    cx, cy = px(x, y)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (60,), outline=col + (255,), width=3)
    d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=col + (255,))


def staff_band(d):
    d.rectangle([0, HEAD + 4, W, HEAD + 44], fill=(120, 25, 25))
    d.text((W / 2, HEAD + 24), "SOLO STAFF  -  NON PUBBLICARE: questi luoghi si scoprono giocando", font=f(19), fill=(255, 235, 225), anchor="mm")


def header(d, title, sub):
    d.text((20, 10), title, font=f(40), fill=TITLE)
    d.text((22, 66), sub, font=f(19), fill=(220, 220, 220))


def footer(d, l1, l2):
    d.text((22, 2182), l1, font=f(17), fill=TEXT)
    d.text((22, 2212), l2, font=f(16), fill=TEXT)


def save(im, name):
    im.convert("RGB").save(os.path.join(OUT, name), quality=90)


RESP = lambda m: "solo al riavvio del server" if m == 0 else (f"ogni {m} minuti" if m < 60 else f"ogni {m // 60} or{'a' if m == 60 else 'e'}")

# una mappa per ingrediente
for n, g in enumerate(DATA["ingredients"], start=1):
    im, d0 = base()
    over = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for p in DATA["points"]:
        if p["ingredient"] == g["id"]:
            marker(d, p["center"]["x"], p["center"]["y"], RING)
    im = Image.alpha_composite(im.convert("RGBA"), over)
    d = ImageDraw.Draw(im)
    header(d, g["name_it"], f"{RAR[g['rarity']][1]}  -  {g['plants_per_point']} piant{'a' if g['plants_per_point'] == 1 else 'e'} per punto  -  rinasce {RESP(g['respawn_min'])}")
    if not g["public_map"]:
        staff_band(d)
    pn = lambda n: f"{n} punt{'o' if n == 1 else 'i'}"
    footer(d, f"Windhelm: {pn(g['points_windhelm'])}   |   Riften: {pn(g['points_riften'])}   |   Ingrediente: {g['name_it']} ({g['name_en']})",
           f"Dove: {g['lore']}")
    save(im, f"{n:02d}_{g['id']}.jpg")

# mappe riassuntive
for name, keep, staff in (("00_tutti_pubblica.jpg", ("comune", "non_comune"), False),
                          ("00_tutti_staff.jpg", ("comune", "non_comune", "rara", "leggendaria"), True)):
    im, _ = base()
    over = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    pts = [p for p in DATA["points"] if p["rarity"] in keep]
    for p in sorted(pts, key=lambda p: list(RAR).index(p["rarity"])):
        marker(d, p["center"]["x"], p["center"]["y"], RAR[p["rarity"]][0], r=9 if p["rarity"] in ("comune", "non_comune") else 12)
    im = Image.alpha_composite(im.convert("RGBA"), over)
    d = ImageDraw.Draw(im)
    header(d, "Ingredienti", "Piante e funghi raccoglibili  -  " + ("tutti i punti" if staff else "comuni e non comuni"))
    if staff:
        staff_band(d)
    x = 22
    for r in keep:
        col, lab = RAR[r]
        d.ellipse([x, 2186, x + 14, 2200], fill=col)
        cnt = sum(1 for p in pts if p["rarity"] == r)
        t = f"{lab}: {cnt} punti"
        d.text((x + 22, 2193), t, font=f(17), fill=TEXT, anchor="lm")
        x += 50 + d.textlength(t, font=f(17))
    w = sum(1 for p in pts if p["hold"] == "Windhelm")
    footer(d, "", f"Windhelm: {w} punti   |   Riften: {len(pts) - w} punti   |   Una mappa per ingrediente nella stessa cartella")
    save(im, name)
print("mappe scritte in", OUT)
