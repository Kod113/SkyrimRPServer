# LOG DECISIONALE

> **Cosa contiene:** ogni decisione di design o tecnica importante presa nel corso del progetto, con motivazione.
>
> **A cosa serve:** quando tra sei mesi qualcuno (incluso io stesso, o Claude in una nuova sessione) si chiede "perché abbiamo fatto così?", la risposta è qui. Evita che decisioni già discusse vengano riaperte per dimenticanza.
>
> **Formato:** ogni decisione ha numero progressivo, data, titolo, contesto, decisione, motivazione, conseguenze. **Le decisioni non si modificano mai**: se cambiamo idea, si aggiunge una nuova decisione che supera la precedente, citandola.

---

## D-001 — Uso di Git + GitHub come sistema di versionamento

**Data:** 2026-05-12
**Contesto:** Servono un sistema per gestire il codice di mod, la documentazione, la collaborazione tra Mac e fisso Windows del lead dev, ed eventualmente con altri membri del team.
**Decisione:** Si adotta Git con repository ospitato su GitHub (privato). GUI: GitHub Desktop su entrambe le macchine.
**Motivazione:** Standard de facto per qualsiasi progetto software/modding moderno. Risolve sync, versioning, storico, e collaborazione in un solo sistema. iCloud/Dropbox/OneDrive sono inadatti perché interferiscono con la cartella `.git`.
**Conseguenze:** la cartella di lavoro **non** può stare in iCloud, Documents, Desktop (su Mac) né in OneDrive, Documents, Desktop (su Windows). Va in `/Users/david/SkyrimRPServer` e `C:\SkyrimRPServer` rispettivamente.

---

## D-002 — Architettura della documentazione a tre livelli

**Data:** 2026-05-12
**Contesto:** Il progetto ha tre tipi di contenuto: codice tecnico, conoscenza per i giocatori, comunicazione viva. Vanno separati nei tool giusti.
**Decisione:**
- **GitHub** = cantiere tecnico (codice, mod, configs, documentazione di sviluppo, specifiche per i dev)
- **Discord** = comunicazione viva + knowledge base user-facing (lore, regole, proposte, supporto, voce)
- **Specifiche tecniche di razze/spell/poteri** = file markdown nella cartella `specs/` di questo repo, linkate dai thread Discord
**Motivazione:** Notion sarebbe una quarta opzione ma rischia di non essere adottata dalla community. Discord ben strutturato (con Forum channels e permessi) regge bene il ruolo di knowledge base per i giocatori. Il problema principale (Claude non può leggere Discord) è risolto tenendo le specifiche tecniche su GitHub.
**Conseguenze:** ogni razza/spell/potere avrà due rappresentazioni: una **narrativa** su Discord (per i giocatori) e una **strutturata** in `specs/` (per i dev e per Claude). Le due devono restare allineate; la verità tecnica vince in caso di conflitto.

---

## D-003 — Distribuzione modlist tramite Wabbajack (futuro)

**Data:** 2026-05-12
**Contesto:** Skyrim Together Reborn richiede modlist identiche tra tutti i player. Distribuire decine di mod a 10+ player manualmente è ingestibile e genera errori di installazione.
**Decisione:** Quando la modlist sarà stabile, si genererà un pacchetto **Wabbajack** distribuito tramite GitHub Releases.
**Motivazione:** Wabbajack è lo standard de facto per condividere modlist Skyrim. Rispetta le licenze (non ridistribuisce mod terze, scarica da Nexus), garantisce installazioni identiche, gestisce automaticamente aggiornamenti.
**Conseguenze:** ogni giocatore avrà bisogno di un account Nexus (Premium consigliato per download automatici). Lo Step 0 **non richiede** ancora Wabbajack: lo si introdurrà quando il team avrà una modlist stabile e funzionante.

---

## D-004 — Versione di Skyrim SE fissata a 1.6.1170

**Data:** 2026-06-15
**Contesto:** Together Reborn non era più funzionante; in fase di reinstallazione delle mod collegate è emersa la necessità di fissare ufficialmente la versione del gioco su cui lavora il team.
**Decisione:** La versione di Skyrim Special Edition di riferimento è `1.6.1170`. La build SKSE64 corrispondente è la **2.2.6**.
**Motivazione:** Versione confermata dal dev lead sulla propria installazione. Fissarla evita che aggiornamenti automatici di Steam rompano la compatibilità con SKSE e le mod.
**Conseguenze:** Tutti i dev devono disabilitare gli aggiornamenti automatici di Skyrim su Steam. Le mod installate devono essere compatibili con SSE 1.6.1170. Ogni cambio di versione richiede una nuova decisione che supera questa.

