import Phaser from "phaser";
import { playMusic, sfx, unlockAudio } from "../audio";
import { addPresentationFx } from "../art";
import { SUBTITLE, TITLE } from "../database";
import { axis, consumeCancel, consumeConfirm } from "../input";
import { hasCleared, hasSave, loadSave } from "../save";
import { resetGame } from "../state";
import { VIEW_H, VIEW_W } from "../types";
import { px, windowBox, wrap } from "../ui";

type Mode = "menu" | "howto" | "codex";

export class TitleScene extends Phaser.Scene {
  private cursor = 0;
  private mode: Mode = "menu";
  private items: string[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private overlay?: Phaser.GameObjects.GameObject[];
  private lastNav = 0;

  constructor() {
    super("title");
  }

  init() {
    this.cursor = 0;
    this.mode = "menu";
    this.items = [];
    this.labels = [];
    this.overlay = undefined;
  }

  create() {
    playMusic("title");
    px(this, VIEW_W / 2, VIEW_H - 18, "OST: TWILIGHT ZONE TIME — NA404ERROR  ·  M mute/unmute", 5, "#8a7a55").setOrigin(0.5, 1);

    this.add.image(VIEW_W / 2, VIEW_H / 2, "title").setDisplaySize(VIEW_W, VIEW_H);
    this.add.rectangle(VIEW_W / 2, 22, VIEW_W, 40, 0x0c0814, 0.55);
    px(this, VIEW_W / 2, 8, TITLE, 10, "#e8b84a").setOrigin(0.5, 0);
    px(this, VIEW_W / 2, 24, SUBTITLE, 7, "#f0e6c8").setOrigin(0.5, 0);
    addPresentationFx(this, 0xe8b84a);

    this.items = hasSave()
      ? ["NEW GAME", "CONTINUE", "HOW TO PLAY", "CODEX"]
      : ["NEW GAME", "HOW TO PLAY", "CODEX"];
    const startY = 198;
    const startX = VIEW_W / 2 - 70;
    this.labels = this.items.map((item, i) =>
      px(this, startX, startY + i * 12, item, 7, "#f0e6c8"),
    );
    this.refresh();
    if (hasCleared()) {
      px(this, VIEW_W / 2, 186, "DIVIDE CLEARED — CONTINUE FOR FREE ROAM", 6, "#e8b84a").setOrigin(0.5, 0);
    }

    this.input.keyboard?.on("keydown", () => unlockAudio());
    this.input.on("pointerdown", () => unlockAudio());
  }

  refresh() {
    this.labels.forEach((lab, i) => {
      const on = i === this.cursor;
      lab.setText(`${on ? ">" : " "} ${this.items[i]}`);
      lab.setColor(on ? "#e8b84a" : "#f0e6c8");
    });
  }

  update(time: number) {
    if (this.mode !== "menu") {
      if (consumeConfirm() || consumeCancel()) {
        sfx("menu");
        this.clearOverlay();
        this.mode = "menu";
      }
      return;
    }
    const a = axis();
    if (time - this.lastNav > 140) {
      if (a.y > 0) {
        this.cursor = (this.cursor + 1) % this.items.length;
        this.lastNav = time;
        sfx("menu");
        this.refresh();
      } else if (a.y < 0) {
        this.cursor = (this.cursor - 1 + this.items.length) % this.items.length;
        this.lastNav = time;
        sfx("menu");
        this.refresh();
      }
    }
    if (consumeConfirm()) this.choose();
  }

  choose() {
    sfx("ok");
    unlockAudio();
    const pick = this.items[this.cursor];
    if (pick === "NEW GAME") {
      resetGame();
      this.scene.stop("title");
      this.scene.start("intro");
    } else if (pick === "CONTINUE") {
      if (loadSave()) this.scene.start("overworld", { fresh: false });
      else sfx("no");
    } else if (pick === "HOW TO PLAY") {
      this.mode = "howto";
      this.showHow();
    } else if (pick === "CODEX") {
      this.scene.start("gallery", { ret: "title", start: 0 });
    }
  }

  showHow() {
    const box = windowBox(this, 24, 48, 432, 176, 80);
    const t = px(
      this,
      36,
      60,
      wrap(
        "THE CULTURE WAR — 9/11/01 wakes Baki The Hammer. WASD move. Z confirm, X menu, M mute OST (TWILIGHT ZONE TIME / NA404ERROR). Blue: Woke Retards 1.0/2.0. Red: MAGA/MIGA Zionist Chuds. Both theaters → Instructors → gold gate. Smash Illuminati bloodlines (Rothschild→Merovingian). CONSPIRE: Control/Neutralize/Destroy + summons. Skills + Common Sense Mend. Do not be Re-Educated.",
        34,
      ),
      7,
      "#f0e6c8",
    ).setDepth(81);
    const hint = px(this, VIEW_W / 2, 204, "Z / X TO CLOSE", 7, "#e8b84a").setOrigin(0.5, 0).setDepth(81);
    this.overlay = [box, t, hint];
  }

  showCodex() {
    const img = this.add.image(VIEW_W / 2, VIEW_H / 2, "codex").setDisplaySize(420, 236).setDepth(80);
    const hint = px(this, VIEW_W / 2, 8, "ASSET CODEX  —  Z CLOSE", 7, "#e8b84a").setOrigin(0.5, 0).setDepth(81);
    this.overlay = [img, hint];
  }

  clearOverlay() {
    this.overlay?.forEach((o) => o.destroy());
    this.overlay = [];
  }
}
