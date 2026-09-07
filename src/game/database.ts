import type { BossMeta, EnemyDef, ItemDef, SkillDef } from "./types";
import { ENEMY_PORTRAIT } from "./art";

export const TITLE = "BAKI THE HAMMER";
export const SUBTITLE = "Bloodlines of the Divide";

export const SKILLS: SkillDef[] = [
  {
    id: "hammer_clarity",
    name: "Hammer of Clarity",
    mp: 8,
    desc: "Smash + strip enemy buffs.",
  },
  {
    id: "mute_counter",
    name: "Mute Button Counter",
    mp: 6,
    desc: "Counter the next Lecture.",
  },
  {
    id: "independent",
    name: "Independent Stance",
    mp: 10,
    desc: "Immune to Re-Educate, 3 turns.",
  },
  {
    id: "fact_check",
    name: "Fact Check Smash",
    mp: 12,
    desc: "Bonus damage vs media/echo.",
  },
];

export const ITEMS: ItemDef[] = [
  { id: "potion", name: "Potion", desc: "Restore 50 HP." },
  { id: "ether", name: "Ether", desc: "Restore 20 MP." },
  { id: "neutralizer", name: "Neutralizer", desc: "Cure Re-Educate." },
];

export const BOSSES: BossMeta[] = [
  { id: "rothschild_archon", order: 1, title: "Rothschild Archon of Coin", location: "Vault of Interest" },
  { id: "rockefeller_titan", order: 2, title: "Rockefeller Oil Titan", location: "Refinery Depths" },
  { id: "astor_phantom", order: 3, title: "Astor Real Estate Phantom", location: "Rent Spire" },
  { id: "bundy_warlock", order: 4, title: "Bundy Ranch Warlock", location: "Barbed Plains" },
  { id: "collins_necromancer", order: 5, title: "Collins Cathedral Necromancer", location: "Stained Crypt" },
  { id: "dupont_alchemist", order: 6, title: "DuPont Chemical Alchemist", location: "Toxic Laboratory" },
  { id: "freeman_hypnotist", order: 7, title: "Freeman Media Hypnotist", location: "Broadcast Spire" },
  { id: "kennedy_paladin", order: 8, title: "Kennedy Dynasty Paladin", location: "Dynasty Harbor" },
  { id: "li_emperor", order: 9, title: "Li Dragon Finance Emperor", location: "Jade Ledger" },
  { id: "onassis_hydra", order: 10, title: "Onassis Shipping Hydra", location: "Storm Docks" },
  { id: "reynolds_demon", order: 11, title: "Reynolds Smoke Demon", location: "Lobby Haze" },
  { id: "russell_sentinel", order: 12, title: "Russell Watchtower Sentinel", location: "Clock Citadel" },
  { id: "vanduyn_diplomat", order: 13, title: "Van Duyn Serpent Diplomat", location: "Handshake Vault" },
  { id: "merovingian_king", order: 14, title: "Merovingian Serpent King", location: "Thirteen Thrones" },
];

