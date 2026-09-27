# comms/ — Messaggi del team (WhatsApp + Discord)

Automatizza due cose:
1. **Il messaggio della settimana** (task + prossima riunione), pubblicato quando si decidono le task.
2. **Il promemoria della riunione**, il giorno prima.

## File

| File | Cosa contiene |
|---|---|
| `messaggio_settimana.md` | Testo esatto del messaggio della settimana (max 2000 caratteri) |
| `prossima_riunione.json` | Data (`AAAA-MM-GG`), ora (`HH:MM`), luogo e note della prossima riunione |
| `invia_discord.py` | Script che pubblica su Discord (usato dalle GitHub Actions) |

## Come funziona

**Discord (automatico)**
- Quando `messaggio_settimana.md` viene modificato e pushato su `main`, la Action `Discord - messaggio della settimana` lo pubblica sul canale.
- Ogni giorno alle 17:00 UTC (19:00 ora legale / 18:00 ora solare in Italia) la Action `Discord - promemoria riunione` legge `prossima_riunione.json`. Se la riunione è il giorno dopo, manda il promemoria.
- Tutte e due si possono lanciare anche a mano: GitHub → Actions → scegli la Action → *Run workflow*.

**WhatsApp (semi-automatico)**
- WhatsApp non permette di scrivere nei gruppi in modo automatico senza violare i termini d'uso. Per questo il messaggio si manda con **un clic**: un link `https://wa.me/?text=…` apre WhatsApp con il testo già scritto, si sceglie il gruppo e si invia.
- Il link viene generato insieme al messaggio della settimana.

## Formato del messaggio della settimana

- Prima riga: `📋 **SkyrimRP — Task della settimana: lunedì GG/MM → venerdì GG/MM**`
- Riga della prossima riunione con giorno, data e ora
- Una riga per task, con **icone tematiche** (🛠️ tecnico, 🔎 ricognizione/ricerca, 📝 documentazione, 🎭 RP/lore, ⚔️ gameplay…), **niente pallini colorati**
- In chiusura: avvertenze importanti (⚠️) e link a piano/template (📂)
- Solo le task del team: quelle personali del coordinatore restano in `TASKS.md`

## Setup iniziale (una volta sola)

1. **Creare il webhook su Discord:** Impostazioni server → Integrazioni → Webhook → *Nuovo webhook* → scegli il canale (es. `#team-dev`) → *Copia URL webhook*.
2. **Salvarlo come secret su GitHub:** repo → Settings → Secrets and variables → Actions → *New repository secret* → nome `DISCORD_WEBHOOK_URL`, valore = l'URL copiato.
   ⚠️ **L'URL del webhook non va mai scritto nel repo, che è pubblico:** chiunque lo abbia può scrivere nel canale.
3. **Prova:** GitHub → Actions → *Discord - messaggio della settimana* → *Run workflow*.

## Ogni settimana

1. Si decidono le task (riunione del venerdì).
2. Si aggiornano `TASKS.md`, `messaggio_settimana.md` e `prossima_riunione.json`.
3. Commit + push → Discord riceve il messaggio. Per WhatsApp si usa il link `wa.me`.
4. Il giorno prima della riunione arriva il promemoria su Discord.
