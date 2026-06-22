# CHECKLIST TEST — `RPServer_EmptyWorld` v0.5.0

> Procedura di verifica da eseguire dopo ogni build dell'`.esp`. Va riempita e committata insieme al plugin.
>
> Esiti: ✅ pass | ⚠️ pass con note | ❌ fail (vai a fix e rifai il giro).

---

## Test A — Verifica statica in SSEEdit

Pre-requisito: plugin generato, riapri SSEEdit con master vanilla + `RPServer_EmptyWorld.esp`.

| # | Check | Atteso | Esito |
|---|---|---|---|
| A1 | Master del plugin = solo i 5 master vanilla | nessun master di terze parti | ☐ |
| A2 | Conteggio `ACHR overrides` ragionevole (~8500-9000) | nel range | ☐ |
| A3 | Nessun override `QUST` nel plugin | 0 QUST | ☐ |
| A4 | Spot-check 10 ACHR umanoidi/draghi nei master vanilla → flag `Initially Disabled` ✓ | tutti flaggati | ☐ |
| A5 | Spot-check ACHR su DraugrRace (es. in Bleak Falls Barrow) → `Initially Disabled` ✓ | sì | ☐ |
| A6 | Spot-check ACHR su FalmerRace, DwarvenCenturionRace, DragonPriestRace → `Initially Disabled` ✓ | sì | ☐ |
| A7 | Spot-check ACHR su WolfRace, BearRace, SabreCatRace → `Initially Disabled` **NON** presente | nessun flag | ☐ |
| A8 | Spot-check ACHR su SprigganRace, HorkerRace, ChaurusRace (base) → `Initially Disabled` **NON** presente | nessun flag | ☐ |

Note libere:

```
(scrivere qui eventuali anomalie)
```

---

## Test B — Singleplayer rapido

Pre-requisito: Skyrim avviato con il profilo `RPServer-Dev` (solo master vanilla + `RPServer_EmptyWorld.esp`). Usa un alternate start (Skyrim Unbound o simile) per evitare l'intro vanilla.

| # | Check | Atteso | Esito |
|---|---|---|---|
| B1 | Spawn iniziale: nessun Alduin, nessun carro vanilla | sì (richiede alternate start) | ☐ |
| B2 | Whiterun (main square): nessun NPC umanoide visibile | piazza deserta | ☐ |
| B3 | Whiterun: cani randagi, polli, mucche visibili | sì | ☐ |
| B4 | Riverwood: nessun cittadino, nessuna guardia | villaggio deserto | ☐ |
| B5 | Riverwood: galline e cane visibili | sì | ☐ |
| B6 | Stalla di Whiterun: cavalli presenti, conducente del carro **assente** | cavalli sì, carrettiere no | ☐ |
| B7 | Bleak Falls Barrow: nessun draugr, dungeon vuoto di mob | dungeon shell vuoto | ☐ |
| B7b | Bleak Falls Barrow: loot, trappole e geometria comunque presenti | ambiente intatto | ☐ |
| B8 | Foresta vicino Riverwood: lupi/orsi presenti | sì | ☐ |
| B9 | Vagare 5 minuti in città-bosco-strada: nessuno spawn umanoide | nessuno | ☐ |
| B10 | Word Wall con drago piazzato (es. Bonestrewn Crest): drago **non** presente | nessun drago | ☐ |
| B11 | Dungeon con Dragon Priest (es. Forelhost): boss **non** presente | assente | ☐ |
| B12 | Dwemer ruin (es. Mzulft): nessun automa attivo | dungeon vuoto | ☐ |
| B13 | Blackreach: nessun falmer attivo | dungeon vuoto | ☐ |
| B14 | Dungeon vampiro (es. Movarth's Lair): nessun vampiro attivo | dungeon vuoto | ☐ |
| B15 | Evocare un Atronach (Conjuration spell): funziona normalmente | sì | ☐ |
| B16 | Foresta: spriggan presente | sì | ☐ |
| B17 | Coste / fiumi: horker e slaughterfish presenti | sì | ☐ |
| B18 | Grotta con chaurus base: chaurus base **presenti**, chaurus reaper **assente** | base sì, reaper no | ☐ |
| B19 | Solstheim: ash hopper **presenti**, ash spawn **assenti** | hopper sì, spawn no | ☐ |

Note libere:

```
(scrivere qui eventuali anomalie — soprattutto NPC visti dove non dovrebbero esserci)
```

---

## Test C — STR multiplayer (2 dev)

> ⏸️ **Rimandato.** Problemi di compatibilità con Together Reborn. Si riprende quando l'ambiente multiplayer è stabile.

| # | Check | Atteso | Esito |
|---|---|---|---|
| C1 | Entrambi i dev si connettono al server STR | sì | ☐ |
| C2 | Entrambi vedono lo stesso mondo vuoto a Whiterun | identica vista | ☐ |
| C3 | Dev A si muove a Riverwood: Dev B vede A muoversi, entrambi vedono Riverwood vuota | sì | ☐ |
| C4 | Entrambi vedono gli stessi animali (cavalli alle stalle, polli, mucche) | identica vista | ☐ |
| C5 | Combattimento con un lupo: entrambi i dev vedono lo stesso combattimento | coerenza visiva | ☐ |
| C6 | Disconnessione + riconnessione di Dev A: il mondo resta vuoto, niente NPC respawn | sì | ☐ |

Note libere:

```
(scrivere qui differenze tra i due client, desync, crash, …)
```

---

## Compilazione esito

| Test | Esito complessivo | Data | Eseguito da |
|---|---|---|---|
| A — Static | ☐ | — | — |
| B — Singleplayer | ☐ | — | — |
| C — STR 2 dev | ⏸️ rimandato | — | — |

Quando A e B sono ✅, aggiornare `MANIFEST.md` sezione `Test eseguiti` con la data e procedere al tag della release `RPServer_EmptyWorld-v1.0.0` su GitHub.
