"""Controlla i database JSON.

Uso:  python3 validate_db.py <cartella_con_i_json>
Esce con codice 1 se trova errori "duri"; le differenze con i numeri del Discord
sono segnalate come AVVISI (servono a capire quali dati mancano).
"""
import json
import os
import sys
from collections import Counter

DIR = sys.argv[1] if len(sys.argv) > 1 else "."


def load(name):
    with open(os.path.join(DIR, name), encoding="utf-8") as f:
        return json.load(f)


errors, warnings = [], []
ing = load("ingredients.json")["items"]
eff = load("effects.json")["items"]
prices = load("prices.json")
jobs = load("jobs.json")

AVAILABLE = {"both", "rift", "eastmarch", "present"}

# 1. conteggi generali (UESP: 91 base + 5 DG + 11 DB + 2 HF + 1 resource pack = 110)
if len(ing) != 110:
    errors.append(f"Ingredienti: attesi 110, trovati {len(ing)}")
plugins = Counter(i["plugin"] for i in ing)
expected_plugins = {"Skyrim.esm": 91, "Dawnguard.esm": 5, "Dragonborn.esm": 11,
                    "HearthFires.esm": 2, "_ResourcePack.esl": 1}
for p, n in expected_plugins.items():
    if plugins.get(p, 0) != n:
        errors.append(f"Plugin {p}: atteso {n}, trovato {plugins.get(p, 0)}")

# 2. ogni ingrediente: id unico, 4 effetti distinti e noti
ids = [i["id"] for i in ing]
for dup, n in Counter(ids).items():
    if n > 1:
        errors.append(f"ID duplicato: {dup}")
known_effects = {e["name_en"] for e in eff}
for i in ing:
    if len(i["effects"]) != 4 or len(set(i["effects"])) != 4:
        errors.append(f"{i['name_en']}: servono 4 effetti distinti, trovati {i['effects']}")
    for e in i["effects"]:
        if e not in known_effects:
            errors.append(f"{i['name_en']}: effetto sconosciuto '{e}'")

# 3. numeri del Discord: totale ingredienti per effetto e quanti nei feudi
by_id = {i["id"]: i for i in ing}
missing_hold = Counter()
for e in eff:
    ids_e = e["ingredients"]
    exp = e["discord_expected"]
    if len(ids_e) != exp["total_ingredients"]:
        warnings.append(
            f"[totale] {e['name_en']}: Discord {exp['total_ingredients']}, calcolati {len(ids_e)}")
    in_feudi = [x for x in ids_e if by_id[x]["feudi"]["availability"] in AVAILABLE]
    unknown = [x for x in ids_e if by_id[x]["feudi"]["availability"] == "unknown"]
    if len(in_feudi) != exp["in_feudi"]:
        warnings.append(
            f"[feudi] {e['name_en']}: Discord {exp['in_feudi']}, noti {len(in_feudi)}, "
            f"da verificare: {', '.join(unknown) if unknown else '-'}")
    for x in unknown:
        missing_hold[x] += 1

# 4. ricette minime: i due ingredienti devono avere davvero l'effetto
for e in eff:
    pair = e["min_recipe_in_feudi"]
    if pair:
        for x in pair:
            if x not in by_id:
                errors.append(f"Ricetta {e['name_en']}: ingrediente inesistente '{x}'")
            elif e["name_en"] not in by_id[x]["effects"]:
                errors.append(f"Ricetta {e['name_en']}: '{x}' non ha quell'effetto")

# 5. prezzi: min <= max
def walk_bands(obj, path=""):
    if isinstance(obj, dict):
        if "min" in obj and "max" in obj:
            if obj["max"] is not None and obj["min"] > obj["max"]:
                errors.append(f"Prezzi {path}: min > max")
        for k, v in obj.items():
            walk_bands(v, f"{path}/{k}")
    elif isinstance(obj, list):
        for n, v in enumerate(obj):
            walk_bands(v, f"{path}[{n}]")

walk_bands(prices)

