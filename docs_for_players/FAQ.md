# FAQ — Domande Frequenti

> Questa pagina raccoglie le domande più comuni dei giocatori con le relative risposte.
> Aggiornata progressivamente ad ogni sessione di sviluppo/supporto.

---

## Installazione e Setup

**Quale versione di Skyrim devo avere?**
Skyrim Special Edition su Steam, versione aggiornata all'ultima disponibile. Non funziona con Game Pass, console, o versioni piratate.

**Devo avere l'Anniversary Edition?**
No. Basta la Special Edition base. Se hai l'Anniversary Edition va bene, ma devi disabilitare il DLC aggiuntivo "Anniversary Upgrade" dalle proprietà di Steam (vedi INSTALL_GUIDE.md, Passo 1).

**Perché devo avviare il gioco da MO2 e non da Steam?**
MO2 usa un sistema virtuale che "proietta" le mod nel gioco al momento dell'avvio. Se avvii da Steam o dall'exe direttamente, le mod non vengono caricate e non riesci a entrare nel server.

**Non trovo SkyrimTogether.exe nella cartella di Skyrim.**
È normale. L'eseguibile si trova nella cartella di MO2, non in quella di Skyrim:
`C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\SkyrimTogether.exe`
Devi aggiungerlo come launcher personalizzato in MO2 (vedi INSTALL_GUIDE.md, Passo 7).

---

## Helgen e Primo Avvio

**Perché non posso connettermi subito al server?**
Il gioco richiede che tu abbia completato la sequenza iniziale di Helgen prima di connetterti. Usa i comandi console descritti in FIRST_LOGIN.md per saltarla in pochi secondi.

**Il personaggio rimane immobile dopo il teletrasporto.**
Apri la console con `~` e digita `enableplayercontrols`, poi premi Invio.

**Il personaggio vola e la telecamera è libera.**
Hai attivato accidentalmente la telecamera libera. Apri la console con `~`, digita `tfc` e premi Invio.

**La console non si apre.**
Premi il tasto `~` (accento grave), che si trova in alto a sinistra della tastiera sotto il tasto Esc. Se non funziona, controlla che la lingua della tastiera sia impostata su Italiano o Inglese (US).

---

## Connessione al Server

**Dove trovo l'IP e la password del server?**
Lo staff li comunica tramite Discord. Non vengono pubblicati qui per motivi di sicurezza.

**Come apro l'interfaccia di Skyrim Together?**
Premi `F2` oppure `CTRL Destro` mentre sei in gioco.

---

## Problemi Tecnici

> Per problemi più specifici vedi TROUBLESHOOTING.md.

**Il gioco crasha all'avvio.**
Verifica che Address Library sia installata e abilitata in MO2 (spunta verde nella lista mod).

**Non vedo gli altri giocatori.**
Assicurati di essere nel party corretto. Apri l'interfaccia STR con `F2` e verifica lo stato della connessione.
