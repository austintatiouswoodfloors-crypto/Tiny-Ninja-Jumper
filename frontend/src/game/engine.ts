// Horizontal side-scrolling runner simulation.
// World scrolls left as the ninja runs right. Two platform tiers, gaps,
// enemies, coins, and power-ups (grow / star / invisibility) that grant
// temporary invincibility (run through enemies). Coins are the score.
import {
  COIN_R,
  ENEMY_H,
  ENEMY_W,
  GRAVITY,
  GROUND_FACTOR,
  GROW_MS,
  INVIS_MS,
  JUMP_V,
  MAX_JUMPS,
  NINJA_H,
  NINJA_SCREEN_FACTOR,
  NINJA_W,
  POWER_S,
  RUN_ACCEL,
  RUN_MAX,
  RUN_START,
  STAR_MS,
  STARS_PER_LIFE,
  UPPER_OFFSET,
} from "./constants";

export type GameStatus = "playing" | "dead";
export type Pose = "run" | "jump";
export type PowerType = "grow" | "star" | "invis";

export interface Segment {
  x0: number;
  x1: number;
}
export interface Upper {
  id: number;
  x0: number;
  x1: number;
  y: number;
}
export interface Coin {
  id: number;
  wx: number;
  y: number;
}
export interface Enemy {
  id: number;
  wx: number;
  y: number;
  vx: number;
}
export interface PowerUp {
  id: number;
  wx: number;
  y: number;
  type: PowerType;
}
export interface Ninja {
  worldX: number;
  y: number;
  vy: number;
  grounded: boolean;
  jumps: number;
}

export interface GameState {
  W: number;
  H: number;
  groundTopY: number;
  screenX: number;
  ninja: Ninja;
  ground: Segment[];
  platforms: Upper[];
  coins: Coin[];
  enemies: Enemy[];
  powerups: PowerUp[];
  nextX: number;
  runSpeed: number;
  coinsCollected: number;
  stars: number;
  growUntil: number;
  invisUntil: number;
  invUntil: number;
  now: number;
  status: GameStatus;
  nextId: number;
  events: string[];
}

