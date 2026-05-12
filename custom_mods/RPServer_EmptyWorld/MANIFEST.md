# MANIFEST — RPServer_EmptyWorld

> Mod fondazionale del server. Trasforma Skyrim Special Edition in un mondo "tabula rasa": niente NPC umanoidi vanilla, niente quest vanilla, niente sistema Dragonborn. Le creature, la fauna e i mob dei dungeon restano. Sopra questa base verranno costruite tutte le mod custom successive.

---

## Identità

- **Nome ufficiale mod:** `RPServer_EmptyWorld`
- **Versione corrente:** `v0.3.0` (sorgenti aggiornati, .esp non ancora generato)
- **Autore/i:** Team dev SkyrimRPServer (lead: David)
- **Data di creazione:** 2026-05-12
- **Ultimo aggiornamento:** 2026-05-12
- **Stato:** In sviluppo
- **Profilo:** Player + Staff (è una mod core, va a tutti)

## Scopo della mod

Svuotare Skyrim dei suoi NPC umanoidi vanilla, dei suoi draghi, di **tutti i mob dei dungeon**, delle sue quest vanilla, dei suoi eventi scripted e dell'intero sistema Dragonborn, per liberare il mondo come **sandbox neutro** sul quale il team RP potrà costruire NPC, mob, quest, fazioni e lore custom. La filosofia è "**disabilitare, non eliminare**": ogni cosa rimossa resta tecnicamente nei master, solo silenziata. Questo evita rotture cross-mod e permette di riattivare selettivamente in futuro. **Resta nel mondo solo ciò che è classificabile come "animale"**: domestici, fauna pacifica, predatori selvatici naturali, fauna esotica.

## Cosa fa concretamente

- Itera su tutti i reference `ACHR` (Placed NPC) presenti nei master vanilla (`Skyrim.esm`, `Update.esm`, `Dawnguard.esm`, `HearthFires.esm`, `Dragonborn.esm`) e flagga **`Initially Disabled`** ogni reference la cui base `NPC_` appartiene a una razza in `RacesToDisable`:
  - **Umanoidi vanilla** (uomini, mer, khajiit, argoniani, vampiri umanoidi, Skaal, Afflicted)
  - **Draghi** (`DragonRace` — Alduin, Paarthurnax, Odahviing, Sahloknir, draghi su Word Walls e dragon mound)
  - **Mob dungeon** (draughi, scheletri, falmer, Dragon Priest, automi dwemer, spettri/wisp, atronachi piazzati, lurker/seeker, riekling, ash spawn, death hound, gargoyle, chaurus reaper)

  Vedi `docs/WHITELIST.md` per la lista completa di race con criteri tecnici.
- Marca un elenco curato di quest narrative (`MQ*`, `CW*`, `C0*`, `MG*`, `TG*`, `DB*`, `DLC1*` story, `DLC2*` story) come **non `Start Game Enabled`** e ne forza lo stato a `Stage 0` con flag `Stop On Quest End`.
- Disabilita il sistema Shouts/Word Walls a livello di script di trigger (Word Walls restano nel mondo come prop ma non insegnano più Words).
- Disabilita Random Dragon Attacks (lo storyteller `WIDragonAttacks` viene fermato).
- Installa una **quest Papyrus di fallback** (`RPServer_EmptyWorldInit`) `Start Game Enabled` che al primo `OnInit()` ferma via `Stop()` le quest vanilla residue eventualmente avviate da altre mod nel load order, come safety net.

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

- **SKSE64** — necessario per il Papyrus di fallback (usa `Game.GetPlayer()` e quest scripting standard, ma il caricamento di mod custom richiede SKSE).
- **PapyrusUtil SE** — usata dal fallback per logging diagnostico (`MiscUtil.PrintConsole`).
- **Address Library for SKSE Plugins** — dipendenza di PapyrusUtil.

### Mod incompatibili note

- **Skyrim Unbound Reborn** — fa parte dello stesso problem space (disabilita intro e MQ). Compatibile per design: `RPServer_EmptyWorld` deve caricare **dopo** Unbound nel load order così le sue modifiche sovrascrivono in caso di conflitto sui record `MQ101`/`MQ102`. Se Unbound viene rimosso, EmptyWorld continua a funzionare da solo. Decisione: **teniamo entrambe** per i primi test, poi valutiamo se Unbound diventa ridondante.
- **Mod che ripopolano cellule** (es. "Populated Cities", "Immersive Patrols", "Inconsequential NPCs") — sovrascrivono i nostri disable o reintroducono NPC. **Da escludere dalla modlist**.
- **Mod che modificano la main quest** (Alternate Start, Live Another Life, Realm of Lorkhan in modalità "complete the MQ", "Beyond Skyrim: Bruma") — vanno valutate caso per caso. Live Another Life è candidato come alternativa/sostituto di Unbound.
- **Mod che aggiungono follower vanilla-style auto-recruitabili** — possono creare follower che reference NPC ora disabilitati.

## Record modificati

| Tipo record | Numero approssimativo | Note |
|---|---|---|
| `ACHR` (Placed NPC) | ~8500–9000 dei ~10000 totali | Umanoidi + draghi + mob dungeon. Flag *Initially Disabled* attivato. Restanti (~1000–1500: solo animali domestici, fauna pacifica, predatori selvatici, fauna esotica) **non toccati** |
| `QUST` (Quest) | ~80–120 narrative vanilla | Flag *Start Game Enabled* rimosso; `Stop()` forzato runtime via fallback |
| `NPC_` | 0 | Definizioni base non toccate |
| `RACE`, `CLAS`, `FACT`, `KYWD` | 0 | Framework demografico intatto |
| `WOOP` (Word of Power) | 0 record modificati, ma trigger `QF_WordOfPower*` disabilitati | Word Walls restano come prop ma non insegnano |
| Nuovi record aggiunti | 1 `QUST` (`RPServer_EmptyWorldInit`) + 1 `SCPT` Papyrus | Quest di fallback |

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
| `source/RPServer_EmptyWorld_DisableNPCs.pas` | Pascal per xEdit: flagga *Initially Disabled* gli ACHR umanoidi |
| `source/RPServer_EmptyWorld_DisableQuests.pas` | Pascal per xEdit: disabilita Start Game Enabled sulle quest narrative |
| `source/RPServer_EmptyWorldInit.psc` | Sorgente Papyrus della quest fallback |
| `scripts/RPServer_EmptyWorldInit.pex` | (Generato in build) Papyrus compilato |
| `RPServer_EmptyWorld.esp` | (Generato in build) Plugin deployabile |
| `docs/PROCEDURA_BUILD.md` | Guida operativa step-by-step per generare l'.esp |
| `docs/WHITELIST.md` | Whitelist tecnica completa con criteri |
| `tests/CHECKLIST.md` | Checklist test singleplayer + STR |

## Test eseguiti

| Data | Test | Esito | Note |
|---|---|---|---|
| — | — | — | Nessun test ancora eseguito. La draft v0.3.0 contiene solo sorgenti, non ancora il plugin generato |

## Note di rilascio (per i giocatori)

*Mod interna al server, non viene comunicata ai giocatori come feature a sé stante. La sua esistenza si manifesta implicitamente nel fatto che il mondo è vuoto, pronto per essere riempito dal team RP.*

## Changelog tecnico

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
