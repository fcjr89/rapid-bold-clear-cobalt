# Soundtrack — THE CULTURE WAR

**Album:** TWILIGHT ZONE TIME — NA404ERROR (2026)  
Spotify: https://open.spotify.com/album/56ZXDFqkt7RPOAdJx8Tguw  
Source masters: Suno library (na404error) → `public/game/music/` + `studio/music/twilight-zone-time/`

## In-game cues (`src/game/audio.ts`)

| Cue | File | Track |
|-----|------|-------|
| `title` / `overworld` | `shadow-empires.mp3` | SHADOW EMPIRES |
| `intro` | `black-veil.mp3` | BLACK VEIL |
| `dungeon` | `subterranean-syndicate.mp3` | Subterranean Syndicate |
| `boss` | `globalist-guillotine.mp3` | Globalist Guillotine |
| `battle` | `burn-the-matrix.mp3` | BURN THE MATRIX |
| `final` | `killuminati.mp3` | Killuminati |
| `blue` | `mk-veil.mp3` | MK VEIL |
| `red` | `chemtrails-fluoride.mp3` | Chemtrails Fluoride |
| `tavern` | `black-veil.mp3` | BLACK VEIL |

SFX stay procedural. If an MP3 fails to load, procedural themes fall back automatically.

Press **M** on the title screen to mute/unmute (persists via `localStorage` key `tcw-mute`).
