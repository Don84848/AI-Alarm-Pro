import { Alarm } from '../types';

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_URDU = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

export function formatTime12(time24: string): { time: string; period: 'AM' | 'PM' } {
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr.padStart(2, '0');
  const period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  
  return {
    time: `${formattedHours}:${minutes}`,
    period,
  };
}

export function formatTime24(time12: string, period: 'AM' | 'PM'): string {
  const [hoursStr, minutesStr] = time12.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr.padStart(2, '0');
  
  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

export function getNextAlarmDiff(alarms: Alarm[]): { alarm: Alarm | null; diffString: string; hours: number; minutes: number } {
  const activeAlarms = alarms.filter(a => a.isEnabled);
  if (activeAlarms.length === 0) {
    return { alarm: null, diffString: 'No alarms set', hours: 0, minutes: 0 };
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let minDiff = Infinity;
  let nextAlarm: Alarm | null = null;

  activeAlarms.forEach(alarm => {
    const [h, m] = alarm.rawTime24.split(':').map(Number);
    const alarmMinutes = h * 60 + m;

    if (!alarm.days || alarm.days.length === 0) {
      // One-time alarm
      let diff = alarmMinutes - currentMinutes;
      if (diff <= 0) {
        // Next day
        diff += 24 * 60;
      }
      if (diff < minDiff) {
        minDiff = diff;
        nextAlarm = alarm;
      }
    } else {
      // Repeating alarm
      for (const day of alarm.days) {
        let dayDiff = (day - currentDay + 7) % 7;
        let timeDiff = alarmMinutes - currentMinutes;

        if (dayDiff === 0 && timeDiff <= 0) {
          dayDiff = 7;
        }

        const totalDiff = dayDiff * 24 * 60 + timeDiff;
        if (totalDiff < minDiff) {
          minDiff = totalDiff;
          nextAlarm = alarm;
        }
      }
    }
  });

  if (!nextAlarm || minDiff === Infinity) {
    return { alarm: null, diffString: 'No upcoming alarms', hours: 0, minutes: 0 };
  }

  const hours = Math.floor(minDiff / 60);
  const minutes = minDiff % 60;

  let diffString = '';
  if (hours > 0) {
    diffString += `${hours}h `;
  }
  diffString += `${minutes}m`;

  return { alarm: nextAlarm, diffString: `in ${diffString}`, hours, minutes };
}

export function shouldAlarmRingNow(alarm: Alarm, currentDate: Date): boolean {
  if (!alarm.isEnabled) return false;

  const currentHours = currentDate.getHours().toString().padStart(2, '0');
  const currentMins = currentDate.getMinutes().toString().padStart(2, '0');
  const currentTime24 = `${currentHours}:${currentMins}`;

  if (currentTime24 !== alarm.rawTime24) return false;

  const currentDay = currentDate.getDay();
  if (alarm.days && alarm.days.length > 0) {
    return alarm.days.includes(currentDay);
  }

  return true;
}
