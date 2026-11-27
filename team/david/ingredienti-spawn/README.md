# Modulo "spawn degli ingredienti" per il server (T-008)

**Autore:** david (con Claude) · **Per:** Davide, che gestisce il server e il gamemode.
Spiegazione completa: `team/david/spawn_ingredienti.md`.

| File | Cosa è |
|---|---|
| `ingredienti-spawn.js` | Il modulo: crea le piante, le fa raccogliere e rinascere, comandi di prova |
| `ingredienti-spawn.json` | I dati (copia di `team/david/db/ingredient_spawns.json`, generata dallo script) |

Non tocca il codice esistente: si aggiunge con una riga, e le nostre piante passano prima del blocco `[RACCOLTA]`, che resta com'è per le piante del gioco originale.

## Installazione (Davide, sul server)

1. Copia `ingredienti-spawn.js` e `ingredienti-spawn.json` nella cartella del server (accanto a `gamemode.js`).
2. In fondo a `gamemode.js` (dopo il blocco `[RACCOLTA]`) aggiungi questa riga:
   ```
   try { eval(_fs.readFileSync("ingredienti-spawn.js", "utf8")); } catch (e) { log("[INGREDIENTI] non caricato: " + e); }
   ```
   - `_fs.readFileSync(...)`: legge il file del modulo dalla cartella del server;
   - `eval(...)`: lo fa girare dentro il gamemode, così usa le tue funzioni `log`, `mpPlace`, `mpSet`, `onlineUsers`;
   - `try { } catch (e) { log(...) }`: se qualcosa va storto il server non si ferma, scrive solo l'errore in `npc-log.txt`.
3. Riavvia il server. Dopo 20 secondi il modulo crea le 868 piante (8 ogni 250 ms, circa 30 secondi). Nel log: `[INGREDIENTI] piante create: …`.

Gli id delle piante create si salvano in `ingredienti-spawn-ids.json`: ai riavvii successivi non si ricreano. Se cambia la versione del file dei dati, le piante vecchie si spengono e si rifanno da sole.

## Correzione del mondo vergine (client, `skymp5-client.js`, blocco `[RB-NASCONDI]`)

Le piante che hai visto in giro sono quasi sicuramente **zucche**: la base `TreeGourdCluster01` (`0xBE3E6`, 394 piante, quasi tutte nel Rift) non è in `HIDE_BASES`.

1. Riga con `HIDE_BASES.push(0x2220c, …)`: aggiungi `0xbe3e6` dentro le parentesi.
2. Righe con `findClosestReferenceOfType(bf, px, py, pz, 7000)` e `findRandomReferenceOfType(bf, px, py, pz, 7000)`: porta `7000` a `12000`. Il gioco disegna le piante fino a circa 10.000 unità: con 7.000 quelle lontane si vedono finché non ti avvicini.

Le nostre piante non vengono nascoste: il blocco salta gli oggetti creati dal server (id da `0x05000000` in su).

## Prova

Scrivi una riga in `ingredienti-cmd.txt` (cartella del server); il risultato esce in `ingredienti-result.txt`:
- `stato`: piante registrate, esistenti e al loro posto, piante raccolte in attesa di rinascere;
- `vicino`: i 5 punti più vicini al primo giocatore collegato;
- `tp <id punto>`: porta il primo giocatore collegato sul punto (es. `tp ING-W-lavender-01`; gli id sono in `ingredienti-spawn.json` e nelle mappe);
- `rifai`: spegne e ricrea tutte le piante.

Da controllare: che `stato` dica "868 al loro posto"; che raccogliendo arrivi l'ingrediente; che la pianta rinasca (comuni dopo 30 minuti); a vista che nessuna pianta sia sospesa o dentro una roccia.

**Cosa non è stato provato:** il modulo è stato provato con un server finto (creazione, posizioni, raccolta, comandi: tutto ok), non ancora su SkyMP. I punti da guardare per primi: che `MoveTo` su un oggetto di Skyrim.esm funzioni come con il forziere dei giganti (se non funziona, il modulo prova `SetPosition`), e che la raccolta normale del server dia l'ingrediente anche per le piante create da noi.
