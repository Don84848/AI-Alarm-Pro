import React, { useState } from 'react';
import { Alarm, AlarmSound, MissionType } from '../types';
import { DAY_NAMES, formatTime24 } from '../utils/timeUtils';
import { audioEngine } from '../utils/audio';
import { X, Volume2, Bell, Zap, Clock, Check } from 'lucide-react';

interface AddEditAlarmModalProps {
  alarm?: Alarm | null;
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
}

export const AddEditAlarmModal: React.FC<AddEditAlarmModalProps> = ({
  alarm,
  onSave,
  onClose,
}) => {
  const [hours, setHours] = useState(alarm ? alarm.time.split(':')[0] : '07');
  const [minutes, setMinutes] = useState(alarm ? alarm.time.split(':')[1] : '00');
  const [period, setPeriod] = useState<'AM' | 'PM'>(alarm ? alarm.period : 'AM');
  const [label, setLabel] = useState(alarm ? alarm.label : 'Wake Up');
  const [days, setDays] = useState<number[]>(alarm?.days || [1, 2, 3, 4, 5]);
  const [sound, setSound] = useState<AlarmSound>(alarm?.sound || 'gentle');
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(alarm?.snoozeMinutes || 5);
  const [mission, setMission] = useState<MissionType>(alarm?.mission || 'none');

  const toggleDay = (dayIndex: number) => {
    if (days.includes(dayIndex)) {
      setDays(days.filter(d => d !== dayIndex));
    } else {
      setDays([...days, dayIndex].sort());
    }
  };

  const SOUND_OPTIONS: { id: AlarmSound; label: string }[] = [
    { id: 'gentle', label: '🌅 Gentle Sunrise (Marimba)' },
    { id: 'radar', label: '📡 Sonar Radar (Loud)' },
    { id: 'cyber', label: '⚡ Cyberpunk Pulse' },
    { id: 'zen', label: '🧘 Zen Tibetan Bowl' },
    { id: 'rooster', label: '🐓 High Energy Fanfare' },
    { id: 'briefing', label: '🎙️ AI Voice Briefing' },
  ];

  const handleTestTone = (soundId: AlarmSound) => {
    audioEngine.playSound(soundId, 2);
  };

  const handleSave = () => {
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
    const time12 = `${formattedHours}:${formattedMinutes}`;
    const rawTime24 = formatTime24(time12, period);

    const newAlarm: Alarm = {
      id: alarm ? alarm.id : `alarm-${Date.now()}`,
      time: time12,
      period,
      rawTime24,
      label: label.trim() || 'Alarm',
      days,
      isEnabled: true,
      sound,
      snoozeMinutes,
      mission,
      isAiGenerated: alarm ? alarm.isAiGenerated : false,
      aiReasoning: alarm ? alarm.aiReasoning : undefined,
    };

    onSave(newAlarm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              {alarm ? 'Edit Alarm' : 'Set New Alarm'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Time Dial / Picker */}
          <div className="bg-dark-950/70 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-center gap-3 shadow-inner">
            {/* Hours Input */}
            <input
              type="number"
              min="1"
              max="12"
              value={hours}
              onChange={(e) => {
                let v = parseInt(e.target.value, 10);
                if (v > 12) v = 12;
                if (v < 1) v = 1;
                setHours(v.toString().padStart(2, '0'));
              }}
              className="w-20 text-center text-4xl sm:text-5xl font-extrabold font-mono text-white bg-dark-850 rounded-2xl py-2 border border-slate-700 focus:outline-none focus:border-cyan-500"
            />

            <span className="text-4xl font-mono text-slate-500 font-bold">:</span>

            {/* Minutes Input */}
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => {
                let v = parseInt(e.target.value, 10);
                if (v > 59) v = 59;
                if (v < 0) v = 0;
                setMinutes(v.toString().padStart(2, '0'));
              }}
              className="w-20 text-center text-4xl sm:text-5xl font-extrabold font-mono text-white bg-dark-850 rounded-2xl py-2 border border-slate-700 focus:outline-none focus:border-cyan-500"
            />

            {/* AM / PM Toggle buttons */}
            <div className="flex flex-col gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => setPeriod('AM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  period === 'AM'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-dark-850 text-slate-400 hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod('PM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  period === 'PM'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-dark-850 text-slate-400 hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Alarm Label */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Alarm Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gym Workout, Morning Meeting..."
              className="w-full bg-dark-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Repeat Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Repeat Days
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAY_NAMES.map((d, index) => {
                const isSelected = days.includes(index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`py-2 rounded-xl text-xs font-bold transition active:scale-90 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shadow-sm'
                        : 'bg-dark-950 text-slate-500 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alarm Sound Tone */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Alarm Tone & Sound
            </label>
            <div className="space-y-2">
              {SOUND_OPTIONS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSound(item.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                    sound === item.id
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                      : 'bg-dark-950/60 border-slate-800/80 text-slate-300 hover:bg-dark-950'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestTone(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-dark-850 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"
                      title="Test Tone"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {sound === item.id && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wakeup Mission Challenge */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Wake Up Mission (Guaranteed Wakeup)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: 'Simple Dismiss' },
                { id: 'math', label: '🧮 Math Puzzle' },
                { id: 'shake', label: '📱 Shake Phone' },
                { id: 'quote', label: '🌟 AI Morning Quote' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMission(m.id as MissionType)}
                  className={`p-3 rounded-2xl text-xs font-semibold border text-left transition ${
                    mission === m.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-dark-900/95 backdrop-blur-md px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition"
          >
            Save Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
