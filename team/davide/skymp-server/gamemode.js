// Reborn RP - creature spawnate da console
//  * cadavere visibile al massimo 30 secondi, poi sparisce (non risorge)
//  * il loot della creatura si prende premendo E sul cadavere
//  * log su file "npc-log.txt" (stessa cartella del server)

const CORPSE_MS = 30000;
const INVALID_USER = 65535;      // UserId a 16 bit: 65535 = nessun giocatore
const LOOT_DISTANCE = 450;       // unità di gioco (circa 6 metri)

// ---------- log su file ----------
let _fs = null;
try { _fs = require("fs"); } catch (e) {}
if (!global.__rbOrigLog) global.__rbOrigLog = console.log;
function log(...a) {
  // niente console.log: se la finestra del server viene cliccata (selezione) Windows blocca tutto il server
  try { if (_fs) _fs.appendFileSync("npc-log.txt", new Date().toISOString() + " " + a.join(" ") + "\n"); } catch (e) {}
}

// ---------- scatola nera: ogni scrittura nativa (set/place/destroyActor) viene annotata PRIMA di partire in npc-trace.txt.
// Se il server crolla, l'ultima riga dice quale chiamata lo ha fatto cadere.
try { if (_fs && _fs.existsSync("npc-trace.txt") && _fs.statSync("npc-trace.txt").size > 3000000) _fs.writeFileSync("npc-trace.txt", ""); } catch (e) {}
function bbox(n, args) {
  try {
    const a = Array.prototype.map.call(args, function (x) { try { return typeof x === "object" ? JSON.stringify(x).slice(0, 140) : String(x); } catch (e) { return "?"; } }).join(" | ");
    _fs.appendFileSync("npc-trace.txt", new Date().toISOString() + " " + n + " " + a + "\n");
  } catch (e) {}
}
function mpSet() { bbox("set", arguments); return mp.set.apply(mp, arguments); }
function mpPlace() { bbox("place", arguments); return mp.place.apply(mp, arguments); }
function mpDestroy() { bbox("destroyActor", arguments); return mp.destroyActor.apply(mp, arguments); }

function isPlayer(actorId) {
  try {
    const u = mp.getUserByActor(actorId);
    return u !== undefined && u !== null && u !== INVALID_USER && u !== 4294967295 && u !== -1;
  } catch (e) {
    return false;
  }
}

function dist(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// ---------- niente oggetti magici/incantati: vengono sostituiti con la versione normale o tolti ----------
// Tabella "magic-swap.json" (stessa cartella del server): idOggetto -> idSostituto (0 = togliere dal loot).
// Contiene: oggetti incantati (-> versione normale), bastoni, pergamene, tomi di incantesimi e gemme dell'anima (tolti).
let _swap = null;
function getSwap() {
  if (_swap) return _swap;
  try { _swap = JSON.parse(_fs.readFileSync("magic-swap.json", "utf8")); log("[MAGIA] tabella caricata: " + Object.keys(_swap).length + " oggetti"); }
  catch (e) { log("[MAGIA] tabella NON caricata: " + e); _swap = {}; }
  return _swap;
}
function sanitizeInventory(actorId, tag) {
  try {
    const swap = getSwap();
    const inv = mp.get(actorId, "inventory");
    if (!inv || !inv.entries) return;
    let rep = 0, rem = 0; const out = [];
    for (const e of inv.entries) {
      const r = swap[String(e.baseId)];
      if (r === undefined) { out.push(e); continue; }
      if (!r) { rem++; continue; }
      rep++;
      const ne = Object.assign({}, e, { baseId: r });
      const ex = out.find(x => x.baseId === r && !!x.worn === !!ne.worn);
      if (ex) ex.count += ne.count; else out.push(ne);
    }
    if (rep || rem) {
      mpSet(actorId, "inventory", { entries: out });
      log("[MAGIA] " + tag + " " + actorId.toString(16) + ": sostituiti " + rep + ", tolti " + rem);
    }
  } catch (e) { log("[MAGIA] errore " + e); }
}

// ---------- morte: cadavere sparisce dopo 30 s ----------
mp.onDeath = function (actorId, killerId) {
  try {
    if (isPlayer(actorId)) return;
    global.__rbCorpseNext = 0;
    try { if (global.__rbFortDeath) global.__rbFortDeath(actorId, killerId); } catch (e) { log("[FORTI] errore morte: " + e); }
    const _corpseMs = global.__rbCorpseNext || 0; global.__rbCorpseNext = 0;
    log("[NPC] morto " + actorId.toString(16) + " killer " + killerId);

    // non risorgere dopo 25 s
    try { mpSet(actorId, "spawnDelay", 100000); } catch (e) { log("[NPC] spawnDelay: " + e); }

    // il server aggiunge il loot un istante DOPO l'evento: registro cosa c'è sul cadavere
    setTimeout(function () {
      try {
        sanitizeInventory(actorId, "morte");
        const inv = mp.get(actorId, "inventory");
        log("[NPC] loot sul cadavere " + actorId.toString(16) + ": " + JSON.stringify(inv && inv.entries ? inv.entries.map(e => e.baseId.toString(16) + "x" + e.count) : []));
      } catch (e) { log("[NPC] lettura loot: " + e); }
    }, 800);

    setTimeout(function () {
      try {
        if (!mp.get(actorId, "isDead")) { log("[NPC] cadavere " + actorId.toString(16) + " NON rimosso: l'id e' gia' di un altro attore vivo"); return; }
        mpDestroy(actorId);
        log("[NPC] cadavere rimosso " + actorId.toString(16));
      } catch (e) {
        log("[NPC] destroyActor fallito (" + e + "), provo a disabilitare");
        try { mpSet(actorId, "isDisabled", true); } catch (e2) { log("[NPC] anche disable fallito: " + e2); }
      }
    }, _corpseMs || global.__rbCorpseMs || CORPSE_MS);
  } catch (e) {
    log("[NPC] errore onDeath: " + e);
  }
};

// ---------- tasto E sul cadavere ----------
function doLoot(userId, targetId, skipDist) {
  const looterId = mp.getUserActor(userId);
  if (!targetId || !looterId) return;
  if (isPlayer(targetId)) return;                       // non si lootano i giocatori
  if (!mp.get(targetId, "isDead")) return;              // solo cadaveri

  const d = dist(mp.get(targetId, "pos"), mp.get(looterId, "pos"));
  if (!skipDist && d > LOOT_DISTANCE) { log("[NPC] E troppo lontano: " + Math.round(d)); return; }

  sanitizeInventory(targetId, "loot");
  const npcInv = mp.get(targetId, "inventory");
  if (!npcInv || !npcInv.entries || npcInv.entries.length === 0) {
    mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "rbNotify", text: "Non c'è niente da lootare." }));
    return;
  }
  const items = npcInv.entries.filter(it => !it.worn).map(it => ({ baseId: it.baseId, count: it.count }));
  log("[NPC] loot (E) " + items.length + " tipi di oggetto da " + targetId.toString(16) + ": " + JSON.stringify(items.map(i => i.baseId.toString(16) + "x" + i.count)));
  mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "rbLootData", target: targetId, items: items, titolo: (function () { try { return mp.get(targetId, "private.rbTitle") || undefined; } catch (e) { return undefined; } })() }));
  // controllo: cosa risulta nell'inventario del giocatore dopo qualche secondo
  setTimeout(function () {
    try {
      const pi = mp.get(looterId, "inventory");
      log("[LOOTCHK] inventario giocatore: " + JSON.stringify((pi.entries || []).filter(e => items.some(i => i.baseId === e.baseId)).map(e => e.baseId.toString(16) + "x" + e.count)));
    } catch (e) { log("[LOOTCHK] errore " + e); }
  }, 10000);
}

function applyTaken(userId, targetId, taken) {
  const looterId = mp.getUserActor(userId);
  if (!targetId || !looterId || isPlayer(targetId)) return;
  if (!mp.get(targetId, "isDead")) return;
  if (dist(mp.get(targetId, "pos"), mp.get(looterId, "pos")) > 3000) return;
  const corpse = mp.get(targetId, "inventory") || { entries: [] };
  const inv = mp.get(looterId, "inventory") || { entries: [] };
  const moved = [];
  for (const t of taken) {
    const ce = corpse.entries.find(e => e.baseId === t.baseId && !e.worn);
    if (!ce) continue;
    const n = Math.min(Number(t.count) || 0, ce.count);
    if (n <= 0) continue;
    ce.count -= n;
    const pe = inv.entries.find(e => e.baseId === t.baseId && !e.worn);
    if (pe) pe.count += n; else inv.entries.push({ baseId: t.baseId, count: n });
    moved.push(t.baseId.toString(16) + "x" + n);
  }
  corpse.entries = corpse.entries.filter(e => e.count > 0);
  mpSet(targetId, "inventory", corpse);
  mpSet(looterId, "inventory", inv);
  log("[LOOT] consegnati a " + looterId.toString(16) + ": " + JSON.stringify(moved) + " (restano sul cadavere " + corpse.entries.length + " tipi)");
}

global.__rbCustomPacket = function (userId, rawContent) {
  try {
    const content = JSON.parse(rawContent);
    if (content.customPacketType === "rbLootTaken") { applyTaken(userId, Number(content.target), content.taken || []); return; }
    if (content.customPacketType !== "rbLoot") return;
    doLoot(userId, Number(content.target), false);
  } catch (e) {
    log("[NPC] errore E: " + e);
  }
};

// ================== COMANDO evoca_<animale>_<quantità> ==================
// Si scrive nella console di Skyrim (tasto \ sulla tastiera italiana), es:  evoca_cervo_3
// Chi può usarlo: se STAFF_ONLY è true, solo i profileId in STAFF_PROFILE_IDS.
const STAFF_ONLY = false;
const STAFF_PROFILE_IDS = [];
const MAX_QTY = 10;
// Comandi di PROVA (test, ammazza, apri, inventario, cadavere, locanda, provatutti): spenti di default. Mettere true solo per fare test.
const TEST_COMMANDS = false;
const TEST_KEYS = ["test", "ammazza", "apri", "inventario", "cadavere", "locanda", "provatutti"];

// Skyrim = 0x00xxxxxx, Dawnguard = 0x02xxxxxx, Dragonborn = 0x04xxxxxx (ordine di caricamento del server)
const CREATURES = {
  // --- foresta e pianura ---
  cervo: 0x000CF89D, alce: 0x00023A91, alce_femmina: 0x000ABEDF,
  capra: 0x0002EBE2, capra_domestica: 0x0004359C,
  coniglio: 0x0006DC9D, lepre: 0x0006DC9D,
  volpe: 0x000829B3, volpe_artica: 0x000829B6,
  lupo: 0x00023ABE, lupo_di_ghiaccio: 0x00023ABF, lupo_rosso: 0x0010FE05,
  orso: 0x00023A8A, orso_delle_caverne: 0x00023A8B, orso_delle_nevi: 0x00023A8C,
  gatto_dai_denti_a_sciabola: 0x00023AB5, gatto_dai_denti_a_sciabola_delle_nevi: 0x00023AB6,
  skeever: 0x00023AB7,
  spriggan: 0x00023AB9, megera: 0x00023AB0,
  // --- acqua e coste ---
  granchio_di_fango: 0x000E4010, granchio_di_fango_grande: 0x000E4011, granchio_di_fango_gigante: 0x00021875,
  pesce_macellaio: 0x00023AB8, horker: 0x00023AB1,
  // --- montagna e neve ---
  mammut: 0x00023AB4, gigante: 0x00023AAE,
  troll: 0x00023ABA, troll_del_gelo: 0x00023ABB,
  ragno_del_gelo: 0x00023AAA, ragno_del_gelo_grande: 0x00041FB4, ragno_del_gelo_gigante: 0x00023AAB,
  spettro_di_ghiaccio: 0x00023AB3,
  // --- fattoria ---
  cavallo: 0x00068D5B, cavallo_nero: 0x00068D07, cavallo_grigio: 0x00068D6D,
  mucca: 0x00023A90, gallina: 0x000A91A0, cane: 0x00023A92,
  // --- Solstheim (Dragonborn) ---
  cinghiale: 0x0403284D,
  // --- Draugr e scheletri ---
  draugr: 0x00055944, draugr_inquieto: 0x0001FF1F, draugr_spettrale: 0x00038900, draugr_fustigatore: 0x00038953, signore_della_morte_draugr: 0x00038A12, scheletro: 0x0002D1DE,
  // --- Giganti e draghi ---
  gigante_del_gelo: 0x0200E25A, drago: 0x000F8115,
  // --- Banditi ---
  bandito_fuorilegge: 0x00039D01, bandito_picchiatore: 0x00039D09, bandito_predatore: 0x00039D19, capo_banditi: 0x0003DF02, bandito_mago: 0x00039D49,
  // --- Maghi e negromanti ---
  mago_del_fuoco_principiante: 0x00044CEB, mago_del_fuoco: 0x00045CAA, arcipiromante: 0x001091B3, mago_del_ghiaccio_principiante: 0x00045C76, mago_del_ghiaccio: 0x00045CB2, criomante_supremo: 0x001091C0, mago_della_tempesta_principiante: 0x00045C5E, mago_della_tempesta: 0x00045CBA, elettromante_supremo: 0x001091B6, negromante_principiante: 0x000551B7, negromante_specialista: 0x000551C7, maestro_negromante: 0x000551DF,
  // --- Rinnegati ---
  rinnegato: 0x000AD7B4, ladro_rinnegato: 0x000AD7B8, saccheggiatore_rinnegato: 0x000AD7BD, sciamano_rinnegato: 0x00043BED, signore_della_guerra_rinnegato: 0x000AD7C2,
  // --- Vampiri e licantropi ---
  vampiro_insanguinato: 0x0003386F, vampiro_camminatore_della_nebbia: 0x0003387D, vampiro_errante_della_notte: 0x00033882, antico_vampiro: 0x00033887, lupo_mannaro_selvaggio: 0x000A092B, lupo_mannaro_mutaforma: 0x000A092D, capobestia_lupo_mannaro: 0x000A092E,
  // --- Falmer e chaurus ---
  falmer: 0x00023A99, falmer_emissario_oscuro: 0x00023A9B, falmer_signore_delle_ombre: 0x00023A9D, chaurus: 0x000A5600, chaurus_mietitore: 0x00023A8F, chaurus_cacciatore: 0x02005204,
  // --- Thalmor ---
  soldato_thalmor: 0x000F9611, stregone_thalmor: 0x0007D966,
};

// Titolo italiano mostrato nella finestra del loot per le creature umane/non-animali
const TITLES = {
  draugr: "Draugr",
  draugr_inquieto: "Draugr inquieto",
  draugr_spettrale: "Draugr spettrale",
  draugr_fustigatore: "Draugr fustigatore",
  signore_della_morte_draugr: "Signore della morte draugr",
  scheletro: "Scheletro",
  gigante_del_gelo: "Gigante del gelo",
  drago: "Drago",
  bandito_fuorilegge: "Bandito fuorilegge",
  bandito_picchiatore: "Bandito picchiatore",
  bandito_predatore: "Bandito predatore",
  capo_banditi: "Capo dei banditi",
  bandito_mago: "Bandito mago",
  mago_del_fuoco_principiante: "Mago del fuoco principiante",
  mago_del_fuoco: "Mago del fuoco",
  arcipiromante: "Arcipiromante",
  mago_del_ghiaccio_principiante: "Mago del ghiaccio principiante",
  mago_del_ghiaccio: "Mago del ghiaccio",
  criomante_supremo: "Criomante Supremo",
  mago_della_tempesta_principiante: "Mago della tempesta principiante",
  mago_della_tempesta: "Mago della tempesta",
  elettromante_supremo: "Elettromante Supremo",
  negromante_principiante: "Negromante principiante",
  negromante_specialista: "Negromante specialista",
  maestro_negromante: "Maestro negromante",
  rinnegato: "Rinnegato",
  ladro_rinnegato: "Ladro Rinnegato",
  saccheggiatore_rinnegato: "Saccheggiatore Rinnegato",
  sciamano_rinnegato: "Sciamano Rinnegato",
  signore_della_guerra_rinnegato: "Signore della guerra Rinnegato",
  vampiro_insanguinato: "Vampiro insanguinato",
  vampiro_camminatore_della_nebbia: "Camminatore della Nebbia vampiro",
  vampiro_errante_della_notte: "Errante della Notte vampiro",
  antico_vampiro: "Antico vampiro",
  lupo_mannaro_selvaggio: "Lupo mannaro selvaggio",
  lupo_mannaro_mutaforma: "Lupo mannaro mutaforma",
  capobestia_lupo_mannaro: "Capobestia lupo mannaro",
  falmer: "Falmer",
  falmer_emissario_oscuro: "Falmer emissario oscuro",
  falmer_signore_delle_ombre: "Falmer signore delle ombre",
  chaurus: "Chaurus",
  chaurus_mietitore: "Chaurus mietitore",
  chaurus_cacciatore: "Chaurus cacciatore",
  soldato_thalmor: "Soldato Thalmor",
  stregone_thalmor: "Stregone Thalmor",
};

function normName(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9_]/g, "");
}

// ---------- le creature evocate spariscono al riavvio del server ----------
const EVOKED_FILE = "evoked-ids.json";
function readEvoked() {
  try { return JSON.parse(_fs.readFileSync(EVOKED_FILE, "utf8")); } catch (e) { return []; }
}
function writeEvoked(arr) {
  try { _fs.writeFileSync(EVOKED_FILE, JSON.stringify(arr)); } catch (e) { log("[EVOKED] scrittura fallita: " + e); }
}
function rememberEvoked(id) {
  const arr = readEvoked(); arr.push(id); writeEvoked(arr);
}
if (!global.__rbBootCleanupDone) {
  global.__rbBootCleanupDone = true;
  // Le creature evocate portano il segno "private.rbEvoked" (salvato col mondo). All'avvio si distruggono tutte quelle col segno.
  // LEGACY_MAX: vecchi NPC dei test fatti prima del segno (id 1..49). Da TOGLIERE prima di creare spawn automatici.
  const LEGACY_MAX = 0x31;
  const SCAN_MAX = 0x400;
  let destroyed = 0;
  for (let i = 1; i <= SCAN_MAX; i++) {
    const id = 0xff000000 + i;
    try {
      if (isPlayer(id)) continue;
      if (mp.get(id, "profileId") !== -1) continue;   // solo NPC, mai personaggi di giocatori
      const tagged = mp.get(id, "private.rbEvoked") === true;
      if (!tagged && i > LEGACY_MAX) continue;
      mpDestroy(id); destroyed++;
    } catch (e) { /* id inesistente */ }
  }
  writeEvoked([]);
  log("[EVOKED] all'avvio rimosse " + destroyed + " creature evocate");
}


// ================== ADMIN, GUERRA DEGLI ORCHI E FORTI ==================
// ADMIN: il giocatore con profileId in OWNER_PROFILE_IDS o in "admins.json" e' admin. Si dà con  dai_admin_<ID>  (ID = profileId, mostrato in basso a sinistra).
const OWNER_PROFILE_IDS = [1];
const ADMINS_FILE = "admins.json";
function readAdmins() { try { return JSON.parse(_fs.readFileSync(ADMINS_FILE, "utf8")); } catch (e) { return []; } }
function profileOfUser(userId) { try { const a = mp.getUserActor(userId); return a ? mp.get(a, "profileId") : -1; } catch (e) { return -1; } }
function isAdminProfile(pid) { return OWNER_PROFILE_IDS.includes(pid) || readAdmins().includes(pid); }
function isAdminUser(userId) { return isAdminProfile(profileOfUser(userId)); }
function sendTo(userId, obj) { try { mp.sendCustomPacket(userId, JSON.stringify(obj)); } catch (e) { log("[GUERRA] invio fallito a " + userId + ": " + e); } }

// Giocatori online (ogni client si fa vivo ogni 3 s con posizione e mondo)
global.__rbPlayers = global.__rbPlayers || {};
const PLAYERS = global.__rbPlayers;
function onlineUsers() {
  const now = Date.now(), out = [];
  Object.keys(PLAYERS).forEach(function (u) { if (now - PLAYERS[u].t < 12000) out.push(Number(u)); });
  return out;
}
function adminUsers() { return onlineUsers().filter(isAdminUser); }

// Orchi: base = bandito orco del gioco (aggressivo con i giocatori), nomi italiani
const ORC_BASE = { orco: 0x00039D23, orco_guerriero: 0x0003DE6B, orco_furioso: 0x0003DE84, orco_corazzato: 0x0003DEB4, orco_cacciatore: 0x000D944D, orco_capo: 0x0003DF0D };
const ORC_TITLES = { orco: "Orco", orco_guerriero: "Orco guerriero", orco_furioso: "Orco furioso", orco_corazzato: "Orco corazzato", orco_cacciatore: "Orco cacciatore", orco_capo: "Capo orco" };
Object.keys(ORC_BASE).forEach(function (k) { CREATURES[k] = ORC_BASE[k]; TITLES[k] = ORC_TITLES[k]; });

// Loot degli orchi: NIENTE armi/armature orchesche. 55% oricalco grezzo (1-3), 20% lingotti di oricalco (1-3).
// Capo (PROVVISORIO, da definire): 3-5 lingotti di oricalco sempre + 150 monete.
const ORE_ORICHALCUM = 0x0005ACDD, INGOT_ORICHALCUM = 0x0005AD99, GOLD = 0x0000000F;
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
global.__rbOrcs = global.__rbOrcs || {};
const ORCS = global.__rbOrcs;
const ORCISH_PIECES = [0x13959, 0x13958, 0x13957, 0x13956, 0x13946, 0x13992, 0x13991, 0x13990, 0x1398f, 0x1398e, 0x1398c, 0x1398b];   // equipaggiamento "di oricalco" (orchesco), senza incantesimi
function setOrcLoot(actorId, kind) {
  const entries = [];
  if (kind === "orco_capo") {
    entries.push({ baseId: ORE_ORICHALCUM, count: 5 });
    entries.push({ baseId: INGOT_ORICHALCUM, count: 2 });
    entries.push({ baseId: GOLD, count: rnd(300, 500) });
    if (Math.random() < 0.30) entries.push({ baseId: ORCISH_PIECES[Math.floor(Math.random() * ORCISH_PIECES.length)], count: 1 });
  } else {
    entries.push({ baseId: ORE_ORICHALCUM, count: rnd(1, 3) });
    if (Math.random() < 0.15) entries.push({ baseId: INGOT_ORICHALCUM, count: rnd(1, 2) });
    if (Math.random() < 0.45) entries.push({ baseId: GOLD, count: rnd(10, 20) });
  }
  mpSet(actorId, "inventory", { entries: entries });
  log("[ORCHI] loot " + actorId.toString(16) + ": " + JSON.stringify(entries.map(e => e.baseId.toString(16) + "x" + e.count)));
}

