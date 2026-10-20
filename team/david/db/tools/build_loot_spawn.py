"""Genera loot.json e spawn_rules.json dai canali Discord del 18 ottobre 2026.

Uso:  python3 build_loot_spawn.py <cartella_db>
Fonti (copie del testo del Discord, lette il 20 ottobre 2026):
  discord_2026-10-18/animali-e-loot.txt      -> loot degli animali
  discord_2026-10-18/mob-mostri-e-loot.txt   -> loot dei mostri
  discord_2026-10-18/regole-spawn-e-loot.md  -> regole (riportate a mano qui sotto)
Niente e' inventato: valori non scritti nel Discord = null. Percentuali 0-1.
"""
import json
import os
import re
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else ".."
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "discord_2026-10-18")
DATE = "2026-10-20"
AUTHOR = "david"

# id del loot (Discord) -> id in creatures.json, dove la creatura esiste gia'
CREATURE_LINK = {
    "cervo": "deer", "alce": "elk", "volpe": "fox", "volpe_artica": "snow_fox", "coniglio": "rabbit",
    "capra": "goat", "lupo": "wolf", "lupo_di_ghiaccio": "ice_wolf", "orso_delle_caverne": "cave_bear",
    "orso_delle_nevi": "snow_bear", "gatto_dai_denti_a_sciabola": "sabre_cat",
    "gatto_dai_denti_a_sciabola_delle_nevi": "snowy_sabre_cat", "skeever": "skeever",
    "pesce_macellaio": "slaughterfish", "mammut": "mammoth", "ragno_del_gelo": "frostbite_spider",
    "spettro_di_ghiaccio": "ice_wraith", "troll_del_gelo": "frost_troll"}

# parole che indicano una categoria di oggetti (non un oggetto preciso)
CATEGORIES = {"Armi": "weapons", "Armature e abiti": "apparel", "Pozioni, veleni e cibo": "consumables",
              "Gemme": "gems", "Libri e ricette": "books", "lingotti e minerali": "ingots_ores",
              "Piccolo tesoro (oro/gemma/anello)": "small_treasure"}


def pct(s):
    return round(float(s) / 100, 4)


def split_top(text, sep):
    """Divide sul separatore, ma non dentro le parentesi."""
    parts, depth, cur = [], 0, ""
    for ch in text:
        depth += ch == "("
        depth -= ch == ")"
        if ch == sep and depth == 0:
            parts.append(cur.strip())
            cur = ""
        else:
            cur += ch
    if cur.strip():
        parts.append(cur.strip())
    return parts


ITEM_RE = re.compile(r"^(?P<name>.+?)(?: x(?P<qa>\d+))? (?P<pct>[\d.]+)%(?: x(?P<qb>\d+))?(?: \((?P<extra>.*)\))?$")


def parse_item(text):
    m = ITEM_RE.match(text.strip())
    if not m:
        raise ValueError(f"non riesco a leggere: {text!r}")
    name = m["name"].strip()
    qty = int(m["qa"] or m["qb"] or 1)
    d = {"item_it": name, "chance": pct(m["pct"]), "qty": qty}
    extra = m["extra"]
    if name == "Oro":
        d["kind"] = "gold"
        if extra and extra.startswith("fino a "):
            d["qty"], d["qty_max"] = None, int(extra[7:])
        d.pop("item_it")
    elif name in CATEGORIES:
        d["kind"] = "category"
        d["category"] = CATEGORIES[name]
        if extra and extra.startswith("es. "):
            d["examples"] = [parse_item(x) for x in split_top(extra[4:], ",")]
    else:
        d["kind"] = "item"
        if extra:
            d["note"] = extra
    if name == "Oro" and qty > 1:  # "Oro x250 100%"
        d["qty"] = qty
    return d


def parse_line(line):
    head, body = line.split(":", 1)
    m = re.match(r"^(\w+)(?: \(liv\. (\d+)\))?$", head.strip())
    cid, level = m[1], (int(m[2]) if m[2] else None)
    sep = "·" if "·" in body else ","
    drops, wears = [], []
    for part in split_top(body, sep):
        if part.startswith("Indossa:"):
            wears = [w.strip() for w in part[8:].split(",")]
            continue
        # una parte puo' contenere piu' oggetti separati da virgola (es. "Spada 88%, Ascia 88%")
        # (ma non le categorie che hanno una virgola nel nome, es. "Pozioni, veleni e cibo")
        whole = sep != "·" or any(part.startswith(k) for k in CATEGORIES if "," in k)
        sub = [part] if whole else split_top(part, ",")
        for s in sub:
            drops.append(parse_item(s))
    return cid, level, drops, wears


