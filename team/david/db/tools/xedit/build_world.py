"""Estrae da Skyrim.esm dati reali del mondo (Tamriel) per Eastmarch e Rift.

Uso:  python3 -I build_world.py <Skyrim.esm> <cartella_db>
Scrive in <cartella_db>:
  world_summary.json  conteggi per feudo: celle, biomi, flora, fauna
  world_refs.csv      un record per ogni pianta/albero/animale piazzato in Eastmarch e Rift

Metodo (approssimato, vedi note nel file di riepilogo):
  - feudo di una cella: Skyrim non ha confini degli hold nei file; si usano le 982 celle che
    dichiarano un Location (risalendo al feudo) e le altre prendono il feudo della cella nota
    piu' vicina (propagazione a griglia).
  - bioma di una cella: regioni del gioco (FallForest, PineForest, Tundra, VolcanicTundra, Snow...);
    se piu' regioni coprono il centro della cella vince quella con il poligono piu' piccolo.
"""
import collections
import csv
import json
import math
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import esm  # noqa: E402

ESM, DB = sys.argv[1], sys.argv[2]
buf = esm.load(ESM)
TAMRIEL = 0x3C
CELL = 4096.0


def top_groups():
    pos = 24 + struct.unpack_from("<I", buf, 4)[0]
    while pos + 24 <= len(buf):
        size = struct.unpack_from("<I", buf, pos + 4)[0]
        yield buf[pos + 8:pos + 12].decode("latin1"), pos, size
        pos += size


def records_of(label):
    for lab, pos, size in top_groups():
        if lab == label:
            p, end = pos + 24, pos + size
            while p < end:
                sig, fid, fl, data, tot = esm.record_data(buf, p)
                if sig != "GRUP":
                    yield sig, fid, fl, esm.subrecords(data)
                p += tot
            return


def edid_of(sr):
    return next((d.split(b"\0")[0].decode("latin1") for s, d in sr if s == "EDID"), "")


# ------------------------------------------------------------ locations -> feudo
lctn = {}
for sig, fid, fl, sr in records_of("LCTN"):
    pn = next((struct.unpack("<I", d)[0] & 0xFFFFFF for s, d in sr if s == "PNAM"), 0)
    lctn[fid & 0xFFFFFF] = (edid_of(sr), pn)
HOLDS = {0x1676A: "eastmarch", 0x1676C: "rift", 0x16769: "reach", 0x1676B: "winterhold",
         0x1676D: "pale", 0x1676E: "hjaalmarch", 0x1676F: "falkreath", 0x16770: "haafingar",
         0x16772: "whiterun"}


def hold_of(loc):
    for _ in range(12):
        if loc in HOLDS:
            return HOLDS[loc]
        loc = lctn.get(loc, ("", 0))[1]
        if not loc:
            return None
    return None


# ------------------------------------------------------------ regioni -> biomi
BIOME_KEYS = [("VolcanicTundra", "volcanic_tundra"), ("TundraMarsh", "tundra_marsh"), ("PineForest", "pine_forest"),
              ("FallForest", "fall_forest"), ("Tundra", "tundra"), ("Snow", "snow"), ("Mountain", "mountain"),
              ("Reach", "reach"), ("Coast", "coast")]
regions = []   # (bioma, area, [(x,y),...], nome)
for sig, fid, fl, sr in records_of("REGN"):
    wn = next((struct.unpack("<I", d)[0] for s, d in sr if s == "WNAM"), None)
    if wn != TAMRIEL:
        continue
    name = edid_of(sr)
    biome = next((b for k, b in BIOME_KEYS if k.lower() in name.lower()), None)
    if not biome:
        continue
    pts = []
    for s, d in sr:
        if s == "RPLD":
            pts = [struct.unpack_from("<ff", d, i) for i in range(0, len(d) - 7, 8)]
    if len(pts) < 3:
        continue
    area = abs(sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1]
                   for i in range(len(pts)))) / 2
    regions.append((biome, area, pts, name))
regions.sort(key=lambda r: r[1])          # piu' piccola prima


