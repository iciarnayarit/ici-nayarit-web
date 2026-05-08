'use client';

import { useEffect } from 'react';
import { getEngagementSnapshot } from '@/lib/engagement-points';

const DAILY_REMINDER_HOUR = 10;
const LAST_SENT_KEY = 'iciar-daily-reminder-last-sent-date-v1';
const AUTO_REQUESTED_KEY = 'iciar-daily-reminder-permission-requested-v1';
const TRIVIA_LIVE_POINTS_KEY = 'iciar-trivia-live-points-v1';

function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextReminderTime(now = new Date()): Date {
  const next = new Date(now);
  next.setHours(DAILY_REMINDER_HOUR, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function computeStreakDays(dailyActivity: Record<string, number>): number {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < 366; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    if ((dailyActivity[day] ?? 0) > 0) {
      count += 1;
      continue;
    }
    break;
  }
  return count;
}

function buildPersonalizedReminderMessage(): { title: string; body: string } {
  const engagement = getEngagementSnapshot();
  const streakDays = computeStreakDays(engagement.dailyActivity ?? {});
  const triviaPointsRaw = Number(localStorage.getItem(TRIVIA_LIVE_POINTS_KEY) ?? '0');
  const triviaPoints = Number.isFinite(triviaPointsRaw) ? triviaPointsRaw : 0;
  const points = Math.max(engagement.totalPoints ?? 0, triviaPoints);

  const options = [
    {
      title: streakDays > 0 ? `Llevas ${streakDays} días de racha` : 'Comienza tu racha hoy',
      body:
        streakDays > 0
          ? 'Haz tu lectura bíblica de hoy para no perder tu constancia.'
          : 'Lee un capítulo hoy y activa tu racha espiritual.',
    },
    {
      title: `Tienes ${points} puntos acumulados`,
      body: 'Completa un reto de trivia para seguir avanzando en el ranking global.',
    },
    {
      title: 'Momento de leer la Biblia',
      body: 'Dedica unos minutos a la Palabra y fortalece tu crecimiento espiritual.',
    },
  ];
  return options[Math.floor(Math.random() * options.length)] ?? options[0];
}

function canSendToday(now = new Date()): boolean {
  const sentKey = localStorage.getItem(LAST_SENT_KEY);
  return sentKey !== localDateKey(now);
}

function markSentToday(now = new Date()): void {
  localStorage.setItem(LAST_SENT_KEY, localDateKey(now));
}

async function ensureNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  // Solicítalo solo una vez automáticamente para no molestar en cada visita.
  if (sessionStorage.getItem(AUTO_REQUESTED_KEY) === '1') return false;
  sessionStorage.setItem(AUTO_REQUESTED_KEY, '1');
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

async function sendDailyReminderIfDue() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  const now = new Date();
  if (now.getHours() < DAILY_REMINDER_HOUR) return;
  if (!canSendToday(now)) return;

  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return;

  const msg = buildPersonalizedReminderMessage();
  new Notification(msg.title, { body: msg.body });
  markSentToday(now);
}

export default function DailyReminderNotifier() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    void sendDailyReminderIfDue();

    const onFocus = () => {
      void sendDailyReminderIfDue();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void sendDailyReminderIfDue();
      }
    };

    const now = new Date();
    const firstDelay = Math.max(1000, nextReminderTime(now).getTime() - now.getTime());
    const firstTimeout = window.setTimeout(() => {
      void sendDailyReminderIfDue();
    }, firstDelay);

    const dailyInterval = window.setInterval(() => {
      void sendDailyReminderIfDue();
    }, 60 * 60 * 1000);

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(firstTimeout);
      window.clearInterval(dailyInterval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
