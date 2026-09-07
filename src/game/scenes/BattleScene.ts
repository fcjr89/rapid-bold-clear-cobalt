import Phaser from "phaser";
import { resolvePortrait } from "../art";
import { playMusic, sfx } from "../audio";
import { ENEMIES, ITEM_HEAL, ITEMS, SKILLS } from "../database";
import { axis, consumeCancel, consumeConfirm } from "../input";
import { addStatus, defeatBoss, G, grantXp, hasStatus, tickStatuses } from "../state";
import type { EnemyActionId, EnemyDef, ItemId, SkillId } from "../types";
import { VIEW_H, VIEW_W } from "../types";
import { bar, px, windowBox, wrap } from "../ui";
import type { OverworldScene } from "./OverworldScene";

type Menu = "main" | "skills" | "items" | "busy" | "end";

interface Foe {
  def: EnemyDef;
  hp: number;
  mp: number;
  atk: number;
  defStat: number;
  buff: number;
  spr: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  nameLab: Phaser.GameObjects.Text;
  hpBar: Phaser.GameObjects.Graphics;
  hpNum: Phaser.GameObjects.Text;
  cursor: Phaser.GameObjects.Text;
  dead: boolean;
}

export class BattleScene extends Phaser.Scene {
  private foes: Foe[] = [];
  private target = 0;
  private menu: Menu = "main";
  private cursor = 0;
  private lastNav = 0;
  private log: Phaser.GameObjects.Text[] = [];
  private heroSpr!: Phaser.GameObjects.Sprite;
  private hpBar!: Phaser.GameObjects.Graphics;
  private mpBar!: Phaser.GameObjects.Graphics;
  private menuLabels: Phaser.GameObjects.Text[] = [];
  private menuTitle!: Phaser.GameObjects.Text;
  private statusTxt!: Phaser.GameObjects.Text;
  private hpNum!: Phaser.GameObjects.Text;
  private mpNum!: Phaser.GameObjects.Text;
  private skillHint!: Phaser.GameObjects.Text;
  private targetHint!: Phaser.GameObjects.Text;
  private ended = false;
  private mini?: "red" | "blue";
  private mainItems = ["ATTACK", "SKILLS", "ITEM", "FLEE"];
  private foeActI = 0;

  constructor() {
    super("battle");
  }

  init(data: { mini?: "red" | "blue" }) {
    this.menu = "main";
    this.cursor = 0;
    this.ended = false;
    this.log = [];
    this.menuLabels = [];
    this.foes = [];
    this.target = 0;
    this.foeActI = 0;
    this.mini = data?.mini;
  }

  create() {
    const bgKey = G.pendingEncounter?.bg ?? "bg-vault";
    const bg =
      this.textures.exists(bgKey)
        ? bgKey
        : this.textures.exists(`fx-${bgKey}`)
          ? `fx-${bgKey}`
          : this.textures.exists("fx-bg-vault")
            ? "fx-bg-vault"
            : "bg-vault";
    this.cameras.main.setBackgroundColor(0x0c0814);
    if (this.textures.exists(bg)) {
      this.add.image(VIEW_W / 2, VIEW_H / 2, bg).setDisplaySize(VIEW_W, VIEW_H);
    }
    this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x0c0814, 0.18);

    const ids = G.pendingEncounter?.enemyIds?.length
      ? G.pendingEncounter.enemyIds
      : ["echo_chamber_slime"];
    const defs = ids.map((id) => ENEMIES[id] ?? ENEMIES.echo_chamber_slime!).slice(0, 3);
    const kind = defs[0]!.kind;
    playMusic(kind === "boss" || kind === "final" || kind === "miniboss" ? "boss" : "battle");

    const slots =
      defs.length === 1
        ? [{ x: 118, y: 96 }]
        : defs.length === 2
          ? [
              { x: 78, y: 100 },
              { x: 168, y: 92 },
            ]
          : [
              { x: 58, y: 108 },
              { x: 118, y: 88 },
              { x: 178, y: 108 },
            ];

