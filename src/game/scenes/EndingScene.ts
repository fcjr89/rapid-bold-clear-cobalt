import Phaser from "phaser";
import { playMusic, sfx, unlockAudio } from "../audio";
import { DIALOGUE } from "../database";
import { consumeCancel, consumeConfirm } from "../input";
import { writeSave } from "../save";
import { G } from "../state";
import { VIEW_H, VIEW_W } from "../types";
import { px, wrap } from "../ui";

/** Full ending / credits beat after the Merovingian falls. */
export class EndingScene extends Phaser.Scene {
  private lines: string[] = [];
  private index = 0;
  private label?: Phaser.GameObjects.Text;
  private sub?: Phaser.GameObjects.Text;

  constructor() {
    super("ending");
  }

  create() {
    unlockAudio();
    playMusic("title");
    this.cameras.main.setBackgroundColor(0x0c0814);
    const bg = this.textures.exists("bg-thrones") ? "bg-thrones" : "bg-vault";
    this.add.image(VIEW_W / 2, VIEW_H / 2, bg).setDisplaySize(VIEW_W, VIEW_H);
    this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x0c0814, 0.45);

    this.add.rectangle(VIEW_W / 2, 18, VIEW_W, 32, 0x0c0814, 0.7);
    px(this, VIEW_W / 2, 8, "BLOODLINES OF THE DIVIDE", 8, "#e8b84a").setOrigin(0.5, 0);

    const epilogue: string[] = [];
    if (G.flags.boughtHammer && G.flags.boughtMateria) {
      epilogue.push(...DIALOGUE.ending_armed);
    } else {
      epilogue.push(...DIALOGUE.ending_bare);
    }
    this.lines = [...DIALOGUE.ending, ...epilogue, ...DIALOGUE.ending_credits];
    this.index = 0;

    this.label = px(this, VIEW_W / 2, 110, "", 7, "#f0e6c8").setOrigin(0.5, 0);
    this.sub = px(this, VIEW_W / 2, 248, "Z  ADVANCE     X  TITLE", 6, "#e8b84a").setOrigin(0.5, 0);
    this.refresh();
  }

  refresh() {
    const line = this.lines[this.index] ?? "";
    this.label?.setText(wrap(line, 42));
  }

  finish() {
    sfx("ok");
    // Park post-game free-roam at the hub; keep ending flag + boss progress.
    G.map = "hub";
    G.tx = 13;
    G.ty = 10;
    G.flags.ending = true;
    writeSave();
    this.scene.stop("overworld");
    this.scene.stop("battle");
    this.scene.start("title");
  }

  update() {
    if (consumeCancel()) {
      this.finish();
      return;
    }
    if (consumeConfirm()) {
      sfx("menu");
      this.index += 1;
      if (this.index >= this.lines.length) this.finish();
      else this.refresh();
    }
  }
}
