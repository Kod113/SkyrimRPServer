# Task: mappa pulita (Reborn RP)

**Stato: Funzionante al 100%: testata e debuggata** (test in gioco del 15/11/2026, server `gm_v26`, client `cl_v19`, `mappa-config.json` v8) — davide

## Regole decise

1. **Luoghi tenuti** (lo schema "icone che restano" dei due feudi + i forti nanici): **si vedono sulla mappa e si entra**. Sono: capitali, paesi e insediamenti, miniere, grotte, rovine naniche (forti nanici), forti, torri, fortezze degli orchi, baracche, accampamenti di giganti. Vale per tutti quelli dentro i confini, anche quelli che lo schema disegnato aveva tolto per sbaglio.
2. **Luoghi tolti** (la lista in basso dello schema: tane di drago, accampamenti Manto della Tempesta/Imperiali, fattorie, mulini, segherie, pietre, rovine nordiche, torri nordiche, nave, rami incrociati, albero, figura alata... e ogni altro luogo estraneo allo schema): **non compaiono sulla mappa né sulla bussola**. Se hanno un dungeon, la porta è **chiusa a chiave** e guardandola compare **"Ti serve la chiave per aprire questa serratura"**.
3. **Tutto quello che sta fuori dai confini**: nascosto e chiuso a chiave. Uscendo dai confini compare in rosso: *"ATTENZIONE: torna nell'area delimitata della mappa. Stai entrando in una zona ad ALTISSIMO rischio permadeath, oppure in una parte di gioco ancora non implementata"* (sparisce quando si rientra).
4. **`sblocca_tutto`** (comando admin): fa **vedere sulla mappa tutti i luoghi tenuti**, anche quelli che l'admin non ha ancora scoperto. **Non apre nessuna serratura.** Scritto di nuovo, torna la mappa normale.
5. Come in Skyrim normale, un giocatore vede sulla mappa un luogo tenuto quando lo scopre (le capitali si vedono subito).

## Luoghi tenuti (73 marcatori)

| Tipo | Windhelm (nord) | Riften (sud) |
|---|---|---|
| Capitale (città + palazzo/castello) | 2 | 2 |
| Paese | 0 | 2 |
| Insediamento | 3 | 2 |
| Miniera | 4 | 1 |
| Grotta | 14 | 8 |
| Rovina nanica (forte nanico) | 5 | 1 |
| Forte | 6 | 4 |
| Torre | 2 | 3 |
| Fortezza degli orchi | 1 | 1 |
| Baracca | 2 | 3 |
| Accampamento di giganti | 5 | 0 |
| Stalle (luogo noto) | 1 | 1 |

L'elenco esatto (ID dei marcatori) è in `mappa-config.json`, chiave `keep`. Ci sono anche 3 luoghi tenuti che il gioco accende solo con una quest: le porte sono aperte ma il marcatore non viene forzato. Sono Ruunvald (Dawnguard) e i due Grandi Ascensori per Blackreach.

Luoghi tolti dentro i confini: 57 marcatori (rovine nordiche 10, accampamenti militari 9, tane di drago 6, punti di riferimento 4, fattorie 3, segherie 3, radure 3, e altri).

## Porte

- **552 porte chiuse a chiave** (livello 255): sono le porte dei luoghi tolti e quelle di tutto ciò che sta fuori dai confini. Sono chiuse anche dal server, quindi nemmeno un client modificato entra. `sblocca_tutto` non le apre, neanche per gli admin.
- **173 porte aperte**: tutte quelle dei luoghi tenuti, comprese le case e i negozi di Windhelm e Riften e le porte di Ruunvald, Redwater Den e Bthalft (Dawnguard).
- 73 porte di luoghi tenuti erano state chiuse dalle versioni vecchie: ora il client le riapre, ma solo quelle chiuse da noi (i lucchetti originali del gioco restano).

## Come è fatta

