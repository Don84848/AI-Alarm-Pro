import React, { useState, useEffect } from 'react';
import { Globe, Plus } from 'lucide-react';

interface WorldCity {
  city: string;
  country: string;
  timezone: string;
  diff: string;
}

const DEFAULT_CITIES: WorldCity[] = [
  { city: 'London', country: 'United Kingdom', timezone: 'Europe/London', diff: '-5 hrs' },
  { city: 'New York', country: 'United States', timezone: 'America/New_York', diff: '-10 hrs' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', diff: '+4 hrs' },
  { city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', diff: '-1 hr' },
];

export const ClockTab: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const localTimeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const localSeconds = time.getSeconds().toString().padStart(2, '0');
  const localDateStr = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const getCityTime = (tz: string) => {
    try {
      return new Intl.DateTimeFormat([], {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(time);
    } catch {
      return localTimeStr;
    }
  };

  return (
    <div className="px-6 py-4 space-y-6 animate-fade-in select-none">
      {/* Primary Local Hero Clock */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-center">
        <span className="text-xs font-semibold text-[#00B074] uppercase tracking-widest block mb-2">
          Local Time
        </span>
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-light text-gray-900 font-sans tracking-tight">
            {localTimeStr}
          </span>
          <span className="text-sm font-mono font-medium text-[#00B074] bg-emerald-50 px-2 py-0.5 rounded-full ml-2">
            :{localSeconds}
          </span>
        </div>
        <div className="text-sm text-gray-500 font-medium mt-1">
          {localDateStr}
        </div>
      </div>

      {/* World Clock Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#00B074]" />
            World Clocks
          </h2>
        </div>

        <div className="space-y-3">
          {DEFAULT_CITIES.map((c) => (
            <div
              key={c.city}
              className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] flex items-center justify-between"
            >
              <div>
                <h3 className="text-base font-semibold text-gray-900">{c.city}</h3>
                <p className="text-xs text-gray-400">{c.diff} • {c.country}</p>
              </div>
              <div className="text-2xl font-light text-gray-800">
                {getCityTime(c.timezone)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
