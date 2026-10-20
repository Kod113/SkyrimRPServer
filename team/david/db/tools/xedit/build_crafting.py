"""Legge le ricette di forgia dai file di gioco e scrive crafting.json.

Uso (dalla cartella tools/):
    python3 xedit/build_crafting.py .. "<cartella Data di Skyrim>"

Cosa fa:
  1. legge armi, corazze, frecce, lingotti, pelli, minerali e ricette (record COBJ) dai plugin
     caricati dal server (stesso ordine di configs/skymp/server-settings.json);
  2. prende i nomi italiani dai file Strings dentro "Skyrim - Interface.bsa";
  3. tiene solo gli oggetti della lista Discord #lista-armi-e-armature (solo il pezzo del busto
     per le armature) e, a catena, tutto cio' che serve per costruirli.
Le ricette di miglioramento (banco da lavoro, mola) non sono incluse: qui conta solo costruire.
Dipendenza: lz4 (pip install lz4).
"""
import json
import os
import struct
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import esm  # noqa: E402
from bsa import read_bsa, read_strings  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else ".."
DATA = sys.argv[2] if len(sys.argv) > 2 else "."
LOAD = ["Skyrim.esm", "Update.esm", "Dawnguard.esm", "HearthFires.esm", "Dragonborn.esm"]
DATE = "2026-10-20"

# banchi usati per COSTRUIRE (le chiavi sono gli EditorID delle keyword del gioco)
BENCHES = {
    "CraftingSmithingForge": "Forgia",
    "CraftingSmelter": "Fonderia",
    "CraftingTanningRack": "Rastrelliera per conciare",
    "DLC1CraftingDawnguard": "Forgia della Guardia dell'Alba",
    "CraftingSmithingSkyforge": "Forgia del Cielo",
}
HAS_PERK = 448          # codice della condizione "HasPerk" nei record COBJ

# Lista Discord #lista-armi-e-armature (Dave_St, 16 maggio 2026) -> EditorID nel gioco.
# None = nessun oggetto corrispondente. "note" spiega gli abbinamenti non ovvi.
CATALOG = [
    ("Una mano", "Spade", [("Spada di ferro", "IronSword"), ("Spada d'acciaio", "SteelSword"),
        ("Spada orchesca", "OrcishSword"), ("Spada nanica", "DwarvenSword"), ("Spada elfica", "ElvenSword"),
        ("Spada di vetro", "GlassSword")]),
    ("Una mano", "Asce", [("Ascia di ferro", "IronWarAxe"), ("Ascia d'acciaio", "SteelWarAxe"),
        ("Ascia orchesca", "OrcishWarAxe"), ("Ascia nanica", "DwarvenWarAxe"), ("Ascia elfica", "ElvenWarAxe")]),
    ("Una mano", "Mazze", [("Mazza di ferro", "IronMace"), ("Mazza d'acciaio", "SteelMace"),
        ("Mazza orchesca", "OrcishMace"), ("Mazza nanica", "DwarvenMace"), ("Mazza elfica", "ElvenMace")]),
    ("Due mani", "Spadoni", [("Spadone di ferro", "IronGreatsword"), ("Spadone d'acciaio", "SteelGreatsword"),
        ("Spadone orchesco", "OrcishGreatsword"), ("Spadone nanico", "DwarvenGreatsword"),
        ("Spadone elfico", "ElvenGreatsword")]),
    ("Due mani", "Asce da guerra", [("Ascia bipenne di ferro", "IronBattleaxe"),
        ("Ascia bipenne d'acciaio", "SteelBattleaxe"), ("Ascia orchesca", "OrcishBattleaxe"),
        ("Ascia nanica", "DwarvenBattleaxe")]),
    ("Due mani", "Martelli", [("Martello da guerra di ferro", "IronWarhammer"), ("Martello d'acciaio", "SteelWarhammer"),
        ("Martello orchesco", "OrcishWarhammer"), ("Martello nanico", "DwarvenWarhammer")]),
    ("A distanza", "Archi", [("Arco lungo", "LongBow"), ("Arco di caccia", "HuntingBow"),
        ("Arco orchesco", "OrcishBow"), ("Arco nanico", "DwarvenBow"), ("Arco elfico", "ElvenBow"),
        ("Arco di vetro", "GlassBow")]),
    ("A distanza", "Balestre", [("Balestra base", "DLC1CrossBow"), ("Balestra potenziata", "DLC1CrossBowEnhanced")]),
    ("A distanza", "Frecce", [("Frecce di ferro", "IronArrow"), ("Frecce d'acciaio", "SteelArrow"),
        ("Frecce naniche", "DwarvenArrow"), ("Frecce elfiche", "ElvenArrow")]),
    ("Armature leggere", "Busto", [("Armatura di cuoio", "ArmorHideCuirass"), ("Armatura borchiata", "ArmorStuddedCuirass"),
        ("Armatura di pelliccia", "ArmorBanditCuirass"), ("Armatura elfica", "ArmorElvenCuirass"),
        ("Armatura di vetro", "ArmorGlassCuirass")]),
    ("Armature pesanti", "Busto", [("Armatura di ferro", "ArmorIronCuirass"), ("Armatura d'acciaio", "ArmorSteelCuirassA"),
        ("Armatura nanica", "ArmorDwarvenCuirass"), ("Armatura orchesca", "ArmorOrcishCuirass")]),
]
CATALOG_NOTES = {
    "ArmorHideCuirass": "nel gioco italiano 'Corazza di cuoio' e' l'armatura Hide; la 'Corazza di pelle' (Leather) non e' nella lista Discord",
    "ArmorBanditCuirass": "l'armatura di pelliccia non ha ricetta nel gioco base: si trova o si compra",
    "LongBow": "nel gioco base non ha ricetta: si trova o si compra",
    "HuntingBow": "nel gioco base non ha ricetta: si trova o si compra",
    "DLC1CrossBow": "Discord: ottenibile solo con quest (dungeon permadeath, unica fucina)",
    "DLC1CrossBowEnhanced": "Discord: ottenibile solo con quest (dungeon permadeath, unica fucina)",
}
WEAPON_TYPES = {"WeapTypeSword": "spada", "WeapTypeWarAxe": "ascia", "WeapTypeMace": "mazza",
                "WeapTypeGreatsword": "spadone", "WeapTypeBattleaxe": "ascia da guerra",
                "WeapTypeWarhammer": "martello da guerra", "WeapTypeBow": "arco", "WeapTypeDagger": "pugnale"}

