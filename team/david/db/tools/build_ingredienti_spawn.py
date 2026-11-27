"""Sceglie i punti di spawn degli ingredienti (piante e funghi) e scrive il database e le mappe.

Uso (dalla cartella tools/):
    python3 build_ingredienti_spawn.py ../../../..

L'argomento è la cartella principale del repo. Scrive:
  - team/david/db/ingredient_spawns.json        (database: ogni punto e ogni pianta)
  - team/david/mappe-ingredienti/*.jpg           (mappe nello stile di team/davide/mappe-spawn)
  - team/david/ingredienti-spawn/ingredienti-spawn.json (copia per il server)

Regole (T-008, riunione del 21/11/2026 e Discord #dove-reperire-ingredienti):
  - ogni ingrediente nasce dove ha senso (lore): habitat, terreno, acqua, bosco fitto o aperto;
  - lontano da forti, fortezze degli orchi, accampamenti dei giganti, miniere, dungeon e luoghi sicuri,
    dentro i confini del gioco e su terreno percorribile. Per garantirlo i punti si scelgono SOLO dentro
    le aree di movimento dei 149 punti animali di Davide (terra-punti-v8.json), che hanno già superato
    tutti questi controlli su Skyrim.esm (team/davide/spawn-debug.md);
  - le piante stanno esattamente dove il gioco aveva già messo una pianta o un arbusto (world_refs.csv),
    quindi la quota è quella vera del terreno;
  - rarità: comune, non comune, rara, leggendaria. Rare e leggendarie: luoghi da scoprire giocando
    (mappe solo per lo staff).
"""
import csv
import json
import math
import os
import random
import re
import sys

import numpy as np

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "../../../..")
DB = os.path.join(ROOT, "team", "david", "db")
DAVIDE = os.path.join(ROOT, "team", "davide", "skymp-server")
OUT_MAPS = os.path.join(ROOT, "team", "david", "mappe-ingredienti")
OUT_SRV = os.path.join(ROOT, "team", "david", "ingredienti-spawn")
VERSION = "0.1.0"
DATE = "2026-11-27"
random.seed(20261127)

# ------------------------------------------------------------------ regole per rarità
RARITY = {
    "comune":      {"plants": 4, "respawn_min": 30,  "public": True,  "spacing_same": 3500},
    "non_comune":  {"plants": 3, "respawn_min": 60,  "public": True,  "spacing_same": 5000},
    "rara":        {"plants": 2, "respawn_min": 180, "public": False, "spacing_same": 8000},
    "leggendaria": {"plants": 1, "respawn_min": 0,   "public": False, "spacing_same": 20000},  # 0 = solo al riavvio
}
CLUSTER_RADIUS = 450      # le piante di un punto stanno entro 450 unità dal centro
MIN_ANY = 900             # distanza minima tra punti di ingredienti diversi
MIN_SECRET = 7000         # distanza minima tra due punti rari o leggendari (luoghi segreti diversi)
AREA_CAP = 4              # al massimo 4 punti (di qualsiasi ingrediente) nella stessa area verificata
AREA_SAFE = 0.85          # i punti stanno entro l'85% del raggio delle aree verificate di Davide
ANIMAL_RADIUS = {"coniglio": 1800, "cervo": 3000, "capra": 3000, "volpe": 2600, "alce": 3500, "lupo": 4500,
                 "orso": 4500, "gatto_sciabola": 4000, "gatto_nevi": 4000, "lupo_ghiaccio": 4500,
                 "volpe_artica": 2600, "orso_nevi": 4500}
CAPITALS = {"Windhelm": (134600, 36000), "Riften": (173350, -96500)}   # dal disegno della mappa di Davide

