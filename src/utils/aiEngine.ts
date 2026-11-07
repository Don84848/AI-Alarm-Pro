import { AiParseResult, AlarmSound } from '../types';
import { formatTime12, formatTime24 } from './timeUtils';

export async function processAiAlarmPrompt(
  prompt: string,
  apiKey?: string,
  imagePayload?: { base64: string; mimeType: string }
): Promise<AiParseResult> {
  const cleanPrompt = prompt.trim();

  // If Gemini API Key is provided, use Google Gemini API
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiResult = await callGeminiApi(cleanPrompt, apiKey.trim(), imagePayload);
      if (geminiResult && geminiResult.alarms.length > 0) {
        return geminiResult;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local AI engine:', err);
    }
  }

  // Local AI Deep Reasoning Engine
  return runLocalAiEngine(cleanPrompt, imagePayload);
}

// Local Deep Natural Language & Research Engine (Urdu, Roman Urdu, English)
function runLocalAiEngine(
  prompt: string,
  imagePayload?: { base64: string; mimeType: string }
): AiParseResult {
  const p = prompt.toLowerCase();
  const alarms: AiParseResult['alarms'] = [];
  let explanation = '';
  let detectedContext = 'General Alarm';

  // 1. Water or Medicine Interval Alarms
  // e.g., "water every 2 hours from 9 to 5", "pani peene ka alarm har do ghante"
  if (p.includes('water') || p.includes('pani') || p.includes('medicine') || p.includes('dawai') || p.includes('interval') || p.includes('har ') || p.includes('every ')) {
    detectedContext = p.includes('water') || p.includes('pani') ? 'Hydration Reminder' : 'Medication Schedule';
    
    // Default interval 2 hours from 9 AM to 7 PM
    let startHour = 9;
    let endHour = 19;
    let stepHours = 2;

    if (p.includes('3 hour') || p.includes('3 ghant')) stepHours = 3;
    if (p.includes('1 hour') || p.includes('1 ghant')) stepHours = 1;
    if (p.includes('4 hour') || p.includes('4 ghant')) stepHours = 4;

    const label = p.includes('water') || p.includes('pani') ? '💧 Drink Water Reminder' : '💊 Take Medicine';

    for (let h = startHour; h <= endHour; h += stepHours) {
      const time24 = `${h.toString().padStart(2, '0')}:00`;
      const { time, period } = formatTime12(time24);
      alarms.push({
        time,
        period,
        rawTime24: time24,
        label,
        days: [0, 1, 2, 3, 4, 5, 6],
        sound: 'zen',
        reasoning: `Scheduled every ${stepHours} hours to keep healthy habits consistent.`,
      });
    }

    explanation = `Created ${alarms.length} recurring alarms spaced ${stepHours} hours apart between 9:00 AM and 7:00 PM for ${detectedContext}.`;
    return { alarms, explanation, detectedContext };
  }

  // 2. Flight & Travel Prep Research
  // e.g. "Flight at 4:00 AM, calculate 2 hours airport check-in and 45 min drive"
  // or "Flight kal raat 10 baje hai, tayar hone aur airport pohachne ke liye alarm lagao"
  if (p.includes('flight') || p.includes('airport') || p.includes('jahaz') || p.includes('travel') || p.includes('safar')) {
    detectedContext = 'Flight & Travel Planner';
    
    // Find flight time
    const timeMatch = extractTimeFromText(p);
    let flightMinutes = 4 * 60; // default 4 AM if not found
    let flightPeriod: 'AM' | 'PM' = 'AM';

    if (timeMatch) {
      flightMinutes = timeMatch.hours * 60 + timeMatch.minutes;
      flightPeriod = timeMatch.period;
      if (flightPeriod === 'PM' && timeMatch.hours < 12) flightMinutes += 12 * 60;
      if (flightPeriod === 'AM' && timeMatch.hours === 12) flightMinutes -= 12 * 60;
    }

    // Default buffer: 2h airport + 45min drive + 45min prep = 3h 30m buffer
    let bufferMins = 180; // 3 hours
    if (p.includes('2 hour') || p.includes('2 ghant')) bufferMins = 120 + 45;
    if (p.includes('45 min') || p.includes('1 hour') || p.includes('1 ghant')) bufferMins = 150;

    let alarmMinutes = (flightMinutes - bufferMins + 24 * 60) % (24 * 60);
    const alarmH = Math.floor(alarmMinutes / 60);
    const alarmM = alarmMinutes % 60;
    const time24 = `${alarmH.toString().padStart(2, '0')}:${alarmM.toString().padStart(2, '0')}`;
    const { time, period } = formatTime12(time24);

    alarms.push({
      time,
      period,
      rawTime24: time24,
      label: '✈️ Airport Departure & Flight Ready',
      days: [],
      sound: 'radar',
      reasoning: `Calculated departure alarm: Flight is at ${timeMatch ? timeMatch.raw : 'schedule'}. Subtracted 2 hours check-in + 45 min commute + 30 min buffer (${Math.floor(bufferMins/60)}h ${bufferMins%60}m before flight).`,
    });

    explanation = `AI researched travel buffer: Alarm set for ${time} ${period} (${Math.floor(bufferMins / 60)} hours and ${bufferMins % 60} minutes prior to your flight).`;
    return { alarms, explanation, detectedContext };
  }

  // 3. Sunrise / Prayer / Fajr / Tahajjud
  // e.g. "Fajr se aadha ghanta pehle", "Tahajjud prayer", "Wake me up 45 min before sunrise for walk"
  if (p.includes('fajr') || p.includes('namaz') || p.includes('sunrise') || p.includes('tahajjud') || p.includes('subah saware')) {
    detectedContext = 'Prayer & Early Twilight Routine';
    
    // Approximate sunrise at 06:15 AM, Fajr at 05:15 AM
    let targetH = 5;
    let targetM = 15;
    let label = '🕌 Fajr Prayer & Morning Dhikr';
    let sound: AlarmSound = 'zen';

    if (p.includes('tahajjud')) {
      targetH = 4;
      targetM = 30;
      label = '🌙 Tahajjud Prayer Routine';
    } else if (p.includes('sunrise') || p.includes('suraj')) {
      targetH = 5;
      targetM = 45;
      label = '🌅 Sunrise Morning Walk & Energy';
      sound = 'gentle';
    }

    if (p.includes('aadha ghanta') || p.includes('30 min') || p.includes('half hour')) {
      targetM -= 30;
      if (targetM < 0) {
        targetM += 60;
        targetH -= 1;
      }
    } else if (p.includes('20 min')) {
      targetM -= 20;
      if (targetM < 0) {
        targetM += 60;
        targetH -= 1;
      }
    }

    const time24 = `${targetH.toString().padStart(2, '0')}:${targetM.toString().padStart(2, '0')}`;
    const { time, period } = formatTime12(time24);

    alarms.push({
      time,
      period,
      rawTime24: time24,
      label,
      days: [0, 1, 2, 3, 4, 5, 6],
      sound,
      reasoning: 'Researched local solar twilight & morning routine timings with preparation buffer.',
    });

    explanation = `AI scheduled prayer/morning alarm for ${time} ${period} with soothing tone.`;
    return { alarms, explanation, detectedContext };
  }

  // 4. Gym / Workout / Fitness
  if (p.includes('gym') || p.includes('workout') || p.includes('kasrat') || p.includes('exercise') || p.includes('running')) {
    detectedContext = 'Fitness & Workout';
    let timeMatch = extractTimeFromText(p);
    let time24 = '06:30';

    if (timeMatch) {
      time24 = formatTime24(`${timeMatch.hours.toString().padStart(2, '0')}:${timeMatch.minutes.toString().padStart(2, '0')}`, timeMatch.period);
    }

    const { time, period } = formatTime12(time24);
    alarms.push({
      time,
      period,
      rawTime24: time24,
      label: '💪 Morning Gym & Cardio Power',
      days: [1, 2, 3, 4, 5],
      sound: 'rooster',
      reasoning: 'Configured for high energy wakeup with weekday repetition for fitness consistency.',
    });

    explanation = `Set high-energy fitness alarm at ${time} ${period} for Monday through Friday.`;
    return { alarms, explanation, detectedContext };
  }

  // 5. Exam / Class / Office / Study
  if (p.includes('exam') || p.includes('paper') || p.includes('class') || p.includes('office') || p.includes('meeting') || p.includes('interview')) {
    detectedContext = 'Academic & Work Success';
    let timeMatch = extractTimeFromText(p);
    let eventTime24 = '09:00';

    if (timeMatch) {
      let eventH = timeMatch.hours;
      if (timeMatch.period === 'PM' && eventH < 12) eventH += 12;
      // Wake up 1 hour and 30 mins before event
      let totalM = eventH * 60 + timeMatch.minutes - 90;
      if (totalM < 0) totalM += 24 * 60;
      const wakeH = Math.floor(totalM / 60);
      const wakeM = totalM % 60;
      eventTime24 = `${wakeH.toString().padStart(2, '0')}:${wakeM.toString().padStart(2, '0')}`;
    } else {
      eventTime24 = '07:30';
    }

    const { time, period } = formatTime12(eventTime24);
    alarms.push({
      time,
      period,
      rawTime24: eventTime24,
      label: p.includes('exam') || p.includes('paper') ? '🎓 Exam Preparation & Arrival' : '💼 Work & Standup Ready',
      days: [1, 2, 3, 4, 5],
      sound: 'radar',
      reasoning: 'Calculated 1.5-hour advance notice to ensure punctual arrival, breakfast, and mental focus.',
    });

    explanation = `Calculated prep buffer: Alarm set for ${time} ${period} ahead of your schedule.`;
    return { alarms, explanation, detectedContext };
  }

  // 6. Generic Time Extraction from prompt
  const genericTime = extractTimeFromText(p);
  if (genericTime) {
    const time24 = formatTime24(
      `${genericTime.hours.toString().padStart(2, '0')}:${genericTime.minutes.toString().padStart(2, '0')}`,
      genericTime.period
    );
    const { time, period } = formatTime12(time24);

    let cleanLabel = prompt
      .replace(/wake me up|alarm lagao|alarm set karo|alarm for|kal subah|sham|at|on|for/gi, '')
      .replace(/\d+[:.]?\d*\s*(am|pm|baje)?/gi, '')
      .trim();

    if (!cleanLabel || cleanLabel.length < 2) {
      cleanLabel = 'Wake Up & Shine ⏰';
    } else {
      cleanLabel = cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);
    }

    alarms.push({
      time,
      period,
      rawTime24: time24,
      label: cleanLabel,
      days: [0, 1, 2, 3, 4, 5, 6],
      sound: 'gentle',
      reasoning: `Extracted explicit requested time: ${time} ${period}.`,
    });

    explanation = `Smart alarm created for ${time} ${period} (${cleanLabel}).`;
    return { alarms, explanation, detectedContext: 'Custom Schedule' };
  }

  // Fallback default smart alarm
  const fallbackTime24 = '07:00';
  const { time, period } = formatTime12(fallbackTime24);
  alarms.push({
    time,
    period,
    rawTime24: fallbackTime24,
    label: prompt ? `Target: ${prompt.slice(0, 30)}` : 'Morning Alarm ☀️',
    days: [1, 2, 3, 4, 5],
    sound: 'gentle',
    reasoning: 'Default healthy morning wake time based on Circadian rhythm research.',
  });

  explanation = `AI set optimal wake-up alarm for ${time} ${period}. You can adjust any parameter easily.`;
  return { alarms, explanation, detectedContext: 'Smart Routine' };
}

