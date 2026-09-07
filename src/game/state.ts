import { ENEMIES } from "./database";
import { MAX_INFLUENCE, START_INFLUENCE, STARTER_GROUP_IDS } from "./conspiracyDeck";
import type {
  Alignment,
  EncounterSpec,
  GameFlags,
  HeroRuntime,
  MapId,
  SaveBlob,
  StatusEffect,
} from "./types";

export const SAVE_VERSION = 2;

export function defaultHero(): HeroRuntime {
  return {
    name: "Baki The Hammer",
    level: 1,
    xp: 0,
    xpToNext: 40,
    hp: 120,
    maxHp: 120,
    mp: 40,
    maxMp: 40,
    atk: 18,
    def: 12,
    spd: 14,
    gold: 80,
    influence: START_INFLUENCE,
    maxInfluence: MAX_INFLUENCE,
    items: { potion: 5, ether: 3, neutralizer: 2 },
  };
}

export function defaultFlags(): GameFlags {
  return {
    introSeen: false,
    redWins: 0,
    blueWins: 0,
    redMiniboss: false,
    blueMiniboss: false,
    bossesDefeated: [],
    dungeonOpen: false,
    ending: false,
    boughtHammer: false,
    boughtMateria: false,
    leanHintShown: false,
    dungeonLeanShown: false,
    unlockedGroupCards: [...STARTER_GROUP_IDS],
    conspireHowtoShown: false,
  };
}

export interface Runtime {
  hero: HeroRuntime;
  flags: GameFlags;
  map: MapId;
  tx: number;
  ty: number;
  facing: number; // radians, 0 = down
  yaw: number;
  speed: number;
  statuses: StatusEffect[];
  alignment: Alignment;
  pendingEncounter: EncounterSpec | null;
  steps: number;
  nextEncounterAt: number;
  blocking: boolean;
}

function fresh(): Runtime {
  return {
    hero: defaultHero(),
    flags: defaultFlags(),
    map: "hub",
    tx: 13,
    ty: 10,
    facing: 0,
    yaw: 0,
    speed: 0,
    statuses: [],
    alignment: "neutral",
    pendingEncounter: null,
    steps: 0,
    nextEncounterAt: 16 + Math.floor(Math.random() * 12),
    blocking: false,
  };
}

export const G: Runtime = fresh();

export function resetGame(): void {
  Object.assign(G, fresh());
}

export function applySave(save: SaveBlob): void {
  const base = defaultHero();
  G.hero = {
    ...base,
    ...save.hero,
    items: { ...base.items, ...save.hero.items },
    influence: save.hero.influence ?? START_INFLUENCE,
    maxInfluence: save.hero.maxInfluence ?? MAX_INFLUENCE,
  };
  const df = defaultFlags();
  G.flags = {
    ...df,
    ...save.flags,
    bossesDefeated: [...(save.flags.bossesDefeated ?? [])],
    unlockedGroupCards: [
      ...new Set([...(df.unlockedGroupCards ?? []), ...(save.flags.unlockedGroupCards ?? [])]),
    ],
  };
  G.map = save.map;
  G.tx = save.tx;
  G.ty = save.ty;
  G.facing = save.facing;
  G.yaw = save.facing;
  G.speed = 0;
  G.statuses = [];
  G.alignment = "neutral";
  G.pendingEncounter = null;
  G.steps = 0;
  G.nextEncounterAt = 16;
  G.blocking = false;
  G.flags.dungeonOpen = G.flags.redMiniboss && G.flags.blueMiniboss;
}

export function snapshot(): SaveBlob {
  return {
    version: SAVE_VERSION,
    hero: structuredClone(G.hero),
    map: G.map,
    tx: G.tx,
    ty: G.ty,
    facing: G.facing,
    flags: structuredClone(G.flags),
  };
}

export function healFull(): void {
  G.hero.hp = G.hero.maxHp;
  G.hero.mp = G.hero.maxMp;
  G.hero.influence = Math.min(G.hero.maxInfluence, Math.max(G.hero.influence, START_INFLUENCE));
  G.statuses = [];
  G.alignment = "neutral";
}

export function grantXp(amount: number): string[] {
  const notes: string[] = [];
  G.hero.xp += amount;
  while (G.hero.xp >= G.hero.xpToNext) {
    G.hero.xp -= G.hero.xpToNext;
    G.hero.level += 1;
    G.hero.maxHp += 20;
    G.hero.maxMp += 7;
    G.hero.atk += 4;
    G.hero.def += 3;
    G.hero.spd += 2;
    G.hero.maxInfluence = Math.min(9, MAX_INFLUENCE + Math.floor(G.hero.level / 5));
    G.hero.hp = G.hero.maxHp;
    G.hero.mp = G.hero.maxMp;
    G.hero.influence = G.hero.maxInfluence;
    G.hero.xpToNext = 36 + G.hero.level * 18;
    notes.push(`Level up! Lv ${G.hero.level}`);
  }
  return notes;
}

export function hasStatus(id: StatusEffect["id"]): boolean {
  return G.statuses.some((s) => s.id === id);
}

export function addStatus(effect: StatusEffect): void {
  G.statuses = G.statuses.filter((s) => s.id !== effect.id);
  G.statuses.push(effect);
  if (effect.id === "reeducate") G.alignment = effect.alignment ?? "left";
}

export function tickStatuses(): string[] {
  const msgs: string[] = [];
  for (const s of G.statuses) s.turns -= 1;
  const gone = G.statuses.filter((s) => s.turns <= 0);
  G.statuses = G.statuses.filter((s) => s.turns > 0);
  for (const s of gone) {
    msgs.push(`${s.name} faded.`);
    if (s.id === "reeducate") G.alignment = "neutral";
  }
  return msgs;
}

export function noteWin(table: "right" | "left" | "system"): void {
  if (table === "right") G.flags.redWins += 1;
  if (table === "left") G.flags.blueWins += 1;
  if (G.flags.redMiniboss && G.flags.blueMiniboss) G.flags.dungeonOpen = true;
}

export function defeatBoss(id: string): void {
  if (!G.flags.bossesDefeated.includes(id)) G.flags.bossesDefeated.push(id);
  if (id === "reeducation_instructor_red") G.flags.redMiniboss = true;
  if (id === "reeducation_instructor_blue") G.flags.blueMiniboss = true;
  if (ENEMIES[id]?.kind === "final") G.flags.ending = true;
  G.flags.dungeonOpen = G.flags.redMiniboss && G.flags.blueMiniboss;
  unlockGroupCard(id);
}

/** Persist a defeated group's Conspiracy card into the player's deck. */
export function unlockGroupCard(enemyId: string): string | null {
  const cardId = `group_${enemyId}`;
  if (!G.flags.unlockedGroupCards) G.flags.unlockedGroupCards = [...STARTER_GROUP_IDS];
  if (G.flags.unlockedGroupCards.includes(cardId)) return null;
  // Only unlock if enemy exists in database
  if (!ENEMIES[enemyId]) return null;
  G.flags.unlockedGroupCards.push(cardId);
  return cardId;
}

export function regenInfluence(amount = 1): void {
  G.hero.influence = Math.min(G.hero.maxInfluence, G.hero.influence + amount);
}
