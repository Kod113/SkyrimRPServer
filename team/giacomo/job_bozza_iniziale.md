# Job Guerriero e Stalliere: bozza iniziale

**Stato:** testo di partenza ricevuto da David il 21 ottobre 2026 e messo qui per Giacomo (cartella creata da david). D'ora in poi questo file è di Giacomo.
Il contenuto è quello originale, riordinato per punti; corretti solo i refusi.

---

## Guerriero ordinario

Job focalizzato prettamente sull'RP. Chi lo ricopre può farsi strada fino ai gradi più alti dell'esercito: questo dà mobilità a un job che all'inizio potrebbe sembrare ripetitivo.

- **Passaggio di grado.** Può essere abbinato a:
  - un cambiamento estetico dell'armatura e un miglioramento dell'equipaggiamento, per distinguere chiaramente il ruolo;
  - un **perk** che permetta a quel rango di fare qualcosa in più, **senza aumentarne forza o potere**. Può essere anche solo un oggetto o un luogo speciale (come l'armatura): un cavallo particolare, una dimora privata.
- **Comandi per grado.** Ogni grado ha delle azioni che può eseguire. Esempi:
  - ordinare a un'unità X (NPC) di eseguire un movimento;
  - ordinare un attacco;
  - personalizzare uno stendardo.
- **Collegamento con lo Stalliere.** I guerrieri dovrebbero avere sconti sui prezzi e/o slot in più per le proprie cavalcature.
- **Da decidere:** classi di partenza definite da noi (es. arciere, lanciere, cavaliere…) oppure scelte libere degli utenti.

## Stalliere

Ruolo vitale nel mondo di Skyrim RP.

- **Menù dedicato.** Fornire cavalcature con statistiche e usi diversi richiede un menù con comandi dedicati, anche per gestire la struttura (la stalla).
- **Uso → caratteristiche.** L'uso a cui è destinata la cavalcatura ne determina le caratteristiche: più un cavallo è veloce, meno peso può trasportare, e viceversa.
- **Ispirazione:** il sistema di Red Dead Redemption 2 per la gestione di questi parametri e per tutto ciò che riguarda la cura del proprio animale.
- **Approvvigionamento: cattura libera.** Ogni tot tempo, in diverse aree, compaiono cavalli normali e/o cavalli con caratteristiche diverse, secondo la percentuale di spawn assegnata a ogni tipologia.
- **Vendita dei cavalli catturati.** L'utente può rivendere i cavalli "normali":
  - a un importo fisso (se c'è un menù di vendita automatica);
  - oppure contrattando in RP.
- **Lato stalliere.** Avrà tot unità di un certo cavallo da rivendere agli altri utenti. Quelle in eccedenza può rivenderle per ricavarne risorse (carne, pelle o altre parti utili).
- **Cattura leggendaria (importante).** Compare una cavalcatura leggendaria da catturare con diversi metodi, in solitaria (se possibile) o in gruppo. Dà varietà al lavoro e lo rende meno monotono.
- **Da capire:**
  - se si può personalizzare l'estetica del cavallo, anche facendogli indossare armature (per guerrieri specializzati che hanno bisogno di più resistenza in combattimento);
  - se implementare cavalcature particolari.

---

## Collegamenti con il lavoro già fatto (nota di david)

- **Database dei job** (`team/david/db/jobs.json`): c'è già il **Soldato** (`soldier`, azione `fight_in_war`), che è il punto di partenza naturale per il Guerriero ordinario. Gradi, perk e comandi per grado non ci sono ancora. **Lo Stalliere non c'è.**
- **Guardia cittadina (lavoro di Alessio):** in `team/alessio/job_bozza_iniziale.md` le guardie "sono membri dell'esercito" e hanno i rank Recluta → Guardia cittadina → Capo della guardia. Conviene accordarsi con Alessio su un'unica scala di gradi dell'esercito.
- **Comandi agli NPC:** il server è un mondo vuoto, senza NPC vanilla (vedi `DECISIONS.md`). Ordinare movimenti o attacchi a "unità NPC" richiede NPC creati apposta dal gamemode: da verificare cosa permette SkyMP prima di progettarlo.
- **Cavalli in SkyMP:** dal playtest di Davide (`team/david/osservazioni_playtest_davide.md`) le stalle sono accessibili. Da verificare come SkyMP gestisce cavalcature, inventario del cavallo e peso trasportabile, visto che SkyMP cambia alcune meccaniche del gioco base. Un riferimento: l'articolo di Keizaal su cavalli, cucina e sartoria citato in `team/david/ricerca_top2_server_skymp.md`.
- **Spawn e risorse dei cavalli:** i cavalli sono tra gli animali domestici mantenuti (`DECISIONS.md`) e compaiono nelle stalle di alcune città in `team/david/db/zones.json`, ma **non** sono in `creatures.json`, `spawn_rules.json` né `loot.json`. Per la cattura libera e per carne/pelle dei cavalli in eccedenza vanno aggiunti lì.
- **Carne e pelle:** si collegano alla catena del Cacciatore (`hunter` in `jobs.json`), che già fornisce pelli e carne a fabbro, alchimista e locande.
