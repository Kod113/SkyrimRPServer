// ===== [INGREDIENTI] spawn degli ingredienti (piante e funghi) - T-008, autore: david (team/david/ingredienti-spawn) =====
// Si carica dal gamemode di Davide con UNA riga, messa in fondo a gamemode.js (dopo il blocco [RACCOLTA]):
//   try { eval(_fs.readFileSync("ingredienti-spawn.js", "utf8")); } catch (e) { log("[INGREDIENTI] non caricato: " + e); }
// "eval" fa girare questo file dentro il gamemode: usa le sue funzioni log, mpPlace, mpSet, onlineUsers.
//
// Cosa fa:
//  1. legge ingredienti-spawn.json (copia di team/david/db/ingredient_spawns.json) e crea le piante una volta sola,
//     a pochi per volta (8 ogni 250 ms), spostandole con MoveTo sull'oggetto del gioco indicato in "anchor"
//     (stesso metodo del decor dei giganti). Gli id creati si salvano in ingredienti-spawn-ids.json;
//  2. le nostre piante si raccolgono normalmente: il blocco [RACCOLTA] di Davide non le tocca, perche' questo
//     controllo viene prima del suo. Le piante del gioco originale restano spente come prima;
//  3. rinasce solo la pianta raccolta, sullo stesso posto, dopo respawn_min minuti (0 = solo al riavvio).
//     Al riavvio del server rinascono tutte;
//  4. comandi di prova: scrivere una riga in ingredienti-cmd.txt (cartella del server), il risultato esce in
//     ingredienti-result.txt:
//       stato              quante piante create, al loro posto, raccolte
//       vicino             i 5 punti piu' vicini al primo giocatore collegato
//       tp <id punto>      porta il primo giocatore collegato su quel punto (es. tp ING-W-lavender-01)
//       rifai              spegne tutte le piante e le ricrea
// Il client di Davide ([RB-NASCONDI]) non nasconde gli oggetti creati dal server (id >= 0x05000000): le nostre si vedono.
(function () {
  const DATI = "ingredienti-spawn.json", IDS = "ingredienti-spawn-ids.json";
  const CMD = "ingredienti-cmd.txt", RIS = "ingredienti-result.txt";
  const S = global.__rbIngr = global.__rbIngr || {};
  S.byRef = {}; S.raccolte = S.raccolte || {}; S.punti = {}; S.esito = { ok: 0, lontane: 0, errori: 0 };
  // il server ricarica il gamemode quando cambia: si fermano i timer della volta prima (come fa Davide con __rb...Timer)
  (S.timer || []).forEach(function (t) { try { clearInterval(t); clearTimeout(t); } catch (e) { } });
  S.timer = [];

  function leggi(f, def) { try { return JSON.parse(_fs.readFileSync(f, "utf8")); } catch (e) { return def; } }
  function salva(f, o) { try { _fs.writeFileSync(f, JSON.stringify(o)); } catch (e) { log("[INGREDIENTI] scrittura " + f + " fallita: " + e); } }
  function esito(t) { try { _fs.writeFileSync(RIS, new Date().toISOString() + "\n" + t + "\n"); } catch (e) { } log("[INGREDIENTI] " + t.split("\n")[0]); }
  function forma(x) { let d = null; try { d = mp.getDescFromId(x); } catch (e) { } if (!d) d = x.toString(16) + ":Skyrim.esm"; return { type: "form", desc: d }; }
  function papyrus(nome, id, args) { return mp.callPapyrusFunction("method", "ObjectReference", nome, forma(id), args); }
  function pos(id) { try { return mp.get(id, "pos"); } catch (e) { return null; } }

  const D = leggi(DATI, null);
  if (!D || !D.points) { log("[INGREDIENTI] manca " + DATI + ": niente spawn degli ingredienti"); return; }
  const VER = D._meta.version + " " + D._meta.date;
  D.points.forEach(function (p) { S.punti[p.id] = p; });

  // ---------- creazione delle piante
  let IDM = leggi(IDS, {});
  function posa(pl) {
    const id = mpPlace(parseInt(pl.base, 16));
    const a = pl.anchor;
    papyrus("MoveTo", id, [forma(parseInt(a.ref, 16)), a.dx, a.dy, a.dz, false]);
    try { papyrus("SetAngle", id, [0, 0, pl.rot || 0]); } catch (e) { }
    try { papyrus("Enable", id, [false]); } catch (e) { }
    const p = pos(id);
    if (p && Math.hypot(p[0] - pl.x, p[1] - pl.y) <= 80) S.esito.ok++;
    else {   // piano B: posizione scritta direttamente
      try { papyrus("SetPosition", id, [pl.x, pl.y, pl.z]); } catch (e) { }
      const q = pos(id);
      if (q && Math.hypot(q[0] - pl.x, q[1] - pl.y) <= 80) S.esito.ok++; else S.esito.lontane++;
    }
    return id;
  }
  function vive(id, base) { try { return mp.get(id, "baseId") === parseInt(base, 16); } catch (e) { return false; } }
  function indicizza() {
    S.byRef = {};
    Object.keys(IDM.punti || {}).forEach(function (pid) { (IDM.punti[pid] || []).forEach(function (id) { if (id) S.byRef[id] = pid; }); });
  }
  function crea(rifai) {
    if (rifai || IDM.ver !== VER) {   // dati nuovi: le piante vecchie si spengono e si rifanno
      Object.keys(IDM.punti || {}).forEach(function (pid) { (IDM.punti[pid] || []).forEach(function (id) { try { papyrus("Disable", id, [false]); } catch (e) { } }); });
      IDM = { ver: VER, punti: {} }; S.raccolte = {};
    }
    const coda = [];
    D.points.forEach(function (p) {
      const ids = IDM.punti[p.id] || [];
      p.plants.forEach(function (pl, k) { if (!ids[k] || !vive(ids[k], pl.base)) coda.push({ pid: p.id, k: k, pl: pl }); });
      IDM.punti[p.id] = ids;
    });
    indicizza();
    if (!coda.length) { log("[INGREDIENTI] " + VER + ": tutte le " + Object.keys(S.byRef).length + " piante gia' al loro posto"); return; }
    log("[INGREDIENTI] " + VER + ": creo " + coda.length + " piante");
    S.esito = { ok: 0, lontane: 0, errori: 0 };
    let i = 0;
    const t = setInterval(function () {
      for (let c = 0; c < 8 && i < coda.length; c++, i++) {
        const q = coda[i];
        try { IDM.punti[q.pid][q.k] = posa(q.pl); } catch (e) { S.esito.errori++; if (S.esito.errori < 5) log("[INGREDIENTI] " + q.pid + " errore " + e); }
      }
      if (i >= coda.length) {
        clearInterval(t); salva(IDS, IDM); indicizza();
        log("[INGREDIENTI] piante create: " + S.esito.ok + " al loro posto, " + S.esito.lontane + " fuori posto, " + S.esito.errori + " errori");
      }
    }, 250);
  }

  // ---------- raccolta e rinascita
  function rinasci(id) { try { mpSet(id, "isHarvested", false); } catch (e) { try { mp.set(id, "isHarvested", false); } catch (e2) { } } delete S.raccolte[id]; }
  const prevAct = mp.onActivate;   // il controllo di Davide appena definito ([MAPPA], [GIGANTI], [RACCOLTA])
  mp.onActivate = function (target, caster) {
    const pid = S.byRef[target];
    if (pid) {
      try { if (mp.get(target, "isHarvested")) return false; } catch (e) { }
      const p = S.punti[pid];
      S.raccolte[target] = { t: Date.now(), min: p ? p.respawn_min : 30 };
      return true;   // raccolta normale del gioco (ingrediente al giocatore, pianta "raccolta"); non passa da [RACCOLTA]
    }
    return prevAct ? prevAct(target, caster) : true;
  };
  S.timer.push(setInterval(function () {
    const now = Date.now();
    Object.keys(S.raccolte).forEach(function (id) { const r = S.raccolte[id]; if (r.min > 0 && now - r.t >= r.min * 60000) rinasci(Number(id)); });
  }, 60000));

  // ---------- comandi di prova (ingredienti-cmd.txt)
  function primoGiocatore() { try { const u = onlineUsers()[0]; return u === undefined ? null : mp.getUserActor(u); } catch (e) { return null; } }
  S.timer.push(setInterval(function () {
    let cmd = ""; try { cmd = _fs.readFileSync(CMD, "utf8").trim(); } catch (e) { return; }
    if (!cmd) return;
    try { _fs.writeFileSync(CMD, ""); } catch (e) { }
    const parti = cmd.split(/\s+/);
    if (parti[0] === "stato") {
      let tot = 0, vivi = 0, posto = 0;
      D.points.forEach(function (p) {
        (IDM.punti[p.id] || []).forEach(function (id, k) {
          tot++; if (!vive(id, p.plants[k].base)) return; vivi++;
          const q = pos(id); if (q && Math.hypot(q[0] - p.plants[k].x, q[1] - p.plants[k].y) <= 80) posto++;
        });
      });
      esito("stato " + VER + ": " + D.points.length + " punti, " + tot + " piante registrate, " + vivi + " esistenti, " + posto + " al loro posto, " + Object.keys(S.raccolte).length + " raccolte in attesa di rinascere");
    } else if (parti[0] === "vicino") {
      const a = primoGiocatore(); const q = a ? pos(a) : null;
      if (!q) { esito("vicino: nessun giocatore collegato"); return; }
      const l = D.points.map(function (p) { return { id: p.id, d: Math.round(Math.hypot(p.center.x - q[0], p.center.y - q[1])) }; }).sort(function (x, y) { return x.d - y.d; }).slice(0, 5);
      esito("vicino:\n" + l.map(function (x) { return x.id + "  " + x.d + " unita'"; }).join("\n"));
    } else if (parti[0] === "tp" && parti[1]) {
      const p = S.punti[parti[1]]; const a = primoGiocatore();
      if (!p || !a) { esito("tp: punto o giocatore non trovato"); return; }
      try { mpSet(a, "locationalData", { cellOrWorldDesc: WORLD, pos: [p.center.x, p.center.y, p.center.z + 60], rot: [0, 0, 0] }); esito("tp: portato su " + p.id); } catch (e) { esito("tp errore " + e); }
    } else if (parti[0] === "rifai") {
      esito("rifai: spengo e ricreo tutte le piante"); crea(true);
    } else esito("comando sconosciuto: " + cmd + " (stato | vicino | tp <id> | rifai)");
  }, 5000));

  // ---------- avvio: al riavvio rinascono tutte, poi si controllano/creano le piante
  S.timer.push(setTimeout(function () {
    try { indicizza(); Object.keys(S.byRef).forEach(function (id) { rinasci(Number(id)); }); crea(false); }
    catch (e) { log("[INGREDIENTI] avvio fallito: " + e); }
  }, 20000));
  log("[INGREDIENTI] caricato: " + D.points.length + " punti, versione " + VER);
})();
