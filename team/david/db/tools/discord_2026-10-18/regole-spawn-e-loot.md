# Discord Atronach RP: regole di spawn e loot (canali del 18 ottobre 2026, autore Dave_St)

Riassunto fedele, letto il 20 ottobre 2026. Serve come fonte per `build_loot_spawn.py`: i numeri qui sono quelli scritti nel Discord.
Immagini e mappe allegate nei canali non sono state copiate.

## #funzione-e-info-generali (03:27-03:29)

**Spawn (evocazione staff), descritto come già funzionante sul server:**
- Lo staff scrive un comando nella console e la creatura appare davanti a lui; da 1 a 10 creature per comando.
- Le creature evocate spariscono al riavvio del server. Il cadavere sparisce dopo 30 secondi.
- I mostri umani (banditi, maghi, vampiri, Thalmor…) sono ostili anche verso chi li evoca.
- Comandi di prova spenti: restano solo `evoca_` e `evoca_pulisci_1`.

**Loot:**
- Si apre la finestra di loot di Skyrim con E; R = "Prendi tutto". Il server registra ciò che il giocatore prende.
- Loot = liste ufficiali di Skyrim, con le percentuali dei canali #animali-e-loot e #mob-mostri-e-loot.
- Nomi in italiano.
- Pellicce (lupo, volpe, orso, gatto dai denti a sciabola) ora visibili: corretto `CombatSettings.esp`. **Tutti i giocatori devono avere il `CombatSettings.esp` aggiornato.**

**Niente oggetti magici nel loot (regola importante, voluta):**
- Gli oggetti magici e incantati li dà lo staff con le quest.
- Oggetto incantato → versione normale (es. Antico spadone nord del ghiaccio → Antico spadone nord; Vesti del vampiro di Distruzione → Vesti del vampiro; Vesti nere del mago incantate → Vesti nere).
- Se non esiste la versione normale, l'oggetto non compare.
- Tolti del tutto: bastoni, pergamene, tomi di incantesimi, gemme dell'anima (tutte), mazza del gigante del gelo (era incantata).
- Il server controlla l'inventario della creatura quando nasce, quando muore e quando si apre il loot. Tabella delle sostituzioni: `magic-swap.json` nella cartella del server.
- Le pozioni restano (sono alchimia).

## #come-leggere-le-percentuali (03:38-03:39)

- Percentuale = probabilità di trovare almeno uno di quell'oggetto, dai dati ufficiali, personaggio di livello ~30.
- "fino a N" = quantità massima (oro). "es." = oggetti più probabili della categoria. "Indossa" = vestiti indossati, sempre lootabili. "100%" = garantito.
- Il livello cambia soprattutto l'arma (draugr: antica → affilata → ebano), l'oro dei banditi predatori (fino a 125) e i bastoni dei maghi di alto livello. Differenze maggiori tra bandito debole e forte: con regole nostre (fase successiva).
- Oggetti "non giocabili" restano nascosti: capelli e barba dei draugr, Elmo nord antico, Scudo spriggan.
- Carne umana (licantropi): prevista dal gioco, si tiene; si toglie con una riga se non la si vuole.
- Draghi: solo evento staff, niente spawn automatico.
- Economia "less is more": licantropi, troll, mammut, chaurus, megere, spettri danno solo materiali (oro 3%).

## #mappa-che-vedranno-i-player (04:12)

- Sulla mappa solo 4 tipi di luogo: **capitale, paesi e insediamenti, miniere, baracche**. Sono i **luoghi sicuri** (rifocillarsi, curarsi, riposare, fare RP).
- Grotte, forti, rovine, torri e accampamenti non compaiono più sulla mappa (ma esistono nel mondo).
- La mappa mostrata è orientativa; la versione definitiva arriverà in gioco.

## #spawn-linee-generali (04:41-04:43)

Motto: less is more. I numeri sono una prima proposta da confermare in gioco.

**Zone → animali:**
- Montagna → capre, lupi, orsi, gatti dai denti a sciabola (pochi)
- Pianura → cervi, conigli, volpi, qualche lupo
- Tundra innevata → lupi di ghiaccio, volpi artiche, orsi delle nevi
- Bosco di pioppi → cervi, alci, conigli, orsi, lupi rossi
- Bosco di pini → cervi, alci, volpi, lupi, orsi
- Pozze di zolfo → capre e qualche gatto dai denti a sciabola (zona povera)
- Lago → granchi di fango e pesci macellaio
- Mare → horker lungo la costa
- Accampamenti dei giganti → mammut

**Gruppi:** specie, quanti (es. 8), dove (punto + raggio), nome (es. `cervi_pianura_nord`). Il server conta vivi e mancanti.
- Nascono dentro la zona del gruppo, mai in città, paesi, miniere o baracche (luoghi sicuri).
- Non nascono davanti ai giocatori: se qualcuno è vicino, il server aspetta.
- Alla partenza del server nascono tutti; dopo un riavvio tutto sparisce e ricomincia da capo.

