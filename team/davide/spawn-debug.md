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
