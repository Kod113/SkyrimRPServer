# CLAUDE.md: regole per chi lavora nel repo

Valgono per ogni persona del team e per qualsiasi Claude (Cowork o Claude Code) che lavora qui.
Leggile all'inizio di ogni sessione, prima di modificare qualsiasi file.
Decisione di riferimento: **D-020** in `DECISIONS.md`.

**Obiettivo:** si deve sempre capire **chi ha scritto cosa**, e nessuno deve sovrascrivere per sbaglio il lavoro di un altro.

---

## Membri

Ogni persona ha un **nome breve**: minuscolo, senza spazi né accenti. Lo stesso nome si usa per i branch, per la cartella personale e per firmare le voci nei file condivisi.

| Nome breve | `git config user.name` | Ruolo |
|---|---|---|
| `david` | David | Responsabile dev |
| `davide` | Davide | Team dev |

**Quando entra qualcuno nuovo:** aggiungi una riga qui e crea `team/<nome>/README.md` (copiando quello di un altro).

---

## 1. Identità git

Su ogni PC, una volta sola, nella cartella del repo:

```
git config user.name "Davide"
git config user.email "email@esempio.it"
```

- Il nome deve essere quello della colonna `git config user.name` della tabella: così ogni commit dice chi l'ha fatto.
- Non si committa mai con l'identità di un'altra persona.

## 2. Cartella personale: `team/<nome>/`

Contiene il lavoro "di appoggio" di quella persona e del suo Claude: note, analisi, log di sessione, bozze, esperimenti.

- Ognuno scrive **solo** nella propria cartella. Quelle degli altri si leggono, non si modificano.
- È l'unica cosa che si può committare **direttamente su `main`** (nessuno la tocca, quindi niente conflitti).
- Quando una bozza diventa definitiva, si sposta nei file condivisi (vedi punto 3).

## 3. File condivisi: branch + pull request

Tutto il resto del repo è condiviso (`README.md`, `TASKS.md`, `DECISIONS.md`, `IMPLEMENTED.md`, `ROADMAP.md`, `specs/`, `custom_mods/`, `configs/`, `client_pack/`, `docs_for_players/`, `comms/`…).

Per modificarlo, con GitHub Desktop:

1. **Fetch origin** → **Pull origin** su `main`.
2. **Current branch → New branch**, nome `<nome>/<argomento>` (es. `davide/gamemode-base`).
3. Lavora, poi **Commit to `<nome>/<argomento>`** → **Publish branch**.
4. **Create Pull Request**: si apre GitHub, descrivi cosa cambia.
5. La PR viene unita (merge) su GitHub. Le PR degli altri le approva il responsabile dev.
6. Torna su `main` → **Pull origin**.

Regole: non si committa sui branch con il prefisso di un'altra persona; non si committa su `main` fuori dalla propria cartella `team/<nome>/`.

## 4. Firma nei file condivisi

- **`IMPLEMENTED.md`**: ogni nuova voce finisce con `— <nome>` (es. `` `[test]` Server locale avviato — davide ``).
- **`DECISIONS.md`**: ogni nuova decisione ha la riga `**Autore:** <nome>`.
- **`TASKS.md`**: si usa già la colonna "Chi".
- **Mod in `custom_mods/`**: il campo *Autore/i* del `MANIFEST.md` dice di chi è la mod. Per cambiare la mod di un altro, avvisalo prima.
- Le voci già esistenti non si toccano: sono tutte di `david`.

---

## Istruzioni per Claude

1. **Chi è l'utente:** leggi `git config user.name` e trovalo nella tabella Membri. Se non è configurato o non è in tabella, **chiedi all'utente chi è** prima di scrivere qualsiasi cosa.
2. **Contesto:** leggi poi `README.md`, `IMPLEMENTED.md`, `DECISIONS.md` (come già indicato nel README).
3. **Dove scrivere:** note, analisi, log di sessione e bozze vanno in `team/<nome>/`. Non toccare mai `team/<altri>/`.
4. **Prima di modificare un file condiviso:** controlla il branch attuale (`git branch --show-current`). Se sei su `main`, proponi all'utente di creare il branch `<nome>/<argomento>` prima di procedere.
5. **Lavoro recente di altri:** se il file condiviso che stai per modificare è stato cambiato da un'altra persona negli ultimi commit (`git log -3 --format='%an %ar' -- <file>`), segnalalo all'utente prima di procedere.
6. **Firma** ogni nuova voce nei file condivisi come al punto 4.
7. **Repo condiviso:** niente informazioni personali sui membri del team nei file del repo.
8. **Semplicità:** niente nuove regole, cartelle o convenzioni senza l'ok del responsabile dev.
