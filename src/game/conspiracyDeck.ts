/**
 * Conspiracy Deck — ORIGINAL Culture War combat layer.
 * Inspired by the *structure* of conspiracy card games (alignments, groups,
 * specials, control/neutralize/destroy) but uses only this game's lore:
 * bloodline bosses, left/right/system foes, Illuminati Outline motifs already
 * in the project. No Steve Jackson Games Illuminati / INWO names, art, or text.
 */
import { ENEMIES } from "./database";
import type { EnemyDef, Faction } from "./types";

/** Original alignment names mapped onto Culture War factions. */
export type ConspiracyAlignment =
  | "Order"
  | "Chaos"
  | "Media"
  | "Capital"
  | "Faith"
  | "Justice";

export type ConspiracyAction = "control" | "neutralize" | "destroy";

export type SpecialEffectId =
  | "bribe"
  | "assassinate"
  | "media_blackout"
  | "market_crash"
  | "double_agent"
  | "pyramid_scheme"
  | "leak"
  | "honeypot"
  | "shell_corp"
  | "astroturf"
  | "dead_drop"
  | "false_flag"
  | "soft_power"
  | "ledger_wipe";

export interface GroupCardDef {
  id: string;
  enemyId: string;
  name: string;
  alignment: ConspiracyAlignment;
  /** Derived from atk — smash / control pressure. */
  power: number;
  /** Derived from def — hard to flip. */
  resistance: number;
  /** Flavor income; mirrors gold-drop scale. */
  income: number;
  kind: EnemyDef["kind"];
  faction: Faction;
}

export interface SpecialCardDef {
  id: SpecialEffectId;
  name: string;
  desc: string;
  /** Influence cost to play from hand. */
  influence: number;
  /** Optional gold surcharge (Bribe). */
  gold?: number;
  /** Optional MP surcharge. */
  mp?: number;
}

export interface ConspiracyActionDef {
  id: ConspiracyAction;
  name: string;
  influence: number;
  desc: string;
}

export const CONSPIRACY_ACTIONS: ConspiracyActionDef[] = [
  {
    id: "control",
    name: "Attack to Control",
    influence: 2,
    desc: "Chance to flip a foe into a temporary ally shade.",
  },
  {
    id: "neutralize",
    name: "Attack to Neutralize",
    influence: 1,
    desc: "Stun a foe — they skip their next action.",
  },
  {
    id: "destroy",
    name: "Attack to Destroy",
    influence: 2,
    desc: "Execute low-HP foes; bonus damage vs ally shades.",
  },
];

/** Starter specials always available once the deck opens. */
export const SPECIAL_CARDS: SpecialCardDef[] = [
  {
    id: "bribe",
    name: "Bribe",
    desc: "Spend gold for a high-odds Control attempt.",
    influence: 1,
    gold: 25,
  },
  {
    id: "assassinate",
    name: "Assassinate",
    desc: "Big single-target strike. Bonus if target stunned.",
    influence: 2,
    mp: 4,
  },
  {
    id: "media_blackout",
    name: "Media Blackout",
    desc: "Mute Lectures for a few turns (like Mute Button).",
    influence: 2,
  },
  {
    id: "market_crash",
    name: "Market Crash",
    desc: "Cut a boss's DEF and gold payout this fight.",
    influence: 2,
  },
  {
    id: "double_agent",
    name: "Double Agent",
    desc: "Steal a foe's ATK buff for yourself.",
    influence: 2,
  },
  {
    id: "pyramid_scheme",
    name: "Pyramid Scheme",
    desc: "Summon a weak ally shade from a random unlocked group.",
    influence: 2,
  },
  {
    id: "leak",
    name: "Leak",
    desc: "Strip foe buffs and deal light splash.",
    influence: 1,
    mp: 3,
  },
  {
    id: "honeypot",
    name: "Honeypot",
    desc: "Next Lecture against you heals instead of hurting.",
    influence: 2,
  },
  {
    id: "shell_corp",
    name: "Shell Corp",
    desc: "Gain Influence and a small gold drip.",
    influence: 0,
  },
  {
    id: "astroturf",
    name: "Astroturf",
    desc: "Ally shade strikes twice this round if present.",
    influence: 1,
  },
  {
    id: "dead_drop",
    name: "Dead Drop",
    desc: "Restore a little MP; draw flavor (gain Influence).",
    influence: 1,
  },
  {
    id: "false_flag",
    name: "False Flag",
    desc: "Confuse a foe — they may hit themselves.",
    influence: 2,
  },
  {
    id: "soft_power",
    name: "Soft Power",
    desc: "Heal self; raise Resistance flavor (DEF buff).",
    influence: 1,
    mp: 2,
  },
  {
    id: "ledger_wipe",
    name: "Ledger Wipe",
    desc: "Heavy smash vs Capital/bloodline bosses.",
    influence: 3,
    mp: 5,
  },
];