# ------------------------------------------------------------------ lettura dei plugin
index, get = read_bsa(os.path.join(DATA, "Skyrim - Interface.bsa"))
recs = {}
for plugin in LOAD:
    buf = esm.load(os.path.join(DATA, plugin))
    hdr = esm.subrecords(buf[24:24 + struct.unpack_from("<I", buf, 4)[0]])
    masters = [d.decode("latin1").rstrip("\0") for s, d in hdr if s == "MAST"]
    localized = struct.unpack_from("<I", buf, 8)[0] & 0x80
    s_it = read_strings(get, index, plugin, "italian")
    s_en = read_strings(get, index, plugin, "english")

    def gid(fid, masters=masters, plugin=plugin):
        mi = fid >> 24
        owner = masters[mi] if mi < len(masters) else plugin
        return (LOAD.index(owner) << 24) | (fid & 0xFFFFFF)

    for kind, p, sig, *_ in esm.walk(buf):
        if kind != "rec" or sig not in ("COBJ", "ARMO", "WEAP", "AMMO", "MISC", "INGR", "KYWD", "PERK", "SLGM"):
            continue
        sig, fid, flags, data, _ = esm.record_data(buf, p)
        r = {"sig": sig, "plugin": plugin, "form_id": f"{fid & 0xFFFFFF:06X}"}
        items, conds, kws = [], [], []
        for s, d in esm.subrecords(data):
            if s == "EDID":
                r["edid"] = d.rstrip(b"\0").decode("latin1")
            elif s == "FULL":
                if localized:
                    sid = struct.unpack_from("<I", d)[0]
                    r["it"], r["en"] = s_it.get(sid), s_en.get(sid)
                else:
                    r["it"] = r["en"] = d.rstrip(b"\0").decode("cp1252")
            elif s == "KWDA":
                kws = [gid(x) for x in struct.unpack_from(f"<{len(d) // 4}I", d)]
            elif sig == "COBJ" and s == "CNTO":
                f, c = struct.unpack_from("<Ii", d)
                items.append([gid(f), c])
            elif sig == "COBJ" and s == "CNAM":
                r["out"] = gid(struct.unpack_from("<I", d)[0])
            elif sig == "COBJ" and s == "BNAM":
                r["bench"] = gid(struct.unpack_from("<I", d)[0])
            elif sig == "COBJ" and s == "NAM1":
                r["qty"] = struct.unpack_from("<H", d)[0]
            elif sig == "COBJ" and s == "CTDA":
                func = struct.unpack_from("<H", d, 8)[0]
                if func == HAS_PERK:
                    conds.append(gid(struct.unpack_from("<I", d, 12)[0]))
            elif sig == "ARMO" and s == "BOD2":
                r["slots"], r["armor_type"] = struct.unpack_from("<II", d)
            elif sig == "ARMO" and s == "DNAM":
                r["rating"] = struct.unpack_from("<i", d)[0] / 100
            elif sig in ("ARMO", "MISC", "INGR", "SLGM") and s == "DATA" and len(d) >= 8:
                r["value"], r["weight"] = struct.unpack_from("<if", d)
            elif sig == "WEAP" and s == "DATA":
                r["value"], r["weight"], r["damage"] = struct.unpack_from("<ifH", d)
            elif sig == "AMMO" and s == "DATA" and len(d) >= 16:
                r["damage"] = round(struct.unpack_from("<f", d, 8)[0], 1)
                r["value"] = struct.unpack_from("<I", d, 12)[0]
                r["weight"] = round(struct.unpack_from("<f", d, 16)[0], 2) if len(d) >= 20 else None
        if kws:
            r["kw"] = kws
        if items:
            r["items"] = items
        if conds:
            r["perks"] = conds
        old = recs.get(gid(fid), {})
        recs[gid(fid)] = r if sig == "COBJ" else {**old, **r}

