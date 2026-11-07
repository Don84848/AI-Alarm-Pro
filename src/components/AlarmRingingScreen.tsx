import React, { useState, useEffect } from 'react';
import { Alarm, UserProfile } from '../types';
import { audioEngine } from '../utils/audio';
import { Bell, Check, Sparkles } from 'lucide-react';

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
    const a = Math.floor(Math.random() * 30) + 12;
    const b = Math.floor(Math.random() * 25) + 9;
    return { a, b, answer: a + b };
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const briefingText = profile.useSpeechBriefing
      ? `Good morning ${profile.name}! It is now ${alarm.time} ${alarm.period}. Time for ${alarm.label}.`
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
    onSnooze(alarm.snoozeMinutes || 10);
  };

  const hours12 = (currentTime.getHours() % 12 || 12).toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const period = currentTime.getHours() >= 12 ? 'PM' : 'AM';

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col items-center justify-between p-8 text-white select-none animate-fade-in">
      {/* Top Header: Alarm label */}
      <div className="pt-8 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-m3-surfaceContainer flex items-center justify-center text-m3-primary mb-1">
          <Bell className="w-6 h-6 animate-bounce" />
        </div>
        <h2 className="text-xl font-normal text-m3-textPrimary">
          {alarm.label || 'Alarm'}
        </h2>
        {alarm.aiReasoning && (
          <span className="text-xs text-m3-primary max-w-xs text-center">
            ✦ {alarm.aiReasoning}
          </span>
        )}
      </div>

      {/* Center: Google Clock Digital Display */}
      <div className="flex flex-col items-center my-auto">
        <div className="flex items-baseline">
          <span className="text-7xl sm:text-8xl font-light tracking-tight text-white font-sans">
            {hours12}:{minutes}
          </span>
          <span className="text-xl font-normal text-m3-textSecondary ml-2">
            {period}
          </span>
        </div>

        {/* Math Challenge Mission */}
        {alarm.mission === 'math' && (
          <div className="mt-8 p-5 rounded-3xl bg-m3-surfaceContainer border border-m3-outlineVariant/50 max-w-xs w-full text-center">
            <div className="text-xs text-m3-textSecondary mb-2 font-medium">
              Solve to dismiss:
            </div>
            <div className="text-2xl font-light text-m3-textPrimary mb-3">
              {mathProblem.a} + {mathProblem.b} = ?
            </div>
            <input
              type="number"
              value={mathAnswer}
              onChange={(e) => {
                setMathAnswer(e.target.value);
                setMathError(false);
              }}
              placeholder="Answer"
              className="w-full bg-m3-surface border border-m3-outlineVariant/50 rounded-2xl px-4 py-2 text-center text-lg text-white focus:outline-none focus:border-m3-primary"
            />
            {mathError && (
              <span className="text-xs text-m3-error mt-2 block">
                Incorrect answer. Try again.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Google Clock Action Controls */}
      <div className="w-full max-w-sm flex items-center justify-between gap-4 pb-10">
        {/* Snooze Button */}
        <button
          onClick={handleSnooze}
          className="flex-1 py-4 rounded-full bg-m3-surfaceContainer hover:bg-m3-surfaceHigh text-m3-textSecondary font-medium text-sm transition active:scale-95"
        >
          Snooze
        </button>

        {/* Dismiss Button */}
        <button
          onClick={handleDismissAttempt}
          className="flex-1 py-4 rounded-full bg-m3-primary text-m3-onPrimary font-medium text-sm shadow-lg hover:bg-m3-primaryContainer hover:text-white transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Dismiss</span>
        </button>
      </div>
    </div>
  );
};