// ---- Forti ----
const WORLD = "3c:Skyrim.esm";
const INSIDE_COUNT = 20, INSIDE_RESPAWN_MS = 4000, PATROL_RESPAWN_MS = 3600000;   // 20 orchi per forte, sempre
const ACTIVATE_R = 18000, GREEN_R = 9500, RED_R = 5500, MAX_SPAWN_PER_TICK = 5;
const YELLOW_R = GREEN_R, HOLD_MS = 15000;   // zona gialla = 9500; dopo l'uscita dalla zona rossa gli orchi aspettano 15 s al confine
const FORTS = [
  { id: 1, name: "Forte di Windhelm", cx: 158054, cy: 10036, cz: -4470, target: 50, patrol: [[157573, 13022, -4676], [155834, 12236, -4875], [155502, 10461, -4889], [157273, 13322, -4676], [155534, 12536, -4875], [155202, 10761, -4889], [156589, 7810, -4752], [157922, 4943, -4198], [160206, 4549, -3668], [159407, 7844, -4038]] },
  { id: 2, name: "Forte di Riften", cx: 135308, cy: -110597, cz: 10760, target: 50, patrol: [[138916, -111379, 10268], [136930, -105548, 10868], [133422, -104482, 11057], [129908, -108318, 11642], [133799, -112693, 11170], [136674, -113447, 11033]] },
];
const FORT_STATE_FILE = "forts-state.json";
function loadFortState() { try { return JSON.parse(_fs.readFileSync(FORT_STATE_FILE, "utf8")); } catch (e) { return {}; } }
function saveFortState() { try { _fs.writeFileSync(FORT_STATE_FILE, JSON.stringify(global.__rbFortSt)); } catch (e) { log("[FORTI] salvataggio fallito " + e); } }
if (!global.__rbFortSt) global.__rbFortSt = {};   // il contatore riparte da 50 a ogni riavvio del server
// 20 punti "di casa" sparsi dentro la zona rossa: prima i punti di pattuglia noti (terreno valido), poi punti attorno al forte.
// Ogni posto ha anche un punto di rinascita DENTRO le mura del forte (i rimpiazzi nascono li', non si vedono apparire).
function buildSlots(f) {
  const homes = [];
  f.patrol.forEach(function (p) { if (Math.hypot(p[0] - f.cx, p[1] - f.cy) <= RED_R - 600) homes.push({ x: p[0], y: p[1], z: p[2] + 40 }); });
  // [v3] punti e quote letti da Skyrim.esm (altezza vera del terreno): niente piu' nascite sottoterra o in aria
  const RING = { 1: [[157280, 10745, -4471], [158185, 8542, -4157], [157463, 9932, -4510], [157666, 11485, -4442], [157084, 10438, -4489], [157534, 9736, -4501], [157194, 11265, -4471], [157799, 8103, -4294], [157005, 10082, -4586], [157668, 9576, -4491], [156825, 10896, -4616], [157053, 9720, -4592]],
    2: [[135908, -110597, 10762], [134534, -109888, 10790], [135439, -112091, 10784], [136495, -109050, 10634], [134717, -110701, 10855], [136194, -111161, 10764], [134920, -109148, 10730], [135872, -110392, 10766], [134338, -110195, 10887], [135942, -111956, 10744], [135894, -108737, 10639], [134788, -110897, 10848], [136333, -110824, 10770], [134448, -109368, 10788], [135768, -110211, 10742], [136369, -111658, 10756], [135223, -108649, 10645]] };
  const INS_Z = { 1: [-4046, -3826, -3717, -4114, -4115, -4221, -4440, -4442, -4461, -4466, -4498, -4513, -4489, -4489, -4446, -4407, -4268, -4193, -4141, -3848],
    2: [10752, 10765, 10746, 10753, 10737, 10726, 10759, 10774, 10755, 10790, 10821, 10870, 10838, 10842, 10836, 10784, 10780, 10762, 10751, 10760] };
  const ring = RING[f.id] || []; let k = 0;
  while (homes.length < INSIDE_COUNT && k < ring.length) { homes.push({ x: ring[k][0], y: ring[k][1], z: ring[k][2] + 60 }); k++; }
  const slots = [];
  for (let i = 0; i < INSIDE_COUNT; i++) {
    const a = i * (360 / INSIDE_COUNT) * Math.PI / 180, r = 350 + (i % 3) * 150, h = homes[i] || homes[homes.length - 1];
    slots.push({ id: 0, due: 0, fresh: true, x: f.cx + Math.cos(a) * r, y: f.cy + Math.sin(a) * r, z: (INS_Z[f.id] ? INS_Z[f.id][i] : f.cz) + 120, hx: h.x, hy: h.y, hz: h.z });
  }
  return slots;
}
if (!global.__rbSlots) global.__rbSlots = {};
FORTS.forEach(function (f) {
  if (!global.__rbFortSt[f.id]) global.__rbFortSt[f.id] = { kills: 0, conquered: false };
  const old = global.__rbSlots[f.id];
  if (old && old.v2 !== 3) {   // versione precedente (15 orchi, avvicinamento): si tolgono gli orchi vecchi e si rifanno i posti
    (old.inside || []).concat(old.patrol || []).forEach(function (sl) { if (sl.id) { try { mpDestroy(sl.id); } catch (e) {} delete ORCS[sl.id]; } });
    delete global.__rbSlots[f.id];
  }
  if (!global.__rbSlots[f.id]) global.__rbSlots[f.id] = { v2: 3, inside: buildSlots(f), patrol: [] };
});
function pickKind(n, f) {   // n = orchi gia' nati nel forte (vivi + uccisi)
  if (n === BOSS_N) return "orco_capo";
  if (n > BOSS_N) return "orco_corazzato";
  const r = Math.random();
  if (r < 0.30) return "orco_furioso";
  return r < 0.65 ? "orco" : "orco_guerriero";   // normali: spada+scudo oppure spadone
}
function insideAlive(f) { let n = 0; global.__rbSlots[f.id].inside.forEach(function (sl) { if (sl.id) n++; }); return n; }
function aliveCount(f) {
  const s = global.__rbSlots[f.id]; let n = 0;
  s.inside.concat(s.patrol).forEach(function (sl) { if (sl.id) n++; });
  return n;
}
function fortOrcIds(f) {
  const s = global.__rbSlots[f.id]; const out = [];
  s.inside.concat(s.patrol).forEach(function (sl) { if (sl.id) out.push(sl.id); });
  return out;
}
// ---- vita in percentuale (proprieta' "percentages" del server) ----
function getHp(id) {
  const p = mp.get(id, "percentages");
  if (p === undefined || p === null) return undefined;
  if (typeof p === "number") return p;
  const k = ("healthPercentage" in p) ? "healthPercentage" : ("health" in p ? "health" : Object.keys(p)[0]);
  return typeof p[k] === "number" ? p[k] : undefined;
}
function setHp(id, v) {
  const p = mp.get(id, "percentages") || {};
  const k = ("healthPercentage" in p) ? "healthPercentage" : ("health" in p ? "health" : "healthPercentage");
  const o = Object.assign({}, p); o[k] = v;
  if (!("magickaPercentage" in o) && !("magicka" in o)) { o.magickaPercentage = 1; o.staminaPercentage = 1; }
  mpSet(id, "percentages", o);
}
// Vita desiderata per tipo (barra piena alla nascita; i danni sono moltiplicati per base/vita, base stimata 225, capo 200)
const ORC_HP = { orco: 36, orco_guerriero: 36, orco_furioso: 29, orco_corazzato: 56, orco_capo: 104 };   // pensate per giocatori con equip in acciaio (spada 8, spadone 17 di danno)
const BOSS_N = 40;   // i primi 40 orchi sono normali/furiosi, il 41esimo (n = 40) e' il capo, dal 42esimo solo corazzati
const STEEL_SWORD = 0x13989, STEEL_GREATSWORD = 0x13987, STEEL_SHIELD = 0x13955;
let _wid = null;
function getWeaponIds() {
  if (_wid) return _wid;
  try { const j = JSON.parse(_fs.readFileSync("weapon-ids.json", "utf8")); _wid = { w: new Set(j.weapons), s: new Set(j.shields) }; log("[EQUIP] elenco armi caricato: " + j.weapons.length + " armi, " + j.shields.length + " scudi"); }
  catch (e) { log("[EQUIP] weapon-ids.json NON caricato: " + e); _wid = { w: new Set(), s: new Set() }; }
  return _wid;
}
// equipaggiamento dell'orco: tolte le armi e gli scudi di serie, messe armi/scudo d'acciaio
function equipOrc(id, kind) {
  try {
    const ids = getWeaponIds();
    const inv = mp.get(id, "inventory"); if (!inv || !inv.entries) return;
    const before = inv.entries.filter(function (e) { return ids.w.has(e.baseId) || ids.s.has(e.baseId); }).map(function (e) { return e.baseId.toString(16) + (e.worn ? "*" : ""); });
    const out = inv.entries.filter(function (e) { return !ids.w.has(e.baseId) && !ids.s.has(e.baseId); });
    const twoH = kind === "orco_guerriero" || kind === "orco_furioso" || kind === "orco_capo";
    out.push({ baseId: twoH ? STEEL_GREATSWORD : STEEL_SWORD, count: 1, worn: true });
    if (!twoH) out.push({ baseId: STEEL_SHIELD, count: 1, worn: true });
    mpSet(id, "inventory", { entries: out });
    log("[EQUIP] " + kind + " " + id.toString(16) + ": tolti [" + before.join(",") + "], messi " + (twoH ? "spadone" : "spada+scudo") + " d'acciaio");
  } catch (e) { log("[EQUIP] errore " + e); }
}
const ORC_BASE_HP = { orco: 225, orco_guerriero: 225, orco_furioso: 225, orco_corazzato: 225, orco_cacciatore: 225, orco_capo: 200 };
// Barra piena: l'orco nasce con percentuale 1 (barra rossa PIENA). Il server toglie danno/base (225), quindi ogni calo viene
// moltiplicato per base/vita_voluta: cosi' i colpi necessari sono quelli di una vita di "ORC_HP" ma la barra parte da piena.
global.__rbHpScale = global.__rbHpScale || {};
function applyOrcHp(id, kind) {
  const want = ORC_HP[kind]; if (!want) return;
  const mul = Math.max(1, (ORC_BASE_HP[kind] || 225) / want);
  global.__rbHpScale[id] = { mul: mul, last: 1, kind: kind, want: want };
  const go = function () { try { const sc = global.__rbHpScale[id]; if (!sc || sc.last < 1) return; setHp(id, 1); log("[VITA] " + kind + " " + id.toString(16) + " nasce a barra piena, vita " + want + "/" + want + " (moltiplicatore danno x" + mul.toFixed(2) + ", letta " + getHp(id) + ")"); } catch (e) { log("[VITA] errore " + e); } };
  go(); setTimeout(go, 800); setTimeout(go, 2500);
}
// Un colpo PARATO dall'orco vale solo il 10% (regola del server). Lo portiamo al 40%: il blocco conta ma non rende l'orco immortale.
const BLOCK_FACTOR = 4;
if (global.__rbScaleTimer) clearInterval(global.__rbScaleTimer);
global.__rbScaleTimer = setInterval(function () {
  const T = global.__rbHpScale;
  Object.keys(T).forEach(function (k) {
    const id = Number(k), sc = T[k];
    try {
      const hp = getHp(id);
      if (typeof hp !== "number" || hp <= 0) { delete T[k]; return; }
      if (hp < sc.last - 0.00005) {
        const raw = sc.last - hp;
        let f = sc.mul, blk = false;
        if (sc.pendBlk && Date.now() - sc.pendBlk < 700) { f *= BLOCK_FACTOR; blk = true; }
        sc.pendBlk = 0;
        let nh = sc.last - raw * f;
        if (nh < 0.002) nh = 0;
        sc.lastRaw = raw; sc.lastT = Date.now(); sc.comp = blk; sc.lastBase = sc.last;
        sc.last = nh;
        setHp(id, nh);
        log("[VITA] " + sc.kind + " " + id.toString(16) + " colpito: danno vero " + (raw * (ORC_BASE_HP[sc.kind] || 225)).toFixed(1) + (blk ? " (parato, portato al 40%)" : "") + " -> restano " + (nh * sc.want).toFixed(1) + "/" + sc.want);
      } else sc.last = hp;
    } catch (e) { delete T[k]; }
  });
}, 100);
// colpo parato segnalato dal client: se il calo e' gia' stato applicato lo correggo, altrimenti lo segno per il prossimo calo
function markBlocked(id) {
  const sc = global.__rbHpScale[id]; if (!sc) return;
  try {
    if (sc.lastT && Date.now() - sc.lastT < 700 && !sc.comp) {
      const extra = sc.lastRaw * sc.mul * (BLOCK_FACTOR - 1);
      let nh = sc.last - extra; if (nh < 0.002) nh = 0;
      sc.comp = true; sc.last = nh; setHp(id, nh);
      log("[VITA] " + sc.kind + " " + id.toString(16) + " colpo parato corretto al 40% -> restano " + (nh * sc.want).toFixed(1) + "/" + sc.want);
    } else sc.pendBlk = Date.now();
  } catch (e) { }
}
function spawnOrcAt(f, slot, kind, tipo, at) {
  const id = mpPlace(ORC_BASE[kind]);
  const P = at || slot;
  mpSet(id, "locationalData", { cellOrWorldDesc: WORLD, pos: [P.x, P.y, P.z], rot: [0, 0, 0] });
  mpSet(id, "private.rbEvoked", true);
  mpSet(id, "private.rbTitle", ORC_TITLES[kind]);
  (function (aid) { setTimeout(function () { sanitizeInventory(aid, "nascita"); }, 700); })(id);
  slot.id = id;
  log("[FORTI] nasce " + kind + " (" + tipo + ") id " + id.toString(16) + " base " + ORC_BASE[kind].toString(16) + " a " + Math.round(P.x) + "," + Math.round(P.y) + "," + Math.round(P.z));
  ORCS[id] = { fort: f.id, kind: kind, tipo: tipo, slot: slot, born: Date.now() };
  try { if (global.__rbAT && global.__rbAT.onBirth) global.__rbAT.onBirth(id, kind, slot, f); } catch (e) { }
  applyOrcHp(id, kind);
  (function (aid, k) { setTimeout(function () { equipOrc(aid, k); }, 900); })(id, kind);
  return id;
}
function broadcast(text) { onlineUsers().forEach(function (u) { sendTo(u, { customPacketType: "rbNotify", text: text }); }); }
function alertAdmins(text) { setTimeout(function () { alertAdmins2(text); }, 300); }
function alertAdmins2(text) { const a = adminUsers(); log("[GUERRA] avviso admin a " + a.length + " (online " + onlineUsers().length + ")"); a.forEach(function (u) { sendTo(u, { customPacketType: "rbAlert", text: text }); }); }

global.__rbFS = global.__rbFS || {};   // stato di combattimento di ogni forte: patrol | attack | hold | yellow
global.__rbBootAt = global.__rbBootAt || Date.now();
// Gli orchi NON vengono mai spostati ne' ricreati: nascono una volta (all'avvio) e li guida il gioco del giocatore piu' vicino.
// Il server decide solo lo STATO e il BERSAGLIO di ogni orco; il client (gioco del giocatore) cammina/attacca di conseguenza.
function playersList(users) {
  const out = users.map(function (u) { const p = PLAYERS[u]; return { pid: profileOfUser(u), user: u, actor: mp.getUserActor(u), world: p.world, pos: p.pos }; });
  Object.keys(global.__rbFakePlayers || {}).forEach(function (k) { const p = global.__rbFakePlayers[k]; out.push({ pid: k, user: -1, actor: 0, world: p.world, pos: p.pos, fake: true }); });
  return out;
}
function fortAI(f, plist, now) {
  const fs = global.__rbFS[f.id] || (global.__rbFS[f.id] = { mode: "patrol", since: now, holdUntil: 0, targets: {}, elig: [] });
  const dd = function (p) { return p.world === 0x3c ? Math.hypot(p.pos[0] - f.cx, p.pos[1] - f.cy) : 1e9; };
  const inRed = plist.filter(function (p) { return dd(p) < RED_R; });
  const inYel = plist.filter(function (p) { return dd(p) < YELLOW_R; });
  const prev = fs.mode; let m = prev;
  if (inRed.length) m = "attack";
  else if (prev === "attack") { if (inYel.length) { m = "hold"; fs.holdUntil = now + HOLD_MS; } else m = "patrol"; }
  else if (prev === "hold") { if (!inYel.length) m = "patrol"; else if (now >= fs.holdUntil) m = "yellow"; }
  else if (prev === "yellow") { if (!inYel.length) m = "patrol"; }
  if (m !== prev) { fs.mode = m; fs.since = now; log("[FORTI] " + f.name + ": " + prev + " -> " + m + " (zona rossa " + inRed.length + ", gialla " + inYel.length + ")"); }
  const elig = m === "attack" ? inRed : (m === "yellow" ? inYel : []);
  fs.elig = elig.map(function (p) { return p.pid; });
  const prevT = fs.targets || {};
  fs.targets = {};
  if (elig.length) {
    fortOrcIds(f).forEach(function (id) {
      try {
        if (mp.get(id, "isDead")) return;
        const op = mp.get(id, "pos"); let best = null, bd = 1e18, keep = null, kd = 1e18;
        elig.forEach(function (p) {
          const d = Math.hypot(op[0] - p.pos[0], op[1] - p.pos[1]);
          if (d < bd) { bd = d; best = p; }
          if (prevT[id] !== undefined && String(p.pid) === String(prevT[id])) { keep = p; kd = d; }
        });
        // anti-balletto: l'orco resta sul suo bersaglio finche' un altro non e' MOLTO piu' vicino (meta' distanza, almeno 400 unita' di differenza)
        if (keep && !(bd < kd * 0.5 && kd - bd > 400)) best = keep;
        if (best) fs.targets[id] = best.pid;
      } catch (e) { }
    });
  }
  return fs;
}
function sendFortPackets(f, fs, plist) {
  const ids = fortOrcIds(f); if (!ids.length) return;
  const homeOf = {}; global.__rbSlots[f.id].inside.forEach(function (sl) { if (sl.id) homeOf[sl.id] = sl; });
  const o = ids.map(function (id) { const sl = homeOf[id]; return [id, fs.targets[id] === undefined ? -1 : fs.targets[id], sl ? Math.round(sl.hx) : 0, sl ? Math.round(sl.hy) : 0, sl ? Math.round(sl.hz) : 0]; });
  const tp = {}; plist.forEach(function (p) { if (!p.fake) tp[p.pid] = p.actor; });
  plist.forEach(function (p) {
    if (p.fake || p.world !== 0x3c) return;
    if (Math.hypot(p.pos[0] - f.cx, p.pos[1] - f.cy) > ACTIVATE_R) return;
    sendTo(p.user, { customPacketType: "rbFort", f: f.id, mode: fs.mode, cx: f.cx, cy: f.cy, red: RED_R, o: o, tp: tp, elig: fs.elig });
  });
}
function fortTick() {
  global.__rbLastTick = Date.now();
  try {
    const now = Date.now();
    if (now - global.__rbBootAt < 4000) return;   // aspetta la pulizia di avvio
    const users = onlineUsers();
    if (!global.__rbHb || now - global.__rbHb > 10000) { global.__rbHb = now; try { log("[FORTI] battito: online " + users.length + " " + JSON.stringify(Object.keys(PLAYERS).map(function (u) { const p = PLAYERS[u]; return [u, Math.round((now - p.t) / 1000) + "s fa", p.world.toString(16), Math.round(p.pos[0]), Math.round(p.pos[1]), Math.round(p.pos[2])]; })) + " | " + FORTS.map(function (f) { return f.id + ":" + (global.__rbFS[f.id] ? global.__rbFS[f.id].mode : "-") + "/" + aliveCount(f); }).join(" ")); } catch (e) { } }
    const plistAll = playersList(users);
    const plist = plistAll.filter(function (p) { return !(global.__rbPeace && !p.fake); });   // evoca_pace: i giocatori veri sono ignorati (prova della pattuglia da vicino)
    FORTS.forEach(function (f) {
      const st = global.__rbFortSt[f.id];
      if (st.conquered) return;
      try { if (_fs.readFileSync("forts-skip.txt", "utf8").split(",").indexOf(String(f.id)) >= 0) return; } catch (e) { }   // DEBUG: file forts-skip.txt con gli id dei forti da tenere spenti (es. 1)
      const fs = fortAI(f, plist, now);
      // nascite: all'avvio tutti i 20 posti si riempiono nei punti sparsi; dopo una morte il rimpiazzo nasce dentro le mura dopo 4 s
      const s = global.__rbSlots[f.id];
      let spawned = 0;
      for (let i = 0; i < s.inside.length && spawned < MAX_SPAWN_PER_TICK; i++) {
        const sl = s.inside[i];
        if (sl.id || now < sl.due) continue;
        const n = insideAlive(f) + st.kills;      // orchi gia' nati nel forte
        if (n >= f.target) break;                 // obiettivo: mai piu' orchi di quelli che mancano
        try {
          const kind = pickKind(n, f);
          spawnOrcAt(f, sl, kind, sl.fresh ? "campo" : "dentro", sl.fresh ? { x: sl.hx, y: sl.hy, z: sl.hz } : undefined);
          sl.fresh = false;
          ORCS[sl.id].last = n >= BOSS_N;   // capo + corazzati: restano a terra 5 minuti
          spawned++;
          if (kind === "orco_capo") log("[FORTI] " + f.name + ": nato il CAPO (orco " + (n + 1) + " di " + f.target + ")");
        } catch (e) { log("[FORTI] spawn errore " + e); sl.due = now + 5000; }
      }
      // orchi sperduti (fuori dalla zona rossa) con nessun giocatore vicino: tornano a casa (il server puo' spostarli solo se nessuno li comanda)
      if (fs.mode === "patrol" && !plist.some(function (p) { return p.world === 0x3c && Math.hypot(p.pos[0] - f.cx, p.pos[1] - f.cy) < YELLOW_R + 4000; })) {
        s.inside.forEach(function (sl) {
          if (!sl.id) return;
          try {
            if (mp.get(sl.id, "isDead")) return;
            const op = mp.get(sl.id, "pos");
            if (Math.hypot(op[0] - sl.hx, op[1] - sl.hy) > 2500) { mpSet(sl.id, "locationalData", { cellOrWorldDesc: WORLD, pos: [sl.hx, sl.hy, sl.hz], rot: [0, 0, 0] }); log("[FORTI] orco " + sl.id.toString(16) + " sperduto, rimesso a casa"); }
          } catch (e) { }
        });
      }
      sendFortPackets(f, fs, plistAll);
    });
  } catch (e) { log("[FORTI] tick errore " + e); }
}
if (global.__rbPatrolTimer) { clearInterval(global.__rbPatrolTimer); global.__rbPatrolTimer = null; }
if (global.__rbFortTimer) clearInterval(global.__rbFortTimer);
global.__rbFortTimer = setInterval(fortTick, 2000);

global.__rbFortDeath = function (actorId, killerId) {
  const o = ORCS[actorId];
  if (!o) return;
  try { if (global.__rbAT && global.__rbAT.onDeath) global.__rbAT.onDeath(actorId, o); } catch (e) { }
  delete ORCS[actorId];
  setTimeout(function () { try { setOrcLoot(actorId, o.kind); } catch (e) { log("[ORCHI] loot errore " + e); } }, 1500);
  if (!o.fort) return;   // orco evocato dallo staff: non conta per la conquista
  const f = FORTS.find(x => x.id === o.fort), st = global.__rbFortSt[f.id];
  o.slot.id = 0;
  o.slot.due = Date.now() + INSIDE_RESPAWN_MS;
  if (o.last) global.__rbCorpseNext = 300000;   // capo e corazzati restano a terra 5 minuti
  st.kills++;
  log("[FORTI] " + f.name + ": orco morto (dentro), uccisi " + st.kills + "/" + f.target);
  if (st.kills >= f.target) {
    st.conquered = true;
    log("[FORTI] " + f.name + " CONQUISTATO");
    broadcast(f.name + " è stato conquistato! Tutti i difensori sono caduti.");
    const bannerText = "FORTE " + (f.id === 1 ? "NARZULBUR" : "LARGASHBUR") + " CONQUISTATO!";
    try { if (global.__rbAT && global.__rbAT.onConquest) global.__rbAT.onConquest(f, bannerText); } catch (e) { }
    onlineUsers().forEach(function (u) { sendTo(u, { customPacketType: "rbBanner", text: bannerText }); });
    alertAdmins("GUERRA - " + f.name + " CONQUISTATO (" + st.kills + "/" + f.target + "). Spawn spenti.");
  }
  saveFortState();
};

// Stato inviato al client (ID, admin, forti): risposta a "rbHello"
function sendState(userId) {
  const pid = profileOfUser(userId);
  sendTo(userId, {
    customPacketType: "rbState", pid: pid, admin: isAdminProfile(pid),
    forts: FORTS.map(function (f) { const st = global.__rbFortSt[f.id]; return { id: f.id, name: f.name, x: f.cx, y: f.cy, green: GREEN_R, red: RED_R, active: !st.conquered, orcs: st.conquered ? [] : fortOrcIds(f) }; }),
  });
}
function fortStatusText() {
  return FORTS.map(function (f) { const st = global.__rbFortSt[f.id]; return f.name + ": " + (st.conquered ? "CONQUISTATO" : (st.kills + "/" + f.target + " uccisi, " + aliveCount(f) + " vivi")); }).join(" | ");
}

const _prevCustom2 = global.__rbCustomPacket;
global.__rbCustomPacket = function (userId, rawContent) {
  try {
    const c = JSON.parse(rawContent);
    if (c.customPacketType === "rbHello") {
      PLAYERS[userId] = { t: Date.now(), pos: c.pos || [0, 0, 0], world: c.world || 0 };
      if (Date.now() - (global.__rbLastTick || 0) > 5000) { if (!global.__rbWdLog || Date.now() - global.__rbWdLog > 30000) { global.__rbWdLog = Date.now(); log("[FORTI] guardiano: il timer dei forti era fermo, lo faccio girare dal segnale del giocatore"); } try { fortTick(); } catch (e) { log("[FORTI] guardiano errore " + e); } try { if (global.__rbFortTimer) clearInterval(global.__rbFortTimer); global.__rbFortTimer = setInterval(fortTick, 2000); } catch (e) { } }
      sendState(userId);
      return;
    }
    if (c.customPacketType === "rbAdmin") {
      const pid = Number(c.id);
      if (!isAdminUser(userId)) { sendTo(userId, { customPacketType: "rbNotify", text: "Solo gli admin possono dare il ruolo admin." }); return; }
      if (!Number.isFinite(pid) || pid < 0) { sendTo(userId, { customPacketType: "rbNotify", text: "ID non valido." }); return; }
      const arr = readAdmins();
      if (!arr.includes(pid)) { arr.push(pid); try { _fs.writeFileSync(ADMINS_FILE, JSON.stringify(arr)); } catch (e) { log("[ADMIN] scrittura fallita " + e); } }
      log("[ADMIN] profileId " + pid + " reso admin da " + profileOfUser(userId));
      sendTo(userId, { customPacketType: "rbNotify", text: "Il giocatore con ID " + pid + " ora è admin." });
      onlineUsers().forEach(function (u) { if (profileOfUser(u) === pid) sendTo(u, { customPacketType: "rbNotify", text: "Ora sei admin." }); });
      return;
    }
    if (c.customPacketType === "rbGodHit") {   // colpo di un giocatore: misura il danno reale; con godmod o spadone daedrico l'NPC muore subito (danno 999)
      const gp = profileOfUser(userId), tid = Number(c.id);
      if (!tid || onlineUsers().some(function (u) { return mp.getUserActor(u) === tid; })) return;
      let hp0; try { hp0 = getHp(tid); } catch (e) { }
      if (c.blocked) markBlocked(tid);
      let okSword = false;
      if (Number(c.src) === 0x139B7) { try { const pi = mp.get(mp.getUserActor(userId), "inventory"); okSword = !!(pi && pi.entries.some(function (x) { return x.baseId === 0x139B7; })); } catch (e) { } }
      const god = isAdminUser(userId) && global.__rbGod && global.__rbGod[gp];
      if (okSword || god) { try { if (!mp.get(tid, "isDead")) mpSet(tid, "isDead", true); log("[GOD] colpo 999 su " + tid.toString(16)); } catch (e) { } return; }
      setTimeout(function () { try { const hp1 = getHp(tid); const o = ORCS[tid]; log("[DANNO] " + (o ? o.kind : "?") + " " + tid.toString(16) + " vita " + (hp0 === undefined ? "?" : hp0.toFixed(3)) + " -> " + (hp1 === undefined ? "?" : hp1.toFixed(3)) + " arma " + Number(c.src).toString(16) + (c.power ? " (potente)" : "") + (c.blocked ? " (PARATO)" : "")); } catch (e) { } }, 500);
      return;
    }
    if (c.customPacketType === "rbHorn") { log("[GUERRA] corni suonati per il forte " + c.fort + " (giocatore " + profileOfUser(userId) + ")"); return; }
  } catch (e) { log("[ADMIN] errore pacchetto: " + e); }
  if (_prevCustom2) _prevCustom2(userId, rawContent);
};
log("[FORTI] caricato: " + fortStatusText());

