import React, { useState, useRef, useEffect } from 'react';
import { Alarm, UserProfile, ChatMessage } from '../types';
import { processAiAlarmPrompt } from '../utils/aiEngine';
import { Mic, ArrowUp, Upload, X, Sparkles, Loader2, Bell } from 'lucide-react';

interface AiChatSheetProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAddAlarms: (newAlarms: Alarm[]) => void;
  onOpenUploadModal: () => void;
  onOpenVoiceModal: () => void;
}

export const AiChatSheet: React.FC<AiChatSheetProps> = ({
  profile,
  isOpen,
  onClose,
  onAddAlarms,
  onOpenUploadModal,
  onOpenVoiceModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hi! I'm your smart AI assistant. Tell me when you need to wake up or what your schedule is, and I will calculate the buffers and set your alarms automatically.",
      timestamp: 'Just now',
    }
  ]);

  const QUICK_SUGGESTIONS = [
    { label: '✈️ Flight at 4:30 AM', text: 'My flight is at 4:30 AM tomorrow. Calculate 2 hours airport check-in and 45 minutes travel time, and set alarm with prep buffer.' },
    { label: '🌅 30m before sunrise', text: 'Wake me up 30 minutes before sunrise with a gentle tone' },
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
          text: "I couldn't process that schedule right now. Please check your AI API key in Settings.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end select-none animate-fade-in">
      <div className="w-full max-w-md mx-auto bg-white border-t border-gray-200 rounded-t-3xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Grab Handle */}
        <div
          onClick={onClose}
          className="w-full py-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Sheet Header */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00B074] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
              <span className="text-[11px] text-[#00B074] font-medium block">
                Smart Routine & Alarm Setup
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#00B074] text-white rounded-br-xs'
                    : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Inline created alarms cards */}
                {msg.createdAlarms && msg.createdAlarms.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-gray-100">
                    {msg.createdAlarms.map((alarm) => (
                      <div
                        key={alarm.id}
                        className="p-3 rounded-xl bg-gray-50 flex items-center justify-between border border-gray-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-[#00B074]" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {alarm.time} <span className="text-xs font-normal text-gray-500">{alarm.period}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[160px]">
                              {alarm.label}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#00B074] bg-emerald-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-2 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white border border-gray-200 max-w-[85%] text-xs text-[#00B074] shadow-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-[#00B074]" />
              <span>AI is calculating optimal schedules and alarm buffers...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none no-scrollbar border-t border-gray-100 bg-white">
          {QUICK_SUGGESTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.text)}
              disabled={isProcessing}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 transition active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center bg-gray-100 border border-gray-200 focus-within:border-[#00B074] focus-within:bg-white rounded-full px-4 py-2 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI to set an alarm..."
              disabled={isProcessing}
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />

            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUploadModal();
                }}
                className="w-8 h-8 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition active:scale-95"
                title="Upload schedule image"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVoiceModal();
                }}
                className="w-8 h-8 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition active:scale-95"
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
                    ? 'bg-[#00B074] text-white'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
