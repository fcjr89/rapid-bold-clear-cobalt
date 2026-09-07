#!/usr/bin/env python3
"""Pack generated sprites, tiles, and backdrops into public/game."""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("/workspace")
SRC = ROOT / "assets" / "sprites"
ART = ROOT / "artifacts" / "imagine_images"
OUT = ROOT / "public" / "game"
OUT.mkdir(parents=True, exist_ok=True)

TILE = 16


def quantize_nearest(im: Image.Image, colors: int = 24) -> Image.Image:
    pal = im.convert("P", palette=Image.ADAPTIVE, colors=colors)
    return pal.convert("RGBA") if im.mode == "RGBA" else pal.convert("RGB")


def pixelate(im: Image.Image, w: int, h: int) -> Image.Image:
    small = im.resize((w, h), Image.Resampling.BILINEAR)
    return small.resize((w, h), Image.Resampling.NEAREST)


def copy_sheet(name: str, src_dir: str, filename: str = "sheet-transparent.png") -> dict:
    src = SRC / src_dir / filename
    dest = OUT / f"{name}.png"
    shutil.copy2(src, dest)
    meta_path = SRC / src_dir / "pipeline-meta.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    return {
        "file": f"/game/{name}.png",
        "cell": int(meta.get("cell_size") or 128),
        "rows": int(meta.get("rows") or 2),
        "cols": int(meta.get("cols") or 2),
    }


