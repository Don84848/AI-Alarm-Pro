import React, { useState } from 'react';
import { Upload, X, Check, Loader2, Sparkles, FileText } from 'lucide-react';
import { processAiAlarmPrompt } from '../utils/aiEngine';
import { Alarm, UserProfile } from '../types';

interface ScheduleUploadModalProps {
  profile: UserProfile;
  onAddAlarms: (alarms: Alarm[]) => void;
  onClose: () => void;
}

export const ScheduleUploadModal: React.FC<ScheduleUploadModalProps> = ({
  profile,
  onAddAlarms,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const [schedulePrompt, setSchedulePrompt] = useState('Extract all event timings from this schedule and set alarms with 45m buffer.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const PRESET_SCHEDULES = [
    {
      title: '✈️ Flight Ticket (Departure 08:30 AM)',
      desc: 'Flight PK-701. Departure 08:30 AM. Arrive 2 hours prior.',
      text: 'Airline Ticket: Flight PK-701 from LHE to DXB. Departure time: 08:30 AM. Please arrive at airport 2 hours before flight.'
    },
    {
      title: '🎓 Exam Schedule (Morning & Afternoon)',
      desc: 'Monday 09:00 AM • Wednesday 09:00 AM • Friday 02:00 PM',
      text: 'Semester Examination Schedule: Monday: Computer Networks at 09:00 AM. Wednesday: Machine Learning at 09:00 AM. Friday: Cloud Computing at 02:00 PM.'
    },
    {
      title: '🏥 Shift Roster (Evening & Morning)',
      desc: 'Tuesday 04:00 PM • Thursday 07:00 AM',
      text: 'Duty Roster: Tuesday evening shift at 04:00 PM. Thursday morning ward round at 07:00 AM.'
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setSelectedFile({
        name: file.name,
        base64,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async (customText?: string) => {
    setIsAnalyzing(true);
    const textToAnalyze = customText || `${schedulePrompt} (Schedule document: ${selectedFile?.name || 'Uploaded timetable'})`;

    try {
      const payload = selectedFile ? { base64: selectedFile.base64, mimeType: selectedFile.mimeType } : undefined;
      const result = await processAiAlarmPrompt(
        textToAnalyze,
        profile.geminiApiKey,
        payload,
        profile.selectedModel
      );

      if (result.alarms.length > 0) {
        const generated: Alarm[] = result.alarms.map((a, idx) => ({
          id: `extracted-${Date.now()}-${idx}`,
          time: a.time,
          period: a.period,
          rawTime24: a.rawTime24,
          label: a.label,
          days: a.days,
          isEnabled: true,
          sound: a.sound || 'gentle',
          snoozeMinutes: 5,
          isAiGenerated: true,
          aiPrompt: textToAnalyze,
          aiReasoning: a.reasoning || result.explanation,
          mission: 'none',
        }));

        onAddAlarms(generated);
        onClose();
      }
    } catch (e) {
      console.error('Failed to parse schedule:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Upload Schedule</h3>
            <p className="text-xs text-gray-500">Extract alarms automatically from photos</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!profile.geminiApiKey && (
          <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
            <span>Gemini API key required</span>
          </div>
        )}

        <div className="py-4 space-y-4">
          {/* File Upload Box */}
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl cursor-pointer bg-gray-50 hover:bg-blue-50/40 transition">
            <Upload className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-semibold text-gray-900">
              {selectedFile ? selectedFile.name : 'Choose schedule photo or timetable'}
            </span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG, PDF screenshot</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Prompt */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Instructions for Schedule Analysis
            </label>
            <input
              type="text"
              value={schedulePrompt}
              onChange={(e) => setSchedulePrompt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#00B074]"
            />
          </div>

          {/* Preset Sample Schedules */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Or Try a Sample Schedule:
            </div>
            <div className="space-y-2">
              {PRESET_SCHEDULES.map((ps, idx) => (
                <button
                  key={idx}
                  onClick={() => handleProcess(ps.text)}
                  disabled={isAnalyzing}
                  className="w-full text-left p-3 rounded-2xl border border-gray-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition"
                >
                  <div className="text-xs font-semibold text-gray-900">{ps.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{ps.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => handleProcess()}
            disabled={!selectedFile || isAnalyzing}
            className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              selectedFile && !isAnalyzing
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAnalyzing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isAnalyzing ? 'Analyzing Schedule...' : 'Analyze & Set Alarms'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
