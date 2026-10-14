"""Genera races.json, spells.json, progression.json, world_rules.json dai canali Discord.

Uso:  python3 build_discord.py <cartella_db>
Niente e' inventato: dove il Discord dice "da modificare" o propone alternative, lo stato e'
'provisional' e le proposte sono nel campo 'proposals'. Valori non indicati = null.
Fonti: Discord #perk-e-abilita-di-razza, #bilanciamento-incantesimi, #skill-tree,
       #ciclo-giorno-notte, #player-presenti-in-game (14 ottobre 2026).
"""
import json
import os
import re
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "out"
os.makedirs(OUT, exist_ok=True)
META = {"version": "0.1.0", "date": "2026-10-14", "author": "david"}

SKILLS = {  # nome nel Discord -> id
    "Due Mani": "two_handed", "Una Mano": "one_handed", "Blocco": "block", "Armatura Leggera": "light_armor",
    "Armatura Pesante": "heavy_armor", "Forgiatura": "smithing", "Recupero": "restoration",
    "Distruzione": "destruction", "Incantamento": "enchanting", "Evocazione": "conjuration",
    "Alterazione": "alteration", "Illusione": "illusion", "Alchimia": "alchemy", "Arceria": "archery",
    "Furtività": "sneak", "Scassinare": "lockpicking",
}
S = SKILLS


