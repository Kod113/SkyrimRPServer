# MANIFEST — RPServer_EmptyWorld

> Mod fondazionale del server. Trasforma Skyrim Special Edition in un mondo "tabula rasa": niente NPC umanoidi vanilla, niente quest vanilla, niente sistema Dragonborn. Le creature, la fauna e i mob dei dungeon restano. Sopra questa base verranno costruite tutte le mod custom successive.

---

## Identità

- **Nome ufficiale mod:** `RPServer_EmptyWorld`
- **Versione corrente:** `v0.5.0` (sorgenti aggiornati, .esp non ancora generato)
- **Autore/i:** Team dev SkyrimRPServer (lead: David)
- **Data di creazione:** 2026-05-12
- **Ultimo aggiornamento:** 2026-06-21
- **Stato:** In sviluppo
- **Profilo:** Player + Staff (è una mod core, va a tutti)

## Scopo della mod

Svuotare Skyrim dei suoi NPC umanoidi vanilla, dei suoi draghi, di **tutti i mob dei dungeon**, delle sue quest vanilla, dei suoi eventi scripted e dell'intero sistema Dragonborn, per liberare il mondo come **sandbox neutro** sul quale il team RP potrà costruire NPC, mob, quest, fazioni e lore custom. La filosofia è "**disabilitare, non eliminare**": ogni cosa rimossa resta tecnicamente nei master, solo silenziata. Questo evita rotture cross-mod e permette di riattivare selettivamente in futuro. **Resta nel mondo solo ciò che è classificabile come "animale"**: domestici, fauna pacifica, predatori selvatici naturali, fauna esotica.

## Cosa fa concretamente

- Itera su tutti i reference `ACHR` (Placed NPC) presenti nei master vanilla (`Skyrim.esm`, `Update.esm`, `Dawnguard.esm`, `HearthFires.esm`, `Dragonborn.esm`) e flagga **`Initially Disabled`** ogni reference la cui base — un `NPC_` diretto **oppure** un `LVLN` (Leveled NPC) risolto ricorsivamente fino agli `NPC_` foglia, template `Use Traits` inclusi — può generare un attore la cui razza è in `RacesToDisable`:
  - **Umanoidi vanilla** (uomini, mer, khajiit, argoniani, vampiri umanoidi, Skaal, Afflicted)
  - **Draghi** (`DragonRace` — Alduin, Paarthurnax, Odahviing, Sahloknir, draghi su Word Walls e dragon mound)
  - **Mob dungeon** (draughi, scheletri, falmer, Dragon Priest, automi dwemer, spettri/wisp, atronachi piazzati, lurker/seeker, riekling, ash spawn, death hound, gargoyle, chaurus reaper)

  Vedi `docs/WHITELIST.md` per la lista completa di race con criteri tecnici.

> **Scope v0.5.0:** la mod si occupa esclusivamente di disabilitare gli ACHR. La disabilitazione delle quest vanilla e il sistema Papyrus di fallback sono stati esclusi dallo scope attuale e potranno essere reintrodotti in una versione futura se necessari.

## Cosa NON fa / cosa NON tocca

- **Non rimuove** record base `NPC_`: le definizioni delle "classi" NPC restano intatte. Solo le istanze nel mondo sono spente. Questo evita ondate di "missing form" errors in altre mod che reference NPC base.
- **Non tocca** reference `ACHR` la cui base sta su race "animale": tutti gli animali domestici, la fauna pacifica selvatica, i predatori selvatici naturali (lupi, orsi, sabrecat, troll, mammut, giganti, skeever, frostbite spider, hagraven) e la fauna esotica (spriggan, horker, slaughterfish, **chaurus base** e **ash hopper**).
- **Non rimuove** i package AI dagli NPC. Sono ancora "esistenti", solo non-renderizzati e non-attivi nel mondo.
- **Non rimuove** `RACE`, `CLAS`, `FACT`, `KYWD`. Tutto il framework demografico resta utilizzabile per gli NPC custom che il team aggiungerà.
- **Non disabilita** le quest di sistema necessarie al motore (Player Reference setup, time tracking, weather, music, achievement-gating). Vedi WHITELIST.md.
- **Non rimuove** dungeon, mob dei dungeon (draughi, falmer, spettri, vampiri non-quest, lupi, orsi, sabrecat, troll, dragon priests, mob unici dei boss room).
- **Non rimuove** mercanti se in futuro vorremo includerli a mano nella whitelist: per ora la whitelist NPC è **vuota** (zero eccezioni umanoidi).

## Dipendenze

### Master richiesti

- `Skyrim.esm`
- `Update.esm`
- `Dawnguard.esm`
- `HearthFires.esm`
- `Dragonborn.esm`

### Mod richieste

- Nessuna. Il plugin è puro override di record vanilla, senza script Papyrus né dipendenze runtime.

### Mod incompatibili note

