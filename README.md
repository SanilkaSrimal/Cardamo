# Cardamo 🌿
## AI-Powered Cardamom Farmer Support System

Cardamo is an integrated AI-based platform designed to support cardamom farmers and related stakeholders through crop diagnostics, pod quality grading, and market decision support.

The system combines web, mobile, backend, and machine-learning components in one platform.

## Main Features

- Cardamom leaf disease detection
- Cardamom pod disease detection
- Cardamom pod quality grading
- Market price forecasting
- Profit optimization and sell/store recommendations
- Invalid-input detection
- Confidence-aware AI outputs
- Farmer-oriented recommendations
- User profile, credit, and record-management features

---

## 1. Project Overview

Cardamom cultivation can be affected by crop disease, pest damage, inconsistent grading, and market-price uncertainty. Cardamo was developed as an AI-assisted decision-support system that combines computer vision, machine learning, web technologies, and mobile technologies to support practical agricultural decisions.

Users can upload or capture images through the web or mobile application and receive model predictions with confidence information and recommendations. The Market Intelligence module additionally supports short-term dried-cardamom price forecasting and economic decision support.

---

## 2. AI Components

### 2.1 Leaf Disease Detection

The leaf-analysis module identifies cardamom leaf conditions from images.

Final classes:

- Healthy
- Leaf Blight
- Phyllosticta Leaf Spot

Main implementation features:

- EfficientNetB0 transfer learning
- Image preprocessing and augmentation
- Class-weighted training
- Confidence-based prediction
- Invalid / non-cardamom input handling
- Farmer-care and treatment recommendations

---

### 2.2 Pod Disease Detection

The pod-disease module identifies major pod-related disease or pest conditions.

Final classes:

- Capsule Borer
- Cardamom Thrips

Main implementation features:

- EfficientNetB0-based classifier
- Transfer learning
- Two-stage training and fine-tuning
- Independent test evaluation
- Invalid-input rejection logic
- API integration
- Risk level and farmer-action recommendations
- Organic / practical control guidance

---

### 2.3 Pod Quality Grading

The grading module classifies cardamom pods into three visual quality levels.

| AI Grade | Project Mapping | General Interpretation |
|---|---|---|
| Grade A | LG – Lanka Green | Premium visual quality |
| Grade B | LLG1 – Lanka Light Green 1 | Standard / good commercial quality |
| Grade C | LLG2 – Lanka Light Green 2 | Lower commercial / domestic quality |

Main implementation features:

- MobileNetV2 transfer learning
- Image preprocessing and pod-focused cropping
- Data augmentation
- Class weighting
- Confidence-aware grading
- Uncertain-result handling
- TensorFlow Lite export

The application can display the predicted grade, confidence score, probability distribution, quality summary, and market-oriented interpretation.

---

### 2.4 Market Intelligence

The Market Intelligence module supports price forecasting and economic decision-making.

Main functions:

- Four-week dried-cardamom price forecasting
- Region-based prediction
- Grade-based prediction
- Profit comparison
- Fresh-sell vs dry-and-store analysis
- Recommendation generation

Supported regions can include:

- Badulla
- Kandy
- Kegalle
- Matale
- Nuwara Eliya
- Ratnapura

Example supported grades:

- LB
- LG
- LLG1
- LLG2

---

## 3. High-Level Architecture

```text
                    ┌─────────────────────┐
                    │      Web Client     │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │   FastAPI Backend   │
                    │ Validation + APIs   │
                    └──────┬───────┬──────┘
                           │       │
            ┌──────────────┘       └──────────────┐
            │                                     │
   ┌────────▼────────┐                    ┌────────▼────────┐
   │   AI Models     │                    │   Database      │
   │ Leaf / Pod /    │                    │ Users / History │
   │ Grade / Market  │                    │ Credits / Data  │
   └────────┬────────┘                    └─────────────────┘
            │
   ┌────────▼────────┐
   │ Response Object │
   │ Class / Score / │
   │ Recommendation │
   └────────┬────────┘
            │
   ┌────────▼────────┐
   │  Mobile Client  │
   └─────────────────┘
```

---

## 4. Repository Structure

A typical repository structure is:

```text
Cardamo/
│
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── services/
│   ├── routers/
│   ├── models/
│   ├── training/
│   ├── uploads/
│   └── data/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── mobile/
│   ├── app/
│   ├── components/
│   ├── assets/
│   └── package.json
│
└── README.md
```

> The exact structure may vary slightly depending on the development branch.

---

## 5. Technology Stack

### Backend

- Python
- FastAPI
- Uvicorn
- TensorFlow / Keras
- NumPy
- Pandas
- scikit-learn
- SQLite / project database layer

### Web Frontend

- React / Next.js
- TypeScript
- Responsive web UI

### Mobile Application

- React Native
- Expo
- TypeScript

### Machine Learning

- TensorFlow / Keras
- EfficientNetB0
- MobileNetV2
- Transfer learning
- TensorFlow Lite
- Classification metrics
- Regression metrics

### Development and Testing

- Git
- GitHub
- Postman
- VS Code
- Jupyter Notebook / Google Colab

---

## 6. Backend Setup

### Prerequisites

- Python 3.10+
- pip
- virtual environment support

### Create a Virtual Environment

```bash
cd backend
python -m venv .venv
```

Activate it.

#### Windows