def dump(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


def slug(t):
    t = t.lower().replace("à", "a").replace("è", "e").replace("é", "e").replace("ì", "i").replace("ò", "o").replace("ù", "u")
    return re.sub(r"[^a-z0-9]+", "_", t).strip("_")


# ------------------------------------------------------------------ races.json
def race(rid, name, skills, power, passives, roles, status="provisional", note=None, proposals=None):
    return {
        "id": rid, "name_it": name,
        "skill_bonus": {S[k]: v for k, v in skills.items()}, "other_skills": 15,
        "power": power, "passives": passives, "ideal_roles": roles,
        "status": status, "notes": note, "proposals": proposals or []}


P = lambda name, desc, dur=None: {"name_it": name, "description_it": desc, "uses": "1 al giorno", "duration_s": dur}
races = [
    race("nord", "Nord", {"Due Mani": 25, "Blocco": 20, "Una Mano": 20, "Armatura Leggera": 20, "Forgiatura": 20},
         P("Ira della Battaglia", "I nemici vicini fuggono.", 30),
         [{"name_it": "Resistenza al Gelo", "description_it": "50% resistenza al gelo."}],
         ["Guerriero", "Mercenario", "Guardia", "Clan Nordici", "Soldato"],
         note="Potere segnato 'Da cambiare' nel Discord. Dave_St: passiva da rivedere.",
         proposals=[{"by": "Dave_St", "passives": ["+25% resistenza gelo", "+10 salute"]},
                    {"by": "Shoonish", "power": "Ira del Nord: armatura di 50 hp per 30 secondi"}]),
    race("imperial", "Imperiali", {"Recupero": 20, "Distruzione": 20, "Una Mano": 25, "Blocco": 20, "Incantamento": 20},
         P("Voce dell'Imperatore", "Calma tutti gli umanoidi vicini.", 60),
         [{"name_it": "Fortuna Imperiale", "description_it": "Maggiore quantità di oro trovata."}],
         ["Mercanti", "Nobili", "Politici", "Diplomatici", "Ufficiali"],
         note="Potere e passiva segnati 'da cambiare'. Una Mano 25 'da modificare per script'.",
         proposals=[{"by": "Shoonish",
                     "power": "Stratega navigato: per 30 secondi gli attacchi ignorano il 50% dell'armatura del bersaglio",
                     "passives": ["Muro della legione: gli attacchi bloccati con scudo o arma costano il 20% in meno di stamina"]}]),
    race("breton", "Bretoni", {"Evocazione": 25, "Recupero": 20, "Alterazione": 20, "Illusione": 20, "Alchimia": 20},
         P("Pelle del Drago", "Assorbe il 50% della Magicka dei nemici.", 60),
         [{"name_it": "Resistenza Magica", "description_it": "25% resistenza alla magia."}],
         ["Guaritori", "Studiosi", "Maghi", "Alchimisti", "Sacerdoti"],
         proposals=[{"by": "Dave_St", "passives": ["+15% resistenza magia", "+10 Magicka"], "power": "Pelle del Drago"}]),
    race("redguard", "Redguard", {"Una Mano": 25, "Distruzione": 20, "Alterazione": 20, "Arceria": 20, "Blocco": 20},
         P("Adrenalina", "Rigenerazione della stamina 10 volte più veloce.", 60), [],
         [], note="Nessuna passiva permanente: la razza è costruita attorno al potere. Ruoli ideali non indicati.",
         proposals=[{"by": "Dave_St", "passives": ["+15 stamina", "+10% rigenerazione stamina"], "power": "Adrenalina"}]),
    race("altmer", "Alti Elfi", {"Illusione": 25, "Alterazione": 20, "Evocazione": 20, "Distruzione": 20, "Recupero": 20, "Incantamento": 20},
         P("Alta Discendenza", "Rigenerazione della Magicka estremamente accelerata.", 60),
         [{"name_it": "Magicka Elevata", "description_it": "+50 Magicka permanenti (da modificare a 30)."}],
         ["Maghi puri", "Studiosi", "Incantatori", "Alchimisti", "Arcimaghi"],
         note="Passiva: nel Discord +50 Magicka, 'da modificare a 30'."),
    race("dunmer", "Dunmer (Elfi Oscuri)", {"Distruzione": 25, "Armatura Leggera": 20, "Alchimia": 20, "Illusione": 20, "Una Mano": 20, "Furtività": 20},
         P("Ira dell'Antenato", "I nemici che colpiscono il Dunmer subiscono danni da fuoco.", 60),
         [{"name_it": "Resistenza al Fuoco", "description_it": "50% resistenza al fuoco (da modificare come per i Nord)."}],
         ["Spadaccini magici", "Assassini", "Guerrieri arcani", "Esploratori"]),
    race("bosmer", "Elfi dei Boschi", {"Arceria": 25, "Furtività": 20, "Alchimia": 20, "Armatura Leggera": 25, "Scassinare": 20},
         P("Controllo animale", "Permette di controllare un animale (lista degli animali controllabili da fare).", 60),
         [{"name_it": "Resistenza a Veleni e Malattie", "description_it": "50% resistenza a veleni e malattie."}],
         ["Ranger", "Cacciatori", "Esploratori", "Assassini", "Scout"],
         note="Nome del potere non indicato nel Discord (qui descritto).",
         proposals=[{"by": "Shoonish", "power": "Evocare un famiglio animale (come il lupo dell'evocatore), senza dover cercare un animale"}]),
    race("khajiit", "Khajiit", {"Furtività": 25, "Alchimia": 25, "Armatura Leggera": 20, "Scassinare": 20, "Arceria": 20},
         P("Occhio della Notte", "Permette di vedere al buio.", 60),
         [{"name_it": "Artigli", "description_it": "Gli attacchi senz'armi infliggono 12 danni aggiuntivi (potremmo buffare)."},
          {"name_it": "Visione Notturna", "description_it": "Visione migliorata nell'oscurità."}],
         ["Ladri", "Assassini", "Mercanti", "Contrabbandieri", "Esploratori"]),
    race("argonian", "Argoniani", {"Scassinare": 25, "Alterazione": 20, "Armatura Leggera": 20, "Recupero": 25, "Furtività": 20},
         P("Pelle d'Hists", "Rigenerazione della salute 10 volte più veloce.", 60),
         [{"name_it": "Respirazione Acquatica", "description_it": "Permanente, senza limiti."},
          {"name_it": "Resistenza alle Malattie", "description_it": "50%."}],
         ["Guaritori", "Alchimisti", "Esploratori", "Marinai", "Ranger"]),
    race("orc", "Orsimer (Orchi)", {"Armatura Pesante": 25, "Forgiatura": 20, "Blocco": 20, "Una Mano": 20, "Due Mani": 20, "Incantamento": 20},
         P("Furia Berserker", "Infligge danni doppi e subisce metà dei danni.", 60), [],
         ["Berserker", "Guerrieri", "Guardie", "Fabbri", "Campioni"],
         note="Nessuna passiva permanente: la razza ruota attorno al potere."),
]
dump("races.json", {"_meta": {**META, "status": "provvisorio: molti valori segnati 'da cambiare' nel Discord",
     "description": "Le 10 razze di Skyrim con bonus alle abilità, potere giornaliero, passive e ruoli ideali. Le altre abilità partono da 15.",
     "sources": ["Discord #perk-e-abilità-di-razza"],
     "note": "Sono incrementi che esentano dal background. 'proposals' = alternative proposte da Dave_St e Shoonish, non ancora decise."},
     "skills": SKILLS, "items": races})

# ------------------------------------------------------------------ spells.json
V, X, Q = "allowed", "banned", "restricted"
spells_raw = [
    ("Adunata", Q, [], "Dà buff a Salute e Vigore ad area."),
    ("Armonia", X, [], None), ("Attenuazione", V, [], None), ("Aura di Stendarr", V, [], None),
    ("Bandisci Daedra", Q, ["quest", "evento"], None), ("Bufera", V, [], None), ("Calma", X, [], None),
    ("Carne", V, [], "Permesso su tutto, tranne Drago e d'Ebano (solo via quest)."),
    ("Catena di Fulmini", V, [], None), ("Cerchio di Protezione", V, [], None), ("Cerchio Guardiano", V, [], None),
    ("Chiamata alle Armi", Q, [], "Rendere target validi anche i pg giocanti."),
    ("Controllo Daedra", Q, ["quest", "evento"], None), ("Convenzione di Arniel", V, [], None),
    ("Coraggio", Q, [], "Da ribilanciare per il primo livello."),
    ("Corazza di Cenere", V, [], None), ("Cura", V, [], None),
    ("Cura Negromantica", Q, [], "Cambiare nome e renderla applicabile agli alleati oltre che ai non morti."),
    ("Cura Non-Morto", Q, [], "Cambiare nome e renderla applicabile agli alleati oltre che ai non morti."),
    ("Cura Suprema", V, [], None), ("Dardo di Fuoco", V, [], None), ("Dardo Elettrico", V, [], None),
    ("Difesa Maggiore, Minore, Risoluta", V, [], "Gruppo di tre incantesimi."),
    ("Equilibrium", Q, ["quest", "evento", "fazione"], None),
    ("Espelli Daedra", Q, ["quest", "evento"], None),
    ("Evoca Arvak", Q, ["quest", "evento", "costo alto"], "Considerabile per pacchetti a pagamento."),
    ("Evoca Armi e Evoca Atronach", V, [], "Gruppo di incantesimi."),
    ("Evoca Cercatore", Q, ["dungeon permadeath", "staffer"], None),
    ("Evoca Dremora Non Vincolato", Q, ["quest"], None),
    ("Evoca Essere d'Ira", Q, ["staffer", "dungeon"], None),
    ("Evoca Essere d'Ossa", Q, ["shop", "dungeon"], None),
    ("Essere di Nebbia", Q, ["shop", "staffer"], None),
    ("Evoca Famiglio", V, [], None),
    ("Evoca Guardiano di Cenere", Q, ["quest", "fazione"], None),
    ("Evoca Ombra di Arniel", X, [], "Nel Discord scritto 'Armiel'."),
    ("Evoca Progenie di Cenere", Q, ["dungeon", "quest"], None),
    ("Evoca Signore Dremora", Q, ["staffer"], None),
    ("Famiglio delle Fiamme", V, [], None), ("Fiamma e Folgore", V, [], None), ("Frenesia", X, [], None),
    ("Fuoco Solare", V, [], None), ("Furia", X, [], None), ("Gelo", V, [], None),
    ("Imposizione delle Mani", V, [], None), ("Incendio", V, [], None), ("Incenerimento", V, [], None),
    ("Individua Non Morto", V, [], None),
    ("Individua Vita", Q, ["dungeon", "negoziante"], "Cambiare il target sui pg giocanti."),
    ("Invisibilità", V, [], None), ("Isteria", X, [], None), ("Luci", V, [], None), ("Mani Curative", V, [], None),
    ("Mantello Turbinante", V, [], None),
    ("Manto Elettrico, Manto Gelido, Manto Infuocato e Morsa Gelida", V, [], "Gruppo di incantesimi."),
    ("Muro di Fiamme, Fulmini e Ghiaccio", V, [], "Gruppo di incantesimi."),
    ("Pacificazione", X, [], None), ("Palla di Fuoco", V, [], None), ("Paralisi", V, [], None),
    ("Paralisi di Massa", V, [], None), ("Paura", X, [], None), ("Punta di Ghiaccio", X, [], None),
    ("Respingi Non Morto, Respingi Non Morto Minore", V, [], "Gruppo di due incantesimi."),
    ("Respirare Sott'Acqua", X, [], None), ("Revenant", V, [], None), ("Rianima Cadavere", V, [], None),
    ("Rimargina Ferite", V, [], None),
    ("Risucchio Vampirico", Q, ["fazione"], None), ("Rune", V, [], None), ("Runa Frenesia", X, [], None),
    ("Sbaragliare", X, [], None), ("Scaccia Non Morto", V, [], None), ("Scintille", V, [], None),
    ("Servo del Gelo/Fiamma/Tempesta/Non Morto", Q, ["staffer", "quest permanente"], "Solo staff o quest permanente."),
    ("Sventura del Non Morto", V, [], None), ("Sventura del Vampiro", V, [], None), ("Telecinesi", V, [], None),
    ("Tempesta di Fuoco/Ghiaccio/Fulmini", V, [], "Gruppo di incantesimi."),
    ("Trappola dell'Anima", Q, ["quest"], "Solo quest."),
    ("Trasmuta", X, [], "Potrebbe rompere l'economia in due secondi."),
    ("Violenza", X, [], None), ("Visione del Decimo Occhio", Q, ["quest"], "Solo quest."),
]
spells = [{"id": slug(n), "name_it": n, "status": st, "acquisition": acq, "notes": nt}
          for n, st, acq, nt in spells_raw]
dump("spells.json", {"_meta": {**META,
     "status": "provvisorio: Shoonish ha chiesto conferma a Jack e Dave_St sulla parte finale (da 'Scaccia Non Morto' in poi)",
     "description": "Incantesimi vanilla: allowed = permesso, banned = vietato, restricted = solo con quest/evento/staff/fazione/dungeon/shop.",
     "sources": ["Discord #bilanciamento-incantesimi"],
     "note": "I nomi sono quelli italiani del Discord (alcuni raggruppano più incantesimi). Servirà una tabella nome -> ID di Skyrim. "
             "Le scuole (Alterazione, Distruzione, Cura, Evocazione, Illusione) sono solo intestazioni nel Discord: non assegnate. "
             "In SkyMP gli effetti magici 'a durata' sono ancora da fare."},
     "items": spells})

# ------------------------------------------------------------------ progression.json
dump("progression.json", {"_meta": {**META, "status": "bozza di Shoonish, senza conferma",
     "description": "Sistema di esperienza e livelli al posto della crescita delle singole abilità.",
     "sources": ["Discord #skill-tree"],
     "note": "In SkyMP la crescita di skill e livelli è spenta (DisableSkillAdvanceService): il sistema va scritto nel gamemode."},
     "rules": {
         "skill_growth_by_use": False,
         "xp_source": "azioni specifiche (quali e quanta exp: non indicato)",
         "on_level_up": {
             "choose_one_attribute": ["health", "magicka", "stamina"],
             "skill_points_to_distribute": "esempio nel Discord: +10 punti da spendere nelle abilità",
             "perk_points": 1},
         "mage_extra": "lo skill tree dei maghi permette di prendere incantesimi extra"},
     "example_from_discord": {
         "character": "Duran, orco guerriero, livello 1 -> 2",
         "attribute_choice": {"health": {"from": 100, "to": 110}},
         "skill_points_spent": {"one_handed": {"from": 20, "to": 30}},
         "perk_point_gained": 1},
     "open": ["exp per livello", "azioni che danno exp", "elenco dei perk", "valore di aumento di magicka e stamina",
              "se i punti abilità sono sempre 10"]})

# ------------------------------------------------------------------ world_rules.json
dump("world_rules.json", {"_meta": {**META, "status": "proposta di Dave_St, bozza",
     "description": "Regole di mondo: ciclo giorno/notte e struttura/limiti di popolazione per città.",
     "sources": ["Discord #ciclo-giorno-notte", "Discord #player-presenti-in-game"]},
     "day_night": {
         "real_day_equals_game_day": True,
         "sunset": "23:00", "night": "23:15",
         "timezone": None,
         "skymp_note": "In SkyMP l'ora di gioco segue l'ora reale UTC con spostamento configurabile (hoursOffset): "
                       "il fuso dell'orario scritto nel Discord non è indicato."},
     "population": {
         "cap_per_city": 70,
         "cap_reason_discord": "Mettere 100 player in un'unica cella è impossibile per come è scriptato Skyrim e Together Reborn.",
         "cap_status": "DA RIVALUTARE: motivazione legata a Together Reborn, non a SkyMP",
         "split_players_by_design": "rendere vivo il feudo per distribuire i player; con questa divisione 'si possono avere anche 1000 persone'",
         "per_city": {
             "main_hold": 1,
             "villages": {"count": 2, "purpose": "fazioni o job sussidiari"},
             "mines": 3,
             "dungeons": {"total": 5, "levels": [
                 {"difficulty": "semplice", "count": 2, "party": "3-5 player"},
                 {"difficulty": "medio", "count": 1, "party": "3-5 player faticano, un party livellato ce la fa"},
                 {"difficulty": "difficile", "count": 1, "risk": "permadeath"},
                 {"difficulty": "arduo", "count": 1, "risk": "permadeath elevatissimo"}]}},
         "note": "Il Discord dice che combattimenti e battaglie andranno regolamentati."}})

print("Scritti races.json (%d razze), spells.json (%d voci), progression.json, world_rules.json" % (len(races), len(spells)))
