import React, { useState } from 'react';
import { Alarm } from '../types';
import { DAY_NAMES } from '../utils/timeUtils';
import { Trash2, Volume2, Edit3, Sparkles } from 'lucide-react';

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
    if (!alarm.days || alarm.days.length === 0) return 'Once (Tomorrow)';
    if (alarm.days.length === 7) return 'Every day';
    if (alarm.days.length === 5 && !alarm.days.includes(0) && !alarm.days.includes(6)) return 'Weekdays';
    if (alarm.days.length === 2 && alarm.days.includes(0) && alarm.days.includes(6)) return 'Weekends';
    return alarm.days.map(d => DAY_NAMES[d]).join(', ');
  };

  return (
    <div className="py-3 px-1 transition-colors border-b border-gray-100 last:border-none select-none">
      {/* Main Alarm Row (Exact match to stock screenshot) */}
      <div className="flex items-center justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Time & Period */}
          <div className="flex items-baseline">
            <span
              className={`text-4xl tracking-tight font-light ${
                alarm.isEnabled ? 'text-gray-900 font-sans' : 'text-gray-400'
              }`}
            >
              {alarm.time}
            </span>
            <span
              className={`text-sm font-medium ml-2 ${
                alarm.isEnabled ? 'text-gray-700' : 'text-gray-400'
              }`}
            >
              {alarm.period}
            </span>
          </div>

          {/* Subtitle: Days / Label */}
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
            <span>{getDaysSummary()}</span>
            {alarm.label && alarm.label !== 'Alarm' && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600 truncate max-w-[140px]">{alarm.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Stock Toggle Switch (#00B074 when enabled) */}
        <div>
          <button
            onClick={() => onToggle(alarm.id)}
            role="switch"
            aria-checked={alarm.isEnabled}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
              alarm.isEnabled ? 'bg-[#00B074]' : 'bg-gray-200'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                alarm.isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* AI Reasoning pill (if set via smart scheduling) */}
      {alarm.aiReasoning && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[11px] text-[#008759] font-medium border border-emerald-100">
          <Sparkles className="w-3 h-3 text-[#00B074]" />
          <span className="truncate max-w-[280px]">{alarm.aiReasoning}</span>
        </div>
      )}

      {/* Expandable Controls for Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between animate-fade-in text-xs">
          <button
            onClick={() => onPreviewSound(alarm)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-lg bg-gray-50 transition"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#00B074]" />
            <span className="capitalize">{alarm.sound}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(alarm)}
              className="text-[#00B074] hover:underline font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(alarm.id)}
              className="text-gray-400 hover:text-red-500 transition"
              title="Delete alarm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
