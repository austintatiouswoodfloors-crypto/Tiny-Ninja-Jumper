// Physics & gameplay tuning for the horizontal side-scrolling runner.
export const NINJA_W = 40;
export const NINJA_H = 52;
export const NINJA_SCREEN_FACTOR = 0.26; // ninja x = W * this

export const GRAVITY = 2600; // px/s^2
export const JUMP_V = 1080; // jump velocity (px/s)
export const MAX_JUMPS = 2; // double jump

export const RUN_START = 260; // world scroll speed px/s
export const RUN_MAX = 560;
export const RUN_ACCEL = 5;

export const GROUND_FACTOR = 0.78; // ground surface as fraction of H
export const UPPER_OFFSET = 155; // second platform tier height above ground

export const GROW_MS = 6500;
export const INVIS_MS = 6000;
export const STAR_MS = 2800;
export const STARS_PER_LIFE = 3;

export const COIN_R = 13;
export const ENEMY_W = 40;
export const ENEMY_H = 46;
export const POWER_S = 42;

// Persistence keys
export const KEY_BEST = "tn_best_coins"; // high score = best coins in a run
export const KEY_LIVES = "tn_lives"; // saved indefinitely
export const KEY_HAPTICS = "tn_haptics";