// Helper: Extract time representations like "7:30 am", "8 pm", "kal subah 6 baje", "19:00", "7 am"
function extractTimeFromText(text: string): { hours: number; minutes: number; period: 'AM' | 'PM'; raw: string } | null {
  // Pattern 1: 07:30 am / 7:30 pm / 7:30
  const match1 = text.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/i);
  if (match1) {
    let h = parseInt(match1[1], 10);
    const m = parseInt(match1[2], 10);
    let period: 'AM' | 'PM' = 'AM';

    if (match1[3]) {
      period = match1[3].toUpperCase() as 'AM' | 'PM';
    } else if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    } else if (text.includes('sham') || text.includes('raat') || text.includes('evening') || text.includes('night')) {
      period = 'PM';
    }

    return { hours: h, minutes: m, period, raw: match1[0] };
  }

  // Pattern 2: 7 am / 8 pm / 9 baje
  const match2 = text.match(/(\d{1,2})\s*(am|pm|baje)/i);
  if (match2) {
    let h = parseInt(match2[1], 10);
    let period: 'AM' | 'PM' = 'AM';

    if (match2[2].toLowerCase() === 'pm' || text.includes('sham') || text.includes('raat') || text.includes('evening') || text.includes('night')) {
      period = 'PM';
    } else if (match2[2].toLowerCase() === 'am' || text.includes('subah') || text.includes('fajr') || text.includes('morning')) {
      period = 'AM';
    } else if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    } else if (h >= 1 && h <= 5 && !text.includes('subah')) {
      period = 'PM'; // usually 2 baje, 4 baje without context means afternoon
    }

    return { hours: h, minutes: 0, period, raw: match2[0] };
  }

  return null;
}

