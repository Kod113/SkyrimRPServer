# Sistema di crafting

```
Autore:  david (con Claude)
Data:    1 novembre 2026
Stato:   bozza da discutere con il team (soprattutto con Davide, che lavora sul crafting)
```

> **Obiettivo:** tenere insieme in un solo posto come funziona il crafting e **come si incastrano le aree di ognuno**: ingredienti (Giacomo), pozioni (Alessio), armi e armature (David), miniere, mob e loot (Davide). Priorità decisa nella riunione del 29/10: **crafting funzionante entro fine dicembre**, prima dei job.

---

## 1. Cosa fa SkyMP (verificato, come chiede la regola "SkyMP ≠ gioco base")

| Cosa | In SkyMP | Fonte |
|---|---|---|
| **Forgia, fonderia, conceria** | ✅ Funzionano. Il server controlla che le ricette (record `COBJ` delle `.esp`) siano fatte al banco giusto, con gli ingredienti giusti, e ne valuta le **condizioni** | `CraftService` del server, `skymp_funzionalita.md` |
| **Affilatura e miglioramento** (mola, banco per armature) | ❌ Esclusi dal server | `CraftService` (le ricette "temper" sono escluse) |
| **Alchimia** (tavolo alchemico vanilla) | ❌ Non c'è | `skymp_funzionalita.md` |
| **Incantamento** | ❌ Non c'è | `skymp_funzionalita.md` |
| **Skill e perk** | ❌ Spenti (niente crescita, niente perk) | `skymp_funzionalita.md` |
| **Evento "craft" per il gamemode** | ✅ Il gamemode sa chi ha costruito cosa | `skymp_funzionalita.md` |
| **Semilavorati complessi** (trito, pasta…) | ❌ Non gestibili in modo affidabile | Davide, riunione del 29/10 |

### Cosa significa per noi

1. **I livelli non possono venire dai perk.** Nel gioco base l'acciaio, l'elfico e gli altri materiali chiedono un perk (es. "Forgiatura elfica"), ma in SkyMP i perk sono spenti. I livelli (tier) del fabbro e dell'alchimista li decide **il job**, tramite il gamemode o le condizioni delle ricette.
   - ⚠️ **Da provare subito in gioco:** le ricette del gioco base con la condizione "ha il perk" funzionano ancora? Se il server considera la condizione falsa, oggi si costruisce solo la roba di ferro. Il test è indicato al §7.
2. **L'alchimia va costruita da noi.** Proposta: **pozioni come ricette fisse** (stessa tecnica della forgia: record `COBJ` su un banco "alchemico"). Così ogni pozione ha la sua ricetta decisa da noi, il server la controlla già da solo e non serve scoprire gli effetti mangiando gli ingredienti. È coerente con "Mondo Vergine" di Davide, dove oggi la pozione di cura richiede zero ingredienti e le ricette le decidiamo noi.
3. **Niente affilatura e miglioramento** per ora. La riparazione e la durabilità (come Keizaal) sono un'idea da tenere per dopo.

---

## 2. La catena

```
 RACCOLTA                 LAVORAZIONE              PRODUZIONE               USO / VENDITA
 ─────────                ───────────              ──────────               ─────────────
 Minatore  ─ minerale ──► Fonderia ─ lingotto ──►  Forgia (Fabbro) ──────►  armi, armature, frecce
 Cacciatore ─ pelle ────► Conceria ─ pelle,   ──►     │
                                    strisce           │
 Cacciatore /                                         │
 Avventuriero ─ ingredienti (piante, funghi, ──────►  Banco alchemico ─────►  pozioni, veleni
                 parti di animali)                     (Alchimista)
 Taglialegna ─ legna ──────────────────────────────►  Forgia (frecce, archi)
```

- **Semilavorati ammessi:** solo **lingotti** (fonderia) e **pelle / strisce di pelle** (conceria). Decisione della riunione del 29/10.
- **Minerali:** ferro, acciaio, oricalco, nanico ed elfico. Il vetro è solo per i campioni dell'arena. Ferro e acciaio in quantità uguale nei due feudi (D-013: Rift ed Eastmarch).
- **Ogni job serve agli altri** (`jobs.json`, regole): il fabbro ha bisogno di minatore e cacciatore, l'alchimista di cacciatore e raccoglitori, e tutti hanno bisogno del fabbro e dell'alchimista.

---

## 3. Livelli (proposta)

