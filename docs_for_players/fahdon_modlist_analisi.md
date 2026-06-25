# Fahdon — Analisi completa modlist per il progetto SkyrimRPServer

> **Fonte:** modlist.txt da Load Order Library (v0.0.4-alpha) + Changes To Gameplay.md (GitHub)
> **Nota:** la versione su Load Order Library è una alpha incompleta. Molte mod documentate nel changelog
> di Fahdon non compaiono nel modlist.txt — probabile che la build completa sia distribuita solo via Wabbajack.
> Le sezioni contrassegnate con ⚠️ sono presenti solo nella documentazione, non nell'alpha.

---

## Legenda valutazione per il nostro progetto

- ✅ **Da integrare** — compatibile STR, allineata alla nostra visione, poco invasiva
- 🔶 **Da valutare** — interessante ma richiede testing o adattamento
- ❌ **Non pertinente** — visuale/audio puro, o incompatibile col nostro design (no NPC ecc.)
- ⚠️ **Solo doc** — presente nella documentazione di Fahdon, non nell'alpha pubblica

---

## BASE TECNICA

### SKSE + DLL Mods
| Mod | Valutazione | Note |
|-----|-------------|-------|
| SKSE64 | ✅ Da integrare | Già in modlist nostra |
| Address Library for SKSE Plugins | ✅ Da integrare | Già in modlist nostra |
| Bug Fixes SSE | ✅ Da integrare | Fix vanilla puri, nessun rischio STR |
| Scrambled Bugs | ✅ Da integrare | Fix engine-level, altamente raccomandato |
| Actor Limit Fix | ✅ Da integrare | Rimuove il limite di 128 actor — utile con più player |
| SSE Display Tweaks | ✅ Da integrare | Uncap FPS + fix vsync, fondamentale |
| powerofthree's Tweaks | ✅ Da integrare | Fix motore vari, no gameplay change |
| Spell Perk Item Distributor (SPID) | 🔶 Da valutare | Framework per distribuire perk/item via INI — utile per future mod custom |
| PapyrusUtil SE | ✅ Da integrare | Già in modlist nostra |
| Security Overhaul SKSE - Regional Locks | 🔶 Da valutare | Porte con serrature regionali — interessante per RP ma richiede NPC |
| Security Overhaul SKSE - Some More Locks | 🔶 Da valutare | Più varietà serrature |
| RaceMenu Special Edition | ✅ Da integrare | Già in considerazione nostra |
| More Informative Console | ✅ Da integrare | Solo staff/dev — debug in-game |
| NPC AI Process Position Fix - NG | ❌ Non pertinente | Fix NPC AI — irrilevante senza NPC |
| Animation Motion Revolution | 🔶 Da valutare | Framework animazioni, dipendenza di molte mod |

---

## FIX E STABILITÀ

### Fixes
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Hide Quest Items in Container Menu | ✅ Da integrare | QoL puro, nessun rischio |
| High Gate Ruins Puzzle Reset Fix | ✅ Da integrare | Fix vanilla |
| Pickpocket Reset | ✅ Da integrare | Fix vanilla |
| dunPOISoldiersRaidOnStart Script Tweak | ✅ Da integrare | Fix script vanilla che causa problemi |
| First Person Sneak Strafe-Walk Stutter Fix | ✅ Da integrare | Fix animazione |
| Dwemer Gates Don't Reset | ✅ Da integrare | Utile — i dungeon non si resettano |
| bc036's Tweaks | 🔶 Da valutare | Bundle di fix minori — verificare cosa include |
| Andrealphus' Exploit Fixes | ✅ Da integrare | Chiude exploit di leveling vanilla |
| Less Sniperlike NPCs | ❌ Non pertinente | Modifica AI NPC — irrilevante senza NPC |
| Andrealphus' Harder Quests | ❌ Non pertinente | Dipende da quest NPC-driven |
| Soul-Cairn Objects Secured | ✅ Da integrare | Fix oggetti che spariscono |
| Navigator - Navmesh Fixes | ❌ Non pertinente | Fix navmesh NPC |
| WIDeadBodyCleanupScript Crash Fix | ✅ Da integrare | Fix crash quando i cadaveri spariscono |
| Tavern AI fix | ❌ Non pertinente | AI NPC |
| Modern Clap Bug Fix | ✅ Da integrare | Fix animazione universale |
| Skyrim Project Optimization SE | ✅ Da integrare | Migliora occlusion culling → più FPS |
| Bard Instrumentals Mostly - Sing Rarely | ❌ Non pertinente | Senza bard NPC è irrilevante |
| Mannequin Management | 🔶 Da valutare | Fix mannichini che si muovono — utile se usiamo case player |
| Werewolf Killcam Remover | ✅ Da integrare | Rimuove killcam in forma bestia — meglio in MP |
| Heimskr only preaches on weekends | ❌ Non pertinente | NPC-specific |
| Horns Are Forever (Persistent Argonian Horns) | ✅ Da integrare | Fix cosmético Argoniani |
| CritterSpawn Congestion Fix | ✅ Da integrare | Fix spawn creature piccole |
| Vanilla Scripting Enhancements | 🔶 Da valutare | Aggiunge funzioni Papyrus — verificare compatibilità STR |
| Fish Anywhere With Water | ✅ Da integrare | QoL puro |
| Survival Mode Vampires - Health Regen Fix | 🔶 Da valutare | Solo se usiamo Survival Mode |
| Nifty AI Tweaks AIO | ❌ Non pertinente | AI NPC |
| Power of Creation - Fishing | ✅ Da integrare | Fix pesca CC |

