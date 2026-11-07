import React, { useState } from 'react';
import { UserProfile, AlarmSound } from '../types';
import { audioEngine } from '../utils/audio';
import { ArrowLeft, Bell, Volume2, Key, Check, ChevronRight, X, Clock, Sparkles } from 'lucide-react';

interface SettingsScreenProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

type ModalType = 'datetime' | 'silence' | 'snooze' | 'startweek' | 'timersound' | null;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onSaveProfile,
  onBack,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [apiKey, setApiKey] = useState(profile.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<'success' | 'error' | null>(null);

  // Helper to immediately update and persist any setting
  const updateSetting = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    const updated: UserProfile = {
      ...profile,
      [key]: value,
    };
    onSaveProfile(updated);
  };

  const handleVolumeChange = (newVol: number) => {
    audioEngine.setVolume(newVol);
    updateSetting('soundVolume', newVol);
  };

  const handleVolumePreview = () => {
    audioEngine.playSound('gentle', 1.5);
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) return;
    setIsTestingKey(true);
    setKeyTestStatus(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`
      );
      if (res.ok) {
        setKeyTestStatus('success');
        updateSetting('geminiApiKey', apiKey.trim());
      } else {
        setKeyTestStatus('error');
      }
    } catch {
      setKeyTestStatus('error');
    } finally {
      setIsTestingKey(false);
      setTimeout(() => setKeyTestStatus(null), 4000);
    }
  };

  const TIMER_SOUNDS: { id: AlarmSound; label: string }[] = [
    { id: 'radar', label: 'Classic Radar' },
    { id: 'gentle', label: 'Gentle Bell' },
    { id: 'zen', label: 'Zen Chime' },
    { id: 'rooster', label: 'Upbeat Fanfare' },
    { id: 'cyber', label: 'Cyber Pulse' },
  ];

  const currentTimerSoundLabel =
    TIMER_SOUNDS.find((s) => s.id === (profile.timerSound || 'radar'))?.label || 'Classic Radar';

  // Live time for the Date & Time modal
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !profile.use24HourFormat,
  });
  const dateString = now.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timezoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col select-none animate-fade-in overflow-y-auto">
      {/* Header (Screenshot 3: Green back arrow + Settings) */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-4 border-b border-gray-100 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#00B074] hover:bg-emerald-50 transition active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="divide-y divide-gray-100 pb-20">
        {/* Section: Clock */}
        <div className="px-6 py-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Clock
          </span>
          <div
            onClick={() => setActiveModal('datetime')}
            className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl px-2 -mx-2 transition"
          >
            <div>
              <span className="text-sm font-normal text-gray-900 block">Change date & time</span>
              <span className="text-xs text-gray-400">{timezoneString}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Section: Alarms (Screenshot 3) */}
        <div className="px-6 py-4 space-y-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Alarms
          </span>

          {/* Silence After */}
          <div
            onClick={() => setActiveModal('silence')}
            className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded-xl px-2 -mx-2 transition"
          >
            <div>
              <div className="text-sm text-gray-900 font-normal">Silence after</div>
              <div className="text-xs text-gray-500">
                {profile.silenceAfter === 0 ? 'Never' : `${profile.silenceAfter || 10} minutes`}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Snooze length */}
          <div
            onClick={() => setActiveModal('snooze')}
            className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded-xl px-2 -mx-2 transition"
          >
            <div>
              <div className="text-sm text-gray-900 font-normal">Snooze length</div>
              <div className="text-xs text-gray-500">{profile.snoozeLength || 10} minutes</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Alarm volume (Screenshot 3: Alarm icon + green slider bar) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900 font-normal">Alarm volume</span>
              <span className="text-xs font-medium text-[#00B074]">{profile.soundVolume || 80}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500 shrink-0" />
              <input
                type="range"
                min="10"
                max="100"
                value={profile.soundVolume || 80}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                onMouseUp={handleVolumePreview}
                onTouchEnd={handleVolumePreview}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B074]"
              />
            </div>
          </div>

          {/* Gradually increase volume */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-sm text-gray-900 font-normal">Gradually increase volume</div>
              <div className="text-xs text-gray-500">
                {profile.graduallyIncreaseVolume ? 'On (Ramps up over 20s)' : 'Off'}
              </div>
            </div>
            <button
              onClick={() =>
                updateSetting('graduallyIncreaseVolume', !profile.graduallyIncreaseVolume)
              }
              className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 ${
                profile.graduallyIncreaseVolume ? 'bg-[#00B074]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  profile.graduallyIncreaseVolume ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Start week on */}
          <div
            onClick={() => setActiveModal('startweek')}
            className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded-xl px-2 -mx-2 transition"
          >
            <div>
              <div className="text-sm text-gray-900 font-normal">Start week on</div>
              <div className="text-xs text-gray-500">{profile.startWeekOn || 'Sunday'}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Section: AI Smart Scheduling */}
        <div className="px-6 py-4 space-y-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            AI Smart Scheduling
          </span>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#00B074]" />
                AI API Key
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  profile.geminiApiKey
                    ? 'bg-emerald-50 text-[#008759]'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {profile.geminiApiKey ? 'Saved' : 'Optional for AI'}
              </span>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Enables natural language routines (e.g. "Flight at 4:30 AM with buffer") and schedule
              scanning. Stored strictly in local device storage.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={() => updateSetting('geminiApiKey', apiKey.trim())}
                placeholder="Paste your API key here..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00B074]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#00B074]"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Test API Key Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={isTestingKey || !apiKey.trim()}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  apiKey.trim()
                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-xs'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                {isTestingKey ? 'Verifying...' : 'Test & Verify Key'}
              </button>

              {keyTestStatus === 'success' && (
                <span className="text-xs text-[#00B074] font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Valid & Saved!
                </span>
              )}
              {keyTestStatus === 'error' && (
                <span className="text-xs text-red-500 font-medium">Invalid or restricted key</span>
              )}
            </div>
          </div>
        </div>

        {/* Section: Timers (Screenshot 3) */}
        <div className="px-6 py-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Timers
          </span>
          <div
            onClick={() => setActiveModal('timersound')}
            className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-xl px-2 -mx-2 transition"
          >
            <div>
              <div className="text-sm text-gray-900 font-normal">Timer sound</div>
              <div className="text-xs text-gray-500">{currentTimerSoundLabel}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Section: About */}
        <div className="px-6 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>Clock App Pro (Open Source)</span>
          <span>MIT License</span>
        </div>
      </div>

      {/* MODAL 1: CHANGE DATE & TIME */}
      {activeModal === 'datetime' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Date & Time Information</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-center space-y-1">
              <span className="text-xs text-gray-500 uppercase font-semibold">Current System Time</span>
              <div className="text-3xl font-light text-gray-900 font-mono">{timeString}</div>
              <div className="text-xs text-gray-600 font-medium">{dateString}</div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-gray-900">24-Hour Format</div>
                  <div className="text-xs text-gray-400">Use 24-hour time across alarms and clocks</div>
                </div>
                <button
                  onClick={() => updateSetting('use24HourFormat', !profile.use24HourFormat)}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 ${
                    profile.use24HourFormat ? 'bg-[#00B074]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      profile.use24HourFormat ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <div className="text-sm text-gray-900">Device Timezone</div>
                  <div className="text-xs text-gray-500">{timezoneString}</div>
                </div>
                <span className="text-xs font-semibold text-[#00B074] bg-emerald-50 px-2 py-0.5 rounded-full">
                  Auto
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-xl bg-[#00B074] text-white text-sm font-semibold hover:bg-[#009E67] transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: SILENCE AFTER */}
      {activeModal === 'silence' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Silence After</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {[5, 10, 15, 20, 25, 30].map((mins) => {
                const isSelected = (profile.silenceAfter || 10) === mins;
                return (
                  <div
                    key={mins}
                    onClick={() => {
                      updateSetting('silenceAfter', mins);
                      setActiveModal(null);
                    }}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded-xl transition"
                  >
                    <span className="text-sm text-gray-900">{mins} minutes</span>
                    {isSelected && <Check className="w-5 h-5 text-[#00B074] stroke-[2.5]" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SNOOZE LENGTH */}
      {activeModal === 'snooze' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Snooze Length</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {[5, 10, 15, 20, 30].map((mins) => {
                const isSelected = (profile.snoozeLength || 10) === mins;
                return (
                  <div
                    key={mins}
                    onClick={() => {
                      updateSetting('snoozeLength', mins);
                      setActiveModal(null);
                    }}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded-xl transition"
                  >
                    <span className="text-sm text-gray-900">{mins} minutes</span>
                    {isSelected && <Check className="w-5 h-5 text-[#00B074] stroke-[2.5]" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: START WEEK ON */}
      {activeModal === 'startweek' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Start Week On</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {(['Sunday', 'Monday', 'Saturday'] as const).map((day) => {
                const isSelected = (profile.startWeekOn || 'Sunday') === day;
                return (
                  <div
                    key={day}
                    onClick={() => {
                      updateSetting('startWeekOn', day);
                      setActiveModal(null);
                    }}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded-xl transition"
                  >
                    <span className="text-sm text-gray-900">{day}</span>
                    {isSelected && <Check className="w-5 h-5 text-[#00B074] stroke-[2.5]" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TIMER SOUND */}
      {activeModal === 'timersound' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Timer Sound</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {TIMER_SOUNDS.map((snd) => {
                const isSelected = (profile.timerSound || 'radar') === snd.id;
                return (
                  <div
                    key={snd.id}
                    onClick={() => {
                      audioEngine.playSound(snd.id, 2);
                      updateSetting('timerSound', snd.id);
                      setActiveModal(null);
                    }}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Volume2 className="w-4 h-4 text-[#00B074]" />
                      <span className="text-sm text-gray-900">{snd.label}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-[#00B074] stroke-[2.5]" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
