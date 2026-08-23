import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import {
  User,
  LogOut,
  ChevronRight,
  Zap,
  CreditCard,
  Sprout,
  ShieldCheck,
  Mail,
} from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import { getMyHarvestingRecords } from "../../lib/api";
import { colors, radius, shadow, type as t } from "../../constants/theme";
import { Card, IconTile, Badge, MeshBackdrop, SectionTitle } from "../../components/ui";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, refreshUser } = useAuth();
  const [scanCount, setScanCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        refreshUser();
      }
    }, [])
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const records = await getMyHarvestingRecords();
        setScanCount(records.length);
      } catch (e) {
        console.error("Failed to fetch profile data", e);
        setScanCount(0);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const initials = (user?.name || "Guest")
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const menuItems = [
    {
      label: "Activate Package",
      hint: "Top up your credit balance",
      icon: Zap,
      tone: "brand" as const,
      fg: colors.brand700,
      route: "/activate-package",
    },
    {
      label: "My Payments",
      hint: "Receipts and transaction history",
      icon: CreditCard,
      tone: "neutral" as const,
      fg: colors.inkSoft,
      route: "/my-payments",
    },
    {
      label: "Harvesting Records",
      hint: "Yields, grades, and prices per batch",
      icon: Sprout,
      tone: "spice" as const,
      fg: colors.spice600,
      route: "/harvesting",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <MeshBackdrop />
        <View style={styles.headerInner}>
          <View style={styles.avatar}>
            {initials ? (
              <Text style={styles.avatarText}>{initials}</Text>
            ) : (
              <User size={34} color={colors.white} />
            )}
          </View>

          <Text style={styles.profileName}>{user?.name || "Guest"}</Text>

          {user?.email && (
            <View style={styles.emailRow}>
              <Mail size={12} color={colors.brand200} />
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          )}

          <View style={styles.rolePill}>
            <ShieldCheck size={12} color={colors.brand300} />
            <Text style={styles.roleText}>
              {user?.role === "admin" ? "Admin Account" : "Farmer Account"}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{scanCount !== null ? scanCount : "—"}</Text>
          <Text style={styles.statLabel}>Total Records</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.credits ?? 0}</Text>
          <Text style={styles.statLabel}>Credits Available</Text>
        </View>
      </View>

      {/* ── Credits callout ────────────────────────────────────── */}
