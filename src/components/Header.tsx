import React from 'react';
import { UserProfile } from '../types';
import { Settings, Sparkles, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onOpenProfile, onOpenSettings }) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingUrdu = currentHour < 12 ? 'صبح بخیر' : currentHour < 17 ? 'دوپہر بخیر' : 'شام بخیر';

  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-4">
      {/* User Profile on the left side */}
      <button 
        onClick={onOpenProfile}
        className="flex items-center gap-3 group text-left transition-all active:scale-95"
      >
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500/40 p-0.5 bg-dark-900 shadow-lg shadow-cyan-500/10 group-hover:ring-cyan-400 transition"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-dark-950 rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              {greeting}
            </span>
            <span className="text-xs text-slate-500 font-urdu hidden sm:inline">({greetingUrdu})</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
            {profile.name}
          </h1>
        </div>
      </button>

      {/* Right side controls: Settings / AI status */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-xl bg-dark-850/90 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-dark-800 transition shadow-sm active:scale-90"
          title="Settings & Gemini API"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
