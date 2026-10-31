# Riunione del 29 ottobre 2026 — riassunto

Partecipanti: David, Davide, Alessio, Giacomo (in auto: ascolto e chat)
Durata: circa 1 ora · Trascrizione completa: [trascrizione.md](trascrizione.md)

> Riassunto preparato da Claude a partire dalla trascrizione automatica. Se qualcosa non torna, correggetelo con una PR.

---

## ✅ Decisioni prese

1. **Prima il crafting, poi i job.** Il sistema dei job verrà molto più avanti: adesso servono le fondamenta (crafting, ingredienti, armi e armature, loot). Obiettivo indicato da Davide: **sistema di crafting funzionante entro fine dicembre**.
2. **Ognuno si prende un'area** invece di lavorare tutti insieme sulla stessa cosa ogni settimana (proposta di Davide, d'accordo Alessio e Giacomo). Chi lavora su aree collegate (es. pozioni e ingredienti) si coordina.
3. **Niente semilavorati per ora.** SkyMP non li supporta bene, quindi le ricette usano ingredienti diretti (niente "trito di fiori" o "pasta di mandorle"). Le uniche eccezioni sono **lingotti e strisce di cuoio/pelle**. I preparati arriveranno nelle versioni successive (1.0 → 2.0 → 3.0): "less is better".
4. **Minerali e miniere** (Davide):
   - minerali disponibili: **ferro, acciaio, oricalco, nanico, elfico**;
   - il **vetro** sarà un oggetto unico, riservato ai campioni dell'arena (Colosseo), con danni bilanciati;
   - ogni regno ha la **stessa quantità di ferro e acciaio**; oricalco, nanico ed elfico sono distribuiti in modo diverso.
5. **Pozioni organizzate per rarità** (proposta di Davide, accettata da Alessio): comuni → non comuni → leggendarie. Si parte dalle pozioni e poi si scelgono gli ingredienti. Vincolo di Alessio: niente stessi ingredienti per metà delle pozioni (es. cura e cura suprema devono essere diverse), perché in un GDR le cose vanno meritate.
6. **Idee sui job di Alessio e Giacomo approvate** in linea di massima. Ci sarà una serata dedicata solo ai job, con idee da aggiungere.
7. **Discord:** prima dell'apertura si farà un **server Discord nuovo e pulito**, da zero. Quello attuale resta come archivio di lavoro del team.

## 📋 Cose da fare

| Chi | Cosa | Entro |
|---|---|---|
| Alessio | **Alchimia e pozioni:** selezione delle pozioni da tenere nel gioco, divise per rarità, poi gli ingredienti necessari. La pubblica sul Discord per avere i pareri degli altri. Lavora insieme a Giacomo. | prossima riunione |
| Giacomo | **Ingredienti:** selezione degli ingredienti da tenere, insieme ad Alessio per la parte di pozioni e alchimia. *(Deciso dopo la riunione.)* | prossima riunione |
| David | **Armi e armature:** partendo dai mob e dalle miniere già selezionati da Davide, decidere quali armi e armature si possono costruire. Le domande sulle miniere le fa a Davide in settimana. | prossima riunione |
| Davide | **Crafting:** si dedica alla parte di crafting e spiega a David come ha pensato miniere e lingotti. | in settimana |
| Davide | **Comando main lore:** invertire il valore, così `1` = attivo e `0` = disattivo (oggi è al contrario). Non è prioritario. | quando c'è tempo |
| Tutti | **Segnarsi le idee** per la serata dedicata (job e altro), così vengono discusse e scritte nelle decisioni. | continuo |

## 🛠️ Cosa ha presentato Davide (lavoro fatto dal 2 ottobre)

Tutto il materiale presentato è **funzionante sul suo PC**, ma **non è ancora nel repo**.

