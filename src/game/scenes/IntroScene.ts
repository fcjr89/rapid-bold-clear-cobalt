import Phaser from "phaser";
import { playMusic, sfx, unlockAudio } from "../audio";
import { DIALOGUE } from "../database";
import { consumeCancel, consumeConfirm } from "../input";
import { G } from "../state";
import { VIEW_H, VIEW_W } from "../types";
import { px, wrap } from "../ui";

export class IntroScene extends Phaser.Scene {
  private index = 0;
  private label?: Phaser.GameObjects.Text;
  private hint?: Phaser.GameObjects.Text;

  constructor() {
    super("intro");
  }

  create() {
    playMusic("intro");
    this.cameras.main.setBackgroundColor(0x0c0814);
    const key = this.textures.exists("opening") ? "opening" : "title";
    this.add.image(VIEW_W / 2, VIEW_H / 2, key).setDisplaySize(VIEW_W, VIEW_H);
    this.add.rectangle(VIEW_W / 2, 16, VIEW_W, 28, 0x0c0814, 0.55);
    px(this, VIEW_W / 2, 8, "9/11/01 — THE IGNITION", 7, "#e8b84a").setOrigin(0.5, 0);

    this.index = 0;
    this.label = px(this, VIEW_W / 2, 198, "", 7, "#f0e6c8").setOrigin(0.5, 0);
    this.hint = px(this, VIEW_W / 2, 248, "Z  ADVANCE     X  SKIP", 6, "#e8b84a").setOrigin(0.5, 0);
    this.refresh();
    this.input.keyboard?.on("keydown", () => unlockAudio());
  }

  refresh() {
    const line = DIALOGUE.intro[this.index] ?? "";
    this.label?.setText(wrap(line, 40));
  }

  finish() {
    sfx("ok");
    G.flags.introSeen = true;
    this.scene.start("overworld", { fresh: true });
  }

  update() {
    if (consumeCancel()) {
      this.finish();
      return;
    }
    if (consumeConfirm()) {
      sfx("menu");
      this.index += 1;
      if (this.index >= DIALOGUE.intro.length) this.finish();
      else this.refresh();
    }
  }
}
