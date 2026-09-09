import Phaser from "phaser";
import { ART, ensureProceduralArt } from "../art";
import { bindAutosave } from "../save";
import { VIEW_H, VIEW_W } from "../types";
import { loadMutePreference } from "../audio";

const IDLE_SHEETS = [
  "enemy-right",
  "enemy-left",
  "enemy-slime",
  "enemy-instructor",
  "enemy-crusader",
  "enemy-mage",
  "enemy-brawler",
  "enemy-knight",
  "enemy-corporate",
  "enemy-sheep",
  "enemy-activist",
  "enemy-berserker",
  "enemy-sheeple",
  "enemy-captain",
  "enemy-puppet",
  "npc-innkeeper",
  "boss-rothschild",
  "boss-serpent",
  "boss-rockefeller",
  "boss-astor",
  "boss-bundy",
  "boss-collins",
  "boss-dupont",
  "boss-freeman",
  "boss-kennedy",
  "boss-li",
  "boss-onassis",
  "boss-reynolds",
  "boss-russell",
  "boss-vanduyn",
  "cast-knight",
  "cast-executive",
  "cast-general",
  "cast-wraith",
  "cast-cultist",
  "cast-red-aristocrat",
  "cast-black-aristocrat",
  "cast-reporter",
  "cast-soldier",
  "cast-specops",
  "cast-corrupt",
  "cast-raider",
  "cast-agent",
  "cast-shadow-king",
  "cast-glutton",
  "cast-judge",
  "cast-warmachine",
  "cast-lich",
  "cast-goldenpig",
  "cast-voidknight",
] as const;

const SHEETS: { key: string; url: string; frame: number }[] = [
  { key: "baki-walk", url: "/game/baki-walk.png", frame: 96 },
  { key: "baki-idle", url: "/game/baki-idle.png", frame: 128 },
  { key: "baki-attack", url: "/game/baki-attack.png", frame: 128 },
  ...IDLE_SHEETS.map((key) => ({ key, url: `/game/${key}.png`, frame: 128 })),
];

/** Boot loads canonical `/game/*` paths only.
 * Higher-res / platform packs live under `studio/optimized/` — overlay via build
 * or copy into public/game on a platform branch. See docs/ART_PIPELINE.md.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    const { width, height } = { width: VIEW_W, height: VIEW_H };
    const g = this.add.graphics();
    g.fillStyle(0x0c0814, 1);
    g.fillRect(0, 0, width, height);
    this.add.rectangle(width / 2, height / 2, 200, 10, 0x3a2e1a);
    const fill = this.add.rectangle(width / 2 - 100, height / 2, 2, 8, 0xe8b84a).setOrigin(0, 0.5);
    this.add.text(width / 2, height / 2 - 24, "LOADING THE CULTURE WAR...", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#e8b84a",
    }).setOrigin(0.5).setResolution(3);

    this.load.on("progress", (v: number) => {
      fill.width = 200 * v;
    });

    this.load.image("title", "/game/title.jpg");
    this.load.image("opening", "/game/opening.jpg");
    this.load.image("tiles", "/game/tiles.png");
    this.load.image("cw-bg-hub", "/game/cw/bg-hub.png");
    this.load.image("cw-bg-red", "/game/cw/bg-red.png");
    this.load.image("cw-bg-blue", "/game/cw/bg-blue.png");
    this.load.image("cw-bg-dungeon", "/game/cw/bg-dungeon.png");
    this.load.image("cw-bg-tavern", "/game/cw/bg-tavern.png");
    this.load.image("map-locations", "/game/map-locations.jpg");
    this.load.image("bg-echo", "/game/bg-echo.jpg");
    this.load.image("art-echo-chamber", "/game/art/echo-chamber.jpg");
    this.load.image("bg-red", "/game/bg-red.jpg");
    this.load.image("bg-blue", "/game/bg-blue.jpg");
    this.load.image("bg-vault", "/game/bg-vault.jpg");
    this.load.image("bg-tavern", "/game/bg-tavern.jpg");
    this.load.image("bg-thrones", "/game/bg-thrones.jpg");
    this.load.image("bg-capitol", "/game/bg-capitol.jpg");
    this.load.image("bg-plaza", "/game/bg-plaza.jpg");
    this.load.image("codex", "/game/codex.jpg");
    this.load.image("baki-portrait", "/game/baki-portrait.jpg");
    this.load.image("menu-ui", "/game/menu-ui.jpg");
    this.load.image("map-ref", "/game/map-ref.jpg");
    this.load.image("ui-heal", "/game/ui-heal.png");
    this.load.image("ui-target", "/game/ui-target.png");
    for (const page of ART) {
      this.load.image(page.key, page.url);
    }
    for (const s of SHEETS) {
      this.load.spritesheet(s.key, s.url, { frameWidth: s.frame, frameHeight: s.frame });
    }
  }

  async create() {
    loadMutePreference();
    bindAutosave();
    this.makeFallbacks();
    this.makeAnims();
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch {
      /* ignore */
    }
    this.time.delayedCall(80, () => this.scene.start("title"));
  }

  makeFallbacks() {
    ensureProceduralArt(this);
    const mk = (key: string, color: number, w = 32, h = 32) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(color, 1);
      g.fillRect(0, 0, w, h);
      g.lineStyle(2, 0xe8b84a, 1);
      g.strokeRect(1, 1, w - 2, h - 2);
      g.generateTexture(key, w, h);
      g.destroy();
    };
    mk("tiles", 0x3a5a32, 128, 64);
    // Missing battle BGs: BattleScene falls back to fx-bg-* from ensureProceduralArt.
  }

  makeAnims() {
    const mk = (key: string, sheet: string, start: number, end: number, fps = 7) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(sheet, { start, end }),
        frameRate: fps,
        repeat: -1,
      });
    };
    mk("baki-down", "baki-walk", 0, 3, 8);
    mk("baki-left", "baki-walk", 4, 7, 8);
    mk("baki-right", "baki-walk", 8, 11, 8);
    mk("baki-up", "baki-walk", 12, 15, 8);
    mk("baki-idle-b", "baki-idle", 0, 3, 5);
    mk("baki-atk", "baki-attack", 0, 3, 10);
    for (const k of IDLE_SHEETS) {
      mk(`${k}-idle`, k, 0, 3, 5);
    }
  }
}
