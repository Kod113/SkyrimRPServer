# configs/

> Cartella che ospita **file di configurazione del client** (load order, .ini di Skyrim e SKSE, profili di Mod Organizer 2).

## Contenuto previsto

| File | Cosa è |
|---|---|
| `load_order.txt` | Load order ufficiale del server, esportato da MO2 |
| `plugins.txt` | Lista plugin attivi |
| `Skyrim.ini` | .ini base di Skyrim per il profilo server (tunato per stabilità STR) |
| `SkyrimPrefs.ini` | .ini preferenze grafiche/audio (versione "stabilità prima") |
| `SKSE.ini` | configurazione SKSE |
| `MO2_profile/` | (opzionale) export del profilo MO2 `RPServer-Dev` per riproducibilità |

## Quando aggiornare

Ogni volta che si aggiunge/rimuove/riordina una mod, **il load order va riesportato e committato qui**. È la "verità tecnica" di cosa va caricato in che ordine.

I file `.ini` vanno toccati con parsimonia: ogni modifica andrebbe registrata in `DECISIONS.md` con motivazione, perché cambiamenti agli `.ini` possono avere effetti sottili sulla stabilità.

## Note STR

Skyrim Together Reborn richiede che **tutti i player abbiano lo stesso load order**. Distribuire `load_order.txt` ai membri del team è essenziale. Quando la modlist sarà pacchettizzata via Wabbajack, questo file verrà inglobato automaticamente nel pacchetto.

## Status

🔴 **Vuota.** Verrà popolata dopo la Sessione 10 (installazione stack mod sul fisso) del piano operativo.
