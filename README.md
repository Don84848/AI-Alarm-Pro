# Clock App Pro ⏰

An open-source, human-first clock and smart alarm app for Android and the web. 

Most alarm apps today are overloaded with subscription paywalls, loud video ads, or complicated menus. We built **Clock App Pro** to be simple, reliable, and genuinely helpful in daily life—giving you the clean feel of a stock mobile clock, combined with smart scheduling that takes the stress out of morning routines.

---

## 💡 How This App Helps People Every Day

We built this app specifically to solve real, frustrating everyday problems that traditional alarm clocks ignore:

### ✈️ 1. Stress-Free Travel & Commute Planning
Setting early morning alarms for flights, trains, or important meetings usually means doing anxious mental math late at night:
> *"My flight leaves at 6:30 AM. I need 2 hours for security, 45 minutes to drive, and 30 minutes to get dressed... what time should I set my alarm?"*

A single late-night calculation mistake can mean a missed flight. With Clock App Pro, you just say or type:
`"My flight is at 6:30 AM tomorrow. Calculate 2 hours airport check-in and 45 minutes drive, with prep time."`
The app figures out the exact schedule, builds in your buffer, and sets the alarm automatically.

---

### 🎓 2. Lifesaver for Students & Shift Workers
Medical staff, factory shift workers, and college students often have rotating rosters and irregular exam datesheets. Manually creating 10+ different alarms across changing weekdays is tedious and easy to mess up.
- **Snap & Schedule**: Take a photo or screenshot of your class timetable, duty roster, or exam schedule. The app reads the timings and schedules your entire week's alarms in one tap.

---

### 🌅 3. Peaceful Wake-Ups for Heavy Sleepers
Waking up shouldn't give you a heart attack or let you accidentally fall back asleep:
- **Gradual Volume Ramp-Up**: Instead of blaring at 100% volume and spiking your morning cortisol, the alarm can start gently at 15% volume and smoothly ramp up over 20 seconds.
- **Wake-Up Math Challenge**: If you have a habit of turning off alarms while half-asleep, turn on the Math Mission. You have to solve a simple arithmetic problem before the sound shuts off, ensuring your brain is genuinely awake.
- **Auto-Silence Protection**: If you ever leave your phone in another room or forget it, the alarm automatically silences after your chosen time (e.g. 10 minutes) so it doesn't disturb housemates or drain your battery.

---

### 💧 4. Health, Medication & Hydration Discipline
Building healthy daily habits shouldn't require complex habit trackers:
- Easily create repeating interval reminders: `"Remind me to drink water every 2 hours from 9 AM to 7 PM"` or `"Set recurring alerts for my medication at 8 AM, 2 PM, and 8 PM"`.

---

### 🛡️ 5. Zero Ads, Zero Subscriptions, 100% Private
We believe a clock is an essential utility, not a billboard.
- **No pop-up ads or paywalls**: Everything is completely free and open-source under the MIT License.
- **Local & Private**: All your alarms, presets, and personal schedules are saved strictly on your own device. Nothing is sent to third-party tracking servers.

---

## 📲 Download the Android App

Get the ready-to-install Android APK directly from GitHub Releases:

👉 **[Download AI-Alarm-Pro.apk (v1.0.0)](https://github.com/Don84848/AI-Alarm-Pro/releases/latest)**

*Installation note: Download the `.apk` file on your phone, open it, and tap "Install" (allow unknown sources if prompted by your browser).*

---

## 🌟 App Features

- **Analog Clock & Alarms**: A clean analog clock face with ticking seconds, minimal alarm rows, and smooth ColorOS-style green toggle switches.
- **Smooth Drum-Roll Time Picker**: Set manual alarms smoothly by swiping your finger or mouse wheel across Hours, Minutes, and AM/PM. No typing needed.
- **Countdown Timer with Presets**: 3-column scroll picker with one-tap preset tiles (Meeting 20m, Sleep 10m, Exercise 15m) and custom preset saving.
- **Precision Stopwatch**: Analog stopwatch dial with rotating needle, large green millisecond digital readout, and lap split recording.
- **Customizable Settings**:
  - Auto-silence duration (5, 10, 15, 20, 30 mins)
  - Customizable snooze length (5, 10, 15, 20 mins)
  - Alarm volume slider with instant audio preview
  - Gradually increase volume toggle
  - Start week on Sunday, Monday, or Saturday (adjusts repeat day pills)
  - Timer sound picker (Radar, Gentle Bell, Zen Chime, Fanfare, Cyber)
  - 12-hour vs 24-hour time display
- **Built-in Audio Synthesizer**: Uses browser Web Audio synthesis to generate crisp, reliable ringtones on any device without missing audio assets.

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js (v18 or v20 recommended)
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Don84848/AI-Alarm-Pro.git
cd AI-Alarm-Pro

# Install dependencies
npm install

# Run local development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 📦 Building the Android APK

This project uses [Capacitor](https://capacitorjs.com/) to package the web code into a native Android app.

```bash
# 1. Build web production bundle
npm run build

# 2. Sync web assets to native Android project
npx cap sync android

# 3. Compile debug APK
cd android
./gradlew assembleDebug
```
The output APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.

Every push to the `main` branch automatically triggers our GitHub Actions CI/CD workflow to compile and publish the latest APK release.

---

## 🛠️ Tech Stack

- **UI & Logic**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Native Android Wrapper**: Capacitor 7
- **Sound Engine**: Web Audio API (real-time waveform synthesis)
- **Bundler**: Vite 6

---

## 🤝 Contributing

We welcome community feedback, feature requests, and pull requests! Whether you want to improve accessibility, translate to more languages, or optimize performance:

1. Fork the repository
2. Create your branch (`git checkout -b feature/my-new-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to your branch (`git push origin feature/my-new-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
