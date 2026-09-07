import type { GameMap, MapId } from "./types";

const CH: Record<string, number> = {
  ".": 0, ",": 1, "/": 2, "+": 3,
  r: 4, R: 5, b: 6, B: 7,
  d: 8, X: 9, v: 10, w: 11,
  T: 12, c: 13, k: 14, $: 15,
  D: 16, t: 17, "^": 18, f: 19,
  "=": 20, "|": 21, "%": 22,
  G: 23, g: 24, s: 25, o: 26,
  "*": 27, H: 28, p: 29, n: 30, "#": 31,
};

export const SOLID = new Set([5, 7, 9, 11, 12, 13, 14, 15, 17, 18, 21, 23, 25, 28, 29, 31]);

function parse(legend: string[]): number[][] {
  const w = Math.max(...legend.map((row) => row.length));
  return legend.map((row) => {
    const padded = row.padEnd(w, row[0] ?? ".");
    return [...padded].map((ch) => CH[ch] ?? 0);
  });
}

const HUB = parse([
  "TTTTTTTTTTTTTTTTTTTTTTTTTT",
  "T.f...^^^^^^^^^^...f.....T",
  "T.....t++++++++t.........T",
  "T.....t++++++++t....kk...T",
  "T.....t+++DD+++t.........T",
  "T.....==========.........T",
  "T.f...==========...f.....T",
  "bbbb,,==========,,rrrrr..T",
  "Bbbb,,====,,====,,rrrrR..T",
  "B...D===========D.....R..T",
  "B.....................R..T",
  "bbbb,,==========,,rrrrr..T",
  "T.....====DD====.........T",
  "T.n...==========...n.....T",
  "T........................T",
  "TTTTTTTTTTTTTTTTTTTTTTTTTT",
]);

const RED = parse([
  "RRRRRRRRRRRRRRRRRRRR",
  "RrrrrrrrrrrrrrrrrrR",
  "Rrr...rr$$rr...rrrR",
  "Rrr...rrrrrr...rrrR",
  "RrrrrrrrrrrrrrrrrrR",
  "Rrr==rrrrrrrr==rrrR",
  "RrrrrrrrDDrrrrrrrrR",
  "Rrr............rrrR",
  "Rrr..kk....cc..rrrR",
  "Rrr............rrrR",
  "RrrrrrrrrrrrrrrrrrR",
  "RrrrrrrrDDrrrrrrrrR",
  "RrrrrrrrrrrrrrrrrrR",
  "RRRRRRRRRRRRRRRRRRRR",
]);

const BLUE = parse([
  "BBBBBBBBBBBBBBBBBBBB",
  "BbbbbbbbbbbbbbbbbbB",
  "Bbb...bb$$bb...bbbB",
  "Bbb...bbbbbb...bbbB",
  "BbbbbbbbbbbbbbbbbbB",
  "Bbb==bbbbbbbb==bbbB",
  "BbbbbbbbDDbbbbbbbbB",
  "Bbb............bbbB",
  "Bbb..kk....cc..bbbB",
  "Bbb............bbbB",
  "BbbbbbbbbbbbbbbbbbB",
  "BbbbbbbbDDbbbbbbbbB",
  "BbbbbbbbbbbbbbbbbbB",
  "BBBBBBBBBBBBBBBBBBBB",
]);

const TAVERN = parse([
  "tttttttttttttt",
  "tH++%pp%++H++t",
  "t+++%pp%+++++t",
  "t++++++++++++t",
  "tk++,,,,,,++kt",
  "t++++,,,,++++t",
  "t++++,,,,++++t",
  "t++++++++++++t",
  "t+++++DD+++++t",
  "tttttttttttttt",
]);

const DUNGEON = parse([
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "Xsssssssssss**ssssssssssssX",
  "Xs|*|*|*|*|**|*|*|*|*|*|sX",
  "Xs D D D D D** D D D D D sX",
  "XsddddddddddddddddddddddsX",
  "Xsdddddddddd**ddddddddddsX",
  "Xoooooooooodd**ddvvvvvvvX",
  "Xoooooooooodd**ddvv**vvvX",
  "Xoooooooooodd**ddvvDDvvvX",
  "XdddddddddddddddddddddddX",
  "XdddddddddddddddddddddddX",
  "Xs D D D D Ddd D D D   sX",
  "Xs|*|*|*|*|dd|*|*|*|   sX",
  "XsssssssssssddssssssssssX",
  "XdddddddddddddddddddddddX",
  "XddddddddddDDdddddddddddX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
]);

