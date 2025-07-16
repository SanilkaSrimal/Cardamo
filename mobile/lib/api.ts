import axios from "axios";
import { Platform } from "react-native";

// On Android Emulator, 127.0.0.1 refers to the emulator itself.
// Use 10.0.2.2 to access the host machine.
const BASE_URL = 'http://192.168.0.200:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

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
