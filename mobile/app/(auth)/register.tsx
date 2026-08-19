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
import {
  Mail,
  Lock,
  User,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
} from "lucide-react-native";
import { register } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { colors, radius, shadow } from "../../constants/theme";
import { MeshBackdrop, IconTile } from "../../components/ui";

const perks = ["100 free credits", "5 free analyses", "No card required"];

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await register({ name, email, password });
      await signIn(data.access_token, data.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Registration Failed", e.response?.data?.detail || "An error occurred during registration.");
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Cardamo Network</Text>

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
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputRow}>
                <User size={18} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.mutedSoft}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

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
              onPress={handleRegister}
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                  <UserPlus size={18} color={colors.white} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.center}>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.mutedText}>
                    Already have an account? <Text style={styles.linkText}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>

        <View style={styles.notice}>
          <IconTile size={38} tone="brand">
            <ShieldCheck size={17} color={colors.brand700} />
          </IconTile>
          <Text style={styles.noticeText}>
            By creating an account you agree to our Terms of Service and Privacy Policy
            regarding agricultural data usage.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  header: {
    paddingTop: 68,
    paddingBottom: 46,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: "hidden",
  },
  headerInner: { alignItems: "center", paddingHorizontal: 24 },
  logoTile: {
    width: 66,
    height: 66,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logo: { width: 42, height: 42 },
  title: { fontSize: 24, fontWeight: "800", color: colors.white, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand300,
    letterSpacing: 2,
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

  center: { alignItems: "center" },
  linkText: { color: colors.brand700, fontWeight: "700", fontSize: 13 },
  mutedText: { color: colors.muted, fontSize: 13 },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.brand50,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  noticeText: { flex: 1, fontSize: 12, color: colors.brand900, lineHeight: 18 },
});
