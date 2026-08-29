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