---

## INTERFACCIA

### User Interface
| Mod | Valutazione | Note |
|-----|-------------|-------|
| SkyUI | ✅ Da integrare | Già in considerazione nostra — essenziale |
| UIExtensions | ✅ Da integrare | Framework UI, dipendenza molte mod |
| moreHUD SE | ✅ Da integrare | Info item senza aprire inventario |
| moreHUD Inventory Edition | ✅ Da integrare | Info extra in inventario |
| A Matter of Time - HUD clock widget | 🔶 Da valutare | Orologio HUD — utile per RP time-tracking |
| Contextual Crosshair | ✅ Da integrare | Crosshair visibile solo quando necessario |
| SkyHUD | ✅ Da integrare | Personalizzazione HUD |
| Dear Diary Dark Mode | ✅ Da integrare | UI modernizzata, leggibile |
| MCM Helper | ✅ Da integrare | Salva configurazioni MCM — fondamentale |
| TrueHUD - HUD Additions | ✅ Da integrare | Barre HP enemy sopra la testa — ottimo in MP |
| True Directional Movement | ✅ Da integrare | Lock-on + movimento omnidirezionale — rilevante per combat STR |
| Skyrim Character Sheet | 🔶 Da valutare | Sheet stile TTRPG — perfetto per visione RP |
| Icons for Skyrim Character Sheet | 🔶 Da valutare | Dipendenza del precedente |
| Ultimate Immersion Toggle - Hide HUD | 🔶 Da valutare | Nasconde HUD per screenshot/RP |
| Sovngarde - A Nordic Font | ❌ Non pertinente | Solo estetico |

---

## ANIMAZIONI

### General Animations
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Nemesis Unlimited Behavior Engine | ✅ Da integrare | Sostituisce FNIS — fondamentale per qualsiasi mod animazioni |
| XP32 Maximum Skeleton Extended (XPMSSE) | ✅ Da integrare | Skeleton standard per mod weapon/armor |
| XPMSSE - Fixed Scripts | ✅ Da integrare | Fix script XPMSSE — obbligatorio |
| Dynamic Animation Replacer | ✅ Da integrare | Sostituisce animazioni per condizione — base per molti mod |
| Super Fast Get Up Animation | ✅ Da integrare | Riduce animazione alzarsi — meno interruzione in MP |
| Pristine Vanilla Movement | ✅ Da integrare | Fix animazioni movimento vanilla |
| Conditional Expressions - Subtle Face Animations | ❌ Non pertinente | Espressioni facciali NPC |
| Vanargand Animations - Sneak idle/walk/run | ✅ Da integrare | Animazioni sneaking migliorate |
| Goetia Animations - Sprint | ✅ Da integrare | Animazione sprint più fluida |

### Combat Animations
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Vanargand Animations - Crossbows | ✅ Da integrare | Animazioni balestra migliorate |
| Vanargand Animations - Archery | ✅ Da integrare | Animazioni arco migliorate |
| Vanargand Animations - One Handed Mid Stance | ✅ Da integrare | Stance una mano più realistica |
| Feral - Claw Unarmed Attacks for Beast Races | 🔶 Da valutare | Animazioni artigli Khajiit/Argoniani |

---

## GAMEPLAY CORE

