# Armi e armature costruibili (T-006)

**Autore:** david (con Claude) · **Data:** 1 novembre 2026 · **Stato:** proposta, da confermare con Davide
**Task:** T-006 in `TASKS.md`, decisa nella riunione del 29/10 (`riunioni/2026-10-29/riassunto.md`).

## Da dove parte

- **Lista delle armi e armature:** le 50 voci di #lista-armi-e-armature del Discord, con le ricette del gioco base in `db/crafting.json` (armature: solo il busto).
- **Minerali (riunione del 29/10):** ferro, acciaio, oricalco, nanico, elfico. Il vetro è un oggetto unico per i campioni dell'arena. Ferro e acciaio vanno in quantità uguale in ogni regno.
- **Niente semilavorati,** tranne lingotti e strisce di pelle. Per fare le strisce serve la pelle conciata, quindi la conceria (pelle grezza → pelle → strisce) resta.
- **Pelli:** dagli animali e mostri selezionati da Davide (`db/loot.json`).

## Risultato in breve

| Gruppo | Voci | Esito |
|---|---|---|
| Ferro (nessuna abilità richiesta) | 10 | ✅ costruibili |
| Acciaio | 8 | ✅ costruibili |
| Orchesco (oricalco) | 8 | ✅ costruibili |
| Nanico | 9 | ✅ costruibili, ma **da decidere da dove arriva il metallo nanico** |
| Elfico | 7 | ✅ costruibili, ma **5 voci chiedono il mercurio**, che non è nella lista dei minerali |
| Vetro | 3 | 🏆 solo per i campioni dell'arena (nessun giocatore le costruisce) |
| Balestre | 2 | 🔒 solo con la quest (dungeon permadeath, unica forgia), come già scritto nel Discord |
| Senza ricetta nel gioco base | 3 | ❓ da decidere: si trovano/comprano oppure inventiamo una ricetta |

**Totale: 42 costruibili dai giocatori, 3 dell'arena, 2 da quest, 3 da decidere.**

La scala dei livelli segue le abilità del gioco e può fare da base per i **tier del fabbro** (`jobs.json`):
**1 Ferro → 2 Acciaio → 3 Orchesco / Nanico → 4 Elfico → (Vetro: solo arena)**.

## Elenco completo

Legenda materiali: **Fe** lingotto di ferro · **Ac** lingotto d'acciaio · **Or** lingotto di oricalco · **Na** lingotto nanico · **El** pietra lunare raffinata · **Me** lingotto di mercurio · **Ve** malachite raffinata · **St** strisce di pelle · **Pe** pelle · **Le** legna da ardere

### Tier 1: ferro (nessuna abilità)

| Voce (Discord) | Materiali | Esito |
|---|---|---|
| Spada di ferro | 2 Fe, 1 St | ✅ |
| Ascia di ferro | 2 Fe, 2 St | ✅ |
| Mazza di ferro | 3 Fe, 2 St | ✅ |
| Spadone di ferro | 4 Fe, 2 St | ✅ |
| Ascia bipenne di ferro | 4 Fe, 2 St | ✅ |
| Martello da guerra di ferro | 4 Fe, 3 St | ✅ |
| Frecce di ferro | 1 Fe, 1 Le | ✅ |
| Armatura di ferro | 5 Fe, 3 St | ✅ |
| Armatura di cuoio | 4 Pe, 3 St | ✅ solo pelli |
| Armatura borchiata | 4 Pe, 3 St, 1 Fe | ✅ |

### Tier 2: acciaio (Forgiatura dell'acciaio)

| Voce (Discord) | Materiali | Esito |
|---|---|---|
| Spada d'acciaio | 2 Ac, 1 Fe, 1 St | ✅ |
| Ascia d'acciaio | 2 Ac, 1 Fe, 2 St | ✅ |
| Mazza d'acciaio | 3 Ac, 1 Fe, 1 St | ✅ |
| Spadone d'acciaio | 4 Ac, 2 Fe, 3 St | ✅ |
| Ascia bipenne d'acciaio | 4 Ac, 1 Fe, 2 St | ✅ |
| Martello d'acciaio | 4 Ac, 1 Fe, 3 St | ✅ |
| Frecce d'acciaio | 1 Ac, 1 Le | ✅ |
| Armatura d'acciaio | 4 Ac, 1 Fe, 3 St | ✅ |

