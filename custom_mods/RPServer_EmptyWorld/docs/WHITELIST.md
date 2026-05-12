# WHITELIST — `RPServer_EmptyWorld` v0.3.0

> Documento di riferimento tecnico che descrive **cosa NON viene disabilitato** dalla mod, e con quali criteri.
>
> La whitelist è il punto in cui in futuro inseriremo eventuali eccezioni esplicite (es. "il mercante X di Whiterun resta attivo"). Per la v0.3.0 è volutamente **minima**: restano solo animali, predatori selvatici naturali e fauna esotica. Tutto il resto (umanoidi, draghi, mob dungeon) è disabilitato.

## Filosofia

- **Disabilitiamo:** umanoidi vanilla + draghi + **tutti i mob dei dungeon** (draughi, scheletri, falmer, automi dwemer, spettri/wisp, Dragon Priest, atronachi, lurker/seeker, riekling, ash spawn, death hound, gargoyle, chaurus reaper).
- **Manteniamo:** solo **gli animali** in senso ampio:
  - animali domestici (cavalli, cani, polli, mucche, capre, gatti)
  - fauna pacifica selvatica (cervi, alci, volpi, conigli, cinghiali)
  - predatori selvatici naturali (lupi, orsi, sabrecat, troll, mammut, giganti, skeever, frostbite spider, hagraven)
  - fauna esotica (spriggan, horker, slaughterfish, chaurus base, ash hopper)

Questa divisione si basa sulla **race EditorID** dell'NPC base.

---

## Criterio tecnico — Pascal Script `DisableNPCs.pas`

Un reference `ACHR` viene **disabilitato** se e solo se tutte queste condizioni sono vere:

1. Il record vive in uno dei 5 master vanilla (`Skyrim.esm`, `Update.esm`, `Dawnguard.esm`, `HearthFires.esm`, `Dragonborn.esm`).
2. Ha una base `NPC_` valida.
3. La sua base `NPC_` ha campo `RNAM` (Race) il cui EditorID è in `RacesToDisable` (vedi `source/RPServer_EmptyWorld_DisableNPCs.pas`).

Se anche solo una di queste condizioni non vale, il reference **resta intatto**.

---

## Cosa resta attivo nel mondo

### Fauna e animali domestici

| Categoria | Esempi | Race EDID | Stato |
|---|---|---|---|
| Cavalli | cavalli delle stalle, Frost, Shadowmere | `HorseRace` | ✅ Attivi |
| Muli | muli vagabondi nelle strade | `HorseRace` (variante) | ✅ Attivi |
| Cani | cani di Riverwood, di Whiterun, mastini | `DogRace`, `DogCompanionRace` | ✅ Attivi |
| Polli | tutte le galline nelle fattorie | `ChickenRace` | ✅ Attivi |
| Mucche | fattorie e villaggi | `CowRace` | ✅ Attivi |
| Capre | fattorie e zone rurali | `GoateRace` | ✅ Attivi |
| Gatti | gatti randagi | `CatRace` | ✅ Attivi |
| Cervi, alci, capre selvatiche | fauna selvatica | `ElkRace`, `DeerRace`, `GoatRace` | ✅ Attivi |
| Volpi, conigli | piccola fauna | `FoxRace`, `RabbitRace` | ✅ Attivi |
| Cinghiali (Dragonborn) | Solstheim | `DLC2BoarRace` | ✅ Attivi |

### Predatori selvatici (animali ostili naturali)

