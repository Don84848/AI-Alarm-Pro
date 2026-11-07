import React from 'react';
import { UserProfile } from '../types';
import { Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  title?: string;
  profile: UserProfile;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Alarm', profile, onOpenSettings }) => {
  return (
    <header className="px-6 pt-6 pb-2 bg-transparent select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            {title}
          </h1>
        </div>

        {/* Top Right: Small Settings Icon button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition active:scale-95 relative"
            title="App Settings & Gemini Key"
          >
            <Settings className="w-5 h-5" />
            {profile.geminiApiKey && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
