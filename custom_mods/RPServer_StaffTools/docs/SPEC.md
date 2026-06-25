# SPEC — RPServer_StaffTools: Setup ESP in Creation Kit

## Premessa

Il file `RPServer_StaffTools_MCM.psc` è il codice Papyrus della mod. Per renderlo funzionante servono due passaggi in Creation Kit:
1. Compilare lo script `.psc` → `.pex`
2. Creare un ESP con la Quest che lo ospita

---

## 1. Compilazione script

In Creation Kit, menu **Gameplay > Papyrus Script Manager**:
- Individua `RPServer_StaffTools_MCM` nella lista (o importalo da `custom_mods/RPServer_StaffTools/source/`)
- Compila → viene generato `Data/Scripts/RPServer_StaffTools_MCM.pex`

In alternativa, da riga di comando con il compilatore SKSE:
```
PapyrusCompiler.exe "custom_mods\RPServer_StaffTools\source\RPServer_StaffTools_MCM.psc" \
  -f="TESV_Papyrus_Flags.flg" \
  -i="Data\Scripts\Source;custom_mods\RPServer_StaffTools\source" \
  -o="Data\Scripts"
```

---

## 2. Creazione ESP in Creation Kit

### 2a. Nuovo plugin
- File > Data > crea nuovo plugin: `RPServer_StaffTools.esp`
- Master obbligatorio: `Skyrim.esm`
- **Non** deve essere ESM né ESL (per ora)

### 2b. Crea la Quest MCM

Nella sezione **Quest**:

| Campo | Valore |
|---|---|
| Editor ID | `RPServer_StaffTools_MCM_Quest` |
| Priority | 60 |
| Quest Type | Miscellaneous |
| Start Game Enabled | ✅ |
| Run Once | ❌ |
| Allow repeated stages | ❌ |

**Tab Scripts:**
- Aggiungi script: `RPServer_StaffTools_MCM`
- Properties da impostare (valori default già definiti nello script, nessuna property manuale richiesta)

**Tab Stages:**
- Stage 0 → nessuna azione (la quest resta sempre attiva)

### 2c. Registrazione SkyUI MCM

SkyUI rileva automaticamente gli script che estendono `SKI_ConfigBase` attraverso il sistema `SKI_ConfigManager`. Non serve nessuna registrazione manuale: basta che la Quest sia `Start Game Enabled` e che lo script sia allegato.

Il nome del menu in SkyUI è quello impostato dalla property `ModName` nello script (`"RPServer Staff Tools"`).

---

## 3. Test rapido in-game

1. Lancia il gioco con la mod attiva (Staff modlist)
2. Apri il menu di sistema → Mod Configuration
3. Cerca **"RPServer Staff Tools"** nell'elenco MCM
4. Verifica che le 5 pagine siano presenti
5. Test No Clip: attiva toggle → il player deve attraversare i muri
6. Test Spawn: seleziona `Iron Sword` → apri inventario, verifica presenza
7. Test /me: scrivi un testo → invia → verifica notifica in alto a sinistra

---

## 4. Note STR

| Feature | Comportamento in STR |
|---|---|
| No Clip (`tcl`) | Client-side — solo il tuo player. Gli altri non vedono il tuo attraversamento muri. |
| MoveTo (teletrasporto) | Client-side — funziona, sincronizzato dal tuo lato. |
| `placeatme` (creature) | La creatura viene spawned sul tuo client. **Da verificare** se gli altri player la vedono. |
| `player.additem` | Client-side — solo il tuo inventario. |
| `Disable` su ref | **Attenzione:** disabilita la ref sul tuo client. Gli altri player potrebbero vederla ancora. Testare. |
| `Debug.Notification` | Client-side — `/me`, `/do`, `/status` visibili solo a te per ora. |

---

## 5. Roadmap Tier 3 (prossime versioni)

### Teletrasporto bidirezionale
Richiede che STR esponga un modo per inviare un comando `MoveTo` al client di un altro player.
Da esplorare: STR server-side console command, o mod custom `RPServer_Sync` con hook.

### Inventario / statistiche player remoti
In STR, gli `Actor` degli altri player sono accessibili come `akOtherPlayer`.
`akOtherPlayer.GetItemCount(kItem)` potrebbe funzionare se STR sincronizza l'inventario.
Da testare in sessione con due client.

### Broadcast audio / eventi globali
STR non espone hook audio globali. Opzioni:
- Usare un sistema di trigger su oggetti condivisi nel mondo (chest, marker)
- Implementare via mod custom `RPServer_Events` con script che reagisce a trigger sincronizzati