export const MAX_HAND = 5;
export const MAX_INFLUENCE = 6;
export const START_INFLUENCE = 3;

/** Factions → original conspiracy alignments (lore flavor only). */
export function alignmentFor(def: EnemyDef): ConspiracyAlignment {
  if (def.faction === "bloodline" || def.faction === "final") return "Capital";
  if (def.media) return "Media";
  if (def.faction === "right") {
    if (def.id.includes("faith") || def.id.includes("crusader") || def.id.includes("collins")) return "Faith";
    return "Order";
  }
  if (def.faction === "left") {
    if (def.id.includes("justice") || def.id.includes("progressive") || def.id.includes("activist")) return "Justice";
    return "Chaos";
  }
  if (def.faction === "system") return def.media || def.lecture ? "Media" : "Order";
  return "Order";
}

export function groupCardFromEnemy(def: EnemyDef): GroupCardDef {
  return {
    id: `group_${def.id}`,
    enemyId: def.id,
    name: def.name,
    alignment: alignmentFor(def),
    power: Math.max(1, Math.round(def.atk * 0.9)),
    resistance: Math.max(1, Math.round(def.def * 0.85 + (def.kind === "boss" || def.kind === "final" ? 4 : 0))),
    income: Math.max(1, Math.round(def.gold / 8)),
    kind: def.kind,
    faction: def.faction,
  };
}

/** All group cards derived from EnemyDefs. */

