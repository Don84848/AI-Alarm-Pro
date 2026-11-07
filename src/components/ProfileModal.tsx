import React, { useState } from 'react';
import { UserProfile } from '../types';
import { audioEngine } from '../utils/audio';
import { User, Key, Volume2, Moon, Sparkles, Smartphone, Check, X, Shield, Download } from 'lucide-react';

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
  const [showKey, setShowKey] = useState(false);
  const [volume, setVolume] = useState(profile.soundVolume || 80);
  const [bedtime, setBedtime] = useState(profile.bedtime || '23:00');
  const [targetSleep, setTargetSleep] = useState(profile.targetSleepHours || 8);
  const [useSpeech, setUseSpeech] = useState(profile.useSpeechBriefing);
  const [voiceLang, setVoiceLang] = useState<'ur-PK' | 'en-US'>(profile.voiceLang || 'en-US');
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
      soundVolume: volume,
      bedtime,
      targetSleepHours: targetSleep,
      useSpeechBriefing: useSpeech,
      voiceLang,
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-dark-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Profile & AI Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User info */}
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-dark-950/70 border border-slate-800">
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/50"
            />
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-slate-400">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white mt-1 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Sleep Health Target */}
          <div className="p-4 rounded-3xl bg-dark-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Sleep Target & Bedtime</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">{targetSleep} Hours</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Bedtime</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sleep Goal</label>
                <input
                  type="number"
                  min="5"
                  max="12"
                  step="0.5"
                  value={targetSleep}
                  onChange={(e) => setTargetSleep(parseFloat(e.target.value) || 8)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Gemini AI API Key */}
          <div className="p-4 rounded-3xl bg-dark-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Key className="w-4 h-4 text-violet-400" />
                <span>Google Gemini AI API Key</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {apiKey ? 'Active' : 'Offline Engine Active'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              The built-in intelligent engine works 100% offline without any key! If you provide your personal Google Gemini API key, it unlocks Gemini 1.5 Flash multimodal vision analysis.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
                className="w-full bg-dark-850 border border-slate-700 rounded-xl pl-3 pr-20 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2 text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-dark-950"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Audio Volume & Testing */}
          <div className="p-4 rounded-3xl bg-dark-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Alarm Sound Volume</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">{volume}%</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <button
                type="button"
                onClick={handleTestVolume}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition"
              >
                Test Sound
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">AI Voice Briefing</span>
                <span className="text-[11px] text-slate-500">Speaks morning greeting & routine upon waking</span>
              </div>
              <input
                type="checkbox"
                checked={useSpeech}
                onChange={(e) => setUseSpeech(e.target.checked)}
                className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Mobile App & APK Details */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-dark-950 to-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Mobile App & APK Deployment</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This app is fully configured for Android APK compilation via <strong>Capacitor</strong> and installable as a <strong>Standalone Mobile App (PWA)</strong> on any Android phone immediately with one tap.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-900/95 backdrop-blur-md px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/30 active:scale-95 transition flex items-center gap-1.5"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : null}
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
