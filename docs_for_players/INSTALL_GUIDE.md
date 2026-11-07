# Come installare e collegarti al server (SkyMP)

> **Versione provvisoria (novembre 2026), per i test con il team.** Due cose cambieranno quando il server aprirà ai giocatori: l'**indirizzo del server** e il **pacchetto delle mod**, che arriverà con Wabbajack. I punti che cambieranno sono segnati con 🔜.

Ti serve circa mezz'ora. Si fa una volta sola.

---

## Cosa ti serve

- **Skyrim Special Edition** su Steam, per PC Windows.
- La versione del gioco deve essere la **1.6.1170**. SkyMP funziona solo con questa: la versione più recente che Steam installa (1.7.x) non va bene.
- Il **pacchetto giocatore** del server. Contiene i file `avvia_skymp.bat`, `skymp_fix.bat`, `skymp_check.bat` e `skymp_net_check.bat`. 🔜 Per ora te lo passa lo staff.

---

## 1. Blocca gli aggiornamenti di Skyrim

Se Steam aggiorna Skyrim, il gioco smette di funzionare con il server.

1. In Steam fai tasto destro su **Skyrim Special Edition** → **Proprietà** → **Aggiornamenti**.
2. Scegli **"Aggiorna questo gioco solo quando lo avvio"**.
3. Da adesso in poi **non avviare mai Skyrim da Steam**: si avvia solo con `avvia_skymp.bat` (punto 5).

**Se il tuo Skyrim è già aggiornato (1.7.x):** usa il patcher di downgrade `Skyrim_1_7_104_to_1_6_1170_patcher.exe` nella cartella di Skyrim. Se non ce l'hai, chiedilo allo staff. 🔜 Il link arriverà nel canale Discord dell'installazione.

## 2. Installa SkyMP

1. Vai su **https://skymp.net** e scarica il launcher.
2. Avvialo e scegli la cartella di Skyrim. Scarica da solo il client e i file che servono, dentro la cartella `Data`.
3. **Usa il launcher solo per installare e aggiornare, non per giocare.** Il launcher avvia il gioco come amministratore, e così SkyMP resta bloccato sul caricamento.

## 3. Togli "Esegui come amministratore"

1. **Chiudi Steam** (anche dall'icona vicino all'orologio).
2. Fai doppio clic su `skymp_fix.bat`. Toglie la spunta "Esegui come amministratore" da Steam, Mod Organizer 2 e Skyrim.
3. Riapri Steam normalmente.

> **Perché:** se il gioco parte come amministratore, la finestra interna di SkyMP (quella del login) non si apre e resti fermo sulla schermata di caricamento con la musica.

## 4. Collegati al nostro server

🔜 Per ora l'indirizzo del server e il tuo **numero di profilo** te li dà lo staff.

1. Apri con il Blocco note questo file nella cartella di Skyrim:
   `Data\Platform\Plugins\skymp5-client-settings.txt`
2. Cambia i due valori e salva:
   - `"server-ip"`: l'indirizzo che ti ha dato lo staff;
   - `"profileId"`: il tuo numero. **Ognuno ha il suo**: se usi il numero di un altro, entri con il suo personaggio.

Se lo staff ti ha detto di usare **Tailscale** (una rete privata tra i nostri PC), installalo da https://tailscale.com/download, fai l'accesso con il tuo account e accetta il link di invito che ti manda lo staff.

## 5. Gioca

1. Fai **doppio clic** su `avvia_skymp.bat`, con un doppio clic normale e **non** con "Esegui come amministratore".
2. Lo script controlla la versione di Skyrim e Steam, poi avvia il gioco con SkyMP.
3. Se tutto va bene, arrivi alla **creazione del personaggio**.

Se qualcosa non va, guarda [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

---

## Se Skyrim è in un'altra cartella

Gli script cercano Skyrim in `C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition`.
Se il tuo è altrove, apri con il Blocco note `avvia_skymp.ps1` e cambia la riga che inizia con `$Skyrim =` con il percorso giusto. Per esempio:

```
$Skyrim = 'D:\SteamLibrary\steamapps\common\Skyrim Special Edition'
```
- `$Skyrim`: la variabile con la cartella del gioco, che lo script usa per trovare Skyrim;
- `'D:\SteamLibrary\...'`: il percorso della tua cartella di Skyrim, tra apici singoli.
