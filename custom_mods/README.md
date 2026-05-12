# custom_mods/

> Cartella che ospita **le mod sviluppate dal team** per il server.

## Struttura di una mod custom

Ogni mod ha una sua sottocartella, con questa struttura tipo:

```
custom_mods/
└── RPServer_NomeMod/
    ├── MANIFEST.md          ← copia compilata di MANIFEST_TEMPLATE.md
    ├── plugin.esp           ← il plugin deployabile (può anche essere .esm o .esl)
    ├── source/              ← sorgenti che generano il plugin
    │   ├── *.pas            ← script Pascal per SSEEdit (se applicabile)
    │   └── *.psc            ← script Papyrus sorgente (se applicabile)
    ├── scripts/             ← script Papyrus compilati (.pex), se la mod ne ha
    ├── docs/                ← documentazione interna alla mod (note di sviluppo, decisioni specifiche)
    └── tests/               ← (opzionale) test e checklist di verifica
```

## Convenzioni di naming

- Tutte le mod custom hanno prefisso **`RPServer_`** nel nome del file `.esp` per essere riconoscibili a colpo d'occhio nel load order.
- Esempi: `RPServer_EmptyWorld.esp`, `RPServer_Background.esp`, `RPServer_Economy.esp`.

## Versionamento

Le versioni seguono lo schema `vMAJOR.MINOR.PATCH` (vedi `DECISIONS.md` D-007). La versione corrente è sempre dichiarata nel `MANIFEST.md` di ogni mod.

## Mod attualmente presenti

| Mod | Versione | Status | Cartella |
|---|---|---|---|
| RPServer_EmptyWorld | v0.3.0 (sorgenti, .esp non ancora generato) | 🛠️ In sviluppo | `RPServer_EmptyWorld/` |

Aggiungere nuove righe quando si creano nuove mod. Sincronizzare con `MODLIST.md` (sezione "Mod custom") nella root del repo.
