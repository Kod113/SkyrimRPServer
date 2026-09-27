# TASKS — Task settimanali del team

> **Come funziona:** ognuno ha **una task piccola a settimana**, con una consegna chiara. Le task vengono assegnate di persona. Questo file è lo **storico scritto** di cosa è stato assegnato e consegnato, settimana per settimana. Ogni venerdì c'è la riunione: si guarda cosa è stato chiuso, si raccolgono le idee nuove e si decidono le task della settimana dopo.
>
> **Regola:** una task va **portata a termine**. Se non si chiude, in riunione si dice perché e si fissa una nuova data.
>
> **Priorità:** 🔴 alta (blocca altro lavoro) · 🟡 media · 🟢 bassa

---

## Settimana 29/09 → 02/10/2026 — riunione venerdì 2 ottobre

| # | Chi | Task | Priorità | Consegna | Stato |
|---|---|---|---|---|---|
| T-001 | David | **Far partire STR sul PC Windows di David.** Oggi il client non si avvia. Trovare la causa e una soluzione per potersi collegare. | 🟡 Media | Causa + soluzione scritte in `docs_for_players/TROUBLESHOOTING.md` (se riguarda anche i giocatori) o in `IMPLEMENTED.md` | ⏳ Aperta |
| T-002 | Giacomo | **Aggiornare il PC Windows** per prepararlo al setup di Skyrim. | 🟡 Media | PC aggiornato, pronto per l'installazione di Skyrim SE | ⏳ Aperta |
| T-003 | Davide + David | **Test di SkyMP** seguendo `specs/platform/PIANO_AZIONE.md`: binari dalla CI, server locale, 2 giocatori collegati, persistenza, una regola nel gamemode, un nostro `.esp`. Davide guida server e gamemode, David client e `.esp`. | 🔴 **Assoluta** | `specs/platform/skymp_spike.md` compilato + demo o screenshot venerdì | ⏳ Aperta |
| T-004 | Alessio (o Giacomo se il PC è pronto) | **Ricognizione di Keizaal Online da giocatore.** Installare il launcher, giocare 1-2 sessioni (una in orario di punta), compilare il template. **Non usare il PC di sviluppo.** | 🔴 Alta | `specs/platform/ricognizione_keizaal.md` (copiato da `_template_ricognizione.md`) + 3-5 screenshot | ⏳ Aperta |

**Priorità della settimana:** capire SkyMP e come lo usano i server concorrenti (vedi `specs/platform/README.md`). Serve a prendere la decisione D-019 sulla piattaforma.

**Checkpoint:** mercoledì 1 ottobre ognuno scrive nel gruppo due righe su a che punto è.

### Note su T-001
- **Prima pista:** STR v1.8.1 (14/09/2026) ha aggiunto il supporto a Skyrim SE **1.7.104**. Il nostro setup è fissato a **1.6.1170** + SKSE 2.2.6 (D-009). Controllare:
  1. che Steam non abbia aggiornato Skyrim a 1.7.x;
  2. quale versione di STR è installata, e se l'ultima supporta ancora la 1.6.1170;
  3. i log di Crash Logger / STR.
- **Timebox:** se la decisione sulla piattaforma (STR o SkyMP) porta verso SkyMP, questa task perde valore. Non superare qualche ora senza parlarne in riunione.

### Prossime task già individuate (non ancora assegnate)
- Ricognizione di **Mereth Roleplay** con lo stesso template, con attenzione a regole e onboarding dal punto di vista RP.
- Bozza della decisione **D-019** (piattaforma), da scrivere dopo spike e ricognizioni.

---

## Archivio

*(le settimane chiuse finiscono qui)*
