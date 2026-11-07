import React, { useState } from 'react';
import { Alarm, AlarmSound, MissionType } from '../types';
import { DAY_NAMES, formatTime24 } from '../utils/timeUtils';
import { audioEngine } from '../utils/audio';
import { SmoothTimePicker } from './SmoothTimePicker';
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            Cancel
          </button>
          <h3 className="text-base font-semibold text-gray-900">
            {alarm ? 'Edit Alarm' : 'Set Alarm'}
          </h3>
          <button
            onClick={handleSave}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            Save
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Smooth Scroll Wheel Time Picker (Finger scroll drum) */}
          <div className="bg-gray-50/70 rounded-3xl p-4 border border-gray-200/80 shadow-inner">
            <SmoothTimePicker
              hours={hours}
              minutes={minutes}
              period={period}
              onChange={(h, m, p) => {
                setHours(h);
                setMinutes(m);
                setPeriod(p);
              }}
            />
          </div>

          {/* Repeat Days */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
              Repeat
            </label>
            <div className="flex items-center justify-between gap-1">
              {DAY_NAMES.map((d, index) => {
                const isSelected = days.includes(index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`w-10 h-10 rounded-full text-xs font-semibold flex items-center justify-center transition active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alarm Label */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Work, Gym, Morning routine"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Alarm Sound Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Alarm Sound
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SOUND_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSound(opt.id);
                    handleTestTone(opt.id);
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl text-xs font-medium border text-left transition ${
                    sound === opt.id
                      ? 'border-blue-500 bg-blue-50/80 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 shrink-0 text-blue-500" />
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {sound === opt.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Wake-up Mission */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Wake-Up Mission (To dismiss alarm)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMission('none')}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-medium border text-center transition ${
                  mission === 'none'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                None (Standard)
              </button>
              <button
                type="button"
                onClick={() => setMission('math')}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-medium border text-center transition ${
                  mission === 'math'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                🧮 Math Problem
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-98 transition"
          >
            Save Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
