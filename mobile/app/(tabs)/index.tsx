import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ShieldCheck, Microscope, BarChart3, TrendingUp, ArrowRight, User } from "lucide-react-native";

export default function DashboardScreen() {
  const router = useRouter();

  const services = [
    { title: "Pod Disease", icon: ShieldCheck, route: "/pod-disease" },
    { title: "Leaf Analysis", icon: Microscope, route: "/leaf-disease" },
    { title: "Grading", icon: BarChart3, route: "/grading" },
    { title: "Market", icon: TrendingUp, route: "/(tabs)/market" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeLabel}>Welcome back,</Text>
            <Text style={styles.welcomeName}>Cardomon AI</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <User size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Market Insight</Text>
          <Text style={styles.insightText}>Cardamom prices in Kandy are predicted to rise by 4.2% next week.</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Analyses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>98%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>LG</Text>
          <Text style={styles.statLabel}>Avg Grade</Text>
        </View>
      </View>

      {/* Services Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Services</Text>
        <View style={styles.grid}>
          {services.map((service, i) => (
            <TouchableOpacity key={i} onPress={() => router.push(service.route as any)} style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <service.icon size={28} color="#064e3b" />
              </View>
              <Text style={styles.serviceLabel}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={[styles.section, { paddingBottom: 48 }]}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity><Text style={styles.linkText}>View All</Text></TouchableOpacity>
        </View>
        {[1, 2].map(i => (
          <View key={i} style={styles.activityItem}>
            <View style={styles.activityIcon}><ShieldCheck size={20} color="#6b7280" /></View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Pod Analysis</Text>
              <Text style={styles.activityMeta}>2 hours ago • Healthy</Text>
            </View>
            <ArrowRight size={16} color="#9ca3af" />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { backgroundColor: "#064e3b", paddingTop: 56, paddingBottom: 40, paddingHorizontal: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  welcomeLabel: { color: "#a7f3d0", fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  welcomeName: { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: -0.5, textTransform: "uppercase" },
  avatarBtn: { backgroundColor: "rgba(255,255,255,0.15)", padding: 12 },
  insightCard: { backgroundColor: "rgba(255,255,255,0.1)", padding: 16, borderLeftWidth: 4, borderLeftColor: "#10b981" },
  insightLabel: { color: "#10b981", fontSize: 10, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  insightText: { color: "#fff", fontSize: 13, fontWeight: "500", lineHeight: 20 },
  statsBar: { backgroundColor: "#fff", marginHorizontal: 24, marginTop: -20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderWidth: 1, borderColor: "#f3f4f6", elevation: 2 },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, fontWeight: "900", color: "#064e3b" },
  statLabel: { fontSize: 9, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: "#f3f4f6" },
  section: { paddingHorizontal: 24, paddingTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#111827", letterSpacing: -0.5, textTransform: "uppercase", marginBottom: 16 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  linkText: { color: "#064e3b", fontWeight: "700", fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  serviceCard: { width: "48%", backgroundColor: "#fff", padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6", elevation: 1 },
  serviceIcon: { backgroundColor: "#f0fdf4", padding: 16, marginBottom: 12 },
  serviceLabel: { fontSize: 11, fontWeight: "700", color: "#111827", textTransform: "uppercase", letterSpacing: 1, textAlign: "center" },
  activityItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderWidth: 1, borderColor: "#f3f4f6", marginBottom: 10 },
  activityIcon: { backgroundColor: "#f3f4f6", padding: 12, marginRight: 16 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 13, fontWeight: "700", color: "#111827", textTransform: "uppercase", letterSpacing: 0.5 },
  activityMeta: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
});
