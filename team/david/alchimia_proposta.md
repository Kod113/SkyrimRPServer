# Ingredienti e pozioni: riferimento (gioco base, ricette fisse)

**Autore:** david (con Claude) · **Stato:** riferimento per l'alchimia (versione rivista a mano, novembre 2026)
**Si modifica a mano.** Lo script `db/tools/build_alchimia_proposta.py` genera la versione vecchia: non va rilanciato, altrimenti sovrascrive questo file.
**Serve a:** fare il confronto con le liste di Alessio (T-005) e Giacomo (T-007). Riferimento: `specs/systems/crafting.md`.

## Regole usate

- **Solo contenuti del gioco base** e solo ingredienti **presenti nei due feudi** (selezione del Discord, `ingredients.json`). Unica eccezione: Dita di gigante (vedi note in fondo).
- **Ricette fisse:** in SkyMP il tavolo alchemico del gioco base non funziona, quindi ogni pozione ha la sua ricetta, come alla forgia.
- In ogni ricetta almeno un ingrediente ha davvero quell'effetto nel gioco base (coerenza per chi conosce Skyrim).
- **Tre livelli:** comune, non comune, leggendaria. Più sale il livello, più ingredienti rari servono. Cura, vigore e magicka hanno una versione per livello, **con ingredienti diversi**.
- **Vincolo di Alessio:** nessun ingrediente in più di 4 ricette.
- **Esclusi gli effetti inutili in SkyMP** (vedi in fondo).

## Pozioni (20)

| Pozione | Effetto | Livello | Ingredienti |
|---|---|---|---|
| Pozione di cura minore | Ripristina Salute | 1 (comune) | 2 × Fiore di montagna blu |
| Pozione di vigore minore | Ripristina Stamina | 1 (comune) | 1 × Fiore di montagna viola, 1 × Palchi grandi |
| Pozione di magicka minore | Ripristina Magicka | 1 (comune) | 1 × Fiore di montagna rosso, 1 × Grappolo strisciante |
| Resistenza al gelo | Resistenza a Gelo | 1 (comune) | 1 × Mirriam del gelo, 1 × Ramo di cardo |
| Resistenza al fuoco | Resistenza a Fuoco | 1 (comune) | 1 × Lingua di drago, 1 × Bacche di neve |
| Cura malattie | Cura malattie | 1 (comune) | 1 × Piume di falco, 1 × Chitina di granchio di fango |
| Pozione di cura | Ripristina Salute | 2 (non comune) | 1 × Fiore di montagna blu, 1 × Grano |
| Pozione di vigore | Ripristina Stamina | 2 (non comune) | 1 × Artigli d'orso, 1 × Dente di tigre dai denti a sciabola |
| Pozione di magicka | Ripristina Magicka | 2 (non comune) | 1 × Mora tapinella, 1 × Fiore di montagna rosso |
| Resistenza al veleno | Resistenza a Veleno | 2 (non comune) | 2 × Aglio, 1 × Fungo luminoso |
| Resistenza ai fulmini | Resistenza a Fulmini | 2 (non comune) | 1 × Fungo luminoso, 2 × Becco di falco |
| Respirare sott'acqua | Respirare sott'acqua | 2 (non comune) | 1 × Cirripede nordico, 1 × Fiore di montagna viola |
| Rigenera magicka | Rigenera Magicka | 2 (non comune) | 1 × Belladonna, 1 × Occhio di tigre dai denti a sciabola |
| Rigenera vigore | Rigenera Stamina | 2 (non comune) | 1 × Mora tapinella, 1 × Pholiota squamosa |
| Rigenera salute | Rigenera Salute | 2 (non comune) | 3 × Aglio, 1 × Cirripede nordico |
| Pozione di cura suprema | Ripristina Salute | 3 (leggendaria) | 1 × Occhio di tigre dai denti a sciabola, 1 × Erba vescicante, 1 × Grano |
| Pozione di vigore suprema | Ripristina Stamina | 3 (leggendaria) | 1 × Dente di tigre dai denti a sciabola, 1 × Erba vescicante, 1 × Amanita muscaria |
| Pozione di magicka suprema | Ripristina Magicka | 3 (leggendaria) | 1 × Orecchio d'elfo, 1 × Mora tapinella, 5 × Grappolo strisciante |
| Resistenza alla magia | Resistenza a Magia | 3 (leggendaria) | 1 × Corona sanguinante, 1 × Nirnroot |
| Invisibilità | Invisibilità | 3 (leggendaria) | 1 × Nirnroot, 1 × Denti di spettro del ghiaccio, 2 × Dita di gigante |

## Veleni (6)

