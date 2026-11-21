"""Aggiorna loot.json e spawn_rules.json con il Discord del 15-20 novembre 2026.

Uso:  python3 tools/applica_discord_2026-11-20.py   (dalla cartella db/)
Fonte: tools/discord_2026-11-20/ (spawn-animali.md, giganti.md). Si lancia DOPO build_loot_spawn.py,
che genera la versione del 18 ottobre: questo script applica le modifiche successive.
"""
import json
import os

DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATE = "2026-11-21"
SRC = "Discord categoria 'Spawn animali e Loot' e accampamenti dei giganti (15-20 nov 2026)"


def load(n):
    with open(os.path.join(DIR, n), encoding="utf-8") as f:
        return json.load(f)


def save(n, obj):
    with open(os.path.join(DIR, n), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


def item(name, chance=1.0, qty=1, **extra):
    d = {"item_it": name, "chance": chance, "qty": qty, "kind": "item"}
    d.update(extra)
    return d


# ------------------------------------------------------------------ loot.json
loot = load("loot.json")
loot["_meta"]["date"] = DATE
loot["_meta"]["sources"] = [x for x in loot["_meta"]["sources"] if x != SRC] + [SRC]
loot["rules"]["animals_no_treasure"] = True
loot["rules"]["animals_horns_always"] = True
loot["rules"]["animals_note_it"] = ("Discord 15/11: loot degli animali identico a Skyrim, ma niente tesoro "
                                    "(oro, gemme, anelli) e corna sempre al 100%.")

ONE_OF = "occhio_o_dente"  # si prende uno solo dei due, 50% / 50%
NEW = {  # id -> drops del Discord (schede del 15/11)
    "coniglio": [item("Coscia di coniglio cruda")],
    "cervo": [item("Carne di Cervide"), item("Pelle di cervo"), item("Corna grandi")],
    "alce": [item("Carne di Cervide"), item("Pelle di alce"), item("Corna grandi")],
    "capra": [item("Pelle di capra"), item("Cosciotto di capra")],
    "volpe": [item("Pelliccia di volpe")],
    "volpe_artica": [item("Pelliccia di volpe delle nevi")],
    "lupo": [item("Pelliccia di lupo")],
    "lupo_di_ghiaccio": [item("Pelliccia di lupo dei ghiacci")],
    "orso": [item("Pelliccia di orso"), item("Artigli di orso")],
    "orso_delle_nevi": [item("Pelliccia di orso delle nevi"), item("Artigli di orso")],
    "gatto_dai_denti_a_sciabola": [
        item("Pelliccia di tigre dai denti a sciabola"),
        item("Occhio di tigre dai denti a sciabola", 0.5, one_of=ONE_OF),
        item("Dente di tigre dai denti a sciabola", 0.5, one_of=ONE_OF)],
    "gatto_dai_denti_a_sciabola_delle_nevi": [
        item("Pelliccia di tigre dai denti a sciabola delle nevi"),
        item("Occhio di tigre dai denti a sciabola", 0.5, one_of=ONE_OF),
        item("Dente di tigre dai denti a sciabola", 0.5, one_of=ONE_OF)],
    "pesce_macellaio": [item("Squame di pesce macellaio", qty=None, qty_min=1, qty_max=5, notes="'Scaglie' nel Discord")],
    "mammut": [item("Proboscide di mammut", notes="'carne di mammut' nel Discord"),
               item("Zanna di mammut", qty=None, qty_min=1, qty_max=2)],
}
HORNS = ("Corna", "Piccole corna")
seen = set()
for it in loot["items"]:
    if it["id"] in NEW:
        it["drops"] = NEW[it["id"]]
        seen.add(it["id"])
    elif it["type"] == "animal":  # regole generali anche per gli animali senza scheda
        it["drops"] = [d for d in it["drops"] if d.get("category") != "small_treasure"]
        for d in it["drops"]:
            if d.get("item_it", "").startswith(HORNS):
                d["chance"] = 1.0
        if it["id"] == "capra_domestica":  # in Skyrim le capre non hanno corna da lootare
            it["drops"] = [d for d in it["drops"] if not d.get("item_it", "").startswith("Corna")]
    if it["id"] == "gigante":
        keep = [d for d in it["drops"] if d.get("item_it") not in
                ("Dito di gigante", "Mazza gigante", "Zanna di horker", "Pelle di mucca")]
        it["drops"] = [item("Dito di gigante", qty=None, qty_min=1, qty_max=3)] + keep
        it["notes"] = ("Discord 18/11: 1-3 dita di gigante + pelli e zanne; tolte mazza, zanna di horker e pelle "
                       "di mucca. Oro, armi, abiti e gemme non sono citati: restano come nel gioco, da confermare.")
        seen.add("gigante")
missing = (set(NEW) | {"gigante"}) - seen
assert not missing, f"id non trovati in loot.json: {missing}"
save("loot.json", loot)

# ------------------------------------------------------------ spawn_rules.json
sr = load("spawn_rules.json")
sr["_meta"].update(date=DATE, status="allineato al Discord del 20/11/2026 (server di Davide, gm_v27 e seguenti)")
sr["_meta"]["sources"] = [x for x in sr["_meta"]["sources"] if x != SRC] + [SRC]
g = sr["general"]
g.update(respawn_check_s=1800,
         respawn_rule="ogni 30 minuti rinascono solo gli animali uccisi, sullo stesso punto; niente accumulo",
         spawn_in_small_batches=True,
         safe_place_kinds=["capital", "village", "settlement", "mine", "shack", "stable"],
         keep_away_from=["fort", "dwarven_fort", "orc_stronghold", "dungeon", "bandit_camp", "dragon_lair",
                         "giant_camp"],
         ai="originale di Skyrim: i pacifici fuggono, i predatori cacciano",
         animals_fight_each_other=False,
         hostile_target="giocatore piu' vicino, finche' non muore o sparisce",
         leash="fuori dalla sua area smette di combattere e torna a casa a piedi, senza teletrasporto",
         points_file="team/davide/skymp-server/terra-punti-v8.json (pesci: pesci-punti-v2.json)")
g.pop("wait_if_player_near", None)
g.pop("player_near_distance", None)

S = lambda sp, rar, wh, ri, r, pack=1: {"species": sp, "rarity": rar, "points": {"windhelm": wh, "riften": ri},
                                        "pack_size": pack, "area_radius": r}
sr["species_spawn"] = [
    S("coniglio", "comune", 10, 10, 1800), S("cervo", "comune", 10, 10, 3000),
    S("capra", "comune", 10, 10, 3000), S("volpe", "comune", 10, 10, 2600),
    S("alce", "non_comune", 6, 6, 3500), S("lupo", "non_comune", 6, 6, 4500, 3),
    S("orso", "raro", 3, 3, 4500), S("gatto_dai_denti_a_sciabola", "non_comune", 6, 6, 4000),
    S("gatto_dai_denti_a_sciabola_delle_nevi", "raro", 3, 2, 4000),
    S("lupo_di_ghiaccio", "non_comune", 4, 3, 4500, 3), S("volpe_artica", "comune", 6, 5, 2600),
    S("orso_delle_nevi", "raro", 2, 2, 4500),
]
sr["fish_spawn"] = {"species": "pesce_macellaio", "alive_per_zone": 5,
                    "zones": {"windhelm": ["Fiume Bianco", "Fiume Darkwater", "Ruscello di Eastmarch",
                                           "Mare dei Fantasmi (riva)", "Mare dei Fantasmi (largo)"],
                              "riften": ["Fiume centrale del Rift", "Lago Geir", "Lago Honrich"]},
                    "note": "Mare dei Fantasmi: 10 in tutto (5 a riva + 5 al largo); rinascita su punti a caso della zona"}
sr["groups_note"] = "punti veri nei file di Davide (points_file); qui il riepilogo per specie (species_spawn)"

camps = sr["giant_camps"]
camps["per_hold"] = 2
camps["camp"] = {"giants": 2, "mammoths": 3, "giant_hp": 200, "mammoth_hp": 250,
                 "respawn_s": 5400, "respawn_rule": "rinascono solo quelli morti",
                 "pull": "colpito da lontano reagisce solo quel gigante",
                 "revenge_s": 5, "leash": "oltre il limite di inseguimento tornano a casa a vita piena"}
camps["list"] = [{"id": "G1", "name_it": "Altopiani di nord-ovest", "hold": "windhelm"},
                 {"id": "G2", "name_it": "Monti del confine", "hold": "windhelm"},
                 {"id": "G3", "name_it": "Pendici dello Jerall (ovest)", "hold": "riften"},
                 {"id": "G4", "name_it": "Pendici dello Jerall (est)", "hold": "riften"}]
camps["vanilla_camps_hidden"] = True
camps["chests"]["lock"] = "media (grimaldelli)"
camps["chests"]["refill"] = "quando giganti e mammut dell'accampamento tornano in vita"
camps["chests"]["status"] = ("2 forzieri confermati il 18/11 (fuoco e tesoro); contenuto sotto ancora quello "
                             "proposto a ottobre: quello vero e' nel server di Davide")
camps["docs"] = "team/davide/accampamenti-giganti.md"
save("spawn_rules.json", sr)
print("loot.json e spawn_rules.json aggiornati")
