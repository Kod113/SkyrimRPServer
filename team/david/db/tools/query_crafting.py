"""Interroga le ricette: cosa serve per costruire un'arma o una corazza, fino alle risorse grezze.

Uso (dalla cartella tools/):
    python3 query_crafting.py "corazza d'acciaio"          prospetto completo
    python3 query_crafting.py "spada elfica" --quanti 5    per 5 pezzi
    python3 query_crafting.py --lista                      tutto cio' che si puo' interrogare
    python3 query_crafting.py "arco nanico" --md prospetto.md   salva anche in Markdown

Legge crafting.json (ricette), loot.json (animali), zones.json (miniere), spawn_rules.json (forti
degli orchi, dove vivono gli animali) e jobs.json (chi puo' fare cosa) dalla cartella del database.
Il nome si puo' scrivere come nel Discord, come nel gioco o anche solo in parte.
"""
import argparse
import difflib
import json
import math
import os
import re
import sys
from collections import defaultdict

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# ------------------------------------------------------------------ dati


def load(name):
    path = os.path.join(DB, name)
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


CR = load("crafting.json")
LOOT = (load("loot.json") or {}).get("items", [])
ZONES = load("zones.json") or {}
SPAWN = load("spawn_rules.json") or {}
JOBS = load("jobs.json") or {}
ITEMS, RECIPES = CR["items"], CR["recipes"]
BY_OUT = defaultdict(list)
for r in RECIPES:
    BY_OUT[r["output"]].append(r)

JOB_FOR_ACTION = defaultdict(list)
for j in JOBS.get("items", []):
    for a in j.get("allowed_actions") or []:
        JOB_FOR_ACTION[a].append(j["name_it"])
BENCH_ACTION = {"CraftingSmelter": "smith", "CraftingSmithingForge": "smith", "DLC1CraftingDawnguard": "smith",
                "CraftingSmithingSkyforge": "smith", "CraftingTanningRack": None}
ORE_WORDS = {"OreIron": "ferro", "OreCorundum": "corindone", "OreMalachite": "malachite",
             "OreOrichalcum": "oricalco", "OreMoonstone": "pietra lunare", "OreQuicksilver": "mercurio",
             "OreEbony": "ebano", "OreGold": "oro", "OreSilver": "argento"}
TERRAIN_IT = {t["id"]: t["name_it"] for t in ZONES.get("terrains", [])}
TERRAIN_IT["giant_camp"] = "accampamenti dei giganti"


def name(item_id):
    it = ITEMS.get(item_id, {})
    return it.get("name_it") or it.get("name_en") or item_id


def bench_it(b):
    return CR["benches"].get(b, b)


def perk_it(p):
    return CR["perks"].get(p, p)


# ------------------------------------------------------------------ stile (colori nel terminale)

class Style:
    def __init__(self, color):
        self.on = color

    def _c(self, code, s):
        return f"\033[{code}m{s}\033[0m" if self.on else s

    def title(self, s): return self._c("1;97", s)
    def head(self, s): return self._c("1;96", s)
    def bold(self, s): return self._c("1", s)
    def dim(self, s): return self._c("2", s)
    def qty(self, s): return self._c("1;93", s)
    def ok(self, s): return self._c("92", s)
    def warn(self, s): return self._c("33", s)


def visible_len(s):
    return len(re.sub(r"\033\[[0-9;]*m", "", s))


def pad(s, width):
    return s + " " * max(0, width - visible_len(s))


# ------------------------------------------------------------------ calcolo

def choose(item_id):
    """La ricetta da usare: solo se ce n'e' una. Con piu' ricette (es. Pelle) l'oggetto resta 'base'."""
    rs = BY_OUT.get(item_id, [])
    return rs[0] if len(rs) == 1 else None