---

## D-004 — Esclusione di "Trade and Barter" dallo Step 0

**Data:** 2026-05-12
**Contesto:** "Trade and Barter" modifica prezzi e logica di compravendita dei mercanti NPC vanilla. La mod NoNPCs rimuoverà tutti i mercanti NPC.
**Decisione:** "Trade and Barter" è **esclusa** dalla modlist Step 0.
**Motivazione:** Senza NPC mercanti, la mod non ha effetto utile. Mantenerla aggiungerebbe complessità senza vantaggi. Verrà rivalutata nella fase di progettazione del sistema economico player-driven.
**Conseguenze:** quando progetteremo l'economia (Step 1 o 2), valuteremo se Trade and Barter è utile per mercanti player-controlled o se serve una mod custom dedicata.

---

## D-005 — Esclusione di "Skyrim Reputation" dallo Step 0

**Data:** 2026-05-12
**Contesto:** "Skyrim Reputation" è un sistema di fama/reputazione basato su reazioni di NPC vanilla.
**Decisione:** "Skyrim Reputation" è **esclusa** dalla modlist Step 0.
**Motivazione:** Stesso problema di Trade and Barter: senza NPC perde quasi tutto il senso. Inoltre il concetto di "reputazione tra player" è meccanicamente diverso da "reputazione verso NPC" e richiede un sistema su misura.
**Conseguenze:** quando faremo il sistema reputazione (Step successivi), partiremo da zero con un framework Papyrus custom, non da Skyrim Reputation.

---

## D-006 — Due modlist parallele: Player vs Staff

**Data:** 2026-05-12
**Contesto:** Alcuni tool sono indispensabili per worldbuilding e moderazione (es. Jaxonz Positioner per spostare oggetti, ConsoleUtilSSE per comandi avanzati) ma sarebbero pericolosi nelle mani di player normali (desync, abusi, oggetti spostati a caso nel mondo).
**Decisione:** Manteniamo **due modlist**:
- **Modlist Player** — distribuita a tutti via Wabbajack
- **Modlist Staff** — Player + tool di sviluppo/moderazione, distribuita solo allo staff
**Motivazione:** separazione netta di privilegi tecnici, riduce rischio abusi/errori, mantiene pulita l'esperienza dei giocatori.
**Conseguenze:** ogni nuova mod va categorizzata in `MODLIST.md` con la colonna "Profilo": Player, Staff, o entrambi. Wabbajack genererà due pacchetti distinti.

---

## D-007 — Versionamento delle mod custom

**Data:** 2026-05-12
**Contesto:** Servono regole chiare per numerare le versioni delle mod custom man mano che evolvono.
**Decisione:** Schema **Semantic Versioning** `vMAJOR.MINOR.PATCH`:
- **MAJOR** = breaking change (es. cambio struttura dati salvati, salvataggi vecchi rotti)
- **MINOR** = nuova funzionalità retrocompatibile
- **PATCH** = bugfix o aggiustamenti minori
**Motivazione:** standard universale, immediato da capire per chiunque abbia mai sviluppato software. Permette ai giocatori di sapere se un aggiornamento è "safe" (patch/minor) o richiede attenzione (major).
**Conseguenze:** ogni release su GitHub avrà un tag tipo `v1.0.0`; il `MANIFEST.md` di ogni mod riporterà la versione corrente.

---

## D-008 — Lingua del progetto

**Data:** 2026-05-12
**Contesto:** Il team è italofono.
**Decisione:** Tutta la documentazione interna (`README`, `VISION`, `DECISIONS`, `MODLIST`, `IMPLEMENTED`, ecc.) è in **italiano**. I nomi tecnici (FormID, edid, nomi di funzioni Papyrus) restano in inglese. I commit message sono in italiano.
**Motivazione:** la documentazione deve essere immediatamente leggibile da tutto il team; lingua tecnica nei nomi standard per mantenere coerenza con strumenti e community esterna.
**Conseguenze:** i commenti nel codice possono essere in italiano o inglese a discrezione, scegliendo quello che rende più chiaro.

---

## D-009 — Versione di Skyrim Special Edition fissata

**Status:** in attesa.
Da decidere insieme al fondatore, confrontando con la versione supportata da STR oggi. Aggiornare `DEV_SETUP.md` quando fissata.

