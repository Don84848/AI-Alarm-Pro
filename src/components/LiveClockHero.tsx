import React, { useState, useEffect } from 'react';
import { Alarm } from '../types';
import { getNextAlarmDiff } from '../utils/timeUtils';
import { Bell, BellOff } from 'lucide-react';

interface LiveClockHeroProps {
  alarms: Alarm[];
}

export const LiveClockHero: React.FC<LiveClockHeroProps> = ({ alarms }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');

  const dateString = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const { alarm: nextAlarm, diffString } = getNextAlarmDiff(alarms);

  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-6 px-4 select-none">
      {/* Live Digital Clock Numerals */}
      <div className="flex items-baseline justify-center">
        <span className="text-6xl font-light tracking-tight text-gray-900 font-sans">
          {displayHours}:{minutes}
        </span>
        <span className="text-xl font-normal text-gray-400 ml-2">
          {period}
        </span>
        <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-2.5">
          :{seconds}
        </span>
      </div>

      {/* Date */}
      <div className="text-sm font-medium text-gray-500 mt-1">
        {dateString}
      </div>

      {/* Next Alarm Pill Status */}
      <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100/80 border border-gray-200/60 text-xs font-medium text-gray-700 shadow-sm">
        {nextAlarm ? (
          <>
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Next alarm at <strong className="text-gray-900">{nextAlarm.time} {nextAlarm.period}</strong> ({diffString})
            </span>
          </>
        ) : (
          <>
            <BellOff className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">No active alarms</span>
          </>
        )}
      </div>
    </div>
  );
};
