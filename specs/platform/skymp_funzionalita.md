# SkyMP: cosa c'è già e cosa cambia per la nostra modlist

```
Tipo:     Studio (supporto alla decisione D-019)
Status:   Bozza da verificare nello spike
Scritto:  2026-09-30
Fonti:    repo skyrim-multiplayer/skymp, commit f926944 (2026-09-08), cartelle docs/, skymp5-client/, skymp5-server/, skymp5-front/
```

> **Come leggere questo documento.** È ricavato dalla **lettura della documentazione e del codice** di SkyMP, non da prove in gioco. Le voci segnate 🔬 vanno verificate nello spike (`skymp_spike.md`) prima di contarci.
>
> **Limite importante:** il `ROADMAP.md` di SkyMP è fermo a **giugno 2023**. Dove il codice dice cose più recenti, vale il codice.

---

## 1. In breve

1. **SkyMP è un server autoritativo, non un co-op.** Il server tiene lo stato del mondo (posizioni, inventari, contenitori, morte, valori vitali) e lo salva da solo su database. Tutto quello che il server non conosce, il client lo cancella o lo ignora.
2. **Il mondo parte già "vuoto".** Di default il server non carica nessun NPC (`npcEnabled: false`) e il client cancella gli attori locali che non vengono dal server. È più drastico di EmptyWorld: spariscono **anche gli animali**.
3. **Gli script Papyrus sul client sono bloccati.** Il client SkyMP chiama `blockPapyrusEvents(true)` all'avvio. Le mod che funzionano grazie a script Papyrus lato client (MCM di SkyUI, Alternate Start, i nostri StaffTools…) con ogni probabilità **non funzionano più**. La logica di gioco va scritta nel **gamemode** (JavaScript/TypeScript sul server) o nella **Papyrus VM del server**.
4. **Client e server devono avere gli stessi `.esp`/`.esm`, nello stesso ordine.** Il client confronta nome, dimensione e CRC32 di ogni plugin con il manifest del server; se non coincidono, rifiuta la connessione. Ogni plugin della modlist deve stare anche sul server.
5. **Le funzioni RP del server ufficiale non sono pubbliche.** Il gamemode del server ufficiale (`skymp5-gamemode`) è in un repo privato. Nel motore pubblico restano solo gli agganci ("SweetPie", "SweetTaffy") legati al loro `.esp`. **Le nostre regole RP le scriviamo noi.**

---

## 2. Cosa implementa SkyMP rispetto a Skyrim base

### 2.1 Sincronizzazione (dal ROADMAP 2023, aggiornato con il codice)

