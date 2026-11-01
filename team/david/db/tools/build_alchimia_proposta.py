"""Genera la proposta di ingredienti e pozioni (gioco base, ricette fisse) da confrontare con Alessio e Giacomo.

Uso (dalla cartella tools/):
    python3 build_alchimia_proposta.py ..

Legge ingredients.json ed effects.json dalla cartella del database e scrive
team/david/alchimia_proposta.md. La proposta (rarita' e ricette) e' scritta qui sotto: per cambiarla
si modifica questo file e si rilancia. Lo script controlla da solo che:
  - ogni ingrediente usato esista e sia presente nei due feudi;
  - ogni ricetta abbia almeno un ingrediente con l'effetto della pozione (coerenza col gioco base);
  - nessun ingrediente sia usato in troppe ricette (vincolo di Alessio).
"""
import json
import os
import sys
from collections import defaultdict

DB = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(DB, "..", "alchimia_proposta.md")
MAX_USI = 4  # oltre questo numero di ricette un ingrediente e' "troppo usato"

# ------------------------------------------------------------------ rarita' proposta degli ingredienti
# comune: si trova facilmente (piante con piu' di ~150 esemplari nei feudi, animali comuni, pesca)
# non_comune: piante con ~30-150 esemplari, fattorie, animali pericolosi (orso, tigre dai denti a sciabola)
# raro: pochi esemplari nei feudi o creature rare (troll, spettro del ghiaccio)
RARITA = {
    "comune": [
        "blue_mountain_flower", "purple_mountain_flower", "red_mountain_flower", "dragons_tongue",
        "canis_root", "jazbay_grapes", "snowberries", "creep_cluster", "scaly_pholiota", "thistle_branch",
        "frost_mirriam", "slaughterfish_egg", "large_antlers", "small_antlers", "hawk_feathers", "hawk_beak",
        "mudcrab_chitin", "skeever_tail", "abecean_longfin", "cyrodilic_spadetail", "histcarp",
        "river_betty", "salmon_roe", "silverside_perch",
    ],
    "non_comune": [
        "mora_tapinella", "nordic_barnacle", "wheat", "nightshade", "bear_claws", "eye_of_sabre_cat",
        "sabre_cat_tooth", "slaughterfish_scales", "glowing_mushroom", "garlic",
    ],
    "raro": ["bleeding_crown", "fly_amanita", "blisterwort", "elves_ear", "nirnroot", "troll_fat", "ice_wraith_teeth"],
}
NOTE_ING = {
    "frost_mirriam": "Dal Discord: 260 rami in 162 luoghi (il conteggio delle piante del gioco ne trova pochi perché crescono sugli alberi)",
    "wheat": "Fattorie (Hollyfrost Farm)",
    "garlic": "Fattorie e cucine",
    "nirnroot": "Nel Rift solo a Sarethi Farm",
    "elves_ear": "Quasi assente in natura nei feudi",
    "salmon_roe": "Presente solo per deduzione (README del database)",
    "silverside_perch": "Presente solo per deduzione (README del database)",
}

