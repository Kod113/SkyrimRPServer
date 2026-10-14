# SkyMP: cosa si può fare per flora, fauna e loot (letto dal codice)

**Autore:** david (con Claude) · **Data:** 14 ottobre 2026
**Fonte:** codice sorgente di SkyMP (`skyrim-multiplayer/skymp`, commit `2849e67` del 5 ottobre 2026), letto senza eseguirlo.
**Stato:** bozza. Quello che è scritto qui è ricavato dal codice, **non provato in gioco**: dove non ne sono sicuro lo dico.

## Risposte alle 5 domande dello spike

| # | Domanda | Risposta | Sicurezza |
|---|---|---|---|
| 1 | Una pianta raccolta ricresce da sola? | **Sì.** Piante (`FLOR`) e alberi (`TREE`) tornano raccoglibili dopo 1 ora (predefinito). Si cambia con `reloot` nel `server-settings.json` **per tipo di record**, non per singola pianta. `forbiddenReloot` la disattiva per un tipo. | Alta (`MpObjectReference.cpp`, `WorldState.cpp`) |
| 2 | Si può nascondere una singola pianta/oggetto? | **Sì.** `mp.set(formId, "isDisabled", true)` (e `false` per riattivarlo). Funziona su qualunque riferimento. | Alta (`IsDisabledBinding.cpp`) |
| 3 | Il gamemode può creare un oggetto o una creatura? | **Sì.** `mp.place(idRecordBase)` crea un nuovo riferimento (ID che inizia con `0xff`), poi si posiziona con `mp.set(id, "pos", [x,y,z])` e `mp.set(id, "worldOrCellDesc", "3c:Skyrim.esm")` (3c = Tamriel). Se il record base è un `NPC_` crea un attore. `mp.createActor` fa lo stesso per attori. | Alta per la creazione; media per il comportamento della creatura (vedi sotto) |
| 4 | Gli animali funzionano con `npcEnabled`? | **Sì, ma con filtri.** Con `"npcEnabled": true` il server carica gli NPC piazzati nel mondo (anche cervi, lupi: in Skyrim sono record `NPC_`). Salta quelli essenziali, protetti, unici, quelli disabilitati all'inizio e quelli di fazioni criminali. `npcSettings` filtra per file di gioco e interno/esterno. | Alta per il caricamento |
| 5 | Si può cambiare il loot alla morte? | **Sì, in due modi.** Alla morte l'attore riceve gli oggetti della sua lista di morte (come nel gioco). Il gamemode riceve l'evento `onDeath(idMorto, idUccisore)` e può riscrivere l'inventario con `mp.set(id, "inventory", ...)`. Per i nostri drop (100% pelle, 50% corna, 10% bottino) basta una tabella nel gamemode. | Alta (`MpActor.cpp`, `DeathEvent.cpp`) |

## Cosa ne deriva per il nostro sistema

- **Flora:** non serve crearla. Le piante di Skyrim ci sono già; ricrescono da sole. Quello che controlliamo noi è **quali sono attive** (`isDisabled`) e **ogni quanto tornano** (per tipo di record).
- **Fauna:** due strade. (a) Attivare `npcEnabled` e usare i cervi e i lupi già piazzati da Bethesda; (b) creare noi le creature con `mp.place` dove e quando vogliamo, che è l'unico modo per applicare regole come "più cervi nelle foreste del Rift".
- **Loot:** una tabella nel gamemode sull'evento di morte, così i drop sono quelli del nostro `creatures.json`.

## Limiti e cose da non dare per scontate

1. **Tempo di ricrescita non regolabile per singola pianta.** Esiste un valore per singolo riferimento nel codice, ma non è esposto al gamemode: si può solo per tipo (`FLOR`, `TREE`, `INGR`...). Se vogliamo tempi diversi per ogni pianta, dobbiamo gestirli noi con `isDisabled` e un timer nel gamemode.
2. **Possibile errore nel codice di SkyMP:** quando pianifica la ricrescita, la data salvata usa il tempo predefinito del tipo (`GetRelootTime()`) invece di quello richiesto. Se un tempo personalizzato non viene rispettato dopo un riavvio, è un buon sospetto. Da provare.
3. **Comportamento delle creature create:** non ho letto chi le fa muovere e combattere (nei server SkyMP lo fa un giocatore vicino, il client). Non so se un cervo creato con `mp.place` si comporta come uno piazzato nel mondo. **Questa è la cosa da provare per prima.**
4. **Creature piazzate da noi e riavvio del server:** non ho verificato se `mp.place` sopravvive al riavvio o se va ricreato dal gamemode all'avvio.
5. **Ricomparsa degli NPC morti:** non ho trovato una regola predefinita che li faccia tornare. Probabilmente la dobbiamo scrivere noi (timer + `mp.place`).
6. **Il "ciclo di raccolta" è per tipo, non per quantità:** una pianta raccolta dà gli oggetti del suo record una volta. Quantità variabili o casuali vanno scritte nel gamemode.

## Esempio di codice (idea, non provato)

```typescript
// Evento di morte (esiste anche un test di SkyMP su un granchio che muore): sostituisce il loot con la nostra tabella.
// Il formato dell'inventario e' { entries: [ { baseId: 77495, count: 264 } ] }
mp.onDeath = (idMorto: number, idUccisore: number) => {
  const base = mp.get(idMorto, "baseDesc");        // "12eb7:Skyrim.esm"
  const tabella = creatureDrops[base];             // da creatures.json
  if (!tabella) return;
  mp.set(idMorto, "inventory", { entries: rollDrops(tabella) });
};
```

## Prossimi passi consigliati

- Prova in gioco (quando si potrà) del solo punto 3 dei limiti: `mp.place` di un cervo e osservare cosa fa.
- Decidere se usare i cervi di Bethesda (`npcEnabled`) o crearli noi.
- Leggere dagli `.esm` le posizioni vere di piante e animali (punto 2 della lista) per decidere dove piazzarli.
