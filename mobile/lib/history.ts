import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'ai_scan_history';

export interface ScanActivity {
  id: string;
  type: string;
  resultTitle: string;
  date: string;
}

export const saveScanActivity = async (activity: Omit<ScanActivity, 'id' | 'date'>) => {
  try {
    const existing = await getScanHistory();
    const newActivity: ScanActivity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    
    // Keep only the last 10 activities to avoid huge storage
    const updated = [newActivity, ...existing].slice(0, 10);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save scan history", e);
  }
};

export const getScanHistory = async (): Promise<ScanActivity[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load scan history", e);
    return [];
  }
};
