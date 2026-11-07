# ⏰ AI Alarm Pro - سمارٹ اے آئی الارم ایپ

ایک جدید اور انتہائی اسمارٹ موبائل الارم ایپلیکیشن جس میں اصلی الارم ایپس جیسا ہموار (smooth)، پریمیم ڈارک انٹرفیس ہے اور طاقتور **AI Engine** اندر موجود ہے جو آواز (Voice)، تحریر (Text)، یا شیڈول/ٹائم ٹیبل کی تصویر (Upload) کے ذریعے خود حساب اور ریسرچ کر کے الارم سیٹ کرتا ہے۔

---

## 🌟 نمایاں خصوصیات (Key Features)

1. **پریمیم موبائل انٹرفیس (Real Legit & Smooth Interface):**
   - iOS 18 اور Samsung One UI کی طرح سلیقہ بخش ڈارک انٹرفیس
   - لائیو ڈیجیٹل کلاک سیکنڈز کے ساتھ
   - اگلا الارم کتنے گھنٹے بعد بجے گا ("Rings in 6h 25m")
   - الارم آن/آف ٹوگل سوئچ، دنوں کا شیڈول (Mon - Sun)
   - ریاضی کا چیلنج (Math Mission) الارم بند کرنے کے لیے تاکہ نیند واقعی ٹوٹ جائے!

2. **سیٹ الارم اے آئی (AI Smart Alarm Assistant):**
   - **آواز کے ذریعے (Voice Command):** اردو اور انگلش دونوں زبانوں میں بول کر الارم لگائیں (مثلاً: *"صبح 6 بجے جم کے لیے جگاؤ"* یا *"فلائٹ 4 بجے ہے، 3 گھنٹے پہلے الارم لگاؤ"*).
   - **لکھ کر (Natural Language Text):** عام گفتگو کے انداز میں لکھیں، اے آئی حساب کتاب خود کرے گی۔
   - **شیڈول اپلوڈ (Upload Schedule / Timetable):** فلائٹ ٹکٹ، امتحانی ڈیٹ شیٹ، یا ہسپتال/آفس روسٹر کی تصویر اپلوڈ کریں، اے آئی خود بخود سارے اوقات نکال کر الارم سیٹ کر دے گی۔
   - **اے آئی ریسرچ اور بفر کیلکولیشن:** مثلاً اگر آپ کہیں کہ *"میری فلائٹ رات 10 بجے ہے، 2 گھنٹے ایئرپورٹ اور 45 منٹ راستہ ہے"*، تو AI خود حساب لگا کر **7:15 PM** پر الارم لگاتی ہے اور بتاتی ہے کہ یہ وقت کیوں چنا گیا۔

3. **حقیقی ساؤنڈز اور ویوز (Web Audio Synthesizer & Speech):**
   - 6 حقیقت پسندانہ ٹونز: **Gentle Sunrise (Marimba)**, **Sonar Radar**, **Cyberpunk Pulse**, **Tibetan Zen Bowl**, **High Energy Rooster**, اور **AI Voice Morning Briefing** (صبح جگانے کے ساتھ نام لے کر موسم اور روٹین بتائے گی!).

4. **پروفائل اور سیٹنگز (Profile & Settings):**
   - صارف کا پروفائل، اوتار اور نام
   - روزانہ نیند کا ہدف (Sleep Goal) اور بیڈ ٹائم الرٹ
   - گوگل جیمنی (Gemini API) کا آپشن (اور اگر API key نہ بھی ہو تو بھی آف لائن اسمارٹ انجن 100 فیصد مفت چلتا ہے!)
   - آواز (Volume) اور وائبریشن ٹیسٹ

---

## 🚀 ایپ چلانے کا طریقہ (How to Run)

### 1. براؤزر یا موبائل وائی فائی پر چلائیں:
سرور پہلے سے پورٹ 3000 پر چل رہا ہے:
- اپنے کمپیوٹر پر: **`http://localhost:3000`** کھولیں
- اپنے موبائل پر (اسی وائی فائی نیٹ ورک پر): **`http://192.168.100.43:3000`** کھولیں
- موبائل کروم میں جا کر **"Add to Home Screen"** یا **"Install App"** پر کلک کریں، یہ فون میں اصلی ایپ کی طرح انسٹال ہو جائے گی!

### 2. اینڈرائیڈ اسٹوڈیو میں کھولنا اور APK بنانا:
```bash
# Android Project کھولنے کے لیے:
npx cap open android

# یا APK بلڈ کرنے کے لیے اسکرپٹ چلائیں:
powershell -ExecutionPolicy Bypass -File .\build-apk.ps1
```

---

## 📱 ٹیکنالوجی اسٹیک (Tech Stack)
- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Audio Engine:** Web Audio API (Synthesizer Tones) + Web Speech API (Urdu & English Speech Recognition)
- **AI Core:** Hybrid Gemini 1.5 Multimodal Engine + Local NLP Deep Reasoning Engine
- **Mobile Container:** Capacitor 7 (Android Native Project) + PWA Standalone Manifest