| Categoria | Race EDID | Stato |
|---|---|---|
| Lupi (e varianti) | `WolfRace`, `IceWolfRace` | ✅ Attivi |
| Orsi | `BearBlackRace`, `BearBrownRace`, `BearCaveRace` | ✅ Attivi |
| Sabrecat | `SabreCatRace`, `SabreCatSnowyRace` | ✅ Attivi |
| Troll | `TrollRace`, `FrostTrollRace`, `DLC2BullTrollRace` | ✅ Attivi |
| Mammut | `MammothRace` | ✅ Attivi |
| Giganti | `GiantRace`, `DLC2GiantRace` | ✅ Attivi (sono creature, non umanoidi giocabili) |
| Skeever | `SkeeverRace` | ✅ Attivi |
| Frostbite Spider | `FrostbiteSpiderRaceSmall`, `…Large`, `…Giant` | ✅ Attivi |
| Hagraven | `HagravenRace` | ✅ Attivi (boss creature) |

### Fauna esotica

| Categoria | Race EDID | Stato |
|---|---|---|
| Spriggan | `SprigganRace`, `SprigganMatronRace`, `SprigganBurnRace` | ✅ Attivi |
| Horker | `HorkerRace` | ✅ Attivi |
| Slaughterfish | `SlaughterfishRace` | ✅ Attivi |
| Chaurus (base) | `ChaurusRace` | ✅ Attivi (la variante Reaper invece è disabilitata) |
| Ash Hopper (Solstheim) | `DLC2AshHopperRace` | ✅ Attivi |

> 🔮 **Nota:** la fauna esotica è considerata "transitoriamente mantenuta". In futuro potrebbe essere disabilitata se il team RP deciderà di standardizzare lo spettro animale.

> ⚠️ **I mob dei dungeon (draughi, scheletri, falmer, automi dwemer, spettri, Dragon Priest, atronachi, lurker/seeker, riekling, ash spawn, death hound, gargoyle, chaurus reaper) NON sono più qui.** Sono stati spostati nella sezione "Cosa viene disabilitato" — vedi D-016 in `DECISIONS.md`.

---

## Cosa viene disabilitato

| Categoria | Razza | Stato |
|---|---|---|
| Tutti gli NPC umanoidi vanilla giocabili e non | vedi lista in `source/RPServer_EmptyWorld_DisableNPCs.pas` → `RegisterRacesToDisable` | ❌ Initially Disabled |
| Vampiri umanoidi narrativi (Volkihar, Movarth, etc.) | `NordRaceVampire`, `ImperialRaceVampire`, … | ❌ Disabled |
| Skaal di Solstheim | `DLC2ExpSkaalRace` | ❌ Disabled |
| Afflicted (Peryite quest) | `AfflictedRace`, `DA13AfflictedRace` | ❌ Disabled |
| Carrettieri | nord/imperial race + nella factionsystem `WICarriageSystem` | ❌ Disabled (sia come reference che come quest) |
| **Tutti i draghi vanilla** | `DragonRace` | ❌ Disabled — include Alduin, Paarthurnax, Odahviing, Sahloknir, draghi piazzati su Word Walls e in dragon mound, draghi nominati del DLC Dragonborn |
| **Undead di dungeon** | `DraugrRace`, `DraugrSkeletonRace`, `SkeletonRace`, `DragonPriestRace` | ❌ Disabled — tutte le tipologie di draughi, scheletri, Dragon Priest |
| **Falmer** | `FalmerRace` | ❌ Disabled — Falmer, Falmer Shadowmaster, Gloomlurker, Nightprowler ecc. |
| **Automi Dwemer** | `DwarvenSpiderRace`, `DwarvenSphereRace`, `DwarvenCenturionRace`, `DwarvenBallistaRace` | ❌ Disabled — ragni, sfere, centurioni, balistre |
| **Spettri** | `WispRace`, `WispmotherRace` | ❌ Disabled — wisp e wispmother |
| **Atronachi** | `FrostAtronachRace`, `FlameAtronachRace`, `StormAtronachRace` | ❌ Disabled — atronachi piazzati come mob nei dungeon (le evocazioni del player non sono ACHR statici, restano funzionanti) |
| **Lurker, Seeker (Dragonborn)** | `DLC2LurkerRace`, `DLC2SeekerRace` | ❌ Disabled |
| **Riekling** | `DLC2RieklingRace`, `DLC2RieklingChiefRace` | ❌ Disabled |
| **Ash Spawn (Dragonborn)** | `DLC2AshSpawnRace` | ❌ Disabled — Ash Hopper invece resta come fauna esotica |
| **Death Hound, Gargoyle (Dawnguard)** | `DLC1DeathHoundRace`, `DLC1GargoyleRace` | ❌ Disabled |
| **Chaurus Reaper (variante boss)** | `DLC1ChaurusReaperRace`, `ChaurusReaperRace` | ❌ Disabled — Chaurus base resta come fauna esotica |