### Tier 3: orchesco (Forgiatura orchesca)

| Voce (Discord) | Materiali | Esito |
|---|---|---|
| Spada orchesca | 2 Or, 1 Fe, 1 St | ✅ |
| Ascia orchesca | 2 Or, 1 Fe, 2 St | ✅ |
| Mazza orchesca | 3 Or, 1 Fe, 1 St | ✅ |
| Spadone orchesco | 4 Or, 2 Fe, 3 St | ✅ |
| Ascia orchesca (due mani) | 4 Or, 1 Fe, 2 St | ✅ |
| Martello orchesco | 4 Or, 1 Fe, 3 St | ✅ |
| Arco orchesco | 2 Or, 1 Fe | ✅ |
| Armatura orchesca | 4 Or, 1 Fe, 3 St | ✅ |

### Tier 3: nanico (Forgiatura nanica)

| Voce (Discord) | Materiali | Esito |
|---|---|---|
| Spada nanica | 1 Na, 1 Ac, 1 Fe, 1 St | ✅ ⚠️ |
| Ascia nanica | 1 Na, 1 Ac, 1 Fe, 2 St | ✅ ⚠️ |
| Mazza nanica | 2 Na, 1 Ac, 1 Fe, 1 St | ✅ ⚠️ |
| Spadone nanico | 2 Na, 2 Ac, 2 Fe, 3 St | ✅ ⚠️ |
| Ascia nanica (due mani) | 2 Na, 2 Ac, 1 Fe, 2 St | ✅ ⚠️ |
| Martello nanico | 2 Na, 2 Ac, 1 Fe, 3 St | ✅ ⚠️ |
| Arco nanico | 2 Na, 1 Fe | ✅ ⚠️ |
| Frecce naniche | 1 Na, 1 Le | ✅ ⚠️ |
| Armatura nanica | 3 Na, 1 Ac, 1 Fe, 3 St | ✅ ⚠️ |

⚠️ Nel gioco base il lingotto nanico **non viene da una miniera**: si fonde dai rottami Dwemer trovati nelle rovine. Vedi domanda 2.

### Tier 4: elfico (Forgiatura elfica)

| Voce (Discord) | Materiali | Esito |
|---|---|---|
| Spada elfica | 1 El, 1 Me, 1 Fe, 1 St | ✅ ⚠️ mercurio |
| Ascia elfica | 1 El, 1 Me, 1 Fe, 2 St | ✅ ⚠️ mercurio |
| Mazza elfica | 2 El, 1 Me, 1 Fe, 1 St | ✅ ⚠️ mercurio |
| Spadone elfico | 2 El, 1 Me, 2 Fe, 3 St | ✅ ⚠️ mercurio |
| Arco elfico | 2 El, 1 Me | ✅ ⚠️ mercurio |
| Frecce elfiche | 1 El, 1 Le | ✅ |
| Armatura elfica | 4 El, 1 Fe, 1 Pe, 3 St | ✅ |

### Solo arena, quest o da decidere

