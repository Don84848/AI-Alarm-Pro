import React from 'react';
import { UserProfile, Alarm } from '../types';
import { getNextAlarmDiff } from '../utils/timeUtils';
import { Bell, MoreVertical, Sparkles } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  alarms: Alarm[];
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, alarms, onOpenProfile }) => {
  const { alarm: nextAlarm, diffString } = getNextAlarmDiff(alarms);

  return (
    <header className="px-6 pt-7 pb-4 select-none">
      {/* Top Bar: Title & Profile */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-m3-textPrimary">
            Alarm
          </h1>
          {/* Next Alarm status */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-m3-textTertiary">
            <Bell className="w-3.5 h-3.5 text-m3-primary" />
            <span>
              {nextAlarm ? (
                <>
                  <span className="text-m3-textSecondary font-medium">{nextAlarm.time} {nextAlarm.period}</span>
                  <span className="text-m3-textTertiary ml-1">({diffString})</span>
                </>
              ) : (
                'All alarms off'
              )}
            </span>
          </div>
        </div>

        {/* Right: Google Profile Avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfile}
            className="relative p-0.5 rounded-full hover:ring-2 hover:ring-m3-outline transition-all active:scale-95 group"
            title="Google Account & Settings"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover border border-m3-outlineVariant"
            />
            {profile.geminiApiKey && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-m3-primary flex items-center justify-center text-m3-onPrimary text-[9px] font-bold">
                ✦
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
