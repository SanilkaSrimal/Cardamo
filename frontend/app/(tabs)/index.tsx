import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  ShieldCheck,
  Microscope,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Zap,
  Sparkles,
  Sprout,
  ChevronRight,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { getScanHistory, ScanActivity } from "../../lib/history";
import { useAuth } from "../../lib/AuthContext";
import { colors, radius, shadow, type as t } from "../../constants/theme";
import { Card, IconTile, MeshBackdrop, SectionTitle, EmptyState } from "../../components/ui";

const services = [
  {
    title: "Pod Disease",
    blurb: "Borer & thrips",
    icon: ShieldCheck,
    route: "/pod-disease",
    tone: "brand" as const,
    fg: colors.brand700,
  },
  {
    title: "Leaf Analysis",
    blurb: "Blight & spot",
    icon: Microscope,
    route: "/leaf-disease",
    tone: "brand" as const,
    fg: colors.brand700,
  },
  {
    title: "Grading",
    blurb: "Trade standard",
    icon: BarChart3,
    route: "/grading",
    tone: "spice" as const,
    fg: colors.spice600,
  },
  {
    title: "Market",
    blurb: "4-week forecast",
    icon: TrendingUp,
    route: "/(tabs)/market",
    tone: "brand" as const,
    fg: colors.brand700,
  },
];

const activityIconFor = (kind: string) => {
  if (kind === "Grading") return <BarChart3 size={18} color={colors.spice600} />;
  if (kind === "Leaf Analysis") return <Microscope size={18} color={colors.brand700} />;
  return <ShieldCheck size={18} color={colors.brand700} />;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ScanActivity[]>([]);

  useFocusEffect(
    useCallback(() => {
      getScanHistory().then(setActivities);
    }, [])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <MeshBackdrop />

        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={styles.logoTile}>
              <Image source={require("../../logo.png")} style={styles.logo} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.welcomeLabel}>Welcome back</Text>
              <Text style={styles.welcomeName}>
                {user?.name?.split(" ")[0] || "Farmer"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            style={styles.creditsBtn}
            activeOpacity={0.8}
          >
            <Zap size={14} color={colors.brand300} />
            <Text style={styles.creditsValue}>{user?.credits ?? 0}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHead}>
            <Sparkles size={13} color={colors.brand300} />
            <Text style={styles.insightLabel}>Market Insight</Text>
          </View>
          <Text style={styles.insightText}>
            Cardamom prices in Kandy are predicted to rise by 4.2% next week.
          </Text>
          <TouchableOpacity
            style={styles.insightLink}
            onPress={() => router.push("/(tabs)/market")}
            activeOpacity={0.7}
          >
            <Text style={styles.insightLinkText}>Open forecast</Text>
            <ArrowRight size={13} color={colors.brand300} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <View style={styles.statsBar}>
        {[
          { value: String(activities.length), label: "Analyses" },
          { value: "98%", label: "Accuracy" },
          { value: "LG", label: "Avg Grade" },
        ].map((s, i) => (
          <View key={s.label} style={styles.statCell}>
            {i > 0 && <View style={styles.statDivider} />}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Services ───────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionTitle title="AI Services" />
        <View style={styles.grid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.title}
              onPress={() => router.push(service.route as any)}
              style={styles.serviceCard}
              activeOpacity={0.85}
            >
              <IconTile size={46} tone={service.tone}>
                <service.icon size={22} color={service.fg} />
              </IconTile>
              <Text style={styles.serviceLabel}>{service.title}</Text>
              <Text style={styles.serviceBlurb}>{service.blurb}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Harvest shortcut ───────────────────────────────────── */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => router.push("/harvesting")}
          activeOpacity={0.85}
        >
          <Card style={styles.shortcut}>
            <IconTile size={46} tone="brand">
              <Sprout size={22} color={colors.brand700} />
            </IconTile>
            <View style={styles.shortcutText}>
              <Text style={styles.shortcutTitle}>Harvest Records</Text>
              <Text style={styles.shortcutBlurb}>
                Log yields, grades, and prices per batch
              </Text>
            </View>
            <ChevronRight size={18} color={colors.mutedSoft} />
          </Card>
        </TouchableOpacity>
      </View>

      {/* ── Recent activity ────────────────────────────────────── */}
      <View style={[styles.section, { paddingBottom: 44 }]}>
        <SectionTitle title="Recent Activity" />

        {activities.length > 0 ? (
          activities.map((activity) => (
            <Card key={activity.id} style={styles.activityItem} padded={false}>
              <IconTile size={40} tone="neutral">
                {activityIconFor(activity.type)}
              </IconTile>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.type}</Text>
                <Text style={styles.activityMeta} numberOfLines={1}>
                  {new Date(activity.date).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                  {"  ·  "}
                  {activity.resultTitle}
                </Text>
              </View>
              <ArrowRight size={15} color={colors.mutedSoft} />
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<Sparkles size={24} color={colors.brand500} />}
            title="No scans yet"
            message="Run your first analysis from the services above and it will show up here."
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingTop: 58,
    paddingBottom: 44,
    paddingHorizontal: 20,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 28, height: 28 },
  welcomeLabel: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  welcomeName: {
    color: colors.white,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 2,
  },
  creditsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  creditsValue: { color: colors.white, fontSize: 15, fontWeight: "800" },

  insightCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: radius.lg,
    padding: 16,
  },
  insightHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  insightLabel: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  insightText: { color: colors.white, fontSize: 13.5, fontWeight: "500", lineHeight: 20 },
  insightLink: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12 },
  insightLinkText: {
    color: colors.brand300,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  statsBar: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: -24,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadow.card,
  },
  statCell: { flex: 1, flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { ...t.metric, fontSize: 21 },
  statLabel: { ...t.eyebrow, fontSize: 9, marginTop: 3 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.borderSoft },

  section: { paddingHorizontal: 20, paddingTop: 28 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  serviceCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 18,
    gap: 4,
    ...shadow.soft,
  },
  serviceLabel: { ...t.subtitle, fontSize: 14.5, marginTop: 12 },
  serviceBlurb: { ...t.small, fontSize: 11.5 },

  shortcut: { flexDirection: "row", alignItems: "center", gap: 14 },
  shortcutText: { flex: 1 },
  shortcutTitle: { ...t.subtitle, fontSize: 14.5 },
  shortcutBlurb: { ...t.small, fontSize: 11.5, marginTop: 2 },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    marginBottom: 10,
  },
  activityInfo: { flex: 1 },
  activityTitle: { ...t.subtitle, fontSize: 14 },
  activityMeta: { ...t.small, fontSize: 11.5, marginTop: 2 },
});