export interface Input {
  jumpQueued: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const chance = (p: number) => Math.random() < p;

export function screenXOf(s: GameState, wx: number): number {
  return s.screenX + (wx - s.ninja.worldX);
}
export function getScore(s: GameState): number {
  return s.coinsCollected;
}
export function getPose(s: GameState): Pose {
  return s.ninja.grounded ? "run" : "jump";
}
export function isInvincible(s: GameState): boolean {
  return s.now < s.invUntil;
}
export function activePower(s: GameState): PowerType | null {
  if (s.now < s.growUntil) return "grow";
  if (s.now < s.invisUntil) return "invis";
  if (s.now < s.invUntil) return "star";
  return null;
}

function pickPower(): PowerType {
  const r = Math.random();
  if (r < 0.5) return "star";
  if (r < 0.75) return "grow";
  return "invis";
}

function generateAhead(s: GameState) {
  const ahead = s.ninja.worldX + s.W * 2.2;
  while (s.nextX < ahead) {
    const diff = s.ninja.worldX;
    const maxJumpGap = Math.min(210, s.runSpeed * 0.78);
    const gap = chance(0.7) ? rand(75, Math.max(95, maxJumpGap)) : 0;
    const platLen = rand(220, 400);
    const x0 = s.nextX + gap;
    const x1 = x0 + platLen;
    s.ground.push({ x0, x1 });

    // Lower-tier coins.
    if (chance(0.65)) {
      const n = Math.floor(rand(3, 6));
      const startX = rand(x0 + 30, Math.max(x0 + 30, x1 - 30 - n * 34));
      for (let i = 0; i < n; i++) {
        s.coins.push({ id: s.nextId++, wx: startX + i * 34, y: s.groundTopY - 30 });
      }
    }

    // Second tier platform (sometimes) with its own coins / enemy.
    if (chance(0.42)) {
      const uw = rand(130, 230);
      const ux0 = rand(x0 + 10, Math.max(x0 + 10, x1 - uw - 10));
      const uy = s.groundTopY - UPPER_OFFSET;
      const up: Upper = { id: s.nextId++, x0: ux0, x1: ux0 + uw, y: uy };
      s.platforms.push(up);
      const n = Math.floor(rand(2, 5));
      const startX = rand(ux0 + 20, Math.max(ux0 + 20, ux0 + uw - 20 - n * 30));
      for (let i = 0; i < n; i++) {
        s.coins.push({ id: s.nextId++, wx: startX + i * 30, y: uy - 30 });
      }
      if (diff > 3000 && chance(0.4)) {
        s.enemies.push({
          id: s.nextId++,
          wx: rand(ux0 + 30, ux0 + uw - 30),
          y: uy - ENEMY_H / 2,
          vx: -rand(15, 45),
        });
      }
    }

    // Ground enemies.
    const enemyChance = Math.min(0.8, 0.3 + diff / 12000);
    if (chance(enemyChance)) {
      const count = diff > 5000 && chance(0.35) ? 2 : 1;
      for (let i = 0; i < count; i++) {
        s.enemies.push({
          id: s.nextId++,
          wx: rand(x0 + 70, x1 - 40) + i * 66,
          y: s.groundTopY - ENEMY_H / 2,
          vx: -rand(20, 55),
        });
      }
    }

    // Periodic power-ups.
    if (chance(0.16)) {
      s.powerups.push({
        id: s.nextId++,
        wx: rand(x0 + 40, x1 - 40),
        y: s.groundTopY - (chance(0.5) ? 95 : UPPER_OFFSET + 30),
        type: pickPower(),
      });
    }

    s.nextX = x1;
  }
}

export function createGame(W: number, H: number): GameState {
  const groundTopY = H * GROUND_FACTOR;
  const s: GameState = {
    W,
    H,
    groundTopY,
    screenX: W * NINJA_SCREEN_FACTOR,
    ninja: {
      worldX: 0,
      y: groundTopY - NINJA_H / 2,
      vy: 0,
      grounded: true,
      jumps: 0,
    },
    ground: [{ x0: -W, x1: W * 1.4 }],
    platforms: [],
    coins: [],
    enemies: [],
    powerups: [],
    nextX: W * 1.4,
    runSpeed: RUN_START,
    coinsCollected: 0,
    stars: 0,
    growUntil: 0,
    invisUntil: 0,
    invUntil: 0,
    now: Date.now(),
    status: "playing",
    nextId: 1,
    events: [],
  };
  generateAhead(s);
  return s;
}

// Bring the run back to life at the current position (spends a life).
export function revive(s: GameState) {
  const n = s.ninja;
  s.ground.push({ x0: n.worldX - 140, x1: n.worldX + 520 });
  n.y = s.groundTopY - NINJA_H / 2;
  n.vy = 0;
  n.grounded = true;
  n.jumps = 0;
  s.enemies = s.enemies.filter((e) => Math.abs(e.wx - n.worldX) > 280);
  s.invUntil = s.now + 2600;
  s.status = "playing";
}

function hasSupportAt(s: GameState, wx: number, feetY: number): boolean {
  const eq = (surf: number) => Math.abs(surf - feetY) < 3;
  for (const u of s.platforms)
    if (wx >= u.x0 && wx <= u.x1 && eq(u.y)) return true;
  for (const g of s.ground)
    if (wx >= g.x0 && wx <= g.x1 && eq(s.groundTopY)) return true;
  return false;
}

function landIfPossible(
  s: GameState,
  feetBefore: number,
  feet: number,
): boolean {
  const wx = s.ninja.worldX;
  let best: number | null = null;
  const consider = (x0: number, x1: number, y: number) => {
    if (wx >= x0 && wx <= x1 && feetBefore <= y + 6 && feet >= y) {
      if (best === null || y < best) best = y;
    }
  };
  for (const u of s.platforms) consider(u.x0, u.x1, u.y);
  for (const g of s.ground) consider(g.x0, g.x1, s.groundTopY);
  if (best !== null) {
    s.ninja.y = best - NINJA_H / 2;
    s.ninja.vy = 0;
    s.ninja.grounded = true;
    s.ninja.jumps = 0;
    return true;
  }
  return false;
}

function aabb(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
}

export function step(s: GameState, dt: number, input: Input) {
  if (s.status !== "playing") return;
  const n = s.ninja;

  s.runSpeed = Math.min(RUN_MAX, RUN_START + (n.worldX / 100) * RUN_ACCEL);
  n.worldX += s.runSpeed * dt;

  // Jump / double jump (edge-triggered).
  if (input.jumpQueued) {
    if (n.grounded) {
      n.vy = -JUMP_V;
      n.grounded = false;
      n.jumps = 1;
      s.events.push("jump");
    } else if (n.jumps < MAX_JUMPS) {
      n.vy = -JUMP_V * 0.92;
      n.jumps += 1;
      s.events.push("jump");
    }
  }
  input.jumpQueued = false;

  // Walked off a ledge?
  if (n.grounded && !hasSupportAt(s, n.worldX, n.y + NINJA_H / 2)) {
    n.grounded = false;
  }

  // Vertical integration.
  if (!n.grounded) {
    const feetBefore = n.y + NINJA_H / 2;
    n.vy += GRAVITY * dt;
    n.y += n.vy * dt;
    const feet = n.y + NINJA_H / 2;
    if (n.vy > 0) landIfPossible(s, feetBefore, feet);
  }

  const invincible = s.now < s.invUntil;
  const grow = s.now < s.growUntil;
  const nx = s.screenX;
  const ny = n.y;
  const nw = grow ? NINJA_W * 1.25 : NINJA_W;
  const nh = grow ? NINJA_H * 1.25 : NINJA_H;

  // Enemies.
  for (let i = s.enemies.length - 1; i >= 0; i--) {
    const e = s.enemies[i];
    e.wx += e.vx * dt;
    const ex = screenXOf(s, e.wx);
    if (ex < -ENEMY_W || e.wx < n.worldX - s.W) {
      s.enemies.splice(i, 1);
      continue;
    }
    if (aabb(nx, ny, nw, nh, ex, e.y, ENEMY_W, ENEMY_H)) {
      if (invincible) {
        s.enemies.splice(i, 1);
        s.events.push("through");
      } else {
        s.status = "dead";
        s.events.push("die");
        return;
      }
    }
  }

  // Coins.
  for (let i = s.coins.length - 1; i >= 0; i--) {
    const c = s.coins[i];
    const cx = screenXOf(s, c.wx);
    if (cx < -COIN_R * 2) {
      s.coins.splice(i, 1);
      continue;
    }
    if (
      Math.abs(nx - cx) < COIN_R + nw * 0.45 &&
      Math.abs(ny - c.y) < COIN_R + nh * 0.45
    ) {
      s.coins.splice(i, 1);
      s.coinsCollected += 1;
      s.events.push("coin");
    }
  }

  // Power-ups.
  for (let i = s.powerups.length - 1; i >= 0; i--) {
    const pu = s.powerups[i];
    const px = screenXOf(s, pu.wx);
    if (px < -POWER_S) {
      s.powerups.splice(i, 1);
      continue;
    }
    if (aabb(nx, ny, nw, nh, px, pu.y, POWER_S, POWER_S)) {
      s.powerups.splice(i, 1);
      if (pu.type === "grow") {
        s.growUntil = s.now + GROW_MS;
        s.invUntil = Math.max(s.invUntil, s.now + GROW_MS);
      } else if (pu.type === "invis") {
        s.invisUntil = s.now + INVIS_MS;
        s.invUntil = Math.max(s.invUntil, s.now + INVIS_MS);
      } else {
        s.invUntil = Math.max(s.invUntil, s.now + STAR_MS);
        s.stars += 1;
        if (s.stars >= STARS_PER_LIFE) {
          s.stars -= STARS_PER_LIFE;
          s.events.push("life");
        }
      }
      s.events.push("power");
    }
  }

  // Cull passed geometry.
  s.ground = s.ground.filter((g) => g.x1 > n.worldX - s.W);
  s.platforms = s.platforms.filter((p) => p.x1 > n.worldX - s.W);

  generateAhead(s);

  // Fell into a pit.
  if (n.y - NINJA_H / 2 > s.H) {
    s.status = "dead";
    s.events.push("die");
  }
}
