import React, { useState } from 'react';
import { Alarm } from '../types';
import { DAY_NAMES } from '../utils/timeUtils';
import { Trash2, Volume2, Check, Sparkles } from 'lucide-react';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onPreviewSound: (alarm: Alarm) => void;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onToggle,
  onEdit,
  onDelete,
  onPreviewSound,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDaysSummary = () => {
    if (!alarm.days || alarm.days.length === 0) return 'Once';
    if (alarm.days.length === 7) return 'Every day';
    if (alarm.days.length === 5 && !alarm.days.includes(0) && !alarm.days.includes(6)) return 'Weekdays';
    if (alarm.days.length === 2 && alarm.days.includes(0) && alarm.days.includes(6)) return 'Weekends';
    return alarm.days.map(d => DAY_NAMES[d]).join(', ');
  };

  return (
    <div
      className={`rounded-3xl p-5 transition-all duration-200 select-none border ${
        alarm.isEnabled
          ? 'bg-white border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-gray-900'
          : 'bg-gray-50/70 border-gray-200/50 text-gray-400 shadow-none'
      }`}
    >
      {/* Top Row: Time & Switch */}
      <div className="flex items-center justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Big Time Display */}
          <div className="flex items-baseline">
            <span
              className={`text-4xl sm:text-5xl tracking-tight font-light ${
                alarm.isEnabled ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {alarm.time}
            </span>
            <span
              className={`text-base font-medium ml-1.5 ${
                alarm.isEnabled ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {alarm.period}
            </span>
          </div>

          {/* Label & Days */}
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className={`font-medium ${alarm.isEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
              {alarm.label || 'Alarm'}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 truncate max-w-[160px]">
              {getDaysSummary()}
            </span>
          </div>
        </div>

        {/* Smooth iOS / Stock Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(alarm.id)}
            role="switch"
            aria-checked={alarm.isEnabled}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${
              alarm.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                alarm.isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {alarm.isEnabled && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
            </span>
          </button>
        </div>
      </div>

      {/* AI Reasoning Pill */}
      {alarm.aiReasoning && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-[11px] text-blue-700 font-medium">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span className="truncate max-w-[280px]">{alarm.aiReasoning}</span>
        </div>
      )}

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
          {/* Day Circles */}
          <div className="flex items-center justify-between gap-1">
            {DAY_NAMES.map((dayName, idx) => {
              const isActive = alarm.days && alarm.days.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => onEdit(alarm)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition active:scale-95 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {dayName[0]}
                </button>
              );
            })}
          </div>

          {/* Sound & Actions Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => onPreviewSound(alarm)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="capitalize">{alarm.sound}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(alarm)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(alarm.id)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition"
                title="Delete alarm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
