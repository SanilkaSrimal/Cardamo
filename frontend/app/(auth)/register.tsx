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