- **Mod "Mondo Vergine":** toglie dal gioco tutti gli oggetti (6.982), cioè libri, ingredienti, alchimia e crafting. Tutto si ricostruisce su misura partendo da zero. Per esempio, oggi una pozione di cura non richiede nessun ingrediente.
- **Modalità conquista:** forti e città abitati da NPC ostili (circa 50 negli accampamenti, 100 nelle città). Quando sono stati uccisi tutti, appare un messaggio di conquista. Se a conquistare sono le guardie o l'esercito, il luogo passa allo jarlato; se sono dei giocatori, passa a loro. Prova con giocatori simulati sul suo PC: nessun lag fino a circa 30, lag da 35. Ci sono anche gli script per capi e generali.
- **Libri per job:** il job si sceglie dopo la creazione del personaggio, e ogni job ha il suo libro. Per esempio il cacciatore ha il bestiario con i 55 mob e le zone dove vivono, mentre il fabbro conosce le miniere. Le informazioni non sono note a tutti, così i giocatori devono parlarsi.
- **Mappa:** i luoghi scoperti restano salvati sulla mappa.
- **Spawn:** 43 punti di spawn impostati a mano, con creature comuni e leggendarie. Le creature compaiono in punti casuali di un'area e ogni ora vengono ricreate quelle uccise. Le creature leggendarie (es. i giganti) non si battono da soli: servono le gilde.
- **Dungeon:** a Riften ogni dungeon ha il suo spawn coerente con la lore (banditi, scheletri, maghi…). Dungeon e casse si resettano ogni ora e al riavvio. Windhelm è ancora da fare.
- **Economia:** i prezzi sono calcolati a partire dal costo di un pasto in locanda (circa 10 monete). Il loot è proporzionato: un bandito ha 14–18 monete, un capo 160. Alcuni prezzi cambiano tra Riften e Windhelm in base alle risorse locali (es. pozioni di cura meno care a Riften), così i giocatori sono spinti a spostarsi.
- **Main lore:** una grotta nascosta porta (teletrasporto) a un grande dungeon con un drago antico ferito. Quando il drago muore, gli admin ricevono un avviso e parte una catena di eventi: musica, draugr che conquistano progressivamente i tumuli. Si attiva e disattiva da console.
- **Loot:** ogni mob ha un loot unico e uno generico, a percentuale. Tra giocatori si può prendere il 30% del valore di monete e oggetti di valore, mentre gli oggetti di classe e di job e le armi/armature non si possono prendere.
- **Bacheca delle taglie** in gioco, funzionante.
- **Riavvio automatico** del server dopo un crash: circa 2 secondi di lag e poi riparte.
- **Capacità:** Davide ha una stima dei requisiti del server per arrivare a 150 giocatori.
- **IA dei mob rifatta da zero**, perché SkyMP non la gestisce. In SkyMP mancano anche altre cose: non si può andare a cavallo e i danni delle magie non funzionano.
- Tutti i comandi admin sono disponibili in gioco.

## 💡 Idee emerse (da valutare)

- **Mantenere le zone conquistate** (Alessio): per tenere il controllo di una zona bisogna continuare a presidiarla, altrimenti si perde. Andrà regolato con un regolamento, più avanti.
- **Sessioni di lavoro insieme** (Giacomo): serate di un paio d'ore in cui si lavora tutti insieme. David preferisce lavorare a coppie, perché sono più facili da organizzare. Giacomo è disponibile la prossima settimana, lunedì sera compreso, tranne il 3.

## ❓ Questioni aperte

- **Cambio di job:** se un giocatore vuole cambiare job dopo la scelta iniziale (es. da contadino a cacciatore), oggi non è possibile. David se l'è segnato. Giacomo propone di non assegnare il job all'inizio, ma quando il giocatore sceglie una strada.
- **Loot:** non è ancora stato deciso chi se ne occupa. Gli ingredienti, invece, dopo la riunione sono stati assegnati a Giacomo.
- **Codice di Davide nel repo:** tutto quello presentato sopra è ancora solo sul suo PC.

## 🔗 Impatto sul repo

- Risponde a due punti aperti del 20 ottobre: il **vetro** (oggetto dei campioni dell'arena) e la **pietra lunare/mercurio** (non c'è nella lista dei minerali). Gli altri punti di quella lista non sono stati discussi.
- Le task della settimana sono aggiunte in `TASKS.md` (T-005, T-006, T-007).
- Quando le decisioni 3 e 4 saranno confermate per iscritto, possono diventare voci di `DECISIONS.md`.