# ------------------------------------------------------------------ ingredienti
# id = ingredients.json; bases = oggetti del gioco da piazzare (FLOR/TREE, id esadecimali da raccolta-basi2.txt);
# habitat = regole dure; prefer = pesi; points = punti per feudo (Windhelm, Riften)
INGREDIENTS = [
    # --- comuni
    dict(id="blue_mountain_flower", it="Fiore di montagna blu", rarity="comune", points=(10, 10),
         bases=["0BCF3D", "0BCF3F"], habitat=dict(snow=False), prefer=dict(open=1.0, vanilla=1.5),
         lore="Pianure e prati aperti, ai margini dei boschi."),
    dict(id="red_mountain_flower", it="Fiore di montagna rosso", rarity="comune", points=(10, 10),
         bases=["0BCF3C", "0BCF3E"], habitat=dict(snow=False), prefer=dict(open=1.0, vanilla=1.5),
         lore="Pianure e prati aperti, ai margini dei boschi."),
    dict(id="purple_mountain_flower", it="Fiore di montagna viola", rarity="comune", points=(10, 10),
         bases=["0BCF3A", "0B91F8"], habitat=dict(snow=False), prefer=dict(open=1.0, vanilla=1.5),
         lore="Pianure e prati aperti, ai margini dei boschi."),
    dict(id="lavender", it="Lavanda", rarity="comune", points=(8, 10),
         bases=["01BB3D"], habitat=dict(snow=False), prefer=dict(open=2.0, low=0.5),
         lore="Zone aperte e soleggiate, lontano dalla neve."),
    dict(id="tundra_cotton", it="Cotone della tundra", rarity="comune", points=(10, 0),
         bases=["0BB947"], habitat=dict(snow=False, biome=["volcanic_tundra", "tundra", "unknown"]),
         prefer=dict(open=2.0), lore="Tundra di Eastmarch, distese aperte e ventose. Nel Rift non cresce."),
    dict(id="thistle_branch", it="Ramo di cardo", rarity="comune", points=(8, 8),
         bases=["0B91F0"], habitat=dict(), prefer=dict(open=1.5, vanilla=1.0),
         lore="Campi aperti e radure, anche ai margini della neve."),
    dict(id="snowberries", it="Bacche di neve", rarity="comune", points=(10, 6),
         bases=["0BCF34", "0BCF33"], habitat=dict(snow=True), prefer=dict(vanilla=1.0, high=0.5),
         lore="Neve e ghiaccio: la tundra innevata di Windhelm e i pianori più alti del Rift."),
    dict(id="juniper_berries", it="Bacche di ginepro", rarity="comune", points=(6, 8),
         bases=["0BB948"], habitat=dict(high=True), prefer=dict(high=2.0, open=0.5),
         lore="Montagne, rocce e altitudine."),
    dict(id="jazbay_grapes", it="Uva jazbay", rarity="comune", points=(8, 0),
         bases=["0BB949"], habitat=dict(biome=["volcanic_tundra"]), prefer=dict(vanilla=2.0, wet=0.5),
         lore="Sorgenti calde della tundra vulcanica di Eastmarch. Solo Windhelm."),
    dict(id="dragons_tongue", it="Lingua di drago", rarity="comune", points=(8, 0),
         bases=["0BB94D", "0BB94E"], habitat=dict(biome=["volcanic_tundra"]), prefer=dict(vanilla=2.0, high=0.5),
         lore="Rocce calde e fumarole della tundra vulcanica di Eastmarch. Solo Windhelm."),
    dict(id="canis_root", it="Radice di canis", rarity="comune", points=(0, 12),
         bases=["0BB94A"], habitat=dict(snow=False), prefer=dict(vanilla=2.0, high=0.8),
         lore="Colline rocciose e boschi del Rift. Solo Riften."),
    dict(id="scaly_pholiota", it="Pholiota squamosa", rarity="comune", points=(0, 10),
         bases=["070E42", "06F94D"], habitat=dict(snow=False), prefer=dict(vanilla=2.0, forest=1.0),
         lore="Tronchi e ceppi di pioppo caduti nei boschi d'autunno del Rift. Solo Riften."),
    dict(id="wheat", it="Grano", rarity="comune", points=(6, 6),
         bases=["0BB953"], habitat=dict(snow=False), prefer=dict(vanilla=2.0, open=1.5),
         lore="Campi delle vecchie fattorie abbandonate, cresciuto selvatico."),
    # --- non comuni
    dict(id="mora_tapinella", it="Mora tapinella", rarity="non_comune", points=(6, 6),
         bases=["0EC7E7"], habitat=dict(), prefer=dict(forest=2.0, wet=1.0, vanilla=1.0),
         lore="Ceppi di pino nelle foreste fitte e umide."),
    dict(id="glowing_mushroom", it="Fungo luminoso", rarity="non_comune", points=(4, 4),
         bases=["09748B", "07EE00"], habitat=dict(wet=True), prefer=dict(wet=2.0, forest=1.0),
         lore="Rive ombrose e umide, vicino all'acqua. (Nelle grotte: con i dungeon, T-011.)"),
    dict(id="white_cap", it="Cappello bianco", rarity="non_comune", points=(4, 4),
         bases=["0DB68B", "04DA06"], habitat=dict(wet=True), prefer=dict(wet=1.5, forest=1.5, vanilla=1.0),
         lore="Sottobosco umido vicino a fiumi e laghi."),
    dict(id="imp_stool", it="Sgabello imp", rarity="non_comune", points=(4, 4),
         bases=["04DA08", "04DA09"], habitat=dict(), prefer=dict(high=1.5, forest=1.0, vanilla=1.0),
         lore="Pendii rocciosi e boscosi in quota."),
    # --- rare (solo staff)
    dict(id="bleeding_crown", it="Corona sanguinante", rarity="rara", points=(2, 3),
         bases=["04DA04", "0DD676"], habitat=dict(snow=False), prefer=dict(forest=2.0, vanilla=1.0, far=1.0),
         lore="Foreste fitte e scure, lontano dai sentieri."),
    dict(id="fly_amanita", it="Amanita muscaria", rarity="rara", points=(2, 3),
         bases=["04D9FF", "0E644B"], habitat=dict(snow=False), prefer=dict(forest=1.5, vanilla=1.0, far=1.0),
         lore="Boschi d'autunno, sotto gli alberi più vecchi."),
    # --- leggendarie (solo staff)
    dict(id="blisterwort", it="Erba vescicante", rarity="leggendaria", points=(1, 1),
         bases=["04DA0C"], habitat=dict(), prefer=dict(far=2.0, forest=1.5, wet=1.0),
         lore="Un solo posto per regno, nascosto. Da scoprire giocando."),
    dict(id="namiras_rot", it="Marciume di Namira", rarity="leggendaria", points=(1, 1),
         bases=["04DA0A", "0CE84C"], habitat=dict(), prefer=dict(far=2.0, forest=2.0),
         lore="Un solo posto per regno, nascosto. Da scoprire giocando."),
]

