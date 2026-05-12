# MANIFEST — [Nome della Mod]

> **Cosa è questo file:** template che ogni mod custom del progetto deve compilare e mantenere aggiornato. Sta in `custom_mods/[NomeMod]/MANIFEST.md`.
>
> **Come usarlo:** copia questo file dentro la cartella di una nuova mod, rinominalo `MANIFEST.md`, e compila ogni sezione. Le sezioni con `*da compilare*` sono obbligatorie.

---

## Identità

- **Nome ufficiale mod:** *da compilare* (es. `RPServer_NoNPCs`)
- **Versione corrente:** *da compilare* (formato `vMAJOR.MINOR.PATCH`)
- **Autore/i:** *da compilare*
- **Data di creazione:** *da compilare*
- **Ultimo aggiornamento:** *da compilare*
- **Stato:** *In sviluppo / Beta / Stabile / Deprecato*
- **Profilo:** *Player / Staff / Player + Staff*

## Scopo della mod

*Una o due frasi che descrivono **cosa fa** la mod e **perché esiste**. Linguaggio comprensibile a chiunque, non solo ai tecnici.*

## Cosa fa concretamente

*Lista puntuale delle azioni meccaniche della mod. Esempio:*
*- Disabilita tutti i reference `ACHR` (NPC piazzati) nei master vanilla*
*- Mantiene attivi gli NPC nella whitelist (vedi sezione Eccezioni)*
*- Non modifica il record `NPC_` (la "classe"), solo i reference (le "istanze")*

## Cosa NON fa / cosa NON tocca

*Esplicitare i confini della mod è importante quanto descriverne lo scopo. Esempio:*
*- Non disabilita le quest che dipendono da quegli NPC*
*- Non modifica i record `RACE`*
*- Non rimuove i package AI dagli NPC (sono ancora "esistenti", solo non-renderizzati)*

## Dipendenze

### Master richiesti
*Lista degli `.esm` da cui questa mod dipende. Esempio:*
*- `Skyrim.esm`*
*- `Update.esm`*
*- `Dawnguard.esm`*

### Mod richieste
*Altre mod che devono essere installate e attive. Esempio:*
*- SKSE64 (se la mod ha script)*
*- PapyrusUtil (se usa funzioni avanzate)*

### Mod incompatibili note
*Mod che entrano in conflitto certo. Esempio:*
*- Mod che ripopolano cellule (es. "Populated Cities") — sovrascrivono i nostri disable*

## Record modificati

*Tipi di record toccati, per orientare chi farà patch di compatibilità in futuro. Esempio:*

| Tipo record | Numero approssimativo | Note |
|---|---|---|
| `ACHR` (Placed NPC) | ~10000 | Flag *Initially Disabled* attivato |
| `NPC_` | 0 | Non tocchiamo le definizioni base |
| `QUST` | 0 | Le quest non vengono modificate qui |

## Compatibilità con Skyrim Together Reborn

- **Sincronizzazione side-effects:** *descrivi se le azioni della mod sono lato client o sincronizzate*
- **Test in STR multiplayer:** *eseguito sì/no, con chi, con che esito*
- **Edge case noti in STR:** *eventuali comportamenti diversi tra client*

## Whitelist / Eccezioni

*Se la mod ha logica condizionale (es. "disabilita tutti gli NPC TRANNE X, Y, Z"), elencare le eccezioni qui in modo esplicito. Esempio:*
*- Cavalli delle stalle: mantenuti*
*- Mercante "Belethor" di Whiterun: mantenuto*
*- Draghi: mantenuti per eventi DM*

## File inclusi nella mod

| File | Cosa è |
|---|---|
| `plugin.esp` | Il plugin compilato, deployabile |
| `source/*.pas` | Script Pascal usati per generare il plugin (se applicabile) |
| `source/*.psc` | Script Papyrus sorgenti (se applicabile) |
| `MANIFEST.md` | Questo file |

## Test eseguiti

*Registro di cosa è stato testato. Esempio:*

| Data | Test | Esito | Note |
|---|---|---|---|
| 2026-05-15 | Singleplayer Whiterun | ✅ | Mondo vuoto come atteso |
| 2026-05-16 | STR 2 player | ✅ | Coerenza tra i due |

## Note di rilascio (per i giocatori)

*Versione user-facing del changelog, da copia-incollare nelle Release di GitHub e/o annunci Discord. Linguaggio non tecnico.*

## Changelog tecnico

### vX.Y.Z — YYYY-MM-DD
- Lista puntuale delle modifiche

### vX.Y.Z-1 — YYYY-MM-DD
- ...
