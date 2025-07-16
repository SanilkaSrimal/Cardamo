import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

const menuItems = [
  { title: "Personal Information", icon: User },
  { title: "Security & Privacy", icon: Shield },
  { title: "Notifications", icon: Bell },
  { title: "Help & Support", icon: HelpCircle },
  { title: "Settings", icon: Settings },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={48} color="#064e3b" />
          </View>
        </View>
        <Text style={styles.profileName}>User</Text>
        <Text style={styles.profileRole}>Premium Farmer Account</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>LG</Text>
          <Text style={styles.statLabel}>Avg Grade</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Kandy</Text>
          <Text style={styles.statLabel}>Region</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem}>
            <View style={styles.menuIcon}><item.icon size={20} color="#4b5563" /></View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <ChevronRight size={18} color="#d1d5db" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={styles.logoutItem}>
          <LogOut size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Logout Session</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Cardamo Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profileHeader: { backgroundColor: "#f9fafb", paddingTop: 72, paddingBottom: 40, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  avatarContainer: { marginBottom: 16 },
  avatar: { width: 96, height: 96, backgroundColor: "#fff", borderWidth: 3, borderColor: "#064e3b", alignItems: "center", justifyContent: "center" },
  profileName: { fontSize: 24, fontWeight: "900", color: "#111827", letterSpacing: -0.5, textTransform: "uppercase" },
  profileRole: { fontSize: 11, fontWeight: "700", color: "#6b7280", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 },
  editBtn: { marginTop: 16, borderWidth: 1, borderColor: "#064e3b", paddingHorizontal: 24, paddingVertical: 8 },
  editBtnText: { color: "#064e3b", fontWeight: "900", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" },
  statsRow: { flexDirection: "row", paddingVertical: 24, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "900", color: "#064e3b" },
  statLabel: { fontSize: 9, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#f3f4f6" },
  menuSection: { paddingHorizontal: 24, paddingTop: 24 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#f9fafb" },
  menuIcon: { marginRight: 16 },
  menuTitle: { flex: 1, fontSize: 12, fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: 1 },
  logoutItem: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 20, marginTop: 16 },
  logoutText: { color: "#dc2626", fontWeight: "900", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  footer: { alignItems: "center", paddingVertical: 32 },
  footerText: { color: "#d1d5db", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2 },
});
