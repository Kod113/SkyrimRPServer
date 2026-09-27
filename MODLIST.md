# MODLIST UFFICIALE — Server SkyrimRPServer

> **Cosa contiene:** la lista delle mod (terze e custom) che compongono la modlist del server, con stato di compatibilità Skyrim Together Reborn e ruolo nella distribuzione.
>
> **Come si aggiorna:** ogni volta che si aggiunge, rimuove, o si cambia versione di una mod, si aggiorna la riga corrispondente. Le decisioni importanti vanno anche in `DECISIONS.md`.
>
> **Ultimo sync MO2:** 2026-06-25 — lista ricavata da `AppData\Local\ModOrganizer\Skyrim Special Edition\mods\`

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

- 📥 **Installata** — presente nella cartella `mods\` di MO2 (scaricata). **Non vuol dire che sia abilitata nel profilo**: per quello vale la sezione *Profilo attivo* qui sotto
- ⬜ **Non installata** — ancora da scaricare/abilitare
- 🚫 **Esclusa** — non sarà installata (vedi `DECISIONS.md`)

---

## Profilo attivo `RPServer-Dev` (MO2)

> Mod **effettivamente abilitate** nel profilo MO2 in uso, in ordine di caricamento (dal basso verso l'alto, come in MO2). Ultimo aggiornamento: 2026-06-24. Mod ID estratti dai `meta.ini` di MO2.
>
> *Sezione assorbita dall'ex `MODS.md` (rimosso il 2026-09-27 per avere una sola lista mod).* Le mod segnate 📥 nelle tabelle sotto ma **assenti da qui** sono scaricate ma non abilitate.

| # | Nome Mod | Nexus |
|---|----------|-------|
| 1 | Unofficial Skyrim Special Edition Patch - USSEP | [266](https://www.nexusmods.com/skyrimspecialedition/mods/266) |
| 2 | Crash Logger SSE AE VR - PDB support | [59818](https://www.nexusmods.com/skyrimspecialedition/mods/59818) |
| 3 | Address Library for SKSE Plugins | [32444](https://www.nexusmods.com/skyrimspecialedition/mods/32444) |
| 4 | PapyrusUtil SE - Modders Scripting Utility Functions | [13048](https://www.nexusmods.com/skyrimspecialedition/mods/13048) |
| 5 | ConsoleUtilSSE NG | [76649](https://www.nexusmods.com/skyrimspecialedition/mods/76649) |
| 6 | SkyUI | [12604](https://www.nexusmods.com/skyrimspecialedition/mods/12604) |
| 7 | EngineFixes | [17230](https://www.nexusmods.com/skyrimspecialedition/mods/17230) |
| 8 | Skyrim Together Reborn | [69993](https://www.nexusmods.com/skyrimspecialedition/mods/69993) |
| 9 | RaceMenu | [19080](https://www.nexusmods.com/skyrimspecialedition/mods/19080) |
| 10 | Blended Roads | [8834](https://www.nexusmods.com/skyrimspecialedition/mods/8834) |
| 11 | Obsidian Weathers and Seasons | [12125](https://www.nexusmods.com/skyrimspecialedition/mods/12125) |
| 12 | Bandolier - Bags and Pouches Classic | [2417](https://www.nexusmods.com/skyrimspecialedition/mods/2417) |
| 13 | A Quality World Map | [5804](https://www.nexusmods.com/skyrimspecialedition/mods/5804) |
| 14 | Better Jumping SE | [18967](https://www.nexusmods.com/skyrimspecialedition/mods/18967) |
| 15 | Relighting Skyrim SE | [8586](https://www.nexusmods.com/skyrimspecialedition/mods/8586) |
| 16 | Luminosity Lighting Overhaul - The Cathedral Concept | [16830](https://www.nexusmods.com/skyrimspecialedition/mods/16830) |
| 17 | Alternate Start - Live Another Life - SSE | [272](https://www.nexusmods.com/skyrimspecialedition/mods/272) |

---

## Base game / DLC / Creation Club (assunti come installati)

> Queste righe **non sono mod modlist**, ma costituiscono la baseline del gioco su cui poggia tutto il resto.

| Componente | Tipo | Profilo | Note |
|---|---|---|---|
| Skyrim Special Edition (base) | Base game | Player + Staff | Versione **1.6.1170** fissata (D-009), no auto-update |
| HearthFires | DLC | Player + Staff | Richiesto |
| Dragonborn | DLC | Player + Staff | Richiesto |
| Dawnguard | DLC | Player + Staff | Richiesto |
| ccQDRSSE001-SurvivalMode | Creation Club | Player + Staff | **Disattivato — non funzionante su STR allo stato attuale**: STR blocca wait/sleep (sync del tempo), ma in Survival il sonno è obbligatorio per smaltire l'exhaustion e per il level-up → debuff perenne e niente livelli. Fame/freddo invece funzionerebbero. Integrabile in futuro con patch nostra (azzerare exhaustion gain + rimuovere requisito sonno per level-up) |
| ccBGSSSE037-Curios | Creation Club | Player + Staff | Resource Pack assets |
| ccBGSSSE025-AdvDSGS | Creation Club | Player + Staff | Advanced Daedric / armatura |
| ccBGSSSE001-Fish | Creation Club | Player + Staff | Sistema pesca AE |
| _ResourcePack | Creation Club | Player + Staff | Bethesda AE Resource Pack — dipendenza di molti CC |

---

## Tool e infrastruttura (non sono mod, ma servono al dev)

| Tool | Versione | Install | Note |
|---|---|---|---|
| Skyrim Special Edition | 1.6.1170 | 📥 Installata | Versione bloccata, no auto-update |
| Mod Organizer 2 | *da fissare* | 📥 Installata | Profilo attivo: `RPServer-Dev` |
| SKSE64 (loader + DLL) | 2.2.6 | 📥 Installata | Versione matched a SSE 1.6.1170 |
| Creation Kit | *da fissare* | ⬜ Non installata | Dev only |
| SSEEdit (xEdit) | *da fissare* | ⬜ Non installata | Dev only. ⚠️ Usato il 2026-05-21 per la prima build di EmptyWorld (vedi D-017): verificare se è ancora installato dopo la reinstallazione di giugno |
| Visual Studio Code | *da fissare* | ⬜ Non installata | Dev only |

---

## Mod tecniche / librerie (modlist Player + Staff)

| Mod | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|
| Skyrim Together Reborn | Player + Staff | 📥 Installata | ✅ Core | — | È **la base**, non è una mod tra le altre |
| Address Library for SKSE Plugins | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/32444) | Versione matched a SSE 1.6.1170 |
| PapyrusUtil SE — Modders Scripting Utility Functions | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/13048) | Necessaria per framework RP |
| SSE Engine Fixes (EngineFixes) | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/17230) | Verificare che la Part 2 (DLL) sia installata |
| Crash Logger SSE AE VR — PDB support | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/59818) | Per debug crash |
| Unofficial Skyrim Special Edition Patch (USSEP) | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/266) | Bugfix vanilla — standard de facto |
| ConsoleUtilSSE NG | **Staff only** | 📥 Installata | ❓ Incerto | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/76649) | **Da rimuovere dal pack Player** in fase di build |
| powerofthree's Tweaks | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/51073) | Fix motore vari, no gameplay change |
| powerofthree's Papyrus Extender | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/22854) | Estende funzioni Papyrus — dipendenza di varie mod |
| SSE Display Tweaks | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/34705) | Uncap FPS, fix vsync, fondamentale |
| Spell Perk Item Distributor (SPID) | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/36869) | Framework distribuzione perk/item via INI |
| VR Address Library for SKSEVR | — | 📥 Installata | ❓ Incerto | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/58101) | ⚠️ Mod per VR — probabilmente installata per errore o come dipendenza automatica. Da verificare se necessaria |
| Open Cities Skyrim | — | 🚫 Esclusa | ❌ Incompatibile | — | Incompatibilità nota con STR |

---

## Fix vanilla (modlist Player + Staff)

| Mod | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|
| Hide Quest Items in Container Menu | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/51243) | QoL puro, nessun rischio |
| High Gate Ruins Puzzle Reset Fix | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/53643) | Fix vanilla |
| CritterSpawn Congestion Fix | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/67276) | Fix spawn creature piccole |
| WIDeadBodyCleanupScript Crash Fix | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/62413) | Fix crash cadaveri |
| Skyrim Project Optimization SE | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/14084) | Occlusion culling interni → più FPS. Versione ESL v1.5 |
| Wait Your Turn — Enemy Circling Behaviour | — | 📥 Installata | ❌ Non pertinente | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/65091) | ⚠️ Mod AI NPC — non pertinente con il nostro design. Da disabilitare/rimuovere |

---

## Interfaccia & QoL (modlist Player + Staff)

| Mod | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|
| SkyUI | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/12604) | Richiede SKSE — essenziale |
| A Quality World Map | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/5804) | Variante: Vivid with Stone Roads |
| Better Jumping SE | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/18967) | |
| Bandolier – Bags and Pouches Classic | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/2417) | Borse visibili sul personaggio |
| More Informative Console | **Staff only** | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/19250) | Debug in-game — solo staff/dev |

---

## Visual (modlist Player + Staff)

| Mod | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|
| Obsidian Weathers and Seasons | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/12125) | |
| Luminosity Lighting Overhaul | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/16830) | Usare insieme a Relighting Skyrim |
| Relighting Skyrim SE | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/8586) | |
| Blended Roads | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/8834) | Caricare dopo Skyland AIO |
| Skyland AIO | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/34179) | Base texture overhaul |
| Enhanced Vanilla Trees SE | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/11008) | |
| Skyland Night Sky | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/18022) | |

---

## Audio & Ambience (modlist Player + Staff)

| Mod | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|
| FSS – Better Bards | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus LE](https://www.nexusmods.com/skyrim/mods/6496) | ⚠️ Verificare port SSE compatibile |
| The Northerner Diaries – Immersive Edition | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/28108) | |
| Celtic Music in Skyrim SE | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/2179) | |

---

## Gameplay (modlist Player + Staff)

| Mod | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|
| Alternate Start – Live Another Life | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/272) | Obbligatoria — tutti devono scegliere la stessa origine |
| Attack Speed Framework | Player + Staff | ⬜ Non installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/45541) | Framework tecnico |
| Simple Dual Sheath | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/50049) | Spade sul retro/fianco — estetica RP |
| Inconvenient Dungeons | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/66784) | Rimuove uscite secondarie facili, boss potenziati |
| Experience Quests Tweak | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/73095) | Tweak per bilanciamento XP da quest — companion del mod Experience |

---

## Personaggio (modlist Player + Staff)

| Mod | Profilo | Install | Stato STR | Link | Note |
|---|---|---|---|---|---|
| RaceMenu SE | Player + Staff | 📥 Installata | ⚠️ Da testare | [Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/19080) | Richiede SKSE — essenziale per identità visiva RP |

---

## Mod gameplay candidate (da valutare per inclusione)

| Mod | Profilo | Stato STR | Decisione | Note |
|---|---|---|---|---|
| Skyrim Unbound Reborn | Player + Staff | ⚠️ Da testare | 📌 Da decidere | Disabilita main quest e Dovahkiin. Nel profilo attivo oggi c'è **Alternate Start – LAL** al suo posto: scelta tra le due ancora da registrare (STEP_0 P6, D-018) |
| STR Script Patch Hub | Player + Staff | ⚠️ Da testare | 📌 Da integrare (prima di perk overhaul) | [Nexus #84335](https://www.nexusmods.com/skyrimspecialedition/mods/84335) — obbligatorio con Adamant/Mysticism |
| Static Skill Leveling Rewritten | — | — | 🚫 Esclusa | Troppe dipendenze, da rivalutare in futuro |
| Trade and Barter | — | — | 🚫 Esclusa | Senza NPC mercanti non ha senso (D-004) |
| Skyrim Reputation | — | — | 🚫 Esclusa | Da reinterpretare nel framework RP custom (D-005) |

---

## Mod custom (sviluppate dal team)

| Mod | Versione | Profilo | Status | Cartella |
|---|---|---|---|---|
| RPServer_EmptyWorld | v0.5.0 (sorgenti committati, .esp v0.5 non ancora generato — solo ACHR, vedi D-018) | Player + Staff | 🛠️ In sviluppo | `custom_mods/RPServer_EmptyWorld/` |
| RPServer_StaffTools | v1.0.0 (sorgenti pronti, .esp da generare in CK) | **Staff only** | 🛠️ In sviluppo | `custom_mods/RPServer_StaffTools/` |

---

## Load order (sintesi)

> Sarà definito formalmente in `configs/load_order.txt` quando l'ambiente sarà installato.

1. Master vanilla (`Skyrim.esm`, `Update.esm`, DLC)
2. USSEP
3. SSE Engine Fixes (parte plugin)
4. Skyrim Project Optimization SE (ESM/ESL)
5. Skyrim Together Reborn (e suoi master)
6. Mod tecniche / librerie
7. Fix vanilla
8. Mod gameplay (Alternate Start, Inconvenient Dungeons, ecc.)
9. Mod custom server (EmptyWorld, future mod RP)
10. (Solo Staff) StaffTools + tool di sviluppo
11. Patch di compatibilità

---

## Note sulla compatibilità con STR

Skyrim Together Reborn ha sincronizzazione **parziale**. Conseguenze pratiche:

- Mod che modificano AI degli NPC: spesso non sincronizzate. Per noi meno rilevante (niente NPC).
- Mod che toccano skill/perk: sync imperfetto. Va testato caso per caso.
- Mod con UI custom (menu, HUD): non sincronizzate, ogni player ha la sua. Va bene.
- Mod che spawnano oggetti nel mondo via script: ogni player vede oggetti suoi. **Attenzione** se vogliamo oggetti condivisi.

Per ogni nuova mod: **due dev devono testarla in STR insieme** prima di metterla in modlist Player.