def read_txt(name, kind):
    items, section = [], None
    with open(os.path.join(SRC, name), encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("# "):
                continue
            if line.startswith("## "):
                section = line[3:]
                continue
            cid, level, drops, wears = parse_line(line)
            items.append({"id": cid, "type": kind, "section_it": section, "level": level,
                          "creature_id": CREATURE_LINK.get(cid), "drops": drops, "wears_it": wears})
    return items


animals = read_txt("animali-e-loot.txt", "animal")
monsters = read_txt("mob-mostri-e-loot.txt", "monster")

# mammut e ragno del gelo gigante compaiono in entrambi i canali: si tiene la riga degli animali
# e si conserva l'altra come "alt_listing" (stessi oggetti sicuri, scritti in modo diverso)
loot, seen = [], {}
for c in animals + monsters:
    if c["id"] in seen:
        seen[c["id"]]["alt_listing"] = {"source": "#mob-mostri-e-loot", "level": c["level"], "drops": c["drops"],
                                        "wears_it": c["wears_it"]}
        if seen[c["id"]]["level"] is None:
            seen[c["id"]]["level"] = c["level"]
        continue
    seen[c["id"]] = c
    loot.append(c)

STAFF_ONLY = {"drago": "solo evento dello staff, nessuno spawn automatico",
              "gigante_del_gelo": "solo creatura evocata dallo staff (la sua mazza era incantata: tolta)"}
for c in loot:
    if c["id"] in STAFF_ONLY:
        c["staff_only"] = STAFF_ONLY[c["id"]]

# loot degli orchi (#forti-degli-orchi): non e' una tabella di Skyrim ma una regola del server
loot.append({"id": "orco", "type": "monster", "section_it": "Orchi (forti degli orchi)", "level": None,
             "creature_id": None, "wears_it": [],
             "drops": [{"kind": "item", "item_it": "Oricalco grezzo", "chance": 0.45, "qty": None, "qty_min": 1, "qty_max": 3},
                       {"kind": "item", "item_it": "Lingotto di oricalco", "chance": 0.10, "qty": 1}],
             "notes": "niente armi ne' armature orchesche (motivi economici); i capi hanno un loot a parte, da definire"})

with open(os.path.join(OUT, "loot.json"), "w", encoding="utf-8") as f:
    json.dump({
        "_meta": {"version": "0.1.0", "date": DATE, "author": AUTHOR, "status": "bozza: dati del Discord",
                  "description": "Loot di animali e mostri. chance = probabilita' di trovare almeno uno di quell'oggetto "
                                 "(0-1), calcolata da Dave_St dai dati ufficiali di Skyrim per un personaggio di livello ~30. "
                                 "kind: item | gold | category (categoria di oggetti, con gli esempi piu' probabili).",
                  "sources": ["Discord #animali-e-loot", "Discord #mob-mostri-e-loot", "Discord #come-leggere-le-percentuali",
                              "Discord #funzione-e-info-generali", "Discord #forti-degli-orchi"]},
        "rules": {
            "no_magic_items": True,
            "no_magic_items_note": "Scelta voluta: oggetti magici e incantati li da' lo staff con le quest. Un oggetto incantato "
                                   "diventa la sua versione normale; se non esiste, sparisce. Le pozioni restano.",
            "removed_it": ["bastoni", "pergamene", "tomi di incantesimi", "gemme dell'anima (tutte)", "mazza del gigante del gelo"],
            "swap_examples_it": [["Antico spadone nord del ghiaccio", "Antico spadone nord"],
                                 ["Vesti del vampiro di Distruzione", "Vesti del vampiro"],
                                 ["Vesti nere del mago (incantate)", "Vesti nere"]],
            "swap_table": "magic-swap.json (nella cartella del server di chi l'ha scritto; non e' ancora nel repo)",
            "swap_check_on": ["spawn", "death", "loot_open"],
            "reference_level": 30,
            "worn_items_lootable": True,
            "hidden_non_playable_it": ["capelli e barba dei draugr", "Elmo nord antico", "Scudo spriggan",
                                       "un oggetto dei ragni del gelo"],
            "small_treasure_it": "oro (1-9), una gemma o un anello d'argento normale",
            "keep_human_flesh": True,
            "client_requirement": "tutti i giocatori devono avere il CombatSettings.esp aggiornato (pellicce visibili)"},
        "items": loot}, f, ensure_ascii=False, indent=1)

# ------------------------------------------------------------------ spawn_rules.json
# terreni = chiavi di zones.json "terrains"; specie = id di loot.json
TERRAIN_SPECIES = [
    ("mountain", ["capra", "lupo", "orso", "gatto_dai_denti_a_sciabola"], "gatti dai denti a sciabola: pochi"),
    ("plain", ["cervo", "coniglio", "volpe", "lupo"], "lupi: qualcuno"),
    ("snow", ["lupo_di_ghiaccio", "volpe_artica", "orso_delle_nevi"], None),
    ("poplar_forest", ["cervo", "alce", "coniglio", "orso", "lupo_rosso"], None),
    ("pine_forest", ["cervo", "alce", "volpe", "lupo", "orso"], None),
    ("sulfur", ["capra", "gatto_dai_denti_a_sciabola"], "zona povera, poco cibo; gatti: qualcuno"),
    ("lake", ["granchio_di_fango", "pesce_macellaio"], None),
    ("sea", ["horker"], "lungo la costa"),
    ("giant_camp", ["mammut"], "vedi giant_camps"),
]

CAMP = {"giants": 3, "mammoths_grazing": 5, "mammoth_spawn_points": 2, "mammoths_per_point_per_hour": 2,
        "perimeter_radius": 8500, "keep_mammoths_inside": True}
GIANT_CAMPS = [
    dict(id="windhelm_1", hold="eastmarch", name_it="Windhelm 1 (pianura a ovest)", x=92400, y=-5400, active=True, origin="vanilla"),
    dict(id="windhelm_2", hold="eastmarch", name_it="Windhelm 2 (pozze di zolfo)", x=143500, y=-10000, active=True, origin="vanilla"),
    dict(id="windhelm_reserve", hold="eastmarch", name_it="Windhelm (riserva)", x=111700, y=-14300, active=False, origin="vanilla"),
    dict(id="riften_1", hold="rift", name_it="Riften 1 (pianura a est, ai piedi dei monti)", x=178600, y=-72300, active=True, origin="nuovo"),
    dict(id="riften_2", hold="rift", name_it="Riften 2 (pianura a ovest)", x=99800, y=-85100, active=True, origin="nuovo"),
]
for c in GIANT_CAMPS:
    c["z"] = None
    c["verified_in_game"] = False

CHESTS = {"status": "proposta, quantita' e nomi da verificare in gioco", "per_camp": 2, "items": [
    {"id": "fire_chest", "name_it": "Forziere del fuoco (cibo e materiali)",
     "always": [{"item_it": "Ciotola di formaggio di mammut", "qty": 3}, {"item_it": "Zanna di mammut", "qty": 2},
                {"item_it": "Dito di gigante", "qty": 2}, {"kind": "gold", "qty": 250}],
     "chance": [{"item_it": "Pozione di cura", "qty": 2, "chance": 0.45},
                {"item_it": "Carne cruda/cotta", "qty": 3, "chance": 0.60},
                {"item_it": "Pelli (cervo, lupo)", "qty": 2, "chance": 0.40}]},
    {"id": "treasure_chest", "name_it": "Forziere del tesoro (ricompensa)",
     "always": [{"kind": "gold", "qty": 400}, {"item_it": "gemma", "qty": 1}],
     "chance": [{"item_it": "seconda gemma", "qty": 1, "chance": 0.50}, {"item_it": "Diamante", "qty": 1, "chance": 0.10},
                {"item_it": "Lingotto d'acciaio", "qty": 3, "chance": 0.40}, {"item_it": "Anello d'argento", "qty": 1, "chance": 0.15},
                {"item_it": "Pozione di resistenza al freddo", "qty": 1, "chance": 0.30}]}]}

ORC_FORTS = {
    "lore_it": "La guerra degli orchi: dopo 400 anni di pace gli orchi, schiavizzati per ricostruire i regni, si ribellano "
               "guidati da Ugrosh gro-Barzul 'lo Spezzacatene'. Un forte per regno.",
    "inside_alive": 10, "inside_alive_alternative": 15, "inside_respawn_s": [3, 5],
    "inside_radius": 2400, "patrol_radius": 11000, "patrol_respawn_s": 3600,
    "aggression": "attaccano i player a vista; le creature solo se ostili o se vengono attaccati",
    "conquest": "uccidere tutti i difensori; poi il forte appartiene a chi l'ha preso e tutti gli spawn si spengono (sentinelle comprese)",
    "sentinel_alert": "quando muore una sentinella, messaggio in gioco a chi ha il ruolo admin; la sentinella rinasce dopo circa un'ora",
    "loot_id": "orco",
    "staff_command": "evoca_orco (varianti normale, guerriero, capo: da scegliere)",
    "items": [
        dict(id="windhelm", hold="eastmarch", name_it="Forte di Windhelm (nord)", x=158100, y=10000, z=None, defenders=100,
             orichalcum_veins="gia' presenti"),
        dict(id="riften", hold="rift", name_it="Forte di Riften (sud)", x=135300, y=-110600, z=None, defenders=50,
             orichalcum_veins="da mettere: 4 vene sulla parete rocciosa dentro il forte"),
    ],
    "to_verify": ["z delle posizioni", "lo scavo dell'oricalco funziona sul server", "loot dei capi"]}

with open(os.path.join(OUT, "spawn_rules.json"), "w", encoding="utf-8") as f:
    json.dump({
        "_meta": {"version": "0.1.0", "date": DATE, "author": AUTHOR,
                  "status": "bozza: prima proposta del Discord, numeri da confermare in gioco",
                  "description": "Regole di spawn degli animali (zone, gruppi, respawn), accampamenti dei giganti e forti degli orchi. "
                                 "Coordinate in unita' di Skyrim (z da leggere in gioco). Specie = id di loot.json, terreni = id di zones.json.",
                  "sources": ["Discord #spawn-linee-generali", "Discord #lore-e-spawn-giganti-e-mammut", "Discord #forti-degli-orchi",
                              "Discord #funzione-e-info-generali", "Discord #mappa-che-vedranno-i-player"]},
        "general": {
            "respawn_check_s": 3600,
            "respawn_rule": "ogni ora rinascono solo gli animali morti del gruppo, ne' prima ne' di piu'",
            "spawn_all_on_server_start": True,
            "reset_on_restart": True,
            "no_spawn_in_safe_places": True,
            "safe_place_kinds": ["capital", "settlement", "mine", "shack"],
            "wait_if_player_near": True,
            "player_near_distance": None,
            "corpse_despawn_s": 30,
            "staff_summon": {"min": 1, "max": 10, "command_prefix": "evoca_", "cleanup_command": "evoca_pulisci_1",
                             "despawn_on_restart": True, "humans_hostile_to_summoner": True}},
        "terrain_species": [dict(terrain=t, species=s, note=n) for t, s, n in TERRAIN_SPECIES],
        "group_schema": {"id": "nome del gruppo, es. cervi_pianura_nord", "species": "id di loot.json", "count": "quanti, es. 8",
                         "x": "centro", "y": "centro", "radius": "raggio della zona del gruppo"},
        "groups": [],
        "groups_note": "i gruppi veri (posizioni e numeri) si decidono camminando nelle zone",
        "giant_camps": {"per_hold": 2, "camp": CAMP, "chests": CHESTS, "items": GIANT_CAMPS},
        "orc_forts": ORC_FORTS,
        "staff_only": ["drago", "gigante_del_gelo"]}, f, ensure_ascii=False, indent=1)

n_drops = sum(len(c["drops"]) for c in loot)
print(f"Scritti loot.json ({len(loot)} creature, {n_drops} voci di loot) e spawn_rules.json "
      f"({len(TERRAIN_SPECIES)} terreni, {len(GIANT_CAMPS)} accampamenti, {len(ORC_FORTS['items'])} forti)")
