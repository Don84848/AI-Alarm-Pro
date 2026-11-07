import React, { useState } from 'react';
import { UserProfile } from '../types';
import { audioEngine } from '../utils/audio';
import { Key, Volume2, Moon, Check, X, Shield, ExternalLink, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onSaveProfile,
  onClose,
}) => {
  const [name, setName] = useState(profile.name);
  const [apiKey, setApiKey] = useState(profile.geminiApiKey || '');
  const [selectedModel, setSelectedModel] = useState(profile.selectedModel || 'gemini-2.5-flash');
  const [showKey, setShowKey] = useState(false);
  const [volume, setVolume] = useState(profile.soundVolume || 80);
  const [bedtime, setBedtime] = useState(profile.bedtime || '23:00');
  const [targetSleep, setTargetSleep] = useState(profile.targetSleepHours || 8);
  const [useSpeech, setUseSpeech] = useState(profile.useSpeechBriefing);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  const handleTestVolume = () => {
    audioEngine.setVolume(volume);
    audioEngine.playSound('gentle', 1.5);
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'User',
      geminiApiKey: apiKey.trim(),
      selectedModel,
      soundVolume: volume,
      bedtime,
      targetSleepHours: targetSleep,
      useSpeechBriefing: useSpeech,
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h3 className="text-base font-semibold text-gray-900">
            Settings & AI Assistant
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* AI API Key */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
                <Key className="w-4 h-4 text-[#00B074]" />
                <span>AI API Key</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                apiKey
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {apiKey ? 'Configured' : 'Optional for AI'}
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Your API key is saved solely inside your phone's private storage (localStorage) and is never shared or committed.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#00B074] hover:text-[#008759]"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Model Selection */}
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-gray-600 block mb-2">
                Active AI Model
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gemini-2.5-flash', label: 'Fast Model', tag: 'Fastest (Recommended)' },
                  { id: 'gemini-flash-latest', label: 'Pro Model', tag: 'High Quota' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedModel === m.id
                        ? 'border-[#00B074] bg-emerald-50 text-emerald-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs font-semibold">{m.label}</div>
                    <div className="text-[10px] text-gray-500">{m.tag}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>Alarm Ring Volume</span>
              </div>
              <span className="text-blue-600 font-mono">{volume}%</span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleTestVolume}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Test Sound
              </button>
            </div>
          </div>

          {/* Sleep Schedule Goal */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <Moon className="w-4 h-4 text-blue-600" />
              <span>Target Bedtime & Sleep Goal</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Target Bedtime</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Target Hours</label>
                <input
                  type="number"
                  min="4"
                  max="12"
                  value={targetSleep}
                  onChange={(e) => setTargetSleep(parseInt(e.target.value, 10) || 8)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Open Source Notice */}
          <div className="flex items-center gap-2 text-[11px] text-gray-500 px-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open Source MIT • 100% Client-Side Privacy</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
