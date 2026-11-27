# Armi e armature costruibili (T-006)

**Autore:** david (con Claude) · **Prima versione:** 1 novembre 2026 · **Aggiornata:** 27 novembre 2026 con due giri di risposte di Davide
**Stato:** ✅ **definitiva** (27/11). Le ricette sono in `db/crafting.json` → sezione `server`, i tier del fabbro in `db/jobs.json`.
**Task:** T-006 in `TASKS.md`, decisa nella riunione del 29/10 (`riunioni/2026-10-29/riassunto.md`).

## Regole decise

- **Scala dei materiali (progressione del personaggio):** pelliccia → cuoio → ferro → acciaio → orchesco → nanico = elfico. Il vetro resta solo per i campioni dell'arena.
- **Danni:** nanico ed elfico fanno lo stesso danno. L'orchesco fa circa il 20% in meno di loro, ma più dell'acciaio. L'armatura elfica pesa meno di quella nanica. Se nei test l'esercito di un regno si arma molto più in fretta dell'altro, si compensa col danno (vedi Bilanciamento).
- **Territorio:** **Windhelm** ha l'elfico, se conquista **Dawnstar** e la sua miniera di **mercurio**. **Riften** ha il nanico, con le miniere naniche (dungeon permadeath). Chi vuole il set dell'altro regno lo compra o lo scambia: patti, commercio e politica tra i regni fanno parte del gioco.
- **L'elfico è lento apposta:** non deve succedere che oggi si conquista Dawnstar e domani tutto l'esercito ha il set elfico. Prima i generali, poi i guerrieri scelti, poi gli altri, nel giro di 10–15 giorni.
- **Il fabbro costruisce, i giocatori portano i materiali:** l'elfico non si vende alla massa. Chi vuole un pezzo procura il mercurio (o paga dei minatori) e il fabbro glielo costruisce a pagamento.
- **Limiti di SkyMP:** la segheria e le strisce di pelle non funzionano. Quindi:
  - la **legna** è un ingrediente da raccogliere: circa **78 punti per regno**, stessa quantità nei due regni;
  - le **strisce di pelle spariscono** da tutte le ricette e si usano le **pelli**. Va bene la pelle di qualsiasi animale, salvo dove la ricetta ne chiede una precisa.

## Tier del fabbro

| Tier | Cosa può costruire |
|---|---|
| 1 | Pelliccia, ferro, archi in legno |
| 2 | Acciaio |
| 3 | Orchesco |
| 4 | Nanico ed elfico |

Servirà per `jobs.json` (fabbro).

## Materie prime

| Materiale | Come si ottiene | Dove |
|---|---|---|
| **Lingotto di ferro** (Fe) | fonderia: 1 ferro grezzo | 2 miniere di ferro per regno |
| **Lingotto di corindone** (Co) | fonderia: 2 corindone grezzo (come nel gioco base) | 1 miniera di corindone per regno |
| **Lingotto d'acciaio** (Ac) | fonderia: **2 Fe + 1 Co** (ricetta nuova) | da ferro e corindone |
| **Lingotto orchesco** (Or) | fonderia: 2 oricalco grezzo | solo nei 2 forti degli orchi, **dopo averli conquistati**: miniera per Windhelm (Narzulbur), vena per Riften (Largashbur). Ogni regno ottiene **10 oricalco** a ciclo; le vene ricompaiono ogni 15–20 minuti |
| **Lingotto nanico** (Na) | fonderia: **1 Fe + 2 Ac + 2 rottami Dwemer** | rottami dagli automi nanici, nelle miniere naniche (dungeon permadeath, **solo nel Rift**) |
| **Lingotto di mercurio** (Me) | fonderia: **4 mercurio grezzo + 1 Fe** (ricetta nuova) | mercurio grezzo dalla **Quicksilver Mine di Dawnstar** (dopo la conquista); lingotti anche nelle casse dei dungeon (10–15%) |
| **Legna** (Le) | ingrediente raccoglibile | boschi, circa 78 punti per regno |
| **Pelle** (Pe) | dagli animali (`db/loot.json`) | niente conceria e niente strisce |

**Miniera di Dawnstar:** dà **12 mercurio grezzo ogni 30 minuti**, fino a un massimo di **36** (cioè 1 ora e mezza di estrazione). Poi si esaurisce e si ricarica al riavvio del server. 36 grezzi = **9 lingotti di mercurio** per ogni riavvio. Quante vene ci sono davvero nella miniera va visto in gioco.

La pietra lunare non serve più: l'elfico usa solo il mercurio, che a Dawnstar c'è davvero.

## Ricette

**Regola di conversione:** dove il gioco base chiedeva strisce di pelle, ora serve **1 pelle** per le armi e **2 pelli** per le armature. Ogni arco chiede 1 pelle.

Legenda: **Fe** ferro · **Ac** acciaio · **Or** orchesco · **Na** nanico · **Me** mercurio · **Le** legna · **Pe** pelle di qualsiasi animale

