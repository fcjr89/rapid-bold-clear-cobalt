import Phaser from "phaser";
import { bindInput } from "./input";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { IntroScene } from "./scenes/IntroScene";
import { OverworldScene } from "./scenes/OverworldScene";
import { BattleScene } from "./scenes/BattleScene";
import { GalleryScene } from "./scenes/GalleryScene";
import { StatusScene } from "./scenes/StatusScene";
import { ShopScene } from "./scenes/ShopScene";
import { VIEW_H, VIEW_W } from "./types";

let current: Phaser.Game | null = null;
let unbind: (() => void) | null = null;

export function createGame(parent: HTMLElement): Phaser.Game {
  if (current) {
    current.destroy(true);
    current = null;
  }
  unbind?.();
  unbind = bindInput();

  current = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: "#0c0814",
    render: { pixelArt: true, antialias: false, roundPixels: true },
    audio: { noAudio: true },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: VIEW_W,
      height: VIEW_H,
    },
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    scene: [BootScene, TitleScene, IntroScene, OverworldScene, BattleScene, GalleryScene, StatusScene, ShopScene],
    callbacks: {
      postBoot: (game) => {
        game.canvas.setAttribute("tabindex", "0");
        game.canvas.focus();
        const refresh = () => game.scale.refresh();
        refresh();
        requestAnimationFrame(refresh);
        window.addEventListener("resize", refresh);
        const parentEl = game.canvas.parentElement;
        if (parentEl && typeof ResizeObserver !== "undefined") {
          const ro = new ResizeObserver(refresh);
          ro.observe(parentEl);
        }
      },
    },
  });

  window.__phaserGame = current;
  return current;
}

export function destroyGame() {
  unbind?.();
  unbind = null;
  current?.destroy(true);
  current = null;
}
