# ROADMAP — Visione di lungo periodo

> **Cosa contiene:** una stima delle fasi successive allo Step 0, in ordine di priorità.
>
> **Status:** preliminare. Le fasi oltre lo Step 0 verranno raffinate man mano che ci avviciniamo. È normale che cambino. Lo scopo di questo documento è dare una **direzione di massima**, non un piano dettagliato.

---

## Step 0 — Fondamenta *(in corso)*

Vedi `STEP_0.md` per dettagli completi.

**Obiettivo sintetico:** workflow stabile + ambiente dev funzionante + mondo vuoto in cui il team può connettersi e muoversi.

**Esce quando:** il team dev può connettersi su STR in un mondo senza NPC vanilla, senza quest vanilla attive, con un sistema di background minimo, e mantenere stabilità di sessione per almeno un'ora.

---

## Step 1 — Identità e presenza dei player

**Obiettivo sintetico:** quando un player entra nel mondo, ha un'identità RP completa e visibile agli altri.

Ambito previsto:
- **Sistema background completo:** menu di creazione personaggio con scelta di origine, mestiere, motivazione, oggetti di partenza
- **Visibilità sociale:** nomi sopra la testa? Reputazione visibile? Etichette di ruolo (player-mercante, player-jarl)?
- **Sistema di "carta d'identità":** documento RP con storia, fazione, status
- **Persistenza:** i dati del personaggio sopravvivono ai logout

Mod custom previste: `RPServer_Background`, `RPServer_Identity`, `RPServer_PlayerPersistence`.

---

## Step 2 — Economia player-driven

**Obiettivo sintetico:** il mondo ha un'economia reale che reagisce alle azioni dei giocatori.

Ambito previsto:
- Sistema di mercanti-player (vendere/comprare via interfaccia RP)
- Prezzi regionali influenzati dalle risorse disponibili
- Materie prime estraibili dai player
- Sistema di valuta condivisa e bauli persistenti
- Esempio di evento "miniera occupata da banditi → prezzo del vetro alle stelle" della VISIONE diventa meccanicamente reale

Mod custom previste: `RPServer_Economy`, `RPServer_RegionalPrices`, `RPServer_PlayerShop`.

---

## Step 3 — Politica e reputazione

**Obiettivo sintetico:** azioni e fama dei player hanno conseguenze sociali e politiche misurabili.

Ambito previsto:
- Sistema reputazione (gloria, infamia, fazione)
- Strutture politiche player-controlled (Jarl, capitano della guardia, sindaci)
- Conflitti tra fazioni con regole chiare
- Sistema di "crimine e legge" gestito da player-guardie
- Eventi storici che entrano nella lore canonica

Mod custom previste: `RPServer_Reputation`, `RPServer_Faction`, `RPServer_Politics`.

---

## Step 4 — Contenuto custom: razze, spell, poteri

**Obiettivo sintetico:** il sistema di gioco si differenzia da Skyrim vanilla con meccaniche RP-friendly.

Ambito previsto:
- Razze custom progettate dal team (specifiche in `specs/races/`)
- Spell personalizzate (specifiche in `specs/spells/`)
- Poteri unici legati a background o azioni RP (`specs/powers/`)
- Bilanciamento del combat per favorire RP sopra grind

Mod custom previste: `RPServer_Races`, `RPServer_Spells`, `RPServer_Powers`, `RPServer_CombatBalance`.

---

## Step 5 — Distribuzione pubblica e onboarding giocatori

**Obiettivo sintetico:** il server è pronto per accogliere giocatori esterni al team dev.

Ambito previsto:
- Modlist Player stabile e pacchettizzata via Wabbajack
- Modlist Staff parallela per moderazione
- Guida di installazione per giocatori (`docs_for_players/`)
- Sistema di onboarding nuovo giocatore (in-game + Discord)
- Regole del server pubblicate
- Sistema di candidatura/screening per accesso al server

Output: prima **Release v1.0.0** del pacchetto server, pubblicata su GitHub Releases e annunciata sulla community.

---

## Step 6+ — Manutenzione, eventi, espansioni

Una volta che il server è vivo, il lavoro di sviluppo diventa:
- Bugfix continuo basato su feedback dei giocatori
- Eventi del DM (worldbuilding live, quest custom temporanee)
- Espansioni di contenuto (nuove razze, nuove zone RP, nuove fazioni)
- Bilanciamento basato su come i giocatori effettivamente usano i sistemi
- Eventuali aggiornamenti di STR / SSE quando appropriato (con downtime pianificato)

Non c'è una "fine" dichiarata: un server RP vive finché ha giocatori.

---

## Filosofia di pianificazione

Tre regole che ci diamo per non perderci:

1. **Una fase alla volta.** Non si lavora su Step 1 finché Step 0 non è chiuso. Tentare il parallelismo precoce è la prima causa di morte dei progetti modding.
2. **Refattorizzare quando emerge il pattern, non prima.** Le prime mod custom saranno probabilmente brutte. Va bene. Si pulisce dopo aver capito quali astrazioni sono davvero utili.
3. **Stabilità batte ambizione.** Se durante una fase emergono problemi di stabilità, **si torna indietro e si risolve**, anche se rallenta la roadmap. Un server instabile perde giocatori; uno stabile ma con meno feature li mantiene.
