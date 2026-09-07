#!/usr/bin/env python3
"""Copy every official upload into public/game/art so the game can show them."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path("/workspace")
OFF = ROOT / "assets" / "ref" / "official"
OUT = ROOT / "public" / "game" / "art"
OUT.mkdir(parents=True, exist_ok=True)
GAME = ROOT / "public" / "game"


def save_rgb(im: Image.Image, dest: Path, size: tuple[int, int], quality: int = 86) -> None:
    im = im.convert("RGB").resize(size, Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, quality=quality, optimize=True)
    print(f"{dest.name:28} {size[0]}x{size[1]}")


# 2:3 character cards
PORTRAITS: dict[str, str] = {
    "crusader": "faith-first.jpg",
    "propagandist": "no-apologies.jpg",
    "knight": "maga-knight.jpg",
    "sheep": "internet-sheep.jpg",
    "mage": "mage.jpg",
    "activist": "activist.jpg",
    "corporate": "corporate-slave.jpg",
    "berserker": "berserker.jpg",
    "sheeple": "sheeple.jpg",
    "captain": "culture-war.jpg",
    "puppet": "cable-news.jpg",
    "slime": "echo-slime.jpg",
    "instructor": "instructor.jpg",
    "innkeeper": "innkeeper.jpg",
    "rothschild": "rothschild.jpg",
    "rockefeller": "rockefeller.jpg",
    "astor": "astor.jpg",
    "bundy": "bundy.jpg",
    "collins": "collins.jpg",
    "dupont": "dupont.jpg",
    "freeman": "freeman.jpg",
    "kennedy": "kennedy.jpg",
    "li": "li-emperor.jpg",
    "onassis": "onassis.jpg",
    "lobbyist": "lobbyist.jpg",
    "russell": "russell.jpg",
    "vanduyn": "vanduyn.jpg",
    "merovingian": "merovingian.jpg",
}

WIDE = {
    "opening": ("opening.jpg", (960, 540)),
    "menu": ("menu-ui.jpg", (960, 540)),
    "map": ("map-tiles.jpg", (960, 540)),
    "chibi": ("chibi-atlas.jpg", (960, 540)),
    "illuminati": ("illuminati-thrones.jpg", (960, 540)),
    "baki-attack": ("baki-attack-strip.jpg", (960, 540)),
}

SQUARE = {
    "baki-head": ("baki-portrait.jpg", (512, 512)),
    "baki-overworld": ("baki-overworld.jpg", (512, 512)),
    "baki-battle": ("baki-battle.jpg", (640, 854)),
}


def main() -> None:
    for name, src in PORTRAITS.items():
        save_rgb(Image.open(OFF / src), OUT / f"{name}.jpg", (320, 480))

    for name, (src, size) in WIDE.items():
        save_rgb(Image.open(OFF / src), OUT / f"{name}.jpg", size)

    for name, (src, size) in SQUARE.items():
        save_rgb(Image.open(OFF / src), OUT / f"{name}.jpg", size)

    # Also drop MENU / MAP / opening at game resolution for direct UI use
    save_rgb(Image.open(OFF / "menu-ui.jpg"), GAME / "menu-ui.jpg", (480, 270), 90)
    save_rgb(Image.open(OFF / "map-tiles.jpg"), GAME / "map-ref.jpg", (480, 270), 90)
    save_rgb(Image.open(OFF / "opening.jpg"), GAME / "opening.jpg", (480, 270), 90)
    save_rgb(Image.open(OFF / "opening.jpg"), GAME / "title.jpg", (480, 270), 90)
    save_rgb(Image.open(OFF / "illuminati-thrones.jpg"), GAME / "bg-thrones.jpg", (480, 270), 90)
    save_rgb(Image.open(OFF / "innkeeper.jpg"), GAME / "bg-tavern.jpg", (480, 270), 90)
    save_rgb(Image.open(OFF / "baki-portrait.jpg"), GAME / "baki-portrait.jpg", (256, 256), 90)
    save_rgb(Image.open(OFF / "chibi-atlas.jpg"), GAME / "codex.jpg", (896, 504), 88)

    m = Image.open(OFF / "map-tiles.jpg").convert("RGB")
    w, h = m.size
    crops = {
        "bg-capitol.jpg": (int(w * 0.012), int(h * 0.525), int(w * 0.295), int(h * 0.92)),
        "bg-vault.jpg": (int(w * 0.305), int(h * 0.525), int(w * 0.495), int(h * 0.92)),
        "bg-plaza.jpg": (int(w * 0.505), int(h * 0.525), int(w * 0.735), int(h * 0.92)),
        "bg-red.jpg": (int(w * 0.505), int(h * 0.525), int(w * 0.735), int(h * 0.92)),
        "bg-blue.jpg": (int(w * 0.745), int(h * 0.50), int(w * 0.995), int(h * 0.96)),
    }
    for dest, box in crops.items():
        save_rgb(m.crop(box), GAME / dest, (480, 270), 90)

    print("art pages", len(list(OUT.glob("*.jpg"))))


if __name__ == "__main__":
    main()
