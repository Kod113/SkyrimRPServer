# Ricerca: come funzionano i 2 server SkyMP più grandi

**Data:** 13 ottobre 2026 · **Autore:** david (con Claude)
**Fonti:** siti ufficiali, changelog e articoli pubblici (elenco in fondo). Le cose non pubbliche (perk, limiti precisi, login di Brasil) stanno nei loro Discord.

## Quali sono

Non esiste una classifica ufficiale. In base ai numeri pubblici:

1. **Keizaal Online**: internazionale, in inglese. Record di **650 giocatori connessi insieme** ad aprile 2026, ~85.000 iscritti.
2. **SKY MP Brasil**: brasiliano, in portoghese. 77 online al controllo del 13/10/2026 su skyrimlist; il sito parla di "centinaia di giocatori attivi".

Da tenere d'occhio: SweetTaffy (russo, SkyMP), numeri non trovati.

---

## 1. Client

| | Keizaal | SKY MP Brasil |
|---|---|---|
| Installazione | Launcher proprio per Windows + lista mod ("Collection") su Nexus Mods, da installare con Vortex | Launcher proprio (setup da GitHub `tangoplaybr/skymp-dist`) che scarica tutto da solo |
| Cosa fa il launcher | Aggiorna le mod in automatico; contiene impostazioni di gioco (chat vocale, tasti, bussola) | Controlla l'installazione Steam, scarica client multiplayer, SKSE giusto e mod; tasto "ripara"; **rimuove le mod personali** non in lista |
| Interfaccia in gioco | Menu fatti come pagine web dentro il gioco (CEF + NirnLabUI) | Non dichiarato |
| Note | Avviso in gioco se l'ordine delle mod è sbagliato | 440+ release del client: aggiornamenti molto frequenti |

Requisiti per entrambi: Windows + Skyrim SE/AE originale su Steam (niente GOG).

## 2. Gestione server

- **Base comune:** SkyMP. Nucleo in C++ + logica di gioco ("gamemode") in TypeScript/Node.js, ricaricabile senza spegnere il server. Salvataggio del mondo su file o MongoDB.
- **Keizaal:** due server separati (**Public-1** e **Public-2**), ~1.200 posti in totale, una parte riservata a staff e ruoli importanti. Ogni server ha i propri eventi (es. Bruma aperta con un evento diverso per server). Usano una loro versione modificata di SkyMP (GitHub `skyrim-roleplay/skymp`). Ban per hardware (HWID) e IP. Kick automatico per AFK con avviso 2 minuti prima.
- **Brasil:** un unico mondo persistente. Dettagli tecnici non pubblici.

## 3. Login ed entrata in gioco

**Keizaal**
1. Entrare nel Discord (obbligatorio).
2. Launcher → schermata dei personaggi: si possono vedere e cambiare senza disconnettersi.
3. Primo accesso: guida con regole e lore. Primo personaggio riceve piccone, ascia, 50 septim.
4. Nomi dei giocatori nascosti: ci si presenta dal menu contestuale.
5. Errori di login chiari (server offline, account bannato).

**SKY MP Brasil**
1. Registrazione su Discord + **whitelist**: il personaggio va approvato dallo staff.
2. Launcher → Play.
3. Primo accesso: si scelgono aspetto, nome e **professione**. Kit iniziale.

## 4. Open city, caricamenti, entità

- **Open city:** nessuno dei due dichiara di usare Open Cities.
- **Caricamenti:** SkyMP usa le celle normali di Skyrim. Quando cambi cella il client cancella tutte le entità e le ricrea → entrare in case o città murate ha **ancora la schermata di caricamento**.
- **Entità per stanza:** SkyMP non ha un limite fisso per cella. Il server raggruppa le entità per zona e manda a ogni giocatore solo quelle vicine. I limiti veri sono: posti massimi del server e **FPS del client** (Keizaal ha tolto Immersive Equipment Display per problemi di FPS). Nei video di Keizaal si vedono decine di giocatori nella stessa città.

## 5. Crafting

