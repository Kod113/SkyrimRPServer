# Proposta: cosa può fare ogni job e il ruolo di partenza

**Autore:** david (con Claude) · **Data:** 14 ottobre 2026
**Stato:** APPLICATA IN VIA PROVVISORIA il 14 ottobre 2026 ("per adesso sì", le 5 decisioni di fondo restano aperte). Nel database (`team/david/db/jobs.json`) è in `allowed_actions` (copia in `allowed_actions_proposal`).
**Base:** catena dei job del Discord Atronach RP (chi fornisce chi, cosa serve a chi). Principio: *ogni job è utile agli altri*, quindi ogni azione "chiave" è riservata a chi ne ha bisogno nella catena, e le azioni comuni sono aperte a tutti.

## Le 14 azioni

| Azione | Cosa permette |
|---|---|
| `gather_plants` | Raccogliere piante, funghi e uova selvatiche |
| `gather_ore` | Estrarre minerali dalle miniere |
| `loot_animal` | Scuoiare / prendere parti da animali morti |
| `fish` | Pescare |
| `smith` | Forgiare e riparare armi, armature e utensili |
| `brew` | Preparare pozioni, rimedi e veleni |
| `heal` | Curare altri personaggi |
| `arrest` | Arrestare e perquisire |
| `fight_in_war` | Combattere nelle guerre tra fazioni |
| `sell_public_shop` | Gestire uno shop pubblico |
| `pay_salary` | Pagare stipendi e commissioni |
| `post_board` · `take_board` · `trade` | **Comuni a tutti:** appendere/accettare richieste in bacheca, scambiare con altri player |

## Chi può fare cosa

| Job | Azioni specifiche (oltre alle comuni) | Perché |
|---|---|---|
| Minatore | `gather_ore` | Solo lui estrae: il Fabbro ha bisogno di lui |
| Cacciatore | `loot_animal`, `gather_plants`, `fish` | Fornisce pelli, carne e ingredienti a Fabbro e Alchimista |
| Fabbro | `smith`, `sell_public_shop` | Unico a forgiare; serve guardie, soldati, Jarl |
| Alchimista | `brew`, `gather_plants`, `sell_public_shop` | Unico a preparare pozioni; raccoglie anche da sé |
| Medico | `heal`, `gather_plants` | Cura; si approvvigiona di erbe |
| Guardia cittadina | `arrest` | Ordine in città; il crimine passa da loro |
| Soldato | `fight_in_war` | Guerre tra fazioni |
| Jarl | `pay_salary` | Fa girare l'economia con stipendi e commissioni |
| **Avventuriero** (ruolo di partenza, proposta) | `gather_plants`, `loot_animal`, `fish` | Raccoglie materiali per gli altri ("giovani avventurieri" nel Discord); nessuna azione che sostituisca un job |

Esempio pratico: un nuovo giocatore parte da Avventuriero, raccoglie Blue Mountain Flower e le porta all'Alchimista; non può né estrarre ferro né preparare pozioni, quindi per quelle cose ha bisogno di un Minatore o di un Alchimista.

## Decisioni che ti chiedo

1. **Avventuriero come ruolo di partenza:** sì o no? Se no, il nuovo giocatore resterebbe senza azioni finché non ottiene un job.
2. **Raccolta aperta o riservata?** Qui `gather_plants` è per 5 ruoli. Si può aprire a tutti (più semplice, ma l'Alchimista conta meno) o ridurre a Cacciatore e Avventuriero (come nel Discord).
3. **Pesca** come sopra: oggi Cacciatore e Avventuriero.
4. **Come si cambia job:** il Discord non lo dice. Serve una regola (approvazione dello staff? prova in gioco? costo?).
5. **Scasso e crimini:** non sono nelle 14 azioni. Keizaal Online usa una lista di persone autorizzate dallo staff; conviene decidere se fare lo stesso (nessun job scassina di default).

## Cosa cambia una volta approvato

Si copia `allowed_actions_proposal` in `allowed_actions` (lo faccio io) e la funzione `jobCan` del gamemode (`gamemode_draft`) comincia a rispondere sì/no invece di `undefined`. Se dici "tutto approvato", fatto in pochi minuti.
