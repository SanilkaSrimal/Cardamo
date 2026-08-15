import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

// On Android Emulator, 127.0.0.1 refers to the emulator itself.
// Use 10.0.2.2 to access the host machine.
const BASE_URL = 'http://10.0.2.2:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Add interceptor to inject the authorization token automatically
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
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