**Respawn:** controllo ogni ora; rinascono solo quelli morti (né prima, né di più).

**Mammut:** ogni accampamento ha un pascolo (cerchio): 5 mammut al pascolo, 2 punti dove ogni ora nascono 2 mammut se ne mancano; i mammut restano nel perimetro (se escono, si fanno tornare).

## #lore-e-spawn-giganti-e-mammut (04:37-04:53)

- 2 accampamenti per feudo. Nel gioco originale 3 a Windhelm e 0 a Riften: se ne tengono 2 a nord, se ne aggiungono 2 a mano a sud.
  - Windhelm 1 (pianura a ovest): x 92400, y -5400
  - Windhelm 2 (pozze di zolfo): x 143500, y -10000
  - Windhelm riserva: x 111700, y -14300 (esiste, tenuto spento)
  - Riften 1 (pianura a est, ai piedi dei monti, nuovo): x 178600, y -72300
  - Riften 2 (pianura a ovest, nuovo): x 99800, y -85100
  - z da leggere in gioco; posizioni da verificare camminando.
- Ogni accampamento: 3 giganti vicino al fuoco, 5 mammut nel perimetro, 2 punti di nascita (2 mammut/ora se mancano), forzieri vicino al fuoco, campo con fuoco, teschi e zanne. Perimetro: cerchio di circa 8.500 unità di raggio.
- Tre giganti insieme = incontro per un gruppo organizzato.
- Loot del gigante (liv. ~30): sempre Dito di gigante e carni varie; Oro 86% (fino a 300), Parti di creatura 53% (es. Zanna di mammut 5.6% x3), Armature e abiti 37%, Armi 34%, Gemme 22% (Ametista 3.5%, Zaffiro 2.8%, Smeraldo 2.8%, Rubino perfetto 2.8%), Frecce 4%. Il gigante del gelo (liv. 50) solo come creatura evocata dallo staff.
- Loot del mammut: sempre Proboscide e Zanna; piccolo tesoro 10% (oro 1-9 circa 4%, gemma circa 0.5% ciascuna, anello d'argento circa 0.8% ciascuno). Il respawn orario dei mammut è la fonte sicura di zanne e proboscidi.
- **Forzieri (proposta, 2 per accampamento):**
  - Forziere del fuoco: sempre 3 Ciotole di formaggio di mammut, 2 Zanne di mammut, 2 Dita di gigante, Oro 250; Pozione di cura x2 45%, Carne cruda/cotta x3 60%, Pelli (cervo, lupo) x2 40%.
  - Forziere del tesoro: sempre Oro 400 e 1 gemma; 2ª gemma 50%, Diamante 10%, Lingotti d'acciaio x3 40%, Anello d'argento 15%, Pozione di resistenza al freddo 30%.
  - Niente oggetti magici nei forzieri. Quantità e nomi da verificare in gioco.
- Nell'indice del canale ci sono anche "Alchimia: ingredienti avanzati", "Respawn" e "Cosa è fatto e cosa no", ma il 20 ottobre quelle sezioni non erano ancora scritte.

## #forti-degli-orchi (14:52-14:58): "La guerra degli orchi"

- Lore: dopo 400 anni di pace gli orchi, schiavizzati per ricostruire i regni, si ribellano guidati da Ugrosh gro-Barzul "lo Spezzacatene". Un forte per regno.
- Forte di Windhelm (nord): 100 difensori, x 158100, y 10000. Forte di Riften (sud): 50 difensori, x 135300, y -110600. z da leggere in gioco.
- Raggio dentro il forte circa 2.400 unità; zona di perlustrazione delle sentinelle circa 11.000.
- Dentro il forte: sempre 10 orchi vivi (si valuta 15); se uno muore ne arriva un altro dopo 3-5 secondi.
- Fuori: orchi in perlustrazione nel perimetro; se uno muore rinasce dopo circa un'ora.
- Gli orchi attaccano i player a vista; le creature solo se ostili o se vengono attaccati.
- Conquista: uccidere tutti i difensori (Riften 50, Windhelm 100). A obiettivo raggiunto il forte appartiene a chi l'ha preso e tutti gli spawn si spengono, sentinelle comprese.
- Sentinella uccisa (ne basta una) → messaggio in gioco a chi ha il ruolo admin, così lo staff può attaccare con orchi evocati. La sentinella rinasce dopo circa un'ora.
- Loot degli orchi: niente armi né armature orchesche. Oricalco grezzo (1-3) 45%, Lingotto di oricalco 10%. I capi hanno un loot a parte (da definire). Niente oggetti magici.
- Comando staff: `evoca_orco` e varianti (normale, guerriero, capo; da scegliere insieme).
- Vene di oricalco: Windhelm già presenti; Riften da mettere, 4 vene sulla parete rocciosa dentro il forte. Da verificare in gioco che lo scavo funzioni sul server.