- **Skyrim Unbound Reborn** — fa parte dello stesso problem space (disabilita intro e MQ). Compatibile per design: `RPServer_EmptyWorld` deve caricare **dopo** Unbound nel load order così le sue modifiche sovrascrivono in caso di conflitto sui record `MQ101`/`MQ102`. Se Unbound viene rimosso, EmptyWorld continua a funzionare da solo. Decisione: **teniamo entrambe** per i primi test, poi valutiamo se Unbound diventa ridondante.
- **Mod che ripopolano cellule** (es. "Populated Cities", "Immersive Patrols", "Inconsequential NPCs") — sovrascrivono i nostri disable o reintroducono NPC. **Da escludere dalla modlist**.
- **Mod che modificano la main quest** (Alternate Start, Live Another Life, Realm of Lorkhan in modalità "complete the MQ", "Beyond Skyrim: Bruma") — vanno valutate caso per caso. Live Another Life è candidato come alternativa/sostituto di Unbound.
- **Mod che aggiungono follower vanilla-style auto-recruitabili** — possono creare follower che reference NPC ora disabilitati.

## Record modificati

| Tipo record | Numero approssimativo | Note |
|---|---|---|
| `ACHR` (Placed NPC) | ~8500–9000 dei ~10000 totali | Umanoidi + draghi + mob dungeon. Flag *Initially Disabled* attivato. Restanti (~1000–1500: solo animali domestici, fauna pacifica, predatori selvatici, fauna esotica) **non toccati** |
| `NPC_` | 0 | Definizioni base non toccate |
| `RACE`, `CLAS`, `FACT`, `KYWD` | 0 | Framework demografico intatto |
| `QUST` | 0 | Quest vanilla non toccate (fuori scope v0.5.0) |
| Nuovi record aggiunti | 0 | Solo override di ACHR esistenti |

## Compatibilità con Skyrim Together Reborn

- **Sincronizzazione side-effects:** le modifiche sono tutte **statiche** (flag su record nel plugin). STR sincronizza i player, non i reference disabilitati. Conseguenza: ogni client vede lo stesso mondo vuoto, perché ogni client carica lo stesso plugin. La sincronia è garantita dall'identità della modlist, non da STR.
- **Test in STR multiplayer:** *non eseguito* — da pianificare appena 2 dev hanno l'ambiente pronto. Vedi `tests/CHECKLIST.md`.
- **Edge case noti in STR:** la quest Papyrus di fallback gira **localmente su ciascun client**, non è sincronizzata. Va bene perché fa solo `Quest.Stop()` su quest che ognuno deve già avere ferme. Non genera oggetti né side effect che altri client debbano vedere.

## Whitelist / Eccezioni

Vedi `docs/WHITELIST.md` per la versione completa con criteri tecnici. Sintesi:

- **NPC umanoidi attivi:** *nessuno* (whitelist umanoidi vuota in v0.3.0).
- **Carrettieri (carriage drivers):** **disabilitati esplicitamente** anche se sono in `WICarriageSystem`.
- **Cavalli, muli:** mantenuti (`HorseRace`).
- **Animali domestici** (cani, polli, mucche, gatti, capre): mantenuti.
- **Fauna pacifica selvatica** (cervi, alci, volpi, conigli, cinghiali): mantenuta.
- **Predatori selvatici naturali** (lupi, orsi, sabrecat, troll, mammut, giganti, skeever, frostbite spider, hagraven): mantenuti.
- **Fauna esotica** (spriggan, horker, slaughterfish, chaurus base, ash hopper): mantenuta. Considerata "transitoriamente mantenuta" e da rivalutare in futuro.
- **Draghi:** **disabilitati** (`DragonRace`) — include Alduin, Paarthurnax, Odahviing, Sahloknir, draghi sui Word Walls e nelle dragon mound. Vedi D-015.
- **Mob dungeon:** **disabilitati** (draughi, scheletri, falmer, Dragon Priest, automi dwemer, spettri/wisp, atronachi piazzati, lurker/seeker, riekling, ash spawn, death hound, gargoyle, chaurus reaper). Vedi D-016.
- **Atronachi evocati dal player:** restano funzionanti (sono spawnati a runtime, non sono ACHR statici).
- **Quest di sistema** (PlayerRef setup, weather, music, achievement counters, generic crime/bounty framework): mantenute.

## File inclusi nella mod

| File | Cosa è |
|---|---|
| `MANIFEST.md` | Questo file |
| `source/RPServer_EmptyWorld_DisableNPCs.pas` | Pascal per xEdit: flagga *Initially Disabled* gli ACHR target |
| `RPServer_EmptyWorld.esp` | (Generato in build) Plugin deployabile |
| `docs/PROCEDURA_BUILD.md` | Guida operativa step-by-step per generare l'.esp |
| `docs/WHITELIST.md` | Whitelist tecnica completa con criteri |
| `tests/CHECKLIST.md` | Checklist test singleplayer |

## Test eseguiti