---

## Quest disabilitate

Lista completa in `source/RPServer_EmptyWorld_DisableQuests.pas` → `RegisterTargetQuests`. Categorie:

- Main Quest (`MQ101` → `MQ306` + helper)
- Sistema attacchi draghi e Word Walls
- Civil War completa
- Compagni (`C00`–`C06` + radiant CR)
- Collegio di Winterhold (`MG01`–`MG08` + Ritual + radiant)
- Confraternita Oscura (`DB01`–`DB12` + Recurring + Destroy)
- Ladri (`TG00`–`TG10` + radiant + Special Jobs)
- Daedric Princes (`DA01`–`DA16` escluso `DA12` che è DLC2)
- Bards College
- Quest Misc story (`MS01`–`MS14`)
- DLC Dawnguard story + ambush
- DLC Dragonborn story + cultisti
- Random encounter humanoid spawn (`WICourier`, `WIChangeLocation*`)
- Sistema carrettieri (`WICarriageSystem`)

---

## Quest di sistema **non toccate** (whitelist implicita)

Per chiarezza, queste **non** vengono toccate perché necessarie al motore:

- `DefaultDisableHavokOnLoad` e tutto il framework `Default*` di sistema
- Quest player-setup (`PlayerHousePrison*`, `PlayerHouse*` per le case acquistabili)
- Hearthfires building (`BYOH*`) — meccanica, non narrativa
- Crime/bounty system (`Crime*`, `Bounty*`)
- Weather, music, sound (`Weather*`, `MusicTrack*`)
- Achievement tracker
- Followers framework (`DialogueFollower`) — la cornice resta; senza NPC non ha effetto
- Marriage framework (`RelationshipMarriage*`)
- Carriage waiting cell system (la cella tecnica, distinta dai conducenti)

Se in futuro scopriremo che una di queste sta causando problemi (es. spawn fantasma di guardie tramite Crime), la aggiungeremo in `DisableQuests.pas`.

---

## Storia delle modifiche alla whitelist

| Data | Modifica | Motivo |
|---|---|---|
| 2026-05-12 | Creazione whitelist v0.1.0 — zero NPC umanoidi attivi, animali + creature + mob dungeon tutti mantenuti, draghi mantenuti come asset DM, carrettieri esplicitamente disabilitati, sistema Dragonborn completamente disabilitato | Decisione fondatore (vedi `DECISIONS.md` D-010, D-011) |
| 2026-05-12 | Modifica v0.2.0 — **draghi spostati tra i disabilitati** (`DragonRace`). Dragon Priest restano attivi come mob dungeon | Decisione fondatore (vedi `DECISIONS.md` D-015, che supera la parte draghi di D-010 e D-011) |
| 2026-05-12 | Modifica v0.3.0 — **tutti i mob dei dungeon spostati tra i disabilitati**: draughi, scheletri, falmer, automi dwemer, spettri/wisp, Dragon Priest, atronachi, lurker/seeker, riekling, ash spawn, death hound, gargoyle, chaurus reaper. Restano solo animali domestici, fauna pacifica, predatori selvatici naturali e fauna esotica (spriggan, horker, slaughterfish, chaurus base, ash hopper) | Decisione fondatore (vedi `DECISIONS.md` D-016, che supera la parte mob dungeon di D-010) |
