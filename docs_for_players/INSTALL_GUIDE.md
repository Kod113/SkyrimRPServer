# Guida all'Installazione — Server RP Skyrim

> Benvenuto! Questa guida ti accompagnerà dall'acquisto del gioco fino all'entrata nel server.
> Segui ogni passo nell'ordine in cui appare. Non saltare nulla.
> Se hai problemi, vai alla fine del documento nella sezione **Problemi Comuni**.

---

## Cosa ti serve prima di iniziare

- Un PC con **Windows 10 o 11**
- Una connessione internet
- **Steam** installato sul tuo PC → scaricalo da [store.steampowered.com](https://store.steampowered.com) se non ce l'hai
- Una copia di **The Elder Scrolls V: Skyrim Special Edition** su Steam
  - ⚠️ Deve essere la versione **Special Edition**. Non funziona con: Game Pass, console, versioni piratate
  - L'Anniversary Edition va bene, ma disabiliteremo il DLC aggiuntivo (spiegato dopo)

---

## PASSO 1 — Disabilita l'Anniversary Upgrade (anche se non ce l'hai)

> Questo passaggio è necessario perché il mod multiplayer non funziona correttamente con il DLC aggiuntivo dell'Anniversary Edition.

1. Apri **Steam**
2. Vai nella tua **Libreria**
3. Trova **The Elder Scrolls V: Skyrim Special Edition**, fai clic destro → **Proprietà**
4. Clicca sulla scheda **DLC** (in alto nella finestra che si apre)
5. Se vedi **"The Elder Scrolls V: Skyrim Anniversary Upgrade"**, **togli la spunta**
6. Se la scheda DLC non esiste o è vuota, sei a posto — non hai quel DLC

---

## PASSO 2 — Avvia Skyrim almeno una volta

> Skyrim deve generare alcuni file di configurazione sul tuo PC prima che possiamo procedere.

1. Nella tua libreria Steam, fai clic destro su **Skyrim Special Edition** → **Gioca**
2. Si apre il launcher di Skyrim — clicca **Opzioni** e imposta la risoluzione al tuo schermo
3. Clicca **Gioca**
4. Quando il gioco si apre al menu principale, **chiudilo** — non devi giocare, basta avviarlo una volta

---

## PASSO 3 — Crea un account su NexusMods

> NexusMods è il sito da cui scaricheremo le mod. È gratuito.

1. Vai su [nexusmods.com](https://www.nexusmods.com)
2. Clicca **Register** in alto a destra
3. Crea un account (email + password)
4. Conferma l'email

---

## PASSO 4 — Installa Mod Organizer 2 (MO2)

> MO2 è il programma che gestisce le mod. È fondamentale: senza di esso le mod non funzionano correttamente.

1. Vai su [github.com/ModOrganizer2/modorganizer/releases](https://github.com/ModOrganizer2/modorganizer/releases)
2. Scarica il file che si chiama **Mod.Organizer-X.X.X.exe** (la versione più recente)
3. Avvia il file scaricato e installa MO2
   - Quando chiede dove installarlo, usa `C:\Modding\MO2` (crea la cartella se non esiste)
   - **Non** installarlo dentro `Programmi` o nella cartella di Steam
4. Al primo avvio, MO2 chiede per quale gioco configurarsi → seleziona **Skyrim Special Edition**
5. Lascia che trovi la cartella di Skyrim automaticamente → clicca **OK**

---

## PASSO 5 — Installa Address Library (dipendenza obbligatoria)

> Questa mod è richiesta da Skyrim Together Reborn per funzionare. Senza di essa il gioco non parte.

1. Vai su questa pagina: [nexusmods.com/skyrimspecialedition/mods/32444](https://www.nexusmods.com/skyrimspecialedition/mods/32444)
2. Clicca **Files** → poi clicca **Mod Manager Download** sul file principale
3. Se il browser chiede se aprire MO2, clicca **Sì / Apri**
4. In MO2, vai nella scheda **Downloads** (in basso a destra)
5. Fai doppio clic sul file scaricato → clicca **OK** → il mod appare nella lista a sinistra
6. Metti la **spunta** accanto ad "Address Library for SKSE Plugins" per abilitarlo

---

## PASSO 6 — Installa Skyrim Together Reborn

> Questo è il mod che ti permette di giocare in multiplayer con gli altri giocatori del server.

1. Vai su questa pagina: [nexusmods.com/skyrimspecialedition/mods/69993](https://www.nexusmods.com/skyrimspecialedition/mods/69993)
2. Clicca **Files** → poi clicca **Mod Manager Download**
3. In MO2, vai nella scheda **Downloads**
4. Fai doppio clic sul file scaricato
5. Apparirà un messaggio di avviso/errore — **ignoralo**, clicca la freccia verde, poi **OK**, poi **Ignore**
6. Il mod appare nella lista a sinistra → metti la **spunta** per abilitarlo

---

## PASSO 7 — Configura il launcher di Skyrim Together in MO2

> Questo passaggio dice a MO2 come avviare il gioco multiplayer. Va fatto una sola volta.

1. In MO2, in alto a destra c'è un menu a tendina con il nome dell'eseguibile (es. "SKSE" o "Skyrim Special Edition")
2. Clicca la **piccola icona a forma di ingranaggio** accanto al menu
3. Si apre la finestra "Eseguibili" → clicca il **+** per aggiungere uno nuovo
4. Compila così:
   - **Titolo:** `Skyrim Together Reborn`
   - **Binary:** clicca il pulsante con i tre puntini `...` e naviga fino a:
     `C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\SkyrimTogether.exe`
5. Clicca **OK**
6. Ora nel menu a tendina in alto a destra seleziona **Skyrim Together Reborn**

> 💡 Da questo momento in poi, per avviare il gioco usa **sempre** quel menu in MO2, non altri metodi.

---

## PASSO 8 — Prima esecuzione

1. In MO2, assicurati che nel menu a tendina sia selezionato **Skyrim Together Reborn**
2. Clicca il pulsante **Run** (il triangolo verde)
3. Al primo avvio apparirà una finestra che chiede di scegliere un eseguibile
4. ⚠️ **Importantissimo:** seleziona **SkyrimSE.exe** dalla cartella di Skyrim (es. `C:\Program Files (x86)\Steam\steamapps\common\Skyrim Special Edition\SkyrimSE.exe`)
5. Il gioco si avvia → arriva al menu principale → **chiudilo**

---

## Installazione completata ✅

Ora il tuo client è pronto. Passa alla guida **FIRST_LOGIN.md** per sapere cosa fare al primo accesso al server.

---

## Problemi Comuni

**"Non trovo SkyrimTogether.exe"**
Cerca in: `C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\`

**"Il gioco mi chiede di scegliere l'eseguibile ma ho scelto quello sbagliato"**
Premi `Windows + R`, incolla questo e dai invio:
`C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\SkyrimTogether.exe -r`
Si riaprirà la finestra di selezione.

**"Address Library error all'avvio"**
Significa che Address Library non è installata correttamente o non è abilitata in MO2. Controlla che la spunta ci sia nel Passo 5.

**"Il gioco non vede le mod"**
Stai avviando il gioco dal launcher sbagliato. Devi avviarlo **sempre da MO2** con il launcher "Skyrim Together Reborn" configurato nel Passo 7.
