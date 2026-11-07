export type AlarmSound = 'radar' | 'gentle' | 'cyber' | 'zen' | 'rooster' | 'briefing';

export type MissionType = 'none' | 'math' | 'shake' | 'quote';

export interface Alarm {
  id: string;
  time: string; // "07:30"
  period: 'AM' | 'PM';
  rawTime24: string; // "07:30"
  label: string;
  days: number[]; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  isEnabled: boolean;
  sound: AlarmSound;
  snoozeMinutes: number;
  isAiGenerated?: boolean;
  aiPrompt?: string;
  aiReasoning?: string;
  mission?: MissionType;
  vibration?: boolean;
  lastTriggered?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  bedtime: string;
  targetSleepHours: number;
  geminiApiKey: string;
  selectedModel?: string;
  soundVolume: number;
  voiceLang: 'ur-PK' | 'en-US';
  useSpeechBriefing: boolean;
  themeColor: string;
  silenceAfter: number; // in minutes (e.g. 5, 10, 15, 20)
  snoozeLength: number; // in minutes (e.g. 5, 10, 15)
  graduallyIncreaseVolume: boolean;
  startWeekOn: 'Sunday' | 'Monday' | 'Saturday';
  timerSound: AlarmSound;
  use24HourFormat: boolean;
}

export interface AiParseResult {
  alarms: {
    time: string;
    period: 'AM' | 'PM';
    rawTime24: string;
    label: string;
    days: number[];
    sound?: AlarmSound;
    reasoning?: string;
  }[];
  explanation: string;
  detectedContext?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  createdAlarms?: Alarm[];
}
