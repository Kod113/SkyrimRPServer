# Collegamento online al server locale: procedura per Claude

> **Per chi è:** il Claude (Cowork o Claude Code) di chi **ospita** il server e il Claude di chi **entra** nel mondo.
> Ognuno segue la sua colonna. Le guide per le persone restano `test_online_host.md` e `test_online_ospite.md`.
> **Obiettivo:** le persone fanno solo ciò che Claude non può fare al posto loro (accessi agli account, conferme di Windows, messaggi tra loro).

```
Rete:      Tailscale (nessuna porta da aprire sul router)
Porte:     UDP 7777 (gioco) + TCP 3000 (interfaccia del client)
Password:  il file Data\Platform\Distribution\password deve essere UGUALE sui due PC
profileId: davide = 1 · david = 2  (con lo stesso numero si entra con il personaggio dell'altro)
```

Prima di iniziare, Claude fa **Pull** del repo (o lo chiede all'utente) e controlla di essere su `main` aggiornato.

---

## 1. Chi sono e cosa faccio

| | Claude di chi ospita (`david`) | Claude di chi entra (`davide`) |
|---|---|---|
| Ruolo | Accende il server e lo rende raggiungibile | Prepara il client e si collega |
| Serve dall'altro | Che l'ospite abbia accettato la condivisione Tailscale | L'**indirizzo Tailscale** dell'host (`100.x.y.z`) e la sua **password del client** |

Le informazioni da scambiare (indirizzo, password, "server acceso") passano dalle **persone** (Discord): non scriverle nel repo.

---

## 2. Preparazione (una volta sola)

### Host (`david`)

| # | Cosa | Chi | Come |
|---|---|---|---|
| H1 | Skyrim 1.6.1170, SkyMP installato, niente amministratore | Claude | Avvia `client_pack\Diagnostica\skymp_check.bat` (o il launcher `client_pack\AtronachLauncher\`, quando è su `main`) e controlla che sia tutto a posto |
| H2 | Tailscale installato | Claude | `winget install Tailscale.Tailscale` → Windows chiede conferma: **l'utente** risponde Sì |
| H3 | Accesso a Tailscale | **Persona** | Accede con il proprio account nella finestra di Tailscale |
| H4 | Condividere il PC con l'ospite | Claude (browser) | https://login.tailscale.com/admin/machines → tre puntini accanto al PC → **Share…** → copia il link. **La persona** lo manda all'ospite |
| H5 | Firewall: Node.js su reti Privata **e** Pubblica | Claude + **conferma** | Comando sotto. Windows chiede il permesso di amministratore: **l'utente** risponde Sì |
| H6 | Indirizzo Tailscale | Claude | `tailscale ip -4` → **la persona** lo manda all'ospite |
| H7 | Password del client | Claude | Legge `...\Skyrim Special Edition\Data\Platform\Distribution\password` → **la persona** la manda all'ospite |

Comando per H5 (PowerShell, si apre come amministratore):

```
Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-Command',"New-NetFirewallRule -DisplayName 'SkyMP server (Node.js)' -Direction Inbound -Program (Get-Command node).Source -Action Allow -Profile Any"
```

- `Start-Process powershell -Verb RunAs` → apre un'altra PowerShell **come amministratore** (Windows chiede conferma)
- `-ArgumentList '-NoProfile','-Command', "..."` → cosa deve eseguire quella PowerShell
- `New-NetFirewallRule` → crea una regola nel firewall di Windows
- `-DisplayName 'SkyMP server (Node.js)'` → il nome con cui la regola compare nel firewall
- `-Direction Inbound` → vale per le connessioni **in arrivo** (l'ospite che si collega)
- `-Program (Get-Command node).Source` → vale solo per Node.js, cioè il programma del server (`Get-Command node` trova dove è installato)
- `-Action Allow` → permette la connessione
- `-Profile Any` → su tutte le reti, compresa quella "pubblica" in cui Windows mette spesso Tailscale

### Ospite (`davide`)

| # | Cosa | Chi | Come |
|---|---|---|---|
| O1 | Skyrim 1.6.1170, SkyMP installato, niente amministratore | Claude | Come H1 |
| O2 | Password del client uguale a quella dell'host | Claude | Legge il suo file `password` e lo confronta con quella ricevuta. Se è diversa, **fermati** e avvisa: il server rifiuterebbe il client |
| O3 | Tailscale installato | Claude | `winget install Tailscale.Tailscale` → **l'utente** conferma |
| O4 | Accesso a Tailscale | **Persona** | Con il **proprio** account (non quello dell'host) |
| O5 | Accettare la condivisione | **Persona** | Apre il link ricevuto dall'host e accetta |
| O6 | Launcher impostato sul server dell'host | Claude | Comando sotto |

Comando per O6 (dalla cartella del repo, in PowerShell):

```
& "client_pack\AtronachLauncher\Imposta server.bat" 100.x.y.z
```

- `&` → esegue un file il cui percorso è tra virgolette (il nome contiene uno spazio)
- `client_pack\AtronachLauncher\Imposta server.bat` → sceglie il server del launcher **solo su questo PC**
- `100.x.y.z` → l'indirizzo Tailscale dell'host (porta 7777 se non se ne scrive un'altra come secondo valore)

Scrive solo `%APPDATA%\AtronachRP\server.json` (che ha la precedenza su `config.json`): **nessun file del repo cambia**. Per tornare indietro: `Imposta server.bat nessuno`.

Il numero di giocatore (profileId `1`) lo chiede il launcher la prima volta che si preme **Imposta** su "Collegato al server": lo scrive **la persona** (o Claude, se controlla lo schermo).

> Strada di riserva senza launcher: `client_pack\SkyMP\client_profilo.bat locale 100.x.y.z 1` e poi `client_pack\SkyMP\avvia_skymp.bat`.

---

## 3. La sessione

| # | Host (`david`) | Ospite (`davide`) |
|---|---|---|
| 1 | Tailscale acceso | Tailscale acceso |
| 2 | Avvia `client_pack\SkyMP\server_locale.bat`. La finestra **resta aperta** (chiusa = server spento). Deve comparire `Server resources folder is listening on 3000` | — |
| 3 | **La persona** dice all'ospite che il server è acceso | — |
| 4 | — | Prova la strada (comando sotto). Deve uscire `TcpTestSucceeded : True`. Se `False` → fermati: di solito è il firewall dell'host (H5) |
| 5 | Avvia il proprio gioco con `avvia_skymp.bat` (o il launcher Atronach RP): resta su `127.0.0.1` | Apre `client_pack\AtronachLauncher\Avvia Atronach RP.bat` (doppio clic normale, **non** come amministratore), sistema i punti rossi e preme **GIOCA** |
| 6 | Nella finestra del server cerca `Connecting a user ...` con un indirizzo `100.…` | In gioco, in alto a sinistra: `connection: ON` |

Comando per il passo 4 (PowerShell):

```
Test-NetConnection 100.x.y.z -Port 3000
```

- `Test-NetConnection` → prova a collegarsi a un altro computer
- `100.x.y.z` → l'indirizzo Tailscale dell'host
- `-Port 3000` → la porta su cui il server manda al client l'interfaccia del gioco

Per la porta del gioco (UDP 7777) c'è `client_pack\Diagnostica\skymp_net_check.bat 100.x.y.z:7777`: lancialo **mentre** il gioco è fermo su "Connecting".

---

## 4. Se qualcosa va storto

| Cosa succede | Lato | Cosa fa Claude |
|---|---|---|
| "A new update is available" | Ospite | Password diverse: rifai O2 |
| Fermo su "Connecting to 100.…" | Ospite → Host | Tailscale acceso su tutti e due? Rifai il passo 4; se `False`, sull'host rifai H5 |
| Schermata di caricamento con la musica | Chi la vede | Gioco come amministratore: chiudi tutto (Steam compreso) e lancia `client_pack\Diagnostica\skymp_fix.bat` |
| L'ospite entra con il personaggio dell'host | Ospite | profileId sbagliato: in `%APPDATA%\AtronachRP\impostazioni.json` metti `"profileId": 1`, poi nel launcher **Imposta** su "Collegato al server" |
| Versione di Skyrim sbagliata | Chi la vede | Steam l'ha aggiornato: vedi `docs_for_players/INSTALL_GUIDE.md` |
| La finestra del server si chiude subito | Host | Riaprila e leggi la riga `ERRORE:` |

---

## 5. Cosa Claude non fa

- Non accede agli account (Tailscale, Steam, Discord) e non scrive password: lo fa la persona.
- Non manda messaggi all'altra persona: indirizzo, password e "server acceso" li passa la persona.
- Non scrive indirizzi IP o password nel repo.
