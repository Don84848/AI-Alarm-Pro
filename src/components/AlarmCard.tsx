import React from 'react';
import { Alarm } from '../types';
import { DAY_NAMES } from '../utils/timeUtils';
import { Sparkles, Trash2, Edit3, Volume2, ShieldCheck, Zap } from 'lucide-react';

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
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl p-5 border transition-all duration-300 ${
        alarm.isEnabled
          ? 'bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border-slate-800 shadow-lg shadow-black/40 hover:border-cyan-500/40'
          : 'bg-dark-950/60 border-slate-850 opacity-60 hover:opacity-80'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Time and Label */}
        <div className="flex-1 cursor-pointer" onClick={() => onEdit(alarm)}>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-extrabold tracking-tight font-mono transition-colors ${
                alarm.isEnabled ? 'text-white' : 'text-slate-400'
              }`}
            >
              {alarm.time}
            </span>
            <span
              className={`text-sm font-bold ${
                alarm.isEnabled ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              {alarm.period}
            </span>
          </div>

          {/* Label + AI badge */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-semibold text-slate-300 truncate max-w-[180px]">
              {alarm.label || 'Alarm'}
            </span>

            {alarm.isAiGenerated && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/40">
                <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                <span>AI Scheduled</span>
              </span>
            )}

            {alarm.mission && alarm.mission !== 'none' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                <span className="capitalize">{alarm.mission} Challenge</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Toggle Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(alarm.id)}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              alarm.isEnabled ? 'bg-gradient-to-r from-cyan-500 to-violet-600 shadow-md shadow-cyan-500/20' : 'bg-slate-800'
            }`}
            role="switch"
            aria-checked={alarm.isEnabled}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                alarm.isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Days Repeat Selector & AI Reasoning */}
      <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
        {/* Days bubbles */}
        <div className="flex items-center gap-1">
          {DAY_NAMES.map((d, index) => {
            const isDayActive = alarm.days && alarm.days.includes(index);
            return (
              <span
                key={index}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                  isDayActive && alarm.isEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : isDayActive
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'text-slate-600'
                }`}
              >
                {d[0]}
              </span>
            );
          })}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
          <button
            onClick={() => onPreviewSound(alarm)}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition"
            title="Preview Tone"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEdit(alarm)}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            title="Edit Alarm"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(alarm.id)}
            className="w-7 h-7 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition"
            title="Delete Alarm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* If AI reasoning is present, show a small subtle research note */}
      {alarm.aiReasoning && (
        <div className="mt-2 text-[11px] text-slate-400/90 italic bg-dark-950/40 px-2.5 py-1 rounded-xl border border-slate-850">
          💡 AI: {alarm.aiReasoning}
        </div>
      )}
    </div>
  );
};
