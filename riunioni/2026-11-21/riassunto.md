# Riunione del 21 novembre 2026 — riassunto

Partecipanti: David, Davide, Alessio, Giacomo
Durata: circa 1 ora (dalle 21:15 circa, dopo le chiacchiere iniziali) · Trascrizione completa: [trascrizione.md](trascrizione.md)

> Riassunto preparato da Claude a partire dalla trascrizione automatica. Se qualcosa non torna, correggetelo con una PR.

---

## ✅ Decisioni prese

1. **Priorità di adesso: rendere tutti operativi** (proposta di Davide, d'accordo tutti). Ognuno deve avere il materiale per lavorare e provare in gioco: Giacomo prova la nostra gamemode sul suo PC, Alessio inizia a lavorare con Claude e GitHub.
2. **Giacomo fa da tester.** Avvia sul suo PC un server SkyMP con la nostra gamemode, ci gioca e segnala quello che non va (es. un coniglio che nasce sotto il terreno, un gigante fuori posto). Davide consiglia di tenere un diario dei test con data e controlli fatti.
3. **Macro-argomenti uno alla volta.** Combat, job, leveling e abilità si affrontano uno per riunione: prima si raccolgono le idee, poi si decide cosa implementare e l'argomento si chiude (proposta di David).
4. **Lore e quest si scrivono a mano**, non con l'IA (Alessio, d'accordo David e Davide). Claude serve per codice, dati e lavoro ripetitivo.
5. **Le mod esterne non si usano direttamente in SkyMP**, ma se ne può riscrivere lo script nella nostra gamemode (Davide). Claude rifà da zero le parti protette da copyright.
6. **Ingredienti con una lore** (Davide): ogni ingrediente nasce dove ha senso (es. certi funghi solo in caverne buie e umide vicino all'acqua, il fiore di montagna blu nelle zone pianeggianti). Le piante sono comuni, non comuni, rare e leggendarie; per rare e leggendarie i luoghi non sono noti e vanno scoperti giocando. Il farming deve passare dal roleplay.
7. **Miniere escluse dalle zone degli ingredienti:** restano in sospeso perché servono all'economia che sta impostando Davide.
8. **Crafting di oggetti utili**, non centinaia di varianti (es. "non 700 anelli").
9. **Prossima riunione entro due settimane**, data da fissare.

## 📋 Cose da fare

| Chi | Cosa | Entro |
|---|---|---|
| David | **Zone degli ingredienti:** decidere dove nasce ogni ingrediente, con una lore. Lontano da forti degli orchi, accampamenti dei giganti e miniere; in zone "neutre". Partire da Discord e GitHub. | prossima riunione |
| David | **Launcher:** renderlo ancora più automatico. | prossima riunione |
| David + Giacomo | **Giacomo operativo:** installare SkyMP e far partire la nostra gamemode sul PC di Giacomo, magari in chiamata con condivisione schermo. David ha già mandato il link di SkyMP. | in settimana |
| Davide | **Dungeon:** lore, spawn di creature e ricompense per ogni dungeon, più la **modalità conquista del luogo** (script diverso per un party di 10 o di 9 e meno). | prossima riunione |
| Giacomo | **Crafting di oggetti non da guerra:** dall'elenco degli oggetti del gioco, scegliere quelli utili da craftare, divisi per categoria. Esempi: gioielleria, grimaldelli, cibo e bevande della locanda (stufato di cervo, spezzatino di coniglio…). David gli passa l'elenco di partenza. | prossima riunione |
| Alessio | **Partire con Claude e GitHub:** installare GitHub Desktop, scaricare il repo e aprire il progetto con Claude, insieme a David o Davide. Poi le idee su locanda e job. | in settimana |

## 🛠️ Cosa ha presentato Davide

- **Spawn degli animali completati**, testati e corretti (dettagli nei canali Discord e in `team/david/db/`).
- **Confini della mappa:** chi esce dalla zona di gioco riceve un avviso e viene invitato a tornare indietro.
- **Mappa pulita:** restano solo i luoghi funzionali, molti dei quali dungeon.
- **Accampamenti dei giganti** con lore diversa per Windhelm e Riften. Dita e zanne serviranno per pozioni importanti.
- **Comando `trasforma`:** uno staffer può impersonare un mob (gigante, troll, yeti, lupo mannaro, re dei vampiri, daedra…; il drago è ancora in prova). Utile per le quest.
- **Dungeon con lore** (es. una grotta che è la tomba dell'amico di chi l'ha scavata, scoperta da un libro trovato a terra) e prima versione della **conquista del luogo** da parte di un party.
- **Combat:** in SkyMP funziona già, anche tra giocatori (PvP). Davide ha reso la fisica dei colpi più realistica (es. un colpo in testa fa cadere in avanti, non vola via).
- Stima di Davide: siamo a circa il **60% del progetto** per iniziare con le one shot.

## 💡 Idee emerse (da valutare)

- **Lancio delle pozioni** (Alessio): una piccola mod che permette di lanciare le pozioni (es. acido) con una mano. Darebbe più gioco agli alchimisti. Si riscriverebbe come script.
- **Locanda viva** (Alessio): uno dei pochi edifici in cui entrare, con minigiochi e quest generate (anche casuali, es. "abbatti la creatura X") che i giocatori possono gestire da soli.
- **Minigiochi per i job** (Giacomo e Davide): fabbro con click a tempo o una barra; stalliere che cattura cavalli, li porta in scuderia e li vende dopo averli cavalcati almeno 30 minuti. Giacomo chiede se si possono prendere idee da minigiochi di altri giochi: Claude li rifarebbe da zero.
- **Bot Claude su Discord** (Davide): ticket di supporto tecnico in cui il giocatore parla direttamente con Claude.
- **Danni delle armi** (Giacomo): vanno sistemati arma per arma, nella riunione dedicata al combat.
- **Streamer per le one shot** (Davide). Se i giocatori crescono molto, si può valutare una terza città.

## ❓ Questioni aperte

- **Regole di SkyMP:** Davide si chiede se serva un'autorizzazione per aprire un server (come succede per altri giochi). David ha guardato: SkyMP è open source e non sembra chiederla, ma è da approfondire.
- **Marchio:** il fondatore di un altro server SkyMP ha consigliato a Davide di depositare il nome. Da valutare.
- **PvP:** per Davide il tema va affrontato quando ci sarà il launcher.
- **Data della prossima riunione:** entro due settimane, da fissare.

## 🔗 Impatto sul repo

- **Task chiuse:** T-005 e T-007 (pozioni e ingredienti fatti sul Discord, canali segnati ✅). T-006 (armi e armature): non se n'è parlato; la proposta è in `team/david/armi_armature.md`, da smussare.
- **Nuove task** in `TASKS.md` (T-008 → T-013).
- Confini e mappa pulita sono documentati in `team/davide/`. Per il comando `trasforma`, i dungeon con lore e la conquista del luogo non c'è ancora una documentazione nel repo.
- Le decisioni 4, 5 e 7 possono diventare voci di `DECISIONS.md` quando il responsabile dev lo conferma.
