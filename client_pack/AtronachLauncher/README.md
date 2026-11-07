# Launcher Atronach RP (prototipo)

Specifica completa: `specs/platform/launcher.md`.

| File | Cosa è |
|---|---|
| `Avvia Atronach RP.bat` | Il file su cui fa doppio clic il giocatore |
| `launcher.ps1` | La finestra del launcher (controlli, pulsanti, avvio del gioco) |
| `config.json` | Nome, indirizzo e porta del server, versione di Skyrim, link di guida e Discord |

## Come provarlo (team)

1. Fai **Pull** del repo.
2. In `config.json` metti l'indirizzo del server su cui provi (per il server locale: `127.0.0.1`, porta `7777`).
3. Doppio clic su `client_pack\AtronachLauncher\Avvia Atronach RP.bat` (**non** come amministratore).
4. Sistema i punti rossi con i pulsanti, poi premi **GIOCA**.

Se qualcosa non va: il log è in `%APPDATA%\AtronachRP\launcher.log`, oppure premi **Report per lo staff**.

Il launcher scrive solo in `%APPDATA%\AtronachRP\`, nelle impostazioni del client SkyMP (di cui salva prima una copia in `%APPDATA%\AtronachRP\skymp5-client-settings.originale.txt`) e, se glielo chiedi, nelle impostazioni di Steam per Skyrim. Per tornare al server ufficiale ricopia quella copia, oppure usa `client_pack\SkyMP\client_profilo.bat ufficiale`.
