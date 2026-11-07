# Ingredienti e pozioni: proposta (gioco base, ricette fisse)

**Autore:** david (con Claude) · **Generato da:** `db/tools/build_alchimia_proposta.py` (non modificare a mano: si cambia lo script e si rilancia)
**Serve a:** fare il confronto con le liste di Alessio (T-005) e Giacomo (T-007). Riferimento: `specs/systems/crafting.md`.

## Regole usate

- **Solo contenuti del gioco base** e solo i **41 ingredienti presenti nei due feudi** (selezione del Discord, `ingredients.json`).
- **Ricette fisse:** in SkyMP il tavolo alchemico del gioco base non funziona, quindi ogni pozione ha la sua ricetta, come alla forgia.
- In ogni ricetta almeno un ingrediente ha davvero quell'effetto nel gioco base (coerenza per chi conosce Skyrim).
- **Tre livelli:** comune, non comune, leggendaria. Più sale il livello, più ingredienti rari servono. Cura, vigore e magicka hanno una versione per livello, **con ingredienti diversi**.
- **Vincolo di Alessio:** nessun ingrediente in più di 4 ricette.
- **Esclusi gli effetti inutili in SkyMP** (vedi in fondo).

## Pozioni (22)

| Pozione | Effetto | Livello | Ingredienti |
|---|---|---|---|
| Pozione di cura minore | Ripristina Salute | 1 (comune) | 2 × Fiore di montagna blu |
| Pozione di vigore minore | Ripristina Stamina | 1 (comune) | 1 × Fiore di montagna viola, 1 × Palchi grandi |
| Pozione di magicka minore | Ripristina Magicka | 1 (comune) | 1 × Fiore di montagna rosso, 1 × Grappolo strisciante |
| Resistenza al gelo | Resistenza a Gelo | 1 (comune) | 1 × Mirriam del gelo, 1 × Ramo di cardo |
| Resistenza al fuoco | Resistenza a Fuoco | 1 (comune) | 1 × Lingua di drago, 1 × Bacche di neve |
| Cura malattie | Cura malattie | 1 (comune) | 1 × Piume di falco, 1 × Chitina di granchio di fango |
| Pozione di cura | Ripristina Salute | 2 (non comune) | 1 × Fiore di montagna blu, 1 × Grano |
| Pozione di vigore | Ripristina Stamina | 2 (non comune) | 1 × Artigli d'orso, 1 × Carpa di Hist |
| Pozione di magicka | Ripristina Magicka | 2 (non comune) | 1 × Mora tapinella, 1 × Fiore di montagna rosso |
| Resistenza al veleno | Resistenza a Veleno | 2 (non comune) | 1 × Aglio, 1 × Uovo di pesce macellaio |
| Resistenza ai fulmini | Resistenza a Fulmini | 2 (non comune) | 1 × Fungo luminoso, 1 × Becco di falco |
| Respirare sott'acqua | Respirare sott'acqua | 2 (non comune) | 1 × Cirripede nordico, 1 × Salmon Roe |
| Potenzia salute | Potenzia Salute | 2 (non comune) | 1 × Artigli d'orso, 1 × Fungo luminoso |
| Potenzia magicka | Potenzia Magicka | 2 (non comune) | 1 × Uva jazbay, 1 × Carpa di Hist |
| Potenzia capacità di carico | Potenzia Capacità di carico | 2 (non comune) | 1 × Grappolo strisciante, 1 × Pholiota squamosa |
| Rigenera vigore | Rigenera Stamina | 2 (non comune) | 1 × Mora tapinella, 1 × Pholiota squamosa |
| Rigenera salute | Rigenera Salute | 2 (non comune) | 1 × Aglio, 1 × Cirripede nordico |
| Pozione di cura suprema | Ripristina Salute | 3 (leggendaria) | 1 × Occhio di tigre dai denti a sciabola, 1 × Erba vescicante, 1 × Grano |
| Pozione di vigore suprema | Ripristina Stamina | 3 (leggendaria) | 1 × Dente di tigre dai denti a sciabola, 1 × Salmon Roe, 1 × Silverside Perch |
| Pozione di magicka suprema | Ripristina Magicka | 3 (leggendaria) | 1 × Orecchio d'elfo, 1 × Mora tapinella, 1 × Grappolo strisciante |
| Resistenza alla magia | Resistenza a Magia | 3 (leggendaria) | 1 × Corona sanguinante, 1 × Nirnroot |
| Invisibilità | Invisibilità | 3 (leggendaria) | 1 × Nirnroot, 1 × Denti di spettro del ghiaccio |

## Veleni (6)

