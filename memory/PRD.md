# TinyNinja Jumper — PRD

## Original Problem Statement
Build a mobile app "identical to" the uploaded TinyNinja iOS game (.ipa). After clarification, the user wants the **same core structure & principles** (original art/characters/music are fine to differ):
- Horizontal side-scrolling ninja runner.
- Stick-figure/ninja hops as the ground breaks (gaps), enemies appear, coins collectible.
- **Double jump.**
- **Two tiers of platforms** can appear.
- Hitting an enemy OR falling into a pit ends the game.
- Periodic power-ups: **grow big, ninja star, invisibility** — all let you run through enemies without dying.
- **Stars → lives**: 3 stars = 1 life.
- **Lives** let you continue from where you left off (no restart) and are **saved indefinitely**.
- **Coins are the score / high score.**

## Architecture
- **Frontend:** Expo (React Native) + expo-router. No backend (fully on-device).
- **Storage:** `@/src/utils/storage` (AsyncStorage/IndexedDB on web).
- **Rendering:** React Native Views + `react-native-svg` (ninja). Flat modern vector art.
- **Game loop:** `setInterval(1000/60)` timer (chosen over requestAnimationFrame, which froze in the headless web preview). Simulation in `src/game/engine.ts` (pure step function); screen re-renders from a mutable state ref each tick.
- **Feedback:** `expo-haptics` (device only), toggleable in Settings.

## Key Files
- `app/index.tsx` — Home (title, best coins, lives, Play, Settings).
- `app/game.tsx` — Gameplay screen (loop, HUD, controls, pause/game-over/continue).
- `src/game/engine.ts` — simulation (run, jump/double-jump, two tiers, gaps, enemies, coins, power-ups, stars→lives, `revive`).
- `src/game/constants.ts` — physics & tuning & storage keys.
- `src/game/useSettings.ts`, `src/game/haptics.ts`.
- `src/components/entities.tsx` — Ground, Platform (upper tier), Coin, Enemy, PowerUp, Ninja views.
- `src/components/Ninja.tsx` — SVG ninja (run/jump poses).
- `src/components/SettingsSheet.tsx` — haptics toggle + reset progress.

## Persistence Keys
- `tn_best_coins` — high score (best coins in a run).
- `tn_lives` — lives, saved indefinitely.
- `tn_haptics` — haptics on/off.

## Implemented (2026-06)
- [x] Home screen with best score + lives + Play + Settings.
- [x] Horizontal auto-runner with parallax hills, flat-vector ninja.
- [x] Tap-anywhere jump + JUMP button, **double jump**.
- [x] Ground with jumpable gaps; **second-tier floating platforms**.
- [x] Enemies (contact = death unless invincible).
- [x] Coins = score; live HUD with coin score + 3 star pips + lives.
- [x] Power-ups: grow big / ninja star / invisibility → temporary invincibility (run through enemies); grow scales ninja; invis fades ninja.
- [x] Stars → lives (3 stars = +1 life), lives persisted.
- [x] Game Over overlay; **Continue (spend 1 life)** resumes same run via `engine.revive()`.
- [x] Pause / resume / home; Retry (fresh run).
- [x] Settings: haptics toggle, reset progress.
- [x] Verified by testing agent (iteration_3): ~95% pass, no critical bugs.

## Known Notes
- Haptics only fire on real devices (not web/Expo Go web preview).
- Continue-with-life flow verified by gating + code review; end-to-end automation blocked by RNG (needs 3 stars).
- RN Web `shadow*` deprecation warnings (cosmetic).

## Backlog (prioritized)
- P1: Sound effects & background music (jump/coin/power-up + loop).
- P1: More enemy types (flying enemies, spike traps).
- P2: Coin magnet power-up (auto-collect delight).
- P2: Biomes/scenery changes as distance grows.
- P2: Unit test for `engine.revive()`.
