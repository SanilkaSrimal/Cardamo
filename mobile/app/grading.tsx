import { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { predictGrading } from "../lib/api";
import { Camera, ChevronLeft, ImageIcon, Award } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function GradingScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
      try { setResult(await predictGrading(uri)); }
      catch { Alert.alert("Error", "Grading analysis failed."); }
      finally { setLoading(false); }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ChevronLeft color="white" size={28} /></TouchableOpacity>
        <Text style={styles.navTitle}>Quality Grading</Text>
      </View>
      <ScrollView style={styles.body}>
        {!image ? (
          <View style={styles.pickSection}>
            <TouchableOpacity onPress={() => pickImage(true)} style={styles.primaryPickBtn}>
              <Camera size={44} color="white" />
              <Text style={styles.primaryPickLabel}>Scan Batch</Text>
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
              <TouchableOpacity onPress={() => setImage(null)} style={styles.retakeBtn}><Text style={styles.retakeBtnText}>RETAKE</Text></TouchableOpacity>
            </View>
            {loading && (
              <View style={styles.loadingBox}><ActivityIndicator size="large" color="#064e3b" /><Text style={styles.loadingText}>Assessing Quality...</Text></View>
            )}
            {result && (
              <View style={styles.cards}>
                <View style={styles.gradeCard}>
                  <Award size={32} color="#10b981" />
                  <Text style={styles.gradeLabel}>Certified Grade</Text>
                  <Text style={styles.gradeValue}>{result.grade}</Text>
                  <Text style={styles.gradeConf}>Confidence: {result.confidence?.toFixed(1)}%</Text>
                </View>
                <View style={styles.detailCard}>
                  <Text style={styles.cardSubLabel}>Probability Map</Text>
                  {Object.entries(result.all_probabilities || {}).map(([name, prob]: [string, any]) => (
                    <View key={name} style={styles.probRow}>
                      <View style={styles.probLabelRow}>
                        <Text style={styles.probName}>{name}</Text>
                        <Text style={styles.probValue}>{prob.toFixed(1)}%</Text>
                      </View>
                      <View style={styles.probBar}>
                        <View style={[styles.probFill, name === result.grade ? styles.probFillActive : styles.probFillInactive, { width: `${prob}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
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
  gradeCard: { backgroundColor: "#064e3b", padding: 40, alignItems: "center", borderLeftWidth: 8, borderLeftColor: "#10b981", gap: 8 },
  gradeLabel: { color: "#10b981", fontSize: 10, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" },
  gradeValue: { color: "#fff", fontSize: 56, fontWeight: "900" },
  gradeConf: { color: "#a7f3d0", fontSize: 12, fontWeight: "700" },
  detailCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", padding: 24, gap: 12 },
  cardSubLabel: { fontSize: 10, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  probRow: { gap: 6 },
  probLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  probName: { fontSize: 11, fontWeight: "700", color: "#374151" },
  probValue: { fontSize: 11, fontWeight: "900", color: "#064e3b" },
  probBar: { width: "100%", height: 6, backgroundColor: "#f3f4f6" },
  probFill: { height: "100%" },
  probFillActive: { backgroundColor: "#064e3b" },
  probFillInactive: { backgroundColor: "#d1d5db" },
});
