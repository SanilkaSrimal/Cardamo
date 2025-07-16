import { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { predictPodDisease } from "../lib/api";
import { Camera, ShieldAlert, CheckCircle2, ChevronLeft, Info, ImageIcon } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function PodDiseaseScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
    try { setResult(await predictPodDisease(uri)); }
    catch { Alert.alert("Error", "Failed to connect to the AI server."); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Pod Disease Detection</Text>
      </View>

      <ScrollView style={styles.body}>
        {!image ? (
          <View style={styles.pickSection}>
            <View style={styles.infoBox}>
              <Info size={22} color="#064e3b" />
              <Text style={styles.infoText}>Capture a clear, close-up image of a single cardamom pod. Ensure there is enough light and the pod is centred.</Text>
            </View>
            <TouchableOpacity onPress={() => pickImage(true)} style={styles.primaryPickBtn}>
              <Camera size={44} color="white" />
              <Text style={styles.primaryPickLabel}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pickImage(false)} style={styles.secondaryPickBtn}>
              <ImageIcon size={30} color="#9ca3af" />
              <Text style={styles.secondaryPickLabel}>Upload from Gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultSection}>
            <View style={styles.imageFrame}>
              <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity onPress={() => setImage(null)} style={styles.retakeBtn}>
                <Text style={styles.retakeBtnText}>RETAKE</Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#064e3b" />
                <Text style={styles.loadingText}>AI Analyzing...</Text>
              </View>
            )}

            {result && (
              <View style={styles.cards}>
                <View style={[styles.statusCard, result.disease_detected ? styles.dangerCard : styles.successCard]}>
                  <View>
                    <Text style={styles.cardSubLabel}>Status</Text>
                    <Text style={[styles.statusText, result.disease_detected ? { color: "#b91c1c" } : { color: "#047857" }]}>
                      {result.disease_detected ? "Disease Detected" : "Healthy"}
                    </Text>
                  </View>
                  {result.disease_detected ? <ShieldAlert size={40} color="#dc2626" /> : <CheckCircle2 size={40} color="#059669" />}
                </View>

                {result.predicted_class && (
                  <View style={styles.detailCard}>
                    <Text style={styles.cardSubLabel}>Finding</Text>
                    <Text style={styles.detailTitle}>{result.predicted_class.replace(/_/g, " ")}</Text>
                    <Text style={styles.confidence}>Confidence: <Text style={styles.confidenceValue}>{result.confidence_percent?.toFixed(1)}%</Text></Text>
                  </View>
                )}

                {result.recommendation && (
                  <View style={styles.darkCard}>
                    <Text style={styles.darkCardLabel}>Recommendation</Text>
                    <Text style={styles.darkCardText}>"{result.recommendation.farmer_action}"</Text>
                    <View style={styles.riskRow}>
                      <Text style={styles.riskLabel}>RISK LEVEL: <Text style={styles.riskValue}>{result.recommendation.risk_level}</Text></Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  navBar: { backgroundColor: "#064e3b", paddingTop: 52, paddingBottom: 20, paddingHorizontal: 24, flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 16 },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: -0.5, textTransform: "uppercase" },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  pickSection: { gap: 16 },
  infoBox: { flexDirection: "row", gap: 12, backgroundColor: "#f0fdf4", padding: 16, borderWidth: 1, borderColor: "#d1fae5", alignItems: "flex-start" },
  infoText: { flex: 1, color: "#064e3b", fontSize: 13, lineHeight: 20, fontWeight: "500" },
  primaryPickBtn: { backgroundColor: "#064e3b", paddingVertical: 48, alignItems: "center", gap: 12 },
  primaryPickLabel: { color: "#fff", fontWeight: "900", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" },
  secondaryPickBtn: { borderWidth: 2, borderColor: "#d1d5db", borderStyle: "dashed", paddingVertical: 40, alignItems: "center", gap: 10 },
  secondaryPickLabel: { color: "#9ca3af", fontWeight: "700", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" },
  resultSection: { gap: 20 },
  imageFrame: { borderWidth: 1, borderColor: "#e5e7eb", padding: 8, position: "relative" },
  previewImage: { width: "100%", height: 300 },
  retakeBtn: { position: "absolute", top: 20, right: 20, backgroundColor: "#dc2626", paddingHorizontal: 12, paddingVertical: 6 },
  retakeBtnText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  loadingBox: { alignItems: "center", paddingVertical: 40, gap: 16 },
  loadingText: { color: "#064e3b", fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" },
  cards: { gap: 16 },
  statusCard: { padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dangerCard: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  successCard: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" },
  cardSubLabel: { fontSize: 10, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  statusText: { fontSize: 22, fontWeight: "900", textTransform: "uppercase" },
  detailCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", padding: 24 },
  detailTitle: { fontSize: 20, fontWeight: "900", color: "#111827", textTransform: "uppercase", marginBottom: 12 },
  confidence: { fontSize: 13, fontWeight: "700", color: "#6b7280" },
  confidenceValue: { color: "#064e3b", fontWeight: "900" },
  darkCard: { backgroundColor: "#111827", padding: 24 },
  darkCardLabel: { color: "#10b981", fontSize: 10, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  darkCardText: { color: "#fff", fontWeight: "500", fontStyle: "italic", lineHeight: 22, marginBottom: 16 },
  riskRow: { borderTopWidth: 1, borderTopColor: "#374151", paddingTop: 12 },
  riskLabel: { color: "#9ca3af", fontSize: 11, fontWeight: "700" },
  riskValue: { color: "#10b981" },
});
