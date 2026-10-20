"""Dati di creature e zone, letti dalle immagini del Discord (13 ottobre 2026).
Percentuali di drop: None = non indicato nel Discord."""

# behavior: hostile | flees | passive | dangerous
# habitat: chiavi di terreno (vedi TERRAIN in zones)
CREATURES = [
    # --- pesci (#creature-spawm)
    dict(id="abecean_longfin", name_en="Abecean Longfin", name_it="Pinna lunga di Abecea", group="fish",
         behavior="passive", habitat=["lake", "cold_water"], notes="cold waters and temperate lakes",
         drops=[dict(item="Abecean Longfin", chance=1.0, use="alchemy")]),
    dict(id="cyrodilic_spadetail", name_en="Cyrodilic Spadetail", name_it="Coda a vanga cyrodiliana", group="fish",
         behavior="passive", habitat=["lake"], notes="temperate lakes",
         drops=[dict(item="Cyrodilic Spadetail", chance=1.0, use="alchemy")]),
    dict(id="histcarp", name_en="Histcarp", name_it="Carpa di Hist", group="fish",
         behavior="passive", habitat=["river"], notes="torrents, Darkwater Crossing, Riften",
         drops=[dict(item="Histcarp", chance=1.0, use="alchemy")]),
    dict(id="river_betty", name_en="River Betty", name_it="Betta di fiume", group="fish",
         behavior="passive", habitat=["river"], notes="torrents",
         drops=[dict(item="River Betty", chance=1.0, use="alchemy")]),
    dict(id="silverside_perch", name_en="Silverside Perch", name_it="Persico argentato", group="fish",
         behavior="passive", habitat=["lake"], notes="temperate lakes, Riften harbour",
         drops=[dict(item="Silverside Perch", chance=1.0, use="alchemy")]),
    dict(id="salmon", name_en="Salmon", name_it="Salmone", group="fish",
         behavior="passive", habitat=["river", "sea"], notes="rivers and seas",
         drops=[dict(item="Salmon Meat", chance=1.0, use="cooking")]),
    dict(id="slaughterfish", name_en="Slaughterfish", name_it="Pesce macellaio", group="fish",
         behavior="hostile", habitat=["river", "lake", "cave"], notes="any water",
         drops=[dict(item="Slaughterfish Scales", chance=None, use="alchemy"),
                dict(item="Slaughterfish Egg", chance=None, use="alchemy")]),
    # --- boschi e foreste
    dict(id="deer", name_en="Deer", name_it="Cervo", group="forest", behavior="flees",
         habitat=["forest", "plain"], notes="everywhere, more in Rift forests, Lake Honrich, Ivarstead",
         drops=[dict(item="Venison", chance=1.0), dict(item="Deer Hide", chance=1.0),
                dict(item="Large Antlers", chance=0.5)]),
    dict(id="elk", name_en="Elk", name_it="Alce", group="forest", behavior="flees",
         habitat=["forest", "plain"], notes="like deer; antlers large (male) or small (female)",
         drops=[dict(item="Venison", chance=1.0), dict(item="Deer Hide", chance=1.0),
                dict(item="Antlers", chance=0.5)]),
    dict(id="fox", name_en="Fox", name_it="Volpe", group="forest", behavior="flees",
         habitat=["forest", "plain"], notes="wild zones",
         drops=[dict(item="Fox Pelt", chance=None)]),
    dict(id="snow_fox", name_en="Snow Fox", name_it="Volpe delle nevi", group="mountain", behavior="flees",
         habitat=["snow", "mountain"], notes="wild zones",
         drops=[dict(item="Snow Fox Pelt", chance=None)]),
    dict(id="rabbit", name_en="Rabbit", name_it="Coniglio", group="forest", behavior="flees",
         habitat=["forest", "plain"], notes="wild zones",
         drops=[dict(item="Raw Rabbit Leg", chance=None)]),
    dict(id="goat", name_en="Goat", name_it="Capra selvatica", group="mountain", behavior="passive",
         habitat=["mountain"], notes="mountain slopes, Reach, Falkreath mountains",
         drops=[dict(item="Goat Hide", chance=1.0), dict(item="Leg of Goat", chance=1.0),
                dict(item="Goat Horns", chance=0.5)]),
    dict(id="ice_wolf", name_en="Ice Wolf", name_it="Lupo dei ghiacci", group="mountain", behavior="hostile",
         habitat=["snow", "mountain"], notes="wild cold zones",
         drops=[dict(item="Ice Wolf Pelt", chance=1.0)]),
    dict(id="cave_bear", name_en="Cave Bear", name_it="Orso delle caverne", group="forest", behavior="hostile",
         habitat=["forest", "cave"], notes="dens and wild; roars first",
         drops=[dict(item="Bear Pelt", chance=1.0), dict(item="Bear Claws", chance=1.0)]),
    dict(id="snow_bear", name_en="Snow Bear", name_it="Orso delle nevi", group="mountain", behavior="hostile",
         habitat=["snow", "mountain"], notes="mountains and snow",
         drops=[dict(item="Snow Bear Pelt", chance=1.0), dict(item="Bear Claws", chance=1.0)]),
    dict(id="sabre_cat", name_en="Sabre Cat", name_it="Gatto dai denti a sciabola", group="forest",
         behavior="hostile", habitat=["forest", "plain", "mountain"], notes="wild zones everywhere",
         drops=[dict(item="Sabre Cat Pelt", chance=1.0), dict(item="Sabre Cat Tooth OR Eye", chance=0.5)]),
    dict(id="snowy_sabre_cat", name_en="Snowy Sabre Cat", name_it="Gatto delle nevi", group="mountain",
         behavior="hostile", habitat=["snow", "mountain"], notes="stronger; Pale and Winterhold heights",
         drops=[dict(item="Snowy Sabre Cat Pelt", chance=1.0), dict(item="Sabre Cat Tooth OR Eye", chance=0.5)]),
    dict(id="mammoth", name_en="Mammoth", name_it="Mammut", group="mountain", behavior="dangerous",
         habitat=["tundra"], notes="tundra near giants; drops not verified",
         drops=[dict(item="Mammoth Tusk", chance=None, value=150, weight=5)]),
    dict(id="skeever", name_en="Skeever", name_it="Skeever", group="forest", behavior="hostile",
         habitat=["cave", "forest"], notes="caves and dark places, also wild",
         drops=[dict(item="Skeever Tail", chance=None)]),
    dict(id="hawk", name_en="Hawk", name_it="Falco", group="sky", behavior="passive",
         habitat=["sky"], notes="67 nests in 17 places; drops only if shot",
         drops=[dict(item="Hawk Feather", chance=None, qty=3), dict(item="Hawk Beak", chance=None, qty=1)]),
    dict(id="ice_wraith", name_en="Ice Wraith", name_it="Spettro di ghiaccio", group="mountain",
         behavior="hostile", habitat=["snow"], notes="Winterhold, The Pale, east of Windhelm",
         drops=[dict(item="Ice Wraith Teeth", chance=None, qty=1)]),
    dict(id="frostbite_spider", name_en="Frostbite Spider", name_it="Ragno del gelo", group="mountain",
         behavior="hostile", habitat=["cave", "mountain"], notes="caves and wild; white-blue version in the north",
         drops=[dict(item="Frostbite Venom", chance=None)]),
    dict(id="frost_troll", name_en="Frost Troll", name_it="Troll del gelo", group="mountain",
         behavior="hostile", habitat=["snow", "mountain"], notes="UESP: north Eastmarch",
         drops=[dict(item="Troll Fat", chance=None)]),
]
UNREAD_CREATURES = ["row after Goat in the left forest table (cut off in the image, probably Wolf)"]

