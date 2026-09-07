import Phaser from "phaser";
import { playMusic, sfx } from "../audio";
import { ENEMIES, ITEMS, SKILLS } from "../database";
import { axis, consumeCancel, consumeConfirm } from "../input";
import { addStatus, defeatBoss, G, grantXp, hasStatus, tickStatuses } from "../state";
import type { EnemyDef, ItemId, SkillId } from "../types";
import { VIEW_H, VIEW_W } from "../types";
import { bar, px, windowBox, wrap } from "../ui";
import type { OverworldScene } from "./OverworldScene";

type Menu = "main" | "skills" | "items" | "busy" | "end";

export class BattleScene extends Phaser.Scene {
  private enemy!: EnemyDef;
  private eHp = 0;
  private eMp = 0;
  private eAtk = 0;
  private eDef = 0;
  private eBuff = 0;
  private menu: Menu = "main";
  private cursor = 0;
  private lastNav = 0;
  private log: Phaser.GameObjects.Text[] = [];
  private heroSpr!: Phaser.GameObjects.Sprite;
  private foeSpr!: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private hpBar!: Phaser.GameObjects.Graphics;
  private mpBar!: Phaser.GameObjects.Graphics;
  private eBar!: Phaser.GameObjects.Graphics;
  private menuLabels: Phaser.GameObjects.Text[] = [];
  private menuTitle!: Phaser.GameObjects.Text;
  private statusTxt!: Phaser.GameObjects.Text;
  private ended = false;
  private mini?: "red" | "blue";
  private mainItems = ["ATTACK", "SKILLS", "ITEM", "FLEE"];

  constructor() {
    super("battle");
  }

  init(data: { mini?: "red" | "blue" }) {
    this.menu = "main";
    this.cursor = 0;
    this.ended = false;
    this.eBuff = 0;
    this.log = [];
    this.menuLabels = [];
    this.mini = data?.mini;
    const id = G.pendingEncounter?.enemyIds[0] ?? "echo_chamber_slime";
    this.enemy = ENEMIES[id] ?? ENEMIES.echo_chamber_slime!;
    this.eHp = this.enemy.hp;
    this.eMp = this.enemy.mp;
    this.eAtk = this.enemy.atk;
    this.eDef = this.enemy.def;
  }

  create() {
    const bgKey = G.pendingEncounter?.bg ?? "bg-vault";
    this.cameras.main.setBackgroundColor(0x0c0814);
    this.add.image(VIEW_W / 2, VIEW_H / 2, this.textures.exists(bgKey) ? bgKey : "bg-vault").setDisplaySize(VIEW_W, VIEW_H);
    this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x0c0814, 0.18);

    playMusic(this.enemy.kind === "boss" || this.enemy.kind === "final" || this.enemy.kind === "miniboss" ? "boss" : "battle");

    const portrait = this.enemy.portrait;
    if (portrait && this.textures.exists(portrait)) {
      this.foeSpr = this.add.image(118, 96, portrait);
      this.foeSpr.setDisplaySize(112, 168);
    } else {
      this.foeSpr = this.add.sprite(142, 102, this.enemy.sprite, 0);
      this.foeSpr.setScale(this.enemy.scale ?? 1.0);
      const idle = `${this.enemy.sprite}-idle`;
      if (this.anims.exists(idle)) (this.foeSpr as Phaser.GameObjects.Sprite).play(idle);
    }
    if (this.enemy.tint) this.foeSpr.setTint(this.enemy.tint);

    this.heroSpr = this.add.sprite(368, 148, "baki-idle", 0);
    this.heroSpr.setScale(0.68);
    if (this.anims.exists("baki-idle-b")) this.heroSpr.play("baki-idle-b");

    windowBox(this, 8, 8, 260, 36);
    px(this, 16, 16, this.enemy.name, 7, "#e8b84a");
    this.eBar = bar(this, 16, 30, 240, 6, 1, 0xc41e3a);

    windowBox(this, 286, 8, 186, 52);
    if (this.textures.exists("art-baki-head")) {
      this.add.image(304, 34, "art-baki-head").setDisplaySize(32, 32);
    } else if (this.textures.exists("baki-portrait")) {
      this.add.image(302, 34, "baki-portrait").setDisplaySize(28, 28);
    }
    px(this, 334, 14, "BAKI", 7, "#e8b84a");
    this.hpBar = bar(this, 334, 26, 128, 6, 1, 0xc41e3a);
    this.mpBar = bar(this, 334, 36, 128, 6, 1, 0x2a4a9a);
    this.statusTxt = px(this, 334, 46, "", 6, "#7a8aa0");