| Parte | Dove | Cosa fa |
|---|---|---|
| `mappa-config.json` (v8) | server | `keep` (luoghi tenuti), `hide` (marcatori da nascondere), `lock` (porte da chiudere), `reopen` (porte da riaprire), `capitali` (luoghi noti, sempre visibili: capitali e stalle), `hideParents` (18 "interruttori" degli accampamenti militari), `stubborn` (8 marcatori che il gioco non lascia spegnere: il client li sposta fuori mappa) |
| `gamemode.js` → `mappaHi` | server | Manda la config al giocatore quando entra |
| `gamemode.js` → `rbPortaChiusa` | server | Seconda chiusura delle porte, per tutti |
| `gamemode.js` → `sbloccatutto` | server | Solo admin: accende/spegne la vista admin della mappa |
| `skymp5-client.js` → `[RB-MAPPA]` | client | Nasconde i marcatori tolti, tiene accesi quelli tenuti, chiude/riapre le porte, mostra il messaggio della chiave, vista admin |
| `skymp5-client.js` → `[RB-CONFINI]` | client | Avviso fuori confini (poligono di 78 punti) |
| `skymp5-client.js` → `[RB-MAPPA-TEST]` | client | Test pilotati dal server |

Le liste sono state generate da Skyrim.esm e dai DLC. A ogni porta corrisponde il luogo di destinazione (record LCTN) e quindi il suo marcatore. Estratto del codice client: `team/davide/skymp-server/client-mappa-estratto.js`.

## Comandi

- In gioco (console, solo admin): `sblocca_tutto`
- Test automatici: si scrive una riga nel file `autotest-cmd.txt` (cartella del server). Il risultato esce in `autotest-result.txt`.
  - `mappa stato`: porte chiuse, marcatori nascosti, luoghi tenuti sulla mappa, fuori confini sì/no, messaggio chiave sì/no
  - `mappa sblocca 1` / `mappa sblocca 0`: accende/spegne la vista admin
  - `mappa porta <id>` / `mappa esci <id>`: prova a entrare/uscire da una porta
  - `mappa guarda <id>`: gira il giocatore verso una porta e dice se compare il messaggio della chiave
  - `fauna tp x y z`: teletrasporto

## Test effettuati in gioco (15/11/2026)

| Test | Risultato |
|---|---|
| Porte dei luoghi tolti | 552/552 chiuse |
| Cragslane Cavern (grotta, tenuta) | si entra e si esce |
| Ansilvund (rovina nordica, tolta) | chiusa; messaggio della chiave visibile a schermo |
| Ansilvund con `sblocca_tutto` acceso | resta chiusa (il comando non apre le serrature) |
| Luoghi tenuti, giocatore normale | 0 spenti; 11 già sulla mappa (capitali e luoghi scoperti), gli altri compaiono quando si scoprono |
| `sblocca_tutto` acceso | 67 luoghi tenuti sulla mappa (più le 4 icone delle capitali), visti anche a schermo; luoghi tolti sempre nascosti |
| `sblocca_tutto` spento | torna la mappa normale (11), capitali sempre visibili |
| Avviso fuori confini (ovest) | compare |
| Avvio del gioco | nessun blocco sulla schermata "Sweettaffy" in tutti i riavvii del 14 e 15/11 |

## Limiti noti

- Il **disegno** della mappa del mondo (terreno e icone stampate nella carta da Map.esp) resta quello originale. Si controllano i marcatori veri.
- Le **stalle** di Windhelm e Riften sono **luoghi noti** (job stalliere): sempre visibili sulla mappa per tutti, come le capitali. Quella di Riften però non compare, perché il client carica `SweetPie.esp` (mod del server pubblico "Sweettaffy"), che cancella il marcatore delle stalle di Riften e quello della città di Riften. Il server non carica SweetPie.esp: per sistemarlo va tolto dal client (da decidere).
- Spegnendo `sblocca_tutto`, i luoghi che l'admin non aveva ancora scoperto restano nascosti per lui fino al prossimo accesso. Riaccendendo il comando ricompaiono.
- I comandi di test (`mappa …`, `fauna tp`…) vanno tolti prima di aprire ai giocatori.