# Terreni (#paesaggi-e-territorio): % celle della griglia A-J x 1-15 (50 px/cella)
TERRAINS = [
    dict(id="mountain", name_it="Montagna", windhelm=0.33, riften=0.40, note="Velothi a est, Jerall a sud, rilievi a nord-ovest"),
    dict(id="plain", name_it="Pianura", windhelm=0.34, riften=0.25, note="spazi liberi"),
    dict(id="snow", name_it="Tundra innevata", windhelm=0.05, riften=0.0, note="nord-est di Windhelm"),
    dict(id="poplar_forest", name_it="Bosco di pioppi (Rift)", windhelm=0.0, riften=0.31, note="boschi autunnali, zona probabile"),
    dict(id="pine_forest", name_it="Bosco di pini (Eastmarch)", windhelm=0.10, riften=0.0, note="attorno alle pozze di zolfo, probabile"),
    dict(id="sulfur", name_it="Pozze di zolfo e rocce", windhelm=0.07, riften=0.0, note="centro-sud di Eastmarch"),
    dict(id="lake", name_it="Lago", windhelm=0.0, riften=0.03, note="Geir e Honrich, posizione probabile"),
    dict(id="sea", name_it="Mare", windhelm=0.11, riften=0.0, note="Mare dei Fantasmi, a nord"),
]

