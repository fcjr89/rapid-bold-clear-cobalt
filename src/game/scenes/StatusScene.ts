import Phaser from "phaser";
import { sfx } from "../audio";
import { CONSPIRE_HOWTO } from "../conspiracyDeck";
import { BOSS_LORE, BOSSES, endingLean, TITLE } from "../database";
import { consumeCancel, consumeConfirm } from "../input";
import { writeSave } from "../save";
import { G } from "../state";
import { VIEW_H, VIEW_W } from "../types";
import { px } from "../ui";

/** Pause / status screen — uses the official MENU painting as chrome. */
export class StatusScene extends Phaser.Scene {
  constructor() {
    super("status");
  }

  create() {
    this.scene.bringToTop("status");
    writeSave();
    this.cameras.main.setBackgroundColor(0x0c0814);
    if (this.textures.exists("art-menu")) {
      this.add.image(VIEW_W / 2, VIEW_H / 2, "art-menu").setDisplaySize(VIEW_W, VIEW_H);
    } else {
      this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x160a24, 1);
    }
    this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x0c0814, 0.18);

    if (this.textures.exists("art-baki-head")) {
      this.add.image(372, 108, "art-baki-head").setDisplaySize(150, 150);
    }

    const h = G.hero;
    const groups = G.flags.unlockedGroupCards?.length ?? 0;
    px(this, 22, 22, TITLE, 7, "#e8b84a");
    px(this, 22, 34, "Hero: Baki The Hammer", 5, "#7a8aa0");
    px(this, 22, 46, `LV ${h.level}   XP ${h.xp}/${h.xpToNext}`, 6, "#f0e6c8");
    px(this, 22, 60, `HP  ${h.hp}/${h.maxHp}`, 7, "#c41e3a");
    px(this, 22, 74, `MP  ${h.mp}/${h.maxMp}`, 7, "#8eb4ff");
    px(this, 22, 88, `INF ${h.influence}/${h.maxInfluence}  ·  GROUPS ${groups}`, 6, "#c9a0ff");
    px(this, 22, 102, `ATK ${h.atk}  DEF ${h.def}  SPD ${h.spd}`, 6, "#f0e6c8");
    px(this, 22, 114, `GOLD ${h.gold}`, 6, "#e8b84a");
    px(this, 22, 126, `POTION ${h.items.potion}  ETHER ${h.items.ether}  NEUT ${h.items.neutralizer}`, 5, "#f0e6c8");
    px(
      this,
      22,
      140,
      G.flags.boughtHammer ? "IRON HAMMER  EQUIPPED" : "IRON HAMMER  —",
      5,
      G.flags.boughtHammer ? "#e8b84a" : "#7a8aa0",
    );
    px(
      this,
      22,
      152,
      G.flags.boughtMateria ? "TRUE-NEUTRAL MATERIA" : "MATERIA  —",
      5,
      G.flags.boughtMateria ? "#e8b84a" : "#7a8aa0",
    );

    const loc = G.map.toUpperCase();
    const bossN = BOSSES.filter((b) => G.flags.bossesDefeated.includes(b.id)).length;
    const cleared = G.flags.ending ? "  CLEARED" : "";
    const red = G.flags.redMiniboss ? "RED DONE" : `RED ${G.flags.redWins}/3`;
    const blue = G.flags.blueMiniboss ? "BLUE DONE" : `BLUE ${G.flags.blueWins}/3`;
    px(this, VIEW_W / 2, 168, `${red}   ${blue}`, 5, "#e8b84a").setOrigin(0.5, 0);
    const next = BOSSES.find((b) => !G.flags.bossesDefeated.includes(b.id));
    const lean = endingLean(G.flags.redWins, G.flags.blueWins);
    const nextLore = next ? (BOSS_LORE[next.id] ?? next.title) : "Outline complete.";
    px(this, VIEW_W / 2, 180, `${loc}   BOSSES ${bossN}/14   ${G.flags.dungeonOpen ? "GATE OPEN" : "GATE SEALED"}${cleared}`, 5, "#f0e6c8").setOrigin(0.5, 0);
    px(this, VIEW_W / 2, 192, `LEAN ${lean.toUpperCase()}  ·  ${nextLore}`.slice(0, 58), 4, "#7a8aa0").setOrigin(0.5, 0);
    px(this, VIEW_W / 2, 206, "SKILLS + CONSPIRE line (Bribe / Blackout / Assassinate)", 4, "#6adf8a").setOrigin(0.5, 0);
    px(this, VIEW_W / 2, 218, CONSPIRE_HOWTO.slice(0, 62), 4, "#c9a0ff").setOrigin(0.5, 0);
    px(this, VIEW_W / 2, 232, "Battle: COMMAND → CONSPIRE → Control / Neutralize / Destroy / cards", 4, "#7a8aa0").setOrigin(0.5, 0);
    px(this, VIEW_W / 2, 246, "SAVED     TRUE NEUTRAL     Z / X CLOSE", 5, "#e8b84a").setOrigin(0.5, 0);
  }

  update() {
    if (consumeConfirm() || consumeCancel()) {
      sfx("ok");
      this.scene.stop();
      this.game.scene.resume("overworld");
    }
  }
}
