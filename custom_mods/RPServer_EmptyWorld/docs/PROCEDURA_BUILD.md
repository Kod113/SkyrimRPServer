# PROCEDURA DI BUILD — `RPServer_EmptyWorld.esp`

> Guida operativa per il dev su Windows. Spiega come generare il plugin `.esp` deployabile a partire dai sorgenti in `source/`.
>
> **Macchina target:** fisso Windows con SSEEdit installato e i 5 master vanilla di Skyrim SE.
>
> **Tempo stimato:** ~10 minuti la prima volta, ~2 minuti per le iterazioni successive.
>
> **Scope v0.5.0:** la procedura copre solo la generazione degli ACHR disabilitati. Niente DisableQuests, niente Creation Kit, niente Papyrus.

---

## Prerequisiti

Prima di partire verifica che:

1. `SSEEdit.exe` (xEdit per SSE) sia installato (può essere lanciato via MO2 o direttamente).
2. I 5 master vanilla siano presenti nell'installazione di Skyrim SE:
   - `Skyrim.esm`
   - `Update.esm`
   - `Dawnguard.esm`
   - `HearthFires.esm`
   - `Dragonborn.esm`

Se usi MO2: attiva il profilo `RPServer-Dev` (carica solo i 5 master vanilla — vedi nota sotto). Se non usi MO2: apri SSEEdit direttamente e seleziona a mano solo i 5 master al dialog di avvio.

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

### 1.3 Copia lo script Pascal nella cartella `Edit Scripts`

Naviga in (dipende dall'installazione, tipicamente):

```
<cartella SSEEdit>/Edit Scripts/
```

Copia in questa cartella il file:

- `custom_mods/RPServer_EmptyWorld/source/RPServer_EmptyWorld_DisableNPCs.pas`

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

### 1.5 Salva il plugin

`File > Save`. Conferma il salvataggio di `RPServer_EmptyWorld.esp`. Esci da SSEEdit.

---

## Fase 2 — Verifica del plugin

### 2.1 Riapri in SSEEdit (spot-check statico)

Riavvia SSEEdit, carica solo i master vanilla + `RPServer_EmptyWorld.esp`. Verifica:

- Sotto le sezioni `Cell` di ciascun master, spot-check su qualche `ACHR` umanoide/drago/mob dungeon → flag `Initially Disabled` deve essere ✓.
- Spot-check su qualche `ACHR` animale (lupo, orso, cavallo) → flag **non** presente.
- `RPServer_EmptyWorld.esp` ha come master **solo** i 5 .esm vanilla.

### 2.2 Test singleplayer

Avvia Skyrim (con o senza SKSE, a seconda dello stack disponibile). Usa un alternate start (Skyrim Unbound o simile) per saltare l'intro di Helgen, oppure skippa la cutscene via console.

- Whiterun: piazza deserta, solo animali.
- Riverwood: villaggio deserto, galline e cane presenti.
- Foresta: lupi/orsi presenti.
- Bleak Falls Barrow: nessun draugr, dungeon vuoto.

### 2.3 Commit del plugin

Una volta verificato, copia `RPServer_EmptyWorld.esp` dalla cartella `Data/` di Skyrim in:

```
custom_mods/RPServer_EmptyWorld/RPServer_EmptyWorld.esp
```

Aggiorna `MANIFEST.md` (sezione `Test eseguiti` + `Changelog tecnico`) e committa:

```
[mod] RPServer_EmptyWorld vX.Y.Z — primo .esp generato
```

---

## Troubleshooting

| Sintomo | Causa probabile | Fix |
|---|---|---|
| Lo script Pascal si ferma con "plugin non trovato" | Hai dimenticato di creare `RPServer_EmptyWorld.esp` prima di lanciare lo script | Crea il plugin (Fase 1.2) e rilancia |
| `Load order FileID [00] can not be mapped to file FileID` | Plugin di destinazione creato senza master vanilla | Lo script aggiunge i master da solo: assicurati che il `.pas` in `Edit Scripts` sia la versione corrente da `source/` |
| In gioco vedo ancora NPC in Whiterun | Mod che ripopolano cellule attive (es. Populated Cities) | Disattivale e ritesta. Vedi `MANIFEST.md` sezione "Mod incompatibili note" |
| `Falliti > 0` nel log finale | Record non copiabili (raro) | Annota i FormID in `IMPLEMENTED.md` e segnala |
