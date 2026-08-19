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
