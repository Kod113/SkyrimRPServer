# Task: debug definitivo degli spawn (Reborn RP)

**Stato: punti verificati su Skyrim.esm; manca il giro di controllo a vista in gioco** (15/11/2026, server `gm_v27`, punti animali `terra-punti-v6.json`, pesci `pesci-punti-v2.json`) — davide

## Regole decise

1. I punti di spawn **non stanno vicino ai forti**: forti normali, fortezze degli orchi (Largashbur, Narzulbur) e forti nanici.
2. **Nessuna creatura nasce sotto terra.**
3. Gli spawn stanno su **terreno percorribile**. Le colline e il terreno ondulato vanno bene; vanno evitati i versanti di montagna e le pareti da scalare. In montagna vanno bene, purché lo spawn sia su un pianoro **raggiungibile facilmente a piedi**.
4. Ogni animale gira in un'area intorno al suo punto. Se esce dall'area ci torna **a piedi**, senza teletrasporto. L'IA è quella di Skyrim.
5. Loot identico a Skyrim, con le eccezioni già decise: niente tesoro e corna sempre (100%).
6. Animali delle nevi a Riften: sui **pianori più alti e raggiungibili** del feudo (sopra quota 14.000, monti Jerall).

## Come sono stati controllati i punti

Tutto viene letto da **Skyrim.esm**, non stimato:

| Dato | Da dove |
|---|---|
| Altezza vera del terreno (un punto ogni 128 unità, 11.186 celle di Tamriel) | record `LAND` (VHGT) di Skyrim.esm |
| Pendenza | calcolata dalla mappa delle altezze |
| Acqua (fiumi, laghi, mare) | altezza dell'acqua di ogni cella (`XCLW`) |
| Case, muri, palizzate, tronchi | 250.000 oggetti del mondo con le loro dimensioni (`OBND`) |
| Forti, fortezze orchi, forti nanici, luoghi sicuri | i 73 marcatori della mappa pulita, letti dal server (`verifica marcatori`) |
| Confini | il poligono di 78 punti del client (`[RB-CONFINI]`) |

Controllo della mappa delle altezze: sui punti dove Skyrim fa nascere gli animali, lo scarto mediano è di **5 unità**.

### Criteri per ogni punto animale

| Controllo | Regola |
|---|---|
| Punto | entro 400 unità, al massimo il 5% del terreno sopra ~31° (pendenza da scalata) |
| Area di movimento | al massimo il **10%** di pareti (sopra ~35°) dentro il raggio dell'animale; **20%** per gli animali di montagna (capra, gatti a sciabola, animali delle nevi), **35%** per gli animali delle nevi di Riften |
| Raggiungibile | il punto è collegato a piedi (pendenza sotto ~40°, niente acqua) al resto della mappa |
| Forti normali | centro area a più di 3.500 + raggio dell'animale |
| Fortezze degli orchi | centro area a più di 9.500 (zona gialla) + 1.500 + raggio dell'animale |
| Forti nanici | più di 3.000 + raggio |
| Luoghi sicuri (capitali, paesi, insediamenti, miniere, baracche, stalle) | più di 2.500 + raggio |
| Confini | punto dentro i confini, area intera dentro i confini |
| Sopra il punto | niente case, muri o tronchi; niente acqua |
| Quota | quella vera del terreno (mai sotto terra) |
| Distanza tra punti | almeno 3.000 tra due punti qualsiasi, 5.000 tra punti dello stesso animale |

Le soglie sono tarate sui punti dove Skyrim stesso fa nascere gli animali. I vecchi punti avevano in media il **32%** di pareti nell'area, quelli di Skyrim il **15%**: per questo cervi e conigli correvano sulle montagne.

## Cosa è cambiato

### Animali (`terra-punti-v6.json`)

