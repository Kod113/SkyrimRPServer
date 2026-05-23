# PROCEDURA DI BUILD — `RPServer_EmptyWorld.esp`

> Guida operativa per il dev su Windows. Spiega come generare il plugin `.esp` deployabile a partire dai sorgenti in `source/`.
>
> **Macchina target:** fisso Windows con stack `STEP_0.md` Priorità 4 installato (Skyrim SE, MO2, SKSE64, Creation Kit, SSEEdit, VS Code).
>
> **Tempo stimato:** ~30 minuti la prima volta, ~5 minuti per le iterazioni successive.

---

## Prerequisiti

Prima di partire verifica che:

1. Mod Organizer 2 ha il profilo `RPServer-Dev` attivo (clonato dal Default, vergine — non il profilo `Admin` che usi per testare lo stack runtime). Vedi nota "Perché un profilo dedicato" più sotto.
2. Nel profilo sono attivi (e solo loro, per ora) i master vanilla:
   - `Skyrim.esm`
   - `Update.esm`
   - `Dawnguard.esm`
   - `HearthFires.esm`
   - `Dragonborn.esm`
3. `SSEEdit.exe` (xEdit per SSE) è installato e lanciato via MO2
4. Creation Kit è installato e lanciato via MO2

### Perché un profilo dedicato `RPServer-Dev` e non `Admin`

L'.esp si costruisce sul **minimo dei master**, non sull'intero stack di runtime. Tre motivi, in ordine di gravità:

1. **Master incisi nell'header.** Quando overridi un record in SSEEdit, il plugin di destinazione eredita come master tutto ciò da cui quel record era già overridato nel load order corrente. Se buildi su Admin con USSEP attivo, il nostro `.esp` si porta dietro `Unofficial Skyrim Special Edition Patch.esp` come master — e il `MANIFEST.md` promette invece solo i 5 .esm vanilla. La mod si rompe ovunque non sia presente l'esatto stack di Admin.
2. **Override incapsulati.** Anche tralasciando l'header, il record salvato parte dalla versione "winning" al momento del salvataggio. Costruire sopra USSEP significa incapsulare le correzioni USSEP dentro il nostro plugin, sovrascrivendo qualsiasi mod che voglia toccare quei record dopo. Noi vogliamo l'opposto: EmptyWorld deve essere il livello più semplice possibile sopra il vanilla puro.
3. **Rumore in test.** Test A/B vanno fatti su "vanilla + EmptyWorld, niente altro". Se qualcosa va storto su Admin con 10 plugin attivi non sai dove guardare. Sul profilo pulito la responsabilità è al 100% del nostro `.esp`.

Regola operativa: si costruisce su minimo dei master nel profilo `RPServer-Dev`, si integra in Admin dopo che A e B sono passati.

### Nota sui Creation Club .esl di Anniversary Edition

Su Skyrim AE, i CC distribuiti col gioco (`ccBGSSSE037-Curios.esl`, `ccBGSSSE001-Fish.esl`, `ccBGSSSE025-AdvDSGS.esl`, `ccQDRSSE001-SurvivalMode.esl`, `_ResourcePack.esl`) sono trattati dal motore come contenuto di base e MO2 **non li lascia disattivare a livello di profilo**. Non è un problema:

- MO2 controlla cosa viene caricato dal **gioco**.
- SSEEdit, a ogni apertura, mostra un proprio dialog di selezione master dove le spunte sono **libere**.

In Fase 1.1, al dialog di SSEEdit deselezioni manualmente tutto tranne i 5 .esm vanilla. SSEEdit ignora i CC, lo script Pascal itera solo sui record vanilla, l'.esp finale dichiara come master solo i 5 .esm.

**Conseguenza in Test B:** alcuni NPC del CC (es. pescatori di `ccBGSSSE001-Fish`, NPC della quest di `ccBGSSSE025-AdvDSGS`) **non verranno disabilitati** da `v0.3.0` perché i loro ACHR vivono nelle .esl del CC, non nei master vanilla. Se ne vedi in giro non è un bug del nostro plugin. Lo annotiamo e, se diventa fastidioso, faremo un bump `v0.4.0` che estende la disabilitazione al CC AE.

---

## Fase 1 — Generare il plugin con gli ACHR disabilitati

### 1.1 Avvia SSEEdit