// conteggio a 0, orchi vivi rimossi (anche i cadaveri dei forti ancora a terra restano al loro timer), forte riacceso
function restartFort(f) {
  global.__rbSlots[f.id].inside.concat(global.__rbSlots[f.id].patrol || []).forEach(function (sl) { sl.fresh = true; if (!sl.id) { sl.due = 0; return; } try { delete ORCS[sl.id]; mpDestroy(sl.id); } catch (e) { } sl.id = 0; sl.due = 0; });
  const st = global.__rbFortSt[f.id]; st.kills = 0; st.conquered = false; global.__rbFS[f.id] = { mode: "patrol", since: Date.now(), holdUntil: 0, targets: {}, elig: [] }; saveFortState();
}

// ================== MAPPA PULITA (marcatori nascosti, porte chiuse) ==================
// mappa-config.json: { hide: [id marcatori da nascondere], lock: [id porte da chiudere] } generato da Skyrim.esm. Il client applica tutto.
global.__rbMappaLast = global.__rbMappaLast || {};
function mappaHi(userId, c) {
  if (c.have) { if (c.nOk !== undefined) log("[MAPPA] client " + userId + ": nascosti " + c.nHide + ", porte chiuse " + c.nLock + ", ok " + c.nOk + ", errori " + c.nErr + " (liste " + c.hide + "/" + c.lock + ") riaccesi: " + (c.nIds || 0) + " id, top " + (c.top || "-")); return; }
  if (Date.now() - (global.__rbMappaLast[userId] || 0) < 8000) return;
  global.__rbMappaLast[userId] = Date.now();
  try { if (global.__rbMappaUnlock && global.__rbMappaUnlock[userId]) { global.__rbMappaUnlock[userId] = false; log("[MAPPA] sblocca_tutto azzerato alla connessione di " + userId); } } catch (e) { }
  let cfg; try { cfg = JSON.parse(_fs.readFileSync("mappa-config.json", "utf8")); } catch (e) { log("[MAPPA] nessun mappa-config.json: " + e); return; }
  const H = cfg.hide || [], L = cfg.lock || [], UH = cfg.unhide || H, UL = cfg.unlock || L, CH = 150;
  const n = Math.max(Math.ceil(H.length / CH), Math.ceil(L.length / CH), Math.ceil(UH.length / CH), Math.ceil(UL.length / CH), 1);
  for (let i = 0; i < n; i++) sendTo(userId, { customPacketType: "rbMappa", first: i === 0, last: i === n - 1, hide: H.slice(i * CH, (i + 1) * CH), lock: L.slice(i * CH, (i + 1) * CH), uh: UH.slice(i * CH, (i + 1) * CH), ul: UL.slice(i * CH, (i + 1) * CH) });
  log("[MAPPA] inviata la mappa pulita a " + userId + ": " + H.length + " marcatori nascosti, " + L.length + " porte chiuse");
}

function spawnCreatures(userId, name, qty) {
  const playerId = mp.getUserActor(userId);
  log("[SPAWN] richiesta " + name + " x" + qty + " user " + userId + " attore " + playerId);
  if (!playerId) return;
  let reply = function (t) { try { mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "rbNotify", text: t })); } catch (e) {} };

  if (!isAdminUser(userId)) { reply("Comando riservato agli admin."); return; }
  const _k0 = normName(name);
  if (_k0 === "sbloccatutto") {   // sblocca_tutto: solo admin. Mostra tutti i luoghi esplorabili e apre tutte le porte; richiamato di nuovo torna alla mappa dei giocatori
    global.__rbMappaUnlock = global.__rbMappaUnlock || {};
    const on = !global.__rbMappaUnlock[userId]; global.__rbMappaUnlock[userId] = on;
    sendTo(userId, { customPacketType: "rbMappaSblocca", on: on });
    reply(on ? "Mappa SBLOCCATA: vedi tutti i dungeon e i luoghi esplorabili dentro i confini e le loro porte sono aperte (scrivi di nuovo sblocca_tutto per tornare alla mappa dei giocatori)." : "Mappa dei giocatori ripristinata.");
    log("[MAPPA] sblocca_tutto " + (on ? "ATTIVO" : "SPENTO") + " per utente " + userId); return;
  }
  if (_k0 === "riattiva") {   // evoca_riattiva_1 (Windhelm) / evoca_riattiva_2 (Riften): azzera il conteggio e riaccende il forte
    const f = FORTS.find(x => x.id === Number(qty));
    if (!f) { reply("Forte non valido (1 = Windhelm, 2 = Riften)."); return; }
    const st = global.__rbFortSt[f.id]; st.kills = 0; st.conquered = false; saveFortState();
    reply(f.name + " riacceso."); log("[FORTI] riacceso " + f.name); return;
  }
  if (_k0 === "riavviaforte") {   // riavvia_forte_1 = Riften (id interno 2), riavvia_forte_2 = Windhelm (id interno 1): conteggio a 0, orchi vivi rimossi, forte riacceso
    const f = FORTS.find(x => x.id === (Number(qty) === 1 ? 2 : Number(qty) === 2 ? 1 : -1));
    if (!f) { reply("Forte non valido (riavvia_forte_1 = Riften, riavvia_forte_2 = Windhelm)."); return; }
    restartFort(f);
    reply(f.name + " riavviato: conteggio 0/" + f.target + ", orchi rinnovati."); log("[FORTI] riavviato a mano " + f.name); return;
  }
  if (_k0 === "pace") {   // evoca_pace_1 = gli orchi ignorano i giocatori veri (per guardarli pattugliare da vicino), evoca_pace_0 = normale
    global.__rbPeace = Number(qty) === 1; reply("Pace " + (global.__rbPeace ? "ATTIVA: gli orchi ignorano i giocatori" : "spenta")); log("[FORTI] pace " + global.__rbPeace); return;
  }
  if (_k0 === "bannerconquista") {   // evoca_bannerconquista_1 = Riften, _2 = Windhelm: mostra a te (solo prova) la scritta di conquista
    const f = FORTS.find(x => x.id === (Number(qty) === 1 ? 2 : Number(qty) === 2 ? 1 : -1));
    if (!f) { reply("Forte non valido (1 = Riften, 2 = Windhelm)."); return; }
    sendTo(userId, { customPacketType: "rbBanner", text: "FORTE " + (f.id === 1 ? "NARZULBUR" : "LARGASHBUR") + " CONQUISTATO!" });
    reply("Scritta di prova inviata."); return;
  }
  if (_k0 === "daedrico") {   // daedrico: set daedrico completo (elmo, corazza, guanti, stivali, scudo) + spadone, senza incantesimi
    const inv = mp.get(playerId, "inventory") || { entries: [] };
    [0x0001396D, 0x0001396B, 0x0001396C, 0x0001396A, 0x0001396E, 0x000139B7].forEach(function (bid) {
      const e = inv.entries.find(function (x) { return x.baseId === bid; });
      if (e) e.count += 1; else inv.entries.push({ baseId: bid, count: 1 });
    });
    mpSet(playerId, "inventory", inv);
    reply("Set daedrico + spadone aggiunti (peso 0, spadone danno 999)."); log("[ITEM] set daedrico a " + profileOfUser(userId)); return;
  }
  if (_k0 === "acciaio") {   // give_setacciaio: set d'acciaio completo (elmo, corazza, guanti, stivali, scudo) + spadone
    const inv = mp.get(playerId, "inventory") || { entries: [] };
    [0x00013954, 0x00013952, 0x00013953, 0x00013951, 0x00013955, 0x00013987].forEach(function (bid) {
      const e = inv.entries.find(function (x) { return x.baseId === bid; });
      if (e) e.count += 1; else inv.entries.push({ baseId: bid, count: 1 });
    });
    mpSet(playerId, "inventory", inv);
    reply("Set d'acciaio + spadone aggiunti (peso 0)."); log("[ITEM] set acciaio a " + profileOfUser(userId)); return;
  }
  if (_k0 === "godmod") {   // godmod: attiva/disattiva (solo admin): danno 999 ai colpi del giocatore (vedi pacchetto rbGodHit)
    global.__rbGod = global.__rbGod || {};
    const pr = profileOfUser(userId); global.__rbGod[pr] = !global.__rbGod[pr];
    reply(global.__rbGod[pr] ? "GODMOD ATTIVO: vita 999, danno 999." : "GODMOD SPENTO.");
    mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "rbGod", on: !!global.__rbGod[pr] }));
    log("[GOD] " + pr + " -> " + global.__rbGod[pr]); return;
  }
  if (_k0 === "stato") { reply(fortStatusText()); return; }
  if (_k0 === "colpisci") {   // evoca_colpisci_<forte>: SOLO PROVA, uccide l'orco del forte piu' vicino
    const f = FORTS.find(x => x.id === Number(qty));
    if (!f) { reply("Forte non valido (1 = Windhelm, 2 = Riften)."); return; }
    const me = mp.get(playerId, "pos");
    const c = fortOrcIds(f).map(function (id) { try { if (mp.get(id, "isDead")) return null; return { id: id, d: dist(mp.get(id, "pos"), me) }; } catch (e) { return null; } }).filter(Boolean).sort((p, q) => p.d - q.d)[0];
    if (!c) { reply("Nessun orco vivo."); log("[FORTI] colpisci: nessun orco"); return; }
    mpSet(c.id, "isDead", true); log("[FORTI] colpisci: ucciso " + c.id.toString(16) + " a " + Math.round(c.d)); reply("Orco ucciso."); return;
  }
  if (_k0 === "quasi") {   // evoca_quasi_<forte>: SOLO PROVA, porta il conteggio a un passo dal capo (il prossimo orco che nasce e' il capo)
    const f = FORTS.find(x => x.id === Number(qty));
    if (!f) { reply("Forte non valido (1 = Windhelm, 2 = Riften)."); return; }
    global.__rbFortSt[f.id].kills = Math.max(0, BOSS_N - insideAlive(f)); reply("Conteggio a " + global.__rbFortSt[f.id].kills + "/" + f.target); log("[FORTI] conteggio forzato " + global.__rbFortSt[f.id].kills); return;
  }
  if (_k0 === "ultimo") {   // evoca_ultimo_<forte>: SOLO PROVA, porta il conteggio a target-1 (la prossima uccisione conquista il forte)
    const f = FORTS.find(x => x.id === Number(qty));
    if (!f) { reply("Forte non valido (1 = Windhelm, 2 = Riften)."); return; }
    global.__rbFortSt[f.id].kills = f.target - 1; reply("Conteggio a " + (f.target - 1) + "/" + f.target); log("[FORTI] conteggio forzato " + (f.target - 1)); return;
  }
  if (_k0 === "vaicentro") {   // evoca_vaicentro_1 / _2: ti porta DENTRO al forte
    const f = FORTS.find(x => x.id === Number(qty));
    if (!f) { reply("Forte non valido (1 = Windhelm, 2 = Riften)."); return; }
    mpSet(playerId, "locationalData", { cellOrWorldDesc: WORLD, pos: f.id === 1 ? [157880, 9950, -4400] : [f.cx + 400, f.cy, f.cz + 120], rot: [0, 0, 0] });
    reply("Sei dentro al " + f.name + "."); log("[FORTI] teletrasporto al centro di " + f.name); return;
  }
  if (_k0 === "spegni") {   // evoca_spegni_N: prova: spegne il forte (conquistato, orchi rimossi) senza dover uccidere tutti
    const f = FORTS.find(x => x.id === Number(qty));
    if (!f) { reply("Forte non valido (1 = Windhelm, 2 = Riften)."); return; }
    global.__rbFortSt[f.id].conquered = true;
    global.__rbSlots[f.id].inside.forEach(function (sl) { if (!sl.id) return; try { delete ORCS[sl.id]; mpDestroy(sl.id); } catch (e) { } sl.id = 0; });
    reply(f.name + " spento (usa evoca_riattiva_" + f.id + " per riaccenderlo)."); log("[FORTI] spento a mano " + f.name); return;
  }
  if (_k0 === "raggio") {   // evoca_raggio_N: ti porta a N*100 unita' dal centro di Riften (prova della zona rossa)
    const f = FORTS.find(x => x.id === 2); const _pp = f.patrol[0];
    const dx = _pp[0] - f.cx, dy = _pp[1] - f.cy, L = Math.hypot(dx, dy), R = Number(qty) * 100;
    mpSet(playerId, "locationalData", { cellOrWorldDesc: WORLD, pos: [f.cx + dx / L * R, f.cy + dy / L * R, _pp[2] + 120], rot: [0, 0, 0] });
    reply("Sei a " + R + " unita dal centro di Riften."); log("[FORTI] teletrasporto a raggio " + R); return;
  }
  if (_k0 === "vaiforte") {   // evoca_vaiforte_1 (Windhelm) / evoca_vaiforte_2 (Riften): ti porta poco fuori dal forte, prima della zona di guerra
    const _inner = Number(qty) >= 10; const f = FORTS.find(x => x.id === (Number(qty) % 10));
    if (!f) { reply("Forte non valido (1 = Windhelm, 2 = Riften)."); return; }
    const _pp = f.patrol[f.id === 1 ? 3 : 0];
    let p = _inner ? { x: f.cx + 400, y: f.cy, z: f.cz } : { x: _pp[0], y: _pp[1], z: _pp[2] };
    mpSet(playerId, "locationalData", { cellOrWorldDesc: WORLD, pos: [p.x, p.y, p.z + (f.id === 1 ? 600 : 120)], rot: [0, 0, 0] });
    reply("Sei vicino al " + f.name + "."); log("[FORTI] teletrasporto al " + f.name); return;
  }
  const key = normName(name);
  if (!TEST_COMMANDS && TEST_KEYS.includes(key)) { reply("Comando di prova disattivato."); return; }
  if (key === "cadavere") {   // SOLO TEST: durata dei cadaveri in secondi (0 = torna a 30 s); si azzera al riavvio
    global.__rbCorpseMs = Number(qty) > 0 ? Math.min(600, Number(qty)) * 1000 : 0;
    log("[TEST] durata cadavere: " + (global.__rbCorpseMs || CORPSE_MS) + " ms");
    reply("Durata cadavere: " + ((global.__rbCorpseMs || CORPSE_MS) / 1000) + " s");
    return;
  }
  if (key === "locanda") {   // SOLO TEST: porta il giocatore nella sala della locanda (pavimento piatto)
    const pts = { locanda: ["106666:Skyrim.esm", [-117, -400, 70]], p1: ["3c:Skyrim.esm", [25243, -19528, -3474]], p2: ["3c:Skyrim.esm", [19855, -7423, -3283]], p3: ["3c:Skyrim.esm", [18313, -10665, -4290]], p4: ["3c:Skyrim.esm", [31524, -10251, -3820]] };
    const k = Number(qty) === 1 ? "locanda" : "p" + (Number(qty) - 1);
    const pt = pts[k] || pts.locanda;
    mpSet(playerId, "locationalData", { cellOrWorldDesc: pt[0], pos: pt[1], rot: [0, 0, 0] });
    log("[TEST] giocatore portato in " + k);
    return;
  }
  if (key === "apri") {   // SOLO TEST: apre la finestra di loot del cadavere evocato piu' vicino (come premere E)
    const me2 = mp.get(playerId, "pos");
    const dead = readEvoked().map(function (id) {
      try { if (!mp.get(id, "isDead")) return null; return { id: id, d: dist(mp.get(id, "pos"), me2) }; } catch (e) { return null; }
    }).filter(Boolean).sort((a, b) => a.d - b.d);
    if (!dead.length) { reply("Nessun cadavere."); return; }
    doLoot(userId, dead[0].id, true);
    return;
  }
  if (key === "provatutti") {   // SOLO TEST: per ogni creatura: evoca, uccide, controlla il loot (server + client) e la rimuove
    const names = []; const seenB = new Set();
    Object.keys(CREATURES).forEach(function (nm) { if (!seenB.has(CREATURES[nm])) { seenB.add(CREATURES[nm]); names.push(nm); } });
    const start = Math.max(0, (Number(qty) || 1) - 1);
    const ldP = mp.get(playerId, "locationalData");
    let idx = start;
    log("[PROVA] inizio, " + (names.length - start) + " creature");
    const step = function () {
      if (idx >= names.length) { log("[PROVA] FINE"); reply("Prova finita."); return; }
      const nm = names[idx++];
      let id = 0;
      try {
        id = mpPlace(CREATURES[nm]);
        mpSet(id, "locationalData", { cellOrWorldDesc: ldP.cellOrWorldDesc, pos: [ldP.pos[0] + 250, ldP.pos[1] + 250, ldP.pos[2] + 20], rot: [0, 0, 0] });
        mpSet(id, "private.rbEvoked", true); rememberEvoked(id);
        if (TITLES[nm]) mpSet(id, "private.rbTitle", TITLES[nm]);
      } catch (e) { log("[PROVA] " + nm + " ERRORE spawn " + e); setTimeout(step, 500); return; }
      setTimeout(function () {
        try { mpSet(id, "isDead", true); } catch (e) { log("[PROVA] " + nm + " ERRORE kill " + e); }
        setTimeout(function () {
          try {
            const inv = mp.get(id, "inventory");
            const items = ((inv && inv.entries) || []).filter(it => !it.worn).map(it => ({ baseId: it.baseId, count: it.count }));
            log("[PROVA] === " + nm + " (" + id.toString(16) + ") server: " + JSON.stringify(items.map(i => i.baseId.toString(16) + "x" + i.count)) + " INDOSSATI: " + JSON.stringify(((inv && inv.entries) || []).filter(it => it.worn).map(it => it.baseId.toString(16))));
            if (items.length) mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "rbLootData", target: id, items: items, probe: true, cname: nm, titolo: TITLES[nm] }));
          } catch (e) { log("[PROVA] " + nm + " ERRORE loot " + e); }
          setTimeout(function () { try { mpDestroy(id); } catch (e) {} setTimeout(step, 400); }, 2500);
        }, 2500);
      }, 9000);
    };
    step();
    return;
  }
  if (key === "inventario") {   // SOLO TEST: scrive nel log l'inventario del giocatore
    const pi = mp.get(playerId, "inventory");
    log("[INV] " + JSON.stringify((pi.entries || []).map(e => e.baseId.toString(16) + "x" + e.count)));
    return;
  }
  if (key === "pulisci") {   // rimuove subito tutte le creature evocate ancora nel mondo
    let n = 0;
    readEvoked().forEach(function (id) { try { mpDestroy(id); n++; } catch (e) {} });
    writeEvoked([]);
    log("[EVOKED] pulizia manuale: " + n);
    reply("Rimosse " + n + " creature evocate.");
    return;
  }
  if (key === "ammazza") {   // solo per i test: uccide le N creature evocate piu' vicine (poi vale il loot con E e i 30 s)
    const me = mp.get(playerId, "pos");
    const cand = readEvoked().map(function (id) {
      try { if (mp.get(id, "isDead")) return null; return { id: id, d: dist(mp.get(id, "pos"), me) }; } catch (e) { return null; }
    }).filter(Boolean).sort((a, b) => a.d - b.d).slice(0, Math.max(1, Math.min(MAX_QTY, Number(qty) || 1)));
    cand.forEach(function (c) { try { mpSet(c.id, "isDead", true); log("[KILL] " + c.id.toString(16) + " a " + Math.round(c.d)); } catch (e) { log("[KILL] errore " + e); } });
    reply("Uccise " + cand.length + " creature.");
    return;
  }
  if (key === "test") {
    const seen = new Set(); let okT = 0, bad = [];
    const ldT = mp.get(playerId, "locationalData");
    Object.keys(CREATURES).forEach(function (nm, idx) {
      if (seen.has(CREATURES[nm])) return; seen.add(CREATURES[nm]);
      try {
        const id = mpPlace(CREATURES[nm]);
        const ang = idx * 0.35, r = 600 + 15 * idx;
        mpSet(id, "locationalData", { cellOrWorldDesc: ldT.cellOrWorldDesc, pos: [ldT.pos[0] + Math.cos(ang) * r, ldT.pos[1] + Math.sin(ang) * r, ldT.pos[2] + 20], rot: [0, 0, 0] });
        mpSet(id, "private.rbEvoked", true);
        rememberEvoked(id); okT++;
        log("[TEST] " + nm + " ok id " + id.toString(16));
      } catch (e) { bad.push(nm); log("[TEST] " + nm + " ERRORE " + e); }
    });
    reply("Test: " + okT + " creature ok, " + bad.length + " errori.");
    return;
  }
  let base = CREATURES[key];
  const rndOrc = (key === "orco");   // evoca_orco_N: solo orchi normali, a caso tra spada+scudo e spadone (d'acciaio)
  if (base === undefined && !rndOrc) { reply("Creatura sconosciuta: " + key); log("[SPAWN] sconosciuta " + key); return; }
  qty = Math.max(1, Math.min(MAX_QTY, Number(qty) || 1));

  const ld = mp.get(playerId, "locationalData");
  const pos = ld.pos;
  const cell = ld.cellOrWorldDesc;
  let ok = 0;
  for (let i = 0; i < qty; i++) {
    try {
      const kOrc = rndOrc ? (Math.random() < 0.5 ? "orco" : "orco_guerriero") : key;
      const id = mpPlace(rndOrc ? ORC_BASE[kOrc] : base);
      // davanti al giocatore, a ventaglio (angolo 0 = nord, in senso orario come in Skyrim)
      const facing = (ld.rot && ld.rot[2]) || 0;
      const off = qty > 1 ? (-60 + (120 * i) / (qty - 1)) : 0;
      const ang = ((facing + off) * Math.PI) / 180;
      const r = 250 + 40 * qty;
      mpSet(id, "locationalData", { cellOrWorldDesc: cell, pos: [pos[0] + Math.sin(ang) * r, pos[1] + Math.cos(ang) * r, pos[2] + 20], rot: [0, 0, 0] });
      mpSet(id, "private.rbEvoked", true);
      try { mpSet(id, "private.rbFauna", CREATURES[key]); } catch (e) { }
      if (TITLES[key]) mpSet(id, "private.rbTitle", TITLES[key]);
      if (ORC_BASE[kOrc] !== undefined) { ORCS[id] = { fort: 0, kind: kOrc, tipo: "staff", slot: null }; applyOrcHp(id, kOrc); (function (aid, k) { setTimeout(function () { equipOrc(aid, k); }, 900); })(id, kOrc); }
      (function (aid) { setTimeout(function () { sanitizeInventory(aid, "nascita"); }, 700); })(id);
      ok++;
      rememberEvoked(id);
      log("[SPAWN] " + key + " id " + id.toString(16));
    } catch (e) {
      log("[SPAWN] errore " + key + ": " + e);
    }
  }
  reply(ok + " x " + key + " evocati.");
}

const _prevCustom = global.__rbCustomPacket;
global.__rbCustomPacket = function (userId, rawContent) {
  try {
    const c = JSON.parse(rawContent);
    if (c.customPacketType === "rbDbg") { log("[DBG] console: " + c.text); return; }
    if (c.customPacketType === "rbSpawn") { spawnCreatures(userId, c.name, c.qty); return; }
    if (c.customPacketType === "rbMappaHi") { mappaHi(userId, c); return; }
  } catch (e) { log("[SPAWN] errore pacchetto: " + e); }
  if (_prevCustom) _prevCustom(userId, rawContent);
};

if (!global.__rbCustomPacketRegistered) {
  global.__rbCustomPacketRegistered = true;
  mp.on("customPacket", function (userId, rawContent) {
    if (global.__rbCustomPacket) global.__rbCustomPacket(userId, rawContent);
  });
}


