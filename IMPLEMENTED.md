# CHANGELOG — Cosa è stato implementato

> **Cosa contiene:** registro cronologico di tutto ciò che è stato concretamente fatto sul progetto (mod create, test eseguiti, milestone raggiunte).
>
> **A cosa serve:** è la "memoria" del progetto. Quando Claude inizia una nuova sessione, lo legge per sapere a che punto siamo. Quando un membro del team rientra dopo settimane, qui trova lo stato attuale.
>
> **Differenza con `DECISIONS.md`:** lì stanno le decisioni ("**cosa** abbiamo scelto"); qui stanno le azioni ("cosa abbiamo **fatto**").

---

## Convenzioni

- Le voci sono in ordine **cronologico inverso** (più recente in alto)
- Ogni voce ha: data, tag (`[setup]`, `[mod]`, `[test]`, `[doc]`, `[decision]`, `[release]`), descrizione
- Quando una mod raggiunge una release stabile, si scrive `[release] NomeMod vX.Y.Z`
- Bug noti e edge case si annotano in una sezione "Pending" sotto

---

## 2026-09-27
- `[setup]` Creato `comms/`: messaggio settimanale del team + promemoria della riunione. Discord in automatico via GitHub Actions (`.github/workflows/discord_*.yml`, webhook nel secret `DISCORD_WEBHOOK_URL`), WhatsApp con un clic tramite link `wa.me`. Promemoria alle 12:00 (ora italiana) del giorno prima. Testato in locale con un webhook finto.
- `[doc]` T-003 ridotta all'essenziale (struttura di base SkyMP, collegamento, aggancio dei nostri `.esp`). T-002 Giacomo: ricognizione su Keizaal o Mereth al posto dell'aggiornamento del PC (in sospeso).


- `[doc]` Pulizia della documentazione. Voci da 2026-05-21 a 2026-09-25 ricostruite a posteriori dallo storico dei commit.
  - `DECISIONS.md`: il secondo "D-004" (versione SSE) spostato nello slot riservato **D-009**. Aggiornati i riferimenti in `DEV_SETUP.md` e `MODLIST.md`.
  - `DECISIONS.md`: registrata a posteriori la **D-018** (scope EmptyWorld v0.5 ridotto ai soli ACHR).
  - `MODS.md` assorbito in `MODLIST.md` come sezione *Profilo attivo `RPServer-Dev`* e poi rimosso. Chiarita la legenda 📥 (= scaricata, non per forza abilitata).
  - `STEP_0.md`: spuntate P1 e P2, P5 aggiornata alla v0.5, **P6 riaperta**.
  - Rimossa la copia duplicata di `fahdon_modlist_analisi.md` in `docs_for_players/`. Resta solo quella in root.
  - `.DS_Store` aggiunto a `.gitignore` e rimosso dall'indice.

- `[decision]` Aperta la **Priorità 0 "Decisione piattaforma STR vs SkyMP"** in `STEP_0.md`. Motivo: non ci sono prove pubbliche di STR usato stabilmente oltre 8 giocatori, mentre i server RP con premesse uguali alle nostre (Keizaal Online, Mereth Roleplay) usano SkyMP. Creati `specs/platform/` (piano di studio, template dello spike e della ricognizione) e `TASKS.md` (task settimanali).

---

## 2026-09-25