NOT_SPAWNABLE = [
    dict(id="garlic", it="Aglio", why="Nel gioco esiste solo come treccia appesa nelle case: non c'è una pianta da far crescere. Si ottiene da mercanti e locanda."),
    dict(id="frost_mirriam", it="Mirriam del gelo", why="Nel gioco esiste solo come mazzo appeso nelle case. Si ottiene da mercanti e bottino."),
    dict(id="elves_ear", it="Orecchio d'elfo", why="Nel gioco esiste solo come mazzo appeso nelle case. Si ottiene da mercanti e bottino (leggendario)."),
]


# ------------------------------------------------------------------ dati
def load_json(*p):
    with open(os.path.join(*p), encoding="utf-8") as fh:
        return json.load(fh)


ing_db = {i["id"]: i for i in load_json(DB, "ingredients.json")["items"]}
for g in INGREDIENTS + NOT_SPAWNABLE:
    assert g["id"] in ing_db, g["id"]

rows = list(csv.DictReader(open(os.path.join(DB, "world_refs.csv"), encoding="utf-8")))
GROUND = re.compile(r"Flora|Shrub|Fern|Grass|Mushroom|Bush|Thicket|Log|Stump|Moss|Clover|Undergrowth|Plant|Creep", re.I)
BIGTREE = re.compile(r"^Tree(?!Flora)", re.I)
cand = [r for r in rows if r["base_type"] in ("FLOR", "TREE") and GROUND.search(r["base_editor_id"])
        and not re.search(r"Nest|Salmon|Barnacle|Coin|Hanging|Skewer|Skeever", r["base_editor_id"])]
trees = np.array([[float(r["x"]), float(r["y"])] for r in rows if r["base_type"] == "TREE" and BIGTREE.match(r["base_editor_id"]) and not GROUND.search(r["base_editor_id"])])