# 6. job: i riferimenti devono esistere
job_ids = {j["id"] for j in jobs["items"]}
extra_ok = {"public_shop", "inns", "citizens", "merchants", "craftsmen", "faction",
            "everyone", "commissions"}
for j in jobs["items"]:
    for key in ("supplies", "needs", "pays"):
        for ref in j.get(key, []):
            if ref not in job_ids and ref not in extra_ok:
                errors.append(f"Job {j['id']}.{key}: riferimento sconosciuto '{ref}'")
    for ref in j.get("commissions", {}):
        if ref not in job_ids:
            errors.append(f"Job {j['id']}.commissions: riferimento sconosciuto '{ref}'")

# 7. creature e zone
cre = load("creatures.json")["items"]
zon = load("zones.json")
terr = {t["id"] for t in zon["terrains"]}
for c in cre:
    for h in c["habitat"]:
        if h not in terr | {"cold_water", "river", "cave", "forest", "sky", "tundra", "sea", "lake"}:
            errors.append(f"Creatura {c['id']}: habitat sconosciuto '{h}'")
    for d in c["drops"]:
        if d["chance"] is not None and not 0 <= d["chance"] <= 1:
            errors.append(f"Creatura {c['id']}: chance fuori da 0-1")
for hold in ("windhelm", "riften"):
    tot = round(sum(t[hold] for t in zon["terrains"]), 2)
    if abs(tot - 1) > 0.02:
        warnings.append(f"[terreno] {hold}: somma {tot} (attesa ~1)")
ic = zon["icons"]
for k, key in (("north_total", "north"), ("south_total", "south")):
    if sum(i[key] for i in ic["items"]) != ic[k]:
        errors.append(f"Icone {key}: somma diversa da {ic[k]}")

# 8. proposta permessi job: le azioni devono esistere nel vocabolario
_vocab = set(jobs.get("actions_proposal", {}).get("actions", {}))
for j in jobs["items"] + [jobs["starting_role_proposal"]]:
    for a in j.get("allowed_actions_proposal", []):
        if a not in _vocab:
            errors.append(f"Job {j['id']}: azione sconosciuta '{a}' nella proposta")

# ----- razze, incantesimi, progressione, regole di mondo (da Discord, 14 ottobre)
if os.path.exists(os.path.join(DIR, "races.json")):
    rc = load("races.json")
    skills = set(rc["skills"].values())
    if len(rc["items"]) != 10:
        errors.append(f"Razze: attese 10, trovate {len(rc['items'])}")
    for r in rc["items"]:
        for k, v in r["skill_bonus"].items():
            if k not in skills:
                errors.append(f"Razza {r['id']}: abilita' sconosciuta '{k}'")
            if v not in (20, 25):
                errors.append(f"Razza {r['id']}: bonus {k}={v} (attesi 20 o 25)")
        if not any(v == 25 for v in r["skill_bonus"].values()):
            errors.append(f"Razza {r['id']}: nessuna abilita' a 25")
    sp = load("spells.json")["items"]
    ids_sp = [x["id"] for x in sp]
    for dup, n in Counter(ids_sp).items():
        if n > 1:
            errors.append(f"Incantesimo duplicato: {dup}")
    for x in sp:
        if x["status"] not in ("allowed", "banned", "restricted"):
            errors.append(f"Incantesimo {x['id']}: stato sconosciuto '{x['status']}'")
        if x["status"] == "restricted" and not x["acquisition"] and not x["notes"]:
            warnings.append(f"Incantesimo {x['id']}: limitato ma senza fonte indicata")
    wr = load("world_rules.json")["population"]["per_city"]
    if wr["dungeons"]["total"] != sum(d["count"] for d in wr["dungeons"]["levels"]):
        errors.append("Regole di mondo: somma dei dungeon diversa dal totale")
    load("progression.json")
    print(f"Razze: {len(rc['items'])} | Incantesimi: {len(sp)} "
          f"(ok {sum(1 for x in sp if x['status']=='allowed')}, vietati {sum(1 for x in sp if x['status']=='banned')}, "
          f"limitati {sum(1 for x in sp if x['status']=='restricted')})")

