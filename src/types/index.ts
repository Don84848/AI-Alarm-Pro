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
  soundVolume: number;
  voiceLang: 'ur-PK' | 'en-US';
  useSpeechBriefing: boolean;
  themeColor: string;
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
