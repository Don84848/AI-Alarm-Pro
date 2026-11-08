import React, { useState } from 'react';
import { processAiAlarmPrompt } from '../utils/aiEngine';
import { Alarm, UserProfile } from '../types';
import { Mic, ArrowUp, Upload, Check, Loader2 } from 'lucide-react';

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
  const [feedback, setFeedback] = useState<string | null>(null);

  const QUICK_CHIPS = [
    { label: 'Flight buffer 4 AM', text: 'My flight is at 4:00 AM tomorrow. Calculate 2 hours airport check-in and 45 minutes travel time, and set alarm with prep buffer.' },
    { label: '30m before sunrise', text: 'Wake me up 30 minutes before sunrise with a gentle tone' },
    { label: 'Water every 2h', text: 'Set an alarm every 2 hours from 9 AM to 7 PM to drink water' },
    { label: 'Gym 6:30 AM weekdays', text: 'Wake me up at 6:30 AM on weekdays for gym workout' },
  ];

  const handleSubmit = async (textToProcess?: string) => {
    const text = textToProcess || promptText;
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setFeedback(null);

    try {
      const result = await processAiAlarmPrompt(
        text,
        profile.geminiApiKey,
        undefined,
        profile.selectedModel
      );

      if (result.alarms.length > 0) {
        const createdAlarms: Alarm[] = result.alarms.map((a, idx) => ({
          id: `alarm-${Date.now()}-${idx}`,
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
        setFeedback(result.explanation || `Set ${createdAlarms.length} alarm(s)`);
        setPromptText('');
      }
    } catch (e) {
      console.error('Failed to process AI prompt:', e);
      setFeedback('Unable to process request. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="px-6 py-2 select-none">
      {/* Smart Assistant Input Pill */}
      <div className="relative flex items-center bg-gray-50 hover:bg-gray-100/70 border border-gray-200 focus-within:border-[#00B074] focus-within:bg-white rounded-full transition-all duration-200 px-4 py-2.5 shadow-xs">
        {/* Sparkle Icon */}
        <div className="mr-3 shrink-0 flex items-center justify-center">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
              fill="#00B074"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={
            profile.geminiApiKey
              ? "Ask AI to set alarm (e.g. Flight buffer)..."
              : "Ask AI to set alarm (Gemini API key required)..."
          }
          disabled={isProcessing}
          className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />

        {/* Action icons */}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {promptText.trim() ? (
            <button
              onClick={() => handleSubmit()}
              disabled={isProcessing}
              className="w-8 h-8 rounded-full bg-m3-primary text-m3-onPrimary flex items-center justify-center transition active:scale-95 hover:bg-m3-primaryContainer hover:text-white"
              title="Submit prompt"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="w-8 h-8 rounded-full text-m3-textSecondary hover:text-m3-textPrimary hover:bg-m3-surfaceHighest flex items-center justify-center transition active:scale-95"
                title="Upload timetable or schedule"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="w-8 h-8 rounded-full text-m3-textSecondary hover:text-m3-textPrimary hover:bg-m3-surfaceHighest flex items-center justify-center transition active:scale-95"
                title="Voice command"
              >
                <Mic className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading Bar */}
      {isProcessing && (
        <div className="mt-2 h-0.5 w-full bg-m3-surfaceContainer overflow-hidden rounded-full">
          <div className="h-full bg-m3-primary animate-pulse w-full"></div>
        </div>
      )}

      {/* Subtle Feedback Bar */}
      {feedback && (
        <div className="mt-2.5 px-4 py-2 rounded-2xl bg-m3-surfaceContainer text-xs text-m3-primary flex items-start gap-2 border border-m3-outlineVariant/40">
          <Check className="w-3.5 h-3.5 mt-0.5 text-m3-primary shrink-0" />
          <span className="leading-snug">{feedback}</span>
        </div>
      )}

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmit(chip.text)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-m3-surfaceContainer border border-m3-outlineVariant/40 text-m3-textSecondary hover:text-m3-textPrimary hover:bg-m3-surfaceHigh transition active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
