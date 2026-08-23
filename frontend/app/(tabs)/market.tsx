import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { predictMarketPrice, getMarketRecommendation } from "../../lib/api";
import {
  TrendingUp,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Calendar,
  Coins,
  CalendarRange,
  Warehouse,
} from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, radius, shadow, type as t } from "../../constants/theme";
import { Card, IconTile, MeshBackdrop, EmptyState } from "../../components/ui";

const REGIONS = ["Badulla", "Kandy", "Kegalle", "Matale", "Nuwara Eliya", "Ratnapura"];
const GRADES = ["LB", "LG", "LLG1", "LLG2"];

const formatMoney = (value?: number | null) =>
  typeof value === "number"
    ? value.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "--";

export default function MarketScreen() {
  const [activeTab, setActiveTab] = useState<"price" | "profit">("price");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [priceForm, setPriceForm] = useState({ date: new Date(), region: "Kandy", grade: "LG" });
  const [showPriceDatePicker, setShowPriceDatePicker] = useState(false);
  const [profitForm, setProfitForm] = useState({
    date: new Date(), region: "Kandy", grade: "LG",
    harvest_fresh_kg: "100", current_fresh_price_lkr_per_kg: "1450",
    drying_cost_total_lkr: "18000", storage_cost_total_lkr: "6000",
    quality_loss_pct_est: "2.5", conversion_ratio: "4.0",
  });
  const [showProfitDatePicker, setShowProfitDatePicker] = useState(false);

  // Movement between today's dried price and the 4-week forecast
  const priceDelta = (() => {
    if (result?.type !== "price") return null;
    const current = result.current_dried_price_lkr_per_kg;
    const predicted = result.predicted_dried_price_next_4w_lkr_per_kg;
    if (typeof current !== "number" || typeof predicted !== "number" || current === 0) return null;
    const amount = predicted - current;
    return { up: amount >= 0, amount: Math.abs(amount), pct: Math.abs(amount / current) * 100 };
  })();

  const handlePricePredict = async () => {
    setLoading(true); setResult(null);
    try {
      const data = { ...priceForm, date: priceForm.date.toISOString().split("T")[0] };
      setResult({ type: "price", ...await predictMarketPrice(data) });
    }
    catch { Alert.alert("Error", "Price prediction failed."); }
    finally { setLoading(false); }
  };

  const handleProfitOptimize = async () => {
    setLoading(true); setResult(null);
    try {
      const data = { ...profitForm, date: profitForm.date.toISOString().split("T")[0], harvest_fresh_kg: Number(profitForm.harvest_fresh_kg), current_fresh_price_lkr_per_kg: Number(profitForm.current_fresh_price_lkr_per_kg), drying_cost_total_lkr: Number(profitForm.drying_cost_total_lkr), storage_cost_total_lkr: Number(profitForm.storage_cost_total_lkr), quality_loss_pct_est: Number(profitForm.quality_loss_pct_est), conversion_ratio: Number(profitForm.conversion_ratio) };
      setResult({ type: "profit", ...await getMarketRecommendation(data) });
    } catch { Alert.alert("Error", "Profit optimization failed."); }
    finally { setLoading(false); }
  };

  const renderChips = (
    options: string[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.selectorRow}>
      {options.map((o) => {
        const active = selected === o;
        return (
          <TouchableOpacity
            key={o}
            onPress={() => onSelect(o)}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderDateField = (date: Date, onPress: () => void) => (
    <TouchableOpacity onPress={onPress} style={styles.dateField} activeOpacity={0.8}>
      <Text style={styles.dateText}>{date.toISOString().split("T")[0]}</Text>
      <Calendar size={17} color={colors.brand700} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ── Header + tabs ──────────────────────────────────────── */}
      <View style={styles.header}>
        <MeshBackdrop />
        <View style={styles.headerInner}>
          <Text style={styles.headerEyebrow}>Market Intelligence</Text>
          <Text style={styles.headerTitle}>Forecast &amp; optimize</Text>

          <View style={styles.tabs}>
            {(["price", "profit"] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => { setActiveTab(tab); setResult(null); }}
                  style={[styles.tab, active && styles.activeTab]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.tabText, active && styles.activeTabText]}>
                    {tab === "price" ? "Price Forecast" : "Profit Optimizer"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "price" ? (
          <Card style={styles.formCard}>
            <View style={styles.formHead}>
              <IconTile size={42} tone="brand">
                <TrendingUp size={19} color={colors.brand700} />
              </IconTile>
              <View style={{ flex: 1 }}>
                <Text style={styles.formTitle}>Price Forecasting</Text>
                <Text style={styles.formBlurb}>Dried price, four weeks ahead</Text>
              </View>
            </View>

            <Text style={styles.formLabel}>Date</Text>
            {renderDateField(priceForm.date, () => setShowPriceDatePicker(true))}

            {showPriceDatePicker && (
              <DateTimePicker
                value={priceForm.date}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowPriceDatePicker(false);
                  if (selectedDate && selectedDate >= new Date(new Date().toDateString())) {
                    setPriceForm({ ...priceForm, date: selectedDate });
                  }
                }}
              />
            )}

            <Text style={[styles.formLabel, styles.spacedLabel]}>Region</Text>
            {renderChips(REGIONS, priceForm.region, (r) =>
              setPriceForm({ ...priceForm, region: r })
            )}

            <Text style={[styles.formLabel, styles.spacedLabel]}>Grade</Text>
            {renderChips(GRADES, priceForm.grade, (g) =>
              setPriceForm({ ...priceForm, grade: g })
            )}

            <TouchableOpacity
              onPress={handlePricePredict}
              style={styles.primaryBtn}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <TrendingUp size={17} color={colors.white} />
                  <Text style={styles.primaryBtnText}>Get Forecast</Text>
                </>
              )}
            </TouchableOpacity>
          </Card>
        ) : (
          <Card style={styles.formCard}>
            <View style={styles.formHead}>
              <IconTile size={42} tone="spice">
                <Calculator size={19} color={colors.spice600} />
              </IconTile>
              <View style={{ flex: 1 }}>
                <Text style={styles.formTitle}>Profit Optimizer</Text>
                <Text style={styles.formBlurb}>Sell fresh, or dry and store?</Text>
              </View>
            </View>

            <Text style={styles.formLabel}>Date</Text>
            {renderDateField(profitForm.date, () => setShowProfitDatePicker(true))}

            {showProfitDatePicker && (
              <DateTimePicker
                value={profitForm.date}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowProfitDatePicker(false);
                  if (selectedDate && selectedDate >= new Date(new Date().toDateString())) {
                    setProfitForm({ ...profitForm, date: selectedDate });
                  }
                }}
              />
            )}

            <Text style={[styles.formLabel, styles.spacedLabel]}>Region</Text>
            {renderChips(REGIONS, profitForm.region, (r) =>
              setProfitForm({ ...profitForm, region: r })
            )}

            <Text style={[styles.formLabel, styles.spacedLabel]}>Grade</Text>
            {renderChips(GRADES, profitForm.grade, (g) =>
              setProfitForm({ ...profitForm, grade: g })
            )}

            <View style={styles.fieldGrid}>
              {[
                { label: "Harvest (kg)", key: "harvest_fresh_kg" },
                { label: "Fresh Price (LKR)", key: "current_fresh_price_lkr_per_kg" },
                { label: "Drying Cost (LKR)", key: "drying_cost_total_lkr" },
                { label: "Storage Cost (LKR)", key: "storage_cost_total_lkr" },
              ].map(({ label, key }) => (
                <View key={key} style={styles.fieldItem}>
                  <Text style={styles.formLabel}>{label}</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholderTextColor={colors.mutedSoft}
                    value={(profitForm as any)[key]}
                    onChangeText={v => setProfitForm({ ...profitForm, [key]: v })}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleProfitOptimize}
              style={styles.primaryBtn}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Coins size={17} color={colors.white} />
                  <Text style={styles.primaryBtnText}>Optimize Profit</Text>
                </>
              )}
            </TouchableOpacity>
          </Card>
        )}

        {/* ── Price result ─────────────────────────────────────── */}
        {result?.type === "price" && (
          <View style={styles.resultCard}>
            <MeshBackdrop />
            <View style={styles.resultInner}>
              <View style={styles.resultHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultLabel}>Forecast Result</Text>
                  <Text style={styles.resultTitle}>
                    {result.grade} · {result.region}
                  </Text>
                  <Text style={styles.resultMeta}>
                    Market data as of {result.used_market_date}
                  </Text>
                </View>
                <IconTile size={42} tone="translucent">
                  <TrendingUp size={19} color={colors.brand300} />
                </IconTile>
              </View>

              {/* Headline: the predicted dried price */}
              <View style={styles.headlineBox}>
                <Text style={styles.headlineLabel}>
                  Predicted Dried Price ({result.horizon_weeks ?? 4}W)
                </Text>
                <View style={styles.headlineRow}>
                  <Text style={styles.headlineValue}>
                    Rs. {formatMoney(result.predicted_dried_price_next_4w_lkr_per_kg)}
                  </Text>
                  <Text style={styles.headlineUnit}>per kg</Text>
                </View>

                {priceDelta && (
                  <View
                    style={[
                      styles.deltaPill,
                      { backgroundColor: priceDelta.up ? colors.brand400 : "#f87171" },
                    ]}
                  >
                    {priceDelta.up ? (
                      <ArrowUpRight color={colors.brand950} size={14} />
                    ) : (
                      <ArrowDownRight color="#450a0a" size={14} />
                    )}
                    <Text
                      style={[
                        styles.deltaText,
                        { color: priceDelta.up ? colors.brand950 : "#450a0a" },
                      ]}
                    >
                      {priceDelta.up ? "+" : "-"}Rs. {formatMoney(priceDelta.amount)} (
                      {priceDelta.pct.toFixed(2)}%)
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.currentRow}>
                <Text style={styles.currentLabel}>Current Market Price</Text>
                <Text style={styles.currentValue}>
                  Rs. {formatMoney(result.current_dried_price_lkr_per_kg)}
                  <Text style={styles.currentUnit}> per kg</Text>
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Profit result ────────────────────────────────────── */}
        {result?.type === "profit" && (
          <View style={styles.profitCards}>
            <Card style={styles.profitMainCard}>
              <View style={styles.recBadge}>
                <Text style={styles.recBadgeText}>Recommendation</Text>
              </View>

              <Text style={styles.profitStrategyTitle}>
                {result.recommendation.label.replace(/_/g, " ").toLowerCase()}
              </Text>
              <Text style={styles.profitMessage}>
                {result.recommendation.message}
              </Text>

              {/* The predicted dried price driving this call */}
              <View style={styles.miniForecast}>
                <MeshBackdrop />
                <View style={styles.miniForecastInner}>
                  <Text style={styles.headlineLabel}>
                    Predicted Dried Price (
                    {result.market_prediction?.horizon_weeks ?? 4}W)
                  </Text>
                  <View style={styles.headlineRow}>
                    <Text style={[styles.headlineValue, { fontSize: 27 }]}>
                      Rs.{" "}
                      {formatMoney(
                        result.market_prediction?.predicted_dried_price_next_4w_lkr_per_kg
                      )}
                    </Text>
                    <Text style={styles.headlineUnit}>per kg</Text>
                  </View>
                  <Text style={styles.miniMeta}>
                    Current Rs.{" "}
                    {formatMoney(result.market_prediction?.current_dried_price_lkr_per_kg)}
                    {"  ·  "}
                    {result.market_prediction?.grade} — {result.market_prediction?.region}
                  </Text>
                </View>
              </View>

              <View style={styles.profitSplit}>
                <View style={styles.profitCell}>
                  <Text style={styles.profitCellLabel}>Fresh Revenue</Text>
                  <Text style={styles.profitCellValue}>
                    Rs. {formatMoney(result.profit_calculation.fresh_revenue_lkr)}
                  </Text>
                </View>
                <View style={[styles.profitCell, styles.profitCellAccent]}>
                  <Text style={[styles.profitCellLabel, { color: colors.brand600 }]}>
                    Dried Profit
                  </Text>
                  <Text style={[styles.profitCellValue, { color: colors.brand800 }]}>
                    Rs.{" "}
                    {formatMoney(
                      result.profit_calculation.predicted_dried_net_profit_lkr
                    )}
                  </Text>
                </View>
              </View>
            </Card>

            <View style={styles.profitInfoBox}>
              <IconTile size={38} tone="brand">
                <Info size={17} color={colors.brand700} />
              </IconTile>
              <Text style={styles.profitInfoText}>
                At a {profitForm.conversion_ratio}:1 conversion ratio, drying is predicted to
                yield a profit difference of{" "}
                <Text style={styles.profitHighlight}>
                  Rs.{" "}
                  {formatMoney(
                    result.profit_calculation.predicted_profit_difference_lkr
                  )}
                </Text>
                .
              </Text>
            </View>
          </View>
        )}

        {/* ── Empty state ──────────────────────────────────────── */}
        {!result && !loading && (
          <EmptyState
            style={styles.emptyState}
            icon={
              activeTab === "price" ? (
                <CalendarRange size={24} color={colors.brand500} />
              ) : (
                <Warehouse size={24} color={colors.brand500} />
              )
            }
            title={activeTab === "price" ? "No forecast yet" : "No optimization yet"}
            message={
              activeTab === "price"
                ? "Pick a date, region, and grade to see the projected dried price."
                : "Enter your harvest and cost figures to compare selling fresh against drying."
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingTop: 56,
    paddingBottom: 0,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: "hidden",
  },
  headerInner: { paddingHorizontal: 20 },
  headerEyebrow: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 3,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.pill,
    padding: 4,
    marginTop: 18,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.pill,
  },
  activeTab: { backgroundColor: colors.white },
  tabText: { color: colors.brand200, fontWeight: "700", fontSize: 12 },
  activeTabText: { color: colors.brand900, fontWeight: "800" },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  formCard: { padding: 18 },
  formHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  formTitle: { ...t.title, fontSize: 17 },
  formBlurb: { ...t.small, fontSize: 12, marginTop: 2 },

  formLabel: { ...t.eyebrow, marginBottom: 7 },
  spacedLabel: { marginTop: 18 },

  dateField: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { color: colors.ink, fontWeight: "700", fontSize: 14 },

  selectorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.brand900, borderColor: colors.brand900 },
  chipText: { fontSize: 12.5, fontWeight: "700", color: colors.inkSoft },
  chipTextActive: { color: colors.white },

  fieldGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 20 },
  fieldItem: { width: "47%" },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: colors.ink,
    fontWeight: "700",
    fontSize: 14,
    backgroundColor: colors.white,
  },

  primaryBtn: {
    backgroundColor: colors.brand900,
    borderRadius: radius.lg,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 22,
    ...shadow.soft,
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  /* Price result */
  resultCard: {
    marginTop: 18,
    borderRadius: radius.xxl,
    overflow: "hidden",
    ...shadow.card,
  },
  resultInner: { padding: 20 },
  resultHead: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 18 },
  resultLabel: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  resultTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  resultMeta: { color: colors.brand200, fontSize: 11, marginTop: 5, opacity: 0.8 },

  headlineBox: {
    backgroundColor: "rgba(16,185,129,0.12)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.4)",
    borderRadius: radius.lg,
    padding: 16,
  },
  headlineLabel: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 9,
  },
  headlineRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, flexWrap: "wrap" },
  headlineValue: {
    color: colors.brand300,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  headlineUnit: { color: colors.brand200, fontSize: 12, fontWeight: "600", paddingBottom: 3 },
  deltaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 14,
  },
  deltaText: { fontSize: 12, fontWeight: "800" },

  currentRow: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  currentLabel: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    opacity: 0.8,
    marginBottom: 6,
  },
  currentValue: { color: colors.white, fontSize: 19, fontWeight: "800" },
  currentUnit: { color: colors.brand200, fontSize: 12, fontWeight: "500" },

  /* Profit result */
  profitCards: { marginTop: 18, gap: 12 },
  profitMainCard: { borderWidth: 2, borderColor: colors.brand600, paddingTop: 22 },
  recBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.brand600,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: radius.md,
    borderTopRightRadius: radius.xl - 2,
  },
  recBadgeText: {
    color: colors.white,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  profitStrategyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.6,
    textTransform: "capitalize",
    marginBottom: 8,
  },
  profitMessage: { color: colors.inkSoft, fontStyle: "italic", fontSize: 13, lineHeight: 20 },

  miniForecast: {
    marginTop: 18,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  miniForecastInner: { padding: 16 },
  miniMeta: { color: colors.brand200, fontSize: 11, marginTop: 10, opacity: 0.85 },

  profitSplit: { flexDirection: "row", gap: 10, marginTop: 16 },
  profitCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 14,
  },
  profitCellAccent: { backgroundColor: colors.brand50, borderColor: colors.brand100 },
  profitCellLabel: { ...t.eyebrow, fontSize: 9, marginBottom: 5 },
  profitCellValue: { fontSize: 15, fontWeight: "800", color: colors.ink },

  profitInfoBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.brand50,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.brand100,
    alignItems: "center",
  },
  profitInfoText: { flex: 1, fontSize: 12.5, color: colors.brand900, lineHeight: 19 },
  profitHighlight: { fontWeight: "800" },

  emptyState: { marginTop: 18 },
});
