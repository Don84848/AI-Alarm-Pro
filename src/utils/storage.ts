import { Alarm, UserProfile } from '../types';

const ALARMS_KEY = 'ai_alarms_list_v2';
const PROFILE_KEY = 'ai_alarms_profile_v2';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Personal',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  bedtime: '23:00',
  targetSleepHours: 8,
  geminiApiKey: '',
  selectedModel: 'gemini-2.5-flash',
  soundVolume: 80,
  voiceLang: 'en-US',
  useSpeechBriefing: true,
  themeColor: '#00B074',
  silenceAfter: 10,
  snoozeLength: 10,
  graduallyIncreaseVolume: false,
  startWeekOn: 'Sunday',
  timerSound: 'radar',
  use24HourFormat: false,
};

// No dummy placeholder alarms — user adds real alarms
export const INITIAL_ALARMS: Alarm[] = [];

export function loadAlarms(): Alarm[] {
  try {
    const data = localStorage.getItem(ALARMS_KEY);
    if (!data) {
      saveAlarms([]);
      return [];
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading alarms', e);
    return [];
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
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      geminiApiKey: parsed.geminiApiKey || DEFAULT_PROFILE.geminiApiKey,
      selectedModel: parsed.selectedModel || DEFAULT_PROFILE.selectedModel,
    };
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
