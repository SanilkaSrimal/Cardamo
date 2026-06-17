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
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceSymbol}>Rs.</Text>
                  <Text style={styles.priceAmount}>{plan.price.toLocaleString()}</Text>
                </View>

                <View style={styles.features}>
                  {[
                    `${plan.total_credits.toLocaleString()} credits total`,
                    `Up to ${perAnalysis} AI analyses`,
                    "Credits never expire",
                  ].map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <View style={styles.featureTick}>
                        <Check size={11} color={colors.brand700} strokeWidth={3} />
                      </View>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.activateBtn,
                    !isPopular && styles.activateBtnAlt,
                    (isActivating || activatingId !== null) && styles.btnDisabled,
                  ]}
                  onPress={() => handleActivate(plan.id)}
                  disabled={isActivating || activatingId !== null}
                  activeOpacity={0.88}
                >
                  {isActivating ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Zap size={17} color={colors.white} />
                      <Text style={styles.activateText}>Activate Plan</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 20, paddingTop: 24, paddingBottom: 40 },
  subtitle: { ...t.body, textAlign: "center", marginBottom: 24, paddingHorizontal: 10 },

  card: { padding: 20, marginBottom: 20, marginTop: 8 },
  cardPopular: { borderColor: colors.brand600, borderWidth: 2, ...shadow.card },
  popularBadge: {
    position: "absolute",
    top: -13,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.brand600,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  popularText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  cardHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  planName: { fontSize: 18, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
  planBlurb: { fontSize: 12.5, color: colors.muted, marginTop: 2 },

  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 20 },
  priceSymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.muted,
    marginRight: 5,
  },
  priceAmount: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -1.4,
  },

  features: { marginBottom: 22, gap: 11 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  featureTick: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { fontSize: 14, color: colors.inkSoft, fontWeight: "500" },

  activateBtn: {
    backgroundColor: colors.brand900,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.lg,
    ...shadow.soft,
  },
  activateBtnAlt: { backgroundColor: colors.ink },
  btnDisabled: { opacity: 0.55 },
  activateText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