| Veleno | Effetto | Livello | Ingredienti |
|---|---|---|---|
| Veleno debilitante | Danneggia Stamina | 1 (comune) | 1 × Radice di canis, 1 × Coda a vanga cyrodiliana |
| Veleno | Danneggia Salute | 1 (comune) | 1 × Coda di skeever, 1 × Betta di fiume |
| Veleno rallentante | Rallentamento | 2 (non comune) | 1 × Palchi grandi, 1 × Betta di fiume |
| Veleno persistente | Danno persistente Salute | 2 (non comune) | 1 × Squame di pesce macellaio, 1 × Uovo di pesce macellaio |
| Veleno di belladonna | Danneggia Salute | 2 (non comune) | 1 × Belladonna, 1 × Palchi piccoli |
| Veleno paralizzante | Paralisi | 3 (leggendaria) | 2 × Radice di canis, 1 × Grasso di troll |

## Ingredienti (41 presenti nei feudi)

| Ingrediente | `id` | Tipo | Rarità | Dove | Usato in | Note |
|---|---|---|---|---|---|---|
| Bacche di neve | `snowberries` | pianta | comune | Eastmarch (piante: Eastmarch 274, Rift 76) | 1: Resistenza al fuoco |  |
| Becco di falco | `hawk_beak` | animale | comune | entrambi | 1: Resistenza ai fulmini |  |
| Betta di fiume | `river_betty` | animale | comune | nei feudi (quale non indicato) | 2: Veleno, Veleno rallentante |  |
| Carpa di Hist | `histcarp` | animale | comune | nei feudi (quale non indicato) | 2: Pozione di vigore, Potenzia magicka |  |
| Chitina di granchio di fango | `mudcrab_chitin` | animale | comune | nei feudi (quale non indicato) | 1: Cura malattie |  |
| Coda a vanga cyrodiliana | `cyrodilic_spadetail` | animale | comune | nei feudi (quale non indicato) | 1: Veleno debilitante |  |
| Coda di skeever | `skeever_tail` | animale | comune | entrambi | 1: Veleno |  |
| Fiore di montagna blu | `blue_mountain_flower` | pianta | comune | entrambi (piante: Eastmarch 227, Rift 407) | 2: Pozione di cura minore, Pozione di cura |  |
| Fiore di montagna rosso | `red_mountain_flower` | pianta | comune | entrambi (piante: Eastmarch 145, Rift 465) | 2: Pozione di magicka minore, Pozione di magicka |  |
| Fiore di montagna viola | `purple_mountain_flower` | pianta | comune | entrambi (piante: Eastmarch 261, Rift 450) | 1: Pozione di vigore minore |  |
| Grappolo strisciante | `creep_cluster` | pianta | comune | Eastmarch (piante: Eastmarch 242, Rift 0) | 3: Pozione di magicka minore, Potenzia capacità di carico, Pozione di magicka suprema |  |
| Lingua di drago | `dragons_tongue` | pianta | comune | Eastmarch (piante: Eastmarch 555, Rift 2) | 1: Resistenza al fuoco |  |
| Mirriam del gelo | `frost_mirriam` | pianta | comune | entrambi (piante: Eastmarch 0, Rift 2) | 1: Resistenza al gelo | Dal Discord: 260 rami in 162 luoghi (il conteggio delle piante del gioco ne trova pochi perché crescono sugli alberi) |
| Palchi grandi | `large_antlers` | animale | comune | entrambi | 2: Pozione di vigore minore, Veleno rallentante |  |
| Palchi piccoli | `small_antlers` | animale | comune | nei feudi (quale non indicato) | 1: Veleno di belladonna |  |
| Pholiota squamosa | `scaly_pholiota` | fungo | comune | Rift (piante: Eastmarch 1, Rift 179) | 2: Potenzia capacità di carico, Rigenera vigore |  |
| Pinna lunga di Abecea | `abecean_longfin` | animale | comune | nei feudi (quale non indicato) | **nessuna ricetta** |  |
| Piume di falco | `hawk_feathers` | animale | comune | entrambi | 1: Cura malattie |  |
| Radice di canis | `canis_root` | pianta | comune | Rift (piante: Eastmarch 9, Rift 375) | 2: Veleno debilitante, Veleno paralizzante |  |
| Ramo di cardo | `thistle_branch` | pianta | comune | Eastmarch (piante: Eastmarch 137, Rift 36) | 1: Resistenza al gelo |  |
| Salmon Roe | `salmon_roe` | animale | comune | nei feudi (quale non indicato) | 2: Respirare sott'acqua, Pozione di vigore suprema | Presente solo per deduzione (README del database) |
| Silverside Perch | `silverside_perch` | animale | comune | nei feudi (quale non indicato) | 1: Pozione di vigore suprema | Presente solo per deduzione (README del database) |
| Uovo di pesce macellaio | `slaughterfish_egg` | animale | comune | nei feudi (quale non indicato) (piante: Eastmarch 37, Rift 115) | 2: Resistenza al veleno, Veleno persistente |  |
| Uva jazbay | `jazbay_grapes` | pianta | comune | Eastmarch (piante: Eastmarch 344, Rift 0) | 1: Potenzia magicka |  |
| Aglio | `garlic` | pianta | non comune | entrambi (piante: Eastmarch 0, Rift 6) | 2: Resistenza al veleno, Rigenera salute | Fattorie e cucine |
| Artigli d'orso | `bear_claws` | animale | non comune | entrambi | 2: Pozione di vigore, Potenzia salute |  |
| Belladonna | `nightshade` | pianta | non comune | Eastmarch (piante: Eastmarch 25, Rift 7) | 1: Veleno di belladonna |  |
| Cirripede nordico | `nordic_barnacle` | animale | non comune | entrambi (piante: Eastmarch 36, Rift 57) | 2: Respirare sott'acqua, Rigenera salute |  |
| Dente di tigre dai denti a sciabola | `sabre_cat_tooth` | animale | non comune | entrambi | 1: Pozione di vigore suprema |  |
| Fungo luminoso | `glowing_mushroom` | fungo | non comune | entrambi | 2: Resistenza ai fulmini, Potenzia salute |  |
| Grano | `wheat` | pianta | non comune | Eastmarch (piante: Eastmarch 32, Rift 14) | 2: Pozione di cura, Pozione di cura suprema | Fattorie (Hollyfrost Farm) |
| Mora tapinella | `mora_tapinella` | fungo | non comune | entrambi (piante: Eastmarch 70, Rift 28) | 3: Pozione di magicka, Rigenera vigore, Pozione di magicka suprema |  |
| Occhio di tigre dai denti a sciabola | `eye_of_sabre_cat` | animale | non comune | entrambi | 1: Pozione di cura suprema |  |
| Squame di pesce macellaio | `slaughterfish_scales` | animale | non comune | nei feudi (quale non indicato) | 1: Veleno persistente |  |
| Amanita muscaria | `fly_amanita` | fungo | raro | entrambi (piante: Eastmarch 0, Rift 9) | **nessuna ricetta** |  |
| Corona sanguinante | `bleeding_crown` | fungo | raro | entrambi (piante: Eastmarch 1, Rift 13) | 1: Resistenza alla magia |  |
| Denti di spettro del ghiaccio | `ice_wraith_teeth` | animale | raro | Eastmarch | 1: Invisibilità |  |
| Erba vescicante | `blisterwort` | fungo | raro | Rift (piante: Eastmarch 0, Rift 3) | 1: Pozione di cura suprema |  |
| Grasso di troll | `troll_fat` | animale | raro | entrambi | 1: Veleno paralizzante |  |
| Nirnroot | `nirnroot` | pianta | raro | Rift | 2: Resistenza alla magia, Invisibilità | Nel Rift solo a Sarethi Farm |
| Orecchio d'elfo | `elves_ear` | pianta | raro | entrambi (piante: Eastmarch 0, Rift 1) | 1: Pozione di magicka suprema | Quasi assente in natura nei feudi |

