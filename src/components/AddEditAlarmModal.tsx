import React, { useState } from 'react';
import { Alarm, AlarmSound, MissionType } from '../types';
import { DAY_NAMES, formatTime24 } from '../utils/timeUtils';
import { audioEngine } from '../utils/audio';
import { X, Volume2, Check } from 'lucide-react';

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
  const [label, setLabel] = useState(alarm ? alarm.label : '');
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
    { id: 'gentle', label: 'Gentle Sunrise' },
    { id: 'radar', label: 'Classic Radar' },
    { id: 'cyber', label: 'Cyber Pulse' },
    { id: 'zen', label: 'Tibetan Zen Bowl' },
    { id: 'rooster', label: 'High Energy Fanfare' },
    { id: 'briefing', label: 'AI Voice Briefing' },
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-m3-surfaceContainer border border-m3-outlineVariant/30 rounded-t-4xl sm:rounded-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-m3-surfaceContainer/95 backdrop-blur-md px-6 py-4 border-b border-m3-outlineVariant/30 flex items-center justify-between z-10">
          <h3 className="text-xl font-normal text-m3-textPrimary">
            {alarm ? 'Edit alarm' : 'Add alarm'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-m3-textSecondary hover:bg-m3-surfaceHigh flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Google Clock Digital Time Picker */}
          <div className="bg-m3-surface rounded-4xl p-6 flex items-center justify-center gap-3 border border-m3-outlineVariant/20">
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
              className="w-24 text-center text-6xl font-light text-m3-textPrimary bg-m3-surfaceContainer rounded-3xl py-3 border border-m3-outlineVariant/40 focus:outline-none focus:border-m3-primary"
            />

            <span className="text-5xl text-m3-textTertiary font-light">:</span>

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
              className="w-24 text-center text-6xl font-light text-m3-textPrimary bg-m3-surfaceContainer rounded-3xl py-3 border border-m3-outlineVariant/40 focus:outline-none focus:border-m3-primary"
            />

            {/* AM / PM Toggle */}
            <div className="flex flex-col gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => setPeriod('AM')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition ${
                  period === 'AM'
                    ? 'bg-m3-primaryContainer text-m3-onPrimaryContainer font-bold'
                    : 'bg-m3-surfaceContainer text-m3-textTertiary hover:text-m3-textPrimary'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod('PM')}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition ${
                  period === 'PM'
                    ? 'bg-m3-primaryContainer text-m3-onPrimaryContainer font-bold'
                    : 'bg-m3-surfaceContainer text-m3-textTertiary hover:text-m3-textPrimary'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Repeat Days */}
          <div>
            <label className="block text-xs font-medium text-m3-textSecondary mb-2.5">
              Repeat
            </label>
            <div className="flex items-center justify-between">
              {DAY_NAMES.map((d, index) => {
                const isSelected = days.includes(index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`w-10 h-10 rounded-full text-xs font-medium transition active:scale-90 ${
                      isSelected
                        ? 'bg-m3-primary text-m3-onPrimary font-bold shadow-sm'
                        : 'bg-m3-surfaceHigh text-m3-textSecondary hover:bg-m3-surfaceHighest'
                    }`}
                  >
                    {d[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block text-xs font-medium text-m3-textSecondary mb-1.5">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Alarm label"
              className="w-full bg-m3-surface border border-m3-outlineVariant/50 rounded-2xl px-4 py-3 text-sm text-m3-textPrimary placeholder:text-m3-textTertiary focus:outline-none focus:border-m3-primary"
            />
          </div>

          {/* Sound Selector */}
          <div>
            <label className="block text-xs font-medium text-m3-textSecondary mb-2">
              Alarm sound
            </label>
            <div className="space-y-1.5">
              {SOUND_OPTIONS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSound(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition ${
                    sound === item.id
                      ? 'bg-m3-primaryContainer/40 text-m3-primary font-medium'
                      : 'hover:bg-m3-surfaceHigh text-m3-textSecondary'
                  }`}
                >
                  <span className="text-xs">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestTone(item.id);
                      }}
                      className="p-1 rounded-full hover:bg-m3-surfaceHighest text-m3-textTertiary hover:text-m3-primary"
                      title="Preview sound"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {sound === item.id && <Check className="w-4 h-4 text-m3-primary stroke-[2.5]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wake-Up Mission */}
          <div>
            <label className="block text-xs font-medium text-m3-textSecondary mb-2">
              Dismiss Challenge
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: 'Standard Dismiss' },
                { id: 'math', label: '🧮 Math Puzzle' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMission(m.id as MissionType)}
                  className={`p-3 rounded-2xl text-xs font-medium border text-center transition ${
                    mission === m.id
                      ? 'bg-m3-primaryContainer/30 border-m3-primary/60 text-m3-primary'
                      : 'bg-m3-surface border-m3-outlineVariant/30 text-m3-textTertiary hover:text-m3-textPrimary'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-m3-surfaceContainer/95 backdrop-blur-md px-6 py-4 border-t border-m3-outlineVariant/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-m3-textSecondary hover:text-m3-textPrimary transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full text-xs font-medium bg-m3-primary text-m3-onPrimary shadow-md hover:bg-m3-primaryContainer hover:text-white active:scale-95 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
