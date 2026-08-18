import type { CSSProperties } from "react";

export const ACCENT_PALETTE = [
  "#8b5cf6", // violet
  "#6366f1", // indigo
  "#3b82f6", // blue
  "#0ea5e9", // sky
  "#14b8a6", // teal
  "#22c55e", // emerald
  "#f59e0b", // amber
  "#f97316", // orange
  "#f43f5e", // rose
  "#ec4899", // pink
];

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Simple relative-luminance check — picks near-black or near-white text for contrast. */
export function getReadableForeground(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? "#14141a" : "#fafafa";
}

export function gameThemeStyle(accentColor: string): CSSProperties {
  return {
    "--primary": accentColor,
    "--primary-foreground": getReadableForeground(accentColor),
    "--ring": accentColor,
    "--sidebar-primary": accentColor,
    "--sidebar-primary-foreground": getReadableForeground(accentColor),
  } as CSSProperties;
}
