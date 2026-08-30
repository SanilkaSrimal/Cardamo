import { Platform, TextStyle, ViewStyle } from "react-native";

/**
 * Single source of truth for the app's visual language.
 *
 * The screens were each hand-rolling hex codes and squared-off surfaces, so
 * nothing looked related. Everything now pulls from here.
 */

export const colors = {
  // Brand green
  brand50: "#ecfdf5",
  brand100: "#d1fae5",
  brand200: "#a7f3d0",
  brand300: "#6ee7b7",
  brand400: "#34d399",
  brand500: "#10b981",
  brand600: "#059669",
  brand700: "#047857",
  brand800: "#065f46",
  brand900: "#064e3b",
  brand950: "#022c22",

  // Warm counterpoint for grading / premium accents
  spice50: "#fffbeb",
  spice100: "#fef3c7",
  spice300: "#fcd34d",
  spice400: "#fbbf24",
  spice500: "#f59e0b",
  spice600: "#d97706",

  // Neutrals
  white: "#ffffff",
  surface: "#f8fafb",
  surfaceAlt: "#f3f4f6",
  border: "#e5e7eb",
  borderSoft: "#f1f5f4",
  ink: "#0f172a",
  inkSoft: "#475569",
  muted: "#94a3b8",
  mutedSoft: "#cbd5e1",

  // Status
  danger: "#dc2626",
  danger50: "#fef2f2",
  danger100: "#fee2e2",
  danger200: "#fecaca",
  danger700: "#b91c1c",
  warn: "#f59e0b",
  warn50: "#fffbeb",
  warn200: "#fde68a",
  warn700: "#b45309",
  warn800: "#92400e",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Soft, green-tinted elevation — never harsh black drop shadows. */
export const shadow = {
  none: {} as ViewStyle,
  soft: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.brand950,
      shadowOpacity: 0.07,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    // Expo Web ignores elevation and needs a real CSS shadow
    web: { boxShadow: "0 1px 2px rgba(2,44,34,0.04), 0 4px 16px rgba(2,44,34,0.06)" } as ViewStyle,
    default: {},
  })!,
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.brand950,
      shadowOpacity: 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 4 },
    web: { boxShadow: "0 2px 4px rgba(2,44,34,0.05), 0 12px 32px -8px rgba(2,44,34,0.12)" } as ViewStyle,
    default: {},
  })!,
  lift: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.brand950,
      shadowOpacity: 0.16,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 8 },
    web: { boxShadow: "0 4px 8px rgba(2,44,34,0.07), 0 24px 48px -12px rgba(2,44,34,0.2)" } as ViewStyle,
    default: {},
  })!,
};

/** Shared type ramp so headings and labels stay consistent screen to screen. */
export const type = {
  display: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.6,
  } as TextStyle,
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.3,
  } as TextStyle,
  subtitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  } as TextStyle,
  body: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.inkSoft,
    lineHeight: 21,
  } as TextStyle,
  small: {
    fontSize: 12.5,
    fontWeight: "500",
    color: colors.muted,
    lineHeight: 18,
  } as TextStyle,
  /** Tiny all-caps eyebrow used above values and section headers. */
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.muted,
  } as TextStyle,
  metric: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.brand900,
    letterSpacing: -0.8,
  } as TextStyle,
};

/** Base card surface reused by every screen. */
export const cardSurface: ViewStyle = {
  backgroundColor: colors.white,
  borderRadius: radius.xl,
  borderWidth: 1,
  borderColor: colors.borderSoft,
  ...shadow.soft,
};