**Ingredienti presenti ma non usati in nessuna ricetta (2):** Amanita muscaria, Pinna lunga di Abecea. Restano utili come merce, per la cucina o per ricette future.

## Effetti esclusi

| Effetto | Perché |
|---|---|
| Potenzia <abilità> (Una mano, Furtività, Forgiatura, Scasso…) | In SkyMP le abilità sono spente e il danno usa una formula semplificata: questi effetti non fanno niente. |
| Frenesia, Paura | Indicate da Davide come inutili nella riunione del 29/10; con i giocatori al posto degli NPC non hanno senso. |
| Debolezze (al fuoco, al gelo, alla magia, al veleno) | Si possono aggiungere più avanti per il PvP; per ora "less is better". |
| Devasta salute/magicka/stamina, Danneggia magicka e rigenerazioni | Doppioni dei veleni tenuti; aggiungibili più avanti. |
| Potenzia stamina, Rigenera magicka | Si possono fare con gli ingredienti presenti: lasciate fuori per tenere la lista corta. Da valutare con Alessio. |

## Controlli automatici

- ✅ Tutti gli ingredienti usati esistono e sono presenti nei feudi.
- ✅ In ogni ricetta almeno un ingrediente ha l'effetto della pozione.
- ⚠️ Veleno paralizzante: Grasso di troll non ha l'effetto «Paralisi» nel gioco base (scelta per alzare la rarità)

## Da verificare in gioco

- In SkyMP gli **effetti a durata** (resistenze, potenzia, rigenera, veleni persistenti, paralisi, invisibilità) potrebbero non funzionare (`skymp_funzionalita.md`, Step 4). Se è così, nella prima versione restano solo le pozioni di **ripristino** e i veleni a danno immediato.