    windowBox(this, 8, 168, 160, 94);
    this.menuTitle = px(this, 16, 176, "COMMAND", 7, "#e8b84a");
    this.menuLabels = [0, 1, 2, 3].map((i) => px(this, 16, 190 + i * 14, "", 7));

    windowBox(this, 176, 168, 296, 94);
    this.log = [0, 1, 2, 3, 4].map((i) => px(this, 184, 176 + i * 14, "", 6, "#f0e6c8"));

    this.say(this.enemy.intro);
    this.drawMenu();
    this.drawBars();
  }

  say(msg: string) {
    const lines = wrap(msg, 28).split("\n");
    for (const line of lines) {
      for (let i = 0; i < this.log.length - 1; i++) {
        this.log[i]!.setText(this.log[i + 1]!.text);
      }
      this.log[this.log.length - 1]!.setText(line);
    }
  }

  drawBars() {
    this.hpBar.destroy();
    this.mpBar.destroy();
    this.eBar.destroy();
    this.hpBar = bar(this, 334, 26, 128, 6, G.hero.hp / G.hero.maxHp, 0xc41e3a);
    this.mpBar = bar(this, 334, 36, 128, 6, G.hero.mp / G.hero.maxMp, 0x2a4a9a);
    this.eBar = bar(this, 16, 30, 240, 6, this.eHp / this.enemy.hp, 0xc41e3a);
    const st = G.statuses.map((s) => s.name).join(" · ") || "TRUE NEUTRAL";
    this.statusTxt.setText(st);
  }

  options(): string[] {
    if (this.menu === "main") return this.mainItems;
    if (this.menu === "skills") return SKILLS.map((s) => `${s.name} ${s.mp}MP`);
    if (this.menu === "items") {
      return ITEMS.map((it) => `${it.name} x${G.hero.items[it.id]}`);
    }
    return [];
  }

  drawMenu() {
    const opts = this.options();
    this.menuTitle.setText(this.menu === "skills" ? "SKILLS" : this.menu === "items" ? "ITEMS" : "COMMAND");
    this.menuLabels.forEach((lab, i) => {
      const opt = opts[i];
      if (!opt) {
        lab.setText("");
        return;
      }
      const on = i === this.cursor;
      lab.setText(`${on ? ">" : " "} ${opt}`);
      lab.setColor(on ? "#e8b84a" : "#f0e6c8");
    });
  }

  update(time: number) {
    if (this.ended || this.menu === "busy" || this.menu === "end") {
      if (this.ended && consumeConfirm()) this.finish();
      return;
    }
    const a = axis();
    const opts = this.options();
    if (time - this.lastNav > 130 && opts.length) {
      if (a.y > 0) {
        this.cursor = (this.cursor + 1) % opts.length;
        this.lastNav = time;
        sfx("menu");
        this.drawMenu();
      } else if (a.y < 0) {
        this.cursor = (this.cursor - 1 + opts.length) % opts.length;
        this.lastNav = time;
        sfx("menu");
        this.drawMenu();
      }
    }
    if (consumeCancel()) {
      if (this.menu !== "main") {
        this.menu = "main";
        this.cursor = 0;
        sfx("menu");
        this.drawMenu();
      }
      return;
    }
    if (consumeConfirm()) this.pick();
  }

  pick() {
    if (this.menu === "main") {
      const c = this.mainItems[this.cursor];
      if (c === "ATTACK") this.playerAttack();
      else if (c === "SKILLS") {
        this.menu = "skills";
        this.cursor = 0;
        sfx("ok");
        this.drawMenu();
      } else if (c === "ITEM") {
        this.menu = "items";
        this.cursor = 0;
        sfx("ok");
        this.drawMenu();
      } else if (c === "FLEE") this.tryFlee();
      return;
    }
    if (this.menu === "skills") {
      const sk = SKILLS[this.cursor];
      if (sk) this.useSkill(sk.id);
      return;
    }
    if (this.menu === "items") {
      const it = ITEMS[this.cursor];
      if (it) this.useItem(it.id);
    }
  }

  lock() {
    this.menu = "busy";
  }

  unlockToPlayer() {
    if (this.ended) return;
    this.menu = "main";
    this.cursor = 0;
    this.drawMenu();
  }

  dmg(atk: number, def: number, mult = 1) {
    const raw = (atk * 1.2 - def * 0.5) * mult * (0.86 + Math.random() * 0.28);
    const crit = Math.random() < 0.08;
    const n = Math.max(1, Math.floor(raw * (crit ? 1.55 : 1)));
    return { n, crit };
  }

  playerAttack() {
    this.lock();
    sfx("ok");
    this.heroSpr.play("baki-atk");
    this.cameras.main.shake(120, 0.006);
    const { n, crit } = this.dmg(G.hero.atk, this.eDef + (this.eBuff > 0 ? 2 : 0));
    this.eHp = Math.max(0, this.eHp - n);
    this.say(crit ? `Critical! Hammer hits ${n}.` : `Baki hammers for ${n}.`);
    sfx(crit ? "crit" : "hit");
    this.hitFlash(this.foeSpr);
    this.drawBars();
    this.time.delayedCall(480, () => {
      this.heroSpr.play("baki-idle-b");
      this.afterPlayer();
    });
  }

  useSkill(id: SkillId) {
    const sk = SKILLS.find((s) => s.id === id)!;
    if (G.hero.mp < sk.mp) {
      sfx("no");
      this.say("Not enough MP.");
      return;
    }
    this.lock();
    G.hero.mp -= sk.mp;
    this.heroSpr.play("baki-atk");
    if (id === "hammer_clarity") {
      const { n, crit } = this.dmg(G.hero.atk, this.eDef, 1.25);
      this.eHp = Math.max(0, this.eHp - n);
      this.eBuff = 0;
      this.say(crit ? `Clarity CRIT ${n}. Buffs stripped.` : `Clarity smash ${n}. Buffs stripped.`);
      sfx("crit");
    } else if (id === "mute_counter") {
      addStatus({ id: "mute_armed", name: "MUTE ARMED", turns: 3 });
      this.say("Mute Button armed. Lectures will rebound.");
      sfx("ok");
    } else if (id === "independent") {
      addStatus({ id: "independent", name: "INDEPENDENT", turns: 3 });
      G.statuses = G.statuses.filter((s) => s.id !== "reeducate");
      G.alignment = "neutral";
      this.say("Independent Stance. Re-Educate slides off.");
      sfx("heal");
    } else if (id === "fact_check") {
      const bonus = this.enemy.media ? 1.65 : 1.12;
      const { n, crit } = this.dmg(G.hero.atk, this.eDef, bonus);
      this.eHp = Math.max(0, this.eHp - n);
      this.say(
        this.enemy.media
          ? `Fact Check vs media! ${n}${crit ? " CRIT" : ""}`
          : `Fact Check smash ${n}.`,
      );
      sfx(this.enemy.media ? "crit" : "hit");
    }
    this.cameras.main.shake(140, 0.008);
    this.hitFlash(this.foeSpr);
    this.drawBars();
    this.time.delayedCall(500, () => {
      this.heroSpr.play("baki-idle-b");
      this.afterPlayer();
    });
  }

  useItem(id: ItemId) {
    if (G.hero.items[id] <= 0) {
      sfx("no");
      this.say("None left.");
      return;
    }
    this.lock();
    G.hero.items[id] -= 1;
    if (id === "potion") {
      const heal = Math.min(50, G.hero.maxHp - G.hero.hp);
      G.hero.hp += heal;
      this.say(`Potion restores ${heal} HP.`);
      sfx("heal");
    } else if (id === "ether") {
      const m = Math.min(20, G.hero.maxMp - G.hero.mp);
      G.hero.mp += m;
      this.say(`Ether restores ${m} MP.`);
      sfx("heal");
    } else {
      G.statuses = G.statuses.filter((s) => s.id !== "reeducate");
      G.alignment = "neutral";
      this.say("Neutralizer. Alignment recentered.");
      sfx("heal");
    }
    this.drawBars();
    this.time.delayedCall(400, () => this.afterPlayer());
  }

  tryFlee() {
    this.lock();
    if (G.pendingEncounter?.cannotFlee) {
      sfx("no");
      this.say("You cannot flee this fight.");
      this.time.delayedCall(350, () => this.unlockToPlayer());
      return;
    }
    const chance = this.enemy.kind === "boss" || this.enemy.kind === "final" ? 0.15 : 0.55;
    if (Math.random() < chance) {
      sfx("ok");
      this.say("Got away.");
      this.time.delayedCall(400, () => this.close(false, true));
    } else {
      sfx("no");
      this.say("Couldn't run!");
      this.time.delayedCall(400, () => this.afterPlayer());
    }
  }

  afterPlayer() {
    this.drawBars();
    if (this.eHp <= 0) {
      this.victory();
      return;
    }
    this.time.delayedCall(280, () => this.enemyAct());
  }

  enemyAct() {
    if (this.ended) return;
    const acts = this.enemy.actions;
    let act = acts[Math.floor(Math.random() * acts.length)] ?? "attack";
    if (this.eHp < this.enemy.hp * 0.35 && acts.includes("special") && Math.random() < 0.5) act = "special";

    if (act === "lecture") {
      if (hasStatus("mute_armed")) {
        G.statuses = G.statuses.filter((s) => s.id !== "mute_armed");
        const { n } = this.dmg(G.hero.atk, this.eDef, 1.1);
        this.eHp = Math.max(0, this.eHp - n);
        this.say(`Lecture muted. Counter ${n}!`);
        sfx("crit");
        this.hitFlash(this.foeSpr);
        this.drawBars();
        if (this.eHp <= 0) {
          this.victory();
          return;
        }
        this.endRound();
        return;
      }
      const { n } = this.dmg(this.eAtk, G.hero.def, 0.75);
      this.applyHeroDmg(n, `${this.enemy.name} lectures for ${n}.`);
      if ((this.enemy.canReeducate || this.enemy.lecture) && Math.random() < 0.45) this.tryReeducate();
      this.endRound();
      return;
    }
    if (act === "buff") {
      this.eBuff = 3;
      this.eAtk = this.enemy.atk + 4;
      this.say(`${this.enemy.name} rallies. ATK up.`);
      sfx("menu");
      this.endRound();
      return;
    }
    if (act === "special") {
      const { n } = this.dmg(this.eAtk, G.hero.def, 1.45);
      this.applyHeroDmg(n, `${this.enemy.specialName ?? "Special"} hits ${n}!`);
      if (this.enemy.canReeducate && Math.random() < 0.6) this.tryReeducate();
      this.endRound();
      return;
    }
    const { n, crit } = this.dmg(this.eAtk, G.hero.def, 1);
    this.applyHeroDmg(n, crit ? `${this.enemy.name} CRIT ${n}!` : `${this.enemy.name} hits ${n}.`);
    this.endRound();
  }

  applyHeroDmg(n: number, msg: string) {
    let d = n;
    if (hasStatus("reeducate")) d = Math.floor(d * 1.2);
    G.hero.hp = Math.max(0, G.hero.hp - d);
    this.say(msg);
    sfx("hit");
    this.cameras.main.shake(160, 0.01);
    this.hitFlash(this.heroSpr);
    this.drawBars();
  }

  tryReeducate() {
    if (hasStatus("independent")) {
      this.say("Independent Stance: Re-Educate fails.");
      return;
    }
    const side = Math.random() < 0.5 ? "left" : "right";
    addStatus({ id: "reeducate", name: `RE-EDUCATED (${side.toUpperCase()})`, turns: 3, alignment: side });
    this.say(`Re-Educate! Temporary ${side} shift.`);
    sfx("no");
    this.drawBars();
  }

  endRound() {
    if (G.hero.hp <= 0) {
      this.defeat();
      return;
    }
    if (this.eBuff > 0) {
      this.eBuff -= 1;
      if (this.eBuff <= 0) this.eAtk = this.enemy.atk;
    }
    const msgs = tickStatuses();
    for (const m of msgs) this.say(m);
    this.drawBars();
    this.time.delayedCall(200, () => this.unlockToPlayer());
  }

  victory() {
    this.ended = true;
    this.menu = "end";
    sfx("win");
    playMusic("none");
    this.foeSpr.setTint(0x444444);
    this.tweens.add({ targets: this.foeSpr, alpha: 0, y: this.foeSpr.y + 10, duration: 500 });
    const notes = grantXp(this.enemy.xp);
    G.hero.gold += this.enemy.gold;
    if (Math.random() < 0.4) G.hero.items.potion += 1;
    if (this.enemy.kind !== "regular") defeatBoss(this.enemy.id);
    if (this.mini === "red") defeatBoss("reeducation_instructor_red");
    if (this.mini === "blue") defeatBoss("reeducation_instructor_blue");
    this.say(`Victory! +${this.enemy.xp} XP  +${this.enemy.gold}G`);
    for (const n of notes) this.say(n);
    this.say("Z to continue.");
    this.drawBars();
  }

  defeat() {
    this.ended = true;
    this.menu = "end";
    sfx("lose");
    playMusic("none");
    this.say("Baki falls...");
    this.say("Z to continue.");
  }

  finish() {
    const won = G.hero.hp > 0 && this.eHp <= 0;
    const fled = G.hero.hp > 0 && this.eHp > 0;
    this.close(won, fled);
  }

  close(won: boolean, fled: boolean) {
    const over = this.scene.get("overworld") as OverworldScene;
    this.scene.stop("battle");
    over.onBattleOver({
      won,
      fled,
      enemyId: this.enemy.id,
      mini: this.mini,
    });
  }

  hitFlash(spr: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite) {
    this.tweens.add({
      targets: spr,
      x: spr.x + (spr === this.foeSpr ? -8 : 8),
      duration: 60,
      yoyo: true,
      repeat: 2,
    });
    spr.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      spr.clearTint();
      if (spr === this.foeSpr && this.enemy.tint) spr.setTint(this.enemy.tint);
    });
  }
}
