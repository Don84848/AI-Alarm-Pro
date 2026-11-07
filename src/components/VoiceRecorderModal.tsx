import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface VoiceRecorderModalProps {
  profile: UserProfile;
  onVoiceSubmitted: (transcribedText: string) => void;
  onClose: () => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  profile,
  onVoiceSubmitted,
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState<'ur-PK' | 'en-US'>('ur-PK');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Start listening automatically on mount
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      // ignore
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [selectedLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onVoiceSubmitted(transcript.trim());
      onClose();
    }
  };

  const SAMPLE_VOICE_COMMANDS = [
    { ur: 'صبح 6 بجے جم کے لیے جگاؤ', en: 'Wake me up at 6 AM for gym' },
    { ur: 'فلائٹ کل رات 10 بجے ہے، ایئرپورٹ بفر کے ساتھ الارم لگاؤ', en: 'Flight at 10 PM, set alarm with airport drive' },
    { ur: 'فجر نماز سے 25 منٹ پہلے الارم لگاؤ', en: 'Set alarm 25 minutes before Fajr prayer' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Voice Wake Assistant</h3>
              <p className="text-[11px] text-slate-400">Speak naturally in Urdu or English</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language selector toggle */}
        <div className="flex justify-center gap-2 my-4">
          <button
            onClick={() => setSelectedLang('ur-PK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedLang === 'ur-PK'
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : 'bg-dark-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            اردو (Urdu)
          </button>
          <button
            onClick={() => setSelectedLang('en-US')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedLang === 'en-US'
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : 'bg-dark-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            English (US)
          </button>
        </div>

        {/* Central Animated Mic Orb */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            {isListening && (
              <>
                <span className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping"></span>
                <span className="absolute -inset-8 rounded-full bg-violet-500/10 animate-pulse"></span>
              </>
            )}

            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
                isListening
                  ? 'bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shadow-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isListening ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-8 bg-white rounded-full animate-bounce [animation-delay:0s]"></span>
                  <span className="w-1.5 h-12 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:0.3s]"></span>
                </div>
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          <p className="mt-4 text-xs font-medium text-slate-300">
            {isListening ? 'Listening... Speak your alarm request' : 'Tap microphone to speak'}
          </p>
        </div>

        {/* Transcription display box */}
        <div className="min-h-[80px] bg-dark-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-white flex flex-col justify-between">
          <p className={transcript ? 'text-white' : 'text-slate-500 italic text-xs'}>
            {transcript || 'e.g., "Kal subah 6 baje gym ke liye utha dena..."'}
          </p>
        </div>

        {!speechSupported && (
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Voice recognition requires microphone permissions or Chrome/Edge browser.</span>
          </div>
        )}

        {/* Quick Voice Prompt Suggestions */}
        <div className="mt-4 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400">Quick Examples to Try:</div>
          {SAMPLE_VOICE_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => setTranscript(selectedLang === 'ur-PK' ? cmd.ur : cmd.en)}
              className="w-full text-left p-2 rounded-xl bg-dark-950 hover:bg-slate-800/80 text-xs text-slate-300 border border-slate-850 transition"
            >
              {selectedLang === 'ur-PK' ? cmd.ur : cmd.en}
            </button>
          ))}
        </div>

        {/* Apply Button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-semibold text-slate-400 bg-dark-950 hover:bg-dark-850 border border-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!transcript.trim()}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              transcript.trim()
                ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 active:scale-95'
                : 'bg-dark-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Set with AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