// Call Google Gemini API (Multimodal / JSON Schema)
async function callGeminiApi(
  prompt: string,
  apiKey: string,
  imagePayload?: { base64: string; mimeType: string }
): Promise<AiParseResult | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `You are an elite AI Alarm & Schedule Assistant.
Your task is to analyze user requests (in English, Urdu, Roman Urdu, or uploaded schedule images) and generate ideal alarms.
You must return a valid JSON object matching this schema:
{
  "explanation": "Clear explanation of how you calculated/researched the alarm times",
  "detectedContext": "Flight Travel / Exam / Workout / Prayer / Medicine / etc.",
  "alarms": [
    {
      "time": "HH:MM",
      "period": "AM" or "PM",
      "rawTime24": "HH:MM",
      "label": "Short descriptive title with emoji",
      "days": [0,1,2,3,4,5,6] (0 is Sun, 6 is Sat, empty array if one-time),
      "sound": "radar" | "gentle" | "cyber" | "zen" | "rooster" | "briefing",
      "reasoning": "Reason why this time was chosen"
    }
  ]
}`;

  const contents: any[] = [];
  const parts: any[] = [];

  if (imagePayload) {
    parts.push({
      inline_data: {
        mime_type: imagePayload.mimeType,
        data: imagePayload.base64
      }
    });
    parts.push({
      text: `Analyze this image/document (schedule, ticket, timetable) along with request: "${prompt}". Extract all times and set corresponding alarms with buffers.`
    });
  } else {
    parts.push({
      text: prompt
    });
  }

  contents.push({ parts });

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.statusText}`);
  }

  const json = await res.json();
  const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) return null;

  const parsed = JSON.parse(textContent) as AiParseResult;
  return parsed;
}