def plan(target, qty):
    """Espande la ricetta livello per livello. Restituisce passaggi, risorse grezze, lavorazioni."""
    # ordine: un oggetto si elabora solo dopo tutti quelli che lo usano
    depth = {}

    def visit(i, d):
        if depth.get(i, -1) >= d:
            return
        depth[i] = d
        r = choose(i)
        if r:
            for x in r["inputs"]:
                visit(x["item"], d + 1)
    visit(target, 0)
    need = defaultdict(int, {target: qty})
    steps, raw = [], {}
    for i in sorted(depth, key=lambda x: depth[x]):
        n = need[i]
        r = choose(i)
        if not r:
            raw[i] = n
            continue
        crafts = math.ceil(n / r["qty"])
        for x in r["inputs"]:
            need[x["item"]] += x["qty"] * crafts
        steps.append({"item": i, "need": n, "recipe": r, "crafts": crafts, "leftover": crafts * r["qty"] - n,
                      "depth": depth[i]})
    return steps, raw


def sources(item_id):
    """Da dove viene una risorsa grezza: miniere, animali, forti, job."""
    it = ITEMS.get(item_id, {})
    out = []
    if it.get("kind") == "ore":
        word = ORE_WORDS.get(item_id, "")
        mines = [f"{p['note'].split(' (')[0]} ({p['name']})" for p in ZONES.get("places", [])
                 if word and word in (p.get("note") or "").lower()]
        if item_id == "OreOrichalcum":
            forts = SPAWN.get("orc_forts", {}).get("items", [])
            if forts:
                mines.append("vene nei forti degli orchi (" + ", ".join(f["name_it"].split(" (")[0] for f in forts) + ")")
            mines.append("loot degli orchi 45%")
        jobs = ", ".join(JOB_FOR_ACTION.get("gather_ore", [])) or "nessun job"
        out.append(("Estrazione", jobs))
        out.append(("Dove", "; ".join(mines) if mines else "nessuna miniera nei due feudi nel database"))
    elif it.get("kind") == "pelt":
        animals = animals_dropping(it.get("name_it"))
        out.append(("Caccia", ", ".join(JOB_FOR_ACTION.get("loot_animal", [])) or "nessun job"))
        out.append(("Animali", ", ".join(animals) if animals else "nessun animale nel database"))
    elif it.get("kind") == "scrap":
        icons = {i["id"]: i for i in ZONES.get("icons", {}).get("items", [])}
        ruin = icons.get("dwemer_ruin")
        where = f"rovine Dwemer ({ruin['north']} a nord, {ruin['south']} a sud)" if ruin else "rovine Dwemer"
        out.append(("Dove", where))
    elif item_id == "Firewood01":
        out.append(("Dove", "ceppo per tagliare la legna, segherie"))
    return out


def animals_dropping(name_it):
    if not name_it:
        return []
    res = []
    for c in LOOT:
        for d in c["drops"]:
            if d.get("item_it", "").lower() == name_it.lower():
                res.append(f"{c['id'].replace('_', ' ')} {round(d['chance'] * 100):d}%")
    return res


def animal_terrains(name_it):
    species = {c["id"] for c in LOOT for d in c["drops"] if d.get("item_it", "").lower() == (name_it or "").lower()}
    t = [TERRAIN_IT.get(x["terrain"], x["terrain"]) for x in SPAWN.get("terrain_species", [])
         if species & set(x["species"])]
    return t


# ------------------------------------------------------------------ ricerca per nome

def norm(s):
    s = (s or "").lower().replace("’", "'")
    return re.sub(r"\s+", " ", s).strip()


def find(query):
    q = norm(query)
    cands = {}
    for c in CR["catalog"]:
        if c["item"]:
            for n in (c["discord_name"], c["game_name_it"]):
                cands[norm(n)] = c["item"]
    for k, v in ITEMS.items():
        for n in (v.get("name_it"), v.get("name_en"), k):
            cands.setdefault(norm(n), k)
    if q in cands:
        return cands[q], []
    part = sorted({v for k, v in cands.items() if q in k})
    if len(part) == 1:
        return part[0], []
    if part:
        return None, part
    close = difflib.get_close_matches(q, cands.keys(), n=5, cutoff=0.6)
    return None, sorted({cands[c] for c in close})


# ------------------------------------------------------------------ stampa

