# 🛡️ SENTINEL EWS (Early Warning System)

**Sentinel EWS** is a high-performance, AI-powered disaster reporting and real-time monitoring dashboard. It enables field agents and citizens to broadcast emergency alerts, verify threats using computer vision, and receive localized warnings based on geospatial proximity.

![Sentinel Header](https://img.shields.io/badge/Status-Live-success?style=for-the-badge&logo=render)
![Sentinel Tech](https://img.shields.io/badge/Stack-Next.js%20|%20Node.js%20|%20MongoDB-blue?style=for-the-badge)

---

## 🚀 Live Links
- **Frontend Dashboard:** [sentinel-ews.vercel.app](https://sentinel-ews.vercel.app)
- **Backend API:** [sentinel-ews.onrender.com](https://sentinel-ews.onrender.com)

---

## ✨ Key Features

### 📡 Real-Time Radar
- **Live Geospatial Map:** Interactive Leaflet-based map visualizing active threats with dynamic severity markers.
- **WebSocket Uplink:** Instant global broadcasts using Socket.io—new incidents appear on everyone's radar without refreshing.
- **Operator Tracking:** Active GPS tracking to show your location relative to reported disasters.

### 🤖 AI-Powered Intelligence
- **Visual Evidence Verification:** Integrated with **Google Gemini 1.5 Pro** to analyze uploaded images. The AI automatically blocks fake reports if the image doesn't match the disaster description.
- **Automated Severity Assessment:** AI overrides manual severity levels if the reported situation is more (or less) critical than stated.

### 🎙️ Advanced Reporting Tools
- **Voice Uplink Engine:** Hands-free reporting using browser-native Speech Recognition—perfect for high-stress emergency situations.
- **Visual Evidence:** Support for high-resolution photo attachments via Cloudinary integration.

### 📶 Zero-Signal Mode (Offline First)
- **IndexedDB Caching:** If signal is lost, threat reports are securely cached on the device.
- **Auto-Sync:** Reports are automatically broadcasted the moment the device reacquires an internet connection.

### 📧 Emergency Broadcast System
- **Radius-Based Alerts:** When a Level 3+ threat is reported, the system automatically sends email alerts to all registered users within a **5km radius**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **State & Logic:** React 19, TypeScript
- **Mapping:** Leaflet & React-Leaflet
- **Styling:** Tailwind CSS (Custom "Glassmorphism" UI)
- **Icons:** Lucide-React
- **Database (Client):** IndexedDB (via `idb`)

### Backend
- **Runtime:** Node.js (Express)
- **Language:** TypeScript
- **Database:** MongoDB (2dsphere geospatial indexing)
- **AI Integration:** Google Generative AI (Gemini API)
- **Real-time:** Socket.io
- **File Storage:** Cloudinary (via Multer Storage)
- **Auth:** JWT & Passport.js (Google OAuth support)
- **Mailing:** Nodemailer

---

## 📂 Project Structure

```text
sentinel-EWS/
├── client/               # Next.js Frontend
│   ├── src/app           # Dashboard, Login, Register pages
│   ├── src/components    # Map, LocationMarkers, ProtectedRoutes
│   ├── src/context       # Auth Context
│   └── src/lib           # API config & Offline Store
└── server/               # Node.js Backend
    ├── src/controllers   # Incident & Auth logic
    ├── src/models        # Mongoose Schemas (Geospatial)
    ├── src/routes        # Express Routes
    ├── src/utils         # AI Evaluation & Mailer logic
    └── src/middleware    # Visual Evidence & Validation
```

---

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/ParasKhandelwal1616/sentinel-ews.git
cd sentinel-ews
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_ai_key
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
Run the client:
```bash
npm run dev
```

---

## 🛡️ Security Protocols
- **Geospatial Privacy:** User coordinates are used only for calculating blast radius and are never shared with other users.
- **Sanitized Inputs:** All incoming reports are validated via Zod schemas.
- **Protected Access:** Dashboard access requires valid JWT authentication.

---

## 👨‍💻 Author
**Paras Khandelwal**
- GitHub: [@ParasKhandelwal1616](https://github.com/ParasKhandelwal1616)

---
*Developed for the Sentinel Disaster Management Initiative.*
