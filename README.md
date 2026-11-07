# Clock App Pro ⏰

> **Warning: Do not install this app if you are comfortable waking up exhausted, hitting snooze four times, and running out the door in a panic.**

If you enjoy frantic 1:00 AM mental math before an early morning flight, or love having your half-asleep screen hijacked by loud casino video ads and \$4.99/month subscription paywalls, **stick to your default alarm clock.**

---

## 🧠 The Uncomfortable Truth About Alarm Apps
### *(Why Most People Are Kept Chronically Exhausted)*

The multi-billion-dollar app ecosystem relies on a dark behavioral pattern: **monetizing your vulnerability.**

When you wake up, your prefrontal cortex suffers from *sleep inertia* for 15 to 30 minutes. You are literally incapable of optimal critical thinking. Traditional commercial alarm apps exploit this exact biological weakness:

1. **They spike your morning cortisol**: Blaring at 100% maximum volume instantly triggers your primal fight-or-flight nervous system. You start your day with an adrenaline rush and chronic anxiety.
2. **They hijack your morning attention**: Once you frantically pick up the phone, they force-feed you fullscreen interactive ads or lock your alarm volume behind a monthly paywall.
3. **They monetize your excuses**: They make snoozing frictionless, knowing that the more disorganized your schedule is, the more times you will open their ad-stuffed app.

We built **Clock App Pro** as the antidote. It is a completely free, ad-free, open-source tool engineered to give you unfair leverage over your mornings.

---

## ⚡ How Clock App Pro Solves What You Secretly Struggle With

### ✈️ 1. The Costly "Late-Night Math" Trap
Late at night, your exhausted brain makes stupid mistakes. You calculate:
> *"My flight leaves at 6:30 AM. Need 2 hours at the terminal, 45 minutes on the road, 30 minutes to pack... so alarm at 4:15? Or was it 3:45?"*

One single calculation slip can cost you an \$800 missed flight, a canceled holiday, or a blown interview.
- **The Psychological Antidote**: Offload the cognitive burden completely. Tell the smart scheduler:  
  `"My flight is at 6:30 AM tomorrow. Calculate 2 hours airport check-in and 45 minutes drive, with prep time."`  
  It reverse-calculates the exact buffer, accounts for transit margin, and sets the alarm with zero mental friction.

---

### 🎓 2. Erasing Routine Fatigue (Shift Workers, Doctors & Students)
Rotating hospital shifts, factory rosters, and chaotic college exam timetables force you to spend 15 minutes every Sunday manually setting 12 different alarms across 7 days. You get lazy, miss one, and wake up to 5 missed calls from your supervisor.
- **The Psychological Antidote**: **Snap & Schedule**. Take a photo or screenshot of your physical paper roster or college portal. The app reads the timings and constructs your entire week's schedule in one second. You never have to manually input times again.

---

### 🌅 3. Stop Your Half-Asleep Brain From Self-Sabotage
Your subconscious mind will do whatever it takes to stay warm under the blanket—including turning off alarms without you ever remembering doing it.
- **Gradual Volume Ramp-Up**: Starts at a whisper (15% volume) and gently scales to 100% over 20 seconds. Wakes your conscious mind up smoothly without triggering cortisol spikes or morning heart palpitations.
- **Math Wake-Up Challenge**: Want to turn off the sound? Solve an arithmetic problem. It forces blood flow back into your prefrontal cortex, completely killing the groggy urge to roll over.
- **Auto-Silence Safety Net**: Left your phone in the kitchen or guest room? The alarm automatically silences after your chosen limit (e.g. 10 minutes) so your battery isn't drained and your housemates aren't tortured.

---

### 💧 4. Habit Discipline Made Automatic
Habit formation fails when there is friction. If you have to download yet another bloated habit tracker just to remember water or pills, you'll abandon it in 48 hours.
- Set complex recurring intervals instantly: `"Remind me to drink water every 2 hours from 9 AM to 7 PM"` or `"Alert me for medication at 8 AM, 2 PM, and 8 PM daily"`. Done.

---

### 🛡️ 5. Zero Ads, Zero Subscriptions, 100% Private Sovereignty
You are not a product. Your morning routine is not an advertising impression.
- **No Subscriptions**: No "Pro tiers", no paywalls, no recurring credit card charges.
- **No Trackers**: Everything runs directly on your device. Your wake-up habits, work rosters, and routines never leave your hardware.
- **100% Open Source**: Licensed under the permissive MIT License. Inspect the source code yourself.

---

## 📲 Download the Android App

Ready to take control of your time? Download the clean, standalone Android APK:

👉 **[Download AI-Alarm-Pro.apk (v1.0.0)](https://github.com/Don84848/AI-Alarm-Pro/releases/latest)**

*Installation note: Open the downloaded `.apk` file on your Android device and tap "Install" (enable "Install unknown apps" in browser settings if prompted).*

---

## 🌟 Features at a Glance

- **Minimalist Analog Clock**: Real-time ticking second hand with clean alarm list and ColorOS-inspired green switches.
- **Inertial Smooth Drum Time Picker**: Set alarms effortlessly by scrolling hours, minutes, and AM/PM with your finger or mouse wheel. No manual keyboard typing.
- **Countdown Timer with Presets**: 3-column scroll drum with quick one-tap presets (Meeting 20m, Sleep 10m, Exercise 15m) and custom preset saving.
- **Precision Stopwatch**: Needle dial, high-precision millisecond readout, and lap split recording.
- **Full Settings Suite**:
  - Auto-silence interval (5, 10, 15, 20, 30 min, or Never)
  - Customizable snooze length (5, 10, 15, 20 min)
  - Live sound volume preview slider
  - Gradual volume ramp-up toggle
  - Start week on Sunday, Monday, or Saturday
  - 5 synthesized ringtones (Classic Radar, Gentle Bell, Zen Chime, Upbeat Fanfare, Cyber Pulse)
  - 12-hour vs 24-hour time display
- **Web Audio Engine**: Zero external MP3 downloads; rings reliably 100% of the time directly from browser and native audio synthesis.

---

## 🚀 Getting Started (Developers)

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

This project uses [Capacitor](https://capacitorjs.com/) to compile into a native Android application.

```bash
# 1. Build production web bundle
npm run build

# 2. Sync web assets to Capacitor Android
npx cap sync android

# 3. Build APK with Gradle
cd android
./gradlew assembleDebug
```
The compiled APK will be output at `android/app/build/outputs/apk/debug/app-debug.apk`.

All pushes to `main` automatically trigger our GitHub Actions CI/CD pipeline to compile and publish new releases.

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

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