- `[doc]` `ROADMAP.md`: aggiunto lo **Step 7 — Hardening infrastruttura VPS** (Netbird + `ufw` limitato all'interfaccia `wt0`). Per ora solo un appunto, non pianificato.

---

## 2026-07-12

- `[doc]` `MODLIST.md`: **Survival Mode (CC) dichiarato non funzionante su STR**. STR blocca wait/sleep, ma in Survival il sonno è obbligatorio per smaltire l'exhaustion e salire di livello. Fame e freddo funzionerebbero. In futuro potrebbe servire una patch nostra.

## 2026-07-08

- `[doc]` Creata `specs/systems/mapping_system.md` v0.1.0 (bozza): studio di design del sistema di mapping. Contiene la constatazione chiave che **STR non ha scripting server-side**, quindi lo stato condiviso deve vivere in un backend esterno.

## 2026-07-07

- `[doc]` `docs_for_players/`: aggiunte due guide di setup STR per i giocatori, "Guida super stringata" e "Guida leggermente più approfondita".

---

## 2026-06-25

- `[mod]` Creata `RPServer_StaffTools` v1.0.0 (Staff only): menu MCM con noclip, velocità, teletrasporto, spawn di armi/libri/oggetti/creature, despawn e chat RP `/me` `/do` `/status`. Sorgente `RPServer_StaffTools_MCM.psc` + `MANIFEST.md` + `docs/SPEC.md`. **ESP ancora da generare** in CK.
- `[doc]` Aggiunta `fahdon_modlist_analisi.md`: analisi della modlist Fahdon come fonte di mod candidate.
- `[setup]` `MODLIST.md` ri-sincronizzata con la cartella `mods\` di MO2 (nuove mod scaricate: powerofthree's Tweaks e Papyrus Extender, Display Tweaks, SPID, fix vanilla, Simple Dual Sheath, Inconvenient Dungeons…). Open Cities segnata ❌ incompatibile con STR.

## 2026-06-24

- `[setup]` Documentato il profilo MO2 attivo `RPServer-Dev` (17 mod) nell'ex `MODS.md`, ora sezione di `MODLIST.md`.

## 2026-06-23

- `[setup]` `client_pack/Launcher/`: launcher `launch_skyrimrp.bat` v1.0 + `config.ini` (IP/porta del server STR, percorso MO2, profilo). Pre-configura STR e avvia Skyrim via MO2.

## 2026-06-22

- `[doc]` `docs_for_players/`: create FAQ, TROUBLESHOOTING, INSTALL_GUIDE, FIRST_LOGIN, SERVER_RULES, RP_GUIDE, CONTACTS. README aggiornato con la regola "aggiorna i docs per i giocatori a fine sessione".

## 2026-06-21

- `[mod]` `RPServer_EmptyWorld` **v0.5.0**: scope ridotto ai soli ACHR. Tolti `DisableQuests.pas` e la Fase 2 Papyrus, quindi niente più dipendenze runtime. Aggiornati PROCEDURA_BUILD, CHECKLIST e MANIFEST. Vedi D-018.

## 2026-06-15

- `[setup]` Together Reborn non funzionava più: reinstallazione delle mod collegate. Durante la pulizia è stata rimossa dal repo una copia di SKSE committata per errore (`skse64_2_02_06 - Copia/`).
- `[decision]` Versione SSE fissata a **1.6.1170**, SKSE **2.2.6** (oggi D-009). Aggiornato `DEV_SETUP.md`.

---

## 2026-05-23

- `[mod]` `RPServer_EmptyWorld`: aggiunto lo script `RPServer_EmptyWorld_PopulateQuestList.pas`, che popola la FormList delle quest da fermare. Aggiornata PROCEDURA_BUILD. *(Poi uscito dallo scope con la v0.5.)*

## 2026-05-21

- `[test]` **Prima build reale dell'`.esp` di EmptyWorld (v0.3)** sul fisso Windows: disabilitati solo ~2500 ACHR sui ~8500-9000 attesi. Causa: mancava la gestione degli ACHR piazzati tramite `LVLN`.
- `[mod]` `RPServer_EmptyWorld` **v0.4.0**: `DisableNPCs.pas` risolve ricorsivamente i `LVLN` e i template *Use Traits*. Fix dei master mancanti (`AddMasterIfMissing` + `SortMasters`). Vedi D-017.
- `[setup]` Primo merge Mac↔Windows risolto (modify/delete sugli script Pascal): workflow di sync verificato.

---

## 2026-05-18

- `[setup]` Installato e abilitato nel profilo MO2 `Admin` sul fisso del dev lo stack tecnico minimo della modlist: `Address Library for SKSE Plugins`, `Skyrim Together Reborn`, `Crash Logger SSE AE VR — PDB support`, `EngineFixes`, `Unofficial Skyrim Special Edition Patch (USSEP)`, `ConsoleUtilSSE NG`, `PapyrusUtil SE — Modders Scripting Utility Functions`, `SKSE64 Script`, `Open Cities Skyrim — Patches`. Confermati come presenti i tre DLC (HearthFires, Dragonborn, Dawnguard) e i Creation Club AE (`ccQDRSSE001-SurvivalMode`, `ccBGSSSE037-Curios`, `ccBGSSSE025-AdvDSGS`, `ccBGSSSE001-Fish`, `_ResourcePack`). Versioni esatte ancora da pinnare. Aggiornato `MODLIST.md` con nuova colonna *Install*, nuova sezione *Base game / DLC / Creation Club*, e flag 📥 sulle righe corrispondenti.

- `[doc]` `MODLIST.md`: aggiunta riga **Open Cities Skyrim — Patches** con flag ⚠️ "Da chiarire": le patches richiedono la mod base **Open Cities Skyrim** che **non è in modlist**. Va deciso se includere Open Cities (potenziali implicazioni STR sul worldspace condiviso) oppure rimuovere le patches dal profilo. Registrare la decisione in `DECISIONS.md` quando presa.

- `[doc]` `MODLIST.md`: chiuso il todo "ConsoleUtilSSE solo Staff" lato documentale, ma evidenziato che **oggi è abilitato nel profilo del dev (Admin)** — quando si genererà il pack Wabbajack Player andrà rimosso dal profilo Player.

---

## 2026-05-12

- `[mod]` `RPServer_EmptyWorld` bump a **v0.3.0**: aggiunte 19 race di mob dungeon a `RacesToDisable` — DraugrRace, DraugrSkeletonRace, SkeletonRace, DragonPriestRace, FalmerRace, DwarvenSpiderRace, DwarvenSphereRace, DwarvenCenturionRace, DwarvenBallistaRace, WispRace, WispmotherRace, FrostAtronachRace, FlameAtronachRace, StormAtronachRace, DLC2LurkerRace, DLC2SeekerRace, DLC2RieklingRace, DLC2RieklingChiefRace, DLC2AshSpawnRace, DLC1DeathHoundRace, DLC1GargoyleRace, DLC1ChaurusReaperRace, ChaurusReaperRace. Tutti i mob dei dungeon ora vengono *Initially Disabled*. Nel mondo restano: animali domestici + fauna pacifica + predatori selvatici naturali (lupi/orsi/sabrecat/troll/mammut/giganti/skeever/spider/hagraven) + fauna esotica (spriggan/horker/slaughterfish/chaurus base/ash hopper). Aggiornati WHITELIST, MANIFEST, CHECKLIST (test A11-A14, B7/B7b, B18-B26) di conseguenza.

- `[decision]` Aggiunta D-016 in `DECISIONS.md`: tutti i mob dei dungeon disabilitati. La nuova decisione supera D-010 sulla parte "mob dungeon mantenuti". Coerente con la richiesta del fondatore "togliere tutti i tipi di nemici, restano solo gli animali" (animali interpretati come categoria ampia: domestici + fauna pacifica + predatori naturali + fauna esotica).

- `[mod]` `RPServer_EmptyWorld` bump a **v0.2.0**: aggiunta `DragonRace` alla lista `RacesToDisable` dello script Pascal `DisableNPCs.pas`. Tutti i draghi vanilla (Alduin, Paarthurnax, Odahviing, Sahloknir, draghi su Word Walls e dragon mound, draghi del DLC Dragonborn) ora vengono *Initially Disabled*. I Dragon Priest restano attivi (sono `DragonPriestRace`, mob dungeon antropomorfi). Aggiornati MANIFEST, WHITELIST, CHECKLIST (test B15/B16/B18) di conseguenza.

- `[decision]` Aggiunta D-015 in `DECISIONS.md`: i draghi vengono disabilitati. La nuova decisione supera D-010 (whitelist con draghi mantenuti) e il conseguente di D-011 (drago senza anima) sui draghi, secondo la convenzione "le decisioni non si modificano, si superano".

- `[mod]` Creata la prima mod custom `RPServer_EmptyWorld` (v0.1.0 draft, .esp non ancora generato). Sorgenti committati in `custom_mods/RPServer_EmptyWorld/`:
  - `MANIFEST.md`
  - `source/RPServer_EmptyWorld_DisableNPCs.pas` (Pascal per xEdit, disabilita ACHR umanoidi)
  - `source/RPServer_EmptyWorld_DisableQuests.pas` (Pascal per xEdit, disabilita ~150-200 quest narrative)
  - `source/RPServer_EmptyWorldInit.psc` (Papyrus quest fallback runtime)
  - `source/RPServer_EmptyWorldPlayerAlias.psc` (Papyrus alias OnPlayerLoadGame)
  - `docs/PROCEDURA_BUILD.md` (guida operativa per il fisso Windows)
  - `docs/WHITELIST.md` (whitelist tecnica completa)
  - `tests/CHECKLIST.md` (test A statici + B singleplayer + C STR)

  La mod copre congiuntamente le priorità P5 e P6 dello `STEP_0.md` (vedi D-012). Build prevista sul fisso Windows quando l'ambiente dev sarà installato (`STEP_0.md` Priorità 4).

- `[decision]` Aggiornato `DECISIONS.md`:
  - D-010 chiusa: whitelist NoNPCs definita (tabula rasa lato umanoidi, fauna/creature/dungeon mob/draghi mantenuti, carrettieri esplicitamente esclusi).
  - D-011 nuova: livello di disattivazione del sistema Dragonborn = completa (opzione B).
  - D-012 nuova: unificazione `RPServer_NoNPCs` + disabilitazione quest in un'unica mod `RPServer_EmptyWorld`.
  - Le precedenti D-011 e D-012 placeholder (città RP e composizione dev) rinumerate a D-013 e D-014.

- `[doc]` Creato lo scheletro iniziale del repository: `README.md`, `VISION.md`, `STEP_0.md`, `DEV_SETUP.md`, `MODLIST.md`, `DECISIONS.md`, `IMPLEMENTED.md`, `ROADMAP.md`, `MANIFEST_TEMPLATE.md`. Create le cartelle `custom_mods/`, `configs/`, `specs/`, `client_pack/`, `docs_for_players/` con il loro README di indice. Contenuto basato sul documento di visione fornito dal fondatore e sulle conversazioni di progettazione del workflow.

- `[setup]` Repository GitHub `SkyrimRPServer` creato, privato. Clonato sul Mac in `/Users/david/SkyrimRPServer`. Cowork connesso alla cartella.

- `[decision]` Registrate in `DECISIONS.md` le prime 8 decisioni di design (D-001 → D-008) relative a workflow, architettura documentale, distribuzione, esclusioni di mod, versionamento, lingua.

---

## Pending / In attesa

Cose già iniziate o programmate ma non concluse:

*(aggiornato 2026-09-27)*

- 🛠️ Build dell'`.esp` **v0.5** di `RPServer_EmptyWorld` sul fisso Windows, secondo `custom_mods/RPServer_EmptyWorld/docs/PROCEDURA_BUILD.md`
- ⏳ Test A/B/C di `RPServer_EmptyWorld` (statico, singleplayer, STR con 2 dev per almeno 1 ora)
- 🛠️ Generazione dell'ESP di `RPServer_StaffTools` in CK
- ⏳ Decisioni del fondatore ancora aperte: città RP (D-013), composizione del team dev (D-014), alternate start LAL vs Unbound + quest vanilla (STEP_0 P6, D-018)
- ⏳ Verifica di solidità di STR (limite di giocatori, precedenti di server RP): ricerca in corso
- ⏳ Pulizia del profilo MO2: rimuovere *Wait Your Turn* (mod AI NPC) e verificare *VR Address Library* (probabilmente installata per errore)
- 🛠️ Restructure di Discord nelle 5 categorie pianificate *(stato da verificare)*
- ✅ ~~Setup di GitHub Desktop sul fisso Windows~~: fatto (merge del 2026-05-21)
- ✅ ~~Versione SSE~~: fissata (D-009)

---

## Milestone future (placeholder)

Sezioni che verranno popolate quando raggiunte:

### Step 0 completato
*(non ancora raggiunto)*

### Prima sessione di gioco multiplayer del team
*(non ancora raggiunto)*

### Prima release Wabbajack distribuita ai giocatori
*(non ancora raggiunto)*
