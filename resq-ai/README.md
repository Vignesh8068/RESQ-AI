# 🚨 RESQ AI – Intelligent Emergency Response & Disaster Management Platform
> **Code Clash 2026 | Emergency Response & Disaster Management Track**  
> *"One Platform. Faster Response. Safer Lives."*

---

## 🌟 Executive Overview
**RESQ AI** is an emergency response command and disaster coordination platform. It centralizes citizen disaster reporting, automates real-time AI incident classification & risk assessment, and empowers emergency operation administrators to allocate response assets with military-grade precision.

---

## 🏗️ Technical Architecture & Tech Stack

- **Frontend Core**: React 18 (Vite, TypeScript)
- **Styling & Design System**: Tailwind CSS (Glassmorphism, custom glowing badges, Midnight Navy `#080F1E`, Electric Cyan `#35D9FF`, Emergency Red `#FF4057`)
- **Motion & Dynamics**: Framer Motion (page transitions, micro-interactions, pulsating incident markers)
- **Geospatial Mapping**: Leaflet & OpenStreetMap (live geolocation markers, critical pulse effects, popups)
- **Data Visualizations**: Recharts (category breakdowns, severity distributions, response trendlines)
- **Intelligence Layer**:
  - **Google Gemini 1.5 Flash API** for real-time generative emergency triage and action recommendation
  - **Transparent Rule-Based Heuristic Engine** as an automated fallback when API keys are not configured
- **Data & Synchronization**:
  - PostgreSQL & Supabase Realtime schema with Row Level Security (RLS)
  - Browser LocalStorage persistent state for local demo mode
  - Service Worker for offline-first emergency reporting (`/sw.js`)
- **Speech Recognition**: Browser Web Speech API for hands-free voice incident reporting in English and Tamil.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js LTS (v18+) & npm

### 1. Installation
```bash
# Navigate to the project root
cd resq-ai

# Install dependencies
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🎮 Demo Credentials (Instant Access)

The platform comes pre-loaded with comprehensive demo datasets and one-click demo credentials:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Administrator** | `admin@resqai.demo` | `admin123` | Full Command Center, Incident Verification, Resource Dispatch, Analytics, AI Copilot |
| **Citizen** | `citizen@resqai.demo` | `citizen123` | SOS Reporting, GPS Location Detection, Voice Input, Incident History |

---

## ⚡ Special Hackathon Wow Feature: 2-Minute Live Rescue Simulation
In the top navigation bar of the application, click **"2-Min Live Simulation"** to trigger an automated 12-step rescue scenario:
1. Citizen discovers a multi-vehicle accident on the NH-48 corridor.
2. Citizen files an SOS report with GPS coordinates and victim count.
3. RESQ Intelligence triages the incident, extracting risk keywords and assigning **CRITICAL** severity.
4. Admin Command Center receives an instant broadcast.
5. High-visibility Code Red pulsating notification triggers.
6. Incident is automatically rendered on the interactive Leaflet map.
7. Admin verifies the report with a single click.
8. Fire & Rescue Unit Alpha is assigned and dispatched.
9. Incident transitions to **In Progress**.
10. Victims rescued and transported; admin marks incident **Resolved**.
11. Real-time metrics and charts immediately update.
12. Full timestamped audit trail generated.

---

## 🔌 External Integrations Configuration

### 1. Google Gemini 1.5 Flash API
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. In `.env`, set:
   ```env
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key
   ```
3. The platform will automatically detect the key and switch from **Rule-Based Fallback** to **Gemini 1.5 Flash** in the AI Copilot and Report analysis.

### 2. Supabase Integration
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and paste the contents of `supabase/schema.sql` and `supabase/seed.sql`.
3. In `.env`, set:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📁 Project Directory Structure
```
resq-ai/
├── public/
│   ├── favicon.svg             # Custom glowing RESQ AI vector icon
│   └── sw.js                   # Offline service worker cache & sync
├── src/
│   ├── animations/             # Motion graphics & animation variants
│   ├── components/             # Reusable UI components & modals
│   │   └── InteractiveDemo.tsx # 12-step live demonstration engine
│   ├── context/
│   │   └── AppContext.tsx      # Global state, persistence & demo accounts
│   ├── layouts/
│   │   └── AppLayout.tsx       # Command Center layout & responsive navigation
│   ├── lib/
│   │   ├── demoData.ts         # Preloaded Chennai incidents & rule-based triage
│   │   └── supabase.ts         # Supabase client connector
│   ├── pages/
│   │   ├── LandingPage.tsx     # Cinematic animated landing page with hero counters
│   │   ├── LoginPage.tsx       # Authentication with one-click demo logins
│   │   ├── RegisterPage.tsx    # Citizen registration
│   │   ├── CitizenDashboard.tsx# Citizen home with quick SOS triggers
│   │   ├── ReportEmergency.tsx # Multi-step reporting with voice, GPS & image upload
│   │   ├── MyReports.tsx       # Citizen submitted reports tracking
│   │   ├── AdminDashboard.tsx  # Admin Command Center operations dashboard
│   │   ├── IncidentManagement.tsx # Full CRUD, search, filter & verification modal
│   │   ├── LiveMap.tsx         # OpenStreetMap interactive Leaflet map
│   │   ├── AICopilot.tsx       # RESQ Intelligence emergency copilot
│   │   ├── ResourceManagement.tsx # Squad management & vehicle allocation
│   │   ├── NotificationsPage.tsx # Severity-tiered alert notifications
│   │   ├── AnalyticsPage.tsx   # Recharts incident analytics & CSV export
│   │   └── SettingsPage.tsx    # Language switcher (EN/Tamil) & theme settings
│   ├── services/
│   │   └── geminiService.ts    # Secure Gemini 1.5 Flash client with fallback
│   ├── styles/
│   │   └── globals.css         # Glassmorphism, glow utilities & dark theme
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & domain models
│   ├── utils/
│   │   └── constants.ts        # Category tags, colors, Tamil translations
│   ├── App.tsx                 # Route declarations & role-based guards
│   ├── main.tsx                # Entry point & PWA service worker registration
│   └── vite-env.d.ts           # Environment variable definitions
├── supabase/
│   ├── schema.sql              # PostgreSQL DDL with RLS & indexes
│   └── seed.sql                # Emergency squad seed records
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🎤 Hackathon 2-Minute Presentation Pitch Script

> **"Judges, ladies and gentlemen, welcome to RESQ AI.**
>
> In an emergency, fragmented communication costs lives. Citizens struggle to describe disasters under panic, while dispatchers lose critical minutes manually classifying priority and routing crews.
>
> **RESQ AI** bridges this gap through **One Platform. Faster Response. Safer Lives.**
>
> 1. **Zero-Friction Citizen Reporting**: A citizen reporting an incident on NH-48 doesn't even need to type. With one tap, our platform captures precise GPS coordinates, accepts voice reporting in English or Tamil, and receives live photo evidence.
> 2. **RESQ Intelligence AI**: The moment an incident is submitted, our AI triages the description, flags life hazards such as trapped passengers, and classifies the severity into a military-grade triage matrix.
> 3. **Live Operational Command Center**: Administrators instantly receive an alert on our live map. Within seconds, the admin verifies the incident and dispatches the closest available rescue squad.
> 4. **Resilience & Accessibility**: Designed for real disaster conditions, RESQ AI functions offline via Service Workers and supports bilingual English and Tamil interfaces.
>
> RESQ AI delivers the speed, clarity, and intelligence our first responders deserve. Thank you."
