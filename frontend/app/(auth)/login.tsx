import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Mail, Lock, LogIn, Eye, EyeOff, Check } from "lucide-react-native";
import { login } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { colors, radius, shadow } from "../../constants/theme";
import { MeshBackdrop } from "../../components/ui";

const perks = ["100 free credits", "Works offline-first", "No card required"];

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await login({ email, password });
      await signIn(data.access_token, data.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Login Failed", e.response?.data?.detail || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Brand header ───────────────────────────────────── */}
        <View style={styles.header}>
          <MeshBackdrop />
          <View style={styles.headerInner}>
            <View style={styles.logoTile}>
              <Image source={require("../../logo.png")} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.title}>CARDAMO</Text>
            <Text style={styles.subtitle}>Quality Intelligence</Text>

            <View style={styles.perkRow}>
              {perks.map((p) => (
                <View key={p} style={styles.perk}>
                  <Check size={11} color={colors.brand300} strokeWidth={3} />
                  <Text style={styles.perkText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Form card ──────────────────────────────────────── */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formBlurb}>Sign in to continue your analyses</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputRow}>
                <Mail size={18} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="name@company.com"
                  placeholderTextColor={colors.mutedSoft}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Lock size={18} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedSoft}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((s) => !s)}
                  hitSlop={10}
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.muted} />
                  ) : (
                    <Eye size={18} color={colors.muted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                  <LogIn size={18} color={colors.white} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.row}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Forgot password?</Text>
              </TouchableOpacity>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.mutedText}>
                    New here? <Text style={styles.linkText}>Register</Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View style={styles.dividerSection}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Corporate Access</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.8}>
            <Text style={styles.outlineBtnText}>Continue with SpiceID</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          Protected by industry-standard encryption
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  header: {
    paddingTop: 72,
    paddingBottom: 46,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: "hidden",
  },
  headerInner: { alignItems: "center", paddingHorizontal: 24 },
  logoTile: {
    width: 78,
    height: 78,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logo: { width: 50, height: 50 },
  title: { fontSize: 27, fontWeight: "800", color: colors.white, letterSpacing: 1 },
  subtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand300,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginTop: 5,
  },
  perkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginTop: 20,
  },
  perk: { flexDirection: "row", alignItems: "center", gap: 5 },
  perkText: { color: colors.brand200, fontSize: 11.5, fontWeight: "600" },

  formCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: -26,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 22,
    ...shadow.card,
  },
  formTitle: { fontSize: 21, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  formBlurb: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 22 },

  form: { gap: 18 },
  fieldGroup: { gap: 8 },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: colors.white,
  },
  input: { flex: 1, color: colors.ink, fontWeight: "600", fontSize: 14.5 },

  primaryBtn: {
    backgroundColor: colors.brand900,
    borderRadius: radius.lg,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    ...shadow.soft,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 13.5,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { color: colors.brand700, fontWeight: "700", fontSize: 13 },
  mutedText: { color: colors.muted, fontSize: 13 },

  dividerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    color: colors.mutedSoft,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: "center",
  },
  outlineBtnText: { color: colors.inkSoft, fontWeight: "700", fontSize: 13 },

  legal: {
    textAlign: "center",
    color: colors.mutedSoft,
    fontSize: 11,
    marginTop: 22,
    paddingHorizontal: 24,
  },
});
