import React from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "@/src/theme";
import type { Pose } from "@/src/game/engine";

interface Props {
  size?: number;
  pose?: Pose;
  powered?: boolean; // grow -> emerald body
}

// Flat vector ninja facing RIGHT.
function NinjaBase({ size = 52, pose = "run", powered = false }: Props) {
  const s = size;
  const body = powered ? colors.powerUp : colors.ninjaBody;
  return (
    <Svg width={(s * 60) / 52} height={s} viewBox="0 0 60 52">
      {/* Headband trailing tails at the back (left) */}
      <Path d="M8 18 L-4 13 L-2 22 Z" fill={colors.ninjaBand} />
      <Path d="M8 23 L-3 26 L2 30 Z" fill={colors.ninjaBand} />

      {/* Legs */}
      {pose === "jump" ? (
        <>
          <Rect x={12} y={40} width={9} height={8} rx={4} fill={body} />
          <Rect x={26} y={38} width={9} height={8} rx={4} fill={body} />
        </>
      ) : (
        <>
          <Rect x={11} y={42} width={9} height={9} rx={4} fill={body} />
          <Rect x={27} y={42} width={9} height={9} rx={4} fill={body} />
        </>
      )}

      {/* Body */}
      <Rect x={8} y={8} width={34} height={36} rx={11} fill={body} />
      {/* Headband */}
      <Rect x={7} y={17} width={36} height={9} rx={3} fill={colors.ninjaBand} />
      {/* Eye slit */}
      <Rect x={17} y={19} width={22} height={5} rx={2.5} fill={colors.ninjaEye} />
      <Rect x={31} y={19.5} width={5} height={4} rx={2} fill={body} />
    </Svg>
  );
}

export const Ninja = React.memo(NinjaBase);
