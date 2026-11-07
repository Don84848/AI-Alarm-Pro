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
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      hundredths: hundredths.toString().padStart(2, '0'),
    };
  };

  const { minutes, seconds, hundredths } = formatDisplay(elapsedMs);

  return (
    <div className="px-6 py-4 flex flex-col justify-between min-h-[70vh] select-none animate-fade-in">
      {/* Stopwatch Giant Digital Readout */}
      <div className="flex flex-col items-center justify-center my-8">
        <div className="flex items-baseline justify-center">
          <span className="text-6xl font-light text-gray-900 font-mono tracking-tight">
            {minutes}:{seconds}
          </span>
          <span className="text-3xl font-mono text-blue-600 font-normal ml-2">
            .{hundredths}
          </span>
        </div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
          Stopwatch
        </div>
      </div>

      {/* Lap Table */}
      <div className="flex-1 max-h-56 overflow-y-auto my-2 border-t border-gray-100">
        {laps.length > 0 && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 uppercase tracking-wider">
                <th className="py-2 font-medium">Lap</th>
                <th className="py-2 font-medium text-right">Split</th>
                <th className="py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {laps.map((lap) => {
                const splitFmt = formatDisplay(lap.splitMs);
                const totalFmt = formatDisplay(lap.timeMs);
                return (
                  <tr key={lap.number} className="text-gray-700 font-mono">
                    <td className="py-2.5 font-sans font-semibold text-gray-900">
                      Lap {lap.number}
                    </td>
                    <td className="py-2.5 text-right text-gray-500">
                      +{splitFmt.minutes}:{splitFmt.seconds}.{splitFmt.hundredths}
                    </td>
                    <td className="py-2.5 text-right font-medium text-gray-900">
                      {totalFmt.minutes}:{totalFmt.seconds}.{totalFmt.hundredths}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-6">
        {/* Left button: Lap / Reset */}
        <button
          onClick={isRunning ? handleLap : handleReset}
          disabled={!isRunning && elapsedMs === 0}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95 ${
            !isRunning && elapsedMs === 0
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title={isRunning ? 'Lap' : 'Reset'}
        >
          {isRunning ? <Flag className="w-5 h-5 text-gray-700" /> : <RotateCcw className="w-5 h-5" />}
        </button>

        {/* Center: Start / Stop button */}
        <button
          onClick={isRunning ? handleStop : handleStart}
          className={`rounded-full flex items-center justify-center shadow-lg transition active:scale-95 text-white ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
          }`}
          style={{ width: '72px', height: '72px' }}
          title={isRunning ? 'Stop' : 'Start'}
        >
          {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>
      </div>
    </div>
  );
};
