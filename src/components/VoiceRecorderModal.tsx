import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Check, AlertCircle } from 'lucide-react';
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
  const [selectedLang, setSelectedLang] = useState<'en-US' | 'ur-PK'>('en-US');
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

  const EXAMPLES = [
    'Wake me up tomorrow at 6:30 AM for morning run',
    'Flight is at 4:30 AM, calculate 2h airport and 45m drive buffer',
    'Set a reminder to drink water every 2 hours from 9 AM to 7 PM',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-m3-surfaceContainer border border-m3-outlineVariant/30 rounded-t-4xl sm:rounded-4xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-m3-outlineVariant/30">
          <div>
            <h3 className="text-lg font-normal text-m3-textPrimary">Voice Command</h3>
            <p className="text-xs text-m3-textTertiary">Tell Gemini when to set your alarm</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-m3-textSecondary hover:bg-m3-surfaceHigh flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Google Microphone */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            {isListening && (
              <span className="absolute -inset-3 rounded-full bg-m3-primary/20 animate-ping"></span>
            )}

            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md ${
                isListening
                  ? 'bg-m3-primary text-m3-onPrimary'
                  : 'bg-m3-surfaceHigh text-m3-textSecondary hover:bg-m3-surfaceHighest'
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
          </div>

          <p className="mt-4 text-xs font-medium text-m3-textSecondary">
            {isListening ? 'Listening...' : 'Tap microphone to speak'}
          </p>
        </div>

        {/* Transcript Box */}
        <div className="min-h-[72px] bg-m3-surface border border-m3-outlineVariant/40 rounded-3xl p-4 text-sm text-m3-textPrimary flex flex-col justify-between">
          <p className={transcript ? 'text-m3-textPrimary' : 'text-m3-textTertiary italic text-xs'}>
            {transcript || 'e.g. "Wake me up at 6:30 AM tomorrow for workout"'}
          </p>
        </div>

        {!speechSupported && (
          <div className="mt-2 text-xs text-m3-error flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Voice input requires microphone permissions.</span>
          </div>
        )}

        {/* Examples */}
        <div className="mt-4 space-y-1.5">
          <div className="text-[11px] font-medium text-m3-textTertiary">Try saying:</div>
          {EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setTranscript(ex)}
              className="w-full text-left p-2.5 rounded-2xl bg-m3-surface hover:bg-m3-surfaceHigh text-xs text-m3-textSecondary border border-m3-outlineVariant/20 transition truncate"
            >
              "{ex}"
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-m3-textSecondary hover:text-m3-textPrimary"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!transcript.trim()}
            className={`px-6 py-2.5 rounded-full text-xs font-medium transition ${
              transcript.trim()
                ? 'bg-m3-primary text-m3-onPrimary shadow-md hover:bg-m3-primaryContainer hover:text-white active:scale-95'
                : 'bg-m3-surfaceHigh text-m3-textTertiary cursor-not-allowed'
            }`}
          >
            Set Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
