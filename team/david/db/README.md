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
| `creatures.json` | 🟨 bozza | 25 creature (pesci, boschi, montagna, lupo incluso) con habitat, comportamento, drop e piccolo bottino 10%. Percentuali completate il 20 ott 2026 con #animali-e-loot; restano `null` solo Falco e Uovo di pesce macellaio |
| `loot.json` | 🟨 bozza (20 ott) | Loot di 86 creature dal Discord del 18 ott: 33 animali e 53 mostri (draugr, banditi, maghi, negromanti, Rinnegati, vampiri, licantropi, Falmer, chaurus, Thalmor, giganti, troll, drago, orchi). Regola "niente oggetti magici" in `rules` |
| `crafting.json` | ✅ dati del gioco (20 ott) | Ricette per costruire le 50 voci di #lista-armi-e-armature (armi, frecce, balestre, corazze: solo il busto), con fonderia e conceria. 47 costruibili, 77 ricette, nomi italiani dal gioco. Si interroga con `tools/query_crafting.py` |
| `world_summary.json`, `world_refs.csv` | ✅ dati reali | Piante, alberi e animali piazzati in Eastmarch e Rift (coordinate, tipo, bioma), letti da `Skyrim.esm` |
| `zones.json` | 🟨 bozza | % di terreno per feudo, 10 luoghi, confine, conteggio icone. Mancano i poligoni veri (solo schema a mano) |
| `spawn_rules.json` | 🟨 bozza (20 ott) | Regole generali (respawn ogni ora, niente spawn nei luoghi sicuri), terreno → specie, schema dei gruppi (gruppi veri da decidere in gioco), 5 accampamenti di giganti con forzieri, 2 forti degli orchi |
| `races.json` | 🟨 provvisorio | 10 razze: bonus abilità, potere giornaliero, passive, ruoli ideali, proposte alternative (molti valori 'da cambiare' nel Discord) |
| `spells.json` | 🟨 provvisorio | 81 voci di incantesimi: permessi (44), vietati (14), limitati a quest/evento/staff/fazione/dungeon/shop (23) |
| `progression.json` | 🟨 bozza | Sistema exp e livelli di Shoonish; mancano exp per livello, azioni e perk |
| `world_rules.json` | 🟨 bozza | Ciclo giorno/notte e struttura di una città (tetto 70 player da rivalutare su SkyMP) |
| `tools/` | | `build_loot_spawn.py` (genera `loot.json` e `spawn_rules.json` dai testi in `discord_2026-10-18/`), `build_db.py` (genera i JSON), `data_ingredients.py` e `data_world.py` (dati grezzi), `build_discord.py` (razze, incantesimi, progressione, regole di mondo), `validate_db.py` (controlli) |

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
python3 build_loot_spawn.py ..
python3 validate_db.py ..
```

- `python3`: l'interprete Python.
- `build_db.py` / `build_loot_spawn.py` / `validate_db.py`: i due script che generano i JSON e quello che li controlla.
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

## Canali Discord del 18 ottobre 2026 (letti il 20 ottobre)

Nuove sezioni "SPAWN e CODICI DI SPAWN" e "MAPPA DI GIOCO", scritte da Dave_St. Testo copiato in `tools/discord_2026-10-18/` (fonte di `build_loot_spawn.py`).

- **#animali-e-loot, #mob-mostri-e-loot, #come-leggere-le-percentuali** → `loot.json`. Le % sono la probabilità di trovare almeno uno di quell'oggetto, per un personaggio di livello ~30. Mammut e ragno del gelo gigante compaiono in entrambi i canali: si tiene la riga degli animali, l'altra è in `alt_listing`.
- **#funzione-e-info-generali** → `loot.json` → `rules`: niente oggetti magici o incantati nel loot (sostituiti con la versione normale o tolti; via bastoni, pergamene, tomi, gemme dell'anima). Descrive come **già funzionanti sul server** i comandi `evoca_…`, il loot con E/R, il file `magic-swap.json` e un `CombatSettings.esp` corretto: **nessuno di questi è nel repo**.
- **#spawn-linee-generali, #lore-e-spawn-giganti-e-mammut, #forti-degli-orchi** → `spawn_rules.json`.
- **#mappa-che-vedranno-i-player** → `spawn_rules.json` → `general.safe_place_kinds` (capitale, paesi, miniere, baracche = luoghi sicuri).
- #mappa-di-gioco e #comandi-spawn: solo immagini o vuoti.

**Differenze con il database del 14 ottobre (da decidere, non cambiate):**
- Alce: il Discord ora dice "Pelle di alce", `creatures.json` dice `Deer Hide`.
- Gatto dai denti a sciabola: ora Occhio 50% **e** Dente 50% separati; `creatures.json` ha "Tooth OR Eye" 50%.
- Capra: piccolo tesoro 19% (equivale ai due 10% già presenti: 1 − 0,9 × 0,9 ≈ 0,19).
- In `#lore-e-spawn-giganti-e-mammut` le sezioni "Alchimia: ingredienti avanzati", "Respawn" e "Cosa è fatto e cosa no" sono nell'indice ma non ancora scritte.
- Gli animali nuovi (lepre, alce femmina, capra domestica, lupo rosso, orso, granchi, horker, cavalli, mucca, gallina, cane, cinghiale) sono solo in `loot.json`, non in `creatures.json` (che ha habitat e comportamento).

