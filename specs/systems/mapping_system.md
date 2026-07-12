# Sistema di Mapping — Studio di design

```
Tipo:     Sistema (non contenuto)
Status:   Bozza — in discussione col team
Versione: 0.1.0
Data:     2026-07-08
Autore:   Lead dev + Claude
Dipende:  STR, PapyrusUtil (già in modlist), SKSE64
```

---

## 1. Obiettivi

Il sistema di mapping deve fornire:

1. **Sistema di riferimento unico** per posizionare qualsiasi cosa nel mondo (spawn di ingredienti/animali, miniere, fattorie, POI custom) — condiviso tra dev, admin e mod.
2. **Mappa master** (fuori gioco) dove gli admin vedono *tutto* ciò che esiste nel mondo e dove.
3. **Mappa personale per giocatore**: ogni player vede solo ciò che ha scoperto o che gli spetta (es. la mappa della sua città di appartenenza). Zone mai visitate = vuote.
4. **Mappe come oggetti fisici in-game**, acquistabili: comprare la "Mappa del Rift" aggiunge informazioni alla propria mappa.
5. **Accesso rapido** in-game: consultare la mappa senza passare da inventario → cerca → apri.
6. Comunicazione **bidirezionale gioco ↔ sistema esterno** (a regime; le prime fasi sono manuali — vedi §7).

## 2. Vincolo architetturale fondamentale (STR)

Prima di tutto va capito cosa STR permette, perché condiziona ogni scelta:

- **Il server STR non ha scripting API server-side.** Il server sincronizza solo posizioni, aspetto, combat, ecc. Non possiamo far girare logica custom "sul server STR". Era nei piani dei dev STR ma non è mai stato rilasciato.
- **Tutta la logica custom gira client-side** (Papyrus/SKSE sul client di ogni player) e **NON è sincronizzata**: uno script che gira sul client di un player non parla con i client degli altri.
- **Conseguenza:** qualsiasi stato condiviso (la mappa master, le scoperte, le proprietà) deve vivere **fuori dal gioco**, in un backend nostro. Il gioco è solo il punto di *lettura* (dove sono?) e di *interazione* (leggo una mappa, costruisco una fattoria). Questo è coerente con la direzione già presa dal progetto (economia/reputazione esterne).
- **Bonus utile:** in STR ogni player ha il *proprio* save → i map marker scoperti sulla mappa vanilla sono già per-giocatore, gratis.

## 3. Sistema di riferimento

### 3.1 Coordinate native di Skyrim (la base)

Skyrim ha già un sistema di coordinate solido, usiamo quello:

- **Worldspace** — il "mondo" di appartenenza. L'esterno di Skyrim è il worldspace `Tamriel`. Solstheim è `DLC2SolstheimWorld`. Gli interni (case, dungeon) sono *cell* separate senza coordinate mondo.
- **Unità (units)** — posizione X, Y, Z in unità di gioco. 1 unit ≈ 1,43 cm; **4096 units = 1 cella ≈ 58,5 m** di lato.
- **Cell grid** — il mondo esterno è diviso in celle quadrate identificate da `(cellX, cellY) = (floor(X/4096), floor(Y/4096))`. È la griglia naturale per il fog of war.

Come si legge una posizione:

- **Admin, manuale:** console in-game → `player.getpos x` / `y` / `z` (o `tdt` per il debug display). Zero sviluppo richiesto.
- **Script, automatico:** Papyrus `GetPositionX/Y/Z()`, `GetParentCell()`, `GetWorldSpace()` (SKSE). Banale da ottenere client-side.

### 3.2 Riferimento canonico del progetto

Ogni posizione nel nostro sistema è:

```
{ worldspace, x, y, z? }          → puntuale (un POI, una fattoria)
{ worldspace, [poligono di x,y] } → area (zona di spawn, territorio)
interni: { cell_editor_id }       → es. "WhiterunBanneredMare"
```

Da queste si derivano automaticamente: cella `(cellX, cellY)`, **Hold** di appartenenza e **zone nominate** (poligoni definiti da noi nel DB master, es. "Piana di Whiterun", "Paludi di Morthal"). I giocatori e il lato RP parlano per zone nominate; il sistema sotto parla in coordinate. Le zone sono anche la granularità naturale per le mappe acquistabili e per gli spawn ("le lavande spawnano nella Piana di Whiterun" = poligono nel DB).

## 4. Architettura a tre livelli

```
┌──────────────────────────────────────────────────────┐
│ A. DB MASTER (fuori gioco — fonte di verità)         │
│    GeoJSON/SQLite nel backend: POI, zone, spawn,     │
│    proprietà player, stato scoperte per giocatore    │
└───────────────┬──────────────────────────────────────┘
                │
┌───────────────▼──────────────┐  ┌────────────────────┐
│ B. MAPPA WEB (Leaflet)       │  │ C. IN-GAME         │
│  - vista admin: tutto        │  │  - mappa fisica    │
│  - vista player: login →     │  │    (oggetto)       │
│    solo zone scoperte        │  │  - marker vanilla  │
│    (fog of war)              │  │  - tracking (fasi  │
└──────────────────────────────┘  │    avanzate)       │
                                  └────────────────────┘
```