# acqua: punti dei pesci di Davide + oggetti del gioco che stanno nell'acqua
water = []
for zone in load_json(DAVIDE, "pesci-punti-v3.json").values():
    water += [[p["x"], p["y"]] for p in zone]
water += [[float(r["x"]), float(r["y"])] for r in rows if re.search(r"Barnacle|SlaughterfishEgg|Salmon", r["base_editor_id"])]
water = np.array(water)

# aree verificate (Davide, terra-punti-v8.json)
areas = []
for sp, v in load_json(DAVIDE, "terra-punti-v8.json").items():
    for hold in ("Windhelm", "Riften"):
        for i, p in enumerate(v.get(hold, [])):
            areas.append(dict(sp=sp, hold=hold, i=i, x=p["x"], y=p["y"], r=ANIMAL_RADIUS.get(sp, 2500)))
A = np.array([[a["x"], a["y"]] for a in areas])
AR = np.array([a["r"] for a in areas])

# vanilla: dove il gioco originale fa crescere ogni ingrediente (tutto il mondo dei due feudi)
vanilla = {}
form2id = {i["local_form_id"].upper(): k for k, i in ing_db.items()}
for r in rows:
    k = form2id.get(r["gives_ingredient_id"].upper())
    if k:
        vanilla.setdefault(k, []).append([float(r["x"]), float(r["y"])])
vanilla = {k: np.array(v) for k, v in vanilla.items()}


def nearest(arr, x, y):
    if arr is None or not len(arr):
        return 1e9
    return float(np.min(np.hypot(arr[:, 0] - x, arr[:, 1] - y)))


# candidati dentro le aree verificate, con le loro caratteristiche
C = []
for r in cand:
    x, y, z = float(r["x"]), float(r["y"]), float(r["z"])
    d = np.hypot(A[:, 0] - x, A[:, 1] - y) / AR
    j = int(d.argmin())
    if d[j] > AREA_SAFE:
        continue
    hold = areas[j]["hold"]
    C.append(dict(ref=r["ref_id"], base_ed=r["base_editor_id"], x=x, y=y, z=z, hold=hold, biome=r["biome"], area=j))
print(f"Candidati dentro le aree verificate: {len(C)}")

P = np.array([[c["x"], c["y"]] for c in C])
for c in C:
    c["trees"] = int(np.sum(np.hypot(trees[:, 0] - c["x"], trees[:, 1] - c["y"]) < 1500))
    c["water"] = nearest(water, c["x"], c["y"])
    c["cap"] = math.hypot(c["x"] - CAPITALS[c["hold"]][0], c["y"] - CAPITALS[c["hold"]][1])
    c["snow"] = c["biome"] == "snow" or (c["hold"] == "Riften" and c["z"] > 14000)
# soglie relative per feudo
for hold in ("Windhelm", "Riften"):
    hs = [c for c in C if c["hold"] == hold]
    zt = np.percentile([c["z"] for c in hs], 70)
    t25, t60 = np.percentile([c["trees"] for c in hs], [30, 60])
    for c in hs:
        c["high"] = c["z"] >= zt
        c["open"] = c["trees"] <= t25
        c["forest"] = c["trees"] >= t60
        c["wet"] = c["water"] < 2500


def score(g, c):
    h, pf = g["habitat"], g["prefer"]
    if "snow" in h and c["snow"] != h["snow"]:
        return None
    if "biome" in h and c["biome"] not in h["biome"]:
        return None
    if h.get("high") and not c["high"]:
        return None
    if h.get("wet") and not c["wet"]:
        return None
    s = random.random() * 0.6
    s += pf.get("open", 0) * c["open"] + pf.get("forest", 0) * c["forest"] + pf.get("high", 0) * c["high"]
    s += pf.get("wet", 0) * (1 - min(c["water"], 6000) / 6000)
    s += pf.get("low", 0) * (not c["high"])
    s += pf.get("far", 0) * min(c["cap"], 60000) / 60000
    if pf.get("vanilla"):
        s += pf["vanilla"] * max(0.0, 1 - nearest(vanilla.get(g["id"]), c["x"], c["y"]) / 8000)
    return s


