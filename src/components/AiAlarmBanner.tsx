import React, { useState } from 'react';
import { Sparkles, Mic, MicOff, Send, Upload, Clock, Compass, Brain, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { processAiAlarmPrompt } from '../utils/aiEngine';
import { Alarm, UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface AiAlarmBannerProps {
  profile: UserProfile;
  onAddAlarms: (newAlarms: Alarm[]) => void;
  onOpenUploadModal: () => void;
  onOpenVoiceModal: () => void;
}

export const AiAlarmBanner: React.FC<AiAlarmBannerProps> = ({
  profile,
  onAddAlarms,
  onOpenUploadModal,
  onOpenVoiceModal,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReasoning, setLastReasoning] = useState<{ explanation: string; count: number } | null>(null);

  const QUICK_PROMPTS = [
    { label: '✈️ Flight 4 AM (Calculate Prep + Drive)', prompt: 'My flight is at 4:00 AM tomorrow. Calculate 2 hours airport check-in and 45 minutes travel time, and set alarm with prep buffer.' },
    { label: '🕌 Fajr se 30 min pehle', prompt: 'Fajr namaz se 30 minute pehle ka alarm lagao rozana ke liye' },
    { label: '💧 Water every 2 hours', prompt: 'Set an alarm every 2 hours from 9 AM to 7 PM to drink water' },
    { label: '💪 Gym at 6:30 AM', prompt: 'Wake me up at 6:30 AM on weekdays for gym with high energy tone' },
    { label: '🎓 Exam Prep at 9 AM', prompt: 'I have an exam at 9:00 AM, wake me up 1.5 hours before with loud alarm' }
  ];

  const handleSubmit = async (textToProcess?: string) => {
    const text = textToProcess || promptText;
    if (!text.trim()) return;

    setIsProcessing(true);
    setLastReasoning(null);

    try {
      const result = await processAiAlarmPrompt(text, profile.geminiApiKey);

      if (result.alarms.length > 0) {
        const createdAlarms: Alarm[] = result.alarms.map((a, idx) => ({
          id: `ai-alarm-${Date.now()}-${idx}`,
          time: a.time,
          period: a.period,
          rawTime24: a.rawTime24,
          label: a.label,
          days: a.days,
          isEnabled: true,
          sound: a.sound || 'gentle',
          snoozeMinutes: 5,
          isAiGenerated: true,
          aiPrompt: text,
          aiReasoning: a.reasoning || result.explanation,
          mission: 'none',
        }));

        onAddAlarms(createdAlarms);
        setLastReasoning({
          explanation: result.explanation,
          count: createdAlarms.length,
        });
        setPromptText('');

        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      console.error('Failed to process AI prompt:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="px-5 py-2">
      <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 shadow-xl shadow-cyan-500/10">
        <div className="rounded-[23px] bg-dark-900/95 backdrop-blur-xl p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Set Alarm with AI
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                    Smart Engine
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Speak, write, or upload your schedule — AI handles the rest!
                </p>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 border border-slate-700/60 transition active:scale-95 shadow-sm"
              title="Upload Schedule, Flight Ticket, or Timetable"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Upload Schedule</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>

          {/* Input field + Voice button + Send button */}
          <div className="relative flex items-center mt-3">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g., 'Flight kal subah 4 baje hai, tayari aur drive buffer ke sath alarm lagao'..."
              className="w-full bg-dark-950/80 border border-slate-800 rounded-2xl pl-4 pr-24 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
              disabled={isProcessing}
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {/* Voice Input Mic Button */}
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="w-8 h-8 rounded-xl bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 flex items-center justify-center transition active:scale-95"
                title="Voice Command (Speak in Urdu or English)"
              >
                <Mic className="w-4 h-4 text-violet-400" />
              </button>

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!promptText.trim() || isProcessing}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-95 ${
                  promptText.trim() && !isProcessing
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-dark-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Processing State Banner */}
          {isProcessing && (
            <div className="mt-3 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-2.5 text-xs text-cyan-300 animate-pulse">
              <Brain className="w-4 h-4 animate-bounce text-cyan-400 shrink-0" />
              <span>AI is researching optimal timing, calculating travel & preparation buffers...</span>
            </div>
          )}

          {/* Success / Explanation Feedback */}
          {lastReasoning && (
            <div className="mt-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2.5 text-xs text-emerald-300 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">
                  Successfully created {lastReasoning.count} {lastReasoning.count > 1 ? 'alarms' : 'alarm'}!
                </span>
                <p className="text-emerald-400/90 mt-0.5">{lastReasoning.explanation}</p>
              </div>
            </div>
          )}

          {/* Quick Smart Suggestion Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {QUICK_PROMPTS.map((qp, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(qp.prompt)}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-dark-950/70 border border-slate-800/80 text-[11px] font-medium text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-dark-850 transition active:scale-95 flex items-center gap-1"
              >
                <span>{qp.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
