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
import { predictPodDisease, saveHarvestingRecord } from "../lib/api";
import {
  Camera,
  ShieldAlert,
  CheckCircle2,
  Info,
  ImageIcon,
  Save,
  AlertTriangle,
  Sun,
  Focus,
  Crop,
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
  { icon: Sun, title: "Even light", desc: "Shade or diffused daylight" },
  { icon: Focus, title: "Sharp focus", desc: "Tap the pod to focus" },
  { icon: Crop, title: "Fill frame", desc: "One pod, close up" },
];

const riskTone = (level?: string) => {
  if (level === "High") return colors.danger;
  if (level === "Medium") return colors.spice500;
  if (level === "Low") return colors.brand500;
  return colors.muted;
};

export default function PodDiseaseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // The backend returns three outcomes, not two: the image gate can reject the
  // upload before the disease model ever runs.
  const isInvalidPod = result?.predicted_class === "not_a_cardamom_pod";
  const hasDisease = !isInvalidPod && !!result?.disease_detected;

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await saveHarvestingRecord({
        crop_type: "Cardamom",
        weight_kg: 0,
        grade: "N/A",
        price_per_kg: 0,
        notes: `Pod Analysis: ${result.predicted_class || 'Healthy'}`
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
      if (status !== "granted") { Alert.alert("Permission Denied", "Camera access is required."); return; }
      res = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    } else {
      res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    }
    if (!res.canceled) {
      const uri = res.assets[0].uri;
      setImage(uri); setResult(null);
      handleAnalysis(uri);
    }
  };

  const handleAnalysis = async (uri: string) => {
    setLoading(true);
    try {
      const data = await predictPodDisease(uri);
      setResult(data);
      await saveScanActivity({
        type: "Pod Analysis",
        resultTitle:
          data.predicted_class === "not_a_cardamom_pod"
            ? "Not a cardamom pod"
            : data.disease_detected
              ? data.predicted_class.replace(/_/g, " ")
              : "Healthy",
      });
    }
    catch { Alert.alert("Error", "Failed to connect to the AI server."); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Pod Disease Detection"
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
                Capture a clear, close-up image of a single cardamom pod. Make sure the
                damaged area is visible and well lit.
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
              <Text style={styles.primaryPickLabel}>Open Camera</Text>
              <Text style={styles.primaryPickHint}>Fastest way to scan in the field</Text>
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
                  <Text style={styles.overlayText}>Analyzing</Text>
                </View>
              )}
            </View>

            {result && (
              <View style={styles.cards}>
                {/* Status */}
                <Card
                  style={[
                    styles.statusCard,
                    isInvalidPod
                      ? styles.warnCard
                      : hasDisease
                        ? styles.dangerCard
                        : styles.successCard,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cardSubLabel,
                        isInvalidPod && { color: colors.warn700 },
                      ]}
                    >
                      {isInvalidPod ? "Invalid Image" : "Status"}
                    </Text>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isInvalidPod
                            ? colors.warn800
                            : hasDisease
                              ? colors.danger700
                              : colors.brand700,
                        },
                      ]}
                    >
                      {isInvalidPod
                        ? "Not a Cardamom Pod"
                        : hasDisease
                          ? "Disease Detected"
                          : "Healthy Pod"}
                    </Text>
                  </View>
                  <IconTile
                    size={52}
                    tone={isInvalidPod ? "neutral" : hasDisease ? "danger" : "brand"}
