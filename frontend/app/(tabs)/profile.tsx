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
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => router.push("/activate-package")}
          activeOpacity={0.88}
        >
          <Card style={styles.creditCard}>
            <IconTile size={46} tone="brand">
              <Zap size={21} color={colors.brand700} />
            </IconTile>
            <View style={{ flex: 1 }}>
              <Text style={styles.creditTitle}>
                {user?.credits ?? 0} credits remaining
              </Text>
              <Text style={styles.creditHint}>
                Each AI analysis costs 20 credits
              </Text>
            </View>
            <Badge label="Top up" tone="brand" />
          </Card>
        </TouchableOpacity>
      </View>

      {/* ── Menu ───────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionTitle title="Account" />

        <Card padded={false} style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < menuItems.length - 1 && styles.menuDivider]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <IconTile size={40} tone={item.tone}>
                <item.icon size={18} color={item.fg} />
              </IconTile>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.label}</Text>
                <Text style={styles.menuHint}>{item.hint}</Text>
              </View>
              <ChevronRight size={18} color={colors.mutedSoft} />
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutItem} activeOpacity={0.8}>
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Cardamo Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingTop: 64,
    paddingBottom: 46,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: "hidden",
  },
  headerInner: { alignItems: "center", paddingHorizontal: 24 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.5,
  },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 7 },
  profileEmail: { fontSize: 12.5, color: colors.brand200, fontWeight: "500" },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  roleText: {
    color: colors.brand200,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  statsRow: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: -26,
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadow.card,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { ...t.metric, fontSize: 24 },
  statLabel: { ...t.eyebrow, fontSize: 9, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: colors.borderSoft, marginVertical: 4 },

  section: { paddingHorizontal: 20, paddingTop: 26 },

  creditCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  creditTitle: { ...t.subtitle, fontSize: 15 },
  creditHint: { ...t.small, fontSize: 11.5, marginTop: 2 },

  menuCard: { paddingHorizontal: 4 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 14,
  },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 14.5, fontWeight: "700", color: colors.ink },
  menuHint: { fontSize: 11.5, color: colors.muted, marginTop: 2 },

  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    marginTop: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger200,
    backgroundColor: colors.danger50,
  },
  logoutText: { color: colors.danger700, fontWeight: "800", fontSize: 14 },

  footer: { alignItems: "center", paddingVertical: 34 },
  footerText: { ...t.eyebrow, color: colors.mutedSoft, letterSpacing: 1.5 },
});
