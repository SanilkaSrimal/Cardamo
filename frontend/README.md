# Cardamo Mobile Application 🌿

A professional, AI-powered quality assurance mobile application for cardamom farmers and exporters. Built with **React Native** and **Expo**.

## 🚀 Getting Started

### Prerequisites

1.  **Node.js**: Ensure you have Node.js (v18 or newer) installed.
2.  **Expo Go**: Download the **Expo Go** app on your physical device (iOS or Android).
3.  **Backend Server**: Ensure the Cardamo AI backend is running on your computer.

### Installation

1.  Navigate to the mobile directory:
    ```bash
    cd frontend/mobile
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### 🔗 Connecting to the AI Backend (CRITICAL)

Since the mobile app runs on a physical device, it cannot use `localhost` to reach your backend. You must use your computer's local IP address.

1.  **Find your IP**: Open a terminal on your computer and run:
    *   Windows: `ipconfig` (Look for "IPv4 Address")
    *   Mac/Linux: `ifconfig`
2.  **Update API configuration**:
    *   Open `lib/api.ts`.
    *   Update the `BASE_URL` with your IP:
        ```typescript
        const BASE_URL = 'http://192.168.1.XX:8000'; // Replace XX with your IP
        ```
3.  **Network**: Ensure both your phone and computer are on the **same Wi-Fi network**.

### Running the App

1.  Start the development server:
    ```bash
    npx expo start -c
    ```
2.  **Scan the QR Code**:
    *   **Android**: Open the Expo Go app and tap "Scan QR Code".
    *   **iOS**: Open the Camera app and scan the code.

---

## ✨ Features

*   🛡️ **Pod Disease Detection**: Real-time AI analysis of cardamom pods via camera.
*   🔬 **Leaf Analysis**: Scan foliage to identify pests or nutrient deficiencies.
*   📊 **Quality Grading**: Instant quality certification (LB, LG, LLG1, LLG2).
*   📈 **Market Intelligence**: Price forecasting and profit optimization strategies.
*   💼 **Corporate UI**: Professional, sharp-edged design tailored for corporate agriculture.

## 🛠️ Tech Stack

*   **Framework**: React Native / Expo (SDK 54)
*   **Styling**: React Native StyleSheet (Corporate Design System)
*   **Networking**: Axios
*   **Icons**: Lucide React Native
*   **Navigation**: Expo Router (File-based)
