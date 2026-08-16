import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";
import {
  COIN_R,
  ENEMY_H,
  ENEMY_W,
  NINJA_H,
  NINJA_W,
  POWER_S,
} from "@/src/game/constants";
import type { Pose, PowerType } from "@/src/game/engine";
import { Ninja } from "./Ninja";

const PLATFORM_H = 20;

export const GroundView = React.memo(function GroundView({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        pointerEvents: "none",
      }}
    >
      <View style={styles.groundTop} />
      <View style={styles.groundBody} />
    </View>
  );
});

// Second-tier floating platform (pill).
export const PlatformView = React.memo(function PlatformView({
  x,
  y,
  w,
}: {
  x: number;
  y: number;
  w: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: PLATFORM_H,
        borderRadius: PLATFORM_H / 2,
        backgroundColor: colors.platform,
        pointerEvents: "none",
      }}
    >
      <View style={styles.platformTop} />
    </View>
  );
});

export const CoinView = React.memo(function CoinView({
  x,
  y,
}: {
  x: number;
  y: number;
}) {
  return (
    <View style={[styles.coin, { left: x - COIN_R, top: y - COIN_R }]}>
      <View style={styles.coinInner} />
    </View>
  );
});

export const EnemyView = React.memo(function EnemyView({
  x,
  y,
}: {
  x: number;
  y: number;
}) {
  return (
    <View style={[styles.enemy, { left: x - ENEMY_W / 2, top: y - ENEMY_H / 2 }]}>
      <View style={styles.enemyInner} />
      <View style={styles.enemyEyes}>
        <View style={styles.enemyEye} />
        <View style={styles.enemyEye} />
      </View>
    </View>
  );
});

const POWER_STYLE: Record<
  PowerType,
  { bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  grow: { bg: colors.powerUp, icon: "expand" },
  star: { bg: colors.warning, icon: "star" },
  invis: { bg: colors.info, icon: "eye-off" },
};

export const PowerUpView = React.memo(function PowerUpView({
  x,
  y,
  type,
}: {
  x: number;
  y: number;
  type: PowerType;
}) {
  const cfg = POWER_STYLE[type];
  return (
    <View
      style={[
        styles.power,
        { left: x - POWER_S / 2, top: y - POWER_S / 2, backgroundColor: cfg.bg },
      ]}
    >
      <Ionicons name={cfg.icon} size={22} color="#FFFFFF" />
    </View>
  );
});

export const NinjaView = React.memo(function NinjaView({
  x,
  y,
  pose,
  powered,
  invisible,
}: {
  x: number;
  y: number;
  pose: Pose;
  powered: boolean;
  invisible: boolean;
}) {
  const scale = powered ? 1.25 : 1;
  const w = NINJA_W * scale;
  const h = NINJA_H * scale;
  return (
    <>
      <View
        style={{
          position: "absolute",
          left: x - w * 0.4,
          top: y + h / 2 - 4,
          width: w * 0.8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(26,35,31,0.18)",
          pointerEvents: "none",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: x - (w * 60) / 52 / 2,
          top: y - h / 2,
          opacity: invisible ? 0.4 : 1,
          pointerEvents: "none",
        }}
      >
        <Ninja size={h} pose={pose} powered={powered} />
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  groundTop: {
    height: 8,
    backgroundColor: colors.brand,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  groundBody: { flex: 1, backgroundColor: colors.platform },
  platformTop: {
    height: 6,
    backgroundColor: colors.brand,
    borderTopLeftRadius: PLATFORM_H / 2,
    borderTopRightRadius: PLATFORM_H / 2,
  },
  coin: {
    position: "absolute",
    width: COIN_R * 2,
    height: COIN_R * 2,
    borderRadius: COIN_R,
    backgroundColor: colors.coin,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  coinInner: {
    width: COIN_R,
    height: COIN_R,
    borderRadius: COIN_R / 2,
    backgroundColor: colors.coinInner,
  },
  enemy: {
    position: "absolute",
    width: ENEMY_W,
    height: ENEMY_H,
    borderRadius: 12,
    backgroundColor: colors.enemy,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  enemyInner: {
    position: "absolute",
    width: ENEMY_W * 0.5,
    height: ENEMY_W * 0.5,
    borderRadius: 8,
    backgroundColor: colors.enemyInner,
  },
  enemyEyes: { flexDirection: "row", gap: 6, marginTop: -6 },
  enemyEye: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  power: {
    position: "absolute",
    width: POWER_S,
    height: POWER_S,
    borderRadius: POWER_S / 2,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
});
