# Spike tecnico SkyMP

```
Autore:   David (+ Davide)
Data:     28/09/2026 → in corso
Status:   In corso (sezioni 1 e 3 compilate il 30/09, avvio sistemato il 07/10)
Timebox:  ~6 ore. Se ti blocchi, annota dove e perché: anche quello è un risultato
```

> Obiettivo: capire **con una prova pratica** se SkyMP è una base solida per il nostro server. Non serve costruire niente di definitivo: il codice di questa prova si può buttare.
> Le domande sono quelle della sezione A di `README.md`. Rispondi anche con "non lo so / non ci sono riuscito".

## 1. Setup
- Da dove hai scaricato server e client (link + versione): launcher ufficiale da https://skymp.net (`SkyMP [1c3b345].exe`). Collega al server ufficiale inglese (`sweetpie_en`). Il nostro server locale non è ancora stato provato
- Sistema operativo e PC usato: Windows 11, PC Windows di David, installazione Steam di Skyrim SE (senza MO2)
- Passi seguiti (elenco breve): installer → scarica altri 6 file → si sceglie la cartella di Skyrim → scarica client e modpack dentro `Data`
- Cosa installa il launcher: il client SkyMP (`SkyrimPlatform.dll`, `MpClientPlugin.dll`) **più circa 40 plugin SKSE** scelti dal server ufficiale (EngineFixes, Precision, TrueHUD, NirnLab UI, Open Animation Replacer…). L'elenco completo e il confronto con la nostra modlist sono in `skymp_funzionalita.md`
- Problemi incontrati e come li hai risolti (30/09):
  1. **Popup di `BakaWorldMapSpeed.dll`**: *"Failed to find offset for Address Library ID 411155"* con Skyrim 1.6.1170. Address Library era giusta e aggiornata: il plugin non è compatibile. → Plugin spostato fuori da `Data\SKSE\Plugins\`, errore sparito
  2. **Popup di `EngineFixes.dll`**: *"Failed to locate … versionlib-1-6-1170-0.bin"*, anche se il file c'è. Il log di SKSE mostra tutti i 37 plugin caricati correttamente, EngineFixes compreso. Ipotesi: il messaggio viene dal caricamento anticipato di EngineFixes (`EngineFixes_preload.txt`). Da verificare
  3. **Gioco fermo sulla schermata di caricamento, con la musica.** Il log `NirnLabUIPlatform.log` dice `failed to initialize CEF, code 38` (`CEF_RESULT_CODE_NORMAL_EXIT_AUTO_DE_ELEVATED`): il browser interno non parte se il gioco è avviato **come amministratore**. Senza browser non compare il login con Discord. → Risolto avviando il loader senza privilegi di amministratore
  4. **Steam ha aggiornato Skyrim alla 1.7.104** durante la sessione (stamattina era 1.6.1170). SKSE 2.2.6 si rifiuta di partire. → **Risolto il 07/10:** downgrade fatto con `Skyrim_1_7_104_to_1_6_1170_patcher.exe` (SkyrimSE.exe = 1.6.1170.0); Steam impostato su "aggiorna solo all'avvio". Ipotesi da verificare: il launcher di SkyMP o l'avvio passano da Steam, che così applica l'aggiornamento (con STR non succedeva)
  5. **(07/10) Il gioco partiva ancora come amministratore → di nuovo CEF codice 38, fermo sul caricamento.** Trovate due cause con `client_pack/Diagnostica/skymp_check.bat`:
     - il launcher `SkyMP [1c3b345].exe` ha nel manifest `requireAdministrator`: chiede **sempre** i permessi di amministratore e li passa a SKSE e a Skyrim. Non si può cambiare
     - `steam.exe` (e `ModOrganizer.exe`) hanno la spunta **"Esegui come amministratore"** nelle proprietà di compatibilità. Se Steam è elevato, anche Skyrim avviato tramite Steam lo è
     → **Soluzione:** togliere la spunta (`client_pack/Diagnostica/skymp_fix.bat`, con Steam chiuso) e **usare il launcher solo per installare/aggiornare**. Per giocare: `client_pack/SkyMP/avvia_skymp.bat`, che controlla versione e Steam e avvia `skse64_loader.exe` senza privilegi
     - 💡 Probabile collegamento con il vecchio crash di STR (log con `Elevated: Yes` e errori in `libcef.dll`): anche MO2 partiva come amministratore
- Messaggi innocui da ignorare: `DirectoryMonitor(Data/Platform/PluginsDev) failed with code 2` (manca una cartella facoltativa); nei log di Chromium, `GpuControl.CreateCommandBuffer` e `Unable to get gpu adapter`
- Tempo totale: in corso

## 2. Connessione
- [x] Server avviato
- [x] Client collegato al server (09/10, server locale: si arriva alla creazione del personaggio)
- [ ] Secondo client/giocatore collegato (se possibile)
- Note (lag, errori, comportamento strano):
  - **08/10 - server ufficiale:** login Discord OK (CEF parte, niente admin), ma il client resta su `Connecting to 51.158.253.33:7331`. Causa non trovata. Diagnosi: `client_pack/Diagnostica/skymp_net_check.bat` (ping UDP RakNet, regole firewall, VPN). Sul sito c'e' anche l'aggiornamento `1c3b345-patch`, non installato
  - **08/10 - server locale (offline):** server = build fork `jqntn/skymp` (tag `jqntn-2026-10-05`) in `_locale/skymp-server`, config in `configs/skymp/` (vedi README li'). Avvio: `client_pack/SkyMP/server_locale.bat`; client sul server locale: `client_pack/SkyMP/client_profilo.bat locale` (gia' applicato sul PC di David), poi `avvia_skymp.bat`. Node.js installato
  - **08/10 - primo tentativo:** il client ufficiale compariva con "A new update is available" = connessione rifiutata per **password di rete** diversa (client: `Data/Platform/Distribution/password` = `1c3b345`; server: nessuna). Corretto: `server_locale.bat` ora copia la password del client nel server. **DA FARE:** riavviare server + gioco e verificare `Connecting a user ... 127.0.0.1` nella console del server. Se non basta: piano B = client della stessa fork in una copia separata di Skyrim
  - **09/10 - funziona:** dopo il riavvio di server + gioco il client ufficiale si collega al server locale e porta alla creazione del personaggio. Il piano B non serve. Prossimo passo: Davide nello stesso mondo via Tailscale

## 3. Versioni
- Versione di Skyrim SE richiesta: **1.6.1170** (sito skymp.net; nel repo c'è `versionlib-1-6-1170-0.bin`). Il sito dice che è "l'attuale versione di Steam", ma non è più vero: Steam distribuisce la 1.7.104
- Serve SKSE? Quale versione? Sì, **2.2.6** (verificato nel log di SKSE: runtime 1.6.1170)
- Compatibile con la nostra 1.6.1170 (D-009)? **Sì**
- ⚠️ Due requisiti da imporre a tutto il team (e poi ai giocatori):
  - Skyrim **bloccato alla 1.6.1170**: Steam impostato su "aggiorna solo quando lo avvio", e il gioco avviato solo dal launcher o da `skse64_loader.exe`, mai da Steam
  - **Mai avviare SkyMP come amministratore**: il browser interno non parte (CEF codice 38). Attenzione: il launcher ufficiale lo fa da solo (`requireAdministrator`), quindi si gioca con `client_pack/SkyMP/avvia_skymp.bat`, e Steam/MO2 non devono avere la spunta "Esegui come amministratore"

## 4. Le nostre mod
- `RPServer_EmptyWorld.esp` caricato lato server? Come si fa?
- Gli NPC disabilitati restano disabilitati per tutti?
- Mod client (SkyUI, RaceMenu…): funzionano?

## 5. Gamemode
- Linguaggio e struttura (dove sta il codice, come si avvia):
- Prova: una regola minima (es. "al login il giocatore riceve 10 monete" o un messaggio di benvenuto). Ci sei riuscito?
- Difficoltà percepita (1-5) e perché:

## 6. Persistenza
- Dove salva i dati (file / MongoDB)?
- Dopo il riavvio del server, posizione e inventario del giocatore sono conservati?

## 7. Community e salute del progetto
- Documentazione (1-5):
- Discord / canali di supporto:
- Ultima release e frequenza degli aggiornamenti:

## 8. Conclusione
- SkyMP è una base solida per noi? Sì / No / Con riserva:
- I 3 rischi più grossi che vedi:
- Cosa servirebbe imparare per lavorarci:
