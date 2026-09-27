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
| `TASKS.md` | Task settimanali del team (aggiornato alla riunione del venerdì) |
| `comms/` | Messaggio settimanale + promemoria riunione (Discord automatico, WhatsApp con un clic) |
| `DEV_SETUP.md` | Tool e mod obbligatori per il reparto dev |
| `MODLIST.md` | Lista mod unica: profilo MO2 attivo + tutte le mod con stato di compatibilità STR |
| `fahdon_modlist_analisi.md` | Analisi della modlist Fahdon come riferimento per scegliere le mod |
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

**Quando una sessione con Claude produce informazioni utili ai giocatori** (domande su installazione, comandi, problemi tecnici, regole di gioco): aggiorna il file corrispondente in `docs_for_players/` prima di chiudere la sessione. Regola pratica:

| Tipo di contenuto | File da aggiornare |
|---|---|
| Domande frequenti su installazione o gioco | `docs_for_players/FAQ.md` |
| Problemi tecnici e soluzioni | `docs_for_players/TROUBLESHOOTING.md` |
| Passi di installazione nuovi o modificati | `docs_for_players/INSTALL_GUIDE.md` |
| Passi del primo accesso nuovi o modificati | `docs_for_players/FIRST_LOGIN.md` |
| Regole del server aggiornate | `docs_for_players/SERVER_RULES.md` |
| Lore, RP, creazione personaggio | `docs_for_players/RP_GUIDE.md` |

Questa regola vale su entrambi gli ambienti di sviluppo (Mac e Windows). Dopo aver aggiornato i file, fai sempre commit + push.

## Per i giocatori

I giocatori del server **non devono usare questo repository**. Per loro è prevista una procedura di installazione semplificata tramite pacchetto Wabbajack (vedi `docs_for_players/`). Questo repo è solo per chi sviluppa il server.

## Convenzioni

- **Lingua**: tutta la documentazione interna è in italiano. I commenti tecnici nel codice possono essere in inglese se aiutano la chiarezza.
- **Versioning mod**: schema `vMAJOR.MINOR.PATCH` (es. `v1.0.0`). Maggiore = breaking change, Minor = nuove funzionalità retrocompatibili, Patch = bugfix.
- **Branch**: per ora usiamo solo `main`. Branch separati verranno introdotti se più persone svilupperanno in parallelo.
- **Commit message**: prima riga concisa in italiano (es. `NoNPCs v0.1 — primo build con whitelist`); dettagli opzionali sotto.
