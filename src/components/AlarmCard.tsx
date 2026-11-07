import React, { useState } from 'react';
import { Alarm } from '../types';
import { DAY_NAMES } from '../utils/timeUtils';
import { ChevronDown, ChevronUp, Trash2, Volume2, Sparkles, Check } from 'lucide-react';

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

  // Active days string (e.g. "Mon, Tue, Wed, Thu, Fri" or "Every day" or "Once")
  const getDaysSummary = () => {
    if (!alarm.days || alarm.days.length === 0) return 'Once';
    if (alarm.days.length === 7) return 'Every day';
    if (alarm.days.length === 5 && !alarm.days.includes(0) && !alarm.days.includes(6)) return 'Weekdays';
    if (alarm.days.length === 2 && alarm.days.includes(0) && alarm.days.includes(6)) return 'Weekends';
    return alarm.days.map(d => DAY_NAMES[d]).join(', ');
  };

  return (
    <div
      className={`rounded-4xl p-5 transition-all duration-200 select-none ${
        alarm.isEnabled
          ? 'bg-m3-surfaceContainer text-m3-textPrimary shadow-sm hover:bg-m3-surfaceHigh'
          : 'bg-m3-surfaceLow text-m3-textTertiary opacity-70 hover:opacity-90'
      }`}
    >
      {/* Top Row: Time & Switch */}
      <div className="flex items-center justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Big Google Clock Numerals */}
          <div className="flex items-baseline">
            <span
              className={`text-5xl tracking-tight font-normal ${
                alarm.isEnabled ? 'text-m3-textPrimary' : 'text-m3-textTertiary'
              }`}
            >
              {alarm.time}
            </span>
            <span
              className={`text-base font-medium ml-1.5 ${
                alarm.isEnabled ? 'text-m3-textSecondary' : 'text-m3-textTertiary'
              }`}
            >
              {alarm.period}
            </span>
          </div>

          {/* Label & Days Summary */}
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className={alarm.isEnabled ? 'text-m3-textSecondary font-medium' : 'text-m3-textTertiary'}>
              {alarm.label || 'Alarm'}
            </span>
            <span className="text-m3-textTertiary">•</span>
            <span className="text-m3-textTertiary truncate max-w-[150px]">
              {getDaysSummary()}
            </span>
          </div>
        </div>

        {/* Material 3 Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(alarm.id)}
            role="switch"
            aria-checked={alarm.isEnabled}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${
              alarm.isEnabled ? 'bg-m3-primary' : 'bg-m3-surfaceHighest border border-m3-outlineVariant'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                alarm.isEnabled
                  ? 'translate-x-6 bg-m3-onPrimary text-m3-primary'
                  : 'translate-x-0 bg-m3-outline text-transparent'
              }`}
            >
              {alarm.isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </span>
          </button>
        </div>
      </div>

      {/* AI Reasoning pill (if set by AI) */}
      {alarm.aiReasoning && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-m3-surfaceHigh border border-m3-outlineVariant/50 text-[11px] text-m3-primary">
          <span className="text-[10px]">✦</span>
          <span className="truncate max-w-[280px]">{alarm.aiReasoning}</span>
        </div>
      )}

      {/* Expanded Controls (Google Clock Style Accordion) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-m3-outlineVariant/40 space-y-4 animate-fade-in">
          {/* Day Circles */}
          <div className="flex items-center justify-between">
            {DAY_NAMES.map((dayName, idx) => {
              const isActive = alarm.days && alarm.days.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => onEdit(alarm)}
                  className={`w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center transition active:scale-95 ${
                    isActive
                      ? 'bg-m3-primary text-m3-onPrimary font-bold shadow-sm'
                      : 'bg-m3-surfaceHigh text-m3-textSecondary hover:bg-m3-surfaceHighest'
                  }`}
                >
                  {dayName[0]}
                </button>
              );
            })}
          </div>

          {/* Sound & Actions Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onPreviewSound(alarm)}
              className="flex items-center gap-2 text-xs font-medium text-m3-textSecondary hover:text-m3-textPrimary px-3 py-1.5 rounded-full bg-m3-surfaceHigh hover:bg-m3-surfaceHighest transition"
            >
              <Volume2 className="w-4 h-4 text-m3-primary" />
              <span className="capitalize">{alarm.sound}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(alarm)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-m3-textSecondary hover:text-m3-textPrimary hover:bg-m3-surfaceHigh transition"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(alarm.id)}
                className="w-8 h-8 rounded-full text-m3-textTertiary hover:text-m3-error hover:bg-m3-surfaceHigh flex items-center justify-center transition"
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
