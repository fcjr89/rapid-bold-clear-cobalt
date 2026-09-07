# Art pipeline — Culture War / Baki The Hammer

Platform priority: **Steam → iOS → Android → consoles**.

## Layers (do not confuse)

| Path | Role | Canonical? |
|------|------|------------|
| `public/game/` (+ `public/game/art/`) | **Gameplay originals** loaded by Phaser (`BootScene`, gallery, sprites) | **Yes — source of truth** |
| `studio/generated/` | Optional Grok-generated “loved” set matching Culture War gallery names | No — optional swap candidates |
| `studio/optimized/steam/` | Store sizes, icon 512, library hero, web-friendly copies | Export only |
| `studio/optimized/mobile/` | `@2x` / `@3x` WebP/JPEG/PNG for key UI & portraits | Export only |
| `studio/optimized/console/` | Power-of-two padded textures + `CONSOLE_ART.md` | Export only |
| `steam/assets/` | Packaged Steam store/client art used by Electron packaging | Shipping Steam set |

**Rule:** never overwrite `public/game/*` originals except an in-place compression that is clearly equivalent and documented. Prefer **adding** optimized copies under `studio/optimized/`.

## Studio generated (`studio/generated/`)

Optional Grok gens the team liked (portraits under `art/`, plus `title.jpg`, `tiles.png`, `baki-portrait.jpg`, `bg-thrones.jpg`). Names mirror the gallery / public paths so a swap is a straight copy on a feature branch.

Gameplay continues to load `public/game/` until you deliberately copy a file over.

## How to swap

1. **Try a generated portrait:**  
   `cp studio/generated/art/rothschild.jpg public/game/art/rothschild.jpg` on a branch → playtest → keep or revert.
2. **Ship Steam store extras:** copy `studio/optimized/steam/icon_512.*` and `library_hero.jpg` into `steam/assets/` (already seeded there) after visual QA. Leave existing `capsule.jpg` / `library_header.jpg` unless replacing intentionally.
3. **Mobile build:** pull from `studio/optimized/mobile/2x` or `3x` (prefer `.webp`, fallback `.jpg` / `.png` for UI). Wire via Capacitor web assets or a platform-specific `public/` overlay — do not replace desktop originals by default.
4. **Console port:** import `studio/optimized/console/pot/` into Unity/Godot; read `CONSOLE_ART.md` for padding / sRGB / Switch handheld vs docked / 4K notes.

## Runtime (Phaser)

`BootScene` loads fixed paths under `/game/...`. Optimized packs are **not** auto-wired (avoids breaking Steam/web if files are absent). To prefer higher-res on a platform build, either:

- overlay files into `public/game/` in that build pipeline, or
- add a small path map in BootScene that points at deployed hi-res URLs only when those files are known to exist.

Docs-only is the default safe approach.

## Regeneration

Re-export from current `public/game/` tip with ImageMagick + `cwebp` (Lanczos upscale for mobile; pad-to-POT for console; Steam sizes from `steam/assets/` + `art/baki-head.jpg` for icon). Keep this document updated if folder layout changes.
