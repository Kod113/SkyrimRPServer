# TASKS — Task settimanali del team

> **Come funziona:** ognuno ha **una task piccola a settimana**, con una consegna chiara. Le task vengono assegnate di persona. Questo file è lo **storico scritto** di cosa è stato assegnato e consegnato, settimana per settimana. Ogni venerdì c'è la riunione: si guarda cosa è stato chiuso, si raccolgono le idee nuove e si decidono le task della settimana dopo.
>
> **Regola:** una task va **portata a termine**. Se non si chiude, in riunione si dice perché e si fissa una nuova data.
>
> **Priorità:** 🔴 alta (blocca altro lavoro) · 🟡 media · 🟢 bassa

---

## Settimana lun 28/09 → ven 02/10/2026 — riunione venerdì 2 ottobre

| # | Chi | Task | Priorità | Consegna | Stato |
|---|---|---|---|---|---|
| T-001 | David | **Far partire STR sul PC Windows di David.** Oggi il client non si avvia. Trovare la causa e una soluzione per potersi collegare. | 🟡 Media | Causa + soluzione scritte in `docs_for_players/TROUBLESHOOTING.md` (se riguarda anche i giocatori) o in `IMPLEMENTED.md` | 🚫 Annullata (30/09: STR non verrà più usato) |
| T-002 | Giacomo | **Ricognizione da giocatore su Keizaal Online o Mereth Roleplay** (a scelta; Mereth dà un secondo punto di vista, visto che Alessio fa Keizaal). Stesso template della T-004. L'aggiornamento del PC Windows resta in sospeso finché non si conferma che serve. **Non usare il PC di sviluppo.** | 🔴 Alta | `specs/platform/ricognizione_<server>.md` + 3-5 screenshot | ⏳ Aperta |
| T-003 | Davide + David | **Capire SkyMP:** com'è fatta la struttura di base (server, client, gamemode), come collegarci al server e come agganciare i nostri `.esp`. Tutto il resto (persistenza, regole nel gamemode…) è un extra se avanza tempo. Guida: `specs/platform/PIANO_AZIONE.md`. | 🔴 **Assoluta** | `specs/platform/skymp_spike.md` compilato (almeno sezioni 1-4) + demo o screenshot venerdì | ⏳ Aperta |
| T-004 | Alessio | **Ricognizione di Keizaal Online da giocatore.** Installare il launcher, giocare 1-2 sessioni (una in orario di punta), compilare il template. **Non usare il PC di sviluppo.** | 🔴 Alta | `specs/platform/ricognizione_keizaal.md` (copiato da `_template_ricognizione.md`) + 3-5 screenshot | ⏳ Aperta |

**Priorità della settimana:** capire SkyMP e come lo usano i server concorrenti (vedi `specs/platform/README.md`). Serve a prendere la decisione D-019 sulla piattaforma.

**Checkpoint:** mercoledì 1 ottobre ognuno scrive nel gruppo due righe su a che punto è.

### Note su T-001
- **Prima pista:** STR v1.8.1 (14/09/2026) ha aggiunto il supporto a Skyrim SE **1.7.104**. Il nostro setup è fissato a **1.6.1170** + SKSE 2.2.6 (D-009). Controllare:
  1. che Steam non abbia aggiornato Skyrim a 1.7.x;
  2. quale versione di STR è installata, e se l'ultima supporta ancora la 1.6.1170;
  3. i log di Crash Logger / STR.
- **Timebox:** se la decisione sulla piattaforma (STR o SkyMP) porta verso SkyMP, questa task perde valore. Non superare qualche ora senza parlarne in riunione.

### Prossime task già individuate (non ancora assegnate)
- Bozza della decisione **D-019** (piattaforma), da scrivere dopo spike e ricognizioni.
- **Politica di versione di SkyMP:** possiamo restare sulla 1.6.1170, o a ogni aggiornamento di Skyrim bisogna aspettare una release di SkyMP? (chiedere sul Discord di SkyMP + storia del repo)
- **Bloccare la versione di Skyrim** in modo affidabile su tutti i PC: procedura testata (il 30/09 Steam ha aggiornato da solo Skyrim alla 1.7.104 durante lo spike)
- **Guide per i giocatori:** sezione di downgrade alla 1.6.1170 in `TROUBLESHOOTING.md` e passo per bloccare gli aggiornamenti nella guida di installazione

---

## Archivio

*(le settimane chiuse finiscono qui)*
