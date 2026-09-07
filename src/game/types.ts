export const TILE = 16;
export const VIEW_W = 480;
export const VIEW_H = 270;
export const WALK_SPEED = 68;

export type MapId = "hub" | "red" | "blue" | "dungeon" | "tavern";
export type Faction = "right" | "left" | "system" | "bloodline" | "final";
export type EnemyKind = "regular" | "miniboss" | "boss" | "final";
export type Alignment = "neutral" | "left" | "right";

export type SkillId =
  | "hammer_clarity"
  | "mute_counter"
  | "independent"
  | "fact_check"
  | "common_sense";

export type ItemId = "potion" | "ether" | "neutralizer";

export type EnemyActionId = "attack" | "lecture" | "buff" | "heal" | "special";

export interface SkillDef {
  id: SkillId;
  name: string;
  mp: number;
  desc: string;
}

export interface ItemDef {
  id: ItemId;
  name: string;
  desc: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  faction: Faction;
  kind: EnemyKind;
  hp: number;
  mp: number;
  atk: number;
  def: number;
  spd: number;
  xp: number;
  gold: number;
  sprite: string;
  portrait?: string;
  tint?: number;
  scale?: number;
  media?: boolean;
  lecture?: boolean;
  canReeducate?: boolean;
  intro: string;
  actions: EnemyActionId[];
  specialName?: string;
}

export interface BossMeta {
  id: string;
  order: number;
  title: string;
  location: string;
}

export interface HeroRuntime {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  gold: number;
  items: Record<ItemId, number>;
}

export interface StatusEffect {
  id: "reeducate" | "independent" | "mute_armed" | "buff_atk";
  name: string;
  turns: number;
  alignment?: Alignment;
}

export interface SaveBlob {
  version: number;
  hero: HeroRuntime;
  map: MapId;
  tx: number;
  ty: number;
  facing: number;
  flags: GameFlags;
}

export interface GameFlags {
  introSeen: boolean;
  redWins: number;
  blueWins: number;
  redMiniboss: boolean;
  blueMiniboss: boolean;
  bossesDefeated: string[];
  dungeonOpen: boolean;
  ending: boolean;
  boughtHammer: boolean;
  boughtMateria: boolean;
  /** Mid-game lean foreshadow already shown once. */
  leanHintShown?: boolean;
  /** First dungeon entry monologue shown. */
  dungeonLeanShown?: boolean;
}

export interface Warp {
  x: number;
  y: number;
  to: MapId;
  tx: number;
  ty: number;
  need?: "dungeon" | "tavern";
}

export interface NpcSpot {
  x: number;
  y: number;
  id: string;
  name: string;
  sprite?: string;
  tint?: number;
  facing?: number;
}

export interface GameMap {
  id: MapId;
  name: string;
  music: "overworld" | "dungeon" | "tavern";
  ground: number[][];
  warps: Warp[];
  npcs: NpcSpot[];
  encounters: "none" | "right" | "left" | "system";
  spawn: { x: number; y: number };
  battleBg: string;
}

export interface EncounterSpec {
  enemyIds: string[];
  isBoss?: boolean;
  bg: string;
  cannotFlee?: boolean;
  returnMap?: MapId;
  returnX?: number;
  returnY?: number;
}