def inside(x, y, pts):
    c = False
    j = len(pts) - 1
    for i in range(len(pts)):
        xi, yi = pts[i]
        xj, yj = pts[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi:
            c = not c
        j = i
    return c


def biome_at(x, y):
    for b, area, pts, name in regions:
        if inside(x, y, pts):
            return b
    return "unknown"


# ------------------------------------------------------------ mondo Tamriel: celle e riferimenti
bases = {}
for label in ("FLOR", "TREE", "NPC_", "LVLN", "INGR", "ACTI"):
    for sig, fid, fl, sr in records_of(label):
        extra = None
        if sig in ("FLOR", "TREE"):
            pf = next((struct.unpack("<I", d)[0] for s, d in sr if s == "PFIG"), 0)
            extra = pf & 0xFFFFFF if pf else None
        bases[fid & 0xFFFFFF] = (sig, edid_of(sr), extra)

cells = {}
refs = []
world = None
for lab, pos, size in top_groups():
    if lab != "WRLD":
        continue
    for item in esm.walk(buf, pos, pos + size):
        if item[0] != "rec":
            continue
        _, p, sig, fid, flags, path = item
        if sig == "WRLD":
            world = fid & 0xFFFFFF
        elif world == TAMRIEL and sig == "CELL":
            s2, f2, fl2, data, tot = esm.record_data(buf, p)
            sr = dict(esm.subrecords(data))
            if "XCLC" in sr:
                x, y = struct.unpack_from("<ii", sr["XCLC"], 0)
                lc = struct.unpack_from("<I", sr["XLCN"], 0)[0] & 0xFFFFFF if "XLCN" in sr else 0
                cells[(x, y)] = hold_of(lc)
        elif world == TAMRIEL and sig in ("REFR", "ACHR") and not (flags & 0x820):
            s2, f2, fl2, data, tot = esm.record_data(buf, p)
            sr = dict(esm.subrecords(data))
            if "NAME" not in sr or "DATA" not in sr:
                continue
            base = struct.unpack("<I", sr["NAME"])[0]
            if base >> 24:
                continue
            b = bases.get(base & 0xFFFFFF)
            if not b or b[0] not in ("FLOR", "TREE", "NPC_", "LVLN"):
                continue
            x, y, z = struct.unpack_from("<fff", sr["DATA"], 0)
            refs.append((fid & 0xFFFFFF, sig, base & 0xFFFFFF, x, y, z))

print(f"Celle Tamriel: {len(cells)} | con feudo noto: {sum(1 for v in cells.values() if v)} | riferimenti: {len(refs)}")

# propagazione del feudo alle celle senza Location (multi-sorgente a griglia)
hold = {c: h for c, h in cells.items() if h}
frontier = collections.deque(hold)
while frontier:
    c = frontier.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        n = (c[0] + dx, c[1] + dy)
        if n in cells and n not in hold:
            hold[n] = hold[c]
            frontier.append(n)

biome_cache = {}
by_hold = {"eastmarch": collections.Counter(), "rift": collections.Counter()}
for (cx, cy), h in hold.items():
    if h in by_hold:
        b = biome_at((cx + 0.5) * CELL, (cy + 0.5) * CELL)
        biome_cache[(cx, cy)] = b
        by_hold[h][b] += 1

# ------------------------------------------------------------ riepilogo e CSV
summary = {"_meta": {
    "source": "Skyrim.esm (Skyrim SE), letto con tools/xedit/build_world.py",
    "method": "feudo = Location piu' vicino noto (approssimato); bioma = regioni del gioco, poligono piu' piccolo",
    "cell_size_units": CELL}, "holds": {}}
flora = {h: collections.Counter() for h in by_hold}
fauna = {h: collections.Counter() for h in by_hold}
rows = []
for fid, sig, base, x, y, z in refs:
    cx, cy = math.floor(x / CELL), math.floor(y / CELL)
    h = hold.get((cx, cy))
    if h not in by_hold:
        continue
    bsig, bedid, extra = bases[base]
    biome = biome_cache.get((cx, cy)) or biome_at(x, y)
    (flora if bsig in ("FLOR", "TREE") else fauna)[h][bedid] += 1
    rows.append([f"{fid:06X}", sig, bsig, f"{base:06X}", bedid, f"{extra:06X}" if extra else "",
                 round(x, 1), round(y, 1), round(z, 1), cx, cy, h, biome])

for h in by_hold:
    total = sum(by_hold[h].values())
    summary["holds"][h] = {
        "cells": total,
        "biomes_pct": {b: round(100 * n / total, 1) for b, n in by_hold[h].most_common()},
        "flora_refs": dict(flora[h].most_common()),
        "fauna_refs": dict(fauna[h].most_common()),
    }
with open(os.path.join(DB, "world_summary.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)
with open(os.path.join(DB, "world_refs.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["ref_id", "ref_type", "base_type", "base_id", "base_editor_id", "gives_ingredient_id",
                "x", "y", "z", "cell_x", "cell_y", "hold", "biome"])
    w.writerows(rows)
for h in by_hold:
    s = summary["holds"][h]
    print(h, s["cells"], "celle |", s["biomes_pct"])
    print("   flora:", sum(flora[h].values()), "| fauna:", sum(fauna[h].values()))
print("Scritti world_summary.json e world_refs.csv:", len(rows), "righe")
