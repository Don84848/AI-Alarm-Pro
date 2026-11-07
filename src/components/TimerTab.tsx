import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Presentation, Moon, Dumbbell, Bell } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { UserProfile } from '../types';

interface TimerPreset {
  id: string;
  label: string;
  durationSecs: number;
  icon: 'meeting' | 'sleep' | 'exercise' | 'custom';
}

interface TimerTabProps {
  profile?: UserProfile;
}

export const TimerTab: React.FC<TimerTabProps> = ({ profile }) => {
  const [targetSeconds, setTargetSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Drum picker values
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [presets, setPresets] = useState<TimerPreset[]>([
    { id: '1', label: 'Meeting', durationSecs: 20 * 60, icon: 'meeting' },
    { id: '2', label: 'Sleep', durationSecs: 10 * 60, icon: 'sleep' },
    { id: '3', label: 'Exercise', durationSecs: 15 * 60, icon: 'exercise' },
  ]);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            audioEngine.playSound(profile?.timerSound || 'radar', 5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, profile]);

  const handleStart = () => {
    if (!isRunning && remainingSeconds === 0) {
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total <= 0) return;
      setTargetSeconds(total);
      setRemainingSeconds(total);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(0);
    setTargetSeconds(0);
  };

  const handleApplyPreset = (preset: TimerPreset) => {
    setIsRunning(false);
    const h = Math.floor(preset.durationSecs / 3600);
    const m = Math.floor((preset.durationSecs % 3600) / 60);
    const s = preset.durationSecs % 60;
    setHours(h);
    setMinutes(m);
    setSeconds(s);
    setTargetSeconds(preset.durationSecs);
    setRemainingSeconds(preset.durationSecs);
  };

  const formatDigits = (val: number) => val.toString().padStart(2, '0');

  const formatHMS = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${formatDigits(h)}:${formatDigits(m)}:${formatDigits(s)}`;
  };

  const prevH = (hours - 1 + 24) % 24;
  const nextH = (hours + 1) % 24;
  const prevM = (minutes - 1 + 60) % 60;
  const nextM = (minutes + 1) % 60;
  const prevS = (seconds - 1 + 60) % 60;
  const nextS = (seconds + 1) % 60;

  return (
    <div className="px-6 py-4 flex flex-col justify-between flex-1 select-none animate-fade-in pb-28">
      {/* 1. Timer Drum Display (Exact match to Screenshot 2) */}
      {isRunning || remainingSeconds > 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="text-6xl font-light text-gray-900 font-sans tracking-tight">
            {formatHMS(remainingSeconds)}
          </span>
          <span className="text-xs text-gray-400 mt-2 font-medium">
            {remainingSeconds === 0 ? 'Timer Expired' : 'Remaining Time'}
          </span>
        </div>
      ) : (
        <div className="py-8 flex justify-center items-center gap-10">
          {/* Hours Column */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setHours(prevH)}
              className="text-2xl text-gray-300 font-light hover:text-gray-500 py-1 transition"
            >
              {formatDigits(prevH)}
            </button>
            <div className="text-4xl sm:text-5xl font-light text-gray-900 py-2 flex items-baseline">
              <span>{formatDigits(hours)}</span>
              <span className="text-sm font-normal text-gray-500 ml-0.5">h</span>
            </div>
            <button
              onClick={() => setHours(nextH)}
              className="text-2xl text-gray-300 font-light hover:text-gray-500 py-1 transition"
            >
              {formatDigits(nextH)}
            </button>
          </div>

          {/* Minutes Column */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setMinutes(prevM)}
              className="text-2xl text-gray-300 font-light hover:text-gray-500 py-1 transition"
            >
              {formatDigits(prevM)}
            </button>
            <div className="text-4xl sm:text-5xl font-light text-gray-900 py-2 flex items-baseline">
              <span>{formatDigits(minutes)}</span>
              <span className="text-sm font-normal text-gray-500 ml-0.5">m</span>
            </div>
            <button
              onClick={() => setMinutes(nextM)}
              className="text-2xl text-gray-300 font-light hover:text-gray-500 py-1 transition"
            >
              {formatDigits(nextM)}
            </button>
          </div>

          {/* Seconds Column */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setSeconds(prevS)}
              className="text-2xl text-gray-300 font-light hover:text-gray-500 py-1 transition"
            >
              {formatDigits(prevS)}
            </button>
            <div className="text-4xl sm:text-5xl font-light text-gray-900 py-2 flex items-baseline">
              <span>{formatDigits(seconds)}</span>
              <span className="text-sm font-normal text-gray-500 ml-0.5">s</span>
            </div>
            <button
              onClick={() => setSeconds(nextS)}
              className="text-2xl text-gray-300 font-light hover:text-gray-500 py-1 transition"
            >
              {formatDigits(nextS)}
            </button>
          </div>
        </div>
      )}

      {/* 2. Preset Tiles Grid (Exact match to Screenshot 2) */}
      <div className="grid grid-cols-3 gap-3 my-4">
        {presets.map((p) => {
          const isCurrent = targetSeconds === p.durationSecs;
          return (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition ${
                isCurrent
                  ? 'bg-emerald-50 border border-[#00B074]'
                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <div className="text-gray-500 mb-1.5">
                {p.icon === 'meeting' && <Presentation className="w-5 h-5 text-gray-600" />}
                {p.icon === 'sleep' && <Moon className="w-5 h-5 text-gray-600" />}
                {p.icon === 'exercise' && <Dumbbell className="w-5 h-5 text-gray-600" />}
              </div>
              <span className="text-xs font-semibold text-gray-900">{p.label}</span>
              <span className="text-[11px] text-gray-400 mt-0.5">{formatHMS(p.durationSecs)}</span>
            </button>
          );
        })}

        {/* Add Preset Card */}
        <button
          onClick={() => {
            const total = hours * 3600 + minutes * 60 + seconds;
            if (total > 0) {
              setPresets(prev => [
                ...prev,
                { id: `preset-${Date.now()}`, label: 'Custom', durationSecs: total, icon: 'meeting' }
              ]);
            }
          }}
          className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          title="Save current time as preset"
        >
          <Plus className="w-6 h-6 stroke-[1.5]" />
        </button>
      </div>

      {/* 3. Bottom Controls (Screenshot 2: Reset button on left, Green Play in center) */}
      <div className="flex items-center justify-center gap-10 mt-6 relative">
        <button
          onClick={handleReset}
          disabled={!isRunning && remainingSeconds === 0 && hours === 0 && minutes === 0 && seconds === 0}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 ${
            !isRunning && remainingSeconds === 0 && hours === 0 && minutes === 0 && seconds === 0
              ? 'text-gray-200 cursor-not-allowed'
              : 'text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
          }`}
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={isRunning ? handlePause : handleStart}
          className="w-14 h-14 rounded-full bg-[#00B074] hover:bg-[#009E67] text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center transition active:scale-95"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
