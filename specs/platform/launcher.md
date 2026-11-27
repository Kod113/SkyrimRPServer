# Launcher "Atronach RP": specifica

```
Autore:  david (con Claude)
Data:    1 novembre 2026 (aggiornata il 27 novembre 2026: v0.3, installazione automatica e grafica nuova)
Stato:   prototipo in client_pack/AtronachLauncher/ (v0.3 da provare su Windows)
```

## Obiettivo

Installare e avviare il gioco deve essere **facilissimo**, anche per chi non sa usare il computer. Il giocatore non deve mai aprire una cartella, modificare un file o capire cos'è SKSE.

**Percorso del giocatore:** scarica un file → doppio clic → segue i pulsanti finché è tutto verde → **GIOCA**.

## Perché serve

Gli ostacoli di oggi, tutti incontrati nello spike (`skymp_spike.md`):

| Ostacolo | Cosa vede il giocatore | Chi lo risolve nel launcher |
|---|---|---|
| Steam installa la 1.7.104, SkyMP vuole la 1.6.1170 | Il gioco non parte | Controllo 2 (per ora: guida + aiuto dello staff) |
| Gioco avviato come amministratore | Fermo sul caricamento con la musica, nessun errore | Controllo 4 + avvio corretto |
| Steam aggiorna Skyrim da solo | Un giorno smette di funzionare | Controllo 5 |
| Il launcher di SkyMP chiede sempre l'amministratore | Come sopra | Si usa solo per installare; si gioca dal nostro |
| Indirizzo del server e profilo da scrivere a mano in un file | Si collega al server sbagliato | Controllo 6 |
| Skyrim in una cartella diversa | Gli script non lo trovano | Ricerca automatica nelle librerie di Steam + "Indica la cartella" |

## Cosa fa il prototipo (v0)

Una finestra con 6 controlli. Ognuno è **verde** o **rosso**, e quando è rosso ha un pulsante accanto che lo sistema:

1. **Skyrim installato:** lo cerca in tutte le librerie di Steam. Se non lo trova, chiede la cartella e la ricorda.
2. **Versione 1.6.1170:** se è sbagliata spiega cosa fare e apre la guida. Per ora il downgrade resta assistito dallo staff (vedi "Decisioni aperte").
3. **SkyMP installato** (client e SKSE): se manca, apre skymp.net e spiega i 3 passaggi.
4. **Avvio senza amministratore:** toglie la spunta "Esegui come amministratore" da Steam, Skyrim, SKSE, SkyMP e MO2. Se Steam è aperto come amministratore, lo chiude (chiedendo prima).
5. **Steam non aggiorna Skyrim da solo:** imposta "aggiorna solo quando lo avvio" (chiude Steam se serve, chiedendo prima).
6. **Collegato al nostro server:** scrive indirizzo e porta nelle impostazioni del client, chiede una volta sola il numero di giocatore e salva una copia delle impostazioni originali.

Poi ci sono questi pulsanti:
- **GIOCA:** si attiva solo quando è tutto verde. Apre Steam se serve, aspetta che sia davvero pronto (accesso fatto e nessun aggiornamento di Steam in corso: non basta il valore nel registro, che può essere rimasto da una sessione vecchia) e avvia il gioco con SKSE (quindi con SkyMP), senza permessi di amministratore. Dopo l'avvio controlla che nel gioco sia caricato SKSE: se Steam l'ha riavviato senza, lo dice al giocatore invece di chiudersi.
- **Report per lo staff:** crea sul Desktop uno zip con l'esito dei controlli, il log del launcher, le impostazioni del client e i log del gioco.
- **Ricontrolla** e **Aiuto** (apre il Discord o la guida).

