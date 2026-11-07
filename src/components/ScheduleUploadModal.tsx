import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { processAiAlarmPrompt } from '../utils/aiEngine';
import { Alarm, UserProfile } from '../types';
import confetti from 'canvas-confetti';

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
  const [schedulePrompt, setSchedulePrompt] = useState('Extract all event timings from this schedule and set alarms 1 hour before each event.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Preset demo schedules for instant testing!
  const PRESET_SCHEDULES = [
    {
      title: '✈️ Flight Boarding Pass (PK-701)',
      desc: 'Departure 08:30 AM • Check-in 06:30 AM',
      text: 'Airline Ticket: Flight PK-701 from LHE to DXB. Departure time: 08:30 AM. Boarding closes 45 minutes prior. Please arrive at airport 2.5 hours before flight.'
    },
    {
      title: '🎓 University Final Exam Datesheet',
      desc: 'Monday 09:00 AM • Wednesday 09:00 AM • Friday 02:00 PM',
      text: 'Semester Examination Schedule: Monday: Computer Networks at 09:00 AM. Wednesday: Machine Learning at 09:00 AM. Friday: Cloud Computing at 02:00 PM.'
    },
    {
      title: '🏥 Hospital Shift Roster (Night to Morning)',
      desc: 'Evening Shift starts 04:00 PM • Morning handover 07:00 AM',
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
      const result = await processAiAlarmPrompt(textToAnalyze, profile.geminiApiKey, payload, profile.selectedModel);

      if (result.alarms.length > 0) {
        const generated: Alarm[] = result.alarms.map((a, idx) => ({
          id: `ai-sched-${Date.now()}-${idx}`,
          time: a.time,
          period: a.period,
          rawTime24: a.rawTime24,
          label: a.label,
          days: a.days,
          isEnabled: true,
          sound: a.sound || 'radar',
          snoozeMinutes: 5,
          isAiGenerated: true,
          aiPrompt: textToAnalyze,
          aiReasoning: a.reasoning || result.explanation,
          mission: 'none',
        }));

        onAddAlarms(generated);
        confetti({ particleCount: 50, spread: 70 });
        onClose();
      }
    } catch (e) {
      console.error('Error processing schedule:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-dark-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Schedule or Timetable</h3>
              <p className="text-[11px] text-slate-400">AI automatically scans and schedules your alarms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* File Upload Drop Zone */}
          <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-dark-950/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group">
            <input
              type="file"
              accept="image/*,.pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 flex items-center justify-center transition">
              {selectedFile ? <CheckCircle className="w-8 h-8 text-emerald-400" /> : <ImageIcon className="w-7 h-7" />}
            </div>
            <div className="mt-3">
              <p className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Choose or drop schedule image'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports flight tickets, exam datesheets, shift rosters (JPG, PNG)
              </p>
            </div>
          </label>

          {/* Prompt instruction */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              AI Scheduling Instructions
            </label>
            <input
              type="text"
              value={schedulePrompt}
              onChange={(e) => setSchedulePrompt(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Preset Demo Schedules */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or Select a Sample Schedule to Test:</span>
            </div>
            <div className="space-y-2">
              {PRESET_SCHEDULES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleProcess(preset.text)}
                  disabled={isAnalyzing}
                  className="w-full text-left p-3 rounded-2xl bg-dark-950 hover:bg-dark-850 border border-slate-800/80 hover:border-cyan-500/40 transition active:scale-98 group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-900/95 backdrop-blur-md px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => handleProcess()}
            disabled={!selectedFile || isAnalyzing}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition ${
              selectedFile && !isAnalyzing
                ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/30 active:scale-95'
                : 'bg-dark-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                <span>AI Researching Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze & Set Alarms</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
