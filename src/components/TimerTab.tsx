import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { audioEngine } from '../utils/audio';

export const TimerTab: React.FC = () => {
  const [targetSeconds, setTargetSeconds] = useState(300); // 5 mins default
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  // Wheel inputs when not running
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(5);
  const [inputS, setInputS] = useState(0);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            audioEngine.playSound('radar', 5);
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
  }, [isRunning]);

  const handleStart = () => {
    if (!isRunning && remainingSeconds === 0) {
      const total = inputH * 3600 + inputM * 60 + inputS;
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
    const total = inputH * 3600 + inputM * 60 + inputS;
    setTargetSeconds(total || 300);
    setRemainingSeconds(total || 300);
  };

  const handleApplyInputs = (h: number, m: number, s: number) => {
    setInputH(h);
    setInputM(m);
    setInputS(s);
    const total = h * 3600 + m * 60 + s;
    setTargetSeconds(total);
    setRemainingSeconds(total);
  };

  // Format remaining seconds into HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = targetSeconds > 0 ? (remainingSeconds / targetSeconds) * 100 : 0;

  return (
    <div className="px-6 py-6 flex flex-col items-center justify-between min-h-[65vh] select-none animate-fade-in">
      {/* Central Visual Countdown Ring or Picker */}
      {isRunning || remainingSeconds !== targetSeconds ? (
        <div className="flex flex-col items-center justify-center my-auto">
          {/* Circular Countdown Progress Ring */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-gray-100"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-blue-600 transition-all duration-1000 ease-linear"
                strokeWidth="5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-light text-gray-900 tracking-tight font-sans">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-xs font-medium text-gray-400 mt-1">
                {remainingSeconds === 0 ? 'Time Up!' : 'Remaining'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white rounded-3xl p-6 border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] my-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-4">
            Set Timer Duration
          </div>
          <div className="flex items-center justify-center gap-4 py-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <input
                type="number"
                min="0"
                max="23"
                value={inputH}
                onChange={(e) => handleApplyInputs(parseInt(e.target.value) || 0, inputM, inputS)}
                className="w-16 h-16 text-center text-3xl font-light bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900"
              />
              <span className="text-xs text-gray-400 mt-1">Hours</span>
            </div>
            <span className="text-2xl font-bold text-gray-300">:</span>
            {/* Minutes */}
            <div className="flex flex-col items-center">
              <input
                type="number"
                min="0"
                max="59"
                value={inputM}
                onChange={(e) => handleApplyInputs(inputH, parseInt(e.target.value) || 0, inputS)}
                className="w-16 h-16 text-center text-3xl font-light bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900"
              />
              <span className="text-xs text-gray-400 mt-1">Mins</span>
            </div>
            <span className="text-2xl font-bold text-gray-300">:</span>
            {/* Seconds */}
            <div className="flex flex-col items-center">
              <input
                type="number"
                min="0"
                max="59"
                value={inputS}
                onChange={(e) => handleApplyInputs(inputH, inputM, parseInt(e.target.value) || 0)}
                className="w-16 h-16 text-center text-3xl font-light bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900"
              />
              <span className="text-xs text-gray-400 mt-1">Secs</span>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 5, 10, 15, 30].map((m) => (
              <button
                key={m}
                onClick={() => handleApplyInputs(0, m, 0)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  inputH === 0 && inputM === m && inputS === 0
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={handleReset}
          className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition active:scale-95"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={isRunning ? handlePause : handleStart}
          className={`w-18 h-18 rounded-full flex items-center justify-center shadow-lg transition active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
          }`}
          style={{ width: '72px', height: '72px' }}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>
      </div>
    </div>
  );
};
