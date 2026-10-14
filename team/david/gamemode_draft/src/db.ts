// Caricatore dei database JSON del server (bozza).
// Non dipende da SkyMP: legge i file di team/david/db/ e offre funzioni semplici
// (ingredienti per feudo, risultato di una ricetta, drop di una creatura, permessi dei job).
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Hold = "rift" | "eastmarch";
export type Availability = "both" | "rift" | "eastmarch" | "present" | "none" | "unknown";

export interface Ingredient {
  id: string;
  name_en: string;
  name_it: string | null;
  plugin: string;
  local_form_id: string;
  form_id_verified: boolean;
  effects: string[];
  feudi: { availability: Availability; inferred?: boolean };
  stats?: { value: number; weight: number | null; other_uses: string | null };
}

export interface Effect {
  id: string;
  name_en: string;
  kind: "pozione" | "veleno";
  ingredients: string[];
}

export interface Drop {
  item: string;
  chance: number | null; // 0-1; null = percentuale non indicata nel Discord
  qty?: number;
  per_kill?: number;
}

export interface Creature {
  id: string;
  name_en: string;
  behavior: string;
  habitat: string[];
  drops: Drop[];
}

export interface Job {
  id: string;
  name_it: string;
  allowed_actions: string[] | null; // null = non ancora definito
}

export interface Db {
  ingredients: Map<string, Ingredient>;
  effects: Map<string, Effect>;
  creatures: Map<string, Creature>;
  jobs: Map<string, Job>;
}

function readItems<T extends { id: string }>(dir: string, file: string): Map<string, T> {
  const json = JSON.parse(readFileSync(join(dir, file), "utf-8")) as { items: T[] };
  return new Map(json.items.map((x) => [x.id, x]));
}

export function loadDb(dir: string): Db {
  return {
    ingredients: readItems<Ingredient>(dir, "ingredients.json"),
    effects: readItems<Effect>(dir, "effects.json"),
    creatures: readItems<Creature>(dir, "creatures.json"),
    jobs: readItems<Job>(dir, "jobs.json"),
  };
}

const OK_IN: Record<Hold, Availability[]> = {
  rift: ["both", "rift", "present"],
  eastmarch: ["both", "eastmarch", "present"],
};

/** Ingredienti presenti in un feudo ("present" = feudo non noto, conta in entrambi). */
export function ingredientsAvailableIn(db: Db, hold: Hold): Ingredient[] {
  return [...db.ingredients.values()].filter((i) => OK_IN[hold].includes(i.feudi.availability));
}

/** Cerca per id ("nirnroot"), nome inglese o nome italiano, senza badare a maiuscole. */
export function findIngredient(db: Db, query: string): Ingredient | undefined {
  const q = query.trim().toLowerCase();
  return [...db.ingredients.values()].find(
    (i) => i.id === q || i.name_en.toLowerCase() === q || i.name_it?.toLowerCase() === q,
  );
}

/** Effetti attivi di una ricetta: quelli presenti in almeno 2 ingredienti (regola di Skyrim). */
export function brew(db: Db, ingredientIds: string[]): string[] {
  if (ingredientIds.length < 2 || ingredientIds.length > 3) {
    throw new Error("Una ricetta richiede 2 o 3 ingredienti");
  }
  const count = new Map<string, number>();
  for (const id of ingredientIds) {
    const ing = db.ingredients.get(id);
    if (!ing) throw new Error(`Ingrediente sconosciuto: ${id}`);
    for (const e of ing.effects) count.set(e, (count.get(e) ?? 0) + 1);
  }
  return [...count].filter(([, n]) => n >= 2).map(([e]) => e).sort();
}

export interface DropResult {
  item: string;
  count: number;
}

/** Tira i drop di una creatura. `rng` restituisce un numero in [0,1) (si passa Math.random in gioco). */
export function rollDrops(creature: Creature, rng: () => number): DropResult[] {
  const out: DropResult[] = [];
  for (const d of creature.drops) {
    if (d.chance === null) continue; // percentuale non nota: nessun drop finché non viene decisa
    if (rng() < d.chance) out.push({ item: d.item, count: d.qty ?? d.per_kill ?? 1 });
  }
  return out;
}

/** true/false se il job può fare l'azione; undefined se i permessi del job non sono ancora definiti. */
export function jobCan(db: Db, jobId: string, action: string): boolean | undefined {
  const job = db.jobs.get(jobId);
  if (!job) throw new Error(`Job sconosciuto: ${jobId}`);
  if (job.allowed_actions === null) return undefined;
  return job.allowed_actions.includes(action);
}