| Voce (Discord) | Materiali nel gioco base | Esito |
|---|---|---|
| Spada di vetro | 1 Ve, 1 El, 1 St | 🏆 solo campioni dell'arena |
| Arco di vetro | 2 Ve, 1 El | 🏆 solo campioni dell'arena |
| Armatura di vetro | 4 Ve, 2 El, 1 Pe, 3 St | 🏆 solo campioni dell'arena |
| Balestra base | 3 Ac, 3 Le (Forgia della Guardia dell'Alba) | 🔒 solo quest |
| Balestra potenziata | 1 Balestra, 2 lingotti di corundum | 🔒 solo quest |
| Arco lungo | nessuna ricetta | ❓ domanda 4 |
| Arco di caccia | nessuna ricetta | ❓ domanda 4 |
| Armatura di pelliccia | nessuna ricetta | ❓ domanda 4 |

## Da dove arrivano le materie prime

| Materiale | Come si ottiene | Dove (dati attuali del database) |
|---|---|---|
| Lingotto di ferro | fonderia: 1 ferro grezzo | Gloombound Mine (Narzulbur), probabile Northwind: **solo Eastmarch** |
| Lingotto d'acciaio | fonderia: 1 ferro grezzo + 1 corindone | corindone: Goldenrock Mine (Darkwater Crossing): **solo Eastmarch** |
| Lingotto di oricalco | fonderia: 2 oricalco grezzo | vene nei forti degli orchi (Windhelm e Riften); loot degli orchi 45% |
| Lingotto nanico | fonderia: rottami Dwemer | rovine Dwemer (nessuna miniera) |
| Pietra lunare raffinata | fonderia: 2 pietra lunare | **nessuna miniera nei due feudi** |
| Strisce di pelle | conceria: 1 pelle → 4 strisce | pelle conciata dalle pelli di animali (sotto) |
| Pelle | conceria: 1 pelle grezza → 1–4 pelli | orsi e tigri dai denti a sciabola 4 · cavalli e mucche 3 · alci e cervi 2 · lupi e volpi 1 · capre 2 → 1 |
| Legna da ardere | ceppo per la legna, segherie | entrambi i feudi |

**Problema di equilibrio:** oggi ferro e corindone (quindi anche l'acciaio) esistono solo nell'Eastmarch, mentre nel Rift c'è solo una miniera d'oro (Lost Prospect). Questo va contro la regola "stessa quantità di ferro e acciaio in ogni regno". Davide dovrà mettere le vene nel Rift (domanda 1).

## Domande per Davide

1. **Acciaio e ferro nel Rift:** quando dici "acciaio", intendi una miniera di corindone (in fonderia ferro + corindone = acciaio, come nel gioco base) o un minerale d'acciaio unico? Inoltre, in quale miniera del Rift mettiamo ferro e acciaio per pareggiare l'Eastmarch?
2. **Nanico:** da dove arriva? Le alternative sono **(a)** i rottami Dwemer nelle rovine, come nel gioco base, senza oggetti nuovi, oppure **(b)** una vena "nanica" in miniera, che però richiede un oggetto nuovo.
3. **Elfico e mercurio:** 5 voci elfiche (spada, ascia, mazza, spadone, arco) chiedono il mercurio, che non è nella tua lista. Propongo di **sostituire il mercurio con 1 pietra lunare raffinata in più**, così l'elfico usa solo il suo minerale. In quale miniera va la pietra lunare? Oggi non ce n'è nessuna nei due feudi.
4. **Le 3 voci senza ricetta:** arco lungo, arco di caccia e armatura di pelliccia. Restano solo da loot e negozio, o inventiamo una ricetta semplice? La mia proposta:
   - arco di caccia: 2 legna + 2 strisce di pelle;
   - arco lungo: 2 legna + 1 lingotto di ferro + 1 striscia;
   - armatura di pelliccia: 2 pelli grezze + 2 strisce.
5. **Corazza di pelle (Leather):** non è nella lista del Discord, mentre "Armatura di cuoio" corrisponde alla Hide del gioco. Va bene così?
6. **Armature:** abbiamo solo il busto. Elmi, guanti, stivali e scudi si aggiungono dopo, con gli stessi materiali?

## Prossimo passo

Quando Davide risponde, aggiorno `db/crafting.json` (minerali, ricette nuove e sostituite) e `jobs.json` (tier del fabbro). Poi la lista diventa definitiva con una PR.

Per vedere il prospetto completo di una voce: dalla cartella `db/tools/`, `python3 query_crafting.py "spada orchesca"`.
- `python3`: l'interprete Python.
- `query_crafting.py`: lo script che mostra ricetta, componenti e dove trovarli.
- `"spada orchesca"`: il nome della voce, anche solo in parte.
