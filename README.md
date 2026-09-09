[README.md](https://github.com/user-attachments/files/31984890/README.md)
# The Culture War — Baki: Bloodlines of the Divide

A Baki-themed action RPG built with **Phaser 3** and **TanStack Start**
(React + Nitro + Vercel). Fight through 13 dungeon floors, defeat the
Merovingian at the Throne, and reach the ending.

## Run it locally

### Play the bundled build (fastest — no build step, no npm install)

Unzip [`the-culture-war-playable.zip`](#) anywhere, then:

- **Windows:** double-click `start-windows.bat`
- **macOS / Linux:** `./start.sh`
- **Any OS:** `node serve.mjs`

Open **http://localhost:8080**. Requires **Node.js v18+** only.

### Develop / build from source

```bash
npm install
npm run dev        # dev server on http://localhost:8080
```

Build and preview the production bundle:

```bash
npm run build      # builds Vite output + runs db:migrate
npm run preview
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 8080 with app env |
| `npm run build` | Production build + database migration |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Unit + integration tests |
| `npm run db:migrate` | Apply database migrations |

## Controls

- **WASD / Arrow keys** — move
- **Z / Space / Enter** — confirm / attack
- **X / Escape** — cancel / menu
- **Gamepad (PS4 / PS5 / Xbox, USB or Bluetooth)** — supported through the
  browser Gamepad API. Pair with the OS, open the game, then hard refresh
  (Ctrl+Shift+R) so the controller is detected.
- **Touch** — on-screen controls appear automatically on mobile.

## How to play

1. Start a **New Game**.
2. Win the tutorial fights at the **Hub**.
3. Clear dungeon floors **1–13**.
4. Reach the **Throne** door (x=19–20, y=8).
5. Defeat the **Merovingian**.
6. Watch the **Ending**, get **CLEARED**, then free-roam.

## Project structure

```
src/
  routes/          TanStack Start routes (SSR entry, game route at /)
    index.tsx      Home route — mounts the game into #game-root
  game/
    createGame.ts  Phaser game bootstrap (createGame / destroyGame)
    scenes/        Title, Boot, Overworld, Battle scenes
    input.ts       Keyboard + gamepad input
    state.ts       Game state / save system
    database.ts    Save data layer
  components/
    touch-controls.tsx  On-screen mobile controls
public/            Static assets served at /public
server/            Server-side code
migrations/        Database migrations
scripts/           Dev / build helpers (with-app-env, migrate, preview)
.vite / .vercel    Build output (Nitro/Vercel prebuilt server + static)
```

## Tech stack

- **Phaser 3** — game engine
- **TanStack Start + React** — server-rendered app shell & hydration
- **Nitro / Vercel** — deployment (serverless functions)
- **TypeScript** — source language

## Deployment

The repo is configured for Vercel. Push to your GitHub repo and import it in
Vercel, or deploy the prebuilt output:

```bash
npx vercel deploy --prebuilt
```

## Troubleshooting

- **Blank page** — hard refresh (Ctrl+Shift+R), then check the browser console.
- **Port in use** — set `PORT`, e.g. `PORT=3000 node serve.mjs` or
  `PORT=3000 npm run dev`.
- **Gamepad not detected** — pair the controller with the OS, press any
  controller button, then reload the page.
