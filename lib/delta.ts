import { formatDecimal } from "@/lib/format";

export type DeltaTone = "good" | "bad" | "neutral";

export interface Delta {
  text: string;
  direction: "up" | "down" | "flat";
  tone: DeltaTone;
}

export type DeltaKind = "percent" | "points";

export function buildDelta(
  current: number,
  previous: number,
  kind: DeltaKind,
  goodWhenUp: boolean
): Delta {
  if (!Number.isFinite(previous) || previous === 0) {
    return { text: "—", direction: "flat", tone: "neutral" };
  }

  const diff = current - previous;
  const direction: Delta["direction"] =
    diff > 0 ? "up" : diff < 0 ? "down" : "flat";

  if (direction === "flat") {
    return {
      text: kind === "percent" ? "0%" : "0.0 pp",
      direction,
      tone: "neutral",
    };
  }

  const sign = direction === "up" ? "+" : "-";
  const text =
    kind === "percent"
      ? `${sign}${formatDecimal(Math.abs((diff / previous) * 100))}%`
      : `${sign}${formatDecimal(Math.abs(diff))} pp`;

  const tone: DeltaTone =
    direction === "up" ? (goodWhenUp ? "good" : "bad") : goodWhenUp ? "bad" : "good";

  return { text, direction, tone };
}