### Dotazione iniziale (non si costruisce)

| Voce | Come si ottiene |
|---|---|
| **Armatura di cuoio** (= Hide del gioco) | data a quasi tutti i personaggi all'inizio del gioco, con un piccolo set di cuoio |

Idea di Davide, se si potrà modificare l'aspetto degli oggetti: una versione "cuoio raffinato" per alcuni personaggi.

### Tier 1: pelliccia, ferro e archi in legno

| Voce (Discord) | Materiali |
|---|---|
| Armatura di pelliccia | 3 Fe, 7 Pe |
| Stivali di pelliccia | 1 Fe, 4 Pe |
| Guanti di pelliccia | 1 Fe, 4 Pe |
| Spada di ferro | 2 Fe, 1 Pe |
| Ascia di ferro | 2 Fe, 1 Pe |
| Mazza di ferro | 3 Fe, 1 Pe |
| Spadone di ferro | 4 Fe, 1 Pe |
| Ascia bipenne di ferro | 4 Fe, 1 Pe |
| Martello da guerra di ferro | 4 Fe, 1 Pe |
| Frecce di ferro | 1 Fe, 1 Le |
| Armatura di ferro | 5 Fe, 2 Pe |
| Armatura borchiata | 4 Pe, 1 Fe |
| **Arco lungo** | 5 Le, 1 Pe |
| **Arco da caccia** | 7 Le, 1 **pelle d'orso** |

Set di pelliccia completo: **5 Fe + 15 Pe**, come chiesto da Davide. Nel gioco base non c'è un elmo di pelliccia.

### Tier 2: acciaio

| Voce (Discord) | Materiali |
|---|---|
| Spada d'acciaio | 2 Ac, 1 Fe, 1 Pe |
| Ascia d'acciaio | 2 Ac, 1 Fe, 1 Pe |
| Mazza d'acciaio | 3 Ac, 1 Fe, 1 Pe |
| Spadone d'acciaio | 4 Ac, 2 Fe, 1 Pe |
| Ascia bipenne d'acciaio | 4 Ac, 1 Fe, 1 Pe |
| Martello d'acciaio | 4 Ac, 1 Fe, 1 Pe |
| Frecce d'acciaio | 1 Ac, 1 Le |
| Armatura d'acciaio | 4 Ac, 1 Fe, 2 Pe |

### Tier 3: orchesco

| Voce (Discord) | Materiali |
|---|---|
| Spada orchesca | 2 Or, 1 Fe, 1 Pe |
| Ascia orchesca | 2 Or, 1 Fe, 1 Pe |
| Mazza orchesca | 3 Or, 1 Fe, 1 Pe |
| Spadone orchesco | 4 Or, 2 Fe, 1 Pe |
| Ascia orchesca (due mani) | 4 Or, 1 Fe, 1 Pe |
| Martello orchesco | 4 Or, 1 Fe, 1 Pe |
| Arco orchesco | 2 Or, 1 Fe, 1 Pe |
| Armatura orchesca | 4 Or, 1 Fe, 2 Pe |

### Tier 4: nanico (Riften)

Base: **2 acciaio + il lingotto nanico**. Le armi grandi ne chiedono di più.

| Voce (Discord) | Materiali |
|---|---|
| Spada nanica | 2 Ac, 1 Na, 1 Pe |
| Ascia nanica | 2 Ac, 1 Na, 1 Pe |
| Mazza nanica | 2 Ac, 2 Na, 1 Pe |
| Spadone nanico | 3 Ac, 2 Na, 1 Pe |
| Ascia nanica (due mani) | 3 Ac, 2 Na, 1 Pe |
| Martello nanico | 3 Ac, 2 Na, 1 Pe |
| Arco nanico | 2 Ac, 2 Na, 1 Pe |
| Frecce naniche | 1 Na, 1 Le |
| Armatura nanica | 3 Ac, 3 Na, 2 Pe |

### Tier 4: elfico (Windhelm)