def make_tileset() -> None:
    """Readable 16-bit tiles. Index layout is 8 wide × 4 tall = 32 tiles."""
    W, H = 8 * TILE, 4 * TILE
    im = Image.new("RGB", (W, H), (12, 8, 20))
    d = ImageDraw.Draw(im)

    def cell(i: int) -> tuple[int, int]:
        return (i % 8) * TILE, (i // 8) * TILE

    def fill(i: int, color: tuple[int, int, int]) -> None:
        x, y = cell(i)
        d.rectangle([x, y, x + TILE - 1, y + TILE - 1], fill=color)

    def speck(i: int, color: tuple[int, int, int], n: int = 10, seed: int = 1) -> None:
        x, y = cell(i)
        s = seed * 9973 + i * 131
        for k in range(n):
            s = (s * 1103515245 + 12345) & 0x7FFFFFFF
            px = x + (s % TILE)
            s = (s * 1103515245 + 12345) & 0x7FFFFFFF
            py = y + (s % TILE)
            d.point((px, py), fill=color)

    def bricks(i: int, mortar: tuple[int, int, int], brick: tuple[int, int, int], shift: bool = True) -> None:
        x, y = cell(i)
        d.rectangle([x, y, x + TILE - 1, y + TILE - 1], fill=mortar)
        bh, bw = 4, 7
        for row in range(0, TILE, bh):
            off = 3 if (shift and (row // bh) % 2) else 0
            yy = y + row
            d.line([(x, yy), (x + TILE - 1, yy)], fill=mortar)
            for col in range(-off, TILE, bw):
                xx = x + col
                d.rectangle([xx + 1, yy + 1, min(xx + bw - 2, x + TILE - 2), min(yy + bh - 2, y + TILE - 2)], fill=brick)

    def cobble(i: int, base: tuple[int, int, int], light: tuple[int, int, int], dark: tuple[int, int, int]) -> None:
        fill(i, base)
        x, y = cell(i)
        stones = [(1, 1, 6, 5), (8, 2, 6, 5), (3, 8, 7, 6), (10, 9, 5, 5), (0, 11, 4, 4)]
        for sx, sy, sw, sh in stones:
            d.rectangle([x + sx, y + sy, x + sx + sw - 1, y + sy + sh - 1], outline=dark, fill=light)

    def wall(i: int, base: tuple[int, int, int], hi: tuple[int, int, int], lo: tuple[int, int, int]) -> None:
        x, y = cell(i)
        d.rectangle([x, y, x + TILE - 1, y + TILE - 1], fill=base)
        d.line([(x, y), (x + TILE - 1, y)], fill=hi)
        d.line([(x, y), (x, y + TILE - 1)], fill=hi)
        d.line([(x, y + TILE - 1), (x + TILE - 1, y + TILE - 1)], fill=lo)
        d.line([(x + TILE - 1, y), (x + TILE - 1, y + TILE - 1)], fill=lo)
        bricks(i, lo, base, True)

    # 0 grass
    fill(0, (58, 102, 52))
    speck(0, (90, 140, 64), 18, 2)
    speck(0, (40, 70, 36), 8, 9)
    # 1 cobble
    cobble(1, (110, 104, 98), (140, 132, 124), (70, 64, 60))
    # 2 dirt
    fill(2, (92, 70, 48))
    speck(2, (120, 92, 60), 14, 3)
    speck(2, (70, 50, 34), 10, 4)
    # 3 wood
    fill(3, (118, 78, 42))
    x, y = cell(3)
    for row in range(0, TILE, 4):
        d.line([(x, y + row), (x + TILE - 1, y + row)], fill=(90, 58, 30))
        d.line([(x + 5, y + row + 1), (x + 5, y + row + 3)], fill=(70, 44, 22))
    # 4 red street
    fill(4, (140, 48, 52))
    speck(4, (170, 70, 64), 12, 5)
    cobble(4, (148, 52, 56), (176, 78, 72), (96, 32, 36))
    # 5 red wall
    wall(5, (156, 42, 48), (196, 80, 70), (80, 18, 24))
    # 6 blue street
    cobble(6, (48, 70, 140), (80, 110, 180), (28, 40, 90))
    # 7 blue wall
    wall(7, (40, 62, 132), (90, 130, 190), (18, 28, 70))
    # 8 dungeon floor
    fill(8, (64, 60, 72))
    speck(8, (90, 86, 100), 12, 6)
    x, y = cell(8)
    d.rectangle([x + 1, y + 1, x + TILE - 2, y + TILE - 2], outline=(40, 36, 48))
    # 9 dungeon wall
    wall(9, (48, 44, 58), (80, 74, 92), (20, 16, 28))
    # 10 vault marble
    fill(10, (186, 168, 110))
    speck(10, (220, 200, 130), 8, 7)
    x, y = cell(10)
    d.line([(x, y + 8), (x + TILE - 1, y + 8)], fill=(150, 130, 70))
    d.line([(x + 8, y), (x + 8, y + TILE - 1)], fill=(150, 130, 70))
    # 11 water
    fill(11, (28, 64, 120))
    speck(11, (60, 120, 180), 10, 8)
    x, y = cell(11)
    d.arc([x + 2, y + 6, x + 10, y + 12], 0, 180, fill=(120, 180, 220))
    d.arc([x + 7, y + 2, x + 14, y + 8], 0, 180, fill=(90, 150, 200))
    # 12 tree/hedge
    fill(12, (28, 70, 36))
    x, y = cell(12)
    d.ellipse([x + 1, y + 1, x + 14, y + 13], fill=(46, 110, 52), outline=(16, 40, 20))
    d.rectangle([x + 6, y + 12, x + 9, y + 15], fill=(80, 50, 28))
    # 13 crate
    fill(13, (58, 102, 52))
    speck(13, (90, 140, 64), 6, 1)
    x, y = cell(13)
    d.rectangle([x + 3, y + 4, x + 12, y + 14], fill=(160, 112, 58), outline=(90, 60, 28))
    d.line([(x + 3, y + 9), (x + 12, y + 9)], fill=(90, 60, 28))
    # 14 barrel
    fill(14, (58, 102, 52))
    speck(14, (90, 140, 64), 6, 2)
    x, y = cell(14)
    d.ellipse([x + 4, y + 3, x + 11, y + 14], fill=(132, 84, 44), outline=(70, 42, 20))
    d.line([(x + 4, y + 8), (x + 11, y + 8)], fill=(70, 42, 20))
    # 15 chest
    fill(15, (58, 102, 52))
    speck(15, (90, 140, 64), 6, 3)
    x, y = cell(15)
    d.rectangle([x + 3, y + 7, x + 12, y + 14], fill=(196, 150, 50), outline=(90, 60, 20))
    d.rectangle([x + 3, y + 5, x + 12, y + 8], fill=(220, 180, 70), outline=(90, 60, 20))
    d.point((x + 7, y + 10), fill=(40, 20, 8))
    # 16 door
    fill(16, (118, 78, 42))
    x, y = cell(16)
    d.rectangle([x + 3, y + 1, x + 12, y + 15], fill=(96, 58, 28), outline=(40, 24, 12))
    d.point((x + 10, y + 9), fill=(220, 180, 70))
    # 17 tavern wall
    wall(17, (128, 86, 48), (180, 130, 70), (70, 40, 20))
    # 18 roof
    fill(18, (120, 36, 40))
    x, y = cell(18)
    for row in range(0, TILE, 3):
        d.line([(x, y + row), (x + TILE - 1, y + row)], fill=(80, 20, 24))
    # 19 flower
    fill(19, (58, 102, 52))
    speck(19, (90, 140, 64), 8, 4)
    x, y = cell(19)
    d.point((x + 7, y + 7), fill=(220, 70, 80))
    d.point((x + 6, y + 8), fill=(220, 180, 70))
    d.point((x + 8, y + 8), fill=(220, 70, 80))
    d.point((x + 7, y + 9), fill=(40, 110, 50))
    # 20 path
    fill(20, (150, 138, 110))
    speck(20, (120, 108, 84), 10, 5)
    # 21 column
    fill(21, (64, 60, 72))
    x, y = cell(21)
    d.rectangle([x + 5, y, x + 10, y + 15], fill=(186, 168, 110), outline=(90, 80, 40))
    # 22 carpet
    fill(22, (120, 32, 48))
    speck(22, (180, 60, 70), 8, 6)
    x, y = cell(22)
    d.rectangle([x + 1, y + 1, x + 14, y + 14], outline=(220, 180, 70))
    # 23 gate locked
    fill(23, (64, 60, 72))
    x, y = cell(23)
    d.rectangle([x + 2, y + 2, x + 13, y + 14], fill=(70, 70, 80), outline=(220, 180, 70))
    d.line([(x + 8, y + 2), (x + 8, y + 14)], fill=(220, 180, 70))
    # 24 gate open
    fill(24, (64, 60, 72))
    x, y = cell(24)
    d.rectangle([x + 1, y + 2, x + 4, y + 14], fill=(70, 70, 80), outline=(220, 180, 70))
    d.rectangle([x + 11, y + 2, x + 14, y + 14], fill=(70, 70, 80), outline=(220, 180, 70))
    # 25 stained
    fill(25, (40, 28, 70))
    speck(25, (180, 50, 70), 6, 7)
    speck(25, (50, 90, 180), 6, 8)
    speck(25, (220, 180, 70), 4, 9)
    # 26 oil
    fill(26, (40, 28, 16))
    speck(26, (90, 50, 20), 10, 10)
    speck(26, (20, 12, 8), 8, 11)
    # 27 gold trim floor
    fill(27, (64, 60, 72))
    x, y = cell(27)
    d.rectangle([x + 1, y + 1, x + 14, y + 14], outline=(220, 180, 70))
    d.rectangle([x + 5, y + 5, x + 10, y + 10], fill=(186, 168, 110))
    # 28 bed
    fill(28, (118, 78, 42))
    x, y = cell(28)
    d.rectangle([x + 2, y + 6, x + 13, y + 14], fill=(160, 40, 50), outline=(80, 20, 24))
    d.rectangle([x + 2, y + 4, x + 7, y + 8], fill=(230, 220, 200), outline=(80, 20, 24))
    # 29 counter
    fill(29, (118, 78, 42))
    x, y = cell(29)
    d.rectangle([x, y + 8, x + 15, y + 15], fill=(140, 90, 48), outline=(70, 44, 22))
    d.rectangle([x, y + 6, x + 15, y + 8], fill=(180, 130, 70))
    # 30 sign
    fill(30, (58, 102, 52))
    speck(30, (90, 140, 64), 6, 12)
    x, y = cell(30)
    d.rectangle([x + 4, y + 2, x + 11, y + 10], fill=(220, 200, 140), outline=(80, 60, 30))
    d.rectangle([x + 7, y + 10, x + 8, y + 14], fill=(80, 60, 30))
    # 31 void/black
    fill(31, (8, 4, 14))

    im = im.resize((W * 2, H * 2), Image.Resampling.NEAREST)  # 32px logical via 2x then we use 16 in engine
    # Keep native 16px — Phaser scales with FIT
    im = Image.new("RGB", (W, H), (12, 8, 20))
    # redraw at 16 by opening from a temp 32? already drew at 16. re-run draw? 
    # The first `im` was overwritten. Rebuild simply: we already drew on original. Recreate properly:
    raise SystemExit("unreachable")


def make_tileset_16() -> None:
    W, H = 8 * TILE, 4 * TILE
    im = Image.new("RGB", (W, H), (12, 8, 20))
    d = ImageDraw.Draw(im)

    def cell(i: int) -> tuple[int, int]:
        return (i % 8) * TILE, (i // 8) * TILE

    def fill(i: int, color: tuple[int, int, int]) -> None:
        x, y = cell(i)
        d.rectangle([x, y, x + TILE - 1, y + TILE - 1], fill=color)

    def speck(i: int, color: tuple[int, int, int], n: int = 10, seed: int = 1) -> None:
        x, y = cell(i)
        s = seed * 9973 + i * 131
        for _ in range(n):
            s = (s * 1103515245 + 12345) & 0x7FFFFFFF
            px = x + (s % TILE)
            s = (s * 1103515245 + 12345) & 0x7FFFFFFF
            py = y + (s % TILE)
            if x <= px < x + TILE and y <= py < y + TILE:
                d.point((px, py), fill=color)

    def cobble(i: int, base: tuple[int, int, int], light: tuple[int, int, int], dark: tuple[int, int, int]) -> None:
        fill(i, base)
        x, y = cell(i)
        stones = [(1, 1, 6, 5), (8, 2, 6, 5), (3, 8, 7, 6), (10, 9, 5, 5), (0, 11, 4, 4)]
        for sx, sy, sw, sh in stones:
            d.rectangle(
                [x + sx, y + sy, x + sx + sw - 1, y + sy + sh - 1],
                outline=dark,
                fill=light,
            )

    def wall(i: int, base: tuple[int, int, int], hi: tuple[int, int, int], lo: tuple[int, int, int]) -> None:
        x, y = cell(i)
        d.rectangle([x, y, x + TILE - 1, y + TILE - 1], fill=base)
        bh, bw = 4, 8
        for row in range(0, TILE, bh):
            off = 4 if (row // bh) % 2 else 0
            yy = y + row
            d.line([(x, yy), (x + TILE - 1, yy)], fill=lo)
            for col in range(-off, TILE + bw, bw):
                xx = x + col
                d.line([(xx, yy), (xx, min(yy + bh, y + TILE - 1))], fill=lo)
        d.line([(x, y), (x + TILE - 1, y)], fill=hi)
        d.line([(x, y + TILE - 1), (x + TILE - 1, y + TILE - 1)], fill=lo)

    fill(0, (58, 102, 52))
    speck(0, (90, 140, 64), 18, 2)
    speck(0, (40, 70, 36), 8, 9)
    cobble(1, (110, 104, 98), (140, 132, 124), (70, 64, 60))
    fill(2, (92, 70, 48))
    speck(2, (120, 92, 60), 14, 3)
    speck(2, (70, 50, 34), 10, 4)
    fill(3, (118, 78, 42))
    x, y = cell(3)
    for row in range(0, TILE, 4):
        d.line([(x, y + row), (x + TILE - 1, y + row)], fill=(90, 58, 30))
    cobble(4, (148, 52, 56), (176, 78, 72), (96, 32, 36))
    wall(5, (156, 42, 48), (196, 80, 70), (80, 18, 24))
    cobble(6, (48, 70, 140), (80, 110, 180), (28, 40, 90))
    wall(7, (40, 62, 132), (90, 130, 190), (18, 28, 70))
    fill(8, (64, 60, 72))
    speck(8, (90, 86, 100), 12, 6)
    x, y = cell(8)
    d.rectangle([x + 1, y + 1, x + TILE - 2, y + TILE - 2], outline=(40, 36, 48))
    wall(9, (48, 44, 58), (80, 74, 92), (20, 16, 28))
    fill(10, (186, 168, 110))
    speck(10, (220, 200, 130), 8, 7)
    x, y = cell(10)
    d.line([(x, y + 8), (x + TILE - 1, y + 8)], fill=(150, 130, 70))
    d.line([(x + 8, y), (x + 8, y + TILE - 1)], fill=(150, 130, 70))
    fill(11, (28, 64, 120))
    speck(11, (60, 120, 180), 10, 8)
    x, y = cell(11)
    d.arc([x + 2, y + 6, x + 10, y + 12], 0, 180, fill=(120, 180, 220))
    fill(12, (28, 70, 36))
    x, y = cell(12)
    d.ellipse([x + 1, y + 1, x + 14, y + 13], fill=(46, 110, 52), outline=(16, 40, 20))
    d.rectangle([x + 6, y + 12, x + 9, y + 15], fill=(80, 50, 28))
    fill(13, (58, 102, 52))
    speck(13, (90, 140, 64), 6, 1)
    x, y = cell(13)
    d.rectangle([x + 3, y + 4, x + 12, y + 14], fill=(160, 112, 58), outline=(90, 60, 28))
    d.line([(x + 3, y + 9), (x + 12, y + 9)], fill=(90, 60, 28))
    fill(14, (58, 102, 52))
    speck(14, (90, 140, 64), 6, 2)
    x, y = cell(14)
    d.ellipse([x + 4, y + 3, x + 11, y + 14], fill=(132, 84, 44), outline=(70, 42, 20))
    fill(15, (58, 102, 52))
    speck(15, (90, 140, 64), 6, 3)
    x, y = cell(15)
    d.rectangle([x + 3, y + 7, x + 12, y + 14], fill=(196, 150, 50), outline=(90, 60, 20))
    d.rectangle([x + 3, y + 5, x + 12, y + 8], fill=(220, 180, 70), outline=(90, 60, 20))
    fill(16, (118, 78, 42))
    x, y = cell(16)
    d.rectangle([x + 3, y + 1, x + 12, y + 15], fill=(96, 58, 28), outline=(40, 24, 12))
    d.point((x + 10, y + 9), fill=(220, 180, 70))
    wall(17, (128, 86, 48), (180, 130, 70), (70, 40, 20))
    fill(18, (120, 36, 40))
    x, y = cell(18)
    for row in range(0, TILE, 3):
        d.line([(x, y + row), (x + TILE - 1, y + row)], fill=(80, 20, 24))
    fill(19, (58, 102, 52))
    speck(19, (90, 140, 64), 8, 4)
    x, y = cell(19)
    d.point((x + 7, y + 7), fill=(220, 70, 80))
    d.point((x + 6, y + 8), fill=(220, 180, 70))
    d.point((x + 8, y + 8), fill=(220, 70, 80))
    fill(20, (150, 138, 110))
    speck(20, (120, 108, 84), 10, 5)
    fill(21, (64, 60, 72))
    x, y = cell(21)
    d.rectangle([x + 5, y, x + 10, y + 15], fill=(186, 168, 110), outline=(90, 80, 40))
    fill(22, (120, 32, 48))
    speck(22, (180, 60, 70), 8, 6)
    x, y = cell(22)
    d.rectangle([x + 1, y + 1, x + 14, y + 14], outline=(220, 180, 70))
    fill(23, (64, 60, 72))
    x, y = cell(23)
    d.rectangle([x + 2, y + 2, x + 13, y + 14], fill=(70, 70, 80), outline=(220, 180, 70))
    d.line([(x + 8, y + 2), (x + 8, y + 14)], fill=(220, 180, 70))
    fill(24, (64, 60, 72))
    x, y = cell(24)
    d.rectangle([x + 1, y + 2, x + 4, y + 14], fill=(70, 70, 80), outline=(220, 180, 70))
    d.rectangle([x + 11, y + 2, x + 14, y + 14], fill=(70, 70, 80), outline=(220, 180, 70))
    fill(25, (40, 28, 70))
    speck(25, (180, 50, 70), 6, 7)
    speck(25, (50, 90, 180), 6, 8)
    fill(26, (40, 28, 16))
    speck(26, (90, 50, 20), 10, 10)
    fill(27, (64, 60, 72))
    x, y = cell(27)
    d.rectangle([x + 1, y + 1, x + 14, y + 14], outline=(220, 180, 70))
    d.rectangle([x + 5, y + 5, x + 10, y + 10], fill=(186, 168, 110))
    fill(28, (118, 78, 42))
    x, y = cell(28)
    d.rectangle([x + 2, y + 6, x + 13, y + 14], fill=(160, 40, 50), outline=(80, 20, 24))
    d.rectangle([x + 2, y + 4, x + 7, y + 8], fill=(230, 220, 200), outline=(80, 20, 24))
    fill(29, (118, 78, 42))
    x, y = cell(29)
    d.rectangle([x, y + 8, x + 15, y + 15], fill=(140, 90, 48), outline=(70, 44, 22))
    fill(30, (58, 102, 52))
    speck(30, (90, 140, 64), 6, 12)
    x, y = cell(30)
    d.rectangle([x + 4, y + 2, x + 11, y + 10], fill=(220, 200, 140), outline=(80, 60, 30))
    d.rectangle([x + 7, y + 10, x + 8, y + 14], fill=(80, 60, 30))
    fill(31, (8, 4, 14))

    im.save(OUT / "tiles.png")
    print("tiles", im.size)


def save_bg(src: Path, dest_name: str) -> None:
    im = Image.open(src).convert("RGB")
    im = im.resize((480, 270), Image.Resampling.LANCZOS)
    crunch = im.resize((240, 135), Image.Resampling.BILINEAR).resize((480, 270), Image.Resampling.NEAREST)
    crunch.save(OUT / dest_name, quality=90)
    print("bg", dest_name)


def save_title(src: Path, dest_name: str) -> None:
    im = Image.open(src).convert("RGB")
    im = im.resize((480, 270), Image.Resampling.LANCZOS)
    crunch = im.resize((320, 180), Image.Resampling.BILINEAR).resize((480, 270), Image.Resampling.NEAREST)
    crunch.save(OUT / dest_name, quality=92)
    print("title", dest_name)


def main() -> None:
    manifest: dict = {"sprites": {}, "tile": TILE}

    mapping = {
        "baki-walk": "baki_walk",
        "baki-idle": "baki_idle",
        "baki-attack": "baki_attack",
        "enemy-right": "enemy_knight",
        "enemy-left": "enemy_activist",
        "enemy-slime": "enemy_slime",
        "enemy-instructor": "enemy_instructor",
        "enemy-crusader": "enemy_crusader",
        "enemy-mage": "enemy_mage",
        "enemy-brawler": "enemy_brawler",
        "enemy-knight": "enemy_knight",
        "enemy-corporate": "enemy_corporate",
        "enemy-sheep": "enemy_sheep",
        "enemy-activist": "enemy_activist",
        "enemy-berserker": "enemy_berserker",
        "enemy-sheeple": "enemy_sheeple",
        "enemy-captain": "enemy_captain",
        "enemy-puppet": "enemy_puppet",
        "npc-innkeeper": "npc_innkeeper",
        "boss-rothschild": "boss_rothschild",
        "boss-serpent": "boss_serpent",
        "boss-rockefeller": "boss_rockefeller",
        "boss-astor": "boss_astor",
        "boss-bundy": "boss_bundy",
        "boss-collins": "boss_collins",
        "boss-dupont": "boss_dupont",
        "boss-freeman": "boss_freeman",
        "boss-kennedy": "boss_kennedy",
        "boss-li": "boss_li",
        "boss-onassis": "boss_onassis",
        "boss-reynolds": "boss_reynolds",
        "boss-russell": "boss_russell",
        "boss-vanduyn": "boss_vanduyn",
    }
    for name, folder in mapping.items():
        manifest["sprites"][name] = copy_sheet(name, folder)

    make_tileset_16()

    OFF = ROOT / "assets" / "ref" / "official"
    bgs = {
        "title.jpg": OFF / "opening.jpg",
        "opening.jpg": OFF / "opening.jpg",
        "bg-thrones.jpg": OFF / "illuminati-thrones.jpg",
        "bg-tavern.jpg": OFF / "innkeeper.jpg",
        "codex.jpg": OFF / "chibi-atlas.jpg",
    }
    for dest, src in bgs.items():
        if src.exists():
            if dest in ("title.jpg", "opening.jpg", "codex.jpg"):
                im = Image.open(src).convert("RGB")
                if dest == "codex.jpg":
                    im.resize((896, 504), Image.Resampling.LANCZOS).save(OUT / dest, quality=90)
                else:
                    save_title(src, dest)
            else:
                save_bg(src, dest)
        else:
            print("MISSING", src)

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print("packed", json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
