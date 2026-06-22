# Primo Accesso al Server

> Hai già installato tutto seguendo la guida INSTALL_GUIDE.md?
> Bene. Questa guida ti accompagna dal primo avvio fino all'entrata nel server.

---

## PASSO 1 — Avvia il gioco SEMPRE da MO2

1. Apri **Mod Organizer 2**
2. In alto a destra, nel menu a tendina, seleziona **Skyrim Together Reborn**
3. Clicca **Run**

> ⚠️ Non avviare mai il gioco da Steam o dall'icona sul desktop. Solo da MO2, altrimenti le mod non vengono caricate e non potrai entrare nel server.

---

## PASSO 2 — Crea il tuo personaggio

1. Dal menu principale clicca **Nuova Partita**
2. Il gioco inizia con una cutscene su un carro — **non puoi fare nulla, è normale**
3. Aspetta che la sequenza finisca e il personaggio venga fatto scendere dal carro
4. Quando puoi muovere lo schermo e ti chiedono di inginocchiarti, sei nel momento giusto
5. Crea il tuo personaggio nell'editor (aspetto fisico, razza, ecc.)

> 💡 Scegli bene il nome e l'aspetto — sarà il tuo personaggio nel server RP.

---

## PASSO 3 — Salta la sequenza di Helgen con i comandi console

> Il server richiede che tu abbia completato l'intro di Helgen prima di connetterti.
> Per non doverla fare per intero, usiamo alcuni comandi che la completano istantaneamente.

**Quando usarli:** dopo aver creato il personaggio, quando sei in piedi a Helgen (non più sul carro).

1. Premi il tasto **`~`** (accento grave, in alto a sinistra della tastiera, sotto Esc)
   - Si apre una barra nera in basso allo schermo — è la console
2. Digita esattamente questo e premi **Invio**:
   ```
   setstage MQ102 160
   ```
3. Digita questo e premi **Invio**:
   ```
   enableplayercontrols
   ```
4. Digita questo e premi **Invio**:
   ```
   coc Riverwood
   ```
5. Premi **`~`** di nuovo per chiudere la console

Il personaggio verrà teletrasportato a Riverwood.

---

## Se qualcosa va storto

**Il personaggio rimane immobile dopo il teletrasporto**
Riapri la console con `~`, digita `enableplayercontrols` e premi Invio.

**Il personaggio "vola" e la telecamera è libera**
Hai attivato accidentalmente la telecamera libera. Riapri la console con `~`, digita `tfc` e premi Invio per disattivarla.

**La console non si apre**
Assicurati che la lingua della tastiera sia impostata su **Italiano** o **Inglese (US)**. Il tasto è quello in alto a sinistra sotto Esc.

---

## PASSO 4 — Salva la partita

1. Premi **F5** per fare un salvataggio rapido
2. Oppure vai nel menu di gioco → **Salva**

> Salva sempre prima di connetterti al server.

---

## PASSO 5 — Connettiti al server

1. Premi **F2** oppure **CTRL Destro** per aprire l'interfaccia di Skyrim Together
2. Clicca **Connect**
3. Inserisci:
   - **IP:** `[inserire IP del server]`
   - **Password:** `[inserire password del server]`
4. Clicca **Connect**
5. Sei dentro! Benvenuto nel server.

> 📌 IP e password ti verranno comunicati dallo staff tramite Discord.

---

## Regole fondamentali di gioco

- **Non connetterti mai durante la sequenza di Helgen** — solo dopo averla completata (o saltata con i comandi sopra)
- **Salva spesso** con F5, specialmente prima di entrare in un dungeon o fare una quest
- Per le quest, **segui le indicazioni del party leader** — vedi SERVER_RULES.md per i dettagli
- Se hai problemi tecnici, consulta TROUBLESHOOTING.md o chiedi aiuto su Discord

---

## Tasti utili in gioco

| Tasto | Funzione |
|---|---|
| `F2` o `CTRL Destro` | Apri/chiudi l'interfaccia di Skyrim Together |
| `F3` | Menu debug (per problemi tecnici) |
| `F5` | Salvataggio rapido |
| `~` | Console comandi |