# Luoghi riconosciuti (#confini-mondo-di-gioco). certain=False: ipotesi da confermare in gioco
PLACES = [
    dict(id="windhelm", name="Windhelm", hold="eastmarch", kind="capital", certain=True, note="capitale di Eastmarch"),
    dict(id="kynesgrove", name="Kynesgrove", hold="eastmarch", kind="settlement", certain=True, note="Steamscorch Mine (malachite)"),
    dict(id="narzulbur", name="Narzulbur", hold="eastmarch", kind="orc_stronghold", certain=False, note="Gloombound Mine (ebano, ferro)"),
    dict(id="darkwater_crossing", name="Darkwater Crossing", hold="eastmarch", kind="settlement", certain=True, note="Goldenrock Mine (corindone)"),
    dict(id="northwind_mine", name="Miniera a nord di Shor's Stone", hold="eastmarch", kind="mine", certain=False, note="probabile Northwind (ferro)"),
    dict(id="shors_stone", name="Shor's Stone", hold="border", kind="settlement", certain=True, note="passo fra i due feudi; Redbelly (ebano)"),
    dict(id="riften", name="Riften", hold="rift", kind="capital", certain=True, note="capitale del Rift"),
    dict(id="lost_prospect_mine", name="Lost Prospect Mine", hold="rift", kind="mine", certain=True, note="a est-nord-est di Riften (oro)"),
    dict(id="ivarstead", name="Ivarstead", hold="rift", kind="settlement", certain=False, note="ai piedi della Gola del Mondo"),
    dict(id="largashbur", name="Largashbur", hold="rift", kind="orc_stronghold", certain=False, note="fortezza orchi a sud-ovest di Riften"),
]
BORDER = dict(status="bozza da verificare", note="linea tratteggiata tra Shor's Stone e Windhelm; ovest: catena della Gola del Mondo; gli altri limiti non definiti")

# Icone per tipo: (nord/Windhelm, sud/Riften). Totale N 55, S 44
ICONS = [
    ("capital", "Capitale", 1, 1), ("settlement", "Paese / insediamento", 1, 1), ("mine", "Miniera", 4, 3),
    ("farm", "Fattoria", 1, 2), ("wheat_mill", "Mulino a vento", 0, 1), ("wood_mill", "Segheria", 2, 1),
    ("cave", "Grotta", 11, 9), ("dragon_lair", "Tana di drago", 2, 3), ("nordic_ruin_bow", "Rovina: arco con asta", 4, 3),
    ("ruin_portal", "Rovina: portale nello scudo", 5, 1), ("dwemer_ruin", "Rovina: elmo", 2, 0),
    ("ruin_wall", "Rovina: muro crollato", 0, 1), ("nordic_tower", "Torre alta ad arco", 2, 0),
    ("fort", "Forte", 6, 4), ("tower_flag", "Torre con bandiera", 1, 3), ("orc_stronghold", "Fortezza degli orchi", 1, 1),
    ("camp", "Accampamento (tenda)", 2, 3), ("shack", "Baracca", 2, 2), ("giant_camp", "Accampamento di giganti", 3, 0),
    ("standing_stone", "Pietra permanente", 1, 0), ("grove", "Rami incrociati", 1, 2), ("tree", "Albero", 1, 1),
    ("shrine", "Figura alata", 1, 1), ("pass", "Scudo con fessura", 0, 1), ("ship", "Nave", 1, 0),
]


# ---- aggiornamento 14 ott 2026: tabelle loot di #loot-implicazioni-alchemiche
SMALL_LOOT = {  # chance di "piccolo bottino" (oro/anello/gemma), indicata dal Discord
    "deer": 0.10, "wolf": 0.10, "cave_bear": 0.10, "snow_bear": 0.10, "sabre_cat": 0.10,
    "snowy_sabre_cat": 0.10, "ice_wolf": 0.10, "goat": 0.10, "frost_troll": 0.10}
CREATURES.append(dict(id="wolf", name_en="Wolf", name_it="Lupo", group="forest", behavior="hostile",
    habitat=["forest", "plain", "mountain"], notes="riga letta dal loot del Discord; habitat da confermare",
    drops=[dict(item="Wolf Pelt", chance=1.0)]))
