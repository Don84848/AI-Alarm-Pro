import React, { useState } from 'react';
import { Alarm, AlarmSound, MissionType, UserProfile } from '../types';
import { DAY_NAMES, formatTime24 } from '../utils/timeUtils';
import { audioEngine } from '../utils/audio';
import { SmoothTimePicker } from './SmoothTimePicker';
import { Volume2, Check, Sparkles, Mic, Upload } from 'lucide-react';

interface AddEditAlarmModalProps {
  alarm?: Alarm | null;
  profile?: UserProfile;
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
  onOpenAiChat?: () => void;
}

export const AddEditAlarmModal: React.FC<AddEditAlarmModalProps> = ({
  alarm,
  profile,
  onSave,
  onClose,
  onOpenAiChat,
}) => {
  const initial = React.useMemo(() => {
    if (alarm) {
      return {
        hours: alarm.time.split(':')[0],
        minutes: alarm.time.split(':')[1],
        period: alarm.period,
        days: alarm.days || [],
      };
    }
    const d = new Date();
    d.setMinutes(d.getMinutes() + 2); // Default to 2 minutes from now for convenient instant testing
    const h = d.getHours();
    const m = d.getMinutes();
    const p: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return {
      hours: h12.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      period: p,
      days: [] as number[], // Default to Once so it rings on the very next occurrence
    };
  }, [alarm]);

  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);
  const [label, setLabel] = useState(alarm ? alarm.label : '');
  const [days, setDays] = useState<number[]>(initial.days);
  const [sound, setSound] = useState<AlarmSound>(alarm?.sound || 'gentle');
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(
    alarm?.snoozeMinutes || profile?.snoozeLength || 10
  );
  const [mission, setMission] = useState<MissionType>(alarm?.mission || 'none');

  const orderedDayIndices = React.useMemo(() => {
    if (profile?.startWeekOn === 'Monday') return [1, 2, 3, 4, 5, 6, 0];
    if (profile?.startWeekOn === 'Saturday') return [6, 0, 1, 2, 3, 4, 5];
    return [0, 1, 2, 3, 4, 5, 6];
  }, [profile?.startWeekOn]);

  const toggleDay = (dayIndex: number) => {
    if (days.includes(dayIndex)) {
      setDays(days.filter(d => d !== dayIndex));
    } else {
      setDays([...days, dayIndex].sort());
    }
  };

  const SOUND_OPTIONS: { id: AlarmSound; label: string }[] = [
    { id: 'gentle', label: 'Gentle Bell' },
    { id: 'radar', label: 'Classic Radar' },
    { id: 'zen', label: 'Zen Chime' },
    { id: 'rooster', label: 'Upbeat Fanfare' },
    { id: 'briefing', label: 'Morning Voice' },
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            Cancel
          </button>
          <h3 className="text-base font-semibold text-gray-900">
            {alarm ? 'Edit Alarm' : 'New Alarm'}
          </h3>
          <button
            onClick={handleSave}
            className="text-sm font-semibold text-[#00B074] hover:text-[#008759] transition"
          >
            Done
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick AI Trigger Banner */}
          {onOpenAiChat && !alarm && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiChat();
              }}
              className="w-full p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100/60 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00B074] text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-gray-900">Ask AI to set this alarm</div>
                  <div className="text-[11px] text-gray-500">e.g. "Flight at 4:30 AM with buffer" or voice</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#00B074] group-hover:translate-x-0.5 transition-transform">
                Try →
              </span>
            </button>
          )}

          {/* Smooth Scroll Wheel Time Picker (Finger scroll drum) */}
          <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80">
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Repeat ({days.length === 0 ? 'Once' : days.length === 7 ? 'Every day' : days.length === 5 && !days.includes(0) && !days.includes(6) ? 'Weekdays' : `${days.length} days`})
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDays([])}
                  className={`px-2 py-0.5 rounded-md transition ${days.length === 0 ? 'bg-emerald-100 text-[#008759] font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Once
                </button>
                <button
                  type="button"
                  onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
                  className={`px-2 py-0.5 rounded-md transition ${days.length === 7 ? 'bg-emerald-100 text-[#008759] font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Every day
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-1">
              {orderedDayIndices.map((dayIndex) => {
                const isSelected = days.includes(dayIndex);
                const dayName = DAY_NAMES[dayIndex];
                return (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => toggleDay(dayIndex)}
                    className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center transition active:scale-95 ${
                      isSelected
                        ? 'bg-[#00B074] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {dayName[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Alarm name (e.g. Work, Gym)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00B074]"
            />
          </div>

          {/* Ringtone Sound */}
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
                  className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium border text-left transition ${
                    sound === opt.id
                      ? 'border-[#00B074] bg-emerald-50 text-[#008759] font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Volume2 className="w-3.5 h-3.5 text-[#00B074] shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {sound === opt.id && <Check className="w-3.5 h-3.5 text-[#00B074]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-[#00B074] hover:bg-[#009E67] shadow-md shadow-emerald-500/20 active:scale-98 transition"
          >
            Save Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
