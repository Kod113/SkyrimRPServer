# Studio piattaforma: STR vs SkyMP

```
Tipo:     Studio / decisione
Status:   In corso
Aperto:   2026-09-27
Chiude:   con la decisione D-019 (piattaforma) in DECISIONS.md
```

## Perché questo studio

Fino a settembre 2026 il progetto era costruito su **Skyrim Together Reborn (STR)**. La ricerca del 2026-09-27 ha messo in luce due cose:

- **STR è pensato per il co-op tra pochi giocatori.** La FAQ ufficiale consiglia 2-8 giocatori, non c'è logica lato server e *"mods only sync by accident"*. Non ci sono prove pubbliche di un uso stabile oltre gli 8 giocatori.
- **I server RP con premesse uguali alle nostre usano SkyMP.** Keizaal Online (nessun NPC umano, economia tra giocatori, record di ~650 giocatori contemporanei) e Mereth Roleplay girano tutti su **SkyMP**: server autoritativo, gamemode in Node.js/TypeScript, persistenza.

**Regola:** finché questo studio non si chiude con D-019, non si costruiscono nuove mod legate alla piattaforma.

## Domande a cui rispondere

### A. SkyMP dal punto di vista tecnico → `skymp_spike.md` (prova pratica)
1. Riusciamo ad avviare un server SkyMP e a collegarci con un client?
2. Quale versione di Skyrim SE e SKSE richiede? È compatibile con la nostra 1.6.1170 (D-009)?
3. Carica i nostri `.esp`, per esempio `RPServer_EmptyWorld`? Gli NPC disabilitati restano disabilitati?
4. Com'è fatto un gamemode? Quanto è difficile scrivere una regola semplice (es. "al login ricevi 10 monete")?
5. Dove e come salva i dati (file, MongoDB)?
6. Le mod client (SkyUI, RaceMenu…) funzionano?
7. Quanto è viva la community? Documentazione, Discord, frequenza delle release.

### B. Come lo usano i concorrenti → `ricognizione_<server>.md` (da giocatori)
1. Installazione: quanti passi, quanto tempo, quali problemi.
2. Cosa hanno cambiato rispetto a Skyrim: NPC, economia, morte, magia, UI, chat.
3. Quanto è stabile: lag, desync, crash, giocatori visti.
4. Regole e onboarding: whitelist, creazione del personaggio, primo giorno.
5. Cosa ci piace, cosa non ci piace, cosa potremmo fare meglio o in modo diverso.

### C. Posizionamento
- Che cosa offriremmo che Keizaal e Mereth non offrono? *(ipotesi di partenza: community italiana — oggi non ne esiste nessuna)*

## Documenti di questa cartella

| File | Contenuto | Chi |
|---|---|---|
| `PIANO_AZIONE.md` | Piano giorno per giorno della settimana di test + criteri di decisione | — |
| `SESSIONE_01_SKYMP.md` | Guida operativa della prima sessione (lunedì 28/09): configurazioni pronte, passi, cosa annotare | David + Davide |
| `skymp_spike.md` | Resoconto della prova pratica di SkyMP (domande A) | dev |
| `skymp_funzionalita.md` | Cosa offre già SkyMP e confronto con la nostra modlist e la ROADMAP | dev |
| `_template_ricognizione.md` | Template da copiare per ogni server visitato | — |
| `ricognizione_keizaal.md` | Ricognizione di Keizaal Online (domande B) | chi la fa |
| `ricognizione_mereth.md` | Ricognizione di Mereth Roleplay (domande B) | chi la fa |

## Avvertenze

- **Non fare la ricognizione sul PC di sviluppo.** I launcher dei concorrenti installano la loro modlist e usano Vortex: possono modificare la versione di Skyrim fissata in D-009. Serve un PC diverso o un'installazione di Skyrim separata.
- **"Keizaal" di Tate Taylor** è una modlist *single-player* che non ha niente a che fare con il server. Il sito giusto è **keizaal.com**.
- **Servono Skyrim SE su Steam e un account Discord.** I server sono gratuiti.

## Fonti

- SkyMP: https://github.com/skyrim-multiplayer/skymp · documentazione: https://pospelovlm.gitbook.io/skyrim-multiplayer-docs
- Keizaal Online: https://keizaal.com/en/play
- Mereth Roleplay: https://www.merethroleplay.com/start/
- Lista server: https://www.skyrimlist.com/
- FAQ STR: https://wiki.tiltedphoques.com/tilted-online/general-information/faq