Da MO2 → lancia `SSEEdit`. Nella finestra di selezione master, **seleziona solo** i 5 master vanilla elencati sopra e clicca OK. Attendi che termini il "Background Loader" (in basso compare "Background Loader: finished").

### 1.2 Crea il plugin di destinazione

Nel left panel, click destro su un punto vuoto → **`Other > Add new file`**. Inserisci esattamente:

```
RPServer_EmptyWorld.esp
```

Conferma. Il plugin compare nella lista, **vuoto e senza master** — è il comportamento normale di xEdit, `Add new file` non aggiunge dipendenze. Va bene così: gli script Pascal (`v0.3.1`+) aggiungono da soli i 5 master vanilla all'avvio, prima di copiare qualsiasi record.

> ⚠️ **Naming esatto.** Lo script Pascal cerca il plugin per nome esatto (il confronto è case-insensitive, ma niente spazi, underscore mancanti o varianti). Deve essere precisamente `RPServer_EmptyWorld.esp`.

### 1.3 Copia gli script Pascal nella cartella `Edit Scripts`

Naviga in (dipende dall'installazione, tipicamente):

```
<cartella SSEEdit>/Edit Scripts/
```

Copia in questa cartella i due file:

- `custom_mods/RPServer_EmptyWorld/source/RPServer_EmptyWorld_DisableNPCs.pas`
- `custom_mods/RPServer_EmptyWorld/source/RPServer_EmptyWorld_DisableQuests.pas`

### 1.4 Esegui `DisableNPCs.pas`

Nel left panel di SSEEdit, **seleziona contemporaneamente** i 5 master vanilla (Shift+click). Click destro → `Apply Script`. Dalla dropdown scegli `RPServer_EmptyWorld_DisableNPCs`. Clicca OK.

Il pannello `Messages` mostrerà l'avanzamento. A fine esecuzione devi vedere un blocco simile a:

```
=== RPServer_EmptyWorld DisableNPCs: FINE ===
Disabilitati nuovi     : ~6500-7500
Gia' disabilitati      : 0
Ignorati (non umanoidi): ~2500-3500
Falliti                : 0
Da master non vanilla  : 0
=> Salva ora RPServer_EmptyWorld.esp (File > Save).
```

I numeri esatti variano leggermente in base a quali DLC sono in modlist. Se vedi `Falliti > 0` apri il log e annota i record problematici in `IMPLEMENTED.md`.

### 1.5 Esegui `DisableQuests.pas`

Stessa procedura: seleziona i 5 master, click destro → `Apply Script` → `RPServer_EmptyWorld_DisableQuests`.

A fine esecuzione vedrai qualcosa come:

```
=== RPServer_EmptyWorld DisableQuests: FINE ===
Quest disabilitate     : ~25-35
Gia' Start Game off    : ~150-170
Falliti                : 0
```

> ℹ️ **Perché "Quest disabilitate" è basso.** In Skyrim la maggior parte delle quest narrative **non** ha il flag *Start Game Enabled*: vengono avviate da Story Manager, dialoghi o trigger, non all'avvio del gioco. Lo script può togliere il flag solo a chi ce l'ha — tipicamente ~25-35 quest "controller" (intro Helgen, incontri casuali, attacchi draghi, carrettieri). Le restanti (~150-170) finiscono in "Gia' Start Game off" perché non c'era nulla da togliere. Sono comunque coperte dalla rimozione degli NPC (niente quest giver) e dalla quest Papyrus di fallback. La somma `disabilitate + già off` (~180) è il numero di quest della lista effettivamente presenti come record QUST.

Se compaiono righe `FAIL no DNAM\Flags on quest:` per certe quest, significa che l'EditorID nella lista non esiste in quel master (può succedere con varianti del DLC). Annota e ignora.

### 1.6 Salva il plugin

`File > Save`. Conferma il salvataggio di `RPServer_EmptyWorld.esp`. Esci da SSEEdit.

---

## Fase 2 — Aggiungere la quest Papyrus di fallback

Questa fase richiede **Creation Kit**, perché il plugin va aperto in CK per creare la quest, l'alias e il FormList, e per compilare i `.psc`.

### 2.1 Apri il plugin in Creation Kit

Lancia Creation Kit da MO2. `File > Data...`, seleziona `RPServer_EmptyWorld.esp`, imposta come **Active File** (checkbox in alto), clicca OK. Attendi il caricamento.

> ⚠️ La prima volta il CK protesta con qualche centinaio di warning sui master vanilla — è normale. Ignorali (`Yes to All`).

### 2.2 Crea la FormList `RPServer_QuestsToStop` — in SSEEdit

> ⚠️ **Aggiornamento procedura.** La FormList **non** si crea più a mano in CK (erano ~180 quest da trascinare una per una, lungo e soggetto a errori). Si fa in **SSEEdit**, **prima** di aprire il Creation Kit, sfruttando il fatto che i ~180 QUST sono già tutti nel plugin (ce li ha messi `DisableQuests.pas`).

Procedura operativa:

1. Lo script `RPServer_EmptyWorld_PopulateQuestList.pas` crea il record FLST vuoto `RPServer_QuestsToStop`. Copialo in `Edit Scripts`, seleziona `RPServer_EmptyWorld.esp` → `Apply Script` → eseguilo.
   - ⚠️ **Limite noto v1:** lo script crea il FLST ma non riesce ancora a popolarlo (problema API xEdit sul container `FormIDs` — vedi task di fix). La creazione del record però funziona.
2. Popola il FLST con drag-and-drop: nel left panel espandi `RPServer_EmptyWorld.esp`, apri la categoria `Quest`, seleziona tutte le ~183 quest (click sulla prima, Shift+click sull'ultima), e **trascina la selezione** sul record `RPServer_QuestsToStop` (categoria `Form List`). Conferma.
3. Espandi `RPServer_QuestsToStop` e verifica che `FormIDs` contenga ~183 voci.
4. `File > Save`.

Quando lo script `PopulateQuestList.pas` sarà corretto, i passi 1-2 collasseranno in un solo Apply Script.

### 2.3 Crea la Global Variable `RPServer_EWInit_Done`

`Miscellaneous > Global > New`:
- **ID:** `RPServer_EWInit_Done`
- **Type:** Float
- **Value:** `0.0`

### 2.4 Copia i sorgenti Papyrus

Copia i due `.psc` da `source/` nella cartella sorgenti di Skyrim:

```
<cartella Skyrim SE>/Data/Source/Scripts/
```

(Se la cartella non esiste, creala. Su alcune installazioni è `Data/Scripts/Source/`.)

### 2.5 Crea la quest `RPServer_EmptyWorldInit`

In CK `Object Window > Character > Quest`. Click destro → `New`:

- **ID:** `RPServer_EmptyWorldInit`
- **Quest Name:** lascia vuoto (è una quest invisibile)
- **Priority:** `60`
- **Flags:** spunta `Start Game Enabled`. **Lascia spunta** anche `Run Once`.
- **Quest Type:** `None`

### 2.6 Collega lo script Papyrus alla quest

Nella scheda della quest, tab `Scripts` → `Add` → `[New Script]`:
- **Name:** `RPServer_EmptyWorldInit`
- **Extends:** `Quest`

Una volta aggiunto, click destro sullo script appena listato → `Properties` → assegna:
- `QuestsToStop` = FormList `RPServer_QuestsToStop`
- `RPServer_EWInit_Done` = Global `RPServer_EWInit_Done`
- `VerboseLogging` = `True`

Conferma. CK compilerà il `.psc` (richiede pochi secondi). Se compaiono errori, controlla che il file `.psc` sia presente nella cartella sorgenti.

### 2.7 Aggiungi il ReferenceAlias sul Player

Stessa quest, tab `Quest Aliases` → `New Reference Alias`:
- **Alias Name:** `PlayerAlias`
- **Fill Type:** `Specific Reference`
  - Cell: `(any)` → Riferimento al PlayerRef (FormID `00000014`)
- **Optional:** spunta `Quest Object: No`, lascia tutto default

Sotto, sezione `Scripts` → `Add` → `[New Script]`:
- **Name:** `RPServer_EmptyWorldPlayerAlias`
- **Extends:** `ReferenceAlias`

Conferma. Anche questo viene compilato.

### 2.8 Salva il plugin

`File > Save`. Esci da CK.

---

## Fase 3 — Verifica del plugin

### 3.1 Riapri in SSEEdit (verifica)

Riavvia SSEEdit, carica solo i master vanilla + `RPServer_EmptyWorld.esp`. Naviga:

- `RPServer_EmptyWorld.esp > Quest > RPServer_EmptyWorldInit` → verifica che ci sia, abbia Start Game Enabled, abbia lo script `RPServer_EmptyWorldInit` con le properties popolate, e abbia l'alias `PlayerAlias` con lo script `RPServer_EmptyWorldPlayerAlias`.
- `RPServer_EmptyWorld.esp > FormID List > RPServer_QuestsToStop` → verifica che contenga ~150-200 puntatori a quest vanilla.
- Sotto le sezioni `Cell` di ciascun master, spot-check su qualche `ACHR` → flag `Initially Disabled` deve essere ✓.

### 3.2 Test singleplayer

Da MO2 → lancia Skyrim via SKSE. Nuova partita.

- **Atteso:** appena finito il caricamento del nuovo personaggio (qualunque modalità di avvio: vanilla intro, alternate start, o spawn diretto via console se hai Skyrim Unbound), guardati attorno. Whiterun dovrebbe essere deserto. Riverwood dovrebbe essere deserto. Le strade nei pressi delle città vuote di guardie e mercanti vagabondi. Cavalli alle stalle: presenti. Galline e mucche nelle fattorie: presenti. Lupi nel bosco: presenti.
- **Verifica Papyrus log** (`Documents/My Games/Skyrim Special Edition/Logs/Script/Papyrus.0.log`): cerca `[RPServer_EmptyWorld]`. Devi vedere `OnInit chiamato` e `StopVanillaQuests fine: N fermate, …`.
- **Verifica console:** apri console (`~`), digita `sqv RPServer_EmptyWorldInit`. La quest deve risultare Running.

### 3.3 Commit del plugin

Una volta verificato, copia `RPServer_EmptyWorld.esp` (sta nella cartella `Data/` di Skyrim) in:

```
custom_mods/RPServer_EmptyWorld/RPServer_EmptyWorld.esp
```

Copia anche i `.pex` compilati (di solito in `Data/Scripts/`) in:

```
custom_mods/RPServer_EmptyWorld/scripts/
```

Aggiorna `MANIFEST.md` (sezione `Test eseguiti` + `Changelog tecnico`).

Commit su Git con messaggio:

```
[mod] RPServer_EmptyWorld vX.Y.Z — primo .esp generato
```

Tagga su GitHub `RPServer_EmptyWorld-vX.Y.Z` con la versione attuale del `MANIFEST.md` (es. `v0.3.0` per il primo build con whitelist mob-dungeon-off, o `v1.0.0` quando i tre blocchi di test sono tutti ✅).

---

## Troubleshooting

| Sintomo | Causa probabile | Fix |
|---|---|---|
| Lo script Pascal si ferma con "plugin non trovato" | Hai dimenticato di creare `RPServer_EmptyWorld.esp` in SSEEdit prima di lanciare lo script | Crea il plugin (Fase 1.2) e rilancia |
| Lo script si ferma subito con `Load order FileID [00] can not be mapped to file FileID` | Il plugin di destinazione è stato creato vuoto e senza master vanilla | Gli script `v0.3.1`+ aggiungono i master da soli: assicurati che la versione dei `.pas` nella cartella `Edit Scripts` sia quella aggiornata da `source/`. In alternativa, click destro sul plugin → `Add Masters…` → spunta i 5 .esm vanilla, poi rilancia |
| CK rifiuta di salvare con errori sui master | Master mancanti in modlist o ordine errato | Verifica che tutti e 5 i master vanilla siano attivi e nel giusto ordine |
| Papyrus log mostra `QuestsToStop FormList non assegnato` | Property non collegata in CK | Fase 2.6: assegna a mano la property |
| In gioco vedo ancora NPC in Whiterun | Mod che ripopolano cellule attive (es. Populated Cities) | Disattivale e ritesta. Vedi `MANIFEST.md` sezione "Mod incompatibili note" |
| `OnPlayerLoadGame` non scatta | L'alias non punta al PlayerRef o non è marcato `Specific Reference 00000014` | Ricontrolla Fase 2.7 |

---

## Prossime ottimizzazioni (post-build)

- Script Pascal aggiuntivo `PopulateQuestList.pas` che popola automaticamente il FormList al posto del lavoro manuale in CK.
- Whitelist NPC umanoidi configurabile via FormList esterna (per quando il team vorrà tenere attivo qualche NPC specifico, es. un mercante chiave).
- Sezione `Test STR multiplayer` da compilare nel `MANIFEST.md` con il primo test reale tra 2 dev.
