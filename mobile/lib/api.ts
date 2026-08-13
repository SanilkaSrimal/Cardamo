import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// On Android Emulator, 127.0.0.1 refers to the emulator itself.
// Use 10.0.2.2 to access the host machine.
const BASE_URL = "http://192.168.1.8:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Add interceptor to inject the authorization token automatically
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("Error retrieving token", e);
  }
  return config;
});

// Auth API
export const login = async (data: any) => {
  const response = await apiClient.post("/api/auth/login", data);
  return response.data;
};

export const register = async (data: any) => {
  const response = await apiClient.post("/api/auth/register", data);
  return response.data;
};

// We pass token directly in me() since it might be called during initial load before interceptor has it
export const me = async (token?: string) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await apiClient.get("/api/auth/me", config);
  return response.data;
};

// Dashboard APIs
export const getMyPlans = async () => {
  const response = await apiClient.get("/api/payments/my");
  return response.data;
};

export const getPlans = async () => {
  const response = await apiClient.get("/api/plans/");
  return response.data;
};

export const activatePlan = async (plan_id: number) => {
  const response = await apiClient.post("/api/payments/activate", { plan_id });
  return response.data;
};

export const getMyHarvestingRecords = async () => {
  const response = await apiClient.get("/api/harvesting/my");
  return response.data;
};

export const saveHarvestingRecord = async (data: any) => {
  const response = await apiClient.post("/api/harvesting/", data);
  return response.data;
};

export const updateHarvestingRecord = async (id: number, data: any) => {
  const response = await apiClient.put(`/api/harvesting/${id}`, data);
  return response.data;
};

export const deleteHarvestingRecord = async (id: number) => {
  const response = await apiClient.delete(`/api/harvesting/${id}`);
  return response.data;
};

// AI APIs
export const predictPodDisease = async (uri: string) => {
  const formData = new FormData();
  // @ts-ignore
  formData.append("file", {
    uri,
    name: "photo.jpg",
    type: "image/jpeg",
  });
  const response = await apiClient.post("/api/pod-disease/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const predictLeafDisease = async (uri: string) => {
  const formData = new FormData();
  // @ts-ignore
  formData.append("file", {
    uri,
    name: "photo.jpg",
    type: "image/jpeg",
  });
  const response = await apiClient.post("/api/leaf-disease/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const predictGrading = async (uri: string) => {
  const formData = new FormData();
  // @ts-ignore
  formData.append("file", {
    uri,
    name: "photo.jpg",
    type: "image/jpeg",
  });
  const response = await apiClient.post("/api/grading/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const predictMarketPrice = async (data: any) => {
  const response = await apiClient.post("/api/market/predict-price", data);
  return response.data;
};

export const getMarketRecommendation = async (data: any) => {
  const response = await apiClient.post("/api/market/recommend", data);
  return response.data;
};

export default apiClient;
