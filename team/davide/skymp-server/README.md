# team/davide/skymp-server/

Copia del **server SkyMP locale di Davide** per Reborn RP: il gamemode (`gamemode.js`), gli script di avvio e i dati che il gamemode legge.
Il server vero gira in `Desktop\Server\skymp-server` sul PC di Davide; questa cartella si aggiorna con `sincronizza_su_github.bat` (vedi sotto).

## Cosa c'è

| File | Cosa è |
|---|---|
| `gamemode.js` | Il gamemode di Reborn RP (script caricato da SkyMP): creature evocate da console, loot dei cadaveri, guerra degli orchi e forti, fauna, raccolta, pesca, mappa custom, comandi admin |
| `server-settings.json` | Impostazioni del server locale (offline, porta 7777, `npcEnabled: false`, console per tutti, load order vanilla + DLC) |
| `guardiano.ps1`, `avvia_server_sicuro.bat`, `riavvia_*.bat` | Avvio/riavvio del server; il *guardiano* lo riavvia da solo se crasha o si blocca e scrive i motivi in `crash-log.txt` |
| `chiudi_gioco.bat`, `diagnosi.bat` | Chiude Skyrim; raccoglie CPU e errori di Windows in `diagnosi.txt` |
| `mappa-config.json` | Mappa custom: luoghi visibili ai player, confini |
| `magic-swap.json` | Oggetti magici/incantati → versione normale (0 = tolto dal loot) |
| `weapon-ids.json` | ID delle armi |
| `terra-punti-v4.json`, `quote-montagna.json` | Punti a terra verificati per gli spawn (versione attuale) e quote delle montagne |
| `forts-state.json`, `osserva-forti.json` | Stato e misure dei forti orchi (Riften, Windhelm) |
| `osserva-fauna.json`, `raccolta-consentita.json` | Fauna osservata; oggetti raccoglibili consentiti |
| `pesci-*.json`, `raccolta-*.txt` | Dati raccolti in gioco (pesca, ingredienti, oggetti, bottino, terreno) usati per costruire spawn e loot |
| `sincronizza_su_github.bat` | Copia i file qui dal server locale |

**Non** sono nel repo: i file di SkyMP (`dist_back/`, `scam_native.node`, `data/`), il salvataggio del mondo (`world/`), i log (`npc-log.txt`, `npc-trace.txt`, `server-out.txt`…) e i backup.

## Comandi admin principali (console)

`evoca_<creatura>_<n>`, `evoca_orco`, `sbloccatutto`, e i comandi di prova `fauna`, `macellaio`, `raccolta`, `quota`, `misura`, `misurafort`, `giro`, `giroforti`, `tp`, `vai`, `stato`, `pulisci`, `uccidi`, `loot`.

## Come provarlo

1. Prendi un server SkyMP funzionante (con `dist_back/skymp5-server.js`).
2. Copia dentro tutti i file di questa cartella.
3. In `server-settings.json` correggi i percorsi del `loadOrder` con quelli della tua installazione di Skyrim.
4. Avvia con `avvia_server_sicuro.bat` (o `launch_server.bat`).

## Come si aggiorna

Doppio clic su `sincronizza_su_github.bat` (nel server locale), poi GitHub Desktop → **Commit to main** → **Push origin**.
