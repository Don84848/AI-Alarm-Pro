import React, { useState, useEffect } from 'react';
import { Alarm, UserProfile } from './types';
import { loadAlarms, saveAlarms, loadProfile, saveProfile } from './utils/storage';
import { shouldAlarmRingNow, formatTime12 } from './utils/timeUtils';
import { processAiAlarmPrompt } from './utils/aiEngine';
import { audioEngine } from './utils/audio';

import { Header } from './components/Header';
import { NextAlarmHero } from './components/NextAlarmHero';
import { AiAlarmBanner } from './components/AiAlarmBanner';
import { AlarmCard } from './components/AlarmCard';
import { AddEditAlarmModal } from './components/AddEditAlarmModal';
import { AlarmRingingScreen } from './components/AlarmRingingScreen';
import { ProfileModal } from './components/ProfileModal';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { ScheduleUploadModal } from './components/ScheduleUploadModal';

import { Plus, Bell, Sparkles, Filter, Check, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>(() => loadAlarms());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);

  // Filter: 'all' | 'ai' | 'active'
  const [filter, setFilter] = useState<'all' | 'ai' | 'active'>('all');

  // Sync state to LocalStorage
  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  useEffect(() => {
    saveProfile(profile);
    audioEngine.setVolume(profile.soundVolume);
  }, [profile]);

  // Real-time alarm checking loop (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentSeconds = now.getSeconds();

      // Only check during the first few seconds of each minute
      if (currentSeconds <= 2 && !ringingAlarm) {
        const timeKey = `${now.toDateString()} ${now.getHours()}:${now.getMinutes()}`;
        
        for (const alarm of alarms) {
          if (alarm.isEnabled && shouldAlarmRingNow(alarm, now) && alarm.lastTriggered !== timeKey) {
            // Trigger alarm!
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
      const result = await processAiAlarmPrompt(text, profile.geminiApiKey);
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

  // Filtered alarms
  const filteredAlarms = alarms.filter(a => {
    if (filter === 'ai') return a.isAiGenerated;
    if (filter === 'active') return a.isEnabled;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex justify-center selection:bg-cyan-500 selection:text-white">
      {/* Mobile container simulation */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-dark-950 border-x border-slate-900 shadow-2xl relative pb-24">
        {/* Top Header */}
        <Header
          profile={profile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenSettings={() => setIsProfileModalOpen(true)}
        />

        {/* Next Alarm & Digital Clock Hero */}
        <NextAlarmHero
          alarms={alarms}
          onTriggerTestAlarm={(alarm) => setRingingAlarm(alarm)}
        />

        {/* Centerpiece: AI Alarm Planner */}
        <AiAlarmBanner
          profile={profile}
          onAddAlarms={handleAddMultipleAlarms}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />

        {/* Alarms Header & Filter Bar */}
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Your Alarms
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {filteredAlarms.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-dark-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                filter === 'all'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                filter === 'ai'
                  ? 'bg-violet-950/80 text-violet-300 border border-violet-800/50 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Only</span>
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                filter === 'active'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Active
            </button>
          </div>
        </div>

        {/* Alarms List */}
        <div className="px-5 py-2 space-y-3 flex-1">
          {filteredAlarms.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-dark-900/40 border border-dashed border-slate-800/80 my-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/50 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No alarms found</p>
              <p className="text-xs text-slate-500 mt-1">
                Tell the AI above or tap the + button to create a new alarm
              </p>
            </div>
          ) : (
            filteredAlarms.map(alarm => (
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

        {/* Floating Action Button (FAB) for Manual Add */}
        <button
          onClick={() => {
            setEditingAlarm(null);
            setIsAddModalOpen(true);
          }}
          className="fixed bottom-6 right-6 sm:absolute sm:bottom-6 sm:right-6 w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-90 transition z-40"
          title="Add New Alarm Manually"
        >
          <Plus className="w-7 h-7" />
        </button>

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

        {/* Fullscreen Ringing Screen */}
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
