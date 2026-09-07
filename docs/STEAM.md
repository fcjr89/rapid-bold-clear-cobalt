# Steam packaging — THE CULTURE WAR

Steam-first desktop packaging for the Vite/Phaser build. iOS / Android / console packaging comes next (out of scope for this scaffold).

## Scripts (repo root)

| Script | Purpose |
|--------|---------|
| steam:dev | Ensure a production dist exists, then launch the Electron shell |
| steam:build | Vite production build (client assets for the wrapper) |
| steam:package | build + electron-builder to release/steam/ |

## Prerequisites

Install desktop packaging deps once on a packaging machine (electron and electron-builder as devDependencies).

These are intentionally not hard-pinned in lockfile by this scaffold so web/CI installs stay light.

## Env

| Variable | Default | Meaning |
|----------|---------|---------|
| STEAM_APP_ID / STEAMWORKS_APP_ID | 480 (Spacewar test) | Placeholder AppID written to steam_appid.txt — no real Steamworks SDK required |
| STEAM_DIST | auto | Override path to Vite output (dist/client, dist, or .output/public) |
| STEAM_BORDERLESS=1 | off | Frameless / borderless window |
| STEAM_FULLSCREEN=1 | off | Start fullscreen |

## Window / fullscreen / borderless

- F11 or Alt+Enter toggles fullscreen from the desktop shell.
- Borderless: set STEAM_BORDERLESS=1 when launching.
- Renderer can call window.cultureWarSteam.toggleFullscreen() (preload bridge).

## Gamepad

Chromium exposes the Gamepad API. THE CULTURE WAR already maps keyboard + touch injectors in src/game/input.ts. For Deck / controllers:

1. Prefer native Gamepad API polling in a follow-up (navigator.getGamepads() then inject the same key codes the touch layer uses).
2. Steam Input remaps to keyboard by default for many titles — Z/X/Arrows still work with no code change.
3. Big Picture / Deck: enable controller support in Steamworks partner settings when the real AppID is assigned.

## Steamworks placeholder

steam/steamworks-stub.cjs sets STEAM_APP_ID and writes steam_appid.txt beside the executable. It does not load native Steamworks. Replace with steamworks.js / Greenworks when you have a real AppID and redistributables.

## Layout

    steam/
      main.cjs              desktop main — serves dist, opens window
      preload.cjs           contextBridge to cultureWarSteam.*
      serve-dist.cjs        tiny static server for Vite output
      steamworks-stub.cjs   AppID placeholder
      dev.mjs               desktop-dev entry
      package.mjs           desktop-package entry
      electron-builder.yml  desktop artifact config to release/steam/
    docs/STEAM.md           this file

## Dist resolution

The shell looks for index.html in, order:

1. STEAM_DIST
2. dist/client (TanStack Start / Vite client)
3. dist
4. .output/public (Nitro)

## Next platforms

iOS / Android / console packaging is intentionally not scaffolded here — Steam first.
