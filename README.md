# Clock App Pro ⏰

An open-source, ad-free smart clock and alarm app for Android and the web. Built to replace bloated, subscription-gated alarm apps with a clean stock aesthetic, smart scheduling, and 100% local privacy.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Download APK](https://img.shields.io/badge/Download-Android%20APK-00B074.svg)](https://github.com/Don84848/AI-Alarm-Pro/releases/latest)

---

## 📲 Download Android APK

👉 **[Download AI-Alarm-Pro.apk (Latest Release)](https://github.com/Don84848/AI-Alarm-Pro/releases/latest)**

*Direct installation: Download the `.apk` on your phone, open it, and tap Install.*

---

## ⚡ Why Clock App Pro?

Commercial alarm apps lock basic settings behind subscriptions, force-feed ads when you're half-awake, and spike your morning cortisol with blaring sirens. Clock App Pro solves this:

- ✈️ **Smart Travel Buffers**: Tell it `"Flight at 6:30 AM, calculate 2h airport check-in and 45m drive"`—the app reverse-calculates transit margins and sets alarms automatically.
- 📸 **Snap & Schedule**: Snap a photo or screenshot of your class timetable, exam datesheet, or shift roster to generate your entire week's alarms in one tap.
- 🌅 **Gentle Wake-Ups**: Volume ramps up smoothly from 15% to 100% over 20 seconds to wake you without morning heart palpitations or anxiety.
- 🧠 **Math Mission**: Solve an arithmetic challenge before the sound shuts off to prevent falling back asleep.
- 🛡️ **Zero Ads, Zero Subscriptions, 100% Private**: No trackers, no recurring paywalls, and all data stays strictly on your device.

---

## ✨ Key Features

- **Stock Minimalist Interface**: Pure white theme, ticking analog dial, and smooth green toggle switches.
- **Inertial Drum Time Picker**: Swipe smoothly across Hours, Minutes, and AM/PM with your finger or mouse wheel.
- **Timer with Presets**: 3-column scroll drum with quick one-tap tiles (Meeting, Sleep, Exercise) and custom timers.
- **Precision Stopwatch**: Analog needle dial, millisecond digital readout, and lap split recording.
- **Granular Settings**: Configurable auto-silence, customizable snooze, volume slider with live sound preview, start week on Sunday/Monday, and built-in synthesized ringtones.

---

## 🚀 Quick Start (Developers)

```bash
# Clone and run
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
*Output APK: `android/app/build/outputs/apk/debug/app-debug.apk`.*

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
