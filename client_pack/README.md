# client_pack/

> Cartella che ospiterà il **pacchetto distribuibile ai giocatori** (modlist completa pacchettizzata per installazione).

## Status

🔴 **Vuota.** Sarà popolata nella fase di distribuzione (Step 5 della roadmap), quando la modlist del server sarà stabile e pronta per essere consegnata ai giocatori esterni al team dev.

## Cosa conterrà (previsione)

| File | Cosa è |
|---|---|
| `RPServer_Player.wabbajack` | Pacchetto Wabbajack per la modlist Player |
| `RPServer_Staff.wabbajack` | Pacchetto Wabbajack per la modlist Staff |
| `RELEASE_NOTES.md` | Note di rilascio per ogni versione del pacchetto |
| `INSTALL_GUIDE.md` | Guida di installazione per i giocatori (puntata da Discord) |

## Distribuzione

I `.wabbajack` saranno pubblicati anche come **GitHub Release**, in modo che i giocatori possano scaricarli da una pagina pubblica del repo senza dover navigare la struttura interna. Lo Status di ogni release sarà:

- `Alpha` — solo team dev, instabile
- `Beta` — cerchia ristretta di tester, da feedbackare attivamente
- `Stable` — distribuzione aperta alla community

## Note tecniche

I file `.wabbajack` sono leggeri (pochi MB tipicamente) perché contengono solo le configurazioni e le mod custom; le mod terze vengono scaricate dall'utente da Nexus al momento dell'installazione.

Il limite GitHub per file è 100 MB, ampiamente sotto la soglia tipica di un `.wabbajack`. Se per qualche motivo il pacchetto crescesse oltre, valuteremo Git LFS o hosting alternativo.
