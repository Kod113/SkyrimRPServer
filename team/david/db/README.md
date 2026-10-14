# Database JSON del server (bozza 0.1.0)

**Autore:** david (con Claude) · **Data:** 14 ottobre 2026
**Stato:** bozza in `team/david/db/`. Quando diventa definitiva si sposta nei file condivisi (branch + pull request, vedi `CLAUDE.md`). La posizione finale (es. `configs/data/`) la decide il responsabile dev.

## Cosa c'è

| File | Stato | Contenuto |
|---|---|---|
| `ingredients.json` | ✅ completo | 110 ingredienti: nomi, plugin, ID, 4 effetti, tipo, disponibilità nei feudi |
| `effects.json` | ✅ completo | 55 effetti (35 pozioni, 20 veleni), ingredienti per effetto, ricetta minima nei feudi |
| `prices.json` | ✅ completo | Fasce di prezzo, regole di equilibrio, guadagni e stipendi |
| `jobs.json` | ✅ completo (tranne `allowed_actions`) | Catena economica dei job, bacheca, ruolo di partenza proposto |
| `creatures.json` | 🟨 bozza | 25 creature (pesci, boschi, montagna, lupo incluso) con habitat, comportamento, drop e piccolo bottino 10%. Mancano le % di alcuni drop (non indicate nel Discord) |
| `world_summary.json`, `world_refs.csv` | ✅ dati reali | Piante, alberi e animali piazzati in Eastmarch e Rift (coordinate, tipo, bioma), letti da `Skyrim.esm` |
| `zones.json` | 🟨 bozza | % di terreno per feudo, 10 luoghi, confine, conteggio icone. Mancano i poligoni veri (solo schema a mano) |
| `spawn_rules.json` | ⬜ scheletro | Si compila dopo lo spike sullo spawn |
| `races.json` | 🟨 provvisorio | 10 razze: bonus abilità, potere giornaliero, passive, ruoli ideali, proposte alternative (molti valori 'da cambiare' nel Discord) |
| `spells.json` | 🟨 provvisorio | 81 voci di incantesimi: permessi (44), vietati (14), limitati a quest/evento/staff/fazione/dungeon/shop (23) |
| `progression.json` | 🟨 bozza | Sistema exp e livelli di Shoonish; mancano exp per livello, azioni e perk |
| `world_rules.json` | 🟨 bozza | Ciclo giorno/notte e struttura di una città (tetto 70 player da rivalutare su SkyMP) |
| `tools/` | | `build_db.py` (genera i JSON), `data_ingredients.py` e `data_world.py` (dati grezzi), `build_discord.py` (razze, incantesimi, progressione, regole di mondo), `validate_db.py` (controlli) |

## Formato comune

Ogni file ha un blocco `_meta` (versione, data, autore, fonti, note) e poi i dati.
Le chiavi sono in inglese (le legge il gamemode), i testi per i giocatori in italiano (`name_it`).

## Campi di `ingredients.json`

- `id`: identificativo interno (minuscolo, senza spazi). Gli altri file lo usano per riferirsi all'ingrediente.
- `name_en` / `name_it`: nome inglese (quello del gioco) e nome italiano usato nel Discord. `name_it` è `null` dove il Discord non lo cita.
- `stats` (solo 19 ingredienti da creature/pesci): `value`, `weight`, `other_uses` dalle tabelle del Discord.
- `type`: `pianta`, `fungo`, `animale` (parti, uova, insetti, pesci) o `altro` (sali, polveri, parti demoniache o non morte). **Classificazione provvisoria**, per i soli ingredienti citati nel Discord è quella del Discord.
- `plugin`: da quale file di gioco viene (`Skyrim.esm`, `Dawnguard.esm`, `Dragonborn.esm`, `HearthFires.esm`, `_ResourcePack.esl`).
- `uesp_id`: ID scritto su UESP; le lettere `xx` e `FExxx` indicano che le prime cifre dipendono dall'ordine di caricamento.
- `local_form_id`: le ultime cifre dell'ID (valide dentro il proprio plugin).
- `form_id_verified`: `true` se l'ID coincide con il record INGR nei file di gioco (`xedit_ingredients.csv`); `editor_id` è il nome interno del record.
- `effects`: i 4 effetti nell'ordine del gioco (il primo è quello che si scopre mangiando l'ingrediente).
- `feudi.availability`: `both` (Riften e Windhelm), `rift`, `eastmarch`, `present` (nei feudi, hold non specificato), `none` (assente).
- `feudi.source` e `feudi.inferred`: da dove viene il dato. `inferred: true` = non scritto nel Discord, **dedotto** dai conteggi (vedi sotto).

