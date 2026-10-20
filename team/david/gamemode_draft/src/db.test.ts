import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { loadDb, ingredientsAvailableIn, findIngredient, brew, rollDrops, jobCan } from "./db.ts";

const db = loadDb(join(import.meta.dirname, "..", "..", "db"));

test("carica i database completi", () => {
  assert.equal(db.ingredients.size, 110);
  assert.equal(db.effects.size, 55);
  assert.ok(db.creatures.size >= 25);
  assert.equal(db.jobs.size, 8);
});

test("ingredienti per feudo: Dragon's Tongue solo a Eastmarch, Canis Root solo nel Rift", () => {
  const rift = ingredientsAvailableIn(db, "rift").map((i) => i.id);
  const east = ingredientsAvailableIn(db, "eastmarch").map((i) => i.id);
  assert.ok(east.includes("dragonstongue") || east.includes("dragons_tongue") || east.some((x) => x.includes("dragon")));
  assert.ok(rift.some((x) => x.includes("canis")));
  assert.ok(!east.some((x) => x.includes("canis")));
});

test("ricerca per nome inglese, italiano e id", () => {
  const a = findIngredient(db, "Nirnroot");
  assert.ok(a);
  assert.equal(findIngredient(db, "NIRNROOT")?.id, a.id);
  assert.equal(findIngredient(db, a.id)?.id, a.id);
  assert.equal(findIngredient(db, "non esiste"), undefined);
});

test("ricetta: Blue Mountain Flower + Wheat attiva Fortify Health e Restore Health", () => {
  const b = findIngredient(db, "Blue Mountain Flower")!;
  const w = findIngredient(db, "Wheat")!;
  assert.deepEqual(brew(db, [b.id, w.id]), ["Fortify Health", "Restore Health"]);
});

test("ricetta: servono 2 o 3 ingredienti e ingredienti noti", () => {
  const b = findIngredient(db, "Wheat")!;
  assert.throws(() => brew(db, [b.id]));
  assert.throws(() => brew(db, [b.id, "inesistente"]));
});

test("drop del cervo: rng basso = tutto, rng alto = solo i drop al 100%", () => {
  const deer = db.creatures.get("deer")!;
  const tutto = rollDrops(deer, () => 0).map((d) => d.item);
  assert.ok(tutto.includes("Venison") && tutto.includes("Deer Hide") && tutto.includes("Large Antlers"));
  const poco = rollDrops(deer, () => 0.99).map((d) => d.item);
  assert.deepEqual(poco.sort(), ["Deer Hide", "Venison"]);
});

test("drop con percentuale non nota non vengono assegnati", () => {
  // il falco ha ancora le percentuali null (la volpe e' stata completata il 20 ott 2026)
  const hawk = db.creatures.get("hawk")!;
  assert.deepEqual(rollDrops(hawk, () => 0), []);
});

test("permessi dei job (provvisori dal 14 ott 2026)", () => {
  assert.equal(jobCan(db, "miner", "gather_ore"), true);
  assert.equal(jobCan(db, "miner", "brew"), false);
  assert.throws(() => jobCan(db, "inesistente", "mine"));
});
