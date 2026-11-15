// ESTRATTO (solo lettura) dei blocchi Reborn RP per la mappa, dentro skymp5-client.js (versione cl_v18, 15/11/2026).
// Il file vero sta in: Skyrim Special Edition 1.7.104 BACKUP\Data\Platform\Plugins\skymp5-client.js
// Blocchi: [RB-MAPPA] mappa pulita, [RB-MAPPA-TEST] test pilotati dal server, [RB-CONFINI] avviso fuori confini.
// Non si esegue da solo: usa le variabili interne del client SkyMP.

// [RB-MAPPA] mappa pulita: nasconde i marcatori dei luoghi eliminati (mappa + bussola), chiude le porte dei loro dungeon, comando admin sblocca_tutto
(function () {
    var sp = skyrimPlatform__WEBPACK_IMPORTED_MODULE_0__;
    var emitter = function () { return _services_spApiInteractor__WEBPACK_IMPORTED_MODULE_13__.SpApiInteractor.getControllerInstance().emitter; };
    var send = function (o) { try { emitter().emit("sendMessage", { message: { t: 1, contentJsonDump: JSON.stringify(o) }, reliability: "reliable" }); } catch (e) { } };
    var js = function (code) { try { sp.browser.executeJavaScript(code); } catch (e) { } };
    var M = { hide: [], lock: [], have: false, unlock: false, hi: 0, li: 0, lastTick: 0, lastHi: 0, reg: false, keyUntil: 0, nHide: 0, nLock: 0, nOk: 0, nErr: 0, lastRep: 0, lockSet: {}, applied: -1, uh: [], ul: [], reen: {}, stub: [], orig: {}, pend: {}, stubSet: {}, ro: [], roi: 0, uhSet: {}, kp: [], kpi: 0, kei: 0, rev: {}, wasUnlock: false, capSet: {} };
    try { Function("return this")().__rbM = M; } catch (e) { }
    function keyBanner(text) {
        M.bannerOn = !!text;
        js("(function(){var d=document.getElementById('rbKey');if(!d){d=document.createElement('div');d.id='rbKey';d.style.cssText='position:fixed;left:50%;top:30%;transform:translateX(-50%);padding:22px 38px;text-align:center;z-index:99999;font:bold 30px Georgia,serif;color:#f2e6c9;background:rgba(20,14,8,0.88);border:3px solid #b8964e;border-radius:10px;box-shadow:0 0 24px #000;pointer-events:none;';document.body.appendChild(d);}d.style.display=" + (text ? "'block'" : "'none'") + ";d.textContent=" + JSON.stringify(text || "") + ";})()");
    }
    function ref(id) { try { var f = sp.Game.getFormEx(id); return f ? sp.ObjectReference.from(f) : null; } catch (e) { return null; } }
    function hideOne(id) { if (M.stubSet[id]) return; var r = ref(id); if (!r) { M.nErr++; return; } try { if (!r.isDisabled()) { r.disable(false); M.nHide++; M.reen[id] = (M.reen[id] || 0) + 1; if (M.reen[id] >= 2 && !(M.grace && Date.now() < M.grace) && !M.stubSet[id]) { M.stub.push(id); M.stubSet[id] = 1; } } M.nOk++; } catch (e) { M.nErr++; } }
    // marcatori "testardi": il gioco non li lascia spegnere (riaccesi subito) -> si spostano lontano dalla mappa (solo sul client), e tornano al loro posto con sblocca_tutto
    function stubAway(id) { var r = ref(id); if (!r) return; try { var x = r.getPositionX(); if (x !== -400000) { if (!M.orig[id]) M.orig[id] = [x, r.getPositionY(), r.getPositionZ()]; r.setPosition(-400000, -400000, -30000); } } catch (e) { } }
    function stubBack(id) { var r = ref(id); var o = M.orig[id]; if (!r || !o) return; try { if (r.getPositionX() === -400000) r.setPosition(o[0], o[1], o[2]); try { if (r.isDisabled()) r.enable(false); } catch (e2) { } } catch (e) { } }
    function hideParent(id) { var r = ref(id); if (!r) return; try { if (!r.isDisabled()) r.disable(false); } catch (e) { } }   // accampamenti militari (lore: non esistono)
    function showOne(id) { var r = ref(id); if (!r) return; try { if (r.isDisabled()) { var t = Date.now(); if (t - (M.pend[id] || 0) < 3000) return; M.pend[id] = t; r.enable(false); } } catch (e) { } }   // enable e' "latente": non lo richiamo finche' il primo non ha effetto
    function lockOne(id) { var r = ref(id); if (!r) { M.nErr++; return; } try { if (!r.isLocked() || r.getLockLevel() < 255) { r.lock(true, false); r.setLockLevel(255); M.nLock++; } M.nOk++; } catch (e) { M.nErr++; } }
    // vista admin: mostra sulla mappa un luogo tenuto. Se l'admin non l'aveva ancora scoperto, lo segna "nuovo" (sparira' di nuovo quando spegne sblocca_tutto)
    function revealOne(id) { if (M.capSet[id]) return; var r = ref(id); if (!r) return; try { if (M.rev[id] === "spento") { r.enable(false); M.rev[id] = "nuovo"; } var vis = false; try { vis = r.isMapMarkerVisible(); } catch (e2) { } if (!vis) { if (!M.rev[id]) M.rev[id] = "nuovo"; r.addToMap(false); } } catch (e) { } }
    function reopenOne(id) { var r = ref(id); if (!r) return; try { if (r.isLocked() && r.getLockLevel() >= 255) { r.setLockLevel(0); r.lock(false, false); } } catch (e) { } }   // solo porte chiuse da noi (livello 255)
    function unlockOne(id) { var r = ref(id); if (!r) return; try { if (r.isLocked() || r.getLockLevel() !== 0) { r.setLockLevel(0); r.lock(false, false); } } catch (e) { } }
    function tick() {
        var now = Date.now();
        if (now - M.lastTick < 200) return; M.lastTick = now;
        if (!M.have) { if (now - M.lastHi > 5000) { M.lastHi = now; send({ customPacketType: "rbMappaHi", have: false }); } return; }
        var i, n;
        // PORTE: sempre chiuse quelle dei luoghi tolti (sblocca_tutto NON apre le serrature)
        n = Math.min(40, M.lock.length);
        for (i = 0; i < n; i++) { lockOne(M.lock[M.li]); M.li = (M.li + 1) % M.lock.length; }
        // porte dei luoghi tenuti che una versione vecchia aveva chiuso: riaperte
        n = Math.min(20, M.ro.length);
        for (i = 0; i < n; i++) { reopenOne(M.ro[M.roi]); M.roi = (M.roi + 1) % M.ro.length; }
        if (M.keyUntil && now > M.keyUntil) { M.keyUntil = 0; keyBanner(""); }
        if (M.hp) M.hp.forEach(hideParent);
        if (M.unlock && !M.wasUnlock) { M.wasUnlock = true; M.kpi = 0; }
        if (M.unlock) {   // vista admin: sulla mappa compaiono TUTTI i luoghi tenuti (anche quelli non ancora scoperti); i luoghi tolti restano nascosti
            n = Math.min(20, M.kp.length); for (i = 0; i < n && M.kpi < M.kp.length; i++) revealOne(M.kp[M.kpi++]);
        } else if (M.wasUnlock) {   // vista admin spenta: tornano nascosti i luoghi tenuti che l'admin non aveva ancora scoperto
            M.wasUnlock = false; M.reen = {}; M.pend = {}; M.grace = now + 8000;
            Object.keys(M.rev).forEach(function (k) { if (M.rev[k] === "nuovo") { var r = ref(Number(k)); if (r) { try { r.disable(false); } catch (e) { } } M.rev[k] = "spento"; } });
        }
        // i luoghi tenuti devono restare accesi (cosi' compaiono sulla mappa quando il giocatore li scopre)
        n = Math.min(15, M.kp.length); for (i = 0; i < n; i++) { var kid = M.kp[M.kei % M.kp.length]; M.kei = (M.kei + 1) % M.kp.length; if (M.rev[kid] !== "spento") showOne(kid); }
        for (i = 0; i < M.stub.length; i++) stubAway(M.stub[i]);
        n = Math.min(120, M.hide.length);
        for (i = 0; i < n; i++) { hideOne(M.hide[M.hi]); M.hi = (M.hi + 1) % M.hide.length; }
        if (now - M.lastRep > 20000) { M.lastRep = now; var top = Object.keys(M.reen).sort(function (a, b) { return M.reen[b] - M.reen[a]; }).slice(0, 6).map(function (k) { return Number(k).toString(16) + "x" + M.reen[k]; }).join(","); send({ customPacketType: "rbMappaHi", have: true, hide: M.hide.length, lock: M.lock.length, nHide: M.nHide, nLock: M.nLock, nOk: M.nOk, nErr: M.nErr, top: top, nIds: Object.keys(M.reen).length }); }
    }

    try {
        sp.on("menuOpen", function (e) {
            try {
                var nm = e && e.name; if (nm !== "MapMenu" && nm !== "TweenMenu" && nm !== "Journal Menu") return;
                if (!M.have || M.unlock) return;
                M.hide.forEach(hideOne);
            } catch (err) { }
        });
    } catch (e) { }
    try {
        sp.on("update", function () {
            if (!M.reg) {
                try {
                    emitter().on("customPacketMessage", function (e) {
                        try {
                            var c = JSON.parse(e.message.contentJsonDump);
                            if (c.customPacketType === "rbMappa") {
                                if (c.first) { M.hide = []; M.lock = []; M.uh = []; M.ul = []; M.ro = c.ro || []; M.roi = 0; M.kp = c.kp || []; M.capSet = {}; (c.cap || []).forEach(function (x) { M.capSet[x] = 1; }); M.hp = c.hp || []; (c.st || []).forEach(function (s) { if (!M.stubSet[s]) { M.stub.push(s); M.stubSet[s] = 1; } }); M.have = false; }
                                M.hide = M.hide.concat(c.hide || []); M.lock = M.lock.concat(c.lock || []); M.uh = M.uh.concat(c.uh || []); M.ul = M.ul.concat(c.ul || []);
                                if (c.last) { M.have = true; M.reen = {}; M.grace = Date.now() + 8000; M.uhSet = {}; for (var u = 0; u < M.uh.length; u++) M.uhSet[M.uh[u]] = 1; M.hi = 0; M.li = 0; M.lockSet = {}; for (var k = 0; k < M.lock.length; k++) M.lockSet[M.lock[k]] = 1; M.applied = -1; }
                            } else if (c.customPacketType === "rbMappaSblocca") {
                                M.unlock = !!c.on; M.applied = -1;
                                try { sp.Debug.notification(M.unlock ? "Vista admin: vedi sulla mappa tutti i luoghi tenuti (le porte chiuse restano chiuse)" : "Mappa dei giocatori ripristinata"); } catch (e2) { }
                            }
                        } catch (err) { }
                    });
                    M.reg = true;
                } catch (err) { }
            }
            try { tick(); } catch (err) { }
        });
    } catch (e) { }
    try {
        var _cLast = 0, _cRef = 0, _cSince = 0, _cLog = 0;
        sp.on("update", function () {
            try {
                var now = Date.now(); if (now - _cLast < 100) return; _cLast = now;
                var t = sp.Game.getCurrentCrosshairRef();
                var id = t ? t.getFormID() : 0;
                if (id !== _cRef) { _cRef = id; _cSince = now; }
                if (id && M.have && M.lockSet[id] && now - _cSince > 250) { keyBanner("Ti serve la chiave per aprire questa serratura"); M.keyUntil = now + 1500; }
            } catch (err) { }
        });
    } catch (e) { }
    try {
        sp.on("buttonEvent", function (e) {
            try {
                if (!e || e.code !== 18) return;   // tasto E (attiva)
                var t0 = sp.Game.getCurrentCrosshairRef();
                if (!(e.isDown || e.isPressed)) return;
                var t = t0; if (!t) return;
                if (!M.lockSet[t.getFormID()]) return;
                if (!M.have) return;
                keyBanner("Ti serve la chiave per aprire questa serratura"); M.keyUntil = Date.now() + 3000;
            } catch (err) { }
        });
    } catch (e) { }
    try {
        sp.on("activate", function (e) {
            try {
                if (!M.have) return;
                var t = e.target; if (!t) return;
                if (!M.lockSet[t.getFormID()]) return;
                var c = e.caster; if (c && c.getFormID() !== 0x14) return;
                keyBanner("Ti serve la chiave per aprire questa serratura"); M.keyUntil = Date.now() + 3000;
            } catch (err) { }
        });
    } catch (e) { }
})();
// [RB-MAPPA-TEST] test della mappa pilotati dal server (autotest-cmd.txt: "mappa ..."): niente tasti da premere
(function () {
    var sp = skyrimPlatform__WEBPACK_IMPORTED_MODULE_0__;
    var emitter = function () { return _services_spApiInteractor__WEBPACK_IMPORTED_MODULE_13__.SpApiInteractor.getControllerInstance().emitter; };
    var send = function (o) { try { o.customPacketType = "rbMappaTestRes"; emitter().emit("sendMessage", { message: { t: 1, contentJsonDump: JSON.stringify(o) }, reliability: "reliable" }); } catch (e) { } };
    var G = Function("return this")();
    var Q = [], reg = false, later = [];
    function ref(id) { try { var f = sp.Game.getFormEx(id); return f ? sp.ObjectReference.from(f) : null; } catch (e) { return null; } }
    function where() {
        var p = sp.Game.getPlayer(); var c = p.getParentCell(); var w = p.getWorldSpace();
        return { cell: c ? c.getFormID().toString(16) : "-", interno: c ? c.isInterior() : null, ws: w ? w.getFormID().toString(16) : "-", x: Math.round(p.getPositionX()), y: Math.round(p.getPositionY()), z: Math.round(p.getPositionZ()) };
    }
    function info(id) {
        var r = ref(id); if (!r) return { id: id.toString(16), trovato: false };
        var p = sp.Game.getPlayer(); var o = { id: id.toString(16), trovato: true };
        try { o.chiusa = r.isLocked(); o.livello = r.getLockLevel(); } catch (e) { }
        try { o.disattivato = r.isDisabled(); } catch (e) { }
        try { o.dist = Math.round(p.getDistance(r)); } catch (e) { }
        try { var b = r.getBaseObject(); o.base = b.getFormID().toString(16); o.tipo = b.getType(); } catch (e) { }
        return o;
    }
    function run(c) {
        var M = G.__rbM || {}; var p = sp.Game.getPlayer();
        if (c.op === "stato") {
            var lk = { tot: 0, nonTrovate: 0, chiuse255: 0, aperte: 0 }, hd = { tot: 0, nonTrovati: 0, nascosti: 0, visibili: 0 }, nonChiuse = [];
            (M.lock || []).forEach(function (id) { lk.tot++; var r = ref(id); if (!r) { lk.nonTrovate++; return; } try { if (r.isLocked() && r.getLockLevel() >= 255) lk.chiuse255++; else { lk.aperte++; if (nonChiuse.length < 30) nonChiuse.push(id.toString(16)); } } catch (e) { lk.nonTrovate++; } });
            var visib = []; (M.hide || []).forEach(function (id) { hd.tot++; var r = ref(id); if (!r) { hd.nonTrovati++; return; } try { if (r.isDisabled()) hd.nascosti++; else { hd.visibili++; if (visib.length < 30) visib.push(id.toString(16)); } } catch (e) { hd.nonTrovati++; } });
            var kv = { tot: 0, sullaMappa: 0, spenti: 0, nonTrovati: 0 }; (M.kp || []).forEach(function (id) { kv.tot++; var r = ref(id); if (!r) { kv.nonTrovati++; return; } try { if (r.isDisabled()) { kv.spenti++; (kv.listaSpenti = kv.listaSpenti || []).push(id.toString(16)); } else if (r.isMapMarkerVisible()) kv.sullaMappa++; else (kv.nonMostrati = kv.nonMostrati || []).push(id.toString(16)); } catch (e) { } });
            var cf = G.__rbConf || {};
            send({ op: "stato", ver: "cl_v18", tenuti: kv, have: !!M.have, sblocca: !!M.unlock, porte: lk, porteNonChiuse: nonChiuse, marcatori: hd, marcatoriVisibili: visib, spostati: M.stub.map(function (s) { var q = ref(s); return s.toString(16) + (q ? (q.getPositionX() === -400000 ? ":via" : ":al-posto") : ":?"); }), fuoriConfini: !!cf.out, avvisoConfini: !!cf.shown, avvisoChiave: !!M.bannerOn, dove: where() });
        } else if (c.op === "porta") {
            var r = ref(c.id); var before = info(c.id); var w0 = where();
            if (!r) { send({ op: "porta", prima: before, esito: "porta non caricata" }); return; }
            try { r.activate(p, false); } catch (e) { send({ op: "porta", prima: before, esito: "errore activate " + e }); return; }
            later.push({ at: Date.now() + 6000, fn: function () { var w1 = where(); send({ op: "porta", prima: before, dovePrima: w0, doveDopo: w1, entrato: (w1.cell !== w0.cell && w1.interno === true) }); } });
        } else if (c.op === "guarda") {
            var r2 = ref(c.id); if (!r2) { send({ op: "guarda", esito: "non caricato", id: c.id.toString(16) }); return; }
            try { var h = p.getHeadingAngle(r2); p.setAngle(0, 0, p.getAngleZ() + h); } catch (e) { }
            later.push({ at: Date.now() + 1500, fn: function () { var t = sp.Game.getCurrentCrosshairRef(); send({ op: "guarda", porta: info(c.id), mirino: t ? t.getFormID().toString(16) : "-", avvisoChiave: !!(G.__rbM || {}).bannerOn }); } });
        } else if (c.op === "prova") {   // prova a spegnere un marcatore con metodi diversi e dice cosa succede
            var r4 = ref(c.id); if (!r4) { send({ op: "prova", esito: "non trovato" }); return; }
            var o4 = { id: c.id.toString(16), prima: r4.isDisabled() };
            try { r4.disable(false); o4.dopoDisable = r4.isDisabled(); } catch (e) { o4.errDisable = String(e); }
            try { if (r4.disableNoWait) { r4.disableNoWait(false); o4.dopoNoWait = r4.isDisabled(); } else o4.noWait = "assente"; } catch (e) { o4.errNoWait = String(e); }
            try { o4.haParent = !!r4.getEnableParent; } catch (e) { }
            later.push({ at: Date.now() + 50, fn: function () { var q = ref(c.id); o4.dopo50ms = q ? q.isDisabled() : "?"; } });
            later.push({ at: Date.now() + 1000, fn: function () { var q = ref(c.id); o4.dopo1s = q ? q.isDisabled() : "?"; send({ op: "prova", r: o4 }); } });
        } else if (c.op === "sposta") {   // sposta un marcatore (prova) lontano dalla mappa
            var r5 = ref(c.id); if (!r5) { send({ op: "sposta", esito: "non trovato" }); return; }
            var o5 = { id: c.id.toString(16), x0: r5.getPositionX(), y0: r5.getPositionY() };
            try { r5.setPosition(c.x, c.y, c.z); } catch (e) { o5.err = String(e); }
            later.push({ at: Date.now() + 1000, fn: function () { var q = ref(c.id); o5.x1 = q.getPositionX(); o5.y1 = q.getPositionY(); send({ op: "sposta", r: o5 }); } });
        } else if (c.op === "esci") {   // torna fuori: attiva la porta di uscita indicata
            var r3 = ref(c.id); if (!r3) { send({ op: "esci", esito: "porta non caricata" }); return; }
            try { r3.activate(p, false); } catch (e) { }
            later.push({ at: Date.now() + 6000, fn: function () { send({ op: "esci", dove: where() }); } });
        }
    }
    try {
        sp.on("update", function () {
            if (!reg) { try { emitter().on("customPacketMessage", function (e) { try { var c = JSON.parse(e.message.contentJsonDump); if (c.customPacketType === "rbMappaTest") Q.push(c); } catch (err) { } }); reg = true; } catch (err) { } }
            try { while (Q.length) run(Q.shift()); } catch (err) { send({ op: "errore", msg: String(err) }); }
            try { var now = Date.now(); for (var i = later.length - 1; i >= 0; i--) if (now >= later[i].at) { var f = later[i].fn; later.splice(i, 1); f(); } } catch (err) { send({ op: "errore", msg: String(err) }); }
        });
    } catch (e) { }
})();
// [RB-CONFINI] avviso rosso quando il giocatore esce dai confini della mappa di gioco (finche' non rientra)
(function () {
    var sp = skyrimPlatform__WEBPACK_IMPORTED_MODULE_0__;
    var POLY = [[74925, 83751], [73740, 81744], [71368, 73354], [71095, 63869], [73284, 61042], [70000, 57394], [69636, 50645], [67173, 45264], [67720, 30125], [69088, 26751], [69362, 23832], [57597, 11338], [57688, -143611], [60607, -141513], [63343, -144249], [64711, -144705], [78573, -144432], [83498, -145344], [86052, -144158], [88332, -144523], [89700, -143976], [90064, -142152], [93804, -138413], [99276, -144067], [109399, -143155], [115874, -144979], [127821, -150816], [131652, -149995], [133840, -150542], [135300, -149813], [137944, -151910], [143508, -152549], [145788, -153917], [201237, -153917], [204520, -153005], [207895, -149630], [210266, -149721], [213184, -147168], [217288, -145709], [221484, -145253], [221575, -80318], [220572, -71837], [218200, -67824], [218292, -65635], [215647, -60072], [214644, -59342], [213093, -59707], [209080, -55877], [206983, -55877], [202240, -50587], [202605, -49310], [209263, -42379], [208989, -39734], [211999, -36725], [214826, -30888], [214735, -26966], [213093, -24869], [214735, -22315], [217380, 3677], [214917, 7143], [215373, 39336], [217744, 53746], [217836, 77367], [217106, 83751], [163389, 83842], [162933, 82109], [164392, 80467], [160653, 76728], [156276, 79464], [152263, 79008], [146882, 83842], [117607, 83842], [117333, 83203], [119887, 80650], [116056, 76819], [112317, 80559], [114962, 83203], [114688, 83842]];
    var TXT = "ATTENZIONE: torna nell'area delimitata della mappa. Stai entrando in una zona ad ALTISSIMO rischio permadeath, oppure in una parte di gioco ancora non implementata";
    var st = { shown: false, last: 0, out: false, cnt: 0 };
    try { Function("return this")().__rbConf = st; } catch (e) { }
    function inside(x, y) {
        var ins = false, n = POLY.length, j = n - 1;
        for (var i = 0; i < n; i++) {
            var xi = POLY[i][0], yi = POLY[i][1], xj = POLY[j][0], yj = POLY[j][1];
            if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
            j = i;
        }
        return ins;
    }
    function js(code) { try { sp.browser.executeJavaScript(code); } catch (e) { } }
    function show(on) {
        if (st.shown === on) return; st.shown = on;
        js("(function(){var d=document.getElementById('rbOut');if(!d){d=document.createElement('div');d.id='rbOut';d.style.cssText='position:fixed;left:50%;top:70px;transform:translateX(-50%);max-width:78%;padding:14px 26px;text-align:center;z-index:99998;font:bold 24px Georgia,serif;color:#ff3b30;background:rgba(15,5,5,0.80);border:2px solid #b3261e;border-radius:8px;text-shadow:0 0 6px #000;pointer-events:none;';d.textContent=" + JSON.stringify(TXT) + ";document.body.appendChild(d);}d.style.display=" + (on ? "'block'" : "'none'") + ";})()");
    }
    try {
        sp.on("update", function () {
            var now = Date.now();
            if (now - st.last < 500) return; st.last = now;
            try {
                var p = sp.Game.getPlayer(); if (!p) return;
                var ws = p.getWorldSpace(); var cell = p.getParentCell();
                var out = false;
                if (ws && ws.getFormID() === 0x3c && cell && !cell.isInterior()) out = !inside(p.getPositionX(), p.getPositionY());
                // 2 controlli di fila uguali, per non far lampeggiare l'avviso durante i caricamenti
                if (out === st.out) st.cnt++; else { st.out = out; st.cnt = 0; }
                if (st.cnt >= 1) show(out);
            } catch (e) { }
        });
    } catch (e) { }
})();
