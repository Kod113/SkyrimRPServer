"""Genera i database JSON del server a partire dai dati grezzi.

Uso:  python3 build_db.py <cartella_output>
Fonti: UESP (ingredienti), canali Discord "Atronach RP" categoria Economia E Job (13/10/2026).
"""
import json
import os
import sys
from data_ingredients import (INGREDIENTS, NAME_IT, EXPLICIT_HOLD, UNCERTAIN,
                              DISCORD_PAIRS, EFFECTS)

OUT = sys.argv[1] if len(sys.argv) > 1 else "out"
os.makedirs(OUT, exist_ok=True)

DATA_DATE = "2026-10-14"


def dump(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def slug(name):
    out = name.lower().replace("'", "").replace("-", "_").replace(" ", "_")
    return out


# ---------------------------------------------------------------- ingredienti
paired = {n for pair in DISCORD_PAIRS.values() for n in pair}

ingredients = []
for name, plugin, uesp_id, effects, tipo in INGREDIENTS:
    if name in EXPLICIT_HOLD:
        stato, fonte = EXPLICIT_HOLD[name], "discord:#piante-e-spawn"
    elif name in paired:
        stato, fonte = "present", "discord:#pozioni-alchemiche (ricetta minima)"
    elif name in UNCERTAIN:
        stato, fonte = "unknown", "discord:#piante-e-spawn (pochi dati)"
    else:
        stato, fonte = "unknown", "non citato nel Discord"
    local = uesp_id[-6:] if not uesp_id.startswith("FE") else uesp_id[-3:]
    ingredients.append({
        "id": slug(name),
        "name_en": name,
        "name_it": NAME_IT.get(name),
        "type": tipo,
        "plugin": plugin,
        "uesp_id": uesp_id,
        "local_form_id": local.lower(),
        "form_id_verified": False,
        "effects": effects,
        "feudi": {"availability": stato, "source": fonte},
    })

# ---------------------------------------------------------------- deduzioni
# Il Discord dichiara, per ogni effetto, quanti ingredienti sono nei feudi.
# Se per un effetto i conteggi sono gia' completi, gli ingredienti con dato
# mancante che hanno quell'effetto sono assenti; se il numero mancante coincide
# con quello dei candidati, sono tutti presenti. Si ripete finche' non cambia nulla.
AVAILABLE = {"both", "rift", "eastmarch", "present"}
by_id = {i["id"]: i for i in ingredients}
contradictions = []
changed = True
while changed:
    changed = False
    for eff, (_, _, _, exp_feudi) in EFFECTS.items():
        members = [i for i in ingredients if eff in i["effects"]]
        known = sum(1 for i in members if i["feudi"]["availability"] in AVAILABLE)
        unk = [i for i in members if i["feudi"]["availability"] == "unknown"]
        deficit = exp_feudi - known
        if deficit < 0 or deficit > len(unk):
            contradictions.append(f"{eff}: attesi {exp_feudi}, noti {known}, incerti {len(unk)}")
            continue
        if unk and deficit == 0:
            for i in unk:
                i["feudi"] = {"availability": "none", "inferred": True,
                              "source": f"dedotto da #pozioni-alchemiche (effetto '{eff}' gia' completo nei feudi)"}
            changed = True
        elif unk and deficit == len(unk):
            for i in unk:
                i["feudi"] = {"availability": "present", "inferred": True,
                              "source": f"dedotto da #pozioni-alchemiche (effetto '{eff}': servono tutti i candidati)"}
            changed = True
if contradictions:
    print("ATTENZIONE, contraddizioni nei dati del Discord:", *contradictions, sep="\n  ")

# ID verificati con xEdit: se esiste xedit_ingredients.csv accanto ai JSON (creato da
# xedit/import_xedit.py) gli ingredienti con ID uguale diventano form_id_verified=true.
import csv as _csv
_xcsv = os.path.join(OUT, "xedit_ingredients.csv")
if os.path.exists(_xcsv):
    _norm = lambda s: "".join(c for c in s.lower() if c.isalnum())
    with open(_xcsv, encoding="utf-8-sig", newline="") as _f:
        _rows = list(_csv.DictReader(_f, delimiter=";"))
    for _i in ingredients:
        for _r in _rows:
            if _norm(_r["nome"]) == _norm(_i["name_en"]) and _r["plugin"].lower() == _i["plugin"].lower():
                _a, _b = _i["local_form_id"].lower().lstrip("0"), _r["formid_locale"].lower().lstrip("0")
                if _i["plugin"].endswith(".esl") or _i["uesp_id"].startswith("FE"):
                    _a, _b = _a[-3:], _b[-3:]
                if _a == _b:
                    _i["form_id_verified"] = True
                    _i["editor_id"] = _r["editor_id"]
                break

# Piante reali nel mondo (da xedit/build_world.py): world_refs.csv accanto ai JSON
_wcsv = os.path.join(OUT, "world_refs.csv")
WORLD_REFS = {}
if os.path.exists(_wcsv):
    from collections import Counter as _C, defaultdict as _D
    WORLD_REFS = _D(_C)
    with open(_wcsv, encoding="utf-8", newline="") as _f:
        for _r in _csv.DictReader(_f):
            if _r["gives_ingredient_id"]:
                WORLD_REFS[_r["gives_ingredient_id"].lstrip("0").lower()][_r["hold"]] += 1
    for _i in ingredients:
        if _i["plugin"] == "Skyrim.esm":
            _c = WORLD_REFS.get(_i["local_form_id"].lstrip("0").lower())
            if _c:
                _i["world_plants"] = {"eastmarch": _c.get("eastmarch", 0), "rift": _c.get("rift", 0)}

from data_world import ITEM_STATS
_unmatched = [k for k in ITEM_STATS if k not in {i["name_en"] for i in ingredients}]
for _i in ingredients:
    if _i["name_en"] in ITEM_STATS:
        v, w, o = ITEM_STATS[_i["name_en"]]
        _i["stats"] = {"value": v, "weight": w, "other_uses": o}
if _unmatched:
    print("Ingredienti con stats non trovati:", _unmatched)

dump("ingredients.json", {
    "_meta": {
        "version": "0.1.0",
        "date": DATA_DATE,
        "author": "david",
        "description": "110 ingredienti del server (Skyrim base + Dawnguard + Hearthfire + Dragonborn + Aloe Vera della Resource Pack, senza Creation Club).",
        "sources": ["https://en.uesp.net/wiki/Skyrim:Ingredients", "Discord Atronach RP #piante-e-spawn"],
        "notes": [
            "form_id_verified=false: gli ID di UESP vanno ricontrollati con xEdit prima dell'uso nel gamemode.",
            "feudi.availability: both/rift/eastmarch = presente con hold noto; present = presente (hold non specificato); none = assente; unknown = dato mancante.",
            "feudi.inferred=true: valore dedotto dai conteggi del Discord (non scritto esplicitamente); da confermare con le immagini di #creature-spawm e #loot-implicazioni-alchemiche.",
            "type e' una classificazione provvisoria (pianta/fungo/animale/altro).",
        ],
    },
    "items": ingredients,
})

# ------------------------------------------------------------------- effetti
by_effect = {}
for ing in ingredients:
    for e in ing["effects"]:
        by_effect.setdefault(e, []).append(ing["id"])

effects_out = []
for eff, (name_it, kind, exp_total, exp_feudi) in EFFECTS.items():
    effects_out.append({
        "id": slug(eff),
        "name_en": eff,
        "name_it": name_it,
        "kind": kind,
        "ingredients": sorted(by_effect.get(eff, [])),
        "discord_expected": {"total_ingredients": exp_total, "in_feudi": exp_feudi},
        "min_recipe_in_feudi": [slug(x) for x in DISCORD_PAIRS[eff]] if eff in DISCORD_PAIRS else None,
    })

dump("effects.json", {
    "_meta": {
        "version": "0.1.0",
        "date": DATA_DATE,
        "author": "david",
        "description": "Effetti alchemici. 'ingredients' e' calcolato da ingredients.json; 'discord_expected' sono i numeri scritti nel canale #pozioni-alchemiche, usati per la verifica.",
        "rules": [
            "Una pozione usa 2 o 3 ingredienti; almeno 2 devono condividere lo stesso effetto.",
            "Effetto buono in comune = pozione. Effetto cattivo in comune = veleno.",
            "Ogni ingrediente ha 4 effetti; mangiandolo si scopre il primo.",
        ],
    },
    "items": effects_out,
})

# --------------------------------------------------------------------- prezzi
prices = {
    "_meta": {
        "version": "0.1.0",
        "date": DATA_DATE,
        "author": "david",
        "description": "Fasce di prezzo e guadagni dal canale #fascia-di-prezzi. Sono valori di partenza: lo staff li tara dopo aver misurato in gioco.",
        "sources": ["Discord Atronach RP #fascia-di-prezzi"],
    },
    "currency": {"id": "septim", "name": "Septim"},
    "reference": {
        "meal_in_tavern": 10,
        "night_at_inn": 20,
    },
    "balance_rules": {
        "craft_multiplier": {"min": 2, "max": 3,
                             "note": "Un oggetto lavorato vale circa 2-3 volte i materiali."},
        "job_parity": "A parità di tempo nessun job guadagna molto più di un altro.",
        "price_bands": "I prezzi si trattano dentro la fascia; fuori fascia solo per motivo di RP (rarità, urgenza, amicizia).",
        "money_in": ["stipendi e commissioni del Jarl", "taglie", "ricompense di quest ed eventi"],
        "money_out": ["pasti e locande", "pozioni e rimedi", "riparazioni", "tasse", "acquisti dallo Stato"],
        "rewards_note": "Le ricompense in denaro di quest ed eventi passano dal Responsabile Lore, come ogni altro give.",
    },
    "bands": {
        "raw_materials": [
            {"id": "animal_hide", "name_it": "Pelle di animale", "min": 5, "max": 8},
            {"id": "meat", "name_it": "Carne", "min": 3, "max": 5},
            {"id": "raw_iron_ore", "name_it": "Minerale grezzo (ferro)", "min": 4, "max": 6},
            {"id": "iron_ingot", "name_it": "Lingotto di ferro", "min": 10, "max": 14},
            {"id": "steel_ingot", "name_it": "Lingotto di acciaio", "min": 25, "max": 35},
            {"id": "ingredient_common", "name_it": "Ingrediente comune", "min": 3, "max": 6},
            {"id": "ingredient_rare", "name_it": "Ingrediente raro", "min": 15, "max": 40},
        ],
        "equipment": [
            {"id": "iron_weapon", "name_it": "Arma di ferro", "min": 90, "max": 130},
            {"id": "steel_weapon", "name_it": "Arma d'acciaio", "min": 200, "max": 300},
            {"id": "leather_armor", "name_it": "Armatura di cuoio", "min": 120, "max": 180},
            {"id": "iron_armor", "name_it": "Armatura di ferro", "min": 350, "max": 500},
            {"id": "repair", "name_it": "Riparazione", "min": 10, "max": 25},
        ],
        "alchemy_and_healing": [
            {"id": "basic_remedy", "name_it": "Rimedio base (bende, erbe)", "min": 15, "max": 25},
            {"id": "potion_health_minor", "name_it": "Pozione curativa minore", "min": 40, "max": 60},
            {"id": "potion_health_medium", "name_it": "Pozione curativa media", "min": 100, "max": 140},
            {"id": "potion_stamina", "name_it": "Pozione di stamina", "min": 30, "max": 50},
            {"id": "heal_wound_light", "name_it": "Cura di una ferita lieve", "min": 25, "max": 40},
            {"id": "heal_wound_severe", "name_it": "Cura di una ferita grave", "min": 80, "max": 120},
        ],
        "bounties": [
            {"id": "bounty_wolf", "name_it": "Lupo", "min": 40, "max": 60},
            {"id": "bounty_bear", "name_it": "Orso", "min": 120, "max": 180},
            {"id": "bounty_bandits", "name_it": "Banditi", "min": 100, "max": 200},
            {"id": "bounty_rare", "name_it": "Creature rare o pericolose", "min": 400, "max": None,
             "note": "da 400 in su"},
        ],
    },
    "estimated_earnings_per_hour": {
        "note": "Stima per un'ora di gioco di lavoro attivo.",
        "hunter": {"min": 40, "max": 70},
        "miner": {"min": 40, "max": 70},
        "blacksmith": {"min": 50, "max": 80},
        "alchemist": {"min": 50, "max": 80},
        "healer": {"min": 45, "max": 75},
    },
    "jarl_salaries_per_session": {
        "note": "Stipendio per una sessione di servizio (circa un'ora).",
        "city_guard": {"min": 60, "max": 90},
        "soldier": {"min": 70, "max": 100},
    },
}
dump("prices.json", prices)

# ------------------------------------------------------------------------ job
jobs = {
    "_meta": {
        "version": "0.1.0",
        "date": DATA_DATE,
        "author": "david",
        "description": "Catena economica dei job dal canale #job. I campi 'allowed_actions' sono da definire (vedi README): servono per il blocco azioni per job.",
        "sources": ["Discord Atronach RP #job"],
    },
    "rules": [
        "Ogni scambio avviene in RP, tra personaggi.",
        "I prezzi si trattano fra i player, dentro le fasce stabilite dallo staff.",
        "Le commissioni importanti passano dalla bacheca cittadina.",
        "Ogni job è utile agli altri.",
    ],
    "bulletin_board_template": ["requester", "need", "quantity", "reward", "deadline", "job"],
    "items": [
        {
            "id": "miner", "name_it": "Minatore",
            "does": "Estrae minerali e materiali grezzi dalle miniere.",
            "supplies": ["blacksmith", "jarl"],
            "needs": ["blacksmith", "healer", "city_guard"],
            "earns_from": ["vendita al Fabbro", "commissioni della bacheca"],
            "allowed_actions": None,
        },
        {
            "id": "hunter", "name_it": "Cacciatore",
            "does": "Caccia animali e porta pelli, carne e parti animali.",
            "supplies": ["blacksmith", "alchemist", "inns", "jarl"],
            "needs": ["blacksmith", "alchemist", "healer"],
            "earns_from": ["vendita di pelli e carne", "taglie della bacheca"],
            "allowed_actions": None,
        },
        {
            "id": "blacksmith", "name_it": "Fabbro",
            "does": "Forgia armi, armature e utensili.",
            "supplies": ["city_guard", "soldier", "jarl", "miner", "hunter", "public_shop"],
            "needs": ["miner", "hunter"],
            "note": "Può chiedere a giovani avventurieri di recuperare materiali.",
            "earns_from": ["vendite nello shop", "forniture al Jarl", "riparazioni"],
            "allowed_actions": None,
        },
        {
            "id": "alchemist", "name_it": "Alchimista",
            "does": "Prepara pozioni, rimedi e veleni.",
            "supplies": ["healer", "city_guard", "soldier", "hunter", "public_shop"],
            "needs": ["hunter"],
            "note": "Ingredienti raccolti da avventurieri e cacciatori; può appendere liste di ingredienti in bacheca.",
            "earns_from": ["vendita di pozioni", "liste ingredienti", "forniture al Jarl"],
            "allowed_actions": None,
        },
        {
            "id": "healer", "name_it": "Medico",
            "does": "Cura feriti e malati della città.",
            "supplies": ["everyone"],
            "needs": ["alchemist", "city_guard"],
            "earns_from": ["pagamento delle cure", "ingaggio dal Jarl per guardie e soldati"],
            "allowed_actions": None,
        },
        {
            "id": "city_guard", "name_it": "Guardia cittadina",
            "does": "Mantiene l'ordine e la sicurezza in città e sulle strade.",
            "supplies": ["citizens", "merchants", "craftsmen", "miner"],
            "needs": ["blacksmith", "alchemist", "healer"],
            "earns_from": ["stipendio dal Jarl", "incarichi e taglie della bacheca"],
            "allowed_actions": None,
        },
        {
            "id": "soldier", "name_it": "Soldato",
            "does": "Difende il territorio e combatte nelle guerre tra fazioni.",
            "supplies": ["jarl", "faction"],
            "needs": ["blacksmith", "alchemist", "healer"],
            "earns_from": ["stipendio del Jarl", "bottino concordato", "taglie della bacheca"],
            "allowed_actions": None,
        },
        {
            "id": "jarl", "name_it": "Jarl",
            "does": "Guida la città e fa girare l'economia con le sue commissioni.",
            "commissions": {
                "blacksmith": "armi per i nuovi soldati",
                "miner": "materiali",
                "hunter": "taglie",
                "soldier": "taglie",
                "alchemist": "liste di ingredienti",
                "healer": "cure e rimedi",
            },
            "pays": ["city_guard", "soldier", "commissions"],
            "allowed_actions": None,
        },
    ],
    "starting_role_proposal": {
        "status": "PROPOSTA, da approvare",
        "id": "adventurer",
        "name_it": "Avventuriero",
        "note": "Ruolo di partenza senza job: raccoglie materiali, prende incarichi in bacheca. Citato nel Discord come 'giovani avventurieri'.",
    },
}
# ---- PROPOSTA (da approvare) dei permessi per job; allowed_actions resta null finche' David non approva
ACTIONS_PROPOSAL = {
    "gather_plants": "Raccogliere piante, funghi e uova selvatiche",
    "gather_ore": "Estrarre minerali dalle miniere",
    "loot_animal": "Scuoiare/prendere parti da animali morti",
    "fish": "Pescare",
    "smith": "Forgiare e riparare armi, armature e utensili",
    "brew": "Preparare pozioni, rimedi e veleni",
    "heal": "Curare altri personaggi",
    "arrest": "Arrestare e perquisire",
    "fight_in_war": "Combattere nelle guerre tra fazioni",
    "sell_public_shop": "Gestire uno shop pubblico",
    "pay_salary": "Pagare stipendi e commissioni",
    "post_board": "Appendere richieste in bacheca",
    "take_board": "Accettare richieste dalla bacheca",
    "trade": "Scambiare oggetti e monete con altri player",
}
COMMON = ["post_board", "take_board", "trade"]
PROPOSAL = {
    "miner": ["gather_ore"],
    "hunter": ["loot_animal", "gather_plants", "fish"],
    "blacksmith": ["smith", "sell_public_shop"],
    "alchemist": ["brew", "gather_plants", "sell_public_shop"],
    "healer": ["heal", "gather_plants"],
    "city_guard": ["arrest"],
    "soldier": ["fight_in_war"],
    "jarl": ["pay_salary"],
}
for _j in jobs["items"]:
    _j["allowed_actions_proposal"] = PROPOSAL[_j["id"]] + COMMON
    _j["allowed_actions"] = list(_j["allowed_actions_proposal"])   # PROVVISORIO (14 ott 2026): David ha detto "per adesso si"
jobs["actions_proposal"] = {"status": "PROVVISORIO: applicata il 14 ott 2026 su indicazione di David (\"per adesso si\"); le 5 decisioni di fondo restano aperte", "common_to_all": COMMON,
                            "actions": ACTIONS_PROPOSAL}
jobs["starting_role_proposal"]["allowed_actions_proposal"] = (
    ["gather_plants", "loot_animal", "fish"] + COMMON)

dump("jobs.json", jobs)

# ----------------------------------------------- creature e zone
from data_world import CREATURES, UNREAD_CREATURES, TERRAINS, PLACES, BORDER, ICONS

def meta(desc, status, sources):
    return {"version": "0.1.0", "date": DATA_DATE, "author": "david", "status": status,
            "description": desc, "sources": sources}

dump("creatures.json", {
    "_meta": meta("Creature, habitat, comportamento e drop (percentuali 0-1; null = non indicato nel Discord).",
                  "bozza: percentuali aggiornate il 20 ott 2026 (loot completo in loot.json)",
                  ["Discord #creature-spawm", "Discord #loot-implicazioni-alchemiche",
                   "Discord #animali-e-loot (18 ott 2026)"]),
    "_unread": UNREAD_CREATURES,
    "items": CREATURES})

dump("zones.json", {
    "_meta": meta("Terreni, luoghi e confine tra Rift (Riften) e Eastmarch (Windhelm).",
                  "bozza: schema indicativo disegnato a mano, da verificare in gioco",
                  ["Discord #paesaggi-e-territorio", "Discord #confini-mondo-di-gioco"]),
    "grid": {"columns": "A-J", "rows": "1-15", "cell_px": 50},
    "terrains": TERRAINS,
    "places": PLACES,
    "border": BORDER,
    "game_data": (json.load(open(os.path.join(OUT, "world_summary.json"), encoding="utf-8"))
                  if os.path.exists(os.path.join(OUT, "world_summary.json")) else None),
    "icons": {"north_total": 55, "south_total": 44,
              "items": [dict(id=i, name_it=n, north=a, south=b) for i, n, a, b in ICONS]}})

# spawn_rules.json e loot.json: li genera build_loot_spawn.py (dati del Discord del 18 ott 2026)

print("Generati i file in", OUT)
