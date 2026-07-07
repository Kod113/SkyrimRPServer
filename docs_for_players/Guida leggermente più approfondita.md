# Guida Setup — Skyrim Together Reborn (versione approfondita)

> Questa guida ti porta da zero fino a essere in gioco con gli altri, spiegando anche il *perché* dei passaggi.
> Se vuoi solo i comandi essenziali, usa la **Guida super stringata**.
> Segui i passi **nell'ordine esatto**. Se qualcosa va storto: sezione **Problemi Comuni** in fondo, oppure Discord.

---

## Cosa ti serve

- PC con **Windows 10 o 11** (no Mac, no console)
- **Skyrim Special Edition** su Steam (no Game Pass, no console, no versioni piratate)
- Circa **20 GB** di spazio libero
- **Discord** (lì riceverai IP e password del server)

---

## PARTE 1 — Prepara Skyrim

### 1.1 Disabilita l'Anniversary Upgrade (anche se pensi di non averlo)

Il pacchetto extra dell'Anniversary Edition dà problemi col multiplayer.

1. Steam → **Libreria** → clic destro su **Skyrim Special Edition** → **Proprietà**
2. Scheda **DLC**
3. Se c'è **"The Elder Scrolls V: Skyrim Anniversary Upgrade"** → **togli la spunta**
4. Se la scheda DLC non c'è o non lo elenca, sei a posto

### 1.2 Disabilita gli aggiornamenti automatici

Il multiplayer funziona con una versione precisa del gioco. Se Steam aggiorna Skyrim da solo, rischi di non poter più giocare finché non sistemiamo tutto.

1. Clic destro su Skyrim → **Proprietà** → **Aggiornamenti**
2. Imposta **"Aggiorna questo gioco solo quando lo avvio"**
3. D'ora in poi avvierai il gioco **solo da MO2** (spiegato dopo), quindi Steam non lo aggiornerà mai da solo

### 1.3 Avvia Skyrim una volta

Il gioco deve generare i suoi file di configurazione.

1. Avvia Skyrim da Steam
2. Nel launcher: **Opzioni** → imposta la risoluzione del tuo schermo → **Gioca**
3. Arrivato al menu principale, **chiudi il gioco**. Non serve giocare.

---

## PARTE 2 — Installa Mod Organizer 2 (MO2)

MO2 è il programma che gestisce le mod. **È obbligatorio**, anche se hai già Vortex (vedi FAQ in fondo per il perché).

