# Setup Skyrim Together — Guida rapida

> Leggi un passo → eseguilo → passa al prossimo. Non saltare nulla.
> Prerequisito: **Skyrim Special Edition** installato da Steam.

---

## 1 — Prepara Steam

1. Libreria → clic destro su Skyrim SE → **Proprietà** → **DLC** → togli la spunta ad **Anniversary Upgrade** (se c'è)
2. **Proprietà** → **Aggiornamenti** → imposta **"Aggiorna solo quando lo avvio"**
3. Avvia Skyrim da Steam, arriva al menu principale, chiudilo

## 2 — Installa MO2

1. Scarica **Mod.Organizer-X.X.X.exe** da [qui](https://github.com/ModOrganizer2/modorganizer/releases)
2. Installalo in `C:\Modding\MO2` (NON in Programmi, NON nella cartella di Skyrim)
3. Al primo avvio scegli **Skyrim Special Edition** → OK

## 3 — Account NexusMods

Registrati su [nexusmods.com](https://www.nexusmods.com) e conferma l'email.

## 4 — Scarica le 4 mod

Per ognuna: apri il link → **Files** → **Mod Manager Download** → il browser apre MO2 → in MO2 scheda **Downloads** → doppio clic sul file → **metti la spunta** alla mod nella lista a sinistra.

1. [Address Library](https://www.nexusmods.com/skyrimspecialedition/mods/32444) — scarica il file **"All in one (Anniversary Edition)"**
2. [Skyrim Together Reborn](https://www.nexusmods.com/skyrimspecialedition/mods/69993) — se appare un avviso: freccia verde → OK → Ignore
3. [Unofficial Skyrim Special Edition Patch](https://www.nexusmods.com/skyrimspecialedition/mods/266)
4. [Alternate Start - Live Another Life](https://www.nexusmods.com/skyrimspecialedition/mods/272)

Controllo: 4 mod nella lista, tutte con la spunta.

## 5 — Installa LOOT (ordina le mod)

1. Scarica LOOT da [loot.github.io](https://loot.github.io) e installalo
2. In MO2: icona **ingranaggio** in alto → **+** → **Aggiungi da file...** → seleziona `C:\Program Files\LOOT\LOOT.exe` → OK
3. Menu a tendina in alto a destra → **LOOT** → **Run**
4. In LOOT: clicca **Sort** (in alto) → poi **Apply** → chiudi LOOT

## 6 — Aggiungi il launcher multiplayer

1. In MO2: icona **ingranaggio** → **+** → **Aggiungi da file...** → seleziona:
   `C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\SkyrimTogether.exe` → OK
2. Menu a tendina → **SkyrimTogether** → **Run**
3. Al primo avvio ti chiede un eseguibile → scegli **SkyrimSE.exe** (nella cartella di Skyrim dentro Steam)
4. Arrivato al menu principale, tutto ok

> ⚠️ D'ora in poi avvia il gioco **solo così**: MO2 → SkyrimTogether → Run. Mai da Steam. E **non aggiungere altre mod**: tutti devono avere le stesse.

## 7 — Crea il personaggio

1. **Nuova partita** → ti risvegli in una cella (niente carro)
2. Crea il personaggio → attiva la **statua di Mara** → scegli come iniziare
3. Dormi nel letto → ti risvegli nel punto scelto → **salva**

---

## 8A — Se sei l'HOST (una persona sola)

Metodo facile: server gratuito su [playtogether.gg](https://playtogether.gg) → crealo, ti dà IP e password → passali agli altri su Discord.

Se invece vuoi hostare dal tuo PC (serve aprire la porta UDP 10578 sul router), segui la guida ufficiale: [Server guide — Skyrim Together](https://wiki.tiltedphoques.com/skyrim-together-reborn/guides/server-guide)

## 8B — Se sei un GUEST (tutti gli altri)

1. In gioco (col salvataggio del punto 7 caricato) premi **F2**
2. **Connect** → inserisci **IP e password** ricevuti su Discord
3. Sei dentro 🎉

---

## FAQ lampo

- **Ho Vortex, posso usarlo?** No, MO2. Serve che tutti abbiano lo stesso setup ed è più pulito (non tocca i file del gioco). Togli solo Skyrim dai giochi gestiti da Vortex.
- **Mi serve SSEEdit / SKSE?** No. Sono strumenti da sviluppatori, non ti servono.
- **Serve Nexus Premium?** No, il download gratuito basta.
- **L'antivirus blocca SkyrimTogether.exe** — è normale (inietta codice nel gioco): aggiungi un'eccezione per `C:\Modding\MO2`.
- **Problemi?** Scrivi su Discord.
