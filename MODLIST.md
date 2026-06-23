# MODLIST UFFICIALE — Server SkyrimRPServer

> **Cosa contiene:** la lista delle mod (terze e custom) che compongono la modlist del server, con stato di compatibilità Skyrim Together Reborn e ruolo nella distribuzione.
>
> **Come si aggiorna:** ogni volta che si aggiunge, rimuove, o si cambia versione di una mod, si aggiorna la riga corrispondente. Le decisioni importanti vanno anche in `DECISIONS.md`.

## Profili di modlist

Manterremo **due modlist distinte**:

- **Modlist Player** — ciò che ricevono i giocatori normali via Wabbajack. Identica byte-per-byte per tutti.
- **Modlist Staff** — la Player + alcuni tool di sviluppo/moderazione. Distribuita solo allo staff fidato.

La colonna **Profilo** sotto indica per ognuna a quale modlist appartiene.

## Stato di compatibilità STR

Legenda della colonna *Stato STR*:

- ✅ **Verificato** — testato in STR multiplayer, funziona senza desync significativi
- ⚠️ **Da testare** — installato, da provare in scenario STR
- ❓ **Incerto** — funziona in singleplayer, comportamento STR non noto
- ❌ **Incompatibile** — testato e crea problemi (desync, crash, comportamento errato)
- 🚫 **Esclusa** — decisa l'esclusione dalla modlist per design (vedi `DECISIONS.md`)

Legenda della colonna *Install*:

- 📥 **Installata** — presente nel profilo MO2 `Admin` del dev, abilitata
- ⬜ **Non installata** — ancora da scaricare/abilitare
- 🚫 **Esclusa** — non sarà installata (vedi `DECISIONS.md`)

---

## Base game / DLC / Creation Club (assunti come installati)

> Queste righe **non sono mod modlist**, ma costituiscono la baseline del gioco su cui poggia tutto il resto. Sono attive nel profilo MO2 `Admin` del dev. Vanno richieste anche al giocatore (chi non ha i DLC o l'Anniversary Edition Upgrade non potrà entrare nel server).

| Componente | Tipo | Profilo | Note |
|---|---|---|---|
| Skyrim Special Edition (base) | Base game | Player + Staff | Versione **da fissare** in `DECISIONS.md` e bloccata (no auto-update) |
| HearthFires | DLC | Player + Staff | Richiesto |
| Dragonborn | DLC | Player + Staff | Richiesto |
| Dawnguard | DLC | Player + Staff | Richiesto |
| ccQDRSSE001-SurvivalMode | Creation Club | Player + Staff | Survival Mode ufficiale — **valutare se attivarlo come gameplay RP** o lasciarlo presente ma disattivato in-game |
| ccBGSSSE037-Curios | Creation Club | Player + Staff | Resource Pack assets |
| ccBGSSSE025-AdvDSGS | Creation Club | Player + Staff | Advanced Daedric / armatura — content pack |
| ccBGSSSE001-Fish | Creation Club | Player + Staff | Sistema pesca AE |
| _ResourcePack | Creation Club | Player + Staff | Bethesda AE Resource Pack — dipendenza di molti CC |

---

## Tool e infrastruttura (non sono mod, ma servono al dev)

| Tool | Versione | Install | Note |
|---|---|---|---|
| Skyrim Special Edition | *da fissare* | 📥 Installata | Versione bloccata, no auto-update |
| Mod Organizer 2 | *da fissare* | 📥 Installata | Profilo attivo: `Admin` (sarà rinominato `RPServer-Dev` o sdoppiato Player/Staff) |
| SKSE64 (loader + DLL) | *da fissare* | 📥 Installata | Versione matched a SSE — script Papyrus inclusi (`SKSE64 Script` in MO2) |
| Creation Kit | *da fissare* | ⬜ Non installata | Dev only |
| SSEEdit (xEdit) | *da fissare* | ⬜ Non installata | Dev only |
| Visual Studio Code | *da fissare* | ⬜ Non installata | Dev only |

---

## Mod tecniche / librerie (modlist Player + Staff)

| Mod | Versione | Profilo | Install | Stato STR | Note |
|---|---|---|---|---|---|
| Skyrim Together Reborn | *da fissare* | Player + Staff | 📥 Installata | ✅ Core | È **la base**, non è una mod tra le altre |
| Address Library for SKSE Plugins | *da fissare* | Player + Staff | 📥 Installata | ⚠️ Da testare | Versione matched a SSE |
| PapyrusUtil SE — Modders Scripting Utility Functions | *da fissare* | Player + Staff | 📥 Installata | ⚠️ Da testare | Necessaria per framework RP |
| ConsoleUtilSSE NG | *da fissare* | Staff *(attualmente abilitata anche in profilo Admin del dev)* | 📥 Installata | ❓ Incerto | **Da rimuovere dal pack Player** in fase di build. Solo Staff (debug/GM tools) |
| Unofficial Skyrim Special Edition Patch (USSEP) | *da fissare* | Player + Staff | 📥 Installata | ⚠️ Da testare | Bugfix vanilla |
| SSE Engine Fixes (`EngineFixes`) | *da fissare* | Player + Staff | 📥 Installata | ⚠️ Da testare | Stabilità motore — verificare di avere installato anche la parte `Part 2` (DLL + ini in `Data/SKSE/Plugins`) |
| Crash Logger SSE AE VR — PDB support | *da fissare* | Player + Staff | 📥 Installata | ⚠️ Da testare | Per debug crash |
| Open Cities Skyrim | — | — | 🚫 Esclusa | ❌ Incompatibile | Incompatibilità nota con STR: apre le città nel worldspace principale causando problemi di sync. Non verrà usata finché STR non la supporta ufficialmente. Le patches correlate sono anch'esse escluse. |

---

## Interfaccia & QoL (modlist Player + Staff)

| Mod | Versione | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|---|
| SkyUI | 5.2SE | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/12604) | Richiede SKSE |
| A Quality World Map | 9.0.1 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/5804) | Variante: Vivid with Stone Roads — caricare dopo Skyland AIO |
| Better Jumping SE | 1.8.6 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/18967) | |
| Bandolier – Bags and Pouches Classic | 1.2.3 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/2417) | Borse visibili sul personaggio — ottimo per immersione RP |

