# Sessione 01 — Primo approccio a SkyMP

```
Quando:   lunedì 28/09/2026, mattina (~3 ore)
Chi:      David + Davide
Task:     T-003
Output:   specs/platform/skymp_spike.md compilato (almeno sezioni 1-4)
```

## Obiettivo della sessione

Alla fine della mattina vogliamo sapere **tre cose** (scope di T-003):

1. **Com'è fatta la struttura di base**: quali pezzi ci sono (server, client, gamemode) e dove stanno.
2. **Come ci si collega**: un client dentro un server, prima in locale e poi dal PC dell'altro.
3. **Come si agganciano i nostri `.esp`**: dove si mettono, lato server e lato client.

Tutto il resto (gamemode, persistenza…) è un extra. Se una cosa si blocca per più di 30 minuti: **annotarla, chiedere sul Discord di SkyMP e passare oltre.**

**Ruoli:**
- **Davide** ospita il server sul suo PC e fa da primo client in locale.
- **David** fa da secondo client, collegandosi al server di Davide, e prende appunti in `skymp_spike.md`.

---

## I pezzi di SkyMP (mappa mentale)

```
┌──────────────── PC di Davide ────────────────┐        ┌──────── PC di David ────────┐
│                                               │        │                              │
│  SERVER (Node.js)                             │ UDP    │  Skyrim SE 1.6.1170          │
│  dist/server/                                 │ 7777   │   + SKSE                     │
│   ├─ launch_server.bat                        │◄──────►│   + client SkyMP             │
│   ├─ dist_back/skymp5-server.js               │        │     (SkyrimPlatform +        │
│   ├─ server-settings.json  ← configurazione   │ HTTP   │      skymp5-client.js)       │
│   ├─ data/  ← .esm/.esp + scripts/ + ui/      │ 3000   │   Data/Platform/Plugins/     │
│   └─ (gamemode .js, facoltativo)              │◄──────►│    skymp5-client-settings.txt│
│                                               │        │      ← IP e porta del server │
│  + Skyrim + client SkyMP (per giocare in loco)│        │                              │
└───────────────────────────────────────────────┘        └──────────────────────────────┘
```

- **Server:** un programma Node.js (`node dist_back/skymp5-server.js`) che tiene lo stato del mondo. Legge `.esm`/`.esp` per sapere com'è fatto il mondo, esegue gli script e opzionalmente un gamemode in JS.
- **Client:** file che si copiano **dentro la cartella di Skyrim**. SkyrimPlatform (un plugin SKSE) fa girare `skymp5-client.js`, che si collega al server.
- **Porte:** **7777 UDP** (gioco) e **3000** (interfaccia/asset). Sono i valori di default.

---

## Blocco 0 — Controlli (15 min, entrambi)

- [ ] **Versione di Skyrim = 1.6.1170.** PowerShell nella cartella di Skyrim:
  ```powershell
  (Get-Item .\SkyrimSE.exe).VersionInfo.FileVersion
  ```
  Se esce `1.7.x`, serve il downgrade con **Skyrim Downgrade Tool** prima di proseguire.
