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
