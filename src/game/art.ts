/** Official uploads + procedural canvas fallbacks when PNGs are missing. */

import type Phaser from "phaser";

export interface ArtPage {
  key: string;
  title: string;
  url: string;
}

export const ART: ArtPage[] = [
  { key: "art-opening", title: "OPENING SCENE", url: "/game/art/opening.jpg" },
  { key: "art-baki-head", title: "BAKI HEAD SHOT", url: "/game/art/baki-head.jpg" },
  { key: "art-baki-overworld", title: "BAKI MAIN CHARACTER", url: "/game/art/baki-overworld.jpg" },
  { key: "art-baki-battle", title: "BAKI IN BATTLE", url: "/game/art/baki-battle.jpg" },
  { key: "art-baki-attack", title: "BAKI MOVING AND ATTACKING", url: "/game/art/baki-attack.jpg" },
  { key: "art-menu", title: "MENU", url: "/game/art/menu.jpg" },
  { key: "art-map", title: "MAP AND LOCATIONS", url: "/game/art/map.jpg" },
  { key: "art-chibi", title: "BACKGROUNDS · CHARACTERS · ENEMIES", url: "/game/art/chibi.jpg" },
  { key: "art-illuminati", title: "ILLUMINATI", url: "/game/art/illuminati.jpg" },
  { key: "art-innkeeper", title: "SHOP OWNER", url: "/game/art/innkeeper.jpg" },
  { key: "art-crusader", title: "CHRISTIAN ZIONIST", url: "/game/art/crusader.jpg" },
  { key: "art-propagandist", title: "PROPAGANDIST", url: "/game/art/propagandist.jpg" },
  { key: "art-knight", title: "MAGA KNIGHT", url: "/game/art/knight.jpg" },
  { key: "art-sheep", title: "INTERNET SHEEP", url: "/game/art/sheep.jpg" },
  { key: "art-corporate", title: "CORPORATE SLAVE", url: "/game/art/corporate.jpg" },
  { key: "art-mage", title: "WIZARD", url: "/game/art/mage.jpg" },
  { key: "art-activist", title: "ACTIVIST", url: "/game/art/activist.jpg" },
  { key: "art-berserker", title: "SJW", url: "/game/art/berserker.jpg" },
  { key: "art-sheeple", title: "SHEEPLE HOMELESS", url: "/game/art/sheeple.jpg" },
  { key: "art-captain", title: "R&D / CULTURE WAR", url: "/game/art/captain.jpg" },
  { key: "art-puppet", title: "CABLE NEWS", url: "/game/art/puppet.jpg" },
  { key: "art-slime", title: "SOCIAL MEDIA ECHO CHAMBER", url: "/game/art/slime.jpg" },
  { key: "art-instructor", title: "RE-EDUCATION INSTRUCTOR", url: "/game/art/instructor.jpg" },
  { key: "art-rothschild", title: "LORD ROTHSCHILD", url: "/game/art/rothschild.jpg" },
  { key: "art-rockefeller", title: "ROCKEFELLER", url: "/game/art/rockefeller.jpg" },
  { key: "art-astor", title: "ASTOR", url: "/game/art/astor.jpg" },
  { key: "art-bundy", title: "BUNDY RANCH WARLORD", url: "/game/art/bundy.jpg" },
  { key: "art-collins", title: "COLLINS", url: "/game/art/collins.jpg" },
  { key: "art-dupont", title: "DUPONT CHEMICAL ALCHEMIST", url: "/game/art/dupont.jpg" },
  { key: "art-freeman", title: "RADIO PROPAGANDIST", url: "/game/art/freeman.jpg" },
  { key: "art-kennedy", title: "KENNEDY DYNASTY PALADIN", url: "/game/art/kennedy.jpg" },
  { key: "art-li", title: "LI DRAGON FINANCE EMPEROR", url: "/game/art/li.jpg" },
  { key: "art-onassis", title: "ONASSIS SHIPPING", url: "/game/art/onassis.jpg" },
  { key: "art-lobbyist", title: "LOBBYIST", url: "/game/art/lobbyist.jpg" },
  { key: "art-russell", title: "RUSSELL WATCHTOWER SENTINEL", url: "/game/art/russell.jpg" },
  { key: "art-vanduyn", title: "VAN DUYN SERPENT DIPLOMAT", url: "/game/art/vanduyn.jpg" },
  { key: "art-merovingian", title: "WARLOCK / MEROVINGIAN", url: "/game/art/merovingian.jpg" },
];

