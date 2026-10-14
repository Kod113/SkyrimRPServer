"""Confronta l'export di xEdit con ingredients.json e riporta le differenze.

Uso:  python3 import_xedit.py <cartella_db> <file_csv_xedit>
Cosa fa:
  1. legge il CSV esportato da ExportIngredients.pas (separatore ';')
  2. abbina ogni ingrediente nostro a uno di xEdit per nome inglese (name_en)
  3. confronta l'ID locale (le ultime cifre) e i 4 effetti
  4. scrive <cartella_db>/xedit_ingredients.csv (copia pulita): build_db.py la legge
     e imposta form_id_verified=true per gli ingredienti che coincidono
Esce con codice 1 se trova ingredienti non abbinati o ID diversi.
"""
import csv
import json
import os
import re
import shutil
import sys

if len(sys.argv) != 3:
    sys.exit("Uso: python3 import_xedit.py <cartella_db> <file_csv_xedit>")
DB, CSV_IN = sys.argv[1], sys.argv[2]


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


with open(os.path.join(DB, "ingredients.json"), encoding="utf-8") as f:
    ours = json.load(f)["items"]

with open(CSV_IN, encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f, delimiter=";"))
print(f"Righe in xEdit: {len(rows)} | Ingredienti nostri: {len(ours)}")

by_name = {}
for r in rows:
    by_name.setdefault(norm(r["nome"]), []).append(r)

problems, ok = [], 0
for i in ours:
    cand = by_name.get(norm(i["name_en"]), [])
    if not cand:
        problems.append(f"NON TROVATO in xEdit: {i['name_en']} ({i['plugin']})")
        continue
    # se piu' record hanno lo stesso nome, preferisci quello dello stesso plugin
    r = next((c for c in cand if c["plugin"].lower() == i["plugin"].lower()), cand[0])
    ours_local = i["local_form_id"].lower().lstrip("0")
    xedit_local = r["formid_locale"].lower().lstrip("0")
    # i plugin leggeri (.esl) hanno solo 3 cifre locali: confronta le ultime 3
    if i["plugin"].endswith(".esl") or i["uesp_id"].startswith("FE"):
        ours_local, xedit_local = ours_local[-3:], xedit_local[-3:]
    if ours_local != xedit_local:
        problems.append(f"ID DIVERSO: {i['name_en']} nostro {i['local_form_id']} / xEdit {r['formid_locale']}")
        continue
    # gli effetti: controllo morbido (avviso, non errore)
    xeff = norm(" ".join(r[f"effetto{n}"] for n in range(1, 5)))
    mancanti = [e for e in i["effects"] if norm(e) not in xeff]
    if mancanti:
        problems.append(f"(avviso) effetti non riconosciuti per {i['name_en']}: {mancanti}")
    ok += 1

known = {norm(i["name_en"]) for i in ours}
extra = sorted({r["nome"] for r in rows if norm(r["nome"]) not in known})
print(f"Abbinati con ID uguale: {ok}/{len(ours)}")
if extra:
    print(f"Presenti in xEdit ma non nei nostri 110 ({len(extra)}), probabilmente altri plugin/CC:")
    print("  ", ", ".join(extra[:30]), "..." if len(extra) > 30 else "")
for p in problems:
    print(" -", p)

shutil.copyfile(CSV_IN, os.path.join(DB, "xedit_ingredients.csv"))
print("Copia salvata in", os.path.join(DB, "xedit_ingredients.csv"))
sys.exit(1 if any(not p.startswith("(avviso)") for p in problems) else 0)
