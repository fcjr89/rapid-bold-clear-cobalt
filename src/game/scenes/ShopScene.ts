import Phaser from "phaser";
import { sfx } from "../audio";
import { axis, consumeCancel, consumeConfirm } from "../input";
import { writeSave } from "../save";
import { G, healFull } from "../state";
import { VIEW_H, VIEW_W } from "../types";
import { px, windowBox } from "../ui";

type Ware = { name: string; cost: number; kind: "rest" | "potion" | "ether" | "neutralizer" | "hammer" | "materia" | "leave" };

const WARES: Ware[] = [
  { name: "REST — heal & save", cost: 0, kind: "rest" },
  { name: "POTION", cost: 20, kind: "potion" },
  { name: "ETHER", cost: 30, kind: "ether" },
  { name: "NEUTRALIZER", cost: 25, kind: "neutralizer" },
  { name: "IRON HAMMER  ATK+4", cost: 60, kind: "hammer" },
  { name: "TRUE-NEUTRAL MATERIA  MP+8", cost: 45, kind: "materia" },
  { name: "LEAVE", cost: 0, kind: "leave" },
];

/** Shop owner painting as the storefront. Buy weapons, items, materia. */
export class ShopScene extends Phaser.Scene {
  private cursor = 0;
  private lastNav = 0;
  private labels: Phaser.GameObjects.Text[] = [];
  private log?: Phaser.GameObjects.Text;
  private gold?: Phaser.GameObjects.Text;

  constructor() {
    super("shop");
  }

  init() {
    this.cursor = 0;
    this.labels = [];
  }

  create() {
    this.scene.bringToTop("shop");
    this.cameras.main.setBackgroundColor(0x0c0814);
    const bg = this.textures.exists("art-innkeeper") ? "art-innkeeper" : "bg-tavern";
    this.add.image(VIEW_W / 2, VIEW_H / 2, bg).setDisplaySize(VIEW_W, VIEW_H);
    this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x0c0814, 0.35);

    windowBox(this, 8, 8, 300, 24);
    px(this, 16, 14, "COMMON SENSE EMPORIUM", 7, "#e8b84a");
    this.gold = px(this, 16, 36, "", 6, "#e8b84a");

    windowBox(this, 8, 50, 248, 132);
    this.labels = WARES.map((_, i) => px(this, 16, 58 + i * 16, "", 6, "#f0e6c8"));

    windowBox(this, 8, 190, 464, 70);
    this.log = px(this, 16, 200, "Weapons. Items. Materia. No slogans.", 6, "#f0e6c8");
    px(this, 16, 232, "Z BUY     X LEAVE", 6, "#7a8aa0");

    this.refresh();
  }

  labelOf(w: Ware): string {
    if (w.kind === "rest" || w.kind === "leave") return w.name;
    if (w.kind === "hammer") return G.flags.boughtHammer ? "IRON HAMMER  SOLD" : `${w.name}  ${w.cost}G`;
    if (w.kind === "materia") return G.flags.boughtMateria ? "MATERIA  SOLD" : `${w.name}  ${w.cost}G`;
    const held = w.kind === "potion" ? G.hero.items.potion : w.kind === "ether" ? G.hero.items.ether : G.hero.items.neutralizer;
    return `${w.name} x${held}   ${w.cost}G`;
  }

  refresh() {
    this.gold?.setText(`GOLD ${G.hero.gold}`);
    this.labels.forEach((lab, i) => {
      const on = i === this.cursor;
      lab.setText(`${on ? ">" : " "} ${this.labelOf(WARES[i]!)}`);
      lab.setColor(on ? "#e8b84a" : "#f0e6c8");
    });
  }

  say(msg: string) {
    this.log?.setText(msg);
  }

  buy() {
    const w = WARES[this.cursor]!;
    if (w.kind === "leave") {
      this.leave();
      return;
    }
    if (w.kind === "rest") {
      healFull();
      writeSave();
      sfx("ok");
      this.say("Stew. Bed. Saved. HP and MP full.");
      this.refresh();
      return;
    }
    if (w.kind === "hammer") {
      if (G.flags.boughtHammer) {
        sfx("no");
        this.say("You already carry the iron hammer.");
        return;
      }
      if (G.hero.gold < w.cost) {
        sfx("no");
        this.say("Not enough gold.");
        return;
      }
      G.hero.gold -= w.cost;
      G.flags.boughtHammer = true;
      G.hero.atk += 4;
      writeSave();
      sfx("ok");
      this.say("A heavier head. ATK +4.");
      this.refresh();
      return;
    }
    if (w.kind === "materia") {
      if (G.flags.boughtMateria) {
        sfx("no");
        this.say("The materia already sits in your palm.");
        return;
      }
      if (G.hero.gold < w.cost) {
        sfx("no");
        this.say("Not enough gold.");
        return;
      }
      G.hero.gold -= w.cost;
      G.flags.boughtMateria = true;
      G.hero.maxMp += 8;
      G.hero.mp += 8;
      writeSave();
      sfx("ok");
      this.say("True-Neutral materia. Max MP +8.");
      this.refresh();
      return;
    }
    if (G.hero.gold < w.cost) {
      sfx("no");
      this.say("Not enough gold.");
      return;
    }
    G.hero.gold -= w.cost;
    if (w.kind === "potion") G.hero.items.potion += 1;
    if (w.kind === "ether") G.hero.items.ether += 1;
    if (w.kind === "neutralizer") G.hero.items.neutralizer += 1;
    writeSave();
    sfx("ok");
    this.say(`Purchased ${w.name}.`);
    this.refresh();
  }

  leave() {
    sfx("ok");
    this.scene.stop();
    this.game.scene.resume("overworld");
  }

  update(time: number) {
    const a = axis();
    if (time - this.lastNav > 140) {
      if (a.y > 0) {
        this.cursor = (this.cursor + 1) % WARES.length;
        this.lastNav = time;
        sfx("menu");
        this.refresh();
      } else if (a.y < 0) {
        this.cursor = (this.cursor - 1 + WARES.length) % WARES.length;
        this.lastNav = time;
        sfx("menu");
        this.refresh();
      }
    }
    if (consumeCancel()) this.leave();
    else if (consumeConfirm()) this.buy();
  }
}