| Data | Test | Esito | Note |
|---|---|---|---|
| — | — | — | Nessun test ancora eseguito. La draft v0.3.0 contiene solo sorgenti, non ancora il plugin generato |

## Note di rilascio (per i giocatori)

*Mod interna al server, non viene comunicata ai giocatori come feature a sé stante. La sua esistenza si manifesta implicitamente nel fatto che il mondo è vuoto, pronto per essere riempito dal team RP.*

## Changelog tecnico

### v0.5.0 — 2026-06-21
- **Scope ridotto per testing locale.** Rimossa la disabilitazione delle quest vanilla (`DisableQuests.pas`) e l'intera Fase 2 Papyrus (quest fallback `RPServer_EmptyWorldInit`, script `RPServer_EmptyWorldPlayerAlias`, FormList `RPServer_QuestsToStop`, Global `RPServer_EWInit_Done`). La mod è ora esclusivamente un override di record ACHR. Nessuna dipendenza runtime (SKSE, PapyrusUtil, Address Library non più necessari). Il plugin risultante è più semplice, robusto e indipendente.
- Aggiornata la procedura di build (solo Fase 1 + Fase 3), la checklist test (rimossi test A1-A5, B9-B13, B17) e il MANIFEST.

### v0.4.0 — 2026-05-21
- **Fix maggiore di copertura.** Lo script `DisableNPCs.pas` v0.3.0 gestiva solo gli `ACHR` la cui base è un `NPC_` diretto, ignorando quelli piazzati tramite `LVLN` (Leveled NPC) — la maggior parte dei mob dei dungeon e dei nemici. Alla prima build reale disabilitava ~2500 ACHR sui ~8500-9000 attesi. La v0.4.0 risolve ricorsivamente le basi `LVLN` (liste annidate) e i template `NPC_` con flag *Use Traits* (`TPLT`) fino agli `NPC_` foglia. Vedi `DECISIONS.md` D-017.
- Policy liste miste (D-017): un `ACHR` viene disabilitato se la base può generare anche un solo attore non-animale.
- Lo script risolve sempre il *winning override* di basi, template e razze; aggiunge cache + visited-set (performance e protezione dai cicli).
- Output diagnostico ampliato: contatori separati per disabilitati via `NPC_` e via `LVLN`.
- `DisableQuests.pas` non interessato (opera su `QUST`).
- Incluso anche il fix precedente per cui gli script non aggiungevano i 5 master vanilla al plugin di destinazione vuoto (errore `Load order FileID [00] can not be mapped`): entrambi gli script Pascal ora chiamano `AddMasterIfMissing` + `SortMasters` all'avvio.

### v0.3.0 — 2026-05-12
- **Breaking della whitelist v0.2.0**: aggiunte 19 race di mob dungeon a `RacesToDisable` (`DraugrRace`, `DraugrSkeletonRace`, `SkeletonRace`, `DragonPriestRace`, `FalmerRace`, `DwarvenSpiderRace`, `DwarvenSphereRace`, `DwarvenCenturionRace`, `DwarvenBallistaRace`, `WispRace`, `WispmotherRace`, `FrostAtronachRace`, `FlameAtronachRace`, `StormAtronachRace`, `DLC2LurkerRace`, `DLC2SeekerRace`, `DLC2RieklingRace`, `DLC2RieklingChiefRace`, `DLC2AshSpawnRace`, `DLC1DeathHoundRace`, `DLC1GargoyleRace`, `DLC1ChaurusReaperRace`, `ChaurusReaperRace`). Vedi D-016.
- Restano nel mondo solo: animali domestici, fauna pacifica, predatori selvatici naturali, fauna esotica (spriggan, horker, slaughterfish, chaurus base, ash hopper).
- WHITELIST.md riorganizzata: rimossa la sezione "Mob dei dungeon" dai "Mantenuti".
- CHECKLIST.md: test B7 (draughi) ribaltato, B18 (Dragon Priest) ribaltato, aggiunti test su fauna esotica + predatori per garantire che restino.

### v0.2.0 — 2026-05-12
- **Breaking della whitelist v0.1.0**: aggiunta `DragonRace` alla lista delle razze da disabilitare. Tutti i draghi vanilla diventano *Initially Disabled* (vedi `DECISIONS.md` D-015).
- Rinominata struttura interna `HumanoidRaces` → `RacesToDisable` nello script Pascal per coerenza concettuale.
- Aggiornati MANIFEST, WHITELIST e CHECKLIST test per riflettere il nuovo scope.

### v0.1.0 — 2026-05-12
- Creata struttura della mod e MANIFEST.
- Scritti sorgenti Pascal per xEdit (DisableNPCs, DisableQuests).
- Scritta quest Papyrus di fallback.
- Whitelist tecnica definita (draghi mantenuti come asset DM).
- Procedura di build documentata.
- **Plugin .esp non ancora generato** — generazione prevista sul fisso Windows del dev quando lo stack è pronto (vedi `STEP_0.md` Priorità 4).
