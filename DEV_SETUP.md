# SETUP TECNICO — Reparto Dev

> **Cosa serve installare** prima di iniziare a moddare e sviluppare per il server. Documento operativo, va seguito in ordine.

## Versione di Skyrim Special Edition

> ✅ **Versione fissata** — vedi D-004 in `DECISIONS.md`.

**Versione SSE fissata:** `1.6.1170`
**Build SKSE corrispondente:** SKSE64 2.2.6 (per SSE 1.6.1170+)
**Data di fissaggio:** 2026-06-15

### Disabilitare auto-update Steam (obbligatorio per tutti)

Su Steam: tasto destro su *Skyrim Special Edition* → *Properties* → *Updates* → impostare "Update only when I launch the game" o equivalente. Mai avviare Skyrim senza prima caricare la modlist tramite Mod Organizer 2, altrimenti Steam può forzare un aggiornamento che rompe la compatibilità con STR.

---

## Stack obbligatorio (in ordine di installazione)

### 1. Gioco base
**Nome:** The Elder Scrolls V: Skyrim Special Edition
**Fonte:** Steam (consigliato)
**Note:** versione fissata sopra. Disabilitare auto-update.

### 2. Mod Organizer 2 (MO2)
**Cosa fa:** gestisce tutte le mod tenendo isolate le installazioni dal gioco base. Permette profili separati, ordinamento del load order, e installazione/disinstallazione sicura.
**Perché obbligatorio:** senza MO2 il progetto diventa ingestibile dopo poche mod.
**Fonte:** [nexusmods.com/skyrimspecialedition/mods/6194](https://www.nexusmods.com/skyrimspecialedition/mods/6194)
**Note:** creare un profilo dedicato `RPServer-Dev`.

### 3. SKSE64 — Script Extender
**Cosa fa:** espande le funzioni interne di Skyrim. Necessario per la maggior parte delle mod moderne, scripting avanzato, sistemi RP custom.
**Perché obbligatorio:** Skyrim Together Reborn richiede SKSE; il framework RP custom dipende da SKSE.
**Fonte:** [skse.silverlock.org](https://skse.silverlock.org/)
**Note:** scaricare la build **esattamente corrispondente** alla versione di Skyrim fissata sopra.

### 4. Skyrim Together Reborn
**Cosa fa:** aggiunge il multiplayer online a Skyrim.
**Perché obbligatorio:** è la base dell'intero server RP.
**Fonte:** [skyrim-together.com](https://skyrim-together.com/)
**Note:** seguire la guida ufficiale di installazione alla lettera. Verifica della versione del gioco è cruciale.

### 5. Creation Kit
**Cosa fa:** editor ufficiale Bethesda. Serve per creare mod, modificare città, creare dungeon, rimuovere NPC, creare quest, scrivere Papyrus.
**Perché obbligatorio:** è il tool principale di sviluppo lato Bethesda.
**Fonte:** Bethesda.net Launcher o Steam (a seconda della disponibilità attuale)

### 6. SSEEdit (xEdit)
**Cosa fa:** editor di record dei plugin. Permette modifiche di massa via script Pascal — fondamentale per la mod NoNPCs e in generale per tutto il modding bulk.
**Perché obbligatorio:** alcune operazioni (es. NoNPCs) sono praticabili solo con SSEEdit.
**Fonte:** [nexusmods.com/skyrimspecialedition/mods/164](https://www.nexusmods.com/skyrimspecialedition/mods/164)
**Note:** mancava nella lista originale del fondatore ma è imprescindibile.

### 7. Address Library for SKSE Plugins
**Cosa fa:** strato di compatibilità tecnica tra SKSE e molti plugin moderni.
**Perché obbligatorio:** numerose mod non funzionano senza.
**Fonte:** [nexusmods.com/skyrimspecialedition/mods/32444](https://www.nexusmods.com/skyrimspecialedition/mods/32444)
**Note:** scaricare la versione corrispondente alla build di Skyrim fissata.

### 8. PapyrusUtil SE
**Cosa fa:** estende il linguaggio Papyrus con funzioni avanzate (persistenza dati, manipolazione array, JSON).
**Perché importante:** sarà fondamentale per il framework RP custom (background, reputazione, stato persistente del mondo).
**Fonte:** [nexusmods.com/skyrimspecialedition/mods/13048](https://www.nexusmods.com/skyrimspecialedition/mods/13048)

### 9. ConsoleUtilSSE NG
**Cosa fa:** permette agli script Papyrus di interagire con la console di Skyrim.
**Perché importante:** necessario per staff tools, debug, sistemi GM, teleport, eventi server.
**Fonte:** [nexusmods.com/skyrimspecialedition/mods/76649](https://www.nexusmods.com/skyrimspecialedition/mods/76649)

### 10. Unofficial Skyrim Special Edition Patch (USSEP)
**Cosa fa:** corregge migliaia di bug del gioco vanilla.
**Perché obbligatorio:** rende il gioco molto più stabile. Standard de facto per ogni modlist seria.
**Fonte:** [nexusmods.com/skyrimspecialedition/mods/266](https://www.nexusmods.com/skyrimspecialedition/mods/266)

### 11. SSE Engine Fixes
**Cosa fa:** patch interne del motore di Skyrim (stabilità, performance, gestione memoria, crash handling).
**Perché obbligatorio:** fondamentale per server multiplayer con tanti player.
**Fonte:** [nexusmods.com/skyrimspecialedition/mods/17230](https://www.nexusmods.com/skyrimspecialedition/mods/17230)
**Note:** richiede due passaggi di installazione (file Nexus + file di plugin esterno). Seguire la guida sulla pagina Nexus.

### 12. Crash Logger SSE AE VR
**Cosa fa:** logga i crash del gioco in modo leggibile.
**Perché importante:** essenziale per debug — distingue tra mod problematiche, script rotti, incompatibilità.
**Fonte:** [nexusmods.com/skyrimspecialedition/mods/59818](https://www.nexusmods.com/skyrimspecialedition/mods/59818)

### 13. Visual Studio Code
**Cosa fa:** editor di testo moderno per scrivere script Papyrus.
**Perché importante:** Creation Kit ha un editor Papyrus interno, ma è scomodo. VS Code con estensione Papyrus è molto più produttivo.
**Fonte:** [code.visualstudio.com](https://code.visualstudio.com/)
**Estensioni consigliate:** *Papyrus* (cerca su marketplace), *GitLens*.

---

## Mod gameplay menzionate dal fondatore (status separato)

Le seguenti mod sono nella lista del fondatore ma **non appartengono al setup tecnico obbligatorio**. Sono mod di gameplay/contenuto che entrano nel discorso "modlist del server" gestito in `MODLIST.md`. Le elenco qui solo per chiarezza:

- **Skyrim Unbound Reborn** — disabilita main quest, intro, Dovahkiin. Candidata fortissima per Step 0 priorità 6.
- **Static Skill Leveling Rewritten** — crescita skill più lenta. Da testare in STR per verifica sync.
- **Trade and Barter** — modifica prezzi mercanti. **Esclusa da Step 0** (vedi `DECISIONS.md`): senza NPC mercanti non ha senso.
- **Skyrim Reputation** — sistema reputazione vanilla. **Esclusa da Step 0**: da reinterpretare nel framework RP custom.
- **Jaxonz Positioner Converted** — strumento staff per spostare oggetti. Da usare **solo nella modlist Staff**, non in quella Player.

---

## Obiettivo dev iniziale (checklist personale)

Prima di sviluppare qualsiasi mod, ogni dev deve essere in grado di:

- [ ] Avviare Skyrim moddato tramite MO2 con SKSE attivo
- [ ] Avviare Skyrim Together e connettersi a un server
- [ ] Usare MO2 con disinvoltura (installare/disinstallare mod, riordinare load order, switchare profili)
- [ ] Aprire il Creation Kit senza errori
- [ ] Creare una mod base (es. un plugin vuoto che modifica un singolo oggetto come test)
- [ ] Modificare una città in Creation Kit (es. spostare un masso, aggiungere un mobile)
- [ ] Compilare uno script Papyrus semplice (es. uno script che fa apparire un messaggio quando si interagisce con un oggetto)
- [ ] Eseguire uno script Pascal in SSEEdit (es. lo script NoNPCs quando sarà pronto)

Questa checklist non è obbligatoria per progredire nello Step 0, ma è la baseline di competenze su cui si appoggia tutto il lavoro successivo. Si può imparare strada facendo.