export const ENEMY_PORTRAIT: Record<string, string> = {
  faith_first_crusader: "art-crusader",
  no_apologies_brawler: "art-propagandist",
  pragmatic_polite: "art-knight",
  unconventional_rogue: "art-sheep",
  loyal_liberal_mage: "art-mage",
  leftward_progressive: "art-activist",
  order_opportunity: "art-corporate",
  left_out_berserker: "art-berserker",
  tuned_out_middle: "art-sheeple",
  culture_war_captain: "art-captain",
  cable_news_puppet: "art-puppet",
  echo_chamber_slime: "art-slime",
  reeducation_instructor: "art-instructor",
  rothschild_archon: "art-rothschild",
  rockefeller_titan: "art-rockefeller",
  astor_phantom: "art-astor",
  bundy_warlock: "art-bundy",
  collins_necromancer: "art-collins",
  dupont_alchemist: "art-dupont",
  freeman_hypnotist: "art-freeman",
  kennedy_paladin: "art-kennedy",
  li_emperor: "art-li",
  onassis_hydra: "art-onassis",
  reynolds_demon: "art-lobbyist",
  russell_sentinel: "art-russell",
  vanduyn_diplomat: "art-vanduyn",
  merovingian_king: "art-merovingian",
  fed_golem: "art-corporate",
  imf_auditor: "art-corporate",
  bis_ledger_wraith: "art-slime",
  skull_bones_initiate: "art-captain",
  bohemian_grove_mask: "art-puppet",
  cfr_handler: "art-captain",
  trilateral_envoy: "art-corporate",
  cia_shade: "art-sheep",
  mossad_cipher: "art-sheep",
  media_establishment_anchor: "art-puppet",
  unesco_softpower: "art-mage",
  oil_cartel_knight: "art-knight",
  pharma_hydra_rep: "art-corporate",
  disney_sorcerer: "art-freeman",
};

/** Resolve a portrait key with graceful degradation. */
export function resolvePortrait(
  scene: Phaser.Scene,
  enemyId: string,
  spriteKey?: string,
): string | null {
  const art = ENEMY_PORTRAIT[enemyId];
  if (art && scene.textures.exists(art)) return art;
  if (spriteKey && scene.textures.exists(spriteKey)) return spriteKey;
  if (scene.textures.exists("fx-enemy-sil")) return "fx-enemy-sil";
  return null;
}

type G = Phaser.GameObjects.Graphics;

function paintHero(g: G, w: number, h: number) {
  g.fillStyle(0x1a1024, 1);
  g.fillRect(0, 0, w, h);
  // torso
  g.fillStyle(0x3a2e1a, 1);
  g.fillRect(w * 0.28, h * 0.42, w * 0.44, h * 0.4);
  // head
  g.fillStyle(0xc4a882, 1);
  g.fillCircle(w * 0.5, h * 0.28, w * 0.16);
  // hair / bandana
  g.fillStyle(0xc41e3a, 1);
  g.fillRect(w * 0.33, h * 0.14, w * 0.34, h * 0.12);
  // hammer head
  g.fillStyle(0x8a9aaa, 1);
  g.fillRect(w * 0.62, h * 0.48, w * 0.28, h * 0.12);
  g.fillStyle(0x5a4030, 1);
  g.fillRect(w * 0.72, h * 0.58, w * 0.06, h * 0.28);
  // gold trim
  g.lineStyle(2, 0xe8b84a, 1);
  g.strokeRect(2, 2, w - 4, h - 4);
}

function paintEnemySil(g: G, w: number, h: number, color: number) {
  g.fillStyle(0x0c0814, 1);
  g.fillRect(0, 0, w, h);
  g.fillStyle(color, 1);
  g.fillCircle(w * 0.5, h * 0.58, w * 0.28);
  g.fillStyle(color, 1);
  g.fillCircle(w * 0.5, h * 0.28, w * 0.18);
  g.fillStyle(0xe8b84a, 0.35);
  g.fillCircle(w * 0.42, h * 0.26, 3);
  g.fillCircle(w * 0.58, h * 0.26, 3);
  g.lineStyle(2, 0xe8b84a, 0.8);
  g.strokeRect(1, 1, w - 2, h - 2);
}

function paintBg(g: G, w: number, h: number, c1: number, c2: number, accent: number) {
  g.fillStyle(c1, 1);
  g.fillRect(0, 0, w, h);
  g.fillStyle(c2, 1);
  g.fillRect(0, h * 0.45, w, h * 0.55);
  g.fillStyle(accent, 0.12);
  for (let i = 0; i < 8; i++) {
    g.fillRect(0, (h / 8) * i + 2, w, 2);
  }
  g.fillStyle(0x0c0814, 0.35);
  g.fillRect(0, h * 0.62, w, h * 0.38);
  g.lineStyle(3, 0xe8b84a, 0.45);
  g.strokeRect(4, 4, w - 8, h - 8);
}