export const MAPS: Record<MapId, GameMap> = {
  hub: {
    id: "hub",
    name: "Neutral Hub",
    music: "overworld",
    ground: HUB,
    spawn: { x: 13, y: 10 },
    encounters: "none",
    battleBg: "bg-capitol",
    warps: [
      { x: 4, y: 9, to: "blue", tx: 9, ty: 10 },
      { x: 16, y: 9, to: "red", tx: 9, ty: 10 },
      { x: 10, y: 12, to: "dungeon", tx: 13, ty: 14, need: "dungeon" },
      { x: 11, y: 12, to: "dungeon", tx: 14, ty: 14, need: "dungeon" },
      { x: 10, y: 4, to: "tavern", tx: 6, ty: 6 },
      { x: 11, y: 4, to: "tavern", tx: 7, ty: 6 },
    ],
    npcs: [
      { x: 8, y: 8, id: "left_recruiter", name: "Left Recruiter", sprite: "enemy-mage" },
      { x: 17, y: 8, id: "right_recruiter", name: "Right Recruiter", sprite: "enemy-crusader" },
      { x: 6, y: 13, id: "sign_blue", name: "Sign" },
      { x: 19, y: 13, id: "sign_red", name: "Sign" },
      { x: 13, y: 13, id: "sign_dungeon", name: "Sign" },
    ],
  },
  red: {
    id: "red",
    name: "Red District",
    music: "overworld",
    ground: RED,
    spawn: { x: 9, y: 10 },
    encounters: "right",
    battleBg: "bg-red",
    warps: [
      { x: 8, y: 11, to: "hub", tx: 15, ty: 10 },
      { x: 9, y: 11, to: "hub", tx: 15, ty: 10 },
    ],
    npcs: [{ x: 9, y: 6, id: "forum_red", name: "Red Forum", sprite: "enemy-instructor" }],
  },
  blue: {
    id: "blue",
    name: "Blue District",
    music: "overworld",
    ground: BLUE,
    spawn: { x: 9, y: 10 },
    encounters: "left",
    battleBg: "bg-blue",
    warps: [
      { x: 8, y: 11, to: "hub", tx: 5, ty: 10 },
      { x: 9, y: 11, to: "hub", tx: 5, ty: 10 },
    ],
    npcs: [{ x: 9, y: 6, id: "forum_blue", name: "Blue Forum", sprite: "enemy-instructor", tint: 0x99bbff }],
  },
  tavern: {
    id: "tavern",
    name: "Common Sense Tavern",
    music: "tavern",
    ground: TAVERN,
    spawn: { x: 6, y: 6 },
    encounters: "none",
    battleBg: "bg-tavern",
    warps: [
      { x: 6, y: 8, to: "hub", tx: 10, ty: 5 },
      { x: 7, y: 8, to: "hub", tx: 11, ty: 5 },
    ],
    npcs: [{ x: 7, y: 2, id: "innkeeper", name: "Innkeeper", sprite: "npc-innkeeper" }],
  },
  dungeon: {
    id: "dungeon",
    name: "Thirteen Thrones Approach",
    music: "dungeon",
    ground: DUNGEON,
    spawn: { x: 13, y: 14 },
    encounters: "system",
    battleBg: "bg-vault",
    warps: [
      { x: 11, y: 15, to: "hub", tx: 10, ty: 13 },
      { x: 12, y: 15, to: "hub", tx: 10, ty: 13 },
    ],
    npcs: [{ x: 14, y: 13, id: "blood_ledger", name: "Bloodline Ledger", sprite: "boss-rothschild" }],
  },
};

/** Door tile coords must match literal 'D' positions in DUNGEON (space-separated doors pad to floor). */
export const DUNGEON_DOORS: { x: number; y: number; order: number }[] = [
  { x: 3, y: 3, order: 1 },
  { x: 5, y: 3, order: 2 },
  { x: 7, y: 3, order: 3 },
  { x: 9, y: 3, order: 4 },
  { x: 11, y: 3, order: 5 },
  { x: 15, y: 3, order: 6 },
  { x: 17, y: 3, order: 7 },
  { x: 19, y: 3, order: 8 },
  { x: 21, y: 3, order: 9 },
  { x: 23, y: 3, order: 10 },
  { x: 3, y: 11, order: 11 },
  { x: 5, y: 11, order: 12 },
  { x: 7, y: 11, order: 13 },
  // Final throne: row "…vvDDvvv" → D at x=19,20 (was wrongly 17,18 = softlock)
  { x: 19, y: 8, order: 14 },
  { x: 20, y: 8, order: 14 },
];

export function inBounds(map: GameMap, tx: number, ty: number): boolean {
  return ty >= 0 && ty < map.ground.length && tx >= 0 && tx < (map.ground[0]?.length ?? 0);
}

export function walkable(map: GameMap, tx: number, ty: number): boolean {
  if (!inBounds(map, tx, ty)) return false;
  const id = map.ground[ty]![tx]!;
  return !SOLID.has(id);
}
