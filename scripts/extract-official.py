#!/usr/bin/env python3
"""Extract official portraits/sprites onto transparent 2x2 sheets + pack BGs."""
from __future__ import annotations

import json
import shutil
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
OFF = ROOT / "assets" / "ref" / "official"
EXT = ROOT / "assets" / "ref" / "extracted"
SPR = ROOT / "assets" / "sprites"
OUT = ROOT / "public" / "game"
ART = ROOT / "artifacts" / "imagine_images"

EXT.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

MAG = (255, 0, 255, 255)


def arr_rgb(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert("RGB"), dtype=np.uint8)


def color_dist(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    a = a.astype(np.int32)
    b = b.astype(np.int32)
    d = a - b
    return np.sqrt((d * d).sum(axis=-1).astype(np.float32))


def auto_crop_banner(im: Image.Image) -> Image.Image:
    """Drop gold/name HP bars along the bottom when a divider is present."""
    a = arr_rgb(im)
    h, w = a.shape[:2]
    y0 = int(h * 0.72)
    gold = (
        (a[y0:, :, 0] > 150)
        & (a[y0:, :, 1] > 105)
        & (a[y0:, :, 2] < 120)
    )
    gold_rows = gold.mean(axis=1)
    hits = np.where(gold_rows > 0.12)[0]
    if hits.size:
        cut = y0 + int(hits[0]) - 4
        if 0.72 * h < cut < 0.95 * h:
            return im.crop((0, 0, w, cut))
    # dark solid caption band (distinct from a dark scene)
    lum = a.mean(axis=2)
    bot = lum[int(h * 0.90) :].mean()
    mid = lum[int(h * 0.45) : int(h * 0.70)].mean()
    if bot < 28 and mid > bot + 25:
        return im.crop((0, 0, w, int(h * 0.90)))
    return im


def crop_frame(im: Image.Image, frac: float = 0.07) -> Image.Image:
    w, h = im.size
    dx, dy = int(w * frac), int(h * frac)
    return im.crop((dx, dy, w - dx, h - dy))


def flood_bg(rgb: np.ndarray, thresh: float, protect: float = 0.52) -> np.ndarray:
    """Flood from edges through pixels similar to sampled edge colors."""
    h, w = rgb.shape[:2]
    # downsample for speed
    step = 2 if min(h, w) > 700 else 1
    small = rgb[::step, ::step]
    sh, sw = small.shape[:2]
    corners = [
        small[:12, :12].reshape(-1, 3).mean(axis=0),
        small[:12, -12:].reshape(-1, 3).mean(axis=0),
        small[-12:, :12].reshape(-1, 3).mean(axis=0),
        small[-12:, -12:].reshape(-1, 3).mean(axis=0),
        small[:8, sw // 2 - 8 : sw // 2 + 8].reshape(-1, 3).mean(axis=0),
        small[-8:, sw // 2 - 8 : sw // 2 + 8].reshape(-1, 3).mean(axis=0),
        small[sh // 2 - 8 : sh // 2 + 8, :8].reshape(-1, 3).mean(axis=0),
        small[sh // 2 - 8 : sh // 2 + 8, -8:].reshape(-1, 3).mean(axis=0),
    ]
    dmin = np.min(np.stack([color_dist(small, c) for c in corners], axis=0), axis=0)
    walkable = dmin < thresh

    # checker / green screen
    g = small.astype(np.int16)
    greenish = (g[:, :, 1] > g[:, :, 0] + 18) & (g[:, :, 1] > g[:, :, 2] + 18) & (g[:, :, 1] > 70)
    if greenish.mean() > 0.35:
        walkable = walkable | greenish

    bg = np.zeros((sh, sw), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(sw):
        q.append((0, x))
        q.append((sh - 1, x))
    for y in range(sh):
        q.append((y, 0))
        q.append((y, sw - 1))
    while q:
        y, x = q.popleft()
        if y < 0 or x < 0 or y >= sh or x >= sw or bg[y, x]:
            continue
        if not walkable[y, x]:
            continue
        bg[y, x] = True
        q.append((y - 1, x))
        q.append((y + 1, x))
        q.append((y, x - 1))
        q.append((y, x + 1))

    # upsample
    mask = np.repeat(np.repeat(bg, step, axis=0), step, axis=1)[:h, :w]
    # keep a protected ellipse so clothing matching the BG is not eaten
    yy, xx = np.ogrid[:h, :w]
    cy, cx = h * 0.48, w * 0.5
    ry, rx = h * protect, w * protect
    ellipse = ((yy - cy) / ry) ** 2 + ((xx - cx) / rx) ** 2 <= 1.0
    # only protect pixels that were NOT flooded — already the case
    # fill small holes in FG
    fg = ~mask
    # drop tiny FG crumbs
    return fg


def largest_component(fg: np.ndarray) -> np.ndarray:
    h, w = fg.shape
    vis = np.zeros_like(fg, dtype=bool)
    best = None
    best_n = 0
    for y in range(h):
        row = fg[y]
        for x in np.where(row)[0]:
            if vis[y, x]:
                continue
            q = deque([(y, x)])
            vis[y, x] = True
            cells: list[tuple[int, int]] = []
            while q:
                cy, cx = q.popleft()
                cells.append((cy, cx))
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and fg[ny, nx] and not vis[ny, nx]:
                        vis[ny, nx] = True
                        q.append((ny, nx))
            if len(cells) > best_n:
                best_n = len(cells)
                best = cells
    out = np.zeros_like(fg)
    if best:
        for y, x in best:
            out[y, x] = True
    return out


def extract_subject(im: Image.Image, thresh: float = 42.0, banner: bool = True) -> Image.Image:
    if banner:
        im = auto_crop_banner(im)
    rgb = arr_rgb(im)
    h, w = rgb.shape[:2]
    # work at max 720 on the long edge
    scale = 720 / max(h, w)
    if scale < 1:
        small_im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.BILINEAR)
        rgb_s = arr_rgb(small_im)
    else:
        rgb_s = rgb
        scale = 1.0
    fg = flood_bg(rgb_s, thresh=thresh)
    fg = largest_component(fg)
    if fg.mean() < 0.02:
        # fallback: chroma the median edge color only
        d = color_dist(rgb_s, rgb_s[0, 0])
        fg = d > thresh
        fg = largest_component(fg)
    # bbox
    ys, xs = np.where(fg)
    if ys.size == 0:
        return im.convert("RGBA")
    y0, y1 = ys.min(), ys.max() + 1
    x0, x1 = xs.min(), xs.max() + 1
    pad = 6
    y0 = max(0, y0 - pad)
    x0 = max(0, x0 - pad)
    y1 = min(fg.shape[0], y1 + pad)
    x1 = min(fg.shape[1], x1 + pad)
    cut = rgb_s[y0:y1, x0:x1]
    alpha = (fg[y0:y1, x0:x1].astype(np.uint8)) * 255
    # slight dilate alpha to keep outlines
    aimg = Image.fromarray(alpha, "L").filter(ImageFilter.MaxFilter(3))
    rgba = np.dstack([cut, np.asarray(aimg)])
    out = Image.fromarray(rgba, "RGBA")
    # restore original resolution-ish
    if scale < 1:
        out = out.resize((max(1, int(out.width / scale)), max(1, int(out.height / scale))), Image.Resampling.NEAREST)
    return out


def fit_cell(im: Image.Image, cell: int, pad: int = 8, bob: int = 0) -> Image.Image:
    canvas = Image.new("RGBA", (cell, cell), (255, 0, 255, 0))
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    # trim transparent
    a = np.asarray(im.split()[-1])
    ys, xs = np.where(a > 12)
    if ys.size == 0:
        return canvas
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    avail = cell - pad * 2
    scale = min(avail / im.width, avail / im.height)
    nw, nh = max(1, int(im.width * scale)), max(1, int(im.height * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (cell - nw) // 2
    y = cell - pad - nh + bob
    y = max(2, min(cell - nh - 2, y))
    canvas.paste(im, (x, y), im)
    return canvas


def pack_idle(im: Image.Image, dest: Path, cell: int = 128) -> None:
    sheet = Image.new("RGBA", (cell * 2, cell * 2), (255, 0, 255, 0))
    bobs = [0, -2, 0, -3]
    for i, bob in enumerate(bobs):
        fr = fit_cell(im, cell, pad=6, bob=bob)
        sheet.paste(fr, ((i % 2) * cell, (i // 2) * cell))
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest)
    print("idle", dest.name, sheet.size)


def pack_walk_fallback(im: Image.Image, dest: Path, cell: int = 96) -> None:
    """4x4 from a single overworld pose: down/left/right/up with a step bob."""
    sheet = Image.new("RGBA", (cell * 4, cell * 4), (255, 0, 255, 0))
    right = fit_cell(im, cell, pad=10, bob=0)
    left = right.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    down = right
    up = right
    rows = [down, left, right, up]
    for r, base in enumerate(rows):
        for c, bob in enumerate((0, 2, 0, -2)):
            fr = Image.new("RGBA", (cell, cell), (255, 0, 255, 0))
            fr.paste(base, (0, bob if bob > 0 else 0))
            if bob < 0:
                fr = fit_cell(im if r != 1 else im.transpose(Image.Transpose.FLIP_LEFT_RIGHT), cell, pad=10, bob=bob)
            sheet.paste(fr, (c * cell, r * cell))
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest)
    print("walk", dest.name, sheet.size)


def pack_attack(frames: list[Image.Image], dest: Path, cell: int = 128) -> None:
    sheet = Image.new("RGBA", (cell * 2, cell * 2), (255, 0, 255, 0))
    for i, fr in enumerate(frames[:4]):
        sheet.paste(fit_cell(fr, cell, pad=4, bob=0), ((i % 2) * cell, (i // 2) * cell))
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest)
    print("atk", dest.name, sheet.size)


def save_bg(src: Image.Image, dest: Path, size: tuple[int, int] = (480, 270)) -> None:
    im = src.convert("RGB").resize(size, Image.Resampling.LANCZOS)
    crunch = im.resize((size[0] // 2, size[1] // 2), Image.Resampling.BILINEAR).resize(size, Image.Resampling.NEAREST)
    dest.parent.mkdir(parents=True, exist_ok=True)
    crunch.save(dest, quality=90)
    print("bg", dest.name)


def slice_attack_strip(path: Path) -> list[Image.Image]:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    # 4 panels with thin black gutters
    panel_w = w // 4
    frames = []
    for i in range(4):
        panel = im.crop((i * panel_w + 4, 24, (i + 1) * panel_w - 4, h - 24))
        frames.append(extract_subject(panel, thresh=38, banner=False))
    return frames


def slice_map_panels(path: Path) -> dict[str, Image.Image]:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    # fractions from the official MAP AND LOCATIONS layout
    crops = {
        "red": (0.02, 0.05, 0.33, 0.48),
        "blue": (0.34, 0.05, 0.66, 0.48),
        "gray": (0.67, 0.05, 0.99, 0.48),
        "capitol": (0.01, 0.52, 0.30, 0.93),
        "dungeon": (0.31, 0.52, 0.50, 0.93),
        "plaza": (0.51, 0.52, 0.74, 0.93),
        "tower": (0.75, 0.50, 0.99, 0.96),
    }
    out = {}
    for k, (x0, y0, x1, y1) in crops.items():
        out[k] = im.crop((int(w * x0), int(h * y0), int(w * x1), int(h * y1)))
    return out


PORTRAITS: list[tuple[str, str, float]] = [
    # dest_key, filename, flood threshold
    ("enemy-crusader", "faith-first.jpg", 48),
    ("enemy-brawler", "no-apologies.jpg", 36),
    ("enemy-knight", "maga-knight.jpg", 40),
    ("enemy-corporate", "corporate-slave.jpg", 40),
    ("enemy-sheep", "internet-sheep.jpg", 44),
    ("enemy-mage", "mage.jpg", 34),
    ("enemy-activist", "activist.jpg", 42),
    ("enemy-berserker", "berserker.jpg", 44),
    ("enemy-sheeple", "sheeple.jpg", 40),
    ("enemy-captain", "culture-war.jpg", 44),
    ("enemy-puppet", "cable-news.jpg", 44),
    ("enemy-slime", "echo-slime.jpg", 40),
    ("enemy-instructor", "instructor.jpg", 42),
    ("npc-innkeeper", "innkeeper.jpg", 44),
    ("boss-rothschild", "rothschild.jpg", 46),
    ("boss-rockefeller", "rockefeller.jpg", 36),
    ("boss-astor", "astor.jpg", 44),
    ("boss-bundy", "bundy.jpg", 48),
    ("boss-collins", "collins.jpg", 46),
    ("boss-dupont", "dupont.jpg", 48),
    ("boss-freeman", "freeman.jpg", 44),
    ("boss-kennedy", "kennedy.jpg", 46),
    ("boss-li", "li-emperor.jpg", 46),
    ("boss-onassis", "onassis.jpg", 48),
    ("boss-reynolds", "lobbyist.jpg", 40),
    ("boss-russell", "russell.jpg", 44),
    ("boss-vanduyn", "vanduyn.jpg", 44),
    ("boss-serpent", "merovingian.jpg", 46),
]


def main() -> None:
    # Baki battle idle (already extracted well — re-run from official for consistency)
    battle = extract_subject(Image.open(OFF / "baki-battle.jpg"), thresh=36, banner=False)
    battle.save(EXT / "baki-battle-clean.png")
    pack_idle(battle, SPR / "baki_idle" / "sheet-transparent.png", 128)
    shutil.copy2(SPR / "baki_idle" / "sheet-transparent.png", OUT / "baki-idle.png")

    # Attack strip
    frames = slice_attack_strip(OFF / "baki-attack-strip.jpg")
    for i, fr in enumerate(frames, 1):
        fr.save(EXT / f"baki-atk-{i}.png")
    pack_attack(frames, SPR / "baki_attack" / "sheet-transparent.png", 128)
    shutil.copy2(SPR / "baki_attack" / "sheet-transparent.png", OUT / "baki-attack.png")

    # Overworld
    ow = extract_subject(Image.open(OFF / "baki-overworld.jpg"), thresh=40, banner=False)
    ow.save(EXT / "baki-overworld-clean.png")
    pack_walk_fallback(ow, SPR / "baki_walk" / "sheet-transparent.png", 96)
    shutil.copy2(SPR / "baki_walk" / "sheet-transparent.png", OUT / "baki-walk.png")

    # Portrait
    port = crop_frame(Image.open(OFF / "baki-portrait.jpg"), 0.075)
    port.save(EXT / "baki-portrait-inner.jpg", quality=92)
    port.resize((96, 96), Image.Resampling.LANCZOS).save(OUT / "baki-portrait.jpg", quality=90)

    # Portraits → unique idle sheets
    for key, fname, thr in PORTRAITS:
        src = OFF / fname
        if not src.exists():
            print("MISSING", src)
            continue
        sub = extract_subject(Image.open(src), thresh=thr, banner=True)
        sub.save(EXT / f"{key}-clean.png")
        dest_dir = SPR / key.replace("-", "_")
        pack_idle(sub, dest_dir / "sheet-transparent.png", 128)
        shutil.copy2(dest_dir / "sheet-transparent.png", OUT / f"{key}.png")

    # Shared aliases used by older keys
    aliases = {
        "enemy-right": "enemy-knight",
        "enemy-left": "enemy-activist",
        "boss-reynolds": "boss-reynolds",
    }
    for a, b in aliases.items():
        src = OUT / f"{b}.png"
        if src.exists() and a != b:
            shutil.copy2(src, OUT / f"{a}.png")

    # Title + opening
    opening = Image.open(OFF / "opening.jpg")
    save_bg(opening, OUT / "title.jpg")
    save_bg(opening, OUT / "opening.jpg")

    # BGs
    save_bg(Image.open(OFF / "illuminati-thrones.jpg"), OUT / "bg-thrones.jpg")
    panels = slice_map_panels(OFF / "map-tiles.jpg")
    save_bg(panels["red"], OUT / "bg-red.jpg")
    save_bg(panels["blue"], OUT / "bg-blue.jpg")
    save_bg(panels["dungeon"], OUT / "bg-vault.jpg")
    save_bg(panels["capitol"], OUT / "bg-capitol.jpg")
    save_bg(panels["plaza"], OUT / "bg-plaza.jpg")
    save_bg(Image.open(OFF / "innkeeper.jpg"), OUT / "bg-tavern.jpg")
    save_bg(Image.open(OFF / "chibi-atlas.jpg"), OUT / "codex.jpg", (896, 504))
    save_bg(Image.open(OFF / "menu-ui.jpg"), OUT / "menu-ui.jpg")
    shutil.copy2(OFF / "map-tiles.jpg", OUT / "map-ref.jpg")

    print("done extract")


if __name__ == "__main__":
    main()
