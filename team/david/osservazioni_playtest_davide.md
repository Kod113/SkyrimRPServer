# Osservazioni di Davide dopo una sessione di gioco (14 ottobre 2026)

Appunti scritti da Davide mentre giocava, riportati senza modifiche di significato. Non è indicata la versione del server provata. L'ultima riga dell'elenco originale sull'ingresso nelle case era tagliata: "Non ti fa entrare dentro case e" (il resto non è noto).

## Mondo e mappa
- La mappa è già ridotta.
- Il mondo vuoto c'è.
- La città è Open City.
- L'unico luogo accessibile è la taverna.
- Luoghi come le stalle sono accessibili, quindi esiste il job stalliere.
- Non ti fa entrare dentro case (frase incompleta).
- Non c'è viaggio rapido.
- I dungeon sono esplorabili ma vuoti.

## Personaggio e movimento
- La vita non si recupera automaticamente.
- La stamina si recupera davvero troppo lentamente.
- Sotto un determinato livello di stamina non puoi attaccare.
- La velocità di movimento è davvero molto bassa.
- Non c'è skill tree.
- Sono presenti libri che fanno livellare (da togliere).

## Lavori, oggetti e raccolta
- Il lavoro di fabbro è già implementato.
- C'è una bacheca cittadina.
- Gli ingredienti alchemici sono presenti.
- Gli spawn danno dai 2 ai 5 ingredienti a raccolta.
- Il looting non è presente.
- C'è l'animazione nel bere le pozioni.

## Accesso e strumenti
- Si entra senza permessi (logghi senza permessi).
- Esistono modi per far comparire oggetti tramite console.

## Comportamento del gioco
- Mentre apri l'inventario, consulti la mappa o interagisci con oggetti, il mondo non viene messo in pausa.

## Collegamenti con i nostri dati (note di david)
- Bacheca cittadina e fabbro: già presenti in `db/jobs.json` (azioni `post_board`, `take_board`, `smith`).
- Stalliere: non è tra i job di `db/jobs.json`. Da decidere se aggiungerlo.
- Raccolta da 2 a 5 ingredienti: da confrontare con #pozioni-alchemiche (di base un ingrediente per pianta, due con il perk Green Thumb).
- Looting assente: serve per `loot_animal` e per i drop di `db/creatures.json`.
- Nessuno skill tree e libri che fanno livellare: vedi `db/progression.json` (sistema exp da costruire nel gamemode, crescita per uso spenta).
- Stamina e vita: `db/races.json` ha poteri e passive che dipendono dalla rigenerazione (Adrenalina, Pelle d'Hists).
- Mondo non in pausa con inventario e mappa: da tenere presente per le regole di combattimento e di lavoro.
