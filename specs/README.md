# specs/

> Cartella che ospita le **specifiche tecniche** di razze, spell, poteri, classi e altri contenuti custom del server.

## A cosa serve questa cartella

Le specifiche qui presenti sono la **verità tecnica** del contenuto custom. Sono il documento da cui partiranno le mod che implementeranno meccanicamente quel contenuto, e a cui Claude farà riferimento durante lo sviluppo.

Su **Discord** vivrà la versione narrativa, user-facing, di queste stesse cose (descrizione evocativa, lore, immagini). Qui vive la versione strutturata che serve all'implementazione.

Quando una specifica cambia (es. ribilanciamento), si modifica **prima** il file qui, **poi** si aggiorna il thread Discord corrispondente. Il file qui è canonico.

## Struttura

```
specs/
├── races/               ← una scheda per razza giocabile
├── spells/              ← una scheda per spell custom
├── powers/              ← una scheda per potere unico
├── classes/             ← (futuro) archetipi e classi RP
├── factions/            ← (futuro) fazioni del mondo
├── platform/            ← studio STR vs SkyMP + ricognizioni dei server concorrenti
├── systems/             ← studi di design di sistemi (es. mapping)
└── _templates/          ← template per ogni tipo di scheda
```

## Convenzioni

- Una scheda = un file markdown
- Nome file: `nome_in_snake_case.md` (es. `lupo_spirituale.md`)
- Ogni scheda inizia con un blocco di metadati YAML-style per la consultazione rapida
- Le schede approvate hanno tag `Status: Approvata`; quelle in discussione `Status: Bozza` o `Status: Bilanciamento in corso`

## Workflow di una nuova spell/razza/potere

1. **Discord** — un giocatore propone l'idea in un thread del Forum "Proposte"
2. **Discussione** — il team valuta, modifica, approva
3. **`specs/`** — il lore master o lead dev crea la scheda formale in questa cartella
4. **GitHub commit** — la scheda viene committata
5. **Discord** — il thread "Proposte" viene chiuso; nasce un nuovo thread nel Forum "Spell/Razze/Poteri" con la versione narrativa, linkato alla scheda GitHub
6. **Implementazione** — la mod che la implementa parte dalla scheda qui, non da Discord

## Status attuale

🔴 **Vuota.** Le sottocartelle e i template verranno creati quando inizieremo a lavorare ai contenuti custom (probabilmente Step 4 della roadmap).
