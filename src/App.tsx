import React, { useState, useEffect } from 'react';
import { Alarm, UserProfile } from './types';
import { loadAlarms, saveAlarms, loadProfile, saveProfile } from './utils/storage';
import { shouldAlarmRingNow, formatTime12 } from './utils/timeUtils';
import { processAiAlarmPrompt } from './utils/aiEngine';
import { audioEngine } from './utils/audio';

import { Header } from './components/Header';
import { AiAlarmBanner } from './components/AiAlarmBanner';
import { AlarmCard } from './components/AlarmCard';
import { AddEditAlarmModal } from './components/AddEditAlarmModal';
import { AlarmRingingScreen } from './components/AlarmRingingScreen';
import { ProfileModal } from './components/ProfileModal';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { ScheduleUploadModal } from './components/ScheduleUploadModal';

import { Plus, Bell, Clock, Hourglass, Timer as StopwatchIcon } from 'lucide-react';

export const App: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>(() => loadAlarms());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  // Active bottom tab
  const [activeTab, setActiveTab] = useState<'alarm' | 'clock' | 'timer' | 'stopwatch'>('alarm');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  useEffect(() => {
    saveProfile(profile);
    audioEngine.setVolume(profile.soundVolume);
  }, [profile]);

  // Real-time alarm checking loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentSeconds = now.getSeconds();

      if (currentSeconds <= 2 && !ringingAlarm) {
        const timeKey = `${now.toDateString()} ${now.getHours()}:${now.getMinutes()}`;
        
        for (const alarm of alarms) {
          if (alarm.isEnabled && shouldAlarmRingNow(alarm, now) && alarm.lastTriggered !== timeKey) {
            alarm.lastTriggered = timeKey;
            setAlarms([...alarms]);
            setRingingAlarm(alarm);
            break;
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, ringingAlarm]);

  // Handlers
  const handleToggleAlarm = (id: string) => {
    setAlarms(prev =>
      prev.map(a => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveAlarm = (saved: Alarm) => {
    setAlarms(prev => {
      const exists = prev.some(a => a.id === saved.id);
      if (exists) {
        return prev.map(a => (a.id === saved.id ? saved : a));
      }
      return [saved, ...prev];
    });
    setEditingAlarm(null);
  };

  const handleAddMultipleAlarms = (newAlarms: Alarm[]) => {
    setAlarms(prev => [...newAlarms, ...prev]);
  };

  const handleVoiceTranscribed = async (text: string) => {
    setIsVoiceModalOpen(false);
    try {
      const result = await processAiAlarmPrompt(
        text,
        profile.geminiApiKey,
        undefined,
        profile.selectedModel
      );
      if (result.alarms.length > 0) {
        const created: Alarm[] = result.alarms.map((a, idx) => ({
          id: `voice-alarm-${Date.now()}-${idx}`,
          time: a.time,
          period: a.period,
          rawTime24: a.rawTime24,
          label: a.label,
          days: a.days,
          isEnabled: true,
          sound: a.sound || 'gentle',
          snoozeMinutes: 5,
          isAiGenerated: true,
          aiPrompt: text,
          aiReasoning: a.reasoning || result.explanation,
          mission: 'none',
        }));
        handleAddMultipleAlarms(created);
      }
    } catch (e) {
      console.error('Failed to parse voice command', e);
    }
  };

  const handleDismissRinging = () => {
    setRingingAlarm(null);
  };

  const handleSnoozeRinging = (minutes: number) => {
    if (!ringingAlarm) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeH = now.getHours().toString().padStart(2, '0');
    const snoozeM = now.getMinutes().toString().padStart(2, '0');
    const snoozeTime24 = `${snoozeH}:${snoozeM}`;
    
    const { time, period } = formatTime12(snoozeTime24);
    const snoozedAlarm: Alarm = {
      ...ringingAlarm,
      id: `snooze-${Date.now()}`,
      time,
      period,
      rawTime24: snoozeTime24,
      label: `[Snoozed] ${ringingAlarm.label}`,
      days: [],
      isEnabled: true,
    };
    setAlarms(prev => [snoozedAlarm, ...prev]);
    setRingingAlarm(null);
  };

  return (
    <div className="min-h-screen bg-m3-surface text-m3-textPrimary flex justify-center selection:bg-m3-primary selection:text-m3-onPrimary">
      {/* Mobile container */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-m3-surface border-x border-m3-outlineVariant/30 shadow-2xl relative pb-28">
        {/* Google Clock Header */}
        <Header
          profile={profile}
          alarms={alarms}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Pixel Gemini AI Action Bar */}
        <AiAlarmBanner
          profile={profile}
          onAddAlarms={handleAddMultipleAlarms}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />

        {/* Alarm List */}
        <div className="px-6 pt-3 pb-6 space-y-3.5 flex-1">
          {alarms.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-4xl bg-m3-surfaceLow border border-m3-outlineVariant/30 my-4">
              <div className="w-12 h-12 rounded-full bg-m3-surfaceContainer text-m3-textTertiary flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-base font-medium text-m3-textPrimary">No alarms</p>
              <p className="text-xs text-m3-textTertiary mt-1 max-w-xs mx-auto">
                Use the search bar above to ask Gemini, or tap the + button below to add one.
              </p>
            </div>
          ) : (
            alarms.map(alarm => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onToggle={handleToggleAlarm}
                onEdit={(a) => {
                  setEditingAlarm(a);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteAlarm}
                onPreviewSound={(a) => {
                  audioEngine.playSound(a.sound, 2);
                }}
              />
            ))
          )}
        </div>

        {/* Google Clock Floating Action Button (FAB) */}
        <button
          onClick={() => {
            setEditingAlarm(null);
            setIsAddModalOpen(true);
          }}
          className="fixed bottom-24 right-6 sm:absolute sm:bottom-24 sm:right-6 w-14 h-14 rounded-2xl bg-m3-primary text-m3-onPrimary flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-transform duration-150 z-40"
          title="Add alarm"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Google Clock Material You Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-m3-surfaceContainer border-t border-m3-outlineVariant/20 h-20 px-4 flex items-center justify-around z-30 select-none">
          {[
            { id: 'alarm', label: 'Alarm', icon: Bell },
            { id: 'clock', label: 'Clock', icon: Clock },
            { id: 'timer', label: 'Timer', icon: Hourglass },
            { id: 'stopwatch', label: 'Stopwatch', icon: StopwatchIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex flex-col items-center gap-1 group transition"
              >
                <div
                  className={`px-5 py-1 rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-m3-primaryContainer text-m3-onPrimaryContainer'
                      : 'text-m3-textTertiary group-hover:text-m3-textSecondary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-medium transition ${
                    isSelected ? 'text-m3-textPrimary font-semibold' : 'text-m3-textTertiary'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Modals */}
        {isAddModalOpen && (
          <AddEditAlarmModal
            alarm={editingAlarm}
            onSave={handleSaveAlarm}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingAlarm(null);
            }}
          />
        )}

        {isProfileModalOpen && (
          <ProfileModal
            profile={profile}
            onSaveProfile={setProfile}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}

        {isVoiceModalOpen && (
          <VoiceRecorderModal
            profile={profile}
            onVoiceSubmitted={handleVoiceTranscribed}
            onClose={() => setIsVoiceModalOpen(false)}
          />
        )}

        {isUploadModalOpen && (
          <ScheduleUploadModal
            profile={profile}
            onAddAlarms={handleAddMultipleAlarms}
            onClose={() => setIsUploadModalOpen(false)}
          />
        )}

        {/* Ringing Screen */}
        {ringingAlarm && (
          <AlarmRingingScreen
            alarm={ringingAlarm}
            profile={profile}
            onDismiss={handleDismissRinging}
            onSnooze={handleSnoozeRinging}
          />
        )}
      </div>
    </div>
  );
};

export default App;