| Livello | Fabbro (da T-006) | Alchimista (da T-005) |
|---|---|---|
| 1 | Ferro, cuoio, borchiata | Pozioni **comuni** |
| 2 | Acciaio | Pozioni **non comuni** |
| 3 | Orchesco, nanico | Pozioni **leggendarie** |
| 4 | Elfico | — |
| Speciale | Vetro: solo campioni dell'arena | Da decidere (es. veleni rari per eventi) |

Come si sale di livello (tempo, oggetti prodotti, esame dallo staff…) si decide con il sistema dei job, più avanti (riunione del 29/10).

---

## 4. Chi fa cosa e in che formato consegna

Perché i pezzi si incastrino, tutti usano **gli stessi identificativi** (`id`) del database in `team/david/db/`. Le liste possono partire dal Discord; poi vanno nella propria cartella `team/<nome>/` in una tabella come quelle qui sotto.

### Giacomo: ingredienti (T-007)
Base: `ingredients.json` (110 ingredienti, con la disponibilità nei due feudi già calcolata).

| `id` (da ingredients.json) | Nome | Tenere? | Rarità (comune / non comune / raro) | Dove si trova (feudo, luogo o animale) | Note |
|---|---|---|---|---|---|

> **Proposta pronta da confrontare:** `team/david/alchimia_proposta.md` (22 pozioni, 6 veleni, rarità dei 41 ingredienti), generata e controllata da `team/david/db/tools/build_alchimia_proposta.py`. Serve da confronto per le liste di Alessio e Giacomo, che restano le loro.

### Alessio: pozioni (T-005)
Si parte **dalle pozioni** e poi si scelgono gli ingredienti (proposta di Davide). Base: `effects.json` (55 effetti) e `recipes.json` (ricette possibili con gli ingredienti dei feudi).

| Pozione | Effetto (`id` da effects.json) | Rarità / livello | Ingredienti (`id` × quantità) | Note di bilanciamento |
|---|---|---|---|---|

Vincolo di Alessio: **niente stessi ingredienti per la maggior parte delle pozioni** (cura e cura suprema devono essere diverse).

### David: armi e armature (T-006)
Fatto: `team/david/armi_armature.md` (42 voci costruibili). Restano aperte 6 domande per Davide.

### Davide: miniere, mob, loot, Mondo Vergine
- Dove sono le miniere e cosa danno (servono per le domande della T-006).
- Loot dei mob (`loot.json`): le pelli e le parti di animali sono gli ingredienti della forgia e dell'alchimia.
- Le ricette vere vanno dentro **la sua mod** (`.esp`): le liste di Alessio, Giacomo e David sono il suo **capitolato**.

---

## 5. Prezzi

Da `prices.json`: un oggetto lavorato vale **circa 2–3 volte i materiali** (`craft_multiplier`), e il riferimento è il pasto in locanda (10 septim). Con le liste definitive si calcolano i prezzi di ogni voce in automatico.

---

## 6. Decisioni aperte

| # | Domanda | Chi | Note |
|---|---|---|---|
| 1 | ~~Ricette del gioco base o di CombatSettings.esp?~~ | David | ✅ **Deciso il 1/11: contenuti del gioco base.** CombatSettings.esp non si usa per il crafting. Da registrare come decisione in `DECISIONS.md` |
| 2 | **Alchimia come ricette fisse** su un banco alchemico | Davide | Proposta del §1, punto 2 |
| 3 | **Come si limitano i livelli** per job: condizioni nelle ricette o controllo del gamemode? | Davide | Dipende dal test del §7 |
| 4 | Le 6 domande della T-006 (acciaio nel Rift, nanico, mercurio, voci senza ricetta…) | Davide | `team/david/armi_armature.md` |
| 5 | Chi si occupa del **loot** | Team | Non assegnato nella riunione |
| 6 | Riparazione e durabilità | Team | Più avanti: SkyMP non ha l'affilatura |

---

## 7. Primo test da fare in gioco (server locale)

1. Dare al personaggio: 2 lingotti di ferro, 2 di acciaio e 2 strisce di pelle.
2. Alla forgia: costruire una **Spada di ferro** (nessun perk) e una **Spada d'acciaio** (perk "Forgiatura dell'acciaio" nel gioco base).
3. Annotare il risultato:
   - si costruiscono tutte e due → le condizioni sui perk non bloccano, e i livelli vanno gestiti in altro modo;
   - si costruisce solo quella di ferro → le condizioni funzionano, e possiamo usarle anche per i livelli dei job.
4. Ripetere alla **fonderia** (minerale → lingotto) e alla **conceria** (pelle → strisce).

Risultato da scrivere qui e in `IMPLEMENTED.md`.