- [ ] **SKSE 2.2.6** presente (`skse64_loader.exe` nella cartella di Skyrim).
- [ ] **Non sporcare l'installazione di sviluppo (MO2).** Il client SkyMP copia file dentro la cartella di Skyrim. Scegliete una di queste due strade:
  - **Copia separata (consigliata):** copiate tutta la cartella `Skyrim Special Edition` in `C:\Games\SkyrimSE_SkyMP\` e lavorate lì. Di solito parte con `skse64_loader.exe` se Steam è aperto.
  - **Backup:** zip della cartella di Skyrim prima di iniziare.
- [ ] **Account GitHub** loggato nel browser (serve per scaricare i binari).
- [ ] **Solo Davide:** **Node.js LTS** installato (https://nodejs.org). Verifica con `node -v`.
- [ ] **Entrambi:** **Tailscale** installato e loggato con lo stesso account o rete (https://tailscale.com). Serve dal Blocco 4.
- [ ] **Discord di SkyMP** aperto (link nel README di https://github.com/skyrim-multiplayer/skymp): è il posto dove chiedere aiuto.

---

## Blocco 1 — Scaricare i binari (20-30 min, Davide)

1. https://github.com/skyrim-multiplayer/skymp/actions
2. Filtrare per branch `main` e aprire l'**ultimo run riuscito (✅)** che ha artifact. Il run Windows si chiama "Flatrim", cioè Skyrim SE normale.
3. In fondo alla pagina, sezione **Artifacts**, scaricare **`dist`** (~185 MB, contiene `client/` e `server/`).
4. Estrarre in `C:\SkyMP\dist\`.
5. **Annotare** in `skymp_spike.md` §1: link del run, data, cosa contiene l'archivio.

> Se non c'è nessun artifact scaricabile (scaduto o permessi): chiedere sul Discord "what's the recommended way to get a current Windows build?". Compilare da sorgente (`CONTRIBUTING.md`: VS 2022, CMake, Node, Yarn, Python, ~22 GB) solo come ultima spiaggia: **non** in questa sessione.

---

## Blocco 2 — Accendere il server (30-45 min, Davide)

1. Aprire `C:\SkyMP\dist\server\`.
2. Creare o modificare **`server-settings.json`**. Configurazione minima per il locale (i percorsi dei master puntano alla cartella `Data` di Skyrim, così non serve copiarli):
   ```json
   {
     "name": "SkyrimRP Test",
     "dataDir": "data",
     "loadOrder": [
       "C:/Games/SkyrimSE_SkyMP/Data/Skyrim.esm",
       "C:/Games/SkyrimSE_SkyMP/Data/Update.esm",
       "C:/Games/SkyrimSE_SkyMP/Data/Dawnguard.esm",
       "C:/Games/SkyrimSE_SkyMP/Data/HearthFires.esm",
       "C:/Games/SkyrimSE_SkyMP/Data/Dragonborn.esm"
     ],
     "ip": "127.0.0.1",
     "port": 7777,
     "maxPlayers": 10,
     "offlineMode": true,
     "master": "",
     "npcEnabled": false,
     "npcSettings": {}
   }
   ```
   - `offlineMode: true` → niente login tramite il master server di SkyMP: ognuno entra con un `profileId` numerico scelto da lui.
   - `npcEnabled: false` è già il **default di SkyMP**: gli NPC sono spenti lato server. Da capire nella sessione cosa significa in pratica per EmptyWorld.
   - Se i percorsi assoluti non vanno: copiare i 5 `.esm` in `data\` e usare solo i nomi (`"Skyrim.esm"`, …).
3. Avviare **`launch_server.bat`**. Windows chiederà il permesso firewall per Node: **consentire sulle reti private**.
4. ✅ **Riuscito se** la console resta aperta senza errori rossi e dice che è in ascolto.
5. **Annotare** in §1-2: messaggi della console, errori, tempo impiegato.

---

## Blocco 3 — Primo client in locale (30-45 min, Davide)

1. Copiare **il contenuto** di `C:\SkyMP\dist\client\` dentro `C:\Games\SkyrimSE_SkyMP\` (sovrascrive o aggiunge in `Data\…`).
2. Aprire o creare **`Data\Platform\Plugins\skymp5-client-settings.txt`**. È un JSON:
   ```json
   {
     "server-ip": "127.0.0.1",
     "server-port": 7777,
     "gameData": { "profileId": 1 },
     "master": "",
     "server-master-key": null
   }
   ```
   `profileId` è l'identità del giocatore in offline mode: **ognuno deve avere un numero diverso** (Davide 1, David 2).
3. Aprire Steam, poi avviare **`skse64_loader.exe`** dalla cartella copia.
4. ✅ **Riuscito se** si entra nel mondo e la console del server registra la connessione.
5. **Se crasha all'avvio:** di solito è la versione di Skyrim o SKSE. Guardare i log di SKSE in `Documenti\My Games\Skyrim Special Edition\SKSE\`.
6. **Annotare** in §2-3.

---

## Blocco 4 — Il secondo giocatore: David (30-45 min)

1. **Davide:** in Tailscale leggere il proprio IP (`100.x.y.z`) e metterlo in `server-settings.json` → `"ip": "100.x.y.z"`. Riavviare il server.
2. **David:** ripetere il Blocco 3 sul proprio PC (copia di Skyrim + client) con:
   ```json
   {
     "server-ip": "100.x.y.z",
     "server-port": 7777,
     "gameData": { "profileId": 2 },
     "master": "",
     "server-master-key": null
   }
   ```
3. ✅ **Riuscito se** vi vedete nel mondo. Poi provate: muovervi insieme, saltare, estrarre un'arma, lasciare cadere un oggetto e vedere se l'altro lo vede.
4. **Se non si collega:** controllare che il firewall di Windows sul PC di Davide consenta Node (UDP 7777 e 3000) anche sulla rete Tailscale.
5. **Annotare** in §2 (cosa si sincronizza e cosa no).

> 💡 **David:** se il client SkyMP parte sul tuo PC mentre STR no, annotalo. È un indizio anche per T-001.

---

## Blocco 5 — Agganciare un nostro `.esp` (30 min, se c'è tempo)

L'`.esp` di EmptyWorld v0.5 non è ancora generato, quindi per questa prova va bene **qualunque `.esp` piccolo** (anche uno creato al volo in xEdit/CK che cambia una cosa visibile, es. il nome di un oggetto).

1. **Server:** copiare `Test.esp` in `dist\server\data\` e aggiungerlo **in fondo** a `loadOrder` in `server-settings.json`. Riavviare.
2. **Client (entrambi):** copiare `Test.esp` in `Data\` della cartella di Skyrim e attivarlo (in `plugins.txt` o con il launcher di Skyrim). **Ordine e file devono essere identici tra server e client.**
3. ✅ **Riuscito se** il cambiamento si vede, per entrambi.
4. **Domande da fare sul Discord SkyMP se qualcosa non torna:**
   - il client deve avere lo stesso load order del server? Come lo verifica?
   - come si distribuiscono ai giocatori gli asset (`.bsa`) delle mod? (la documentazione dice che i `.bsa` si usano solo lato client)
   - con `npcEnabled: false`, gli NPC vanilla appaiono lo stesso sul client?

---

## Blocco 6 — Chiusura (15 min, entrambi)

- Compilare `skymp_spike.md` §1-4 (e §8 "Conclusione" anche solo a impressione).
- Fare 2-3 screenshot per la riunione di venerdì (`specs/platform/img/skymp/`).
- Decidere cosa provare nel resto della settimana (gamemode? persistenza?) o dove chiedere aiuto.
- Commit + push.

---

## Note per la decisione D-019 (emerse preparando la sessione)

- **Licenza:** il server SkyMP è **AGPL-3.0**. Se modifichiamo il codice del server e lo facciamo girare per giocatori pubblici, dobbiamo rendere disponibili le modifiche. Il nostro gamemode e le nostre `.esp` vanno valutati a parte. Da approfondire prima di decidere.
- **Supporto versione:** il client arriva fino alla 1.6.1170 (la nostra, D-009). Steam oggi distribuisce la 1.7.104, quindi tutti i giocatori dovranno fare il downgrade, come già succede per Keizaal.
- **NPC:** SkyMP ha gli NPC spenti di default lato server (`npcEnabled`). EmptyWorld potrebbe servire meno del previsto, oppure servire per altri motivi (client, dungeon). Da capire.

## Fonti

- Repo e documentazione: https://github.com/skyrim-multiplayer/skymp (`docs/`, `CONTRIBUTING.md`)
- Configurazione server: `docs/docs_server_configuration_reference.md` · porte: `docs/docs_server_ports_usage.md` · cartella data: `docs/docs_server_data_directory.md`
- Impostazioni generate: `cmake/scripts/generate_server_settings.cmake`, `generate_client_settings.cmake`
