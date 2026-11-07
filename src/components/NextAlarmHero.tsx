import React, { useState, useEffect } from 'react';
import { Alarm } from '../types';
import { getNextAlarmDiff, formatTime12 } from '../utils/timeUtils';
import { Bell, BellOff, Volume2, Sparkles, Moon } from 'lucide-react';

interface NextAlarmHeroProps {
  alarms: Alarm[];
  onTriggerTestAlarm: (alarm: Alarm) => void;
}

export const NextAlarmHero: React.FC<NextAlarmHeroProps> = ({ alarms, onTriggerTestAlarm }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { alarm: nextAlarm, diffString } = getNextAlarmDiff(alarms);

  const hours24 = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const period = currentTime.getHours() >= 12 ? 'PM' : 'AM';
  const hours12 = (currentTime.getHours() % 12 || 12).toString().padStart(2, '0');

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const formattedDate = currentTime.toLocaleDateString(undefined, dateOptions);

  return (
    <div className="px-5 pt-1 pb-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-900/90 via-dark-850/80 to-dark-900/90 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-xl">
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-violet-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top date bar */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-950/60 border border-slate-800 text-slate-300">
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium">Night Guard Active</span>
          </div>
        </div>

        {/* Digital Clock display */}
        <div className="flex items-baseline justify-center gap-2 my-2 select-none">
          <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-mono drop-shadow-[0_4px_16px_rgba(6,182,212,0.3)]">
            {hours12}:{minutes}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-mono text-cyan-400 font-bold">{seconds}s</span>
            <span className="text-sm font-bold text-slate-400">{period}</span>
          </div>
        </div>

        {/* Next Alarm Banner Card */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              nextAlarm 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                : 'bg-slate-800/50 text-slate-500 border border-slate-800'
            }`}>
              {nextAlarm ? <Bell className="w-5 h-5 animate-bounce" /> : <BellOff className="w-5 h-5" />}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Next Alarm
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                {nextAlarm ? (
                  <>
                    <span className="text-cyan-400 font-mono">{nextAlarm.time} {nextAlarm.period}</span>
                    <span className="text-slate-400 font-normal truncate max-w-[140px]">• {nextAlarm.label}</span>
                  </>
                ) : (
                  <span className="text-slate-500 font-normal">All alarms turned off</span>
                )}
              </div>
            </div>
          </div>

          {nextAlarm && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-mono">
                {diffString}
              </span>
              <button
                onClick={() => onTriggerTestAlarm(nextAlarm)}
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition active:scale-95"
                title="Preview / Test Alarm Ringing"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
