import Phaser from "phaser";
import { addPresentationFx } from "../art";
import { playMusic, sfx, unlockAudio } from "../audio";
import { DIALOGUE, endingLean } from "../database";
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
  private finished = false;

  constructor() {
    super("ending");
  }

  create() {
    unlockAudio();
    playMusic("final");
    this.finished = false;
    this.cameras.main.setBackgroundColor(0x0c0814);
    const bg = this.textures.exists("bg-thrones") ? "bg-thrones" : "bg-vault";
    this.add.image(VIEW_W / 2, VIEW_H / 2, bg).setDisplaySize(VIEW_W, VIEW_H);
    this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x0c0814, 0.45);
    addPresentationFx(this, 0xc41e3a);

    this.add.rectangle(VIEW_W / 2, 18, VIEW_W, 32, 0x0c0814, 0.7);
    px(this, VIEW_W / 2, 8, "THE CULTURE WAR", 8, "#e8b84a").setOrigin(0.5, 0);

    const lean = endingLean(G.flags.redWins, G.flags.blueWins);
    const leanLines =
      lean === "left" ? DIALOGUE.ending_left : lean === "right" ? DIALOGUE.ending_right : DIALOGUE.ending_neutral;
    const gearLines =
      G.flags.boughtHammer && G.flags.boughtMateria ? DIALOGUE.ending_armed : DIALOGUE.ending_bare;

    this.lines = [...DIALOGUE.ending, ...leanLines, ...gearLines, ...DIALOGUE.ending_credits];
    this.index = 0;

    this.label = px(this, VIEW_W / 2, 100, "", 7, "#f0e6c8").setOrigin(0.5, 0);
    this.sub = px(this, VIEW_W / 2, 248, "Z  ADVANCE     X  SKIP TO CHOICE", 6, "#e8b84a").setOrigin(0.5, 0);
    this.refresh();
  }

  refresh() {
    const line = this.lines[this.index] ?? "";
    this.label?.setText(wrap(line, 42));
    const last = this.index >= this.lines.length - 1;
    this.sub?.setText(last ? "Z  FREE ROAM HUB     X  TITLE" : "Z  ADVANCE     X  SKIP TO CHOICE");
  }

  /** Park post-game free-roam at the hub; keep ending flag + boss progress. */
  parkHub() {
    G.map = "hub";
    G.tx = 13;
    G.ty = 10;
    G.flags.ending = true;
    writeSave();
  }

  goTitle() {
    if (this.finished) return;
    this.finished = true;
    sfx("ok");
    this.parkHub();
    this.scene.stop("overworld");
    this.scene.stop("battle");
    this.scene.stop("ending");
    this.scene.start("title");
  }

  goFreeRoam() {
    if (this.finished) return;
    this.finished = true;
    sfx("ok");
    this.parkHub();
    this.scene.stop("battle");
    this.scene.stop("ending");
    // Restart overworld cleanly so the player is never softlocked on a dead scene.
    this.scene.stop("overworld");
    this.scene.start("overworld", { fresh: false });
  }

  update() {
    if (this.finished) return;
    if (consumeCancel()) {
      // On last line (or skip): title. Mid-credits skip jumps to choice line.
      if (this.index >= this.lines.length - 1) this.goTitle();
      else {
        this.index = this.lines.length - 1;
        this.refresh();
      }
      return;
    }
    if (consumeConfirm()) {
      sfx("menu");
      if (this.index >= this.lines.length - 1) {
        this.goFreeRoam();
        return;
      }
      this.index += 1;
      this.refresh();
    }
  }
}
