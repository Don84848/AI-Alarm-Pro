import React, { useState, useRef, useEffect } from 'react';
import { Alarm, UserProfile, ChatMessage } from '../types';
import { processAiAlarmPrompt } from '../utils/aiEngine';
import { Mic, ArrowUp, Upload, X, ChevronDown, Sparkles, Check, Loader2, Volume2, Bell } from 'lucide-react';

interface AiChatSheetProps {
  profile: UserProfile;
  onAddAlarms: (newAlarms: Alarm[]) => void;
  onOpenUploadModal: () => void;
  onOpenVoiceModal: () => void;
}

export const AiChatSheet: React.FC<AiChatSheetProps> = ({
  profile,
  onAddAlarms,
  onOpenUploadModal,
  onOpenVoiceModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! I'm your Gemini alarm assistant. Tell me when you need to wake up or what your schedule is, and I'll research and calculate the optimal buffers for you.",
      timestamp: 'Just now',
    }
  ]);

  const QUICK_SUGGESTIONS = [
    { label: '✈️ Flight at 4:30 AM', text: 'My flight is at 4:30 AM tomorrow. Calculate 2 hours airport check-in and 45 minutes travel time, and set alarm with prep buffer.' },
    { label: '🌅 30m before sunrise', text: 'Wake me up 30 minutes before sunrise with a soothing tone' },
    { label: '💧 Water every 2h', text: 'Set an alarm every 2 hours from 9 AM to 7 PM to drink water' },
    { label: '💪 Gym 6:30 AM', text: 'Wake me up at 6:30 AM on weekdays for gym workout' },
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);
    setIsOpen(true);

    try {
      const result = await processAiAlarmPrompt(
        text,
        profile.geminiApiKey,
        undefined,
        profile.selectedModel
      );

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

      if (createdAlarms.length > 0) {
        onAddAlarms(createdAlarms);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: result.explanation || `I have scheduled ${createdAlarms.length} alarm(s) for you.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAlarms: createdAlarms.length > 0 ? createdAlarms : undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error('Error generating alarm via chat:', e);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: "I couldn't process that schedule right now. Please check your settings or try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* 1. Bottom-Middle Docked Chat Pill (Collapsed State) */}
      {!isOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-30 select-none">
          <div className="flex items-center bg-m3-surfaceContainer/95 hover:bg-m3-surfaceHigh border border-m3-outlineVariant/50 focus-within:border-m3-primary focus-within:bg-m3-surfaceHigh rounded-full px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all duration-200">
            {/* Gemini Sparkle */}
            <button
              onClick={() => setIsOpen(true)}
              className="mr-2.5 shrink-0 hover:scale-105 active:scale-95 transition"
              title="Open Gemini Chat"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
                  fill="url(#gemini-pill-grad)"
                />
                <defs>
                  <linearGradient id="gemini-pill-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4285F4" />
                    <stop offset="0.33" stopColor="#9B72CB" />
                    <stop offset="0.66" stopColor="#D96570" />
                    <stop offset="1" stopColor="#F4B400" />
                  </linearGradient>
                </defs>
              </svg>
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Ask Gemini to set alarm..."
              className="w-full bg-transparent text-sm text-m3-textPrimary placeholder:text-m3-textTertiary focus:outline-none cursor-pointer"
            />

            {/* Right Buttons */}
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {inputText.trim() ? (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="w-8 h-8 rounded-full bg-m3-primary text-m3-onPrimary flex items-center justify-center transition active:scale-95"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenUploadModal();
                    }}
                    className="w-8 h-8 rounded-full text-m3-textSecondary hover:text-m3-textPrimary hover:bg-m3-surfaceHighest flex items-center justify-center transition active:scale-95"
                    title="Upload schedule or timetable"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVoiceModal();
                    }}
                    className="w-8 h-8 rounded-full text-m3-textSecondary hover:text-m3-textPrimary hover:bg-m3-surfaceHighest flex items-center justify-center transition active:scale-95"
                    title="Voice command"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Expanded AI Conversational Chat Sheet (Bottom-Middle Sheet) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end select-none animate-fade-in">
          <div className="w-full max-w-md mx-auto bg-m3-surfaceContainer border-t border-m3-outlineVariant/30 rounded-t-4xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
            {/* Grab Handle */}
            <div
              onClick={() => setIsOpen(false)}
              className="w-full py-2 flex items-center justify-center cursor-pointer hover:bg-m3-surfaceHigh/40 transition"
            >
              <div className="w-10 h-1 bg-m3-outlineVariant rounded-full"></div>
            </div>

            {/* Sheet Header */}
            <div className="px-6 py-3 border-b border-m3-outlineVariant/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-m3-surface flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
                      fill="url(#gemini-sheet-grad)"
                    />
                    <defs>
                      <linearGradient id="gemini-sheet-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4285F4" />
                        <stop offset="0.33" stopColor="#9B72CB" />
                        <stop offset="0.66" stopColor="#D96570" />
                        <stop offset="1" stopColor="#F4B400" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-m3-textPrimary">Gemini Assistant</h3>
                  <span className="text-[10px] text-m3-primary font-medium block">
                    {profile.selectedModel || 'Gemini 2.5 Flash'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full text-m3-textSecondary hover:bg-m3-surfaceHigh flex items-center justify-center transition"
                title="Collapse chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-3xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-m3-primaryContainer text-m3-onPrimaryContainer rounded-br-sm'
                        : 'bg-m3-surface text-m3-textPrimary border border-m3-outlineVariant/30 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Inline created alarms cards inside message */}
                    {msg.createdAlarms && msg.createdAlarms.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-m3-outlineVariant/30">
                        {msg.createdAlarms.map((alarm) => (
                          <div
                            key={alarm.id}
                            className="p-3 rounded-2xl bg-m3-surfaceContainer flex items-center justify-between border border-m3-outlineVariant/40"
                          >
                            <div className="flex items-center gap-2.5">
                              <Bell className="w-4 h-4 text-m3-primary" />
                              <div>
                                <div className="text-base font-normal text-m3-textPrimary">
                                  {alarm.time} <span className="text-xs font-medium text-m3-textSecondary">{alarm.period}</span>
                                </div>
                                <div className="text-xs text-m3-textTertiary truncate max-w-[160px]">
                                  {alarm.label}
                                </div>
                              </div>
                            </div>
                            <span className="text-[11px] font-medium text-m3-primary bg-m3-primaryContainer/40 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-m3-textTertiary mt-1 px-2">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 p-3.5 rounded-3xl bg-m3-surface border border-m3-outlineVariant/30 max-w-[80%] text-xs text-m3-primary animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-m3-primary" />
                  <span>Gemini is researching and setting your alarm...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-5 py-2 overflow-x-auto flex items-center gap-2 scrollbar-none no-scrollbar border-t border-m3-outlineVariant/20 bg-m3-surface">
              {QUICK_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  disabled={isProcessing}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-m3-surfaceContainer hover:bg-m3-surfaceHigh border border-m3-outlineVariant/40 text-m3-textSecondary hover:text-m3-textPrimary transition active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-m3-surface border-t border-m3-outlineVariant/30">
              <div className="flex items-center bg-m3-surfaceContainer border border-m3-outlineVariant/50 focus-within:border-m3-primary rounded-full px-4 py-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Gemini to set alarm..."
                  disabled={isProcessing}
                  className="w-full bg-transparent text-sm text-m3-textPrimary placeholder:text-m3-textTertiary focus:outline-none"
                />

                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenUploadModal}
                    className="w-8 h-8 rounded-full text-m3-textSecondary hover:text-m3-textPrimary flex items-center justify-center transition active:scale-95"
                    title="Upload schedule"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenVoiceModal}
                    className="w-8 h-8 rounded-full text-m3-textSecondary hover:text-m3-textPrimary flex items-center justify-center transition active:scale-95"
                    title="Voice command"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isProcessing}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 ${
                      inputText.trim() && !isProcessing
                        ? 'bg-m3-primary text-m3-onPrimary'
                        : 'text-m3-textTertiary cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