- **149 punti** in tutto, con gli stessi numeri per animale e per feudo della mappa approvata.
- **27 tenuti** dove erano, **122 spostati** sul punto valido più vicino, nello stesso feudo e nello stesso tipo di terreno (neve / non neve). Lo spostamento medio è di circa 16.000 unità.
- I lupi e i lupi di ghiaccio (branchi da 3) hanno i 3 membri su punti piani vicini al capobranco.
- Problemi trovati sui punti vecchi, prima della correzione:
  - un gatto dai denti a sciabola a **98 unità dal Forte Greenwall**;
  - 7 punti dentro la zona di guerra di Narzulbur/Largashbur (l'area dell'animale entrava nella zona gialla);
  - **5 punti sotto terra** (l'orso peggiore era 8.400 unità sotto il terreno);
  - 3 aree che uscivano dai confini;
  - punti a ridosso delle stalle di Riften, di Riften stessa, di Goldenglow, di Shor's Stone e di Mistveil;
  - **145 punti su 149** su versanti o con montagne nell'area.

### Pesci macellaio (`pesci-punti-v2.json`)

Tolti 33 punti: doppioni (due punti sullo stesso posto, i pesci nascevano uno dentro l'altro), punti vicino alla baracca sul Fiume Bianco, a Darkwater Crossing e a Goldenglow, e un punto del Lago Honrich dentro la zona di guerra di Largashbur. Ogni zona ha ancora più punti del tetto (5 pesci).

| Zona | Prima | Ora |
|---|---|---|
| Fiume Bianco | 17 | 8 |
| Fiume Darkwater | 13 | 9 |
| Ruscello di Eastmarch | 18 | 10 |
| Fiume centrale del Rift | 10 | 10 |
| Lago Geir | 12 | 12 |
| Lago Honrich | 16 | 14 |
| Mare dei Fantasmi (riva) | 10 | 7 |
| Mare dei Fantasmi (largo) | 16 | 9 |

### Loot (verificato su Skyrim.esm)

| Animale | Prima | Ora |
|---|---|---|
| Gatto dai denti a sciabola (e delle nevi) | pelliccia + occhio + dente, sempre | pelliccia + **uno solo** tra occhio e dente (50% ciascuno), come la lista `LootSabrecatBodyParts` di Skyrim |
| Capra | pelle + carne | invariato: in Skyrim le corna di capra **non esistono** (il "50% corna di capra" in `team/david/db/loot.json` è un errore) |
| Tutti gli altri | — | già identici a Skyrim (meno il tesoro, corna al 100%) |

Prova in gioco (`fauna provaloot tutti`): 17 animali su 17 PASS, loot giusto sul cadavere e nell'inventario dopo il loot.

### Orchi dei forti

Controllati: le 80 posizioni osservate in gioco (`osserva-forti.json`) e tutti i punti di pattuglia stanno sopra il terreno. Nessuna modifica.

### IA (client `[RB-FAUNA]`)

Controllata, nessuna modifica: l'IA è quella di Skyrim. Fuori dall'area (raggio × 1,15) l'animale smette di combattere e torna a casa camminando (`pathToReference`, cioè la navmesh, con ripiego passo-passo); rientra sotto raggio × 0,9. Gli ostili scelgono il giocatore più vicino e lo tengono.
I rientri falliti dello storico (es. orso fermo a 5.900 unità) succedevano sui versanti, dove la navmesh manca. Con i punti nuovi in piano quella causa non c'è più.

## Sicurezze aggiunte nel gamemode

- Al caricamento, un punto animale la cui area entra nella zona di guerra di un forte orco viene **scartato** (con riga nel log).
- Cambio di versione dei punti (`F.ver = 8`, pesci `ver = 2`): gli animali e i pesci nati sui punti vecchi vengono tolti e rifatti.

## Comandi di prova nuovi (file `autotest-cmd.txt`)

- `verifica marcatori` → `verifica-marcatori.json`: posizione e tipo di tutti i marcatori della mappa, letti dal gioco
- `verifica loot` → `verifica-loot.json`: nome interno vero di ogni oggetto del loot
- `verifica id 6bc00,6bc01` → tipo e nome interno dei record indicati

## Test effettuati

| Test | Risultato |
|---|---|
| Controllo dei 149 punti animali su Skyrim.esm (tutti i criteri sopra) | 149/149 OK |
| Loot di tutti gli animali in gioco | 17/17 PASS |
| Caduta del personaggio su ogni punto (`fauna misura`): rocce sopra il punto | **non affidabile**: con 12 s di attesa il personaggio è ancora a mezz'aria nei punti lontani, e i teletrasporti in serie hanno fatto chiudere Skyrim una volta. Ora la prova salva ogni punto, riparte da un indice (`fauna misura 40`) e si ferma se il giocatore si scollega davvero |
| Da fare | giro a vista dei punti spostati (`fauna giro lista ...`) o passeggiata in gioco: verificare che nessun animale sia dentro una roccia |

---

## Aggiornamento 18–19/11/2026: confini del gioco, dungeon, accampamenti dei giganti (punti v8)

**Problema:** alcuni punti stavano dove il giocatore non può arrivare, perché il gioco ferma il giocatore con il messaggio "non puoi andare in quella direzione".
Il limite vero del gioco è la regione **`BorderRegionSkyrim`** di Skyrim.esm (REGN 0x000C5859, poligono di 173 punti). Il vecchio controllo usava i confini dei feudi disegnati da noi, non quel poligono, e per questo i punti sbagliati erano passati.

**Regole aggiunte a quelle di prima** (che restano tutte: terreno in piano, raggiungibile a piedi, quota vera, niente rocce sopra, niente forti o luoghi sicuri, stesso feudo, neve / non neve):
- il punto deve stare **dentro `BorderRegionSkyrim`**, e tutta l'area di movimento deve restare dentro con **1.500 unità di margine**;
- lontano dai **dungeon**: caverne, accampamenti di banditi, forti, rovine nordiche, rovine naniche, tane di drago. Distanza minima dal marcatore = area dell'animale + 2.000;
- lontano dagli **accampamenti dei giganti custom**: distanza minima dal centro = 7.000 × 1,15 (limite d'inseguimento) + 1.500 + area dell'animale;
- la regola della neve di Riften (sopra quota 14.000) ora vale anche per i punti già esistenti, non solo per quelli spostati.

**Risultato:** 108 punti tenuti, **41 spostati** sul punto valido più vicino:
- 17 erano fuori dal confine del gioco, quasi tutti animali delle nevi nell'estremo est di Windhelm;
- 17 erano vicino a un dungeon;
- 6 erano nel feudo sbagliato o sul terreno sbagliato (neve / non neve);
- 1 aveva una roccia sopra.

I lupi spostati hanno di nuovo i loro 3 membri del branco.
**Neve di Riften:** i pianori sopra quota 14.000 sono pochi e stanno vicino al confine sud e ai due accampamenti dei giganti dello Jerall. Per 3 animali non c'era posto con le distanze normali: per scelta di Davide sono stati messi **stretti sui pianori** (distanza minima 2.500 da altri animali e 3.000 dalla stessa specie, invece di 3.000 e 5.000).

| Animale | Feudo | Punto | Motivo | Spostato di (unità) |
|---|---|---|---|---|
| Coniglio | Windhelm | 1 | fuori dal confine del gioco | 48.747 |
| Coniglio | Windhelm | 3 | feudo sbagliato o terreno neve/non neve sbagliato (per la neve di Riften: sotto quota 14.000) | 21.287 |
| Coniglio | Windhelm | 6 | vicino a caverna 0x16273 | 7.186 |
| Coniglio | Riften | 3 | vicino a rovina nordica Angarvunde | 3.072 |
| Coniglio | Riften | 5 | vicino a rovina nordica ShroudHearth | 2.172 |
| Coniglio | Riften | 9 | vicino a caverna 0x16219 | 4.720 |
| Cervo | Windhelm | 4 | feudo sbagliato o terreno neve/non neve sbagliato (per la neve di Riften: sotto quota 14.000) | 10.571 |
| Cervo | Riften | 9 | vicino a caverna 0x16267 | 3.060 |
| Capra | Windhelm | 3 | vicino a caverna 0xb6046 | 1.846 |
| Capra | Windhelm | 5 | fuori dal confine del gioco | 49.611 |
| Capra | Windhelm | 8 | fuori dal confine del gioco | 41.688 |
| Capra | Riften | 0 | vicino a caverna 0x16243 | 1.144 |
| Capra | Riften | 2 | vicino a caverna 0x16267 | 3.114 |
| Capra | Riften | 5 | vicino a caverna 0x16243 | 5.345 |
| Volpe | Windhelm | 2 | vicino a caverna 0x16227 | 9.941 |
| Volpe | Windhelm | 3 | fuori dal confine del gioco | 58.147 |
| Volpe | Riften | 7 | vicino a caverna 0xf52d8 | 1.024 |
| Lupo | Windhelm | 3 | fuori dal confine del gioco | 61.655 |
| Lupo | Riften | 3 | vicino a caverna 0xf52d8 | 1.619 |
| Lupo | Riften | 5 | vicino a rovina nordica GeirmundsHall | 13.833 |
| Orso | Windhelm | 2 | vicino a caverna EldergleamSanctuary | 2.664 |
| Orso | Riften | 0 | vicino a caverna nightingaleCave | 2.610 |
| Gatto a sciabola | Windhelm | 3 | vicino a caverna StonyCreekCave | 22.678 |
| Gatto delle nevi | Windhelm | 0 | fuori dal confine del gioco | 31.532 |
| Gatto delle nevi | Windhelm | 1 | area oltre il confine del gioco | 13.604 |
| Gatto delle nevi | Windhelm | 2 | fuori dal confine del gioco | 32.325 |
| Lupo di ghiaccio | Windhelm | 0 | fuori dal confine del gioco | 38.522 |
| Lupo di ghiaccio | Windhelm | 1 | fuori dal confine del gioco | 39.596 |
| Lupo di ghiaccio | Windhelm | 2 | fuori dal confine del gioco | 42.096 |
| Lupo di ghiaccio | Windhelm | 3 | fuori dal confine del gioco | 35.546 |
| Lupo di ghiaccio | Riften | 2 | feudo sbagliato o terreno neve/non neve sbagliato (per la neve di Riften: sotto quota 14.000) — messo stretto sui pianori alti di Riften | 20.294 |
| Volpe artica | Windhelm | 0 | fuori dal confine del gioco | 25.290 |
| Volpe artica | Windhelm | 1 | fuori dal confine del gioco | 32.223 |
| Volpe artica | Windhelm | 3 | fuori dal confine del gioco | 26.076 |
| Volpe artica | Windhelm | 5 | vicino a caverna StonyCreekCave | 42.096 |
| Volpe artica | Riften | 0 | feudo sbagliato o terreno neve/non neve sbagliato (per la neve di Riften: sotto quota 14.000) | 102.720 |
| Volpe artica | Riften | 2 | feudo sbagliato o terreno neve/non neve sbagliato (per la neve di Riften: sotto quota 14.000) | 101.258 |
| Volpe artica | Riften | 3 | feudo sbagliato o terreno neve/non neve sbagliato (per la neve di Riften: sotto quota 14.000) — messo stretto sui pianori alti di Riften | 91.457 |
| Volpe artica | Riften | 4 | roccia/edificio sopra — messo stretto sui pianori alti di Riften | 1.639 |
| Orso delle nevi | Windhelm | 0 | fuori dal confine del gioco | 22.925 |
| Orso delle nevi | Windhelm | 1 | fuori dal confine del gioco | 26.426 |

**Pesci (v3):** tutti dentro il confine. È stato tolto il punto 0 del fiume Darkwater, che stava a 560 unità dall'ingresso di una caverna.
**Accampamenti dei giganti:** tutti i membri e i forzieri sono dentro il confine. I campi 3 e 4 (Jerall) sono a 2.250 e 4.700 unità dal confine: si raggiungono a piedi, ma il limite d'inseguimento dei giganti (circa 8.000 unità) sconfina oltre il bordo del gioco.

**Verifica finale (Skyrim.esm):** 149/149 punti OK con tutte le regole. Nessun punto fuori dal confine, vicino a dungeon o ad accampamenti dei giganti. Distanza minima tra due punti: 2.560 unità.
**Nel server (18/11, dopo il riavvio):** `[FAUNA] punti v8: … punti caricati: 149`, nessun punto scartato, 187 animali nati e al ciclo dopo `mancano 0`. Pesci v3 a 5 per zona; giganti: 4 accampamenti caricati.
Gamemode: `gm_v29` (legge `terra-punti-v8.json` con `F.ver = 10` e `pesci-punti-v3.json` con `ver = 3`).
Mappe in `mappe-spawn/01..13` rigenerate con i punti v8 e i pesci v3.


### Test in gioco dei punti v8 (19–20/11/2026)

**Prove automatiche (19/11), tutte passate:**
- `fauna stato`: 187 animali vivi su 187.
- `fauna prova` (nascita, uccisione, rinascita): 3/3.
- `fauna provaloot tutti`: 17/17. Il cervo è stato ripetuto da solo: al primo tentativo la finestra del loot era arrivata in ritardo.
- `fauna provatarget`: il lupo sceglie il giocatore più vicino e tiene il bersaglio.
- `fauna provaarea`: il cervo portato a 4.100 unità da casa rientra nella sua area in 60 s.
- `macellaio prova`: 5/5. La prova 3 segna FAIL per un errore della prova stessa: riusa il controllo "tutte le zone piene", mentre 0 pesci vivi è il risultato giusto.
- `giganti prova`: 26/27. Il FAIL "gigante oltre il limite segnato come torna indietro" nasce dalla regola del 18/11 che rimette subito a casa un gigante quando nessun giocatore è vicino; il comportamento è giusto, la prova è più vecchia della regola.

**Giro in gioco sui 41 punti spostati** (`fauna giro lista …`, dati in `osserva-fauna.json`):
- tutti i **41 punti** sono stati verificati con il gioco aperto: l'animale è nato sul suo punto ed è stato visto muoversi a terra, da 4 unità sotto a 100 unità sopra il terreno vero di Skyrim.esm. Nessun animale sotto terra o dentro una roccia;
- 3 animali (2 volpi e la capra 8 di Windhelm) sono usciti di poco dall'area perché scappavano; poi sono rientrati a piedi;
- Skyrim si è chiuso due volte durante i giri lunghi, dopo circa 20 teleport di fila. Il giro ora si ferma da solo se il giocatore si scollega, e i punti mancanti sono stati rifatti.

**Problema trovato e corretto: gli animali si uccidevano tra loro.**
In 30 minuti di giro sono morti 8 animali senza giocatori coinvolti:
- i lupi cacciavano capre e cervi;
- il gatto delle nevi 0 di Riften ha sterminato in 20 secondi il branco di lupi 3 di Riften, che sta a 2.560 unità;
- un orso delle nevi ha ucciso un altro predatore.

In 24 coppie di punti le aree di due predatori di specie diverse si sovrappongono. Per scelta di Davide (20/11): **gli animali del sistema non si attaccano mai tra loro, solo i giocatori**.
- **Correzione nel client** `skymp5-client.js` (`[RB-NOLOTTE]`, funzione `faunaAI`): se un animale del sistema ha come bersaglio un altro animale del sistema (giganti e mammut compresi), il combattimento viene fermato. Nel registro compare `[FAUNA] … niente lotte tra animali: combattimento con … fermato`.
- **Verifica:** dopo la correzione, 0 animali morti nel giro, e il lupo 3 di Riften e la capra 8 di Windhelm restano vivi.

**Aggiunte al giro di prova (gamemode `gm_v30`):**
- durante il giro gli animali non sono ostili e il personaggio torna sempre a vita piena (`global.__rbGiroProt`);
- il personaggio arriva 450 unità a sud dell'animale, così, guardando a nord, lo ha davanti;
- ogni arrivo è scritto in `autotest-result.txt`;
- il giro si ferma se il giocatore si scollega.