/** Chart corps / nations / societies as summonable Group shades (lore plaques, not SJG). */
export const EXTRA_NWO_GROUPS: GroupCardDef[] = [
  { id: "group_nwo_federal_reserve", enemyId: "fed_golem", name: "Federal Reserve", alignment: "Capital", power: 14, resistance: 16, income: 8, kind: "regular", faction: "system" },
  { id: "group_nwo_world_bank", enemyId: "imf_auditor", name: "World Bank", alignment: "Capital", power: 13, resistance: 14, income: 7, kind: "regular", faction: "system" },
  { id: "group_nwo_bis", enemyId: "bis_ledger_wraith", name: "BIS", alignment: "Capital", power: 13, resistance: 15, income: 7, kind: "regular", faction: "bloodline" },
  { id: "group_nwo_bilderberg", enemyId: "cfr_handler", name: "Bilderbergers", alignment: "Order", power: 15, resistance: 14, income: 6, kind: "regular", faction: "system" },
  { id: "group_nwo_cfr", enemyId: "cfr_handler", name: "CFR", alignment: "Order", power: 14, resistance: 13, income: 5, kind: "regular", faction: "system" },
  { id: "group_nwo_trilateral", enemyId: "trilateral_envoy", name: "Trilateral Commission", alignment: "Order", power: 13, resistance: 13, income: 5, kind: "regular", faction: "system" },
  { id: "group_nwo_skull_bones", enemyId: "skull_bones_initiate", name: "Skull & Bones", alignment: "Faith", power: 12, resistance: 12, income: 4, kind: "regular", faction: "system" },
  { id: "group_nwo_bohemian", enemyId: "bohemian_grove_mask", name: "Bohemian Club", alignment: "Chaos", power: 11, resistance: 12, income: 4, kind: "regular", faction: "system" },
  { id: "group_nwo_freemasonry", enemyId: "skull_bones_initiate", name: "Freemasonry", alignment: "Faith", power: 12, resistance: 13, income: 4, kind: "regular", faction: "system" },
  { id: "group_nwo_cia", enemyId: "cia_shade", name: "CIA", alignment: "Order", power: 14, resistance: 11, income: 3, kind: "regular", faction: "system" },
  { id: "group_nwo_mossad", enemyId: "mossad_cipher", name: "MOSSAD", alignment: "Order", power: 13, resistance: 11, income: 3, kind: "regular", faction: "system" },
  { id: "group_nwo_mi5", enemyId: "cia_shade", name: "MI-5", alignment: "Order", power: 12, resistance: 12, income: 3, kind: "regular", faction: "system" },
  { id: "group_nwo_media_est", enemyId: "media_establishment_anchor", name: "Media Establishment", alignment: "Media", power: 12, resistance: 12, income: 5, kind: "regular", faction: "system" },
  { id: "group_nwo_news_corp", enemyId: "media_establishment_anchor", name: "News Corp Shade", alignment: "Media", power: 11, resistance: 10, income: 5, kind: "regular", faction: "system" },
  { id: "group_nwo_exxon", enemyId: "oil_cartel_knight", name: "Exxon-Mobil", alignment: "Capital", power: 15, resistance: 14, income: 8, kind: "regular", faction: "bloodline" },
  { id: "group_nwo_pfizer", enemyId: "pharma_hydra_rep", name: "Pharma Cartel", alignment: "Capital", power: 14, resistance: 13, income: 7, kind: "regular", faction: "system" },
  { id: "group_nwo_blackstone", enemyId: "fed_golem", name: "Blackstone", alignment: "Capital", power: 13, resistance: 12, income: 7, kind: "regular", faction: "system" },
  { id: "group_nwo_tavistock", enemyId: "unesco_softpower", name: "Tavistock", alignment: "Chaos", power: 11, resistance: 12, income: 3, kind: "regular", faction: "left" },
  { id: "group_nwo_nation_america", enemyId: "culture_war_captain", name: "Foundation: America", alignment: "Order", power: 10, resistance: 12, income: 4, kind: "regular", faction: "system" },
  { id: "group_nwo_nation_england", enemyId: "culture_war_captain", name: "Foundation: England", alignment: "Order", power: 10, resistance: 12, income: 4, kind: "regular", faction: "system" },
  { id: "group_nwo_nation_israel", enemyId: "mossad_cipher", name: "Foundation: Israel", alignment: "Order", power: 11, resistance: 11, income: 4, kind: "regular", faction: "system" },
  { id: "group_nwo_nation_china", enemyId: "li_emperor", name: "Foundation: China", alignment: "Capital", power: 12, resistance: 13, income: 5, kind: "boss", faction: "bloodline" },
  { id: "group_nwo_nation_australia", enemyId: "culture_war_captain", name: "Foundation: Australia", alignment: "Order", power: 9, resistance: 11, income: 3, kind: "regular", faction: "system" },
];


export const GROUP_CARDS: Record<string, GroupCardDef> = Object.fromEntries([
  ...Object.values(ENEMIES).map((e) => {
    const g = groupCardFromEnemy(e);
    return [g.id, g] as const;
  }),
  ...EXTRA_NWO_GROUPS.map((g) => [g.id, g] as const),
]);

export const SPECIAL_BY_ID: Record<SpecialEffectId, SpecialCardDef> = Object.fromEntries(
  SPECIAL_CARDS.map((s) => [s.id, s]),
) as Record<SpecialEffectId, SpecialCardDef>;

/** Groups unlocked at new game so Summon is usable early. */
export const STARTER_GROUP_IDS: string[] = [
  "group_echo_chamber_slime",
  "group_faith_first_crusader",
  "group_loyal_liberal_mage",
];

/** Specials in the starting deck. */
export const STARTER_SPECIAL_IDS: SpecialEffectId[] = [
  "bribe",
  "assassinate",
  "media_blackout",
  "pyramid_scheme",
  "leak",
  "shell_corp",
  "dead_drop",
];