| Funzione | Stato in SkyMP | Note |
|---|---|---|
| Aspetto del personaggio | ✅ Fatto | Aspetto **vanilla** (razza, parti della testa, tinte, peso). Le morph di RaceMenu non risultano sincronizzate 🔬 |
| Salute, magicka, stamina | ✅ Fatto | Rigenerazione calcolata dal server (`CropRegeneration`) |
| Morte e respawn | ✅ Fatto | Il server gestisce la morte; le kill move e lo stagger sono disattivati |
| Inventario | ✅ Fatto | Salvato sul server. Anti-cheat sull'equipaggiamento (2026) |
| Craft alla forgia | ✅ Fatto | `CraftService` lato client e lato server |
| Movimento | 🟡 Parziale | Manca la compensazione del lag. C'è una validazione lato server (`MovementValidation`) |
| Animazioni | 🟡 Parziale | Alcune bloccate apposta |
| Danno in mischia | 🟡 Parziale | Formula vanilla semplificata (solo danno base + armatura). Formula sostituibile e configurabile (`damageMultFormulaSettings`). Attacchi ad area attivati ad aprile 2026 |
| Tiro con l'arco | 🟡 Parziale | `playerBowShotService` |
| Magia | 🟡 Parziale | Lancio di incantesimi sincronizzato (`magicSyncService`). Gli effetti magici "a durata" sono ancora da fare |
| Contenitori (bauli, barili) | 🟡 Parziale | Funzionano e sono persistenti. Si ripopolano dopo un tempo configurabile (`reloot`, di default 24 ore), che si può anche disattivare per tipo (`forbiddenReloot`) |
| Raccogliere e lasciare oggetti | 🟡 Parziale | Si può bloccare il drop di oggetti con una keyword |
| Equipaggiamento | 🟡 Parziale | |
| Script Papyrus lato server | 🟡 Parziale | C'è una Papyrus VM sul server con un sottoinsieme delle classi vanilla (Actor, ObjectReference, Faction, Game, Utility, Quest, Message…) e funzioni di condizione (`GetIsRace`, `WornHasKeyword`, `GetItemCount`…) |
| Comandi console | 🟡 Parziale | Riscritti lato server: `additem`, `equipitem`, `placeatme`, `disable`, `mp`. Di default solo per chi ha il permesso (`enableConsoleCommandsForAll` per i test) |
| Oggetti raccoglibili (piante, flora) | 🟡 Parziale | Attivazione della flora propagata al client (2026) |
| NPC | 🟡 Parziale | Disattivati di default. Si possono attivare per file e per interni/esterni (`npcSettings`). L'IA degli NPC in multiplayer è fragile |
| Alchimia, incantamento, affilatura | ❌ Da fare | |
| Scasso di serrature, borseggio | ❌ Da fare | |
| Skill e level up | ❌ Da fare | La crescita delle skill e l'esperienza sono **spente** sul client (`DisableSkillAdvanceService`) |
| Perk | ❌ Da fare | |
| Grida (shout) | ❌ Da fare | |
| Dialoghi e quest | ❌ Da fare | Non è una priorità per SkyMP |
| Meteo | ❌ Da fare | Ognuno vede il suo meteo |
| Attendere o dormire | ❌ Da fare | |
| Cavalli, draghi, licantropia, vampirismo | ❌ Da fare | |
| Marker di mappa scoperti | ❌ Da fare | Non vengono salvati sul server |
| Fisica degli oggetti, trascinare corpi | ❌ Da fare | |

### 2.2 Regole di gioco già attive nel client

Valgono per **qualsiasi** server SkyMP, a meno di modificare il client:

| Cosa fa | Dove |
|---|---|
| Blocca gli eventi Papyrus sul client | `blockPapyrusEventsService` |
| Mette il gioco in modalità "creazione personaggio" permanente (niente salvataggi manuali, niente menu di sistema che rompono il multiplayer) | `enforceLimitationsService` |
| Disattiva il viaggio rapido | `disableFastTravelService` |
| Spegne la crescita di skill e livelli | `disableSkillAdvanceService` |
| Blocca la difficoltà a un valore fisso | `disableDifficultySelectionService` |
| Cancella gli attori locali che non vengono dal server (i cadaveri vanilla restano) | `worldCleanerService` |
| Ora del gioco = ora reale UTC (con uno spostamento configurabile, `hoursOffset`) | `timeService` |
| Se carichi un salvataggio, passa al single player e chiude la connessione | `singlePlayerService` |
| Controlla che i plugin del client coincidano con quelli del server | `loadOrderVerificationService` |

### 2.3 Infrastruttura del server

| Funzione | Note |
|---|---|
| **Persistenza automatica** | Driver `file` (default), `zip`, `mongodb`, più un driver `migration` per passare da uno all'altro |
| **Proprietà personalizzate** (`mp.makeProperty`) | Si attaccano a qualunque attore o oggetto e **si salvano da sole** nel database. È il mattone per background, reputazione, fazioni, soldi… |
| **Eventi personalizzati** (`mp.makeEventSource`) | Il client segnala situazioni di gioco al server |
| **Eventi del gamemode già pronti** | attivazione, craft, morte, respawn, drop, mangiare, leggere un libro, prendere e posare oggetti, cambio di aspetto e di equipaggiamento |
| **Login con Discord** | Controlla che il giocatore sia nel server Discord; passa al gamemode i **ruoli Discord** (dal 2026 anche su più server Discord) |
| **Ban via Discord** | `discordBanSystem` (serve un bot Discord) |
| **Espulsione di un giocatore** | `kick` (marzo 2026) |
| **Punti di spawn** | `startPoints` in `server-settings.json`: al primo login si nasce in un punto a caso tra quelli configurati e si apre la RaceMenu vanilla |
| **Modalità offline** | `offlineMode: true`, per i test senza master server né Discord |
| **Metriche** | Endpoint `/metrics` per Prometheus, con password |
| **Hot reload** | Del gamemode e degli script Papyrus, utile in sviluppo |
| **Traduzioni** | `lang`, `locale` e `M.GetText` per i testi localizzati |
| **Deploy** | Windows ufficiale, Linux con Docker |
| **Configurazione da GitHub** | `additionalServerSettings` scarica le impostazioni da un repo |

