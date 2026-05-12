# PROCEDURA DI BUILD — `RPServer_EmptyWorld.esp`

> Guida operativa per il dev su Windows. Spiega come generare il plugin `.esp` deployabile a partire dai sorgenti in `source/`.
>
> **Macchina target:** fisso Windows con stack `STEP_0.md` Priorità 4 installato (Skyrim SE, MO2, SKSE64, Creation Kit, SSEEdit, VS Code).
>
> **Tempo stimato:** ~30 minuti la prima volta, ~5 minuti per le iterazioni successive.

---

## Prerequisiti

Prima di partire verifica che:

1. Mod Organizer 2 ha il profilo `RPServer-Dev` attivo
2. Nel profilo sono attivi (e solo loro, per ora) i master vanilla:
   - `Skyrim.esm`
   - `Update.esm`
   - `Dawnguard.esm`
   - `HearthFires.esm`
   - `Dragonborn.esm`
3. `SSEEdit.exe` (xEdit per SSE) è installato e lanciato via MO2
4. Creation Kit è installato e lanciato via MO2

---

## Fase 1 — Generare il plugin con gli ACHR disabilitati

### 1.1 Avvia SSEEdit

Da MO2 → lancia `SSEEdit`. Nella finestra di selezione master, **seleziona solo** i 5 master vanilla elencati sopra e clicca OK. Attendi che termini il "Background Loader" (in basso compare "Background Loader: finished").

### 1.2 Crea il plugin di destinazione

Nel left panel, click destro su un punto vuoto → **`Other > Add new file`**. Inserisci esattamente:

```
RPServer_EmptyWorld.esp
```

Conferma. Il plugin compare nella lista, vuoto, con i 5 master automaticamente aggiunti come dipendenze.

> ⚠️ **Naming case-sensitive.** Lo script Pascal cerca il plugin per nome esatto. Niente spazi, niente varianti.

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

A fine esecuzione devi vedere:

```
=== RPServer_EmptyWorld DisableQuests: FINE ===
Quest disabilitate     : ~150-200
Gia' Start Game off    : 0-10
Falliti                : 0
```

Se compaiono righe `FAIL no DNAM\Flags on quest:` per certe quest, significa che l'EditorID nella lista non esiste in quel master (può succedere con varianti del DLC). Annota e ignora.

### 1.6 Salva il plugin

`File > Save`. Conferma il salvataggio di `RPServer_EmptyWorld.esp`. Esci da SSEEdit.

---

## Fase 2 — Aggiungere la quest Papyrus di fallback

Questa fase richiede **Creation Kit**, perché il plugin va aperto in CK per creare la quest, l'alias e il FormList, e per compilare i `.psc`.

### 2.1 Apri il plugin in Creation Kit

Lancia Creation Kit da MO2. `File > Data...`, seleziona `RPServer_EmptyWorld.esp`, imposta come **Active File** (checkbox in alto), clicca OK. Attendi il caricamento.

> ⚠️ La prima volta il CK protesta con qualche centinaio di warning sui master vanilla — è normale. Ignorali (`Yes to All`).

### 2.2 Crea la FormList `RPServer_QuestsToStop`

Nel `Object Window`, naviga su `Miscellaneous > FormList`. Click destro nel pannello destro → `New`.

Compila:
- **ID:** `RPServer_QuestsToStop`
- **Form members:** trascina qui dentro **ogni** quest il cui EditorID compare in `source/RPServer_EmptyWorld_DisableQuests.pas` (puoi cercarle nel CK con `Ctrl+F` sull'Object Window dal pannello Quest).

> 💡 **Tip:** in alternativa, puoi popolare la FormList via Pascal post-build con uno script `PopulateQuestList.pas`. Per ora lo facciamo a mano per chiarezza didattica; lo script automatico è un miglioramento futuro.

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
| CK rifiuta di salvare con errori sui master | Master mancanti in modlist o ordine errato | Verifica che tutti e 5 i master vanilla siano attivi e nel giusto ordine |
| Papyrus log mostra `QuestsToStop FormList non assegnato` | Property non collegata in CK | Fase 2.6: assegna a mano la property |
| In gioco vedo ancora NPC in Whiterun | Mod che ripopolano cellule attive (es. Populated Cities) | Disattivale e ritesta. Vedi `MANIFEST.md` sezione "Mod incompatibili note" |
| `OnPlayerLoadGame` non scatta | L'alias non punta al PlayerRef o non è marcato `Specific Reference 00000014` | Ricontrolla Fase 2.7 |

---

## Prossime ottimizzazioni (post-build)

- Script Pascal aggiuntivo `PopulateQuestList.pas` che popola automaticamente il FormList al posto del lavoro manuale in CK.
- Whitelist NPC umanoidi configurabile via FormList esterna (per quando il team vorrà tenere attivo qualche NPC specifico, es. un mercante chiave).
- Sezione `Test STR multiplayer` da compilare nel `MANIFEST.md` con il primo test reale tra 2 dev.
