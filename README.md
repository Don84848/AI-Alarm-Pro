# ⏰ AI Alarm Pro - Smart AI Wake & Schedule Assistant

[![Release](https://img.shields.io/github/v/release/Don84848/AI-Alarm-Pro?color=cyan&label=Latest%20APK)](https://github.com/Don84848/AI-Alarm-Pro/releases/latest)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web%20PWA-violet)](https://github.com/Don84848/AI-Alarm-Pro)
[![Built with](https://img.shields.io/badge/Built%20with-React%2018%20%2B%20TypeScript-blue)](https://react.dev/)
[![Powered by](https://img.shields.io/badge/AI%20Engine-Gemini%202.5%20Flash-emerald)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

An ultra-modern, legitimate mobile alarm clock application built with a high-fidelity dark UI, powered by **Google Gemini 2.5 Flash** and an intelligent offline reasoning engine. Tell the AI when and why you need to wake up via **Voice**, **Natural Language Text**, or by **Uploading a Timetable/Schedule**, and the AI calculates all travel, preparation, and sleep buffers automatically.

---

## 📲 Download & Install Android APK

Get the ready-to-install Android APK directly from the official release:

👉 **[Download AI-Alarm-Pro.apk (Latest v1.0.0)](https://github.com/Don84848/AI-Alarm-Pro/releases/download/v1.0.0/AI-Alarm-Pro.apk)**

*To install on your Android device: Download the `.apk` file, tap it to install, and allow "Install from Unknown Sources" if prompted by your browser.*

---

## 🌟 Key Features

### 1. 📱 Smooth & Legit Mobile UI
* **Design Aesthetic:** Crafted with the elegance of modern iOS 18 and Samsung One UI 6 clock apps.
* **Live Digital Hero Clock:** Real-time digital clock with pulsing seconds and active calendar date.
* **Next Alarm Countdown Ticker:** Displays an exact live countdown to your next upcoming alarm (e.g., *"Alarm in 6h 24m • 06:30 AM"*).
* **Spring-Animated Toggle Switches:** Fast, responsive switches for toggling alarms on/off with day-of-week repeat pills (**S M T W T F S**).
* **Wake-Up Missions (Guaranteed Awake):** Optional math challenges (e.g. solve `38 + 17 = ?`) that must be solved before the alarm can be dismissed!

### 2. 🧠 Set Alarm with AI
* **🎙️ Voice Commands:** Speak naturally via microphone with live soundwave animation and instant transcription.
* **✍️ Natural Language Processing:** Freeform text input that automatically calculates time buffers:
  * *Flight & Travel:* `"My flight is at 4:30 AM, calculate 2 hours airport check-in and 45 min commute"` $\rightarrow$ Alarm scheduled for **1:45 AM** with full reasoning explained!
  * *Prayer & Twilight:* `"Wake me up 30 minutes before sunrise"` or `"Fajr prayer with 20 min preparation buffer"`.
  * *Hydration & Health:* `"Remind me every 2 hours between 9 AM and 7 PM to drink water"` $\rightarrow$ Generates all interval alarms instantly.
  * *Exams & Classes:* `"Final exam starts at 9:00 AM, wake me up 1.5 hours prior"`.
* **📄 Upload Schedule / Timetable:** Upload an image of an airline ticket, university exam date sheet, or shift roster. The AI scans and bulk-schedules all your alarms. Includes 1-click preset sample schedules for instant testing!
* **⚡ Multi-Tier AI Architecture:** Powered by **Google Gemini 2.5 Flash** (sub-400ms latency), with automatic fallback to **Gemini Flash Latest**, **Gemini Pro Latest**, and a local offline deep reasoning engine.

### 3. 🔊 Pure Web Audio Synthesizer Engine
Generates authentic alarm ringtones directly using the browser's Web Audio API—guaranteeing 100% reliable audio playback without missing sound files:
* 🌅 **Gentle Sunrise:** Soothing marimba acoustic chords.
* 📡 **Sonar Radar:** Classic high-attention alert ping.
* ⚡ **Cyberpunk Pulse:** High-tech synthesized arpeggio.
* 🧘 **Tibetan Zen Bowl:** Calming singing bowl resonance.
* 🐓 **High Energy Fanfare:** Energetic morning wake-up alert.
* 🎙️ **AI Voice Morning Briefing:** Plays a chime followed by a personalized speech synthesis briefing greeting you by name and reading your routine!

### 4. 👤 Profile & Sleep Health Settings
* User avatar and customizable display name.
* Sleep target calculator (e.g., 8-hour target, bedtime reminder).
* Integrated Gemini API key configuration and live AI model selector.
* Master volume slider and instant ringtone test controls.

---

## 🚀 Running Locally

### 1. Web / Mobile Preview
Clone the repository and run the local development server:
```bash
git clone https://github.com/Don84848/AI-Alarm-Pro.git
cd AI-Alarm-Pro
npm install
npm run dev
```

* **On PC:** Open `http://localhost:3000`
* **On Mobile (Connected to same Wi-Fi):** Open `http://<your-ip-address>:3000`
* **Install as PWA:** Tap the 3-dots menu in Chrome mobile $\rightarrow$ select **"Add to Home Screen"** or **"Install App"** to run full-screen like a native app.

---

## 🛠️ Building the Android APK

This project uses **Capacitor 7** for native Android compilation.

### Automatic GitHub Actions Build
Every push to the `main` branch automatically triggers GitHub Actions to compile `AI-Alarm-Pro.apk` using Java JDK 21 and the Android SDK, publishing the APK under [Releases](https://github.com/Don84848/AI-Alarm-Pro/releases).

### Local Android Build
```bash
# 1. Build web production bundle
npm run build

# 2. Sync web assets with Capacitor Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```
Alternatively, on Windows, simply double-click **`build-apk.bat`**.

---

## 🗂️ Project Structure

```
AI-Alarm-Pro/
├── .github/workflows/       # GitHub Actions automated APK build & release
├── android/                 # Native Android Capacitor project & manifest
├── public/                  # Static assets, SVG app icon, manifest.json
├── src/
│   ├── components/
│   │   ├── AddEditAlarmModal.tsx     # Manual alarm time & mission picker
│   │   ├── AiAlarmBanner.tsx         # Centerpiece AI alarm prompt card
│   │   ├── AlarmCard.tsx             # Interactive alarm card with toggle
│   │   ├── AlarmRingingScreen.tsx    # Full-screen alarm ringing & math puzzle
│   │   ├── Header.tsx                # Profile avatar & greeting header
│   │   ├── NextAlarmHero.tsx         # Glowing digital clock & next alarm ticker
│   │   ├── ProfileModal.tsx          # Settings, API key & model selector
│   │   ├── ScheduleUploadModal.tsx   # Timetable / image upload & OCR parser
│   │   └── VoiceRecorderModal.tsx    # Real-time microphone speech recognition
│   ├── types/               # TypeScript interfaces & definitions
│   ├── utils/
│   │   ├── aiEngine.ts      # Multi-model Gemini 2.5 Flash + offline reasoning
│   │   ├── audio.ts         # Pure Web Audio synthesizer & speech briefing
│   │   ├── storage.ts       # LocalStorage auto-persistence
│   │   └── timeUtils.ts     # Time formatting, calculation & next alarm diff
│   ├── App.tsx              # Main mobile container & background alarm loop
│   └── main.tsx             # Application root
├── capacitor.config.json    # Capacitor configuration
├── package.json             # Project dependencies & scripts
├── tailwind.config.js       # Modern Tailwind dark theme configuration
└── vite.config.ts           # Vite build & development server config
```

---

## 💻 Tech Stack

* **Framework:** React 18, TypeScript, Vite
* **Styling & Icons:** Tailwind CSS, Lucide React, Canvas Confetti
* **Audio & Speech:** Web Audio API (Synthesizer), Web Speech API (Voice Recognition & Synthesis)
* **AI Engine:** Google Gemini 2.5 Flash / Gemini Flash Latest / Gemini Pro Latest + Local NLP Engine
* **Native Mobile:** Capacitor 7 (Android Native Project) + PWA Standalone Manifest

---

## 📄 License

This project is licensed under the MIT License - feel free to use and modify for personal or commercial projects.