| Veleno | Effetto | Livello | Ingredienti |
|---|---|---|---|
| Veleno debilitante | Danneggia Stamina | 1 (comune) | 1 × Radice di canis, 1 × Pholiota squamosa |
| Veleno | Danneggia Salute | 1 (comune) | 1 × Coda di skeever, 1 × Chitina di granchio di fango |
| Veleno rallentante | Rallentamento | 2 (non comune) | 1 × Palchi grandi, 1 × Fungo luminoso |
| Veleno persistente | Danno persistente Salute | 2 (non comune) | 1 × Squame di pesce macellaio, 3 × Grappolo strisciante |
| Veleno di belladonna | Danneggia Salute | 2 (non comune) | 1 × Belladonna, 1 × Palchi piccoli |
| Veleno paralizzante | Paralisi | 3 (leggendaria) | 3 × Radice di canis, 2 × Grasso di troll |

## Ingredienti (35)

| Ingrediente | `id` | Tipo | Rarità | Dove | Usato in | Note |
|---|---|---|---|---|---|---|
| Bacche di neve | `snowberries` | pianta | comune | Eastmarch (piante: Eastmarch 274, Rift 76) | 1: Resistenza al fuoco |  |
| Becco di falco | `hawk_beak` | animale | comune | entrambi | 1: Resistenza ai fulmini |  |
| Chitina di granchio di fango | `mudcrab_chitin` | animale | comune | nei feudi (quale non indicato) | 2: Cura malattie, Veleno |  |
| Coda di skeever | `skeever_tail` | animale | comune | entrambi | 1: Veleno |  |
| Fiore di montagna blu | `blue_mountain_flower` | pianta | comune | entrambi (piante: Eastmarch 227, Rift 407) | 2: Pozione di cura minore, Pozione di cura |  |
| Fiore di montagna rosso | `red_mountain_flower` | pianta | comune | entrambi (piante: Eastmarch 145, Rift 465) | 2: Pozione di magicka minore, Pozione di magicka |  |
| Fiore di montagna viola | `purple_mountain_flower` | pianta | comune | entrambi (piante: Eastmarch 261, Rift 450) | 2: Pozione di vigore minore, Respirare sott'acqua |  |
| Grappolo strisciante | `creep_cluster` | pianta | comune | Eastmarch (piante: Eastmarch 242, Rift 0) | 3: Pozione di magicka minore, Pozione di magicka suprema, Veleno persistente |  |
| Lingua di drago | `dragons_tongue` | pianta | comune | Eastmarch (piante: Eastmarch 555, Rift 2) | 1: Resistenza al fuoco |  |
| Mirriam del gelo | `frost_mirriam` | pianta | comune | entrambi (piante: Eastmarch 0, Rift 2) | 1: Resistenza al gelo |  |
| Palchi grandi | `large_antlers` | animale | comune | entrambi | 2: Pozione di vigore minore, Veleno rallentante |  |
| Palchi piccoli | `small_antlers` | animale | comune | nei feudi (quale non indicato) | 1: Veleno di belladonna |  |
| Pholiota squamosa | `scaly_pholiota` | fungo | comune | Rift (piante: Eastmarch 1, Rift 179) | 2: Rigenera vigore, Veleno debilitante |  |
| Piume di falco | `hawk_feathers` | animale | comune | entrambi | 1: Cura malattie |  |
| Radice di canis | `canis_root` | pianta | comune | Rift (piante: Eastmarch 9, Rift 375) | 2: Veleno debilitante, Veleno paralizzante |  |
| Ramo di cardo | `thistle_branch` | pianta | comune | Eastmarch (piante: Eastmarch 137, Rift 36) | 1: Resistenza al gelo |  |
| Uva jazbay | `jazbay_grapes` | pianta | comune | Eastmarch (piante: Eastmarch 344, Rift 0) | **nessuna ricetta** |  |
| Aglio | `garlic` | pianta | comune | entrambi (piante: Eastmarch 0, Rift 6) | 2: Resistenza al veleno, Rigenera salute | natura |
| Grano | `wheat` | pianta | comune | Eastmarch (piante: Eastmarch 32, Rift 14) | 2: Pozione di cura, Pozione di cura suprema |  |
| Artigli d'orso | `bear_claws` | animale | non comune | entrambi | 1: Pozione di vigore |  |
| Belladonna | `nightshade` | pianta | non comune | Eastmarch (piante: Eastmarch 25, Rift 7) | 2: Veleno di belladonna, Rigenera magicka |  |
| Cirripede nordico | `nordic_barnacle` | animale | non comune | entrambi (piante: Eastmarch 36, Rift 57) | 2: Respirare sott'acqua, Rigenera salute |  |
| Dente di tigre dai denti a sciabola | `sabre_cat_tooth` | animale | non comune | entrambi | 2: Pozione di vigore, Pozione di vigore suprema |  |
| Fungo luminoso | `glowing_mushroom` | fungo | non comune | entrambi | 3: Resistenza al veleno, Resistenza ai fulmini, Veleno rallentante |  |
| Mora tapinella | `mora_tapinella` | fungo | non comune | entrambi (piante: Eastmarch 70, Rift 28) | 3: Pozione di magicka, Rigenera vigore, Pozione di magicka suprema |  |
| Occhio di tigre dai denti a sciabola | `eye_of_sabre_cat` | animale | non comune | entrambi | 2: Rigenera magicka, Pozione di cura suprema |  |
| Squame di pesce macellaio | `slaughterfish_scales` | animale | non comune | nei feudi (quale non indicato) | 1: Veleno persistente |  |
| Amanita muscaria | `fly_amanita` | fungo | raro | entrambi (piante: Eastmarch 0, Rift 9) | 1: Pozione di vigore suprema |  |
| Corona sanguinante | `bleeding_crown` | fungo | raro | entrambi (piante: Eastmarch 1, Rift 13) | 1: Resistenza alla magia |  |
| Denti di spettro del ghiaccio | `ice_wraith_teeth` | animale | raro | Eastmarch | 1: Invisibilità |  |
| Dita di gigante | `giants_toe` | altro | raro | addosso ai giganti (bottino) | 1: Invisibilità | In `ingredients.json` risulta non disponibile nei feudi |
| Erba vescicante | `blisterwort` | fungo | raro | Rift (piante: Eastmarch 0, Rift 3) | 2: Pozione di cura suprema, Pozione di vigore suprema |  |
| Grasso di troll | `troll_fat` | animale | raro | entrambi | 1: Veleno paralizzante |  |
| Nirnroot | `nirnroot` | pianta | raro | Rift | 2: Resistenza alla magia, Invisibilità |  |
| Orecchio d'elfo | `elves_ear` | pianta | raro | entrambi (piante: Eastmarch 0, Rift 1) | 1: Pozione di magicka suprema |  |

