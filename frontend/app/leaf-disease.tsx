import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { predictLeafDisease, saveHarvestingRecord } from "../lib/api";
import {
  Camera,
  CheckCircle2,
  Bug,
  ImageIcon,
  Save,
  Info,
  AlertTriangle,
  Droplets,
  Wind,
  Sun,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/AuthContext";
import { saveScanActivity } from "../lib/history";
import { colors, radius, shadow, type as t } from "../constants/theme";
import {
  ScreenHeader,
  Card,
  IconTile,
  PrimaryButton,
  ProgressBar,
} from "../components/ui";

const tips = [
  { icon: Wind, title: "Open canopy", desc: "Air movement cuts blight" },
  { icon: Droplets, title: "Fix drainage", desc: "Standing water spreads it" },
  { icon: Sun, title: "Spray early", desc: "Neem every 15-20 days" },
];

const riskTone = (level?: string) => {
  if (level === "High") return colors.danger;
  if (level === "Medium") return colors.spice500;
  if (level === "Low") return colors.brand500;
  return colors.muted;
};

export default function LeafDiseaseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isInvalidLeaf = result?.predicted_class === "not_a_cardamom_leaf";
  const isHealthy = result?.predicted_class === "healthy";

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveHarvestingRecord({
        crop_type: "Cardamom",
        weight_kg: 0,
        grade: "N/A",
        price_per_kg: 0,
        notes: `Leaf Analysis: ${result.predicted_class}`
      });
      Alert.alert("Success", "Record saved to your profile.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save record.");
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    let res: ImagePicker.ImagePickerResult;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;
      res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    } else {
      res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    }
    if (!res.canceled) {
      const uri = res.assets[0].uri;
      setImage(uri); setResult(null);
      setLoading(true);
      try {
        const data = await predictLeafDisease(uri);
        setResult(data.result);
        await saveScanActivity({
          type: "Leaf Analysis",
          resultTitle: data.result.predicted_class.replace(/_/g, " ")
        });
      }
      catch { Alert.alert("Error", "Leaf analysis failed."); }
      finally { setLoading(false); }
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Leaf Analysis"
        subtitle="AI Diagnostics"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {!image ? (
          <View style={styles.pickSection}>
            <Card style={styles.infoBox}>
              <IconTile size={40} tone="brand">
                <Info size={19} color={colors.brand700} />
              </IconTile>
              <Text style={styles.infoText}>
                Photograph the lesion, not the whole plant. Leaves from other crops are
                rejected before diagnosis.
              </Text>
            </Card>

            <TouchableOpacity
              onPress={() => pickImage(true)}
              style={styles.primaryPickBtn}
              activeOpacity={0.9}
            >
              <View style={styles.pickIconCircle}>
                <Camera size={30} color={colors.white} />
              </View>
              <Text style={styles.primaryPickLabel}>Scan Foliage</Text>
              <Text style={styles.primaryPickHint}>Point at the affected leaf</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickImage(false)}
              style={styles.secondaryPickBtn}
              activeOpacity={0.8}
            >
              <ImageIcon size={22} color={colors.muted} />
              <Text style={styles.secondaryPickLabel}>Upload from Gallery</Text>
            </TouchableOpacity>

            <View style={styles.tipRow}>
              {tips.map((tip) => (
                <View key={tip.title} style={styles.tipCard}>
                  <tip.icon size={16} color={colors.brand600} />
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDesc}>{tip.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultSection}>
            <View style={styles.imageFrame}>
              <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                onPress={() => { setImage(null); setResult(null); }}
                style={styles.retakeBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>

              {loading && (
                <View style={styles.imageOverlay}>
                  <ActivityIndicator size="large" color={colors.brand300} />
                  <Text style={styles.overlayText}>Scanning</Text>
                </View>
              )}
            </View>

            {result && (
              <View style={styles.cards}>
                {/* Diagnosis */}
                <Card
                  style={[
                    styles.statusCard,
                    isInvalidLeaf
                      ? styles.warnCard
                      : isHealthy
                        ? styles.successCard
                        : styles.dangerCard,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cardSubLabel,
                        isInvalidLeaf && { color: colors.warn700 },
                      ]}
                    >
                      {isInvalidLeaf ? "Invalid Image" : "Diagnosis"}
                    </Text>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isInvalidLeaf
                            ? colors.warn800
                            : isHealthy
                              ? colors.brand700
                              : colors.danger700,
                        },
                      ]}
                    >
                      {isInvalidLeaf
                        ? "Not a Cardamom Leaf"
                        : result.predicted_class.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <IconTile
                    size={52}
                    tone={isInvalidLeaf ? "neutral" : isHealthy ? "brand" : "danger"}
                    style={
                      isInvalidLeaf
                        ? { backgroundColor: colors.warn50, borderColor: colors.warn200 }
                        : undefined
                    }
                  >
                    {isInvalidLeaf ? (
                      <AlertTriangle size={24} color={colors.warn} />
                    ) : isHealthy ? (
                      <CheckCircle2 size={24} color={colors.brand600} />
                    ) : (
                      <Bug size={24} color={colors.danger} />
                    )}
                  </IconTile>
                </Card>

                {isInvalidLeaf && (result.message || result.recommendation?.farmer_action) && (
                  <Card>
                    <Text style={styles.cardSubLabel}>What happened</Text>
                    <Text style={styles.bodyText}>
                      {result.message || result.recommendation?.farmer_action}
                    </Text>
                  </Card>
                )}

                {/* Probability breakdown */}
                {!isInvalidLeaf && (
                  <Card>
                    <Text style={[styles.cardSubLabel, { marginBottom: 14 }]}>
                      Confidence Breakdown
                    </Text>
                    {Object.entries(result.probabilities || {}).map(
                      ([name, prob]: [string, any]) => {
                        const isTop = name === result.predicted_class;
                        return (
                          <View key={name} style={styles.probRow}>
                            <View style={styles.probLabelRow}>
                              <Text
                                style={[styles.probName, isTop && styles.probNameActive]}
                              >
                                {name.replace(/_/g, " ")}
                              </Text>
                              <Text
                                style={[styles.probValue, isTop && styles.probValueActive]}
                              >
                                {typeof prob === "number" ? prob.toFixed(1) : prob}%
                              </Text>
                            </View>
                            <ProgressBar
                              value={typeof prob === "number" ? prob : 0}
                              tone={isTop ? colors.brand600 : colors.mutedSoft}
                              height={6}
                            />
                          </View>
                        );
                      }
                    )}
                  </Card>
                )}

                {/* Recommendation */}
                {result.recommendation && !isInvalidLeaf && (
                  <View style={styles.darkCard}>
                    <View style={styles.darkHead}>
                      <Text style={styles.darkCardLabel}>Recommendation</Text>
                      {result.recommendation.risk_level && (
                        <View
                          style={[
                            styles.riskPill,
                            { backgroundColor: riskTone(result.recommendation.risk_level) },
                          ]}
                        >
                          <Text style={styles.riskPillText}>
                            {result.recommendation.risk_level} risk
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.darkCardText}>
                      {result.recommendation.farmer_action}
                    </Text>

                    {result.recommendation.organic_solutions?.length > 0 && (
                      <View style={styles.solutionsList}>
                        <Text style={styles.solutionsLabel}>Organic Solutions</Text>
                        {result.recommendation.organic_solutions.map(
                          (solution: string, i: number) => (
                            <View key={i} style={styles.solutionItem}>
                              <View style={styles.solutionIndex}>
                                <Text style={styles.solutionIndexText}>{i + 1}</Text>
                              </View>
                              <Text style={styles.solutionText}>{solution}</Text>
                            </View>
                          )
                        )}
                      </View>
                    )}

                    {result.recommendation.note && (
                      <View style={styles.noteBox}>
                        <Info size={14} color={colors.brand300} />
                        <Text style={styles.noteText}>{result.recommendation.note}</Text>
                      </View>
                    )}
                  </View>
                )}

                {user && (
                  <PrimaryButton
                    label="Save to Profile"
                    tone="dark"
                    loading={isSaving}
                    onPress={handleSave}
                    icon={<Save size={17} color={colors.white} />}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 90 },

  pickSection: { gap: 14 },
  infoBox: { flexDirection: "row", alignItems: "center", gap: 14 },
  infoText: { flex: 1, ...t.body, fontSize: 13 },
  primaryPickBtn: {
    backgroundColor: colors.brand900,
    borderRadius: radius.xxl,
    paddingVertical: 36,
    alignItems: "center",
    gap: 6,
    ...shadow.card,
  },
  pickIconCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryPickLabel: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.4,
  },
  primaryPickHint: { color: colors.brand300, fontSize: 12, fontWeight: "500" },
  secondaryPickBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    paddingVertical: 22,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryPickLabel: { color: colors.inkSoft, fontWeight: "700", fontSize: 13.5 },

  tipRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  tipCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 12,
    gap: 4,
  },
  tipTitle: { fontSize: 12, fontWeight: "800", color: colors.ink, marginTop: 4 },
  tipDesc: { fontSize: 10.5, color: colors.muted, lineHeight: 14 },

  resultSection: { gap: 16 },
  imageFrame: {
    borderRadius: radius.xxl,
    overflow: "hidden",
    backgroundColor: colors.white,
    ...shadow.card,
  },
  previewImage: { width: "100%", height: 300 },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,44,34,0.72)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  overlayText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  retakeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  retakeBtnText: { color: colors.ink, fontWeight: "800", fontSize: 11.5 },

  cards: { gap: 14 },
  statusCard: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1.5 },
  dangerCard: { backgroundColor: colors.danger50, borderColor: colors.danger200 },
  successCard: { backgroundColor: colors.brand50, borderColor: colors.brand200 },
  warnCard: { backgroundColor: colors.warn50, borderColor: colors.warn200 },
  cardSubLabel: { ...t.eyebrow, marginBottom: 6 },
  statusText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    textTransform: "capitalize",
  },
  bodyText: { ...t.body },

  probRow: { marginBottom: 14 },
  probLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  probName: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.muted,
    textTransform: "capitalize",
  },
  probNameActive: { color: colors.ink, fontWeight: "800" },
  probValue: { fontSize: 12.5, fontWeight: "700", color: colors.muted },
  probValueActive: { color: colors.brand700, fontWeight: "800" },

  darkCard: {
    backgroundColor: colors.brand950,
    borderRadius: radius.xl,
    padding: 20,
    ...shadow.card,
  },
  darkHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  darkCardLabel: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  riskPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  riskPillText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  darkCardText: { color: colors.white, fontWeight: "500", lineHeight: 21, fontSize: 13.5 },

  solutionsList: { marginTop: 18 },
  solutionsLabel: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  solutionItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 9, gap: 10 },
  solutionIndex: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: "rgba(16,185,129,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  solutionIndexText: { color: colors.brand300, fontSize: 10, fontWeight: "800" },
  solutionText: { color: "#d1d5db", fontSize: 12.5, lineHeight: 19, flex: 1 },

  noteBox: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: "rgba(16,185,129,0.1)",
    padding: 13,
    borderRadius: radius.md,
    marginTop: 16,
    alignItems: "flex-start",
  },
  noteText: { color: colors.brand200, fontSize: 11.5, flex: 1, lineHeight: 17 },
});