**Cosa salva sul PC:** solo in `%APPDATA%\AtronachRP\` (cartella di Skyrim scelta, numero di giocatore, log, copia delle impostazioni originali).

**Configurazione:** `config.json` accanto al launcher contiene nome, indirizzo e porta del server, versione richiesta, link della guida e del Discord. Quando cambia il server, si cambia solo questo file.

**Server personale (per i test del team):** `Imposta server.bat` scrive `%APPDATA%\AtronachRP\server.json` con indirizzo e porta, che hanno la precedenza su `config.json` solo su quel PC. Così chi entra nel server di un altro (es. Davide su quello di David via Tailscale) usa il launcher senza modificare file del repo. Con `usa_profile_id` il launcher imposta anche la modalità senza login (`master` vuoto).

## v0.3 (27 novembre 2026): grafica nuova + installazione automatica

La v0.3 unisce le due versioni fatte in parallelo: la **grafica** della finestra WPF (`finestra.xaml`, `risorse\`: sfondo, icona, carattere Cinzel, passi in colonna con il passo da fare evidenziato, avvisi e domande dentro la finestra) e la **logica** della v0.2 descritta qui sotto (downgrade, installazione di SKSE e SkyMP, numero di giocatore).

- Ordine dei passi: Skyrim installato → Steam non aggiorna Skyrim da solo → versione 1.6.1170 → avvio senza amministratore → SkyMP e SKSE installati → collegato al server.
- Il pulsante grande dice **SISTEMA TUTTO** finché manca un passo, poi **GIOCA**. Mentre il launcher lavora (download, downgrade) la barra di caricamento è accesa e gli altri pulsanti sono spenti.
- Il report per lo staff contiene anche la fine del log della console di Steam.
- L'Action del pacchetto copia nello zip anche `finestra.xaml` e `risorse\`.

## Cosa cambia nella v0.2 (27 novembre 2026): PC nuovo senza niente

Obiettivo: chi ha solo comprato Skyrim su Steam arriva a GIOCA senza aiuto dello staff.

- **Un solo pulsante:** finché c'è qualcosa di rosso il pulsante grande si chiama **SISTEMA TUTTO** e sistema i controlli dall'alto in basso. Si ferma al primo che resta rosso (per esempio se il giocatore risponde No), così si capisce dove si è bloccato. Il blocco degli aggiornamenti ora viene **prima** della versione, perché senza quello Steam rifarebbe l'aggiornamento.
- **Downgrade automatico (strada 2 qui sotto):** il launcher blocca gli aggiornamenti, apre la console di Steam e copia negli appunti il primo comando `download_depot`. Il giocatore fa Ctrl+V e Invio. Il launcher legge `Steam\logs\console_log.txt` per sapere quando il download è finito (se il log non c'è, aspetta che la cartella smetta di crescere), poi prepara il comando successivo. Alla fine copia i file nella cartella di Skyrim, sposta `ContentCatalog.txt`, controlla che la versione sia 1.6.1170 e cancella i file scaricati. I numeri di depot e manifest sono in `config.json`.
- **SkyMP e SKSE installati dal launcher:** scarica `skymp-client.zip` della stessa release del server (`jqntn-2026-10-05`) e lo estrae in `Data`, poi scarica SKSE 2.2.6 da skse.silverlock.org. Il launcher di skymp.net (che chiede l'amministratore) non serve più. Se il sito di SKSE blocca il download automatico, il launcher apre il sito e poi prende il file dalla cartella Download. Per i `.7z` usa `tar.exe` di Windows; se non basta, scarica `7zr.exe` (l'estrattore ufficiale di 7-Zip).
- **Stesso client per tutti:** il controllo "SkyMP e SKSE installati" è verde solo se c'è il client della versione scritta in `config.json` (file `atronach-skymp-client.txt` nella cartella di Skyrim). Chi aveva il client di skymp.net riceve quello del nostro server, e la sua password di rete viene spostata in AppData.
- **Numero di giocatore automatico:** al primo avvio il launcher genera un numero e lo mostra (il giocatore lo comunica allo staff). Chi aveva già un numero lo tiene.
- **Zip per i giocatori:** l'Action `.github/workflows/pacchetto_launcher.yml` crea `AtronachRP.zip` nella release `launcher` a ogni modifica della cartella su `main`. Link fisso: `https://github.com/Kod113/SkyrimRPServer/releases/download/launcher/AtronachRP.zip`.

**Cosa resta da fare al giocatore:** installare Skyrim da Steam ed entrare in Steam; "Esegui comunque" sull'avviso di Windows; 3 volte Ctrl+V e Invio nella console; rispondere Sì quando il launcher chiede di chiudere Steam; comunicare il numero di giocatore.

