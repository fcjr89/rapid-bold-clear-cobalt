import Phaser from "phaser";

export const FONT = '"Press Start 2P", monospace';

export function px(scene: Phaser.Scene, x: number, y: number, text: string, size = 8, color = "#f0e6c8") {
  return scene.add
    .text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      color,
      lineSpacing: 6,
    })
    .setResolution(3)
    .setDepth(50);
}

export function windowBox(scene: Phaser.Scene, x: number, y: number, w: number, h: number, depth = 40) {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0x160a24, 0.94);
  g.fillRect(x, y, w, h);
  g.lineStyle(2, 0xe8b84a, 1);
  g.strokeRect(x + 1, y + 1, w - 2, h - 2);
  g.lineStyle(1, 0x7b4ac8, 0.95);
  g.strokeRect(x + 3, y + 3, w - 6, h - 6);
  return g;
}

export function bar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  ratio: number,
  color: number,
  depth = 51,
) {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0x1a1424, 1);
  g.fillRect(x, y, w, h);
  g.fillStyle(color, 1);
  g.fillRect(x + 1, y + 1, Math.max(0, Math.floor((w - 2) * Phaser.Math.Clamp(ratio, 0, 1))), h - 2);
  g.lineStyle(1, 0xf0e6c8, 0.6);
  g.strokeRect(x, y, w, h);
  return g;
}

export function wrap(text: string, width = 26): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.join("\n");
}
