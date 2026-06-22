# Risoluzione Problemi

> Se hai un problema non elencato qui, chiedi aiuto su Discord allo staff.

---

## Il gioco non si avvia

**Errore "Address Library"**
Address Library non è installata o non è abilitata.
→ Apri MO2 → controlla che "Address Library for SKSE Plugins" abbia la spunta verde → se non c'è, reinstallala seguendo il Passo 5 di INSTALL_GUIDE.md.

**Schermata nera per qualche secondo poi il gioco si chiude**
Problema comune con alcuni sistemi. Prova:
1. Avvia il gioco almeno una volta direttamente da Steam (senza MO2) per generare i file di configurazione
2. Poi torna ad avviarlo da MO2

**Ho scelto l'exe sbagliato al primo avvio di SkyrimTogether.exe**
Premi `Windows + R`, incolla e dai invio:
`C:\Modding\MO2\mods\Skyrim Together Reborn\SkyrimTogetherReborn\SkyrimTogether.exe -r`
Si riaprirà la finestra di selezione — questa volta scegli `SkyrimSE.exe`.

---

## Il gioco si avvia ma le mod non funzionano

**Non vedo le mod / Address Library error**
Stai avviando il gioco dal posto sbagliato. Devi sempre usare MO2 con il launcher "Skyrim Together Reborn" (vedi INSTALL_GUIDE.md, Passo 7).

---

## Problemi durante Helgen

**Il personaggio è bloccato dopo il teletrasporto**
```
~
enableplayercontrols
~
```

**Il personaggio vola / telecamera libera**
```
~
tfc
~
```

**La console non si apre**
Controlla la lingua della tastiera. Il tasto `~` deve essere quello in alto a sinistra sotto Esc.

---

## Problemi di connessione al server

**L'interfaccia STR non si apre**
Prova sia `F2` che `CTRL Destro`. Se nessuno dei due funziona, il mod potrebbe non essere caricato — ricontrolla che SkyrimTogether Reborn sia abilitato in MO2.

**Mi connetto ma non vedo gli altri giocatori**
1. Verifica di essere connesso al server corretto (IP giusto)
2. Entra nel party — vedi le regole di party in SERVER_RULES.md
3. Assicurati che tutti i giocatori abbiano completato Helgen prima di connettersi

**Il gioco crasha quando mi connetto**
Salva la partita, disconnettiti, riavvia il gioco da MO2 e riprova. Se il problema persiste, contatta lo staff su Discord.