### 2.4 Interfaccia (skymp5-front)

L'interfaccia è una pagina web mostrata dentro il gioco (Chromium). Componenti già presenti: **chat**, schermata di **login**, **menu delle skill**, **elenco animazioni** e un "costruttore" di finestre (pulsanti, caselle, testo, chat). I **nomi sopra la testa** sono supportati dal motore, e possono anche essere nascosti (`SweetHidePlayerNamesService`). La chat ha un **raggio d'ascolto** configurabile (`hearingRadiusNormal`), ma la logica dei comandi di chat vive nel gamemode, quindi va scritta da noi.

### 2.5 Il pacchetto del server ufficiale (visto sul PC di David, 28/09)

Il launcher di skymp.net installa, oltre al client (`SkyrimPlatform.dll`, `MpClientPlugin.dll`), circa **40 plugin SKSE** scelti da loro. Tra questi: EngineFixes, powerofthree's Tweaks, Precision, True Directional Movement, TrueHUD, Open Animation Replacer, SkyrimSouls RE, NirnLab UI, Simple Dual Sheath, Better Jumping, Casting Bar, Oxygen Meter, Moons and Stars, Flat Map Markers. È un buon indizio di **quali plugin client convivono bene con SkyMP**.

---

## 3. La nostra modlist incrociata con SkyMP

Legenda:
- 🗑️ **Superflua** — SkyMP lo fa già, oppure non ha più senso
- ✅ **Resta** — serve ancora e non ci sono motivi per pensare che non funzioni
- ⚠️ **A rischio** — probabilmente non funziona com'è (Papyrus bloccato, dati non sincronizzati); da provare 🔬
- 🔁 **Da rifare nel gamemode** — l'idea resta, ma va reimplementata lato server

### 3.1 Base e librerie

| Mod | Verdetto | Perché |
|---|---|---|
| Skyrim Together Reborn | 🗑️ | Sostituita da SkyMP |
| STR Script Patch Hub | 🗑️ | Esiste solo per STR |
| SKSE 2.2.6 | ✅ | Obbligatorio anche per SkyMP |
| Address Library | ✅ | Serve ai plugin SKSE. Il launcher ufficiale la installa già |
| VR Address Library | 🗑️ | È per Skyrim VR: da togliere in ogni caso |
| EngineFixes | ✅ | È anche nel pacchetto ufficiale. Attenzione al popup del "preload" visto il 30/09 (`skymp_spike.md`) |
| Crash Logger | ✅ | Solo diagnostica, lato client |
| SSE Display Tweaks | ✅ | Solo lato client |
| powerofthree's Tweaks | ✅ | È anche nel pacchetto ufficiale |
| USSEP | ✅ 🔬 | È un `.esp`: va caricato **anche sul server**. Le correzioni agli script valgono solo se girano nella Papyrus VM del server |
| PapyrusUtil SE | 🗑️ | La Papyrus VM del server non ha le sue funzioni, e il salvataggio dei dati lo fanno già le proprietà del gamemode |
| powerofthree's Papyrus Extender | 🗑️ | Stesso motivo di PapyrusUtil |
| SPID (distribuzione perk/oggetti) | ⚠️ | Agisce solo sul client: il server non vede gli oggetti o i perk aggiunti, quindi si rischiano disallineamenti. Meglio distribuire dal gamemode |
| ConsoleUtilSSE NG | 🗑️ | I comandi console sono gestiti dal server, con permessi |
| More Informative Console | ✅ | Strumento di debug lato client, solo staff |

