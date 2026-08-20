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
import { predictGrading, saveHarvestingRecord } from "../lib/api";
import {
  Camera,
  ImageIcon,
  Award,
  Save,
  Sparkles,
  Ruler,
  Palette,
  ShieldCheck,
  Star,
  Info,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../lib/AuthContext";
import { saveScanActivity } from "../lib/history";
import { colors, radius, shadow, type as t } from "../constants/theme";
import {
  ScreenHeader,
  Card,
  IconTile,
  Badge,
  PrimaryButton,
  ProgressBar,
  MeshBackdrop,
} from "../components/ui";

const criteria = [
  { icon: Ruler, title: "Size", desc: "Capsule dimensions" },
  { icon: Palette, title: "Colour", desc: "Even deep green" },
  { icon: ShieldCheck, title: "Integrity", desc: "Splits & damage" },
];

export default function GradingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveHarvestingRecord({
        crop_type: "Cardamom",
        weight_kg: 0,
        grade: result.grade,
        price_per_kg: 0,
        notes: "Grading Analysis"
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
        const data = await predictGrading(uri);
        setResult(data);
        await saveScanActivity({
          type: "Grading",
          resultTitle: data.standard_grade?.standard_code || data.grade
        });
      }
      catch { Alert.alert("Error", "Grading analysis failed."); }
      finally { setLoading(false); }
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Quality Grading"
        subtitle="Trade Certification"
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
              <IconTile size={40} tone="spice">
                <Info size={19} color={colors.spice600} />
              </IconTile>
              <Text style={styles.infoText}>
                Spread a representative handful on a plain surface in even light. The model
                scores size, colour, and surface defects.
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
              <Text style={styles.primaryPickLabel}>Scan Batch</Text>
              <Text style={styles.primaryPickHint}>Certify before you negotiate</Text>
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
              {criteria.map((c) => (
                <View key={c.title} style={styles.tipCard}>
                  <c.icon size={16} color={colors.spice600} />
                  <Text style={styles.tipTitle}>{c.title}</Text>
                  <Text style={styles.tipDesc}>{c.desc}</Text>
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
                  <ActivityIndicator size="large" color={colors.spice300} />
                  <Text style={styles.overlayText}>Grading</Text>
                </View>
              )}
            </View>

            {result && (
              <View style={styles.cards}>
                {/* Certificate */}
                <View style={styles.gradeCard}>
                  <MeshBackdrop />
                  <View style={styles.gradeInner}>
                    <IconTile size={52} tone="translucent">
                      <Award size={24} color={colors.spice300} />
                    </IconTile>
                    <Text style={styles.gradeLabel}>Certified Grade</Text>
                    <Text style={[styles.gradeValue, (result.standard_grade?.standard_code || result.grade)?.length > 5 && { fontSize: 24 }]}>
                      {result.standard_grade?.standard_code || (result.grade ? result.grade.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '')}
                    </Text>
                    {typeof result.confidence === "number" && (
                      <>
                        <Text style={styles.gradeConf}>
                          Confidence {result.confidence.toFixed(1)}%
                        </Text>
                        <View style={styles.gradeBar}>
                          <ProgressBar
                            value={result.confidence}
                            tone={colors.spice400}
                            track="rgba(255,255,255,0.16)"
                            height={6}
                          />
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {result.standard_grade && (
                  <Card>
                    <View style={styles.gradeHead}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardSubLabel}>Standard Grade</Text>
                        <Text style={styles.standardName}>
                          {result.standard_grade.standard_name}
                        </Text>
                      </View>
                      {result.standard_grade.quality_rank != null && (
                        <Badge
                          tone="spice"
                          label={`Tier ${result.standard_grade.quality_rank}`}
                        />
                      )}
                    </View>

                    {result.standard_grade.market_tier && (
                      <View style={styles.marketTierRow}>
                        <Star size={13} color={colors.spice500} />
                        <Text style={styles.marketTier}>
                          {result.standard_grade.market_tier}
                        </Text>
                      </View>
                    )}

                    <Text style={styles.descriptionText}>
                      {result.standard_grade.description}
                    </Text>

                    {result.standard_grade.typical_traits?.length > 0 && (
                      <>
                        <Text style={[styles.cardSubLabel, styles.traitsLabel]}>
                          Typical Traits
                        </Text>
                        {result.standard_grade.typical_traits.map(
                          (trait: string, idx: number) => (
                            <View key={idx} style={styles.bulletRow}>
                              <View style={styles.bulletPoint} />
                              <Text style={styles.traitText}>{trait}</Text>
                            </View>
                          )
                        )}
                      </>
                    )}
                  </Card>
                )}

                {result.estimated_size && (
                  <Card style={styles.sizeCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardSubLabel}>Estimated Size</Text>
                      <Text style={styles.sizeValue}>{result.estimated_size}</Text>
                    </View>
                    <IconTile size={46} tone="brand">
                      <Ruler size={21} color={colors.brand700} />
                    </IconTile>
                  </Card>
                )}

                {result.xai?.summary && (
                  <View style={styles.darkCard}>
                    <View style={styles.darkHead}>
                      <Sparkles size={13} color={colors.brand300} />
                      <Text style={styles.darkCardLabel}>AI Explanation</Text>
                    </View>
                    <Text style={styles.darkCardText}>{result.xai.summary}</Text>
                  </View>
                )}

                <View style={styles.disclaimer}>
                  <Info size={14} color={colors.muted} />
                  <Text style={styles.disclaimerText}>
                    Visual grading only. Final value still depends on moisture content and
                    aroma profile.
                  </Text>
                </View>

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

  gradeCard: {
    borderRadius: radius.xxl,
    overflow: "hidden",
    ...shadow.card,
  },
  gradeInner: { alignItems: "center", paddingVertical: 30, paddingHorizontal: 20 },
  gradeLabel: {
    color: colors.spice300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginTop: 14,
  },
  gradeValue: {
    color: colors.white,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1.5,
    marginTop: 6,
  },
  gradeConf: { color: colors.brand200, fontSize: 12.5, fontWeight: "600", marginTop: 6 },
  gradeBar: { width: 150, marginTop: 12 },

  cardSubLabel: { ...t.eyebrow, marginBottom: 6 },
  gradeHead: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  standardName: { fontSize: 17, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  marketTierRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  marketTier: { fontSize: 13, fontWeight: "700", color: colors.spice600 },
  descriptionText: { ...t.body, marginTop: 10 },
  traitsLabel: { marginTop: 18, marginBottom: 10 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.brand500,
    marginTop: 7,
  },
  traitText: { flex: 1, fontSize: 13, color: colors.inkSoft, lineHeight: 19 },

  sizeCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  sizeValue: { fontSize: 20, fontWeight: "800", color: colors.brand800, letterSpacing: -0.4 },

  darkCard: {
    backgroundColor: colors.brand950,
    borderRadius: radius.xl,
    padding: 20,
    ...shadow.card,
  },
  darkHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  darkCardLabel: {
    color: colors.brand300,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  darkCardText: { color: colors.white, fontWeight: "500", lineHeight: 21, fontSize: 13.5 },

  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  disclaimerText: { flex: 1, fontSize: 11.5, color: colors.muted, lineHeight: 17 },
});