def describe(item_id):
    it = ITEMS[item_id]
    bits = []
    if it.get("armor_class"):
        bits.append(f"Armatura {it['armor_class']} · busto")
    if it.get("weapon_type"):
        bits.append(it["weapon_type"].capitalize())
    stats = []
    if it.get("armor_rating"):
        stats.append(f"Protezione {it['armor_rating']:g}")
    if it.get("damage"):
        stats.append(f"Danno {it['damage']:g}")
    if it.get("weight") is not None:
        stats.append(f"Peso {it['weight']:g}")
    if it.get("value") is not None:
        stats.append(f"Valore {it['value']}")
    return " · ".join(bits), " · ".join(stats)


def report(item_id, qty, st):
    L = []
    W = 66
    line = "═" * W
    sub, stats = describe(item_id)
    cat = next((c for c in CR["catalog"] if c["item"] == item_id), None)
    title = name(item_id).upper() + (f"  ×{qty}" if qty > 1 else "")
    L += [st.dim(line), "  " + st.title(title)]
    if sub:
        L.append("  " + sub)
    if cat and norm(cat["discord_name"]) != norm(name(item_id)):
        L.append("  " + st.dim(f"Nel Discord: «{cat['discord_name']}»"))
    if stats:
        L.append("  " + st.dim(stats))
    L.append(st.dim(line))
    if cat and cat.get("note"):
        L += ["", "  " + st.warn("Nota: " + cat["note"])]

    r = BY_OUT.get(item_id)
    if not r:
        L += ["", "  " + st.warn("Non si costruisce: nel gioco base non c'e' una ricetta per questo oggetto."), ""]
        return L
    r = r[0]
    steps, raw = plan(item_id, qty)

    # 1. ricetta
    L += ["", "  " + st.head("1  COME SI COSTRUISCE"), "  " + st.dim("─" * 40)]
    job = JOB_FOR_ACTION.get(BENCH_ACTION.get(r["bench"]) or "", [])
    L.append(f"  {pad(st.bold('Banco'), 12)} {bench_it(r['bench'])}")
    req = [f"perk «{perk_it(p)}»" for p in r["perks"]] or ["nessun perk"]
    if job:
        req.append("job " + ", ".join(job))
    L.append(f"  {pad(st.bold('Serve'), 12)} {'  ·  '.join(req)}")
    for n, x in enumerate(r["inputs"]):
        label = st.bold("Materiali") if n == 0 else ""
        L.append(f"  {pad(label, 12)} {st.qty(str(x['qty'] * steps[0]['crafts']) + ' ×')} {name(x['item'])}")
    if r["qty"] > 1:
        made = steps[0]["crafts"] * r["qty"]
        extra = f" · {steps[0]['crafts']} lavorazioni = {made} pezzi, ne avanzano {made - qty}" if made != qty else ""
        L.append(f"  {pad('', 12)} " + st.dim(f"(una lavorazione produce {r['qty']} pezzi{extra})"))

    # 2. componenti intermedi
    inter = [s for s in steps if s["item"] != item_id]
    if inter:
        L += ["", "  " + st.head("2  COMPONENTI BASE"), "  " + st.dim("─" * 40)]
        for s in inter:
            rc = s["recipe"]
            ins = " + ".join(f"{x['qty']} {name(x['item'])}" for x in rc["inputs"])
            L.append(f"  {st.qty(str(s['need']) + ' ×')} {st.bold(name(s['item']))}")
            L.append(f"     └ {bench_it(rc['bench'])}: {ins}  →  {rc['qty']} {name(s['item'])}")
            extra = f"{s['crafts']} lavorazion{'e' if s['crafts'] == 1 else 'i'}"
            if s["leftover"]:
                extra += f" · avanzano {s['leftover']}"
            L.append("       " + st.dim(extra))

    # 3. totali
    L += ["", "  " + st.head("3  RISORSE TOTALI"), "  " + st.dim("─" * 40)]
    for i, n in sorted(raw.items(), key=lambda x: name(x[0])):
        L.append(f"  {st.qty(f'{n:>3} ×')} {name(i)}")
        for k, v in sources(i):
            L.append(f"        {st.dim(pad(k, 11))} {v}")
        if len(BY_OUT.get(i, [])) > 1:
            L.append(f"        {st.dim(pad('Si ottiene', 11))} in più modi, vedi sotto")

    # 4. alternative (Pelle, lingotti nanici...)
    for i in sorted(raw, key=name):
        alts = BY_OUT.get(i, [])
        if len(alts) < 2:
            continue
        L += ["", "  " + st.head(f"   Come ottenere {raw[i]} × {name(i)}") + st.dim(f"  ({bench_it(alts[0]['bench'])})")]
        groups = defaultdict(list)
        for a in alts:
            src = a["inputs"][0]
            label = name(src["item"])
            groups[(src["qty"], a["qty"])].append((label, src["item"]))
        for sq, oq in sorted(groups, key=lambda k: -k[1] / k[0]):
            need_n = math.ceil(raw[i] / oq) * sq
            head = f"{sq} {'pezzo' if sq == 1 else 'pezzi'} → {oq}"
            L.append(f"     {st.qty(pad(head, 13))} {st.dim(f'(ne servono {need_n})')}")
            for label, src_id in sorted(groups[(sq, oq)]):
                kind = ITEMS.get(src_id, {}).get("kind")
                who = animals_dropping(name(src_id)) if kind == "pelt" else []
                hint = ", ".join(w.rsplit(" ", 1)[0] for w in who[:3]) if who else \
                    ("rovine Dwemer" if kind == "scrap" else "")
                L.append(f"        ▸ {label}" + (st.dim(f"  ·  {hint}") if hint else ""))

    # 5. riepilogo lavorazioni
    per_bench = defaultdict(int)
    for s in steps:
        per_bench[bench_it(s["recipe"]["bench"])] += s["crafts"]
    L += ["", "  " + st.dim("Lavorazioni: " + " · ".join(f"{v} {k}" for k, v in per_bench.items())), ""]
    return L


