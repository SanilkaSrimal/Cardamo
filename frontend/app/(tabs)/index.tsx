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
