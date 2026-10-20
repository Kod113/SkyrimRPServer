# Job della città: bozza iniziale

**Stato:** testo di partenza ricevuto da David il 20 ottobre 2026 e messo qui per Alessio (cartella creata da david). D'ora in poi questo file è di Alessio.
Il testo dei job è riportato com'era, corretti solo i refusi.

---

## Locandiere

Il locandiere è il fulcro dell'RP di una cittadina e ha a disposizione molte attività.

- **Servire cibo.** Ogni settimana, in RP, arriva una consegna con diversi generi alimentari. All'inizio del server la fa lo staff. In un'ottica di economia gestita totalmente dai player, sarà poi il locandiere a decidere da chi comprare e a quanto.
- **Dare quest.**
  - Quest personali (es. "quel cliente non paga da mesi, per favore fai qualcosa…").
  - Quest scritte o decise dallo staff, che il locandiere può affiggere in bacheca o comunicare a voce (es. "degli emissari dello jarl hanno affisso questo: pare che un branco di lupi terrorizzi i campi attorno a Whiterun da settimane").
- **Gestire la lista degli ospiti.** Tiene il conto delle stanze libere e degli ospiti.
- **Sicurezza.** Se non ci sono guardie disponibili, deve pensare lui alla sicurezza della locanda. Ogni danno a cose o persone nella sua proprietà è sua responsabilità.

## Medico

Il medico è una figura fondamentale in Skyrim RP: non solo cerotti e pozioni, ma anche operazioni, cartelle cliniche e quest per gli aspiranti medici.

- **Il job:** trattare i pazienti. Ogni medico deve essere in contatto con un alchimista locale per avere pozioni e cure. Stabilisce quanto un PG deve recuperare prima della prossima battaglia.
- **Quest uniche a pagamento:** i medici non lavorano gratis. A volte possono essere assunti da gruppi di avventurieri per accompagnarli e dare assistenza medica.
- **Rank:**
  1. Apprendista: cure base e prescrizioni.
  2. Dottore: operazioni e trattamenti.
  3. Guaritore: gestione delle mansioni, interventi pericolosi, assegnazione dei ruoli.
- Nel server non ci si può curare senza pozioni. Alcuni danni richiedono un trattamento specifico; queste situazioni vengono valutate in RP.

## Alchimista

L'alchimia è una pratica complessa e ogni alchimista è una parte fondamentale della vita cittadina.

- **Funzioni:** creare e tenere in magazzino pozioni e unguenti; gestire inventario e negozio; creare pozioni nuove e ricercarne di antiche.
- Ogni alchimista ha conoscenze gelosamente custodite e lavora a stretto contatto con tutta la popolazione: se un medico prescrive un trattamento, il cliente va dall'alchimista a comprare le cure.
- **Quest uniche:** dedicate alla scoperta di antiche ricette per pozioni sempre più potenti.
- Ogni alchimista ha la propria scorta personale di materiali base e un tavolo alchemico.

## Fabbro

Il fabbro forgia armi, armature e gioielli per le richieste dei clienti.

- Ogni fabbro ha l'attrezzatura per costruire armi (testo originale interrotto: "e possiede …").
- È a stretto contatto con tutto il villaggio: guardie, banditi, ecc. Lo scopo è semplice ma le implicazioni sono molte.
- **Cose uniche:**
  - quest per la ricerca di materiali o per fabbricare armi e armature leggendarie;
  - accordi commerciali per la consegna di materiali grezzi da raffinare;
  - è a tutti gli effetti un commerciante: decide prezzi e prodotti.
- **Tier:** esistono diversi livelli di fabbro, che definiscono quanto è bravo e quali materiali può lavorare.

## Guardia cittadina

Mantiene l'ordine in città, ma non solo.

- Le guardie sono membri dell'esercito e in alcuni casi possono essere mandate in missione.
- Pattugliano la mappa circostante, riportano i problemi e stabiliscono le pene.
- **Investigazione:** furti, omicidi, rapimenti. Interagendo con la città possono sviluppare casi e portarli allo jarl per mandarli a giudizio.
- **Quest:** disordini cittadini, criminali, banditi, carichi spariti. Addestramento.
- **Rank:**
  1. Recluta
  2. Guardia cittadina
  3. Capo della guardia cittadina

---

## Collegamenti con il lavoro già fatto (nota di david)

- Il database dei job è in `team/david/db/jobs.json`: ha già Medico (`healer`), Alchimista (`alchemist`), Fabbro (`blacksmith`) e Guardia cittadina (`city_guard`), con i permessi provvisori (`allowed_actions`). **Il Locandiere non c'è ancora.** I rank (medico, guardia) e i tier (fabbro) non ci sono.
- Le ricette del fabbro sono in `team/david/db/crafting.json` (branch `david/loot-spawn`). **Il sistema di crafting non è ancora deciso**: gioco base oppure quello di `CombatSettings.esp`, molto più lungo. I tier del fabbro dipendono da questa scelta.
- Le pozioni dell'alchimista: `team/david/db/ingredients.json`, `effects.json`, `recipes.json`.