# ------------------------------------------------------------------ pozioni e veleni proposti
# livello: 1 comune, 2 non comune, 3 leggendaria. ingredienti: (id, quantita')
POZIONI = [
    # --- livello 1
    ("Pozione di cura minore", "restore_health", 1, [("blue_mountain_flower", 2)]),
    ("Pozione di vigore minore", "restore_stamina", 1, [("purple_mountain_flower", 1), ("large_antlers", 1)]),
    ("Pozione di magicka minore", "restore_magicka", 1, [("red_mountain_flower", 1), ("creep_cluster", 1)]),
    ("Resistenza al gelo", "resist_frost", 1, [("frost_mirriam", 1), ("thistle_branch", 1)]),
    ("Resistenza al fuoco", "resist_fire", 1, [("dragons_tongue", 1), ("snowberries", 1)]),
    ("Cura malattie", "cure_disease", 1, [("hawk_feathers", 1), ("mudcrab_chitin", 1)]),
    # --- livello 2
    ("Pozione di cura", "restore_health", 2, [("blue_mountain_flower", 1), ("wheat", 1)]),
    ("Pozione di vigore", "restore_stamina", 2, [("bear_claws", 1), ("histcarp", 1)]),
    ("Pozione di magicka", "restore_magicka", 2, [("mora_tapinella", 1), ("red_mountain_flower", 1)]),
    ("Resistenza al veleno", "resist_poison", 2, [("garlic", 1), ("slaughterfish_egg", 1)]),
    ("Resistenza ai fulmini", "resist_shock", 2, [("glowing_mushroom", 1), ("hawk_beak", 1)]),
    ("Respirare sott'acqua", "waterbreathing", 2, [("nordic_barnacle", 1), ("salmon_roe", 1)]),
    ("Potenzia salute", "fortify_health", 2, [("bear_claws", 1), ("glowing_mushroom", 1)]),
    ("Potenzia magicka", "fortify_magicka", 2, [("jazbay_grapes", 1), ("histcarp", 1)]),
    ("Potenzia capacità di carico", "fortify_carry_weight", 2, [("creep_cluster", 1), ("scaly_pholiota", 1)]),
    ("Rigenera vigore", "regenerate_stamina", 2, [("mora_tapinella", 1), ("scaly_pholiota", 1)]),
    ("Rigenera salute", "regenerate_health", 2, [("garlic", 1), ("nordic_barnacle", 1)]),
    # --- livello 3
    ("Pozione di cura suprema", "restore_health", 3, [("eye_of_sabre_cat", 1), ("blisterwort", 1), ("wheat", 1)]),
    ("Pozione di vigore suprema", "restore_stamina", 3, [("sabre_cat_tooth", 1), ("salmon_roe", 1), ("silverside_perch", 1)]),
    ("Pozione di magicka suprema", "restore_magicka", 3, [("elves_ear", 1), ("mora_tapinella", 1), ("creep_cluster", 1)]),
    ("Resistenza alla magia", "resist_magic", 3, [("bleeding_crown", 1), ("nirnroot", 1)]),
    ("Invisibilità", "invisibility", 3, [("nirnroot", 1), ("ice_wraith_teeth", 1)]),
]
VELENI = [
    ("Veleno debilitante", "damage_stamina", 1, [("canis_root", 1), ("cyrodilic_spadetail", 1)]),
    ("Veleno", "damage_health", 1, [("skeever_tail", 1), ("river_betty", 1)]),
    ("Veleno rallentante", "slow", 2, [("large_antlers", 1), ("river_betty", 1)]),
    ("Veleno persistente", "lingering_damage_health", 2, [("slaughterfish_scales", 1), ("slaughterfish_egg", 1)]),
    ("Veleno di belladonna", "damage_health", 2, [("nightshade", 1), ("small_antlers", 1)]),
    ("Veleno paralizzante", "paralysis", 3, [("canis_root", 2), ("troll_fat", 1)]),
]

ESCLUSE = [
    ("Potenzia <abilità> (Una mano, Furtività, Forgiatura, Scasso…)", "In SkyMP le abilità sono spente e il danno usa una formula semplificata: questi effetti non fanno niente."),
    ("Frenesia, Paura", "Indicate da Davide come inutili nella riunione del 29/10; con i giocatori al posto degli NPC non hanno senso."),
    ("Debolezze (al fuoco, al gelo, alla magia, al veleno)", "Si possono aggiungere più avanti per il PvP; per ora \"less is better\"."),
    ("Devasta salute/magicka/stamina, Danneggia magicka e rigenerazioni", "Doppioni dei veleni tenuti; aggiungibili più avanti."),
    ("Potenzia stamina, Rigenera magicka", "Si possono fare con gli ingredienti presenti: lasciate fuori per tenere la lista corta. Da valutare con Alessio."),
]

LIV = {1: "comune", 2: "non comune", 3: "leggendaria"}
FEUDO = {"both": "entrambi", "rift": "Rift", "eastmarch": "Eastmarch", "present": "nei feudi (quale non indicato)"}