## Come sono stati verificati i dati

1. **Totali per effetto:** per tutti i 55 effetti il numero di ingredienti calcolato coincide con quello scritto nel Discord (#pozioni-alchemiche). Questo conferma che l'elenco dei 110 ingredienti e dei loro effetti è giusto.
2. **Ricette minime:** per ogni coppia indicata nel Discord, entrambi gli ingredienti hanno davvero quell'effetto.
3. **Conteggi nei feudi:** il Discord dice, per ogni effetto, quanti ingredienti sono nei feudi. Dove il dato per ingrediente non era scritto (69 ingredienti su 110), è stato **dedotto** da quei conteggi: se un effetto è già completo, gli altri ingredienti con quell'effetto sono assenti; se il numero mancante coincide con i candidati rimasti, sono tutti presenti. Dopo la deduzione tutti i 55 conteggi tornano.
   Due ingredienti risultano presenti solo per deduzione: **Salmon Roe** e **Silverside Perch**.
4. **Limite:** la deduzione dice se un ingrediente è presente, non in quale feudo (resta `present`). Il Discord può avere un errore di conteggio: una contraddizione verrebbe segnalata dallo script.

## Da fare

- ✅ Fatto (14 ott 2026): ID verificati leggendo direttamente i file di gioco (110/110, vedi sotto). Corretto l'ID di Salt Pile. Restano da verificare gli ID di creature e luoghi quando serviranno.
- Completare le % di drop `null` (volpe, coniglio, ragno del gelo, falco...) e verificare l'habitat del lupo.
- Verificare in gioco confine, boschi e luoghi marcati `certain: false` in `zones.json`.
- Definire `allowed_actions` per ogni job (cosa può fare, quali postazioni e risorse), serve al blocco delle azioni per job.
- Decidere se approvare il ruolo di partenza "Avventuriero" (`jobs.json`, sezione `starting_role_proposal`).
- Dopo lo spike sullo spawn: compilare `spawn_rules.json`.

## Come rigenerare e controllare

Dalla cartella `tools/`:

```
python3 build_db.py ..
python3 validate_db.py ..
```

- `python3`: l'interprete Python.
- `build_db.py` / `validate_db.py`: lo script che genera i JSON e quello che li controlla.
- `..`: la cartella dove scrivere (o da cui leggere) i JSON, cioè quella sopra `tools/` (`team/david/db/`).

I dati vanno modificati in `data_ingredients.py`, `data_world.py` e `build_db.py`, poi si rigenera. Non si modificano a mano i JSON generati.

## Verifica degli ID con i file di gioco (14 ottobre 2026)

`tools/xedit/read_esm_ingredients.py` legge i record INGR da `Skyrim.esm`, `Dawnguard.esm`, `HearthFires.esm`, `Dragonborn.esm`, `_ResourcePack.esl` (Skyrim Special Edition) e li confronta con `ingredients.json`.
- 110/110 ingredienti trovati con l'ID giusto; i 55 effetti corrispondono ai 55 codici di effetto del gioco senza incoerenze.
- Valore e peso del Discord coincidono al 100% con quelli del gioco (19 ingredienti controllati).
- Correzione: l'ID di Salt Pile era sbagliato (`074A19` è un duplicato di quest, con lo stesso nome ma un altro record); quello giusto è `034CDF`.
- Il gioco ha 3 ingredienti in più dei nostri 110 (`FavorThadgeirAshes`, `DBJarrinRoot`, `SaltPile` della quest): sono oggetti di quest, non ingredienti normali.
- Alternativa: `tools/xedit/ExportIngredients.pas` fa lo stesso dentro xEdit (non provato); poi `import_xedit.py`.
- Comando (dalla cartella `tools/`): `python3 -I xedit/read_esm_ingredients.py .. <cartella Data di Skyrim> --write` poi `python3 build_db.py ..`.

## Prossimi passi (14 ottobre 2026, concordati con David)

1. ✅ Rispondere alle domande dello spike leggendo il codice di SkyMP: vedi `team/david/ricerca_skymp_spawn.md`.
2. ✅ Posizioni vere di flora/fauna dai file `.esm`: fatto (vedi sezione sotto). Resta da decidere i confini veri dei feudi.
3. ✅ Ricette di alchimia calcolate nei feudi (`recipes.json`).
4. ⏸ Simulare l'economia dei job: rimandato per scelta di David.
5. ✅ Gamemode: caricatore dei JSON in TypeScript con tipi e test (`gamemode_draft/`).
6. ✅ `allowed_actions` per job e ruolo "Avventuriero": applicati in via provvisoria (vedi `proposta_permessi_job.md`).
7. ✅ Letti i canali Discord rimasti (vedi sezione sotto). Nessuna voce nuova nel database.

## Dati reali del mondo (14 ottobre 2026)

`tools/xedit/build_world.py` legge da `Skyrim.esm` tutte le piante, gli alberi e gli animali piazzati nel mondo (Tamriel) e li assegna a Eastmarch e Rift. Risultato: `world_refs.csv` (39.842 righe: id, tipo, nome interno, ingrediente prodotto, coordinate x/y/z, cella, feudo, bioma) e `world_summary.json`; `zones.json` ha la sezione `game_data` e ogni ingrediente-pianta ha `world_plants` (quante piante nei due feudi).

**Come sono assegnati feudo e bioma (approssimato):** i file di gioco non contengono i confini dei feudi. Ho usato le 911 celle che dichiarano un Location (risalendo al feudo) e le altre prendono il feudo della cella nota più vicina. Il bioma viene dalle regioni meteo/clima del gioco (non dal terreno), e circa metà delle celle non cade in nessuna regione (`unknown`). Vicino al confine l'assegnazione può sbagliare.

**Il gioco conferma il Discord:** Dragon's Tongue 555 a Eastmarch e 2 nel Rift, Jazbay Grapes e Creep Cluster solo a Eastmarch, Canis Root e Scaly Pholiota quasi solo nel Rift, i tre Mountain Flower in entrambi.

**Differenze da decidere (esistono nel gioco ma il nostro database dice "assenti"):** Pine Thrush Egg (67, Rift), Chicken's Egg (29), White Cap (12, Rift), Imp Stool (10), Rock Warbler Egg (9), Deathbell (3, Rift; scritto così nel Discord), Juniper Berries (3), Grass Pod (2), Hanging Moss (2), Namira's Rot (1). Possono essere scelte di design dello staff (spawn modificato) oppure dati del Discord incompleti.

## Canali Discord riletti (14 ottobre 2026)

Decisione di David: nessuna voce nuova, solo più informazioni per le voci già presenti.

- **#piante-e-spawn:** coincide con il database (39 ingredienti, 0 differenze). Conteggi extra, per un'eventuale aggiunta alle voci esistenti: Purple Mountain Flower 1.935 piante in 250 luoghi, Red 1.213 in 180, Frost Mirriam 260 rami in 162 luoghi, Wheat 84 covoni in 13 luoghi (Hollyfrost Farm 11), Creep Cluster 16 luoghi, Scaly Pholiota 41 luoghi, Nirnroot nella Rift solo a Sarethi Farm. Mancano nei feudi: Deathbell, Giant Lichen, Lavender, Pearl, Small Pearl, Swamp Fungal Pod, Tundra Cotton. Hanging Moss: pochi dati.
- **Canali di maggio** (lista ingredienti, crafting, dove reperire): bozze superate. Di 19 ricette con nome solo 4 attivano l'effetto dichiarato con gli effetti reali (Pozione Curativa Base, Magicka Base, Resistenza al Gelo, Veleno Paralizzante). La divisione per categorie può servire a rifinire `type`. Non importati.

Resoconto e decisioni aperte della giornata: `team/david/sessione_2026-10-14.md`.