function paintChrome(g: G, w: number, h: number) {
  g.fillStyle(0x160a24, 0.95);
  g.fillRect(0, 0, w, h);
  g.lineStyle(3, 0xe8b84a, 1);
  g.strokeRect(2, 2, w - 4, h - 4);
  g.lineStyle(1, 0x7b4ac8, 1);
  g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle(0xe8b84a, 0.25);
  g.fillRect(10, 10, w - 20, 4);
}

/**
 * Generate procedural fallback textures used when PNG/JPG assets fail to load.
 * Safe to call after preload; skips keys that already exist.
 */
export function ensureProceduralArt(scene: Phaser.Scene): void {
  const mk = (key: string, w: number, h: number, paint: (g: G) => void) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    paint(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  mk("fx-hero-sil", 96, 128, (g) => paintHero(g, 96, 128));
  mk("fx-enemy-sil", 96, 128, (g) => paintEnemySil(g, 96, 128, 0x5a3048));
  mk("fx-enemy-red", 96, 128, (g) => paintEnemySil(g, 96, 128, 0x8a2030));
  mk("fx-enemy-blue", 96, 128, (g) => paintEnemySil(g, 96, 128, 0x2a4a9a));
  mk("fx-enemy-gold", 96, 128, (g) => paintEnemySil(g, 96, 128, 0x8a7030));
  mk("fx-bg-red", 480, 270, (g) => paintBg(g, 480, 270, 0x4a1018, 0x1a0810, 0xc41e3a));
  mk("fx-bg-blue", 480, 270, (g) => paintBg(g, 480, 270, 0x102040, 0x081018, 0x2a4a9a));
  mk("fx-bg-vault", 480, 270, (g) => paintBg(g, 480, 270, 0x2a1a10, 0x0c0814, 0xe8b84a));
  mk("fx-bg-tavern", 480, 270, (g) => paintBg(g, 480, 270, 0x3a2818, 0x1a1008, 0xc4a060));
  mk("fx-ui-chrome", 160, 40, (g) => paintChrome(g, 160, 40));
  mk("fx-scanline", 480, 2, (g) => {
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(0, 0, 480, 1);
  });

  // Soft portrait placeholders keyed like ART pages if missing
  for (const page of ART) {
    if (scene.textures.exists(page.key)) continue;
    const isBoss = page.key.includes("rothschild") || page.key.includes("merovingian") || page.key.includes("rockefeller");
    mk(page.key, 112, 168, (g) =>
      paintEnemySil(g, 112, 168, isBoss ? 0x8a7030 : page.key.includes("baki") ? 0x3a2e1a : 0x5a3048),
    );
  }

  if (!scene.textures.exists("baki-portrait")) {
    mk("baki-portrait", 96, 96, (g) => paintHero(g, 96, 96));
  }
  if (!scene.textures.exists("title")) {
    mk("title", 480, 270, (g) => {
      paintBg(g, 480, 270, 0x1a1024, 0x0c0814, 0xe8b84a);
      g.fillStyle(0xe8b84a, 1);
      g.fillRect(120, 100, 240, 8);
      g.fillRect(140, 140, 200, 4);
    });
  }
  if (!scene.textures.exists("opening")) {
    mk("opening", 480, 270, (g) => paintBg(g, 480, 270, 0x1a1024, 0x0c0814, 0xc41e3a));
  }
}

/** Lightweight particle / scanline punch for title & ending. */
export function addPresentationFx(scene: Phaser.Scene, tint = 0xe8b84a): void {
  const { width, height } = { width: 480, height: 270 };
  // Scanlines
  for (let y = 0; y < height; y += 3) {
    const line = scene.add.rectangle(width / 2, y, width, 1, 0x000000, 0.18).setDepth(95);
    line.setScrollFactor(0);
  }
  // Floating embers / dust
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const s = 1 + Math.random() * 2;
    const p = scene.add.circle(x, y, s, tint, 0.35 + Math.random() * 0.4).setDepth(96);
    scene.tweens.add({
      targets: p,
      y: y - (20 + Math.random() * 40),
      alpha: 0,
      duration: 1800 + Math.random() * 2200,
      repeat: -1,
      delay: Math.random() * 1200,
      onRepeat: () => {
        p.y = height + 4;
        p.x = Math.random() * width;
        p.alpha = 0.35 + Math.random() * 0.4;
      },
    });
  }
}
