# Piano d'azione: test di SkyMP (settimana 28/09 → 02/10/2026)

> **Obiettivo:** arrivare alla riunione di **venerdì 2 ottobre** con elementi concreti per decidere **D-019**: lasciamo STR e passiamo a SkyMP?
> **Chi:** David + Davide (prova tecnica, T-003) · Alessio e Giacomo in ricognizione sui server concorrenti (T-004, T-002)
>
> **Scope di T-003 (deciso il 2026-09-27):** l'obiettivo minimo è capire **(1) la struttura di base** (server, client, gamemode), **(2) come collegarci** e **(3) come agganciare i nostri `.esp`**. Tutto il resto (persistenza, regole nel gamemode, test avanzati) è un **extra** se avanza tempo.
> Contesto e domande: `README.md` di questa cartella. Resoconto da compilare: `skymp_spike.md`.
> **Guida passo passo della prima sessione, con configurazioni pronte:** `SESSIONE_01_SKYMP.md`.

---

## Cosa sappiamo già (verificato il 2026-09-27)

| Fatto | Fonte |
|---|---|
| SkyMP è nato nel 2015. La versione attuale (SkyMP 5, TypeScript) esiste da aprile 2020 ed è attiva | `docs/docs_project_history.md` del repo SkyMP |
| Nei loro test 2020-21 **il massimo è stato ~70 giocatori**. SkyMP 2 (2019) arrivò a 1000/1000 in open beta, ma fu chiuso per problemi tecnici. Keizaal, con un suo fork, ha superato i 600 | docs SkyMP + articoli su Keizaal |
| **Non ci sono release scaricabili recenti** (l'ultima è del 2022), ma la CI di GitHub produce ogni giorno un pacchetto `dist` (~185 MB) e un `server-dist` (~25 MB) | GitHub Actions del repo |
| Il client supporta **Skyrim SE 1.6.1170** (la nostra versione, D-009) e richiede **SKSE** | `client-deps/ae/…/versionlib-1-6-1170-0.bin` |
| Il server gira su Windows (ufficiale) o su Linux con Docker | `CONTRIBUTING.md`, `docs_deploy.md` |
| Il server carica `.esp`/`.esm` dalla cartella `data` + `loadOrder` in `server-settings.json`. Gli script Papyrus lato server vanno in `data/scripts` (c'è una Papyrus VM lato server) | `docs_server_data_directory.md` |
| Gamemode in JavaScript/TypeScript: oggetto globale `mp` (`mp.makeProperty`, `mp.makeEventSource`…). I dati delle proprietà si salvano da soli nel database | `docs_serverside_scripting_reference.md` |
| Il repo contiene un **`CLAUDE.md`**, quindi gli agenti AI sono già "istruiti" sul progetto: usateli | root del repo SkyMP |

---

## Prerequisiti (lunedì, ~30 min)

- [ ] **Account GitHub** per entrambi (serve per scaricare gli artifact della CI)
- [ ] **PC Windows con Skyrim SE 1.6.1170 + SKSE 2.2.6**, per ciascuno dei due
  - **Primo controllo:** tasto destro su `SkyrimSE.exe` → Proprietà → Dettagli → versione. Steam oggi distribuisce la **1.7.104**, che il client SkyMP **non** supporta (arriva fino alla 1.6.1170)
  - Se è 1.7.x: downgrade con **Skyrim Downgrade Tool (SDT)** alla 1.6.1170. È lo stesso passaggio richiesto dalla community di Keizaal
- [ ] ⚠️ **Non toccare l'installazione di sviluppo (MO2).** Il client SkyMP si installa copiando file *dentro* la cartella di Skyrim. Prima: **backup della cartella di Skyrim**, oppure una **copia separata** (di solito funziona se Steam è aperto)
- [ ] Entrare nel **Discord ufficiale di SkyMP** (link nel README del repo): è il canale di supporto principale
- [ ] Clonare o sfogliare il repo https://github.com/skyrim-multiplayer/skymp e leggere `docs/`

---

## Fase 1 — Procurarsi i binari (lunedì-martedì)

**Via A, consigliata: artifact della CI**
1. GitHub → repo `skyrim-multiplayer/skymp` → tab **Actions**
2. Aprire l'ultimo run riuscito sul branch `main` (workflow Windows "Flatrim" = Skyrim SE normale)
3. In fondo alla pagina, sezione **Artifacts**: scaricare `dist` (client + server). Solo per il server basta `server-dist`
4. ⚠️ Gli artifact scadono dopo un certo numero di giorni: scaricare il più recente

**Via B, di riserva: compilare dal sorgente.** Serve Windows con Visual Studio 2022, CMake ≥3.19, Node, Yarn, Python 3.9, ~22 GB liberi e qualche ora (istruzioni in `CONTRIBUTING.md`). Da usare solo se la via A non funziona.

**Via C:** chiedere sul Discord di SkyMP qual è il modo consigliato per avere una build aggiornata.

---

## Fase 2 — Server + client in locale (martedì) · *Davide guida il server, David il client*

**Server**
1. Estrarre il server (`dist/server` o `server-dist`)
2. Copiare nella sua cartella `data/` i 5 master vanilla presi da `Skyrim Special Edition/Data/`: `Skyrim.esm`, `Update.esm`, `Dawnguard.esm`, `HearthFires.esm`, `Dragonborn.esm`
3. `server-settings.json`: lasciare `"ip": "127.0.0.1"` per la prova in locale. Valutare `"offlineMode": true` (niente login tramite il master server) e `"databaseDriver": "file"`
4. Avviare `launch_server.bat` e annotare eventuali errori

**Client**
1. Copiare `dist/client` dentro la cartella di Skyrim (quella di backup o la copia)
2. Impostare l'indirizzo del server (127.0.0.1) e un `profileId` in `Data/Platform/Plugins/skymp5-client-settings.txt` (dettagli e JSON pronto in `SESSIONE_01_SKYMP.md`)
3. Avviare con `skse64_loader.exe`
4. ✅ **Obiettivo del giorno:** essere dentro il mondo, collegati al proprio server

> 💡 Se il client SkyMP parte sul PC Windows di David mentre STR no, è già un'informazione utile anche per T-001.

---

## Fase 3 — Due giocatori sullo stesso server (mercoledì)

1. Chi ospita il server installa **Tailscale** (o Hamachi, citato nella documentazione di SkyMP): crea una rete privata tra i due PC senza aprire porte sul router
2. In `server-settings.json` mettere come `ip` l'indirizzo Tailscale del PC server
3. L'altro si collega. **Verificare:** ci si vede? Movimenti fluidi? Scambio di un oggetto? Combattimento?
4. *(extra)* **Test di persistenza:** spegnere e riaccendere il server. Posizione e inventario sono rimasti?

---

## Fase 4 — Le cose che ci interessano davvero (giovedì)

**4a. La nostra mod sul server** (David) — *obiettivo minimo*
- Serve un `.esp` di EmptyWorld: la v0.5 va ancora generata (`custom_mods/RPServer_EmptyWorld/docs/PROCEDURA_BUILD.md`). Se non c'è tempo, va bene qualunque `.esp` semplice
- Metterlo in `data/` + `loadOrder` del server (e nel client)
- **Verificare:** gli NPC disabilitati spariscono per entrambi i giocatori?

**4b. Una regola nostra nel gamemode** (Davide) — *extra*
- Partire dalla documentazione `docs_serverside_scripting_reference.md` e dagli esempi in `skymp5-functions-lib` / `skymp5-scripts` del repo
- Idee, una a scelta: messaggio di benvenuto al login, oppure "al primo login ricevi 10 monete", oppure un contatore di morti per giocatore salvato nel database
- Farsi aiutare da un agente AI sul repo SkyMP (c'è `CLAUDE.md`)

---

## Fase 5 — Resoconto (giovedì sera / venerdì mattina)

- Compilare `skymp_spike.md` (anche le parti non riuscite: "bloccati qui" è un risultato)
- Preparare 5 minuti di demo o screenshot per la riunione

---

## Criteri per la decisione di venerdì (D-019)

| Livello | Criterio |
|---|---|
| 🟢 **Indispensabile** | Capita la struttura di base (server / client / gamemode) · binari ottenuti senza un'odissea · server avviato · **2 giocatori collegati da casa** · funziona con 1.6.1170 · **un nostro `.esp` caricato e visto da entrambi** (o almeno capito come si fa) |
| 🟡 **Extra** | Persistenza dopo il riavvio · una regola del gamemode funzionante · supporto dal Discord SkyMP reattivo |
| 🔴 **Campanelli d'allarme** | Crash frequenti · niente binari senza compilare per giorni · documentazione inesistente sui punti chiave · community che non risponde |

**Esiti possibili:**
- **Tutti 🟢 (e qualche 🟡):** si passa a SkyMP. D-019 + revisione di ROADMAP, STEP_0, DEV_SETUP e MODLIST
- **🟢 parziali:** si concede un'altra settimana di prova su punti precisi
- **🔴:** si rivaluta STR, sapendone i limiti, o si cercano altre strade

---

## Ricognizione nel server concorrente (T-004)

- **Server:** **Keizaal Online** (il più grande e maturo). Sito: https://keizaal.com/en/play
- **Chi:** Alessio su **Keizaal** (T-004) · Giacomo su **Keizaal o Mereth** a scelta (T-002). Mereth (https://www.merethroleplay.com/start/) dà un secondo punto di vista
- **Requisiti:** Skyrim SE su Steam, Discord, **un PC diverso da quello di sviluppo** (il launcher usa Vortex e può cambiare la versione di Skyrim)
- **Versione di Skyrim:** serve la **1.6.1170**. Se Steam ha aggiornato il gioco alla 1.7.x, prima fare il downgrade con Skyrim Downgrade Tool (tutorial della community: https://www.youtube.com/watch?v=A5rfyrMJgrg)
- **Consegna:** `ricognizione_keizaal.md` (copiato da `_template_ricognizione.md`) + 3-5 screenshot
- **Quando giocare:** almeno una sessione in un orario di punta (sera o weekend), per vedere il server pieno
- **Domande da fare a staff e giocatori** (sezione 8 del template)
