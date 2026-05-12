# VISIONE DEL PROGETTO

> Documento fondazionale. Definisce **cosa stiamo costruendo e perché**. Cambia raramente; quando cambia, si annota in `DECISIONS.md`.

## Obiettivo del progetto

Il progetto ha come obiettivo la creazione di un **server RP persistente multiplayer** ambientato nel mondo di Skyrim, completamente reinterpretato in chiave **sandbox / sociale**.

Il gameplay **NON sarà basato sulla classica esperienza vanilla di Skyrim**, ma su un ecosistema **guidato interamente dai player**. Guardie, Jarl, Fabbri, Commercianti e ogni altro ruolo del mondo saranno **interpretati da persone reali e giocanti**, le cui scelte avranno conseguenze reali in-game.

### Esempio concreto

> Un gruppo di banditi (player) occupa la miniera di vetro a Dawnstar, bloccando il commercio.
> **Conseguenze:**
> - Prezzo del vetro alle stelle nella regione
> - Impossibilità temporanea di produrre armi in vetro
> - Eventuale scelta da parte dello Jarl (player) di mettere su un esercito per attaccare Dawnstar e riprendersela

Le scelte hanno peso, l'economia reagisce, la politica si forma dal basso.

## Il mondo sarà

- **Persistente** — il mondo continua a vivere anche quando un giocatore è offline
- **Player-driven** — niente NPC fissi che mandano avanti la trama
- **Economico/politico** — risorse, prezzi, alleanze emergono dalle azioni dei player
- **Realistico / survival / sociale** — fame, fatica, reputazione, relazioni contano
- **Con forte immersione RP** — interpretazione del personaggio prima della build ottimizzata

## Il server NON dovrà sembrare

❌ "Skyrim in coop"

✅ **"Un sandbox RP persistente costruito sopra Skyrim"**

Questa distinzione è cruciale per ogni decisione di design.

## Struttura del gameplay

Il mondo sarà **totalmente privo di NPC vanilla**. Gli NPC originali (cittadini, banditi, fauna, draughi nei dungeon, mercanti, guardie) verranno **rimossi o disabilitati** tramite mod custom. Eventuali eccezioni saranno definite in modo esplicito nella whitelist (vedi `DECISIONS.md`).

Il ruolo di ogni "abitante del mondo" sarà coperto da:
1. **Player giocanti** che interpretano quel ruolo (mercante, fabbro, jarl, bandito, ecc.)
2. **Sistemi RP custom** che simulano le conseguenze meccaniche delle loro azioni (economia, reputazione, politica)
3. **Staff/DM** che organizzano eventi e popolano temporaneamente situazioni specifiche

## Step 0 — Priorità della prima fase

La prima fase **NON sarà creare sistemi complessi**. La priorità è costruire fondamenta stabili. In ordine:

1. **Multiplayer stabile** — la connessione su Skyrim Together Reborn deve essere affidabile tra i player del team
2. **Mondo alleggerito** — niente carico inutile sul motore
3. **Rimozione NPC vanilla** — il mondo è vuoto, pronto per essere riempito dai player
4. **Disattivazione main quest e side quest** — niente narrativa precostruita che intralcia l'RP
5. **Prime città RP** — selezionare 1-3 città dove concentrare l'attività iniziale
6. **Sistema background iniziale** — i player partono con un'identità RP, non come "Dovahkiin che esce dalla fortezza"
7. **Prime mod custom** — sviluppare il primo set di mod proprietarie del server

Dettagli operativi e criteri di completamento di ogni punto sono in `STEP_0.md`.

## Architettura tecnica prevista

Il progetto è composto da tre macro-blocchi:

### 1. Server multiplayer
Basato su **Skyrim Together Reborn**. Tutti i player devono avere modlist, load order e versione del gioco **identici**.

### 2. Mod Framework RP custom
Sviluppato tramite:
- **Creation Kit** (editor ufficiale Bethesda)
- **Papyrus** (linguaggio di scripting di Skyrim)
- **SKSE64** (Script Extender)

Sarà una suite di mod proprietarie del server (NoNPCs, sistema background, economia, reputazione, ecc.) sviluppata progressivamente.

### 3. Modlist ufficiale distribuita
Pacchetto unico distribuito a tutti i player. Stessa modlist, stesso load order, stessa versione di Skyrim Special Edition. Distribuzione prevista tramite **Wabbajack** (fase futura).

## Anti-obiettivi (cosa NON vogliamo)

Esplicitati per non rincorrerli per sbaglio:

❌ Grafica ultra-moddata (texture 4K, ENB pesanti, ecc.) — non è la priorità
❌ 500 mod stratificate — instabilità garantita su STR
❌ Esperienza single-player potenziata — questo progetto è multiplayer-first
❌ Replica di MMO esistenti — vogliamo qualcosa di nuovo, non un clone

## Priorità assoluta

**Stabilità multiplayer + qualità del gameplay RP > tutto il resto.**

Ogni decisione tecnica si confronta con questo criterio. Una mod che migliora la grafica ma rompe la sincronia su STR si scarta. Una mod brutta visivamente ma che abilita un meccanismo RP profondo si tiene.