# ------------------------------------------------------------------ scelta dei punti
chosen = []   # (g, c)
order = sorted(INGREDIENTS, key=lambda g: ["leggendaria", "rara", "non_comune", "comune"].index(g["rarity"]))
for g in order:
    for hi, hold in enumerate(("Windhelm", "Riften")):
        need = g["points"][hi]
        if not need:
            continue
        rule = RARITY[g["rarity"]]
        scored = [(score(g, c), c) for c in C if c["hold"] == hold]
        scored = sorted([t for t in scored if t[0] is not None], key=lambda t: -t[0])
        got = []
        for relax in (1.0, 0.6, 0.35):
            for s, c in scored:
                if len(got) >= need:
                    break
                if any(math.hypot(c["x"] - o["x"], c["y"] - o["y"]) < rule["spacing_same"] * relax for o in got):
                    continue
                if any(math.hypot(c["x"] - oc["x"], c["y"] - oc["y"]) < MIN_ANY for _, oc in chosen):
                    continue
                if sum(1 for o in got if o["area"] == c["area"]) >= 2:
                    continue
                if sum(1 for _, oc in chosen if oc["area"] == c["area"]) >= AREA_CAP + (relax < 1) * 2:
                    continue
                if g["rarity"] in ("rara", "leggendaria") and any(
                        og["rarity"] in ("rara", "leggendaria") and math.hypot(c["x"] - oc["x"], c["y"] - oc["y"]) < MIN_SECRET
                        for og, oc in chosen):
                    continue
                got.append(c)
                chosen.append((g, c))
            if len(got) >= need:
                break
        if len(got) < need:
            print(f"ATTENZIONE {g['id']} {hold}: {len(got)}/{need} punti")

# ------------------------------------------------------------------ piante di ogni punto
points = []
counter = {}
for g, c in chosen:
    rule = RARITY[g["rarity"]]
    near = [o for o in C if o is not c and math.hypot(o["x"] - c["x"], o["y"] - c["y"]) < CLUSTER_RADIUS
            and abs(o["z"] - c["z"]) < 150]
    random.shuffle(near)
    spots = [c]
    for o in near:
        if len(spots) >= rule["plants"]:
            break
        if all(math.hypot(o["x"] - s["x"], o["y"] - s["y"]) > 70 for s in spots):
            spots.append(o)
    plants = []
    for k, s in enumerate(spots):
        plants.append(dict(base=g["bases"][k % len(g["bases"])], x=round(s["x"]), y=round(s["y"]), z=round(s["z"]),
                           rot=random.randint(0, 359), anchor=dict(ref=s["ref"], dx=0, dy=0, dz=0), true_ground=True))
    while len(plants) < rule["plants"]:   # pochi appoggi vicini: piante attorno al centro
        a = random.random() * 2 * math.pi
        rr = 80 + random.random() * 70
        px, py = c["x"] + rr * math.cos(a), c["y"] + rr * math.sin(a)
        # quota stimata dalle 3 posizioni vere più vicine (media pesata), 15 unità più in basso: meglio un po'
        # interrata che sospesa
        nn = sorted(C, key=lambda o: (o["x"] - px) ** 2 + (o["y"] - py) ** 2)[:3]
        w = [1 / max(30.0, math.hypot(o["x"] - px, o["y"] - py)) for o in nn]
        pz = sum(o["z"] * wi for o, wi in zip(nn, w)) / sum(w) - 15
        plants.append(dict(base=g["bases"][len(plants) % len(g["bases"])], x=round(px), y=round(py), z=round(pz),
                           rot=random.randint(0, 359), true_ground=False,
                           anchor=dict(ref=c["ref"], dx=round(px - c["x"]), dy=round(py - c["y"]), dz=round(pz - c["z"]))))
    hk = "W" if c["hold"] == "Windhelm" else "R"
    counter[(g["id"], hk)] = counter.get((g["id"], hk), 0) + 1
    a = areas[c["area"]]
    points.append(dict(
        id=f"ING-{hk}-{g['id']}-{counter[(g['id'], hk)]:02d}", ingredient=g["id"], hold=c["hold"], rarity=g["rarity"],
        public=rule["public"], respawn_min=rule["respawn_min"],
        center=dict(x=round(c["x"]), y=round(c["y"]), z=round(c["z"])), biome=c["biome"],
        near_water=bool(c["wet"]), dense_forest=bool(c["forest"]), high_ground=bool(c["high"]), snow=bool(c["snow"]),
        verified_area=f"{a['sp']} {a['hold']} #{a['i']}", plants=plants))
