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

- 🛠️ Setup di GitHub Desktop sul fisso Windows (Sessione 5 del piano operativo)
- ⏳ Risposta del fondatore alle 5 domande bloccanti (versione SSE, test STR, città RP, whitelist NoNPCs, composizione dev team)
- 🛠️ Restructure di Discord nelle 5 categorie pianificate
- 🛠️ Installazione stack tecnico sul fisso Windows
- 🛠️ Build dell'`.esp` di `RPServer_EmptyWorld` sul fisso Windows (sorgenti già committati, manca la generazione del plugin in CK + SSEEdit secondo `custom_mods/RPServer_EmptyWorld/docs/PROCEDURA_BUILD.md`)
- ⏳ Test A/B/C della mod `RPServer_EmptyWorld` (statico, singleplayer, STR 2 dev)

---

## Milestone future (placeholder)

Sezioni che verranno popolate quando raggiunte:

### Step 0 completato
*(non ancora raggiunto)*

### Prima sessione di gioco multiplayer del team
*(non ancora raggiunto)*

### Prima release Wabbajack distribuita ai giocatori
*(non ancora raggiunto)*
