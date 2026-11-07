# Clock App Pro ⏰

An open source, clean clock and smart alarm app for Android and the web. Built with React, TypeScript, Tailwind CSS, and Capacitor.

Designed to feel like a native stock mobile clock: minimalist white interface, real-time analog clock dial, smooth drum-roll time picker, countdown timer with presets, precision stopwatch, and optional natural language smart scheduling.

---

## Download APK

Download the latest ready-to-install Android build directly from GitHub Releases:

👉 **[Download AI-Alarm-Pro.apk (v1.0.0)](https://github.com/Don84848/AI-Alarm-Pro/releases/latest)**

*To install on Android: Open the downloaded APK file and confirm installation.*

---

## Features

- **Analog Clock & Alarms**: Real-time ticking analog clock face with clean alarm list and instant toggle switches.
- **Smooth Drum Time Picker**: Scroll hours, minutes, and AM/PM with your finger or mouse wheel. No keyboard typing needed.
- **Countdown Timer**: Scroll drum duration picker with quick presets (Meeting 20m, Sleep 10m, Exercise 15m) and custom additions.
- **Precision Stopwatch**: Analog stopwatch dial with millisecond digital readout and lap history tracking.
- **Smart Alarm Scheduling**: Optional AI assistant that parses plain English routines (e.g. *"Flight at 4:30 AM, calculate 2 hours airport check-in and 45 min drive"*) or scans timetable photos.
- **Synthesized Ringtones**: Built-in Web Audio synthesis (Gentle Bell, Radar, Zen Chime, Upbeat Fanfare) so alarms ring reliably without external MP3 dependencies.
- **Privacy First**: All alarms, presets, and settings stay on your device in local storage.

---

## Screenshots

The app features a minimalist light theme matching stock Android clock interfaces:
- **Alarm**: Real-time analog clock, alarms list, green plus action button.
- **Timer**: 3-column scroll drum picker, preset cards, play and reset controls.
- **Stopwatch**: Clean needle dial, large digital display, lap splits table.
- **Settings**: Alarm volume slider, silence duration, snooze length, and optional AI configuration.

---

## Getting Started

### Prerequisites

- Node.js 18 or 20
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Don84848/AI-Alarm-Pro.git
cd AI-Alarm-Pro

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Building the Android APK

This project uses [Capacitor](https://capacitorjs.com/) for native Android packaging.

```bash
# 1. Build the web app
npm run build

# 2. Sync web assets with Capacitor Android
npx cap sync android

# 3. Build debug APK using Gradle (or open in Android Studio)
cd android
./gradlew assembleDebug
```

The compiled APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

Pushes to the `main` branch also build and publish the APK automatically via GitHub Actions.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Mobile Container**: Capacitor 7 (Android)
- **Audio**: Web Audio API Synthesizer
- **Build Tool**: Vite 6

---

## Contributing

Contributions are welcome! If you have suggestions or bug fixes, feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