**Ingredienti senza ricetta (1):** Uva jazbay. Resta utile come merce, per la cucina o per ricette future.

## Effetti esclusi

| Effetto | Perché |
|---|---|
| Potenzia <abilità> (Una mano, Furtività, Forgiatura, Scasso…) | In SkyMP le abilità sono spente e il danno usa una formula semplificata: questi effetti non fanno niente. |
| Frenesia, Paura | Indicate da Davide come inutili nella riunione del 29/10; con i giocatori al posto degli NPC non hanno senso. |
| Debolezze (al fuoco, al gelo, alla magia, al veleno) | Si possono aggiungere più avanti per il PvP; per ora "less is better". |
| Devasta salute/magicka/stamina, Danneggia magicka e rigenerazioni | Doppioni dei veleni tenuti; aggiungibili più avanti. |
| Potenzia salute, magicka, stamina e capacità di carico | Tolte nella revisione di novembre per tenere la lista corta; aggiungibili più avanti. |

## Controlli

- ✅ Tutti gli ingredienti usati esistono nel database (`ingredients.json`).
- ✅ Nessun ingrediente supera le 4 ricette (massimo 3: Grappolo strisciante, Fungo luminoso, Mora tapinella).
- ⚠️ **Dita di gigante:** è l'unico ingrediente non presente nei feudi secondo `ingredients.json`. Va confermato col team (spawn di giganti o eccezione voluta).
- ⚠️ **Rigenera magicka:** né Belladonna né Occhio di tigre hanno l'effetto «Rigenera Magicka» nel gioco base. Se si vuole rispettare la regola, l'Aglio ce l'ha (arriverebbe a 3 ricette).
- ⚠️ **Veleno paralizzante:** Grasso di troll non ha l'effetto «Paralisi» nel gioco base (scelta per alzare la rarità; la Radice di canis ce l'ha).

## Da verificare in gioco

- In SkyMP gli **effetti a durata** (resistenze, rigenera, veleni persistenti, paralisi, invisibilità) potrebbero non funzionare (`skymp_funzionalita.md`, Step 4). Se è così, nella prima versione restano solo le pozioni di **ripristino** e i veleni a danno immediato.

## Note della revisione (novembre 2026)

- **Cosa è cambiato rispetto alla proposta generata:** tolti tutti i pesci (Betta di fiume, Carpa di Hist, Coda a vanga, Pinna lunga, Salmon Roe, Silverside Perch, Uovo di pesce macellaio); tolte le pozioni Potenzia; aggiunta Rigenera magicka; Aglio e Grano passano a "comune"; alcune ricette usano più di 1 pezzo dello stesso ingrediente.
- **Grappolo strisciante** cresce solo in Eastmarch e serve in quantità (5 per la Magicka suprema, 3 per il Veleno persistente): chi è nel Rift dipende dal commercio con Eastmarch.
- **Mirriam del gelo:** il conteggio delle piante del gioco ne trova poche perché cresce sugli alberi; dal Discord risultano circa 260 rami in 162 luoghi.
- **Nirnroot** nel Rift si trova solo a Sarethi Farm; **Orecchio d'elfo** è quasi assente in natura nei feudi: le pozioni leggendarie che li usano saranno davvero rare.
- `specs/systems/crafting.md` cita ancora "22 pozioni, 41 ingredienti" e lo script: va aggiornato con una PR.
