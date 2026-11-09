# AI Alarm Pro

An open-source, ad-free smart clock and alarm app for Android and the web. Built with a clean stock interface, intelligent scheduling, and offline privacy.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Download APK](https://img.shields.io/badge/Download-Android%20APK-00B074.svg)](https://github.com/Don84848/AI-Alarm-Pro/releases/latest)

---

## Download Android APK

[Download AI-Alarm-Pro.apk (Latest Release)](https://github.com/Don84848/AI-Alarm-Pro/releases/latest)

Direct installation: download the APK file on your Android device, open it, and tap Install.

---

## Why AI Alarm Pro

Most commercial alarm apps require subscriptions or show full-screen ads. AI Alarm Pro keeps it simple:

- **Smart Travel Buffers:** Enter event times (like flights or meetings) and commute duration to automatically set early wake-up alarms.
- **Roster and Schedule Import:** Snap a photo of your schedule or timetable to automatically set your weekly alarms.
- **Gentle Volume Ramp:** Volume gradually increases from 15% to 100% over 20 seconds.
- **Math Missions:** Optional arithmetic puzzles before the alarm shuts off.
- **Offline and Private:** No ads, no telemetry, and all data stays strictly on your device.

---

## Key Features

- Clean minimalist stock interface
- Smooth time drum picker for hours, minutes, and AM/PM
- Timer with quick presets (work, nap, exercise)
- Millisecond precision stopwatch with lap times
- Fully customizable snooze, auto-silence, and ringtones

---

## Quick Start for Developers

```bash
git clone https://github.com/Don84848/AI-Alarm-Pro.git
cd AI-Alarm-Pro
npm install
npm run dev
```

### Build Android APK
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```
Output APK is generated in `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.