def listing(st):
    L = []
    sec = None
    for c in CR["catalog"]:
        if c["section_it"] != sec:
            sec = c["section_it"]
            L += ["", "  " + st.head(sec.upper())]
        mark = st.ok("●") if c["craftable"] else st.warn("○")
        game = c["game_name_it"] or "-"
        extra = "" if norm(game) == norm(c["discord_name"]) else st.dim(f"  (gioco: {game})")
        L.append(f"   {mark} {pad(c['group_it'], 15)} {c['discord_name']}{extra}")
    L += ["", "  " + st.ok("●") + " costruibile   " + st.warn("○") + " senza ricetta nel gioco base", ""]
    return L


def to_markdown(lines):
    plain = [re.sub(r"\033\[[0-9;]*m", "", x) for x in lines]
    return "```\n" + "\n".join(plain).strip("\n") + "\n```\n"


def main():
    ap = argparse.ArgumentParser(description="Prospetto di costruzione di armi e corazze.")
    ap.add_argument("nome", nargs="?", help="nome dell'oggetto (Discord, gioco o parte del nome)")
    ap.add_argument("--quanti", type=int, default=1, help="quanti pezzi costruire (predefinito 1)")
    ap.add_argument("--lista", action="store_true", help="elenca tutto cio' che si puo' interrogare")
    ap.add_argument("--md", help="salva il prospetto anche in questo file Markdown")
    ap.add_argument("--no-colori", action="store_true", help="niente colori")
    a = ap.parse_args()

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if os.name == "nt":
        os.system("")                       # attiva i colori nel terminale di Windows
    st = Style(sys.stdout.isatty() and not a.no_colori)

    if a.lista or not a.nome:
        lines = listing(st)
    else:
        item, alts = find(a.nome)
        if not item:
            print(f"\n  Non trovo «{a.nome}».")
            if alts:
                print("  Forse cercavi:")
                for x in alts[:8]:
                    print(f"   - {name(x)}")
            print("  Usa --lista per vedere tutto.\n")
            sys.exit(1)
        lines = report(item, max(1, a.quanti), st)
    print("\n".join(lines))
    if a.md:
        with open(a.md, "w", encoding="utf-8") as f:
            f.write(to_markdown(lines))
        print(f"  Salvato in {a.md}\n")


if __name__ == "__main__":
    main()
