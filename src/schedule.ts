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
