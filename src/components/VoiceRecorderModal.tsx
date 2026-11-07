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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Voice Command</h3>
            <p className="text-xs text-gray-500">Speak your alarm instruction to Gemini</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Microphone */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            {isListening && (
              <span className="absolute -inset-3 rounded-full bg-blue-100 animate-ping"></span>
            )}

            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md ${
                isListening
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
          </div>

          <p className="mt-4 text-xs font-semibold text-gray-700">
            {isListening ? 'Listening...' : 'Tap microphone to speak'}
          </p>
        </div>

        {/* Transcript Box */}
        <div className="min-h-[72px] bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-900 flex flex-col justify-between">
          <p className={transcript ? 'text-gray-900 font-medium' : 'text-gray-400 italic text-xs'}>
            {transcript || 'e.g. "Wake me up tomorrow at 6:30 AM"'}
          </p>
        </div>

        {!speechSupported && (
          <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Voice input requires microphone permissions.</span>
          </div>
        )}

        {/* Examples */}
        <div className="mt-4 space-y-1.5">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Try saying:</div>
          {EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setTranscript(ex)}
              className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 border border-gray-200 transition truncate"
            >
              "{ex}"
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!transcript.trim()}
            className={`px-6 py-2.5 rounded-xl text-xs font-semibold transition ${
              transcript.trim()
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Set Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