---

## D-010 — Whitelist mod EmptyWorld v0.1.0

**Data:** 2026-05-12
**Contesto:** La mod custom RPServer_EmptyWorld (vedi D-012) deve svuotare il mondo di NPC umanoidi vanilla mantenendo l'ecosistema "vivo". Serve definire esattamente cosa resta e cosa sparisce.
**Decisione:** Whitelist v0.1.0 **minima e tabula-rasa lato umanoidi**:
- **Disabilitati (Initially Disabled):** tutti gli NPC umanoidi vanilla — cittadini, mercanti, fabbri, guardie, soldati Civil War, banditi umanoidi, vampiri narrativi (Volkihar etc.), Skaal, Afflicted, **carrettieri (carriage drivers)**, quest giver di ogni gilda.
- **Mantenuti attivi:** tutti gli animali (cavalli, muli, cani, polli, mucche, capre, gatti, fauna selvatica come cervi/alci/volpi/conigli/cinghiali), tutti i predatori selvatici (lupi, orsi, sabrecat, troll, mammut, giganti, skeever, spider, spriggan, slaughterfish, horker, hagraven), tutti i mob dei dungeon (draughi, scheletri, falmer, chaurus, automi dwemer, spettri/wisp, dragon priest, atronachi, lurker/seeker, riekling, ash spawn, death hound, gargoyle), draghi (per riuso da parte dei DM).
- **Filtro tecnico:** un reference `ACHR` viene disabilitato se e solo se la sua base `NPC_` ha `RNAM` (Race) il cui EditorID è in `HumanoidRaces` (lista esplicita in `source/RPServer_EmptyWorld_DisableNPCs.pas`).
**Motivazione:** vision del progetto = mondo come sandbox sociale ricostruito dai player. Ogni NPC umanoide vanilla è un "ruolo già occupato" che impedisce a un player di calarsi in quel ruolo. Gli animali e le creature, invece, non occupano ruoli sociali e contribuiscono all'ecosistema di sopravvivenza/esplorazione che vogliamo preservare. I draghi restano come "asset DM" per eventi futuri. I carrettieri sono esplicitamente esclusi perché il sistema di fast-travel a pagamento è incompatibile con la nostra idea di mondo a misura di RP.
**Conseguenze:** la whitelist è ora chiusa per v0.1.0. Eventuali eccezioni (es. "vogliamo che il mercante X di Whiterun resti attivo") verranno aggiunte come nuove decisioni quando il team RP avrà ragionato sui ruoli iniziali. Vedi `custom_mods/RPServer_EmptyWorld/docs/WHITELIST.md` per il riferimento tecnico operativo.

---

## D-011 — Livello di disattivazione del sistema Dragonborn

**Data:** 2026-05-12
**Contesto:** Il "sistema Dragonborn" in Skyrim è una catena di sistemi intrecciati: intro Helgen forzata, Main Quest chain, Word Walls funzionanti, assorbimento anime di drago, Shout system, Greybeards, attacchi di draghi random, Civil War, gilde, daedric quests, DLC Dawnguard + Dragonborn forzati. Era da decidere quanto in profondità tagliare.
**Decisione:** Disattivazione **completa** (opzione B):
- Intro Helgen e MQ chain disabilitate (`MQ101` → `MQ306`).
- Word Walls esistono ancora come prop ma non insegnano più Words.
- Draghi restano vivi come creature, **ma non droppano anime** e l'assorbimento non sblocca Shout.
- Civil War disattivata (`CW00` → `CW04`, `CWMission*`).
- Compagni, Collegio di Winterhold, Confraternita Oscura, Ladri, Bardi: disattivati (`C0*`, `MG*`, `TG*`, `DB*`).
- Daedric quests disattivate (`DA01`–`DA16`).
- DLC Dawnguard: intro vampiri/hunters forzata disattivata, ambush vampiri disattivati.
- DLC Dragonborn: attacco cultisti disattivato, MQ Solstheim disattivata.
- Misc story (`MS01`–`MS14`) disattivate.
- Random encounter humanoid spawn (`WICourier`, `WIChangeLocation*`) disattivati.
**Motivazione:** la `VISION.md` dice esplicitamente «Un sandbox RP persistente costruito sopra Skyrim», anti-obiettivo «Skyrim in coop». Lasciare anche solo "framework dormienti" (gilde attivabili manualmente, Word Walls funzionanti) significherebbe accettare che la narrativa vanilla **possa** in futuro intralciare quella del team RP. L'opzione "completa" garantisce tabula rasa vera: ogni elemento di lore custom verrà aggiunto sopra un canvas pulito, senza il rischio che qualcuno scopra per sbaglio Word Walls o sblocchi quest gilda parlando con un NPC che il team ha aggiunto.
**Conseguenze:** se in futuro il team RP volesse reintrodurre meccaniche tipo "Shout via runa antica", andrà fatto da zero con una mod dedicata, non riattivando la pipeline vanilla. Questo è considerato un vantaggio: una mod custom dedicata è più controllabile e documentabile. Lista quest disabilitate completa in `custom_mods/RPServer_EmptyWorld/source/RPServer_EmptyWorld_DisableQuests.pas`.

