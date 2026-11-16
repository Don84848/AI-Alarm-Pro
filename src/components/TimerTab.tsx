import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';
import { audioEngine } from '../utils/audio';
import { Play, Pause, RotateCcw, Plus, Presentation, Moon, Dumbbell } from 'lucide-react';

interface TimerTabProps {
  profile?: UserProfile;
}

interface TimerPreset {
  id: string;
  label: string;
  durationSecs: number;
  icon: 'meeting' | 'sleep' | 'exercise';
}

const HOURS_LIST = Array.from({ length: 24 }, (_, i) => i);
const MINS_SECS_LIST = Array.from({ length: 60 }, (_, i) => i);
const ITEM_HEIGHT = 44; // px

export const TimerTab: React.FC<TimerTabProps> = ({ profile }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [targetSeconds, setTargetSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [presets, setPresets] = useState<TimerPreset[]>([
    { id: '1', label: 'Meeting', durationSecs: 20 * 60, icon: 'meeting' },
    { id: '2', label: 'Sleep', durationSecs: 10 * 60, icon: 'sleep' },
    { id: '3', label: 'Exercise', durationSecs: 15 * 60, icon: 'exercise' },
  ]);

  const timerRef = useRef<any>(null);
  const hoursColRef = useRef<HTMLDivElement>(null);
  const minsColRef = useRef<HTMLDivElement>(null);
  const secsColRef = useRef<HTMLDivElement>(null);

  const timeoutH = useRef<any>(null);
  const timeoutM = useRef<any>(null);
  const timeoutS = useRef<any>(null);

  // Initialize scroll positions
  useEffect(() => {
    if (hoursColRef.current) hoursColRef.current.scrollTop = hours * ITEM_HEIGHT;
    if (minsColRef.current) minsColRef.current.scrollTop = minutes * ITEM_HEIGHT;
    if (secsColRef.current) secsColRef.current.scrollTop = seconds * ITEM_HEIGHT;
  }, []);

  const handleDrumScroll = useCallback(
    (
      ref: React.RefObject<HTMLDivElement>,
      maxVal: number,
      timeoutRef: React.MutableRefObject<any>,
      setter: (v: number) => void
    ) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!ref.current) return;
        const scrollTop = ref.current.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(maxVal, index));
        ref.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
        setter(clamped);
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(6);
          } catch {}
        }
      }, 70);
    },
    []
  );

  const selectDrumDirect = (
    ref: React.RefObject<HTMLDivElement>,
    val: number,
    setter: (v: number) => void
  ) => {
    if (ref.current) {
      ref.current.scrollTo({ top: val * ITEM_HEIGHT, behavior: 'smooth' });
      setter(val);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(8);
        } catch {}
      }
    }
  };

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

    if (hoursColRef.current) hoursColRef.current.scrollTo({ top: h * ITEM_HEIGHT, behavior: 'smooth' });
    if (minsColRef.current) minsColRef.current.scrollTo({ top: m * ITEM_HEIGHT, behavior: 'smooth' });
    if (secsColRef.current) secsColRef.current.scrollTo({ top: s * ITEM_HEIGHT, behavior: 'smooth' });
  };

  const formatDigits = (val: number) => val.toString().padStart(2, '0');

  const formatHMS = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${formatDigits(h)}:${formatDigits(m)}:${formatDigits(s)}`;
  };

  return (
    <div className="px-6 py-4 flex flex-col justify-between flex-1 select-none animate-fade-in pb-28">
      {/* 1. Timer Display or Scroll Drum (Exact match to Screenshot 2) */}
      {isRunning || remainingSeconds > 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <span className="text-6xl font-light text-gray-900 font-sans tracking-tight">
            {formatHMS(remainingSeconds)}
          </span>
          <span className="text-xs text-gray-400 mt-2 font-medium">
            {remainingSeconds === 0 ? 'Timer Expired' : 'Remaining Time'}
          </span>
          {targetSeconds > 0 && (
            <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-[#00B074] transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${Math.min(100, (remainingSeconds / targetSeconds) * 100)}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="relative py-4 my-2">
          {/* Drum Selection Background Bar */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-11 bg-gray-50 border-y border-gray-100 rounded-xl pointer-events-none z-0" />

          {/* Top/Bottom Fades */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

          {/* 3 Columns */}
          <div className="relative flex items-center justify-center gap-6 h-36 z-0">
            {/* Hours */}
            <div className="w-20 flex flex-col items-center">
              <div
                ref={hoursColRef}
                onScroll={() => handleDrumScroll(hoursColRef, 23, timeoutH, setHours)}
                className="w-full h-32 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[44px]"
                style={{ overscrollBehaviorY: 'contain' }}
              >
                {HOURS_LIST.map((h) => {
                  const isSelected = h === hours;
                  return (
                    <div
                      key={h}
                      onClick={() => selectDrumDirect(hoursColRef, h, setHours)}
                      className={`h-[44px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'text-3xl font-light text-gray-900 scale-105'
                          : 'text-xl font-light text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <span>{formatDigits(h)}</span>
                      {isSelected && <span className="text-xs font-normal text-gray-400 ml-0.5">h</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Minutes */}
            <div className="w-20 flex flex-col items-center">
              <div
                ref={minsColRef}
                onScroll={() => handleDrumScroll(minsColRef, 59, timeoutM, setMinutes)}
                className="w-full h-32 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[44px]"
                style={{ overscrollBehaviorY: 'contain' }}
              >
                {MINS_SECS_LIST.map((m) => {
                  const isSelected = m === minutes;
                  return (
                    <div
                      key={m}
                      onClick={() => selectDrumDirect(minsColRef, m, setMinutes)}
                      className={`h-[44px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'text-3xl font-light text-gray-900 scale-105'
                          : 'text-xl font-light text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <span>{formatDigits(m)}</span>
                      {isSelected && <span className="text-xs font-normal text-gray-400 ml-0.5">m</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seconds */}
            <div className="w-20 flex flex-col items-center">
              <div
                ref={secsColRef}
                onScroll={() => handleDrumScroll(secsColRef, 59, timeoutS, setSeconds)}
                className="w-full h-32 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[44px]"
                style={{ overscrollBehaviorY: 'contain' }}
              >
                {MINS_SECS_LIST.map((s) => {
                  const isSelected = s === seconds;
                  return (
                    <div
                      key={s}
                      onClick={() => selectDrumDirect(secsColRef, s, setSeconds)}
                      className={`h-[44px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'text-3xl font-light text-gray-900 scale-105'
                          : 'text-xl font-light text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <span>{formatDigits(s)}</span>
                      {isSelected && <span className="text-xs font-normal text-gray-400 ml-0.5">s</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Preset Tiles Grid (Screenshot 2) */}
      <div className="grid grid-cols-3 gap-3 my-2">
        {presets.map((p) => {
          const isCurrent = targetSeconds === p.durationSecs;
          return (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 ${
                isCurrent
                  ? 'bg-emerald-50/70 border border-[#00B074]'
                  : 'bg-gray-50/80 hover:bg-gray-100/70 border border-transparent'
              }`}
            >
              <div className="text-gray-500 mb-1">
                {p.icon === 'meeting' && <Presentation className="w-4 h-4 text-gray-600" />}
                {p.icon === 'sleep' && <Moon className="w-4 h-4 text-gray-600" />}
                {p.icon === 'exercise' && <Dumbbell className="w-4 h-4 text-gray-600" />}
              </div>
              <span className="text-xs font-medium text-gray-900">{p.label}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{formatHMS(p.durationSecs)}</span>
            </button>
          );
        })}

        {/* Add Preset Card */}
        <button
          onClick={() => {
            const total = hours * 3600 + minutes * 60 + seconds;
            if (total > 0) {
              setPresets((prev) => [
                ...prev,
                { id: `preset-${Date.now()}`, label: 'Custom', durationSecs: total, icon: 'meeting' },
              ]);
            }
          }}
          className="p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition active:scale-95"
          title="Save current duration as preset"
        >
          <Plus className="w-5 h-5 stroke-[1.5]" />
        </button>
      </div>

      {/* 3. Bottom Controls */}
      <div className="flex items-center justify-center gap-12 mt-4 relative">
        <button
          onClick={handleReset}
          disabled={!isRunning && remainingSeconds === 0 && hours === 0 && minutes === 0 && seconds === 0}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-90 ${
            !isRunning && remainingSeconds === 0 && hours === 0 && minutes === 0 && seconds === 0
              ? 'text-gray-200 cursor-not-allowed'
              : 'text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 shadow-xs'
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
