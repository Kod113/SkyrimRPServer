# MANIFEST — RPServer_StaffTools

| Campo | Valore |
|---|---|
| **Nome mod** | RPServer_StaffTools |
| **Versione** | 1.0.0 |
| **Profilo** | Staff only |
| **Autore** | Team RPServer |
| **Tipo** | Mod custom server (ESP + script Papyrus) |
| **Stato** | 🛠️ In sviluppo — sorgenti pronti, ESP da generare |

## Dipendenze

| Mod | Motivo |
|---|---|
| SkyUI (≥ 5.2SE) | Framework MCM — `SKI_ConfigBase` |
| ConsoleUtilSSE NG | Esecuzione comandi console via Papyrus |
| Address Library for SKSE Plugins | Richiesta da ConsoleUtilSSE NG |

## Funzionalità implementate (v1.0.0)

### Tier 1 — Operativo
- **Mobilità:** toggle No Clip (`tcl`) + slider velocità (SpeedMult), ripristino velocità originale alla disattivazione
- **Teletrasporto:** `MoveTo` verso ref selezionata da console
- **Spawn armi:** lista 10 armi vanilla, spawn in inventario
- **Spawn libri:** lista 6 skill book vanilla, spawn in inventario
- **Spawn oggetti:** lista 8 oggetti (incluso oro x100), spawn in inventario
- **Spawn creature:** lista 8 creature, `placeatme` davanti allo staff
- **Despawn:** `Disable` su ref selezionata da console
- **Chat RP:** `/me`, `/do`, `/status` come `Debug.Notification` formattati

### Tier 3 — Placeholder (In sviluppo)
- Teletrasporto player a noi (richiede STR hook)
- Inventario player remoto
- Statistiche player remoto
- Broadcast audio/globale server

## File

```
custom_mods/RPServer_StaffTools/
├── MANIFEST.md            ← questo file
├── source/
│   └── RPServer_StaffTools_MCM.psc   ← script MCM (da compilare)
└── docs/
    └── SPEC.md            ← setup ESP in Creation Kit
```

## Versioning

Segue Semantic Versioning (D-007):
- `v1.0.0` — Tier 1 operativo, testato in STR
- `v1.1.0` — previsto: teletrasporto bidirezionale (se STR lo supporta)
- `v2.0.0` — previsto: ispezione inventario/stats player remoti