### Class & Progression ⚠️ (molti solo in doc, non nell'alpha)
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Sets of Skills - a Skyrim Class Mod | ✅ Da integrare | **Confermato nell'alpha** — sistema classi MCM, ogni player ha il suo ruolo. Perfetto per noi |
| Experience (XP da quest/kill/explore) ⚠️ | ✅ Da integrare | **Solo doc** — sostituisce leveling vanilla, molto più adatto al RP |
| Starting in Classes ⚠️ | 🔶 Da valutare | **Solo doc** — scroll "Choose Your Destiny" all'inizio, gear+buff per classe |
| Stokk - Simple Acrobatics and Athletics ⚠️ | 🔶 Da valutare | **Solo doc** — skill extra salto/sprint, leggero |
| Phylogeny - Races of Tamriel ⚠️ | 🔶 Da valutare | **Solo doc** — bonus razziali passivi senza daily power |
| Natural Character Growth and Decay ⚠️ | 🔶 Da valutare | **Solo doc** — HP/Magicka crescono con uso, decadono nel tempo |
| Auto-Lockpicking (DC check) ⚠️ | 🔶 Da valutare | **Solo doc** — lockpicking come Difficulty Check D&D — perfetto per RP |
| Solvable Dragon Claw Doors ⚠️ | ✅ Da integrare | **Solo doc** — puzzle reale invece di guardare il claw |

### Perk Overhaul ⚠️
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Adamant - A Perk Overhaul ⚠️ | ✅ Da integrare | **Solo doc ma è il perk overhaul core di Fahdon** — leggero, SimonRim, ottimo con STR |
| STR Script Patch Hub | ✅ Da integrare | Già in modlist nostra — obbligatorio con Adamant |

### Combat Mods
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Chocolate Poise | 🔶 Da valutare | Sistema poise/stagger — rende il combat più tattico, verificare sync STR |
| Enhanced Enemy AI SE | ❌ Non pertinente | AI nemici — irrilevante senza NPC |
| Increased Stamina Regen in Combat | ✅ Da integrare | QoL stamina, meno frustrazione in MP |
| Archery Locational Damage | 🔶 Da valutare | Danni localizzati frecce — interessante ma testare desync |
| Elden Parry | ✅ Da integrare | Parry con scudo al posto del bash — più skill espressivo in MP |
| Shield Of Stamina - Blocking Redux | 🔶 Da valutare | Blocking consuma stamina — più tattico |
| Stop On Slash AE - Hitstop and Screenshake | 🔶 Da valutare | Feedback visivo colpi — puramente client-side, ok |
| Wait Your Turn - Enemy Circling Behaviour | ❌ Non pertinente | AI NPC |
| VioLens - A Killmove Mod SE | 🔶 Da valutare | Controlla quando/come avvengono killmove — verificare in STR |
| Elden Sprint | ✅ Da integrare | Sprint consuma stamina gradualmente invece di bloccarsi — più fluido in MP |

### Perk & Gameplay Overhauls
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Know Your Enemy Redux | 🔶 Da valutare | Resistenze/debolezze creature e armature — aggiunge profondità tattica |
| Know Your Enemy Redux - Armors | 🔶 Da valutare | Espansione per armature |

### Magic
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Mysticism - A Magic Overhaul ⚠️ | ✅ Da integrare | **Solo doc** — base magic di Fahdon, SimonRim, ottimo con STR |
| Action Based Projectiles | 🔶 Da valutare | Proiettili dodgeabili — verificare desync STR |
| Arcanum - A New Age of Magic ⚠️ | 🔶 Da valutare | **Solo doc** — spell overhaul esteso, testare script STR |
| Hemomancy - Blood Magic ⚠️ | 🔶 Da valutare | **Solo doc** — blood mage archetype, molto scriptato |
| Natura ⚠️ | 🔶 Da valutare | **Solo doc** — druid/poison spells |
| Darkstorm (Depths of the Reach) ⚠️ | 🔶 Da valutare | **Solo doc** — void magic |
| Kthonia Minions ⚠️ | 🔶 Da valutare | **Solo doc** — summoning Morrowindiano |

### Shouts & Dragons ⚠️
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Dragon War ⚠️ | 🔶 Da valutare | **Solo doc** — draghi molto più pericolosi, boss fight reali |
| The Dragon Cult (Draugr Overhaul) ⚠️ | ❌ Non pertinente | Overhaul NPC draugr |
| Lawless - Bandit Overhaul ⚠️ | ❌ Non pertinente | Overhaul NPC banditi |
| Silver is For Monsters ⚠️ | 🔶 Da valutare | Rende armi d'argento utili vs creature magiche |

---

## NUOVI CONTENUTI

