import Phaser from "phaser";
import { sfx } from "../audio";
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
    px(this, 22, 28, TITLE, 7, "#e8b84a");
    px(this, 22, 40, "Hero: Baki The Hammer", 5, "#7a8aa0");
    px(this, 22, 52, `LV ${h.level}   XP ${h.xp}/${h.xpToNext}`, 6, "#f0e6c8");
    px(this, 22, 68, `HP  ${h.hp}/${h.maxHp}`, 7, "#c41e3a");
    px(this, 22, 84, `MP  ${h.mp}/${h.maxMp}`, 7, "#8eb4ff");
    px(this, 22, 104, `ATK ${h.atk}  DEF ${h.def}  SPD ${h.spd}`, 6, "#f0e6c8");
    px(this, 22, 118, `GOLD ${h.gold}`, 6, "#e8b84a");
    px(this, 22, 132, `POTION ${h.items.potion}  ETHER ${h.items.ether}`, 6, "#f0e6c8");
    px(this, 22, 146, `NEUTRALIZER ${h.items.neutralizer}`, 6, "#f0e6c8");
    px(
      this,
      22,
      168,
      G.flags.boughtHammer ? "IRON HAMMER  EQUIPPED" : "IRON HAMMER  —",
      6,
      G.flags.boughtHammer ? "#e8b84a" : "#7a8aa0",
    );
    px(
      this,
      22,
      182,
      G.flags.boughtMateria ? "TRUE-NEUTRAL MATERIA" : "MATERIA  —",
      6,
      G.flags.boughtMateria ? "#e8b84a" : "#7a8aa0",
    );

    const loc = G.map.toUpperCase();
    const bossN = BOSSES.filter((b) => G.flags.bossesDefeated.includes(b.id)).length;
    const cleared = G.flags.ending ? "  CLEARED" : "";
    const red = G.flags.redMiniboss ? "RED DONE" : `RED ${G.flags.redWins}/3`;
    const blue = G.flags.blueMiniboss ? "BLUE DONE" : `BLUE ${G.flags.blueWins}/3`;
    px(this, VIEW_W / 2, 196, `${red}   ${blue}`, 6, "#e8b84a").setOrigin(0.5, 0);
    const next = BOSSES.find((b) => !G.flags.bossesDefeated.includes(b.id));
    const lean = endingLean(G.flags.redWins, G.flags.blueWins);
    const nextLore = next ? (BOSS_LORE[next.id] ?? next.title) : "Outline complete.";
    px(this, VIEW_W / 2, 210, `${loc}   BOSSES ${bossN}/14   ${G.flags.dungeonOpen ? "GATE OPEN" : "GATE SEALED"}${cleared}`, 6, "#f0e6c8").setOrigin(0.5, 0);
    px(this, VIEW_W / 2, 222, `LEAN ${lean.toUpperCase()}  ·  ${nextLore}`.slice(0, 58), 5, "#7a8aa0").setOrigin(0.5, 0);
    px(this, VIEW_W / 2, 236, "SAVED     TRUE NEUTRAL     Z / X CLOSE", 6, "#e8b84a").setOrigin(0.5, 0);
  }

  update() {
    if (consumeConfirm() || consumeCancel()) {
      sfx("ok");
      this.scene.stop();
      this.game.scene.resume("overworld");
    }
  }
}
