import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { PlusCircle, Edit2, Trash2, Activity, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getMyHarvestingRecords, saveHarvestingRecord, updateHarvestingRecord, deleteHarvestingRecord, getMarketRecommendation } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { colors, radius, shadow, type as t } from "../constants/theme";
import { ScreenHeader, EmptyState } from "../components/ui";

const DEFAULT_FORM = {
  current_fresh_price_lkr_per_kg: "",
  drying_cost_total_lkr: "",
  storage_cost_total_lkr: "",
  quality_loss_pct_est: "2.5",
  conversion_ratio: "4.0",
  harvest_fresh_kg: "",
  notes: "",
};

const REGIONS = ["Badulla", "Kandy", "Kegalle", "Matale", "Nuwara Eliya", "Ratnapura"];
const GRADES = ["LB", "LG", "LLG1", "LLG2"];

export default function HarvestingScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Predict Modal State
  const [predictRecord, setPredictRecord] = useState<any | null>(null);
  const [predictForm, setPredictForm] = useState({ date: "", region: "Kandy", grade: "LG" });
  const [predictLoading, setPredictLoading] = useState(false);
  const [recommendData, setRecommendData] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyHarvestingRecords();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditRecord(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditRecord(record);
    setForm({
      current_fresh_price_lkr_per_kg: String(record.current_fresh_price_lkr_per_kg),
      drying_cost_total_lkr: String(record.drying_cost_total_lkr),
      storage_cost_total_lkr: String(record.storage_cost_total_lkr),
      quality_loss_pct_est: String(record.quality_loss_pct_est),
      conversion_ratio: String(record.conversion_ratio),
      harvest_fresh_kg: record.harvest_fresh_kg ? String(record.harvest_fresh_kg) : "",
      notes: record.notes ?? "",
    });
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this harvesting record?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteHarvestingRecord(id);
            load();
          } catch (e: any) {
            Alert.alert("Error", e.message || "Delete failed");
          }
        }
      }
    ]);
  };

  const handleSave = async () => {
    if (!form.current_fresh_price_lkr_per_kg || !form.drying_cost_total_lkr || !form.storage_cost_total_lkr) {
      Alert.alert("Error", "Please fill required fields (Price, Drying, Storage).");
      return;
    }
    setSaving(true);
    const payload = {
      current_fresh_price_lkr_per_kg: parseFloat(form.current_fresh_price_lkr_per_kg),
      drying_cost_total_lkr: parseFloat(form.drying_cost_total_lkr),
      storage_cost_total_lkr: parseFloat(form.storage_cost_total_lkr),
      quality_loss_pct_est: parseFloat(form.quality_loss_pct_est),
      conversion_ratio: parseFloat(form.conversion_ratio),
      harvest_fresh_kg: form.harvest_fresh_kg ? parseFloat(form.harvest_fresh_kg) : null,
      notes: form.notes || null,
    };

    try {
      if (editRecord) {
        await updateHarvestingRecord(editRecord.id, payload);
      } else {
        await saveHarvestingRecord(payload);
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const openPredict = (record: any) => {
    setPredictRecord(record);
    setRecommendData(null);
    setPredictForm({
      date: new Date().toISOString().split("T")[0],
      region: "Kandy",
      grade: "LG"
    });
  };

  const handlePredictSubmit = async () => {
    if (!predictRecord) return;
    setPredictLoading(true);
    try {
      const payload = {
        date: predictForm.date,
        region: predictForm.region,
        grade: predictForm.grade,
        harvest_fresh_kg: predictRecord.harvest_fresh_kg || 0,
        current_fresh_price_lkr_per_kg: predictRecord.current_fresh_price_lkr_per_kg || 0,
        drying_cost_total_lkr: predictRecord.drying_cost_total_lkr || 0,
        storage_cost_total_lkr: predictRecord.storage_cost_total_lkr || 0,
        quality_loss_pct_est: predictRecord.quality_loss_pct_est || 2.5,
        conversion_ratio: predictRecord.conversion_ratio || 4.0,
      };
      const data = await getMarketRecommendation(payload);
      setRecommendData(data);
      refreshUser();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to get prediction.");
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Harvesting Records"
        subtitle="Field Log"
        onBack={() => router.back()}
        right={
          <TouchableOpacity onPress={openAdd} style={styles.addBtn} activeOpacity={0.8}>
            <PlusCircle size={20} color={colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.brand700} style={{ marginTop: 40 }} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={<PlusCircle size={24} color={colors.brand500} />}
            title="No records yet"
            message="Add your first harvesting entry to track yields, costs, and profit."
          />
        ) : (
          records.map((r) => (
            <View key={r.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>{new Date(r.created_at).toLocaleDateString()}</Text>
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openPredict(r)}>
                    <Activity size={18} color={colors.brand600} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(r)}>
                    <Edit2 size={18} color={colors.inkSoft} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(r.id)}>
                    <Trash2 size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Fresh Price (LKR)</Text>
                  <Text style={styles.gridValue}>{r.current_fresh_price_lkr_per_kg}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Harvest (kg)</Text>
                  <Text style={styles.gridValue}>{r.harvest_fresh_kg || "—"}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Drying Cost (LKR)</Text>
                  <Text style={styles.gridValue}>{r.drying_cost_total_lkr}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Storage Cost (LKR)</Text>
                  <Text style={styles.gridValue}>{r.storage_cost_total_lkr}</Text>
                </View>
              </View>
              
              {r.notes && (
                <Text style={styles.notesText}>Notes: {r.notes}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Form Modal */}
      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editRecord ? "Edit Record" : "Add Harvesting Record"}</Text>
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.inputLabel}>Fresh Price (LKR/kg) *</Text>
            <TextInput style={styles.input} value={form.current_fresh_price_lkr_per_kg} onChangeText={(t) => setForm({...form, current_fresh_price_lkr_per_kg: t})} keyboardType="numeric" placeholder="e.g. 2500" />
            
            <Text style={styles.inputLabel}>Harvest (kg)</Text>
            <TextInput style={styles.input} value={form.harvest_fresh_kg} onChangeText={(t) => setForm({...form, harvest_fresh_kg: t})} keyboardType="numeric" placeholder="e.g. 100" />
            
            <Text style={styles.inputLabel}>Drying Cost (LKR) *</Text>
            <TextInput style={styles.input} value={form.drying_cost_total_lkr} onChangeText={(t) => setForm({...form, drying_cost_total_lkr: t})} keyboardType="numeric" placeholder="e.g. 15000" />
            
            <Text style={styles.inputLabel}>Storage Cost (LKR) *</Text>
            <TextInput style={styles.input} value={form.storage_cost_total_lkr} onChangeText={(t) => setForm({...form, storage_cost_total_lkr: t})} keyboardType="numeric" placeholder="e.g. 5000" />
            
            <Text style={styles.inputLabel}>Quality Loss (%)</Text>
            <TextInput style={styles.input} value={form.quality_loss_pct_est} onChangeText={(t) => setForm({...form, quality_loss_pct_est: t})} keyboardType="numeric" />
            
            <Text style={styles.inputLabel}>Conversion Ratio</Text>
            <TextInput style={styles.input} value={form.conversion_ratio} onChangeText={(t) => setForm({...form, conversion_ratio: t})} keyboardType="numeric" />
            
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: "top" }]} value={form.notes} onChangeText={(t) => setForm({...form, notes: t})} multiline />
            
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>SAVE RECORD</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Predict Modal */}
      <Modal visible={predictRecord !== null} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profit Optimizer</Text>
            <TouchableOpacity onPress={() => setPredictRecord(null)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={predictForm.date} onChangeText={(t) => setPredictForm({...predictForm, date: t})} placeholder="YYYY-MM-DD" />
            
            <Text style={styles.inputLabel}>Region</Text>
            <View style={styles.chipsContainer}>
              {REGIONS.map(r => (
                <TouchableOpacity key={r} style={[styles.chip, predictForm.region === r && styles.chipActive]} onPress={() => setPredictForm({...predictForm, region: r})}>
                  <Text style={[styles.chipText, predictForm.region === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Grade</Text>
            <View style={styles.chipsContainer}>
              {GRADES.map(g => (
                <TouchableOpacity key={g} style={[styles.chip, predictForm.grade === g && styles.chipActive]} onPress={() => setPredictForm({...predictForm, grade: g})}>
                  <Text style={[styles.chipText, predictForm.grade === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.saveBtn, { marginTop: 20 }]} onPress={handlePredictSubmit} disabled={predictLoading}>
              {predictLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>GET PREDICTION</Text>}
            </TouchableOpacity>

            {recommendData && (
              <View style={styles.recommendationCard}>
                <Text style={styles.recBadge}>RECOMMENDATION</Text>
                <Text style={styles.recTitle}>{recommendData.recommendation.label.replace(/_/g, " ")}</Text>
                <Text style={styles.recMessage}>"{recommendData.recommendation.message}"</Text>
                <View style={styles.recGrid}>
                  <View style={styles.recItem}>
                    <Text style={styles.recLabel}>Fresh Revenue</Text>
                    <Text style={styles.recVal}>Rs. {recommendData.profit_calculation.fresh_revenue_lkr?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.recItem}>
                    <Text style={styles.recLabelAccent}>Predicted Profit</Text>
                    <Text style={styles.recValAccent}>Rs. {recommendData.profit_calculation.predicted_dried_net_profit_lkr?.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 20, paddingBottom: 40 },

  recordCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 14,
    ...shadow.soft,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  recordDate: { fontSize: 14.5, fontWeight: "800", color: colors.ink },
  actionBtns: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: { width: "50%", marginBottom: 14 },
  gridLabel: { ...t.eyebrow, fontSize: 9, marginBottom: 3 },
  gridValue: { fontSize: 15, fontWeight: "800", color: colors.ink },
  notesText: {
    fontSize: 12.5,
    color: colors.muted,
    fontStyle: "italic",
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    lineHeight: 18,
  },

  modalContainer: { flex: 1, backgroundColor: colors.surface },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
  modalContent: { padding: 20, paddingBottom: 60 },
  inputLabel: { ...t.eyebrow, marginBottom: 8, marginTop: 18 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    fontWeight: "600",
    color: colors.ink,
    backgroundColor: colors.white,
  },
  saveBtn: {
    backgroundColor: colors.brand900,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",
    marginTop: 30,
    ...shadow.soft,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.brand900, borderColor: colors.brand900 },
  chipText: { fontSize: 12.5, fontWeight: "700", color: colors.inkSoft },
  chipTextActive: { color: colors.white, fontWeight: "700" },

  recommendationCard: {
    marginTop: 34,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brand600,
    borderRadius: radius.xl,
    padding: 20,
    ...shadow.card,
  },
  recBadge: {
    position: "absolute",
    top: -13,
    right: 16,
    backgroundColor: colors.brand600,
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    letterSpacing: 0.8,
    overflow: "hidden",
  },
  recTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.5,
    textTransform: "capitalize",
    marginBottom: 8,
  },
  recMessage: { fontSize: 13, color: colors.inkSoft, fontStyle: "italic", marginBottom: 18, lineHeight: 20 },
  recGrid: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  recItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 13,
  },
  recLabel: { ...t.eyebrow, fontSize: 9, marginBottom: 5 },
  recVal: { fontSize: 15, fontWeight: "800", color: colors.ink },
  recLabelAccent: { ...t.eyebrow, fontSize: 9, color: colors.brand600, marginBottom: 5 },
  recValAccent: { fontSize: 15, fontWeight: "800", color: colors.brand800 },
});