### 3.2 Correzioni vanilla

| Mod | Verdetto | Perché |
|---|---|---|
| Hide Quest Items in Container Menu | 🗑️ | Senza quest vanilla non serve |
| High Gate Ruins Puzzle Reset Fix | 🗑️ | I puzzle dei dungeon non sono ancora sincronizzati in SkyMP |
| CritterSpawn Congestion Fix | 🗑️ | Gli insetti e i pesci generati via script lato client vengono comunque cancellati 🔬 |
| WIDeadBodyCleanupScript Crash Fix | 🗑️ | Script lato client, bloccato |
| Skyrim Project Optimization | ✅ | Solo prestazioni. È un `.esp`, quindi va anche sul server |
| Wait Your Turn | 🗑️ | Era già da togliere (IA degli NPC) |

### 3.3 Interfaccia e QoL

| Mod | Verdetto | Perché |
|---|---|---|
| SkyUI | ⚠️ | Le interfacce di inventario funzionano, ma i **menu MCM** si basano su script Papyrus lato client, quindi probabilmente sono morti 🔬 |
| A Quality World Map | ✅ | Solo grafica. Il viaggio rapido è comunque spento |
| Better Jumping SE | ✅ | È anche nel pacchetto ufficiale |
| Bandolier | ✅ 🔬 | Aggiunge oggetti (`.esp`): va anche sul server |

### 3.4 Grafica e audio

| Mod | Verdetto | Perché |
|---|---|---|
| Obsidian Weathers, Luminosity, Relighting Skyrim, Blended Roads, Skyland AIO, Enhanced Vanilla Trees, Skyland Night Sky | ✅ | Solo lato client. Quelle con un `.esp` vanno anche sul server. Il meteo non è sincronizzato: ognuno vedrà il suo |
| Better Bards, Northerner Diaries, Celtic Music | ✅ | Solo lato client |

### 3.5 Gameplay

| Mod | Verdetto | Perché |
|---|---|---|
| Alternate Start – LAL | 🗑️ | Si basa su una quest Papyrus lato client. In SkyMP lo spawn lo decide il server (`startPoints`) e la creazione del personaggio parte da sola al primo login |
| Skyrim Unbound Reborn (candidata) | 🗑️ | Stesso motivo |
| Experience Quests Tweak | 🗑️ | Esperienza e quest sono già spente |
| Inconvenient Dungeons | ⚠️ | I dungeon (trappole, puzzle, leve) non sono ancora supportati bene da SkyMP |
| Simple Dual Sheath | ✅ | È anche nel pacchetto ufficiale |
| Attack Speed Framework | ⚠️ | Il combattimento lo calcola il server: da provare 🔬 |
| Survival Mode (Creation Club) | ⚠️ | Richiede di dormire, che in SkyMP non è possibile. Stesso problema che c'era con STR |
| Open Cities (esclusa con STR) | 🔬 | Da rivalutare: l'esclusione dipendeva da STR |

### 3.6 Personaggio

| Mod | Verdetto | Perché |
|---|---|---|
| RaceMenu | ⚠️ | SkyMP sincronizza l'aspetto **vanilla**. I cursori extra di RaceMenu probabilmente li vede solo chi li ha impostati 🔬 |

### 3.7 Le nostre mod custom

| Mod | Verdetto | Perché |
|---|---|---|
| **RPServer_EmptyWorld** | 🔁 In parte superflua | Se basta un mondo **senza nessun attore**, SkyMP lo fa già di default. Se vogliamo **gli animali**, serve ancora: si accendono gli NPC (`npcEnabled: true`) e il server **salta da solo i riferimenti "Initially Disabled"**, cioè proprio quello che fa EmptyWorld v0.5 (verificato nel codice, `WorldState.cpp`). La parte sulle quest vanilla è superflua 🔬 |
| **RPServer_StaffTools** | 🗑️ / 🔁 | Dipende da MCM + ConsoleUtil + Papyrus lato client: con ogni probabilità non funziona. Vanno rifatti nel gamemode: comandi console con permessi (già presenti), teletrasporto (`mp.set(id, "pos", …)`), spawn di oggetti, `kick`, ban via Discord. `/me` e `/do` diventano comandi della chat |