const REGULAR: EnemyDef[] = [
  {
    id: "faith_first_crusader",
    name: "Faith-First Crusader",
    faction: "right",
    kind: "regular",
    hp: 52, mp: 8, atk: 14, def: 10, spd: 10, xp: 22, gold: 14,
    sprite: "enemy-crusader", lecture: true,
    intro: "A crusader bars the road. 'Faith first, hammer.'",
    actions: ["attack", "lecture"],
  },
  {
    id: "no_apologies_brawler",
    name: "No-Apologies Propagandist",
    faction: "right",
    kind: "regular",
    hp: 64, mp: 0, atk: 16, def: 8, spd: 12, xp: 24, gold: 12,
    sprite: "enemy-brawler",
    intro: "A megaphone brawler cracks his gloves. No speech. Just swing.",
    actions: ["attack", "buff"],
  },
  {
    id: "pragmatic_polite",
    name: "MAGA Knight",
    faction: "right",
    kind: "regular",
    hp: 48, mp: 12, atk: 12, def: 12, spd: 13, xp: 20, gold: 16,
    sprite: "enemy-knight", lecture: true,
    intro: "A crimson knight salutes. 'Surely we can agree—'",
    actions: ["attack", "lecture", "buff"],
  },
  {
    id: "unconventional_rogue",
    name: "Internet Sheep",
    faction: "right",
    kind: "regular",
    hp: 44, mp: 6, atk: 15, def: 7, spd: 16, xp: 23, gold: 18,
    sprite: "enemy-sheep",
    intro: "A masked troll flicks a scroll. 'RIGHT?!'",
    actions: ["attack", "buff"],
  },
  {
    id: "loyal_liberal_mage",
    name: "Loyal Liberal Mage",
    faction: "left",
    kind: "regular",
    hp: 46, mp: 22, atk: 13, def: 8, spd: 12, xp: 22, gold: 14,
    sprite: "enemy-mage", lecture: true,
    intro: "A blue-robe mage raises a hashtag staff. 'Unlearn, comrade.'",
    actions: ["attack", "lecture"],
  },
  {
    id: "leftward_progressive",
    name: "Justice Activist",
    faction: "left",
    kind: "regular",
    hp: 50, mp: 16, atk: 12, def: 9, spd: 14, xp: 21, gold: 15,
    sprite: "enemy-activist", lecture: true,
    intro: "An activist megaphone blares. JUSTICE. EQUITY. NOW.",
    actions: ["attack", "lecture", "buff"],
  },
  {
    id: "order_opportunity",
    name: "Corporate Slave",
    faction: "left",
    kind: "regular",
    hp: 58, mp: 10, atk: 13, def: 11, spd: 11, xp: 23, gold: 16,
    sprite: "enemy-corporate",
    intro: "A suited clerk hefts an axe and a calculator.",
    actions: ["attack", "buff"],
  },
  {
    id: "left_out_berserker",
    name: "SJW Berserker",
    faction: "left",
    kind: "regular",
    hp: 70, mp: 0, atk: 17, def: 6, spd: 9, xp: 25, gold: 12,
    sprite: "enemy-berserker",
    intro: "A hooded berserker howls INEQUALITY, then charges.",
    actions: ["attack"],
  },
  {
    id: "tuned_out_middle",
    name: "Sheeple",
    faction: "system",
    kind: "regular",
    hp: 40, mp: 4, atk: 10, def: 8, spd: 8, xp: 16, gold: 10,
    sprite: "enemy-sheeple",
    intro: "A gray hoodie shrugs so hard it becomes a weapon.",
    actions: ["attack"],
  },
  {
    id: "culture_war_captain",
    name: "Culture War Captain",
    faction: "system",
    kind: "regular",
    hp: 62, mp: 12, atk: 15, def: 10, spd: 12, xp: 26, gold: 18,
    sprite: "enemy-captain", lecture: true, media: true,
    intro: "A split-tabard captain raises red fire and blue fire.",
    actions: ["attack", "lecture", "buff"],
  },
  {
    id: "cable_news_puppet",
    name: "Cable News Puppet",
    faction: "system",
    kind: "regular",
    hp: 55, mp: 18, atk: 13, def: 9, spd: 11, xp: 24, gold: 20,
    sprite: "enemy-puppet", lecture: true, media: true,
    intro: "A camera-headed puppet rolls a chyron like a whip.",
    actions: ["attack", "lecture"],
  },
  {
    id: "echo_chamber_slime",
    name: "Echo Chamber Slime",
    faction: "system",
    kind: "regular",
    hp: 48, mp: 10, atk: 12, def: 14, spd: 7, xp: 20, gold: 14,
    sprite: "enemy-slime", media: true, lecture: true,
    intro: "The slime repeats your last sentence until it hurts.",
    actions: ["attack", "lecture", "buff"],
  },
];

const MINIBOSS: EnemyDef[] = [
  {
    id: "reeducation_instructor",
    name: "Re-Education Instructor",
    faction: "system",
    kind: "miniboss",
    hp: 165, mp: 30, atk: 18, def: 12, spd: 13, xp: 70, gold: 60,
    sprite: "enemy-instructor", canReeducate: true, lecture: true, media: true,
    intro: "The Instructor grins behind a chalkboard shield. LEARN. OBEY. CONFORM.",
    actions: ["attack", "lecture", "special"],
    specialName: "Re-Educate",
  },
];

