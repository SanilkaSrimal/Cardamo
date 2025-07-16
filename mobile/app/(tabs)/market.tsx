import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { predictMarketPrice, getMarketRecommendation } from "../../lib/api";
import { TrendingUp, Calculator, ArrowUpRight, ArrowDownRight, Info, Calendar } from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

const REGIONS = ["Badulla", "Kandy", "Kegalle", "Matale", "Nuwara Eliya", "Ratnapura"];
const GRADES = ["LB", "LG", "LLG1", "LLG2"];

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Market Intelligence</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["price", "profit"] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => { setActiveTab(tab); setResult(null); }} style={[styles.tab, activeTab === tab && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab === "price" ? "Price Forecast" : "Profit Optimizer"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body}>
        {activeTab === "price" ? (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Date</Text>
            <TouchableOpacity 
              onPress={() => setShowPriceDatePicker(true)}
              style={[styles.textInput, { marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            >
              <Text style={{ color: "#111827", fontWeight: "600" }}>{priceForm.date.toISOString().split("T")[0]}</Text>
              <Calendar size={18} color="#064e3b" />
            </TouchableOpacity>

            {showPriceDatePicker && (
              <DateTimePicker
                value={priceForm.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPriceDatePicker(false);
                  if (selectedDate) setPriceForm({ ...priceForm, date: selectedDate });
                }}
              />
            )}
            <Text style={styles.formLabel}>Region</Text>
            <View style={styles.selectorRow}>
              {REGIONS.map(r => (
                <TouchableOpacity key={r} onPress={() => setPriceForm({ ...priceForm, region: r })} style={[styles.chip, priceForm.region === r && styles.chipActive]}>
                  <Text style={[styles.chipText, priceForm.region === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.formLabel, { marginTop: 16 }]}>Grade</Text>
            <View style={styles.selectorRow}>
              {GRADES.map(g => (
                <TouchableOpacity key={g} onPress={() => setPriceForm({ ...priceForm, grade: g })} style={[styles.chip, priceForm.grade === g && styles.chipActive]}>
                  <Text style={[styles.chipText, priceForm.grade === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={handlePricePredict} style={styles.primaryBtn}>
              <TrendingUp size={18} color="white" />
              <Text style={styles.primaryBtnText}>Get Forecast</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Date</Text>
            <TouchableOpacity 
              onPress={() => setShowProfitDatePicker(true)}
              style={[styles.textInput, { marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            >
              <Text style={{ color: "#111827", fontWeight: "600" }}>{profitForm.date.toISOString().split("T")[0]}</Text>
              <Calendar size={18} color="#064e3b" />
            </TouchableOpacity>

            {showProfitDatePicker && (
              <DateTimePicker
                value={profitForm.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowProfitDatePicker(false);
                  if (selectedDate) setProfitForm({ ...profitForm, date: selectedDate });
                }}
              />
            )}
            <Text style={styles.formLabel}>Region</Text>
            <View style={styles.selectorRow}>
              {REGIONS.map(r => (
                <TouchableOpacity key={r} onPress={() => setProfitForm({ ...profitForm, region: r })} style={[styles.chip, profitForm.region === r && styles.chipActive]}>
                  <Text style={[styles.chipText, profitForm.region === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.formLabel, { marginTop: 16 }]}>Grade</Text>
            <View style={styles.selectorRow}>
              {GRADES.map(g => (
                <TouchableOpacity key={g} onPress={() => setProfitForm({ ...profitForm, grade: g })} style={[styles.chip, profitForm.grade === g && styles.chipActive]}>
                  <Text style={[styles.chipText, profitForm.grade === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.fieldGrid}>
              {[
                { label: "Harvest (kg)", key: "harvest_fresh_kg" },
                { label: "Fresh Price (LKR)", key: "current_fresh_price_lkr_per_kg" },
                { label: "Drying Cost (LKR)", key: "drying_cost_total_lkr" },
                { label: "Storage Cost (LKR)", key: "storage_cost_total_lkr" },
                { label: "Quality Loss (%)", key: "quality_loss_pct_est" },
                { label: "Conversion Ratio", key: "conversion_ratio" },
              ].map(({ label, key }) => (
                <View key={key} style={styles.fieldItem}>
                  <Text style={styles.formLabel}>{label}</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={(profitForm as any)[key]}
                    onChangeText={v => setProfitForm({ ...profitForm, [key]: v })}
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={handleProfitOptimize} style={styles.primaryBtn}>
              <Calculator size={18} color="white" />
              <Text style={styles.primaryBtnText}>Optimize Profit</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && <View style={styles.loadingBox}><ActivityIndicator size="large" color="#064e3b" /></View>}

        {result?.type === "price" && (
          <View style={styles.priceResultCard}>
            <Text style={styles.resultLabel}>Forecast Report — {result.grade} / {result.region}</Text>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceCaption}>Current Market</Text>
                <Text style={styles.priceValue}>Rs. {result.current_dried_price_lkr_per_kg?.toLocaleString()}</Text>
              </View>
              <View style={styles.alignEnd}>
                <Text style={styles.forecastCaption}>Forecast (4w)</Text>
                <View style={styles.rowCenter}>
                  <Text style={styles.forecastValue}>Rs. {result.predicted_dried_price_next_4w_lkr_per_kg?.toLocaleString()}</Text>
                  {result.predicted_dried_price_next_4w_lkr_per_kg > result.current_dried_price_lkr_per_kg
                    ? <ArrowUpRight color="#10b981" size={18} />
                    : <ArrowDownRight color="#f87171" size={18} />}
                </View>
              </View>
            </View>
          </View>
        )}

        {result?.type === "profit" && (
          <View style={styles.profitCards}>
            <View style={styles.profitMainCard}>
              <Text style={styles.profitStrategyLabel}>Recommended Strategy</Text>
              <Text style={styles.profitStrategyTitle}>{result.recommendation.label.replace(/_/g, " ")}</Text>
              <Text style={styles.profitMessage}>"{result.recommendation.message}"</Text>
            </View>
            <View style={styles.profitInfoBox}>
              <Info size={16} color="#064e3b" />
              <Text style={styles.profitInfoText}>
                Profit difference predicted: <Text style={styles.profitHighlight}>Rs. {result.profit_calculation.predicted_profit_difference_lkr?.toLocaleString()}</Text>
              </Text>
            </View>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#064e3b", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.5, textTransform: "uppercase" },
  tabs: { flexDirection: "row", backgroundColor: "#064e3b" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#10b981" },
  tabText: { color: "#a7f3d0", fontWeight: "700", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  activeTabText: { color: "#10b981" },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  formSection: { gap: 8 },
  formLabel: { fontSize: 10, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 },
  selectorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "#d1d5db" },
  chipActive: { backgroundColor: "#064e3b", borderColor: "#064e3b" },
  chipText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  chipTextActive: { color: "#fff" },
  fieldGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  fieldItem: { width: "47%", gap: 6 },
  textInput: { borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 12, paddingVertical: 10, color: "#111827", fontWeight: "600", backgroundColor: "#f9fafb" },
  primaryBtn: { backgroundColor: "#064e3b", paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" },
  loadingBox: { paddingVertical: 40, alignItems: "center" },
  priceResultCard: { marginTop: 20, backgroundColor: "#064e3b", padding: 24, borderLeftWidth: 6, borderLeftColor: "#10b981" },
  resultLabel: { color: "#10b981", fontSize: 10, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceCaption: { color: "#a7f3d0", fontSize: 10, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
  priceValue: { color: "#fff", fontSize: 20, fontWeight: "900" },
  alignEnd: { alignItems: "flex-end" },
  forecastCaption: { color: "#10b981", fontSize: 10, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
  forecastValue: { color: "#fff", fontSize: 20, fontWeight: "900" },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  profitCards: { marginTop: 20, gap: 12 },
  profitMainCard: { borderWidth: 2, borderColor: "#064e3b", padding: 24 },
  profitStrategyLabel: { color: "#064e3b", fontSize: 10, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  profitStrategyTitle: { fontSize: 22, fontWeight: "900", color: "#111827", textTransform: "uppercase", marginBottom: 8 },
  profitMessage: { color: "#6b7280", fontStyle: "italic", fontSize: 13, lineHeight: 20 },
  profitInfoBox: { flexDirection: "row", gap: 10, backgroundColor: "#f0fdf4", padding: 14, borderWidth: 1, borderColor: "#d1fae5", alignItems: "flex-start" },
  profitInfoText: { flex: 1, fontSize: 12, color: "#064e3b", lineHeight: 18 },
  profitHighlight: { fontWeight: "900" },
});