# ----- loot e spawn (da Discord, 18 ottobre; aggiunto il 20 ottobre)
if os.path.exists(os.path.join(DIR, "loot.json")):
    lt = load("loot.json")["items"]
    lt_ids = [c["id"] for c in lt]
    for dup, n in Counter(lt_ids).items():
        if n > 1:
            errors.append(f"Loot duplicato: {dup}")
    cre_ids = {c["id"] for c in cre}
    for c in lt:
        if c["creature_id"] and c["creature_id"] not in cre_ids:
            errors.append(f"Loot {c['id']}: creature_id sconosciuto '{c['creature_id']}'")
        for d in c["drops"] + [x for d in c["drops"] for x in d.get("examples", [])]:
            if not 0 < d["chance"] <= 1:
                errors.append(f"Loot {c['id']}: chance fuori da 0-1 ({d})")
    sr = load("spawn_rules.json")
    for t in sr["terrain_species"]:
        if t["terrain"] not in terr | {"giant_camp"}:
            errors.append(f"Spawn: terreno sconosciuto '{t['terrain']}'")
        for s in t["species"]:
            if s not in lt_ids:
                errors.append(f"Spawn {t['terrain']}: specie senza loot '{s}'")
    for g in sr["groups"]:
        if g["species"] not in lt_ids:
            errors.append(f"Gruppo {g['id']}: specie senza loot '{g['species']}'")
    if sr["orc_forts"]["loot_id"] not in lt_ids:
        errors.append("Forti degli orchi: loot_id sconosciuto")
    print(f"Loot: {len(lt)} creature | Terreni con spawn: {len(sr['terrain_species'])} | "
          f"Accampamenti: {len(sr['giant_camps']['items'])} | Forti: {len(sr['orc_forts']['items'])}")

# ----- ricette di forgia (dai file di gioco, aggiunto il 20 ottobre)
if os.path.exists(os.path.join(DIR, "crafting.json")):
    cr = load("crafting.json")
    for r in cr["recipes"]:
        for ref in [r["output"]] + [x["item"] for x in r["inputs"]]:
            if ref not in cr["items"]:
                errors.append(f"Ricetta {r['id']}: oggetto sconosciuto '{ref}'")
        if r["bench"] not in cr["benches"]:
            errors.append(f"Ricetta {r['id']}: banco sconosciuto '{r['bench']}'")
        for p in r["perks"]:
            if p not in cr["perks"]:
                errors.append(f"Ricetta {r['id']}: perk sconosciuto '{p}'")
    for c in cr["catalog"]:
        if c["item"] and c["item"] not in cr["items"]:
            errors.append(f"Lista armi: '{c['discord_name']}' punta a un oggetto assente")
        if not c["craftable"] and not c.get("note"):
            warnings.append(f"Lista armi: '{c['discord_name']}' non ha ricetta e nessuna nota")
    print(f"Ricette di forgia: {len(cr['recipes'])} | Lista armi e corazze: {len(cr['catalog'])} "
          f"({sum(c['craftable'] for c in cr['catalog'])} costruibili)")

# ----- report
print(f"Ingredienti: {len(ing)} | Effetti: {len(eff)} | Job: {len(jobs['items'])}")
state = Counter(i["feudi"]["availability"] for i in ing)
print("Disponibilita' nei feudi:", dict(state))
print()
if errors:
    print(f"ERRORI ({len(errors)}):")
    for m in errors:
        print("  -", m)
else:
    print("Nessun errore.")
print()
print(f"AVVISI ({len(warnings)}):")
for m in warnings:
    print("  -", m)
print()
if missing_hold:
    print("Ingredienti con disponibilita' sconosciuta che compaiono in effetti con conteggio non tornato:")
    print("  ", ", ".join(f"{k} ({v})" for k, v in missing_hold.most_common()))
sys.exit(1 if errors else 0)
