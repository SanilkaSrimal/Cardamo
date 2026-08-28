import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Zap, Check, Package, Sparkles } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getPlans, activatePlan } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { colors, radius, shadow, type as t } from "../constants/theme";
import { ScreenHeader, Card, IconTile, EmptyState } from "../components/ui";

export default function ActivatePackageScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (e) {
        Alert.alert("Error", "Failed to load packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleActivate = async (planId: number) => {
    setActivatingId(planId);
    try {
      const res = await activatePlan(planId);
      Alert.alert("Success", res.message || "Package activated successfully.");
      await refreshUser();
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Failed to activate package.");
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Activate Package"
        subtitle="Credits"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Choose a package to top up your AI analysis credits. Each analysis costs 20
          credits.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.brand700} style={{ marginTop: 40 }} />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={<Package size={24} color={colors.brand500} />}
            title="No packages available"
            message="Credit packages will appear here once they are published."
          />
        ) : (
          plans.map((plan) => {
            const perAnalysis = Math.floor(plan.total_credits / 20);
            const isActivating = activatingId === plan.id;
            const isPopular = plan.name === "Professional";

            return (
              <Card
                key={plan.id}
                style={[styles.card, isPopular && styles.cardPopular]}
              >
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Sparkles size={11} color={colors.white} />
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <IconTile size={46} tone={isPopular ? "brand" : "neutral"}>
                    <Package
                      size={21}
                      color={isPopular ? colors.brand700 : colors.inkSoft}
                    />
                  </IconTile>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planBlurb}>
                      {plan.total_credits.toLocaleString()} credits
                    </Text>