    defs.forEach((def, i) => {
      const slot = slots[i]!;
      const scale = (def.scale ?? 1) * (defs.length > 1 ? 0.78 : 1);
      let spr: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
      const portrait = resolvePortrait(this, def.id, def.sprite);
      if (portrait && this.textures.exists(portrait) && defs.length === 1 && portrait.startsWith("art-")) {
        spr = this.add.image(slot.x, slot.y, portrait);
        spr.setDisplaySize(Math.floor(112 * scale), Math.floor(168 * scale));
      } else if (this.textures.exists(def.sprite)) {
        spr = this.add.sprite(slot.x + 20, slot.y + 6, def.sprite, 0);
        spr.setScale(scale);
        const idle = `${def.sprite}-idle`;
        if (this.anims.exists(idle)) (spr as Phaser.GameObjects.Sprite).play(idle);
      } else {
        const sil =
          def.faction === "right"
            ? "fx-enemy-red"
            : def.faction === "left"
              ? "fx-enemy-blue"
              : def.kind === "boss" || def.kind === "final"
                ? "fx-enemy-gold"
                : "fx-enemy-sil";
        const key = this.textures.exists(sil) ? sil : this.textures.exists("fx-enemy-sil") ? "fx-enemy-sil" : def.sprite;
        spr = this.add.image(slot.x, slot.y, key);
        spr.setDisplaySize(Math.floor(72 * scale), Math.floor(96 * scale));
      }
      if (def.tint) spr.setTint(def.tint);

      const barY = 8 + i * 22;
      windowBox(this, 8, barY, 220, 20);
      const nameLab = px(this, 14, barY + 4, def.name.slice(0, 18), 5, "#e8b84a");
      const hpBar = bar(this, 14, barY + 12, 160, 4, 1, 0xc41e3a);
      const hpNum = px(this, 178, barY + 4, `${def.hp}`, 5, "#f0e6c8");
      const curs = px(this, slot.x - 36, slot.y - 40, "", 8, "#e8b84a").setOrigin(0.5);

      this.foes.push({
        def,
        hp: def.hp,
        mp: def.mp,
        atk: def.atk,
        defStat: def.def,
        buff: 0,
        spr,
        nameLab,
        hpBar,
        hpNum,
        cursor: curs,
        dead: false,
      });
    });

    this.heroSpr = this.add.sprite(368, 148, this.textures.exists("baki-idle") ? "baki-idle" : "fx-hero-sil", 0);
    if (this.textures.exists("baki-idle")) {
      this.heroSpr.setScale(0.68);
      if (this.anims.exists("baki-idle-b")) this.heroSpr.play("baki-idle-b");
    } else {
      this.heroSpr.setDisplaySize(64, 86);
    }

    windowBox(this, 286, 8, 186, 52);
    if (this.textures.exists("art-baki-head")) {
      this.add.image(304, 34, "art-baki-head").setDisplaySize(32, 32);
    } else if (this.textures.exists("baki-portrait")) {
      this.add.image(302, 34, "baki-portrait").setDisplaySize(28, 28);
    } else if (this.textures.exists("fx-hero-sil")) {
      this.add.image(302, 34, "fx-hero-sil").setDisplaySize(28, 28);
    }
    px(this, 334, 14, "BAKI", 7, "#e8b84a");
    this.hpBar = bar(this, 334, 26, 100, 6, 1, 0xc41e3a);
    this.mpBar = bar(this, 334, 36, 100, 6, 1, 0x2a4a9a);
    this.hpNum = px(this, 438, 24, "", 5, "#f0e6c8");
    this.mpNum = px(this, 438, 34, "", 5, "#8eb4ff");
    this.statusTxt = px(this, 334, 46, "", 6, "#7a8aa0");

