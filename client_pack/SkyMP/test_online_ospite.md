# Test online SkyMP — guida per chi entra nel mondo (Davide)

> **Scopo:** entrare nel mondo del server SkyMP che gira sul PC di David, per provare la prima connessione online.
> Il server lo accende David: tu devi solo preparare il tuo PC e collegarti.

```
Il tuo profileId:   1   (David è il 2: con lo stesso numero entreresti con il suo personaggio)
Password client:    1c3b345   (deve essere uguale a quella di David)
Indirizzo server:   te lo manda David (forma 100.x.y.z)
```

---

## Prima della sessione (una volta sola)

### 1. Repo aggiornato
Fai **pull** da GitHub Desktop, così hai i file in `client_pack\SkyMP\` e `client_pack\Diagnostica\`.

### 2. Skyrim alla versione 1.6.1170
- Se Steam ha aggiornato Skyrim (1.7.x), lancia `Skyrim_1_7_104_to_1_6_1170_patcher.exe` nella cartella di Skyrim.
- In Steam: tasto destro su Skyrim Special Edition → **Proprietà** → **Aggiornamenti** → "Aggiorna questo gioco solo quando lo avvio".
- Da ora in poi **non avviare mai Skyrim da Steam**: solo con `avvia_skymp.bat`.

### 3. Client SkyMP
Installa il client con il launcher di https://skymp.net (si sceglie la cartella di Skyrim e scarica tutto da solo).
Il launcher serve **solo per installare/aggiornare**: per giocare si usa `avvia_skymp.bat`.

### 4. Controlla la password del client
Apri con il Blocco note:
`...\Skyrim Special Edition\Data\Platform\Distribution\password`
Deve esserci scritto `1c3b345`. Se c'è un altro valore, scrivilo a David: il suo server ti rifiuterebbe.

### 5. Niente "Esegui come amministratore"
1. Doppio clic su `client_pack\Diagnostica\skymp_check.bat` → controlla il PC e scrive un report.
2. **Chiudi Steam**, poi doppio clic su `client_pack\Diagnostica\skymp_fix.bat` → toglie la spunta "Esegui come amministratore" da Steam, MO2 e Skyrim.

> Perché: se il gioco parte come amministratore, il browser interno di SkyMP non si avvia e resti bloccato sulla schermata di caricamento con la musica.

### 6. Solo se Skyrim è installato in un'altra cartella
Gli script cercano Skyrim in `C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition`.
Se il tuo è altrove, apri con il Blocco note `client_pack\SkyMP\avvia_skymp.ps1` e `client_pack\SkyMP\client_profilo.ps1` e cambia la riga `$Skyrim = '...'` con il tuo percorso. **Non fare commit** di questa modifica.

### 7. Tailscale
1. Installa Tailscale da https://tailscale.com/download e fai l'accesso con **il tuo** account.
2. Apri il link di condivisione che ti manda David e accetta: da quel momento vedi il suo PC.

### 8. Imposta il client sul server di David
1. Doppio clic su `client_pack\SkyMP\client_profilo.bat locale`.
   → Copia le impostazioni "server locale" nella tua cartella di Skyrim (e salva una copia di quelle del server ufficiale).
2. Apri con il Blocco note **il file nella cartella di Skyrim**:
   `...\Skyrim Special Edition\Data\Platform\Plugins\skymp5-client-settings.txt`
   ⚠️ **Non** quello in `configs\skymp\` del repo: se modifichi quello, la modifica finisce su git e cambia le impostazioni anche a David.
3. Cambia due valori e salva:

   | Prima | Dopo |
   |---|---|
   | `"server-ip": "127.0.0.1"` | `"server-ip": "100.x.y.z"` ← l'indirizzo di David |
   | `"profileId": 2` | `"profileId": 1` |

---

## La sessione

1. Accendi Tailscale.
2. Aspetta che David ti dica che il server è acceso.
3. **Prova la strada** — in PowerShell:
   ```
   Test-NetConnection 100.x.y.z -Port 3000
   ```
   - `Test-NetConnection` → comando di PowerShell che prova a collegarsi a un altro computer
   - `100.x.y.z` → l'indirizzo Tailscale di David
   - `-Port 3000` → la "porta" da provare: sulla 3000 il server di David manda al client l'interfaccia del gioco

   Se compare `TcpTestSucceeded : True` la strada è aperta. Se compare `False`, dillo a David prima di avviare il gioco (di solito è il suo firewall).
4. Doppio clic su `client_pack\SkyMP\avvia_skymp.bat` (doppio clic normale, **non** "Esegui come amministratore").
5. Se tutto va bene arrivi alla **creazione del personaggio**.

---

## Se qualcosa va storto

| Cosa succede | Causa probabile | Cosa fare |
|---|---|---|
| "A new update is available" | La tua password del client è diversa da quella di David | Controlla il punto 4 e scrivi a David il valore che trovi |
| Fermo su "Connecting to 100.…" | Firewall di David o Tailscale | Tailscale acceso su entrambi? Rifai la prova con `Test-NetConnection` |
| Schermata di caricamento con la musica, non va avanti | Gioco avviato come amministratore | Chiudi tutto, Steam compreso → `skymp_fix.bat` → riprova |
| Entri con il personaggio di David | `profileId` è rimasto 2 | Correggilo a 1 nel file **della cartella di Skyrim** (punto 8) |
| `avvia_skymp.bat` dice che Skyrim è alla versione sbagliata | Steam l'ha aggiornato | Patcher della 1.6.1170 (punto 2) |
| `avvia_skymp.bat` dice che non trova `skse64_loader.exe` | Skyrim è in un'altra cartella | Punto 6 |

---

## Per tornare al server ufficiale
Doppio clic su `client_pack\SkyMP\client_profilo.bat ufficiale`.
