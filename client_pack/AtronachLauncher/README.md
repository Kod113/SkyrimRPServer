# Launcher Atronach RP (prototipo, v0.3)

Specifica completa: `specs/platform/launcher.md`.

| File | Cosa è |
|---|---|
| `Avvia Atronach RP.bat` | Il file su cui fa doppio clic il giocatore |
| `launcher.ps1` | I controlli, cosa fanno i pulsanti, l'installazione e l'avvio del gioco |
| `finestra.xaml` | L'aspetto della finestra (WPF): posizioni, colori, pulsanti |
| `risorse\` | Sfondo (`sfondo.jpg`), icona (`icona.ico`) e carattere del titolo (Cinzel, licenza OFL) |
| `config.json` | Nome e frase sotto il titolo, server, versione di Skyrim, link di client SkyMP e SKSE, comandi del downgrade, link di guida e Discord |
| `Imposta server.bat` + `imposta_server.ps1` | Sceglie un server diverso **solo su questo PC** (es. quello di David via Tailscale), senza toccare `config.json` |

## Per i giocatori (e per chi non ha ancora niente sul PC)

Serve solo **Skyrim Special Edition installato da Steam**.

1. Scarica lo zip (`pacchetto_giocatori/AtronachRP.zip` nel repo, oppure **https://github.com/Kod113/SkyrimRPServer/releases/download/launcher/AtronachRP.zip**), estrailo (tasto destro → *Estrai tutto*).
2. Doppio clic su **`Avvia Atronach RP.bat`**. Se Windows dice *"Windows ha protetto il PC"*: **Ulteriori informazioni → Esegui comunque**.
3. Premi **SISTEMA TUTTO**. Il launcher, dall'alto in basso:
   - blocca gli aggiornamenti automatici di Skyrim (chiude Steam un attimo, chiedendo prima);
   - se Skyrim è alla 1.7.x, lo riporta alla **1.6.1170** con la console di Steam: il giocatore fa solo **Ctrl+V e Invio** 3 volte, il launcher gli dice quando;
   - toglie la spunta "Esegui come amministratore" da Steam, Skyrim e SKSE;
   - scarica e installa **SKSE 2.2.6** e il **client SkyMP** dello stesso server che usiamo (`jqntn-2026-10-05`);
   - imposta il server e dà al giocatore un **numero di giocatore** (da comunicare allo staff);
   - se `server_ip` è `127.0.0.1` e in `config.json` c'è `mondo_locale` attivo, prepara **il mondo del giocatore**: Node.js portatile (controllato con SHA-256) e il server SkyMP della stessa release, in `%APPDATA%\AtronachRP\mondo`. Il server si accende quando si preme GIOCA, in una finestra ridotta a icona; se un server è già acceso sulla porta 7777 (per esempio `server_locale.bat`) usa quello.
4. Quando hanno tutti la spunta verde il pulsante diventa **GIOCA**. Ogni riga ha anche il suo pulsante, per sistemare un passo alla volta.

In basso a sinistra: **Guida**, **Discord** (solo se in `config.json` c'è il link), **Report per lo staff** e **Icona sul Desktop**.

Lo zip lo crea da sola l'Action `pacchetto_launcher.yml` a ogni modifica di questa cartella su `main`: il link resta sempre lo stesso.

## Per il team (dal repo)

1. Fai **Pull** del repo.
2. Server sul tuo PC: va bene `config.json` così com'è (`127.0.0.1`, porta `7777`).
   Server su un altro PC: doppio clic su `Imposta server.bat` e scrivi il suo indirizzo (es. `100.x.y.z` di Tailscale). Si salva in `%APPDATA%\AtronachRP\server.json`, che ha la precedenza su `config.json`; `Imposta server.bat nessuno` lo toglie.
3. Doppio clic su `client_pack\AtronachLauncher\Avvia Atronach RP.bat` (**non** come amministratore) e premi **SISTEMA TUTTO**.

⚠️ **Chi ha già il client di skymp.net:** il launcher lo sostituisce con il client del nostro server (`jqntn-2026-10-05`), così tutti i PC del team hanno lo stesso client e si collegano tra loro. Le impostazioni del client e il numero di giocatore restano quelli di prima. La password di rete del client ufficiale (`Data\Platform\Distribution\password`) viene spostata in `%APPDATA%\AtronachRP\password.client-ufficiale`.

## Dove scrive

- `%APPDATA%\AtronachRP\`: impostazioni (cartella di Skyrim, numero di giocatore), log, copie di sicurezza, `7zr.exe` se serve.
- Cartella di Skyrim: file del downgrade, SKSE, client SkyMP in `Data\`, il file `atronach-skymp-client.txt` (versione del client installata).
- Impostazioni di Steam per Skyrim (`appmanifest_489830.acf`, solo "aggiorna quando lo avvio") e `%LOCALAPPDATA%\Skyrim Special Edition\ContentCatalog.txt`, che dopo il downgrade viene spostato in `%APPDATA%\AtronachRP\`.
- I file scaricati per il downgrade (`Steam\steamapps\content\app_489830\`) vengono cancellati alla fine.

Per tornare al server ufficiale: ricopia `%APPDATA%\AtronachRP\skymp5-client-settings.originale.txt`, oppure usa `client_pack\SkyMP\client_profilo.bat ufficiale`.

## Cambiare testi e grafica

- **Nome e frase sotto il titolo:** `nome` e `sottotitolo` in `config.json`.
- **Colori, misure, posizioni:** `finestra.xaml`. I colori principali sono in cima al file (`Brina`, `Nebbia`, `Brace`, `Pronto`).
- **Sfondo:** sostituisci `risorse\sfondo.jpg` (1920 × 1200).

`launcher.ps1` va salvato come **UTF-8 con BOM**: senza, le lettere accentate si vedono male.

**Prova senza toccare il PC:** `powershell -NoProfile -ExecutionPolicy Bypass -STA -File launcher.ps1 -Anteprima C:\Temp\anteprima` apre la finestra, salva le immagini di alcuni stati in quella cartella e si chiude.

## Se qualcosa non va

Il log è in `%APPDATA%\AtronachRP\launcher.log`, oppure premi **Report per lo staff**: crea uno zip sul Desktop con i controlli, il log, le impostazioni del client, la fine del log della console di Steam e i log del gioco.

Per cambiare versione di SkyMP, di SKSE o i comandi del downgrade basta modificare `config.json`.
