# STEP 0 — Fondamenta

> **Obiettivo:** arrivare al punto in cui il team può connettersi su un mondo Skyrim **vuoto e stabile**, pronto per essere riempito dai sistemi RP delle fasi successive.
>
> **Status attuale (2026-09-27):** in corso. Chiuse P1 (workflow) e P2 (versione). Blocco principale: generare l'`.esp` di EmptyWorld v0.5 e fare il test su STR con 2 dev (P3 + P5).

## Filosofia dello Step 0

In questa fase **non costruiamo gameplay**. Costruiamo le fondamenta:
- ambiente di sviluppo funzionante
- workflow di team
- mondo "pulito" su cui poter costruire

Tutto ciò che assomiglia a un "sistema complesso" (economia, reputazione, background avanzati, classi, magie custom) **non appartiene a questa fase**, anche se viene in mente come idea brillante. Verrà nello Step 1 e successivi.

## Priorità (in ordine)

### Priorità 0 — Decisione piattaforma: STR o SkyMP (🔴 gate, aperta il 2026-09-27)

**Cosa significa:** prima di costruire altro, verificare se Skyrim Together Reborn è una base adatta a un MMO RP persistente, oppure se conviene **SkyMP**, la piattaforma usata da Keizaal Online e Mereth Roleplay. Dettagli e domande in `specs/platform/README.md`.

**Criterio di completamento:**
- [ ] Spike tecnico SkyMP completato (`specs/platform/skymp_spike.md`)
- [ ] Ricognizione di almeno un server concorrente (`specs/platform/ricognizione_*.md`)
- [ ] Decisione **D-019** registrata in `DECISIONS.md`
- [ ] Se si passa a SkyMP: STEP_0, ROADMAP, DEV_SETUP e MODLIST rivisti di conseguenza

> Finché P0 è aperta, le priorità legate a STR (P3, P5 test C, P6) sono **in pausa**. Il lavoro già fatto su EmptyWorld resta valido: è un override di record e dovrebbe funzionare anche con SkyMP (da verificare nello spike).

### Priorità 1 — Workflow di sviluppo

**Cosa significa:** GitHub + struttura di repo + GitHub Desktop su Mac e Windows, Cowork connesso al repo sul Mac.

**Criterio di completamento:**
- [x] Repository `SkyrimRPServer` esistente su GitHub
- [x] Clonato sul Mac in `/Users/david/SkyrimRPServer`
- [x] Clonato sul fisso Windows in `C:\SkyrimRPServer`
- [x] Struttura iniziale di file creata e committata
- [x] Capacità di fare push/pull tra Mac, Windows e GitHub testata almeno una volta (merge Mac↔Windows del 2026-05-21)

### Priorità 2 — Versione di Skyrim fissata

**Cosa significa:** decidere la build esatta di Skyrim Special Edition supportata da Skyrim Together Reborn ora, e bloccarla su ogni macchina del team.

**Criterio di completamento:**
- [x] Versione SSE scelta e documentata in `DEV_SETUP.md` (1.6.1170 + SKSE 2.2.6)
- [ ] Steam auto-update disabilitato su tutte le macchine dei dev
- [ ] (Se necessario) downgrader applicato per allinearsi alla versione richiesta
- [x] Decisione registrata in `DECISIONS.md` (D-009)

### Priorità 3 — Connessione STR base verificata

**Cosa significa:** Skyrim Together Reborn funziona tra almeno 2 dev con il gioco vanilla o quasi.

**Criterio di completamento:**
- [ ] STR installato secondo la guida ufficiale
- [ ] 2 dev si connettono allo stesso server STR
- [ ] Si vedono nel mondo, si muovono insieme, dialogano in voce
- [ ] Disconnessione e riconnessione testate
- [ ] Risultato annotato in `IMPLEMENTED.md`

### Priorità 4 — Ambiente dev completo sul fisso Windows

**Cosa significa:** lo stack di tool e mod fondamentali (vedi `DEV_SETUP.md`) installato e funzionante via Mod Organizer 2.

**Criterio di completamento:**
- [ ] Tutti i tool/mod base dello `DEV_SETUP.md` installati
- [x] Profilo MO2 `RPServer-Dev` creato (17 mod attive, vedi `MODLIST.md`)
- [ ] Skyrim si avvia tramite MO2 con SKSE attivo
- [ ] Creation Kit si apre senza errori
- [ ] SSEEdit si apre e carica i master vanilla
- [ ] VS Code installato per editing Papyrus
- [ ] Versioni installate documentate in `MODLIST.md`

### Priorità 5 — Mod custom `RPServer_EmptyWorld` (prima mod proprietaria)

> **Nota storica:** lo Step 0 originale prevedeva due priorità separate, P5 "NoNPCs" + P6 "Disattivazione main quest". In data 2026-05-12 (vedi `DECISIONS.md` D-012) le due sono state unificate nella mod `RPServer_EmptyWorld`, che copre NPC + quest + sistema Dragonborn insieme.

**Cosa significa:** una mod che trasforma Skyrim in un mondo "tabula rasa" — niente NPC umanoidi vanilla attivi, niente quest narrative vanilla, sistema Dragonborn disabilitato. Tutto sotto controllo via whitelist tecnica (vedi D-010 + D-011).

