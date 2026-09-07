import Phaser from "phaser";
import { playMusic, sfx, unlockAudio } from "../audio";
import { BOSSES, DIALOGUE, ENEMIES, pickEncounter } from "../database";
import { axis, consumeCancel, consumeConfirm, setKeysExact } from "../input";
import { DUNGEON_DOORS, MAPS, SOLID, walkable } from "../maps";
import { writeSave } from "../save";
import { G, healFull, noteWin, resetGame } from "../state";
import { TILE, VIEW_H, VIEW_W, WALK_SPEED } from "../types";
import type { GameMap, MapId } from "../types";
import { px, windowBox, wrap } from "../ui";

export class OverworldScene extends Phaser.Scene {
  private map!: GameMap;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private npcSprites: Phaser.GameObjects.Sprite[] = [];
  private talkBox?: Phaser.GameObjects.Graphics;
  private talkText?: Phaser.GameObjects.Text;
  private lines: string[] = [];
  private lineI = 0;
  private talking = false;
  private hud?: Phaser.GameObjects.Text;
  private flash?: Phaser.GameObjects.Rectangle;
  private lastFoot = 0;
  private moveX = 0;
  private moveY = 0;
  private locLabel?: Phaser.GameObjects.Text;

  constructor() {
    super("overworld");
  }

  init() {
    this.npcSprites = [];
    this.talking = false;
    this.lines = [];
    this.lineI = 0;
    this.moveX = 0;
    this.moveY = 0;
  }

  create() {
    this.scene.stop("title");
    this.physics.world.setBounds(0, 0, 2000, 2000);
    this.buildMap(G.map);
    this.flash = this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0xc41e3a, 0).setScrollFactor(0).setOrigin(0).setDepth(90);
    windowBox(this, 4, 4, 220, 22, 69).setScrollFactor(0);
    this.hud = px(this, 8, 10, "", 6, "#f0e6c8").setScrollFactor(0).setDepth(70);
    this.locLabel = px(this, VIEW_W - 8, 8, "", 6, "#e8b84a").setOrigin(1, 0).setScrollFactor(0).setDepth(70);

    if (!G.flags.introSeen) {
      G.flags.introSeen = true;
      this.openTalk(DIALOGUE.intro);
    }

