# Mobile optimized exports (iOS → Android)

Scaled from **canonical** `public/game/` originals. Originals are untouched.

| Scale | Folder | Multiplier vs base |
|-------|--------|--------------------|
| @2x | `2x/` | 2× (e.g. title 480×270 → 960×540) |
| @3x | `3x/` | 3× (e.g. title → 1440×810) |

Formats: **WebP** (preferred on modern iOS/Android), **JPEG** (fallback), **PNG** for key UI chrome (`title`, `opening`, `baki-portrait`, `baki-head`, `menu-ui`).

Portraits are boss/gallery keys at 640×960 (@2x) and 960×1440 (@3x).

## Capacitor / runtime

Copy selected files into the web build (e.g. `public/game/`) on a platform branch, or serve from a CDN. Prefer WebP when `document.createElement('canvas').toDataURL('image/webp')` works; otherwise JPEG.
