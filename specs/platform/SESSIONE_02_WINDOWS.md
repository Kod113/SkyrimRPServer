# Sessione 02 — Claude Code sul PC Windows

```
Scritta:  mercoledì 07/10/2026, dalla sessione sul Mac
Per:      Claude Code aperto sul PC Windows di David (quello con Skyrim)
Task:     T-003 (capire SkyMP) → base per la decisione D-019
Output:   server SkyMP nostro in locale + client collegato; esito in skymp_spike.md
```

> **Perché esiste questa nota.** Fino al 07/10 Claude girava sul Mac, e David faceva da tramite: copiava i comandi su Windows, incollava l'output, mandava gli screenshot. Da qui in poi Claude lavora direttamente sul PC di gioco. Questa nota è il passaggio di consegne: leggila tutta prima di agire.

---

## Come lavorare con David

- **Prima la visione d'insieme, poi i passaggi.** Quando David chiede come fare una cosa, spiega prima le fasi e il perché, e fermati. Passa ai comandi solo se non ha domande.
- **Lancia tu i comandi e leggi tu i log.** A David chiedi solo quello che non puoi fare: rispondere alle richieste di permessi di Windows (UAC), guardare il gioco, fare il login con Discord, scaricare da Nexus con il suo account.
- **Repo pubblico:** niente informazioni personali sui compagni di team nei file del repo.

## Regole del PC (non negoziabili)

1. **Skyrim resta alla 1.6.1170.** Lo fissa la decisione D-009, insieme a SKSE **2.2.6**.
2. **Mai avviare Skyrim dal pulsante "Gioca" di Steam.** Steam applicherebbe gli aggiornamenti in sospeso. Si avvia solo da `skse64_loader.exe`.
3. **Mai usare "Verifica integrità dei file" su Steam.** Rimetterebbe la 1.7.104.
4. **Mai avviare il gioco come amministratore.** L'interfaccia web di SkyMP (CEF) si blocca al caricamento (codice 38).

Percorso del gioco: `C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition`

## Stato al 07/10/2026

**Fatto**
- Downgrade da 1.7.104 a 1.6.1170 con il Downgrade Patcher di Nexus (mod 169962). Cambia solo 3 file: `SkyrimSE.exe`, `SkyrimSELauncher.exe`, `Data\Skyrim - Shaders.bsa`. Verifica: lo SHA256 di `SkyrimSE.exe` deve iniziare con `C434208894F0`.
- Address Library per la 1.6.1170 presente (`Data\SKSE\Plugins\versionlib-1-6-1170-0.bin`). C'è anche un `versionlib-1-6-1170-0-1.bin` con dimensione diversa e stessa data degli altri file del pacchetto: non è un doppione, origine da chiarire, **lasciarlo dov'è**.

**Da fare subito (rimasto aperto)**
- [ ] Rinominare `Data\SKSE\Plugins\EngineFixes_preload.txt.off` di nuovo in `EngineFixes_preload.txt`. Senza il caricamento anticipato EngineFixes dà *"SKSE/Trampoline.h(187): Failed to handle allocation request"*
- [ ] Messa in sicurezza: copiare i 3 file della 1.6.1170 in `%USERPROFILE%\Documents\Skyrim_1.6.1170_backup` e mettere in sola lettura `C:\Program Files (x86)\Steam\steamapps\appmanifest_489830.acf` (potrebbe servire l'amministratore solo per questo comando)

**Cosa abbiamo scoperto sul launcher di skymp.net**
- Avvia `skse64_loader.exe` **chiedendo i permessi di amministratore** (UAC). Le regole di compatibilità di Windows sono pulite: la richiesta viene dal launcher, non dai file. Avviando `skse64_loader.exe` a mano con doppio clic, l'UAC non compare.
- Ipotesi (non verificata): avviato come amministratore, il processo parte da `C:\Windows\System32`. Così EngineFixes, nel caricamento anticipato, non trova `Data/SKSE/Plugins/versionlib-1-6-1170-0.bin` (percorso relativo) e mostra il popup *"Failed to locate an appropriate address library"*. Lo stesso avvio come amministratore spiega il blocco al caricamento del 30/09. **Verifica:** con `EngineFixes_preload.txt` ripristinato, avviare `skse64_loader.exe` a mano. Se il popup non compare, l'ipotesi è confermata.
- **SkyMP non ha bisogno di un launcher.** Il client sono file da copiare nella cartella del gioco, più `Data\Platform\Plugins\skymp5-client-settings.txt` con `server-ip` e `server-port`. Si avvia con `skse64_loader.exe`. Fonti: `docs/docs_client_installation.md` e `cmake/scripts/generate_client_settings.cmake` nel repo `skyrim-multiplayer/skymp`.

## Obiettivo della sessione

**Server SkyMP nostro in locale, con il client collegato senza il launcher di skymp.net.**

1. Ottenere server e client: build dal repo `skyrim-multiplayer/skymp` (cartelle `build/dist/server` e `build/dist/client`) oppure, se esistono, build già pronte. Valutare prima quale strada è più rapida.
2. Server: `server-settings.json` con `ip` `127.0.0.1`, avvio con `launch_server.bat`.
3. Client: copiare i file nella cartella del gioco. Attenzione a non rompere i plugin installati dal launcher ufficiale: fare prima un elenco di cosa c'è e cosa verrebbe sovrascritto. Generare `skymp5-client-settings.txt` in **modalità offline** (`gameData.profileId`, `master` vuoto: vedi lo script cmake).
4. Avvio con `skse64_loader.exe`, doppio clic, senza amministratore. Obiettivo raggiunto quando il client entra nel nostro server **due volte di fila**.
5. Poi: le verifiche 🔬 di `skymp_funzionalita.md` (EmptyWorld, gamemode minimo, aggancio dei nostri `.esp`).

Se un passo si blocca per più di 30 minuti: annotarlo in `skymp_spike.md`, preparare la domanda per il Discord di SkyMP e passare oltre.

## Dove scrivere i risultati

- `specs/platform/skymp_spike.md`: sezione 1 (problemi incontrati; il punto 2 sul popup di EngineFixes e il punto 4 sull'aggiornamento di Steam vanno chiusi con l'esito), sezioni 2 e 4-8 ancora da compilare.
- Idee per il nostro launcher (Step 5): `ROADMAP.md`, voce "Da valutare: controllo automatico della versione di Skyrim".