---

## D-012 — Mod unica `RPServer_EmptyWorld` anziché tre mod separate

**Data:** 2026-05-12
**Contesto:** Lo `STEP_0.md` prevedeva due priorità distinte per il dev: P5 "Mod custom NoNPCs" + P6 "Disattivazione main quest e narrativa vanilla" (con Skyrim Unbound Reborn). Durante la progettazione operativa il fondatore ha richiesto di trasformare lo "svuotamento del mondo" in un'unica task: NPC + quest + sistema Dragonborn.
**Decisione:** Si genera **una sola mod custom**, chiamata `RPServer_EmptyWorld`, che copre congiuntamente:
- disabilitazione reference ACHR umanoidi (sostituisce `RPServer_NoNPCs`)
- disabilitazione quest narrative vanilla
- disabilitazione sistema Dragonborn (Word Walls, drop anime, attacchi draghi)
**Motivazione:** queste tre operazioni condividono lo stesso obiettivo ("svuotare Skyrim della sua narrativa") e gli stessi master vanilla come target. Tenerle in tre mod separate triplicherebbe MANIFEST, load order, scripting Pascal e Papyrus, senza guadagno reale: nessuno scenario realistico prevede di volere "solo NPC vuoti ma quest vanilla attive". L'unificazione semplifica la build, il versionamento e il troubleshooting. Coerente con l'istruzione di progetto "mantenere il sistema più semplice ed efficace possibile".
**Conseguenze:**
- La voce `RPServer_NoNPCs` in `MODLIST.md` e `custom_mods/README.md` viene rinominata `RPServer_EmptyWorld`.
- `STEP_0.md` P5 e P6 collassano de facto in un'unica milestone: `RPServer_EmptyWorld v1.0.0` rilasciata e testata. Skyrim Unbound Reborn resta nella modlist come ulteriore safety net + intro alternativo, ma EmptyWorld non ne dipende.
- Versionamento: la mod parte da `v0.1.0` (sorgenti committati, .esp non ancora generato) e tagga `v1.0.0` quando i tre blocchi di test (A static, B singleplayer, C STR) sono tutti ✅.

---

## D-015 — Draghi disabilitati (supera D-010 e D-011 sui draghi)

**Data:** 2026-05-12
**Contesto:** D-010 stabiliva che i draghi (`DragonRace`) restassero attivi nel mondo come "asset DM" per eventi futuri, mentre D-011 (Dragonborn opzione B) si limitava a togliere il drop delle anime e i Word Walls funzionanti. Successiva revisione del fondatore: anche i draghi vanno disattivati.
**Decisione:** La razza `DragonRace` viene aggiunta alla lista `RacesToDisable` dello script Pascal `DisableNPCs.pas`. Tutti i reference `ACHR` con base `NPC_` su `DragonRace` vengono flaggati *Initially Disabled* nel plugin `RPServer_EmptyWorld.esp`. Questo include:
- Alduin (boss MQ finale)
- Paarthurnax (Greybeard)
- Odahviing (drago di MQ302)
- Sahloknir (drago di MQ104)
- Tutti i draghi piazzati sui Word Walls e nelle dragon mound del mondo
- Tutti i draghi nominati del DLC Dragonborn (Sahrotaar, Relonikiv, Kruziikrel)

