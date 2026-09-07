import Phaser from "phaser";
import { ART } from "../art";
import { playMusic, sfx } from "../audio";
import { axis, consumeCancel, consumeConfirm } from "../input";
import { VIEW_H, VIEW_W } from "../types";
import { px } from "../ui";

export class GalleryScene extends Phaser.Scene {
  private i = 0;
  private ret = "title";
  private img?: Phaser.GameObjects.Image;
  private caption?: Phaser.GameObjects.Text;
  private lastNav = 0;

  constructor() {
    super("gallery");
  }

  init(data: { ret?: string; start?: number }) {
    this.ret = data?.ret ?? "title";
    this.i = data?.start ?? 0;
  }

  create() {
    playMusic("title");
    this.scene.bringToTop("gallery");
    this.cameras.main.setBackgroundColor(0x0c0814);
    this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x0c0814, 1);
    this.img = this.add.image(VIEW_W / 2, VIEW_H / 2 + 6, ART[0]!.key).setDepth(1);
    this.add.rectangle(VIEW_W / 2, 12, VIEW_W, 24, 0x0c0814, 0.78).setDepth(2);
    this.add.rectangle(VIEW_W / 2, VIEW_H - 12, VIEW_W, 24, 0x0c0814, 0.78).setDepth(2);
    this.caption = px(this, VIEW_W / 2, 6, "", 7, "#e8b84a").setOrigin(0.5, 0).setDepth(3);
    px(this, VIEW_W / 2, VIEW_H - 18, "A / D PAGE     Z / X BACK", 6, "#7a8aa0").setOrigin(0.5, 0).setDepth(3);
    this.show();
  }

  show() {
    const page = ART[this.i]!;
    if (!this.textures.exists(page.key)) return;
    this.img!.setTexture(page.key);
    const tex = this.textures.get(page.key).getSourceImage() as HTMLImageElement;
    const tw = tex.width || 320;
    const th = tex.height || 240;
    const scale = Math.min((VIEW_W - 16) / tw, (VIEW_H - 40) / th);
    this.img!.setDisplaySize(Math.floor(tw * scale), Math.floor(th * scale));
    this.caption!.setText(`${this.i + 1}/${ART.length}  ${page.title}`);
  }

  update(time: number) {
    if (consumeCancel() || consumeConfirm()) {
      sfx("ok");
      this.scene.start(this.ret);
      return;
    }
    const a = axis();
    if (time - this.lastNav > 160) {
      if (a.x > 0) {
        this.i = (this.i + 1) % ART.length;
        this.lastNav = time;
        sfx("menu");
        this.show();
      } else if (a.x < 0) {
        this.i = (this.i - 1 + ART.length) % ART.length;
        this.lastNav = time;
        sfx("menu");
        this.show();
      }
    }
  }
}