// ================== SCAVO DELLE VENE (E sulla vena con un piccone) ==================
// Lo script di Skyrim (MineOreScript) sul server non gira: lo rifacciamo noi. Il client manda "rbMine" quando premi E su un attivatore.
const VEIN_ORE = {"1113104":0,"1113103":0,"1113102":371931,"1109604":371931,"1109567":371931,"1108648":0,"1108378":0,"1108283":0,"1106177":371932,"1110247":371932,"1105106":371931,"1105105":371931,"1105104":371931,"1105103":371931,"1105102":371931,"1105101":371934,"1105100":371934,"1105099":371934,"1105098":371934,"1105097":466163,"1105096":466163,"1105095":466163,"1105094":466163,"1105093":371936,"1105092":371936,"1105091":371936,"1105090":371936,"1105089":371933,"1105088":371933,"1105087":371933,"1105086":371933,"1105085":371938,"1105084":371938,"1105083":371938,"1105082":371938,"1105081":371935,"1105080":371935,"1105079":371935,"1105078":371935,"1105077":371935,"1105076":371935,"1105075":371935,"1105074":371935,"1105073":371938,"1105072":371938,"1105071":371938,"1105070":371938,"1105069":371933,"1105068":371933,"1105067":371933,"1105066":371933,"1105065":371936,"1105064":371936,"1105063":371936,"1105062":371936,"1105061":466163,"1105060":466163,"1105059":466163,"1105058":466163,"1105057":371934,"1105056":371934,"1105055":371934,"1105054":371934,"1105053":371931,"1105052":371931,"1105051":371931,"1105050":371931,"1105049":371931,"1105048":371931,"1105047":371931,"1105046":371931,"1105045":371934,"1105044":371934,"1105043":371934,"1105042":371934,"1105041":466163,"1105040":466163,"1105039":466163,"1105038":466163,"1105037":371936,"1105036":371936,"1105035":371936,"1105034":371936,"1105033":371933,"1105032":371933,"1105031":371933,"1105030":371933,"1105029":371938,"1105028":371938,"1105027":371938,"1105026":371938,"1105025":371935,"1105024":371935,"1105023":371935,"1105022":371935,"1105021":371935,"1105020":371935,"1105019":371935,"1105018":371935,"1105017":371938,"1105016":371938,"1105015":371938,"1105014":371938,"1105013":371933,"1105012":371933,"1105011":371933,"1105010":371933,"1105009":371936,"1105008":371936,"1105007":371936,"1105006":371936,"1105005":466163,"1105004":466163,"1105003":466163,"1105002":466163,"1105001":371934,"1105000":371934,"1104999":371934,"1104998":371934,"1104997":371931,"1104996":371931,"1104995":371931,"1104994":371931,"1104993":371935,"1104992":371935,"1104991":371935,"1104990":371935,"1104989":371938,"1104988":371938,"1104987":371938,"1104986":371938,"1104985":371933,"1104984":371933,"1104983":371933,"1104982":371933,"1104981":371936,"1104980":371936,"1104979":371936,"1104978":371936,"1104977":466163,"1104976":466163,"1104975":466163,"1104974":466163,"1104973":371934,"1104972":371934,"1104971":371934,"1104970":371934,"1104969":371931,"1104968":371935,"1104967":371935,"1104966":371935,"1104965":371935,"1104964":371938,"1104963":371938,"1104962":371938,"1104961":371938,"1104960":371933,"1104959":371933,"1104958":371933,"1104957":371933,"1104956":371936,"1104955":371936,"1104954":371936,"1104953":371936,"1104952":466163,"1104951":466163,"1104950":466163,"1104949":466163,"1104948":371934,"1104947":371934,"1104946":371934,"1104945":371934,"1104944":371931,"1104943":371931,"1104942":371931,"1104941":371931,"1104940":371931,"1104939":371931,"1104938":371931,"1104777":371935,"1104776":371935,"1104775":371935,"1104774":371935,"1104773":371938,"1104772":371938,"1104771":371938,"1104770":371933,"1104769":371933,"1104768":371933,"1104767":371933,"1104766":371936,"1104765":371936,"1104764":371936,"1104763":466163,"1104762":466163,"1104761":466163,"1104760":371934,"1104759":371934,"1104758":371934,"1104757":371931,"1104756":371931,"1104755":371931,"1104753":371935,"1104752":371935,"1104751":371935,"1104750":371935,"1104749":371938,"1104748":371938,"1104747":371938,"1104746":371938,"1104745":371933,"1104744":371933,"1104743":371933,"1104742":371933,"1104741":371936,"1104740":371936,"1104739":371936,"1104738":371936,"1104737":466163,"1104736":466163,"1104735":466163,"1104734":371934,"1104733":371934,"1104732":371934,"1104731":371934,"1104730":371931,"1104729":371931,"1104728":371931,"1104727":371931,"1104725":371938,"1104724":371938,"1104723":371938,"1104722":371938,"1104721":371938,"1104720":371938,"1104719":371938,"1104718":371938,"1104717":371938,"1104716":371938,"1104715":371938,"1104714":371938,"1104713":371938,"1104712":371938,"1104711":371938,"1104710":371938,"1104709":371938,"1104708":371938,"1104707":371938,"1104706":371938,"1104705":371938,"1104704":371938,"1104703":371938,"1104702":371938,"1104701":371933,"1104700":371933,"1104699":371933,"1104698":371933,"1104697":371933,"1104696":371933,"1104695":371933,"1104694":371933,"1104693":371933,"1104692":371933,"1104691":371933,"1104690":371933,"1104689":371933,"1104688":371933,"1104687":371933,"1104686":371933,"1104685":371933,"1104684":371933,"1104683":371933,"1104682":371933,"1104681":371933,"1104680":371933,"1104679":371933,"1104678":371933,"1104677":371936,"1104676":371936,"1104675":371936,"1104674":371936,"1104673":371936,"1104672":371936,"1104671":371936,"1104670":371936,"1104669":371936,"1104668":371936,"1104667":371936,"1104666":371936,"1104665":371936,"1104664":371936,"1104663":371936,"1104662":371936,"1104661":371936,"1104660":371936,"1104659":371936,"1104658":371936,"1104657":371936,"1104656":371936,"1104655":371936,"1104654":371936,"1104653":371935,"1104652":371935,"1104651":371935,"1104650":371935,"1104649":371935,"1104648":371935,"1104647":371935,"1104646":371935,"1104645":371935,"1104644":371935,"1104643":371935,"1104642":371935,"1104641":371935,"1104640":371935,"1104639":371935,"1104638":371935,"1104637":371935,"1104636":371935,"1104635":371935,"1104634":371935,"1104633":371935,"1104632":371935,"1104631":371935,"1104630":371935,"1104629":371934,"1104628":371934,"1104627":371934,"1104626":371934,"1104625":371934,"1104624":371934,"1104623":371934,"1104622":371934,"1104621":371934,"1104620":371934,"1104619":371934,"1104618":371934,"1104617":371934,"1104616":371934,"1104615":371934,"1104614":371934,"1104613":371934,"1104612":371934,"1104611":371934,"1104610":371934,"1104609":371934,"1104608":371934,"1104607":371934,"1104606":371934,"1104605":371931,"1104604":371931,"1104603":371931,"1104602":371931,"1104601":371931,"1104600":371931,"1104599":371931,"1104598":371931,"1104597":371931,"1104596":371931,"1104595":371931,"1104594":371931,"1104593":371931,"1104592":371931,"1104591":371931,"1104590":371931,"1104589":371931,"1104588":371931,"1104587":371931,"1104586":371931,"1104585":371931,"1104584":371931,"1104583":371931,"1104582":371931,"1104581":466163,"1104580":466163,"1104579":466163,"1104578":466163,"1104577":466163,"1104576":466163,"1104575":466163,"1104574":466163,"1104573":466163,"1104572":466163,"1104571":466163,"1104569":466163,"1104552":466163,"1104549":466163,"1104548":466163,"1104547":466163,"1104545":466163,"1104544":466163,"1104543":466163,"1104542":466163,"1104541":466163,"1104539":466163,"1104535":466163,"1104533":466163,"1103816":466163,"1103786":371937,"1103785":371937,"1103768":466163,"1103727":466163,"1103689":466163,"1103632":466163,"1103615":466163,"1103070":371931,"1103067":371936,"1103061":371938,"1103056":371934,"1103044":466163,"1102128":466163,"1101976":371933,"1101974":371935,"1101973":371935,"1101972":371935,"1101971":371935,"1101970":371935,"1101969":371935,"1101968":371935,"1101967":371935,"1101966":371935,"1101965":371935,"1101964":371935,"1101963":371935,"1101962":371938,"1101961":371938,"1101960":371938,"1101959":371938,"1101958":371938,"1101957":371938,"1101956":371938,"1101955":371938,"1101954":371938,"1101953":371938,"1101952":371938,"1101951":371938,"1101950":371933,"1101949":371933,"1101948":371933,"1101947":371933,"1101946":371933,"1101945":371933,"1101944":371933,"1101943":371933,"1101942":371933,"1101941":371933,"1101940":371933,"1101939":371933,"1101938":371936,"1101937":371936,"1101936":371936,"1101935":371936,"1101934":371936,"1101933":371936,"1101932":371936,"1101931":371936,"1101930":371936,"1101929":371936,"1101928":371936,"1101927":371936,"1101926":466163,"1101925":466163,"1101924":466163,"1101923":466163,"1101922":466163,"1101921":466163,"1101920":466163,"1101919":466163,"1101918":466163,"1101917":466163,"1101916":466163,"1101915":466163,"1101914":371934,"1101913":371934,"1101912":371934,"1101911":371934,"1101910":371934,"1101909":371934,"1101908":371934,"1101907":371934,"1101906":371934,"1101905":371934,"1101904":371934,"1101903":371934,"1101902":371931,"1101901":371931,"1101900":371931,"1101899":371931,"1101898":371931,"1101897":371931,"1101895":371931,"1101894":371931,"1101893":371931,"1101892":371931,"1101891":371931,"1101888":371931,"1101887":371931,"1101886":371931,"1101883":371935,"1101882":371935,"1101881":371935,"1101880":371935,"1101879":371938,"1101878":371938,"1101877":371938,"1101876":371938,"1101874":371933,"1101873":371933,"1101872":371933,"1101871":371936,"1101870":371936,"1101869":371936,"1101868":371936,"1101863":466163,"1101862":466163,"1101861":466163,"1101860":466163,"1101859":371934,"1101858":371934,"1101857":371934,"1101856":371934,"1101855":371931,"1101854":371931,"1101853":371931,"1092808":371937,"666801":371935,"666757":371935,"666754":371935,"666753":371935,"666752":371938,"666751":371938,"666750":371938,"666749":371938,"666748":371933,"666747":371933,"666745":371933,"666744":371933,"666743":371937,"666739":371937,"666731":371937,"666728":371937,"666715":371936,"666706":371936,"666703":371936,"666702":371936,"666701":466163,"666700":466163,"666699":466163,"666694":466163,"666690":371934,"666678":371934,"666675":371934,"666622":371934,"666619":371931,"666616":371931,"666614":371931,"666605":371931,"666604":371932,"666598":371932,"666597":371932,"928706":371932};   // baseId vena -> baseId minerale
const PICKAXES = [0xe3c16, 0x6a707, 0x1019d4];
const ORE_NAMES = { 0x5acdb: "corindone", 0x5acdc: "ebano", 0x5acdd: "oricalco grezzo", 0x5acde: "oro grezzo", 0x5acdf: "argento grezzo", 0x5ace0: "pietra di luna", 0x5ace1: "malachite", 0x5ace2: "argento vivo", 0x71cf3: "ferro grezzo" };
const VEIN_YIELD = 2;                 // minerali per ogni scavo
const VEIN_COOLDOWN_MS = 10 * 60 * 1000;   // dopo lo scavo la vena resta esaurita 10 minuti
global.__rbVeins = global.__rbVeins || {};
function doMine(userId, c) {
  const reply = function (t) { try { mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "rbNotify", text: t })); } catch (e) { } };
  try {
    const pid = mp.getUserActor(userId);
    const ore = VEIN_ORE[Number(c.base)];
    if (!pid || !ore) { log("[SCAVO] ignorato: base " + Number(c.base).toString(16) + " non e' una vena"); return; }
    try {   // miniere spente: si scava solo nelle vene riaccese a mano in raccolta-consentita.json
      const R = global.__rbRaccolta, al = (R && R.off) ? raccoltaLeggiPermessi() : null;
      if (al && !(al.refs[Number(c.ref)] || al.bases[Number(c.base)])) { R.blocked++; log("[SCAVO] BLOCCATO vena " + Number(c.ref).toString(16) + " (base " + Number(c.base).toString(16) + "): miniere spente"); reply("Qui non c'è nulla da estrarre."); return; }
    } catch (e) { log("[SCAVO] errore controllo " + e); }
    const pp = mp.get(pid, "pos");
    if (Math.hypot(pp[0] - c.x, pp[1] - c.y) > 450) { log("[SCAVO] troppo lontano"); return; }
    const inv = mp.get(pid, "inventory") || { entries: [] };
    if (!inv.entries.some(function (e) { return PICKAXES.indexOf(e.baseId) >= 0 && e.count > 0; })) { reply("Ti serve un piccone per scavare."); return; }
    const key = String(c.ref), now = Date.now();
    if (global.__rbVeins[key] && global.__rbVeins[key] > now) { reply("La vena e' esaurita. Riprova piu' tardi."); return; }
    global.__rbVeins[key] = now + VEIN_COOLDOWN_MS;
    const pe = inv.entries.find(function (e) { return e.baseId === ore && !e.worn; });
    if (pe) pe.count += VEIN_YIELD; else inv.entries.push({ baseId: ore, count: VEIN_YIELD });
    mpSet(pid, "inventory", inv);
    reply("Hai estratto " + VEIN_YIELD + " x " + (ORE_NAMES[ore] || "minerale") + ".");
    log("[SCAVO] giocatore " + pid.toString(16) + " vena " + key + " (base " + Number(c.base).toString(16) + "): +" + VEIN_YIELD + " di " + ore.toString(16));
  } catch (e) { log("[SCAVO] errore " + e); }
}
const _prevCustomMine = global.__rbCustomPacket;
global.__rbCustomPacket = function (userId, rawContent) {
  try { const c = JSON.parse(rawContent); if (c.customPacketType === "rbMine") { doMine(userId, c); return; } if (c.customPacketType === "rbProbeRes") { atOut("risposta del gioco (" + c.tag + "): " + JSON.stringify(c.out)); return; } if (c.customPacketType === "rbHideStat") { log("[NASCONDI] client: nascosti " + c.n + ", gia visti " + c.dup + ", errori " + c.err + (c.lastErr ? " (" + c.lastErr + ")" : "") + ", cicli " + c.calls + ", spenti dalla passata sulla cella " + c.sweepN + ", vene " + c.vene + ", piante-albero " + c.piante + ", ancora visibili " + c.ancoraAttivi + " su " + c.tracciati + " | controllo cella: " + JSON.stringify(c.audit || {})); return; } } catch (e) { }
  if (_prevCustomMine) _prevCustomMine(userId, rawContent);
};

