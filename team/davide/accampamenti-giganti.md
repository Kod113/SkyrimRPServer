# Task: accampamenti dei giganti (Reborn RP)

**Stato: COMPLETATA — tutti e 4 gli accampamenti provati in gioco e funzionanti** (18/11/2026, gamemode g41 + client g8) — davide

## Lore

Dopo la grande guerra i giganti si sono rifugiati sulle montagne, lontani dall'uomo.

## Regole decise

1. **4 accampamenti**, 2 per feudo, sulle montagne, molto distanti tra loro.
2. Stesse regole degli spawn degli animali: terreno in piano e percorribile, niente pareti, mai sotto terra, lontani da forti e luoghi sicuri.
3. Gli **accampamenti di Skyrim sono nascosti** (5, tutti nella piana di Windhelm): i giganti stanno solo nei nostri.
   I nostri accampamenti sono **fatti come quelli di Skyrim** (tenda di pelli, fuoco, fumo, ossa, spiedi, obelischi, mucchi di fieno: 32 oggetti copiati da due accampamenti veri) e **sono visibili sulla mappa** (4 marcatori di Skyrim spostati sui nostri centri).
4. Ogni accampamento: **2 giganti + 3 mammut** (deciso il 17/11/2026; prima erano 3 + 4).
5. **Rinascita ogni ora e mezza** (deciso il 18/11/2026, prima ogni ora): rinascono solo quelli morti.
6. IA identica a Skyrim. Appena i giocatori entrano nell'area dell'accampamento (3.500 dal centro) i **giganti** attaccano e inseguono.
   I **mammut** (bestiame dei giganti) pascolano tranquilli: attaccano solo se colpiti o se un giocatore gli arriva entro 1.500.
   Lore: i giganti hanno sensi poco sviluppati: se ne colpisci uno da lontano, gli altri lontani non se ne accorgono (si possono attirare uno alla volta).
   Quando un gigante muore, dopo 5 secondi l'altro gigante attacca, ma solo se c'è ancora un giocatore dentro l'area dell'accampamento (cerchio pieno); chi è fuori dall'area non viene attaccato.
   Pull: colpendo da lontano (oltre 900 unità o con un incantesimo) reagisce SOLO la creatura colpita, che punta l'arciere/mago; gli altri non se ne accorgono.
7. Oltre il **limite di inseguimento** tornano indietro e, una volta tornati, hanno di nuovo **la vita piena** (anti-abuso).
8. Se un gigante o un mammut viene colpito da una freccia o da un incantesimo, punta l'arciere o il mago (sempre con il limite di inseguimento).
9. Vita: **gigante 200, mammut 250** (danno di Skyrim invariato: ~60 il gigante, ~65 il mammut, x1,5 i colpi potenti). Pensati per party: 5 giocatori in acciaio faticano molto, 10 sono avvantaggiati; da rivedere con lo skill tree.
10. Loot: quello di Skyrim senza mazza del gigante, zanna di horker e pelle di mucca (gigante: **da 1 a 3 dita di gigante** + pelli/zanne; mammut: carne + **da 1 a 2 zanne di mammut**; numeri casuali, deciso il 18/11/2026).
11. **Ricompensa: 2 forzieri per accampamento** (fuoco e tesoro, proposta di `team/david/db/spawn_rules.json` → `giant_camps`), ricaricati e richiusi **appena i giganti e i mammut di quell'accampamento tornano in vita** (stesso ciclo di 1 ora e mezza; se in un accampamento non è morto nessuno, i suoi forzieri restano come sono).
    - Sono **chiusi a chiave, serratura media** (livello 50, Esperto): serve un **grimaldello**.
    - Appena un giocatore prova a forzare la serratura, **uno dei due giganti vivi lo prende di mira e lo attacca** (anti power-play).
    - In pratica: **il reward lo hai quando pulisci l'accampamento** (anche i mammut: i forzieri sono a meno di 1.500 da loro).

## Accampamenti (mappa: `mappe-spawn/14_giganti.jpg`)

Punti e quote **veri**, letti dal terreno di Skyrim.esm (comando `giganti esm`). Ogni membro ha il suo posto (2 giganti ad anello da 450 attorno al centro, 3 mammut ad anello da 1.000) con la sua quota: dettagli in `skymp-server/giganti-punti.json`.