I **Dragon Priest** (`DragonPriestRace`) **non** rientrano in questa decisione: sono boss antropomorfi di dungeon, non draghi propriamente detti, e restano attivi come mob.
**Motivazione:** la presenza di draghi attivi nel mondo, anche se inerte (no anime, no Shout sblocco grazie a D-011), continua a evocare la narrativa vanilla "Dovahkiin contro draghi" che è esattamente ciò che la `VISION.md` vuole evitare. Inoltre, draghi che spawnano senza un sistema di gestione strutturato (storyteller già disabilitato) sono più un fastidio tecnico che un'opportunità di gameplay. Il team RP, se in futuro vorrà introdurre draghi come asset narrativo, li riattiverà selettivamente via console o tramite una nuova mod custom (`RPServer_DragonReturns` o simili) costruita sopra `EmptyWorld`. Questo è coerente con la filosofia "disabilitare, non eliminare": la `RACE` `DragonRace`, le `NPC_` di tutti i draghi e gli ACHR di Alduin/Paarthurnax restano nei master e nel plugin, solo silenziati.
**Conseguenze:**
- **Supera D-010** nella parte "draghi mantenuti come asset DM": ora i draghi sono nei disabilitati.
- **Supera D-011** nel suo conseguente: non c'è più bisogno di "il drago non dropperà anima" come comportamento osservabile (tanto il drago non spawnerà), ma le modifiche statiche alla MQ chain e al sistema Shout restano comunque utili come safety net.
- `MANIFEST.md` versione bump `v0.1.0` → `v0.2.0`.
- `WHITELIST.md` aggiornata: tabella draghi rimossa dai "Mantenuti", aggiunta riga nella sezione "Cosa viene disabilitato".
- `CHECKLIST.md` test B15 e B16 ribaltati: drago spawnato via console deve risultare *Initially Disabled* (non visibile/non ostile).
- Se il team in futuro vorrà reintrodurre draghi narrativi, dovrà creare una mod custom dedicata.

---

## D-016 — Mob dei dungeon disabilitati (supera D-010 sulla parte mob)

**Data:** 2026-05-12
**Contesto:** D-010 stabiliva che "tutti i mob dei dungeon (draughi, scheletri, falmer, chaurus, automi dwemer, spettri/wisp, dragon priest, atronachi, lurker/seeker, riekling, ash spawn, death hound, gargoyle)" restassero attivi come "ambiente vivo del mondo". Successiva revisione del fondatore: anche tutti i mob dei dungeon vanno disattivati. Resta nel mondo solo ciò che è classificabile come **animale** in senso ampio (domestico, fauna pacifica, predatore selvatico naturale, fauna esotica).
**Decisione:** Le seguenti race vengono aggiunte alla lista `RacesToDisable` dello script Pascal `DisableNPCs.pas`:
- Undead: `DraugrRace`, `DraugrSkeletonRace`, `SkeletonRace`, `DragonPriestRace`
- Falmer: `FalmerRace`
- Automi Dwemer: `DwarvenSpiderRace`, `DwarvenSphereRace`, `DwarvenCenturionRace`, `DwarvenBallistaRace`
- Spettri: `WispRace`, `WispmotherRace`
- Atronachi piazzati: `FrostAtronachRace`, `FlameAtronachRace`, `StormAtronachRace`
- DLC Dragonborn: `DLC2LurkerRace`, `DLC2SeekerRace`, `DLC2RieklingRace`, `DLC2RieklingChiefRace`, `DLC2AshSpawnRace`
- DLC Dawnguard: `DLC1DeathHoundRace`, `DLC1GargoyleRace`, `DLC1ChaurusReaperRace`, `ChaurusReaperRace`

Restano attivi (criterio "animale"):
- Animali domestici: cavalli, muli, cani, polli, mucche, capre, gatti
- Fauna pacifica selvatica: cervi, alci, volpi, conigli, cinghiali
- Predatori selvatici naturali: lupi, orsi, sabrecat, troll (incluso bull troll), mammut, giganti, skeever, frostbite spider, hagraven
- Fauna esotica: spriggan, horker, slaughterfish, **chaurus base** (non Reaper), **ash hopper** (non Ash Spawn)

