import React, { useState } from 'react';
import { UserProfile } from '../types';
import { audioEngine } from '../utils/audio';
import { ArrowLeft, Bell, Volume2, Key, Check, Shield } from 'lucide-react';

interface SettingsScreenProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onSaveProfile,
  onBack,
}) => {
  const [apiKey, setApiKey] = useState(profile.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [volume, setVolume] = useState(profile.soundVolume || 80);
  const [snoozeMinutes, setSnoozeMinutes] = useState(10);
  const [silenceAfter, setSilenceAfter] = useState(10);
  const [gradualVolume, setGradualVolume] = useState(false);
  const [startWeekOn, setStartWeekOn] = useState('Sunday');
  const [timerSound, setTimerSound] = useState('Timer Expired');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      geminiApiKey: apiKey.trim(),
      soundVolume: volume,
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col select-none animate-fade-in overflow-y-auto">
      {/* Header (Screenshot 3: Green back arrow + Settings) */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-4 border-b border-gray-100 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              handleSave();
              onBack();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#00B074] hover:bg-emerald-50 transition"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1 text-xs text-[#00B074] font-medium animate-fade-in">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Saved</span>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {/* Section: Clock */}
        <div className="px-6 py-4">
          <span className="text-xs font-medium text-gray-400 block mb-2">Clock</span>
          <div className="py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2">
            <span className="text-sm font-normal text-gray-900">Change date & time</span>
            <span className="text-xs text-gray-400">System</span>
          </div>
        </div>

        {/* Section: Alarms (Screenshot 3) */}
        <div className="px-6 py-4 space-y-4">
          <span className="text-xs font-medium text-gray-400 block mb-1">Alarms</span>

          {/* Silence After */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-900 font-normal">Silence after</div>
              <div className="text-xs text-gray-500">{silenceAfter} minutes</div>
            </div>
            <select
              value={silenceAfter}
              onChange={(e) => setSilenceAfter(parseInt(e.target.value))}
              className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
            </select>
          </div>

          {/* Snooze length */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-900 font-normal">Snooze length</div>
              <div className="text-xs text-gray-500">{snoozeMinutes} minutes</div>
            </div>
            <select
              value={snoozeMinutes}
              onChange={(e) => setSnoozeMinutes(parseInt(e.target.value))}
              className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
          </div>

          {/* Alarm volume (Screenshot 3: Alarm icon + green slider bar) */}
          <div className="space-y-2 pt-1">
            <div className="text-sm text-gray-900 font-normal">Alarm volume</div>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500 shrink-0" />
              <input
                type="range"
                min="10"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B074]"
              />
            </div>
          </div>

          {/* Gradually increase volume */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-sm text-gray-900 font-normal">Gradually increase volume</div>
              <div className="text-xs text-gray-500">{gradualVolume ? 'On' : 'Off'}</div>
            </div>
            <button
              onClick={() => setGradualVolume(!gradualVolume)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 ${
                gradualVolume ? 'bg-[#00B074]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  gradualVolume ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Start week on */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-sm text-gray-900 font-normal">Start week on</div>
              <div className="text-xs text-gray-500">{startWeekOn}</div>
            </div>
            <select
              value={startWeekOn}
              onChange={(e) => setStartWeekOn(e.target.value)}
              className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>
        </div>

        {/* Section: AI Engine Configuration (No Gemini sponsorship branding!) */}
        <div className="px-6 py-4 space-y-3">
          <span className="text-xs font-medium text-gray-400 block mb-1">AI Smart Scheduling</span>
          
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#00B074]" />
                AI API Key
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                apiKey ? 'bg-emerald-50 text-[#008759]' : 'bg-amber-50 text-amber-700'
              }`}>
                {apiKey ? 'Active' : 'Optional for AI'}
              </span>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Enables smart natural language alarms (e.g. "Wake me up 2 hours before flight") and schedule timetable photo scanning. Stored solely in local device storage.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste API key here..."
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
          </div>
        </div>

        {/* Section: Timers (Screenshot 3) */}
        <div className="px-6 py-4">
          <span className="text-xs font-medium text-gray-400 block mb-2">Timers</span>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-900 font-normal">Timer sound</div>
              <div className="text-xs text-gray-500">{timerSound}</div>
            </div>
          </div>
        </div>

        {/* Section: About */}
        <div className="px-6 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>Clock App Pro (Open Source)</span>
          <span>MIT License</span>
        </div>
      </div>
    </div>
  );
};