### A. DB Master

Un unico archivio con tutto ciò che esiste nel mondo. Formato consigliato per partire: **GeoJSON versionato nel repo** (leggibile, diffabile, zero infrastruttura); migrazione a SQLite/Postgres quando serve un backend vero. Entità principali:

| Entità | Campi chiave |
|---|---|
| `poi` | id, tipo (miniera/fattoria/negozio/...), posizione, proprietario (player), visibilità (pubblico/scopribile/nascosto) |
| `zone` | id, nome, poligono, hold |
| `spawn_rule` | zona → cosa spawna (ingrediente/animale), densità, stagionalità |
| `player_discovery` | player → zone/POI scoperti, mappe possedute |

La regola di visibilità risolve la mappa di ciascuno: **admin = tutto; player = pubblico ∪ scoperto ∪ concesso dalle mappe possedute ∪ città di appartenenza.**

### B. Mappa web

- **Base:** Leaflet con i tile della mappa di Skyrim. L'UESP ha open-source sia il [viewer](https://github.com/uesp/uesp-gamemap) sia gli [script di generazione tile](https://github.com/uesp/skyrimmaps-scripts) — possiamo generare tile nostri (importante: dal *nostro* worldspace moddato, così la mappa riflette il mondo del server).
- **Conversione coordinate:** trasformazione affine `unità di gioco → pixel tile`, calibrata su 2-3 landmark noti. Fatta una volta, vale per sempre.
- **Vista admin** (mappa master): tutti i layer, editing POI direttamente dalla mappa (click → form → scrive nel DB).
- **Vista player:** login (account collegato al personaggio) → rendering solo di ciò che la regola di visibilità concede; il resto è coperto/vuoto. Fog of war a granularità di **zona** (non di cella: più leggibile, più RP, molto più semplice).

### C. In-game

Tre componenti, indipendenti tra loro (dettaglio in §5 e §6): mappa fisica come oggetto, marker sulla mappa vanilla pilotati dalle mappe acquistate, e (in fase avanzata) tracking automatico dell'esplorazione.

## 5. Mappa fisica in-game e mappe acquistabili

### 5.1 Oggetto mappa