    this.wireControls();
    this.events.once("shutdown", () => {
      this.npcSprites = [];
    });
  }

  wireControls() {
    window.__controlsTest = {
      getYaw: () => G.yaw,
      getSpeed: () => G.speed,
      getX: () => this.player?.x ?? 0,
      getY: () => this.player?.y ?? 0,
      setKeys: (codes: string[]) => setKeysExact(codes),
    };
  }

  buildMap(id: MapId) {
    this.npcSprites.forEach((s) => s.destroy());
    this.npcSprites = [];
    this.layer?.destroy();
    this.player?.destroy();

    this.map = MAPS[id];
    G.map = id;
    const data = this.map.ground;
    const tilemap = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
    const tileset = tilemap.addTilesetImage("tiles", "tiles", TILE, TILE, 0, 0);
    if (!tileset) return;
    const layer = tilemap.createLayer(0, tileset, 0, 0);
    if (!layer) return;
    this.layer = layer;
    layer.setCollision(Array.from(SOLID));

    const worldW = data[0]!.length * TILE;
    const worldH = data.length * TILE;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setRoundPixels(true);

    const px0 = G.tx * TILE + TILE / 2;
    const py0 = G.ty * TILE + TILE / 2;
    this.player = this.physics.add.sprite(px0, py0, "baki-walk", 0);
    this.player.setScale(0.34);
    this.player.body.setSize(28, 28);
    this.player.body.setOffset(34, 50);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.physics.add.collider(this.player, layer);
    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
    this.cameras.main.setDeadzone(24, 16);

    for (const n of this.map.npcs) {
      const key = n.sprite ?? "enemy-right";
      const spr = this.add.sprite(n.x * TILE + 8, n.y * TILE + 8, key, 0);
      spr.setScale(0.22);
      if (n.tint) spr.setTint(n.tint);
      if (this.anims.exists(`${key}-idle`)) spr.play(`${key}-idle`);
      spr.setDepth(8);
      spr.setData("npc", n.id);
      this.npcSprites.push(spr);
    }

    playMusic(this.map.music);
    this.locLabel?.setText(this.map.name.toUpperCase());
  }

  update(_t: number, delta: number) {
    const dt = Math.min(delta, 100) / 1000;
    this.hud?.setText(`HP ${G.hero.hp}/${G.hero.maxHp}  MP ${G.hero.mp}/${G.hero.maxMp}  LV ${G.hero.level}`);
    window.__baki = { map: G.map, hp: G.hero.hp };

    if (this.talking) {
      this.player.body.setVelocity(0, 0);
      G.speed = 0;
      if (consumeConfirm()) this.advanceTalk();
      if (consumeCancel()) this.closeTalk();
      return;
    }

    if (consumeCancel()) {
      this.game.scene.run("status");
      this.scene.pause();
      return;
    }

    const a = axis();
    let vx = a.x;
    let vy = a.y;
    const len = Math.hypot(vx, vy);
    if (len > 0) {
      vx /= len;
      vy /= len;
    }
    this.moveX = vx;
    this.moveY = vy;
    const speed = WALK_SPEED;
    this.player.body.setVelocity(vx * speed, vy * speed);
    G.speed = len > 0 ? speed : 0;

    if (len > 0) {
      if (Math.abs(vx) >= Math.abs(vy)) {
        G.yaw = vx < 0 ? Math.PI / 2 : -Math.PI / 2;
        this.player.play(vx < 0 ? "baki-left" : "baki-right", true);
      } else {
        G.yaw = vy > 0 ? 0 : Math.PI;
        this.player.play(vy > 0 ? "baki-down" : "baki-up", true);
      }
      G.facing = G.yaw;
      this.lastFoot += dt;
      if (this.lastFoot > 0.28) {
        this.lastFoot = 0;
        sfx("step");
      }
      this.accumulateSteps(dt);
    } else {
      this.player.anims.stop();
    }

    G.tx = Math.floor(this.player.x / TILE);
    G.ty = Math.floor(this.player.y / TILE);

    if (consumeConfirm()) this.tryInteract();
    this.checkWarps();
    this.checkDoors();
  }

  accumulateSteps(dt: number) {
    if (this.map.encounters === "none" || this.talking) return;
    G.steps += dt * 14;
    if (G.steps >= G.nextEncounterAt) {
      G.steps = 0;
      G.nextEncounterAt = 10 + Math.floor(Math.random() * 10);
      this.startEncounter(pickEncounter(this.map.encounters), false);
    }
  }

  facingTile(): { x: number; y: number } {
    let dx = 0;
    let dy = 0;
    if (G.yaw === Math.PI / 2) dx = -1;
    else if (G.yaw === -Math.PI / 2) dx = 1;
    else if (G.yaw === 0) dy = 1;
    else dy = -1;
    return { x: G.tx + dx, y: G.ty + dy };
  }

  tryInteract() {
    const f = this.facingTile();
    const spots = [
      { x: G.tx, y: G.ty },
      f,
      { x: G.tx, y: G.ty - 1 },
      { x: G.tx, y: G.ty + 1 },
      { x: G.tx - 1, y: G.ty },
      { x: G.tx + 1, y: G.ty },
    ];
    for (const s of spots) {
      const npc = this.map.npcs.find((n) => n.x === s.x && n.y === s.y);
      if (npc) {
        this.handleNpc(npc.id);
        return;
      }
    }
    const warp = this.map.warps.find((w) => w.x === f.x && w.y === f.y);
    if (warp) this.takeWarp(warp);
  }

  handleNpc(id: string) {
    sfx("ok");
    if (id === "innkeeper") {
      this.game.scene.run("shop");
      this.scene.pause();
      return;
    }
    if (id === "forum_red") {
      if (G.flags.redMiniboss) {
        this.openTalk(["The forum is quiet. The Instructor has fled."]);
        return;
      }
      if (G.flags.redWins < 3) {
        this.openTalk([`Win 3 skirmishes to draw the Instructor. (${G.flags.redWins}/3)`, ...DIALOGUE.forum_red]);
        return;
      }
      this.startEncounter("reeducation_instructor", true, "red");
      return;
    }
    if (id === "forum_blue") {
      if (G.flags.blueMiniboss) {
        this.openTalk(["The lecture pit is empty. Chalk dust settles."]);
        return;
      }
      if (G.flags.blueWins < 3) {
        this.openTalk([`Win 3 skirmishes to draw the Instructor. (${G.flags.blueWins}/3)`, ...DIALOGUE.forum_blue]);
        return;
      }
      this.startEncounter("reeducation_instructor", true, "blue");
      return;
    }
    if (id === "blood_ledger") {
      const remaining = BOSSES.filter((b) => !G.flags.bossesDefeated.includes(b.id));
      if (!remaining.length) {
        this.openTalk(["The ledger is blank. The Divide is quiet."]);
        return;
      }
      const lines = remaining.slice(0, 4).map((b) => `${b.order}. ${b.title}`);
      if (remaining.length > 4) lines.push(`...and ${remaining.length - 4} more seals.`);
      this.openTalk(["BLOODLINE LEDGER — walk a gold door.", ...lines]);
      return;
    }
    const lines = DIALOGUE[id];
    if (lines) this.openTalk(lines);
    else this.openTalk(["..."]);
  }

  checkWarps() {
    const w = this.map.warps.find((w) => w.x === G.tx && w.y === G.ty);
    if (!w) return;
    this.takeWarp(w);
  }

  takeWarp(w: { to: MapId; tx: number; ty: number; need?: string }) {
    if (w.need === "dungeon" && !G.flags.dungeonOpen) {
      if (!this.talking) this.openTalk(DIALOGUE.gate_locked);
      this.player.y += 12;
      G.ty = Math.floor(this.player.y / TILE);
      return;
    }
    if (w.to === "dungeon" && G.flags.dungeonOpen && G.map === "hub") {
      this.openTalkThen(DIALOGUE.gate_open, () => this.goMap(w.to, w.tx, w.ty));
      return;
    }
    const enterKey = w.to === "red" ? "red_enter" : w.to === "blue" ? "blue_enter" : w.to === "dungeon" ? "dungeon_enter" : null;
    this.goMap(w.to, w.tx, w.ty);
    if (enterKey && DIALOGUE[enterKey]) {
      this.time.delayedCall(80, () => this.openTalk(DIALOGUE[enterKey]!));
    }
  }

  goMap(id: MapId, tx: number, ty: number) {
    G.map = id;
    G.tx = tx;
    G.ty = ty;
    this.buildMap(id);
  }

  checkDoors() {
    if (G.map !== "dungeon") return;
    const door = DUNGEON_DOORS.find((d) => d.x === G.tx && d.y === G.ty);
    if (!door) return;
    const boss = BOSSES[door.order - 1];
    if (!boss) return;
    if (G.flags.bossesDefeated.includes(boss.id)) {
      this.player.y += 16;
      return;
    }
    const prev = door.order === 1 ? true : G.flags.bossesDefeated.includes(BOSSES[door.order - 2]!.id);
    if (!prev) {
      this.openTalk([`${boss.title} is sealed.`, "Defeat the previous bloodline first."]);
      this.player.y += 16;
      return;
    }
    this.player.y += 16;
    G.ty = Math.floor(this.player.y / TILE);
    this.openTalkThen(
      [`${boss.title}`, boss.location, "The seal hums. Z to challenge."],
      () => this.startEncounter(boss.id, true),
    );
  }

  startEncounter(enemyId: string, boss = false, mini?: "red" | "blue") {
    const def = ENEMIES[enemyId];
    if (!def) return;
    unlockAudio();
    const bg =
      enemyId === "merovingian_king"
        ? "bg-thrones"
        : def.kind === "boss" || def.kind === "final"
          ? "bg-vault"
          : this.map.battleBg;
    G.pendingEncounter = {
      enemyIds: [mini ? "reeducation_instructor" : enemyId],
      isBoss: boss,
      bg,
      cannotFlee: boss,
      returnMap: G.map,
      returnX: G.tx,
      returnY: G.ty,
    };
    if (mini) {
      G.pendingEncounter.enemyIds = ["reeducation_instructor"];
      (G.pendingEncounter as { mini?: string }).mini = mini;
    }
    const color = this.map.encounters === "left" ? 0x2a4a9a : this.map.encounters === "right" ? 0xc41e3a : 0x7a8aa0;
    this.flash?.setFillStyle(color, 0);
    this.tweens.add({
      targets: this.flash,
      fillAlpha: { from: 0, to: 1 },
      yoyo: true,
      duration: 90,
      repeat: 3,
      onComplete: () => {
        this.scene.setVisible(false, "overworld");
        this.scene.sleep("overworld");
        this.scene.launch("battle", { mini });
      },
    });
  }

  onBattleOver(result: { won: boolean; fled: boolean; enemyId: string; mini?: "red" | "blue" }) {
    this.scene.setVisible(true, "overworld");
    this.scene.wake("overworld");
    playMusic(this.map.music);
    if (result.fled) return;
    if (!result.won) {
      healFull();
      G.hero.hp = Math.max(1, Math.floor(G.hero.maxHp * 0.4));
      G.hero.gold = Math.floor(G.hero.gold * 0.8);
      this.goMap("tavern", 6, 6);
      writeSave();
      this.openTalk(["You black out. The innkeeper hauls you back.", "HP partially restored. Some gold is gone."]);
      return;
    }
    if (this.map.encounters !== "none" && !result.mini && ENEMIES[result.enemyId]?.kind === "regular") {
      noteWin(this.map.encounters);
    }
    if (result.mini === "red") {
      G.flags.redMiniboss = true;
      G.flags.dungeonOpen = G.flags.redMiniboss && G.flags.blueMiniboss;
      writeSave();
      this.openTalk(["The Red Instructor is silenced.", G.flags.dungeonOpen ? "Both districts are clear. The gate waits." : "Blue District still lectures."]);
      return;
    }
    if (result.mini === "blue") {
      G.flags.blueMiniboss = true;
      G.flags.dungeonOpen = G.flags.redMiniboss && G.flags.blueMiniboss;
      writeSave();
      this.openTalk(["The Blue Instructor is silenced.", G.flags.dungeonOpen ? "Both districts are clear. The gate waits." : "Red District still preaches."]);
      return;
    }
    if (result.enemyId === "rothschild_archon") {
      writeSave();
      this.openTalk(DIALOGUE.after_rothschild);
    }
    if (result.enemyId === "merovingian_king") {
      G.flags.ending = true;
      writeSave();
      this.openTalkThen(DIALOGUE.ending, () => {
        resetGame();
        this.scene.start("title");
      });
    }
  }

  openTalk(lines: string[]) {
    this.closeTalk();
    this.talking = true;
    this.lines = lines;
    this.lineI = 0;
    this.talkBox = windowBox(this, 16, VIEW_H - 78, VIEW_W - 32, 66, 60).setScrollFactor(0);
    this.talkText = px(this, 28, VIEW_H - 66, wrap(lines[0] ?? "", 34), 7).setScrollFactor(0).setDepth(61);
  }

  openTalkThen(lines: string[], cb: () => void) {
    this.openTalk(lines);
    this.events.once("talk-done", cb);
  }

  advanceTalk() {
    sfx("menu");
    this.lineI += 1;
    if (this.lineI >= this.lines.length) {
      this.closeTalk();
      this.events.emit("talk-done");
      return;
    }
    this.talkText?.setText(wrap(this.lines[this.lineI] ?? "", 34));
  }

  closeTalk() {
    this.talking = false;
    this.talkBox?.destroy();
    this.talkText?.destroy();
    this.talkBox = undefined;
    this.talkText = undefined;
  }
}
