import React, { useState, useEffect } from 'react';
import { Alarm, UserProfile } from './types';
import { loadAlarms, saveAlarms, loadProfile, saveProfile } from './utils/storage';
import { shouldAlarmRingNow, formatTime12 } from './utils/timeUtils';
import { processAiAlarmPrompt } from './utils/aiEngine';
import { audioEngine } from './utils/audio';

import { Header } from './components/Header';
import { AnalogClockHero } from './components/AnalogClockHero';
import { AlarmCard } from './components/AlarmCard';
import { ClockTab } from './components/ClockTab';
import { TimerTab } from './components/TimerTab';
import { StopwatchTab } from './components/StopwatchTab';
import { SettingsScreen } from './components/SettingsScreen';
import { AddEditAlarmModal } from './components/AddEditAlarmModal';
import { AiChatSheet } from './components/AiChatSheet';
import { AlarmRingingScreen } from './components/AlarmRingingScreen';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { ScheduleUploadModal } from './components/ScheduleUploadModal';

import { Plus, Bell, Clock, Hourglass, Timer as StopwatchIcon } from 'lucide-react';

export const App: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>(() => loadAlarms());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  // Active bottom tab: 'alarm' | 'clock' | 'timer' | 'stopwatch'
  const [activeTab, setActiveTab] = useState<'alarm' | 'clock' | 'timer' | 'stopwatch'>('alarm');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
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
    const snoozeDuration = minutes || ringingAlarm.snoozeMinutes || profile.snoozeLength || 10;
    now.setMinutes(now.getMinutes() + snoozeDuration);
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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'alarm': return 'Alarm';
      case 'clock': return 'Clock';
      case 'timer': return 'Timer';
      case 'stopwatch': return 'Stopwatch';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center selection:bg-[#00B074] selection:text-white">
      {/* Mobile container - Pure White Stock Look */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-white border-x border-gray-200/80 shadow-md relative pb-16">
        
        {/* Top Header with title and green settings nut icon */}
        <Header
          title={getTabTitle()}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAi={() => setIsAiChatOpen(true)}
        />

        {/* TAB 1: ALARM VIEW (Exact Match to Screenshot 1) */}
        {activeTab === 'alarm' && (
          <div className="flex-1 flex flex-col">
            {/* Real Analog Clock Face Hero */}
            <AnalogClockHero />

            {/* Alarms Clean List */}
            <div className="px-6 py-2 flex-1 pb-24">
              {alarms.length === 0 ? (
                <div className="text-center py-8 px-4 text-gray-400 text-sm">
                  <p className="font-normal text-gray-500">No alarms</p>
                  <p className="text-xs text-gray-400 mt-1">Tap + to add an alarm</p>
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

            {/* Green Circular FAB (+) (Screenshot 1: Centered green plus button) */}
            <button
              onClick={() => {
                setEditingAlarm(null);
                setIsAddModalOpen(true);
              }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#00B074] hover:bg-[#009E67] text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center transition-all duration-150 active:scale-95 z-20"
              title="Add alarm"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* TAB 2: CLOCK VIEW */}
        {activeTab === 'clock' && <ClockTab />}

        {/* TAB 3: TIMER VIEW (Exact Match to Screenshot 2) */}
        {activeTab === 'timer' && <TimerTab profile={profile} />}

        {/* TAB 4: STOPWATCH VIEW (Exact Match to Screenshot 4) */}
        {activeTab === 'stopwatch' && <StopwatchTab />}

        {/* Bottom Navigation Bar (Screenshot 1/2/4: Exactly 4 Stock Menus, Clean Green Active Color) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 h-16 px-4 flex items-center justify-around z-30 select-none">
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
                className="flex flex-col items-center gap-0.5 group transition w-16"
              >
                <div
                  className={`transition-colors duration-150 ${
                    isSelected ? 'text-[#00B074]' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span
                  className={`text-[11px] transition-colors duration-150 ${
                    isSelected ? 'text-[#00B074] font-medium' : 'text-gray-400 font-normal'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Full Settings Screen (Screenshot 3) */}
        {isSettingsOpen && (
          <SettingsScreen
            profile={profile}
            onSaveProfile={(updated) => {
              setProfile(updated);
              saveProfile(updated);
            }}
            onBack={() => setIsSettingsOpen(false)}
          />
        )}

        {/* Add/Edit Alarm Modal (Smooth Finger-Scroll Drum Picker) */}
        {isAddModalOpen && (
          <AddEditAlarmModal
            alarm={editingAlarm}
            profile={profile}
            onSave={handleSaveAlarm}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingAlarm(null);
            }}
            onOpenAiChat={() => setIsAiChatOpen(true)}
          />
        )}

        {/* AI Assistant Sheet */}
        <AiChatSheet
          profile={profile}
          isOpen={isAiChatOpen}
          onClose={() => setIsAiChatOpen(false)}
          onAddAlarms={handleAddMultipleAlarms}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />

        {/* Voice Recorder Modal */}
        {isVoiceModalOpen && (
          <VoiceRecorderModal
            profile={profile}
            onVoiceSubmitted={handleVoiceTranscribed}
            onClose={() => setIsVoiceModalOpen(false)}
          />
        )}

        {/* Schedule Upload Modal */}
        {isUploadModalOpen && (
          <ScheduleUploadModal
            profile={profile}
            onAddAlarms={handleAddMultipleAlarms}
            onClose={() => setIsUploadModalOpen(false)}
          />
        )}

        {/* Ringing Screen Overlay */}
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
