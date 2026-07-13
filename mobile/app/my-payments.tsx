import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { CreditCard, Check, Receipt } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getMyPlans } from "../lib/api";
import { colors, radius, type as t } from "../constants/theme";
import { ScreenHeader, Card, IconTile, EmptyState, SectionTitle } from "../components/ui";

export default function MyPaymentsScreen() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getMyPlans();
        setPayments(data);
      } catch (e) {
        console.error("Failed to load payments", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const totalSpend = payments.reduce((s, p) => s + (p.amount_lkr || 0), 0);
  const totalCredits = payments.reduce((s, p) => s + (p.credits_purchased || 0), 0);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="My Payments"
        subtitle="Billing"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        {!loading && payments.length > 0 && (
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Total Spend</Text>
              <Text style={styles.summaryValue}>
                Rs. {totalSpend.toLocaleString()}
              </Text>
            </Card>
            <Card style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Credits Bought</Text>
              <Text style={[styles.summaryValue, { color: colors.brand800 }]}>
                {totalCredits.toLocaleString()}
              </Text>
            </Card>
          </View>
        )}

        <SectionTitle title="Purchase History" />

        {loading ? (
          <ActivityIndicator size="large" color={colors.brand700} style={{ marginTop: 40 }} />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<Receipt size={24} color={colors.brand500} />}
            title="No purchases yet"
            message="Credit packages you activate will appear here with their receipts."
          />
        ) : (
          payments.map((p) => (
            <Card key={p.id} style={styles.paymentCard}>
              <View style={styles.cardTop}>
                <View style={styles.planRow}>
                  <IconTile size={40} tone="brand">
                    <CreditCard size={18} color={colors.brand700} />
                  </IconTile>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>{p.plan_name}</Text>
                    <Text style={styles.date}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.amount}>Rs. {p.amount_lkr.toLocaleString()}</Text>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.creditsPill}>
                  <Text style={styles.creditsText}>+{p.credits_purchased} credits</Text>
                </View>

                <View style={styles.statusBadge}>
                  <Check size={11} color={colors.brand700} strokeWidth={3} />
                  <Text style={styles.statusText}>{p.status}</Text>
                </View>
              </View>

              <Text style={styles.refCode}>Ref: {p.payment_ref}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 20, paddingBottom: 40 },

  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  summaryCell: { flex: 1, padding: 16 },
  summaryLabel: { ...t.eyebrow, fontSize: 9, marginBottom: 6 },
  summaryValue: { fontSize: 18, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },

  paymentCard: { marginBottom: 12, padding: 16 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  planRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  planName: { fontSize: 15, fontWeight: "800", color: colors.ink },
  date: { fontSize: 12, color: colors.muted, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  creditsPill: {
    backgroundColor: colors.brand50,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  creditsText: { fontSize: 12, fontWeight: "800", color: colors.brand700 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.brand100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  refCode: {
    fontSize: 10.5,
    color: colors.mutedSoft,
    fontFamily: "monospace",
    marginTop: 12,
  },
});