// ================== AUTOTEST DELLA CONQUISTA (solo prove) ==================
// Si lancia scrivendo nel file autotest-cmd.txt (cartella del server): "fort 1", "fort 2", "zona 1", "zona 2" oppure "tutto".
// Usa un giocatore FINTO vicino al forte (nessun giocatore vero serve). Risultato in autotest-result.txt.
const AT_FAKE = "fake1";
function atOut(m) { log("[TEST] " + m); try { _fs.appendFileSync("autotest-result.txt", new Date().toISOString().slice(11, 19) + " " + m + "\n"); } catch (e) { } }
function atCheck(T, name, ok, detail) { T.checks.push({ name: name, ok: !!ok }); atOut((ok ? "PASS  " : "FAIL  ") + name + (detail ? " - " + detail : "")); }
function setFake(f, d) { global.__rbFakePlayers = global.__rbFakePlayers || {}; global.__rbFakePlayers[AT_FAKE] = { t: Date.now(), world: 0x3c, pos: [f.cx + d, f.cy, f.cz] }; }
function clearFake() { if (global.__rbFakePlayers) delete global.__rbFakePlayers[AT_FAKE]; }
function isAlive(id) { try { return mp.get(id, "isDead") !== true; } catch (e) { return false; } }
function atSummary(T, titolo) {
  const bad = T.checks.filter(function (c) { return !c.ok; });
  atOut("RISULTATO " + titolo + ": " + (T.checks.length - bad.length) + " controlli riusciti, " + bad.length + " falliti" + (bad.length ? " -> " + bad.map(function (c) { return c.name; }).join("; ") : ""));
}
function lootProblems(rec, entries) {
  const ok = [ORE_ORICHALCUM, INGOT_ORICHALCUM, GOLD].concat(ORCISH_PIECES);
  const g = {}; const probs = [];
  entries.forEach(function (e) { if (e.worn) probs.push("indossato " + e.baseId.toString(16)); if (ok.indexOf(e.baseId) < 0) probs.push("oggetto non previsto " + e.baseId.toString(16)); g[e.baseId] = (g[e.baseId] || 0) + e.count; });
  const ore = g[ORE_ORICHALCUM] || 0, ing = g[INGOT_ORICHALCUM] || 0, gold = g[GOLD] || 0;
  if (rec.kind === "orco_capo") {
    if (ore !== 5) probs.push("oricalco " + ore + " (deve essere 5)");
    if (ing !== 2) probs.push("lingotti " + ing + " (devono essere 2)");
    if (gold < 300 || gold > 500) probs.push("monete " + gold + " (300-500)");
  } else {
    if (ore < 1 || ore > 3) probs.push("oricalco " + ore + " (1-3)");
    if (ing > 2) probs.push("lingotti " + ing + " (0-2)");
    if (gold && (gold < 10 || gold > 20)) probs.push("monete " + gold + " (0 o 10-20)");
    ORCISH_PIECES.forEach(function (pid) { if (g[pid]) probs.push("pezzo orchesco su orco non capo"); });
  }
  return probs;
}
function runFortTest(fid, done) {
  const f = FORTS.find(function (x) { return x.id === fid; }); if (!f) { if (done) done(); return; }
  const T = global.__rbAT = { running: true, checks: [], births: [], deaths: [], gaps: [], bornAt: {}, lootRes: [], banner: null, sawBadHp: [], sawBadEq: [], armor: {} };
  const st = global.__rbFortSt[f.id];
  atOut("=== TEST FORTE " + f.id + " (" + f.name + ") ===");
  restartFort(f);
  setFake(f, 9000);
  T.onBirth = function (id, kind, slot, ff) {
    if (ff && ff.id !== f.id) return;   // conta solo gli orchi di questo forte (l'altro forte puo' rinascere in parallelo)
    const t = Date.now();
    T.births.push({ id: id, kind: kind, t: t });
    T.bornAt[id] = t;
    if (slot._dt) { T.gaps.push(t - slot._dt); slot._dt = 0; }
  };
  T.onDeath = function (id, o) {
    const t = Date.now();
    const rec = { id: id, kind: o.kind, t: t, last: !!o.last, goneT: 0 };
    T.deaths.push(rec);
    if (o.slot) o.slot._dt = t;
    setTimeout(function () {
      try {
        const inv = mp.get(id, "inventory"); const ent = (inv && inv.entries) || [];
        const pr = lootProblems(rec, ent);
        T.lootRes.push({ kind: rec.kind, ok: pr.length === 0, items: ent.map(function (e) { return e.baseId.toString(16) + "x" + e.count; }), pr: pr });
        if (pr.length) atOut("  loot SBAGLIATO su " + rec.kind + " " + id.toString(16) + ": " + pr.join(", ") + " | " + JSON.stringify(ent.map(function (e) { return e.baseId.toString(16) + "x" + e.count; })));
      } catch (e) { T.lootRes.push({ kind: rec.kind, ok: false, pr: ["lettura fallita " + e] }); }
    }, 2800);
  };
  T.onConquest = function (ff, text) { T.banner = text; T.conqAt = Date.now(); };
  // controllo di un orco vivo da almeno 4,5 s: vita piena, moltiplicatore giusto, equipaggiamento giusto
  const ids = getWeaponIds();
  function inspect(id) {
    const o = ORCS[id]; if (!o) return;
    try {
      const hp = getHp(id), sc = global.__rbHpScale[id];
      if (typeof hp !== "number" || hp < 0.999) T.sawBadHp.push(o.kind + " " + id.toString(16) + " vita " + hp);
      else if (!sc || sc.want !== ORC_HP[o.kind]) T.sawBadHp.push(o.kind + " " + id.toString(16) + " moltiplicatore " + JSON.stringify(sc));
      const inv = mp.get(id, "inventory"); const ent = (inv && inv.entries) || [];
      const weap = ent.filter(function (e) { return ids.w.has(e.baseId); });
      const shl = ent.filter(function (e) { return ids.s.has(e.baseId); });
      const twoH = o.kind === "orco_guerriero" || o.kind === "orco_furioso" || o.kind === "orco_capo";
      const wantW = twoH ? STEEL_GREATSWORD : STEEL_SWORD;
      const okW = weap.length === 1 && weap[0].baseId === wantW && weap[0].worn;
      const okS = twoH ? shl.length === 0 : (shl.length === 1 && shl[0].baseId === STEEL_SHIELD && shl[0].worn);
      if (!okW || !okS) T.sawBadEq.push(o.kind + " " + id.toString(16) + " armi " + JSON.stringify(weap.map(function (e) { return e.baseId.toString(16) + (e.worn ? "*" : ""); })) + " scudi " + JSON.stringify(shl.map(function (e) { return e.baseId.toString(16); })));
      if (o.kind === "orco_capo" || o.kind === "orco_corazzato") { T.armor[o.kind] = ent.filter(function (e) { return e.worn && !ids.w.has(e.baseId) && !ids.s.has(e.baseId); }).map(function (e) { return e.baseId.toString(16); }); }
    } catch (e) { T.sawBadEq.push(o.kind + " " + id.toString(16) + " errore " + e); }
  }
  T.cpTimer = setInterval(function () {   // sorveglia i cadaveri: segna l'istante preciso in cui spariscono
    T.deaths.forEach(function (r) { if (r.goneT) return; let gone = false; try { gone = mp.get(r.id, "isDead") !== true; } catch (e) { gone = true; } if (gone) r.goneT = Date.now(); });
  }, 1000);
  const t0 = Date.now();
  const killTimer = setInterval(function () {
    try {
      setFake(f, 9000);
      fortOrcIds(f).forEach(function (id) {
        if (!isAlive(id)) return;
        if (Date.now() - (T.bornAt[id] || 0) < 4500) return;
        inspect(id);
        try { mpSet(id, "isDead", true); } catch (e) { atOut("  uccisione fallita " + e); }
      });
      if (st.conquered || Date.now() - t0 > 600000) { clearInterval(killTimer); after(); }
    } catch (e) { atOut("  errore ciclo " + e); }
  }, 1500);
  function after() {
    atOut("conquista raggiunta dopo " + Math.round((Date.now() - t0) / 1000) + " s, nati " + T.births.length + ", morti " + T.deaths.length);
    const nBirths = T.births.length;
    setTimeout(function () {
      const kinds = T.births.map(function (b) { return b.kind; });
      const first40 = kinds.slice(0, 40), allowed = ["orco", "orco_guerriero", "orco_furioso"];
      atCheck(T, "nati in tutto 50", nBirths === 50, "nati " + nBirths);
      atCheck(T, "primi 40 solo normali/furiosi", first40.length === 40 && first40.every(function (k) { return allowed.indexOf(k) >= 0; }), JSON.stringify(first40.reduce(function (a, k) { a[k] = (a[k] || 0) + 1; return a; }, {})));
      atCheck(T, "il 41esimo e' il capo", kinds[40] === "orco_capo", "41esimo = " + kinds[40]);
      atCheck(T, "dal 42esimo solo corazzati (9)", kinds.slice(41).length === 9 && kinds.slice(41).every(function (k) { return k === "orco_corazzato"; }), kinds.slice(41).join(","));
      atCheck(T, "nessun capo o corazzato prima del 41esimo", kinds.slice(0, 40).every(function (k) { return k !== "orco_capo" && k !== "orco_corazzato"; }));
      atCheck(T, "uccisioni = 50 e forte conquistato", st.kills === 50 && st.conquered, "uccisioni " + st.kills);
      atCheck(T, "nessun orco nato dopo la conquista", T.births.length === nBirths && aliveCount(f) === 0, "vivi " + aliveCount(f));
      atCheck(T, "scritta di conquista corretta", T.banner === "FORTE " + (f.id === 1 ? "NARZULBUR" : "LARGASHBUR") + " CONQUISTATO!", String(T.banner));
      const minGap = T.gaps.length ? Math.min.apply(null, T.gaps) : 0;
      atCheck(T, "rinascita non prima di 4 s", T.gaps.length > 0 && minGap >= 3900, "minimo " + minGap + " ms su " + T.gaps.length + " rinascite, massimo " + (T.gaps.length ? Math.max.apply(null, T.gaps) : 0) + " ms");
      atCheck(T, "tutti gli orchi nascono a barra piena con vita giusta", T.sawBadHp.length === 0, T.sawBadHp.slice(0, 3).join(" | "));
      atCheck(T, "armi d'acciaio giuste su tutti", T.sawBadEq.length === 0, T.sawBadEq.slice(0, 3).join(" | "));
      atOut("  armature indossate dal capo: " + JSON.stringify(T.armor.orco_capo) + "  corazzato: " + JSON.stringify(T.armor.orco_corazzato));
      const lootBad = T.lootRes.filter(function (x) { return !x.ok; });
      atCheck(T, "loot rispetta le regole su ogni cadavere (" + T.lootRes.length + " letti)", T.lootRes.length >= 45 && lootBad.length === 0, lootBad.length + " sbagliati");
      const stat = { ing: 0, gold: 0, n: 0 };
      T.lootRes.forEach(function (x) { if (x.kind === "orco_capo") return; stat.n++; if (x.items.some(function (i) { return i.indexOf(INGOT_ORICHALCUM.toString(16) + "x") === 0; })) stat.ing++; if (x.items.some(function (i) { return i.indexOf("fx") === 0; })) stat.gold++; });
      atOut("  loot normali: lingotti " + stat.ing + "/" + stat.n + " (atteso circa 15%), monete " + stat.gold + "/" + stat.n + " (atteso circa 45%)");
      // cadaveri: capo e corazzati 5 minuti, gli altri 30 s
      let waitUntil = Date.now() + 330000;
      const cp = setInterval(function () {
        const pending = T.deaths.filter(function (r) { return !r.goneT; });
        if (!pending.length || Date.now() > waitUntil) {
          clearInterval(cp); clearInterval(T.cpTimer);
          const norm = T.deaths.filter(function (r) { return !r.last && r.goneT; }), big = T.deaths.filter(function (r) { return r.last && r.goneT; });
          const dn = norm.map(function (r) { return r.goneT - r.t; }), db = big.map(function (r) { return r.goneT - r.t; });
          atCheck(T, "cadaveri normali spariscono dopo 30 s", dn.length > 0 && Math.min.apply(null, dn) >= 29000 && Math.max.apply(null, dn) <= 36000, dn.length ? "tra " + Math.min.apply(null, dn) + " e " + Math.max.apply(null, dn) + " ms su " + dn.length : "nessuno");
          atCheck(T, "capo e corazzati spariscono dopo 5 minuti", db.length === 10 && Math.min.apply(null, db) >= 299000 && Math.max.apply(null, db) <= 306000, db.length ? "tra " + Math.min.apply(null, db) + " e " + Math.max.apply(null, db) + " ms su " + db.length : "nessuno");
          atCheck(T, "nessun cadavere rimasto", pending.length === 0, pending.length + " rimasti");
          // riavvio del forte
          restartFort(f);
          atCheck(T, "riavvio forte: conteggio 0 e riacceso", st.kills === 0 && !st.conquered && aliveCount(f) === 0);
          setFake(f, 9000);
          setTimeout(function () {
            atCheck(T, "dopo il riavvio nascono di nuovo " + INSIDE_COUNT + " orchi", aliveCount(f) === INSIDE_COUNT, "vivi " + aliveCount(f));
            restartFort(f); clearFake(); T.onBirth = null; T.onDeath = null; T.onConquest = null;
            atSummary(T, "FORTE " + f.id);
            T.running = false; global.__rbATResults = (global.__rbATResults || []).concat([{ fort: f.id, checks: T.checks }]);
            if (done) done();
          }, 14000);
        }
      }, 3000);
    }, 12000);
  }
}
// prova degli stati del forte con giocatori FINTI: pattuglia -> attacco (zona rossa) -> attesa 15 s al confine -> zona gialla -> ritorno.
// Controlla anche che nessun orco venga mai distrutto/ricreato (stessi id), che i bersagli siano giusti e che il tick resti veloce con 50 giocatori.
function setFakeN(key, f, d, ang) { global.__rbFakePlayers = global.__rbFakePlayers || {}; const a = ang || 0; global.__rbFakePlayers[key] = { t: Date.now(), world: 0x3c, pos: [f.cx + Math.cos(a) * d, f.cy + Math.sin(a) * d, f.cz] }; }
function clearAllFakes() { global.__rbFakePlayers = {}; }
function runZoneTest(fid, done) {
  const f = FORTS.find(function (x) { return x.id === fid; }); if (!f) { if (done) done(); return; }
  const T = global.__rbAT = { running: true, checks: [] };
  atOut("=== TEST STATI DEL FORTE " + f.id + " (" + f.name + ") ===");
  restartFort(f); clearAllFakes(); setFakeN("fake1", f, 15000);
  const keep = setInterval(function () { Object.keys(global.__rbFakePlayers || {}).forEach(function (k) { global.__rbFakePlayers[k].t = Date.now(); }); }, 2000);
  const fsOf = function () { return global.__rbFS[f.id]; };
  const idsNow = function () { return fortOrcIds(f).slice().sort().join(","); };
  let ids0 = "";
  const step = function (ms, fn) { return new Promise(function (res) { setTimeout(function () { try { fn(); } catch (e) { atOut("  errore passo " + e); } res(); }, ms); }); };
  step(14000, function () {
    ids0 = idsNow();
    atCheck(T, "all'avvio ci sono " + INSIDE_COUNT + " orchi vivi", aliveCount(f) === INSIDE_COUNT, "vivi " + aliveCount(f));
    let outside = 0, same = {};
    global.__rbSlots[f.id].inside.forEach(function (sl) { try { const p = mp.get(sl.id, "pos"); if (Math.hypot(p[0] - f.cx, p[1] - f.cy) > RED_R) outside++; same[Math.round(sl.hx) + "," + Math.round(sl.hy)] = 1; } catch (e) { outside++; } });
    atCheck(T, "tutti gli orchi nascono dentro la zona rossa", outside === 0, outside + " fuori");
    atCheck(T, "i punti di nascita sono sparsi (tutti diversi)", Object.keys(same).length === INSIDE_COUNT, Object.keys(same).length + " punti diversi");
    atCheck(T, "senza nessuno vicino lo stato e' pattuglia", fsOf().mode === "patrol", fsOf().mode);
  }).then(function () {
    setFakeN("fake1", f, 3500);   // dentro la zona rossa
    return step(3500, function () {
      atCheck(T, "un giocatore in zona rossa: gli orchi attaccano", fsOf().mode === "attack", fsOf().mode);
      const tg = fortOrcIds(f).filter(function (id) { return fsOf().targets[id] === "fake1"; }).length;
      atCheck(T, "ogni orco ha come bersaglio quel giocatore", tg === aliveCount(f), tg + "/" + aliveCount(f));
    });
  }).then(function () {
    setFakeN("fake1", f, 7500);   // fuori dalla rossa, dentro la gialla
    return step(3500, function () {
      atCheck(T, "uscito dalla rossa: gli orchi aspettano al confine", fsOf().mode === "hold", fsOf().mode);
      atCheck(T, "durante l'attesa nessun bersaglio", Object.keys(fsOf().targets).length === 0);
    });
  }).then(function () {
    return step(9000, function () { atCheck(T, "dopo 9 s e' ancora attesa (15 s)", fsOf().mode === "hold", fsOf().mode); });
  }).then(function () {
    return step(6500, function () {
      atCheck(T, "dopo 15 s con il giocatore ancora in gialla: attaccano anche in gialla", fsOf().mode === "yellow", fsOf().mode);
      const tg = fortOrcIds(f).filter(function (id) { return fsOf().targets[id] === "fake1"; }).length;
      atCheck(T, "in gialla tutti hanno il bersaglio", tg === aliveCount(f), tg + "/" + aliveCount(f));
    });
  }).then(function () {
    setFakeN("fake1", f, 15000);   // fuori da tutto
    return step(3500, function () {
      atCheck(T, "tutti fuori dalla gialla: gli orchi tornano in pattuglia", fsOf().mode === "patrol", fsOf().mode);
      atCheck(T, "gli stessi orchi di prima (nessuno cancellato o ricreato)", idsNow() === ids0, "prima " + ids0.split(",").length + " dopo " + idsNow().split(",").length);
    });
  }).then(function () {
    setFakeN("fake1", f, 3500);
    return step(3500, function () { atCheck(T, "rientro in rossa: di nuovo attacco", fsOf().mode === "attack", fsOf().mode); });
  }).then(function () {
    setFakeN("fake1", f, 15000);   // esce subito da tutto: attesa, ma senza nessuno in gialla si torna subito in pattuglia
    return step(3500, function () { atCheck(T, "uscita rapida da rossa e gialla: pattuglia senza aspettare", fsOf().mode === "patrol", fsOf().mode); });
  }).then(function () {
    // tre giocatori: ognuno dalla sua parte, ogni orco sceglie il piu' vicino a lui
    clearAllFakes(); setFakeN("g1", f, 3000, 0); setFakeN("g2", f, 3000, 2.1); setFakeN("g3", f, 3000, 4.2);
    return step(3500, function () {
      const cnt = {}; fortOrcIds(f).forEach(function (id) { const t = fsOf().targets[id]; cnt[t] = (cnt[t] || 0) + 1; });
      atCheck(T, "con 3 giocatori in rossa tutti gli orchi hanno un bersaglio", Object.values(cnt).reduce(function (a, b) { return a + b; }, 0) === aliveCount(f), JSON.stringify(cnt));
      atCheck(T, "gli orchi si dividono tra i 3 giocatori", Object.keys(cnt).length === 3, JSON.stringify(cnt));
    });
  }).then(function () {
    // anti-balletto: i giocatori si muovono un poco -> nessun orco cambia bersaglio; se un giocatore sparisce, i suoi orchi passano agli altri
    const before = Object.assign({}, fsOf().targets);
    setFakeN("g1", f, 3200, 0.15); setFakeN("g2", f, 2800, 2.0); setFakeN("g3", f, 3100, 4.35);
    return step(4500, function () {
      const now = fsOf().targets; let changed = 0;
      Object.keys(before).forEach(function (id) { if (now[id] !== before[id]) changed++; });
      atCheck(T, "anti-balletto: piccoli movimenti non fanno cambiare bersaglio a nessun orco", changed === 0, changed + " orchi hanno cambiato bersaglio");
    });
  }).then(function () {
    delete global.__rbFakePlayers["g1"];
    return step(3500, function () {
      const t = fsOf().targets; const onG1 = Object.keys(t).filter(function (id) { return t[id] === "g1"; }).length;
      const n = Object.keys(t).length;
      atCheck(T, "se un giocatore sparisce i suoi orchi passano agli altri", onG1 === 0 && n === aliveCount(f), "su g1: " + onG1 + ", con bersaglio " + n + "/" + aliveCount(f));
    });
  }).then(function () {
    // 50 giocatori: il tick deve restare veloce e ogni orco deve avere un bersaglio
    clearAllFakes();
    for (let i = 0; i < 50; i++) setFakeN("p" + i, f, 1000 + (i % 5) * 900, i * 0.2);
    const t0 = Date.now(); fortTick(); const ms = Date.now() - t0;
    atCheck(T, "con 50 giocatori il calcolo dura meno di 100 ms", ms < 100, ms + " ms");
    const tg = fortOrcIds(f).filter(function (id) { return fsOf().targets[id] !== undefined; }).length;
    atCheck(T, "con 50 giocatori ogni orco ha un bersaglio", tg === aliveCount(f), tg + "/" + aliveCount(f));
    return step(500, function () { });
  }).then(function () {
    clearAllFakes(); setFakeN("fake1", f, 15000);
    return step(5000, function () {
      atCheck(T, "alla fine tutti gli orchi sono ancora gli stessi", idsNow() === ids0, "");
      let badHp = 0; fortOrcIds(f).forEach(function (id) { try { if (getHp(id) < 0.999) badHp++; } catch (e) { badHp++; } });
      atCheck(T, "tutti a barra piena", badHp === 0, badHp + " non pieni");
    });
  }).then(function () {
    clearInterval(keep); restartFort(f); clearAllFakes();
    atSummary(T, "STATI FORTE " + f.id);
    T.running = false; global.__rbATResults = (global.__rbATResults || []).concat([{ zona: f.id, checks: T.checks }]);
    if (done) done();
  });
}
function runAutotest(cmd) {
  if (global.__rbAT && global.__rbAT.running) { atOut("un test e' gia' in corso, ignoro '" + cmd + "'"); return; }
  const parts = String(cmd).trim().split(/\s+/); const what = parts[0], n = Number(parts[1]);
  atOut(">>> avvio autotest: " + cmd);
  if (what === "diag") {   // stato dei giocatori collegati: morto?, vita, inventario, equipaggiamento
    onlineUsers().forEach(function (u) {
      try {
        const a = mp.getUserActor(u);
        const inv = mp.get(a, "inventory"), eq = mp.get(a, "equipment");
        atOut("giocatore " + u + " attore " + (a || 0).toString(16) + " morto=" + mp.get(a, "isDead") + " vita=" + JSON.stringify(mp.get(a, "percentages")) + " pos=" + JSON.stringify(mp.get(a, "pos")));
        atOut("  inventario: " + JSON.stringify(((inv && inv.entries) || []).map(function (e) { return e.baseId.toString(16) + "x" + e.count + (e.worn ? "*" : ""); })));
        atOut("  equipaggiamento: " + JSON.stringify(eq).slice(0, 600));
      } catch (e) { atOut("diag errore " + e); }
    });
    return;
  }
  if (what === "fauna") { try { global.__rbFaunaCmd(parts); } catch (e) { atOut("fauna errore " + e); } return; }
  if (what === "macellaio") { try { global.__rbPesciCmd(parts); } catch (e) { atOut("macellaio errore " + e); } return; }
  if (what === "raccolta") {   // raccolta <riferimento in esadecimale>: dice cosa e' e se verrebbe bloccato; raccolta scan: elenca le basi di piante/ingredienti/miniere
    if (parts[1] === "critter") {   // raccolta critter: elenca (a pezzi) gli "animaletti d'ambiente" del gioco (pesci, farfalle, libellule, uccelli...) con quanti ne vengono messi nel mondo -> raccolta-critter.txt
      const rx = /critter|butterfly|dragonfly|moth|firefly|fireflies|bird|seagull|hawk|crow|raven|bat0|bats\b|fish|salmon|bee\b|bees\b|fly\b|flies|insect|mite|swarm|frog|toad|ambientanimal|ambanim/i;
      const starts = [0x0, 0x1000000, 0x2000000, 0x3000000, 0x4000000]; let si = 0, id = 0; const bases = {}; const cnt = {}; const t0 = Date.now(); atOut("critter: inizio");
      const tick = function () {
        const lim = Math.min(id + 25000, 0x180000);
        for (; id < lim; id++) {
          try {
            const gid = starts[si] + id; const rr = mp.lookupEspmRecordById(gid); const rec = rr && rr.record; if (!rec) continue;
            if (rec.type === "ACTI") { const ed = String(rec.editorId || ""); if (rx.test(ed)) bases[gid] = ed; }
            else if (rec.type === "REFR" && rec.fields) {
              const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); if (!nf) continue;
              const b = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0); cnt[b] = (cnt[b] || 0) + 1;
            }
          } catch (e) { }
        }
        if (id >= 0x180000) { si++; id = 0; }
        if (si >= starts.length) {
          const out = Object.keys(bases).map(function (k) { return Number(k).toString(16) + " " + bases[k] + " x" + (cnt[k] || 0); });
          try { _fs.writeFileSync("raccolta-critter.txt", out.join("\n") + "\n"); } catch (e) { atOut("critter: scrittura fallita " + e); }
          atOut("critter finito in " + Math.round((Date.now() - t0) / 1000) + " s: " + out.length + " basi (elenco in raccolta-critter.txt)"); return;
        }
        setTimeout(tick, 30);
      };
      tick(); return;
    }
    if (parts[1] === "terra") {   // raccolta terra: elenca animali piazzati dal gioco e alberi (per avere punti di terra con la quota giusta) nella zona Windhelm-Riften -> raccolta-terra.txt
      const rxA = /deer|elk|wolf|fox|rabbit|hare|goat|bear|sabre|spider|frostbite|mudcrab|skeever|horker|mammoth|troll|snowfox|boar/i;
      const rxT = /^tree/i;
      const starts = [0x0, 0x1000000, 0x2000000, 0x3000000, 0x4000000]; let si = 0, id = 0; const out = []; const t0 = Date.now(); const cache = {}; atOut("terra: inizio");
      const info = function (b) { if (cache[b] !== undefined) return cache[b]; let r = null; try { const rr = mp.lookupEspmRecordById(b); const rec = rr && rr.record; if (rec) { const ed = String(rec.editorId || ""); const ty = String(rec.type); if ((ty === "NPC_" || ty === "LVLN") && rxA.test(ed)) r = "A:" + ty + ":" + ed; else if (ty === "TREE" && rxT.test(ed)) r = "T:" + ed; } } catch (e) { } cache[b] = r; return r; };
      const tick = function () {
        const lim = Math.min(id + 25000, 0x180000);
        for (; id < lim; id++) {
          try {
            const gid = starts[si] + id; const rr = mp.lookupEspmRecordById(gid); const rec = rr && rr.record; if (!rec || (rec.type !== "REFR" && rec.type !== "ACHR") || !rec.fields) continue;
            const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); const df = rec.fields.find(function (f) { return f.type === "DATA"; }); if (!nf || !df) continue;
            const base = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0); const inf = info(base); if (!inf) continue;
            const dv = new DataView(new ArrayBuffer(12)); for (let i = 0; i < 12; i++) dv.setUint8(i, df.data[i]);
            const fx = dv.getFloat32(0, true), fy = dv.getFloat32(4, true), fz = dv.getFloat32(8, true);
            if (fx < 60000 || fx > 200000 || fy < -115000 || fy > 125000) continue;
            out.push(inf + " " + gid.toString(16) + " " + Math.round(fx) + " " + Math.round(fy) + " " + Math.round(fz));
          } catch (e) { }
        }
        if (id >= 0x180000) { si++; id = 0; }
        if (si >= starts.length) {
          try { _fs.writeFileSync("raccolta-terra.txt", out.join("\n") + "\n"); } catch (e) { atOut("terra: scrittura fallita " + e); }
          atOut("terra finito in " + Math.round((Date.now() - t0) / 1000) + " s: " + out.length + " righe"); return;
        }
        setTimeout(tick, 30);
      };
      tick(); return;
    }
    if (parts[1] === "punti") {   // raccolta punti: elenca dove il gioco originale mette punti pesca, nidi, vongole e pesci macellaio (solo mondo aperto) in raccolta-punti-pesca.txt
      const want = { 0x106d28: "pesca1", 0x106d29: "pesca2", 0x106d2a: "pesca3", 0x106d2b: "pesca4", 0x106d2c: "pesca5", 0x26d75: "FishSpawner", 0x10638e: "SpawnStagnoPesci", 0x7e8c6: "nido-uova", 0x85f80: "vongola", 0x85f82: "vongola-sottile", 0x85f83: "vongola-grande", 0x23ab8: "pesce-macellaio", 0xad0cc: "salmone-ambiente2", 0xd337f: "salmone-ambiente1", 0x176b2: "salmone-morto2", 0x176cd: "salmone-morto1" };
      let id = 0; const out = []; const t0 = Date.now(); atOut("punti pesca: inizio");
      const tick = function () {
        const lim = Math.min(id + 30000, 0x180000);
        for (; id < lim; id++) {
          try {
            const rr = mp.lookupEspmRecordById(id); const rec = rr && rr.record; if (!rec || rec.type !== "REFR" || !rec.fields) continue;
            const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); const df = rec.fields.find(function (f) { return f.type === "DATA"; }); if (!nf || !df) continue;
            const base = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0); if (!want[base]) continue;
            const buf = new ArrayBuffer(12); const dv = new DataView(buf); for (let i = 0; i < 12; i++) dv.setUint8(i, df.data[i]);
            const fx = dv.getFloat32(0, true), fy = dv.getFloat32(4, true), fz = dv.getFloat32(8, true);
            out.push(want[base] + " " + id.toString(16) + " " + Math.round(fx) + " " + Math.round(fy) + " " + Math.round(fz));
          } catch (e) { }
        }
        if (id < 0x180000) { setTimeout(tick, 30); return; }
        try { _fs.writeFileSync("raccolta-punti-pesca.txt", out.join("\n") + "\n"); } catch (e) { atOut("punti pesca: scrittura fallita " + e); }
        atOut("punti pesca finito in " + Math.round((Date.now() - t0) / 1000) + " s: " + out.length + " righe");
      };
      tick(); return;
    }
    if (parts[1] === "pesci") {   // raccolta pesci: cerca nei file del gioco tutto cio' che e' legato ai pesci (creature, ingredienti, piante/nidi) e scrive raccolta-pesci.txt con gli effetti alchemici
      const rx = /fish|salmon|roe|pearl|scale|longfin|spadetail|histcarp|angler|eel\b|oyster|clam|crab|chitin|char\b|carp|trout|bass|lamprey|glass/i;
      const rd32 = function (d, o) { return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16) | (d[o + 3] << 24)) >>> 0); };
      const starts = [0x0, 0x1000000, 0x2000000, 0x3000000, 0x4000000]; let si = 0, id = 0; const out = []; const t0 = Date.now();
      const mg = function (m) { try { const r = mp.lookupEspmRecordById(m); return r && r.record ? String(r.record.editorId || m.toString(16)) : m.toString(16); } catch (e) { return m.toString(16); } };
      atOut("pesci: inizio");
      const tick = function () {
        const lim = Math.min(id + 20000, 0x180000);
        for (; id < lim; id++) {
          try {
            const rr = mp.lookupEspmRecordById(starts[si] + id); const rec = rr && rr.record; if (!rec) continue;
            const ty = String(rec.type); if (ty !== "INGR" && ty !== "NPC_" && ty !== "FLOR" && ty !== "ACTI" && ty !== "ALCH" && ty !== "MISC" && ty !== "CONT") continue;
            const ed = String(rec.editorId || ""); if (!rx.test(ed)) continue;
            let line = ty + " " + (starts[si] + id).toString(16) + " " + ed;
            if (ty === "INGR") {
              const ef = (rec.fields || []).filter(function (f) { return f.type === "EFID"; }).map(function (f) { return mg(rd32(f.data, 0)); });
              const fit = (rec.fields || []).filter(function (f) { return f.type === "EFIT"; }).map(function (f) { try { const b = new DataView(new ArrayBuffer(12)); for (let i = 0; i < 12; i++) b.setUint8(i, f.data[i]); return Math.round(b.getFloat32(0, true) * 100) / 100 + "/" + b.getUint32(8, true) + "s"; } catch (e) { return "?"; } });
              const dt = (rec.fields || []).find(function (f) { return f.type === "DATA"; });
              let w = ""; try { if (dt && dt.data && dt.data.length >= 8) { const b = new DataView(new ArrayBuffer(8)); for (let i = 0; i < 8; i++) b.setUint8(i, dt.data[i]); w = " valore=" + b.getUint32(0, true) + " peso=" + Math.round(b.getFloat32(4, true) * 100) / 100; } } catch (e) { }
              line += w + " | effetti: " + ef.map(function (n, i) { return n + "(" + (fit[i] || "") + ")"; }).join(" ; ");
            }
            out.push(line);
          } catch (e) { }
        }
        if (id >= 0x180000) { si++; id = 0; }
        if (si >= starts.length) {
          try { _fs.writeFileSync("raccolta-pesci.txt", out.join("\n") + "\n"); } catch (e) { atOut("pesci: scrittura fallita " + e); }
          atOut("pesci finito in " + Math.round((Date.now() - t0) / 1000) + " s: " + out.length + " righe in raccolta-pesci.txt"); return;
        }
        setTimeout(tick, 30);
      };
      tick(); return;
    }
    if (parts[1] === "scan2") {   // elenca (a pezzi) le basi di OGGETTI messi nel mondo dai file del gioco: libri, contenitori, armi, armature, pozioni, ecc.
      const TY = { BOOK: 1, CONT: 1, MISC: 1, WEAP: 1, ARMO: 1, AMMO: 1, ALCH: 1, SCRL: 1, SLGM: 1, KEYM: 1, INGR: 1, FLOR: 1 };
      const starts = [0x00000000, 0x01000000, 0x02000000, 0x03000000, 0x04000000, 0x05000000, 0x06000000, 0x07000000, 0x08000000, 0x09000000]; let si = 0, id = 0;
      const seen = {}, cnt = {}; const t0 = Date.now(); const baseTy = {};
      atOut("scan2: inizio");
      const tick = function () {
        const lim = Math.min(id + 20000, 0x180000);
        for (; id < lim; id++) {
          try {
            const rr = mp.lookupEspmRecordById(starts[si] + id); const rec = rr && rr.record; if (!rec || rec.type !== "REFR" || !rec.fields) continue;
            const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); if (!nf || !nf.data) continue;
            const base = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0);
            if (seen[base] !== undefined) { if (seen[base]) seen[base]++; continue; }
            const br = mp.lookupEspmRecordById(base); const b = br && br.record; const ty = b ? String(b.type || "") : "";
            if (TY[ty]) { seen[base] = 1; baseTy[base] = ty + " " + String(b.editorId || ""); cnt[ty] = (cnt[ty] || 0) + 1; } else seen[base] = 0;
          } catch (e) { }
        }
        if (id >= 0x180000) { si++; id = 0; }
        if (si >= starts.length) {
          const out = Object.keys(baseTy).map(function (k) { return Number(k).toString(16) + " " + baseTy[k] + " x" + seen[k]; });
          try { _fs.writeFileSync("raccolta-oggetti.txt", out.join("\n") + "\n"); } catch (e) { atOut("scan2: scrittura fallita " + e); }
          atOut("scan2 finito in " + Math.round((Date.now() - t0) / 1000) + " s: " + JSON.stringify(cnt) + " (elenco in raccolta-oggetti.txt)");
          return;
        }
        setTimeout(tick, 30);
      };
      tick(); return;
    }
    if (parts[1] === "scan") { raccoltaScan(); return; }
    if (parts[1] === "tp") {   // prova: ti porta davanti alla pianta raccoglibile piu' vicina (dalle schede del gioco), guardandola
      const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
      const u = us[0], a = mp.getUserActor(u), pp = PLAYERS[u].pos; let best = null, bd = 1e18;
      const skip = String(parts[2] || "");
      for (let id = 0x50000; id < 0x60000; id++) {
        try {
          const rr = mp.lookupEspmRecordById(id); const rec = rr && rr.record; if (!rec || rec.type !== "REFR" || !rec.fields) continue;
          const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); const df = rec.fields.find(function (f) { return f.type === "DATA"; }); if (!nf || !df) continue;
          const base = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0);
          const br = mp.lookupEspmRecordById(base); const b = br && br.record; if (!b || b.type !== "TREE" || !/Flora/i.test(String(b.editorId || ""))) continue;
          const buf = new ArrayBuffer(12); const dv = new DataView(buf); for (let i = 0; i < 12; i++) dv.setUint8(i, df.data[i]);
          const fx = dv.getFloat32(0, true), fy = dv.getFloat32(4, true), fz = dv.getFloat32(8, true);
          if (skip && skip.split(",").indexOf(id.toString(16)) >= 0) continue;
          const d = Math.hypot(fx - pp[0], fy - pp[1]); if (d < bd) { bd = d; best = { id: id, base: base, ed: b.editorId, x: fx, y: fy, z: fz }; }
        } catch (e) { }
      }
      if (!best) { atOut("nessuna pianta trovata vicino"); return; }
      const sx = best.x, sy = best.y + 130, yaw = 180;   // ti metto a nord della pianta: guardando a sud (-Y) l'hai davanti
      atOut("pianta piu' vicina: riferimento " + best.id.toString(16) + " " + best.ed + " a " + Math.round(bd) + " unita'; ti porto davanti a lei (guarda a " + Math.round(yaw) + " gradi)");
      mpSet(a, "locationalData", { cellOrWorldDesc: WORLD, pos: [sx, sy, best.z + 20], rot: [0, 0, yaw] });
      return;
    }
    if (parts[1] === "srv") {   // raccolta srv <rif esadecimale>: prova a spegnere un oggetto direttamente dal server (isDisabled) e dice cosa risulta
      const ref = parseInt(parts[2], 16); let r = "rif " + ref.toString(16) + ":";
      try { r += " baseId=" + mp.get(ref, "baseId"); } catch (e) { r += " baseId errore " + e; }
      try { r += " isDisabled(prima)=" + mp.get(ref, "isDisabled"); } catch (e) { r += " isDisabled(prima) errore " + e; }
      try { mp.set(ref, "isDisabled", true); r += " set ok"; } catch (e) { r += " set errore " + e; }
      try { r += " isDisabled(dopo)=" + mp.get(ref, "isDisabled"); } catch (e) { r += " dopo errore " + e; }
      atOut(r); return;
    }
    if (parts[1] === "bottino") {   // raccolta bottino: per ogni creatura della tabella legge dal gioco originale il DeathItem e scrive raccolta-bottino.txt
      const rd32 = function (d, o) { return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16) | (d[o + 3] << 24)) >>> 0); };
      const nm = function (id) { try { const r = mp.lookupEspmRecordById(id); const rc = r && r.record; return rc ? (String(rc.type) + ":" + String(rc.editorId || "") + "(" + id.toString(16) + ")") : id.toString(16); } catch (e) { return id.toString(16); } };
      const expand = function (id, depth, ind, out) {
        let rr = null; try { rr = mp.lookupEspmRecordById(id); } catch (e) { }
        const rc = rr && rr.record; if (!rc) { out.push(ind + "? " + id.toString(16)); return; }
        if (rc.type === "LVLI" && depth < 5) {
          const ld = (rc.fields || []).find(function (f) { return f.type === "LVLD"; });
          out.push(ind + "LISTA " + String(rc.editorId || "") + " (" + id.toString(16) + ") probabilita-di-niente=" + (ld && ld.data ? ld.data[0] : "?") + "%");
          (rc.fields || []).filter(function (f) { return f.type === "LVLO"; }).forEach(function (f) {
            const lvl = f.data[0] | (f.data[1] << 8), ref = rd32(f.data, 4), cnt = f.data[8] | (f.data[9] << 8);
            out.push(ind + "  livello>=" + lvl + " x" + cnt + " -> " + nm(ref)); if (depth < 4) { try { const t = mp.lookupEspmRecordById(ref); if (t && t.record && t.record.type === "LVLI") expand(ref, depth + 1, ind + "      ", out); } catch (e) { } }
          });
        } else out.push(ind + nm(id));
      };
      const out = []; const seen = {};
      Object.keys(CREATURES).forEach(function (k) {
        const b = CREATURES[k]; if (seen[b]) { out.push("== " + k + " = come " + seen[b]); return; } seen[b] = k;
        out.push("== " + k + " (" + b.toString(16) + ")");
        try {
          const rr = mp.lookupEspmRecordById(b); const rc = rr && rr.record; if (!rc) { out.push("  nessuna scheda"); return; }
          out.push("  nome: " + String(rc.editorId || ""));
          const inam = (rc.fields || []).find(function (f) { return f.type === "INAM"; });
          if (!inam) { out.push("  nessun DeathItem (INAM)"); } else expand(rd32(inam.data, 0), 0, "  ", out);
        } catch (e) { out.push("  errore " + e); }
      });
      try { _fs.writeFileSync("raccolta-bottino.txt", out.join("\n") + "\n"); atOut("bottino scritto: " + out.length + " righe in raccolta-bottino.txt"); } catch (e) { atOut("bottino errore scrittura " + e); }
      return;
    }
    if (parts[1] === "cella") {   // raccolta cella <testo>: cerca nelle schede del gioco le CELL con quel testo nel nome e dice id e struttura della scheda
      const want = String(parts[2] || "").toLowerCase(); let id = 0; const found = []; let keysTxt = "";
      const tick = function () {
        const lim = Math.min(id + 40000, 0x200000);
        for (; id < lim; id++) {
          try {
            const rr = mp.lookupEspmRecordById(id); const rec = rr && rr.record; if (!rec || rec.type !== "CELL") continue;
            const ed = String(rec.editorId || ""); if (ed.toLowerCase().indexOf(want) < 0) continue;
            if (!keysTxt) keysTxt = " chiavi rr=" + Object.keys(rr).join(",") + " rec=" + Object.keys(rec).join(",") + " campi=" + (rec.fields || []).map(function (f) { return f.type; }).join(",");
            found.push(id.toString(16) + ":" + ed);
          } catch (e) { }
        }
        if (id < 0x200000) { setTimeout(tick, 30); return; }
        atOut("celle '" + want + "': " + (found.slice(0, 15).join(" ") || "nessuna") + keysTxt);
      };
      tick(); return;
    }
    if (parts[1] === "tpcella") {   // raccolta tpcella <cella esadecimale> <x> <y> <z>: ti porta dentro quella cella interna
      const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
      const a = mp.getUserActor(us[0]); const cid = parseInt(parts[2], 16);
      mpSet(a, "locationalData", { cellOrWorldDesc: cid.toString(16) + ":Skyrim.esm", pos: [Number(parts[3] || 0), Number(parts[4] || 0), Number(parts[5] || 0)], rot: [0, 0, 0] });
      atOut("portato nella cella " + cid.toString(16)); return;
    }
    if (parts[1] === "custom") {   // raccolta custom: crea DAL SERVER 4 oggetti con basi vanilla (barile, boccale, libro, pianta) intorno al giocatore e chiede al gioco se li vede accesi
      const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
      const u = us[0], a = mp.getUserActor(u), ld = mp.get(a, "locationalData"); const bases = [0x845, 0x319e3, 0x15475, 0x134aa], names = ["barile", "boccale", "libro", "cardo"]; const ids = [], rep = [];
      for (let i = 0; i < bases.length; i++) {
        try {
          const id = mpPlace(bases[i]); const ang = (i * 90 + 45) * Math.PI / 180;
          try { mp.set(id, "worldOrCellDesc", ld.cellOrWorldDesc); } catch (e1) { rep.push("wocd:" + e1); }
          try { mp.set(id, "pos", [ld.pos[0] + Math.cos(ang) * 220, ld.pos[1] + Math.sin(ang) * 220, ld.pos[2] + 10]); } catch (e2) { rep.push("pos:" + e2); }
          try { mp.set(id, "angle", [0, 0, 0]); } catch (e3) { }
          ids.push(id); rep.push(names[i] + "=" + id.toString(16));
        } catch (e) { rep.push(names[i] + " ERRORE " + e); }
      }
      atOut("oggetti custom creati: " + rep.join(" ") + "; tra 8 s chiedo al gioco");
      setTimeout(function () { try { mp.sendCustomPacket(u, JSON.stringify({ customPacketType: "rbProbe", tag: "custom", ids: ids })); } catch (e) { atOut("probe errore " + e); } }, 8000);
      return;
    }
    if (parts[1] === "hide") {   // raccolta hide off|on: spegne/riaccende il nascondimento nel gioco del primo giocatore (per confrontare prima/dopo)
      const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
      const on = parts[2] !== "off";
      try { mp.sendCustomPacket(us[0], JSON.stringify({ customPacketType: "rbHide", on: on })); atOut("nascondimento " + (on ? "ACCESO" : "SPENTO") + " (richiesta inviata al gioco)"); } catch (e) { atOut("errore " + e); }
      return;
    }
    if (parts[1] === "srvtest") {   // prova: spegne dal server un contenitore LONTANO, ti porta li' e chiede al gioco se lo vede spento
      const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
      const u = us[0], a = mp.getUserActor(u), pp = PLAYERS[u].pos; let best = null, bd = 1e18, id = 0x0; const t0 = Date.now(); const minD = Number(parts[2] || 15000);
      atOut("cerco un contenitore lontano...");
      const tick = function () {
        const lim = Math.min(id + 30000, 0x180000);
        for (; id < lim; id++) {
          try {
            const rr = mp.lookupEspmRecordById(id); const rec = rr && rr.record; if (!rec || rec.type !== "REFR" || !rec.fields) continue;
            const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); const df = rec.fields.find(function (f) { return f.type === "DATA"; }); if (!nf || !df) continue;
            const base = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0);
            const br = mp.lookupEspmRecordById(base); const b = br && br.record; if (!b || b.type !== "CONT") continue;
            const buf = new ArrayBuffer(12); const dv = new DataView(buf); for (let i = 0; i < 12; i++) dv.setUint8(i, df.data[i]);
            const fx = dv.getFloat32(0, true), fy = dv.getFloat32(4, true), fz = dv.getFloat32(8, true);
            if (Math.abs(fx) > 400000 || Math.hypot(fx, fy) < 30000) continue;
            const d = Math.hypot(fx - pp[0], fy - pp[1]); if (d < minD) continue; if (d < bd) { bd = d; best = { id: id, base: base, ed: b.editorId, x: fx, y: fy, z: fz }; }
          } catch (e) { }
        }
        if (id < 0x180000) { setTimeout(tick, 30); return; }
        if (!best) { atOut("nessun contenitore trovato"); return; }
        let r = "contenitore " + best.id.toString(16) + " " + best.ed + " a " + Math.round(bd) + " unita'";
        try { mp.set(best.id, "isDisabled", true); r += ", spento dal server"; } catch (e) { r += ", set errore " + e; }
        atOut(r + "; ti porto li' e tra 20 s chiedo al gioco");
        mpSet(a, "locationalData", { cellOrWorldDesc: WORLD, pos: [best.x + 120, best.y, best.z + 40], rot: [0, 0, 90] });
        setTimeout(function () { try { mp.sendCustomPacket(u, JSON.stringify({ customPacketType: "rbProbe", tag: "srvtest", ids: [best.id] })); } catch (e) { atOut("probe errore " + e); } }, 20000);
      };
      tick(); return;
    }
    if (parts[1] === "tpbase") {   // raccolta tpbase <base esadecimale>: ti porta accanto all'oggetto piu' vicino con quella base (solo mondo aperto, cerca a pezzi)
      const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
      const want = parseInt(parts[2], 16), u = us[0], a = mp.getUserActor(u), pp = PLAYERS[u].pos; let best = null, bd = 1e18, id = 0x0; const t0 = Date.now();
      atOut("cerco la base " + want.toString(16) + "...");
      const tick = function () {
        const lim = Math.min(id + 30000, 0x180000);
        for (; id < lim; id++) {
          try {
            const rr = mp.lookupEspmRecordById(id); const rec = rr && rr.record; if (!rec || rec.type !== "REFR" || !rec.fields) continue;
            const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); const df = rec.fields.find(function (f) { return f.type === "DATA"; }); if (!nf || !df) continue;
            const base = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0); if (base !== want) continue;
            const buf = new ArrayBuffer(12); const dv = new DataView(buf); for (let i = 0; i < 12; i++) dv.setUint8(i, df.data[i]);
            const fx = dv.getFloat32(0, true), fy = dv.getFloat32(4, true), fz = dv.getFloat32(8, true);
            if (Math.abs(fx) > 400000 || Math.hypot(fx, fy) < 30000) continue;
            const d = Math.hypot(fx - pp[0], fy - pp[1]); if (d < bd) { bd = d; best = { id: id, x: fx, y: fy, z: fz }; }
          } catch (e) { }
        }
        if (id < 0x180000) { setTimeout(tick, 30); return; }
        if (!best) { atOut("base " + want.toString(16) + ": nessun oggetto in mondo aperto"); return; }
        atOut("base " + want.toString(16) + ": oggetto " + best.id.toString(16) + " a " + Math.round(bd) + " unita'; ti porto accanto (ricerca " + Math.round((Date.now() - t0) / 1000) + " s)");
        mpSet(a, "locationalData", { cellOrWorldDesc: WORLD, pos: [best.x + 150, best.y, best.z + 40], rot: [0, 0, 90] });
      };
      tick(); return;
    }
    if (parts[1] === "tpvena") {   // prova: cerca (a pezzi) la vena di minerale piu' vicina nelle schede del gioco e ti porta li accanto
      const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
      const u = us[0], a = mp.getUserActor(u), pp = PLAYERS[u].pos; let best = null, bd = 1e18, id = 0x0; const t0 = Date.now();
      atOut("cerco una vena di minerale...");
      const tick = function () {
        const lim = Math.min(id + 30000, 0x100000);
        for (; id < lim; id++) {
          try {
            const rr = mp.lookupEspmRecordById(id); const rec = rr && rr.record; if (!rec || rec.type !== "REFR" || !rec.fields) continue;
            const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); const df = rec.fields.find(function (f) { return f.type === "DATA"; }); if (!nf || !df) continue;
            const base = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0);
            if (!VEIN_ORE[base]) continue;
            const buf = new ArrayBuffer(12); const dv = new DataView(buf); for (let i = 0; i < 12; i++) dv.setUint8(i, df.data[i]);
            const fx = dv.getFloat32(0, true), fy = dv.getFloat32(4, true), fz = dv.getFloat32(8, true);
            if (Math.abs(fx) > 400000 || Math.hypot(fx, fy) < 30000) continue;   // niente celle interne (coordinate piccole)
            const d = Math.hypot(fx - pp[0], fy - pp[1]); if (d < bd) { bd = d; best = { id: id, base: base, x: fx, y: fy, z: fz }; }
          } catch (e) { }
        }
        if (id < 0x100000) { setTimeout(tick, 30); return; }
        if (!best) { atOut("nessuna vena trovata"); return; }
        atOut("vena piu' vicina: riferimento " + best.id.toString(16) + " base " + best.base.toString(16) + " a " + Math.round(bd) + " unita' (ricerca " + Math.round((Date.now() - t0) / 1000) + " s); ti porto accanto");
        mpSet(a, "locationalData", { cellOrWorldDesc: WORLD, pos: [best.x + 200, best.y, best.z + 40], rot: [0, 0, 90] });
      };
      tick(); return;
    }
    if (parts[1] === "scavo") {   // prova: finge che il primo giocatore scavi una vena (base data in esadecimale, rif finto 0xdead01) e dice se e' arrivato minerale
      const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
      const u = us[0], a = mp.getUserActor(u), pp = PLAYERS[u].pos, bs = parseInt(parts[2] || "a2c46", 16);
      const b0 = raccoltaInvMap(a); const nb = global.__rbRaccolta.blocked;
      global.__rbVeins = {};
      global.__rbCustomPacket(u, JSON.stringify({ customPacketType: "rbMine", ref: 0xdead01, base: bs, x: pp[0], y: pp[1] }));
      const b1 = raccoltaInvMap(a); const gain = [];
      Object.keys(b1).forEach(function (k) { if (b1[k] > (b0[k] || 0)) gain.push(Number(k).toString(16) + "+" + (b1[k] - (b0[k] || 0))); });
      atOut("scavo vena base " + bs.toString(16) + ": " + (global.__rbRaccolta.blocked > nb ? "BLOCCATO" : "non bloccato") + " | minerale ricevuto: " + (gain.join(", ") || "nessuno"));
      return;
    }
    const ref = parseInt(parts[1], 16);
    const t = raccoltaTipo(ref); const bl = raccoltaDaBloccare(ref);
    atOut("riferimento " + ref.toString(16) + " -> base " + t.base.toString(16) + " tipo " + (t.type || "?") + " edid " + (t.edid || "?") + " | " + (bl ? "VERREBBE BLOCCATO" : "non bloccato") + (t.diag || ""));
    return;
  }
  if (what === "fort") runFortTest(n);
  else if (what === "zona") runZoneTest(n);
  else if (what === "tutto") {
    global.__rbATResults = [];
    runZoneTest(1, function () { runZoneTest(2, function () { runFortTest(1, function () { runFortTest(2, function () {
      let tot = 0, bad = 0; global.__rbATResults.forEach(function (r) { r.checks.forEach(function (c) { tot++; if (!c.ok) bad++; }); });
      atOut("##### AUTOTEST COMPLETO: " + tot + " controlli, " + bad + " falliti #####");
    }); }); }); });
  } else atOut("comando autotest sconosciuto: " + cmd);
}
if (global.__rbATPoll) clearInterval(global.__rbATPoll);
global.__rbATPoll = setInterval(function () {
  try {
    if (!_fs.existsSync("autotest-cmd.txt")) return;
    const c = _fs.readFileSync("autotest-cmd.txt", "utf8").trim();
    if (!c) return;
    _fs.writeFileSync("autotest-cmd.txt", "");
    runAutotest(c);
  } catch (e) { }
}, 3000);