export function controlChance(power: number, resistance: number, bribeBonus = 0): number {
  const raw = 0.28 + power * 0.03 - resistance * 0.025 + bribeBonus;
  return Math.max(0.08, Math.min(0.85, raw));
}

export function destroyBonusMult(hpRatio: number, isShadeTarget: boolean): number {
  let m = 1.15;
  if (hpRatio <= 0.25) m += 0.85;
  else if (hpRatio <= 0.4) m += 0.35;
  if (isShadeTarget) m += 0.5;
  return m;
}

export function summonStats(group: GroupCardDef): { atk: number; turns: number; label: string } {
  const scale = group.kind === "boss" || group.kind === "final" ? 0.45 : group.kind === "miniboss" ? 0.55 : 0.7;
  return {
    atk: Math.max(4, Math.floor(group.power * scale)),
    turns: group.kind === "regular" ? 3 : 2,
    label: `${group.name} Shade`,
  };
}

export type HandCard =
  | { kind: "special"; id: SpecialEffectId }
  | { kind: "group"; id: string };

export function buildDeck(unlockedGroupIds: string[]): HandCard[] {
  const groups = unlockedGroupIds
    .filter((id) => GROUP_CARDS[id])
    .map((id) => ({ kind: "group" as const, id }));
  const specials = STARTER_SPECIAL_IDS.map((id) => ({ kind: "special" as const, id }));
  // Late unlocks add more specials by progress count
  const extra: SpecialEffectId[] = [];
  if (unlockedGroupIds.length >= 6) extra.push("market_crash", "double_agent");
  if (unlockedGroupIds.length >= 10) extra.push("false_flag", "soft_power");
  if (unlockedGroupIds.length >= 14) extra.push("ledger_wipe", "honeypot", "astroturf");
  for (const id of extra) {
    if (!specials.some((s) => s.id === id)) specials.push({ kind: "special", id });
  }
  return [...specials, ...groups];
}

/** Draw up to MAX_HAND unique cards from deck (shuffle copy). */
export function drawHand(deck: HandCard[], n = MAX_HAND): HandCard[] {
  const pool = [...deck];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const hand: HandCard[] = [];
  const seen = new Set<string>();
  for (const c of pool) {
    const key = `${c.kind}:${c.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hand.push(c);
    if (hand.length >= n) break;
  }
  return hand;
}

export function handLabel(card: HandCard): string {
  if (card.kind === "special") {
    const s = SPECIAL_BY_ID[card.id];
    return s ? `${s.name} (${s.influence}INF)` : card.id;
  }
  const g = GROUP_CARDS[card.id];
  return g ? `Summon ${g.name.slice(0, 12)}` : card.id;
}

export function handDesc(card: HandCard): string {
  if (card.kind === "special") return SPECIAL_BY_ID[card.id]?.desc ?? "";
  const g = GROUP_CARDS[card.id];
  if (!g) return "";
  return `${g.alignment} P${g.power}/R${g.resistance} Inc${g.income} — ally shade 2–3 turns.`;
}

export const CONSPIRE_HOWTO =
  "CONSPIRE: Control flips foes to ally shades · Neutralize stuns · Destroy executes low HP. Summon spends a Group card. Influence (INF) fuels plots.";

/** Enemy AI may spend a turn on a simple counter-plot. */
export type EnemyPlotId = "network_jam" | "smear" | "counter_bribe";

export function rollEnemyPlot(kind: EnemyDef["kind"]): EnemyPlotId | null {
  const p = kind === "boss" || kind === "final" ? 0.22 : kind === "miniboss" ? 0.16 : 0.08;
  if (Math.random() >= p) return null;
  const picks: EnemyPlotId[] = ["network_jam", "smear", "counter_bribe"];
  return picks[Math.floor(Math.random() * picks.length)]!;
}

export function enemyPlotLine(name: string, plot: EnemyPlotId): string {
  if (plot === "network_jam") return `${name} jams your network (−1 Influence).`;
  if (plot === "smear") return `${name} runs a smear — you feel exposed.`;
  return `${name} counter-bribes the room. Gold dips.`;
}
