# STEP 0 — Fondamenta

> **Obiettivo:** arrivare al punto in cui il team può connettersi su un mondo Skyrim **vuoto e stabile**, pronto per essere riempito dai sistemi RP delle fasi successive.
>
> **Status attuale:** in corso (workflow di sviluppo in setup)

## Filosofia dello Step 0

In questa fase **non costruiamo gameplay**. Costruiamo le fondamenta:
- ambiente di sviluppo funzionante
- workflow di team
- mondo "pulito" su cui poter costruire

Tutto ciò che assomiglia a un "sistema complesso" (economia, reputazione, background avanzati, classi, magie custom) **non appartiene a questa fase**, anche se viene in mente come idea brillante. Verrà nello Step 1 e successivi.

## Priorità (in ordine)

### Priorità 1 — Workflow di sviluppo

**Cosa significa:** GitHub + struttura di repo + GitHub Desktop su Mac e Windows, Cowork connesso al repo sul Mac.

**Criterio di completamento:**
- [ ] Repository `SkyrimRPServer` esistente su GitHub
- [ ] Clonato sul Mac in `/Users/david/SkyrimRPServer`
- [ ] Clonato sul fisso Windows in `C:\SkyrimRPServer`
- [ ] Struttura iniziale di file creata e committata
- [ ] Capacità di fare push/pull tra Mac, Windows e GitHub testata almeno una volta

### Priorità 2 — Versione di Skyrim fissata

**Cosa significa:** decidere la build esatta di Skyrim Special Edition supportata da Skyrim Together Reborn ora, e bloccarla su ogni macchina del team.

**Criterio di completamento:**
- [ ] Versione SSE scelta e documentata in `DEV_SETUP.md`
- [ ] Steam auto-update disabilitato su tutte le macchine dei dev
- [ ] (Se necessario) downgrader applicato per allinearsi alla versione richiesta
- [ ] Decisione registrata in `DECISIONS.md`

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
- [ ] Profilo MO2 `RPServer-Dev` creato
- [ ] Skyrim si avvia tramite MO2 con SKSE attivo
- [ ] Creation Kit si apre senza errori
- [ ] SSEEdit si apre e carica i master vanilla
- [ ] VS Code installato per editing Papyrus
- [ ] Versioni installate documentate in `MODLIST.md`

### Priorità 5 — Mod custom `RPServer_EmptyWorld` (prima mod proprietaria)

> **Nota storica:** lo Step 0 originale prevedeva due priorità separate, P5 "NoNPCs" + P6 "Disattivazione main quest". In data 2026-05-12 (vedi `DECISIONS.md` D-012) le due sono state unificate nella mod `RPServer_EmptyWorld`, che copre NPC + quest + sistema Dragonborn insieme.

**Cosa significa:** una mod che trasforma Skyrim in un mondo "tabula rasa" — niente NPC umanoidi vanilla attivi, niente quest narrative vanilla, sistema Dragonborn disabilitato. Tutto sotto controllo via whitelist tecnica (vedi D-010 + D-011).

**Criterio di completamento:**
- [x] Whitelist decisa e registrata in `DECISIONS.md` (D-010) e in `custom_mods/RPServer_EmptyWorld/docs/WHITELIST.md`
- [x] Sorgenti Pascal personalizzati scritti e committati (`source/RPServer_EmptyWorld_DisableNPCs.pas` + `RPServer_EmptyWorld_DisableQuests.pas`)
- [x] Sorgenti Papyrus scritti (`source/RPServer_EmptyWorldInit.psc` + `RPServer_EmptyWorldPlayerAlias.psc`)
- [x] `MANIFEST.md` della mod compilato
- [x] `PROCEDURA_BUILD.md` documentata
- [ ] Plugin `.esp` generato sul fisso Windows e committato
- [ ] Test A (statico SSEEdit) passato — vedi `custom_mods/RPServer_EmptyWorld/tests/CHECKLIST.md`
- [ ] Test B (singleplayer Whiterun + Riverwood + dungeon) passato
- [ ] Test C (STR con un altro dev) passato
- [ ] Bug e edge case documentati in `IMPLEMENTED.md`
- [ ] Release `v1.0.0` taggata su GitHub

### Priorità 6 — Disattivazione main quest e narrativa vanilla (assorbita in P5)

> Originariamente coperta da **Skyrim Unbound Reborn**. Con la decisione D-012, l'obiettivo è ora assorbito dentro `RPServer_EmptyWorld` (vedi P5).
>
> Skyrim Unbound Reborn resta utile come **safety net** in modlist e come fornitore di **alternate start** (spawn iniziale del personaggio dove vuole, senza Helgen). EmptyWorld non dipende da Unbound: se Unbound viene rimosso, EmptyWorld continua a fare il suo lavoro.

**Criterio di completamento (residuo):**
- [ ] Skyrim Unbound Reborn installato e testato come alternate start in STR
- [ ] Verifica incrociata: con EmptyWorld attivo + Unbound, le quest vanilla restano comunque inerti
- [ ] Decisione finale "Unbound resta o si rimuove?" registrata in `DECISIONS.md`

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
P1 (workflow) ──┬──> P5 (EmptyWorld: NPC + quest + Dragonborn) ──> P8 (background)
                │
P2 (versione)──┬──> P3 (STR test) ──> P4 (ambiente) ──> P5
                │
P6 (Unbound)──── safety net opzionale, in parallelo a P5

P7 (città) può essere decisa in qualsiasi momento dopo P1
```

P1 e P2 sono i veri sblocchi: senza di loro non si fa nulla.
