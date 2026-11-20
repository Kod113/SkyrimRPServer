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
| `mappa-config.json` | Mappa pulita (v7): luoghi tenuti, marcatori da nascondere, porte da chiudere e da riaprire, accampamenti militari spenti, marcatori da spostare fuori mappa. Tutto spiegato in `../mappa-pulita.md` |
| `client-mappa-estratto.js` | Estratto (solo lettura) dei blocchi del client `skymp5-client.js` che gestiscono mappa, porte e confini |
| `magic-swap.json` | Oggetti magici/incantati → versione normale (0 = tolto dal loot) |
| `weapon-ids.json` | ID delle armi |
| `terra-punti-v8.json` | Punti di spawn degli animali (versione attuale, 18/11): terreno percorribile, quote vere da Skyrim.esm, dentro il confine del gioco (`BorderRegionSkyrim`), lontani da forti, luoghi sicuri, dungeon e accampamenti dei giganti. Tutto spiegato in `../spawn-debug.md` |
| `terra-punti-v6.json`, `terra-punti-v7.json` | Versioni precedenti dei punti (non più usate dal gamemode) |
| `terra-punti-v4.json`, `quote-montagna.json` | Versione precedente dei punti (non più usata dal gamemode) e quote delle montagne |
| `pesci-punti-v3.json` | Punti dei pesci macellaio (versione attuale, 18/11): senza doppioni né punti vicino a luoghi sicuri, forti o ingressi di caverne (`pesci-punti-v2.json` è la versione precedente) |
| `forts-state.json`, `osserva-forti.json` | Stato e misure dei forti orchi (Riften, Windhelm) |
| `osserva-fauna.json`, `raccolta-consentita.json` | Fauna osservata; oggetti raccoglibili consentiti |
| `pesci-*.json`, `raccolta-*.txt` | Dati raccolti in gioco (pesca, ingredienti, oggetti, bottino, terreno) usati per costruire spawn e loot |
| `sincronizza_su_github.bat` | Copia i file qui dal server locale |

**Non** sono nel repo: i file di SkyMP (`dist_back/`, `scam_native.node`, `data/`), il salvataggio del mondo (`world/`), i log (`npc-log.txt`, `npc-trace.txt`, `server-out.txt`…) e i backup.

## Comandi admin principali (console)

`evoca_<creatura>_<n>`, `evoca_orco`, `sblocca_tutto`, e i comandi di prova `fauna`, `macellaio`, `raccolta`, `quota`, `misura`, `misurafort`, `giro`, `giroforti`, `tp`, `vai`, `stato`, `pulisci`, `uccidi`, `loot`.

## Come provarlo

1. Prendi un server SkyMP funzionante (con `dist_back/skymp5-server.js`).
2. Copia dentro tutti i file di questa cartella.
3. In `server-settings.json` correggi i percorsi del `loadOrder` con quelli della tua installazione di Skyrim.
4. Avvia con `avvia_server_sicuro.bat` (o `launch_server.bat`).

## Come si aggiorna

Doppio clic su `sincronizza_su_github.bat` (nel server locale), poi GitHub Desktop → **Commit to main** → **Push origin**.

## Test automatici (file `autotest-cmd.txt`)

Si scrive una riga nel file `autotest-cmd.txt` (cartella del server). Il risultato esce in `autotest-result.txt`. Per gli spawn: `verifica marcatori`, `verifica loot`, `verifica id <hex,...>`, `fauna misura`, `fauna provaloot tutti` (dettagli in `../spawn-debug.md`). Per la mappa: `mappa stato`, `mappa sblocca 1/0`, `mappa porta <id>`, `mappa guarda <id>`, `mappa esci <id>` (dettagli in `../mappa-pulita.md`).
