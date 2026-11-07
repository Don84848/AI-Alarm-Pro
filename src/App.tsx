import React, { useState, useEffect } from 'react';
import { Alarm, UserProfile } from './types';
import { loadAlarms, saveAlarms, loadProfile, saveProfile } from './utils/storage';
import { shouldAlarmRingNow, formatTime12 } from './utils/timeUtils';
import { processAiAlarmPrompt } from './utils/aiEngine';
import { audioEngine } from './utils/audio';

import { Header } from './components/Header';
import { LiveClockHero } from './components/LiveClockHero';
import { AlarmCard } from './components/AlarmCard';
import { ClockTab } from './components/ClockTab';
import { TimerTab } from './components/TimerTab';
import { StopwatchTab } from './components/StopwatchTab';
import { AiChatSheet } from './components/AiChatSheet';
import { AddEditAlarmModal } from './components/AddEditAlarmModal';
import { AlarmRingingScreen } from './components/AlarmRingingScreen';
import { ProfileModal } from './components/ProfileModal';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { ScheduleUploadModal } from './components/ScheduleUploadModal';

import { Plus, Bell, Clock, Hourglass, Timer as StopwatchIcon, Mic, Upload, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>(() => loadAlarms());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  // Active bottom tab: 'alarm' | 'clock' | 'timer' | 'stopwatch'
  const [activeTab, setActiveTab] = useState<'alarm' | 'clock' | 'timer' | 'stopwatch'>('alarm');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'alarm': return 'Alarm';
      case 'clock': return 'World Clock';
      case 'timer': return 'Timer';
      case 'stopwatch': return 'Stopwatch';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100/60 text-gray-900 flex justify-center selection:bg-blue-600 selection:text-white">
      {/* Mobile container - Pure White Light Theme */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-white border-x border-gray-200/80 shadow-xl relative pb-36">
        
        {/* Top Header with Title and Small Settings Gear */}
        <Header
          title={getTabTitle()}
          profile={profile}
          onOpenSettings={() => setIsProfileModalOpen(true)}
        />

        {/* TAB 1: ALARM VIEW */}
        {activeTab === 'alarm' && (
          <div className="flex-1 flex flex-col">
            {/* Live Center Clock in Hero */}
            <LiveClockHero alarms={alarms} />

            {/* Alarms List */}
            <div className="px-6 pt-1 pb-16 space-y-3 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Your Alarms ({alarms.length})
                </span>
              </div>

              {alarms.length === 0 ? (
                <div className="text-center py-12 px-6 rounded-3xl bg-gray-50 border border-dashed border-gray-200 my-2">
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs text-gray-400 flex items-center justify-center mx-auto mb-3 border border-gray-200">
                    <Bell className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-base font-semibold text-gray-800">No alarms set</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Tap the round AI button in the center to create smart routines, or tap the + button to set one manually.
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

            {/* Centered Circular AI Button & Side Action Dock */}
            <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-8 flex items-center justify-between z-20 pointer-events-none">
              {/* Left Action: Voice / Upload Quick Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="pointer-events-auto w-12 h-12 rounded-full bg-white border border-gray-200/90 text-gray-700 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                title="Upload schedule / timetable image"
              >
                <Upload className="w-5 h-5 text-gray-700" />
              </button>

              {/* Center: The Round Circular AI Button (Gemini Sparkle) */}
              <button
                onClick={() => setIsAiChatOpen(true)}
                className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/35 flex items-center justify-center hover:scale-105 active:scale-95 transition"
                title="Ask Gemini AI to set alarm"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
                    fill="white"
                  />
                </svg>
              </button>

              {/* Right Action: Plus (+) Manual Time Set Button */}
              <button
                onClick={() => {
                  setEditingAlarm(null);
                  setIsAddModalOpen(true);
                }}
                className="pointer-events-auto w-12 h-12 rounded-full bg-blue-600 text-white shadow-md flex items-center justify-center hover:bg-blue-700 active:scale-95 transition"
                title="Set alarm manually (smooth scroll wheel)"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: WORLD CLOCK */}
        {activeTab === 'clock' && <ClockTab />}

        {/* TAB 3: TIMER */}
        {activeTab === 'timer' && <TimerTab />}

        {/* TAB 4: STOPWATCH */}
        {activeTab === 'stopwatch' && <StopwatchTab />}

        {/* Stock Bottom Navigation Bar (4 Menus: Alarm, Clock, Timer, Stopwatch) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-gray-200 h-16 px-4 flex items-center justify-around z-30 select-none">
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
                  className={`px-4 py-1 rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span
                  className={`text-[11px] transition ${
                    isSelected ? 'text-blue-600 font-semibold' : 'text-gray-400 font-medium'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Expandable Gemini AI Conversational Assistant Sheet */}
        <AiChatSheet
          profile={profile}
          isOpen={isAiChatOpen}
          onClose={() => setIsAiChatOpen(false)}
          onAddAlarms={handleAddMultipleAlarms}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />

        {/* Manual Add/Edit Alarm Modal (Smooth Finger-Scroll Drum Picker) */}
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

        {/* Settings Modal (Gemini API Key, Model, Sound Volume) */}
        {isProfileModalOpen && (
          <ProfileModal
            profile={profile}
            onSaveProfile={setProfile}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}

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