points.sort(key=lambda p: p["id"])

ingredients_out = []
for g in INGREDIENTS:
    i = ing_db[g["id"]]
    ingredients_out.append(dict(
        id=g["id"], name_it=g["it"], name_en=i["name_en"], ingredient_form_id=i["local_form_id"].upper(),
        plugin=i["plugin"], rarity=g["rarity"], lore=g["lore"], bases=g["bases"],
        points_windhelm=sum(1 for p in points if p["ingredient"] == g["id"] and p["hold"] == "Windhelm"),
        points_riften=sum(1 for p in points if p["ingredient"] == g["id"] and p["hold"] == "Riften"),
        plants_per_point=RARITY[g["rarity"]]["plants"], respawn_min=RARITY[g["rarity"]]["respawn_min"],
        public_map=RARITY[g["rarity"]]["public"]))

out = {
    "_meta": {
        "version": VERSION, "date": DATE, "author": "david", "task": "T-008",
        "description": "Spawn degli ingredienti raccoglibili (piante e funghi) nei feudi di Windhelm (Eastmarch) e Riften (Rift). Ogni punto ha le sue piante con coordinate vere. Generato da tools/build_ingredienti_spawn.py: non modificare a mano, cambiare lo script e rigenerare.",
        "sources": ["Discord #lista-ingredienti-alchemici e #dove-reperire-ingredienti (13/05/2026)", "riunione 21/11/2026 (riunioni/2026-11-21/riassunto.md)",
                    "world_refs.csv (Skyrim.esm)", "team/davide/skymp-server/terra-punti-v8.json (aree verificate)", "pesci-punti-v3.json (acqua)"],
        "rules": {
            "where": "Solo dentro le aree dei 149 punti animali di Davide (entro l'85% del raggio): dentro i confini del gioco, su terreno percorribile, lontano da forti, fortezze degli orchi, accampamenti dei giganti, miniere, dungeon e luoghi sicuri (controlli su Skyrim.esm, team/davide/spawn-debug.md).",
            "height": "true_ground=true: la pianta sta esattamente su una pianta o un arbusto messi dal gioco (anchor.ref), quindi alla quota vera. true_ground=false: pochi appoggi vicini, la quota è stimata dalle 3 posizioni vere più vicine (15 unità più in basso).",
            "placement": "Il server crea la pianta (mp.place) e la sposta con MoveTo sull'oggetto del gioco anchor.ref, più lo scostamento dx/dy/dz (stesso metodo del decor dei giganti di Davide).",
            "respawn": "Rinasce solo la pianta raccolta, sullo stesso posto, dopo respawn_min minuti (0 = solo al riavvio del server).",
            "rarity": {k: {kk: vv for kk, vv in v.items() if kk != "spacing_same"} for k, v in RARITY.items()},
            "public_map": "Comuni e non comuni: mappe pubblicabili. Rare e leggendarie: mappe solo per lo staff, i luoghi si scoprono giocando."
        },
        "counts": {
            "points": len(points), "plants": sum(len(p["plants"]) for p in points),
            "windhelm_points": sum(1 for p in points if p["hold"] == "Windhelm"),
            "riften_points": sum(1 for p in points if p["hold"] == "Riften")
        }
    },
    "ingredients": ingredients_out,
    "not_spawnable": NOT_SPAWNABLE,
    "points": points,
}
os.makedirs(OUT_SRV, exist_ok=True)
for path in (os.path.join(DB, "ingredient_spawns.json"), os.path.join(OUT_SRV, "ingredienti-spawn.json")):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
print(json.dumps(out["_meta"]["counts"]))
for g in ingredients_out:
    print(f"  {g['name_it']:26s} {g['rarity']:12s} W {g['points_windhelm']:2d}  R {g['points_riften']:2d}")
