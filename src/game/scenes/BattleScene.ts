import Phaser from "phaser";
import { resolvePortrait } from "../art";
import { playMusic, sfx } from "../audio";
import {
  CONSPIRACY_ACTIONS,
  CONSPIRE_HOWTO,
  GROUP_CARDS,
  MAX_HAND,
  SPECIAL_BY_ID,
  buildDeck,
  controlChance,
  destroyBonusMult,
  drawHand,
  enemyPlotLine,
  handDesc,
  handLabel,
  rollEnemyPlot,
  summonStats,
  type HandCard,
  type SpecialEffectId,
} from "../conspiracyDeck";
import { ENEMIES, ITEM_HEAL, ITEMS, SKILLS } from "../database";
import { axis, consumeCancel, consumeConfirm } from "../input";
import {
  addStatus,
  defeatBoss,
  G,
  grantXp,
  hasStatus,
  regenInfluence,
  tickStatuses,
  unlockGroupCard,
} from "../state";
import type { EnemyActionId, EnemyDef, ItemId, SkillId } from "../types";
import { VIEW_H, VIEW_W } from "../types";
import { bar, px, windowBox, wrap } from "../ui";
import type { OverworldScene } from "./OverworldScene";

type Menu = "main" | "skills" | "items" | "conspire" | "busy" | "end";

interface Foe {
  def: EnemyDef;
  hp: number;
  maxHp: number;
  mp: number;
  atk: number;
  defStat: number;
  buff: number;
  /** Skip next enemy action (Neutralize). */
  stunned: number;
  /** Market Crash: reduced gold payout + DEF. */
  crashed: boolean;
  /** Temporary ally shade (controlled) — not used on foes; see AllyShade. */
  spr: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  nameLab: Phaser.GameObjects.Text;
  hpBar: Phaser.GameObjects.Graphics;
  hpNum: Phaser.GameObjects.Text;
  cursor: Phaser.GameObjects.Text;
  dead: boolean;
}

interface AllyShade {
  label: string;
  atk: number;
  turnsLeft: number;
  fromEnemyId: string;
  doubleStrike: boolean;
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
  private infNum!: Phaser.GameObjects.Text;
  private skillHint!: Phaser.GameObjects.Text;
  private targetHint!: Phaser.GameObjects.Text;
  private ended = false;
  private mini?: "red" | "blue";
  private mainItems = ["ATTACK", "SKILLS", "ITEM", "CONSPIRE", "FLEE"];
  private foeActI = 0;
  private hand: HandCard[] = [];
  private ally: AllyShade | null = null;
  private allyLab?: Phaser.GameObjects.Text;
  private menuScroll = 0;

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
    this.hand = [];
    this.ally = null;
    this.menuScroll = 0;
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
    playMusic(kind === "final" ? "final" : kind === "boss" || kind === "miniboss" ? "boss" : "battle");

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
      const hpNum = px(this, 178, barY + 4, "", 5, "#f0e6c8");
      const curs = px(this, slot.x - 36, slot.y - 40, "", 8, "#e8b84a").setOrigin(0.5);