log("[NPC] gamemode caricato: 30 s + loot con E");


// ---- Vita extra del giocatore (server): godmod = +899 (999 totali), ogni pezzo daedrico indossato = +200 ----
const PLAYER_BASE_HP = 100;   // vita base stimata del giocatore (da correggere dopo i test)
const DAEDRIC_PIECES = [0x0001396D, 0x0001396B, 0x0001396C, 0x0001396A, 0x0001396E];
function extraHpOf(userId, actorId) {
  let b = 0;
  if (global.__rbGod && global.__rbGod[profileOfUser(userId)]) b += 899;
  try {
    const inv = mp.get(actorId, "inventory");
    const worn = ((inv && inv.entries) || []).filter(function (e) { return e.worn && DAEDRIC_PIECES.indexOf(e.baseId) >= 0; });
    b += worn.length * 200;
  } catch (e) { }
  return b;
}
global.__rbHpLast = global.__rbHpLast || {};
if (global.__rbHpTimer) clearInterval(global.__rbHpTimer);
let __hpLogT = 0;
global.__rbHpTimer = setInterval(function () {
  try {
    onlineUsers().forEach(function (u) {
      const a = mp.getUserActor(u); if (!a) return;
      const hp = getHp(a); if (typeof hp !== "number") return;
      const last = global.__rbHpLast[a];
      const bonus = extraHpOf(u, a);
      if (bonus > 0 && typeof last === "number" && hp < last - 0.0001 && hp > 0) {
        const refund = (last - hp) * bonus / (PLAYER_BASE_HP + bonus);
        const nh = Math.min(1, hp + refund);
        setHp(a, nh); global.__rbHpLast[a] = nh;
        if (Date.now() - __hpLogT > 3000) { __hpLogT = Date.now(); log("[VITA] giocatore " + profileOfUser(u) + " colpito: " + hp.toFixed(3) + " -> " + nh.toFixed(3) + " (bonus " + bonus + ")"); }
      } else { if (typeof last === "number" && hp < last - 0.0001 && hp > 0 && !(bonus > 0)) log("[DANNO-GIOCATORE] " + profileOfUser(u) + " perde " + ((last - hp) * PLAYER_BASE_HP).toFixed(1) + " di vita (restano " + (hp * PLAYER_BASE_HP).toFixed(0) + "/" + PLAYER_BASE_HP + ")"); global.__rbHpLast[a] = hp; }
    });
  } catch (e) { }
}, 150);

// ===== [RACCOLTA] spawn di ingredienti e miniere SPENTI =====
// Niente piu' raccolta di piante/alberi (FLOR, TREE), ingredienti sparsi per il mondo (INGR) e vene di minerale (MineOre*).
// Gli ingredienti che cadono dalle creature uccise NON passano da qui: restano invariati.
// Per riaccendere a mano UN punto: aggiungere il suo id (hex) in "refs" o l'id della base in "bases" nel file raccolta-consentita.json
// (esempio: {"refs":["0x0001a2b3"],"bases":["0x00012345"]}); il file viene riletto ogni 5 secondi, senza riavviare.
const RACCOLTA_FILE = "raccolta-consentita.json";
global.__rbRaccolta = global.__rbRaccolta || { off: true, allow: { refs: {}, bases: {} }, at: 0, seen: {}, blocked: 0, nSeen: 0, nDiag: 0 };
global.__rbRaccolta.nDiag = global.__rbRaccolta.nDiag || 0; global.__rbRaccolta.seen = {}; global.__rbRaccolta.nSeen = 0;
function raccoltaLeggiPermessi() {
  const R = global.__rbRaccolta, now = Date.now();
  if (now - R.at < 5000) return R.allow; R.at = now;
  try {
    const j = JSON.parse(_fs.readFileSync(RACCOLTA_FILE, "utf8"));
    const a = { refs: {}, bases: {} };
    (j.refs || []).forEach(function (x) { a.refs[Number(x)] = 1; });
    (j.bases || []).forEach(function (x) { a.bases[Number(x)] = 1; });
    R.allow = a;
  } catch (e) { R.allow = { refs: {}, bases: {} }; }
  return R.allow;
}
function raccoltaTipo(target) {
  let base = 0; try { base = mp.get(target, "baseId") || 0; } catch (e) { }
  let type = "", edid = "", diag = "";
  try {
    if (!base) {   // il riferimento non e' caricato come oggetto: si legge la sua scheda nel file del gioco e si prende la base dal campo NAME
      const rr = mp.lookupEspmRecordById(target);
      const rec = rr && rr.record;
      if (global.__rbRaccolta.nDiag < 6) { global.__rbRaccolta.nDiag++; diag = " DIAG " + JSON.stringify(rr).slice(0, 600); }
      if (rec && rec.type === "REFR" && rec.fields) { const nf = rec.fields.find(function (f) { return f.type === "NAME"; }); if (nf && nf.data) base = ((nf.data[0] | (nf.data[1] << 8) | (nf.data[2] << 16) | (nf.data[3] << 24)) >>> 0); }
    }
  } catch (e) { diag += " errRef " + e; }
  try { const rec = mp.lookupEspmRecordById(base); const r = rec && rec.record; if (r) { type = String(r.type || ""); edid = String(r.editorId || r.edid || ""); } } catch (e) { }
  return { base: base, type: type, edid: edid, diag: diag };
}
const RACC_ITEMS = { BOOK: 1, CONT: 1, MISC: 1, WEAP: 1, ARMO: 1, AMMO: 1, ALCH: 1, SCRL: 1, SLGM: 1, KEYM: 1 };
function raccoltaDaBloccare(target) {
  const t = raccoltaTipo(target);
  const R = global.__rbRaccolta;
  const key = t.type + "|" + t.edid;
  if (R.nSeen < 200 && !R.seen[key]) { R.seen[key] = 1; R.nSeen++; log("[RACCOLTA] attivato: tipo " + (t.type || "?") + " edid " + (t.edid || "?") + " base " + t.base.toString(16) + " riferimento " + Number(target).toString(16) + (t.diag || "")); }
  const isFlora = t.type === "FLOR" || t.type === "TREE" || t.type === "INGR" || (RACC_ITEMS[t.type] && Number(target) < 0x05000000);   // anche libri, contenitori, armi, ecc. del mondo originale (non quelli creati dal server)
  if (/CoinPurse/i.test(t.edid)) return null;   // le borse di monete non sono ingredienti: restano come nel gioco originale
  const isMine = /^MineOre/i.test(t.edid);
  if (!isFlora && !isMine) return null;
  const al = raccoltaLeggiPermessi();
  if (al.refs[Number(target)] || al.bases[t.base]) return null;
  return t;
}

// Il blocco "return false" da solo non basta (il server consegna comunque l'oggetto): quindi si segna la pianta come gia' raccolta
// e, per sicurezza, si toglie dall'inventario di chi ha raccolto quello che e' arrivato (solo ingredienti e minerali, entro 1,5 secondi).
function raccoltaInvMap(actor) { const m = {}; try { const inv = mp.get(actor, "inventory"); ((inv && inv.entries) || []).forEach(function (e) { m[e.baseId] = (m[e.baseId] || 0) + e.count; }); } catch (e) { } return m; }
function raccoltaEIngrediente(base) { try { const rr = mp.lookupEspmRecordById(base); const r = rr && rr.record; if (!r) return false; const ty = String(r.type || ""), ed = String(r.editorId || ""); return ty === "INGR" || (ty === "MISC" && /^ore/i.test(ed)) || !!RACC_ITEMS[ty]; } catch (e) { return false; } }
function raccoltaAnnulla(target, caster, t) {
  const before = raccoltaInvMap(caster);
  try { mp.set(target, "isHarvested", true); } catch (e) { log("[RACCOLTA] isHarvested non impostabile: " + e); }
  [400, 1500].forEach(function (ms) {
    setTimeout(function () {
      try {
        const after = raccoltaInvMap(caster); const rem = {};
        Object.keys(after).forEach(function (b) { const d = after[b] - (before[b] || 0); if (d > 0 && raccoltaEIngrediente(Number(b))) rem[b] = d; });
        const keys = Object.keys(rem); if (!keys.length) return;
        const inv = mp.get(caster, "inventory"); const out = [];
        ((inv && inv.entries) || []).forEach(function (e) { const r = rem[e.baseId]; if (r) { const c = e.count - r; rem[e.baseId] = 0; if (c > 0) out.push(Object.assign({}, e, { count: c })); } else out.push(e); });
        mpSet(caster, "inventory", { entries: out });
        log("[RACCOLTA] tolto dall'inventario quanto raccolto: " + keys.map(function (b) { return Number(b).toString(16) + "x" + (after[b] - (before[b] || 0)); }).join(", "));
      } catch (e) { log("[RACCOLTA] annulla errore " + e); }
    }, ms);
  });
}
if (!global.__rbActBase) global.__rbActBase = { prev: (typeof mp.onActivate === "function") ? mp.onActivate : null };
function rbPortaChiusa(target, caster) {   // [MAPPA] porte dei luoghi eliminati: chiuse anche lato server (a meno che l'admin abbia acceso sblocca_tutto)
  try {
    let st = global.__rbPorte; const now = Date.now();
    if (!st || now - st.t > 60000) {
      let set = {}; try { const c = JSON.parse(_fs.readFileSync("mappa-config.json", "utf8")); (c.lock || []).forEach(function (i) { set[i] = 1; }); } catch (e) { set = (st && st.set) || {}; }
      st = global.__rbPorte = { t: now, set: set };
    }
    if (!st.set[target]) return false;
    const u = onlineUsers().find(function (x) { return mp.getUserActor(x) === caster; });
    if (u === undefined) return false;   // non e' un giocatore (NPC/creatura): non tocchiamo
    if (global.__rbMappaUnlock && global.__rbMappaUnlock[u] && (global.__rbMappaUnlockLock || {})[target] !== 0) { const ul = global.__rbPorte.ul || (global.__rbPorte.ul = (function () { let o = {}; try { const c = JSON.parse(_fs.readFileSync("mappa-config.json", "utf8")); (c.unlock || c.lock || []).forEach(function (i) { o[i] = 1; }); } catch (e) { } return o; })()); if (ul[target]) return false; }
    global.__rbPorteBloccate = (global.__rbPorteBloccate || 0) + 1;
    log("[MAPPA] porta chiusa " + Number(target).toString(16) + " per utente " + u + " (totale " + global.__rbPorteBloccate + ")");
    return true;
  } catch (e) { return false; }
}
mp.onActivate = function (target, caster) {
  try { if (rbPortaChiusa(target, caster)) return false; } catch (e) { }
  try {
    const R = global.__rbRaccolta;
    if (R && R.off) {
      const t = raccoltaDaBloccare(target);
      if (t) {
        R.blocked++;
        raccoltaAnnulla(target, caster, t);
        log("[RACCOLTA] BLOCCATO " + (t.type || "?") + " " + (t.edid || "?") + " rif " + Number(target).toString(16) + " (totale bloccati " + R.blocked + ")");
        try { const u = onlineUsers().find(function (x) { return mp.getUserActor(x) === caster; }); if (u !== undefined) sendTo(u, { customPacketType: "rbNotify", text: "Qui non c'è nulla da raccogliere." }); } catch (e) { }
        return false;
      }
    }
  } catch (e) { log("[RACCOLTA] errore " + e); }
  const p = global.__rbActBase.prev;
  return p ? p(target, caster) : true;
};
log("[RACCOLTA] caricato: raccolta di piante, ingredienti sparsi e miniere SPENTA");

