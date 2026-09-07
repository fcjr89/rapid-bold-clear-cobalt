# Steam optimized exports

Derived from **canonical** `public/game/` originals (and existing `steam/assets/` store art). Do not replace `steam/assets/` blindly — review before shipping.

| File | Purpose |
|------|---------|
| `icon_512.png` / `.jpg` | Windows / Steamworks client icon (512×512) from `art/baki-head.jpg` |
| `library_hero.jpg` | Steam library hero (3840×1240), scaled from `steam/assets/library_header.jpg` |
| `capsule_616x353.jpg` | Main capsule store size |
| `capsule_1232x706.jpg` | Hi-DPI capsule |
| `library_header_460x215.jpg` | Library header store size |
| `library_header_web.jpg` | Recompressed full library header |
| `web/` | Web-friendly JPEG/WebP copies of key UI for Electron / store pages |

Canonical store assets remain in `steam/assets/` (capsule, library_header). Copy from here into `steam/assets/` after visual QA.
