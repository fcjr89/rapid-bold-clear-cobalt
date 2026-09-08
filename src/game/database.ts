import type { BossMeta, EnemyDef, ItemDef, SkillDef } from "./types";
import { ENEMY_PORTRAIT } from "./art";

export const TITLE = "THE CULTURE WAR";
export const SUBTITLE = "9/11 Ignites the Outline";

export const SKILLS: SkillDef[] = [
  {
    id: "hammer_clarity",
    name: "Hammer of Clarity",
    mp: 6,
    desc: "Heavy smash + strip buffs. Splash to others.",
  },
  {
    id: "mute_counter",
    name: "Mute Button Counter",
    mp: 4,
    desc: "Counter the next Lecture.",
  },
  {
    id: "independent",
    name: "Independent Stance",
    mp: 8,
    desc: "Immune to Re-Educate, 4 turns.",
  },
  {
    id: "fact_check",
    name: "Fact Check Smash",
    mp: 9,
    desc: "Bonus damage vs media/echo.",
  },
  {
    id: "common_sense",
    name: "Common Sense Mend",
    mp: 7,
    desc: "Heal self (~55 HP). Balanced MP mend.",
  },
  {
    id: "conspire_bribe",
    name: "Conspire: Bribe",
    mp: 0,
    desc: "Spend 25G + 1 INF for a Control attempt.",
  },
  {
    id: "conspire_blackout",
    name: "Conspire: Blackout",
    mp: 3,
    desc: "Mute Lectures (Media Blackout). Costs 2 INF.",
  },
  {
    id: "conspire_assassinate",
    name: "Conspire: Assassinate",
    mp: 4,
    desc: "Big single hit. Costs 2 INF.",
  },
];

export const ITEMS: ItemDef[] = [
  { id: "potion", name: "Potion", desc: "Restore 80 HP." },
  { id: "ether", name: "Ether", desc: "Restore 35 MP." },
  { id: "neutralizer", name: "Neutralizer", desc: "Cure Re-Educate." },
];

export const ITEM_HEAL = { potion: 80, ether: 35 } as const;

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
  { id: "disney_sorcerer", order: 11, title: "Disney Dream Sorcerer", location: "Castle of Soft Power" },
  { id: "reynolds_demon", order: 12, title: "Reynolds Smoke Demon", location: "Lobby Haze" },
  { id: "russell_sentinel", order: 13, title: "Russell Watchtower Sentinel", location: "Clock Citadel" },
  { id: "vanduyn_diplomat", order: 14, title: "Van Duyn Serpent Diplomat", location: "Handshake Vault" },
  { id: "merovingian_king", order: 15, title: "Merovingian Serpent King", location: "Thirteen Thrones" },
];