## Ricette di forgia e interrogazione (20 ottobre 2026)

`tools/xedit/build_crafting.py` legge le ricette (record COBJ) da `Skyrim.esm`, `Update.esm`, `Dawnguard.esm`, `HearthFires.esm` e `Dragonborn.esm`, cioè gli stessi file che carica il server del repo (`configs/skymp/server-settings.json`). I nomi italiani li prende dai file Strings dentro `Skyrim - Interface.bsa`. Tiene solo gli oggetti di #lista-armi-e-armature e tutto ciò che serve per costruirli. Le ricette per migliorare gli oggetti (banco da lavoro, mola) non sono incluse.

**Interrogare una ricetta** (dalla cartella `tools/`; su Windows il comando può essere `py` invece di `python`):

```
python query_crafting.py "armatura d'acciaio"
python query_crafting.py "spada elfica" --quanti 5
python query_crafting.py --lista
python query_crafting.py "arco nanico" --md prospetto.md
```

- `query_crafting.py`: lo script che stampa il prospetto.
- `"armatura d'acciaio"`: il nome dell'oggetto, tra virgolette perché contiene spazi. Va bene il nome del Discord, quello del gioco o una parte del nome (se ci sono più risultati, li elenca).
- `--quanti 5`: calcola per 5 pezzi (lavorazioni e avanzi compresi).
- `--lista`: elenca tutto ciò che si può interrogare (● costruibile, ○ senza ricetta).
- `--md prospetto.md`: salva il prospetto anche nel file indicato, da incollare su Discord o GitHub.
- `--no-colori`: stampa senza colori.

Il prospetto ha tre parti: **come si costruisce** (banco, perk, job, materiali), **componenti base** (lingotti e strisce, con quante lavorazioni servono e cosa avanza) e **risorse totali** (minerali e pelli grezze, con miniere, animali e job da `zones.json`, `loot.json`, `spawn_rules.json`, `jobs.json`). Quando una risorsa si ottiene in più modi (la Pelle da 16 pelli diverse, il metallo nanico da 6 rottami Dwemer) le alternative sono raggruppate per resa.

**Rigenerare `crafting.json`** (serve una volta sola, o se cambiano i file del gioco):

```
pip install lz4
python xedit/build_crafting.py .. "C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition\Data"
```

- `pip install lz4`: installa la libreria che decomprime l'archivio `.bsa` dei nomi italiani.
- `xedit/build_crafting.py`: lo script che legge i file di gioco.
- `..`: dove scrivere `crafting.json` (la cartella `db/`).
- l'ultimo argomento: la cartella `Data` di Skyrim.

**Cose emerse:**
- **Pietra lunare e mercurio non hanno miniere nei due feudi** (nel database). Servono per tutte le armi elfiche e di vetro e per le corazze elfica e di vetro: senza una fonte non si possono costruire con risorse locali.
- Senza ricetta nel gioco base: Arco lungo, Arco da caccia, Corazza di pelliccia (si trovano o si comprano).
- "Armatura di cuoio" del Discord = **Corazza di cuoio** del gioco (Hide). La Corazza di pelle (Leather) non è nella lista.
- Le frecce si fanno a 24 per volta alla Forgia: 1 legna + 1 lingotto (ferro, acciaio, metallo nanico o pietra lunare). Le ricette vengono da Dawnguard.
- **`CombatSettings.esp` cambia tutto il crafting.** È nella cartella `Data` del PC di David ma non nel server del repo. Contiene circa 4.100 ricette nuove e sostituisce quelle base: per esempio la Corazza d'acciaio non si fa più alla Forgia con 4 lingotti, ma al banco "ArmorTableB" con un semilavorato ("Steel Cuirass Carcase") fatto di piastre e imbottiture, più pelli conciate, lacci e pelliccia. I nomi dei nuovi oggetti sono in inglese e alcuni passaggi (lingotti "roventi") non sono ricette ma script. Se il server userà quel plugin, `crafting.json` va rifatto su quei dati: lo script è già pronto ad aggiungerlo all'ordine di caricamento, ma l'albero è molto più lungo.