**Criterio di completamento:**
> **Aggiornamento 2026-06-21 (D-018):** dalla v0.5.0 EmptyWorld disabilita **solo gli ACHR**. La disattivazione delle quest e il fallback Papyrus sono usciti dallo scope, quindi P6 torna un punto aperto.

- [x] Whitelist decisa e registrata in `DECISIONS.md` (D-010 → superata da D-015, D-016, D-017) e in `custom_mods/RPServer_EmptyWorld/docs/WHITELIST.md`
- [x] Sorgente Pascal `source/RPServer_EmptyWorld_DisableNPCs.pas` scritto e committato (v0.4: risolve anche i `LVLN`)
- [x] ~~Sorgenti quest Pascal + Papyrus~~: scritti, ma fuori scope dalla v0.5 (D-018)
- [x] `MANIFEST.md` della mod compilato
- [x] `PROCEDURA_BUILD.md` documentata
- [x] Prima build di prova dell'`.esp` (2026-05-21, v0.3): ha fatto emergere il bug dei `LVLN` → D-017
- [ ] Plugin `.esp` **v0.5** generato sul fisso Windows e committato
- [ ] Test A (statico SSEEdit) passato — vedi `custom_mods/RPServer_EmptyWorld/tests/CHECKLIST.md`
- [ ] Test B (singleplayer Whiterun + Riverwood + dungeon) passato
- [ ] Test C (STR con un altro dev) passato
- [ ] Bug e edge case documentati in `IMPLEMENTED.md`
- [ ] Release `v1.0.0` taggata su GitHub

### Priorità 6 — Disattivazione main quest e narrativa vanilla (⚠️ riaperta)

> **Aggiornamento 2026-06-21 (D-018):** EmptyWorld v0.5 non disattiva più le quest, quindi questa priorità **non è più assorbita** in P5 ed è di nuovo aperta. Nel profilo MO2 attivo oggi c'è **Alternate Start – Live Another Life**, non Skyrim Unbound. Va deciso se basta un alternate start o se la disattivazione delle quest va reintrodotta.
>
> *Storico:* originariamente coperta da **Skyrim Unbound Reborn**. Con la decisione D-012 l'obiettivo era stato assorbito dentro `RPServer_EmptyWorld`.
>
> Skyrim Unbound Reborn resta utile come **safety net** in modlist e come fornitore di **alternate start** (spawn iniziale del personaggio dove vuole, senza Helgen). EmptyWorld non dipende da Unbound: se Unbound viene rimosso, EmptyWorld continua a fare il suo lavoro.

**Criterio di completamento (residuo):**
- [ ] Scelta tra Alternate Start – LAL e Skyrim Unbound Reborn, registrata in `DECISIONS.md`
- [ ] Alternate start scelto testato in STR
- [ ] Verifica: con EmptyWorld v0.5 + alternate start, le quest vanilla restano inerti (o non creano problemi) in un mondo senza NPC
- [ ] Se non restano inerti: decisione su dove reintrodurre la disattivazione delle quest (EmptyWorld o mod separata)

### Priorità 7 — Prime città RP designate

**Cosa significa:** decidere quali 1-3 città del mondo Skyrim saranno gli hub iniziali dell'attività RP.

**Suggerimento iniziale:** Whiterun (centrale, grande) + Riverwood (intimo, di partenza). Da confermare con il fondatore.

**Criterio di completamento:**
- [ ] Città designate decise e documentate in `DECISIONS.md`
- [ ] Eventuali modifiche di mappa (rimozione strutture, aggiunta zone RP) progettate
- [ ] Sistema di "fast travel" deciso (vanilla? rimosso? sostituito?)

### Priorità 8 — Sistema background iniziale

**Cosa significa:** quando un player entra per la prima volta nel server, ha un'identità RP definita (origine, mestiere, motivazione), non parte come "prigioniero generico".

**Approccio probabile:** mod custom basata su Papyrus + un menu di scelta del background al primo spawn. Da progettare.

**Criterio di completamento:**
- [ ] Specifica del sistema documentata in `specs/`
- [ ] Mod implementata
- [ ] Test multiplayer

## Cosa NON appartiene allo Step 0

Per evitare scope creep, esplicitiamo cosa **rimandiamo**:

- Sistema economico player-driven (Step 1 o 2)
- Sistema reputazione/fama (Step 1 o 2)
- Combat balance per RP (Step 2)
- Classi e archetipi custom (Step 2)
- Spell personalizzate (Step 3+)
- Razze custom (Step 3+)
- Distribuzione Wabbajack ai giocatori "normali" — Step 0 chiude quando il *team dev* può giocare, non quando la community può

## Dipendenze tra le priorità

```
P1 (workflow) ✅ ──┬──> P5 (EmptyWorld v0.5: solo ACHR) ──> P8 (background)
                   │
P2 (versione) ✅ ──┬──> P3 (STR test) ──> P4 (ambiente) ──> P5
                   │
P6 (quest vanilla / alternate start) ── riaperta da D-018, da verificare insieme al test C di P5

P7 (città) può essere decisa in qualsiasi momento dopo P1
```

P1 e P2 sono i veri sblocchi: senza di loro non si fa nulla.