**Motivazione:** la `VISION.md` parla di sandbox sociale dove ogni elemento del mondo deve essere ricostruito dal team RP. I mob dei dungeon vanilla portano con sé una intera grammatica di gameplay (esplorazione di tombe nordiche, raid dwemer, scontri con falmer) che è una forma di "narrativa implicita" altrettanto invadente di quella delle quest. Lasciarli attivi significava avere dungeon che "funzionavano" senza che il team RP li avesse approvati. Con D-016 i dungeon diventano gusci vuoti, pronti per essere ripopolati con mob custom e lore dedicata. La distinzione "animale = naturale = OK" vs "mob dungeon = costruito = NO" è netta e facilmente difendibile.
**Conseguenze:**
- **Supera D-010** nella parte "mob dei dungeon mantenuti".
- **Conferma D-015** sui draghi (la logica è la stessa, estesa).
- `MANIFEST.md` bump `v0.2.0` → `v0.3.0`.
- `WHITELIST.md` riorganizzata in due sezioni: animali (resta) vs disabilitati (umanoidi + draghi + mob dungeon).
- `CHECKLIST.md` test B7 (draughi in Bleak Falls Barrow), B18 (Dragon Priest) ribaltati: ora i dungeon devono risultare vuoti, mentre la fauna nei dintorni resta visibile.
- I dungeon vanilla diventano "shell" — il team RP, quando aggiungerà mob custom, lo farà come nuova mod che PlaceAtMe o tramite ESP di popolamento dedicato.
- **Atronachi evocati dal player**: l'evocazione resta funzionante (gli evocati sono spawnati a runtime, non sono ACHR statici). Solo gli atronachi piazzati come mob nei dungeon spariscono.

---

## D-017 — Disabilitazione anche degli ACHR piazzati via Leveled NPC (LVLN)

**Data:** 2026-05-21
**Contesto:** Durante la prima build reale dell'`.esp` di `RPServer_EmptyWorld`, lo script Pascal `DisableNPCs.pas` v0.3.0 ha disabilitato solo ~2500 ACHR sui ~8500-9000 attesi. Causa: lo script gestiva soltanto gli `ACHR` la cui base è un record `NPC_` diretto. In Skyrim la maggior parte dei mob dei dungeon e dei nemici (draughi, falmer, banditi, automi dwemer, scheletri) non è piazzata così, ma tramite reference a `LVLN` (Leveled NPC), che lo script ignorava — restavano attivi ~7000 attori che D-010/D-015/D-016 volevano spenti.
**Decisione:** Lo script `DisableNPCs.pas` viene riscritto (bump `v0.4.0`) per risolvere **ricorsivamente** anche le basi `LVLN`: segue le liste annidate e i template `NPC_` con flag *Use Traits* (`TPLT`) fino agli `NPC_` foglia, e ne controlla la razza. Inoltre, per un Leveled NPC che può generare un **mix** di animali e non-animali (lista mista): l'`ACHR` viene disabilitato se la base può generare **anche un solo** attore non-animale.
**Motivazione:** l'obiettivo "mondo vuoto" richiede che ogni punto di spawn potenzialmente capace di far comparire un nemico sia spento. Una lista mista lasciata attiva potrebbe far apparire un bandito dove il team RP non lo vuole. L'effetto collaterale (spegnere un punto di spawn che a volte avrebbe dato un animale) è minimo: in Skyrim le liste `LVLN` piazzate sono quasi sempre omogenee di categoria, e per un mondo "vuoto" l'errore va fatto pendere verso il più vuoto. Coerente con la filosofia "disabilitare, non eliminare": `LVLN`, `NPC_` e `RACE` restano intatti nei master, solo gli `ACHR` vengono silenziati.
**Conseguenze:**
- **Completa D-010, D-015 e D-016**: quelle decisioni stabilivano *quali* razze disabilitare; D-017 garantisce che vengano colpite anche quando raggiunte via `LVLN`, non solo via `NPC_` diretto. La whitelist razze non cambia.
- `MANIFEST.md` bump `v0.3.0` → `v0.4.0`.
- Lo script risolve sempre il *winning override* di basi, template e razze; usa una cache e un visited-set per performance e protezione dai cicli.
- Output diagnostico ampliato: contatori separati per disabilitati via `NPC_` e via `LVLN`.
- `DisableQuests.pas` non è interessato (opera su `QUST`, non su `ACHR`).

---

## Decisioni in attesa (placeholder)

Le seguenti decisioni sono **previste ma non ancora prese**. Verranno compilate quando il fondatore risponde alle domande bloccanti.

### D-013 — Prime città RP dello Step 0
**Status:** in attesa.
Proposta da discutere: Whiterun (centrale, grande) + Riverwood (intimo, di partenza). Da confermare con il fondatore.

### D-014 — Composizione reparto dev
**Status:** in attesa.
Solo lead dev (David) o anche altri? Gli altri sono programmatori o no? Impatta sulla scelta di tool collaborativi e sulla soglia tecnica della documentazione.
