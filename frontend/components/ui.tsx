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
