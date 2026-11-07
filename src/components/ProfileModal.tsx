import React, { useState } from 'react';
import { UserProfile } from '../types';
import { audioEngine } from '../utils/audio';
import { User, Key, Volume2, Moon, Check, X, Shield, ExternalLink } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-m3-surfaceContainer border border-m3-outlineVariant/30 rounded-t-4xl sm:rounded-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-m3-surfaceContainer/95 backdrop-blur-md px-6 py-4 border-b border-m3-outlineVariant/30 flex items-center justify-between z-10">
          <h3 className="text-xl font-normal text-m3-textPrimary">
            Settings & AI
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-m3-textSecondary hover:bg-m3-surfaceHigh flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Google Account Profile Card */}
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-m3-surface border border-m3-outlineVariant/30">
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover border border-m3-outlineVariant"
            />
            <div className="flex-1">
              <label className="text-[11px] font-medium text-m3-textTertiary block">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-m3-surfaceContainer border border-m3-outlineVariant/40 rounded-xl px-3 py-1.5 text-sm font-medium text-m3-textPrimary mt-1 focus:outline-none focus:border-m3-primary"
              />
            </div>
          </div>

          {/* Gemini AI API Key (Stored Privately in localStorage) */}
          <div className="p-4 rounded-3xl bg-m3-surface border border-m3-outlineVariant/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-m3-textPrimary">
                <Key className="w-4 h-4 text-m3-primary" />
                <span>Google Gemini API Key</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                apiKey
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                  : 'bg-m3-surfaceHigh text-m3-textTertiary'
              }`}>
                {apiKey ? 'Configured' : 'Offline Engine'}
              </span>
            </div>

            <p className="text-[11px] text-m3-textTertiary leading-relaxed">
              Your API key is stored securely in your browser/device localStorage only. It is never exposed, uploaded, or shared with third parties.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Gemini API Key here"
                className="w-full bg-m3-surfaceContainer border border-m3-outlineVariant/40 rounded-xl pl-3 pr-20 py-2.5 text-xs font-mono text-m3-textPrimary focus:outline-none focus:border-m3-primary"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2 text-[11px] font-medium text-m3-textSecondary hover:text-m3-textPrimary px-2 py-0.5 rounded-lg bg-m3-surface"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* AI Model Selector */}
            <div className="pt-2">
              <label className="text-[11px] font-medium text-m3-textTertiary block mb-1.5">
                Gemini Model
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'gemini-2.5-flash',
                    title: 'Gemini 2.5 Flash',
                    badge: 'Fastest',
                    desc: 'Under 400ms latency, high quota, ideal for voice and schedule scans.',
                  },
                  {
                    id: 'gemini-flash-latest',
                    title: 'Gemini Flash Latest',
                    badge: 'Stable',
                    desc: 'Standard Google multimodal model.',
                  },
                  {
                    id: 'gemini-pro-latest',
                    title: 'Gemini Pro Latest',
                    badge: 'Deep',
                    desc: 'Deep reasoning for complex schedules.',
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`w-full text-left p-3 rounded-2xl border text-xs transition ${
                      selectedModel === m.id
                        ? 'bg-m3-primaryContainer/30 border-m3-primary/60 text-m3-primary'
                        : 'bg-m3-surfaceContainer border-m3-outlineVariant/30 text-m3-textTertiary hover:text-m3-textSecondary'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span>{m.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-m3-surfaceHigh text-m3-textSecondary">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-m3-textTertiary mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sound & Volume */}
          <div className="p-4 rounded-3xl bg-m3-surface border border-m3-outlineVariant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-m3-textPrimary">Alarm volume</span>
              <span className="text-xs text-m3-primary font-medium">{volume}%</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="flex-1 accent-m3-primary cursor-pointer"
              />
              <button
                type="button"
                onClick={handleTestVolume}
                className="px-3 py-1 rounded-full text-xs font-medium bg-m3-surfaceContainer hover:bg-m3-surfaceHigh text-m3-textSecondary"
              >
                Test
              </button>
            </div>

            <div className="pt-2 border-t border-m3-outlineVariant/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-m3-textPrimary block">Voice greeting</span>
                <span className="text-[11px] text-m3-textTertiary">Read alarm label upon wake up</span>
              </div>
              <input
                type="checkbox"
                checked={useSpeech}
                onChange={(e) => setUseSpeech(e.target.checked)}
                className="w-4 h-4 rounded accent-m3-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Bedtime & Sleep Goal */}
          <div className="p-4 rounded-3xl bg-m3-surface border border-m3-outlineVariant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-m3-textPrimary">Bedtime routine</span>
              <span className="text-xs text-m3-primary font-medium">{targetSleep}h target</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-m3-textTertiary block mb-1">Target bedtime</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full bg-m3-surfaceContainer border border-m3-outlineVariant/40 rounded-xl px-3 py-2 text-xs text-m3-textPrimary"
                />
              </div>
              <div>
                <label className="text-[11px] text-m3-textTertiary block mb-1">Sleep goal (hours)</label>
                <input
                  type="number"
                  min="5"
                  max="12"
                  value={targetSleep}
                  onChange={(e) => setTargetSleep(parseFloat(e.target.value) || 8)}
                  className="w-full bg-m3-surfaceContainer border border-m3-outlineVariant/40 rounded-xl px-3 py-2 text-xs text-m3-textPrimary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-m3-surfaceContainer/95 backdrop-blur-md px-6 py-4 border-t border-m3-outlineVariant/30 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-m3-textSecondary hover:text-m3-textPrimary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full text-xs font-medium bg-m3-primary text-m3-onPrimary shadow-md hover:bg-m3-primaryContainer hover:text-white active:scale-95 transition"
          >
            {savedSuccess ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
