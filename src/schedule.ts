import Holidays from 'date-holidays';

export type HolidayCheck = (utcDate: Date) => boolean;
const china = new Holidays('CN');

export const isChinesePublicHoliday: HolidayCheck = (date) => {
  // Holidays are interpreted by UTC calendar date, consistently with the UTC windows.
  const holidays = china.isHoliday(date);
  return Array.isArray(holidays) && holidays.some((holiday) => holiday.type === 'public');
};

export function isPeak(date: Date, isHoliday: HolidayCheck = isChinesePublicHoliday): boolean {
  const day = date.getUTCDay();
  if (day === 0 || day === 6 || isHoliday(date)) return false;
  const minute = date.getUTCHours() * 60 + date.getUTCMinutes();
  return (minute >= 60 && minute < 240) || (minute >= 360 && minute < 600);
}

/** Next UTC schedule boundary, including midnight for date/holiday changes. */
export function nextBoundary(date: Date): Date {
  const midnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const minute = date.getUTCHours() * 60 + date.getUTCMinutes();
  const boundary = [60, 240, 360, 600, 1440].find((value) => value > minute)!;
  return new Date(midnight + boundary * 60_000);
}

/** Find the next actual PEAK/OFF-PEAK transition, skipping weekends and public holidays. */
export function nextStatusChange(date: Date, isHoliday: HolidayCheck = isChinesePublicHoliday): Date {
  const currentStatus = isPeak(date, isHoliday);
  let boundary = nextBoundary(date);
  // A year provides ample room for long holidays while avoiding an unbounded loop.
  for (let i = 0; i < 365 * 5; i++) {
    if (isPeak(boundary, isHoliday) !== currentStatus) return boundary;
    boundary = nextBoundary(boundary);
  }
  throw new Error('Unable to find the next peak-hours status change');
}

/** Format a transition using the editor machine's local timezone and 24-hour clock. */
export function formatStatusTooltip(now: Date, change: Date, peak: boolean): string {
  const localDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const today = localDay(now);
  const target = localDay(change);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const time = `${String(change.getHours()).padStart(2, '0')}:${String(change.getMinutes()).padStart(2, '0')}`;
  const day = target === today ? '' : target === tomorrow ? 'tomorrow at ' :
    `${change.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at `;
  return `${peak ? 'PEAK' : 'OFF-PEAK'} until ${day}${time}`;
}