function boss(
  id: string,
  name: string,
  hp: number,
  atk: number,
  def: number,
  spd: number,
  sprite: string,
  tint: number | undefined,
  intro: string,
  extra: Partial<EnemyDef> = {},
): EnemyDef {
  return {
    id,
    name,
    faction: extra.faction ?? "bloodline",
    kind: extra.kind ?? "boss",
    hp, mp: 40, atk, def, spd,
    xp: 90 + Math.floor(hp / 6),
    gold: 80 + Math.floor(hp / 8),
    sprite,
    tint,
    scale: extra.scale ?? 0.92,
    intro,
    actions: extra.actions ?? ["attack", "buff", "special"],
    specialName: extra.specialName ?? "Bloodline Edict",
    lecture: extra.lecture,
    media: extra.media,
    canReeducate: extra.canReeducate,
  };
}

const BOSS_ENEMIES: EnemyDef[] = [
  boss("rothschild_archon", "Rothschild Archon of Coin", 210, 20, 14, 12, "boss-rothschild", undefined,
    "Interest compounds. The Archon opens a ledger of your debts.",
    { specialName: "Compound Interest", actions: ["attack", "buff", "special"] }),
  boss("rockefeller_titan", "Rockefeller Oil Titan", 230, 22, 16, 10, "boss-rockefeller", undefined,
    "The Titan drips black gold. The air tastes like a refinery.",
    { specialName: "Gusher", scale: 0.98 }),
  boss("astor_phantom", "Astor Real Estate Phantom", 220, 19, 18, 14, "boss-astor", undefined,
    "A translucent landlord floats above a rent ledger. PAST DUE.",
    { specialName: "Eviction Notice", lecture: true }),
  boss("bundy_warlock", "Bundy Ranch Warlock", 240, 23, 13, 11, "boss-bundy", undefined,
    "Barbed wire sings. The Warlock plants a skull-staff in the dust.",
    { specialName: "Fence Line" }),
  boss("collins_necromancer", "Collins Cathedral Necromancer", 250, 21, 15, 12, "boss-collins", undefined,
    "Stained-glass wings unfurl. Hymns run backwards.",
    { specialName: "Bell Toll", lecture: true, scale: 0.96 }),
  boss("dupont_alchemist", "DuPont Chemical Alchemist", 255, 22, 14, 13, "boss-dupont", undefined,
    "The lab hums. Colors that should not exist drip from flasks.",
    { specialName: "Miracle Fiber" }),
  boss("freeman_hypnotist", "Radio Propagandist", 260, 20, 13, 16, "boss-freeman", undefined,
    "A spiral-eyed hypnotist lifts a tower-crown. Your thoughts arrive pre-written.",
    { specialName: "Prime Time", lecture: true, media: true, canReeducate: true }),
  boss("kennedy_paladin", "Kennedy Dynasty Paladin", 275, 24, 16, 14, "boss-kennedy", undefined,
    "A shining paladin salutes from a harbor of yachts.",
    { specialName: "Camelot Charge" }),
  boss("li_emperor", "Li Dragon Finance Emperor", 290, 23, 17, 15, "boss-li", undefined,
    "Jade coins orbit a dragon-sleeved emperor.",
    { specialName: "Ledger Coil", scale: 0.96 }),
  boss("onassis_hydra", "Onassis Shipping Hydra", 300, 25, 15, 12, "boss-onassis", undefined,
    "Three hulls, one hunger. The docks flood with brine.",
    { specialName: "Embargo Tide", scale: 0.98 }),
  boss("reynolds_demon", "Lobbyist Smoke Demon", 310, 24, 14, 13, "boss-reynolds", undefined,
    "Lobby haze thickens into a grinning ash-demon with a branded briefcase.",
    { specialName: "Secondhand Hex", lecture: true }),
  boss("russell_sentinel", "Russell Watchtower Sentinel", 325, 22, 20, 11, "boss-russell", undefined,
    "A clock-faced sentinel ticks. Every second is evidence.",
    { specialName: "Surveillance Bell" }),
  boss("vanduyn_diplomat", "Van Duyn Serpent Diplomat", 340, 25, 18, 15, "boss-vanduyn", undefined,
    "A handshake becomes a coil. The diplomat smiles with too many teeth.",
    { specialName: "Treaty Fang", lecture: true, scale: 0.96 }),
  boss("merovingian_king", "Merovingian Serpent King", 520, 28, 20, 16, "boss-serpent", undefined,
    "Thirteen thrones, one occupant. The bloodline ends—or begins—here.",
    { kind: "final", faction: "final", specialName: "Crown of Divide",
      actions: ["attack", "lecture", "buff", "special"], lecture: true, canReeducate: true, scale: 1.02 }),
];

