# Spawn degli ingredienti (T-008)

**Autore:** david (con Claude) · **Data:** 27 novembre 2026 · **Stato:** pronto da provare in gioco
**Task:** T-008 in `TASKS.md` (riunione del 21/11). Ingredienti e habitat dal Discord: `#lista-ingredienti-alchemici` e `#dove-reperire-ingredienti`.

| Cosa | Dove |
|---|---|
| Database (ogni punto e ogni pianta, con coordinate) | `db/ingredient_spawns.json` |
| Mappe in stile Discord | `mappe-ingredienti/` |
| Modulo per il server di Davide | `ingredienti-spawn/` (istruzioni nel suo README) |
| Script che sceglie i punti / disegna le mappe | `db/tools/build_ingredienti_spawn.py`, `db/tools/disegna_mappe_ingredienti.py` |

## 1. Perché Davide vedeva delle piante nel mondo vergine

Il mondo vergine di Davide funziona così: le piante del gioco restano nel mondo, il **client le spegne** partendo da un elenco di basi (`HIDE_BASES` in `skymp5-client.js`) e il **server blocca la raccolta** (`[RACCOLTA]` in `gamemode.js`). Ho confrontato l'elenco con tutte le piante del gioco nei due feudi (5.472) e con tutte le basi raccoglibili del gioco (`raccolta-basi2.txt`):

1. **Manca la zucca** (`TreeGourdCluster01`, base `0xBE3E6`): **394 piante, quasi tutte nel Rift**, mai spente. È quasi sicuramente quello che ha visto Davide. Le altre basi mancanti sono le borse di monete (lasciate apposta) e le piante degli orti di Hearthfire (solo nelle case dei giocatori).
2. **Le piante lontane si vedono per qualche secondo.** Il client spegne le piante entro **7.000 unità** dal giocatore, ma il gioco ne disegna fino a circa 10.000. Da lontano, o andando a cavallo, le piante compaiono e spariscono quando ci si avvicina.

**Correzione** (nel client di Davide, è la sua cartella: la fa lui, vedi `ingredienti-spawn/README.md`): aggiungere `0xbe3e6` a `HIDE_BASES` e portare il raggio da 7000 a 12000.

## 2. Ingredienti e rarità

Lista confermata sul Discord: 20 piante e funghi spawnabili (sui 23 della lista), più il **Grano**, che serve alla pozione curativa base.

| Ingrediente | Rarità | Windhelm | Riften | Dove (lore) |
|---|---|---|---|---|
| Fiore di montagna blu, rosso, viola | comune | 10 ciascuno | 10 ciascuno | pianure e prati aperti, ai margini dei boschi |
| Lavanda | comune | 8 | 10 | zone aperte e soleggiate, lontano dalla neve |
| Cotone della tundra | comune | 10 | – | tundra di Eastmarch, distese aperte e ventose |
| Ramo di cardo | comune | 8 | 8 | campi aperti e radure |
| Bacche di neve | comune | 10 | 6 | neve: tundra innevata di Windhelm, pianori più alti del Rift |
| Bacche di ginepro | comune | 6 | 8 | montagne, rocce e altitudine |
| Uva jazbay | comune | 8 | – | sorgenti calde della tundra vulcanica |
| Lingua di drago | comune | 8 | – | rocce calde e fumarole della tundra vulcanica |
| Radice di canis | comune | – | 12 | colline rocciose e boschi del Rift |
| Pholiota squamosa | comune | – | 10 | tronchi e ceppi di pioppo caduti nei boschi d'autunno |
| Grano | comune | 6 | 6 | campi delle vecchie fattorie, cresciuto selvatico |
| Mora tapinella | non comune | 6 | 6 | ceppi di pino nelle foreste fitte e umide |
| Fungo luminoso | non comune | 4 | 4 | rive ombrose e umide, vicino all'acqua |
| Cappello bianco | non comune | 4 | 4 | sottobosco umido vicino a fiumi e laghi |
| Sgabello imp | non comune | 4 | 4 | pendii rocciosi e boscosi in quota |
| Corona sanguinante | **rara** | 2 | 3 | foreste fitte e scure, lontano dai sentieri |
| Amanita muscaria | **rara** | 2 | 3 | boschi d'autunno, sotto gli alberi più vecchi |
| Erba vescicante | **leggendaria** | 1 | 1 | un solo posto per regno, nascosto |
| Marciume di Namira | **leggendaria** | 1 | 1 | un solo posto per regno, nascosto |

**Totale:** 234 punti (Windhelm 118, Riften 116), 868 piante.
Ogni regno ha le sue specialità (uva jazbay, lingua di drago e cotone solo a Windhelm; radice di canis e pholiota solo a Riften): serve il commercio, come per le armi.

