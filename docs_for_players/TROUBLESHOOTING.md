# Risolvere i problemi più comuni (SkyMP)

> Questi sono i problemi che abbiamo incontrato noi del team durante le prove. Se il tuo non c'è, scrivi allo staff ([CONTACTS.md](CONTACTS.md)) e allega il report di `skymp_check.bat` (vedi in fondo).

## Il gioco non parte o si blocca

| Cosa succede | Causa probabile | Cosa fare |
|---|---|---|
| Resti sulla **schermata di caricamento con la musica** e non succede niente | Il gioco è partito **come amministratore**, quindi la finestra di login di SkyMP non si apre | Chiudi tutto, **Steam compreso** → doppio clic su `skymp_fix.bat` → riapri Steam → avvia con `avvia_skymp.bat`. Non usare il launcher di skymp.net per giocare |
| `avvia_skymp.bat` dice **"avviato come amministratore"** | Hai usato "Esegui come amministratore" | Chiudi e rifai con un doppio clic normale |
| `avvia_skymp.bat` dice **"Steam è aperto come amministratore"** | Steam ha la spunta "Esegui come amministratore" | Chiudi Steam → `skymp_fix.bat` → riapri Steam |
| `avvia_skymp.bat` dice che **Skyrim è alla versione sbagliata** | Steam ha aggiornato Skyrim alla 1.7.x | Patcher di downgrade alla 1.6.1170 (vedi [INSTALL_GUIDE.md](INSTALL_GUIDE.md), punto 1) e controlla l'impostazione degli aggiornamenti in Steam |
| `avvia_skymp.bat` dice che **non trova `skse64_loader.exe`** | Skyrim è in un'altra cartella | Correggi la riga `$Skyrim` (vedi in fondo all'[INSTALL_GUIDE.md](INSTALL_GUIDE.md)) |
| **"Steam non ha completato l'accesso entro 2 minuti"** | Steam non ha fatto il login | Fai l'accesso a Steam e riprova |
| Avviso **"Failed to find offset for Address Library ID…"** su un file `.dll` | Un plugin non è compatibile con la 1.6.1170 | Scrivi allo staff il nome del file: di solito basta toglierlo dalla cartella `Data\SKSE\Plugins` |

## Non riesci a collegarti

| Cosa succede | Causa probabile | Cosa fare |
|---|---|---|
| **"A new update is available"** appena entri | La "password" del tuo client SkyMP è diversa da quella del server (succede quando le versioni non coincidono) | Apri `Data\Platform\Distribution\password` nella cartella di Skyrim e scrivi allo staff il valore che trovi |
| Fermo su **"Connecting to …"** | Il server è spento, l'indirizzo è sbagliato, oppure c'è un problema di rete (firewall, Tailscale spento) | Controlla con lo staff che il server sia acceso e che l'indirizzo sia giusto. Se usate Tailscale, deve essere acceso. Poi lancia `skymp_net_check.bat` e manda il report allo staff |
| Entri con **il personaggio di un altro** | Il tuo `profileId` è uguale a quello di un altro giocatore | Correggilo nel file `Data\Platform\Plugins\skymp5-client-settings.txt` (vedi [INSTALL_GUIDE.md](INSTALL_GUIDE.md), punto 4) |

## Messaggi che puoi ignorare

Nei log possono comparire messaggi che non sono errori veri:
- `DirectoryMonitor(Data/Platform/PluginsDev) failed with code 2`: manca una cartella facoltativa, va bene così;
- nei log di Chromium, `GpuControl.CreateCommandBuffer` e `Unable to get gpu adapter`.

## Mandare un report allo staff

1. Fai doppio clic su `skymp_check.bat` (doppio clic normale, **non** come amministratore).
2. Controlla PC, versione di Skyrim e impostazioni, poi scrive tutto in `skymp_check_report.txt`, nella stessa cartella.
3. Manda quel file allo staff.

Per i problemi di collegamento, usa invece `skymp_net_check.bat`, meglio se **mentre il gioco è fermo su "Connecting"**. Il report finisce in `skymp_net_report.txt`.
