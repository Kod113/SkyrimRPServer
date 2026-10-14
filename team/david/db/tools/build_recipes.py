"""Calcola le ricette di alchimia possibili con gli ingredienti presenti nei feudi.

Uso:  python3 build_recipes.py <cartella_db>
Legge ingredients.json ed effects.json, scrive recipes.json e stampa un riepilogo.

Regole di Skyrim usate:
  - una ricetta ha 2 o 3 ingredienti;
  - un effetto si attiva solo se almeno 2 ingredienti della ricetta lo hanno;
  - ricetta "pura" = produce un solo effetto (nessun effetto collaterale, utile o dannoso).
Disponibilita': 'both'/'rift'/'eastmarch'/'present' contano come presenti, 'none' no.
'present' = presente ma feudo non noto: contato in entrambi gli scenari (ottimistico).
"""
import itertools
import json
import os
import sys
from collections import defaultdict

DB = sys.argv[1] if len(sys.argv) > 1 else "."
ing = json.load(open(os.path.join(DB, "ingredients.json"), encoding="utf-8"))["items"]
eff = json.load(open(os.path.join(DB, "effects.json"), encoding="utf-8"))["items"]
eff_info = {e["name_en"]: e for e in eff}
name_of = {i["id"]: i["name_en"] for i in ing}

SCENARI = {
    "feudi": {"both", "rift", "eastmarch", "present"},
    "rift": {"both", "rift", "present"},
    "eastmarch": {"both", "eastmarch", "present"},
}


def effetti_ricetta(ids, by_id):
    """Effetti attivi: presenti in almeno 2 ingredienti della ricetta."""
    cont = defaultdict(int)
    for i in ids:
        for e in by_id[i]["effects"]:
            cont[e] += 1
    return sorted(e for e, n in cont.items() if n >= 2)


out = {"_meta": {"version": "0.1.0", "date": "2026-10-14", "author": "david",
                 "description": "Ricette di alchimia possibili con gli ingredienti presenti nei feudi (calcolate da ingredients.json).",
                 "scenarios": {k: sorted(v) for k, v in SCENARI.items()}}}
report = []
for scen, ok in SCENARI.items():
    avail = [i for i in ing if i["feudi"]["availability"] in ok]
    by_id = {i["id"]: i for i in avail}
    pairs = []
    for a, b in itertools.combinations(sorted(by_id), 2):
        eff_ab = effetti_ricetta([a, b], by_id)
        if eff_ab:
            pairs.append({"ingredients": [a, b], "effects": eff_ab})
    triples_needed = {}
    per_effect = {}
    for e in eff:
        n = e["name_en"]
        members = [i["id"] for i in avail if n in i["effects"]]
        pure = [p["ingredients"] for p in pairs if p["effects"] == [n]]
        any_pair = [p["ingredients"] for p in pairs if n in p["effects"]]
        # se non c'e' coppia pura: cerca una terna che produca solo questo effetto
        pure3 = []
        if not pure and len(members) >= 2:
            for t in itertools.combinations(sorted(by_id), 3):
                if effetti_ricetta(list(t), by_id) == [n]:
                    pure3.append(list(t))
                    if len(pure3) >= 3:
                        break
        per_effect[n] = {
            "kind": e["kind"], "ingredients_available": members,
            "craftable": len(members) >= 2,
            "pairs_total": len(any_pair), "pure_pairs": pure[:5], "pure_pairs_count": len(pure),
            "pure_triples_examples": pure3,
        }
    out[scen] = {"ingredients_available": len(avail), "pairs_with_effect": len(pairs),
                 "effects": per_effect,
                 "ingredients_without_partner": sorted(
                     i["id"] for i in avail
                     if not any(i["id"] in p["ingredients"] for p in pairs))}
    ok_n = sum(1 for v in per_effect.values() if v["craftable"])
    pot = sum(1 for v in per_effect.values() if v["craftable"] and v["kind"] == "pozione")
    vel = ok_n - pot
    nopure = [n for n, v in per_effect.items() if v["craftable"] and not v["pure_pairs_count"]]
    report.append((scen, len(avail), len(pairs), ok_n, pot, vel, nopure, out[scen]["ingredients_without_partner"]))

# confronto con le ricette minime scritte nel Discord
conf = []
by_id = {i["id"]: i for i in ing}
for e in eff:
    r = e["min_recipe_in_feudi"]
    if r:
        ok = effetti_ricetta(r, by_id)
        conf.append((e["name_en"], r, e["name_en"] in ok, ok))
out["discord_min_recipes_check"] = [
    {"effect": n, "recipe": r, "activates_effect": a, "all_effects_of_recipe": ok} for n, r, a, ok in conf]

with open(os.path.join(DB, "recipes.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

for scen, n_ing, n_pairs, ok_n, pot, vel, nopure, alone in report:
    print(f"[{scen}] ingredienti {n_ing} | coppie con effetto {n_pairs} | effetti realizzabili {ok_n}/55 (pozioni {pot}, veleni {vel})")
    print(f"   senza coppia pura: {len(nopure)} -> {nopure}")
    print(f"   ingredienti senza nessun partner utile: {[name_of[x] for x in alone]}")
print("Ricette minime del Discord:", sum(1 for c in conf if c[2]), "/", len(conf), "attivano l'effetto dichiarato")
for n, r, a, ok in conf:
    if not a or len(ok) > 1:
        print("  -", n, [name_of[x] for x in r], "->", ok)
