import React, { useState } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
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
          id: `alarm-${Date.now()}-${idx}`,
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
        onClose();
      }
    } catch (e) {
      console.error('Error processing schedule:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fade-in">
      <div className="w-full max-w-lg bg-m3-surfaceContainer border border-m3-outlineVariant/30 rounded-t-4xl sm:rounded-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-m3-surfaceContainer/95 backdrop-blur-md px-6 py-4 border-b border-m3-outlineVariant/30 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-normal text-m3-textPrimary">Upload Schedule</h3>
            <p className="text-xs text-m3-textTertiary">Gemini extracts event times and creates alarms</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-m3-textSecondary hover:bg-m3-surfaceHigh flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* File Upload Zone */}
          <label className="border-2 border-dashed border-m3-outlineVariant/60 hover:border-m3-primary bg-m3-surface rounded-4xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group">
            <input
              type="file"
              accept="image/*,.pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-m3-surfaceContainer text-m3-primary flex items-center justify-center mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-m3-textPrimary">
              {selectedFile ? selectedFile.name : 'Choose schedule or timetable image'}
            </p>
            <p className="text-xs text-m3-textTertiary mt-1">
              Supports screenshots, boarding passes, exam rosters (PNG, JPG)
            </p>
          </label>

          {/* Prompt instruction */}
          <div>
            <label className="block text-xs font-medium text-m3-textSecondary mb-1.5">
              Instruction for AI
            </label>
            <input
              type="text"
              value={schedulePrompt}
              onChange={(e) => setSchedulePrompt(e.target.value)}
              className="w-full bg-m3-surface border border-m3-outlineVariant/40 rounded-2xl px-4 py-2.5 text-xs text-m3-textPrimary focus:outline-none focus:border-m3-primary"
            />
          </div>

          {/* Sample Preset Schedules */}
          <div>
            <div className="text-xs font-medium text-m3-textSecondary mb-2">
              Or test with sample schedule:
            </div>
            <div className="space-y-2">
              {PRESET_SCHEDULES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleProcess(preset.text)}
                  disabled={isAnalyzing}
                  className="w-full text-left p-3 rounded-2xl bg-m3-surface hover:bg-m3-surfaceHigh border border-m3-outlineVariant/20 transition group"
                >
                  <div className="text-xs font-medium text-m3-textPrimary group-hover:text-m3-primary transition">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-m3-textTertiary mt-0.5">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-m3-surfaceContainer/95 backdrop-blur-md px-6 py-4 border-t border-m3-outlineVariant/30 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-m3-textSecondary hover:text-m3-textPrimary"
          >
            Cancel
          </button>
          <button
            onClick={() => handleProcess()}
            disabled={!selectedFile || isAnalyzing}
            className={`px-6 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 transition ${
              selectedFile && !isAnalyzing
                ? 'bg-m3-primary text-m3-onPrimary shadow-md hover:bg-m3-primaryContainer hover:text-white active:scale-95'
                : 'bg-m3-surfaceHigh text-m3-textTertiary cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Schedule...</span>
              </>
            ) : (
              'Scan & Set Alarms'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
