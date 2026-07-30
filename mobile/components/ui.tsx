import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { colors, radius, shadow, type as t } from "../constants/theme";

/* ────────────────────────────────────────────────────────────────
 * Mesh backdrop
 * expo-linear-gradient is not installed, so depth comes from layered
 * translucent circles over a solid brand base. Reads the same.
 * ──────────────────────────────────────────────────────────────── */

export function MeshBackdrop({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <View style={mesh.base} />
      <View style={[mesh.blob, mesh.blobA]} />
      <View style={[mesh.blob, mesh.blobB]} />
      <View style={[mesh.blob, mesh.blobC]} />
    </View>
  );
}

const mesh = StyleSheet.create({
  base: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.brand950 },
  blob: { position: "absolute", borderRadius: radius.pill },
  blobA: {
    width: 260,
    height: 260,
    top: -110,
    right: -70,
    backgroundColor: colors.brand500,
    opacity: 0.22,
  },
  blobB: {
    width: 210,
    height: 210,
    bottom: -110,
    left: -60,
    backgroundColor: colors.brand600,
    opacity: 0.18,
  },
  blobC: {
    width: 160,
    height: 160,
    top: 40,
    left: 90,
    backgroundColor: colors.brand400,
    opacity: 0.1,
  },
});

/* ────────────────────────────────────────────────────────────────
 * Screen header — rounded brand bar with optional back button
 * ──────────────────────────────────────────────────────────────── */

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <View style={hdr.wrap}>
      <MeshBackdrop />
      <View style={hdr.row}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={hdr.backBtn} activeOpacity={0.7}>
            <ChevronLeft color={colors.white} size={22} />
          </TouchableOpacity>
        )}
        <View style={hdr.titleWrap}>
          {subtitle && <Text style={hdr.subtitle}>{subtitle}</Text>}
          <Text style={hdr.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const hdr = StyleSheet.create({
  wrap: {
    paddingTop: 58,
    paddingBottom: 26,
    paddingHorizontal: 20,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1 },
  subtitle: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  title: {
    color: colors.white,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
});

/* ────────────────────────────────────────────────────────────────
 * Card
 * ──────────────────────────────────────────────────────────────── */

export function Card({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return (
    <View style={[card.base, padded && card.padded, style]}>{children}</View>
  );
}

const card = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadow.soft,
  },
  padded: { padding: 18 },
});

/* ────────────────────────────────────────────────────────────────
 * Icon tile — rounded square behind an icon
 * ──────────────────────────────────────────────────────────────── */

export function IconTile({
  children,
  size = 44,
  tone = "brand",
  style,
}: {
  children: React.ReactNode;
  size?: number;
  tone?: "brand" | "spice" | "neutral" | "danger" | "solid" | "translucent";
  style?: StyleProp<ViewStyle>;
}) {
  const tones: Record<string, ViewStyle> = {
    brand: { backgroundColor: colors.brand50, borderColor: colors.brand100 },
    spice: { backgroundColor: colors.spice50, borderColor: colors.spice100 },
    neutral: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
    danger: { backgroundColor: colors.danger50, borderColor: colors.danger200 },
    solid: { backgroundColor: colors.brand900, borderColor: colors.brand900 },
    translucent: {
      backgroundColor: "rgba(255,255,255,0.12)",
      borderColor: "rgba(255,255,255,0.2)",
    },
  };

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 3.2,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
        },
        tones[tone],
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────
 * Badge / pill
 * ──────────────────────────────────────────────────────────────── */

export function Badge({
  label,
  tone = "brand",
  style,
}: {
  label: string;
  tone?: "brand" | "spice" | "danger" | "warn" | "neutral";
  style?: StyleProp<ViewStyle>;
}) {
  const tones: Record<string, { bg: string; fg: string }> = {
    brand: { bg: colors.brand50, fg: colors.brand700 },
    spice: { bg: colors.spice50, fg: colors.spice600 },
    danger: { bg: colors.danger50, fg: colors.danger700 },
    warn: { bg: colors.warn50, fg: colors.warn800 },
    neutral: { bg: colors.surfaceAlt, fg: colors.inkSoft },
  };
  const c = tones[tone] ?? tones.brand;

  return (
    <View style={[badge.wrap, { backgroundColor: c.bg }, style]}>
      <Text style={[badge.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
});

/* ────────────────────────────────────────────────────────────────
 * Buttons
 * ──────────────────────────────────────────────────────────────── */

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  tone = "brand",
  style,
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  tone?: "brand" | "dark" | "danger" | "light";
  style?: StyleProp<ViewStyle>;
}) {
  const tones: Record<string, { bg: string; fg: string }> = {
    brand: { bg: colors.brand900, fg: colors.white },
    dark: { bg: colors.ink, fg: colors.white },
    danger: { bg: colors.danger, fg: colors.white },
    light: { bg: colors.white, fg: colors.brand900 },
  };
  const c = tones[tone] ?? tones.brand;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        btn.base,
        { backgroundColor: c.bg },
        isDisabled && btn.disabled,
        shadow.soft,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <>
          <Text style={[btn.label, { color: c.fg }]}>{label}</Text>
          {icon}
        </>
      )}
    </TouchableOpacity>
  );
}

export function GhostButton({
  label,
  onPress,
  icon,
  style,
  textStyle,
}: {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[btn.ghost, style]}
    >
      {icon}
      <Text style={[btn.ghostLabel, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const btn = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabled: { opacity: 0.55 },
  label: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  ghost: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ghostLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkSoft,
  },
});

/* ────────────────────────────────────────────────────────────────
 * Section header
 * ──────────────────────────────────────────────────────────────── */

export function SectionTitle({
  title,
  action,
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[sec.row, style]}>
      <Text style={sec.title}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={sec.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const sec = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { ...t.title },
  action: { color: colors.brand700, fontWeight: "700", fontSize: 13 },
});

/* ────────────────────────────────────────────────────────────────
 * Empty state
 * ──────────────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  message,
  style,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[empty.wrap, style]}>
      {icon && (
        <IconTile size={58} tone="brand" style={{ marginBottom: 14 }}>
          {icon}
        </IconTile>
      )}
      <Text style={empty.title}>{title}</Text>
      {message && <Text style={empty.message}>{message}</Text>}
    </View>
  );
}

const empty = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.white,
  },
  title: { ...t.subtitle, textAlign: "center" },
  message: { ...t.small, textAlign: "center", marginTop: 6 },
});

/* ────────────────────────────────────────────────────────────────
 * Progress bar
 * ──────────────────────────────────────────────────────────────── */

export function ProgressBar({
  value,
  tone = colors.brand600,
  track = colors.surfaceAlt,
  height = 7,
}: {
  value: number;
  tone?: string;
  track?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <View
      style={{
        height,
        borderRadius: radius.pill,
        backgroundColor: track,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: radius.pill,
          backgroundColor: tone,
        }}
      />
    </View>
  );
}
