import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

interface Lap {
  number: number;
  timeMs: number;
  splitMs: number;
}

export const StopwatchTab: React.FC = () => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedMs;
      const update = () => {
        setElapsedMs(performance.now() - startTimeRef.current);
        animFrameRef.current = requestAnimationFrame(update);
      };
      animFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning) return;
    const lastLapTotal = laps.length > 0 ? laps[0].timeMs : 0;
    const split = elapsedMs - lastLapTotal;
    const newLap: Lap = {
      number: laps.length + 1,
      timeMs: elapsedMs,
      splitMs: split,
    };
    setLaps([newLap, ...laps]);
  };

  const formatDisplay = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  // Needle angle (1 full turn per 60 seconds)
  const needleDeg = ((elapsedMs % 60000) / 60000) * 360;

  return (
    <div className="px-6 py-4 flex flex-col justify-between flex-1 select-none animate-fade-in pb-28">
      {/* 1. Analog Stopwatch Dial (Exact match to Screenshot 4) */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Outer dial */}
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="white"
              stroke="#E5E7EB"
              strokeWidth="0.8"
            />

            {/* 60 Minute/Second ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              const angle = (i * 6 * Math.PI) / 180;
              const r1 = 86;
              const r2 = isMajor ? 78 : 82;
              const x1 = 100 + r1 * Math.sin(angle);
              const y1 = 100 - r1 * Math.cos(angle);
              const x2 = 100 + r2 * Math.sin(angle);
              const y2 = 100 - r2 * Math.cos(angle);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? '#9CA3AF' : '#E5E7EB'}
                  strokeWidth={isMajor ? '1' : '0.6'}
                />
              );
            })}

            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="24"
              stroke="#4B5563"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${needleDeg} 100 100)`}
            />

            {/* Center Pivot */}
            <circle cx="100" cy="100" r="3" fill="#111827" />
          </svg>
        </div>

        {/* 2. Big Green Digital Time Display (Screenshot 4: 00:00.00 in #00B074) */}
        <div className="mt-4">
          <span className="text-5xl font-light text-[#00B074] font-mono tracking-tight">
            {formatDisplay(elapsedMs)}
          </span>
        </div>
      </div>

      {/* Lap Table */}
      <div className="flex-1 max-h-40 overflow-y-auto my-3 px-2">
        {laps.length > 0 && (
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-gray-100">
              {laps.map((lap) => (
                <tr key={lap.number} className="text-gray-700 py-1.5 font-mono">
                  <td className="py-1.5 font-sans text-gray-500 font-medium">
                    Lap {lap.number}
                  </td>
                  <td className="py-1.5 text-right font-medium text-gray-900">
                    {formatDisplay(lap.timeMs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 3. Bottom Controls (Screenshot 4: Reset on left, Green Play in center, Lap on right) */}
      <div className="flex items-center justify-center gap-10 mt-auto">
        {/* Reset button */}
        <button
          onClick={handleReset}
          disabled={!isRunning && elapsedMs === 0}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 ${
            !isRunning && elapsedMs === 0
              ? 'text-gray-200 cursor-not-allowed'
              : 'text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
          }`}
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Center Green Play / Pause Button */}
        <button
          onClick={isRunning ? handleStop : handleStart}
          className="w-14 h-14 rounded-full bg-[#00B074] hover:bg-[#009E67] text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center transition active:scale-95"
          title={isRunning ? 'Stop' : 'Start'}
        >
          {isRunning ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Lap button */}
        <button
          onClick={handleLap}
          disabled={!isRunning}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 ${
            !isRunning
              ? 'text-gray-200 cursor-not-allowed'
              : 'text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
          }`}
          title="Record lap"
        >
          <Flag className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
