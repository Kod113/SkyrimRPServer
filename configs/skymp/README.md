# configs/skymp/

Configurazione del **server SkyMP locale** (offline mode) usato per provare le nostre mod.

| File | Cosa e' |
|---|---|
| `server-settings.json` | Config del server. `client_pack/SkyMP/server_locale.bat` la copia nel server a ogni avvio: **si modifica qui**, non nella cartella del server |
| `skymp5-client-settings.locale.txt` | Impostazioni del client per collegarsi al server locale. Le applica `client_pack/SkyMP/client_profilo.bat locale` |

## Come si usa

1. Server: doppio clic su `client_pack/SkyMP/server_locale.bat` (la prima volta scarica il server in `_locale/`, cartella ignorata da git).
2. Client: `client_pack/SkyMP/client_profilo.bat locale`, poi `client_pack/SkyMP/avvia_skymp.bat`.
3. Per tornare al server ufficiale: `client_pack/SkyMP/client_profilo.bat ufficiale`.

## Note

- **Server usato:** build della fork [jqntn/skymp](https://github.com/jqntn/skymp/releases) (tag `jqntn-2026-10-05`), testata su Skyrim 1.6.1170 + SKSE 2.2.6. Serve **Node.js LTS**. Licenza AGPL-3.0.
- **Offline mode:** niente login Discord. Ogni giocatore ha un `profileId` diverso (Davide 1, David 2): con lo stesso numero si condivide il personaggio.
- **Aggiungere una nostra `.esp`:** in fondo a `loadOrder` qui, e attivarla anche nel client (stesso ordine).
- **Giocare con Davide:** in `skymp5-client-settings.locale.txt` mettere al posto di `127.0.0.1` l'IP Tailscale di chi ospita il server. Porte: UDP 7777 e TCP 3000.
- **Client:** per ora si usa il client installato dal launcher ufficiale. Se non si collega al server locale (versioni troppo diverse), il piano B e' il client della stessa fork, in una copia separata di Skyrim.