Solo **lingotti di mercurio** (più un po' di ferro). Un'armatura costa più di una spada.

| Voce | Materiali |
|---|---|
| Pugnale elfico | 2 mercurio **grezzo**, 1 Fe |
| Spada elfica | 1 Me, 1 Fe, 1 Pe |
| Ascia elfica | 1 Me, 1 Fe, 1 Pe |
| Mazza elfica | 1 Me, 2 Fe, 1 Pe |
| Spadone elfico | 2 Me, 1 Fe, 1 Pe |
| Arco elfico | 2 Me, 1 Pe |
| Frecce elfiche | 1 Me, 1 Le |
| Elmo elfico | 1 Me, 1 Fe |
| Armatura elfica | 3 Me, 2 Pe |
| Guanti elfici | 1 Me |
| Stivali elfici | 1 Me, 1 Pe |
| Scudo elfico | 1 Me, 1 Fe |

**Set elfico completo** (elmo, armatura, guanti, stivali, scudo, spada): **8 lingotti di mercurio**, cioè 32 mercurio grezzo.

### Elmi, guanti, stivali e scudi degli altri tier

Regola: ogni pezzo costa circa **un terzo dell'armatura**. Così il set nanico costa 8 lingotti nanici, come il set elfico costa 8 lingotti di mercurio.

| Tier | Elmo | Guanti | Stivali | Scudo |
|---|---|---|---|---|
| Ferro | 2 Fe | 1 Fe, 1 Pe | 1 Fe, 1 Pe | 2 Fe, 1 Pe |
| Acciaio | 2 Ac | 1 Ac, 1 Pe | 1 Ac, 1 Pe | 2 Ac, 1 Fe |
| Orchesco | 2 Or | 1 Or, 1 Pe | 1 Or, 1 Pe | 2 Or, 1 Fe |
| Nanico | 1 Ac, 1 Na | 1 Na, 1 Pe | 1 Na, 1 Pe | 1 Ac, 1 Na |

### Non costruibili dai giocatori (invariato)

| Voce | Come si ottiene |
|---|---|
| Spada, arco e armatura di vetro | 🏆 solo campioni dell'arena |
| Balestra base e potenziata | 🔒 solo con la quest (dungeon permadeath, unica forgia) |

## Bilanciamento

**Quanto ci vuole per armare Windhelm di elfico.** Obiettivo di Davide: con circa **12 ore di farming** (un gruppo guidato dal fabbro, 1h45–2h al giorno per una settimana, con il server aperto dalle 21 all'1) si arriva a: i generali con il set elfico, 4–5 guerrieri scelti con il set elfico, e qualche pezzo piccolo nel negozio del fabbro.

Conto con i numeri sopra:
- la miniera dà 36 grezzi per riavvio, cioè circa 1h30 di estrazione al giorno, e 9 lingotti di mercurio;
- in 7 giorni si arriva a circa 10–11 ore di estrazione e **63 lingotti di mercurio**;
- 63 lingotti bastano per **7 set elfici** (56 lingotti) e lasciano **7 lingotti** per spade, elmi e guanti del negozio.

Quindi, con 2–3 generali e 4–5 guerrieri scelti, i numeri tornano: **non serve cambiare niente**. Se in gioco risulta troppo lento o troppo veloce, si cambiano solo i 12 grezzi ogni 30 minuti o il massimo di 36.

**Danni (esempio sulla spada).** Nel gioco base: ferro 7, acciaio 8, orchesco 9, nanico 10, elfico 11. Con le regole di Davide basta portare la nanica a 11:
ferro 7 → acciaio 8 → orchesco 9 → nanica 11 = elfica 11.
Se nei test si arma più in fretta Riften (nanico) che Windhelm (elfico), l'elfica sale a **12** e la nanica resta a 11. Le altre armi si sistemano allo stesso modo nel nostro `.esp`.

**Pelli più rare, archi più forti (idea di Davide).**

| Rarità della creatura (dalle regole di spawn di Davide) | Bonus all'arco |
|---|---|
| comune (es. capra, cervo, lupo) | +0 |
| media (es. alce) | +1 |
| rara (es. orso, tigre dai denti a sciabola) | +3 |

Nota tecnica: in Skyrim una ricetta crea sempre lo stesso oggetto. Per archi con danni diversi servono oggetti separati (es. "Arco lungo d'orso") nel nostro `.esp`, oppure uno script nella gamemode. Va verificato cosa permette SkyMP.

## Confermato da David (27/11)

1. **Niente gambali:** in Skyrim gambe e busto sono un pezzo solo. Il set è elmo, armatura, guanti, stivali, scudo e un'arma.
2. **Elmi, guanti, stivali e scudi di tutti i tier:** costano circa un terzo dell'armatura (tabella sopra).
3. **Lingotto nanico:** 1 Fe + 2 Ac + 2 rottami Dwemer.

## Nel database

- `db/crafting.json` → `server`: 73 ricette (fonderia e forgia), tier, dotazione iniziale, oggetti non costruibili, da dove arrivano le risorse. Le ricette del gioco base restano sopra come riferimento.
- `db/jobs.json` → Fabbro: i 4 tier.
- `validate_db.py` controlla anche le ricette del server: oggetti esistenti, un'unica ricetta per oggetto, niente strisce di pelle.
- ⚠️ 23 oggetti nuovi (elmi, guanti, stivali, scudi, pugnale elfico, stivali e guanti di pelliccia) hanno l'EditorID scritto a mano (`verified: false`): vanno controllati con `xedit/build_crafting.py` dai file del gioco. I gruppi `ANY_PELT`, `BEAR_PELT` e `DWEMER_SCRAP` significano "una qualsiasi di queste".

Per vedere il prospetto di una voce del gioco base: dalla cartella `db/tools/`, `python3 query_crafting.py "spada orchesca"`.
- `python3`: l'interprete Python.
- `query_crafting.py`: lo script che mostra ricetta, componenti e dove trovarli.
- `"spada orchesca"`: il nome della voce, anche solo in parte.