def main():
    ings = {i["id"]: i for i in json.load(open(os.path.join(DB, "ingredients.json"), encoding="utf-8"))["items"]}
    effs = {e["id"]: e for e in json.load(open(os.path.join(DB, "effects.json"), encoding="utf-8"))["items"]}
    rar = {i: r for r, lst in RARITA.items() for i in lst}
    presenti = {k for k, v in ings.items() if v["feudi"]["availability"] != "none"}

    errori, avvisi = [], []
    # controlli sulla rarita'
    for k in presenti - set(rar):
        errori.append(f"ingrediente presente senza rarità: {k}")
    for k in set(rar) - presenti:
        errori.append(f"rarità data a un ingrediente assente dai feudi: {k}")

    usi = defaultdict(list)
    for gruppo, lista in (("Pozione", POZIONI), ("Veleno", VELENI)):
        for nome, eff, liv, ingr in lista:
            if eff not in effs:
                errori.append(f"{nome}: effetto sconosciuto {eff}")
                continue
            for iid, _ in ingr:
                if iid not in ings:
                    errori.append(f"{nome}: ingrediente sconosciuto {iid}")
                elif iid not in presenti:
                    errori.append(f"{nome}: {iid} non è presente nei feudi")
                usi[iid].append(nome)
            if not any(iid in effs[eff]["ingredients"] for iid, _ in ingr):
                errori.append(f"{nome}: nessun ingrediente ha l'effetto {eff}")
            fuori = [iid for iid, _ in ingr if iid not in effs[eff]["ingredients"]]
            if fuori:
                avvisi.append(f"{nome}: {', '.join(ings[i]['name_it'] or ings[i]['name_en'] for i in fuori)} non ha l'effetto «{effs[eff]['name_it']}» nel gioco base (scelta per alzare la rarità)")
    for iid, l in usi.items():
        if len(l) > MAX_USI:
            avvisi.append(f"{ings[iid]['name_it']} è usato in {len(l)} ricette (limite {MAX_USI})")

    if errori:
        print("ERRORI:\n  " + "\n  ".join(errori))
        sys.exit(1)

    def nome(iid):
        i = ings[iid]
        return i["name_it"] or i["name_en"]

    def riga_ricetta(r):
        n, eff, liv, ingr = r
        return f"| {n} | {effs[eff]['name_it']} | {liv} ({LIV[liv]}) | " + ", ".join(f"{q} × {nome(i)}" for i, q in ingr) + " |"

    out = []
    w = out.append
    w("# Ingredienti e pozioni: proposta (gioco base, ricette fisse)")
    w("")
    w("**Autore:** david (con Claude) · **Generato da:** `db/tools/build_alchimia_proposta.py` (non modificare a mano: si cambia lo script e si rilancia)")
    w("**Serve a:** fare il confronto con le liste di Alessio (T-005) e Giacomo (T-007). Riferimento: `specs/systems/crafting.md`.")
    w("")
    w("## Regole usate")
    w("")
    w("- **Solo contenuti del gioco base** e solo i **41 ingredienti presenti nei due feudi** (selezione del Discord, `ingredients.json`).")
    w("- **Ricette fisse:** in SkyMP il tavolo alchemico del gioco base non funziona, quindi ogni pozione ha la sua ricetta, come alla forgia.")
    w("- In ogni ricetta almeno un ingrediente ha davvero quell'effetto nel gioco base (coerenza per chi conosce Skyrim).")
    w("- **Tre livelli:** comune, non comune, leggendaria. Più sale il livello, più ingredienti rari servono. Cura, vigore e magicka hanno una versione per livello, **con ingredienti diversi**.")
    w(f"- **Vincolo di Alessio:** nessun ingrediente in più di {MAX_USI} ricette.")
    w("- **Esclusi gli effetti inutili in SkyMP** (vedi in fondo).")
    w("")
    w(f"## Pozioni ({len(POZIONI)})")
    w("")
    w("| Pozione | Effetto | Livello | Ingredienti |")
    w("|---|---|---|---|")
    for r in POZIONI:
        w(riga_ricetta(r))
    w("")
    w(f"## Veleni ({len(VELENI)})")
    w("")
    w("| Veleno | Effetto | Livello | Ingredienti |")
    w("|---|---|---|---|")
    for r in VELENI:
        w(riga_ricetta(r))
    w("")
    w("## Ingredienti (41 presenti nei feudi)")
    w("")
    w("| Ingrediente | `id` | Tipo | Rarità | Dove | Usato in | Note |")
    w("|---|---|---|---|---|---|---|")
    ordine = {"comune": 0, "non_comune": 1, "raro": 2}
    for iid in sorted(presenti, key=lambda k: (ordine[rar[k]], nome(k))):
        i = ings[iid]
        wp = i.get("world_plants")
        dove = FEUDO.get(i["feudi"]["availability"], i["feudi"]["availability"])
        if wp:
            dove += f" (piante: Eastmarch {wp.get('eastmarch', 0)}, Rift {wp.get('rift', 0)})"
        u = usi.get(iid, [])
        usato = f"{len(u)}: " + ", ".join(u) if u else "**nessuna ricetta**"
        w(f"| {nome(iid)} | `{iid}` | {i['type']} | {rar[iid].replace('_', ' ')} | {dove} | {usato} | {NOTE_ING.get(iid, '')} |")
    w("")
    inutili = sorted(nome(k) for k in presenti if k not in usi)
    w(f"**Ingredienti presenti ma non usati in nessuna ricetta ({len(inutili)}):** " + (", ".join(inutili) if inutili else "nessuno") + ". Restano utili come merce, per la cucina o per ricette future.")
    w("")
    w("## Effetti esclusi")
    w("")
    w("| Effetto | Perché |")
    w("|---|---|")
    for a, b in ESCLUSE:
        w(f"| {a} | {b} |")
    w("")
    w("## Controlli automatici")
    w("")
    w("- ✅ Tutti gli ingredienti usati esistono e sono presenti nei feudi.")
    w("- ✅ In ogni ricetta almeno un ingrediente ha l'effetto della pozione.")
    for a in avvisi:
        w(f"- ⚠️ {a}")
    w("")
    w("## Da verificare in gioco")
    w("")
    w("- In SkyMP gli **effetti a durata** (resistenze, potenzia, rigenera, veleni persistenti, paralisi, invisibilità) potrebbero non funzionare (`skymp_funzionalita.md`, Step 4). Se è così, nella prima versione restano solo le pozioni di **ripristino** e i veleni a danno immediato.")
    w("")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"Scritto {OUT}: {len(POZIONI)} pozioni, {len(VELENI)} veleni, {len(presenti)} ingredienti, {len(avvisi)} avvisi")


if __name__ == "__main__":
    main()
