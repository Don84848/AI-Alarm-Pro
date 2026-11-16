import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';
import { Alarm } from '../types';

let isInitialized = false;

// Convert string id to 32-bit positive integer for Android notification ID
function getNotificationId(alarmId: string): number {
  let hash = 0;
  for (let i = 0; i < alarmId.length; i++) {
    hash = (hash << 5) - hash + alarmId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Calculate the exact next Date when this alarm should ring
export function getNextAlarmDate(alarm: Alarm, fromDate: Date = new Date()): Date {
  const [h, m] = (alarm.rawTime24 || '07:00').split(':').map(Number);
  const target = new Date(fromDate.getTime());
  target.setHours(h, m, 0, 0);

  // If one-time alarm (no specific repeating days)
  if (!alarm.days || alarm.days.length === 0) {
    if (target.getTime() <= fromDate.getTime()) {
      // Time has already passed today -> schedule for tomorrow
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  // Repeating alarm
  const currentDay = fromDate.getDay();
  let minDaysAhead = Infinity;

  for (const day of alarm.days) {
    let diff = (day - currentDay + 7) % 7;
    if (diff === 0) {
      // Same day of week: check if time has already passed
      if (target.getTime() <= fromDate.getTime()) {
        diff = 7;
      }
    }
    if (diff < minDaysAhead) {
      minDaysAhead = diff;
    }
  }

  if (minDaysAhead !== Infinity && minDaysAhead > 0) {
    target.setDate(fromDate.getDate() + minDaysAhead);
  }

  return target;
}

export async function initNativeAlarms(
  onAlarmTriggered?: (alarmId: string) => void,
  onSnoozeTriggered?: (alarmId: string) => void
) {
  if (!Capacitor.isNativePlatform()) return;
  if (isInitialized) return;
  isInitialized = true;

  try {
    // 1. Request notification permissions
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // 2. Create high-priority Alarm Notification Channel for Android
    await LocalNotifications.createChannel({
      id: 'alarm-channel-v2',
      name: 'High Priority Alarms',
      description: 'Full-screen and high-priority alarms for Clock App Pro',
      importance: 5, // MAX importance (heads-up / full screen)
      visibility: 1, // Public on lockscreen
      vibration: true,
      lights: true,
      lightColor: '#00B074',
    });

    // 3. Register Action Types (Dismiss and Snooze buttons)
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'ALARM_ACTION_TYPE',
          actions: [
            {
              id: 'dismiss',
              title: 'Dismiss Alarm',
              destructive: true,
            },
            {
              id: 'snooze',
              title: 'Snooze 10m',
            },
          ],
        },
      ],
    });

    // 4. Handle Notification clicks and action button presses
    LocalNotifications.addListener('localNotificationActionPerformed', (action: ActionPerformed) => {
      const alarmId = action.notification.extra?.alarmId;
      if (!alarmId) return;

      if (action.actionId === 'snooze') {
        if (onSnoozeTriggered) onSnoozeTriggered(alarmId);
      } else {
        if (onAlarmTriggered) onAlarmTriggered(alarmId);
      }
    });
  } catch (err) {
    console.warn('Native local notification initialization warning:', err);
  }
}

// Synchronize all enabled alarms with native Android AlarmManager
export async function syncNativeAlarms(alarms: Alarm[]) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Cancel all previously scheduled notifications to avoid duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }

    const enabledAlarms = alarms.filter((a) => a.isEnabled);
    if (enabledAlarms.length === 0) return;

    const notificationsToSchedule = [];
    const now = new Date();

    for (const alarm of enabledAlarms) {
      const nextDate = getNextAlarmDate(alarm, now);
      const notifId = getNotificationId(alarm.id);

      notificationsToSchedule.push({
        id: notifId,
        title: `⏰ ${alarm.label || 'Alarm'} (${alarm.time} ${alarm.period})`,
        body: `Tap to dismiss or snooze. Wake up!`,
        channelId: 'alarm-channel-v2',
        schedule: {
          at: nextDate,
          allowWhileIdle: true, // Wakes phone up even in Android Doze mode!
        },
        actionTypeId: 'ALARM_ACTION_TYPE',
        smallIcon: 'ic_launcher',
        largeIcon: 'ic_launcher',
        iconColor: '#00B074',
        extra: {
          alarmId: alarm.id,
          targetTime: nextDate.toISOString(),
        },
      });
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule,
      });
      console.log(`[NativeAlarms] Scheduled ${notificationsToSchedule.length} native alarms.`);
    }
  } catch (err) {
    console.error('Failed to sync native alarms:', err);
  }
}
