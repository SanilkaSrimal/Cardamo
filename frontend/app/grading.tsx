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