// elenco (a pezzi, senza bloccare il server) di tutte le basi di piante, alberi, ingredienti e vene di minerale nei file del gioco
function raccoltaScan() {
  const out = []; let cnt = { FLOR: 0, TREE: 0, INGR: 0, MINE: 0 }; const t0 = Date.now();
  const starts = [0x00000000, 0x01000000, 0x02000000, 0x03000000, 0x04000000, 0x05000000, 0x06000000, 0x07000000, 0x08000000, 0x09000000]; let si = 0, id = 0;   // piu' file del gioco, id fino a 0x180000
  atOut("scan raccolta: inizio");
  const tick = function () {
    const lim = Math.min(id + 20000, 0x180000);
    for (; id < lim; id++) {
      try {
        const rr = mp.lookupEspmRecordById(starts[si] + id); const r = rr && rr.record; if (!r) continue;
        const ty = String(r.type || ""), ed = String(r.editorId || "");
        const mine = /^MineOre/i.test(ed) || (/ore|vein/i.test(ed) && (ty === "ACTI" || ty === "FURN"));
        if (ty === "FLOR" || ty === "TREE" || ty === "INGR" || mine) { const k = mine ? "MINE" : ty; cnt[k]++; out.push((starts[si] + id).toString(16) + " " + ty + " " + ed); }
      } catch (e) { }
    }
    if (id >= 0x180000) { si++; id = 0; }
    if (si >= starts.length) {
      try { _fs.writeFileSync("raccolta-basi2.txt", out.join("\n") + "\n"); } catch (e) { atOut("scan: scrittura fallita " + e); }
      atOut("scan raccolta finito in " + Math.round((Date.now() - t0) / 1000) + " s: FLOR " + cnt.FLOR + ", TREE " + cnt.TREE + ", INGR " + cnt.INGR + ", miniere " + cnt.MINE + " (elenco in raccolta-basi2.txt)");
      return;
    }
    setTimeout(tick, 30);
  };
  tick();
}


// ================== PESCI MACELLAIO: spawn a punti fissi, rinascita ogni 30 minuti, loot 1-5 scaglie ==================
// Regole (Davide): ogni zona d'acqua ha un tetto di pesci vivi (5; il mare 10 = 5 vicino a riva + 5 al largo).
// Ogni 30 minuti il sistema conta i vivi di ogni zona e ne crea tanti quanti ne mancano, su punti a caso della zona.
// Nessuna IA nostra: il pesce e' l'EncSlaughterfish originale (0x23AB8), si comporta come in Skyrim.
// Loot: 100% scaglie di pesce macellaio (0x3AD70), da 1 a 5 a caso.
const PESCE_BASE = 0x00023AB8, SCAGLIE = 0x0003AD70;
const PESCI_CICLO_MS = 30 * 60 * 1000;
const PESCI_ZONE = {
  FB: { nome: "Fiume Bianco", cap: 5 }, DW: { nome: "Fiume Darkwater", cap: 5 }, RE: { nome: "Ruscello di Eastmarch", cap: 5 },
  FR: { nome: "Fiume centrale del Rift", cap: 5 }, LG: { nome: "Lago Geir", cap: 5 }, LH: { nome: "Lago Honrich", cap: 5 },
  MFc: { nome: "Mare dei Fantasmi (vicino a riva)", cap: 5 }, MFl: { nome: "Mare dei Fantasmi (al largo)", cap: 5 },
};
global.__rbPesci = global.__rbPesci || { fish: {}, nasciti: 0, morti: 0, cicli: 0 };
function pesciPunti() {
  try { return JSON.parse(_fs.readFileSync("pesci-punti.json", "utf8")); } catch (e) { }
  try { return JSON.parse(_fs.readFileSync("pesci-candidati.json", "utf8")); } catch (e) { log("[PESCI] nessun file punti: " + e); return {}; }
}
function pesceVivo(id) { try { return mp.get(id, "isDead") !== true; } catch (e) { return false; } }
function pesciSpawn(zona, idx, pt) {
  const id = mpPlace(PESCE_BASE);
  mpSet(id, "locationalData", { cellOrWorldDesc: WORLD, pos: [pt.x, pt.y, pt.z], rot: [0, 0, Math.floor(Math.random() * 360)] });
  mpSet(id, "private.rbEvoked", true);
  mpSet(id, "private.rbTitle", "Pesce macellaio");
  global.__rbPesci.fish[id] = { zona: zona, idx: idx };
  global.__rbPesci.nasciti++;
  log("[PESCI] nato " + id.toString(16) + " in " + PESCI_ZONE[zona].nome + " punto " + idx + " (" + pt.x + "," + pt.y + "," + pt.z + ")");
  return id;
}
function pesciCiclo(motivo) {
  const P = global.__rbPesci, pts = pesciPunti(), rep = [];
  P.cicli++;
  Object.keys(PESCI_ZONE).forEach(function (z) {
    const list = pts[z] || [];
    const vivi = [], usati = {};
    Object.keys(P.fish).forEach(function (sid) {
      const f = P.fish[sid]; if (f.zona !== z) return;
      if (pesceVivo(Number(sid))) { vivi.push(sid); usati[f.idx] = true; }
    });
    const manca = PESCI_ZONE[z].cap - vivi.length;
    let nati = 0;
    for (let i = 0; i < manca; i++) {
      const liberi = []; list.forEach(function (p, ix) { if (!usati[ix]) liberi.push(ix); });
      if (!liberi.length) break;
      const ix = liberi[Math.floor(Math.random() * liberi.length)]; usati[ix] = true;
      try { pesciSpawn(z, ix, list[ix]); nati++; } catch (e) { log("[PESCI] errore nascita " + z + ": " + e); }
    }
    rep.push(z + ":" + vivi.length + "+" + nati);
  });
  log("[PESCI] ciclo " + P.cicli + " (" + motivo + "): " + rep.join(" "));
  return rep.join(" ");
}
global.__rbFishDeath = function (actorId) {
  const P = global.__rbPesci, f = P.fish[actorId]; if (!f) return false;
  P.morti++;
  const n = 1 + Math.floor(Math.random() * 5);
  setTimeout(function () {
    try { mpSet(actorId, "inventory", { entries: [{ baseId: SCAGLIE, count: n }] }); log("[PESCI] morto " + actorId.toString(16) + " (" + PESCI_ZONE[f.zona].nome + "): loot " + n + " scaglie"); }
    catch (e) { log("[PESCI] loot errore " + e); }
  }, 1500);
  return true;
};
(function () {   // si aggancia alla morte degli NPC (dopo la funzione dei forti)
  const prev = global.__rbFortDeath;
  global.__rbFortDeath = function (a, k) { try { global.__rbFishDeath(a); } catch (e) { log("[PESCI] errore morte " + e); } if (prev) return prev(a, k); };
})();
if (global.__rbPesciTimer) clearInterval(global.__rbPesciTimer);
global.__rbPesciTimer = setInterval(function () { try { pesciCiclo("30 minuti"); } catch (e) { log("[PESCI] errore ciclo " + e); } }, PESCI_CICLO_MS);
if (!global.__rbPesciBoot) { global.__rbPesciBoot = true; setTimeout(function () { try { pesciCiclo("avvio"); } catch (e) { log("[PESCI] errore avvio " + e); } }, 20000); }

// ---- risposta del gioco al controllo "sto nuotando?" (prova dei punti) ----
(function () {
  const prevCP = global.__rbCustomPacket;
  global.__rbCustomPacket = function (userId, rawContent) {
    try { const c = JSON.parse(rawContent); if (c.customPacketType === "rbSwimRes") { if (global.__rbSwimCb) global.__rbSwimCb(c); return; } } catch (e) { }
    if (prevCP) prevCP(userId, rawContent);
  };
})();

// ---- comandi di prova: macellaio stato | ciclo | uccidi N | pulisci | vai <zona> [indice] | acqua [zona] ----
global.__rbPesciCmd = function (parts) {
  const P = global.__rbPesci, cmd = parts[1] || "stato", pts = pesciPunti();
  if (cmd === "stato") {
    const r = {}; Object.keys(PESCI_ZONE).forEach(function (z) { r[z] = 0; });
    Object.keys(P.fish).forEach(function (sid) { if (pesceVivo(Number(sid))) r[P.fish[sid].zona]++; });
    atOut("PESCI vivi per zona: " + JSON.stringify(r) + " | nati " + P.nasciti + ", morti " + P.morti + ", cicli " + P.cicli + " | punti: " + Object.keys(PESCI_ZONE).map(function (z) { return z + "=" + (pts[z] || []).length; }).join(" "));
    return;
  }
  if (cmd === "ciclo") { atOut("ciclo forzato: " + pesciCiclo("a mano")); return; }
  if (cmd === "pulisci") { let n = 0; Object.keys(P.fish).forEach(function (sid) { try { mpDestroy(Number(sid)); n++; } catch (e) { } delete P.fish[sid]; }); atOut("pesci rimossi: " + n); return; }
  if (cmd === "uccidi") {   // uccide N pesci vivi a caso (come se fossero stati uccisi dai giocatori)
    const vivi = Object.keys(P.fish).filter(function (s) { return pesceVivo(Number(s)); });
    const n = Math.min(Number(parts[2]) || 1, vivi.length); const zonaF = parts[3];
    const cand = zonaF ? vivi.filter(function (s) { return P.fish[s].zona === zonaF; }) : vivi;
    for (let i = 0; i < Math.min(n, cand.length); i++) { const s = cand[i]; try { mpSet(Number(s), "isDead", true); } catch (e) { atOut("uccisione errore " + e); } }
    atOut("uccisi " + Math.min(n, cand.length) + " pesci"); return;
  }
  if (cmd === "vai") {
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const l = pts[parts[2]] || [], p = l[Number(parts[3] || 0)]; if (!p) { atOut("punto inesistente"); return; }
    mpSet(mp.getUserActor(us[0]), "locationalData", { cellOrWorldDesc: WORLD, pos: [p.x, p.y, p.z + Number(parts[4] || 0)], rot: [0, 0, 0] });
    atOut("portato a " + parts[2] + "[" + (parts[3] || 0) + "] " + JSON.stringify(p)); return;
  }
  if (cmd === "loot") {   // dice cosa c'e' sui cadaveri dei pesci uccisi
    const r = []; Object.keys(P.fish).forEach(function (s) { try { if (mp.get(Number(s), "isDead")) r.push(Number(s).toString(16) + ":" + JSON.stringify((mp.get(Number(s), "inventory") || { entries: [] }).entries.map(function (e) { return e.baseId.toString(16) + "x" + e.count; }))); } catch (e) { } });
    atOut("cadaveri pesci: " + (r.join(" ") || "nessuno")); return;
  }
  if (cmd === "acqua") {   // porta il giocatore su ogni punto candidato e chiede al gioco se sta nuotando; scrive pesci-punti.json con i soli punti in acqua
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const u = us[0], a = mp.getUserActor(u), cand = (function () { try { return JSON.parse(_fs.readFileSync("pesci-candidati.json", "utf8")); } catch (e) { return {}; } })();
    const jobs = []; Object.keys(PESCI_ZONE).forEach(function (z) { if (parts[2] && parts[2].split(",").indexOf(z) < 0) return; (cand[z] || []).forEach(function (p, ix) { jobs.push({ z: z, ix: ix, p: p }); }); });
    const res = {}; let i = 0; atOut("ACQUA: provo " + jobs.length + " punti");
    const next = function () {
      if (i >= jobs.length) {
        const ok = {}; Object.keys(res).forEach(function (z) { ok[z] = res[z].filter(function (r) { return r.nuota; }).map(function (r) { return r.p; }); });
        try { _fs.writeFileSync("pesci-acqua-risultato.json", JSON.stringify(res)); _fs.writeFileSync("pesci-punti-verificati.json", JSON.stringify(ok)); } catch (e) { }
        atOut("ACQUA FINITA: " + Object.keys(ok).map(function (z) { return z + " " + ok[z].length + "/" + res[z].length; }).join(" | "));
        global.__rbSwimCb = null; return;
      }
      const j = jobs[i]; let done = false;
      mpSet(a, "locationalData", { cellOrWorldDesc: WORLD, pos: [j.p.x, j.p.y, j.p.z], rot: [0, 0, 0] });
      setTimeout(function () { try { mp.sendCustomPacket(u, JSON.stringify({ customPacketType: "rbSwim", tag: i, delay: 12000 })); } catch (e) { } }, 1500);
      const fin = function (c) { if (done) return; done = true; (res[j.z] = res[j.z] || []).push({ ix: j.ix, p: j.p, nuota: !!(c && c.out && c.out.sw), z: c && c.out ? c.out.z : null, err: c && c.out ? c.out.err : "nessuna risposta" }); atOut("ACQUA " + j.z + "[" + j.ix + "] " + j.p.x + "," + j.p.y + "," + j.p.z + " -> " + (c && c.out && c.out.sw ? "NUOTA" : "NO") + " " + JSON.stringify(c && c.out)); i++; setTimeout(next, 500); };
      global.__rbSwimCb = function (c) { if (Number(c.tag) === i) fin(c); };
      setTimeout(function () { if (!done) { atOut("ACQUA: nessuna risposta, il gioco forse si e' chiuso: mi fermo"); i = jobs.length; done = true; setTimeout(next, 200); } }, 32000);
    };
    next(); return;
  }
  if (cmd === "provaloot") {   // crea un pesce accanto al giocatore, lo uccide, apre la finestra del loot (come premendo E) e poi "prende" le scaglie
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const u = us[0], a = mp.getUserActor(u), pp = mp.get(a, "pos");
    const id = pesciSpawn("LG", -1, { x: pp[0] + 120, y: pp[1], z: pp[2] + 30 });
    atOut("PROVALOOT: pesce " + id.toString(16) + " creato accanto a te");
    setTimeout(function () {
      try { mpSet(id, "isDead", true); } catch (e) { atOut("PROVALOOT uccisione errore " + e); }
      setTimeout(function () {
        const inv0 = mp.get(a, "inventory") || { entries: [] }; const q0 = (inv0.entries.find(function (e) { return e.baseId === SCAGLIE; }) || { count: 0 }).count;
        const corpo = (mp.get(id, "inventory") || { entries: [] }).entries.map(function (e) { return e.baseId.toString(16) + "x" + e.count; });
        atOut("PROVALOOT cadavere contiene: " + JSON.stringify(corpo) + "; scaglie nel tuo inventario prima: " + q0);
        doLoot(u, id, true);
        atOut("PROVALOOT: finestra del loot inviata al gioco (guarda lo schermo)");
        setTimeout(function () {
          const n = ((mp.get(id, "inventory") || { entries: [] }).entries.find(function (e) { return e.baseId === SCAGLIE; }) || { count: 0 }).count;
          applyTaken(u, id, [{ baseId: SCAGLIE, count: n }]);
          const inv1 = mp.get(a, "inventory") || { entries: [] }; const q1 = (inv1.entries.find(function (e) { return e.baseId === SCAGLIE; }) || { count: 0 }).count;
          atOut("PROVALOOT dopo aver preso: scaglie " + q0 + " -> " + q1 + " (attese +" + n + ") -> " + (n > 0 && q1 === q0 + n ? "PASS" : "FAIL"));
        }, 12000);
      }, 2500);
    }, 1500);
    return;
  }
  if (cmd === "prova") {   // prova completa: pulisce, crea 40 pesci, li uccide tutti, controlla il loot (1-5 scaglie), riempie di nuovo, controlla i cadaveri dopo 35 s
    const verifica = function (titolo) {
      const r = {}; let tot = 0;
      Object.keys(PESCI_ZONE).forEach(function (z) { r[z] = 0; });
      Object.keys(P.fish).forEach(function (sid) { if (pesceVivo(Number(sid))) { r[P.fish[sid].zona]++; tot++; } });
      const ok = Object.keys(PESCI_ZONE).every(function (z) { return r[z] === PESCI_ZONE[z].cap; });
      atOut(titolo + ": vivi " + tot + " " + JSON.stringify(r) + " -> " + (ok ? "PASS (tutte le zone al tetto)" : "FAIL"));
    };
    atOut("PROVA: pulisco e creo");
    Object.keys(P.fish).forEach(function (sid) { try { mpDestroy(Number(sid)); } catch (e) { } delete P.fish[sid]; });
    atOut("PROVA ciclo: " + pesciCiclo("prova")); verifica("PROVA 1 dopo la nascita");
    setTimeout(function () {
      const ids = Object.keys(P.fish).filter(function (s) { return pesceVivo(Number(s)); });
      ids.forEach(function (s) { try { mpSet(Number(s), "isDead", true); } catch (e) { atOut("PROVA uccisione errore " + e); } });
      atOut("PROVA: uccisi " + ids.length + " pesci");
      setTimeout(function () {
        const dist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, altro: 0 }; let tipi = 0, strani = 0;
        ids.forEach(function (s) {
          try { const e = (mp.get(Number(s), "inventory") || { entries: [] }).entries; if (e.length === 1 && e[0].baseId === SCAGLIE && e[0].count >= 1 && e[0].count <= 5) dist[e[0].count]++; else { dist.altro++; strani++; atOut("PROVA loot strano " + Number(s).toString(16) + ": " + JSON.stringify(e)); } } catch (er) { dist.altro++; }
        });
        atOut("PROVA 2 loot (scaglie per pesce): " + JSON.stringify(dist) + " -> " + (strani === 0 && ids.length > 0 ? "PASS (solo scaglie, sempre 1-5)" : "FAIL"));
        verifica("PROVA 3 subito dopo la morte (devono essere 0 vivi)");
        atOut("PROVA ciclo rinascita: " + pesciCiclo("prova dopo uccisioni")); verifica("PROVA 4 dopo la rinascita");
        setTimeout(function () {
          let resti = 0; ids.forEach(function (s) { try { if (mp.get(Number(s), "isDead")) resti++; } catch (e) { } });
          atOut("PROVA 5 cadaveri ancora presenti dopo 35 s: " + resti + " -> " + (resti === 0 ? "PASS" : "FAIL"));
        }, 35000);
      }, 4000);
    }, 3000);
    return;
  }
  atOut("macellaio: comando sconosciuto " + cmd);
};

// ================== FAUNA DEI BOSCHI: LOOT (regole di Davide) ==================
// Nessun animale lascia il "tesoro"; le corna escono sempre (100%); tutto il resto resta identico a Skyrim. Nomi in italiano.
const FAUNA = {
  0x0006DC9D: { nome: "Coniglio", loot: [[0x65C9E, 1]] },
  0x000CF89D: { nome: "Cervo", loot: [[0x669A2, 1], [0xD284D, 1], [0x6BC0A, 1]] },
  0x00023A91: { nome: "Alce", loot: [[0x669A2, 1], [0x3AD90, 1], [0x6BC0A, 1]] },
  0x000ABEDF: { nome: "Alce femmina", loot: [[0x669A2, 1], [0x3AD90, 1], [0x6BC0B, 1]] },
  0x0002EBE2: { nome: "Capra", loot: [[0x3AD8E, 1], [0x65C9A, 1]] },
  0x0004359C: { nome: "Capra domestica", loot: [[0x3AD8E, 1], [0x65C9A, 1]] },
  0x000829B3: { nome: "Volpe", loot: [[0xD4B35, 1]] },
  0x000829B6: { nome: "Volpe artica", loot: [[0xD4BE7, 1]] },
  0x00023ABE: { nome: "Lupo", loot: [[0x3AD74, 1]] },
  0x00023ABF: { nome: "Lupo di ghiaccio", loot: [[0x3AD75, 1]] },
  0x00023AB5: { nome: "Gatto dai denti a sciabola", loot: [[0x3AD6D, 1], [0x6BC07, 1], [0x6BC04, 1]] },
  0x00023AB6: { nome: "Gatto dai denti a sciabola delle nevi", loot: [[0x3AD6E, 1], [0x6BC07, 1], [0x6BC04, 1]] },
  0x0010FE05: { nome: "Lupo rosso", loot: [[0x3AD74, 1]] },
  0x00023A8A: { nome: "Orso", loot: [[0x3AD52, 1], [0x6BC02, 1]] },
  0x00023A8B: { nome: "Orso delle caverne", loot: [[0x3AD53, 1], [0x6BC02, 1]] },
  0x00023A8C: { nome: "Orso delle nevi", loot: [[0x3AD54, 1], [0x6BC02, 1]] },
};
Object.keys(CREATURES).forEach(function (k) { const f = FAUNA[CREATURES[k]]; if (f) TITLES[k] = f.nome; });
global.__rbFaunaDeath = function (actorId) {
  let base = 0; try { base = mp.get(actorId, "private.rbFauna") || 0; } catch (e) { }
  if (!base) { try { base = mp.get(actorId, "baseId") || 0; } catch (e) { } }
  const f = FAUNA[base]; if (!f) return false;
  setTimeout(function () {
    try {
      mpSet(actorId, "inventory", { entries: f.loot.map(function (l) { return { baseId: l[0], count: l[1] }; }) });
      log("[FAUNA] morto " + actorId.toString(16) + " (" + f.nome + "): loot " + JSON.stringify(f.loot.map(function (l) { return l[0].toString(16) + "x" + l[1]; })));
    } catch (e) { log("[FAUNA] loot errore " + e); }
  }, 1500);
  return true;
};
(function () {
  const prev = global.__rbFortDeath;
  global.__rbFortDeath = function (a, k) { try { global.__rbFaunaDeath(a); } catch (e) { log("[FAUNA] errore morte " + e); } if (prev) return prev(a, k); };
})();
// fauna provaloot <nome>|tutti : crea l'animale morto accanto a te, controlla il loot atteso (niente tesoro, corna sempre), apre la finestra come con E e "prende" tutto
global.__rbFaunaCmd = function (parts) {
  const cmd = parts[1];
  if (cmd !== "provaloot") { atOut("fauna: comando sconosciuto " + cmd); return; }
  const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
  const u = us[0], a = mp.getUserActor(u);
  const want = (parts[2] || "").toLowerCase();
  const names = Object.keys(CREATURES).filter(function (k) { const f = FAUNA[CREATURES[k]]; return f && (want === "tutti" || k === want); });
  if (!names.length) { atOut("fauna: animale sconosciuto '" + want + "' (uso: fauna provaloot cervo | tutti)"); return; }
  const qty = function (inv, b) { return ((inv && inv.entries || []).find(function (e) { return e.baseId === b && !e.worn; }) || { count: 0 }).count; };
  let i = 0;
  const next = function () {
    if (i >= names.length) { atOut("FAUNA: prova finita (" + names.length + " animali)"); return; }
    const nm = names[i++], base = CREATURES[nm], f = FAUNA[base];
    const pp = mp.get(a, "pos");
    const id = mpPlace(base);
    mpSet(id, "locationalData", { cellOrWorldDesc: WORLD, pos: [pp[0] + 150, pp[1], pp[2] + 20], rot: [0, 0, 0] });
    mpSet(id, "private.rbEvoked", true); mpSet(id, "private.rbFauna", base); mpSet(id, "private.rbTitle", f.nome);
    setTimeout(function () {
      try { mpSet(id, "isDead", true); } catch (e) { atOut("FAUNA " + nm + " uccisione errore " + e); }
      setTimeout(function () {
        const inv = (mp.get(id, "inventory") || { entries: [] }).entries;
        const exp = {}; f.loot.forEach(function (l) { exp[l[0]] = l[1]; });
        const got = {}; inv.forEach(function (e) { got[e.baseId] = (got[e.baseId] || 0) + e.count; });
        const same = Object.keys(exp).length === Object.keys(got).length && Object.keys(exp).every(function (k) { return got[k] === exp[k]; });
        atOut("FAUNA " + nm + " cadavere: " + JSON.stringify(inv.map(function (e) { return e.baseId.toString(16) + "x" + e.count; })) + " -> " + (same ? "PASS (solo il loot previsto, niente tesoro)" : "FAIL (diverso dal previsto)"));
        const before = {}; f.loot.forEach(function (l) { before[l[0]] = qty(mp.get(a, "inventory"), l[0]); });
        doLoot(u, id, true);
        atOut("FAUNA " + nm + ": finestra del loot aperta (guarda lo schermo)");
        setTimeout(function () {
          const taken = f.loot.map(function (l) { return { baseId: l[0], count: qty(mp.get(id, "inventory"), l[0]) }; });
          applyTaken(u, id, taken);
          const ok = f.loot.every(function (l) { return qty(mp.get(a, "inventory"), l[0]) === before[l[0]] + l[1]; });
          atOut("FAUNA " + nm + " dopo aver preso: " + (ok ? "PASS (tutto nel tuo inventario)" : "FAIL"));
          try { mpDestroy(id); } catch (e) { }
          setTimeout(next, 1500);
        }, 8000);
      }, 2500);
    }, 1500);
  };
  next();
};

