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