by_edid = {r.get("edid"): f for f, r in recs.items() if r.get("edid")}
edid = lambda f: recs.get(f, {}).get("edid")

# ------------------------------------------------------------------ ricette utili
recipes_by_out = {}
for f, r in recs.items():
    if r["sig"] == "COBJ" and "out" in r and edid(r.get("bench")) in BENCHES:
        recipes_by_out.setdefault(r["out"], []).append(r)

wanted, todo = set(), [by_edid[e] for _s, _g, lst in CATALOG for _n, e in lst if e in by_edid]
while todo:
    f = todo.pop()
    if f in wanted:
        continue
    wanted.add(f)
    for r in recipes_by_out.get(f, []):
        todo += [i for i, _c in r.get("items", [])]


def kind_of(r):
    e = r.get("edid", "")
    if r["sig"] == "WEAP":
        return "weapon"
    if r["sig"] == "AMMO":
        return "ammo"
    if r["sig"] == "ARMO":
        return "armor"
    if e.startswith("Ingot"):
        return "ingot"
    if e.startswith("Ore"):
        return "ore"
    if e.startswith("Dwarven") and r["sig"] == "MISC":
        return "scrap"              # rottami Dwemer, si fondono in lingotti di metallo nanico
    if e in ("Leather01", "LeatherStrips"):
        return "leather"
    if "Hide" in e or "Pelt" in e:
        return "pelt"
    return "material"


items = {}
for f in sorted(wanted, key=lambda x: recs[x].get("it") or ""):
    r = recs[f]
    it = {"id": r["edid"], "name_it": r.get("it"), "name_en": r.get("en"), "kind": kind_of(r),
          "plugin": r["plugin"], "form_id": r["form_id"], "value": r.get("value"),
          "weight": round(r["weight"], 2) if isinstance(r.get("weight"), float) else r.get("weight")}
    if r["sig"] == "ARMO":
        it["armor_class"] = {0: "leggera", 1: "pesante", 2: "abito"}.get(r.get("armor_type"))
        it["armor_rating"] = r.get("rating")
    if r["sig"] in ("WEAP", "AMMO"):
        it["damage"] = r.get("damage")
        types = [WEAPON_TYPES[edid(k)] for k in r.get("kw", []) if edid(k) in WEAPON_TYPES]
        it["weapon_type"] = types[0] if types else ("balestra" if "CrossBow" in r["edid"] else
                                                     "freccia" if r["sig"] == "AMMO" else None)
    items[r["edid"]] = it

recipes = []
for f in wanted:
    for r in recipes_by_out.get(f, []):
        recipes.append({
            "id": r["edid"], "output": edid(r["out"]), "qty": r.get("qty", 1),
            "bench": edid(r["bench"]), "perks": [edid(p) for p in r.get("perks", [])],
            "inputs": [{"item": edid(i), "qty": c} for i, c in r.get("items", [])]})
recipes.sort(key=lambda x: (x["output"], x["id"]))

perks = {}
for rcp in recipes:
    for p in rcp["perks"]:
        perks[p] = recs[by_edid[p]].get("it")

catalog = []
for section, group, lst in CATALOG:
    for name, e in lst:
        f = by_edid.get(e)
        catalog.append({"section_it": section, "group_it": group, "discord_name": name,
                        "item": e if f else None, "game_name_it": recs[f].get("it") if f else None,
                        "craftable": bool(f and recipes_by_out.get(f)),
                        "note": CATALOG_NOTES.get(e)})

with open(os.path.join(OUT, "crafting.json"), "w", encoding="utf-8") as fh:
    json.dump({
        "_meta": {"version": "0.1.0", "date": DATE, "author": "david",
                  "status": "dati del gioco base (stesso ordine di caricamento del server nel repo)",
                  "description": "Ricette per costruire le armi e le corazze (solo busto) della lista Discord, "
                                 "con tutti i passaggi intermedi (fonderia, conceria). Nomi italiani dai file del gioco.",
                  "sources": ["Skyrim.esm, Update.esm, Dawnguard.esm, HearthFires.esm, Dragonborn.esm (record COBJ)",
                              "Skyrim - Interface.bsa (Strings italiani)", "Discord #lista-armi-e-armature"],
                  "load_order": LOAD,
                  "not_included": "CombatSettings.esp (riscrive il crafting) non e' caricato dal server nel repo"},
        "benches": BENCHES, "perks": perks, "catalog": catalog, "items": items, "recipes": recipes},
        fh, ensure_ascii=False, indent=1)
print(f"Scritto crafting.json: {len(catalog)} voci della lista Discord "
      f"({sum(c['craftable'] for c in catalog)} costruibili), {len(items)} oggetti, {len(recipes)} ricette")