| Rarità | Piante per punto | Rinascita | Mappa |
|---|---|---|---|
| Comune | 4 | 30 minuti | pubblica |
| Non comune | 3 | 1 ora | pubblica |
| Rara | 2 | 3 ore | **solo staff** |
| Leggendaria | 1 | solo al riavvio del server | **solo staff** |

Rinasce solo la pianta raccolta, sullo stesso posto (come gli animali). Al riavvio rinascono tutte.

**Non spawnabili in natura:** Aglio, Mirriam del gelo e Orecchio d'elfo. Nel gioco esistono solo come mazzi appesi nelle case, non come piante. Si ottengono da mercanti, locanda e bottino; per farle crescere servirebbe un oggetto nostro nell'`.esp`.
**Funghi nelle grotte** (fungo luminoso, cappello bianco, sgabello imp, corona sanguinante, erba vescicante, marciume di Namira): per ora crescono all'aperto vicino all'acqua e nei boschi fitti. Dentro le grotte vanno messi insieme ai dungeon di Davide (T-011), perché servono le coordinate delle celle interne.

## 3. Come sono scelti i punti

- **Solo dove Davide ha già verificato tutto.** I punti stanno dentro le aree dei 149 punti animali (`terra-punti-v8.json`), entro l'85% del raggio. Quelle aree sono già controllate su Skyrim.esm: dentro i confini del gioco, terreno percorribile, lontano da forti, fortezze degli orchi, accampamenti dei giganti, miniere, dungeon e luoghi sicuri (`team/davide/spawn-debug.md`).
- **Quota vera.** 543 piante su 868 stanno esattamente dove il gioco aveva una pianta o un arbusto. Le altre 325 sono a 80–150 unità dal centro del punto, con la quota stimata dalle 3 posizioni vere più vicine (15 unità più in basso: meglio un po' interrate che sospese).
- **Lore.** Ogni ingrediente ha le sue regole: neve o no, tundra vulcanica, quota alta, vicino all'acqua, bosco fitto o zona aperta. Dove il gioco originale lo faceva crescere, quella zona ha la precedenza.
- **Distanze.** Stesso ingrediente: 3.500 (comuni), 5.000 (non comuni), 8.000 (rare). Ingredienti diversi: almeno 900. Rare e leggendarie: almeno 7.000 tra loro. Al massimo 4 punti nella stessa area verificata.

Per cambiare numeri, rarità o regole: si modifica `build_ingredienti_spawn.py`, si rigenera e si ridisegnano le mappe (comandi in fondo).

## 4. Mappe (`mappe-ingredienti/`)

- `00_tutti_pubblica.jpg`: comuni e non comuni, **si può mettere sul Discord**.
- `00_tutti_staff.jpg`: tutti i punti. **Solo staff.**
- `01`…`21`: una mappa per ingrediente, come quelle degli animali di Davide. Quelle di rare e leggendarie (18–21) hanno la fascia rossa "SOLO STAFF".

La mappa di base è ricostruita dalle mappe di Davide (togliendo i cerchi); la conversione da coordinate di gioco a pixel è ricavata dai suoi cerchi, con errore sotto il pixel.

## 5. Come si prova in gioco

Dopo l'installazione (`ingredienti-spawn/README.md`), nella cartella del server si scrive una riga in `ingredienti-cmd.txt`; il risultato esce in `ingredienti-result.txt`:
- `stato`: quante piante esistono e quante sono al loro posto;
- `vicino`: i 5 punti più vicini al giocatore;
- `tp ING-W-lavender-01`: porta il giocatore su un punto;
- `rifai`: spegne e ricrea tutte le piante.

**Da verificare nella prima prova:** che le piante compaiano al posto giusto (`stato`), che si raccolgano dando l'ingrediente, che rinascano dopo il tempo giusto, e a vista che nessuna sia sospesa o dentro una roccia.

## 6. Comandi (dalla cartella `db/tools/`)

```
python3 build_ingredienti_spawn.py ../../../..
python3 disegna_mappe_ingredienti.py ../../../..
python3 validate_db.py ..
```
- `python3`: l'interprete Python.
- `build_ingredienti_spawn.py`: sceglie i punti e scrive `db/ingredient_spawns.json` e la copia per il server in `ingredienti-spawn/`.
- `disegna_mappe_ingredienti.py`: disegna le mappe in `mappe-ingredienti/`.
- `validate_db.py ..`: controlla tutto il database, compresi gli spawn degli ingredienti.
- `../../../..`: la cartella principale del repo (quattro livelli sopra `tools/`); `..` è la cartella `db/`.