export const ENEMIES: Record<string, EnemyDef> = Object.fromEntries(
  [...REGULAR, ...MINIBOSS, ...BOSS_ENEMIES].map((e) => [
    e.id,
    { ...e, portrait: ENEMY_PORTRAIT[e.id] ?? e.portrait },
  ]),
);

export const ENCOUNTERS: Record<"right" | "left" | "system", string[]> = {
  right: ["faith_first_crusader", "no_apologies_brawler", "pragmatic_polite", "unconventional_rogue"],
  left: ["loyal_liberal_mage", "leftward_progressive", "order_opportunity", "left_out_berserker"],
  system: ["tuned_out_middle", "culture_war_captain", "cable_news_puppet", "echo_chamber_slime"],
};

export const DIALOGUE: Record<string, string[]> = {
  innkeeper: [
    "COMMON SENSE TAVERN.",
    "Stew. Beds. No slogans on the menu.",
    "Rest here and I'll patch you up. Progress is saved.",
  ],
  left_recruiter: [
    "LEFT RECRUITER: The Hammer must smash hierarchy!",
    "BAKI: Hierarchies, mobs — both look like nails.",
    "LEFT RECRUITER: Neutrality is complicity!",
    "BAKI: So is a script. I write my own swings.",
  ],
  right_recruiter: [
    "RIGHT RECRUITER: Stand with the faithful, brother!",
    "BAKI: Faith is a tool. So is a hammer.",
    "RIGHT RECRUITER: Then swing for the righteous!",
    "BAKI: Righteousness isn't a team sport.",
  ],
  sign_red: ["RED DISTRICT — slogans to the east, sense to the west."],
  sign_blue: ["BLUE DISTRICT — lectures to the west, stew to the east."],
  sign_dungeon: ["THIRTEEN DOORS. Interest first. Crowns last."],
  gate_locked: ["The dungeon gate is sealed. Clear both districts first."],
  gate_open: ["The gold lock clicks. Bloodlines wait below."],
  intro: [
    "The Divide split the land into Red and Blue.",
    "Both sides hunt the unaligned.",
    "You are BAKI THE HAMMER — true neutral.",
    "Clear the districts. Break thirteen bloodlines.",
    "Do not be Re-Educated.",
  ],
  red_enter: ["Crimson banners snap. Every smile is a recruitment."],
  blue_enter: ["Blue lanterns hum. Every question is a quiz."],
  dungeon_enter: ["Vault air. Coin-scent. The first bloodline stirs."],
  after_rothschild: [
    "The Archon of Coin falls. Interest stops compounding.",
    "Twelve doors remain. The Divide notices you.",
  ],
  after_vanduyn: [
    "The Serpent Diplomat sheds its handshake.",
    "Thirteen doors are ash. One crown remains.",
    "Walk the gold doors in the throne approach.",
  ],
  after_boss: [
    "A bloodline seal cracks. The ledger updates.",
    "Progress is saved. The next door hums.",
  ],
  ending: [
    "The Serpent King splits down the middle —",
    "red scale, blue scale, neither catching the crown.",
    "Baki plants the hammer in the cracked floor.",
    "'I am not your symbol.'",
    "The Divide goes quiet. For now.",
  ],
  ending_armed: [
    "Iron hammer. True-Neutral materia.",
    "You walked in prepared — and left unclaimed.",
  ],
  ending_bare: [
    "No fancy gear. Just a hammer and a refusal.",
    "Sometimes that is enough.",
  ],
  ending_credits: [
    "BAKI THE HAMMER",
    "Bloodlines of the Divide",
    "Districts cleared. Bloodlines broken.",
    "CONTINUE returns you to the Hub.",
    "Thanks for swinging true.",
  ],
  forum_red: ["A forum of torches. The Instructor waits if you've proven yourself."],
  forum_blue: ["A lecture pit. The Instructor grades anyone still standing."],
};

export function pickEncounter(table: "right" | "left" | "system"): string {
  const list = ENCOUNTERS[table];
  return list[Math.floor(Math.random() * list.length)]!;
}

export function nextBossId(defeated: string[]): string | null {
  for (const b of BOSSES) {
    if (!defeated.includes(b.id)) return b.id;
  }
  return null;
}