    windowBox(this, 8, 168, 160, 94);
    this.menuTitle = px(this, 16, 176, "COMMAND", 7, "#e8b84a");
    this.menuLabels = [0, 1, 2, 3].map((i) => px(this, 16, 190 + i * 14, "", 7));
    this.skillHint = px(this, 16, 248, "", 5, "#7a8aa0");
    this.targetHint = px(this, 176, 156, "", 5, "#e8b84a");

    windowBox(this, 176, 168, 296, 94);
    this.log = [0, 1, 2, 3, 4].map((i) => px(this, 184, 176 + i * 14, "", 6, "#f0e6c8"));

    const intro =
      defs.length > 1
        ? `${defs.map((d) => d.name).join(" & ")} engage!`
        : defs[0]!.intro;
    this.say(intro);
    this.retarget();
    this.drawMenu();
    this.drawBars();
  }

  living(): Foe[] {
    return this.foes.filter((f) => !f.dead && f.hp > 0);
  }

  retarget() {
    const live = this.living();
    if (!live.length) return;
    if (this.foes[this.target]?.dead || (this.foes[this.target]?.hp ?? 0) <= 0) {
      this.target = this.foes.indexOf(live[0]!);
    }
    this.foes.forEach((f, i) => {
      f.cursor.setText(i === this.target && !f.dead ? "▼" : "");
    });
    const t = this.foes[this.target];
    this.targetHint?.setText(
      this.living().length > 1 && t ? `TARGET ◀ ▶  ${t.def.name}` : this.living().length > 1 ? "TARGET ◀ ▶" : "",
    );
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
    this.hpBar = bar(this, 334, 26, 100, 6, G.hero.hp / G.hero.maxHp, 0xc41e3a);
    this.mpBar = bar(this, 334, 36, 100, 6, G.hero.mp / G.hero.maxMp, 0x2a4a9a);
    this.hpNum?.setText(`${G.hero.hp}/${G.hero.maxHp}`);
    this.mpNum?.setText(`${G.hero.mp}/${G.hero.maxMp}`);
    const st = G.statuses.map((s) => s.name).join(" · ") || "TRUE NEUTRAL";
    this.statusTxt.setText(st);

    for (const f of this.foes) {
      f.hpBar.destroy();
      const i = this.foes.indexOf(f);
      const barY = 8 + i * 22;
      f.hpBar = bar(this, 14, barY + 12, 160, 4, f.dead ? 0 : f.hp / f.def.hp, 0xc41e3a);
      f.hpNum.setText(f.dead ? "DOWN" : `${f.hp}/${f.def.hp}`);
      f.nameLab.setColor(f.dead ? "#7a8aa0" : "#e8b84a");
    }
  }

  options(): string[] {
    if (this.menu === "main") return this.mainItems;
    if (this.menu === "skills") return SKILLS.map((s) => `${s.name} ${s.mp}MP`);
    if (this.menu === "items") return ITEMS.map((it) => `${it.name} x${G.hero.items[it.id]}`);
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
    if (this.menu === "skills" && SKILLS[this.cursor]) this.skillHint?.setText(SKILLS[this.cursor]!.desc);
    else if (this.menu === "items" && ITEMS[this.cursor]) this.skillHint?.setText(ITEMS[this.cursor]!.desc);
    else this.skillHint?.setText(this.living().length > 1 ? "Z OK  X BACK  ◀▶ TARGET" : "Z OK  X BACK");
  }

  update(time: number) {
    if (this.ended || this.menu === "busy" || this.menu === "end") {
      if (this.ended && consumeConfirm()) this.finish();
      return;
    }
    const a = axis();
    const opts = this.options();
    if (time - this.lastNav > 130) {
      if (a.y > 0 && opts.length) {
        this.cursor = (this.cursor + 1) % opts.length;
        this.lastNav = time;
        sfx("menu");
        this.drawMenu();
      } else if (a.y < 0 && opts.length) {
        this.cursor = (this.cursor - 1 + opts.length) % opts.length;
        this.lastNav = time;
        sfx("menu");
        this.drawMenu();
      } else if (this.menu === "main" && this.living().length > 1 && a.x !== 0) {
        const liveIdx = this.foes.map((f, i) => (!f.dead && f.hp > 0 ? i : -1)).filter((i) => i >= 0);
        const pos = Math.max(0, liveIdx.indexOf(this.target));
        const next = liveIdx[(pos + (a.x > 0 ? 1 : -1) + liveIdx.length) % liveIdx.length]!;
        this.target = next;
        this.lastNav = time;
        sfx("menu");
        this.retarget();
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
    this.retarget();
    this.drawMenu();
  }

  dmg(atk: number, def: number, mult = 1) {
    const raw = (atk * 1.2 - def * 0.5) * mult * (0.86 + Math.random() * 0.28);
    const crit = Math.random() < 0.08;
    const n = Math.max(1, Math.floor(raw * (crit ? 1.55 : 1)));
    return { n, crit };
  }

  primary(): Foe | null {
    const f = this.foes[this.target];
    if (f && !f.dead && f.hp > 0) return f;
    return this.living()[0] ?? null;
  }

  hurtFoe(f: Foe, n: number) {
    f.hp = Math.max(0, f.hp - n);
    this.hitFlash(f.spr, f);
    if (f.hp <= 0 && !f.dead) {
      f.dead = true;
      f.spr.setTint(0x444444);
      this.tweens.add({ targets: f.spr, alpha: 0.35, y: f.spr.y + 8, duration: 400 });
      f.cursor.setText("");
      this.say(`${f.def.name} down!`);
    }
  }

  playerAttack() {
    const foe = this.primary();
    if (!foe) return;
    this.lock();
    sfx("ok");
    if (this.anims.exists("baki-atk")) this.heroSpr.play("baki-atk");
    this.cameras.main.shake(120, 0.006);
    const { n, crit } = this.dmg(G.hero.atk, foe.defStat + (foe.buff > 0 ? 2 : 0));
    this.hurtFoe(foe, n);
    this.say(crit ? `Critical! Hammer hits ${n}.` : `Baki hammers for ${n}.`);
    sfx(crit ? "crit" : "hit");
    this.drawBars();
    this.time.delayedCall(480, () => {
      if (this.anims.exists("baki-idle-b")) this.heroSpr.play("baki-idle-b");
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
    const foe = this.primary();
    if (!foe && id !== "mute_counter" && id !== "independent") return;
    this.lock();
    G.hero.mp -= sk.mp;
    if (this.anims.exists("baki-atk")) this.heroSpr.play("baki-atk");

    if (id === "hammer_clarity" && foe) {
      const { n, crit } = this.dmg(G.hero.atk, foe.defStat, 1.45);
      this.hurtFoe(foe, n);
      foe.buff = 0;
      foe.atk = foe.def.atk;
      this.say(crit ? `Clarity CRIT ${n}. Buffs stripped.` : `Clarity smash ${n}. Buffs stripped.`);
      // Light splash to other living foes
      for (const o of this.living()) {
        if (o === foe) continue;
        const splash = Math.max(1, Math.floor(n * 0.35));
        this.hurtFoe(o, splash);
        this.say(`Splash ${splash} to ${o.def.name}.`);
      }
      sfx("crit");
    } else if (id === "mute_counter") {
      addStatus({ id: "mute_armed", name: "MUTE ARMED", turns: 4 });
      this.say("Mute Button armed. Lectures will rebound.");
      sfx("ok");
    } else if (id === "independent") {
      addStatus({ id: "independent", name: "INDEPENDENT", turns: 4 });
      G.statuses = G.statuses.filter((s) => s.id !== "reeducate");
      G.alignment = "neutral";
      this.say("Independent Stance. Re-Educate slides off.");
      sfx("heal");
    } else if (id === "fact_check" && foe) {
      const bonus = foe.def.media ? 1.9 : 1.2;
      const { n, crit } = this.dmg(G.hero.atk, foe.defStat, bonus);
      this.hurtFoe(foe, n);
      this.say(
        foe.def.media ? `Fact Check vs media! ${n}${crit ? " CRIT" : ""}` : `Fact Check smash ${n}.`,
      );
      sfx(foe.def.media ? "crit" : "hit");
    }
    this.cameras.main.shake(140, 0.008);
    this.drawBars();
    this.time.delayedCall(500, () => {
      if (this.anims.exists("baki-idle-b")) this.heroSpr.play("baki-idle-b");
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
      const heal = Math.min(ITEM_HEAL.potion, G.hero.maxHp - G.hero.hp);
      G.hero.hp += heal;
      this.say(`Potion restores ${heal} HP.`);
      sfx("heal");
    } else if (id === "ether") {
      const m = Math.min(ITEM_HEAL.ether, G.hero.maxMp - G.hero.mp);
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
    const lead = this.foes[0]?.def;
    const chance = lead && (lead.kind === "boss" || lead.kind === "final") ? 0.15 : 0.55;
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
    this.retarget();
    if (!this.living().length) {
      this.victory();
      return;
    }
    this.foeActI = 0;
    this.time.delayedCall(280, () => this.enemyWave());
  }

  enemyWave() {
    if (this.ended) return;
    const live = this.living();
    if (!live.length) {
      this.victory();
      return;
    }
    if (this.foeActI >= live.length) {
      this.endRound();
      return;
    }
    const foe = live[this.foeActI]!;
    this.foeActI += 1;
    this.enemyAct(foe, () => {
      if (G.hero.hp <= 0) {
        this.defeat();
        return;
      }
      if (!this.living().length) {
        this.victory();
        return;
      }
      this.time.delayedCall(260, () => this.enemyWave());
    });
  }

  /** Smarter AI: lecture when useful, heal/buff wisely, don't waste MP. */
  chooseAct(foe: Foe): EnemyActionId {
    const acts = foe.def.actions;
    const hpRatio = foe.hp / foe.def.hp;
    const heroWeak = hasStatus("reeducate") || G.hero.hp / G.hero.maxHp < 0.4;
    const mute = hasStatus("mute_armed");
    const can = (a: EnemyActionId) => acts.includes(a);

    if (can("heal") && hpRatio < 0.4 && foe.mp >= 4) return "heal";
    if (can("buff") && foe.buff <= 0 && foe.mp >= 2 && Math.random() < 0.45) return "buff";
    if (can("lecture") && !mute && foe.mp >= 3) {
      if (heroWeak || foe.def.canReeducate || foe.def.media) return "lecture";
      if (Math.random() < 0.4) return "lecture";
    }
    if (can("special") && foe.mp >= 6 && (hpRatio < 0.4 || Math.random() < 0.28)) return "special";
    if (can("attack")) return "attack";
    return acts[Math.floor(Math.random() * acts.length)] ?? "attack";
  }

  enemyAct(foe: Foe, done: () => void) {
    if (this.ended || foe.dead) {
      done();
      return;
    }
    const act = this.chooseAct(foe);

    if (act === "heal") {
      if (foe.mp < 4) {
        this.say(`${foe.def.name} hesitates — not enough MP.`);
        done();
        return;
      }
      foe.mp -= 4;
      const heal = Math.max(8, Math.floor(foe.def.hp * 0.18));
      foe.hp = Math.min(foe.def.hp, foe.hp + heal);
      this.say(`${foe.def.name} rallies for ${heal} HP.`);
      sfx("heal");
      this.drawBars();
      done();
      return;
    }

    if (act === "lecture") {
      if (foe.mp < 3) {
        this.say(`${foe.def.name} lectures dry — no MP. Swings instead.`);
        this.basicHit(foe, done);
        return;
      }
      foe.mp -= 3;
      if (hasStatus("mute_armed")) {
        G.statuses = G.statuses.filter((s) => s.id !== "mute_armed");
        const { n } = this.dmg(G.hero.atk, foe.defStat, 1.1);
        this.hurtFoe(foe, n);
        this.say(`Lecture muted. Counter ${n}!`);
        sfx("crit");
        this.drawBars();
        done();
        return;
      }
      const { n } = this.dmg(foe.atk, G.hero.def, 0.75);
      this.applyHeroDmg(n, `${foe.def.name} lectures for ${n}.`);
      if ((foe.def.canReeducate || foe.def.lecture) && Math.random() < 0.32) this.tryReeducate();
      done();
      return;
    }

    if (act === "buff") {
      if (foe.buff > 0) {
        this.basicHit(foe, done);
        return;
      }
      if (foe.mp >= 2) foe.mp -= 2;
      foe.buff = 3;
      foe.atk = foe.def.atk + 4;
      this.say(`${foe.def.name} rallies. ATK up.`);
      sfx("menu");
      done();
      return;
    }

    if (act === "special") {
      if (foe.mp < 6) {
        this.say(`${foe.def.name} holds the edict — low MP.`);
        this.basicHit(foe, done);
        return;
      }
      foe.mp -= 6;
      const { n } = this.dmg(foe.atk, G.hero.def, 1.45);
      this.applyHeroDmg(n, `${foe.def.specialName ?? "Special"} hits ${n}!`);
      if (foe.def.canReeducate && Math.random() < 0.6) this.tryReeducate();
      done();
      return;
    }

    this.basicHit(foe, done);
  }

  basicHit(foe: Foe, done: () => void) {
    const { n, crit } = this.dmg(foe.atk, G.hero.def, 1);
    this.applyHeroDmg(n, crit ? `${foe.def.name} CRIT ${n}!` : `${foe.def.name} hits ${n}.`);
    done();
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
    for (const f of this.foes) {
      if (f.buff > 0) {
        f.buff -= 1;
        if (f.buff <= 0) f.atk = f.def.atk;
      }
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
    let xp = 0;
    let gold = 0;
    let lead = this.foes[0]!.def;
    for (const f of this.foes) {
      xp += f.def.xp;
      gold += f.def.gold;
      if (f.def.kind === "boss" || f.def.kind === "final" || f.def.kind === "miniboss") lead = f.def;
    }
    // Multi-foe: slight XP trim so 3-packs aren't jackpots
    if (this.foes.length > 1) xp = Math.floor(xp * (0.75 + 0.1 * this.foes.length));
    const notes = grantXp(xp);
    G.hero.gold += gold;
    if (Math.random() < 0.55) G.hero.items.potion += 1;
    else if (Math.random() < 0.35) G.hero.items.ether += 1;
    if (lead.kind === "boss" || lead.kind === "final") defeatBoss(lead.id);
    if (this.mini === "red") {
      G.flags.redMiniboss = true;
      G.flags.dungeonOpen = G.flags.redMiniboss && G.flags.blueMiniboss;
    }
    if (this.mini === "blue") {
      G.flags.blueMiniboss = true;
      G.flags.dungeonOpen = G.flags.redMiniboss && G.flags.blueMiniboss;
    }
    this.say(`Victory! +${xp} XP  +${gold}G`);
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
    const won = G.hero.hp > 0 && !this.living().length;
    const fled = G.hero.hp > 0 && this.living().length > 0;
    this.close(won, fled);
  }

  close(won: boolean, fled: boolean) {
    const over = this.scene.get("overworld") as OverworldScene;
    const lead =
      this.foes.find((f) => f.def.kind === "boss" || f.def.kind === "final" || f.def.kind === "miniboss")?.def ??
      this.foes[0]!.def;
    this.scene.stop("battle");
    over.onBattleOver({
      won,
      fled,
      enemyId: lead.id,
      mini: this.mini,
    });
  }

  hitFlash(spr: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, foe?: Foe) {
    this.tweens.add({
      targets: spr,
      x: spr.x + (spr === this.heroSpr ? 8 : -8),
      duration: 60,
      yoyo: true,
      repeat: 2,
    });
    spr.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      spr.clearTint();
      if (foe?.def.tint && !foe.dead) spr.setTint(foe.def.tint);
    });
  }
}