| # | Nome | Feudo | x | y | z | Pendenza massima dei posti |
|---|---|---|---|---|---|---|
| 1 | Altopiani di nord-ovest | Windhelm | 100096 | 49920 | -5648 | 22.2° |
| 2 | Monti del confine | Windhelm | 207104 | 14592 | -2520 | 13.6° |
| 3 | Pendici dello Jerall (ovest) | Riften | 84736 | -106752 | 18048 | 19.1° |
| 4 | Pendici dello Jerall (est) | Riften | 180992 | -123904 | 12208 | 10.1° |

Controlli (terreno vero e marcatori veri):
- tutti e 4 raggiungibili a piedi dalla pianura (pendenze sotto i 35 gradi), con il centro in piano;
- luoghi tenuti a più di 12.000 unità, fortezze degli orchi a più di 25.000, confine a più di 9.000;
- i due accampamenti dello stesso feudo distano circa 100.000 unità.

La prima proposta (15/11) era stata stimata senza il terreno vero: con Skyrim.esm è risultata su versanti ripidi (pendenze di 45-65 gradi), quindi i punti sono stati spostati nelle stesse zone, sul piano più vicino.

## Come è fatta

| Parte | Dove | Cosa fa |
|---|---|---|
| `giganti-punti.json` | server | i 4 accampamenti con i 7 posti ciascuno (quote vere) |
| `gamemode.js` → blocco `ACCAMPAMENTI DEI GIGANTI [gm_v28]` | server | nascita all'avvio (dopo 45 s), poi ogni ora e mezza solo i morti; 2 nascite alla volta |
| `gigControlla` (ogni 2 s) | server | **area d'attacco 3.500**: finché nessuno entra pascolano (IA di Skyrim); appena un giocatore entra, quell'accampamento passa ad "attacco a vista" (tipo 2 di `rbFauna`); quando nessun giocatore è più entro il limite tornano tranquilli. Chi esce oltre ~8.000 torna a piedi e, arrivato, riprende la vita piena |
| `__rbGigHit` (pacchetto `rbGodHit`) | server | colpo da più di 900 unità o con un incantesimo: quel gigante/mammut lascia il "più vicino" e reagisce come in Skyrim contro chi l'ha colpito, finché l'arciere/mago resta entro il limite (max 60 s dall'ultimo colpo) |
| `rbFauna` (già nel client) | client | riporta a casa oltre il limite; l'ostilità ora si manda per singolo animale |
| `mappa-config.json` v10 | server | nascosti gli oggetti dei 5 accampamenti di Skyrim; i loro 4 marcatori mappa (90661, 90682, 90716, 90823) spostati sui nostri centri (`mv`); 970630 resta nascosto |
| `giganti-decor.json` + `gigDecor` | server | 32 oggetti per accampamento (128 in tutto), piazzati una volta sola e tenuti tra un riavvio e l'altro (`giganti-decor-ids.json`) |
| `gigForzieri` + `giganti-forzieri.json` | server | 2 forzieri per accampamento, riempiti/richiusi quando rinascono le creature del loro accampamento |
| serratura (`rbGigForzieri`, `rbGigScasso`, `rbGigAperto`) | server + client | il client tiene i forzieri chiusi al livello 50; il server rifiuta l'apertura finché non è scassinato; tentativo di scasso → un gigante vivo prende di mira il giocatore; i grimaldelli rotti vengono tolti anche sul server |
| `terra-punti-v7.json` | server | come v6, ma volpe artica Riften 4 e alce Riften 2 spostati lontano dagli accampamenti G3 e G4 |

## Comandi admin

Console in gioco (tasto `\`):
- `evoca_vaigiganti_1` … `evoca_vaigiganti_4`: ti porta a 4.500 unità dal centro dell'accampamento (fuori dall'area d'attacco)
- `evoca_giganti_0`: quanti giganti e mammut sono vivi per accampamento
- `evoca_giganti_1`: fa rinascere subito i morti

File `autotest-cmd.txt` del server: `giganti stato`, `giganti ciclo`, `giganti esm` (rilegge il terreno vero attorno agli accampamenti).
Prove in gioco (col giocatore collegato): `giganti tp <campo> <distanza>`, `giganti stato2 <campo>`, `giganti colpisci|ferisci|uccidi <campo> gigante|mammut <n>`, `giganti tpforziere <campo> fuoco|tesoro`, `giganti dai a <n>` (grimaldelli), `giganti inv <id hex>` (contenuto e serratura di cadavere/forziere), `giganti scassina <id hex> <rotti>`, `giganti decorspegni|decoraccendi`.

## Test effettuati

| Test | Risultato |
|---|---|
| Sintassi del gamemode (`node --check`) | OK |
| Lettura del terreno da Skyrim.esm sul server | OK: 2.580 celle, bordi tra celle continui |
| Caricamento a caldo e nascita (punti v2, quote vere): 28 su 28 vivi | OK |
| Prova completa `giganti prova` (17/11, 27 controlli: nascita, vita, loot, rinascita, area, mammut, limite, vita piena, vendetta, pull) | 27 su 27 PASS |
| **Prove in gioco del 17/11** (accampamento 1, giocatore ID 1 ADMIN) | |
| Fisica: creature appoggiate al terreno, non sotto terra (scarto 2-30 unità) | OK |
| Accampamento tranquillo col giocatore a 4.000-5.000 | OK |
| Giocatore dentro l'area (3.000): i giganti attaccano subito (57 danni a colpo, morto in 2 colpi) | OK |
| Pull: colpito un gigante da lontano → solo lui insegue il giocatore, gli altri e i mammut restano calmi | OK |
| Limite di inseguimento: giocatore a 9.500 → il gigante torna al suo posto con vita piena | OK |
| Vendetta: un gigante muore col giocatore fuori area → l'altro resta fermo | OK |
| Loot: gigante (dito, pelle di lupo, granato, oro, ferro), mazza tolta; mammut (carne + zanna) | OK |
| Decorazioni (tenda, fumo, treppiede, forzieri) e marcatore sulla bussola | OK |
| Forziere: chiuso, menu di scasso "Serratura: Media", il server rifiuta l'apertura senza scasso | OK |
| Scasso riuscito → il forziere si apre: 400 oro + ametista + rubino; dopo il prelievo è vuoto sul server | OK |
| Grimaldelli rotti tolti anche sul server (13 rotti → tolti) | OK |
| Ciclo orario: 5 creature rinate, 8 forzieri riempiti e richiusi | OK |
| Gigante che prende di mira chi scassina | verificato lato server (`giganti prova`); in gioco non separabile, perché chi arriva ai forzieri con i giganti vivi è già dentro l'area d'attacco |
| Accampamenti 2-4 | quote controllate dal server (creature a +60 dal terreno vero); visita in gioco non fatta (i teletrasporti lunghi di prova bloccano il caricamento) |

## Problemi trovati nelle prove e corretti

1. **Gigante "abbandonato"**: se il giocatore scappa e nessun client guida più il gigante, restava fermo dove era con metà vita. Ora, quando nessun giocatore è vicino, chi è lontano da casa viene rimesso al suo posto e tutti tornano a vita piena.
2. **Grimaldelli infiniti**: durante lo scasso il server rimandava l'inventario e i grimaldelli rotti ricomparivano. Ora il client conta i grimaldelli rotti e li tiene rotti; alla chiusura il server li toglie.
3. **Loot con morte "finta"**: se la creatura muore senza la valutazione del bottino di Skyrim, il server aggiunge lui il bottino di Skyrim (dito + parti per il gigante, carne + zanna per il mammut).
6. **Forziere aperto senza scasso**: quando il gioco ricreava il forziere (spostato, oppure il giocatore si allontanava e tornava) il client lo credeva scassinato e il server lo apriva a tutti. Ora il client lo richiude e basta, e il server accetta l'apertura solo da chi ha davvero aperto il minigioco di scasso (anti-abuso provato: `giganti scassina <id> 0 senza` → resta chiuso).
5. **Area dopo un pull**: se un gigante era già stato attirato da lontano, entrando nell'area gli altri non si attivavano (il controllo guardava solo il primo). Corretto.
4. **Client più robusto**: un oggetto del mondo che dà errore non blocca più il caricamento degli altri (giganti e mammut compresi).

## Prove di tutti e 4 gli accampamenti (17/11, pomeriggio)

| Prova | Campo 1 | Campo 2 | Campo 3 | Campo 4 |
|---|---|---|---|---|
| Creature caricate, appoggiate al terreno | OK | OK (scarto 6-30, dopo lo spostamento) | OK (scarto 0-19) | OK (scarto 0-29) |
| Tranquilli col giocatore fuori area | OK | OK | OK | OK |
| Pull: solo il gigante colpito reagisce | OK | OK | OK | OK |
| Giocatore nell'area: attaccano | OK | OK | OK | OK (dopo la correzione 5) |
| Loot (dito, pelli, gemme; mazza/pelle di vacca tolte; mammut carne + zanna) | OK | OK | OK | OK |
| Forzieri chiusi (livello 50) e pieni | OK | OK | OK | OK |
| Decorazioni e icona sulla mappa | OK | OK | OK | OK |

**Campo 2 spostato (18/11/2026) — posizione definitiva 154250 / −41000, quota +1580 ("Monti del confine")**, sui monti tra Windhelm e il Rift, feudo di Windhelm. Tentativi scartati:
1. 207104 / 14592: la zona est di Windhelm (oltre x ~165.000 all'altezza di y ~15.000) non si carica in SkyMP (schermo nero), anche con i client vecchi e senza decorazioni.
2. 157750 / −30750: cozzava con 4 spawn di animali (cervo, 2 tigri dai denti a sciabola, alce).
3. 105750 / −49250: dentro un laghetto di montagna (acqua a −500, terreno a −588).
4. 70500 / 25250: a 1.266 dal bordo della mappa, raggiungibile in piano solo da fuori dai confini.

Il punto scelto è l'unico che rispetta tutte le regole insieme: zona che si carica; asciutto (controllata l'acqua di ogni cella da Skyrim.esm, `giganti acqua` → `giganti-acqua.json`); raggiungibile a piedi da dentro i confini (percorso da Darkwater Crossing con pendenze sempre sotto i 30°); a 49 km dal bordo della mappa; in montagna; nessuno spawn di animali che entri nella zona di inseguimento (8.050 + raggio dell'animale, margine 5.400); feudo di Windhelm; lontano dai forti orchi. Unico compromesso: una miniera a ~5.200 dal centro (1.700 fuori dall'area d'attacco).

**Controlli da fare SEMPRE quando si crea o sposta un accampamento/spawn:** zona caricabile in gioco, acqua, raggiungibile a piedi da dentro i confini, distanza dal bordo, spawn degli animali, forti, luoghi della mappa.

Nota sul pull: se l'arciere sta su rocce che il gigante non può raggiungere, il gigante entra in combattimento ma non arriva (comportamento di Skyrim, non un errore).

## Limiti noti

- Il server si fida del client sul "serratura scassinata" (come per il resto del minigioco di Skyrim).
- Il client prende in carico giganti e mammut entro circa 4.000-4.500 unità: più lontano restano fermi (normale in SkyMP).

## Modifiche del 18/11/2026 (gamemode g41)

| Modifica | Prova | Esito |
|---|---|---|
| Rinascita ogni ora e mezza (`GIG_CICLO_MS` = 90 minuti) | timer del server | OK |
| Forzieri ricaricati solo negli accampamenti dove qualcuno è rinato | uccisi animali nei campi 3 e 4, poi ciclo: 9 rinati, 4 forzieri riempiti (campi 3 e 4), campi 1 e 2 invariati | OK |
| Dita di gigante da 1 a 3 | giganti uccisi: 1, 2, 2 dita | OK |
| Zanne di mammut da 1 a 2 | mammut uccisi: 1 zanna (il numero è casuale) | OK |
| Correzione: il loot del mammut non veniva riconosciuto (alla morte la fauna lo toglie subito dalle liste); ora i mammut degli accampamenti sono registrati alla nascita | log `[GIGANTI] loot ...: zanne di mammut` | OK |

