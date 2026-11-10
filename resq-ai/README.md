# 🚨 RESQ AI – Intelligent Emergency Response & Disaster Management Platform
> **CODE CLASH 2026 | ROUND 2 | ADVANCED MISSION OPERATIONS PLATFORM**  
> *"Every Second Matters. Every Response Counts."*

[![Production Status](https://img.shields.io/badge/Round_2-100%25_Complete-35D9FF?style=for-the-badge)](https://github.com/Vignesh8068/RESQ-AI)
[![Framework](https://img.shields.io/badge/React_18-TypeScript-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Mapping](https://img.shields.io/badge/Leaflet-Haversine_Engine-20C997?style=for-the-badge)](https://leafletjs.com)
[![Offline Version](https://img.shields.io/badge/Standalone_Offline-Zero_Dependency-FF9F43?style=for-the-badge)](public/standalone.html)

---

## 🌟 Executive Overview
**RESQ AI** is an intelligent, mission-critical emergency coordination and disaster response ecosystem. Designed for emergency dispatch commanders, first responders, and citizens in crisis, the platform unites real-time incident intake, explainable AI urgency scoring, geodesic location-based team assignment, and operational analytics into one unified command center.

---

## ⚡ Six Mandatory Round 2 Features Implemented

### 1. Intelligent Incident Prioritization Engine
- **Explainable Multi-Factor Scoring (0–100 pts)**:
  - **Severity Rating (40% weight)**: Critical (40 pts), High (30 pts), Medium (20 pts), Low (10 pts).
  - **Affected Lives Scale (25% weight)**: Mass casualty $\ge 15$ (25 pts), multiple victims $\ge 5$ (18 pts), 1–4 victims (10 pts).
  - **Category Hazard Multiplier (15% weight)**: Chemical fires & building collapse (15 pts), flood & road accidents (12 pts), medical/general (8 pts).
  - **Queue Aging Dynamics (15% weight)**: Unresolved incidents progressively age to prevent critical triage starvation ($>30\text{m} \to +15\text{ pts}$, $>10\text{m} \to +10\text{ pts}$).
  - **Status Modifier (5% weight)**: Unassigned reported incidents receive priority weighting (+5 pts).
- **Classification Tiers**:
  - `Critical Urgency` ($\ge 80$ pts, pulsating crimson beacon)
  - `High Urgency` ($60–79$ pts, warning amber)
  - `Medium Urgency` ($40–59$ pts, alert yellow)
  - `Low Urgency` ($<40$ pts, stabilized emerald)
- **Transparent Rationale**: Every incident displays a human-in-the-loop breakdown of why it received its score and factor contributions.

### 2. Emergency Response Team Management (Full CRUD)
- Comprehensive registry of emergency response units:
  - **Squad Data**: Unique Team ID, Name, Category (`fire`, `medical`, `rescue`, `flood`, `accident`, `general`), GPS Coordinates, Status (`available`, `busy`, `assigned`, `offline`), Current Assignment, and Operational History.
  - **Interactive Management**: Add new squad, edit deployment status/coordinates, decommission squad, search, and filter by status & category.
  - **Operational Record**: Detailed dispatch history, missions completed, average response duration, and timestamped audit log.

### 3. Intelligent Location-Based Team Assignment (Haversine Engine)
- **Geodesic Distance Computation**:
  Uses the spherical Haversine formula with true Earth radius $R = 6,371\text{ km}$:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cos\phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- **Multi-Hazard Compatibility Matrix**:
  Filters squads by operational capability before calculating distance (e.g., Flood units prioritize water rescues, ALS ambulances prioritize vehicular trauma, NDRF squads prioritize structural collapses).
- **Automated Squad Recommendation**:
  Ranks eligible units by geodesic proximity, explains compatibility rationale, checks for squad availability, and prevents double-booking active squads.
- *Dispatcher Transparency Disclaimer*: Geodesic straight-line distance is clearly noted to differentiate from street road routing.

### 4. Assignment & Incident Lifecycle Tracking
- **Four-Stage State Machine**:
  $$\text{REPORTED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{IN PROGRESS} \longrightarrow \text{RESOLVED}$$
- **Automatic Resource Freeing**:
  When an incident transitions to `RESOLVED`, the assigned emergency squad is **automatically freed** back to `AVAILABLE`, and an operational mission record with exact duration is appended to its history.
- **Dynamic Real-Time Timestamps**:
  Calculates actual Response Time ($T_{\text{dispatch}} - T_{\text{reported}}$) and Resolution Time ($T_{\text{resolved}} - T_{\text{reported}}$) dynamically from verified timestamps.

### 5. Route & Dual-Mode Location Visualization
- **Live OpenStreetMap / Leaflet Mode**: High-definition interactive map with pulsating critical beacons, squad markers, and geodesic route vectors.
- **Offline Tactical Schematic Vector Map**: 100% SVG-based interactive radar grid with coordinate projection, animated route drawing, and entity popups. Operates seamlessly without external map tiles.

### 6. Advanced Analytics & Operational Telemetry
- **Squad Utilization Rate**: Dynamic calculation of deployed squads vs available readiness.
- **Average Response & Resolution Times**: Aggregated from actual incident timestamps (no fabricated statistics).
- **Multi-Dimension Visualizations**: Category distribution pie chart, AI urgency tier breakdown, hourly incident activity curves.
- **Audit CSV Export**: One-click download of all incident records, timestamps, and priority scores.

---

## 🎨 World-Class UI/UX & Motion System

- **Mission Operations Theme**: Midnight Navy (`#080F1E`), Electric Cyan (`#35D9FF`), Emergency Red (`#FF4057`), Warning Amber (`#FF9F43`), Success Green (`#20C997`).
- **Tactical Desktop Cursor (`CustomCursor.tsx`)**: Responsive follower dot with spring physics, magnetic scaling on buttons, and dynamic color adaptation over critical alerts.
- **Atmospheric Background (`CommandCenterBackground.tsx`)**: High-performance GPU-accelerated tactical grid, ambient radial glows, and floating operational particles.
- **RESQ Intelligence Assistant (`ResqAssistantPanel.tsx`)**: Slide-in AI copilot with quick prompts (Explain Priority, Squad Readiness, Situation Brief) supporting Google Gemini 1.5 Flash with explainable heuristic fallback.

---

## 💾 Standalone Offline Single-File Version

For emergency situations with **zero internet or node environment**, open:
```
public/standalone.html
```
- Completely self-contained single-file HTML deliverable with embedded CSS styling, SVG vector tactical grid map, prioritization engine, Haversine dispatch logic, and audio/visual emergency beacons.
- Can be double-clicked and run immediately in any web browser without npm, server, or internet connection.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js LTS (v18+) & npm

### 1. Installation
```bash
cd resq-ai
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open `http://localhost:5173`.

### 3. Build & Typecheck
```bash
npm run build
npm run preview
```

---

## 🎮 Demo Credentials (Instant Access)

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Administrator / Dispatcher** | `admin@resqai.demo` | `admin123` | Command Center, Priority Queue, Smart Haversine Dispatch, Squad Management, Analytics |
| **Citizen** | `citizen@resqai.demo` | `citizen123` | SOS Reporting, GPS Location Detection, Voice Input, Incident History |

---

## 🏆 Judges' 2-Minute Presentation Pitch Script

> **Commander & Judges**, welcome to **RESQ AI**.
>
> In an emergency, every second saved saves a life. Traditional dispatch systems rely on chaotic phone calls and manual guesswork. RESQ AI solves this with our **Intelligent Emergency Response Ecosystem**.
>
> 1. **Prioritization (Feature 1)**: When an emergency is reported, our transparent AI scoring engine computes an Explainable Priority Score from 0 to 100 based on severity, affected lives, hazard escalating factors, and queue aging.
> 2. **Location Intelligence (Feature 3)**: Our Geodesic Haversine Engine analyzes all response units across the sector, filters them for multi-hazard compatibility, and identifies the exact nearest available squad with geodesic distance down to two decimal places.
> 3. **Dispatcher Confirmation (Feature 4)**: With one click, the dispatcher confirms the mission. The squad locks into `BUSY`, the route illuminates on the tactical map, and the status advances to `ASSIGNED`.
> 4. **Automated Lifecycle (Feature 4 & 2)**: When the incident is marked `RESOLVED`, the system automatically releases the squad back to `AVAILABLE`, updates the squad's mission history, and recalculates real-time utilization rates and resolution intervals.
> 5. **Offline Resiliency (Feature 5)**: If disaster destroys external network infrastructure, RESQ AI seamlessly falls back to our Offline Tactical Vector Map and Standalone Single-File Dashboard (`public/standalone.html`).
>
> **RESQ AI: Every Second Matters. Every Response Counts.**
