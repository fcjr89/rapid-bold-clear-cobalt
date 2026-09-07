# Console art notes

Platform order: Steam → iOS → Android → **consoles last**. These exports are for Unity/Godot ports (see `docs/CONSOLE_PORT.md`), not fake native Phaser builds.

## Power-of-two (`pot/`)

Many console GPU paths still prefer or require **power-of-two** texture dimensions (especially older Switch / some middleware). Each file here is the canonical `public/game/` (or `art/`) asset **padded** (not stretched) to the next POT size, centered, sRGB.

| Source | Typical pad |
|--------|-------------|
| title / opening / menu-ui / BGs `480×270` | → `512×512` |
| baki-portrait `256×256` | → `256×256` (already POT) |
| tiles `128×64` | → `128×64` (already POT) |
| gallery portraits `320×480` | → `512×512` |
| baki-head `512×512` | → `512×512` |

UV / draw code must account for padding (content occupies a sub-rect). Prefer keeping the original aspect when sampling.

## Switch (handheld / docked)

- **Handheld:** ~1280×720; favor the JPEG POT copies and aggressive atlasing; watch peak VRAM.
- **Docked:** 1920×1080; PNG POT fine; keep sRGB, avoid linear-as-sRGB double gamma.
- Dual sets optional: handheld can use mobile `@2x` WebP/JPEG; docked can use POT PNG.

## 4K consoles (PS5 / Xbox Series / high-end)

- Prefer source or studio-generated higher-res when available (`studio/generated/`), then re-export POT (e.g. 1024/2048).
- Current originals are modest (≤960px); upscaling for 4K is a **content** decision — do not silently replace `public/game/`.
- Use sRGB color space; author mipmaps in the engine; compress with platform BC/ASTC at import time (not stored here).

## sRGB

All exports are tagged/processed as **sRGB**. Import as sRGB in Unity/Godot; do not treat UI portraits as linear.

## Swap workflow

1. Keep `public/game/` as gameplay source of truth for Phaser/web/Steam Electron.
2. For console projects, import from `studio/optimized/console/pot/` (or regenerate).
3. Document any UV padding in the console repo; do not overwrite Phaser paths without a branch review.
