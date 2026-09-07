# Conspiracy Deck (original IP)

This is an **original** combat layer for *THE CULTURE WAR / Bloodlines of the Divide*.

It is inspired by the *structure* of conspiracy card games (alignments, group cards,
specials, and Control / Neutralize / Destroy style actions). It does **not** copy
Steve Jackson Games Illuminati, INWO, or any other SJG card names, art, trademarks,
or verbatim special text.

## Lore mapping (Culture War only)

| Conspiracy alignment | Culture War source |
| --- | --- |
| Order | Right / system order foes |
| Chaos | Left radical foes |
| Media | Cable News Puppet, Echo Chamber, Freeman, etc. |
| Capital | Bloodline / final bosses (vault, oil, thrones) |
| Faith | Faith-First Crusader, cathedral motifs |
| Justice | Justice Activist / progressive left foes |

Group cards are generated 1:1 from existing `EnemyDef` entries (regulars, miniboss, bloodline bosses).
Power / Resistance / Income are derived from atk / def / gold — not from any external card game.

Specials (Bribe, Assassinate, Media Blackout, Market Crash, Double Agent, Pyramid Scheme, …)
mirror *rule roles* (buy control, spike damage, mute media, crash economy, steal buff, summon shade)
using this game’s gold / MP / Influence economy and battle statuses.

## How to play (battle)

1. Enter any encounter (hub → Red/Blue roads, dungeon bosses, etc.).
2. On your turn open **CONSPIRE** (or the Conspire skill line under **SKILLS**).
3. **Attack to Control** — spend Influence; chance to flip the target into a temporary ally shade.
4. **Attack to Neutralize** — stun (skip their next action).
5. **Attack to Destroy** — bonus damage; executes better when the foe is low HP.
6. Play a **Group** card from your hand to **Summon** a scaled-down ally shade (2–3 turns).
7. Play **Special** cards (Bribe costs gold; others may cost MP + Influence).

Defeating a foe unlocks its Group card into your persistent deck (`flags.unlockedGroupCards`).
Influence regenerates +1 each round (capped). Enemy AI may occasionally run a simple counter-plot
(network jam / smear / counter-bribe).

Starter unlocks: Echo Chamber Slime, Faith-First Crusader, Loyal Liberal Mage.

## Files

- `src/game/conspiracyDeck.ts` — definitions, hand/deck helpers
- `src/game/scenes/BattleScene.ts` — CONSPIRE menu + summons + AI plots
- `src/game/state.ts` / `types.ts` / `save.ts` — Influence + unlock persistence (save v2)
- Status screen blurb explains Control / Neutralize / Destroy + summons

## Structure note
Original alignments, group Power/Resistance/Income, specials, and control-style actions.
Do not commit third-party cardlists or rulebooks.
