# 🚀 VERITAS-X — AI-Powered Scam Detection Platform

## 🔥 Overview

VERITAS-X is an **AI-native threat intelligence platform** designed to detect scams across **URLs, text, images, and videos** in real-time.

It combines:

* 🧠 AI reasoning
* 🌐 Web/domain analysis
* 📊 Real-time dashboards
* 🧩 Browser extension protection

to provide a **complete scam detection ecosystem**.

---

## 🎯 Problem Statement

Online scams (OTP fraud, phishing, fake URLs, etc.) are increasing rapidly.

Existing solutions:

* Detect only specific types
* Lack real-time intelligence
* No unified dashboard

👉 VERITAS-X solves this by combining **AI + analytics + real-time monitoring**

---

## ⚡ Key Features

### 🔍 Multi-Modal Scam Detection

* URL analysis
* Text scam detection (OTP, phishing patterns)
* Image & video scanning
* Domain verification

---

### 📊 Real-Time Analytics Dashboard

* Total scans, safe, danger metrics
* Live detection feed
* Scam type distribution (pie + bar charts)
* Risk activity trends

---

### 🧠 AI Reasoning Engine

* Uses **Ollama (LLM-based reasoning)**
* Detects scam patterns intelligently
* Provides explanation: *"Why flagged?"*

---

### 🌐 Domain Intelligence

* Extracts domain from URL
* Highlights suspicious domains
* Detects fake vs real patterns

---

### 🔗 Export & Sharing

* 📄 Download PDF report
* 📦 Export JSON report
* 🔗 Share analysis link

---

### 🧩 Browser Extension

* Real-time scam detection while browsing
* Popup risk alerts
* Background monitoring

---

## 🏗️ Tech Stack

### 💻 Frontend

* React (Vite)
* Tailwind CSS
* Recharts (charts)
* Context API (state management)

---

### ⚙️ Backend

* FastAPI (Python)
* MongoDB (data storage)
* REST APIs

---

### 🧠 AI Layer

* Ollama (LLM integration)
* Custom reasoning engine
* Pattern detection system

---

### 🧩 Extension

* JavaScript
* Chrome Extension APIs
* Content scripts + background scripts

---

## 📂 Project Structure

```
veritas-x/
│
├── backend/
│   ├── main.py
│   ├── routers/
│   ├── services/
│   ├── ai/
│   └── utils/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── extension/
│   ├── manifest.json
│   ├── popup.js
│   └── content.js
```

---

## 🚀 How to Run Locally

### 1️⃣ Backend

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 2️⃣ Frontend

```
cd frontend
npm install
npm run dev
```

---

### 3️⃣ Extension

* Open Chrome → Extensions
* Enable Developer Mode
* Load unpacked → select `/extension`

---

## 📡 API Endpoints

* `/analyze` → scan input
* `/analytics` → dashboard data
* `/detections` → recent scans

---

## 🔥 Unique Selling Points

* AI + Real-time analytics combined
* Multi-input detection (URL, text, media)
* Browser extension integration
* Exportable reports (PDF + JSON)
* Live updating dashboard

---

## 📊 Sample Insights

* Detects OTP scam patterns
* Identifies phishing URLs
* Highlights suspicious domains
* Provides confidence score

---

## 👩‍💻 Author

**Kumari Sonali**

---

## 🏁 Future Scope

* Real-time WebSocket streaming
* Mobile app integration
* Advanced ML models
* Global threat intelligence network

---
## 📸 Screenshots

### 🏠 Landing Page
![Landing](./screenshots/landing.png)

### 🔍 Scan Studio
![Scan](./screenshots/scan.png)

### 🚨 Scam Detection
![Result](./screenshots/result.png)

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)

### 📁 Detections
![Detections](./screenshots/detections.png)

### 📈 Analytics
![Analytics](./screenshots/analytics.png)

### ⚙️ Backend API
![API](./screenshots/api.png)

## 💡 Conclusion

VERITAS-X is not just a tool —
it is a **complete AI-driven cybersecurity intelligence system** designed for modern digital threats.

---