for _c in CREATURES:
    if _c["id"] in SMALL_LOOT:
        _c["drops"].append(dict(item="Small loot (gold, ring or gem)", chance=SMALL_LOOT[_c["id"]], use="loot"))
    if _c["id"] == "frost_troll":
        _c["drops"] = [dict(item="Troll Fat", chance=1.0, use="alchemy")] + _c["drops"]
        _c["notes"] += "; also normal trolls drop Troll Fat"
    if _c["id"] == "goat":
        _c["drops"].append(dict(item="Small treasure x2", chance=0.10, use="loot"))
    if _c["id"] == "ice_wraith":
        _c["drops"][0]["chance"] = 1.0
    if _c["id"] == "skeever":
        _c["drops"][0].update(value=3, weight=0.2, use="alchemy")
    if _c["id"] == "hawk":
        _c["drops"][0].update(chance=None, per_kill=3); _c["drops"][1].update(chance=None, per_kill=1)
    if _c["id"] == "frostbite_spider":
        _c["drops"][0].update(value=21, weight=0.5, use="poison applied to a weapon or arrow: 5 dmg/s health+stamina for 4 s")
    if _c["id"] == "goat":
        _c["drops"][2].update(value=5, weight=1, use="no alchemy effect; Hearthfire decor/trophy")
    if _c["id"] == "mammoth":
        _c["drops"][0].update(weight=5, use="no alchemy effect; UESP lists no loot for the mammoth")

# valore / peso / altri usi (tabelle del Discord); chiave = name_en dell'ingrediente
ITEM_STATS = {
    "Ice Wraith Teeth": (30, 0.25, "required by quest 'Ice Cold'"),
    "Troll Fat": (15, 1, "troll trophy (Hearthfire)"),
    "Bear Claws": (2, 0.1, "alchemy only"),
    "Sabre Cat Tooth": (2, 0.1, "Hearthfire decor"),
    "Eye of Sabre Cat": (2, 0.1, "alchemy only"),
    "Skeever Tail": (3, 0.2, "alchemy only"),
    "Hawk Feathers": (15, 0.1, "alchemy only"),
    "Hawk Beak": (15, 0.25, "alchemy only"),
    "Abecean Longfin": (15, 0.5, "alchemy only"),
    "Cyrodilic Spadetail": (15, 0.25, None),
    "Histcarp": (6, 0.25, None),
    "River Betty": (15, 0.25, None),
    "Silverside Perch": (15, 0.25, None),
    "Salmon Roe": (5, 0.2, None),
    "Slaughterfish Egg": (3, 0.2, None),
    "Slaughterfish Scales": (3, 0.1, "Hearthfire trophy"),
    "Mudcrab Chitin": (2, 0.25, "trophy"),
    "Nordic Barnacle": (5, 0.2, "alchemy only"),
    "Pearl": (2, 0.1, None),
}


# ---- aggiornamento 20 ott 2026: percentuali da #animali-e-loot e #mob-mostri-e-loot (Discord, 18 ott 2026)
# Si riempiono solo i drop che erano None e si aggiungono i drop scritti nel Discord per creature gia' presenti.
# Il loot completo (86 creature) e' in loot.json, generato da build_loot_spawn.py.
FILL_20OCT = {  # creatura -> {oggetto: percentuale}
    "fox": {"Fox Pelt": 1.0}, "snow_fox": {"Snow Fox Pelt": 1.0}, "rabbit": {"Raw Rabbit Leg": 1.0},
    "skeever": {"Skeever Tail": 1.0}, "slaughterfish": {"Slaughterfish Scales": 1.0},
    "mammoth": {"Mammoth Tusk": 1.0}, "frostbite_spider": {"Frostbite Venom": 1.0},
    "ice_wraith": {"Ice Wraith Teeth": 1.0}}
ADD_20OCT = {  # creatura -> drop nuovi
    "elk": [dict(item="Small loot (gold, ring or gem)", chance=0.10, use="loot")],
    "skeever": [dict(item="Small loot (gold, ring or gem)", chance=0.10, use="loot")],
    "slaughterfish": [dict(item="Small loot (gold, ring or gem)", chance=0.10, use="loot")],
    "frostbite_spider": [dict(item="Small loot (gold, ring or gem)", chance=0.10, use="loot")],
    "mammoth": [dict(item="Mammoth Snout", chance=1.0, use="alchemy"),
                dict(item="Small loot (gold, ring or gem)", chance=0.10, use="loot")],
    "ice_wraith": [dict(item="Ice Wraith Essence", chance=1.0, use="alchemy")]}
for _c in CREATURES:
    for _d in _c["drops"]:
        if _d["chance"] is None and _d["item"] in FILL_20OCT.get(_c["id"], {}):
            _d["chance"] = FILL_20OCT[_c["id"]][_d["item"]]
    _c["drops"] += ADD_20OCT.get(_c["id"], [])
# frost_troll aveva "Troll Fat" due volte (1.0 e None): il Discord dice 100%, si toglie il doppione
for _c in CREATURES:
    if _c["id"] == "frost_troll":
        _c["drops"] = [d for d in _c["drops"] if not (d["item"] == "Troll Fat" and d["chance"] is None)]
