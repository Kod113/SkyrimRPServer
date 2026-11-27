"""Disegna le mappe degli spawn degli ingredienti, nello stesso stile di team/davide/mappe-spawn.

Uso (dalla cartella tools/):
    python3 disegna_mappe_ingredienti.py ../../../..

Legge team/david/db/ingredient_spawns.json e la mappa di base team/david/mappe-ingredienti/_mappa_base.jpg
(ricostruita dalle mappe di Davide togliendo i cerchi). Scrive in team/david/mappe-ingredienti/:
  - NN_<ingrediente>.jpg   una mappa per ingrediente (rare e leggendarie con la fascia "SOLO STAFF")
  - 00_tutti_pubblica.jpg  comuni e non comuni (si può mettere sul Discord)
  - 00_tutti_staff.jpg     tutti, rare e leggendarie comprese (solo staff)

Stile come le mappe degli animali: ogni ingrediente ha il suo colore (COLORI qui sotto), usato per le
due righe orizzontali e per i cerchi; nelle mappe riassuntive ogni ingrediente ha il suo colore e
la legenda in basso.
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
TITLE = (240, 223, 180)               # titolo color crema, come Davide
SUB = (226, 226, 228)
TEXT = (236, 236, 236)
GREY = (170, 170, 175)

# un colore per ingrediente (se possibile, il colore della pianta vera)
COLORI = {
    "blue_mountain_flower": (70, 140, 255),
    "red_mountain_flower": (240, 60, 60),
    "purple_mountain_flower": (165, 85, 240),
    "lavender": (215, 180, 255),
    "tundra_cotton": (245, 245, 245),
    "thistle_branch": (255, 110, 200),
    "snowberries": (140, 230, 255),
    "juniper_berries": (60, 180, 115),
    "jazbay_grapes": (185, 55, 115),
    "dragons_tongue": (255, 140, 30),
    "canis_root": (200, 160, 120),
    "scaly_pholiota": (175, 95, 50),
    "wheat": (245, 220, 120),
    "mora_tapinella": (160, 210, 60),
    "glowing_mushroom": (0, 230, 195),
    "white_cap": (160, 160, 170),
    "imp_stool": (245, 150, 125),
    "bleeding_crown": (200, 20, 50),
    "fly_amanita": (255, 200, 0),
    "blisterwort": (230, 0, 230),
    "namiras_rot": (120, 255, 0),
}
RARITA = {"comune": "Comune", "non_comune": "Non comune", "rara": "Rara", "leggendaria": "Leggendaria"}
RARITA_PL = {"comune": "Comuni", "non_comune": "Non comuni", "rara": "Rare", "leggendaria": "Leggendarie"}
ORDINE = list(RARITA)

FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
if not os.path.exists(FONT):
    FONT = FONT_B


def f(size, bold=True):
    return ImageFont.truetype(FONT_B if bold else FONT, size)


def px(x, y):
    return AX[0] * x + AX[1], AY[0] * y + AY[1]


def base(col, extra=0):
    """Mappa di base con testata e piè di pagina; extra = pixel in più in basso per la legenda."""
    m = Image.open(os.path.join(OUT, "_mappa_base.jpg")).convert("RGB")
    im = Image.new("RGB", (W, H + extra), BG)
    im.paste(m, (0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, HEAD - 1], fill=BG)
    d.rectangle([0, FOOT + 2, W, H + extra], fill=BG)
    d.line([0, HEAD + 1, W, HEAD + 1], fill=col, width=3)
    d.line([0, FOOT, W, FOOT], fill=col, width=3)
    return im


def marker(d, x, y, col, r=13):
    cx, cy = px(x, y)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (60,), outline=col + (255,), width=3)
    d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=col + (255,))


def staff_band(d):
    d.rectangle([0, HEAD + 4, W, HEAD + 44], fill=(120, 25, 25))
    d.text((W / 2, HEAD + 24), "SOLO STAFF  -  NON PUBBLICARE: questi luoghi si scoprono giocando", font=f(19), fill=(255, 235, 225), anchor="mm")


def header(d, title, sub):
    d.text((20, 6), title, font=f(42, bold=False), fill=TITLE)
    d.text((22, 66), sub, font=f(19), fill=SUB)


def save(im, name):
    im.convert("RGB").save(os.path.join(OUT, name), quality=90)


def disegna(im, punti, colore, raggio):
    over = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for p in punti:
        marker(d, p["center"]["x"], p["center"]["y"], colore(p), raggio(p))
    return Image.alpha_composite(im.convert("RGBA"), over)


RESP = lambda m: "solo al riavvio del server" if m == 0 else (f"ogni {m} minuti" if m < 60 else f"ogni {m // 60} or{'a' if m == 60 else 'e'}")
pn = lambda n: f"{n} punt{'o' if n == 1 else 'i'}"
ING = {g["id"]: g for g in DATA["ingredients"]}
mancanti = [g for g in ING if g not in COLORI]
if mancanti:
    sys.exit(f"Manca il colore per: {', '.join(mancanti)} (aggiungilo in COLORI)")

# una mappa per ingrediente
for n, g in enumerate(DATA["ingredients"], start=1):
    col = COLORI[g["id"]]
    im = base(col)
    im = disegna(im, [p for p in DATA["points"] if p["ingredient"] == g["id"]], lambda p: col, lambda p: 13)
    d = ImageDraw.Draw(im)
    header(d, g["name_it"], f"{RARITA[g['rarity']]}  -  {g['plants_per_point']} piant{'a' if g['plants_per_point'] == 1 else 'e'} per punto  -  rinasce {RESP(g['respawn_min'])}")
    if not g["public_map"]:
        staff_band(d)
    d.text((22, 2182), f"Windhelm: {pn(g['points_windhelm'])}   |   Riften: {pn(g['points_riften'])}   |   Ingrediente: {g['name_it']} ({g['name_en']})", font=f(17), fill=TEXT)
    d.text((22, 2212), f"Dove: {g['lore']}", font=f(16), fill=TEXT)
    save(im, f"{n:02d}_{g['id']}.jpg")

# mappe riassuntive: un colore per ingrediente + legenda
RIGA, COL_W = 27, 292
for name, keep, staff in (("00_tutti_pubblica.jpg", ("comune", "non_comune"), False),
                          ("00_tutti_staff.jpg", ("comune", "non_comune", "rara", "leggendaria"), True)):
    ingr = [g for g in DATA["ingredients"] if g["rarity"] in keep]
    # colonne della legenda: ogni gruppo di rarità ha il suo titoletto, massimo 7 voci per colonna
    # comuni su più colonne; rare e leggendarie insieme nell'ultima
    colonne = []
    for r in keep:
        gruppo = [g for g in ingr if g["rarity"] == r]
        for i in range(0, len(gruppo), 7):
            col = [("titolo", RARITA_PL[r] if i == 0 else "")] + [("voce", g) for g in gruppo[i:i + 7]]
            if r == "leggendaria" and colonne:
                colonne[-1] += col
            else:
                colonne.append(col)
    righe = max(len(c) for c in colonne)
    extra = FOOT + 16 + righe * RIGA + 38 - H
    im = base((200, 176, 114), extra)
    pts = sorted((p for p in DATA["points"] if p["rarity"] in keep), key=lambda p: ORDINE.index(p["rarity"]))
    im = disegna(im, pts, lambda p: COLORI[p["ingredient"]], lambda p: 9 if p["rarity"] in ("comune", "non_comune") else 13)
    d = ImageDraw.Draw(im)
    header(d, "Ingredienti", "Piante e funghi raccoglibili  -  " + ("tutti i punti" if staff else "comuni e non comuni"))
    if staff:
        staff_band(d)
    y0 = FOOT + 16
    for ci, col in enumerate(colonne):
        x = 22 + ci * COL_W
        for ri, (tipo, v) in enumerate(col):
            y = y0 + ri * RIGA + RIGA / 2
            if tipo == "titolo":
                d.text((x, y), v, font=f(15), fill=GREY, anchor="lm")
            else:
                c = COLORI[v["id"]]
                d.ellipse([x, y - 8, x + 16, y + 8], fill=tuple(int(k * 0.35) for k in c), outline=c, width=2)
                d.ellipse([x + 6, y - 2, x + 10, y + 2], fill=c)
                cnt = v["points_windhelm"] + v["points_riften"]
                d.text((x + 24, y), f"{v['name_it']}  {cnt}", font=f(16), fill=TEXT, anchor="lm")
    w = sum(1 for p in pts if p["hold"] == "Windhelm")
    d.text((22, y0 + righe * RIGA + 4), f"Windhelm: {pn(w)}   |   Riften: {pn(len(pts) - w)}   |   Numero accanto al nome = punti sulla mappa",
           font=f(16), fill=TEXT)
    save(im, name)
print("mappe scritte in", OUT)