// ================== FAUNA DEI BOSCHI: SPAWN, AREA DI MOVIMENTO, RINASCITA ==================
// Punti da terra-punti.json (mappa approvata). Ogni punto ha il suo animale (3 lupi a branco, gli altri singoli).
// Ogni 30 minuti (come i pesci) si conta chi e' vivo e si rimettono SOLO quelli uccisi, nello stesso punto.
// L'IA e' quella di Skyrim; l'unica regola in piu': fuori dall'area (raggio FAUNA_RAGGIO) l'animale torna a piedi (lo fa il gioco, vedi client rbFauna).
const FAUNA_RAGGIO = 3000;
const FAUNA_RAGGI = { coniglio: 1800, volpe: 2600, cervo: 3000, capra: 3000, alce: 3500, lupo: 4500, orso: 4500, gatto_sciabola: 4000, gatto_nevi: 4000, lupo_ghiaccio: 4500, volpe_artica: 2600, orso_nevi: 4500 };
const FAUNA_OSTILI = { lupo: 1, orso: 1, gatto_sciabola: 2, gatto_nevi: 2, lupo_ghiaccio: 1, orso_nevi: 1 };   // 2 = attacca a vista anche se il gioco da solo non parte (gatti)
const FAUNA_BRANCO = { lupo: 3, lupo_ghiaccio: 3 };   // piccolo per i conigli, medio per cervi e volpi, grande per lupi e orsi
const FAUNA_CICLO_MS = 30 * 60 * 1000;
const FAUNA_SPECIE = { coniglio: 0x0006DC9D, cervo: 0x000CF89D, capra: 0x0002EBE2, volpe: 0x000829B3, alce: 0x00023A91, lupo: 0x00023ABE, orso: 0x00023A8A, gatto_sciabola: 0x00023AB5, gatto_nevi: 0x00023AB6, lupo_ghiaccio: 0x00023ABF, volpe_artica: 0x000829B6, orso_nevi: 0x00023A8C };
global.__rbFauna = global.__rbFauna || { slots: null, actors: {}, nasciti: 0, cicli: 0 };
function faunaCarica() {
  const F = global.__rbFauna;
  let pts = {}; try { pts = JSON.parse(_fs.readFileSync("terra-punti-v4.json", "utf8")); } catch (e) { log("[FAUNA] nessun file punti v2: " + e); }   // v2 = altezze lette da Skyrim.esm
  if (F.ver !== 5) {   // cambio versione punti: via gli animali nati sui punti vecchi (quote sbagliate), si rifanno tutti
    Object.keys(F.actors).forEach(function (id) { try { mpDestroy(Number(id)); } catch (e) { } });
    F.actors = {}; F.slots = null; F.ver = 5; log("[FAUNA] punti v4b (spawn tolti dalle zone dei forti) (altezze vere, senza rocce, edifici e alberi): animali vecchi rimossi, ricreo tutto");
  }
  const nuovo = !F.slots; if (!F.slots) F.slots = [];
  const gia = {}; F.slots.forEach(function (sl) { gia[sl.sp] = 1; });
  if (!nuovo && Object.keys(pts).every(function (sp) { return gia[sp] || !FAUNA_SPECIE[sp]; })) return F.slots;   // niente di nuovo
  Object.keys(pts).forEach(function (sp) {
    if (!FAUNA_SPECIE[sp] || (!nuovo && gia[sp])) return;
    ["Windhelm", "Riften"].forEach(function (fe) {
      (pts[sp][fe] || []).forEach(function (p, i) { F.slots.push({ sp: sp, fe: fe, idx: i, x: p.x, y: p.y, z: p.z, m: p.m || null, n: FAUNA_BRANCO[sp] || 1, ids: [] }); });
    });
  });
  log("[FAUNA] punti caricati: " + F.slots.length);
  return F.slots;
}
function faunaVivo(id) { try { return global.__rbFauna.actors[id] && mp.get(id, "isDead") !== true; } catch (e) { return false; } }
function faunaNasci(sl, k) {
  const base = FAUNA_SPECIE[sl.sp];
  const id = mpPlace(base);
  const mem = sl.m && sl.m[k] ? sl.m[k] : { x: sl.x, y: sl.y, z: sl.z };   // ogni membro del branco ha il suo punto con la sua altezza vera (da Skyrim.esm)
  mpSet(id, "locationalData", { cellOrWorldDesc: WORLD, pos: [mem.x, mem.y, mem.z + 60], rot: [0, 0, Math.floor(Math.random() * 360)] });
  mpSet(id, "private.rbEvoked", true); mpSet(id, "private.rbFauna", base);
  const f = FAUNA[base]; if (f) mpSet(id, "private.rbTitle", f.nome);
  global.__rbFauna.actors[id] = sl; sl.ids.push(id); global.__rbFauna.nasciti++;
  return id;
}
function faunaCiclo(motivo) {
  if (global.__rbMisuraOn && motivo !== 'comando') return 0;   // durante le misure in gioco non nascono animali
  const F = global.__rbFauna, slots = faunaCarica(); F.cicli++;
  const coda = []; let manc = 0;
  slots.forEach(function (sl) {
    sl.ids = sl.ids.filter(function (id) { if (faunaVivo(id)) return true; delete F.actors[id]; return false; });
    for (let k = sl.ids.length; k < sl.n; k++) { coda.push([sl, k]); manc++; }
  });
  log("[FAUNA] ciclo (" + motivo + "): punti " + slots.length + ", mancano " + manc);
  let i = 0;
  const t = setInterval(function () {   // pochi alla volta, per non appesantire il server
    for (let c = 0; c < 6 && i < coda.length; c++, i++) { try { faunaNasci(coda[i][0], coda[i][1]); } catch (e) { log("[FAUNA] nascita errore " + e); } }
    if (i >= coda.length) clearInterval(t);
  }, 400);
  return manc;
}
global.__rbFaunaDeathReg = function (actorId) { const F = global.__rbFauna; if (F.actors[actorId]) { const sl = F.actors[actorId]; sl.ids = sl.ids.filter(function (x) { return x !== actorId; }); delete F.actors[actorId]; } };
(function () {
  const prev = global.__rbFortDeath;
  global.__rbFortDeath = function (a, k) { try { global.__rbFaunaDeathReg(a); } catch (e) { } if (prev) return prev(a, k); };
})();
// ai giocatori vicini: elenco degli animali con il loro punto-casa, cosi' il gioco li fa tornare a piedi se escono dall'area
function faunaInvia() {
  try {
    const F = global.__rbFauna; const ids = Object.keys(F.actors); if (!ids.length) return;
    const users = onlineUsers(); if (!users.length) return;
    playersList(users).forEach(function (p) {
      if (p.fake || p.world !== 0x3c) return;
      const list = [];
      ids.forEach(function (sid) {
        const sl = F.actors[sid]; if (!sl) return;
        if (Math.hypot(p.pos[0] - sl.x, p.pos[1] - sl.y) > 22000) return;
        list.push([Number(sid), sl.x, sl.y, sl.z, FAUNA_RAGGI[sl.sp] || FAUNA_RAGGIO, (FAUNA_OSTILI[sl.sp] || 0)]);
      });
      const tp = {}; playersList(users).forEach(function (q) { if (!q.fake && q.world === 0x3c) tp[q.pid] = q.actor; });
      if (list.length) sendTo(p.user, { customPacketType: "rbFauna", list: list, tp: tp });
    });
  } catch (e) { log("[FAUNA] invio errore " + e); }
}
if (global.__rbFaunaTimer) clearInterval(global.__rbFaunaTimer);
global.__rbFaunaTimer = setInterval(function () { try { faunaCiclo("30 minuti"); } catch (e) { log("[FAUNA] errore ciclo " + e); } }, FAUNA_CICLO_MS);
if (global.__rbFaunaSend) clearInterval(global.__rbFaunaSend);
global.__rbFaunaSend = setInterval(faunaInvia, 3000);
if (!global.__rbFaunaBoot) { global.__rbFaunaBoot = true; setTimeout(function () { try { faunaCiclo("avvio"); } catch (e) { log("[FAUNA] errore avvio " + e); } }, 30000); }
const __faunaCmdProva = global.__rbFaunaCmd;
global.__rbFaunaCmd = function (parts) {
  const cmd = parts[1];
  if (cmd === "stato") {
    const F = global.__rbFauna, slots = faunaCarica(), per = {};
    slots.forEach(function (sl) { const k = sl.sp + "/" + sl.fe; per[k] = per[k] || { punti: 0, vivi: 0 }; per[k].punti++; sl.ids.forEach(function (id) { if (faunaVivo(id)) per[k].vivi++; }); });
    atOut("FAUNA stato: nati " + F.nasciti + ", cicli " + F.cicli + " " + JSON.stringify(per)); return;
  }
  if (cmd === "ciclo") { atOut("FAUNA ciclo forzato: mancano " + faunaCiclo("comando")); return; }
  if (cmd === "pulisci") { const F = global.__rbFauna; let n = 0; Object.keys(F.actors).forEach(function (id) { try { mpDestroy(Number(id)); n++; } catch (e) { } }); F.actors = {}; (F.slots || []).forEach(function (sl) { sl.ids = []; }); atOut("FAUNA: tolti " + n + " animali"); return; }
  if (cmd === "uccidi") { const F = global.__rbFauna; const ids = Object.keys(F.actors).filter(function (id) { return !want2(parts[3]) || F.actors[id].sp === parts[3]; }).slice(0, Number(parts[2]) || 1); ids.forEach(function (id) { try { mpSet(Number(id), "isDead", true); } catch (e) { } }); atOut("FAUNA: uccisi " + ids.length); return; }
  if (cmd === "vai") {   // fauna vai <specie> [n] : ti porta sul punto
    const sl = faunaCarica().filter(function (s) { return s.sp === parts[2]; })[Number(parts[3]) || 0]; const us = onlineUsers();
    if (!sl || !us.length) { atOut("FAUNA vai: niente"); return; }
    mpSet(mp.getUserActor(us[0]), "locationalData", { cellOrWorldDesc: WORLD, pos: [sl.x + 300, sl.y, sl.z + 40], rot: [0, 0, 0] });
    atOut("FAUNA vai: " + sl.sp + " " + sl.fe + " " + sl.idx + " (" + sl.x + "," + sl.y + "," + sl.z + ")"); return;
  }
  if (cmd === "misura") {   // misura l'altezza vera su TUTTI i punti (anche sopra rocce e tetti): ti porta sopra il punto, aspetta che atterri, legge la quota -> misura-fauna.json
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const me = mp.getUserActor(us[0]); const home = mp.get(me, "pos");
    const lista = []; faunaCarica().forEach(function (sl) { lista.push({ sp: sl.sp, fe: sl.fe, idx: String(sl.idx), x: sl.x, y: sl.y, z: sl.z }); });   // solo i centri (i membri del branco sono a 350 unita')
    const res = []; let i = 0;
    global.__rbMisuraOn = true; atOut("MISURA: " + lista.length + " punti (circa " + Math.round(lista.length * 12 / 60) + " minuti): non muovere il personaggio");
    (function passo() {
      if (i >= lista.length) {
        try { _fs.writeFileSync("misura-fauna.json", JSON.stringify(res)); } catch (e) { }
        mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: home, rot: [0, 0, 0] });
        const bad = res.filter(function (r) { return r.z === null || Math.abs(r.z - r.zf) > 120; });
        global.__rbMisuraOn = false; atOut("MISURA: finito " + res.length + " punti, " + bad.length + " con altezza diversa dal file (oltre 120): misura-fauna.json"); return;
      }
      const sl = lista[i]; mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: [sl.x, sl.y, sl.z + 700], rot: [0, 0, 0] });
      setTimeout(function () {
        let z = null; try { z = mp.get(me, "pos")[2]; } catch (e) { }
        res.push({ sp: sl.sp, fe: sl.fe, idx: sl.idx, x: sl.x, y: sl.y, zf: sl.z, z: z });
        try { setHp(me, 1); } catch (e) { }
        i++; passo();
      }, 12000);
    })();
    return;
  }
  if (cmd === "misurafort") {   // come "misura" ma sui punti dei forti: nascite interne e punti-casa -> misura-forti.json
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const me = mp.getUserActor(us[0]); const home = mp.get(me, "pos"); const lista = [];
    FORTS.forEach(function (f) { global.__rbSlots[f.id].inside.forEach(function (sl, i) { lista.push({ f: f.id, k: "nascita" + i, x: sl.x, y: sl.y, z: sl.z }); lista.push({ f: f.id, k: "casa" + i, x: sl.hx, y: sl.hy, z: sl.hz }); }); });
    const res = []; let i = 0; global.__rbMisuraOn = true; atOut("MISURAFORT: " + lista.length + " punti (circa " + Math.round(lista.length * 12 / 60) + " minuti)");
    (function passo() {
      if (i >= lista.length) { try { _fs.writeFileSync("misura-forti.json", JSON.stringify(res)); } catch (e) { } mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: home, rot: [0, 0, 0] }); global.__rbMisuraOn = false; atOut("MISURAFORT: finito " + res.length + " punti: misura-forti.json"); return; }
      const sl = lista[i]; mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: [sl.x, sl.y, sl.z + 700], rot: [0, 0, 0] });
      setTimeout(function () { let z = null; try { z = mp.get(me, "pos")[2]; } catch (e) { } res.push({ f: sl.f, k: sl.k, x: sl.x, y: sl.y, zf: sl.z, z: z }); try { setHp(me, 1); } catch (e) { } i++; passo(); }, 12000);
    })();
    return;
  }
  if (cmd === "giro") {   // prova in gioco: per ~2 punti di ogni specie porta il giocatore, aspetta, e registra DOVE sono davvero gli animali (due letture a 10 s) e dove atterra il giocatore -> osserva-fauna.json
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const me = mp.getUserActor(us[0]); const home = mp.get(me, "pos"); const F = global.__rbFauna, slots = faunaCarica(); const per = {}, lista = [];
    slots.forEach(function (sl) { per[sl.sp] = per[sl.sp] || []; per[sl.sp].push(sl); });
    Object.keys(per).forEach(function (sp) { const a = per[sp]; const pick = [a[0], a[Math.floor(a.length / 2)], a[a.length - 1]].filter(function (x, i, arr) { return arr.indexOf(x) === i; }); (parts[2] === 'tutti' ? a : pick.slice(0, Number(parts[2]) || 2)).forEach(function (x) { lista.push(x); }); });
    if (parts[2] === 'lista') { lista.length = 0; String(parts[3] || '').split(',').forEach(function (t) { const q = t.split(':'); const f = slots.filter(function (x) { return x.sp === q[0] && x.fe === q[1] && String(x.idx) === q[2]; })[0]; if (f) lista.push(f); }); }
    const res = []; let i = 0; global.__rbMisuraOn = true;
    const snap = function () { const out = []; let pp = null; try { pp = mp.get(me, "pos"); } catch (e) { } Object.keys(F.actors).forEach(function (id) { try { const sl = F.actors[id]; const p = mp.get(Number(id), "pos"); if (pp && Math.hypot(p[0] - pp[0], p[1] - pp[1]) < 6000 && mp.get(Number(id), "isDead") !== true) out.push({ id: Number(id), sp: sl.sp, hx: sl.x, hy: sl.y, hz: sl.z, p: p }); } catch (e) { } }); return { pl: pp, a: out }; };
    atOut("GIRO: " + lista.length + " punti (circa " + Math.round(lista.length * 30 / 60) + " minuti)");
    (function passo() {
      if (i >= lista.length) { try { _fs.writeFileSync("osserva-fauna.json", JSON.stringify(res)); } catch (e) { } global.__rbMisuraOn = false; mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: home, rot: [0, 0, 0] }); atOut("GIRO: finito " + res.length + " punti (osserva-fauna.json)"); return; }
      const sl = lista[i]; mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: home, rot: [0, 0, 0] });
      setTimeout(function () { mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: [sl.x + 250, sl.y, sl.z + 80], rot: [0, 0, 0] }); }, 6000);
      setTimeout(function () { const s1 = snap(); setTimeout(function () { const s2 = snap(); res.push({ sp: sl.sp, fe: sl.fe, idx: sl.idx, x: sl.x, y: sl.y, z: sl.z, s1: s1, s2: s2 }); try { _fs.writeFileSync("osserva-fauna.json", JSON.stringify(res)); } catch (e) { } i++; passo(); }, 8000); }, (parts[2] === 'lista' ? 46000 : 28000));
    })();
    return;
  }
  if (cmd === "giroforti") {   // prova in gioco sui forti: porta il giocatore dentro/attorno a ogni forte e registra dove sono davvero gli orchi (2 letture) -> osserva-forti.json
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const me = mp.getUserActor(us[0]); const home = mp.get(me, "pos"); const lista = [];
    FORTS.forEach(function (f) { const sl0 = global.__rbSlots[f.id].inside; lista.push({ f: f.id, k: "centro", x: f.cx, y: f.cy, z: f.cz + 400 }); [0, 5, 10, 15].forEach(function (i) { if (sl0[i]) lista.push({ f: f.id, k: "slot" + i, x: sl0[i].x, y: sl0[i].y, z: sl0[i].z + 300 }); }); f.patrol.slice(0, 3).forEach(function (p, j) { lista.push({ f: f.id, k: "pattuglia" + j, x: p[0], y: p[1], z: p[2] + 300 }); }); });
    if (parts[2]) { const want = String(parts[2]).split(','); for (let q = lista.length - 1; q >= 0; q--) { if (want.indexOf(lista[q].f + ':' + lista[q].k) < 0) lista.splice(q, 1); } }
    const res = []; let i = 0; global.__rbMisuraOn = true;
    const snap = function () { const out = []; let pp = null; try { pp = mp.get(me, "pos"); } catch (e) { } FORTS.forEach(function (f) { global.__rbSlots[f.id].inside.forEach(function (sl) { if (!sl.id) return; try { const p = mp.get(sl.id, "pos"); if (pp && Math.hypot(p[0] - pp[0], p[1] - pp[1]) < 6000) out.push({ f: f.id, id: sl.id, sx: sl.x, sy: sl.y, sz: sl.z, hx: sl.hx, hy: sl.hy, hz: sl.hz, p: p, dead: mp.get(sl.id, "isDead") === true }); } catch (e) { } }); }); return { pl: pp, a: out }; };
    atOut("GIROFORTI: " + lista.length + " punti (circa " + Math.round(lista.length * 32 / 60) + " minuti)");
    (function passo() {
      if (i >= lista.length) { global.__rbMisuraOn = false; mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: home, rot: [0, 0, 0] }); atOut("GIROFORTI: finito " + res.length + " punti (osserva-forti.json)"); return; }
      const t = lista[i]; mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: home, rot: [0, 0, 0] });
      setTimeout(function () { mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: [t.x, t.y, t.z], rot: [0, 0, 0] }); }, 6000);
      setTimeout(function () { const s1 = snap(); setTimeout(function () { const s2 = snap(); res.push({ f: t.f, k: t.k, x: t.x, y: t.y, z: t.z, s1: s1, s2: s2 }); try { _fs.writeFileSync("osserva-forti.json", JSON.stringify(res)); } catch (e) { } i++; passo(); }, 8000); }, 46000);
    })();
    return;
  }
  if (cmd === "tp") {   // PROVA: ti porta a x y z (es. fauna tp 19200 8960 -4076) e dice dove atterri
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const me = mp.getUserActor(us[0]); const t = [Number(parts[2]), Number(parts[3]), Number(parts[4])];
    if (t.some(isNaN)) { atOut("TP: uso: fauna tp x y z"); return; }
    mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: t, rot: [0, 0, 0] });
    setTimeout(function () { try { const q = mp.get(me, "pos"); atOut("TP: arrivato a " + Math.round(q[0]) + "," + Math.round(q[1]) + "," + Math.round(q[2])); } catch (e) { atOut("TP: errore lettura"); } }, 20000);
    return;
  }
  if (cmd === "quota") {   // misura l'altezza vera del terreno sui punti di montagna: ti porta li' (poco sopra), aspetta che atterri e legge la quota
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const me = mp.getUserActor(us[0]); const home = mp.get(me, "pos");
    const MONT = { gatto_sciabola: 1, gatto_nevi: 1, lupo_ghiaccio: 1, volpe_artica: 1, orso_nevi: 1 };
    const lista = faunaCarica().filter(function (x) { return MONT[x.sp]; }); const res = []; let i = 0;
    atOut("QUOTA: misuro " + lista.length + " punti (circa " + Math.round(lista.length * 12 / 60) + " minuti)");
    (function passo() {
      if (i >= lista.length) {
        try { _fs.writeFileSync("quote-montagna.json", JSON.stringify(res)); } catch (e) { }
        mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: home, rot: [0, 0, 0] });
        atOut("QUOTA: finito, " + res.filter(function (r) { return r.ok; }).length + "/" + lista.length + " misurati (file quote-montagna.json); ti ho rimesso dove eri"); return;
      }
      const sl = lista[i]; mpSet(me, "locationalData", { cellOrWorldDesc: WORLD, pos: [sl.x, sl.y, sl.z + 900], rot: [0, 0, 0] });
      setTimeout(function () {
        let z = null; try { z = mp.get(me, "pos")[2]; } catch (e) { }
        let ok = z !== null && z < sl.z + 850;
        res.push({ sp: sl.sp, fe: sl.fe, idx: sl.idx, x: sl.x, y: sl.y, z: z, ok: ok });
        try { setHp(me, 1); } catch (e) { }
        i++; passo();
      }, 12000);
    })();
    return;
  }
  if (cmd === "provatarget") {   // un lupo con casa vicino a te: il gioco deve fargli scegliere il giocatore piu' vicino e tenerlo (guarda npc-log: "[FAUNA] ... sceglie / mantiene")
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const pp = mp.get(mp.getUserActor(us[0]), "pos"); const sp0 = parts[2] || "lupo";
    const dst = Number(parts[3]) || 1200; const sl = { sp: sp0, fe: "prova", idx: 0, x: pp[0] + dst, y: pp[1], z: pp[2], n: 1, ids: [] };
    const id = faunaNasci(sl, 0); atOut("TARGET: " + sp0 + " " + id.toString(16) + " creato a 1200 unita' da te: se ti attacca, il log mostra quale giocatore sceglie");
    setTimeout(function () { try { mpDestroy(id); } catch (e) { } delete global.__rbFauna.actors[id]; atOut("TARGET: prova finita (animale rimosso)"); }, 60000);
    return;
  }
  if (cmd === "provaarea") {   // prova dell'area: l'animale (casa lontana dal giocatore) viene messo FUORI area, a 3500 unita' da te, e deve tornare camminando verso casa
    const us = onlineUsers(); if (!us.length) { atOut("nessun giocatore online"); return; }
    const pp = mp.get(mp.getUserActor(us[0]), "pos"); const sp0 = parts[2] || "cervo"; const RR = (typeof FAUNA_RAGGI !== "undefined" && FAUNA_RAGGI[sp0]) || FAUNA_RAGGIO;
    const hx = pp[0], hy = pp[1] + 1000, ax = hx + Math.round(RR * 1.2 + 500), ay = hy;
    const sl = { sp: sp0, fe: "prova", idx: 0, x: hx, y: hy, z: pp[2], n: 1, ids: [] };
    const id = faunaNasci(sl, 0); atOut("AREA: " + sp0 + " " + id.toString(16) + " casa a " + Math.round(sl.x) + "," + Math.round(sl.y) + " raggio " + RR + " (giocatore a " + Math.round(pp[0]) + "," + Math.round(pp[1]) + ")");
    setTimeout(function () {
      mpSet(id, "locationalData", { cellOrWorldDesc: WORLD, pos: [ax, ay, pp[2] + 30], rot: [0, 0, 0] });
      atOut("AREA: messo fuori area a " + Math.round(ax) + "," + Math.round(ay) + " (distanza dalla casa " + Math.round(RR * 1.2 + 500) + ")");
      let t = 0, dmin = 1e9, dmax = 0; const chk = setInterval(function () {
        t += 6; let d = -1, dp = -1; try { const q = mp.get(id, "pos"); d = Math.round(Math.hypot(q[0] - sl.x, q[1] - sl.y)); const p2 = mp.get(mp.getUserActor(us[0]), "pos"); dp = Math.round(Math.hypot(q[0] - p2[0], q[1] - p2[1])); } catch (e) { }
        if (d >= 0) { dmin = Math.min(dmin, d); dmax = Math.max(dmax, d); }
        atOut("AREA: dopo " + t + " s: " + d + " dalla casa, " + dp + " dal giocatore" + (d >= 0 && d < RR * 1.15 ? " (DENTRO l'area)" : ""));
        if (t >= 120 || (d >= 0 && d < RR * 1.1)) { clearInterval(chk); atOut("AREA: " + (d >= 0 && d < RR * 1.15 ? "PASS (tornato camminando in " + t + " s)" : "FAIL (non e' tornato; min " + dmin + ", max " + dmax + ")")); try { mpDestroy(id); } catch (e) { } delete global.__rbFauna.actors[id]; }
      }, 6000);
    }, 8000);
    return;
  }
  if (cmd === "prova") {   // spawn -> conteggi -> uccisione -> rinascita
    const F = global.__rbFauna, slots = faunaCarica(); const tot = slots.reduce(function (a, s) { return a + s.n; }, 0);
    const conta = function () { let v = 0; slots.forEach(function (sl) { sl.ids.forEach(function (id) { if (faunaVivo(id)) v++; }); }); return v; };
    atOut("FAUNA PROVA 1: previsti " + tot + ", vivi " + conta() + " -> " + (conta() === tot ? "PASS" : "FAIL"));
    const ids = Object.keys(F.actors).slice(0, 12); ids.forEach(function (id) { try { mpSet(Number(id), "isDead", true); } catch (e) { } });
    setTimeout(function () {
      atOut("FAUNA PROVA 2: uccisi " + ids.length + ", vivi " + conta() + " -> " + (conta() === tot - ids.length ? "PASS" : "FAIL"));
      faunaCiclo("prova");
      setTimeout(function () { atOut("FAUNA PROVA 3: dopo la rinascita vivi " + conta() + " su " + tot + " -> " + (conta() === tot ? "PASS" : "FAIL")); }, 6000);
    }, 3000);
    return;
  }
  return __faunaCmdProva(parts);
};
function want2(x) { return !!x; }
