# Pacchetto per i giocatori

`AtronachRP.zip` è lo zip da dare a un giocatore che ha solo **Skyrim Special Edition comprato su Steam**.
Dentro c'è la cartella `Atronach RP` con il launcher e il file `LEGGIMI.txt` (istruzioni per il giocatore).

Cosa fa il giocatore: estrae lo zip, fa doppio clic su `Avvia Atronach RP.bat`, preme **SISTEMA TUTTO** e poi **GIOCA**.
Il launcher installa SKSE e SkyMP, riporta Skyrim alla 1.6.1170 se serve e prepara **il suo mondo**:
un server SkyMP sul suo PC (Node.js portatile + server della release `jqntn-2026-10-05`, in `%APPDATA%\AtronachRP\mondo`),
che si accende quando preme GIOCA. Niente installazioni in Windows e niente amministratore.

Il mondo per ora è SkyMP "vuoto" (gamemode vuota della release, NPC spenti): la gamemode del server vero non è inclusa.

## Come si rifà lo zip

Lo zip contiene i file di `client_pack/AtronachLauncher/` (`Avvia Atronach RP.bat`, `launcher.ps1`, `finestra.xaml`,
`config.json`, `Imposta server.bat`, `imposta_server.ps1`, `risorse/`) più `LEGGIMI.txt` di questa cartella.
Quando cambia il launcher, va rifatto (oppure si usa quello della release `launcher`, creato dall'Action `pacchetto_launcher.yml`).

Per un pacchetto che si collega a un server online invece che al mondo sul PC: in `config.json` metti l'indirizzo
in `server_ip` (con un indirizzo diverso da `127.0.0.1` il mondo sul PC non viene usato).