- Base: [Equip-able Maps SE](https://www.nexusmods.com/skyrimspecialedition/mods/16373) — mappe di carta equipaggiabili, tenute in mano. Compatibilità STR da testare (è roba semplice: item + texture, buone probabilità).
- Estetica opzionale: [Helps To Have a Map — Hold Map Idle](https://www.nexusmods.com/skyrimspecialedition/mods/121577) (animazione che mostra la mappa nelle mani; richiede IED+OAR, da valutare contro il criterio stabilità).
- In alternativa/complemento, mappe regionali custom nostre: item "libro" con texture della regione — un player che apre "Mappa del Rift" vede il disegno della regione. Facile da produrre con i tile generati per la mappa web.

### 5.2 Accesso rapido (niente inventario)

Opzioni in ordine di semplicità:

1. **Favorites/hotkey vanilla** — la mappa è equipaggiabile → si mette nei preferiti → tasto rapido. Zero sviluppo.
2. **Power "Consulta mappa"** — un lesser power (tasto Z) dato a chi possiede l'oggetto: equipaggia/apre la mappa. Papyrus banale, molto RP.
3. **Hotkey SKSE dedicato** — tasto singolo che apre direttamente la mappa posseduta "migliore". Più pulito, più lavoro.

Partire con 1, promuovere a 2 quando facciamo la mod.

### 5.3 Mappe acquistabili = chiavi di visibilità

Una "Mappa del Rift" venduta da un cartografo (player mercante!) fa due cose quando viene letta la prima volta:

1. **In-game:** uno script Papyrus sull'item rivela i map marker vanilla della regione (`ObjectReference.AddToMap()` sui marker della zona). Effetto immediato e per-giocatore (save separati in STR).
2. **Fuori gioco:** sblocca il layer corrispondente nella mappa web del player. In fase manuale: l'acquisto viene registrato da admin/mercante nel DB (o il player riscatta un codice sul sito); in fase automatica: lo script notifica il backend (§7, Fase 3).

Stesso meccanismo per la **mappa della città di appartenenza**: assegnata alla creazione del personaggio (background system).

## 6. La mappa vanilla (tasto M) — decisione da prendere

| Opzione | Pro | Contro |
|---|---|---|
| **A. Tenerla, limitata** (no fast travel, marker solo da mappe comprate/scoperte) | Zero sviluppo rischioso; i marker sono già per-giocatore; UX familiare | Mostra il terreno di tutta Skyrim anche dove non sei mai stato (limite del motore: il fog copre solo la mappa *locale*, non la world map) |
| **B. Disabilitarla del tutto** (intercettare il tasto M via SKSE) | Massima immersione: esiste solo la carta fisica e la mappa web | Sviluppo custom + rischio incompatibilità; i player perdono uno strumento di orientamento base; frustrazione pratica |
| **C. Sostituirla** con menu mappa custom | Controllo totale (fog of war vero) | Progetto grosso (UI custom), fuori scala per ora |

**Raccomandazione dev:** **Opzione A** per Step 0/1. La "conoscenza del terreno" che la world map regala si giustifica RP-sticamente ("tutti conoscono la geografia generale di Skyrim"); ciò che conta — *cosa* c'è e *dove* — resta controllato da noi tramite marker e mappa web. B/C restano possibili dopo, senza buttare nulla. → Da discutere col fondatore e registrare in `DECISIONS.md`.

Nota: il fast travel va comunque disabilitato (probabilmente già previsto altrove; se no, va aggiunto come decisione).

## 7. Fasi di implementazione

### Fase 0 — Fondamenta (subito, zero codice di gioco)
- Definire lo schema GeoJSON (POI, zone, spawn_rule) e committarlo nel repo.
- Disegnare i poligoni delle prime zone (partendo dalle 1-3 città RP di Step 0).
- Procedura admin: raccolta coordinate con `player.getpos` → inserimento nel DB.

### Fase 1 — Mappa web
- Generare i tile (script UESP) dal nostro worldspace.
- Viewer Leaflet: vista admin (tutto + editing) e vista player (login + regola visibilità). Scoperte gestite a mano dagli admin (il player dice "sono stato a Falkreath", o lo si vede in eventi RP).

### Fase 2 — Mappe fisiche in-game
- Test Equip-able Maps su STR; item mappe regionali custom; script `AddToMap` per regione; power "Consulta mappa".
- Vendita tramite cartografi player; riscatto sblocco web manuale/via codice.

### Fase 3 — Ponte automatico gioco → backend
- Quest Papyrus client-side che campiona posizione ogni N secondi → celle/zone visitate → `PapyrusUtil` scrive JSON su disco (PapyrusUtil è **già in modlist**).
- Upload: (a) il **launcher** del client pack legge il JSON e lo manda al backend (più robusto, già abbiamo un launcher), oppure (b) [Papyrus HTTP Utils](https://www.nexusmods.com/skyrimspecialedition/mods/172953) per POST diretti dal gioco (da testare con STR).
- Da qui: fog of war automatico, posizione live sulla mappa master (admin), acquisto mappe auto-registrato.

### Fase 4 — Costruzioni player
- Il player "costruisce la fattoria" in RP → admin la registrano nel DB (visibile subito sulla mappa web di tutti secondo visibilità) → la struttura fisica entra nel mondo con il successivo **world update** (release del nostro .esp distribuita via modlist). Limite STR: non si possono materializzare edifici a runtime in modo sincronizzato; il doppio binario "subito su mappa, al prossimo update nel mondo" è il compromesso onesto.

## 8. Rischi e questioni aperte

- **Compatibilità STR** di Equip-able Maps, Papyrus HTTP Utils, ed eventuali mod di idle: ogni aggiunta va testata sul profilo Admin prima di entrare in modlist ([Script Patch Hub](https://www.nexusmods.com/skyrimspecialedition/mods/84335) come riferimento per i pattern di patch).
- **Identità player ↔ account web**: serve un collegamento personaggio → account (probabilmente via Discord OAuth, coerente con D-002). Da specificare.
- **Tile del worldspace moddato**: gli script UESP vanno fatti girare su una macchina con CK/strumenti — effort da stimare.
- **Anti-cheat "morbido"**: la mappa web player mostra solo ciò che è concesso, ma nulla impedisce a un player di guardare la UESP pubblica. Il valore delle nostre mappe è *cosa c'è nel nostro mondo* (POI custom, spawn, proprietà), non la geografia — ed è per questo che il fog sulla geografia vanilla (opzione B in §6) rende meno di quanto costa.
- **Mappa vanilla**: decisione §6 da portare al fondatore.

## 9. Fonti tecniche

- [UESP gamemap (viewer Leaflet, open source)](https://github.com/uesp/uesp-gamemap) · [script generazione tile Skyrim](https://github.com/uesp/skyrimmaps-scripts)
- [Equip-able Maps SE](https://www.nexusmods.com/skyrimspecialedition/mods/16373) · [Hold Map Idle](https://www.nexusmods.com/skyrimspecialedition/mods/121577)
- [Papyrus HTTP Utils](https://www.nexusmods.com/skyrimspecialedition/mods/172953) · [PapyrusUtil SE](https://www.nexusmods.com/skyrimspecialedition/mods/13048)
- [Skyrim Together Reborn](https://www.nexusmods.com/skyrimspecialedition/mods/69993)
