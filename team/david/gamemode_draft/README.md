# Gamemode: caricatore dei database (bozza)

**Autore:** david (con Claude) · **Data:** 14 ottobre 2026
**Stato:** bozza in `team/david/gamemode_draft/`. Non dipende da SkyMP: legge i JSON di `team/david/db/` e offre funzioni semplici. Quando sarà definitiva si sposta nei file condivisi (branch + pull request, vedi `CLAUDE.md`).

## Cosa fa (`src/db.ts`)

| Funzione | A cosa serve | Esempio |
|---|---|---|
| `loadDb(cartella)` | Legge ingredienti, effetti, creature e job | `loadDb("../db")` |
| `ingredientsAvailableIn(db, "rift")` | Ingredienti presenti in un feudo (`present` conta in entrambi) | per decidere cosa vende un mercante |
| `findIngredient(db, "Nirnroot")` | Cerca per id, nome inglese o italiano | per i comandi in chat |
| `brew(db, [id1, id2])` | Effetti attivi di una ricetta (almeno 2 ingredienti in comune, regola di Skyrim) | crafting alchimia |
| `rollDrops(creatura, Math.random)` | Tira i drop di una creatura; i drop con percentuale non nota (`null`) non vengono dati | evento `onDeath` |
| `jobCan(db, "miner", "mine")` | Il job può fare l'azione? `undefined` se i permessi non sono ancora definiti | blocco azioni per job |

## Come provarlo

Dalla cartella `team/david/gamemode_draft/`:

```
npm install
npm test
npm run typecheck
```

- `npm install`: scarica TypeScript e i tipi di Node (solo per il controllo dei tipi, serve una volta).
- `npm test`: esegue gli 8 test (`node --experimental-strip-types --test src/db.test.ts`): `node` avvia Node.js; `--experimental-strip-types` gli fa leggere file `.ts` ignorando i tipi (da Node 22.6; da Node 24 non serve); `--test` usa il lanciatore di test integrato; `src/db.test.ts` è il file dei test.
- `npm run typecheck`: `tsc -p .` controlla i tipi usando `tsconfig.json` (`-p .` = progetto nella cartella corrente), senza produrre file.

## Limiti noti

- `rollDrops` restituisce **nomi** di oggetti (es. `"Venison"`), non gli ID di Skyrim. Per darli al giocatore va aggiunta la tabella nome → ID (da `Skyrim.esm`, come fatto per gli ingredienti).
- I permessi dei job (`allowed_actions`) sono ancora `null`: `jobCan` risponde `undefined` finché non vengono definiti.
- Nessun collegamento con SkyMP: gli eventi (`onDeath`, ecc.) vanno agganciati nel gamemode vero.