```bash
.venv\Scripts\activate
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

### Install Dependencies

If a `requirements.txt` file is available:

```bash
pip install -r requirements.txt
```

### Run the FastAPI Backend

```bash
uvicorn main:app --reload
```

or:

```bash
python -m uvicorn main:app --reload
```

Default local backend:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 7. Web Application Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Typical local URL:

```text
http://localhost:3000
```

Make sure the backend is running before testing the AI services.

---

## 8. Mobile Application Setup

Navigate to the mobile directory:

```bash
cd mobile
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

### Connecting a Physical Phone to the Backend

A physical mobile device cannot use the computer's `localhost` address.

Do not use:

```text
http://127.0.0.1:8000
```

Use your computer's local IP address instead, for example:

```text
http://192.168.1.10:8000
```

The phone and development computer should normally be connected to the same network.

---

## 9. General AI Request Flow

```text
Image Upload / Capture
        ↓
Input Validation
        ↓
Image Preprocessing
        ↓
AI Model Inference
        ↓
Confidence Evaluation
        ↓
Class / Grade Result
        ↓
Recommendation Generation
        ↓
Web / Mobile Response
```

A prediction response may include fields such as:

```json
{
  "success": true,
  "predicted_class": "example_class",
  "confidence_percent": 95.2,
  "message": "Prediction completed.",
  "recommendation": {
    "risk_level": "Low",
    "farmer_action": "Recommended action text"
  }
}
```

Actual response fields depend on the selected service.

---

## 10. Confidence and Invalid-Input Handling

Cardamo includes validation and confidence logic to reduce misleading predictions.

```text
Valid Input
   ├── Confident Prediction → Show Result
   └── Low Confidence       → Uncertain / Retake

Invalid Input
   └── Reject / Request Correct Image
```

Examples of invalid or unsupported inputs can include:

- Non-cardamom objects
- Other crop images
- Unclear or low-quality images
- Unsupported visual inputs
- Images that do not contain the expected plant part

---

## 11. Model Evaluation

### Classification Modules

Typical metrics include:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion matrix
- Per-class support

### Market Forecasting

Typical metrics include:

- MAE
- RMSE
- R²
- MAPE

Where applicable, the project uses separated training, validation, and test data to avoid leakage between model fitting and final evaluation.

---

## 12. Research and Engineering Practices

The project applies the following practices:

- Explicit train / validation / test splits
- Transfer learning
- Data augmentation
- Class-imbalance handling
- Independent test evaluation
- Confidence-aware outputs
- Invalid-input handling
- Model and code version control
- API integration testing
- Web and mobile integration
- TensorFlow Lite export where applicable
- User-oriented recommendation logic

---

## 13. Git Development Workflow

The project uses Git branches to support parallel development of individual research components.

Example structure:

```text
master
  │
  ├── leaf-analysis
  ├── pod-disease
  ├── pod-quality
  └── market-analysis
```

Typical workflow:

```bash
git checkout -b feature-name
git add .
git commit -m "Describe the implemented change"
git push origin feature-name
```

---

## 14. Testing Strategy

Release-oriented testing should cover:

- Unit tests
- Model tests
- API contract tests
- Regression tests
- UI flow tests
- Invalid-input tests
- Performance tests
- Integration tests

A release should proceed only when the required checks pass.

---

## 15. Post-Deployment Monitoring

A production-oriented version should monitor:

- Prediction confidence
- Invalid-input frequency
- API failures
- Inference latency
- User-reported errors
- New field examples
- Class-distribution changes

Suggested lifecycle:

```text
Production Inference
        ↓
Operational Monitoring
        ↓
Human Review
        ↓
Dataset Curation
        ↓
Retraining Candidate
        ↓
Independent Revalidation
        ↓
Approved Release
```

---

## 16. Current Limitations

Cardamo is a research prototype and should not be treated as a replacement for professional agricultural inspection.

Important limitations include:

- Performance depends on the available training data.
- Lighting and background variation can affect predictions.
- Some disease symptoms can be visually similar.
- Pod grading is based mainly on visual image characteristics.
- Market forecasts depend on historical and available market data.
- Larger multi-location field validation is still required.
- Confidence scores do not guarantee correctness.

---

## 17. Future Improvements

Possible future work includes:

- Larger multi-location field datasets
- Additional disease classes
- Stronger out-of-distribution detection
- Explainable AI visualizations
- Offline mobile inference
- Quantized TensorFlow Lite deployment
- Multilingual support
- Batch-level pod grading
- Cloud deployment
- Automated model monitoring
- Farmer feedback-based retraining
- Stronger live market-data integration

---

## 18. Responsible Use

Cardamo is intended as a decision-support tool.

AI results should be combined with:

- Farmer observation
- Agricultural guidance
- Expert consultation when required
- Responsible and sustainable crop-management practices

The project aims to support practical decision-making while avoiding over-reliance on automated predictions.

---

## 19. Academic Context

Cardamo was developed as a final-year research project combining:

- Artificial Intelligence
- Machine Learning
- Computer Vision
- Software Engineering
- Mobile Application Development
- Web Application Development
- Agricultural Decision Support

Each major AI service was developed and evaluated as an individual research component before integration into the shared Cardamo platform.

---

## 20. Contributors

The Cardamo project was developed collaboratively by the project team.

Main research areas:

- Leaf Disease Detection
- Pod Disease Detection
- Pod Quality Grading
- Market Intelligence

---

## 21. License

If the repository is intended for public reuse, add the selected project license here.

Example:

```text
MIT License
```

Otherwise:

```text
All Rights Reserved – Academic Research Project
```

---

## 22. Project Status

```text
Research Prototype / Final-Year Project
```

Core system modules have been implemented and integrated for research demonstration and evaluation.

---

# Cardamo

**Quality Intelligence for Smarter Cardamom Farming.**
