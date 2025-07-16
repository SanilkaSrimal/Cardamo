import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { Mail, Lock, LogIn } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
          <Text style={styles.title}>CARDAMO</Text>
          <Text style={styles.subtitle}>Quality Assurance AI</Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity onPress={handleLogin} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Sign In</Text>
            <LogIn size={20} color="white" />
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity><Text style={styles.linkText}>Forgot Password?</Text></TouchableOpacity>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.mutedText}>New here? <Text style={styles.linkText}>Register</Text></Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={styles.dividerSection}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Corporate Access</Text>
          <View style={styles.dividerLine} />
        </View>
        <TouchableOpacity style={styles.outlineBtn}>
          <Text style={styles.outlineBtnText}>Continue with SpiceID</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32 },
  header: { alignItems: "center", marginBottom: 40 },
  logo: { width: 80, height: 80, marginBottom: 16, borderRadius: 0 },
  title: { fontSize: 28, fontWeight: "900", color: "#111827", letterSpacing: -1, textTransform: "uppercase" },
  subtitle: { fontSize: 11, fontWeight: "700", color: "#6b7280", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 },
  form: { gap: 20 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: "700", color: "#374151", letterSpacing: 2, textTransform: "uppercase" },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#f9fafb" },
  input: { flex: 1, marginLeft: 12, color: "#111827", fontWeight: "500", fontSize: 14 },
  primaryBtn: { backgroundColor: "#064e3b", paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { color: "#064e3b", fontWeight: "700", fontSize: 13 },
  mutedText: { color: "#6b7280", fontSize: 13 },
  dividerSection: { flexDirection: "row", alignItems: "center", marginVertical: 32, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { color: "#9ca3af", fontSize: 10, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  outlineBtn: { borderWidth: 1, borderColor: "#d1d5db", paddingVertical: 16, alignItems: "center" },
  outlineBtnText: { color: "#374151", fontWeight: "700", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" },
});
