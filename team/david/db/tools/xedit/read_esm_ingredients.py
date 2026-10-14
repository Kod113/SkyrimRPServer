"""Legge gli ingredienti (record INGR) direttamente dai file .esm/.esl di Skyrim SE
e li confronta con ingredients.json, senza bisogno di xEdit.

Uso:  python3 read_esm_ingredients.py <cartella_db> <cartella_con_gli_esm> [--write]
Cosa controlla per ognuno dei 110 ingredienti:
  1. esiste un record INGR con lo stesso ID locale (ultime cifre) nel plugin giusto
  2. il nome interno (EditorID) assomiglia al nome inglese
  3. i 4 effetti: il codice dell'effetto nel gioco deve corrispondere sempre allo stesso
     nome effetto in tutti gli ingredienti (coerenza), con 4 codici distinti per ingrediente
Con --write salva <cartella_db>/xedit_ingredients.csv (stesso formato dell'export di xEdit),
che build_db.py usa per impostare form_id_verified=true.
Nota: i nomi visibili (FULL) sono in file di testo separati (Strings), quindi qui non si leggono.
"""
import csv
import json
import os
import re
import struct
import sys
import zlib
from collections import defaultdict

DB, DATA = sys.argv[1], sys.argv[2]
WRITE = "--write" in sys.argv


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def subrecords(data):
    """Restituisce [(firma, dati)] dei sotto-record di un record."""
    out, pos, big = [], 0, None
    while pos + 6 <= len(data):
        sig = data[pos:pos + 4].decode("latin1")
        size = struct.unpack_from("<H", data, pos + 4)[0]
        pos += 6
        if sig == "XXXX":                      # dimensione estesa per il sotto-record successivo
            big = struct.unpack_from("<I", data, pos)[0]
            pos += size
            continue
        if big is not None:
            size, big = big, None
        out.append((sig, data[pos:pos + size]))
        pos += size
    return out


def read_ingr(path):
    """Legge tutti i record INGR di un plugin."""
    with open(path, "rb") as f:
        buf = f.read()
    # intestazione TES4
    size = struct.unpack_from("<I", buf, 4)[0]
    pos = 24 + size
    masters = [d.decode("latin1").rstrip("\0") for s, d in subrecords(buf[24:pos]) if s == "MAST"]
    res = []
    while pos + 24 <= len(buf):
        sig = buf[pos:pos + 4]
        size = struct.unpack_from("<I", buf, pos + 4)[0]
        if sig != b"GRUP":
            pos += 24 + size
            continue
        label = buf[pos + 8:pos + 12]
        if label == b"INGR":
            end, p = pos + size, pos + 24
            while p + 24 <= end:
                rsig = buf[p:p + 4]
                rsize, flags, fid = struct.unpack_from("<III", buf, p + 4)
                data = buf[p + 24:p + 24 + rsize]
                if rsig == b"INGR":
                    if flags & 0x00040000:     # record compresso con zlib
                        data = zlib.decompress(data[4:])
                    rec = {"formid": fid, "effects": [], "edid": "", "value": None, "weight": None}
                    for ssig, sdata in subrecords(data):
                        if ssig == "EDID":
                            rec["edid"] = sdata.split(b"\0")[0].decode("latin1")
                        elif ssig == "DATA":
                            rec["value"], w = struct.unpack_from("<if", sdata, 0)   # DATA = valore base + peso
                            rec["weight"] = round(w, 3)
                        elif ssig == "EFID":
                            rec["effects"].append(struct.unpack_from("<I", sdata, 0)[0] & 0x00FFFFFF)
                    res.append(rec)
                p += 24 + rsize
        pos += size
    return res, masters


plugins = ["Skyrim.esm", "Dawnguard.esm", "HearthFires.esm", "Dragonborn.esm", "_ResourcePack.esl"]
records = {}
for p in plugins:
    path = os.path.join(DATA, p)
    if not os.path.exists(path):
        print("MANCA il file", p)
        continue
    recs, masters = read_ingr(path)
    # ID locale: 6 cifre per .esm; .esl: ultime 3 cifre
    mask = 0xFFF if p.endswith(".esl") else 0xFFFFFF
    records[p] = {r["formid"] & mask: r for r in recs}
    print(f"{p}: {len(recs)} ingredienti letti")

with open(os.path.join(DB, "ingredients.json"), encoding="utf-8") as f:
    ours = json.load(f)["items"]

problems, matched, rows = [], 0, []
eff2code = defaultdict(set)
code2eff = defaultdict(set)
for i in ours:
    mask = 0xFFF if i["plugin"].endswith(".esl") else 0xFFFFFF
    key = int(i["local_form_id"], 16) & mask
    r = records.get(i["plugin"], {}).get(key)
    if not r:
        problems.append(f"NESSUN INGR con ID {i['local_form_id']} in {i['plugin']} ({i['name_en']})")
        continue
    # nome interno simile al nome inglese (controllo morbido: in Skyrim spesso diverge)
    soft = norm(i["name_en"])[:5] in norm(r["edid"]) or norm(r["edid"])[:5] in norm(i["name_en"])
    if not soft:
        problems.append(f"(avviso) EditorID '{r['edid']}' non somiglia a '{i['name_en']}'")
    if len(r["effects"]) != 4 or len(set(r["effects"])) != 4:
        problems.append(f"{i['name_en']}: effetti nel gioco non 4 distinti ({r['effects']})")
    else:
        for nome, code in zip(i["effects"], r["effects"]):
            eff2code[nome].add(code)
            code2eff[code].add(nome)
    matched += 1
    rows.append([i["plugin"], f"{r['formid']:08X}", f"{r['formid'] & 0xFFFFFF:06X}", r["edid"],
                 i["name_en"], r["value"], r["weight"]] + [f"{c:06X}" for c in r["effects"]])

for nome, codes in eff2code.items():
    if len(codes) > 1:
        problems.append(f"Effetto '{nome}' con piu' codici nel gioco: {sorted(f'{c:06X}' for c in codes)}")
for code, nomi in code2eff.items():
    if len(nomi) > 1:
        problems.append(f"Codice effetto {code:06X} usato per nomi diversi: {sorted(nomi)}")

print(f"\nIngredienti con ID trovato nel gioco: {matched}/{len(ours)}")
print(f"Effetti distinti: {len(eff2code)} nostri, {len(code2eff)} codici nel gioco")
for p in problems:
    print(" -", p)

if WRITE:
    out = os.path.join(DB, "xedit_ingredients.csv")
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["plugin", "formid_load_order", "formid_locale", "editor_id", "nome", "valore", "peso",
                    "effetto1", "effetto2", "effetto3", "effetto4"])
        w.writerows(rows)
    print("Scritto", out)
sys.exit(1 if any(not p.startswith("(avviso)") for p in problems) else 0)