1. Vai su [github.com/ModOrganizer2/modorganizer/releases](https://github.com/ModOrganizer2/modorganizer/releases)
2. Scarica **Mod.Organizer-X.X.X.exe** (la versione più recente)
3. Installalo in `C:\Modding\MO2` (crea la cartella)
   - ❌ NON dentro `Programmi` e NON dentro la cartella di Steam/Skyrim
4. Al primo avvio scegli **Skyrim Special Edition** come gioco, lascia che trovi la cartella da solo → **OK**

---

## PARTE 3 — Account NexusMods

NexusMods è il sito da cui si scaricano le mod. Gratuito.

1. [nexusmods.com](https://www.nexusmods.com) → **Register** → crea l'account e conferma l'email
2. Al primo download il sito ti chiederà di collegare MO2: quando il browser chiede se aprire il link con MO2, accetta

---

## PARTE 4 — Le mod (solo 4, nell'ordine)

Per ogni mod la procedura è identica:

1. Apri il link
2. Scheda **Files** → **Mod Manager Download** sul file principale (MAIN FILES)
3. Il browser chiede di aprire MO2 → **Sì**
4. In MO2, scheda **Downloads** (a destra) → doppio clic sul file scaricato → **OK**
5. Metti la **spunta** alla mod nella lista di sinistra per abilitarla

### 4.1 Address Library for SKSE Plugins

→ [nexusmods.com/skyrimspecialedition/mods/32444](https://www.nexusmods.com/skyrimspecialedition/mods/32444)

Dipendenza obbligatoria di Skyrim Together. Senza questa il gioco non parte. Scarica il file **"All in one (Anniversary Edition)"**.

### 4.2 Skyrim Together Reborn

→ [nexusmods.com/skyrimspecialedition/mods/69993](https://www.nexusmods.com/skyrimspecialedition/mods/69993)

La mod multiplayer. All'installazione in MO2 può apparire un avviso — ignoralo: freccia verde → **OK** → **Ignore**.

### 4.3 Unofficial Skyrim Special Edition Patch (USSEP)

→ [nexusmods.com/skyrimspecialedition/mods/266](https://www.nexusmods.com/skyrimspecialedition/mods/266)

Corregge migliaia di piccoli bug del gioco base. Standard su qualsiasi installazione moddata.

### 4.4 Alternate Start — Live Another Life

→ [nexusmods.com/skyrimspecialedition/mods/272](https://www.nexusmods.com/skyrimspecialedition/mods/272)

Salta l'intro di Helgen (il carro): inizi in una cella e scegli tu come cominciare. Fondamentale per il multiplayer, perché l'intro vanilla non è sincronizzabile tra giocatori.

### 4.5 Controllo finale

Nella lista di sinistra di MO2 devono esserci **4 mod, tutte con la spunta**.

> ⚠️ **Non aggiungere altre mod.** Nel multiplayer tutti devono avere le stesse identiche mod, altrimenti crash e desincronizzazioni. Se vuoi una mod, proponila su Discord: se compatibile la aggiungiamo per tutti.

---

## PARTE 5 — Installa LOOT (ordina le mod)

LOOT mette i plugin nell'ordine di caricamento corretto. Va avviato **da dentro MO2**, altrimenti non vede le mod.

1. Scarica LOOT da [loot.github.io](https://loot.github.io) e installalo
2. In MO2: **icona a ingranaggio** in alto → **+** → **Aggiungi da file...** → seleziona `LOOT.exe` (di solito in `C:\Program Files\LOOT\`) → **OK**
3. Menu a tendina in alto a destra → **LOOT** → **Run**
4. In LOOT: **Sort** → **Apply** → chiudi
5. Rilancia LOOT così ogni volta che la modlist cambia

---

## PARTE 6 — Configura il launcher multiplayer

Va fatto una sola volta.

1. In MO2: **icona a ingranaggio** → **+** → **Aggiungi da file...** → seleziona:
   `C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\SkyrimTogether.exe` → **OK**
2. Menu a tendina → **SkyrimTogether** → **Run**
3. Al primo avvio appare una finestra che chiede un eseguibile → seleziona **SkyrimSE.exe** dalla cartella di Skyrim (es. `C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition\SkyrimSE.exe`)
4. Il gioco parte e arrivi al menu principale → tutto ok

> 💡 D'ora in poi il gioco si avvia **sempre e solo** così: MO2 → SkyrimTogether → **Run**. Mai da Steam.

---

## PARTE 7 — Primo personaggio

1. **Nuova partita** → grazie ad Alternate Start ti risvegli in una **cella** invece che sul carro
2. Crea il personaggio (aspetto, razza, nome)
3. Attiva la **statua di Mara** nella cella e scegli come iniziare la tua vita
4. Dormi nel letto per confermare → ti risvegli nel punto scelto
5. **Salva la partita**

> 💡 Completa il risveglio **prima** di connetterti: connettersi dalla cella può dare problemi di sincronizzazione.

---

## PARTE 8A — Se sei l'HOST (una persona sola)

Due opzioni:

- **Facile:** server gratuito su [playtogether.gg](https://playtogether.gg) → crealo, ti dà IP e password → condividili su Discord. Non puoi configurare impostazioni avanzate, ma per iniziare va benissimo.
- **Dal tuo PC:** avvii tu il server e apri la porta **UDP 10578** sul router (port forwarding). Guida ufficiale degli sviluppatori: [Server guide — Skyrim Together](https://wiki.tiltedphoques.com/skyrim-together-reborn/guides/server-guide)

## PARTE 8B — Se sei un GUEST (tutti gli altri)

1. Carica il salvataggio del punto 7
2. Premi **F2** (o **CTRL destro**) per aprire l'interfaccia di Skyrim Together
3. **Connect** → inserisci **IP e password** ricevuti su Discord
4. Sei dentro. Ci vediamo in gioco 🎉

---

## FAQ

**Ho già Vortex. Perché devo usare MO2?**
Primo: MO2 non tocca mai i file veri del gioco — usa una "cartella virtuale" creata all'avvio, quindi se qualcosa si rompe basta togliere una spunta. Vortex invece scrive dentro la cartella di Skyrim. Secondo: per il server tutti devono avere **la stessa identica configurazione**, e supportare due programmi diversi è un incubo. Terzo: MO2 gestisce i profili, così il setup del server resta separato da eventuali partite singleplayer moddate. Non devi disinstallare Vortex: basta rimuovere Skyrim dai giochi che gestisce.

**Devo scaricare SSEEdit / xEdit?**
No. È uno strumento da sviluppatori per modificare i file delle mod: serve a chi la modlist la **costruisce**, non a chi la usa.

**E SKSE? Le guide su internet dicono che serve sempre.**
Per questo pack no. Skyrim Together ha il suo launcher e nessuna delle 4 mod richiede SKSE. Se in futuro servirà, sarà nella guida aggiornata.

**Serve NexusMods Premium?**
No. Col gratuito i download partono dopo qualche secondo di attesa. Sono 4 mod piccole: pazienta.

**Steam mi ha aggiornato Skyrim. È un problema?**
Può esserlo. Per questo al punto 1.2 hai disattivato gli auto-update. Se per errore avvii da Steam e parte un aggiornamento, avvisaci su Discord prima di giocare.

**Posso giocare in italiano?**
Sì, la lingua non influisce sul multiplayer. Le mod restano in inglese (i testi di Alternate Start, ad esempio).

**L'antivirus blocca SkyrimTogether.exe.**
Normale: il launcher inietta codice nel gioco, come tutti i mod loader. Aggiungi un'eccezione per `C:\Modding\MO2`.

**Come funzionano i salvataggi?**
Il tuo personaggio vive nel tuo salvataggio locale: salva regolarmente come in singleplayer e non cancellare il salvataggio che usi per il server.

---

## Problemi Comuni

**"Non trovo SkyrimTogether.exe"**
È in `C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\`, non nella cartella di Skyrim.

**"Ho scelto l'eseguibile sbagliato al primo avvio"**
`Windows + R`, incolla e dai invio:
`C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\SkyrimTogether.exe -r`
Si riapre la finestra di selezione: scegli `SkyrimSE.exe`.

**"Address Library error" all'avvio**
Address Library non è installata o non ha la spunta in MO2. Controlla di aver scaricato il file "All in one".

**"Inizio sul carro di Helgen"**
Alternate Start non è attiva: controlla la spunta in MO2 e rilancia LOOT (Parte 5).

**"Il gioco non vede le mod"**
Stai avviando dal posto sbagliato. Sempre: MO2 → SkyrimTogether → Run.

**"Non riesco a connettermi al server"**
Verifica IP e password (copia-incolla, occhio agli spazi). Se ancora niente, il server è probabilmente offline: chiedi su Discord.

**"Vedo gli altri ma siamo desincronizzati / crash frequenti"**
Quasi sempre qualcuno ha mod in più o in meno. Confronta la lista MO2 con la Parte 4 e segnala su Discord.

---

*Versione bozza — beta amici. Per domande: Discord del server.*