---

## Visual (modlist Player + Staff)

| Mod | Versione | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|---|
| Skyland AIO | 4.32 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/34179) | Base texture overhaul — caricare **prima** degli altri visual |
| Obsidian Weathers and Seasons | 1.07a | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/12125) | |
| Luminosity Lighting Overhaul | 4.2 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/16830) | Usare insieme a Relighting Skyrim |
| Relighting Skyrim SE | 3.0 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/8586) | |
| Enhanced Vanilla Trees SE | 2.2.2 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/11008) | |
| Blended Roads | 1.7 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/8834) | Caricare dopo Skyland AIO |
| Skyland Night Sky | 1.0 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/18022) | |

---

## Audio & Ambience (modlist Player + Staff)

| Mod | Versione | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|---|
| FSS – Better Bards | 1.0 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus LE](https://www.nexusmods.com/skyrim/mods/6496) | ⚠️ Verificare se MOSKYRIM include una port SSE compatibile |
| The Northerner Diaries – Immersive Edition | 1.0 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/28108) | |
| Celtic Music in Skyrim SE | 2.1 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/2179) | |

---

## Gameplay (modlist Player + Staff)

| Mod | Versione | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|---|
| Attack Speed Framework | 2.2.1 | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/45541) | Framework tecnico — da solo non cambia nulla al gameplay |
| Alternate Start – Live Another Life | ultima | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/272) | Obbligatoria — tutti devono scegliere la stessa origine per evitare desync |

---

## Personaggio (modlist Player + Staff)

| Mod | Versione | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|---|
| RaceMenu SE | ultima | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/19080) | Richiede SKSE — essenziale per identità visiva del personaggio RP |

---

## Mod gameplay / contenuto candidate

| Mod | Versione | Profilo | Stato STR | Decisione Step 0 | Note |
|---|---|---|---|---|---|
| Skyrim Unbound Reborn | *da fissare* | Player + Staff | ⚠️ Da testare | **Inclusa** | Disabilita main quest e Dovahkiin — copre P6 dello Step 0 |
| Static Skill Leveling Rewritten | — | — | — | 🚫 **Esclusa** | Troppe dipendenze aggiuntive, complessità non giustificata in questa fase. Da rivalutare in futuro. |
| Trade and Barter | — | — | — | 🚫 **Esclusa** | Senza mercanti NPC non ha senso. Si valuta in fase Economia |
| Skyrim Reputation | — | — | — | 🚫 **Esclusa** | Da reinterpretare nel framework RP custom |

---

## Mod custom (sviluppate dal team)

| Mod | Versione | Profilo | Status | Cartella |
|---|---|---|---|---|
| RPServer_EmptyWorld | v0.3.0 (sorgenti committati, .esp non ancora generato) | Player + Staff | 🛠️ In sviluppo | `custom_mods/RPServer_EmptyWorld/` |

Le mod custom future si aggiungeranno qui via via che vengono progettate.

---

## Load order (sintesi)

> Sarà definito formalmente in `configs/load_order.txt` quando l'ambiente sarà installato. Sintesi della logica:

1. Master vanilla (`Skyrim.esm`, `Update.esm`, DLC)
2. USSEP
3. SSE Engine Fixes (parte plugin)
4. Skyrim Together Reborn (e suoi master)
5. Mod tecniche / librerie
6. Mod gameplay (Skyrim Unbound Reborn, ecc.)
7. Mod custom server (NoNPCs, future mod RP)
8. (Solo Staff) tool di sviluppo e moderazione
9. Patch di compatibilità (se necessarie)

Regola generale: **le mod custom del server vanno verso il fondo del load order**, così sovrascrivono le mod terze dove necessario.

---

## Note sulla compatibilità con STR

Skyrim Together Reborn ha sincronizzazione **parziale**: sincronizza i player, una parte degli NPC quest-critici, il combattimento, alcuni effetti magici. **Molto altro è lato client**, quindi ogni player vede e gestisce localmente. Conseguenze pratiche:

- Mod che modificano AI degli NPC: spesso non sincronizzate → comportamenti diversi per ogni player. Per noi è meno grave perché stiamo per rimuoverli tutti.
- Mod che toccano economia/inventario dei mercanti: ogni player ha la sua economia. Per noi è irrilevante per lo stesso motivo.
- Mod che modificano skill/perk: sync imperfetto. Va testato caso per caso.
- Mod con UI custom (menu, HUD): non sincronizzate, ogni player ha la sua. Va bene.
- Mod che spawnano oggetti nel mondo via script: ogni player vede oggetti suoi. **Attenzione** se vogliamo che oggetti messi nel mondo siano condivisi.

Per ogni nuova mod che valutiamo: prima di metterla in modlist Player, **due dev devono testarla in STR insieme** e annotare l'esito in questa tabella.
