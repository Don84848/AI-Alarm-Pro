import React, { useState, useEffect } from 'react';
import { Alarm, UserProfile } from '../types';
import { audioEngine } from '../utils/audio';
import { Bell, Clock, Sparkles, Check, AlertTriangle, Volume2 } from 'lucide-react';

interface AlarmRingingScreenProps {
  alarm: Alarm;
  profile: UserProfile;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const AlarmRingingScreen: React.FC<AlarmRingingScreenProps> = ({
  alarm,
  profile,
  onDismiss,
  onSnooze,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);
  const [mathProblem] = useState(() => {
    const a = Math.floor(Math.random() * 40) + 12;
    const b = Math.floor(Math.random() * 30) + 8;
    return { a, b, answer: a + b };
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Start audio ringing!
    const briefingText = profile.useSpeechBriefing
      ? `Good morning ${profile.name}! It is now ${alarm.time} ${alarm.period}. Time for ${alarm.label}. Rise and shine!`
      : undefined;

    audioEngine.startAlarmRinging(alarm.sound, briefingText);

    return () => {
      audioEngine.stopAlarmRinging();
    };
  }, [alarm, profile]);

  const handleDismissAttempt = () => {
    if (alarm.mission === 'math') {
      if (parseInt(mathAnswer.trim(), 10) === mathProblem.answer) {
        audioEngine.stopAlarmRinging();
        onDismiss();
      } else {
        setMathError(true);
      }
    } else {
      audioEngine.stopAlarmRinging();
      onDismiss();
    }
  };

  const handleSnooze = () => {
    audioEngine.stopAlarmRinging();
    onSnooze(alarm.snoozeMinutes || 5);
  };

  const hours12 = (currentTime.getHours() % 12 || 12).toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const period = currentTime.getHours() >= 12 ? 'PM' : 'AM';

  return (
    <div className="fixed inset-0 z-50 bg-dark-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-8 text-white select-none animate-fade-in">
      {/* Background Pulsing Sonic Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-72 h-72 rounded-full border border-cyan-500/30 animate-ripple"></div>
        <div className="w-96 h-96 rounded-full border border-violet-500/20 animate-ripple [animation-delay:0.5s]"></div>
        <div className="w-[32rem] h-[32rem] rounded-full border border-fuchsia-500/10 animate-ripple [animation-delay:1s]"></div>
      </div>

      {/* Top Bar: Alarm Icon and Title */}
      <div className="relative z-10 flex flex-col items-center gap-2 pt-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-cyan-500/40 animate-bounce">
          <Bell className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mt-2">
          {alarm.label}
        </h2>
        {alarm.isAiGenerated && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-700/50 text-violet-300 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Wake Assistant</span>
          </div>
        )}
      </div>

      {/* Center: Glowing Clock Display */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        <div className="flex items-baseline gap-3">
          <span className="text-7xl sm:text-8xl font-black font-mono tracking-tight drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]">
            {hours12}:{minutes}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold font-mono text-cyan-400">{seconds}s</span>
            <span className="text-xl font-extrabold text-slate-400">{period}</span>
          </div>
        </div>

        {/* AI Morning Greeting or Advice */}
        {alarm.aiReasoning && (
          <p className="mt-4 max-w-sm text-center text-xs text-slate-300/90 bg-dark-900/80 px-4 py-2 rounded-2xl border border-slate-800">
            {alarm.aiReasoning}
          </p>
        )}

        {/* Math Challenge Mission if enabled */}
        {alarm.mission === 'math' && (
          <div className="mt-6 p-4 rounded-3xl bg-dark-900 border border-amber-500/40 max-w-xs w-full text-center">
            <div className="text-xs font-semibold text-amber-300 mb-2">
              Solve to Dismiss Alarm:
            </div>
            <div className="text-2xl font-black font-mono text-white mb-3">
              {mathProblem.a} + {mathProblem.b} = ?
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={mathAnswer}
                onChange={(e) => {
                  setMathAnswer(e.target.value);
                  setMathError(false);
                }}
                placeholder="Answer"
                className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            {mathError && (
              <span className="text-[11px] text-red-400 mt-1 block">
                Incorrect answer! Try again.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls: Snooze & Dismiss */}
      <div className="relative z-10 w-full max-w-sm space-y-3 pb-6">
        <button
          onClick={handleDismissAttempt}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 text-white font-extrabold text-base tracking-wide shadow-xl shadow-cyan-500/30 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>I am Awake • Dismiss Alarm</span>
        </button>

        <button
          onClick={handleSnooze}
          className="w-full py-3 rounded-2xl bg-dark-900 hover:bg-dark-850 text-slate-300 font-bold text-sm border border-slate-800 active:scale-95 transition"
        >
          Snooze (+{alarm.snoozeMinutes || 5} min)
        </button>
      </div>
    </div>
  );
};