**Da verificare nel primo test su Windows:**
- che i 3 manifest della 1.6.1170 in `config.json` siano giusti (le guide di agosto–novembre 2026 concordano, una guida più vecchia riporta numeri diversi);
- che `console_log.txt` riporti "Depot download complete";
- che il download automatico da skse.silverlock.org funzioni;
- che il client `jqntn-2026-10-05` si colleghi al server locale anche sul PC di David, dopo lo spostamento della password del client ufficiale.

## Versione per i giocatori (v1, dopo il prototipo)

- **Un solo file `.exe`**, con installazione nel menu Start e un'icona sul Desktop, che si **aggiorna da solo**. Il prototipo è in PowerShell solo per provarlo in fretta, riusando gli script dello spike.
- **Login Discord** al posto del numero di giocatore, quando il server userà il login online.
- **Tasto "Ripara":** ricontrolla i file del client SkyMP.
- **Messaggi dal server:** "server spento", "manutenzione", novità.

## Rischi

- **Avviso di Windows "Windows ha protetto il PC"** per i programmi senza firma digitale. Le soluzioni sono un certificato di firma (a pagamento, ogni anno) oppure un'immagine nella guida che mostra "Ulteriori informazioni → Esegui comunque".
- **Downgrade alla 1.6.1170:** è il passaggio più difficile. I patcher su Nexus non si possono ridistribuire senza il permesso dell'autore. Verifica del 1/11/2026 (vedi sotto): SkyMP non supporta la 1.7.x, e non risultano lavori in corso per farlo.

## Verifica del 1/11/2026: SkyMP e la 1.7.104

- **Skyrim 1.7.104** è uscita su Steam il 27/08/2026. SKSE (2.3.1) e Address Library (v13) sono stati aggiornati lo stesso giorno: il resto del mondo del modding l'ha già adottata.
- **SkyMP:** la fork che usiamo per il server (`jqntn-2026-10-05`) dice esplicitamente *"Version 1.7.x does not work"*: il client supporta solo fino alla 1.6.1170 e vuole SKSE 2.2.6. Su `skyrim-multiplayer/skymp` l'ultima release è una pre-release di Skyrim Platform 2.6 (aprile). Tra le issue aperte non ce n'è nessuna sulla 1.7.104, e la più recente (26/10) è un crash di SkyrimPlatform 2.9.0 su AE.
- **Conclusione:** per i prossimi mesi il downgrade resta **obbligatorio**. Conviene investire per renderlo semplice invece di aspettare.

**Strade per renderlo semplice, dalla più semplice alla più complessa:**
1. **Patcher incluso nel launcher**, con il permesso scritto dell'autore: diventa un pulsante "Sistema" come gli altri. È la migliore per il giocatore, e bisogna solo chiedere.
2. **Console di Steam (`download_depot`):** è una funzione ufficiale di Steam che usa l'account del giocatore, quindi non c'è niente da ridistribuire. Il launcher apre la console, copia il comando negli appunti (il giocatore fa solo Ctrl+V e Invio), aspetta il download e copia da solo i file nella cartella di Skyrim. Bisogna verificare i numeri esatti dei depot e dei manifest della 1.6.1170.
3. **Downgrade guidato dallo staff** in chiamata Discord: è la soluzione di oggi e funziona, ma non regge con molti giocatori.
- **Aggiornamenti di SkyMP:** se il client ufficiale cambia versione (password diversa), il collegamento al nostro server smette di funzionare finché non aggiorniamo anche il server.

## Decisioni aperte

| Decisione | Priorità | Note |
|---|---|---|
| **Pacchetto delle mod per i giocatori** (oltre a quello di SkyMP) | 🟢 bassa | 1/11/2026: per ora i giocatori usano solo il pacchetto di SkyMP. Le alternative sono il launcher che scarica le nostre mod, Wabbajack o MO2; si decide più avanti |
| **Come fare il downgrade** | 🔴 alta | 27/11: implementata la **strada 2** (console di Steam) nella v0.2, da provare su Windows. Se la prova va bene, si registra come decisione |
| **Tecnologia della v1** (.NET, Tauri o Electron) | 🟡 media | Dopo il test del prototipo |
| **Firma digitale** | 🟢 bassa | Prima dell'apertura al pubblico |
