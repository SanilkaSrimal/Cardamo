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

