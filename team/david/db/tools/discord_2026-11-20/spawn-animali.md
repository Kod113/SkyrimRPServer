# Discord, categoria "Spawn animali e Loot" (Dave_St, 15–20 novembre 2026)

Testo copiato dal Discord il 21/11/2026, fonte di `applica_discord_2026-11-20.py`. Le mappe (immagini) sono nei canali e in `team/davide/mappe-spawn/`.

## Nozioni generali (15/11)

**Dove nascono gli animali.** Ogni animale ha i suoi punti di spawn, sparsi nei feudi di Windhelm e di Riften. Attorno a ogni punto c'è un'area di movimento (il cerchio sulla mappa): l'animale vive e gira lì dentro.

**Regole dei punti di spawn**
- Sempre su terreno percorribile: colline e terreno irregolare sì, pareti e versanti di montagna no.
- In montagna solo su pianori raggiungibili facilmente a piedi.
- Mai sotto terra, mai in acqua, mai dentro case o rocce.
- Lontani dai forti: forti, forti nanici e soprattutto le fortezze degli orchi (Narzulbur e Largashbur). Nessun animale entra nella zona di guerra.
- Lontani dai luoghi sicuri: capitali, paesi, insediamenti, miniere, baracche e stalle.
- Sempre dentro i confini della mappa.

**Rinascita**
- Ogni 30 minuti il server conta gli animali vivi di ogni punto.
- Rinascono solo quelli uccisi, sullo stesso punto. Nessuno spawn in più, nessun accumulo.
- Le nascite avvengono poche alla volta, per non appesantire il server.
- Pesci macellaio: ogni zona d'acqua tiene 5 pesci vivi; ogni 30 minuti rinascono i morti, su punti a caso della zona. Il Mare dei Fantasmi ne tiene 10 (5 vicino a riva + 5 al largo).
- I cadaveri spariscono dopo 30 secondi: lootateli subito.

**Comportamento (IA)**
- L'IA è quella originale di Skyrim: gli animali pacifici fuggono, i predatori cacciano.
- Branchi: lupi e lupi di ghiaccio girano in branchi da 3. Tutti gli altri sono singoli.
- Se un animale esce dalla sua area (per esempio inseguendo qualcuno), smette di combattere e torna a casa camminando, senza teletrasporti.
- Le creature ostili attaccano solo i giocatori. Scelgono il giocatore più vicino e lo tengono come bersaglio finché non muore o sparisce, poi passano al più vicino.
- I gatti dai denti a sciabola attaccano a vista chi si avvicina troppo.

**Loot.** Loot identico a Skyrim, con due regole del server: niente "tesoro" (oro, gemme, anelli) sugli animali; corna sempre al 100%. Per lootare: guarda il cadavere e premi E.

**Rarità.** Comune → tanti punti · Non comune → meno punti · Raro → pochissimi punti.

## Aggiornamento spawn (20/11)
- Tutti i punti di spawn sono dentro i confini del gioco.
- Nessun punto è vicino a dungeon (caverne, rovine, forti, accampamenti di banditi, tane di drago) o agli accampamenti dei giganti.
- Gli animali non si attaccano più tra loro: combattono solo contro i giocatori.
- Mappe nuove nei canali di ogni animale. Pesce macellaio: tolto un punto del fiume Darkwater vicino all'ingresso di una caverna.
- 16/11: un punto della volpe artica e uno dell'alce (feudo di Riften) spostati per lasciare spazio a un accampamento dei giganti.

## Schede degli animali (15/11)

| Animale | Rarità | Punti Windhelm · Riften | Area (unità) | Dove | Comportamento | Loot |
|---|---|---|---|---|---|---|
| Coniglio | Comune | 10 · 10 | 1800 | Pianure e boschi bassi, lontano dai centri abitati | Pacifico: fugge appena vede un giocatore | Coscia di coniglio cruda 100% |
| Cervo | Comune | 10 · 10 | 3000 | Pianure e boschi di entrambi i feudi | Pacifico: fugge | Carne di cervide 100%, Pelle di cervo 100%, Corna grandi 100% |
| Capra | Comune | 10 · 10 | 3000 | Pianori di montagna e zone rocciose raggiungibili | Pacifica: fugge | Pelle di capra 100%, Cosciotto di capra 100% (in Skyrim le capre non hanno corna da lootare) |
| Volpe | Comune | 10 · 10 | 2600 | Boschi e pianure | Pacifica: fugge | Pelliccia di volpe 100% |
| Alce | Non comune | 6 · 6 | 3500 | Boschi e pianure ampie | Pacifico: fugge | Carne di cervide 100%, Pelle di alce 100%, Corna grandi 100% |
| Lupo | Non comune | 6 · 6 branchi (3 lupi) | 4500 | Boschi e pianure | Ostile, in branchi da 3 | Pelliccia di lupo 100% |
| Orso | Raro | 3 · 3 | 4500 | Boschi profondi | Ostile, attacca il giocatore più vicino | Pelliccia di orso 100%, Artigli di orso 100% |
| Gatto dai denti a sciabola | Non comune | 6 · 6 | 4000 | Pianori rocciosi e zone di montagna raggiungibili | Ostile, attacca a vista chi si avvicina | Pelliccia di tigre dai denti a sciabola 100%, uno tra Occhio e Dente 50% / 50% |
| Gatto dai denti a sciabola delle nevi | Raro | 3 · 2 | 4000 | Tundra innevata di Windhelm e pianori più alti di Riften | Ostile, attacca a vista | Pelliccia di tigre dai denti a sciabola delle nevi 100%, uno tra Occhio e Dente 50% / 50% |
| Lupo di ghiaccio | Non comune | 4 · 3 branchi (3 lupi) | 4500 | Tundra innevata e pianori più alti di Riften | Ostile, in branchi da 3 | Pelliccia di lupo dei ghiacci 100% |
| Volpe artica | Comune | 6 · 5 | 2600 | Tundra innevata e pianori più alti di Riften | Pacifica: fugge | Pelliccia di volpe delle nevi 100% |
| Orso delle nevi | Raro | 2 · 2 | 4500 | Tundra innevata e pianori più alti di Riften | Ostile, attacca il giocatore più vicino | Pelliccia di orso delle nevi 100%, Artigli di orso 100% |
| Pesce macellaio | Comune | 5 vivi per zona d'acqua (Mare dei Fantasmi 10) | — | Fiume Bianco, Fiume Darkwater, Ruscello di Eastmarch, Mare dei Fantasmi (riva e largo); Fiume centrale del Rift, Lago Geir, Lago Honrich | Ostile in acqua | Scaglie di pesce macellaio da 1 a 5, 100% |

Tutti: rinascita ogni 30 minuti, solo gli esemplari uccisi, sullo stesso punto. Niente pesci negli stagni dentro città o dungeon, vicino ai luoghi sicuri o nelle zone di guerra.

## Altri canali
- `#creature-dei-boschi`, `#creature-delle-montagne`, `#pesci` (1/11): "Diario del cacciatore" di Eirik Rompighiaccio, testo di lore per i giocatori con gli stessi dati in forma di racconto. Non copiato qui.