---

## 4. La nostra ROADMAP incrociata con SkyMP

| Step / sistema | Cosa c'è già in SkyMP | Cosa manca (da fare noi) |
|---|---|---|
| **Step 0 — mondo vuoto** | Niente NPC di default; il client cancella gli attori locali; gli oggetti disabilitati vengono saltati | Decidere se vogliamo gli animali (→ EmptyWorld + `npcEnabled`) |
| **Step 1 — persistenza** | ✅ Automatica (personaggio, inventario, posizione, proprietà) | — |
| **Step 1 — creazione del personaggio** | RaceMenu vanilla al primo login, punti di spawn | Menu del background (origine, mestiere, oggetti di partenza) come finestra web nel gamemode |
| **Step 1 — identità visibile** | Nomi sopra la testa (anche nascondibili); ruoli Discord disponibili al server | Etichette di ruolo, "carta d'identità" |
| **Step 2 — economia** | Inventari e contenitori persistenti, craft alla forgia, gestione del ripopolamento | Negozi tra giocatori, valuta, prezzi regionali, risorse. Alchimia e incantamento mancano del tutto |
| **Step 3 — reputazione e politica** | Proprietà persistenti, fazioni lato server, ruoli Discord | Tutto il sistema (reputazione, cariche, crimine e legge) |
| **Step 4 — razze, magie, poteri** | Razze da `.esp`, lancio di incantesimi, formula del danno sostituibile, costi di stamina configurabili | Effetti magici a durata, grida, perk e skill (spenti di default) |
| **Step 5 — distribuzione** | Launcher/installer, verifica automatica dei plugin, manifest scaricabile dal server | Il nostro pacchetto. **Wabbajack (D-003) potrebbe non servire più** 🔬 |
| **Step 7 — infrastruttura** | Docker/Linux, metriche Prometheus, MongoDB | Hardening del VPS (resta com'è) |
| **Mappa** (`mapping_system.md`) | Viaggio rapido già disattivato (coerente con l'opzione A) | Marker scoperti non salvati: vanno salvati noi |
| **Chat RP** | Chat con raggio d'ascolto | Comandi `/me`, `/do`, canali OOC |

---

## 5. Riepilogo

**Diventa superfluo:** Skyrim Together Reborn, STR Script Patch Hub, VR Address Library, PapyrusUtil, Papyrus Extender, ConsoleUtilSSE NG, Alternate Start (e Skyrim Unbound), Experience Quests Tweak, Wait Your Turn e le quattro correzioni vanilla legate agli script. StaffTools va rifatto.

**Resta com'è:** SKSE, Address Library, EngineFixes, Crash Logger, Display Tweaks, po3 Tweaks, grafica, audio, Better Jumping, Simple Dual Sheath, A Quality World Map, Skyrim Project Optimization. Con una regola nuova: **ogni `.esp` va messo anche sul server**.

**A rischio, da provare nello spike:** SkyUI (MCM), RaceMenu (cursori extra), SPID, USSEP (parte script), Inconvenient Dungeons, Attack Speed Framework, Survival Mode.

**Manca, e va costruito nel gamemode:** background e identità, comandi della chat RP, strumenti dello staff, economia tra giocatori, reputazione e politica, salvataggio dei marker di mappa. Più, se ci servono: skill, perk, alchimia e incantamento, che SkyMP non ha ancora.

**Cosa cambia per il team:** con SkyMP le regole del server si scrivono soprattutto in **TypeScript** (gamemode), non in Papyrus lato client. È una competenza nuova da mettere in conto per la D-019.

---

## 6. Da verificare nello spike 🔬

1. Con `npcEnabled: true` e EmptyWorld caricato, restano solo gli animali?
2. I menu MCM di SkyUI si aprono e salvano le impostazioni?
3. Gli altri giocatori vedono i cursori di RaceMenu?
4. Un `.esp` solo grafico sul client ma non sul server: il login viene rifiutato? (previsto: sì)
5. Un comando di chat `/me` si scrive in poche righe di gamemode?
