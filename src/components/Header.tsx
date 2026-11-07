import React from 'react';
import { Hexagon, Sparkles } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onOpenSettings: () => void;
  onOpenAi?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Alarm', onOpenSettings, onOpenAi }) => {
  return (
    <header className="px-6 pt-5 pb-2 bg-white flex items-center justify-between select-none">
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
        {title}
      </h1>

      {/* Top Right Controls */}
      <div className="flex items-center gap-2">
        {/* Subtle AI Assistant Trigger */}
        {onOpenAi && (
          <button
            onClick={onOpenAi}
            className="w-9 h-9 rounded-full text-gray-500 hover:text-[#00B074] hover:bg-emerald-50 flex items-center justify-center transition active:scale-95"
            title="Smart AI Scheduling"
          >
            <Sparkles className="w-5 h-5 text-[#00B074]" />
          </button>
        )}

        {/* Green Hexagonal Settings Nut Icon (Exact match to screenshots) */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#00B074] hover:bg-emerald-50 transition active:scale-95"
          title="Settings"
        >
          {/* Hexagon Nut Icon */}
          <svg className="w-6 h-6 stroke-[#00B074]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7.794 4.5v9L12 20l-7.794-4.5v-9L12 2z" />
            <circle cx="12" cy="11" r="2.5" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
    </header>
  );
};