### New Lands & Quests
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Darkend | 🔶 Da valutare | Nuova isola + dungeon dark fantasy — lore-friendly, testare script in STR |
| Beyond Skyrim - Bruma | 🔶 Da valutare | Espansione enorme verso Cyrodiil — molto scripting, testare attentamente |

### Quest Expansion ⚠️
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Quest Expansion series (JaySerpa) ⚠️ | 🔶 Da valutare | **Solo doc** — flesh out quest vanilla con scelte + conseguenze |
| Actually Challenging Radiant Quests ⚠️ | 🔶 Da valutare | **Solo doc** — bounty senza map marker, solo indizi Hold |
| Heart of the Reach ⚠️ | 🔶 Da valutare | **Solo doc** — quest + area nuova |
| Observatory ⚠️ | 🔶 Da valutare | **Solo doc** — piccola quest con dungeon |
| Inconvenient Dungeons ⚠️ | ✅ Da integrare | **Solo doc** — rimuove uscite secondarie facili, boss potenziati |

---

## IMMERSIONE / RP

### Atmosphere & Roleplaying
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Immersive Equipment Displays | ✅ Da integrare | Armi visibili sul corpo — fondamentale per RP visivo |
| Simple Dual Sheath | ✅ Da integrare | Spade sul retro/fianco — estetica |
| Immersive Interactions - Animated Actions | ✅ Da integrare | Animazioni sedersi, aprire porte ecc. — ottimo per RP |
| Alternate Start - Live Another Life | ✅ Da integrare | Già in modlist nostra |
| Curse of the Firmament ⚠️ | ✅ Da integrare | **Solo doc** — standing stone via MCM individuali per ogni player (STR-aware!) |
| Curse of the Vampire ⚠️ | 🔶 Da valutare | **Solo doc** — vampirismo RP-oriented, nascondersi dal sole ecc. |

### Survival (sezione vuota nell'alpha)
| Mod | Valutazione | Note |
|-----|-------------|-------|
| Survival Mode Improved | 🔶 Da valutare | Migliora Survival Mode CC — solo se attiviamo survival |

---

## VISUALE (sintesi — non prioritario per noi)

La sezione visuale di Fahdon è enorme (~400 mod) ma irrilevante per le nostre decisioni gameplay.
Le categorie presenti sono:
- Landscape/terrain textures (Septentrional, Hyperborean Snow, Rum Induced Mountains...)
- Tree/plant replacers
- Architecture (città, dungeon, Dwemer)
- Creature retextures (Kajuan series, Rustic series...)
- Weapons & Armor retextures
- Weather (non specificato nell'alpha)
- ENB + ReShade

Per noi: se in futuro vogliamo migliorare il visuale, Fahdon è una reference list eccellente già testata in STR.

---

## AUDIO

L'alpha non ha una sezione SFX attiva. Fahdon nella documentazione menziona musica ambientale ma non è specificata nel modlist.txt.

---

## SINTESI — PRIORITÀ DI INTEGRAZIONE

### Integrare subito (basso rischio, alto valore)
- Bug Fixes SSE, Scrambled Bugs, Actor Limit Fix, SSE Display Tweaks, powerofthree's Tweaks
- Nemesis, XPMSSE, Dynamic Animation Replacer
- SkyUI, TrueHUD, True Directional Movement, MCM Helper
- Immersive Equipment Displays, Simple Dual Sheath
- Elden Sprint, Elden Parry
- Sets of Skills
- Alternate Start - Live Another Life (già presente)
- Inconvenient Dungeons
- Immersive Interactions

### Integrare con STR Script Patch Hub (medio rischio)
- Adamant (perk overhaul)
- Mysticism (magic overhaul)
- Experience (leveling XP)
- Curse of the Firmament (standing stones per-player)

### Testare attentamente in sessione STR prima di includere
- Chocolate Poise (poise system)
- Know Your Enemy Redux
- Action Based Projectiles
- Darkend, Beyond Skyrim - Bruma
- Dragon War
- Spell mods secondari (Arcanum, Hemomancy, Natura)

### Non pertinenti per il nostro design (no NPC)
- Enhanced Enemy AI, Wait Your Turn, Less Sniperlike NPCs
- Bard, Tavern AI, Heimskr fix
- Navigator Navmesh Fixes
- NPC AI Process Position Fix
- Draugr/Bandit Overhaul

---

*Documento generato da analisi di modlist.txt (Load Order Library, v0.0.4-alpha) + Changes To Gameplay.md (GitHub)*
*Data: 2026-06-25*
