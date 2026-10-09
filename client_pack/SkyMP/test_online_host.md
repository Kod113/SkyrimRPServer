# Test online SkyMP — guida per chi ospita il server (David)

> **Scopo:** far entrare Davide nel mondo del server SkyMP locale che gira sul PC di David, per vedere se la prima connessione online funziona.
> La guida per Davide è `test_online_ospite.md` (stessa cartella).

```
Server:   fork jqntn/skymp (tag jqntn-2026-10-05), offline mode, in _locale/skymp-server
Rete:     Tailscale (niente porte da aprire sul router)
Porte:    UDP 7777 (gioco) + TCP 3000 (interfaccia del client)
Profili:  Davide = profileId 1 · David = profileId 2
```

---

## Prima della sessione (una volta sola)

### 1. Tailscale
1. Installa Tailscale da https://tailscale.com/download e fai l'accesso con il tuo account.
2. Apri https://login.tailscale.com/admin/machines, clicca i **tre puntini** accanto al tuo PC → **Share…** → copia il link e mandalo a Davide.
   Con la condivisione Davide vede **solo il tuo PC**, non il resto della tua rete Tailscale.

### 2. Firewall
Pannello di controllo → Windows Defender Firewall → **Consenti app o funzionalità attraverso Windows Defender Firewall** → cerca **Node.js** → spunta sia **Privata** sia **Pubblica**.

> Perché: Windows spesso classifica la rete di Tailscale come "pubblica". Se Node.js è consentito solo sulle reti private, Davide resta fermo su "Connecting…".

### 3. Il tuo indirizzo Tailscale
In PowerShell:
```
tailscale ip -4
```
- `tailscale` → il programma di Tailscale da riga di comando (installato insieme all'app)
- `ip` → sotto-comando: mostra gli indirizzi di questo PC nella rete Tailscale
- `-4` → solo l'indirizzo IPv4, quello nella forma `100.x.y.z`

Manda questo numero a Davide: gli serve per il suo file di impostazioni.

### 4. Controlla la guida di Davide
Assicurati che abbia fatto la sua parte "prima della sessione" (soprattutto **password del client = `1c3b345`** e **`profileId` = 1**).

---

## La sessione

1. Accendi Tailscale.
2. Doppio clic su `client_pack\SkyMP\server_locale.bat`. **Lascia aperta la finestra** (se la chiudi, il server si spegne).
3. Doppio clic su `client_pack\SkyMP\avvia_skymp.bat`. Il tuo client resta su `127.0.0.1` (il server è sul tuo stesso PC): non devi cambiare niente.
4. Dì a Davide di fare la prova della porta e poi di avviare il gioco.
5. Nella finestra del server deve comparire una riga `Connecting a user ...` con il suo indirizzo `100.…`.

---

## Cosa provare una volta dentro

Annota i risultati in `specs/platform/skymp_spike.md` (sezioni 2 e 6).

- [ ] Vi vedete a vicenda?
- [ ] Movimenti e animazioni sono fluidi o "a scatti"? (`show-net-info` mostra i dati di rete in gioco)
- [ ] Uno lascia un oggetto a terra, l'altro lo raccoglie
- [ ] Davide esce e rientra: stesso punto, stesso inventario?
- [ ] Spegni e riaccendi il server: i personaggi sono ancora dove li avevate lasciati?

---

## Se qualcosa va storto

| Cosa succede | Causa probabile | Cosa fare |
|---|---|---|
| Davide vede "A new update is available" | Password del client diversa dalla tua | Confrontare i due file `Data\Platform\Distribution\password` (devono dire entrambi `1c3b345`) |
| Davide resta fermo su "Connecting to 100.…" | Firewall o Tailscale | Firewall Node.js su **Pubblica** (punto 2) + Davide rifà la prova con `Test-NetConnection` |
| Schermata di caricamento con la musica, non va avanti | Gioco avviato come amministratore (CEF codice 38) | `client_pack\Diagnostica\skymp_fix.bat` con Steam chiuso |
| Davide entra con il tuo personaggio | Nel suo file è rimasto `profileId` 2 | Cambiarlo a 1 nel file **della cartella di Skyrim** (non quello del repo) |
| Errore di versione all'avvio | Steam ha aggiornato Skyrim alla 1.7.x | `Skyrim_1_7_104_to_1_6_1170_patcher.exe` nella cartella di Skyrim |
| La finestra del server si chiude subito | Errore nella configurazione | Riaprila e leggi il messaggio `ERRORE:` (di solito un file del `loadOrder` non trovato) |

---

## Da sistemare dopo il test

- `configs/skymp/skymp5-client-settings.locale.txt` è nel repo ed è uguale per tutti (`127.0.0.1` + `profileId` 2). Per questo test Davide lo corregge a mano sul suo PC; poi serve un file personale ignorato da git che `client_profilo.bat` legga al posto dei valori fissi.
