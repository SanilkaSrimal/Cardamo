import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { Mail, Lock, User, UserPlus, ShieldCheck } from "lucide-react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Cardamo Network</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputRow}>
              <User size={20} color="#9ca3af" />
              <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#9ca3af" value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <Mail size={20} color="#9ca3af" />
              <TextInput style={styles.input} placeholder="name@company.com" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Lock size={20} color="#9ca3af" />
              <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>

          <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Create Account</Text>
            <UserPlus size={20} color="white" />
          </TouchableOpacity>

          <View style={styles.center}>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.mutedText}>Already have an account? <Text style={styles.linkText}>Sign In</Text></Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={styles.notice}>
          <ShieldCheck size={20} color="#064e3b" />
          <Text style={styles.noticeText}>By creating an account, you agree to our Terms of Service and Privacy Policy regarding agricultural data usage.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32 },
  headerSection: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "900", color: "#111827", letterSpacing: -1, textTransform: "uppercase" },
  subtitle: { fontSize: 11, fontWeight: "700", color: "#6b7280", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 },
  form: { gap: 20 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: "700", color: "#374151", letterSpacing: 2, textTransform: "uppercase" },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#f9fafb" },
  input: { flex: 1, marginLeft: 12, color: "#111827", fontWeight: "500", fontSize: 14 },
  primaryBtn: { backgroundColor: "#064e3b", paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" },
  center: { alignItems: "center" },
  linkText: { color: "#064e3b", fontWeight: "700", fontSize: 13 },
  mutedText: { color: "#6b7280", fontSize: 13 },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 32, padding: 16, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#d1fae5" },
  noticeText: { flex: 1, fontSize: 12, color: "#064e3b", lineHeight: 18 },
});