      const packN = defs.length;
      const hpScale = packN === 1 ? 1 : packN === 2 ? 0.82 : 0.7;
      const atkScale = packN === 1 ? 1 : packN === 2 ? 0.9 : 0.82;
      const maxHp = Math.max(8, Math.floor(def.hp * hpScale));
      this.foes.push({
        def,
        hp: maxHp,
        mp: def.mp,
        atk: Math.max(1, Math.floor(def.atk * atkScale)),
        defStat: def.def,
        buff: 0,
        stunned: 0,
        crashed: false,
        spr,
        nameLab,
        hpBar,
        hpNum,
        cursor: curs,
        dead: false,
        maxHp,
      });
    });

    // Conspiracy hand
    const unlocked = G.flags.unlockedGroupCards ?? [];
    this.hand = drawHand(buildDeck(unlocked), MAX_HAND);

    this.heroSpr = this.add.sprite(368, 148, this.textures.exists("baki-idle") ? "baki-idle" : "fx-hero-sil", 0);
    if (this.textures.exists("baki-idle")) {
      this.heroSpr.setScale(0.68);
      if (this.anims.exists("baki-idle-b")) this.heroSpr.play("baki-idle-b");
    } else {
      this.heroSpr.setDisplaySize(64, 86);
    }

    windowBox(this, 286, 8, 186, 58);
    if (this.textures.exists("art-baki-head")) {
      this.add.image(304, 34, "art-baki-head").setDisplaySize(32, 32);
    } else if (this.textures.exists("baki-portrait")) {
      this.add.image(302, 34, "baki-portrait").setDisplaySize(28, 28);
    } else if (this.textures.exists("fx-hero-sil")) {
      this.add.image(302, 34, "fx-hero-sil").setDisplaySize(28, 28);
    }
    px(this, 334, 12, "BAKI", 7, "#e8b84a");
    this.hpBar = bar(this, 334, 24, 100, 5, 1, 0xc41e3a);
    this.mpBar = bar(this, 334, 32, 100, 5, 1, 0x2a4a9a);
    this.hpNum = px(this, 438, 22, "", 5, "#f0e6c8");
    this.mpNum = px(this, 438, 30, "", 5, "#8eb4ff");
    this.infNum = px(this, 334, 40, "", 5, "#c9a0ff");
    this.statusTxt = px(this, 334, 50, "", 5, "#7a8aa0");
    this.allyLab = px(this, 286, 68, "", 5, "#6adf8a");

    windowBox(this, 8, 160, 168, 102);
    this.menuTitle = px(this, 16, 166, "COMMAND", 7, "#e8b84a");
    this.menuLabels = [0, 1, 2, 3, 4, 5].map((i) => px(this, 16, 176 + i * 11, "", 5));
    this.skillHint = px(this, 16, 246, "", 4, "#7a8aa0");
    this.targetHint = px(this, 176, 148, "", 5, "#e8b84a");
    if (this.textures.exists("ui-target")) {
      this.add.image(196, 156, "ui-target").setDisplaySize(14, 14).setDepth(52);
    }

    windowBox(this, 176, 168, 296, 94);
    this.log = [0, 1, 2, 3, 4].map((i) => px(this, 184, 176 + i * 14, "", 6, "#f0e6c8"));

    const intro =
      defs.length > 1
        ? `${defs.map((d) => d.name).join(" & ")} engage!`
        : defs[0]!.intro;
    this.say(intro);
    if (!G.flags.conspireHowtoShown) {
      this.say(CONSPIRE_HOWTO);
      G.flags.conspireHowtoShown = true;
    } else {
      this.say(`Hand: ${this.hand.length} cards · INF ${G.hero.influence}`);
    }
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
      this.living().length > 1 && t
        ? `◀ TARGET ▶  ${t.def.name.slice(0, 16)}`
        : this.living().length > 1
          ? "◀ TARGET ▶"
          : "",
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
    this.hpBar = bar(this, 334, 24, 100, 5, G.hero.hp / G.hero.maxHp, 0xc41e3a);
    this.mpBar = bar(this, 334, 32, 100, 5, G.hero.mp / G.hero.maxMp, 0x2a4a9a);
    this.hpNum?.setText(`${G.hero.hp}/${G.hero.maxHp}`);
    this.mpNum?.setText(`${G.hero.mp}/${G.hero.maxMp}`);
    this.infNum?.setText(`INF ${G.hero.influence}/${G.hero.maxInfluence}`);
    const st = G.statuses.map((s) => s.name).join(" · ") || "TRUE NEUTRAL";
    this.statusTxt.setText(st.slice(0, 28));
    if (this.allyLab) {
      this.allyLab.setText(
        this.ally
          ? `ALLY ${this.ally.label.slice(0, 16)} T${this.ally.turnsLeft}`
          : "",
      );
    }

    for (const f of this.foes) {
      f.hpBar.destroy();
      const i = this.foes.indexOf(f);
      const barY = 8 + i * 22;
      f.hpBar = bar(this, 14, barY + 12, 160, 4, f.dead ? 0 : f.hp / f.maxHp, 0xc41e3a);
      const stun = f.stunned > 0 ? " STUN" : "";
      f.hpNum.setText(f.dead ? "DOWN" : `${f.hp}/${f.maxHp}${stun}`);
      f.nameLab.setColor(f.dead ? "#7a8aa0" : f.stunned > 0 ? "#8eb4ff" : "#e8b84a");
    }
  }

  conspireOptions(): string[] {
    const acts = CONSPIRACY_ACTIONS.map((a) => `${a.name.split(" ").slice(-1)[0]} ${a.influence}INF`);
    const cards = this.hand.map((c) => handLabel(c));
    return [...acts, ...cards];
  }

  options(): string[] {
    if (this.menu === "main") return this.mainItems;
    if (this.menu === "skills") return SKILLS.map((s) => `${s.name} ${s.mp}MP`);
    if (this.menu === "items") return ITEMS.map((it) => `${it.name} x${G.hero.items[it.id]}`);
    if (this.menu === "conspire") return this.conspireOptions();
    return [];
  }

  drawMenu() {
    const opts = this.options();
    const title =
      this.menu === "skills"
        ? "SKILLS"
        : this.menu === "items"
          ? "ITEMS"
          : this.menu === "conspire"
            ? "CONSPIRE"
            : "COMMAND";
    this.menuTitle.setText(title);
    const vis = 6;
    if (this.cursor < this.menuScroll) this.menuScroll = this.cursor;
    if (this.cursor >= this.menuScroll + vis) this.menuScroll = this.cursor - vis + 1;
    this.menuLabels.forEach((lab, i) => {
      const idx = this.menuScroll + i;
      const opt = opts[idx];
      if (!opt) {
        lab.setText("");
        return;
      }
      const on = idx === this.cursor;
      lab.setText(`${on ? ">" : " "} ${opt}`.slice(0, 26));
      lab.setColor(on ? "#e8b84a" : "#f0e6c8");
    });
    if (this.menu === "skills" && SKILLS[this.cursor]) {
      const sk = SKILLS[this.cursor]!;
      this.skillHint?.setText(sk.desc.slice(0, 42));
      this.skillHint?.setColor(sk.id.startsWith("conspire") ? "#c9a0ff" : sk.id === "common_sense" ? "#6adf8a" : "#7a8aa0");
    } else if (this.menu === "items" && ITEMS[this.cursor]) {
      this.skillHint?.setText(ITEMS[this.cursor]!.desc);
      this.skillHint?.setColor("#7a8aa0");
    } else if (this.menu === "conspire") {
      const nAct = CONSPIRACY_ACTIONS.length;
      if (this.cursor < nAct) {
        this.skillHint?.setText(CONSPIRACY_ACTIONS[this.cursor]!.desc.slice(0, 42));
      } else {
        const card = this.hand[this.cursor - nAct];
        this.skillHint?.setText(card ? handDesc(card).slice(0, 42) : "");
      }
      this.skillHint?.setColor("#c9a0ff");
    } else {
      this.skillHint?.setText(this.living().length > 1 ? "Z OK  X BACK  ◀▶ TARGET" : "Z OK  X BACK");
      this.skillHint?.setColor("#7a8aa0");
    }
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
        this.menuScroll = 0;
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
        this.menuScroll = 0;
        sfx("ok");
        this.drawMenu();
      } else if (c === "ITEM") {
        this.menu = "items";
        this.cursor = 0;
        this.menuScroll = 0;
        sfx("ok");
        this.drawMenu();
      } else if (c === "CONSPIRE") {
        this.menu = "conspire";
        this.cursor = 0;
        this.menuScroll = 0;
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
      return;
    }
    if (this.menu === "conspire") this.pickConspire();
  }

  pickConspire() {
    const nAct = CONSPIRACY_ACTIONS.length;
    if (this.cursor < nAct) {
      const act = CONSPIRACY_ACTIONS[this.cursor]!;
      this.runConspiracyAction(act.id);
      return;
    }
    const card = this.hand[this.cursor - nAct];
    if (card) this.playHandCard(card, this.cursor - nAct);
  }

  spendInfluence(n: number): boolean {
    if (G.hero.influence < n) {
      sfx("no");
      this.say(`Need ${n} Influence.`);
      return false;
    }
    G.hero.influence -= n;
    return true;
  }

  runConspiracyAction(id: "control" | "neutralize" | "destroy") {
    const def = CONSPIRACY_ACTIONS.find((a) => a.id === id)!;
    const foe = this.primary();
    if (!foe) return;
    if (!this.spendInfluence(def.influence)) return;
    this.lock();
    sfx("ok");
    if (id === "control") {
      const group = GROUP_CARDS[`group_${foe.def.id}`];
      const power = group?.power ?? Math.round(foe.atk * 0.9);
      const resist = group?.resistance ?? foe.defStat;
      const chance = controlChance(power + Math.floor(G.hero.level / 2), resist);
      if (Math.random() < chance) {
        const stats = summonStats(group ?? GROUP_CARDS[`group_${foe.def.id}`] ?? {
          id: "tmp",
          enemyId: foe.def.id,
          name: foe.def.name,
          alignment: "Order",
          power,
          resistance: resist,
          income: 1,
          kind: foe.def.kind,
          faction: foe.def.faction,
        });
        this.ally = {
          label: stats.label,
          atk: stats.atk,
          turnsLeft: stats.turns,
          fromEnemyId: foe.def.id,
          doubleStrike: false,
        };
        this.hurtFoe(foe, Math.max(1, Math.floor(foe.hp * 0.15)));
        this.say(`CONTROL! ${this.ally.label} joins (${this.ally.turnsLeft}t).`);
        sfx("heal");
      } else {
        const { n } = this.dmg(G.hero.atk, foe.defStat, 0.7);
        this.hurtFoe(foe, n);
        this.say(`Control failed. Grazed for ${n}.`);
        sfx("no");
      }
    } else if (id === "neutralize") {
      foe.stunned = 1;
      const { n } = this.dmg(G.hero.atk, foe.defStat, 0.55);
      this.hurtFoe(foe, n);
      this.say(`Neutralized ${foe.def.name}! Stun + ${n}.`);
      sfx("ok");
    } else {
      const mult = destroyBonusMult(foe.hp / foe.maxHp, false);
      const { n, crit } = this.dmg(G.hero.atk, foe.defStat, mult);
      this.hurtFoe(foe, n);
      if (foe.hp <= 0) this.say(`DESTROYED ${foe.def.name}!`);
      else this.say(crit ? `Destroy CRIT ${n}.` : `Destroy hits ${n}.`);
      sfx(foe.hp <= 0 ? "crit" : "hit");
    }
    this.drawBars();
    this.time.delayedCall(480, () => this.afterPlayer());
  }

  playHandCard(card: HandCard, handIndex: number) {
    if (card.kind === "group") {
      const g = GROUP_CARDS[card.id];
      if (!g) return;
      if (!this.spendInfluence(2)) return;
      this.lock();
      const stats = summonStats(g);
      this.ally = {
        label: stats.label,
        atk: stats.atk,
        turnsLeft: stats.turns,
        fromEnemyId: g.enemyId,
        doubleStrike: false,
      };
      this.hand.splice(handIndex, 1);
      this.say(`Summoned ${this.ally.label}!`);
      sfx("heal");
      this.drawBars();
      this.time.delayedCall(400, () => this.afterPlayer());
      return;
    }
    this.playSpecial(card.id, handIndex);
  }

  playSpecial(id: SpecialEffectId, handIndex: number, fromSkill = false) {
    const sp = SPECIAL_BY_ID[id];
    if (!sp) return;
    if (!fromSkill && !this.spendInfluence(sp.influence)) return;
    if (sp.gold && G.hero.gold < sp.gold) {
      if (!fromSkill) G.hero.influence += sp.influence; // refund
      sfx("no");
      this.say(`Need ${sp.gold} gold.`);
      return;
    }
    if (sp.mp && G.hero.mp < sp.mp) {
      if (!fromSkill) G.hero.influence += sp.influence;
      sfx("no");
      this.say("Not enough MP.");
      return;
    }
    this.lock();
    if (!fromSkill) {
      if (sp.gold) G.hero.gold -= sp.gold;
      if (sp.mp) G.hero.mp -= sp.mp;
      if (handIndex >= 0) this.hand.splice(handIndex, 1);
    } else if (sp.gold) {
      // Skill path already paid INF/MP; still charge gold for Bribe.
      G.hero.gold -= sp.gold;
    }

    const foe = this.primary();
    if (id === "bribe" && foe) {
      const group = GROUP_CARDS[`group_${foe.def.id}`];
      const chance = controlChance(group?.power ?? 10, group?.resistance ?? 10, 0.35);
      if (Math.random() < chance) {
        const stats = summonStats(
          group ?? {
            id: "tmp",
            enemyId: foe.def.id,
            name: foe.def.name,
            alignment: "Capital",
            power: 10,
            resistance: 8,
            income: 2,
            kind: foe.def.kind,
            faction: foe.def.faction,
          },
        );
        this.ally = {
          label: stats.label,
          atk: stats.atk,
          turnsLeft: stats.turns,
          fromEnemyId: foe.def.id,
          doubleStrike: false,
        };
        this.say(`Bribe works — ${this.ally.label} flips.`);
        sfx("heal");
      } else {
        this.say("Bribe refused. Gold wasted.");
        sfx("no");
      }
    } else if (id === "assassinate" && foe) {
      const bonus = foe.stunned > 0 ? 2.1 : 1.7;
      const { n, crit } = this.dmg(G.hero.atk, foe.defStat, bonus);
      this.hurtFoe(foe, n);
      this.say(crit ? `Assassinate CRIT ${n}!` : `Assassinate ${n}.`);
      sfx("crit");
    } else if (id === "media_blackout") {
      addStatus({ id: "mute_armed", name: "BLACKOUT", turns: 4 });
      this.say("Media Blackout — Lectures muted.");
      sfx("ok");
    } else if (id === "market_crash" && foe) {
      foe.crashed = true;
      foe.defStat = Math.max(1, Math.floor(foe.defStat * 0.7));
      this.say(`Market Crash on ${foe.def.name}. DEF/gold down.`);
      sfx("ok");
    } else if (id === "double_agent" && foe) {
      if (foe.buff > 0) {
        foe.buff = 0;
        foe.atk = foe.def.atk;
        addStatus({ id: "buff_atk", name: "STOLEN BUFF", turns: 3 });
        this.say("Double Agent steals their rally!");
        sfx("heal");
      } else {
        addStatus({ id: "buff_atk", name: "AGENT EDGE", turns: 2 });
        this.say("Double Agent grants a thin edge.");
        sfx("ok");
      }
    } else if (id === "pyramid_scheme") {
      const unlocked = G.flags.unlockedGroupCards ?? [];
      const pick = unlocked[Math.floor(Math.random() * unlocked.length)];
      const g = pick ? GROUP_CARDS[pick] : undefined;
      if (g) {
        const stats = summonStats(g);
        this.ally = {
          label: stats.label,
          atk: Math.max(3, Math.floor(stats.atk * 0.85)),
          turnsLeft: stats.turns,
          fromEnemyId: g.enemyId,
          doubleStrike: false,
        };
        this.say(`Pyramid Scheme: ${this.ally.label}!`);
        sfx("heal");
      } else {
        this.say("Pyramid Scheme fizzles — no groups.");
        sfx("no");
      }
    } else if (id === "leak" && foe) {
      foe.buff = 0;
      foe.atk = foe.def.atk;
      const { n } = this.dmg(G.hero.atk, foe.defStat, 0.9);
      this.hurtFoe(foe, n);
      for (const o of this.living()) {
        if (o === foe) continue;
        this.hurtFoe(o, Math.max(1, Math.floor(n * 0.4)));
      }
      this.say(`Leak strips buffs. Hit ${n}.`);
      sfx("hit");
    } else if (id === "honeypot") {
      addStatus({ id: "honeypot", name: "HONEYPOT", turns: 3 });
      this.say("Honeypot set — next Lecture heals you.");
      sfx("ok");
    } else if (id === "shell_corp") {
      regenInfluence(2);
      G.hero.gold += 12;
      this.say("Shell Corp: +2 INF +12G.");
      sfx("heal");
    } else if (id === "astroturf") {
      if (this.ally) {
        this.ally.doubleStrike = true;
        this.say("Astroturf: ally strikes twice.");
        sfx("ok");
      } else {
        this.say("Astroturf needs an ally shade.");
        sfx("no");
      }
    } else if (id === "dead_drop") {
      const m = Math.min(12, G.hero.maxMp - G.hero.mp);
      G.hero.mp += m;
      regenInfluence(1);
      this.say(`Dead Drop: +${m} MP +1 INF.`);
      sfx("heal");
    } else if (id === "false_flag" && foe) {
      if (Math.random() < 0.55) {
        const { n } = this.dmg(foe.atk, foe.defStat, 0.9);
        this.hurtFoe(foe, n);
        this.say(`False Flag — they hit themselves for ${n}!`);
        sfx("crit");
      } else {
        this.say("False Flag flops.");
        sfx("no");
      }
    } else if (id === "soft_power") {
      const heal = Math.min(40, G.hero.maxHp - G.hero.hp);
      G.hero.hp += heal;
      addStatus({ id: "soft_power", name: "SOFT POWER", turns: 3 });
      this.say(`Soft Power heals ${heal}. DEF edge.`);
      sfx("heal");
    } else if (id === "ledger_wipe" && foe) {
      const capital = foe.def.faction === "bloodline" || foe.def.faction === "final";
      const { n, crit } = this.dmg(G.hero.atk, foe.defStat, capital ? 2.2 : 1.3);
      this.hurtFoe(foe, n);
      this.say(capital ? `Ledger Wipe vs Capital! ${n}` : `Ledger Wipe ${n}.`);
      sfx(crit || capital ? "crit" : "hit");
    } else {
      this.say(`${sp.name} resolves.`);
      sfx("ok");
    }
    this.drawBars();
    this.time.delayedCall(480, () => this.afterPlayer());
  }

  lock() {
    this.menu = "busy";
  }

  unlockToPlayer() {
    if (this.ended) return;
    this.menu = "main";
    this.cursor = 0;
    this.menuScroll = 0;
    this.retarget();
    this.drawMenu();
  }

  dmg(atk: number, def: number, mult = 1) {
    let a = atk;
    if (hasStatus("buff_atk")) a = Math.floor(a * 1.2);
    const raw = (a * 1.2 - def * 0.5) * mult * (0.86 + Math.random() * 0.28);
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
    // Conspire skill line → specials
    if (id === "conspire_bribe") {
      if (G.hero.influence < 1) {
        sfx("no");
        this.say("Need 1 Influence.");
        return;
      }
      G.hero.influence -= 1;
      this.playSpecial("bribe", -1, true);
      return;
    }
    if (id === "conspire_blackout") {
      const sk = SKILLS.find((s) => s.id === id)!;
      if (G.hero.mp < sk.mp || G.hero.influence < 2) {
        sfx("no");
        this.say("Need 3 MP + 2 INF.");
        return;
      }
      G.hero.mp -= sk.mp;
      G.hero.influence -= 2;
      this.playSpecial("media_blackout", -1, true);
      return;
    }
    if (id === "conspire_assassinate") {
      const sk = SKILLS.find((s) => s.id === id)!;
      if (G.hero.mp < sk.mp || G.hero.influence < 2) {
        sfx("no");
        this.say("Need 4 MP + 2 INF.");
        return;
      }
      G.hero.mp -= sk.mp;
      G.hero.influence -= 2;
      this.playSpecial("assassinate", -1, true);
      return;
    }

    const sk = SKILLS.find((s) => s.id === id)!;
    if (G.hero.mp < sk.mp) {
      sfx("no");
      this.say("Not enough MP.");
      return;
    }
    const foe = this.primary();
    if (!foe && id !== "mute_counter" && id !== "independent" && id !== "common_sense") return;
    this.lock();
    G.hero.mp -= sk.mp;
    if (this.anims.exists("baki-atk")) this.heroSpr.play("baki-atk");

    if (id === "hammer_clarity" && foe) {
      const { n, crit } = this.dmg(G.hero.atk, foe.defStat, 1.45);
      this.hurtFoe(foe, n);
      foe.buff = 0;
      foe.atk = foe.def.atk;
      this.say(crit ? `Clarity CRIT ${n}. Buffs stripped.` : `Clarity smash ${n}. Buffs stripped.`);
      for (const o of this.living()) {
        if (o === foe) continue;
        const splash = Math.max(1, Math.floor(n * 0.48));
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
    } else if (id === "common_sense") {
      const amount = Math.min(G.hero.maxHp - G.hero.hp, 48 + G.hero.level * 2);
      G.hero.hp += amount;
      this.say(amount > 0 ? `Common Sense Mend restores ${amount} HP.` : "Already at full HP.");
      sfx("heal");
      this.heroSpr.setTint(0x6adf8a);
      this.time.delayedCall(180, () => this.heroSpr.clearTint());
      if (this.textures.exists("ui-heal")) {
        const fx = this.add.image(this.heroSpr.x, this.heroSpr.y - 40, "ui-heal").setDisplaySize(20, 20).setDepth(70);
        this.tweens.add({ targets: fx, y: fx.y - 18, alpha: 0, duration: 420, onComplete: () => fx.destroy() });
      }
    }
    this.cameras.main.shake(id === "common_sense" ? 60 : 140, id === "common_sense" ? 0.003 : 0.008);
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
    // Ally shade acts once (or twice with Astroturf)
    if (this.ally && this.ally.turnsLeft > 0) {
      this.allyStrike(() => {
        if (!this.living().length) {
          this.victory();
          return;
        }
        this.foeActI = 0;
        this.time.delayedCall(220, () => this.enemyWave());
      });
      return;
    }
    this.foeActI = 0;
    this.time.delayedCall(280, () => this.enemyWave());
  }

  allyStrike(done: () => void) {
    if (!this.ally) {
      done();
      return;
    }
    const foe = this.primary();
    if (!foe) {
      done();
      return;
    }
    const strikes = this.ally.doubleStrike ? 2 : 1;
    this.ally.doubleStrike = false;
    let i = 0;
    const hit = () => {
      if (i >= strikes || !this.living().length) {
        done();
        return;
      }
      const t = this.primary();
      if (!t) {
        done();
        return;
      }
      const { n } = this.dmg(this.ally!.atk, t.defStat, 0.95);
      this.hurtFoe(t, n);
      this.say(`${this.ally!.label} strikes ${n}.`);
      sfx("hit");
      this.drawBars();
      i += 1;
      this.time.delayedCall(220, hit);
    };
    hit();
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
    if (foe.stunned > 0) {
      foe.stunned -= 1;
      this.say(`${foe.def.name} is neutralized — skips.`);
      this.drawBars();
      this.time.delayedCall(200, () => this.enemyWave());
      return;
    }
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

  chooseAct(foe: Foe): EnemyActionId | "plot" {
    const plot = rollEnemyPlot(foe.def.kind);
    if (plot) {
      (foe as Foe & { _plot?: string })._plot = plot;
      return "plot" as EnemyActionId & "plot";
    }
    const acts = foe.def.actions;
    const hpRatio = foe.hp / foe.maxHp;
    const heroWeak = hasStatus("reeducate") || G.hero.hp / G.hero.maxHp < 0.4;
    const mute = hasStatus("mute_armed");
    const can = (a: EnemyActionId) => acts.includes(a);

    if (can("heal") && hpRatio < 0.4 && foe.mp >= 4) return "heal";
    if (can("buff") && foe.buff <= 0 && foe.mp >= 2 && Math.random() < 0.45) return "buff";
    if (can("lecture") && !mute && foe.mp >= 3) {
      if (heroWeak || foe.def.canReeducate || foe.def.media) return "lecture";
      if (Math.random() < 0.4) return "lecture";
    }
    if (can("special") && foe.mp >= 6 && (hpRatio < 0.55 || Math.random() < 0.28)) return "special";
    if (can("attack")) return "attack";
    return acts[Math.floor(Math.random() * acts.length)] ?? "attack";
  }

  enemyAct(foe: Foe, done: () => void) {
    if (this.ended || foe.dead) {
      done();
      return;
    }
    const act = this.chooseAct(foe);

    if ((act as string) === "plot") {
      const plot = ((foe as Foe & { _plot?: "network_jam" | "smear" | "counter_bribe" })._plot ??
        "network_jam") as "network_jam" | "smear" | "counter_bribe";
      this.say(enemyPlotLine(foe.def.name, plot));
      if (plot === "network_jam") {
        G.hero.influence = Math.max(0, G.hero.influence - 1);
      } else if (plot === "smear") {
        addStatus({ id: "smear", name: "SMEAR", turns: 2 });
      } else {
        G.hero.gold = Math.max(0, G.hero.gold - 8);
      }
      sfx("no");
      this.drawBars();
      done();
      return;
    }

    if (act === "heal") {
      if (foe.mp < 4) {
        this.say(`${foe.def.name} hesitates — not enough MP.`);
        done();
        return;
      }
      foe.mp -= 4;
      const heal = Math.max(8, Math.floor(foe.maxHp * 0.18));
      foe.hp = Math.min(foe.maxHp, foe.hp + heal);
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
      if (hasStatus("honeypot")) {
        G.statuses = G.statuses.filter((s) => s.id !== "honeypot");
        const heal = Math.min(30, G.hero.maxHp - G.hero.hp);
        G.hero.hp += heal;
        this.say(`Honeypot! Lecture heals you ${heal}.`);
        sfx("heal");
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
    if (hasStatus("smear")) d = Math.floor(d * 1.15);
    if (hasStatus("soft_power")) d = Math.floor(d * 0.85);
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
    if (this.ally) {
      this.ally.turnsLeft -= 1;
      if (this.ally.turnsLeft <= 0) {
        this.say(`${this.ally.label} fades.`);
        this.ally = null;
      }
    }
    regenInfluence(1);
    // Top up hand slightly
    if (this.hand.length < MAX_HAND && Math.random() < 0.4) {
      const deck = buildDeck(G.flags.unlockedGroupCards ?? []);
      const drawn = drawHand(deck, 1);
      if (drawn[0] && !this.hand.some((h) => h.kind === drawn[0]!.kind && h.id === drawn[0]!.id)) {
        this.hand.push(drawn[0]);
        this.say("Drew a conspiracy card.");
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
    const unlockedNow: string[] = [];
    for (const f of this.foes) {
      xp += f.def.xp;
      let g = f.def.gold;
      if (f.crashed) g = Math.floor(g * 0.55);
      gold += g;
      if (f.def.kind === "boss" || f.def.kind === "final" || f.def.kind === "miniboss") lead = f.def;
      const u = unlockGroupCard(f.def.id);
      if (u) unlockedNow.push(GROUP_CARDS[u]?.name ?? u);
    }
    if (this.foes.length === 2) {
      xp = Math.floor(xp * 0.88);
      gold = Math.floor(gold * 0.9);
    } else if (this.foes.length >= 3) {
      xp = Math.floor(xp * 0.75);
      gold = Math.floor(gold * 0.8);
    }
    const notes = grantXp(xp);
    G.hero.gold += gold;
    regenInfluence(1);
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
    for (const name of unlockedNow) this.say(`Group card unlocked: ${name}`);
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