- **Keizaal:** sì, molto sviluppato, a professioni: fabbro (oggetti diversi per razza), sarto, cuoco, alchimista, incantatore (fine gioco, richiede mesi), taglialegna, minatore (minigioco, vene che si esauriscono e ricrescono). Lavori a consegna pagati (legna, fieno).
  - **Durabilità:** l'equipaggiamento passa da Pristine → Fine → Worn → Battered → Ruined → Broken. Si ripara con kit fatti dagli artigiani. Se è rotto, morendo hai il 50% di perderlo (unico modo di perdere equipaggiamento).
- **Brasil:** sì, a professioni: minatore, fabbro, cacciatore, cuoco, sarto, gioielliere, studioso arcano. Si sale da apprendista a maestro.

## 6. Level up

- **Keizaal:** l'XP si guadagna nella professione/abilità che pratichi (es. caccia → XP uccidendo creature). Oggetti di livello maestro danno fino a 3× XP. A un certo punto si sceglie una specializzazione **"master"** (con conferma). **Stanchezza:** ogni guadagno di XP stanca; da stanco non guadagni XP e gli artigiani non producono → freno al grinding. Menu abilità sul tasto K.
- **Brasil:** livelli ("Nível") in classifica, avanzamento nelle professioni, XP condivisa tra chi caccia in gruppo. Dettagli non pubblici.

## 7. Abilità, perk, magie

- **Keizaal:** magia presente ma **limitata**:
  - incantesimi imparabili solo al Collegio di Winterhold;
  - Evocazione aggiunta a settembre 2026;
  - bastoni magici sincronizzati, consumano gemme dell'anima;
  - prossimamente alcuni giocatori potranno insegnare magie ad altri;
  - alcune abilità (es. scasso serrature) solo per chi è autorizzato dallo staff (whitelist).
  - Perk: nessuna info pubblica.
- **Brasil:** esiste la professione "studioso arcano", quindi la magia c'è; nessun dettaglio su incantesimi o perk.

## Cose in comune

- Quasi tutti i **PNG umani tolti**: mercanti, guardie e Jarl sono giocatori.
- **Economia solo tra giocatori**, case (in affitto su Keizaal), clan/fazioni, politica (Jarl eletti su Brasil).
- Chat vocale di prossimità.

---

## Fonti

- Dexerto, record 650 giocatori: https://www.dexerto.com/gaming/skyrims-massive-rp-server-that-replaces-npcs-with-players-just-broke-a-new-record-3350436/
- Keizaal, Play: https://keizaal.com/en/play
- Keizaal, August Update: https://keizaal.com/en/news/august-update
- Keizaal, Horses, Cooking & Tailoring: https://keizaal.com/en/news/horses-cooking-tailoring-gear-loss-and-more
- Keizaal, Durability, Conjuration, Bruma: https://keizaal.com/en/news/durability-conjuration-new-armors-bruma-so-on
- Keizaal, Wild Life & Hunting: https://keizaal.com/en/news/wild-life-hunting-keybinds
- Keizaal, Onboarding & UI: https://keizaal.com/en/news/onboarding-for-new-players-upgraded-ui-lib
- Keizaal, 2.6.15 Bans: https://keizaal.com/en/news/2-6-15-better-bans-fixes
- Keizaal su GitHub: https://github.com/skyrim-roleplay
- SkyrimList: https://www.skyrimlist.com/ · https://www.skyrimlist.com/server/sky-mp-brasil
- SKY MP Brasil, sito: https://skyrimroleplay.com.br/ · https://skyrimroleplay.com.br/como-jogar.html
- SKY MP Brasil, launcher: https://github.com/tangoplaybr/skymp-dist
- GameOverdrive, guida Brasil: https://gameoverdrive.com.br/como-jogar-skyrim-roleplay-brasil/
- DeepWiki SkyMP (architettura): https://deepwiki.com/skyrim-multiplayer/skymp/1.2-system-architecture-overview
- DeepWiki SkyMP (World State): https://deepwiki.com/skyrim-multiplayer/skymp/2.5-world-state-management
- DeepWiki SkyMP (WorldView): https://deepwiki.com/skyrim-multiplayer/skymp/3.2.2-worldview-and-entity-rendering
