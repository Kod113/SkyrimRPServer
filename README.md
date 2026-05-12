# SkyrimRPServer

Repository di sviluppo per un server **MMO RP persistente** ambientato in Skyrim Special Edition, basato sulla mod **Skyrim Together Reborn**. Il progetto trasforma Skyrim in un sandbox sociale interamente guidato dai giocatori: niente NPC vanilla, niente quest precostruite, economia e politica gestite dai player.

> Status: **Step 0 — Fondamenta** (workflow + ambiente + mondo vuoto)

## Cosa contiene questo repo

Questo repository è il **cantiere tecnico** del progetto. Ospita:

- la documentazione di progetto (visione, decisioni, roadmap)
- le mod custom sviluppate dal team
- le specifiche tecniche di razze, spell, poteri da implementare
- le configurazioni del client (load order, .ini)
- i pacchetti distribuibili ai giocatori

La community e la comunicazione viva (chat, voce, annunci, lore narrativa per i giocatori) vivono invece su **Discord**.

## Struttura del repository

| Percorso | Cosa contiene |
|---|---|
| `README.md` | Questo file — punto di ingresso |
| `VISION.md` | Visione strategica del progetto (immutabile, citabile) |
| `STEP_0.md` | Roadmap della prima fase con criteri di completamento |
| `ROADMAP.md` | Fasi successive (preliminare) |
| `DEV_SETUP.md` | Tool e mod obbligatori per il reparto dev |
| `MODLIST.md` | Lista mod terze con stato di compatibilità STR |
| `DECISIONS.md` | Log delle decisioni di design (perché abbiamo scelto così) |
| `IMPLEMENTED.md` | Changelog: cosa è stato fatto, in che versione, quando |
| `MANIFEST_TEMPLATE.md` | Template che ogni mod custom deve compilare |
| `custom_mods/` | Mod sviluppate dal team |
| `configs/` | File di configurazione (load order, .ini, profili MO2) |
| `specs/` | Specifiche tecniche di razze, spell, poteri (per i dev) |
| `client_pack/` | Pacchetto distribuibile ai giocatori (futuro Wabbajack) |
| `docs_for_players/` | Documentazione user-facing per i giocatori |

## Per chi sviluppa (workflow)

**Prima di iniziare a lavorare**, sempre: apri GitHub Desktop → *Fetch origin* → *Pull origin* se ci sono novità.

**Quando finisci una sessione di lavoro**, sempre: GitHub Desktop → scrivi il summary → *Commit to main* → *Push origin*.

**Quando apri una sessione con Claude (Cowork)**: chiedigli di leggere `README.md`, `IMPLEMENTED.md`, `DECISIONS.md` come prima cosa, così ha tutto il contesto del progetto.

## Per i giocatori

I giocatori del server **non devono usare questo repository**. Per loro è prevista una procedura di installazione semplificata tramite pacchetto Wabbajack (vedi `docs_for_players/`). Questo repo è solo per chi sviluppa il server.

## Convenzioni

- **Lingua**: tutta la documentazione interna è in italiano. I commenti tecnici nel codice possono essere in inglese se aiutano la chiarezza.
- **Versioning mod**: schema `vMAJOR.MINOR.PATCH` (es. `v1.0.0`). Maggiore = breaking change, Minor = nuove funzionalità retrocompatibili, Patch = bugfix.
- **Branch**: per ora usiamo solo `main`. Branch separati verranno introdotti se più persone svilupperanno in parallelo.
- **Commit message**: prima riga concisa in italiano (es. `NoNPCs v0.1 — primo build con whitelist`); dettagli opzionali sotto.