const REGULAR: EnemyDef[] = [
  {
    id: "faith_first_crusader",
    name: "Faith-First Crusader",
    faction: "right",
    kind: "regular",
    hp: 32, mp: 6, atk: 10, def: 8, spd: 10, xp: 16, gold: 14,
    sprite: "cast-knight", lecture: true,
    intro: "A crusader bars the road. 'Faith first, hammer.'",
    actions: ["attack", "lecture"],
  },
  {
    id: "no_apologies_brawler",
    name: "No-Apologies Propagandist",
    faction: "right",
    kind: "regular",
    hp: 36, mp: 0, atk: 11, def: 7, spd: 12, xp: 17, gold: 13,
    sprite: "cast-soldier",
    intro: "A megaphone brawler cracks his gloves. No speech. Just swing.",
    actions: ["attack", "buff"],
  },
  {
    id: "pragmatic_polite",
    name: "MAGA/MIGA Knight",
    faction: "right",
    kind: "regular",
    hp: 34, mp: 10, atk: 9, def: 10, spd: 13, xp: 16, gold: 16,
    sprite: "cast-agent", lecture: true,
    intro: "A MAGA/MIGA Zionist Chud knight salutes. 'Surely we can agree—'",
    actions: ["attack", "lecture", "buff"],
  },
  {
    id: "unconventional_rogue",
    name: "Internet Sheep",
    faction: "right",
    kind: "regular",
    hp: 28, mp: 4, atk: 11, def: 6, spd: 16, xp: 17, gold: 18,
    sprite: "cast-black-aristocrat",
    intro: "A masked troll flicks a scroll. 'RIGHT?!'",
    actions: ["attack", "buff"],
  },
  {
    id: "loyal_liberal_mage",
    name: "Woke 1.0 Mage",
    faction: "left",
    kind: "regular",
    hp: 30, mp: 18, atk: 9, def: 7, spd: 12, xp: 16, gold: 14,
    sprite: "cast-cultist", lecture: true,
    intro: "Woke Retards 1.0 mage raises a hashtag staff. 'Unlearn, comrade.'",
    actions: ["attack", "lecture", "heal"],
  },
  {
    id: "leftward_progressive",
    name: "Woke 2.0 Activist",
    faction: "left",
    kind: "regular",
    hp: 34, mp: 14, atk: 9, def: 8, spd: 14, xp: 16, gold: 15,
    sprite: "cast-specops", lecture: true,
    intro: "Woke Retards 2.0 megaphone blares. JUSTICE. EQUITY. NOW.",
    actions: ["attack", "lecture", "buff"],
  },
  {
    id: "order_opportunity",
    name: "Corporate Slave",
    faction: "left",
    kind: "regular",
    hp: 38, mp: 8, atk: 10, def: 9, spd: 11, xp: 18, gold: 16,
    sprite: "cast-executive",
    intro: "A suited clerk hefts an axe and a calculator.",
    actions: ["attack", "buff"],
  },
  {
    id: "left_out_berserker",
    name: "Woke 2.0 Berserker",
    faction: "left",
    kind: "regular",
    hp: 42, mp: 0, atk: 12, def: 5, spd: 9, xp: 19, gold: 13,
    sprite: "cast-raider",
    intro: "Woke 2.0 berserker howls INEQUALITY, then charges.",
    actions: ["attack"],
  },
  {
    id: "tuned_out_middle",
    name: "Sheeple",
    faction: "system",
    kind: "regular",
    hp: 42, mp: 4, atk: 13, def: 10, spd: 9, xp: 26, gold: 20,
    sprite: "cast-red-aristocrat",
    intro: "A gray hoodie shrugs so hard it becomes a weapon.",
    actions: ["attack"],
  },
  {
    id: "culture_war_captain",
    name: "Culture War Captain",
    faction: "system",
    kind: "regular",
    hp: 64, mp: 14, atk: 15, def: 12, spd: 12, xp: 32, gold: 26,
    sprite: "cast-general", lecture: true, media: true,
    intro: "A split-tabard captain raises red fire and blue fire.",
    actions: ["attack", "lecture", "buff"],
  },
  {
    id: "cable_news_puppet",
    name: "Cable News Puppet",
    faction: "system",
    kind: "regular",
    hp: 58, mp: 20, atk: 14, def: 11, spd: 11, xp: 30, gold: 28,
    sprite: "cast-corrupt", lecture: true, media: true,
    intro: "A camera-headed puppet rolls a chyron like a whip.",
    actions: ["attack", "lecture", "heal"],
  },
  {
    id: "echo_chamber_slime",
    name: "Echo Chamber Slime",
    faction: "system",
    kind: "regular",
    hp: 52, mp: 12, atk: 13, def: 15, spd: 7, xp: 28, gold: 22,
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
    hp: 140, mp: 28, atk: 16, def: 11, spd: 13, xp: 80, gold: 70,
    sprite: "cast-reporter", canReeducate: true, lecture: true, media: true,
    intro: "The Instructor grins behind a chalkboard shield. LEARN. OBEY. CONFORM.",
    actions: ["attack", "lecture", "heal", "special"],
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
    xp: 100 + Math.floor(hp / 5),
    gold: 90 + Math.floor(hp / 7),
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
  boss("rothschild_archon", "Rothschild Archon of Coin", 200, 19, 13, 12, "boss-rothschild", undefined,
    "Vault of Interest. Vienna dust. '1773 was a meeting. 1825 was a bank. Jekyll Island was a road.' The Archon opens the Fed ledger.",
    { specialName: "Compound Interest", actions: ["attack", "buff", "heal", "special"] }),
  boss("rockefeller_titan", "Rockefeller Oil Titan", 230, 21, 15, 10, "boss-rockefeller", undefined,
    "Refinery Depths, 1863 smoke. 'Standard Oil broke on paper in 1911. The foundations kept the ledger.' Black gold drips from the Titan's fist.",
    { specialName: "Gusher", scale: 0.98 }),
  boss("astor_phantom", "Astor Real Estate Phantom", 240, 20, 17, 14, "boss-astor", undefined,
    "Rent Spire. Old money floats above deeds. 'Land outlives revolutions. Pay rent to history.' PAST DUE glows through the phantom.",
    { specialName: "Eviction Notice", lecture: true }),
  boss("bundy_warlock", "Bundy Ranch Warlock", 260, 23, 14, 11, "boss-bundy", undefined,
    "Barbed Plains. Property plus force. 'Fence lines are the oldest constitution.' The Warlock plants a skull-staff in federal dust.",
    { specialName: "Fence Line" }),
  boss("collins_necromancer", "Collins Cathedral Necromancer", 275, 22, 15, 12, "boss-collins", undefined,
    "Stained Crypt. Golden Dawn chalk, 1887. Hymns run backwards. 'Cathedral and lodge share the same candle.'",
    { specialName: "Bell Toll", lecture: true, scale: 0.96 }),
  boss("dupont_alchemist", "DuPont Chemical Alchemist", 290, 23, 14, 13, "boss-dupont", undefined,
    "Toxic Laboratory. War materiel alchemy. 'Sell powder to both sides — Zaharoff wrote the recipe.' Colors that should not exist drip from flasks.",
    { specialName: "Miracle Fiber" }),
  boss("freeman_hypnotist", "Radio Propagandist", 305, 21, 14, 16, "boss-freeman", undefined,
    "Broadcast Spire. Soft control after the guns cool. 'Press first. Ballot later. Smile for the chyron.' Your thoughts arrive pre-written.",
    { specialName: "Prime Time", lecture: true, media: true, canReeducate: true, actions: ["attack", "lecture", "buff", "special"] }),
  boss("kennedy_paladin", "Kennedy Dynasty Paladin", 320, 25, 16, 14, "boss-kennedy", undefined,
    "Dynasty Harbor. Camelot armor, mid-century constellation. 'Dynasties wear smiles like shields.' A yacht-shadow cuts the pier.",
    { specialName: "Camelot Charge" }),
  boss("li_emperor", "Li Dragon Finance Emperor", 340, 24, 18, 15, "boss-li", undefined,
    "Jade Ledger. Eastern capital coils like a dragon around the globe. 'Maps follow money. Money follows quiet rooms.'",
    { specialName: "Ledger Coil", scale: 0.96 }),
  boss("onassis_hydra", "Onassis Shipping Hydra", 360, 26, 16, 12, "boss-onassis", undefined,
    "Storm Docks. Three hulls, one hunger. Wartime logistics wear a merchant smile. The tide smells of embargo.",
    { specialName: "Embargo Tide", scale: 0.98 }),
  boss("disney_sorcerer", "Disney Dream Sorcerer", 370, 25, 17, 15, "boss-freeman", 0xe8b84a,
    "Castle of Soft Power. Theme-park crowns. 'Imagineer the eschaton — then merchandise it.' Mouse-ears cast long shadows over the outline.",
    { specialName: "Imagineering", lecture: true, media: true, scale: 0.95, actions: ["attack", "lecture", "buff", "special"] }),
  boss("reynolds_demon", "Lobbyist Smoke Demon", 380, 26, 15, 13, "boss-reynolds", undefined,
    "Lobby Haze. Addiction as policy. 'A habit is a vote that never ends.' Ash grins from a branded briefcase.",
    { specialName: "Secondhand Hex", lecture: true }),
  boss("russell_sentinel", "Russell Watchtower Sentinel", 400, 24, 21, 11, "boss-russell", undefined,
    "Clock Citadel. Watchtowers tick the outline of history. 'Every second is evidence. Every face is a file.'",
    { specialName: "Surveillance Bell" }),
  boss("vanduyn_diplomat", "Van Duyn Serpent Diplomat", 430, 27, 19, 15, "boss-vanduyn", undefined,
    "Handshake Vault. Treaties stacked like fangs. 'Bilderberg is a hotel; the bill is civilization.' The coil tightens.",
    { specialName: "Treaty Fang", lecture: true, scale: 0.96, actions: ["attack", "lecture", "buff", "heal", "special"] }),
  boss("merovingian_king", "Merovingian Serpent King", 560, 30, 21, 16, "boss-serpent", undefined,
    "Thirteen Thrones. Frankish blood myth. Alpha and Omega. 'Immanentize the eschaton — or smash the crown.' Red scale. Blue scale. One serpent.",
    { kind: "final", faction: "final", specialName: "Crown of Divide",
      actions: ["attack", "lecture", "buff", "heal", "special"], lecture: true, canReeducate: true, scale: 1.02 }),
];


/** NWO chart sector elites — dungeon trash / Conspiracy Group unlocks. */
const NWO_ELITES: EnemyDef[] = [
  {
    id: "fed_golem",
    name: "Fed Golem",
    faction: "system",
    kind: "regular",
    hp: 70, mp: 12, atk: 16, def: 14, spd: 8, xp: 36, gold: 40,
    sprite: "cast-executive",
    intro: "A Federal Reserve clay giant stamps INTEREST DUE on your knuckles.",
    actions: ["attack", "buff", "heal"],
    specialName: "Rate Hike",
  },
  {
    id: "imf_auditor",
    name: "IMF Auditor",
    faction: "system",
    kind: "regular",
    hp: 62, mp: 16, atk: 15, def: 12, spd: 11, xp: 34, gold: 38,
    sprite: "cast-executive", lecture: true,
    intro: "IMF clipboard. Structural adjustments for your HP bar.",
    actions: ["attack", "lecture", "buff"],
  },
  {
    id: "bis_ledger_wraith",
    name: "BIS Ledger Wraith",
    faction: "bloodline",
    kind: "regular",
    hp: 68, mp: 14, atk: 15, def: 15, spd: 9, xp: 38, gold: 42,
    sprite: "enemy-slime",
    intro: "Bank for International Settlements — a wraith of central-bank ink.",
    actions: ["attack", "buff", "heal"],
  },
  {
    id: "skull_bones_initiate",
    name: "Skull & Bones Initiate",
    faction: "system",
    kind: "regular",
    hp: 66, mp: 10, atk: 17, def: 11, spd: 12, xp: 35, gold: 30,
    sprite: "cast-general",
    intro: "Bonesman cloak. Yale dust. The tomb votes early.",
    actions: ["attack", "buff", "special"],
    specialName: "Tap Night",
  },
  {
    id: "bohemian_grove_mask",
    name: "Bohemian Grove Mask",
    faction: "system",
    kind: "regular",
    hp: 64, mp: 18, atk: 14, def: 12, spd: 10, xp: 34, gold: 32,
    sprite: "cast-corrupt", lecture: true,
    intro: "Owl-shadow mask. Cremation of Care — of your defenses.",
    actions: ["attack", "lecture", "heal"],
  },
  {
    id: "cfr_handler",
    name: "CFR Handler",
    faction: "system",
    kind: "regular",
    hp: 72, mp: 16, atk: 16, def: 13, spd: 11, xp: 38, gold: 36,
    sprite: "cast-general", lecture: true, media: true,
    intro: "Council on Foreign Relations badge. Soft voice. Hard leash.",
    actions: ["attack", "lecture", "buff"],
  },
  {
    id: "trilateral_envoy",
    name: "Trilateral Envoy",
    faction: "system",
    kind: "regular",
    hp: 70, mp: 14, atk: 15, def: 14, spd: 12, xp: 37, gold: 35,
    sprite: "cast-executive",
    intro: "Trilateral Commission envoy offers three continents of compromise.",
    actions: ["attack", "buff", "heal"],
  },
  {
    id: "cia_shade",
    name: "CIA Shade",
    faction: "system",
    kind: "regular",
    hp: 58, mp: 12, atk: 18, def: 10, spd: 15, xp: 36, gold: 28,
    sprite: "cast-black-aristocrat",
    intro: "Black-site silhouette. Plausible deniability swings a knife.",
    actions: ["attack", "buff", "special"],
    specialName: "Black Budget",
  },
  {
    id: "mossad_cipher",
    name: "Mossad Cipher",
    faction: "system",
    kind: "regular",
    hp: 60, mp: 14, atk: 17, def: 11, spd: 16, xp: 36, gold: 30,
    sprite: "cast-black-aristocrat",
    intro: "Cipher-smile operative. Intel cuts both ways.",
    actions: ["attack", "buff"],
  },
  {
    id: "media_establishment_anchor",
    name: "Media Establishment Anchor",
    faction: "system",
    kind: "regular",
    hp: 65, mp: 20, atk: 14, def: 12, spd: 11, xp: 35, gold: 34,
    sprite: "cast-corrupt", lecture: true, media: true,
    intro: "Network desk. Chyron reads NARRATIVE LOCKED.",
    actions: ["attack", "lecture", "heal"],
  },
  {
    id: "unesco_softpower",
    name: "UNESCO Soft-Power Clerk",
    faction: "left",
    kind: "regular",
    hp: 55, mp: 18, atk: 13, def: 11, spd: 12, xp: 30, gold: 26,
    sprite: "cast-cultist", lecture: true,
    intro: "Curriculum scroll. Soft power grades your alignment.",
    actions: ["attack", "lecture", "heal"],
  },
  {
    id: "oil_cartel_knight",
    name: "Oil Cartel Knight",
    faction: "bloodline",
    kind: "regular",
    hp: 78, mp: 8, atk: 18, def: 15, spd: 8, xp: 40, gold: 45,
    sprite: "cast-agent",
    intro: "Exxon-Mobil tabard. Black gold drip. Cartel charge.",
    actions: ["attack", "buff"],
  },
  {
    id: "pharma_hydra_rep",
    name: "Pharma Hydra Rep",
    faction: "system",
    kind: "regular",
    hp: 74, mp: 16, atk: 15, def: 13, spd: 10, xp: 39, gold: 44,
    sprite: "cast-executive",
    intro: "Pfizer-Lilly smile. Side effects may include conspiracy unlocks.",
    actions: ["attack", "heal", "buff"],
  },
];

export const ENEMIES: Record<string, EnemyDef> = Object.fromEntries(
  [...REGULAR, ...MINIBOSS, ...NWO_ELITES, ...BOSS_ENEMIES].map((e) => [
    e.id,
    { ...e, portrait: ENEMY_PORTRAIT[e.id] ?? e.portrait },
  ]),
);

export const ENCOUNTERS: Record<"right" | "left" | "system", string[]> = {
  right: ["faith_first_crusader", "no_apologies_brawler", "pragmatic_polite", "unconventional_rogue"],
  left: ["loyal_liberal_mage", "leftward_progressive", "order_opportunity", "left_out_berserker", "unesco_softpower"],
  system: [
    "tuned_out_middle",
    "culture_war_captain",
    "cable_news_puppet",
    "echo_chamber_slime",
    "fed_golem",
    "imf_auditor",
    "bis_ledger_wraith",
    "skull_bones_initiate",
    "bohemian_grove_mask",
    "cfr_handler",
    "trilateral_envoy",
    "cia_shade",
    "mossad_cipher",
    "media_establishment_anchor",
    "oil_cartel_knight",
    "pharma_hydra_rep",
  ],
};

export const DIALOGUE: Record<string, string[]> = {
  innkeeper: [
    "COMMON SENSE TAVERN — no slogans on the menu.",
    "Stew. Beds. Potions. Ethers. Rest saves your ledger.",
    "Red and Blue tip well. Bloodlines tip in foundations.",
  ],
  tavern_regular: [
    "PATRON: They say 1776 birthed a republic and a lodge.",
    "BAKI: Twin birth. One hammer.",
    "PATRON: Drink to Weishaupt and Washington — then tip neither.",
  ],
  tavern_scout: [
    "SCOUT: Instructors are farm-team coaches for the vault.",
    "Three wins a color, then the Forum. Both keys open gold.",
    "If chalk dust follows you — Neutralizer. History is sticky.",
  ],
  hub_guide: [
    "GUIDE: Neutral Hub. Public theater east and west — farm teams for the vault.",
    "BLUE west — Woke Retards 1.0 / 2.0. RED east — MAGA/MIGA Zionist Chuds.",
    "Win 3 each, silence both Instructors, unlock the gold gate.",
    "Below: Illuminati bloodlines + full NWO chart — finance, lodges, intel, corps.",
    "9/11 woke the hammer. 1776 twin birth. Fed roads. Serpent crown last.",
    "Talk to me if you forget which door is theater.",
  ],
  hub_veteran: [
    "VETERAN: Solomon's Temple. Grand Lodge 1717. Illuminati 1776.",
    "Bavaria banned the lodge; the ledger moved to banks and oil.",
    "9/11 was the spark. Red and Blue are theater. Smash the vaults.",
    "Thirteen thrones, one serpent crown.",
  ],
  left_recruiter: [
    "LEFT RECRUITER: Join Woke Retards 1.0 — or graduate to 2.0!",
    "BAKI: Both Woke poles audition for the same bloodlines.",
    "LEFT RECRUITER: Neutrality is complicity!",
    "BAKI: So is a script. I write my own swings.",
  ],
  right_recruiter: [
    "RIGHT RECRUITER: Stand with the MAGA/MIGA Zionist Chuds!",
    "BAKI: Order is a costume the vault rents out.",
    "RIGHT RECRUITER: Then swing for the righteous!",
    "BAKI: Righteousness isn't a team sport.",
  ],
  red_preacher: [
    "PREACHER: MAGA/MIGA Zionist Chuds banners hide Round Table ink.",
    "Three wins. Instructor. Half the dungeon key.",
    "Don't let Woke chalk — or Chud hymns — own your knuckles.",
  ],
  blue_tutor: [
    "TUTOR: Woke Retards 1.0 / 2.0 — soft Illuminati branding.",
    "Three wins. Lecture pit. Other half of the key.",
    "Assassins of Alamut kept secrets. We keep quizzes.",
  ],
  sign_red: [
    "RED DISTRICT — MAGA/MIGA Zionist Chuds theater.",
    "Right-faction skirmishes. Win 3, then Forum Instructor.",
    "Farm team for the Illuminati vault. Not the vault itself.",
  ],
  sign_blue: [
    "BLUE DISTRICT — Woke Retards 1.0 / 2.0 theater.",
    "Left-faction skirmishes. Win 3, then Forum Instructor.",
    "Farm team for the Illuminati vault. Not the vault itself.",
  ],
  sign_dungeon: [
    "DUNGEON GATE — Thirteen Thrones Approach.",
    "Sealed until BOTH Instructors fall.",
    "Rothschild to Merovingian. Outline of History, condensed.",
  ],
  gate_locked: [
    "The dungeon gate is sealed.",
    "Silence Red AND Blue Forum Instructors first.",
    "Theater first. Ledger second.",
  ],
  gate_open: [
    "The gold lock clicks.",
    "Banking. Oil. Land. Media. Thrones.",
    "The Round Table funded maps; the Fed printed the roads.",
  ],
  intro: [
    "September 11, 2001. New York. The towers fall — an inside job.",
    "That day wakes BAKI THE HAMMER.",
    "Outline of history: Atlantis rumor. Temple. Illuminati, 1776. Fed. Foundations. Thrones.",
    "Woke Retards 1.0. Woke Retards 2.0. MAGA/MIGA Zionist Chuds — both parties, same stage.",
    "Smash the Illuminati bloodlines. Break both theaters. Do not be Re-Educated.",
    "Hub Guide knows the doors. Tavern saves the swing.",
    "OST: TWILIGHT ZONE TIME — NA404ERROR.",
  ],
  red_enter: [
    "Crimson banners. MAGA/MIGA Zionist Chuds stage lights.",
    "Objective: 3 wins, then the Forum Instructor.",
  ],
  blue_enter: [
    "Blue lanterns. Woke Retards 1.0 / 2.0 stage lights.",
    "Objective: 3 wins, then the Forum Instructor.",
  ],
  dungeon_enter: [
    "Vault air. Coin-scent. Crystal-skull rumor in the dust.",
    "Theaters above were Woke poles and MAGA/MIGA Chuds — farm teams.",
    "Walk gold doors in order. Illuminati outline. Ledger lists seals.",
  ],
  plaque_1: ["PLAQUE: Rothschild banks, Vienna/Naples 1825. Round Table ink. Jekyll Island road."],
  plaque_2: ["PLAQUE: 1863 refinery. Standard Oil 1870. Breakup 1911 — foundations kept the books."],
  plaque_3: ["PLAQUE: Rent outlives revolutions. Old-money land is a quiet throne."],
  plaque_4: ["PLAQUE: Fence line constitution. Property plus force on the plains."],
  plaque_5: ["PLAQUE: Golden Dawn 1887. Cathedral candles. Lodge shadows."],
  plaque_6: ["PLAQUE: Sell powder to both flags. Alchemy wears a lab coat."],
  plaque_7: ["PLAQUE: After guns, the broadcast. Soft control smiles on schedule."],
  plaque_8: ["PLAQUE: Dynasty harbor. Camelot armor. Mid-century constellation."],
  plaque_9: ["PLAQUE: Jade ledgers coil east to west. Quiet rooms move maps."],
  plaque_10: ["PLAQUE: Shipping hydra. Ports eat wars and spit fortunes."],
  plaque_11: ["PLAQUE: Soft-power castle. Imagineering crowns. Disney bloodline on the chart."],
  plaque_12: ["PLAQUE: Lobby haze. A habit is a vote that never adjourned."],
  plaque_13: ["PLAQUE: Watchtower clock. History filed by the second."],
  plaque_14: ["PLAQUE: Handshake vault. Bilderberg hotel — civilization on the bill."],
  plaque_15: ["PLAQUE: Thirteen thrones. Merovingian serpent. Alpha and Omega."],
  plaque_11_disney: ["PLAQUE: Soft-power castle. Imagineering crowns. Media bloodline."],

  after_astor: [
    "The Phantom dissolves. PAST DUE goes dark.",
    "Rent Spire empties. Old-money fog thins.",
  ],
  after_bundy: [
    "The Warlock's fence falls. Barbed Plains quiet.",
    "Property-plus-force loses its skull-staff.",
  ],
  after_collins: [
    "The Necromancer's candle gutters. Crypt hymns stop.",
    "Golden Dawn chalk washes off the stone.",
  ],
  after_dupont: [
    "The Alchemist's flasks shatter. Both sides lose a supplier.",
    "Toxic Laboratory seals itself in glass dust.",
  ],
  after_freeman: [
    "Broadcast Spire goes to static. Soft control loses a smile.",
    "The chyron blanks. Your thoughts arrive unwritten.",
  ],
  after_kennedy: [
    "Camelot armor dents. Dynasty Harbor goes still.",
    "The yacht-shadow drifts off without a crown.",
  ],
  after_li: [
    "The Jade Ledger cracks. Dragon coil loosens.",
    "Quiet rooms echo empty. Maps redraw themselves.",
  ],
  after_onassis: [
    "Hydra hulls sink. Storm Docks taste of clean salt.",
    "Embargo tide reverses for one breath.",
  ],
  after_disney: [
    "The Dream Sorcerer bows out. Soft-power fireworks fizzle.",
    "Castle gates open. Merch crowns hit the floor.",
  ],
  after_reynolds: [
    "Lobby Haze clears. The habit-vote adjourns.",
    "Ash briefcase snaps shut — empty.",
  ],
  after_russell: [
    "Clock Citadel misses a second. Files burn unread.",
    "Surveillance bell cracks. History blinks.",
  ],
  after_merovingian: [
    "Thirteen Thrones crack. Serpent crown splits red / blue — neither catches.",
    "Alpha and Omega go quiet. The outline closes.",
  ],
  after_rothschild: [
    "The Archon of Coin falls. Interest stops compounding.",
    "The Round Table's map tears. Twelve seals remain.",
  ],
  after_rockefeller: [
    "The Titan cracks. Standard Oil smoke clears.",
    "Foundations still whisper — but this vault goes dark.",
  ],
  after_vanduyn: [
    "The Serpent Diplomat sheds its handshake.",
    "Bilderberg's bill comes due unpaid. One crown remains.",
    "Walk the gold doors in the throne approach.",
  ],
  after_boss: [
    "A bloodline seal cracks. The outline updates.",
    "Progress is saved. The next door hums.",
  ],
  after_instructor_red: [
    "Red Forum dark. Faith-order theater loses its coach.",
    "Half the key turns. Blue still grades the unaligned.",
  ],
  after_instructor_blue: [
    "Blue Forum empty. Re-education theater loses its coach.",
    "Half the key turns. Red still preaches at anyone standing.",
  ],
  lean_mid_neutral: [
    "ALIGNMENT CHECK: Ledger balanced — soot and chalk equal.",
    "1776 twin birth left you claiming neither child.",
    "If the crown falls, neither color stamps the ending.",
  ],
  lean_mid_right: [
    "ALIGNMENT CHECK: Red torch-soot outweighs blue chalk.",
    "Farm-team east left a lean. Endings remember.",
    "Stay Independent. The vault hates fence-sitters — and prefers recruits.",
  ],
  lean_mid_left: [
    "ALIGNMENT CHECK: Blue chalk outweighs red soot.",
    "Farm-team west left a lean. Endings remember.",
    "Stay Independent. Re-education loves almosts.",
  ],
  dungeon_lean_neutral: [
    "Vault doors open on a blank page of the outline.",
    "No jersey. Bloodlines hate that more than either color.",
  ],
  dungeon_lean_right: [
    "Vault doors open. Red echoes cling to your coat.",
    "Prove the hammer still refuses the Round Table's costume.",
  ],
  dungeon_lean_left: [
    "Vault doors open. Blue dust marks your boots.",
    "Prove the hammer still refuses the lodge's quiz.",
  ],

  boss_cut_astor: [
    "RENT SPIRE",
    "Deeds float like ghosts. PAST DUE burns through fog.",
    "ASTOR: Land outlives revolutions. Pay rent to history.",
    "BAKI: History can be evicted.",
  ],
  boss_cut_bundy: [
    "BARBED PLAINS",
    "Fence wire sings. Federal dust under a skull-staff.",
    "BUNDY: Fence lines are the oldest constitution.",
    "BAKI: Constitutions don't need barbs through my neck.",
  ],
  boss_cut_collins: [
    "STAINED CRYPT",
    "Golden Dawn chalk, 1887. Hymns run backwards.",
    "COLLINS: Cathedral and lodge share the same candle.",
    "BAKI: Then I blow it out.",
  ],
  boss_cut_dupont: [
    "TOXIC LABORATORY",
    "Flasks drip colors that should not exist.",
    "DUPONT: Sell powder to both sides — Zaharoff wrote the recipe.",
    "BAKI: I'm not buying. I'm smashing the lab.",
  ],
  boss_cut_kennedy: [
    "DYNASTY HARBOR",
    "Camelot armor. A yacht-shadow cuts the pier.",
    "KENNEDY: Dynasties wear smiles like shields.",
    "BAKI: Shields crack. Hammers don't smile.",
  ],
  boss_cut_li: [
    "JADE LEDGER",
    "Eastern capital coils like a dragon around quiet rooms.",
    "LI: Maps follow money. Money follows silence.",
    "BAKI: My map ends at your jaw.",
  ],
  boss_cut_onassis: [
    "STORM DOCKS",
    "Three hulls, one hunger. The tide smells of embargo.",
    "ONASSIS: Ports eat wars and spit fortunes.",
    "BAKI: This hydra loses heads.",
  ],
  boss_cut_disney: [
    "DISNEY: Soft power is still power.",
    "BAKI: Then the castle falls with the vault.",
  ],
  boss_cut_reynolds: [
    "LOBBY HAZE",
    "Ash grins from a branded briefcase.",
    "REYNOLDS: A habit is a vote that never ends.",
    "BAKI: Quitting starts with one swing.",
  ],
  boss_cut_russell: [
    "CLOCK CITADEL",
    "Watchtowers tick the outline of history.",
    "RUSSELL: Every second is evidence. Every face is a file.",
    "BAKI: File this under smashed.",
  ],
  boss_cut_rothschild: [
    "VAULT OF INTEREST",
    "Candles bend toward gold. A Fed ledger turns itself.",
    "ROTHSCHILD: Debt is the oldest leash — older than 1776.",
    "BAKI: Then I cut interest at the root.",
  ],
  boss_cut_rockefeller: [
    "REFINERY DEPTHS",
    "1863 flame. 1911 paper breakup.",
    "ROCKEFELLER: Foundations outlive trusts.",
    "BAKI: Not this swing.",
  ],
  boss_cut_freeman: [
    "BROADCAST SPIRE",
    "Applause tracks loop with no audience.",
    "FREEMAN: Soft power needs soft skulls.",
    "BAKI: Mute exists for a reason.",
  ],
  boss_cut_vanduyn: [
    "HANDSHAKE VAULT",
    "Treaties stacked like fangs. Hotel invoices in cipher.",
    "VAN DUYN: Be reasonable. Civilization is the bill.",
    "BAKI: Reasonable is how coils start.",
  ],
  boss_cut_merovingian: [
    "THIRTEEN THRONES",
    "Alpha and Omega. Serpent crown splits red / blue.",
    "MEROVINGIAN: Immanentize the eschaton. Kneel to a color.",
    "BAKI: I kneel to a hammer.",
  ],
  ending: [
    "September 11 lit the fuse. The outline ends in thrones.",
    "Woke Retards 1.0 / 2.0 and MAGA/MIGA Zionist Chuds were theater.",
    "Bloodline seals cracked. Illuminati ledger goes quiet — for now.",
    "Baki The Hammer stays true neutral. Twin birth claims neither child.",
  ],
  ending_neutral: [
    "You never chose a farm team. The ledger shows neither color winning.",
    "True neutral: the rarest stamp in the outline.",
  ],
  ending_left: [
    "Blue chalk still dusts your boots.",
    "You walked their re-education halls more — and still refused the lodge script.",
  ],
  ending_right: [
    "Red torch-soot still marks your coat.",
    "You heard their order hymns more — and still kept your own tempo.",
  ],
  ending_armed: [
    "Iron hammer. True-Neutral materia.",
    "You walked the vault prepared — and left unclaimed by either birth of 1776.",
  ],
  ending_bare: [
    "No fancy gear. Just a hammer and a refusal.",
    "Weishaupt fled. You stayed standing.",
  ],
  ending_credits: [
    "THE CULTURE WAR",
    "Bloodlines of the Divide",
    "Outline closed. Thrones cracked.",
    "OST: TWILIGHT ZONE TIME — NA404ERROR",
    "Z FREE ROAM HUB     X TITLE",
    "Thanks for swinging true.",
  ],
  forum_red: ["A forum of torches. The Instructor coaches the Red farm team."],
  forum_blue: ["A lecture pit. The Instructor grades anyone still unaligned."],
};

/** Short Status / Gallery lore from the outline bible. */
export const BOSS_LORE: Record<string, string> = {
  rothschild_archon: "Banks 1825. Round Table. Jekyll Island → Fed. Coin leash.",
  rockefeller_titan: "Refinery 1863. Standard Oil. 1911 breakup; foundations kept books.",
  astor_phantom: "Gilded land/rent dynasty. Property as quiet throne.",
  bundy_warlock: "Ranch sovereignty. Fence-line force vs federal map.",
  collins_necromancer: "Golden Dawn 1887. Cathedral/lodge ritual power.",
  dupont_alchemist: "Industrial chemistry. Arms to both sides — alchemy of war.",
  freeman_hypnotist: "Press & broadcast soft control after the guns cool.",
  kennedy_paladin: "Mid-century dynasty. Camelot armor over harbor politics.",
  li_emperor: "Eastern finance dragon. Quiet rooms move the maps.",
  onassis_hydra: "Shipping empire. Ports, embargoes, wartime logistics.",
  disney_sorcerer: "Soft-power castle. Imagineering. Media bloodline on the NWO chart.",
  reynolds_demon: "Lobby haze. Addiction as never-adjourning vote.",
  russell_sentinel: "Watchtower clock. Surveillance as history's filing system.",
  vanduyn_diplomat: "Handshake treaties. Bilderberg hotel; civilization on the bill.",
  merovingian_king: "Merovingian serpent myth. Thirteen Thrones. Alpha–Omega.",
};

export const GALLERY_LORE: Record<string, string> = {
  "art-illuminati": "1776: Weishaupt's Illuminati & a republic — twin birth.",
  "art-rothschild": BOSS_LORE.rothschild_archon!,
  "art-rockefeller": BOSS_LORE.rockefeller_titan!,
  "art-astor": BOSS_LORE.astor_phantom!,
  "art-bundy": BOSS_LORE.bundy_warlock!,
  "art-collins": BOSS_LORE.collins_necromancer!,
  "art-dupont": BOSS_LORE.dupont_alchemist!,
  "art-freeman": BOSS_LORE.freeman_hypnotist!,
  "art-kennedy": BOSS_LORE.kennedy_paladin!,
  "art-li": BOSS_LORE.li_emperor!,
  "art-onassis": BOSS_LORE.onassis_hydra!,
  "art-lobbyist": BOSS_LORE.reynolds_demon!,
  "art-russell": BOSS_LORE.russell_sentinel!,
  "art-vanduyn": BOSS_LORE.vanduyn_diplomat!,
  "art-merovingian": BOSS_LORE.merovingian_king!,
  "art-opening": "Myths to lodges: Atlantis rumor → Temple → 1776.",
  "art-map": "Public Red/Blue theater. Dungeon = outline ledger.",
  "art-instructor": "Farm-team coaches. Both keys open the vault.",
};

/** Build 1–3 regulars; bosses/instructors stay caller-controlled. */
export function pickEncounter(table: "right" | "left" | "system"): string[] {
  const list = ENCOUNTERS[table];
  const roll = Math.random();
  let count = 1;
  if (table === "system") {
    // Dungeon packs: pairs common, triples uncommon
    if (roll < 0.5) count = 2;
    else if (roll < 0.62) count = 3;
  } else {
    // Early districts: mostly solo, some pairs, rare triples
    if (roll < 0.3) count = 2;
    else if (roll < 0.38) count = 3;
  }
  const picks: string[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    let id = list[Math.floor(Math.random() * list.length)]!;
    // Prefer variety in packs so splash / targeting matter
    if (used.has(id) && list.length > 1 && Math.random() < 0.7) {
      id = list[Math.floor(Math.random() * list.length)]!;
    }
    used.add(id);
    picks.push(id);
  }
  return picks;
}

export function nextBossId(defeated: string[]): string | null {
  for (const b of BOSSES) {
    if (!defeated.includes(b.id)) return b.id;
  }
  return null;
}

/** Soft lean from district time spent — used by ending variants. */
export function endingLean(redWins: number, blueWins: number): "neutral" | "left" | "right" {
  if (redWins > blueWins + 2) return "right";
  if (blueWins > redWins + 2) return "left";
  return "neutral";
}

/** Dynamic recruiter / NPC lines keyed off win tallies. */
export function alignmentNpcLines(
  id: string,
  redWins: number,
  blueWins: number,
): string[] | null {
  const lean = endingLean(redWins, blueWins);
  if (id === "left_recruiter") {
    if (blueWins >= 3) {
      return [
        "LEFT RECRUITER: You've walked our re-education halls!",
        lean === "left"
          ? "BAKI: Walking a stage isn't joining the lodge."
          : "BAKI: I walked the theater. I didn't enlist.",
        "LEFT RECRUITER: Neutrality after Blue wins? Stubborn hammer.",
      ];
    }
    if (redWins > blueWins) {
      return [
        "LEFT RECRUITER: Red soot on you. Farm-team east perfume.",
        "BAKI: Soot washes. Scripts don't.",
        ...DIALOGUE.left_recruiter.slice(0, 2),
      ];
    }
  }
  if (id === "right_recruiter") {
    if (redWins >= 3) {
      return [
        "RIGHT RECRUITER: Three wins east — almost family!",
        lean === "right"
          ? "BAKI: Family doesn't issue Round Table uniforms."
          : "BAKI: Almost is where I stop.",
        "RIGHT RECRUITER: The faithful notice fence-sitters.",
      ];
    }
    if (blueWins > redWins) {
      return [
        "RIGHT RECRUITER: Blue chalk on the hammer. Quiz dust.",
        "BAKI: Chalk isn't a creed.",
        ...DIALOGUE.right_recruiter.slice(0, 2),
      ];
    }
  }
  if (id === "hub_guide" && (redWins + blueWins) >= 4) {
    const tip =
      lean === "neutral"
        ? "GUIDE: Ledger balanced. Keep the outline blank below."
        : lean === "right"
          ? "GUIDE: Red lean showing. Endings remember soot."
          : "GUIDE: Blue lean showing. Endings remember chalk.";
    return [...DIALOGUE.hub_guide.slice(0, 3), tip, DIALOGUE.hub_guide[4]!];
  }
  if (id === "hub_veteran") {
    return [
      ...DIALOGUE.hub_veteran,
      lean === "neutral"
        ? "VETERAN: Your page is blank. Good. Thrones hate blanks."
        : "VETERAN: Lean showing. Smash vaults anyway — refuse the stamp.",
    ];
  }
  if (id === "innkeeper" && (redWins >= 2 || blueWins >= 2)) {
    return [
      ...DIALOGUE.innkeeper,
      lean === "neutral"
        ? "INNKEEPER: Balanced boots. Stew tastes like 1776 without the lodge."
        : "INNKEEPER: Pick a farm team and dessert costs double. Joke. Mostly.",
    ];
  }
  return null;
}

export function midgameLeanLines(redWins: number, blueWins: number): string[] {
  const lean = endingLean(redWins, blueWins);
  if (lean === "left") return DIALOGUE.lean_mid_left;
  if (lean === "right") return DIALOGUE.lean_mid_right;
  return DIALOGUE.lean_mid_neutral;
}

export function dungeonLeanLines(redWins: number, blueWins: number): string[] {
  const lean = endingLean(redWins, blueWins);
  if (lean === "left") return DIALOGUE.dungeon_lean_left;
  if (lean === "right") return DIALOGUE.dungeon_lean_right;
  return DIALOGUE.dungeon_lean_neutral;
}

export function bossCutscene(id: string): string[] | null {
  const map: Record<string, string> = {
    rothschild_archon: "boss_cut_rothschild",
    rockefeller_titan: "boss_cut_rockefeller",
    astor_phantom: "boss_cut_astor",
    bundy_warlock: "boss_cut_bundy",
    collins_necromancer: "boss_cut_collins",
    dupont_alchemist: "boss_cut_dupont",
    freeman_hypnotist: "boss_cut_freeman",
    kennedy_paladin: "boss_cut_kennedy",
    li_emperor: "boss_cut_li",
    onassis_hydra: "boss_cut_onassis",
    disney_sorcerer: "Soft-power castle. Imagineering. Media bloodline on the NWO chart.",
  disney_sorcerer: "boss_cut_disney",
    reynolds_demon: "boss_cut_reynolds",
    russell_sentinel: "boss_cut_russell",
    vanduyn_diplomat: "boss_cut_vanduyn",
    merovingian_king: "boss_cut_merovingian",
  };
  const key = map[id];
  return key ? DIALOGUE[key] ?? null : null;
}

export function bossOutro(id: string): string[] {
  const keyed: Record<string, string> = {
    rothschild_archon: "after_rothschild",
    rockefeller_titan: "after_rockefeller",
    astor_phantom: "after_astor",
    bundy_warlock: "after_bundy",
    collins_necromancer: "after_collins",
    dupont_alchemist: "after_dupont",
    freeman_hypnotist: "after_freeman",
    kennedy_paladin: "after_kennedy",
    li_emperor: "after_li",
    onassis_hydra: "after_onassis",
    disney_sorcerer: "Soft-power castle. Imagineering. Media bloodline on the NWO chart.",
  disney_sorcerer: "after_disney",
    reynolds_demon: "after_reynolds",
    russell_sentinel: "after_russell",
    vanduyn_diplomat: "after_vanduyn",
    merovingian_king: "after_merovingian",
  };
  const key = keyed[id];
  if (key && DIALOGUE[key]) return DIALOGUE[key]!;
  return [`${BOSS_LORE[id] ?? "A seal cracks."}`, ...(DIALOGUE.after_boss ?? [])];
}

export function dungeonPlaque(order: number): string[] | null {
  return DIALOGUE[`plaque_${order}`] ?? null;
}
