import { Alarm, UserProfile } from '../types';

const ALARMS_KEY = 'ai_alarms_list_v1';
const PROFILE_KEY = 'ai_alarms_profile_v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Awais',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bedtime: '23:00',
  targetSleepHours: 8,
  geminiApiKey: '',
  soundVolume: 85,
  voiceLang: 'en-US',
  useSpeechBriefing: true,
  themeColor: '#06b6d4',
};

export const INITIAL_ALARMS: Alarm[] = [
  {
    id: 'alarm-1',
    time: '06:30',
    period: 'AM',
    rawTime24: '06:30',
    label: 'Morning Workout & Run 🏃‍♂️',
    days: [1, 2, 3, 4, 5], // Mon - Fri
    isEnabled: true,
    sound: 'gentle',
    snoozeMinutes: 5,
    isAiGenerated: true,
    aiReasoning: 'Calculated 30 minutes before sunrise for optimum cardio session',
    mission: 'math',
  },
  {
    id: 'alarm-2',
    time: '08:15',
    period: 'AM',
    rawTime24: '08:15',
    label: 'Office Standup Prep 💻',
    days: [1, 2, 3, 4, 5],
    isEnabled: true,
    sound: 'radar',
    snoozeMinutes: 10,
    isAiGenerated: false,
    mission: 'none',
  },
  {
    id: 'alarm-3',
    time: '05:15',
    period: 'AM',
    rawTime24: '05:15',
    label: 'Fajr Prayer & Meditation 🕌',
    days: [0, 1, 2, 3, 4, 5, 6],
    isEnabled: false,
    sound: 'zen',
    snoozeMinutes: 5,
    isAiGenerated: true,
    aiReasoning: 'Scheduled 20 mins before twilight start',
    mission: 'quote',
  }
];

export function loadAlarms(): Alarm[] {
  try {
    const data = localStorage.getItem(ALARMS_KEY);
    if (!data) {
      saveAlarms(INITIAL_ALARMS);
      return INITIAL_ALARMS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading alarms', e);
    return INITIAL_ALARMS;
  }
}

export function saveAlarms(alarms: Alarm[]): void {
  try {
    localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  } catch (e) {
    console.error('Error saving alarms', e);
  }
}

export function loadProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) {
      saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
  } catch (e) {
    console.error('Error loading profile', e);
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}
